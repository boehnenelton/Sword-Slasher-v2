# dev/dead_code.md - Verified Dead / Removed Code

## 2026-11-12 (V1.0.52 / PKG152) - Engine location restructure
- `Gaming/PY/` tree removed after relocation to `Engines/` (engine/, compiler/ moved; data/ and game_data/ placeholders dropped).
- `Gaming/PY/data/{raw,lib}/.gitkeep`, `Gaming/PY/data/compiled/.gitkeep`: empty placeholders, obsolete (raw now at root `game_data/raw`).
- `Gaming/PY/data/compiled/compiled_game_bundle.105.bejson` (93,663 B): stale vs raw data; replaced by regenerated bundle in `Engines/Experimental/Compiled/`.
- `Gaming/PY/README.md`, `Gaming/PY/engine/README.md`: superseded by `Engines/PY/README.md`.
- `__pycache__/` directories under the old compiler/engine folders.

## 2026-11-13 (V1.0.53 / PKG153)
- `Images/JS_Emgine/` (12 PNGs): byte-identical duplicate of `Images/JS_Engine/` created from a typo in AGENTS.md Task 3; removed.
- `Engines/PY/__pycache__/`: shipped bytecode; removed and now git-ignored.

## 2026-11-13 (V1.0.54 / PKG154)
- `public/js/` (index.html, main.js, lib/): stale pre-restructure copy of the Vanilla JS engine; no references anywhere in src/, server.ts or configs. Superseded by `Engines/JS/`. Removed.
- `Compile.py` `os.system` chunker invocation: replaced by `subprocess.run([sys.executable, ...])`.

## 2026-11-15 (V1.0.55 / PKG155)
- Not dead, relocated: `BejsonCoreEngine` + `bejsonCore` block (about 52 lines) removed from top-level `src/lib/lib_js/lib_bejson_Core_bejson_core.js`; now lives in `lib_bejson_Gaming_core_adapter.js`.

## 2026-11-21 (V1.0.56 / PKG156) - Dead code / dead data cleanup
Verified by grep across src/, server.ts, Engines/, configs and docs (zero references), and by `tsc --noEmit` + `vite build` before/after.
- `public/assets/aistudio/` (10 files, 6,914,534 B): `32bit_Adventure_Remix-V1.0.0-PKG100_*.zip`, `Core_*.zip`, `Lib_JS_*.zip`, `Lib_TS_*.zip`, 5 `Screenshot_20261025_*.jpg`, `Sword_Slasher_Bejson_105_Direct_Translation__1__*.md`. AI Studio upload leftovers, never fetched or imported. Removed (directory `public/assets/` is now empty and gone).
- `src/components/GameHUD.tsx`, `src/components/HorizToolbar.tsx`: orphan components, no import or JSX use anywhere (App.tsx never mounted them). Removed.
- Unused imports removed: `App.tsx` (React default), `FlaskSystemModal.tsx` (Code2, Check), `GamepadDeck.tsx` (useEffect), `IntroStartScreen.tsx` (Sparkles, ToggleLeft, ToggleRight), `MetaUIModal.tsx` (ExternalLink, Cpu, Sparkles), `SubScreenOverlay.tsx` (Sword, Shield, Sparkles, Layers).
- `FlaskSystemModal.tsx`: dead state `bundleSize` / `chunkDocSize` (set, never read) removed with their setter calls and the `jsonStr` temp that only fed them.
- `physicsEngine.ts`: unused private fields `boxPoolA` / `boxPoolB` and their stale comment removed.

### Flagged, NOT removed (needs your decision)
- Unreferenced Gaming SS2 library files (frozen-library policy, only named in AGENTS.md/GEMINI.md prose): `src/lib/lib_bejson_gamingss2_engine_{animations,dialog,effects,events,hud,inventory,items,menu,player,quests,settings,state}.ts`.
- Known duplicate: 12 top-level `src/lib/lib_js/lib_bejson_Core_*.js` copies of `lib_js/Core/` (already an open item in AGENTS.md).
- Unused destructured props/params (public component API, left as-is): `IntroStartScreen` `onOpenJsParity` + `onOpenFlaskSystem`, `MetaUIModal` `onOpenJsParity`, `GamepadDeck.tsx:277` param `e`, `server.ts:113` param `req`.
- Kept as live: `public/data/**` (fetched at runtime), `game_data/raw/**` (compiler/engines input, MFDB), `public/config/**`, `Engines/Experimental/Compiled/**` (generated artifacts), `Images/**` (test screenshots), `bun.lock`.

