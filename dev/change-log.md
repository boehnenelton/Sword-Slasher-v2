# dev/change-log.md - Revision History

## [2.0.0-105 / Package 137] - 2026-11-02
- Decoupled all sound effect and BGM specs into BEJSON 105 frequency matrices (`audio_manifest.105a.bejson`).
- Defined explicit SFX frequency data types in BEJSON: `aud_waveform_type` (`sawtooth`, `square`, `triangle`, `sine`, `noise`), `aud_start_freq_hz`, `aud_end_freq_hz`, `aud_frequency_ramp_type`, `aud_filter_type`, `aud_filter_cutoff_hz`, `aud_filter_q_factor`, and `aud_note_sequence_json`.
- Updated `SoundEngine.ts` to ingest BEJSON sound frequency tables via $O(1)$ Field Map Cache with boundary-layer whitespace sanitization.
- Updated `bejson_project.json` versioning ledger to Version 1.0.37 / Package 137.

## [2.0.0-105 / Package 136] - 2026-11-02
- Refined, optimized, hardened, and remediated the Web Audio synthesis engine (`soundEngine.ts`).
- Pre-generated a 1-second white noise buffer for procedural retro sound effects:
  - `playPotBreakSFX()`: Bandpass noise filter crunch.
  - `playBushCutSFX()`: Highpass noise leaf rustle.
  - `playEnemyDeathSFX()`: Disintegration noise burst with descending tone.
  - `playPlayerHurtSFX()`: Punchy thud with low frequency drop.
  - `playHeartPickupSFX()`: Classic Zelda dual-note heart chime (E5 -> G5).
  - `playRupeePickupSFX()`: Dual-note rupee chime (B5 -> E6).
  - `playBoomerangSFX()`: Pitch-modulated whirring boomerang rotation SFX.
  - `startChargeSFX()` / `stopChargeSFX()`: Looping rising energy hum while holding B button.
- Hardened Web Audio context initialization against browser autoplay restriction policies with automatic click/keydown/touch event unlocks.
- Added Master, Music, and SFX volume controls with persistent `localStorage` saving.
- Updated `GameViewport.tsx` to trigger specific sound effects across all gameplay events.
- Updated `bejson_project.json` versioning ledger to Version 1.0.36 / Package 136.

## [2.0.0-105 / Package 135] - 2026-11-02
- Refactored System Menu Tab 2 (`2. AI Architect`) in `FlaskSystemModal.tsx` into a sleek single-column chat client window.
- Removed left-hand side panel ("INGESTED GAME CONTEXT" & vertical preset button stack).
- Added top-docked control bar featuring a Preset Prompt Combo Box dropdown (`<select>`), a **Send Preset** button, model selector dropdown, and real-time status indicator badge.
- Maintained minimal padding and zero-fluff layout discipline.
- Updated `bejson_project.json` versioning ledger to Version 1.0.35 / Package 135.

## [2.0.0-105 / Package 134] - 2026-11-02
- Completely removed `LAUNCH AI ARCHITECT ADVISOR` buttons from the title screen (`IntroStartScreen.tsx`) and Meta-UI modal (`MetaUIModal.tsx`).
- Made the **AI Architect** accessible strictly via the **System Menu** (`FlaskSystemModal.tsx` Tab 2).
- Redesigned the System Menu Switch on `IntroStartScreen.tsx` with a clean RED (`OFF`) / GREEN (`ON`) LED status light indicator.
- Updated `bejson_project.json` versioning ledger to Version 1.0.34 / Package 134.

## [2.0.0-105 / Package 133] - 2026-11-02
- Stripped paragraph descriptions from the downloads section in `FlaskSystemModal.tsx`.
- Refactored downloads into an ultra-compact, high-density 3-column list with direct single-click `Get` action buttons.
- Updated `bejson_project.json` versioning ledger to Version 1.0.33 / Package 133.

