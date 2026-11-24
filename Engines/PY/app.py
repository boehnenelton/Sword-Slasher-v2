"""
Library:         app.py
Family:          Flask Parity Engine Server
Module Purpose:  Standalone Flask Web Engine & API Server for Sword Slasher RPG (Shadow Link's Awakening)
Architecture:    Loads compiled BEJSON 105 data bundle (or auto-compiles on startup via ../Experimental/Compiler/Compile.py)
Version:         1.2.2
Release_Version: 300
Date:            2026-11-12
Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
Format_Creator:  Elton Boehnen
RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
"""

import os
import json
import sys
import logging
from flask import Flask, jsonify, request, send_from_directory, render_template_string

ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
log = logging.getLogger("ss2.engine")
CONFIG_PATH = os.path.join(ENGINE_DIR, "config.json")


def _read_config_file():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            log.error(f"Error reading Engines/PY/config.json: {e}")
    return {}


_CFG = _read_config_file()
COMPILER_DIR = os.path.abspath(os.path.join(ENGINE_DIR, _CFG.get("compiler_path", "../Experimental/Compiler")))
GAME_DATA_DIR = os.path.abspath(os.path.join(ENGINE_DIR, "../../game_data"))

sys.path.append(COMPILER_DIR)

try:
    import Compile as compiler
except ImportError:
    compiler = None

app = Flask(__name__)

CURRENT_DEBUG_ROOM = "debug_chamber"
ACTIVE_Y_ITEM = "shadow_boomerang"

DEBUG_ROOMS = [
    {"slug": "debug_chamber", "title": "Debug Item & Feature Test Chamber", "size": "64x64", "type": "SAFE_HUB"},
    {"slug": "ganon_sanctuary", "title": "Ganon's Dark Sanctuary", "size": "64x64", "type": "BOSS_ARENA"},
    {"slug": "forgotten_cavern", "title": "Forgotten Dark Cavern - Level 1", "size": "96x96", "type": "CAVERN_DUNGEON"},
    {"slug": "castle_courtyard", "title": "Hyrule Castle Courtyard - Level 2", "size": "96x96", "type": "OVERWORLD_FIELD"}
]

Y_ITEMS = [
    {"id": "shadow_boomerang", "name": "Shadow Boomerang", "icon": "🪃", "description": "Homing boomerang that returns to Shadow Link."},
    {"id": "dark_bow", "name": "Dark Bow & Arrows", "icon": "🏹", "description": "Fires shadow piercing arrows across distances."}
]

BIOMES = [
    {"id": "dark_grass", "name": "Dark Hyrule Grassland", "color": "#14532d", "bg": "#052e16"},
    {"id": "sanctuary_obsidian", "name": "Ganon Obsidian Sanctuary", "color": "#1e1b4b", "bg": "#020617"},
    {"id": "subterranean_cave", "name": "Deep Subterranean Cave", "color": "#334155", "bg": "#0f172a"},
    {"id": "desert_sand", "name": "Gerudo Dark Sands", "color": "#78350f", "bg": "#451a03"}
]

def get_config():
    cfg = _read_config_file()
    if cfg:
        return cfg
    return {
        "engine_path": ".",
        "compiler_path": "../Experimental/Compiler",
        "raw_data_path": "../../game_data/raw",
        "compiled_data_path": "../Experimental/Compiled",
        "target_compiled_filename": "compiled_game_bundle.105.bejson",
        "flask_host": "127.0.0.1",
        "flask_port": 5000
    }

def get_compiled_bundle_path():
    cfg = get_config()
    target_filename = cfg.get("target_compiled_filename", "compiled_game_bundle.105.bejson")
    compiled_dir = os.path.abspath(os.path.join(ENGINE_DIR, cfg.get("compiled_data_path", "../Experimental/Compiled")))
    return os.path.join(compiled_dir, target_filename)

def ensure_compiled_bundle():
    bundle_path = get_compiled_bundle_path()
    if not os.path.exists(bundle_path):
        log.info(f"Compiled bundle not found at {bundle_path}. Invoking compiler...")
        if compiler and hasattr(compiler, "compile_bejson_datasets"):
            compiler.compile_bejson_datasets()
        else:
            log.warning("compiler module missing. Cannot auto-compile.")

