import * as THREE from 'three';

const MOVE_SPEED = 6;
const JUMP_VELOCITY = 8;
const GRAVITY = 22;
const FLY_SPEED = 10;
const FLY_VERTICAL = 6;

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.mesh = this._createMesh();
    scene.add(this.mesh);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.onGround = false;
    this.isFlying = false;
  }

  _createMesh() {
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
    body.position.set(0, 0, 0);
    body.castShadow = true;
    return body;
  }

  get position() {
    return this.mesh.position;
  }

  get rotation() {
    return this.mesh.rotation;
  }

  move(forward, right, dt, camera) {
    if (!forward && !right) return;
    const dir = new THREE.Vector3(0, 0, 0);
    if (forward) dir.add(forward);
    if (right) dir.add(right);
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
    if (forward) dir.add(forward);
    if (right) dir.add(right);
    dir.normalize();
    this.velocity.x = dir.x * FLY_SPEED;
    this.velocity.z = dir.z * FLY_SPEED;
    this.velocity.y = (up ? 1 : 0) * FLY_VERTICAL - (up === false ? 1 : 0) * FLY_VERTICAL;
    if (!forward && !right && up !== true && up !== false) this.velocity.y = 0;
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
    if (worldDir.x === 0 && worldDir.z === 0) return;
    this.mesh.rotation.y = Math.atan2(-worldDir.x, -worldDir.z);
  }

  update(dt, groundY) {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;
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
