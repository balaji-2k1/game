const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const dialogueNext = document.getElementById('dialogue-next');
const energyFill = document.getElementById('energy-fill');
const controlsHint = document.getElementById('controls-hint');
const titleScreen = document.getElementById('title-screen');
const startBtn = document.getElementById('start-btn');

export function showDialogue(text) {
  if (!dialogueBox || !dialogueText) return;
  dialogueBox.classList.remove('hidden');
  dialogueText.textContent = text;
}

export function hideDialogue() {
  if (dialogueBox) dialogueBox.classList.add('hidden');
}

export function isDialogueVisible() {
  return dialogueBox && !dialogueBox.classList.contains('hidden');
}

export function setEnergyPercent(percent) {
  if (energyFill) energyFill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

export function hideTitleScreen() {
  if (titleScreen) titleScreen.classList.add('hidden');
}

export function onStartClick(callback) {
  if (startBtn) startBtn.addEventListener('click', callback);
}

export function setControlsHint(text) {
  if (controlsHint) controlsHint.textContent = text;
}
