/**
 * Systems module: gadgets (Take-copter, battery) and story (intro, flags).
 * Standard naming: camelCase for functions and variables.
 */
let gadgetConfig = null;
let battery = 100;
let batteryMax = 100;
let rechargePerSecond = 5;
const unlockedGadgets = new Set();

const storyFlags = {
  attic_diary_read: false,
  met_doraemon: false,
  first_flight_unlocked: false,
  first_flight_complete: false,
  intro_done: false,
};
let currentRegionId = 'attic';
let introPhase = 0;
const INTRO_LINES = [
  "You find an old diary in the attic...",
  "It mentions a 'blue cat from the future' and a 'door to anywhere.'",
  "The sky glitches—a tear of light!",
  "Something crashes through the ceiling!",
  "A blue robot cat lands in front of you.",
  "\"Sora...!\" It says your name, then powers down.",
  "When Doraemon wakes, he gives you the Take-copter.",
  "Now you can fly. Press F to use it. Go see the world!",
];

// --- Gadgets ---
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
  return getGadget('take_copter') ?? { energyCostPerSecond: 8, maxEnergy: 100 };
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

// --- Story ---
export function getFlag(name) {
  return storyFlags[name];
}

export function setFlag(name, value) {
  storyFlags[name] = value;
}

export function getCurrentRegionId() {
  return currentRegionId;
}

export function setCurrentRegionId(id) {
  currentRegionId = id;
}

export function getIntroPhase() {
  return introPhase;
}

export function advanceIntro() {
  introPhase++;
  if (introPhase === 1) storyFlags.attic_diary_read = true;
  if (introPhase === 5) storyFlags.met_doraemon = true;
  if (introPhase >= INTRO_LINES.length) {
    storyFlags.first_flight_unlocked = true;
    storyFlags.intro_done = true;
  }
  return introPhase;
}

export function getIntroLine() {
  if (introPhase >= 1 && introPhase <= INTRO_LINES.length) return INTRO_LINES[introPhase - 1];
  return null;
}

export function isIntroDone() {
  return storyFlags.intro_done;
}

export function startIntro() {
  introPhase = 1;
  return INTRO_LINES[0];
}

export function shouldTransitionToOutdoor() {
  return storyFlags.intro_done && getCurrentRegionId() === 'attic';
}
