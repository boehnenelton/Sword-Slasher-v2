.




# AGENTS.md - Sword Slasher 2
/storage/emulated/0/GameEngines/Shadow_Link_Awakening

## CURRENT ISSUES
- Experimental engines input 

## CURRENT INSTRUCTONS
**Task 1**
- Fix the Flask launcher and then put the engine in hold. Ignore Flask for now.

**Task 2**

Focus on getting the full experimental version to render the map, run playwright tests and capture images, save to root/Images/Experimental_Engine.
Debug any issues found.

**Task 3**
Run playwright tests and capture images, save to root/Images/JS_Emgine
Debug any issues found.


## Core Mandate
Game engines are and must remain as simulation runtime engines essentially. Source code (.ts / .js / .py libraries) and BEJSON data tables (.bejson / .json data files) MUST remain strictly separate until if and when compilation occurs. All game data itself must remain within the contents of the BEJSON files. The engine must know nothing of the game itself; it only runs the data that is given to it which makes up the game.
Engines must practice strict concern separation and utilize external libraries, with the exclusion of the single-file JavaScript experimental engine.
##URGENT CORRECTIONS & PATH ARCHITECTURE
Top priority — do not move forward until both parts are completed.
## Part 1: 
-Engine Path & Directory Migration
To promote a consistent workflow signaling priority and hierarchy, engine implementations must be isolated into dedicated subdirectories within the React project root. Both JS and PY engines must migrate immediately and utilize their own configuration files routing back to the shared root data files.
/react-project-root/
├── Engines/
│   ├── JS/                 # Vanilla JS Parity Engine
│   │   ├── config.json     # Routes relative paths to root game_data
│   │   └── ...
│   ├── PY/                 # Python/Flask Parity Engine
│   │   ├── config.json     # Routes relative paths to root game_data
│   │   └── ...
│   └── Experimental/       # Experimental Standalone Packages
│       ├── Compiler/
│       │   └── Compile.py  # Compiles single-file engine and injects MFDB 132 data
│       └── Compiled/
│           └── standalone-game.html
├── game_data/
│   └── raw/                # 100% Decoupled BEJSON schemas & tables (Source of Truth)
├── public/
│   └── data/               # React client accessible data
└── src/                    # TypeScript React Engine & Client

Part 2: JS Engine Parity & Viewport Camera Fixes
The Vanilla JS parity engine is currently failing rendering and camera parity with the TypeScript client. These must be corrected immediately to reflect the TS version's behavior while strictly pulling from the decoupled BEJSON settings:
 * Viewport & Camera Lock Bug: The Vanilla JS version currently renders the viewport zoomed entirely out, displaying the full map with a statically locked camera. This must be corrected to achieve 1:1 parity with the TS React version: the JS viewport must enforce the exact same localized zoom level, and the camera must dynamically center on and track the player entity as it moves across the map.
 * Map Tile Graph Loading Bug: The map tile graphs are experiencing a "folding load" error in the JS version. The spatial grid chunk management and tile matrix palette resolution (lib_bejson_gamingss2_engine_map) in the JS engine must be strictly synchronized with the TS engine to ensure seamless tile loading without visual folding, culling errors, or tearing as the camera tracks the player.
Primary Objective: Sword Slasher 2 (SS2)
The ULTIMATE PROJECT GOAL is to build and maintain Sword Slasher 2, driven by an absolute separation of concerns discipline. All game data exists strictly as pure-data BEJSON schemas, completely decoupled from the simulation engine. The engine knows nothing about the specific game content itself—it strictly ingests and executes BEJSON game data matrices.
Core Architectural Intent & Separation of Concerns
 * 100% Decoupled BEJSON Game Data:
   * All game physics parameters, tile maps, actor archetypes, player stats, items, inventory rules, dialogue trees, events, quests, animations, SVG/Base64 image assets, audio specs, and settings reside strictly in BEJSON tables inside game_data/raw/ (or /public/data/).
   * Zero hardcoded game stats, level coordinates, or item attributes in React, TypeScript, JavaScript, or Python engine code.
 * Modular Extension Library Family (lib_bejson_gamingss2_engine):
   * The simulation engine practices strict separation of concerns, powered by specialized domain libraries in the lib_bejson_gamingss2_engine family:
     * lib_bejson_gamingss2_engine_core: Engine initialization, loop tick calibration, and data binding.
     * lib_bejson_gamingss2_engine_physics: 2D AABB bounding box collision, swept rigid body physics, and knockback vector impulse decay.
     * lib_bejson_gamingss2_engine_map: Spatial grid chunk management, tile matrix palette resolution, and frustum culling.
     * lib_bejson_gamingss2_engine_input: Touch joystick, virtual action deck, and keyboard/gamepad binding.
     * lib_bejson_gamingss2_engine_state: Level state transitions, portal teleports, and actor lifecycle management.
     * lib_bejson_gamingss2_engine_hud: In-canvas HUD rendering, heart containers, magic meter, and active item slots.
     * lib_bejson_gamingss2_engine_menu: Full-screen system menus, compiler dialogs, and settings persistence.
     * lib_bejson_gamingss2_engine_settings: Config parameters, local storage bindings, and external key security rules.
     * lib_bejson_gamingss2_engine_intro: Retro Web Audio synth intro music and cutscene playback.
     * lib_bejson_gamingss2_engine_items: Dropped pickup items, rupees, heart drops, and breakable prop interactions.
     * lib_bejson_gamingss2_engine_inventory: Equipment slots, weapons, shields, and item usage logic.
     * lib_bejson_gamingss2_engine_dialog: Dialogue event buses, typewriter rendering, and decision trees.
     * lib_bejson_gamingss2_engine_events: Game event bus dispatcher and level trigger handlers.
     * lib_bejson_gamingss2_engine_effects: Screen shake, directional color flashes, and hit particle bursts.
     * lib_bejson_gamingss2_engine_quests: Quest progress trackers and dark prophecy milestones.
     * lib_bejson_gamingss2_engine_player: Shadow Link player entity physics, sword slash arcs, and spin attack charging.
     * lib_bejson_gamingss2_engine_animations: 4-directional walking cycles, equipment attachment transforms, and 2.5D layer ordering.
