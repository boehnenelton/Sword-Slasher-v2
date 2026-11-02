# AGENTS.md - Sword Slasher 2 Core Goals & Architectural Mandate

## Primary Objective: Sword Slasher 2 (SS2)
The **ULTIMATE PROJECT GOAL** is to build and maintain **Sword Slasher 2**, driven by an absolute separation of concerns discipline. All game data exists strictly as pure-data BEJSON schemas, completely decoupled from the simulation engine. The engine knows nothing about the specific game content itself—it strictly ingests and executes BEJSON game data matrices.

## Core Architectural Intent & Separation of Concerns
1. **100% Decoupled BEJSON Game Data**:
   - All game physics parameters, tile maps, actor archetypes, player stats, items, inventory rules, dialogue trees, events, quests, animations, SVG/Base64 image assets, audio specs, and settings reside strictly in BEJSON tables inside `game_data/raw/` (or `/public/data/`).
   - Zero hardcoded game stats, level coordinates, or item attributes in React or TypeScript engine code.
2. **Modular Extension Library Family (`lib_bejson_gamingss2_engine`)**:
   - The simulation engine practices strict separation of concerns, powered by specialized domain libraries in the `lib_bejson_gamingss2_engine` family:
     - `lib_bejson_gamingss2_engine_core`: Engine initialization, loop tick calibration, and data binding.
     - `lib_bejson_gamingss2_engine_physics`: 2D AABB bounding box collision, swept rigid body physics, and knockback vector impulse decay.
     - `lib_bejson_gamingss2_engine_map`: Spatial grid chunk management, tile matrix palette resolution, and frustum culling.
     - `lib_bejson_gamingss2_engine_input`: Touch joystick, virtual action deck, and keyboard/gamepad binding.
     - `lib_bejson_gamingss2_engine_state`: Level state transitions, portal teleports, and actor lifecycle management.
     - `lib_bejson_gamingss2_engine_hud`: In-canvas HUD rendering, heart containers, magic meter, and active item slots.
     - `lib_bejson_gamingss2_engine_menu`: Full-screen system menus, compiler dialogs, and settings persistence.
     - `lib_bejson_gamingss2_engine_settings`: Config parameters, local storage bindings, and external key security rules.
     - `lib_bejson_gamingss2_engine_intro`: Retro Web Audio synth intro music and cutscene playback.
     - `lib_bejson_gamingss2_engine_items`: Dropped pickup items, rupees, heart drops, and breakable prop interactions.
     - `lib_bejson_gamingss2_engine_inventory`: Equipment slots, weapons, shields, and item usage logic.
     - `lib_bejson_gamingss2_engine_dialog`: Dialogue event buses, typewriter rendering, and decision trees.
     - `lib_bejson_gamingss2_engine_events`: Game event bus dispatcher and level trigger handlers.
     - `lib_bejson_gamingss2_engine_effects`: Screen shake, directional color flashes, and hit particle bursts.
     - `lib_bejson_gamingss2_engine_quests`: Quest progress trackers and dark prophecy milestones.
     - `lib_bejson_gamingss2_engine_player`: Shadow Link player entity physics, sword slash arcs, and spin attack charging.
     - `lib_bejson_gamingss2_engine_animations`: 4-directional walking cycles, equipment attachment transforms, and 2.5D layer ordering.
     - `lib_bejson_gamingss2_engine_errors`: Centralized error codes registry (Range 400 - 450).
3. **Compiler, Single-File HTML Injection & Parity Intro Target**:
   - Raw data files in `game_data/raw/` are compiled by `compiler/compiler.py` into a single custom MFDB dataset bundle in `game_data/compiled/compiled_game_bundle.105.bejson`.
   - The compiled BEJSON dataset is injected directly into `standalone_game.html`, producing a single-file runnable HTML game equipped with embedded JS engine ready to ingest it offline.
   - **Standalone Intro Parity Rule**: The single-file compiled HTML game (`standalone_game.html`) must include a full parity intro/title screen ("SHADOW LINK - SWORD SLASHER RPG", "START GAME" trigger), but strictly EXCLUDE system menu switches, compiler buttons, or developer options from the offline build.
4. **Gamepad Deck Layout Rules**:
   - Touch joystick and action buttons positioned low in the viewport layout for optimal ergonomics.
   - SELECT and START pill buttons are shrunk slightly and stacked vertically in the center column.
   - Text labels below joystick and action deck are removed (unnecessary clutter).
   - Action buttons (X, Y, B, A) in the diamond cluster are enlarged for crisp touch precision.
5. **App Layer Roadmap**:
   - Focus on perfecting the modular simulation engine first. Once the engine is up to par, separate asset editor app layers (tilemap editor, sprite animator, audio synth designer) can be attached.

## Python/Flask Experimental Engine & Compilation Target
- **Python/Flask Role**: The Python/Flask server environment (`Gaming/PY/engine/`) serves strictly as the **experimental testing engine and development system** allowing real-time testing, data inspection, and simulation verification as the game is built.
- **Ultimate Compilation Target**: The ultimate deliverable is the standalone, single-file HTML game (`standalone_game.html`) where all BEJSON data chunks are injected directly into the pre-templated JavaScript game engine for 100% offline, serverless browser execution.

## Library Integration & Parity Engine Mandates
- **Core JS & TS Library Integration**: On reception, the codebase strictly integrates the Core TypeScript and JavaScript BEJSON library suites (`src/lib/lib_bejson_Core_bejson_core.ts`, `src/lib/lib_bejson_Core_bejson_errors.ts`) alongside their 1:1 JavaScript mirrors in `src/lib/lib_js/`.
- **SS2 Extension Library Family**: The client and engine strictly utilize the `lib_bejson_gamingss2_engine` library family.
- **Field Map Cache Mandate**: All BEJSON data lookups MUST use $O(1)$ field map caching (`colIdx` mapped by column string key) with boundary-layer whitespace sanitization. Positional integer array indexing is strictly forbidden.
- **Engine & BEJSON Data Separation Mandate**: Simulation engine source code (`.ts` / `.js` / `.py` libraries) and BEJSON data tables (`.bejson` / `.json` data files) MUST remain strictly separate files until loaded via runtime import or compilation.

## Technical & Policy Standards
- BEJSON 105 Schema v2.0.0-105 format.
- Release_Version 300 header annotations on all library files.
- Tri-Color Palette: Pure Black (#000000), Pure White (#FFFFFF), Vivid Red (#DE2626).
- 3-Tab Application Meta-UI: Tab 1: About (Account & JS Parity Engine), Tab 2: Change Log, Tab 3: Assets (BEJSON Schemas & Exports).
- Gemini API Studio Key default with external key toggle checkbox `[ ] Enable External Custom Keys`.


