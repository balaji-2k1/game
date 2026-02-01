let gadgetConfig = null;
let battery = 100;
let batteryMax = 100;
let rechargePerSecond = 5;
const unlockedGadgets = new Set();
const cooldowns = new Map();

export async function loadGadgetData() {
  const res = await fetch('/data/gadgets.json');
  const json = await res.json();
  gadgetConfig = json;
  batteryMax = json.doraemonBatteryMax ?? 100;
  rechargePerSecond = json.batteryRechargePerSecond ?? 5;
  battery = batteryMax;
  return json;
}

export function unlockGadget(id) {
  unlockedGadgets.add(id);
}

export function isGadgetUnlocked(id) {
  return unlockedGadgets.has(id);
}

export function setUnlockConditionMet(condition) {
  const list = gadgetConfig?.gadgets ?? [];
  for (const g of list) {
    if (g.unlockCondition === condition) unlockGadget(g.id);
  }
}

export function getGadget(id) {
  return gadgetConfig?.gadgets?.find((g) => g.id === id) ?? null;
}

export function getTakeCopterConfig() {
  return getGadget('take_copter') ?? {
    energyCostPerSecond: 8,
    maxEnergy: 100,
  };
}

export function canUseTakeCopter() {
  if (!isGadgetUnlocked('take_copter')) return false;
  const cfg = getTakeCopterConfig();
  return battery >= (cfg.energyCostPerSecond ?? 8) * 0.016;
}

export function useTakeCopter(dt) {
  const cfg = getTakeCopterConfig();
  const cost = (cfg.energyCostPerSecond ?? 8) * dt;
  battery = Math.max(0, battery - cost);
  return battery > 0;
}

export function rechargeBattery(dt) {
  if (battery >= batteryMax) return;
  battery = Math.min(batteryMax, battery + rechargePerSecond * dt);
}

export function getBatteryPercent() {
  return (battery / batteryMax) * 100;
}

export function getBattery() {
  return battery;
}

export function getBatteryMax() {
  return batteryMax;
}
