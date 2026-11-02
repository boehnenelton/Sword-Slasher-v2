"""
Library:         app.py
Family:          Flask Parity Engine Server
Module Purpose:  Standalone Flask Web Engine & API Server for Sword Slasher RPG (Shadow Link's Awakening)
Architecture:    Loads compiled BEJSON 105 data bundle (or auto-compiles on startup via ../compiler/compiler.py)
Version:         1.1.0
Release_Version: 300
Date:            2026-11-02
Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
Format_Creator:  Elton Boehnen
RELATIONAL_ID:   105a0800-2026-1102-9999-000000000802
"""

import os
import json
import sys
from flask import Flask, jsonify, request, send_from_directory, render_template_string

ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
COMPILER_DIR = os.path.abspath(os.path.join(ENGINE_DIR, "../compiler"))
GAME_DATA_DIR = os.path.abspath(os.path.join(ENGINE_DIR, "../game_data"))

sys.path.append(COMPILER_DIR)

try:
    import compiler
except ImportError:
    compiler = None

app = Flask(__name__)

CONFIG_PATH = os.path.join(COMPILER_DIR, "config.json")

def get_config():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[!] Error reading compiler/config.json: {e}")
    return {
        "engine_path": "../engine",
        "game_data_path": "../game_data",
        "raw_data_path": "../game_data/raw",
        "compiled_data_path": "../game_data/compiled",
        "target_compiled_filename": "compiled_game_bundle.105.bejson",
        "flask_host": "127.0.0.1",
        "flask_port": 5000
    }

def get_compiled_bundle_path():
    cfg = get_config()
    target_filename = cfg.get("target_compiled_filename", "compiled_game_bundle.105.bejson")
    compiled_dir = os.path.abspath(os.path.join(COMPILER_DIR, cfg.get("compiled_data_path", "../game_data/compiled")))
    return os.path.join(compiled_dir, target_filename)

def ensure_compiled_bundle():
    bundle_path = get_compiled_bundle_path()
    if not os.path.exists(bundle_path):
        print(f"[*] Compiled bundle not found at {bundle_path}. Invoking compiler...")
        if compiler and hasattr(compiler, "compile_bejson_datasets"):
            compiler.compile_bejson_datasets()
        else:
            print("[!] Warning: compiler module missing. Cannot auto-compile.")

@app.route("/")
def index_html():
    """Serves the main offline engine web app interface."""
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
    h1 { color: #fff; font-size: 16px; letter-spacing: 1px; text-transform: uppercase; }
    .badge { background: #DE2626; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
    .subtitle { color: #DE2626; font-size: 11px; margin-top: 2px; }
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
      ● FLASK ENGINE RUNNING (Port 5000)
    </div>
  </header>
  <main>
    <div id="canvas-container">
      <canvas id="gameCanvas" width="800" height="600"></canvas>
    </div>
  </main>
  <footer>
    Author: Elton Boehnen · boehnenelton2024@gmail.com · BEJSON 105 Python/Flask Parity Simulation Engine
  </footer>

  <script>
    console.log("Flask Parity Engine loading compiled BEJSON dataset...");
    fetch('/api/data/bundle')
      .then(res => res.json())
      .then(bundle => {
        console.log("[SUCCESS] Loaded compiled BEJSON bundle:", bundle);
        initGameCanvas(bundle);
      })
      .catch(err => console.error("Failed fetching BEJSON bundle:", err));

    function initGameCanvas(bundle) {
      const canvas = document.getElementById('gameCanvas');
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 800, 600);
      
      ctx.fillStyle = '#DE2626';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("GANON'S DARK PYRAMID SANCTUARY", 400, 260);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px monospace';
      ctx.fillText("SHADOW LINK'S ASCENSION", 400, 300);
      
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px monospace';
      ctx.fillText("BEJSON Datasets Loaded: " + (bundle.Total_Datasets || 20), 400, 340);
      ctx.fillText("Total Records Indexed: " + (bundle.Total_Records || 88), 400, 360);
      
      ctx.fillStyle = '#10b981';
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
        "version": "1.1.0",
        "bejson_format": "104a / 105",
        "release_version": 300
    })

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
    ensure_compiled_bundle()
    cfg = get_config()
    host = cfg.get("flask_host", "127.0.0.1")
    port = int(cfg.get("flask_port", 5000))
    print(f"[*] Starting Flask Parity Engine on http://{host}:{port}")
    app.run(host=host, port=port, debug=True)
