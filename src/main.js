/**
 * Entry point: init, game loop, input, UI.
 * Consolidated: uses game.js (player, camera, Doraemon), world.js, systems.js; UI inlined.
 */
import * as THREE from 'three';
import { Player, ThirdPersonCamera, createDoraemon } from './game.js';
import {
  loadRegionData,
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
  advanceIntro,
  getIntroLine,
  startIntro,
  isIntroDone,
  setCurrentRegionId,
  shouldTransitionToOutdoor,
} from './systems.js';

// --- UI refs and helpers (camelCase) ---
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const energyFill = document.getElementById('energy-fill');
const titleScreen = document.getElementById('title-screen');
const startBtn = document.getElementById('start-btn');
const controlsHint = document.getElementById('controls-hint');

function showDialogue(text) {
  if (dialogueBox && dialogueText) {
    dialogueBox.classList.remove('hidden');
    dialogueText.textContent = text;
  }
}

function hideDialogue() {
  if (dialogueBox) dialogueBox.classList.add('hidden');
}

function isDialogueVisible() {
  return dialogueBox && !dialogueBox.classList.contains('hidden');
}

function setEnergyPercent(percent) {
  if (energyFill) energyFill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

function hideTitleScreen() {
  if (titleScreen) titleScreen.classList.add('hidden');
}

function onStartClick(callback) {
  if (startBtn) startBtn.addEventListener('click', callback);
}

function setControlsHint(text) {
  if (controlsHint) controlsHint.textContent = text;
}

// --- Game state ---
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
  doraemon = createDoraemon(scene);
  doraemon.setVisible(true);
  player = new Player(scene, doraemon.mesh);
  tpsCamera = new ThirdPersonCamera(camera, player.mesh);

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
  let moveDir = new THREE.Vector3(0, 0, 0);
  if (pointerLocked) {
    if (document.querySelector('#ui input:focus')) return;
    const allowKeys = document.activeElement?.tagName !== 'INPUT';
    if (allowKeys && (keyState.KeyW || keyState.w)) moveDir.sub(forward);
    if (allowKeys && (keyState.KeyS || keyState.s)) moveDir.add(forward);
  // Fix left/right logic: A adds left, D adds right
  if (allowKeys && (keyState.KeyA || keyState.a)) moveDir.add(right.clone().negate());
  if (allowKeys && (keyState.KeyD || keyState.d)) moveDir.add(right);
  }

  const flying = (keyState.KeyF || keyState.f) && canUseTakeCopter() && isIntroDone();
  if (flying) {
    const up = keyState.Space;
    const down = keyState.ShiftLeft || keyState.ShiftRight;
    if (moveDir.lengthSq() > 0) moveDir.normalize();
    player.fly(moveDir, new THREE.Vector3(0, 0, 0), up ? true : down ? false : null, dt);
    const stillFlying = useTakeCopter(dt);
    if (!stillFlying) player.stopFlying();
  } else {
    if (moveDir.lengthSq() > 0) player.move(moveDir, new THREE.Vector3(0, 0, 0), dt);
    if (keyState.Space && !player.isFlying) player.jump();
    rechargeBattery(dt);
  }

  const groundY = getCurrentGroundY(currentRegionId);
  player.update(dt, groundY);

  if (moveDir.lengthSq() > 0) {
    player.faceDirection(moveDir.clone().normalize());
  }

  tpsCamera.update(dt);
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
