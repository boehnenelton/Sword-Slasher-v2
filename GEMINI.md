# GEMINI.md - Engine Architecture & Core Library Mandates

## Core BEJSON Libraries Immutability Policy
1. **Core Libraries are Strictly Immutable**:
   - The official Core BEJSON libraries located in `src/lib/` (`lib_bejson_Core_bejson_core.ts`, `lib_bejson_Core_bejson_errors.ts`) and `src/lib/lib_js/` (`lib_bejson_Core_*.js` / `src/lib/lib_js/Core/*`) are frozen core infrastructure.
   - **DO NOT ALTER OR MODIFY CORE LIBRARIES DIRECTLY UNDER ANY CIRCUMSTANCES**.
   - If an edge-case bug occurs, implement workarounds at the application or domain extension layer (`lib_bejson_Gaming_*`), or log details to `dev/lib_bugs.md`.

2. **Core Library Suite Integration**:
   - TypeScript Core: `src/lib/lib_bejson_Core_bejson_core.ts`, `src/lib/lib_bejson_Core_bejson_errors.ts`.
   - JavaScript Core Mirror: `src/lib/lib_js/Core/` containing `lib_bejson_Core_bejson_core.js`, `lib_bejson_Core_bejson_bejson.js`, `lib_bejson_Core_bejson_chunking.js`, `lib_bejson_Core_bejson_core_nesting.js`, `lib_bejson_Core_bejson_errors.js`, `lib_bejson_Core_bejson_parse.js`, `lib_bejson_Core_bejson_schema.js`, `lib_bejson_Core_bejson_secure_zip.js`, `lib_bejson_Core_bejson_state.js`, `lib_bejson_Core_bejson_validator.js`, `lib_bejson_Core_mfdb_core.js`, and `lib_bejson_Core_mfdb_validator.js`.

3. **Domain Family Integration**:
   - The game engine uses the `lib_bejson_Gaming_` family (`lib_bejson_Gaming_engine.ts`, `lib_bejson_Gaming_bejson_errors.ts`, `lib_bejson_Gaming_shadow_engine.ts`, `lib_bejson_Gaming_projectile_physics.ts`, `lib_bejson_Gaming_gamepad_controller.ts`) and its 1:1 JS mirrors in `src/lib/lib_js/`.

4. **Data Integrity & Field Map Cache Mandate**:
   - All record reads and writes MUST use $O(1)$ field map caching (`colIdx` mapped by column string key) with boundary-layer whitespace sanitization.
   - Positional integer array indexing is strictly prohibited.
   - Zero hardcoded game stats, maps, or actor physics in React code—all game structures are loaded from BEJSON 105 data matrices.

5. **Vanilla JavaScript Parity Engine**:
   - A complete 1:1 vanilla JavaScript application is maintained in `/js/` resolving libraries from `src/lib/lib_js/`.
   - The About/Meta-UI tab allows downloading the full required JS Parity Engine and Core JS library suite.
