import * as THREE from 'three';

const DEFAULT_DISTANCE = 6;
const DEFAULT_HEIGHT = 2.5;
const MIN_PITCH = -0.4;
const MAX_PITCH = 0.6;

export class ThirdPersonCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
    this.yaw = 0;
    this.pitch = 0.2;
    this.distance = DEFAULT_DISTANCE;
    this.height = DEFAULT_HEIGHT;
    this.smooth = 0.1;
  }

  update(dt) {
    if (!this.target) return;
    const pos = this.target.position;
    const y = pos.y + this.height;
    const dx = Math.sin(this.yaw) * this.distance;
    const dz = Math.cos(this.yaw) * this.distance;
    const dy = Math.sin(this.pitch) * this.distance;
    const horiz = Math.cos(this.pitch) * this.distance;
    const camX = pos.x - Math.sin(this.yaw) * horiz;
    const camZ = pos.z - Math.cos(this.yaw) * horiz;
    const camY = y + dy;
    this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 1 - Math.exp(-this.smooth * dt * 60));
    this.camera.lookAt(pos.x, pos.y + 1.2, pos.z);
  }

  rotateYaw(delta) {
    this.yaw += delta;
  }

  rotatePitch(delta) {
    this.pitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, this.pitch + delta));
  }

  getForward() {
    return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
  }

  getRight() {
    const f = this.getForward();
    return new THREE.Vector3(-f.z, 0, f.x).normalize();
  }
}