## [2.0.0-105 / Package 132] - 2026-11-02
- Streamlined System Menu (`FlaskSystemModal.tsx`) header title strictly to **SYSTEM MENU**.
- Renamed system tabs for minimal, purpose-driven clarity: `1. Compiler & Downloads`, `2. AI Architect`, `3. Options`.
- Refactored floating trigger button in `App.tsx` into a single, compact **SYSTEM MENU** button.
- Applied minimal padding and zero-fluff styling across system modal layouts.
- Updated `bejson_project.json` versioning ledger to Version 1.0.32 / Package 132.

## [2.0.0-105 / Package 131] - 2026-11-02
- Co-located the Gemini AI Engine & BEJSON Architect Advisor directly inside the System Menu (`FlaskSystemModal.tsx`) as Tab 2.
- Resolved overlay z-index conflicts and floating window clutter by replacing the separate floating AI Advisor button with a single, unified System Menu trigger.
- Added explicit Close controls to `FlaskSystemModal.tsx` (prominent `X` header button and `CLOSE SYSTEM MENU` footer action button).
- Updated `App.tsx` and `bejson_project.json` versioning ledger to Version 1.0.31 / Package 131.

## [2.0.0-105 / Package 130] - 2026-11-02
- Scaled Gamepad Deck (`GamepadDeck.tsx` & `standalone_game.html`):
  - Enlarged action buttons (X, Y, A, B) to `w-10 h-10` in a `w-32 h-32` cluster.
  - Stacked SELECT and START buttons vertically in the center column.
  - Removed text labels below touch joystick and action deck for a clean, uncluttered layout.
- Added full parity title/intro screen overlay in `standalone_game.html` ("SHADOW LINK", "START GAME" button) while strictly excluding system menu toggles or compiler options from the offline build.
- Updated `AGENTS.md` mandates with gamepad layout and standalone intro parity rules.
- Bumped `bejson_project.json` versioning ledger to Version 1.0.30 / Package 130.

## [2.0.0-105 / Package 129] - 2026-11-02
- Removed obsolete live parity tab/runner and implemented **Gemini AI Engine & BEJSON Architect Advisor** (`AiDebugAdvisorModal.tsx`).
- Created server-side Express API route `/api/gemini/advisor` in `server.ts` utilizing `@google/genai` with default model `gemini-3.6-flash`.
- Automatically embedded full codebase context in Gemini Advisor queries (BEJSON 105 data matrices, `lib_bejson_gamingss2_engine` TS & JS libraries, offline compiler targets).
- Refactored System Menu (`FlaskSystemModal.tsx`), Settings (`SettingsModal.tsx`), and Advisor into full-screen overlays with seamless, dark transparent borders (`border border-white/10`) and clean minimal padding.
- Updated `bejson_project.json` versioning ledger to Version 1.0.29 / Package 129.

## [2.0.0-105 / Package 128] - 2026-11-02
- Implemented **Sword Slasher 2 (SS2)** modular engine architecture transition:
  - Created 18 domain-specific extension libraries in `src/lib/` under the `lib_bejson_gamingss2_engine` family (`core`, `physics`, `map`, `input`, `state`, `hud`, `menu`, `settings`, `intro`, `items`, `inventory`, `dialog`, `events`, `effects`, `quests`, `player`, `animations`, `errors`).
  - Created 1:1 JavaScript mirror libraries in `src/lib/lib_js/` and `/public/js/lib/`.
  - Enforced full separation of concerns between raw BEJSON game datasets (`game_data/raw/`) and simulation engine code.
- Updated `AGENTS.md` mandates with SS2 goals, separation of concerns rules, and roadmap.
- Updated `bejson_project.json` versioning ledger to Version 1.0.28 / Package 128.

## [2.0.0-105 / Package 127] - 2026-11-02
- Structured the offline Python/Flask system and ZIP package into three dedicated top-level root folders:
  - `engine/`: Flask Web Engine & API Server (`app.py`, `requirements.txt`, `README.md`).
  - `game_data/`: Raw BEJSON tables (`game_data/raw/`) and compiled chunks (`game_data/compiled/`).
  - `compiler/`: Interactive compiler CLI menu (`compiler.py`), BEJSON chunker (`data_chunker.py`), and persistent configuration (`config.json`).
