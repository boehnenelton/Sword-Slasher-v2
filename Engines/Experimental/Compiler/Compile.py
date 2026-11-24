"""
Library:         Compile.py
Family:          Flask Parity Engine Data Compiler
Module Purpose:  BEJSON 105 Raw Data Compiler, Single-File Bundler & Standalone HTML Game Compiler with Relative Config Menu
Architecture:    Reads Engines/Experimental/Compiler/config.json; raw data from root game_data/raw, output to ../Compiled.
Version:         1.4.1
Release_Version: 300
Date:            2026-11-13
Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
License:         PolyForm-Noncommercial-1.0.0
Format_Creator:  Elton Boehnen
RELATIONAL_ID:   250f0e4d-aa0d-4002-9e80-a76bb352dec2
"""

import os
import json
import sys
import logging
import subprocess

log = logging.getLogger("ss2.compiler")


def _ui(text: str = "") -> None:
    """Interactive-menu rendering (user-facing UI, not diagnostics)."""
    sys.stdout.write(text + "\n")
    sys.stdout.flush()


COMPILER_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(COMPILER_DIR, "config.json")

def load_config():
    if not os.path.exists(CONFIG_PATH):
        log.error(f"config.json not found at {CONFIG_PATH}")
        sys.exit(1)
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def resolve_paths(config):
    if config.get("use_external_raw", False):
        raw_path = os.path.abspath(os.path.join(COMPILER_DIR, config.get("external_raw_path", "../../../public/data")))
    else:
        raw_path = os.path.abspath(os.path.join(COMPILER_DIR, config.get("raw_data_path", "../../../game_data/raw")))

    compiled_path = os.path.abspath(os.path.join(COMPILER_DIR, config.get("compiled_data_path", "../Compiled")))
    engine_path = os.path.abspath(os.path.join(COMPILER_DIR, config.get("engine_path", "..")))

    return raw_path, compiled_path, engine_path

