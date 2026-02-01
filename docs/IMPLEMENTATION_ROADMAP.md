# Doraemon Epic Game — Implementation Roadmap

A phased development plan that turns the [DORAEMON_EPIC_GAME_DESIGN.md](DORAEMON_EPIC_GAME_DESIGN.md) into buildable tasks. Each phase delivers testable systems; dependencies are explicit.

**Target platform:** Laptop (PC) · **Input:** Keyboard + mouse / controller · **Camera:** Third-person

---

## Phase 1: World + Movement

**Goal:** Player can move through a small slice of the world (one region) with basic third-person controls and camera. Foundation for streaming and layers.

**Tasks:**

- **1.1 Core runtime:** Game loop, input (keyboard + mouse / controller), window, basic scene. No engine-specific code in design; implement with chosen runtime/engine.
- **1.2 Player controller:** Third-person character with run, jump, basic collision. Configurable move speed, jump force, gravity.
- **1.3 Camera:** Third-person follow with optional cinematic framing (e.g. distance, FOV). No engine-specific details; expose parameters for later tuning.
- **1.4 World slice:** One region (e.g. Nerima / Tokyo slice): terrain or blockout, static colliders, spawn point. No streaming yet—single load.
- **1.5 Data:** Define `Region`, `Location` (minimal: id, position, regionId). Load region config (e.g. JSON) for bounds and list of locations. No gameplay logic yet—data only.
- **1.6 Streaming (conceptual):** Document or stub “chunk/region loading” API: `loadRegion(regionId)`, `unloadRegion(regionId)`, `getCurrentRegion()`. Implement later when multiple regions exist.

**Exit criteria:** Player spawns in one region, moves and jumps; camera follows; region data is loadable from config.

**Dependencies:** None.

---

## Phase 2: Gadgets (Doraemon Core)

**Goal:** Gadget system is implemented: inventory, cooldowns, and at least two gadgets (e.g. Take-copter, Anywhere Door) with clear effects. Doraemon as gadget source (logic only; art/UI later).

**Tasks:**

- **2.1 Gadget data model:** `Gadget { id, displayName, category, cooldownSeconds?, batteryCost?, unlockCondition? }`. Load from config (e.g. gadgets.json). `unlocked_gadgets`, `equipped_gadgets`, `gadget_cooldowns` (Map<GadgetId, Timestamp>).
- **2.2 Inventory logic:** Equip/unequip; max equipped count; “can use here” check per gadget (stub or simple rule: e.g. Take-copter only outdoors). Persist unlocked/equipped in save stub.
- **2.3 Cooldowns and battery:** Per-gadget cooldown after use; optional shared “Doraemon battery” that depletes for heavy gadgets and recovers over time or at rest. UI not required; log or debug display OK.
- **2.4 Take-copter:** When active, player gains flight (vertical + horizontal) for a duration or until cancelled. Limited altitude if desired. Consumes cooldown and optionally battery.
- **2.5 Anywhere Door:** Open UI or list of unlocked/visited locations; on select, move player to that location (same region or cross-region stub). Cooldown after use. “Unlocked/visited” = list of LocationIds or regionId + position.
- **2.6 Gadget pipeline:** One gadget = one definition in config + one behavior (script or code path). Document pattern so new gadgets (Small Light, Pass Loop, etc.) can be added without changing core system.

**Exit criteria:** Player can equip and use Take-copter (fly) and Anywhere Door (teleport to a location); cooldowns and optional battery apply; new gadgets can be added via config + behavior.

**Dependencies:** Phase 1 (player, world slice, locations).

---

## Phase 3: Mecha

**Goal:** Player can enter/exit a mecha, control it (move, jump, basic combat), and have a bond level that affects performance or unlocks.

**Tasks:**

