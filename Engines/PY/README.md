# Engines/PY — Flask Parity Engine

Isolated Python/Flask runtime for Sword Slasher RPG. Driven only by `Engines/PY/config.json`; reads the shared BEJSON data in root `game_data/raw/`. No React/JS dependency.

## Layout (project root)
```
Engines/
  JS/                      Vanilla JS engine   (config.json -> ../../game_data/raw)
  PY/                      This engine         (config.json -> ../../game_data/raw)
  Experimental/
    Compiler/              Compile.py, data_chunker.py, config.json
    Compiled/              compiled_game_bundle.105.bejson, standalone-game.html, Chunked_Engine_Data.104a.bejson.txt
game_data/raw/             Source-of-truth BEJSON 105 datasets
```

## Run
```
pip install -r Engines/PY/requirements.txt
python3 Engines/Experimental/Compiler/Compile.py --batch   # build bundle + standalone-game.html
python3 Engines/PY/app.py                                  # serve on flask_host:flask_port
```
`app.py` auto-invokes the compiler if the bundle is missing.

## config.json keys
`compiler_path`, `raw_data_path`, `compiled_data_path`, `target_compiled_filename`, `flask_host`, `flask_port` — all relative to `Engines/PY/`.

Author: Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
