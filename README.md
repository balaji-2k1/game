# Doraemon Epic Game

A playable prototype of the Doraemon-inspired epic adventure: third-person exploration, Take-copter flight, and the intro story (Sora meets Doraemon).

## Run the game

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. Click the canvas to lock the pointer, then use the controls below.

## Controls

- **WASD** — Move
- **Mouse** — Look (after pointer lock)
- **SPACE** — Jump (or ascend when flying)
- **F** — Take-copter: fly (unlocked after intro; uses battery)
- **SPACE** (during dialogue) — Advance text
- **ESC** — Release pointer lock

## How to play

1. Click **Start Game**, then click the game canvas to lock the mouse.
2. Read the intro dialogue (press **SPACE** to advance). You find Nobita’s diary, the sky glitches, and Doraemon crashes in and says your name.
3. After the intro, you’re in Nerima. Doraemon is with you. Press **F** to fly with the Take-copter; the blue bar shows Doraemon’s battery. Land (release **F**) to recharge.
4. Explore the area. More content (Anywhere Door, time travel, mecha) is planned per the design doc in `docs/`.

## Project layout

- `docs/DORAEMON_EPIC_GAME_DESIGN.md` — Full game design (world, story, systems)
- `docs/IMPLEMENTATION_ROADMAP.md` — Phased build plan
- `src/` — Game code (Three.js, player, gadgets, story, UI)
- `public/data/` — Region and gadget config (JSON)

## Build for production

```bash
npm run build
npm run preview
```

Output is in `dist/`; serve that folder or use `npm run preview` to test.
