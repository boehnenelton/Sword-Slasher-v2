# Sword Slasher RPG: Shadow Link's Awakening - Python/Flask Parity Engine & Compiler

Author: **Elton Boehnen** · boehnenelton2024@gmail.com  
BEJSON Format: **104a / 105** (Integrity Era v2.0.0-105)  
Release Version: **300**  

---

## Complete Offline Package Layout
```text
Gaming/PY/
├── app.py                     # Main Flask web app & game engine server
├── compiler.py                # Single-file BEJSON 105 dataset compiler & bundler
├── data_chunker.py            # CLI tool for native BEJSON MFDB chunk containers
├── config.json                # Engine path configuration settings
├── requirements.txt           # Python dependencies (flask, flask-cors)
└── data/
    ├── raw/                   # All 20 raw BEJSON data matrix files (.bejson)
    ├── lib/                   # Python BEJSON libraries
    └── compiled/              # Target compiled output directory
        ├── compiled_game_bundle.105.bejson        # Pre-compiled single-file dataset bundle
        └── Chunked_Engine_Data.104a.bejson.txt    # Pre-compiled native MFDB chunk container
```

---

## Quick Start (Offline Setup)

1. **Install Python Dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run the Data Compiler**:
```bash
python3 compiler.py
```

3. **Start the Flask Engine Web Server**:
```bash
python3 app.py
```
Open your browser and navigate to `http://127.0.0.1:5000` to run the offline game engine!

---

## CLI Data Chunker (MFDB Manifest Container)
To create or inspect native BEJSON 104a MFDB chunk containers:
```bash
# Serialize raw datasets into a single flat .104a.bejson.txt chunk container
python3 data_chunker.py --chunk data/raw

# View manifest header info and field map cache
python3 data_chunker.py --info data/compiled/Chunked_Engine_Data.104a.bejson.txt
```