- **3.1 Mecha data model:** `Mecha { id, displayName, baseStats?, upgradeSlots? }`. `mecha_bond_level`, `mecha_upgrades_unlocked`, `is_inside_mecha`. Load from config.
- **3.2 Entry/exit:** Trigger zones or context button “board” / “disembark”. On board: switch control to mecha, camera to mecha, hide player model (or despawn). On disembark: reverse; mecha can remain in world or despawn.
- **3.3 Mecha controller:** Movement (run, jump, dash), basic combat (melee and/or ranged). Separate from player controller but reuse patterns (e.g. same input mapping, different move set).
- **3.4 Bond mechanic:** Bond level increases via story flags or optional “interact with mecha” actions. Bond affects: e.g. sync gauge fill rate, one unlockable move, or a story beat (robot saves Sora once). Implement at least one concrete effect.
- **3.5 Upgrades:** At least one upgrade type (e.g. “stronger beam”, “faster dash”). Unlocked by story flag or collectible; applied to mecha stats or abilities. Data-driven where possible.

**Exit criteria:** Player can board mecha, move and fight, disembark; bond level exists and has at least one gameplay effect; at least one upgrade is unlockable and applied.

**Dependencies:** Phase 1 (world, player spawn); Phase 2 optional (e.g. gadget used to reach mecha).

---

## Phase 4: Time Travel

**Goal:** Player can switch between eras (past / present / future). Same map with era-specific variants; per-era state (e.g. NPC state, world flags) is saved and loaded. No full paradox system yet—only era switch and state separation.

**Tasks:**

- **4.1 Time era data:** `TimeEra { eraId, label, mapVariantId }`. `currentEra` in global state. Map variant = different scene or same scene with different assets/flags; minimal implementation: different “layer” or scene ID per era.
- **4.2 Era switch:** Trigger or gadget (e.g. Time Machine) that calls `switchEra(toEra)`. On switch: save per-era state for current era (NPC positions, flags, inventory snapshot if desired); load per-era state for target era; update `currentEra`; load correct map variant or scene.
- **4.3 Per-era state:** `perEraState[eraId] = { npcStates, worldFlags }`. Persist in save. When entering an era, apply its state; when leaving, write current state back.
- **4.4 Cause and effect (simple):** At least one “cause in past, effect in present” example: e.g. plant tree in past → present has tree (flag `planted_tree_in_past`). Document pattern for more cause/effect pairs.
- **4.5 Paradox rules (stub):** List of “forbidden” actions (e.g. harming timeline-critical NPC). When attempted: show warning; if player continues, apply debuff or rewind. No full timeline corruption in Phase 4.

**Exit criteria:** Player can switch between at least two eras; state is per-era and persists; at least one cause/effect is visible; paradox handling is stubbed or minimal.

**Dependencies:** Phase 1 (world, regions); Phase 2 (gadget system for Time Machine if used).

---

## Phase 5: Story + Cinematics

**Goal:** Main story beats are playable: intro (Doraemon arrival, first flight), one mid-game beat (e.g. robot awakening), and one climax beat (e.g. sacrifice choice). Flags and triggers drive progression; simple cinematics (cutscene or scripted sequence).

**Tasks:**

- **5.1 Story flags and triggers:** Global flags (e.g. `met_doraemon`, `act1_complete`, `robot_awakened`) and triggers (e.g. “on_enter_region”, “on_dialog_end”). Quest/script system can be minimal: event bus or simple script that checks flags and runs dialogue/cutscene.
- **5.2 Intro sequence:** Doraemon arrival (cutscene or scripted); first flight (Take-copter unlock + short flight). Set flags: `met_doraemon`, `first_flight_complete`. Dialogue system stub if needed (e.g. one-off lines or simple dialog tree).
- **5.3 Mid-game beat:** e.g. robot awakening. Trigger when player reaches location + flag; play sequence (bond, first cockpit); set `robot_awakened`, unlock mecha. Reuse Phase 3 mecha entry.
- **5.4 Climax beat:** e.g. sacrifice choice (give robot energy to Doraemon vs keep for fight). Dialogue or UI choice; set `final_sacrifice_choice`. Branch can affect ending later; for Phase 5, only record choice and play one short follow-up.
- **5.5 Side quest stub:** At least one side quest type (e.g. “gadget trial” or “character episode”). Quest has objectives and completion flag; reward (e.g. gadget unlock or lore). Pattern for adding more quests via config.
- **5.6 Ending branches (stub):** Define ending IDs (e.g. true, rebel, legacy). Map flags (`trust_level`, `mecha_bond_level`, `final_sacrifice_choice`, etc.) to ending ID. Play one short ending sequence per branch; full cinematics later.