TYPESCRIPT REACT ENGINE
The React client residing in the project root src/ must operate as a strict client runtime for the TypeScript engine variant, ingesting the exact same BEJSON game data files housed in game_data/raw/ (or copied to /public/data/ for the web client).
VANILLA JAVASCRIPT ENGINE
 * Location: Engines/JS/
 * The exported parity Vanilla JS engine package must utilize a configuration file (Engines/JS/config.json) that points directly to the same game data the TypeScript game uses within the React client.
 * Exported Portable Packages: Exported JS versions should have those data files copied to a subfolder with the configuration file pointed relatively to the engine for standalone offline execution. Users must be able to download a Vanilla_JS_Game_Package.zip containing the Vanilla JS parity engine, alongside the exact data copied from the shared root.
 * Library Parity: The engine launcher for the JS version must contain parity libraries for its engine. Both the TS and JS engines must remain in semantic and functional parity, sharing and bridged strictly by the BEJSON asset files.
Experimental Standalone Engine
 * Location: Engines/Experimental/
 * An experimental standalone JS engine must be compiled where data files are chunked into an MFDB 132 package and injected directly into the standalone client.
 * The Engines/Experimental/Compiler/Compile.py script targets the game data and engine logic to produce a single-file runnable HTML game (Engines/Experimental/Compiled/standalone-game.html), equipped with an embedded JS engine ready to ingest the data offline.
Python/Flask
 * Location: Engines/PY/
 * Role: Should maintain a Flask-based mirror and parity the engine just the same as the JS engine until stated otherwise.
 * It is driven by its own Engines/PY/config.json file routing strictly to the root game_data/raw/ data files, completely isolated from React/JS logic.
Gamepad Deck Layout Rules
 * Touch joystick and action buttons positioned low in the viewport layout for optimal ergonomics.
 * SELECT and START pill buttons are shrunk slightly and stacked vertically in the center column.
 * Text labels below joystick and action deck are removed (unnecessary clutter).
 * Action buttons (X, Y, B, A) in the diamond cluster are enlarged for crisp touch precision.
App Layer Roadmap
 * 3-Tab Application Meta-UI:
   * Tab 1: About (Account & JS Parity Engine)
   * Tab 2: Change Log
   * Tab 3: Assets (BEJSON Schemas & Exports)
 * Gemini API Studio Key default with external key toggle checkbox [ ] Enable External Custom Keys.
Library Integration & Parity Engine Mandates
 * Core JS & TS Library Integration: On reception, the codebase strictly integrates the Core TypeScript and JavaScript BEJSON library suites (src/lib/lib_bejson_Core_bejson_core.ts, src/lib/lib_bejson_Core_bejson_errors.ts) alongside their 1:1 JavaScript mirrors mapped to their respective engine environments.
 * SS2 Extension Library Family: All client variants and engines strictly utilize the lib_bejson_gamingss2_engine library family.
 * Field Map Cache Mandate: All BEJSON data lookups MUST use O(1) field map caching (colIdx mapped by column string key) with boundary-layer whitespace sanitization. Positional integer array indexing is strictly forbidden.
Technical & Policy Standards
 * BEJSON 105 Schema v2.0.0-105 format.
 * Release_Version 300 header annotations on all library files.
 * Tri-Color Palette: Pure Black (#000000), Pure White (#FFFFFF), Vivid Red (#DE2626) — no black font on red backgrounds.
 * All scripts must operate portably and relatively from their own $SCRIPT_PATH, never relying on hardcoded paths.