- Configured persistent relative pathing in `compiler/config.json` pointing to roots: `"engine_path": "../engine"`, `"game_data_path": "../game_data"`, `"raw_data_path": "../game_data/raw"`, `"compiled_data_path": "../game_data/compiled"`.
- Built interactive CLI menu in `compiler/compiler.py` with relative path resolutions.
- Synchronized client-side ZIP bundler in `src/components/FlaskSystemModal.tsx` (`handleDownloadCompleteFlaskZip`) to output `Sword_Slasher_RPG_Engine_And_Data_Package.zip` matching this 3-folder layout.
- Updated `bejson_project.json` versioning ledger to Version 1.0.27 / Package 127.

## [2.0.0-105 / Package 126] - 2026-11-02
- Synchronized the JavaScript standalone engine viewport and camera tracking 1:1 with the React engine (`zoomScale = 1.25` centered on player `px, py`).
- Populated `spr_image_source_data_uri` in `/public/data/sprites/sprites_manifest.105a.bejson` with inline SVG data URIs for all characters (`shadow_link_sheet`, `ganon_sheet`, `zelda_sheet`, `hermit_npc_sheet`, `slime_sheet`, `guard_sheet`).
- Updated `Gaming/PY/compiler.py` and `src/components/FlaskSystemModal.tsx` standalone HTML game engine templates to parse SVG sprite assets from the embedded BEJSON dataset chunk and execute centered camera tracking at 1.25x zoom scale.
- Updated `bejson_project.json` versioning ledger to Version 1.0.26 / Package 126.

## [2.0.0-105 / Package 125] - 2026-11-01
- Synchronized single-file HTML game export template in `src/components/FlaskSystemModal.tsx` (`handleDownloadStandaloneHtmlGame`) to match `Gaming/PY/compiler.py` 1:1.
- Embedded full Virtual Touch Gamepad Deck into `standalone_game.html`:
  - 360° Touch Analog Joystick with dynamic knob vector tracking and 8px deadzone filtering.
  - SELECT and START pill action buttons.
  - Action Deck cluster buttons (X: Sheathe/Unsheathe, Y: Throw Boomerang, B: Sword Slash / Whirling Blade Spin Attack, A: Pickup/Interact).
- Integrated complete engine replica features in single-file HTML executable:
  - 2.5D layer ordering (Shadow Link torso/head rendered *over* shield when facing UP so shield is mounted behind him; shield rendered in front when facing DOWN/LEFT/RIGHT).
  - Boomerang return & crush-through physics, dropped heart items, stateful enemy pursuit AI, hurt flashing, and vector knockback impulses.
- Updated `bejson_project.json` versioning ledger to Version 1.0.25 / Package 125.

## [2.0.0-105 / Package 124] - 2026-11-01
- Updated `AGENTS.md` with explicit architectural role mandates:
  - Declared Python/Flask (`Gaming/PY/`) as the **experimental testing engine and system** used to build, simulate, and verify game mechanics and BEJSON data tables during development.
  - Declared single-file HTML compilation (`standalone_game.html`) with injected BEJSON chunk payloads as the **ultimate deliverable target** for 100% offline, serverless browser execution.
- Updated `bejson_project.json` versioning ledger to Version 1.0.24 / Package 124.

## [2.0.0-105 / Package 123] - 2026-11-01
- Updated `AGENTS.md` Primary Objective section with the ultimate mandate:
  - Serialize and chunk all raw BEJSON 105 data matrices using the BEJSON chunker (`lib_bejson_Gaming_data_chunker` / `data_chunker.py`).
  - Inject the chunk directly into a pre-made templated JavaScript HTML game file (`standalone_game.html`).
  - Upon chunk injection, the entire **Sword Slasher RPG: Shadow Link's Awakening** simulation engine runs natively as a single self-contained offline runnable HTML file.
- Updated `bejson_project.json` versioning ledger to Version 1.0.23 / Package 123.

