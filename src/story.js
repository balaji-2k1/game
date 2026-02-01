const flags = {
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

export function getFlag(name) {
  return flags[name];
}

export function setFlag(name, value) {
  flags[name] = value;
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
  if (introPhase === 1) flags.attic_diary_read = true;
  if (introPhase === 5) flags.met_doraemon = true;
  if (introPhase >= INTRO_LINES.length) {
    flags.first_flight_unlocked = true;
    flags.intro_done = true;
  }
  return introPhase;
}

export function getIntroLine() {
  if (introPhase >= 1 && introPhase <= INTRO_LINES.length) return INTRO_LINES[introPhase - 1];
  return null;
}

export function isIntroDone() {
  return flags.intro_done;
}

export function isIntroActive() {
  return introPhase < INTRO_LINES.length && introPhase > 0;
}

export function startIntro() {
  introPhase = 1;
  return INTRO_LINES[0];
}

export function shouldShowDoraemon() {
  return flags.met_doraemon;
}

export function shouldTransitionToOutdoor() {
  return flags.intro_done && getCurrentRegionId() === 'attic';
}