@app.route("/")
def index_html():
    """Serves the main offline engine web app interface with Debug Rooms & Y-Item selector."""
    return render_template_string("""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sword Slasher RPG: Shadow Link's Awakening (Flask Parity Engine)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #000; color: #fff; font-family: monospace; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    header { background: #09090b; border-bottom: 2px solid #DE2626; padding: 12px 24px; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; }
    h1 { color: #fff; font-size: 15px; letter-spacing: 1px; text-transform: uppercase; }
    .badge { background: #DE2626; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
    .subtitle { color: #DE2626; font-size: 11px; margin-top: 2px; }
    
    .toolbar { background: #18181b; border-bottom: 1px solid #27272a; padding: 8px 24px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .btn-group { display: flex; gap: 6px; }
    .btn { background: #27272a; color: #f4f4f5; border: 1px solid #3f3f46; padding: 4px 10px; border-radius: 4px; font-family: monospace; font-size: 11px; cursor: pointer; transition: all 0.2s; }
    .btn:hover { background: #3f3f46; border-color: #71717a; }
    .btn.active { background: #DE2626; color: #fff; border-color: #ef4444; font-weight: bold; box-shadow: 0 0 10px rgba(222,38,38,0.5); }
    
    main { flex: 1; display: flex; justify-content: center; align-items: center; background: #050505; position: relative; }
    #canvas-container { border: 2px solid #DE2626; box-shadow: 0 0 30px rgba(222,38,38,0.4); background: #000; position: relative; }
    canvas { display: block; image-rendering: pixelated; }
    footer { background: #09090b; border-top: 1px solid #27272a; padding: 8px 24px; font-size: 11px; color: #71717a; text-align: center; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Sword Slasher RPG: Shadow Link's Awakening <span class="badge">FLASK ENGINE v300</span></h1>
      <div class="subtitle">BEJSON 105 Pure Data Engine (Integrity Era v2.0.0-105)</div>
    </div>
    <div style="font-size: 12px; color: #10b981; font-weight: bold;">
      ● FLASK ENGINE PARITY RUNNING (Port 5000)
    </div>
  </header>

  <div class="toolbar">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="color: #fbbf24; font-size: 11px; font-weight: bold;">DEBUG ROOMS:</span>
      <div className="btn-group" id="room-buttons">
        <button class="btn active" onclick="switchRoom('debug_chamber')">🔧 Debug Test Chamber</button>
        <button class="btn" onclick="switchRoom('ganon_sanctuary')">🏛️ Ganon Sanctuary</button>
        <button class="btn" onclick="switchRoom('forgotten_cavern')">🦇 Forgotten Cavern</button>
        <button class="btn" onclick="switchRoom('castle_courtyard')">🏰 Castle Courtyard</button>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="color: #ef4444; font-size: 11px; font-weight: bold;">Y-ITEM:</span>
      <div class="btn-group">
        <button class="btn active" id="btn-boomerang" onclick="selectYItem('shadow_boomerang')">🪃 Boomerang</button>
        <button class="btn" id="btn-bow" onclick="selectYItem('dark_bow')">🏹 Dark Bow</button>
      </div>
    </div>
  </div>

  <main>
    <div id="canvas-container">
      <canvas id="gameCanvas" width="800" height="600"></canvas>
    </div>
  </main>

  <footer>
    Author: Elton Boehnen · boehnenelton2024@gmail.com · BEJSON 105 Python/Flask Parity Simulation Engine
  </footer>

  <script>
    let activeRoom = 'debug_chamber';
    let activeYItem = 'shadow_boomerang';
    let gameBundle = null;

    console.log("Flask Parity Engine loading compiled BEJSON dataset...");
    fetch('/api/data/bundle')
      .then(res => res.json())
      .then(bundle => {
        gameBundle = bundle;
        console.log("[SUCCESS] Loaded compiled BEJSON bundle:", bundle);
        renderGameCanvas();
      })
      .catch(err => console.error("Failed fetching BEJSON bundle:", err));

    function switchRoom(slug) {
      activeRoom = slug;
      fetch('/api/debug/room/' + slug, { method: 'POST' })
        .then(res => res.json())
        .then(() => renderGameCanvas());
    }

    function selectYItem(id) {
      activeYItem = id;
      document.getElementById('btn-boomerang').classList.toggle('active', id === 'shadow_boomerang');
      document.getElementById('btn-bow').classList.toggle('active', id === 'dark_bow');
      renderGameCanvas();
    }

    function renderGameCanvas() {
      const canvas = document.getElementById('gameCanvas');
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 800, 600);
      
      ctx.fillStyle = '#DE2626';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';

      let roomTitle = "DEBUG ITEM & FEATURE TEST CHAMBER";
      if (activeRoom === 'ganon_sanctuary') roomTitle = "GANON'S DARK SANCTUARY";
      else if (activeRoom === 'forgotten_cavern') roomTitle = "FORGOTTEN DARK CAVERN - LEVEL 1";
      else if (activeRoom === 'castle_courtyard') roomTitle = "HYRULE CASTLE COURTYARD - LEVEL 2";

      ctx.fillText(roomTitle, 400, 240);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px monospace';
      ctx.fillText("SHADOW LINK ACTIVE ROOM: " + activeRoom.toUpperCase(), 400, 280);
      
      ctx.fillStyle = '#10b981';
      ctx.font = '13px monospace';
      ctx.fillText("EQUIPPED Y-ITEM: " + (activeYItem === 'shadow_boomerang' ? '🪃 SHADOW BOOMERANG' : '🏹 DARK BOW & ARROWS'), 400, 320);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px monospace';
      ctx.fillText("BEJSON Datasets Indexed: " + (gameBundle ? (gameBundle.Total_Datasets || 22) : 22), 400, 370);
      ctx.fillText("Press WASD or Arrow Keys to Move Shadow Link", 400, 420);
    }
  </script>
</body>
</html>
""")