**Exit criteria:** Intro, one mid-game beat, and one climax choice are playable; flags and triggers drive them; at least one side quest exists; ending branch is determined by flags and one sequence plays.

**Dependencies:** Phases 1–4 (world, gadgets, mecha, time travel); dialogue/cutscene pipeline (minimal).

---

## Phase 6: World Expansion (Optional)

**Goal:** Add underground, space, and dimensions as additional layers. Reuse same movement and systems; new data (entrances, space locations, dimension IDs) and loading rules.

**Tasks:**

- **6.1 Underground:** Implement `Entrance`, `UndergroundZone`, surfacePositionMap. When player triggers entrance, load underground scene/region; exit returns to surface position. At least one underground zone.
- **6.2 Space:** Implement `SpaceLocation` (planet, station, orbit). Transit from Earth (e.g. rocket gadget or launch sequence); load space region. Gravity and movement rules for space (e.g. zero-g or planet surface). At least one planet or station.
- **6.3 Dimensions:** Implement `Dimension`, `currentDimensionId`. Same coordinates, different dimension = different scene variant or asset set. Switch dimension via trigger or gadget; update state and reload appropriate assets.
- **6.4 Streaming (full):** If not done earlier: load/unload regions by proximity or explicit trigger; support cross-layer travel (earth ↔ underground ↔ space ↔ dimension).

**Exit criteria:** Player can enter underground, travel to space, and switch dimensions; state and loading are correct per layer; streaming supports all layer types.

**Dependencies:** Phases 1–4; optional Phase 5 for story-gated areas.

---

## Phase 7: Polish and Content

**Goal:** More gadgets, side quests, lore, and hidden endings. Balance and feel. No new systems—content and tuning.

**Tasks:**

- **7.1 Gadget expansion:** Add Small Light, Pass Loop, Copying Toast, and others from design. Each: config + behavior; integrate with inventory and cooldowns.
- **7.2 Side quests and lore:** Add gadget trials, character episodes, and lore collectibles. Codex or log for lore; optional dialogue changes based on lore found.
- **7.3 Hidden endings:** Implement conditions for True, Rebel, Legacy endings. Full ending sequences and any post-credits content.
- **7.4 Balance and feel:** Tune movement, combat, cooldowns, and difficulty. Playtest and iterate.
- **7.5 Audio and visual polish:** Music, SFX, and visual effects for key moments (first flight, robot awakening, goodbye). Optional.

**Exit criteria:** All planned gadgets and side content are in; hidden endings are reachable; game feels complete and emotionally coherent.

**Dependencies:** Phases 1–5 (and 6 if included).

---

## Summary Table

| Phase | Focus              | Key deliverables                          | Deps   |
|-------|--------------------|-------------------------------------------|--------|
| 1     | World + movement   | Player, camera, one region, region data   | None   |
| 2     | Gadgets            | Inventory, cooldowns, Take-copter, Door   | 1      |
| 3     | Mecha              | Board/disembark, control, bond, upgrades  | 1      |
| 4     | Time travel        | Era switch, per-era state, cause/effect   | 1, 2   |
| 5     | Story + cinematics | Intro, mid-game, climax choice, endings   | 1–4    |
| 6     | World expansion    | Underground, space, dimensions, streaming | 1–4    |
| 7     | Polish + content   | More gadgets, quests, lore, endings       | 1–5(6) |

---

*This roadmap is engine-agnostic. When implementing, map “scene”, “region”, “entity” to the chosen runtime/engine and keep game logic in data and code that does not depend on engine-specific APIs.*