## [2.0.0-105 / Package 122] - 2026-11-01
- Streamlined `FlaskSystemModal.tsx` completely by consolidating multi-tab clutter into a clean, logical 2-Tab interface:
  - Tab 1: **Compiler & Consolidated Downloads List**
  - Tab 2: **Configuration & Paths**
- Added **Single-File HTML Game Compiler** capability (`standalone_game.html`): injects the JS game engine and BEJSON chunk dataset directly into a single, standalone `.html` file that can be saved and played directly in any browser offline!
- Updated Python compiler `Gaming/PY/compiler.py` to also build `standalone_game.html` alongside `compiled_game_bundle.105.bejson`.
- Consolidated all offline download options into a single, compact card list (HTML game, Full ZIP bundle, single-file BEJSON bundle, MFDB chunk text container, Python scripts, and raw data matrix tables).
- Updated `bejson_project.json` versioning ledger to Version 1.0.22 / Package 122.

## [2.0.0-105 / Package 121] - 2026-11-01
- Created standalone Python Flask web server app `Gaming/PY/app.py` for serving game endpoints, health checks, and compiled datasets offline.
- Created `Gaming/PY/requirements.txt` and `Gaming/PY/README.md` quickstart setup documentation.
- Integrated `JSZip` client bundling in `FlaskSystemModal.tsx` via `handleDownloadCompleteFlaskZip`.
- Added **"Download Full Package (.zip)"** header button and Tab action controls that dynamically generate a single, ready-to-run ZIP container (`Flask_Engine_And_BEJSON_Data_Package.zip`) containing:
  - `Gaming/PY/app.py`, `compiler.py`, `data_chunker.py`, `config.json`, `requirements.txt`, `README.md`
  - `Gaming/PY/data/compiled/compiled_game_bundle.105.bejson` (pre-compiled single-file dataset)
  - `Gaming/PY/data/compiled/Chunked_Engine_Data.104a.bejson.txt` (pre-compiled native MFDB chunk container)
  - All 20 raw BEJSON data matrix files inside `Gaming/PY/data/raw/`.
- Updated `bejson_project.json` versioning ledger to Version 1.0.21 / Package 121.

## [2.0.0-105 / Package 120] - 2026-11-01
- Optimized `FlaskSystemModal.tsx` vertical layout framing (`max-h-[88vh]` viewport container with inner `flex-1 overflow-y-auto` scrollable tab body).
- Added Tab 2 `Settings & Configuration` panel in `FlaskSystemModal.tsx` with browser `localStorage` persistence for Python `config.json` pathing parameters (`use_external_raw`, `use_external_raw_lib`, `use_external_compiled`), target compiled filename, Python interpreter, Flask port/host settings, and `[ ] Enable External Custom Keys` security rules.
- Synchronized settings state so that saving config in Tab 2 updates `localStorage.setItem('BEJSON_FLASK_CONFIG', ...)` and generates updated `config.json` downloads.
- Updated `bejson_project.json` versioning ledger to Version 1.0.20 / Package 120.

## [2.0.0-105 / Package 119] - 2026-11-01
- Created custom BEJSON native game engine data chunker library `lib_bejson_Gaming_data_chunker.ts` (`src/lib/lib_bejson_Gaming_data_chunker.ts`).
- Created 1:1 JavaScript mirrors in `src/lib/lib_js/lib_bejson_Gaming_data_chunker.js` and `/public/js/lib/lib_bejson_Gaming_data_chunker.js`.
- Implemented Python CLI tool `Gaming/PY/data_chunker.py` with Manifest MFDB metadata container capabilities, SHA-1 hash calculation, and $O(1)$ field map caching.
- Added Tab 5 `BEJSON MFDB Chunker` to `FlaskSystemModal.tsx` for browser-side chunk payload generation, container inspection, and direct downloads.
- Updated `bejson_project.json` versioning ledger to Version 1.0.19 / Package 119.

