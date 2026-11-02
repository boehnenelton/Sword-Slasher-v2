# Sword Slasher RPG: Shadow Link's Awakening - Flask Parity Engine & Compiler

## Folder Architecture
- `engine/`: Python Flask web application server (`app.py`, `requirements.txt`).
- `game_data/`:
  - `raw/`: Raw BEJSON 105 data matrix files.
  - `compiled/`: Compiled BEJSON dataset bundle (`compiled_game_bundle.105.bejson`) and single-file HTML executable (`standalone_game.html`).
- `compiler/`: Interactive compiler CLI menu (`compiler.py`), BEJSON chunker (`data_chunker.py`), and persistent configuration (`config.json`).

## Quickstart Instructions
1. Install dependencies:
   ```bash
   pip install -r engine/requirements.txt
   ```
2. Run compiler menu or batch compiler:
   ```bash
   python3 compiler/compiler.py
   ```
3. Run Flask Engine web server:
   ```bash
   python3 engine/app.py
   ```
4. Play single-file HTML standalone game directly in browser offline:
   Open `game_data/compiled/standalone_game.html`.
