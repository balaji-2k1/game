import * as THREE from 'three';

let regionData = null;
let locationsData = null;

export async function loadRegionData() {
  const res = await fetch('/data/regions.json');
  const json = await res.json();
  regionData = json;
  locationsData = json.locations || [];
  return json;
}

export function getRegion(id) {
  if (!regionData) return null;
  return regionData.regions?.find((r) => r.id === id) || null;
}

export function getRegions() {
  return regionData?.regions ?? [];
}

export function getLocations(regionId) {
  if (!locationsData) return [];
  return locationsData.filter((l) => l.regionId === regionId);
}

export function getSpawn(regionId) {
  const region = getRegion(regionId);
  if (!region?.spawn) return { x: 0, y: 0, z: 0 };
  return region.spawn;
}

export function isInRegionBounds(position, regionId) {
  const region = getRegion(regionId);
  if (!region?.bounds) return true;
  const b = region.bounds;
  return position.x >= b.minX && position.x <= b.maxX && position.z >= b.minZ && position.z <= b.maxZ;
}

export function buildAttic(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.85, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallBack = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 8),
    new THREE.MeshStandardMaterial({ color: 0x7a6b5d, roughness: 0.9 })
  );
  wallBack.position.set(0, 4, -10);
  scene.add(wallBack);

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.5, 1),
    new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 })
  );
  box.position.set(2, 0.75, -2);
  box.castShadow = true;
  scene.add(box);

  return { floor, wallBack, box, groundY: 0 };
}

export function buildNerimaOutdoor(scene) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x4a7c59,
      roughness: 0.95,
      metalness: 0,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const trees = [];
  const treePositions = [];
  for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.5) * 140;
    const z = (Math.random() - 0.5) * 140;
    if (treePositions.some((p) => Math.hypot(p.x - x, p.z - z) < 8)) continue;
    treePositions.push({ x, z });
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 2.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 })
    );
    trunk.position.set(x, 1.1, z);
    trunk.castShadow = true;
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(2.8, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.9 })
    );
    crown.position.set(x, 4, z);
    crown.castShadow = true;
    scene.add(trunk);
    scene.add(crown);
    trees.push(trunk, crown);
  }

  const house = new THREE.Mesh(
    new THREE.BoxGeometry(12, 6, 10),
    new THREE.MeshStandardMaterial({ color: 0xf5ebe0, roughness: 0.85 })
  );
  house.position.set(-15, 3, 0);
  house.castShadow = true;
  house.receiveShadow = true;
  scene.add(house);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(8, 3, 4),
    new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.8 })
  );
  roof.position.set(-15, 7.5, 0);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  scene.add(roof);

  return { ground, trees, house, roof, groundY: 0 };
}

export function getCurrentGroundY(currentRegionId) {
  return 0;
}
