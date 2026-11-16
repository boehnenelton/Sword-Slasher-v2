# dev/dead_code.md - Verified Dead / Removed Code

## 2026-11-12 (V1.0.52 / PKG152) - Engine location restructure
- `Gaming/PY/` tree removed after relocation to `Engines/` (engine/, compiler/ moved; data/ and game_data/ placeholders dropped).
- `Gaming/PY/data/{raw,lib}/.gitkeep`, `Gaming/PY/data/compiled/.gitkeep`: empty placeholders, obsolete (raw now at root `game_data/raw`).
- `Gaming/PY/data/compiled/compiled_game_bundle.105.bejson` (93,663 B): stale vs raw data; replaced by regenerated bundle in `Engines/Experimental/Compiled/`.
- `Gaming/PY/README.md`, `Gaming/PY/engine/README.md`: superseded by `Engines/PY/README.md`.
- `__pycache__/` directories under the old compiler/engine folders.