def compile_bejson_datasets():
    log.info("=" * 60)
    log.info("  BEJSON 105 FLASK PARITY DATA COMPILER & SINGLE-FILE HTML BUILDER")
    log.info("=" * 60)

    config = load_config()
    raw_path, compiled_path, engine_path = resolve_paths(config)

    log.info(f"Config Loaded:  {CONFIG_PATH}")
    log.info(f"Engine Root:    {engine_path}")
    log.info(f"Raw Data Root:  {raw_path}")
    log.info(f"Compiled Root:  {compiled_path}")

    os.makedirs(compiled_path, exist_ok=True)

    collected_datasets = {}
    total_records = 0

    if os.path.exists(raw_path):
        for root, _, files in os.walk(raw_path):
            for file in sorted(files):
                if file.endswith(".bejson") or file.endswith(".json"):
                    file_full_path = os.path.join(root, file)
                    rel_name = os.path.relpath(file_full_path, raw_path)
                    try:
                        with open(file_full_path, "r", encoding="utf-8") as f:
                            doc = json.load(f)
                            rec_count = len(doc.get("Values", [])) if isinstance(doc, dict) else 0
                            collected_datasets[rel_name] = doc
                            total_records += rec_count
                            log.info(f"Scanned dataset: {rel_name} ({rec_count} records)")
                    except Exception as err:
                        log.warning(f"Warning: Failed reading {rel_name}: {err}")
    else:
        log.warning(f"Target raw path does not exist: {raw_path}")

    target_filename = config.get("target_compiled_filename", "compiled_game_bundle.105.bejson")
    compiled_file_path = os.path.join(compiled_path, target_filename)

    single_bundle_payload = {
        "Format": "BEJSON",
        "Format_Version": "104a",
        "Format_Creator": "Elton Boehnen",
        "Schema_Name": "Unified Flask Engine Data Bundle",
        "Schema_Version": "1.0.0",
        "Release_Version": 300,
        "Author": "Elton Boehnen · boehnenelton2024@gmail.com",
        "Total_Datasets": len(collected_datasets),
        "Total_Records": total_records,
        "Datasets": collected_datasets
    }

    with open(compiled_file_path, "w", encoding="utf-8") as out_f:
        json.dump(single_bundle_payload, out_f, indent=2)

    standalone_html_path = os.path.join(compiled_path, "standalone-game.html")
    data_json_str = json.dumps(single_bundle_payload, indent=2)

    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Sword Slasher RPG: Shadow Link's Awakening (Standalone Single-File HTML Game)</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; touch-action: manipulation; user-select: none; }}
    body {{ background-color: #000; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 100vh; overflow-x: hidden; }}
    header {{ background: #09090b; border-bottom: 2px solid #DE2626; padding: 8px 16px; width: 100%; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }}
    h1 {{ color: #fff; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold; }}
    .badge {{ background: #DE2626; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; margin-left: 6px; }}
    .subtitle {{ color: #DE2626; font-size: 10px; margin-top: 2px; }}
    main {{ flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #050505; position: relative; padding: 6px; width: 100%; }}
    #canvas-container {{ border: 3px solid #DE2626; box-shadow: 0 0 30px rgba(222,38,38,0.4); background: #000; position: relative; width: 448px; height: 448px; max-width: 90vw; max-height: 90vw; aspect-ratio: 1 / 1; }}
    canvas {{ display: block; image-rendering: pixelated; width: 100%; height: 100%; }}
    
    #room-controls {{ margin-top: 6px; display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; z-index: 10; }}
    .room-btn {{ background: #18181b; color: #f4f4f5; border: 1px solid #3f3f46; border-radius: 4px; padding: 2px 8px; font-family: monospace; cursor: pointer; font-size: 10px; transition: all 0.15s; }}
    .room-btn:hover {{ border-color: #DE2626; }}
    .room-btn.active {{ background: #DE2626; border-color: #f87171; color: #fff; font-weight: bold; }}

    #gamepad-deck {{ width: 100%; max-width: 640px; background: rgba(9, 9, 11, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 6px 12px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; gap: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); flex-shrink: 0; }}
    .joystick-outer {{ position: relative; width: 116px; height: 116px; background: #18181b; border: 2px solid rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; touch-action: none; cursor: pointer; transition: border-color 0.1s, box-shadow 0.1s; }}
    .joystick-outer.active {{ border-color: #DE2626; box-shadow: 0 0 16px rgba(222,38,38,0.45); }}
    .joystick-knob {{ position: absolute; width: 48px; height: 48px; background: #FFFFFF; border: 2px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 12px rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; pointer-events: none; transition: background 0.1s, border-color 0.1s, box-shadow 0.1s; }}
    .joystick-core {{ width: 18px; height: 18px; background: #000000; border-radius: 50%; border: 1px solid #71717a; transition: background 0.1s, border-color 0.1s; }}
    .joystick-knob.active, .joystick-outer.active .joystick-knob {{ background: #DE2626 !important; border-color: #f87171 !important; box-shadow: 0 0 18px rgba(222,38,38,0.9) !important; }}
    .joystick-knob.active .joystick-core, .joystick-outer.active .joystick-core {{ background: #FFFFFF !important; border-color: #FFFFFF !important; }}
    
    .center-pills {{ display: flex; flex-direction: column; align-items: center; gap: 8px; background: rgba(24, 24, 27, 0.85); padding: 8px 12px; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }}
    .pill-row {{ display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; -webkit-user-select: none; touch-action: none; }}
    .pill-btn {{ width: 32px; height: 10px; background: #FFFFFF; border: 1px solid #FFFFFF; border-radius: 8px; transform: rotate(-15deg); cursor: pointer; touch-action: none; transition: background 0.08s, border-color 0.08s, box-shadow 0.08s; }}
    .pill-row:active .pill-btn, .pill-btn:active, .pill-btn.active {{ background: #DE2626 !important; border-color: #f87171 !important; box-shadow: 0 0 10px rgba(222,38,38,0.85) !important; }}
    .pill-label {{ font-size: 8px; font-weight: bold; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; pointer-events: none; transition: color 0.08s; }}
    .pill-row:active .pill-label, .pill-row.active .pill-label {{ color: #DE2626 !important; }}
    
    .action-cluster {{ position: relative; width: 128px; height: 128px; background: rgba(24, 24, 27, 0.85); border: 1px solid rgba(255,255,255,0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; touch-action: none; }}
    .act-btn {{ position: absolute; width: 44px; height: 44px; border-radius: 50%; font-size: 16px; font-weight: 900; color: #000000; background: #FFFFFF; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none; box-shadow: 0 4px 12px rgba(255,255,255,0.25); transition: transform 0.08s, background 0.08s, color 0.08s, border-color 0.08s, box-shadow 0.08s; touch-action: none; }}
    .btn-x {{ top: 2px; left: 42px; }}
    .btn-y {{ top: 42px; left: 2px; }}
    .btn-b {{ bottom: 2px; left: 42px; }}
    .btn-a {{ top: 42px; right: 2px; }}
    .act-btn:active, .act-btn.active {{ background: #DE2626 !important; color: #FFFFFF !important; border-color: #f87171 !important; box-shadow: 0 0 18px rgba(222,38,38,0.9) !important; transform: scale(0.92); }}

    #intro-screen {{ position: absolute; inset: 0; z-index: 100; background: #050204; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; border-radius: 4px; }}

    footer {{ background: #09090b; border-top: 1px solid #27272a; padding: 6px 20px; font-size: 10px; color: #71717a; text-align: center; flex-shrink: 0; width: 100%; }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Sword Slasher RPG: Shadow Link's Awakening <span class="badge">SINGLE-FILE HTML ENGINE</span></h1>
      <div class="subtitle">BEJSON 105 Pure Data Engine (Integrity Era v2.0.0-105)</div>
    </div>
    <div style="font-size: 11px; color: #10b981; font-weight: bold;">
      ● OFFLINE RUNNABLE
    </div>
  </header>

  <main>
    <div id="canvas-container">
      <div id="intro-screen">
        <h1 style="font-size: 24px; color: #fff; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; margin-bottom: 6px;">SHADOW LINK</h1>
        <p style="font-size: 11px; color: #DE2626; font-weight: bold; font-family: monospace; letter-spacing: 1px; margin-bottom: 20px;">SWORD SLASHER RPG: SHADOW LINK'S AWAKENING</p>
        <button id="btn-start-game" style="padding: 12px 28px; background: #DE2626; color: #fff; font-size: 13px; font-weight: bold; font-family: monospace; border: 1px solid #f87171; border-radius: 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 20px rgba(222,38,38,0.6);">START GAME</button>
        <p style="font-size: 10px; color: #71717a; font-family: monospace; margin-top: 20px;">Author: Elton Boehnen · BEJSON 105 Pure Data Engine</p>
      </div>
      <canvas id="gameCanvas" width="448" height="448"></canvas>
      <div id="debug-mode-badge" style="display: none; position: absolute; top: 12px; left: 12px; background: rgba(245, 158, 11, 0.25); border: 1px solid rgba(245, 158, 11, 0.7); color: #fcd34d; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; z-index: 20; pointer-events: none; font-family: monospace;">
        ● DEBUG DOMAIN
      </div>
    </div>

    <!-- SELECT: System & Debug Mode Overlay -->
    <div id="select-menu-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.88); backdrop-filter: blur(4px); z-index: 999; align-items: center; justify-content: center;">
      <div style="background: #09090b; border: 2px solid #3f3f46; border-radius: 12px; width: 90%; max-width: 420px; padding: 20px; box-shadow: 0 0 35px rgba(0,0,0,0.9); display: flex; flex-direction: column; gap: 14px; font-family: monospace; color: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a; padding-bottom: 10px;">
          <span style="font-weight: bold; font-size: 13px; color: #f4f4f5; letter-spacing: 0.05em;">SYSTEM & DEBUG SETTINGS</span>
          <button id="btn-close-select-menu" style="background: #27272a; border: 1px solid #3f3f46; color: #a1a1aa; border-radius: 6px; padding: 3px 8px; font-size: 12px; cursor: pointer;">✕</button>
        </div>

        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 12px; font-weight: bold; color: #fbbf24;">DEBUG MODE SWITCH</div>
              <div style="font-size: 10px; color: #71717a; font-family: sans-serif; margin-top: 2px;">Separate debug testing room from real game world</div>
            </div>
            <button id="btn-toggle-debug" style="background: #27272a; border: 1px solid #52525b; color: #e4e4e7; border-radius: 6px; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; font-family: monospace; transition: all 0.2s;">
              DEBUG: OFF
            </button>
          </div>
          <div style="background: #09090b; border: 1px solid #27272a; border-radius: 6px; padding: 8px 12px; font-size: 11px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #71717a;">ACTIVE REALM:</span>
            <span id="label-active-realm" style="color: #34d399; font-weight: bold;">🗡️ [GAME WORLD 1]</span>
          </div>
        </div>

        <button id="btn-resume-game" style="background: #DE2626; border: none; color: #fff; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 11px; cursor: pointer; font-family: monospace; letter-spacing: 0.05em; margin-top: 4px;">
          RESUME GAME [SELECT / ESC]
        </button>
      </div>
    </div>

    <div id="room-controls" style="display: none;">
      <button id="btn-room-debug" class="room-btn" onclick="if(isDebugMode) setDebugRoom('debug_chamber')">🔧 Debug Chamber [1]</button>
      <button id="btn-room-sanctuary" class="room-btn active" onclick="setDebugRoom('ganon_sanctuary')">🏛️ Ganon Sanctuary [2]</button>
      <button id="btn-room-cavern" class="room-btn" onclick="setDebugRoom('forgotten_cavern')">🦇 Forgotten Cavern [3]</button>
      <button id="btn-room-courtyard" class="room-btn" onclick="setDebugRoom('castle_courtyard')">🏰 Castle Courtyard [4]</button>
    </div>

    <div id="gamepad-deck">
      <div id="joystick" class="joystick-outer">
        <div id="joystick-knob" class="joystick-knob">
          <div class="joystick-core"></div>
        </div>
      </div>

      <div class="center-pills">
        <div id="row-start" class="pill-row">
          <button id="btn-start" class="pill-btn"></button>
          <span class="pill-label">START</span>
        </div>
        <div id="row-select" class="pill-row">
          <button id="btn-select" class="pill-btn"></button>
          <span class="pill-label">SELECT</span>
        </div>
      </div>

      <div class="action-cluster">
        <button id="btn-x" class="act-btn btn-x">X</button>
        <button id="btn-y" class="act-btn btn-y">Y</button>
        <button id="btn-b" class="act-btn btn-b">B</button>
        <button id="btn-a" class="act-btn btn-a">A</button>
      </div>
    </div>
  </main>

  <footer>
    Author: Elton Boehnen · boehnenelton2024@gmail.com · BEJSON 105 Pure Data Standalone Game Engine
  </footer>

  <script>
    const EMBEDDED_BEJSON_BUNDLE = {data_json_str};

    console.log("[Standalone HTML Game] Booting full engine replica with embedded BEJSON chunk...", EMBEDDED_BEJSON_BUNDLE);

    // Extract SVG / Base64 sprite assets from embedded BEJSON dataset manifest
    const spriteImages = {{}};
    try {{
      const sprDoc = EMBEDDED_BEJSON_BUNDLE.Datasets ? EMBEDDED_BEJSON_BUNDLE.Datasets['sprites/sprites_manifest.105a.bejson'] : null;
      if (sprDoc && sprDoc.Values && sprDoc.Fields) {{
        const slugIdx = sprDoc.Fields.findIndex(f => f.name === 'spr_slug_code');
        const uriIdx = sprDoc.Fields.findIndex(f => f.name === 'spr_image_source_data_uri');
        if (slugIdx >= 0 && uriIdx >= 0) {{
          sprDoc.Values.forEach(row => {{
            const slug = row[slugIdx];
            const uri = row[uriIdx];
            if (slug && uri) {{
              const img = new Image();
              img.src = uri;
              spriteImages[slug] = img;
            }}
          }});
        }}
      }}
    }} catch (err) {{
      console.warn("Sprite asset manifest parse note:", err);
    }}

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Level map & world coordinate specs (1:1 with React engine)
    let tilesW = 64;
    let tilesH = 64;
    const tileUnitPx = 16;
    let mapWorldWidth = tilesW * tileUnitPx;   // 1024px
    let mapWorldHeight = tilesH * tileUnitPx; // 1024px
    const zoomScale = 1.25;

    let px = mapWorldWidth / 2; // 512
    let py = mapWorldHeight / 2 + 40; // 552
    let playerFacing = 'DOWN';
    let playerHp = 120, playerMaxHp = 120;
    let playerHurtTime = 0;
    let playerKnockback = {{ vx: 0, vy: 0 }};
    let isMoving = false, isSheathed = false;
    let bHeldTime = 0, isCharging = false;
    let swordCooldown = 0;
    let slashAnim = null, spinAnim = null;
    let swordVariation = 0;
    let tickCount = 0;

    // 10-Slot Parallel Ancilla Engine (ALttP $0C4A Parallel Slot Architecture)
    class AncillaEngineJS {{
      constructor() {{
        this.TOTAL_SLOTS = 10;
        this.FRONT_SLOT_MAX = 4;
        this.BACK_SLOT_MIN = 5;
        this.slots = new Array(this.TOTAL_SLOTS).fill(null);
        this.searchIndex = 9;
      }}

      clearAll() {{
        for (let i = 0; i < this.TOTAL_SLOTS; i++) {{
          this.slots[i] = null;
        }}
      }}

      getActiveQuotaCount(itemId) {{
        if (!itemId) return 0;
        let count = 0;
        for (let i = 0; i <= this.FRONT_SLOT_MAX; i++) {{
          const slot = this.slots[i];
          if (slot && slot.active && slot.itemId === itemId) count++;
        }}
        return count;
      }}

      allocateSlot(slotCategory, itemId, quota = 1) {{
        if (slotCategory === 'primary') {{
          if (itemId && quota > 0) {{
            if (this.getActiveQuotaCount(itemId) >= quota) return -1;
          }}
          for (let i = this.FRONT_SLOT_MAX; i >= 0; i--) {{
            if (!this.slots[i] || !this.slots[i].active) return i;
          }}
          let startIdx = Math.min(this.searchIndex, this.TOTAL_SLOTS - 1);
          for (let i = startIdx; i >= 0; i--) {{
            const slot = this.slots[i];
            if (slot && slot.active && slot.evictable) {{
              this.slots[i] = null;
              return i;
            }}
          }}
          return -1;
        }} else {{
          for (let i = this.TOTAL_SLOTS - 1; i >= this.BACK_SLOT_MIN; i--) {{
            if (!this.slots[i] || !this.slots[i].active) return i;
          }}
          for (let i = this.FRONT_SLOT_MAX; i >= 0; i--) {{
            if (!this.slots[i] || !this.slots[i].active) return i;
          }}
          return -1;
        }}
      }}

      spawnAncilla(def) {{
        const category = def.category || (def.type === 'particle' ? 'particle' : 'primary');
        const slotIdx = this.allocateSlot(category, def.itemId, def.quota ?? 1);
        if (slotIdx === -1) return -1;
        this.slots[slotIdx] = {{
          slotId: slotIdx,
          active: true,
          category,
          itemId: def.itemId || 'generic',
          type: def.type || 'generic',
          x: def.x || 0,
          y: def.y || 0,
          vx: def.vx || 0,
          vy: def.vy || 0,
          angle: def.angle || 0,
          timer: def.timer ?? 60,
          maxTimer: def.timer ?? 60,
          layer: def.layer ?? 0,
          evictable: def.evictable ?? (category === 'particle'),
          state: def.state || {{}},
          onUpdate: def.onUpdate || null,
          onRender: def.onRender || null
        }};
        return slotIdx;
      }}

      updateAll(context) {{
        for (let i = 0; i < this.TOTAL_SLOTS; i++) {{
          const slot = this.slots[i];
          if (!slot || !slot.active) continue;
          slot.x += slot.vx;
          slot.y += slot.vy;
          slot.timer--;
          if (typeof slot.onUpdate === 'function') {{
            const keepAlive = slot.onUpdate(slot, context);
            if (keepAlive === false) {{
              slot.active = false;
              this.slots[i] = null;
              continue;
            }}
          }}
          if (slot.timer <= 0) {{
            slot.active = false;
            this.slots[i] = null;
          }}
        }}
      }}

      getActiveAncillae() {{
        const list = [];
        for (let i = 0; i < this.TOTAL_SLOTS; i++) {{
          const slot = this.slots[i];
          if (slot && slot.active) list.push(slot);
        }}
        return list;
      }}
    }}

    // Decoupled Item Registry Interface
    class ItemRegistry {{
      constructor() {{
        this.itemMap = new Map();
      }}
      registerItem(itemDef) {{
        if (!itemDef || !itemDef.id) return;
        this.itemMap.set(itemDef.id, {{
          quota: 1,
          cooldownFrames: 20,
          useAnimationFrames: 14,
          ammoType: null,
          ammoCost: 0,
          category: 'Y_ITEM',
          ...itemDef
        }});
      }}
      getItem(id) {{ return this.itemMap.get(id) || null; }}
      getAllItems() {{ return Array.from(this.itemMap.values()); }}
    }}

    // 24-Slot Inventory & Player State Machine Coordinator ($7EF340+ & $0202 Parity)
    class InventoryState {{
      constructor(registry) {{
        this.registry = registry;
        this.SLOT_COUNT = 24;
        this.slots = new Array(this.SLOT_COUNT).fill(null);
        this.equippedYItemId = null;
        this.swordLockout = false;
        this.actionLockoutTimer = 0;
        this.activeItemCooldown = 0;
      }}
      setSwordLockout(isLocked) {{ this.swordLockout = !!isLocked; }}
      tickLockouts() {{
        if (this.actionLockoutTimer > 0) this.actionLockoutTimer--;
        if (this.activeItemCooldown > 0) this.activeItemCooldown--;
      }}
      setEquippedYItem(itemId) {{
        const item = this.registry.getItem(itemId);
        if (item) this.equippedYItemId = item.id;
      }}
      getEquippedYItem() {{ return this.registry.getItem(this.equippedYItemId); }}
      setSlot(idx, data) {{ if (idx >= 0 && idx < this.SLOT_COUNT) this.slots[idx] = data; }}
      executeEquippedYItem(context, ancilla) {{
        if (this.swordLockout) return {{ success: false, reason: 'SWORD_LOCKOUT' }};
        if (this.actionLockoutTimer > 0 || this.activeItemCooldown > 0) return {{ success: false, reason: 'ACTION_LOCKED' }};
        const item = this.getEquippedYItem();
        if (!item) return {{ success: false, reason: 'NO_ITEM_EQUIPPED' }};
        if (typeof item.onExecute === 'function') {{
          const res = item.onExecute(context, ancilla);
          if (res === false || res === -1) return {{ success: false, reason: 'EXECUTION_REJECTED' }};
        }}
        this.actionLockoutTimer = item.useAnimationFrames || 14;
        this.activeItemCooldown = item.cooldownFrames || 20;
        return {{ success: true }};
      }}
    }}

    const ancillaEngine = new AncillaEngineJS();
    const itemRegistry = new ItemRegistry();
    const inventoryState = new InventoryState(itemRegistry);

    // Register Items through Decoupled Interface
    itemRegistry.registerItem({{
      id: 'shadow_boomerang',
      name: 'Shadow Boomerang',
      icon: '🪃',
      quota: 1,
      cooldownFrames: 16,
      useAnimationFrames: 12,
      onExecute: (ctx, engine) => {{
        if (engine.getActiveQuotaCount('shadow_boomerang') > 0) return false;
        let vx = 0, vy = 0;
        if (ctx.playerFacing === 'UP') vy = -8;
        if (ctx.playerFacing === 'DOWN') vy = 8;
        if (ctx.playerFacing === 'LEFT') vx = -8;
        if (ctx.playerFacing === 'RIGHT') vx = 8;

        return engine.spawnAncilla({{
          type: 'boomerang',
          itemId: 'shadow_boomerang',
          category: 'primary',
          x: ctx.px,
          y: ctx.py,
          vx,
          vy,
          timer: 100,
          state: {{ outwardTimer: 25, returning: false, startX: ctx.px, startY: ctx.py }},
          onUpdate: (slot, c) => {{
            if (!slot.state.returning) {{
              slot.state.outwardTimer--;
              if (slot.x < 30 || slot.x > mapWorldWidth - 30 || slot.y < 30 || slot.y > mapWorldHeight - 30 || slot.state.outwardTimer <= 0) {{
                slot.state.returning = true;
              }}
            }} else {{
              const dist = Math.hypot(c.px - slot.x, c.py - slot.y);
              if (dist < 18) return false;
              slot.vx = ((c.px - slot.x) / dist) * 9;
              slot.vy = ((c.py - slot.y) / dist) * 9;
            }}
            if (typeof c.onBoomerangStep === 'function') c.onBoomerangStep(slot);
            return true;
          }},
          onRender: (slot, rCtx) => {{
            rCtx.fillStyle = '#f59e0b';
            rCtx.beginPath();
            rCtx.arc(slot.x, slot.y, 5, 0, Math.PI * 2);
            rCtx.fill();
          }}
        }});
      }}
    }});

    itemRegistry.registerItem({{
      id: 'dark_bow',
      name: 'Dark Bow & Arrows',
      icon: '🏹',
      quota: 2,
      cooldownFrames: 24,
      useAnimationFrames: 14,
      onExecute: (ctx, engine) => {{
        let vx = 0, vy = 0;
        const arrowSpeed = 5.5;
        if (ctx.playerFacing === 'UP') vy = -arrowSpeed;
        if (ctx.playerFacing === 'DOWN') vy = arrowSpeed;
        if (ctx.playerFacing === 'LEFT') vx = -arrowSpeed;
        if (ctx.playerFacing === 'RIGHT') vx = arrowSpeed;

        const slotIdx = engine.spawnAncilla({{
          type: 'arrow',
          itemId: 'dark_bow',
          category: 'primary',
          x: ctx.px,
          y: ctx.py,
          vx,
          vy,
          timer: 55,
          onUpdate: (slot, c) => {{
            if (typeof c.onArrowStep === 'function') {{
              const hit = c.onArrowStep(slot);
              if (hit) return false;
            }}
            return slot.x > 10 && slot.x < mapWorldWidth - 10 && slot.y > 10 && slot.y < mapWorldHeight - 10;
          }},
          onRender: (slot, rCtx) => {{
            rCtx.fillStyle = '#ffffff';
            rCtx.fillRect(slot.x - 2, slot.y - 2, 5, 5);
          }}
        }});

        engine.spawnAncilla({{
          type: 'particle',
          category: 'particle',
          itemId: 'dark_bow',
          x: ctx.px + (Math.random() - 0.5) * 6,
          y: ctx.py + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          timer: 16,
          evictable: true,
          onRender: (slot, rCtx) => {{
            rCtx.fillStyle = 'rgba(56, 189, 248, 0.6)';
            rCtx.fillRect(slot.x - 2, slot.y - 2, 4, 4);
          }}
        }});

        return slotIdx;
      }}
    }});

    inventoryState.setSlot(0, {{ itemId: 'shadow_boomerang', unlocked: true, tier: 1 }});
    inventoryState.setSlot(1, {{ itemId: 'dark_bow', unlocked: true, tier: 1 }});
    inventoryState.setEquippedYItem('shadow_boomerang');
    let activeYItem = inventoryState.equippedYItemId || 'shadow_boomerang';
    let isDebugMode = false;
    let realWorldLevelSlug = 'shadow_cave';
    let currentLevelSlug = realWorldLevelSlug;

    let boomerangs = [];
    let droppedItems = [];
    let otherProjectiles = [];
    let props = [];
    let enemies = [];

    function setDebugRoom(rawSlug, customSpawnX = null, customSpawnY = null) {{
      ancillaEngine.clearAll();
      let slug = rawSlug;
      if (rawSlug === 'ganon_sanctuary') slug = 'shadow_cave';
      else if (rawSlug === 'forgotten_cavern' || rawSlug === 'castle_courtyard') slug = 'overworld_grid';

      currentLevelSlug = slug;
      if (slug !== 'debug_chamber') {{
        realWorldLevelSlug = slug;
      }}
      if (slug === 'overworld_grid') {{
        tilesW = 256; // 8x8 sectors of 32x32 metatiles = 4096px
        tilesH = 256;
      }} else if (slug === 'shadow_cave') {{
        tilesW = 32;  // Underworld Supertile 0x00 (512x512px)
        tilesH = 32;
      }} else {{
        tilesW = 64;  // Debug Chamber (1024x1024px)
        tilesH = 64;
      }}
      mapWorldWidth = tilesW * tileUnitPx;
      mapWorldHeight = tilesH * tileUnitPx;

      if (customSpawnX !== null && customSpawnY !== null) {{
        px = customSpawnX;
        py = customSpawnY;
      }} else if (slug === 'overworld_grid') {{
        px = 1792; // Sector 0x1B (Col 3, Row 3) outside Shadow Cave
        py = 1808;
      }} else if (slug === 'shadow_cave') {{
        px = 256; // Center of Shadow Cave Supertile 0x00
        py = 256;
      }} else {{
        px = mapWorldWidth / 2;
        py = mapWorldHeight / 2 + 40;
      }}

      if (slug === 'debug_chamber') {{
        props = [
          {{ id: 'ped_boomerang', x: px - 120, y: py - 160, type: 'pedestal', destroyed: false, itemId: 'shadow_boomerang', icon: '🪃', title: 'BOOMERANG' }},
          {{ id: 'ped_bow', x: px - 40, y: py - 160, type: 'pedestal', destroyed: false, itemId: 'dark_bow', icon: '🏹', title: 'DARK BOW' }},
          {{ id: 'p1', x: px - 160, y: py - 60, type: 'pot', destroyed: false }},
          {{ id: 'p2', x: px - 200, y: py - 60, type: 'bush', destroyed: false }},
          {{ id: 'p3', x: px + 160, y: py - 60, type: 'pot', destroyed: false }},
          {{ id: 'p4', x: px + 200, y: py - 60, type: 'bush', destroyed: false }}
        ];
        enemies = [
          {{ id: 'e1', type: 'guard', x: px - 120, y: py - 120, hp: 60, maxHp: 60, attack: 15, hurtTime: 0, knockback: {{ vx: 0, vy: 0 }}, aiState: 'PATROL', aiTimer: 60, targetX: px - 120, targetY: py - 120, chargeVx: 0, chargeVy: 0, patrolVx: 0, patrolVy: 0 }},
          {{ id: 'e2', type: 'slime', x: px + 120, y: py - 120, hp: 35, maxHp: 35, attack: 10, hurtTime: 0, knockback: {{ vx: 0, vy: 0 }}, aiState: 'PATROL', aiTimer: 40, targetX: px + 120, targetY: py - 120, chargeVx: 0, chargeVy: 0, patrolVx: 0, patrolVy: 0 }}
        ];
      }} else if (slug === 'shadow_cave') {{
        props = [
          {{ id: 'sc_pot_nw', x: 144, y: 160, type: 'pot', destroyed: false }},
          {{ id: 'sc_pot_ne', x: 368, y: 160, type: 'pot', destroyed: false }},
          {{ id: 'sc_pot_sw', x: 144, y: 352, type: 'pot', destroyed: false }},
          {{ id: 'sc_pot_se', x: 368, y: 352, type: 'pot', destroyed: false }}
        ];
        enemies = [];
      }} else {{
        props = [];
        enemies = [];
      }}

      ['debug', 'sanctuary', 'cavern', 'courtyard'].forEach(name => {{
        const btn = document.getElementById('btn-room-' + name);
        if (btn) btn.classList.remove('active');
      }});
      if (slug === 'debug_chamber') document.getElementById('btn-room-debug')?.classList.add('active');
      else if (slug === 'shadow_cave') document.getElementById('btn-room-sanctuary')?.classList.add('active');
      else document.getElementById('btn-room-cavern')?.classList.add('active');
    }}

    setDebugRoom(isDebugMode ? 'debug_chamber' : realWorldLevelSlug);

    const keys = {{}};
    let joystickVector = {{ x: 0, y: 0 }};

    window.addEventListener('keydown', e => {{
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (k === '1') {{
        if (isDebugMode) setDebugRoom('debug_chamber');
      }}
      if (k === '2') setDebugRoom('ganon_sanctuary');
      if (k === '3') setDebugRoom('forgotten_cavern');
      if (k === '4') setDebugRoom('castle_courtyard');
      if (k === 'escape') {{
        const o = document.getElementById('select-menu-overlay');
        if (o) o.style.display = 'none';
      }}
      if (k === 'q' || k === 'tab') {{
        e.preventDefault();
        const nextItem = activeYItem === 'shadow_boomerang' ? 'dark_bow' : 'shadow_boomerang';
        inventoryState.setEquippedYItem(nextItem);
        activeYItem = inventoryState.equippedYItemId || nextItem;
      }}
      if (k === 'w' || k === 'a' || k === 's' || k === 'd' || k.startsWith('arrow')) {{
        document.getElementById('joystick')?.classList.add('active');
        document.getElementById('joystick-knob')?.classList.add('active');
      }}
      if (k === 'j' || k === 'z' || k === 'b') {{
        document.getElementById('btn-b')?.classList.add('active');
        executeSwordSlash();
      }}
      if (k === 'y' || k === 'i') {{
        document.getElementById('btn-y')?.classList.add('active');
        executeYItem();
      }}
      if (k === 'e' || k === 'a' || e.key === ' ') {{
        document.getElementById('btn-a')?.classList.add('active');
        executeInteract();
      }}
      if (k === 'x' || k === 'k') {{
        document.getElementById('btn-x')?.classList.add('active');
      }}
      if (k === 'enter' || k === ' ') dismissIntro();
    }});

    window.addEventListener('keyup', e => {{
      const k = e.key.toLowerCase();
      keys[k] = false;
      if (!keys['w'] && !keys['a'] && !keys['s'] && !keys['d'] && !keys['arrowup'] && !keys['arrowdown'] && !keys['arrowleft'] && !keys['arrowright']) {{
        if (Math.hypot(joystickVector.x, joystickVector.y) < 0.1) {{
          document.getElementById('joystick')?.classList.remove('active');
          document.getElementById('joystick-knob')?.classList.remove('active');
        }}
      }}
      if (k === 'j' || k === 'z' || k === 'b') document.getElementById('btn-b')?.classList.remove('active');
      if (k === 'y' || k === 'i') document.getElementById('btn-y')?.classList.remove('active');
      if (k === 'e' || k === 'a' || e.key === ' ') document.getElementById('btn-a')?.classList.remove('active');
      if (k === 'x' || k === 'k') document.getElementById('btn-x')?.classList.remove('active');
    }});

    const introScreen = document.getElementById('intro-screen');
    function dismissIntro(e) {{
      if (e) {{
        e.preventDefault();
        e.stopPropagation();
      }}
      if (introScreen) introScreen.style.display = 'none';
    }}

    const btnStartGame = document.getElementById('btn-start-game');
    if (btnStartGame) {{
      btnStartGame.addEventListener('pointerdown', dismissIntro);
      btnStartGame.addEventListener('click', dismissIntro);
    }}
    introScreen?.addEventListener('pointerdown', dismissIntro);

    const joyEl = document.getElementById('joystick');
    const knobEl = document.getElementById('joystick-knob');
    let activePointerId = null;

    function handleJoystickPointer(clientX, clientY) {{
      const rect = joyEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const maxRadius = 44;
      const dist = Math.hypot(dx, dy);

      if (dist > maxRadius) {{
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }}

      knobEl.style.transform = `translate(${{dx}}px, ${{dy}}px)`;

      if (dist < 6) {{
        joystickVector = {{ x: 0, y: 0 }};
      }} else {{
        joystickVector = {{ x: dx / maxRadius, y: dy / maxRadius }};
      }}
    }}

    function resetJoystick() {{
      activePointerId = null;
      joyEl.classList.remove('active');
      knobEl.classList.remove('active');
      knobEl.style.transform = 'translate(0px, 0px)';
      joystickVector = {{ x: 0, y: 0 }};
    }}

    joyEl.addEventListener('pointerdown', e => {{
      e.preventDefault();
      e.stopPropagation();
      dismissIntro();
      activePointerId = e.pointerId;
      joyEl.classList.add('active');
      knobEl.classList.add('active');
      try {{ joyEl.setPointerCapture(e.pointerId); }} catch (err) {{}}
      handleJoystickPointer(e.clientX, e.clientY);
    }});

    joyEl.addEventListener('pointermove', e => {{
      if (activePointerId === e.pointerId) {{
        e.preventDefault();
        e.stopPropagation();
        handleJoystickPointer(e.clientX, e.clientY);
      }}
    }});

    joyEl.addEventListener('pointerup', e => {{
      if (activePointerId === e.pointerId) {{
        e.preventDefault();
        e.stopPropagation();
        try {{ joyEl.releasePointerCapture(e.pointerId); }} catch (err) {{}}
        resetJoystick();
      }}
    }});

    joyEl.addEventListener('pointercancel', e => {{
      if (activePointerId === e.pointerId) {{
        try {{ joyEl.releasePointerCapture(e.pointerId); }} catch (err) {{}}
        resetJoystick();
      }}
    }});

    joyEl.addEventListener('touchstart', e => {{ e.preventDefault(); }}, {{ passive: false }});
    joyEl.addEventListener('touchmove', e => {{ e.preventDefault(); }}, {{ passive: false }});

    const btnB = document.getElementById('btn-b');
    if (btnB) {{
      btnB.addEventListener('pointerdown', e => {{
        e.preventDefault();
        e.stopPropagation();
        dismissIntro();
        btnB.classList.add('active');
        keys['b'] = true;
        executeSwordSlash();
      }});
      btnB.addEventListener('pointerup', e => {{
        e.preventDefault();
        e.stopPropagation();
        btnB.classList.remove('active');
        keys['b'] = false;
      }});
      btnB.addEventListener('pointercancel', () => {{
        btnB.classList.remove('active');
        keys['b'] = false;
      }});
    }}

    const btnY = document.getElementById('btn-y');
    if (btnY) {{
      btnY.addEventListener('pointerdown', e => {{
        e.preventDefault();
        e.stopPropagation();
        dismissIntro();
        btnY.classList.add('active');
        executeYItem();
      }});
      btnY.addEventListener('pointerup', () => btnY.classList.remove('active'));
      btnY.addEventListener('pointercancel', () => btnY.classList.remove('active'));
    }}

    const btnA = document.getElementById('btn-a');
    if (btnA) {{
      btnA.addEventListener('pointerdown', e => {{
        e.preventDefault();
        e.stopPropagation();
        dismissIntro();
        btnA.classList.add('active');
        executeInteract();
      }});
      btnA.addEventListener('pointerup', () => btnA.classList.remove('active'));
      btnA.addEventListener('pointercancel', () => btnA.classList.remove('active'));
    }}

    const btnX = document.getElementById('btn-x');
    if (btnX) {{
      btnX.addEventListener('pointerdown', e => {{
        e.preventDefault();
        e.stopPropagation();
        dismissIntro();
        btnX.classList.add('active');
        isSheathed = !isSheathed;
      }});
      btnX.addEventListener('pointerup', () => btnX.classList.remove('active'));
      btnX.addEventListener('pointercancel', () => btnX.classList.remove('active'));
    }}

    const handleSelect = (e) => {{
      if (e) {{ e.preventDefault(); e.stopPropagation(); }}
      dismissIntro();
      document.getElementById('btn-select')?.classList.add('active');
      document.getElementById('row-select')?.classList.add('active');
      const overlay = document.getElementById('select-menu-overlay');
      if (overlay) {{
        const isVisible = overlay.style.display === 'flex';
        overlay.style.display = isVisible ? 'none' : 'flex';
      }}
      setTimeout(() => {{
        document.getElementById('btn-select')?.classList.remove('active');
        document.getElementById('row-select')?.classList.remove('active');
      }}, 150);
    }};
    document.getElementById('btn-select')?.addEventListener('pointerdown', handleSelect);
    document.getElementById('row-select')?.addEventListener('pointerdown', handleSelect);

    const handleToggleDebug = (e) => {{
      if (e) {{ e.preventDefault(); e.stopPropagation(); }}
      isDebugMode = !isDebugMode;
      const btn = document.getElementById('btn-toggle-debug');
      const realmLabel = document.getElementById('label-active-realm');
      const roomControls = document.getElementById('room-controls');
      const debugBadge = document.getElementById('debug-mode-badge');

      if (isDebugMode) {{
        setDebugRoom('debug_chamber');
        if (btn) {{
          btn.textContent = 'DEBUG: ON';
          btn.style.background = '#d97706';
          btn.style.borderColor = '#f59e0b';
          btn.style.color = '#ffffff';
        }}
        if (realmLabel) {{
          realmLabel.textContent = '🔧 [DEBUG DOMAIN] TEST CHAMBER';
          realmLabel.style.color = '#fbbf24';
        }}
        if (roomControls) roomControls.style.display = 'flex';
        if (debugBadge) debugBadge.style.display = 'block';
      }} else {{
        setDebugRoom(realWorldLevelSlug || 'ganon_sanctuary');
        if (btn) {{
          btn.textContent = 'DEBUG: OFF';
          btn.style.background = '#27272a';
          btn.style.borderColor = '#52525b';
          btn.style.color = '#e4e4e7';
        }}
        if (realmLabel) {{
          realmLabel.textContent = '🗡️ [GAME WORLD 1]';
          realmLabel.style.color = '#34d399';
        }}
        if (roomControls) roomControls.style.display = 'none';
        if (debugBadge) debugBadge.style.display = 'none';
      }}
    }};
    document.getElementById('btn-toggle-debug')?.addEventListener('click', handleToggleDebug);
    document.getElementById('btn-close-select-menu')?.addEventListener('click', () => {{
      const o = document.getElementById('select-menu-overlay');
      if (o) o.style.display = 'none';
    }});
    document.getElementById('btn-resume-game')?.addEventListener('click', () => {{
      const o = document.getElementById('select-menu-overlay');
      if (o) o.style.display = 'none';
    }});

    const handleStart = (e) => {{
      if (e) {{ e.preventDefault(); e.stopPropagation(); }}
      dismissIntro();
      document.getElementById('btn-start')?.classList.add('active');
      document.getElementById('row-start')?.classList.add('active');
      px = mapWorldWidth / 2;
      py = mapWorldHeight / 2 + 40;
      setTimeout(() => {{
        document.getElementById('btn-start')?.classList.remove('active');
        document.getElementById('row-start')?.classList.remove('active');
      }}, 150);
    }};
    document.getElementById('btn-start')?.addEventListener('pointerdown', handleStart);
    document.getElementById('row-start')?.addEventListener('pointerdown', handleStart);

    function executeSwordSlash() {{
      if (isSheathed) {{ isSheathed = false; return; }}
      if (swordCooldown > 0 || (slashAnim && slashAnim.timer > 0)) return;

      swordVariation = (swordVariation + 1) % 3;
      // 18 frames = 0.30s animation commit & stun delay
      slashAnim = {{ x: px, y: py, dir: playerFacing, timer: 18, maxTimer: 18, variation: swordVariation }};
      swordCooldown = 20;

      let hx = px, hy = py;
      const reach = 48; // Extended sword reach (from 35 -> 48px)
      if (playerFacing === 'UP') hy -= reach;
      if (playerFacing === 'DOWN') hy += reach;
      if (playerFacing === 'LEFT') hx -= reach;
      if (playerFacing === 'RIGHT') hx += reach;

      props.forEach(p => {{
        if (!p.destroyed && Math.hypot(p.x - hx, p.y - hy) < 36) {{
          if (p.type === 'pedestal') {{
            if (p.itemId) {{
              inventoryState.setEquippedYItem(p.itemId);
              activeYItem = inventoryState.equippedYItemId || p.itemId;
            }}
            return;
          }}
          p.destroyed = true;
          droppedItems.push({{ x: p.x, y: p.y, type: 'heart', timer: 300 }});
        }}
      }});

      enemies = enemies.map(e => {{
        if (e.hp > 0 && Math.hypot(e.x - hx, e.y - hy) < 44) {{
          const angle = Math.atan2(e.y - py, e.x - px);
          // Improved vector knockback impulse (10.5 force) with 0.3s stun (18 frames)
          const kb = {{ vx: Math.cos(angle) * 10.5, vy: Math.sin(angle) * 10.5 }};
          return {{ ...e, hp: Math.max(0, e.hp - 25), hurtTime: 18, knockback: kb }};
        }}
        return e;
      }});
    }}

    function executeWhirlingBlade() {{
      spinAnim = {{ x: px, y: py, timer: 20, maxTimer: 20 }};
      enemies = enemies.map(e => {{
        if (e.hp > 0 && Math.hypot(e.x - px, e.y - py) < 75) {{
          const angle = Math.atan2(e.y - py, e.x - px);
          const kb = {{ vx: Math.cos(angle) * 15.0, vy: Math.sin(angle) * 15.0 }};
          return {{ ...e, hp: Math.max(0, e.hp - 40), hurtTime: 20, knockback: kb }};
        }}
        return e;
      }});

      props.forEach(p => {{
        if (!p.destroyed && Math.hypot(p.x - px, p.y - py) < 55) {{
          if (p.type === 'pedestal') return;
          p.destroyed = true;
          droppedItems.push({{ x: p.x, y: p.y, type: 'rupee', timer: 300 }});
        }}
      }});
    }}

    function executeYItem() {{
      isSheathed = false;
      const isSwordBusy = bHeldTime > 0 || isCharging || (slashAnim && slashAnim.timer > 0) || swordCooldown > 0;
      inventoryState.setSwordLockout(isSwordBusy);

      const context = {{
        px,
        py,
        playerFacing,
        onBoomerangStep: (slot) => {{
          props.forEach(p => {{
            if (!p.destroyed && Math.hypot(p.x - slot.x, p.y - slot.y) < 24) {{
              if (p.type === 'pedestal') return;
              p.destroyed = true;
              droppedItems.push({{ x: p.x, y: p.y, type: 'rupee', timer: 300 }});
            }}
          }});
          enemies.forEach(e => {{
            if (e.hp > 0 && Math.hypot(e.x - slot.x, e.y - slot.y) < 26) {{
              e.hp = Math.max(0, e.hp - 15);
              e.hurtTime = 18;
              if (slot.state) slot.state.returning = true;
            }}
          }});
        }},
        onArrowStep: (slot) => {{
          let hit = false;
          enemies.forEach(e => {{
            if (e.hp > 0 && Math.hypot(e.x - slot.x, e.y - slot.y) < 22) {{
              e.hp = Math.max(0, e.hp - 20);
              e.hurtTime = 18;
              hit = true;
            }}
          }});
          return hit;
        }}
      }};

      const res = inventoryState.executeEquippedYItem(context, ancillaEngine);
      if (!res.success) return;
    }}

    function executeInteract() {{
      props.forEach(p => {{
        if (!p.destroyed && Math.hypot(px - p.x, py - p.y) < 32) {{
          if (p.type === 'pedestal' && p.itemId) {{
            inventoryState.setEquippedYItem(p.itemId);
            activeYItem = inventoryState.equippedYItemId || p.itemId;
          }}
        }}
      }});
      playerHp = Math.min(playerMaxHp, playerHp + 10);
    }}

    function update() {{
      tickCount++;
      // Balanced movement speed: 2.2 normal walk, 3.2 shift sprint (Zelda calibrated)
      let speed = keys['shift'] ? 3.2 : 2.2;
      let dx = 0, dy = 0;

      const up = keys['w'] || keys['arrowup'];
      const down = keys['s'] || keys['arrowdown'];
      const left = keys['a'] || keys['arrowleft'];
      const right = keys['d'] || keys['arrowright'];

      if (up) dy -= speed;
      if (down) dy += speed;
      if (left) dx -= speed;
      if (right) dx += speed;

      if (Math.hypot(joystickVector.x, joystickVector.y) > 0.12) {{
        dx = joystickVector.x * speed;
        dy = joystickVector.y * speed;
      }}

      // 8-directional movement with 4-directional facing & first-input priority latch
      const isH = Math.abs(dx) > 0.05;
      const isV = Math.abs(dy) > 0.05;
      if (isH && isV) {{
        // Moving diagonally: latch to current facing if it matches one of the active axes
        const matchesH = (dx > 0 && playerFacing === 'RIGHT') || (dx < 0 && playerFacing === 'LEFT');
        const matchesV = (dy > 0 && playerFacing === 'DOWN') || (dy < 0 && playerFacing === 'UP');
        if (!matchesH && !matchesV) {{
          playerFacing = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'RIGHT' : 'LEFT') : (dy > 0 ? 'DOWN' : 'UP');
        }}
      }} else if (isH) {{
        playerFacing = dx > 0 ? 'RIGHT' : 'LEFT';
      }} else if (isV) {{
        playerFacing = dy > 0 ? 'DOWN' : 'UP';
      }}

      // Hit animation stun delay: attack swing commits player (~0.3s) or player hurt stun
      if ((slashAnim && slashAnim.timer > 0) || playerHurtTime > 0) {{
        dx = 0;
        dy = 0;
      }}

      isMoving = Math.hypot(dx, dy) > 0.1;

      // 45° Diagonal Wall-Sliding Vector Math
      const testX = px + dx + playerKnockback.vx;
      const testY = py + dy + playerKnockback.vy;
      if (testX < 24 || testX > mapWorldWidth - 24) {{
        dx = 0; // Perpendicular horizontal incidence zeroes out, vertical slide preserved
      }}
      if (testY < 24 || testY > mapWorldHeight - 24) {{
        dy = 0; // Perpendicular vertical incidence zeroes out, horizontal slide preserved
      }}

      px += dx + playerKnockback.vx;
      py += dy + playerKnockback.vy;
      playerKnockback.vx *= 0.85;
      playerKnockback.vy *= 0.85;

      px = Math.max(24, Math.min(mapWorldWidth - 24, px));
      py = Math.max(24, Math.min(mapWorldHeight - 24, py));

      // Threshold Doorway Transitions: Shadow Cave (Supertile 0x00) <-> Empty 8x8 Overworld Grid (Sector 0x1B)
      if (currentLevelSlug === 'shadow_cave' && py >= 468 && Math.abs(px - 256) < 28) {{
        setDebugRoom('overworld_grid', 1792, 1808);
      }} else if (currentLevelSlug === 'overworld_grid' && Math.abs(px - 1792) < 24 && Math.abs(py - 1784) < 16) {{
        setDebugRoom('shadow_cave', 256, 420);
      }}

      if (keys['b'] || keys['j'] || keys['z']) {{
        bHeldTime++;
        if (bHeldTime > 25) isCharging = true;
      }} else {{
        if (isCharging) executeWhirlingBlade();
        bHeldTime = 0;
        isCharging = false;
      }}

      if (swordCooldown > 0) swordCooldown--;
      if (playerHurtTime > 0) playerHurtTime--;

      // Step inventory lockout timers ($3C sword lockout & $0301 action commit)
      const isSwordBusy = bHeldTime > 0 || isCharging || (slashAnim && slashAnim.timer > 0);
      inventoryState.setSwordLockout(isSwordBusy);
      inventoryState.tickLockouts();

      // Step 10-Slot Ancilla Engine (ALttP $0C4A Parallel Slot Architecture)
      ancillaEngine.updateAll({{
        px,
        py,
        onBoomerangStep: (slot) => {{
          props.forEach(p => {{
            if (!p.destroyed && Math.hypot(p.x - slot.x, p.y - slot.y) < 24) {{
              if (p.type === 'pedestal') return;
              p.destroyed = true;
              droppedItems.push({{ x: p.x, y: p.y, type: 'rupee', timer: 300 }});
            }}
          }});
          enemies.forEach(e => {{
            if (e.hp > 0 && Math.hypot(e.x - slot.x, e.y - slot.y) < 26) {{
              e.hp = Math.max(0, e.hp - 15);
              e.hurtTime = 18;
              if (slot.state) slot.state.returning = true;
            }}
          }});
        }},
        onArrowStep: (slot) => {{
          let hit = false;
          enemies.forEach(e => {{
            if (e.hp > 0 && Math.hypot(e.x - slot.x, e.y - slot.y) < 22) {{
              e.hp = Math.max(0, e.hp - 20);
              e.hurtTime = 18;
              hit = true;
            }}
          }});
          return hit;
        }}
      }});

      boomerangs = boomerangs.filter(b => {{
        if (!b.returning) {{
          b.x += b.vx;
          b.y += b.vy;
          b.life++;
          
          props.forEach(p => {{
            if (!p.destroyed && Math.hypot(p.x - b.x, p.y - b.y) < 22) {{
              if (p.type === 'pedestal') return;
              p.destroyed = true;
              droppedItems.push({{ x: p.x, y: p.y, type: 'heart', timer: 300 }});
            }}
          }});

          enemies.forEach(e => {{
            if (e.hp > 0 && Math.hypot(e.x - b.x, e.y - b.y) < 26) {{
              e.hp = Math.max(0, e.hp - 15);
              e.hurtTime = 18; // 0.3s stun
              b.returning = true;
            }}
          }});

          if (b.x < 30 || b.x > mapWorldWidth - 30 || b.y < 30 || b.y > mapWorldHeight - 30 || b.life > 28) {{
            b.returning = true;
          }}
        }} else {{
          const dist = Math.hypot(px - b.x, py - b.y);
          if (dist < 16) return false;
          b.x += ((px - b.x) / dist) * 9;
          b.y += ((py - b.y) / dist) * 9;
        }}
        return true;
      }});

      otherProjectiles = otherProjectiles.filter(p => {{
        p.x += p.vx;
        p.y += p.vy;
        p.timer--;
        enemies.forEach(e => {{
          if (e.hp > 0 && Math.hypot(e.x - p.x, e.y - p.y) < 22) {{
            e.hp = Math.max(0, e.hp - 20);
            e.hurtTime = 18; // 0.3s stun
            p.timer = 0;
          }}
        }});
        return p.timer > 0 && p.x > 10 && p.x < mapWorldWidth - 10 && p.y > 10 && p.y < mapWorldHeight - 10;
      }});

      droppedItems = droppedItems.filter(i => {{
        i.timer--;
        if (Math.hypot(px - i.x, py - i.y) < 16) {{
          playerHp = Math.min(playerMaxHp, playerHp + (i.type === 'heart' ? 20 : 10));
          return false;
        }}
        return i.timer > 0;
      }});

      // State-Driven Enemy AI (Awareness -> Stun Pause -> Lock-On -> Blind Charge -> Cooldown)
      enemies = enemies.map(e => {{
        if (e.hp <= 0) return e;
        let ex = e.x + e.knockback.vx;
        let ey = e.y + e.knockback.vy;
        e.knockback.vx *= 0.85;
        e.knockback.vy *= 0.85;

        let state = e.aiState || 'PATROL';
        let timer = e.aiTimer || 0;
        let tx = e.targetX || ex;
        let ty = e.targetY || ey;
        let cvx = e.chargeVx || 0;
        let cvy = e.chargeVy || 0;
        let pvx = e.patrolVx || 0;
        let pvy = e.patrolVy || 0;

        const distToPlayer = Math.hypot(px - ex, py - ey);

        // Taking damage interrupts any active state into HURT knockback stun
        if (e.hurtTime > 0) {{
          state = 'HURT';
          timer = e.hurtTime;
        }} else if (state === 'HURT') {{
          state = 'COOLDOWN';
          timer = 30; // 0.5s recovery post-hurt
        }}

        if (state === 'PATROL') {{
          // Slow wander pace
          timer--;
          if (timer <= 0) {{
            timer = 50 + Math.floor(Math.random() * 40);
            const angle = Math.random() * Math.PI * 2;
            const wanderSpeed = e.type === 'guard' ? 0.6 : 0.4;
            pvx = Math.cos(angle) * wanderSpeed;
            pvy = Math.sin(angle) * wanderSpeed;
          }}
          ex += pvx;
          ey += pvy;

          // Stage 1: Awareness detection within 160px
          if (distToPlayer < 160) {{
            state = 'ALERT';
            timer = 20; // 20 frames (~0.33s) startled pause with '!'
            pvx = 0; pvy = 0;
          }}
        }} else if (state === 'ALERT') {{
          // Stage 2: Brief stunned awareness pause
          timer--;
          if (timer <= 0) {{
            state = 'LOCK_ON';
            timer = 26; // 26 frames (~0.43s) telegraph delay
            // Lock Link's position at start of lock-on
            tx = px;
            ty = py;
          }}
        }} else if (state === 'LOCK_ON') {{
          // Stage 3: Telegraph delay - enemy freezes & aims at locked target position
          // Giving the player ample time to dodge/move!
          timer--;
          if (timer <= 0) {{
            state = 'CHARGE';
            timer = 35; // Max blind charge duration (~0.6s)
            const chargeDist = Math.hypot(tx - ex, ty - ey);
            const chargeSpeed = e.type === 'guard' ? 2.6 : 1.8;
            if (chargeDist > 4) {{
              cvx = ((tx - ex) / chargeDist) * chargeSpeed;
              cvy = ((ty - ey) / chargeDist) * chargeSpeed;
            }} else {{
              cvx = 0; cvy = 0;
            }}
          }}
        }} else if (state === 'CHARGE') {{
          // Stage 4: Blind straight-line charge (does NOT track player mid-lunge)
          ex += cvx;
          ey += cvy;
          timer--;

          const distToTarget = Math.hypot(tx - ex, ty - ey);
          if (distToTarget < 12 || timer <= 0 || ex < 24 || ex > mapWorldWidth - 24 || ey < 24 || ey > mapWorldHeight - 24) {{
            state = 'COOLDOWN';
            timer = 40; // 40 frames (~0.67s) punish opening
            cvx = 0; cvy = 0;
          }}

          // Collision with Link during blind charge
          if (distToPlayer < 18 && playerHurtTime <= 0 && e.hurtTime <= 0) {{
            playerHp = Math.max(0, playerHp - (e.attack || (e.type === 'guard' ? 15 : 10)));
            playerHurtTime = 18; // 0.3s player damage stun
            const angle = Math.atan2(py - ey, px - ex);
            playerKnockback = {{ vx: Math.cos(angle) * 9.5, vy: Math.sin(angle) * 9.5 }};
            state = 'COOLDOWN';
            timer = 40;
            cvx = 0; cvy = 0;
          }}
        }} else if (state === 'COOLDOWN') {{
          // Stage 5: Cooldown / exhaustion recovery window (completely vulnerable)
          timer--;
          if (timer <= 0) {{
            if (distToPlayer < 140) {{
              state = 'ALERT';
              timer = 20;
            }} else {{
              state = 'PATROL';
              timer = 45;
            }}
          }}
        }}

        ex = Math.max(24, Math.min(mapWorldWidth - 24, ex));
        ey = Math.max(24, Math.min(mapWorldHeight - 24, ey));

        return {{
          ...e,
          x: ex,
          y: ey,
          aiState: state,
          aiTimer: timer,
          targetX: tx,
          targetY: ty,
          chargeVx: cvx,
          chargeVy: cvy,
          patrolVx: pvx,
          patrolVy: pvy,
          hurtTime: Math.max(0, e.hurtTime - 1)
        }};
      }});
    }}

    function render() {{
      ctx.fillStyle = '#050204';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const viewportWorldW = canvas.width / zoomScale; // 358.4px
      const viewportWorldH = canvas.height / zoomScale; // 358.4px

      // $0600 Equivalent Sector / Supertile Camera Scroll Clamps
      let clampMinX = 0, clampMinY = 0, clampMaxX = mapWorldWidth, clampMaxY = mapWorldHeight;
      if (currentLevelSlug === 'overworld_grid') {{
        const secCol = Math.max(0, Math.min(7, (Math.floor(px) >> 9) & 7));
        const secRow = Math.max(0, Math.min(7, (Math.floor(py) >> 9) & 7));
        clampMinX = secCol * 512;
        clampMinY = secRow * 512;
        clampMaxX = (secCol + 1) * 512;
        clampMaxY = (secRow + 1) * 512;
      }} else if (currentLevelSlug === 'shadow_cave') {{
        clampMinX = 0;
        clampMinY = 0;
        clampMaxX = 512;
        clampMaxY = 512;
      }}

      let camX = px - viewportWorldW / 2;
      let camY = py - viewportWorldH / 2;

      camX = Math.max(clampMinX, Math.min(Math.max(clampMinX, clampMaxX - viewportWorldW), camX));
      camY = Math.max(clampMinY, Math.min(Math.max(clampMinY, clampMaxY - viewportWorldH), camY));

      ctx.save();
      ctx.scale(zoomScale, zoomScale);
      ctx.translate(-camX, -camY);

      // Frustum culling bounds
      const minCol = Math.max(0, Math.floor(camX / tileUnitPx) - 1);
      const maxCol = Math.min(tilesW - 1, Math.ceil((camX + viewportWorldW) / tileUnitPx) + 1);
      const minRow = Math.max(0, Math.floor(camY / tileUnitPx) - 1);
      const maxRow = Math.min(tilesH - 1, Math.ceil((camY + viewportWorldH) / tileUnitPx) + 1);

      const isShadowCave = currentLevelSlug === 'shadow_cave';

      // 1. PASS 1 (BG1): Terrain metatile grid rendering
      for (let r = minRow; r <= maxRow; r++) {{
        for (let c = minCol; c <= maxCol; c++) {{
          const tx = c * tileUnitPx;
          const ty = r * tileUnitPx;
          const isBoundary = r === 0 || r === tilesH - 1 || c === 0 || c === tilesW - 1;
          const isSouthExitGap = isShadowCave && r === tilesH - 1 && c >= 15 && c <= 17;

          if (isBoundary && !isSouthExitGap) {{
            ctx.fillStyle = isShadowCave ? '#1f1924' : '#1c281e';
            ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
            ctx.fillStyle = isShadowCave ? '#2d2436' : '#2d4232';
            ctx.fillRect(tx + 2, ty + 2, tileUnitPx - 4, 12);
            ctx.strokeStyle = isShadowCave ? '#110c17' : '#0f1710';
            ctx.lineWidth = 1;
            ctx.strokeRect(tx, ty, tileUnitPx, tileUnitPx);
          }} else if (currentLevelSlug === 'debug_chamber') {{
            const isHallway = (c >= 30 && c <= 33) || (r >= 30 && r <= 33);
            if (isHallway) {{
              const altWay = (r + c) % 2 === 0;
              ctx.fillStyle = altWay ? '#52525b' : '#3f3f46';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
              ctx.strokeStyle = '#27272a';
              ctx.lineWidth = 0.5;
              ctx.strokeRect(tx, ty, tileUnitPx, tileUnitPx);
            }} else if (c < 30 && r < 30) {{
              const alt = (r + c) % 2 === 0;
              ctx.fillStyle = alt ? '#2e7d32' : '#256628';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
            }} else if (c > 33 && r < 30) {{
              const alt = (r + c) % 2 === 0;
              ctx.fillStyle = alt ? '#26262a' : '#1e1e22';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
              ctx.strokeStyle = '#333338';
              ctx.lineWidth = 0.5;
              ctx.strokeRect(tx + 1, ty + 1, tileUnitPx - 2, tileUnitPx - 2);
            }} else if (c < 30 && r > 33) {{
              const alt = (r + c) % 2 === 0;
              ctx.fillStyle = alt ? '#3f3f46' : '#27272a';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
            }} else {{
              const alt = (r + c) % 2 === 0;
              ctx.fillStyle = alt ? '#b45309' : '#92400e';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
            }}
          }} else if (isShadowCave) {{
            // Supertile 0x00: Shadow Cave (Home Base) — 32x32 metatiles (512x512px) with 4 Quadrants
            const isCenterPath = c >= 15 && c <= 17 && r >= 14;
            if (isCenterPath) {{
              ctx.fillStyle = '#7f1d1d';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
              ctx.fillStyle = '#991b1b';
              ctx.fillRect(tx + 2, ty + 2, tileUnitPx - 4, tileUnitPx - 4);
            }} else {{
              const alt = (r + c) % 2 === 0;
              ctx.fillStyle = alt ? '#26262a' : '#1e1e22';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
              ctx.strokeStyle = '#333338';
              ctx.lineWidth = 0.5;
              ctx.strokeRect(tx + 1, ty + 1, tileUnitPx - 2, tileUnitPx - 2);
            }}
            if (c === 16 || r === 16) {{
              ctx.strokeStyle = 'rgba(245, 158, 11, 0.16)';
              ctx.lineWidth = 1;
              ctx.strokeRect(tx, ty, tileUnitPx, tileUnitPx);
            }}
          }} else {{
            // Empty 8x8 Overworld Grid (4096x4096px, 64 Sectors of 512x512px)
            const altGrass = (r + c) % 2 === 0;
            ctx.fillStyle = altGrass ? '#1e3a24' : '#19311e';
            ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);

            if (c % 32 === 0 || r % 32 === 0) {{
              ctx.strokeStyle = 'rgba(52, 211, 153, 0.22)';
              ctx.lineWidth = 1;
              ctx.strokeRect(tx, ty, tileUnitPx, tileUnitPx);
            }}
          }}
        }}
      }}

      if (isShadowCave) {{
        ctx.fillStyle = '#18181b';
        ctx.fillRect(256 - 32, 112, 64, 32);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(256 - 32, 112, 64, 32);
        ctx.fillStyle = '#DE2626';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('SHADOW CAVE', 256 - 26, 126);
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '7px monospace';
        ctx.fillText('HOME BASE · 0x00', 256 - 30, 138);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(256 - 16, 480, 32, 12);
      }} else if (currentLevelSlug === 'overworld_grid') {{
        const caveX = 112 * tileUnitPx;
        const caveY = 112 * tileUnitPx;
        ctx.fillStyle = '#27272a';
        ctx.fillRect(caveX - 32, caveY - 28, 64, 40);
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 2;
        ctx.strokeRect(caveX - 32, caveY - 28, 64, 40);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(caveX - 14, caveY - 8, 28, 22);
      }}

      // 2. Y-Sorted Draw Queue for 2.5D Depth Sorting
      const renderQueue = [];

      props.forEach(pr => {{
        if (!pr.destroyed) renderQueue.push({{ sortY: pr.y + 6, type: 'prop', data: pr }});
      }});

      droppedItems.forEach(i => {{
        renderQueue.push({{ sortY: i.y, type: 'item', data: i }});
      }});

      if (currentLevelSlug === 'ganon_sanctuary') {{
        renderQueue.push({{ sortY: 150, type: 'ganon', data: null }});
      }}

      enemies.forEach(e => {{
        if (e.hp > 0) renderQueue.push({{ sortY: e.y + 10, type: 'enemy', data: e }});
      }});

      otherProjectiles.forEach(p => {{
        renderQueue.push({{ sortY: p.y, type: 'projectile', data: p }});
      }});

      // 10-Slot Parallel Ancilla Engine Entities & Particles (ALttP $0C4A Parity)
      ancillaEngine.getActiveAncillae().forEach(anc => {{
        renderQueue.push({{ sortY: anc.y, type: 'ancilla', data: anc }});
      }});

      boomerangs.forEach(b => {{
        renderQueue.push({{ sortY: b.y, type: 'boomerang', data: b }});
      }});

      renderQueue.push({{ sortY: py + 8, type: 'player', data: null }});

      renderQueue.sort((a, b) => a.sortY - b.sortY);

      // 3. Execute Y-Sorted Render Pass
      renderQueue.forEach(item => {{
        if (item.type === 'prop') {{
          const pr = item.data;
          if (pr.type === 'pedestal') {{
            ctx.fillStyle = '#451a03'; ctx.fillRect(pr.x - 14, pr.y - 2, 28, 12);
            ctx.fillStyle = '#f59e0b'; ctx.fillRect(pr.x - 12, pr.y - 12, 24, 10);
            ctx.strokeStyle = '#DE2626'; ctx.lineWidth = 1.5; ctx.strokeRect(pr.x - 12, pr.y - 12, 24, 10);
            ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(pr.icon || '🪃', pr.x, pr.y - 16);
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px monospace';
            ctx.fillText(pr.title || 'ITEM', pr.x, pr.y + 18);
          }} else if (pr.type === 'pot') {{
            ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(pr.x, pr.y + 1, 9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(pr.x - 2, pr.y - 1, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#78350f'; ctx.fillRect(pr.x - 7, pr.y - 7, 14, 3);
          }} else {{
            ctx.fillStyle = '#14532d'; ctx.beginPath(); ctx.arc(pr.x, pr.y + 2, 11, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.arc(pr.x - 2, pr.y - 1, 9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(pr.x - 4, pr.y - 3, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ef4444'; ctx.fillRect(pr.x + 3, pr.y - 2, 2, 2);
          }}
        }} else if (item.type === 'item') {{
          const drop = item.data;
          ctx.fillStyle = drop.type === 'heart' ? '#DE2626' : '#10b981';
          ctx.fillRect(drop.x - 4, drop.y - 4, 8, 8);
        }} else if (item.type === 'ganon') {{
          ctx.fillStyle = '#7f1d1d'; ctx.fillRect(470, 110, 84, 50);
          ctx.strokeStyle = '#f59e0b'; ctx.strokeRect(470, 110, 84, 50);
          [440, 584].forEach(torchX => {{
            ctx.fillStyle = '#334155'; ctx.fillRect(torchX - 6, 120, 12, 24);
            ctx.fillStyle = tickCount % 10 < 5 ? '#f97316' : '#ef4444';
            ctx.beginPath(); ctx.arc(torchX, 114, 6, 0, Math.PI * 2); ctx.fill();
          }});
          const gx = 512, gy = 135;
          ctx.fillStyle = '#991b1b'; ctx.fillRect(gx - 20, gy - 10, 40, 30);
          ctx.fillStyle = '#312e81'; ctx.fillRect(gx - 14, gy - 8, 28, 24);
          ctx.fillStyle = '#1e1b4b'; ctx.beginPath(); ctx.arc(gx, gy - 16, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ef4444'; ctx.fillRect(gx - 7, gy - 19, 4, 3); ctx.fillRect(gx + 3, gy - 19, 4, 3);
        }} else if (item.type === 'enemy') {{
          const e = item.data;
          const sprKey = e.type === 'guard' ? 'guard_sheet' : 'slime_sheet';
          const img = spriteImages[sprKey];
          if (img && img.complete) {{
            ctx.drawImage(img, e.x - 16, e.y - 16, 32, 32);
          }} else {{
            ctx.fillStyle = e.hurtTime > 0 ? '#ffffff' : (e.type === 'guard' ? '#2563eb' : '#16a34a');
            ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
            ctx.strokeStyle = '#000'; ctx.strokeRect(e.x - 10, e.y - 10, 20, 20);
          }}
          ctx.fillStyle = '#18181b'; ctx.fillRect(e.x - 12, e.y - 18, 24, 3);
          ctx.fillStyle = '#DE2626'; ctx.fillRect(e.x - 12, e.y - 18, (e.hp / e.maxHp) * 24, 3);

          // State Indicators: ALERT (!), LOCK_ON (pulsing ! & crosshair), COOLDOWN (•••)
          if (e.aiState === 'ALERT') {{
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath(); ctx.arc(e.x, e.y - 26, 7, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#000000'; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = '#000000'; ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('!', e.x, e.y - 26);
          }} else if (e.aiState === 'LOCK_ON') {{
            const pulse = (tickCount % 6 < 3);
            ctx.fillStyle = pulse ? '#DE2626' : '#f97316';
            ctx.beginPath(); ctx.arc(e.x, e.y - 26, 7, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('!', e.x, e.y - 26);

            // Red target crosshair at locked (targetX, targetY)
            ctx.strokeStyle = '#DE2626'; ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(e.targetX, e.targetY, 6, 0, Math.PI * 2);
            ctx.moveTo(e.targetX - 9, e.targetY); ctx.lineTo(e.targetX + 9, e.targetY);
            ctx.moveTo(e.targetX, e.targetY - 9); ctx.lineTo(e.targetX, e.targetY + 9);
            ctx.stroke();
          }} else if (e.aiState === 'COOLDOWN') {{
            ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('•••', e.x, e.y - 24);
          }}
        }} else if (item.type === 'projectile') {{
          const p = item.data;
          ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - 2, p.y - 2, 5, 5);
        }} else if (item.type === 'boomerang') {{
          const b = item.data;
          ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
        }} else if (item.type === 'ancilla') {{
          const anc = item.data;
          if (typeof anc.onRender === 'function') anc.onRender(anc, ctx);
        }} else if (item.type === 'player') {{
          const isHurt = playerHurtTime > 0 && Math.floor(playerHurtTime / 3) % 2 === 0;

          const renderShield = () => {{
            if (playerFacing === 'UP') {{
              ctx.fillStyle = '#000000'; ctx.fillRect(px - 6, py - 8, 12, 15);
              ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.strokeRect(px - 6, py - 8, 12, 15);
              ctx.fillStyle = '#DE2626'; ctx.beginPath(); ctx.moveTo(px - 4, py - 5); ctx.lineTo(px + 4, py - 5); ctx.lineTo(px, py + 4); ctx.closePath(); ctx.fill();
            }} else {{
              const sX = playerFacing === 'LEFT' ? px - 12 : (playerFacing === 'RIGHT' ? px + 2 : px - 12);
              ctx.fillStyle = '#000000'; ctx.fillRect(sX, py - 3, 12, 15);
              ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.strokeRect(sX, py - 3, 12, 15);
              ctx.fillStyle = '#DE2626'; ctx.fillRect(sX + 2, py, 8, 8);
            }}
          }};

          if (playerFacing === 'UP') renderShield();

          const linkImg = spriteImages['shadow_link_sheet'];
          if (linkImg && linkImg.complete && !isHurt) {{
            ctx.drawImage(linkImg, px - 16, py - 16, 32, 32);
          }} else {{
            ctx.fillStyle = isHurt ? '#ffffff' : '#000000'; ctx.fillRect(px - 9, py - 10, 18, 20);
            ctx.fillStyle = '#DE2626'; ctx.fillRect(px - 3, py, 6, 4);
            ctx.fillStyle = '#DE2626';
            if (playerFacing === 'DOWN') {{ ctx.fillRect(px - 6, py - 7, 4, 3); ctx.fillRect(px + 2, py - 7, 4, 3); }}
            else if (playerFacing === 'LEFT') ctx.fillRect(px - 7, py - 7, 4, 3);
            else if (playerFacing === 'RIGHT') ctx.fillRect(px + 3, py - 7, 4, 3);
          }}

          if (playerFacing !== 'UP') renderShield();

          if (slashAnim && slashAnim.timer > 0) {{
            let baseAngle = Math.PI / 2;
            if (slashAnim.dir === 'UP') baseAngle = -Math.PI / 2;
            if (slashAnim.dir === 'LEFT') baseAngle = Math.PI;
            if (slashAnim.dir === 'RIGHT') baseAngle = 0;

            const sweepSpan = Math.PI * 1.2;
            ctx.fillStyle = 'rgba(222, 38, 38, 0.45)'; ctx.beginPath();
            ctx.arc(px, py, 44, baseAngle - sweepSpan * 0.5, baseAngle + sweepSpan * 0.5);
            ctx.lineTo(px, py); ctx.fill();

            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath();
            ctx.arc(px, py, 40, baseAngle - sweepSpan * 0.5, baseAngle + sweepSpan * 0.5); ctx.stroke();
            slashAnim.timer--;
          }}

          if (spinAnim && spinAnim.timer > 0) {{
            ctx.fillStyle = 'rgba(222, 38, 38, 0.3)'; ctx.beginPath();
            ctx.arc(px, py, 50, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#DE2626'; ctx.lineWidth = 5; ctx.beginPath();
            ctx.arc(px, py, 45, 0, Math.PI * 2); ctx.stroke();
            spinAnim.timer--;
          }}
        }}
      }});

      // PASS 3 (BG2): PRIORITY OCCLUSION LAYER (Overhead Arches & Lintels)
      if (isShadowCave) {{
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(256 - 28, 464, 56, 12);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(256 - 28, 464, 56, 12);
      }} else if (currentLevelSlug === 'overworld_grid') {{
        const caveX = 112 * tileUnitPx;
        const caveY = 112 * tileUnitPx;
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(caveX - 24, caveY - 18, 48, 12);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(caveX - 24, caveY - 18, 48, 12);
      }}

      ctx.restore();

      // Top In-Canvas HUD
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, canvas.width, 32);
      ctx.fillStyle = '#DE2626'; ctx.font = 'bold 11px monospace';
      const curItem = inventoryState.getEquippedYItem();
      const yItemLabel = curItem ? `${{curItem.icon}} ${{curItem.name.toUpperCase()}}` : (activeYItem === 'shadow_boomerang' ? '🪃 BOOMERANG' : '🏹 DARK BOW');
      ctx.fillText(`SHADOW LINK | HP: ${{playerHp}}/${{playerMaxHp}} | Y: ${{yItemLabel}}`, 12, 20);

      // Bottom In-Canvas HUD with O(1) Spatial Sector / Supertile Telemetry
      ctx.fillStyle = '#09090b'; ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
      ctx.fillStyle = '#10b981'; ctx.font = '10px monospace';
      if (currentLevelSlug === 'overworld_grid') {{
        const secCol = (Math.floor(px) >> 9) & 7;
        const secRow = (Math.floor(py) >> 9) & 7;
        const secId = (secRow << 3) | secCol;
        const secHex = '0x' + secId.toString(16).toUpperCase().padStart(2, '0');
        ctx.fillText(`OVERWORLD SEC ${{secHex}} (${{secCol}},${{secRow}}) | XY:(${{Math.round(px)}},${{Math.round(py)}})`, 12, canvas.height - 8);
      }} else if (currentLevelSlug === 'shadow_cave') {{
        const qx = (Math.floor(px) >> 8) & 1;
        const qy = (Math.floor(py) >> 8) & 1;
        const qLabel = ['NW', 'NE', 'SW', 'SE'][(qy << 1) | qx] || 'NW';
        ctx.fillText(`SHADOW CAVE [ST 0x00 · Q:${{qLabel}}] | XY:(${{Math.round(px)}},${{Math.round(py)}})`, 12, canvas.height - 8);
      }} else {{
        ctx.fillText(`DEBUG DOMAIN (${{tilesW}}x${{tilesH}}) | XY:(${{Math.round(px)}},${{Math.round(py)}})`, 12, canvas.height - 8);
      }}
    }}

    function gameLoop() {{
      update();
      render();
      requestAnimationFrame(gameLoop);
    }}

    requestAnimationFrame(gameLoop);
  </script>
</body>
</html>
"""

    with open(standalone_html_path, "w", encoding="utf-8") as html_out:
        html_out.write(html_template)

    log.info("-" * 60)
    log.info(f"[SUCCESS] Compiled {len(collected_datasets)} raw BEJSON datasets into standalone files:")
    log.info(f"          1. Dataset Bundle JSON: -> {compiled_file_path}")
    log.info(f"          2. Single-File HTML Game: -> {standalone_html_path}")
    log.info("=" * 60)

def show_compiler_menu():
    config = load_config()
    raw_path, compiled_path, engine_path = resolve_paths(config)
    while True:
        _ui("\n" + "=" * 60)
        _ui("  SWORD SLASHER RPG: BEJSON COMPILER & ENGINE MENU")
        _ui("=" * 60)
        _ui(f"  Config Path:    {CONFIG_PATH}")
        _ui(f"  Engine Root:    {engine_path}")
        _ui(f"  Game Data Raw:  {raw_path}")
        _ui(f"  Compiled Path:  {compiled_path}")
        _ui("-" * 60)
        _ui("  [1] Compile BEJSON Data & Build Standalone HTML Game")
        _ui("  [2] Run Standalone BEJSON Chunker (data_chunker.py)")
        _ui("  [3] Print Persistent Config Details")
        _ui("  [0] Exit Menu")
        _ui("=" * 60)

        try:
            choice = input("Select an option [0-3]: ").strip()
        except (KeyboardInterrupt, EOFError):
            _ui("\nExiting compiler menu.")
            break

        if choice == "1":
            compile_bejson_datasets()
        elif choice == "2":
            chunker_script = os.path.join(COMPILER_DIR, "data_chunker.py")
            if os.path.exists(chunker_script):
                subprocess.run([sys.executable, chunker_script], check=False)
            else:
                log.error(f"Chunker script not found at {chunker_script}")
        elif choice == "3":
            _ui(json.dumps(config, indent=2))
        elif choice == "0":
            _ui("Exiting compiler menu.")
            break
        else:
            log.warning("Invalid selection. Please choose 0-3.")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    if len(sys.argv) > 1 and sys.argv[1] in ["--batch", "--compile", "-c"]:
        compile_bejson_datasets()
    else:
        show_compiler_menu()