@app.route("/api/health")
def api_health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "engine": "Flask Parity Engine",
        "version": "1.2.0",
        "bejson_format": "104a / 105",
        "release_version": 300,
        "active_debug_room": CURRENT_DEBUG_ROOM,
        "active_y_item": ACTIVE_Y_ITEM
    })

@app.route("/api/debug/rooms")
def api_debug_rooms():
    """Returns available debug rooms and Y-items inventory."""
    return jsonify({
        "rooms": DEBUG_ROOMS,
        "active_room": CURRENT_DEBUG_ROOM,
        "y_items": Y_ITEMS,
        "active_y_item": ACTIVE_Y_ITEM,
        "biomes": BIOMES
    })

@app.route("/api/debug/biomes")
def api_debug_biomes():
    """Returns official BEJSON biomes dictionary."""
    return jsonify({"biomes": BIOMES})

@app.route("/api/debug/room/<slug>", methods=["GET", "POST"])
def api_switch_debug_room(slug):
    """Switch current active debug room."""
    global CURRENT_DEBUG_ROOM
    match = next((r for r in DEBUG_ROOMS if r["slug"] == slug), None)
    if match:
        CURRENT_DEBUG_ROOM = slug
        return jsonify({"success": True, "active_room": CURRENT_DEBUG_ROOM, "room_info": match})
    return jsonify({"error": "Debug room not found", "slug": slug}), 404

@app.route("/api/data/bundle")
def api_data_bundle():
    """Serves the single-file compiled BEJSON dataset bundle."""
    bundle_path = get_compiled_bundle_path()
    if not os.path.exists(bundle_path):
        ensure_compiled_bundle()
    
    if os.path.exists(bundle_path):
        with open(bundle_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return jsonify(data)
    else:
        return jsonify({"error": "Compiled bundle not found", "path": bundle_path}), 444

@app.route("/api/data/config")
def api_data_config():
    """Serves current config.json parameters."""
    return jsonify(get_config())

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    import argparse
    import threading
    import subprocess

    cfg = get_config()
    default_host = cfg.get("flask_host", "127.0.0.1")
    default_port = int(cfg.get("flask_port", 5000))

    parser = argparse.ArgumentParser(description="Flask Parity Engine Server")
    parser.add_argument("--host", default=default_host, help="Host to bind")
    parser.add_argument("--port", type=int, default=default_port, help="Port to bind")
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open browser")
    args = parser.parse_args()

    ensure_compiled_bundle()
    host = args.host
    port = args.port
    url = f"http://localhost:{port}" if host in ("127.0.0.1", "0.0.0.0") else f"http://{host}:{port}"

    if not args.no_browser:
        def _launch():
            import time
            time.sleep(1.0)
            try:
                subprocess.run(["termux-clipboard-set", url], timeout=3, check=False, capture_output=True)
            except Exception:
                pass
            try:
                subprocess.run(["am", "start", "-n", "com.android.chrome/com.google.android.apps.chrome.Main", "-d", url], timeout=4, check=False, capture_output=True)
            except Exception:
                try:
                    subprocess.run(["termux-open-url", url], timeout=4, check=False, capture_output=True)
                except Exception:
                    pass
        threading.Thread(target=_launch, daemon=True).start()

    log.info(f"Starting Flask Parity Engine on http://{host}:{port}")
    app.run(host=host, port=port, debug=False)