## [2.0.0-105 / Package 118] - 2026-11-01
- Verified directory structure `Gaming/PY/data/{compiled,raw,lib}` and executed `Gaming/PY/compiler.py` to generate compiled BEJSON dataset chunk `Gaming/PY/data/compiled/compiled_game_bundle.105.bejson`.
- Added a Flask Parity System Switch toggle on the Start Menu (`IntroStartScreen.tsx`).
- Implemented a floating action button on screen (with glowing outline, terminal badge, and animated icon) when the system switch is enabled.
- Built full-screen multi-tab dialog window `FlaskSystemModal.tsx` for running `Gaming/PY/compiler.py`, inspecting compiled bundle `compiled_game_bundle.105.bejson`, downloading `compiler.py` and `config.json`, downloading raw BEJSON data matrix tables, and reviewing the Python/Flask parity architecture specs.
- Updated `bejson_project.json` versioning ledger to Version 1.0.18 / Package 118.

## [2.0.0-105 / Package 117] - 2026-11-01
- Created dedicated Viewport family library `lib_bejson_Viewport_sprites.ts` (`src/lib/lib_bejson_Viewport_sprites.ts`) for 2.5D top-down 4-directional sprite perspective calculations.
- Solidified equipment mounting rules (`determineEquipmentLayer`), 4-directional hand/back attachment anchors (`calculateHandPositions`), and transform mapping (`calculateAttachmentTransform`).
- Created 1:1 JavaScript mirrors in `src/lib/lib_js/lib_bejson_Viewport_sprites.js` and `/public/js/lib/lib_bejson_Viewport_sprites.js`.
- Integrated `spritePerspectiveEngine` into `src/components/GameViewport.tsx` for dynamic equipment layer ordering.
- Updated `bejson_project.json` versioning ledger to Version 1.0.17 / Package 117.

## [2.0.0-105 / Package 116] - 2026-11-01
- Refactored player character rendering layer order so that when facing `UP` (looking away from the camera), the mounted/held shield is rendered *before* Shadow Link's body (boots, tunic, belt, cap, and head).
- Rendering Link's tunic and head over the shield when facing `UP` causes the player's torso to clip and overlay the shield, achieving perfect 2.5D depth perspective where the player body is in front of the camera and the shield is mounted/held behind him.
- When facing `DOWN`, the shield continues to render *after* the body, keeping it in front of Link's chest/hand.
- Synchronized layer ordering logic across React engine (`GameViewport.tsx`) and Vanilla JS Parity mirrors (`/public/js/main.js` & `/js/main.js`).
- Re-compiled single-file BEJSON dataset bundle (`python3 Gaming/PY/compiler.py`) and updated `bejson_project.json` versioning ledger to 1.0.16 / Package 116.

## [2.0.0-105 / Package 115] - 2026-11-01
- Implemented object collision bounding box physics for boomerangs (`checkBoomerangObjectCollisions`).
- Added schema flags and physics attributes in BEJSON `object_rules.105.bejson`: `rule_is_breakable_flag`, `rule_causes_boomerang_return_flag`, and `rule_boomerang_crush_through_flag`.
- Solid non-breakable objects (outer cavern walls, chests, solid obstacles) trigger an **early return** for boomerangs, reversing their trajectory instantly into homing return mode.
- Breakable objects (clay pots, dark bushes) allow boomerangs to **crush through** them without stopping, destroying the prop and spawning drops while maintaining outward trajectory.
- Updated `bejson_project.json` versioning ledger to 1.0.15 / Package 115 and re-compiled single-file dataset bundle via `Gaming/PY/compiler.py`.

## [2.0.0-105 / Package 114] - 2026-11-01
- Placed JavaScript Parity Engine on active hold and established Flask Parity Engine & Data Compilation Architecture in `AGENTS.md`.
- Created directory structure `Gaming/PY/` containing `config.json`, `compiler.py` (data chunker & single-file bundler), and `data/raw`, `data/lib`, `data/compiled` directories.
- Configured `config.json` with boolean flags (`use_external_raw`, `use_external_raw_lib`, `use_external_compiled`) defaulting to relative paths pointing to the React app's raw datasets (`../../public/data`) and libraries (`../../src/lib`).
- Verified `Gaming/PY/compiler.py` bundles all 20 raw BEJSON data tables into `/app/applet/Gaming/PY/data/compiled/compiled_game_bundle.105.bejson`.
- Updated `bejson_project.json` versioning ledger to 1.0.14 / Package 114.

