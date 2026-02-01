/**
 * Game module: Player, ThirdPersonCamera, and Doraemon character.
 * Standard naming: PascalCase for classes, camelCase for functions/variables.
 */
import * as THREE from 'three';

// --- Constants ---
const MOVE_SPEED = 6;
const JUMP_VELOCITY = 8;
const GRAVITY = 22;
const FLY_SPEED = 10;
const FLY_VERTICAL = 6;
const CAMERA_DISTANCE = 6;
const CAMERA_HEIGHT = 2.5;
const CAMERA_PITCH_MIN = -0.4;
const CAMERA_PITCH_MAX = 0.6;
const DORAEMON_BLUE = 0x03adf0;
const FACE_WHITE = 0xfffbf0;
const BELL_RED = 0xe53935;
const NOSE_RED = 0xd32f2f;
const BLACK = 0x1a1a1a;

// --- ThirdPersonCamera ---
export class ThirdPersonCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
    this.yaw = 0;
    this.pitch = 0.2;
    this.distance = CAMERA_DISTANCE;
    this.height = CAMERA_HEIGHT;
    this.smooth = 0.1;
  }

  update(dt) {
    if (!this.target) return;
    const pos = this.target.position;
    const y = pos.y + this.height;
    const horiz = Math.cos(this.pitch) * this.distance;
    const camX = pos.x - Math.sin(this.yaw) * horiz;
    const camZ = pos.z - Math.cos(this.yaw) * horiz;
    const dy = Math.sin(this.pitch) * this.distance;
    const camY = y + dy;
    this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 1 - Math.exp(-this.smooth * dt * 60));
    this.camera.lookAt(pos.x, pos.y + 1.2, pos.z);
  }

  rotateYaw(delta) {
    this.yaw += delta;
  }

  rotatePitch(delta) {
    this.pitch = Math.max(CAMERA_PITCH_MIN, Math.min(CAMERA_PITCH_MAX, this.pitch + delta));
  }

  getForward() {
    return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
  }

  getRight() {
    const f = this.getForward();
    return new THREE.Vector3(-f.z, 0, f.x).normalize();
  }
}

// --- Player ---
export class Player {
  constructor(scene, characterMesh = null) {
    this.scene = scene;
    this.mesh = characterMesh || this.createDefaultMesh();
    if (!characterMesh) scene.add(this.mesh);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.onGround = false;
    this.isFlying = false;
  }

  createDefaultMesh() {
    const body = new THREE.Group();
    const capsule = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.34, 0.88, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x6b9fd4, roughness: 0.7 })
    );
    capsule.position.y = 0.44;
    body.add(capsule);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffe4c4, roughness: 0.65 })
    );
    head.position.y = 1.12;
    body.add(head);
    body.castShadow = true;
    return body;
  }

  get position() {
    return this.mesh.position;
  }

  move(forward, right, dt) {
    const dir = new THREE.Vector3(0, 0, 0);
    if (forward && forward.lengthSq() > 0) dir.add(forward);
    if (right && right.lengthSq() > 0) dir.add(right);
    if (dir.lengthSq() === 0) return;
    dir.normalize();
    const speed = this.isFlying ? FLY_SPEED : MOVE_SPEED;
    this.velocity.x = dir.x * speed;
    this.velocity.z = dir.z * speed;
    if (!this.isFlying) {
      this.velocity.y -= GRAVITY * dt;
      if (this.onGround && this.velocity.y < 0) this.velocity.y = 0;
    }
  }

  fly(forward, right, up, dt) {
    this.isFlying = true;
    const dir = new THREE.Vector3(0, 0, 0);
    if (forward && forward.lengthSq() > 0) dir.add(forward);
    if (right && right.lengthSq() > 0) dir.add(right);
    if (dir.lengthSq() > 0) {
      dir.normalize();
      this.velocity.x = dir.x * FLY_SPEED;
      this.velocity.z = dir.z * FLY_SPEED;
    }
    this.velocity.y = (up === true ? 1 : up === false ? -1 : 0) * FLY_VERTICAL;
  }

  stopFlying() {
    this.isFlying = false;
    this.velocity.y = 0;
  }

  jump() {
    if (this.onGround && !this.isFlying) {
      this.velocity.y = JUMP_VELOCITY;
      this.onGround = false;
    }
  }

  faceDirection(worldDir) {
    if (!worldDir || (worldDir.x === 0 && worldDir.z === 0)) return;
    this.mesh.rotation.y = Math.atan2(worldDir.x, worldDir.z);
  }

  update(dt, groundY) {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;
    this.mesh.rotation.x = 0;
    this.mesh.rotation.z = 0;
    if (!this.isFlying && groundY !== undefined) {
      if (this.position.y <= groundY) {
        this.position.y = groundY;
        this.velocity.y = 0;
        this.onGround = true;
      } else {
        this.onGround = false;
      }
    }
  }
}

