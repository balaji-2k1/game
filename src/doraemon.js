import * as THREE from 'three';

// Iconic Doraemon-inspired colors (procedural model only; no copyrighted assets)
const DORAEMON_BLUE = 0x03adf0;   // Sky blue from official palette
const FACE_WHITE = 0xfffbf0;
const BELL_RED = 0xe53935;
const NOSE_RED = 0xd32f2f;
const BLACK = 0x1a1a1a;

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

  // Head: large round blue sphere (no ears)
  const headGeom = new THREE.SphereGeometry(0.52, 32, 32);
  const head = new THREE.Mesh(headGeom, createMaterial(DORAEMON_BLUE));
  head.position.y = 1.05;
  head.castShadow = true;
  head.receiveShadow = true;
  root.add(head);

  // White face: front hemisphere (half sphere facing forward)
  const faceGeom = new THREE.SphereGeometry(0.48, 24, 24, -Math.PI / 2, Math.PI, 0, Math.PI);
  const face = new THREE.Mesh(faceGeom, createMaterial(FACE_WHITE, { roughness: 0.6 }));
  face.position.set(0, 1.05, 0.02);
  root.add(face);

  // Red nose (center of face)
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    createMaterial(NOSE_RED, { roughness: 0.4 })
  );
  nose.position.set(0, 1.05, 0.5);
  root.add(nose);

  // Eyes: black ovals with white highlight
  const eyeGeom = new THREE.SphereGeometry(0.1, 12, 12);
  const eyeL = new THREE.Mesh(eyeGeom, createMaterial(BLACK));
  eyeL.position.set(-0.18, 1.18, 0.42);
  root.add(eyeL);
  const eyeR = new THREE.Mesh(eyeGeom, createMaterial(BLACK));
  eyeR.position.set(0.18, 1.18, 0.42);
  root.add(eyeR);
  const highlightGeom = new THREE.SphereGeometry(0.03, 8, 8);
  const highlightMat = createMaterial(0xffffff);
  const hlL = new THREE.Mesh(highlightGeom, highlightMat);
  hlL.position.set(-0.2, 1.22, 0.46);
  root.add(hlL);
  const hlR = new THREE.Mesh(highlightGeom, highlightMat);
  hlR.position.set(0.16, 1.22, 0.46);
  root.add(hlR);

  // Whiskers (three each side)
  const whiskerMat = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 1 });
  for (let i = -1; i <= 1; i++) {
    const points = [new THREE.Vector3(0.22 + i * 0.02, 1.02 + i * 0.03, 0.48), new THREE.Vector3(0.5, 1.0 + i * 0.05, 0.55)];
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), whiskerMat);
    root.add(line);
  }
  for (let i = -1; i <= 1; i++) {
    const points = [new THREE.Vector3(-0.22 - i * 0.02, 1.02 + i * 0.03, 0.48), new THREE.Vector3(-0.5, 1.0 + i * 0.05, 0.55)];
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), whiskerMat);
    root.add(line);
  }

  // Red bell (neck)
  const bell = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.06, 8, 16),
    createMaterial(BELL_RED, { metalness: 0.2, roughness: 0.5 })
  );
  bell.position.set(0, 0.82, 0.28);
  bell.rotation.x = Math.PI / 2;
  root.add(bell);
  const bellBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    createMaterial(BELL_RED)
  );
  bellBall.position.set(0, 0.68, 0.28);
  root.add(bellBall);

  // Body: round blue torso
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 24, 24),
    createMaterial(DORAEMON_BLUE)
  );
  body.position.y = 0.52;
  body.castShadow = true;
  root.add(body);

  // White belly (front)
  const bellyGeom = new THREE.SphereGeometry(0.35, 20, 20, -Math.PI / 2, Math.PI, 0, Math.PI);
  const belly = new THREE.Mesh(bellyGeom, createMaterial(FACE_WHITE, { roughness: 0.6 }));
  belly.position.set(0, 0.52, 0.28);
  root.add(belly);

  // White hands (rounded)
  const handGeom = new THREE.SphereGeometry(0.18, 12, 12);
  const handL = new THREE.Mesh(handGeom, createMaterial(FACE_WHITE));
  handL.position.set(-0.38, 0.55, 0.15);
  root.add(handL);
  const handR = new THREE.Mesh(handGeom, createMaterial(FACE_WHITE));
  handR.position.set(0.38, 0.55, 0.15);
  root.add(handR);

  // White feet
  const footGeom = new THREE.SphereGeometry(0.2, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const footL = new THREE.Mesh(footGeom, createMaterial(FACE_WHITE));
  footL.position.set(-0.2, 0.12, 0.08);
  root.add(footL);
  const footR = new THREE.Mesh(footGeom, createMaterial(FACE_WHITE));
  footR.position.set(0.2, 0.12, 0.08);
  root.add(footR);

  // Red tail (small)
  const tail = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    createMaterial(NOSE_RED)
  );
  tail.position.set(0, 0.35, -0.38);
  root.add(tail);

  root.position.set(0, 0, 0);
  root.scale.setScalar(1.2);
  root.visible = false;
  scene.add(root);

  return {
    mesh: root,
    setVisible(visible) {
      root.visible = visible;
    },
    setPosition(x, y, z) {
      root.position.set(x, y, z);
    },
    lookAt(x, y, z) {
      root.lookAt(x, y + 1, z);
    },
  };
}
