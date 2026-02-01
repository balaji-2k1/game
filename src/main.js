import * as THREE from 'three';
import { Player } from './player.js';
import { ThirdPersonCamera } from './camera.js';
import {
  loadRegionData,
  getRegion,
  getSpawn,
  buildAttic,
  buildNerimaOutdoor,
  getCurrentGroundY,
} from './world.js';
import {
  loadGadgetData,
  setUnlockConditionMet,
  canUseTakeCopter,
  useTakeCopter,
  rechargeBattery,
  getBatteryPercent,
  getTakeCopterConfig,
} from './gadgets.js';
import {
  getIntroPhase,
  getIntroLine,
  advanceIntro,
  startIntro,
  isIntroDone,
  setCurrentRegionId,
  getCurrentRegionId,
  shouldTransitionToOutdoor,
} from './story.js';
import {
  showDialogue,
  hideDialogue,
  isDialogueVisible,
  setEnergyPercent,
  hideTitleScreen,
  onStartClick,
  setControlsHint,
} from './ui.js';
import { createDoraemon } from './doraemon.js';

let scene, camera, renderer, clock;
let player, tpsCamera, doraemon;
let currentRegionId = 'attic';
let worldObjects = [];
let pointerLocked = false;
let gameStarted = false;

async function init() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x7ec8e3);
  scene.fog = new THREE.Fog(0x9dd5ed, 40, 140);

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 5, 10);

  const ambient = new THREE.AmbientLight(0xfff5e6, 0.5);
  scene.add(ambient);
  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x4a7c59, 0.4);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.0);
  sun.position.set(25, 35, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.bias = -0.0001;
  scene.add(sun);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  clock = new THREE.Clock();
  player = new Player(scene);
  tpsCamera = new ThirdPersonCamera(camera, player.mesh);
  doraemon = createDoraemon(scene);

  await loadRegionData();
  await loadGadgetData();

  loadRegion('attic');
  const spawn = getSpawn('attic');
  player.position.set(spawn.x, spawn.y, spawn.z);
  tpsCamera.yaw = 0;
  tpsCamera.pitch = 0.2;

  canvas.addEventListener('click', () => {
    if (!gameStarted) return;
    if (!pointerLocked) canvas.requestPointerLock();
  });
  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === canvas;
  });
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);

  onStartClick(() => {
    gameStarted = true;
    hideTitleScreen();
    canvas.requestPointerLock();
    showDialogue("You find an old diary in the attic...");
    startIntro();
  });

  setControlsHint('WASD move · Mouse look · SPACE jump · F fly (Take-copter)');
}

function loadRegion(regionId) {
  worldObjects.forEach((obj) => {
    if (obj.dispose) obj.dispose();
    else scene.remove(obj);
  });
  worldObjects = [];

  if (regionId === 'attic') {
    const built = buildAttic(scene);
    worldObjects.push(built.floor, built.wallBack, built.box);
  } else if (regionId === 'nerima_outdoor') {
    const built = buildNerimaOutdoor(scene);
    worldObjects.push(built.ground, built.house, built.roof, ...built.trees);
  }
  currentRegionId = regionId;
  setCurrentRegionId(regionId);
}

function onKeyDown(e) {
  if (!gameStarted) return;
  if (e.code === 'Escape') {
    document.exitPointerLock();
    return;
  }
  if (isDialogueVisible()) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      advanceIntro();
      const line = getIntroLine();
      if (line) {
        showDialogue(line);
      } else {
        hideDialogue();
        if (shouldTransitionToOutdoor()) {
          setUnlockConditionMet('first_flight_unlocked');
          loadRegion('nerima_outdoor');
          currentRegionId = 'nerima_outdoor';
          const spawn = getSpawn('nerima_outdoor');
          player.position.set(spawn.x, spawn.y, spawn.z);
          player.stopFlying();
          doraemon.setVisible(true);
          doraemon.setPosition(player.position.x + 2, 0, player.position.z);
        }
      }
    }
    return;
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function update(dt) {
  if (!player || !tpsCamera) return;

  const forward = tpsCamera.getForward();
  const right = tpsCamera.getRight();
  let moveForward = new THREE.Vector3(0, 0, 0);
  let moveRight = new THREE.Vector3(0, 0, 0);
  if (pointerLocked) {
    if (document.querySelector('#ui input:focus')) return;
    const w = document.activeElement?.tagName === 'INPUT' ? false : true;
    if (w && (keyState.KeyW || keyState.w)) moveForward.add(forward);
    if (keyState.KeyS || keyState.s) moveForward.sub(forward);
    if (keyState.KeyA || keyState.a) moveRight.sub(right);
    if (keyState.KeyD || keyState.d) moveRight.add(right);
  }

  const flying = (keyState.KeyF || keyState.f) && canUseTakeCopter() && isIntroDone();
  if (flying) {
    const up = keyState.Space;
    const down = keyState.ShiftLeft || keyState.ShiftRight;
    player.fly(moveForward, moveRight, up ? true : down ? false : null, dt);
    const stillFlying = useTakeCopter(dt);
    if (!stillFlying) player.stopFlying();
  } else {
    player.move(moveForward, moveRight, dt, camera);
    if (keyState.Space && !player.isFlying) player.jump();
    rechargeBattery(dt);
  }

  const groundY = getCurrentGroundY(currentRegionId);
  player.update(dt, groundY);

  if (moveForward.lengthSq() > 0 || moveRight.lengthSq() > 0) {
    const dir = new THREE.Vector3().addVectors(moveForward, moveRight).normalize();
    player.faceDirection(dir);
  }

  tpsCamera.update(dt);

  if (doraemon && doraemon.mesh.visible) {
    doraemon.lookAt(player.position.x, player.position.y, player.position.z);
  }

  setEnergyPercent(getBatteryPercent());
}

const keyState = {};
document.addEventListener('keydown', (e) => {
  keyState[e.code] = true;
  keyState[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => {
  keyState[e.code] = false;
  keyState[e.key.toLowerCase()] = false;
});

document.addEventListener('mousemove', (e) => {
  if (!pointerLocked || !tpsCamera) return;
  tpsCamera.rotateYaw(-e.movementX * 0.002);
  tpsCamera.rotatePitch(-e.movementY * 0.002);
});

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  update(dt);
  renderer.render(scene, camera);
}

init().then(() => animate());