// --- Doraemon (iconic round blue cat robot: white face, red nose, red bell, no ears) ---
function createMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.5,
    metalness: options.metalness ?? 0,
    flatShading: false,
    ...options,
  });
}

export function createDoraemon(scene) {
  const root = new THREE.Group();

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 32),
    createMaterial(DORAEMON_BLUE)
  );
  head.position.y = 1.1;
  head.castShadow = true;
  root.add(head);

  const faceGeom = new THREE.SphereGeometry(0.5, 24, 24, -Math.PI / 2, Math.PI, 0, Math.PI);
  const face = new THREE.Mesh(faceGeom, createMaterial(FACE_WHITE, { roughness: 0.6 }));
  face.position.set(0, 1.1, 0.05);
  root.add(face);

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    createMaterial(NOSE_RED, { roughness: 0.4 })
  );
  nose.position.set(0, 1.08, 0.55);
  root.add(nose);

  const eyeGeom = new THREE.SphereGeometry(0.11, 12, 12);
  const eyeL = new THREE.Mesh(eyeGeom, createMaterial(BLACK));
  eyeL.position.set(-0.2, 1.22, 0.45);
  root.add(eyeL);
  const eyeR = new THREE.Mesh(eyeGeom, createMaterial(BLACK));
  eyeR.position.set(0.2, 1.22, 0.45);
  root.add(eyeR);
  const hl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), createMaterial(0xffffff));
  hl.position.set(-0.22, 1.26, 0.5);
  root.add(hl);
  const hr = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), createMaterial(0xffffff));
  hr.position.set(0.18, 1.26, 0.5);
  root.add(hr);

  const whiskerMat = new THREE.LineBasicMaterial({ color: 0x333333 });
  for (let i = -1; i <= 1; i++) {
    const pts = [new THREE.Vector3(0.25, 1.05 + i * 0.03, 0.5), new THREE.Vector3(0.55, 1.02 + i * 0.05, 0.58)];
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), whiskerMat));
  }
  for (let i = -1; i <= 1; i++) {
    const pts = [new THREE.Vector3(-0.25, 1.05 + i * 0.03, 0.5), new THREE.Vector3(-0.55, 1.02 + i * 0.05, 0.58)];
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), whiskerMat));
  }

  const bell = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.065, 8, 16),
    createMaterial(BELL_RED, { metalness: 0.2, roughness: 0.5 })
  );
  bell.position.set(0, 0.85, 0.3);
  bell.rotation.x = Math.PI / 2;
  root.add(bell);
  const bellBall = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), createMaterial(BELL_RED));
  bellBall.position.set(0, 0.7, 0.3);
  root.add(bellBall);

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 24, 24),
    createMaterial(DORAEMON_BLUE)
  );
  body.position.y = 0.55;
  body.castShadow = true;
  root.add(body);

  const bellyGeom = new THREE.SphereGeometry(0.38, 20, 20, -Math.PI / 2, Math.PI, 0, Math.PI);
  const belly = new THREE.Mesh(bellyGeom, createMaterial(FACE_WHITE, { roughness: 0.6 }));
  belly.position.set(0, 0.55, 0.32);
  root.add(belly);

  const handGeom = new THREE.SphereGeometry(0.2, 12, 12);
  const handL = new THREE.Mesh(handGeom, createMaterial(FACE_WHITE));
  handL.position.set(-0.42, 0.58, 0.18);
  root.add(handL);
  const handR = new THREE.Mesh(handGeom, createMaterial(FACE_WHITE));
  handR.position.set(0.42, 0.58, 0.18);
  root.add(handR);

  const footGeom = new THREE.SphereGeometry(0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const footL = new THREE.Mesh(footGeom, createMaterial(FACE_WHITE));
  footL.position.set(-0.22, 0.1, 0.1);
  root.add(footL);
  const footR = new THREE.Mesh(footGeom, createMaterial(FACE_WHITE));
  footR.position.set(0.22, 0.1, 0.1);
  root.add(footR);

  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), createMaterial(NOSE_RED));
  tail.position.set(0, 0.38, -0.42);
  root.add(tail);

  root.scale.setScalar(1.15);
  root.visible = true;
  scene.add(root);

  return {
    mesh: root,
    setVisible(visible) {
      root.visible = visible;
    },
    setPosition(x, y, z) {
      root.position.set(x, y, z);
    },
  };
}
