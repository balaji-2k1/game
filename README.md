# Doraemon Epic Game

A playable prototype of the Doraemon-inspired epic adventure: **you play as Doraemon**. Third-person exploration, Take-copter flight, and the intro story.

## Run the game

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. Click the canvas to lock the pointer, then use the controls below.

## Controls (standard third-person)

- **W** — Forward | **S** — Backward | **A** — Left | **D** — Right
- **Mouse** — Look (after pointer lock)
- **SPACE** — Jump (or ascend when flying)
- **F** — Take-copter: fly (unlocked after intro; uses battery)
- **SPACE** (during dialogue) — Advance text
- **ESC** — Release pointer lock

## How to play

1. Click **Start Game**, then click the game canvas to lock the mouse.
2. **You play as Doraemon.** Read the intro dialogue (press **SPACE** to advance). After the intro you’re in Nerima.
3. Move with **WASD**; the camera follows you (Doraemon). Press **F** to fly with the Take-copter; the blue bar shows your battery. Land (release **F**) to recharge.
4. Explore the area. More content (Anywhere Door, time travel, mecha) is planned per the design doc in `docs/`.

## Project layout (6 source files)

- `index.html` — Entry page
- `src/main.js` — Init, game loop, input, UI
- `src/game.js` — Player, ThirdPersonCamera, Doraemon character
- `src/world.js` — Regions, attic, Nerima outdoor
- `src/systems.js` — Gadgets (Take-copter, battery), story (intro, flags)
- `src/style.css` — HUD and dialogue styles
- `public/data/` — Region and gadget config (JSON)
- `docs/` — Design doc and implementation roadmap

## Why JavaScript? Is it the right choice?

**Why JS:** The game runs in the **browser** with no install. JavaScript is the only language that runs natively there, so a web-based prototype is the most portable (laptop, desktop, any OS). You open a URL and play.

**Packages used:** The stack is already optimized for this:

- **Vite** — Fast dev server and production build (tree-shaking, code splitting).
- **Three.js** — The standard library for 3D in the browser; no other package gives the same reach and ecosystem for WebGL games.

**Alternatives:** For a **shipped PC game** (installer, store), engines like **Unity** (C#) or **Godot** (GDScript/C#) are often better: richer tooling, physics, and export targets. For a **playable web prototype** that runs anywhere without install, JS + Three.js + Vite is a standard and practical choice.

## Build for production

```bash
npm run build
npm run preview
```

Output is in `dist/`; serve that folder or use `npm run preview` to test.