## [2.0.0-105 / Package 113] - 2026-10-28
- Refined Obsidian Shield rendering logic for directional states across both React engine (`GameViewport.tsx`) and Vanilla JS Parity Engine mirrors (`/js/main.js` & `/public/js/main.js`).
- Facing UP & Sheathed: Shield is mounted on Shadow Link's back with the FRONT face (black body, white border, crimson crest) visible to the camera.
- Facing UP & Unsheathed: No shield drawn on back! Shield is held in left hand sticking out to the side with the solid black back texture, handle straps, and crimson central brace visible to the camera.
- Maintained crisp side-profile and front-view rendering in hand or sheathed.
- Updated `bejson_project.json` versioning ledger to 1.0.13 / Package 113.

## [2.0.0-105 / Package 112] - 2026-10-28
- Optimized Vanilla JS Parity Engine standalone runner (`/public/js/main.js`) with local library dependencies.
- Created standalone JS library mirror in `/public/js/lib/` to ensure the runner operates independently of the React source tree.
- Upgraded the Vanilla JS game loop with robust physics, Y-sorted rendering, enemy AI synchronization, and full BEJSON dataset loading.
- Fixed ES module export syntax in multiple JS mirror libraries to ensure browser compatibility.
- Added `lib_bejson_Gaming_physics_engine.js` mirror for parity with React physics logic.
- Updated `bejson_project.json` versioning ledger to 1.0.12 / Package 112.

## [2.0.0-105 / Package 111] - 2026-10-27
- Created `JsParityEngineModal.tsx` dedicated window/debugger for running and inspecting the client Vanilla JS Parity Engine (`/js/index.html` & `/js/main.js`).
- Added quick launch buttons in Start Screen (`IntroStartScreen.tsx`), Header Toolbar (`HorizToolbar.tsx`), Game HUD (`GameHUD.tsx`), and Meta-UI (`MetaUIModal.tsx`).
- Integrated live telemetry specs, reload/popout controls, and controls mapping inside the JS parity runner debugger window.
- Updated `bejson_project.json` versioning ledger to 1.0.11 / Package 111.

## [2.0.0-105 / Package 110] - 2026-10-27
- Updated `AGENTS.md` with explicit Engine and BEJSON Data Separation Mandates.
- Refactored Meta-UI Assets & About modals to present separate, unbundled downloads for Engine JS scripts (`lib_bejson_Gaming_engine.js`, Vanilla JS Parity HTML) and raw BEJSON data tables (`bejson_105_schemas_package_110.json`).
- Updated `bejson_project.json` versioning ledger to 1.0.10 / Package 110.

## [2.0.0-105 / Package 109] - 2026-10-27
- Unpacked and integrated official Core BEJSON JS libraries into `src/lib/lib_js/Core/` and `src/lib/lib_js/`.
- Enforced strict immutability mandates for all Core BEJSON libraries in `AGENTS.md` and `GEMINI.md`.
- Verified 1:1 JavaScript parity engine compatibility and download access in Meta-UI.

## [2.0.0-105 / Package 101] - 2026-10-25
- Upgraded Sword Slasher Engine JS to Integrity Era BEJSON 105 specification.
- Added 22 BEJSON 105 dataset files in `/public/data/` and `/public/config/`.
- Implemented Shadow Link dark action-RPG with top-down pixel canvas, 4-directional movement, sword slash, spin attack, dark dash.
- Created intro start screen with ominous retro Web Audio synth sound generator.
- Built cinematic opening cutscene where Shadow Link walks up to Ganon and receives Ganon's command to kidnap Princess Zelda.
- Added full levels: Ganon's Dark Sanctuary, Forgotten Cavern, Hyrule Castle Courtyard, Princess Zelda's Tower Chamber.
- Built 3-Tab Meta-UI (About/Account, Change Log, Reusable Assets Exporter).
- Added external Gemini API key toggle `[ ] Enable External Custom Keys`.
