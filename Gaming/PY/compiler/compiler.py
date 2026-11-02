"""
Library:         compiler.py
Family:          Flask Parity Engine Data Compiler
Module Purpose:  BEJSON 105 Raw Data Compiler, Single-File Bundler & Standalone HTML Game Compiler with Relative Config Menu
Architecture:    Reads compiler/config.json pointing relatively to ../engine and ../game_data roots.
Version:         1.3.0
Release_Version: 300
Date:            2026-11-02
Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
Format_Creator:  Elton Boehnen
RELATIONAL_ID:   105a0600-2026-1102-9999-000000000604
"""

import os
import json
import sys

COMPILER_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(COMPILER_DIR, "config.json")

def load_config():
    if not os.path.exists(CONFIG_PATH):
        print(f"[Compiler Error] config.json not found at {CONFIG_PATH}")
        sys.exit(1)
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def resolve_paths(config):
    if config.get("use_external_raw", False):
        raw_path = os.path.abspath(os.path.join(COMPILER_DIR, config.get("external_raw_path", "../../../public/data")))
    else:
        raw_path = os.path.abspath(os.path.join(COMPILER_DIR, config.get("raw_data_path", "../game_data/raw")))

    compiled_path = os.path.abspath(os.path.join(COMPILER_DIR, config.get("compiled_data_path", "../game_data/compiled")))
    engine_path = os.path.abspath(os.path.join(COMPILER_DIR, config.get("engine_path", "../engine")))

    return raw_path, compiled_path, engine_path

def compile_bejson_datasets():
    print("=" * 60)
    print("  BEJSON 105 FLASK PARITY DATA COMPILER & SINGLE-FILE HTML BUILDER")
    print("=" * 60)

    config = load_config()
    raw_path, compiled_path, engine_path = resolve_paths(config)

    print(f"[*] Config Loaded:  {CONFIG_PATH}")
    print(f"[*] Engine Root:    {engine_path}")
    print(f"[*] Raw Data Root:  {raw_path}")
    print(f"[*] Compiled Root:  {compiled_path}")

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
                            print(f"  + Scanned dataset: {rel_name} ({rec_count} records)")
                    except Exception as err:
                        print(f"  ! Warning: Failed reading {rel_name}: {err}")
    else:
        print(f"[!] Target raw path does not exist: {raw_path}")

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

    standalone_html_path = os.path.join(compiled_path, "standalone_game.html")
    data_json_str = json.dumps(single_bundle_payload, indent=2)

    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Sword Slasher RPG: Shadow Link's Awakening (Standalone Single-File HTML Game)</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; touch-action: manipulation; }}
    body {{ background-color: #000; color: #fff; font-family: monospace; display: flex; flex-direction: column; height: 100vh; overflow: hidden; select-none: none; }}
    header {{ background: #09090b; border-bottom: 2px solid #DE2626; padding: 10px 20px; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; }}
    h1 {{ color: #fff; font-size: 15px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold; }}
    .badge {{ background: #DE2626; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }}
    .subtitle {{ color: #DE2626; font-size: 11px; margin-top: 2px; }}
    main {{ flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #050505; position: relative; padding: 8px; overflow: hidden; }}
    #canvas-container {{ border: 2px solid #DE2626; box-shadow: 0 0 30px rgba(222,38,38,0.4); background: #000; position: relative; max-width: 100%; }}
    canvas {{ display: block; image-rendering: pixelated; max-width: 100%; height: auto; }}
    
    #gamepad-deck {{ width: 100%; max-width: 720px; background: rgba(9, 9, 11, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 10px 20px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center; gap: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); flex-shrink: 0; }}
    .joystick-outer {{ position: relative; width: 110px; height: 110px; background: #18181b; border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; touch-action: none; cursor: pointer; }}
    .joystick-knob {{ position: absolute; width: 46px; height: 46px; background: #27272a; border: 2px solid #dc2626; border-radius: 50%; box-shadow: 0 0 10px rgba(220,38,38,0.5); display: flex; align-items: center; justify-content: center; pointer-events: none; }}
    .joystick-core {{ width: 18px; height: 18px; background: #DE2626; border-radius: 50%; border: 1px solid #f87171; }}
    
    .center-pills {{ display: flex; flex-direction: column; align-items: center; gap: 8px; background: rgba(24, 24, 27, 0.8); padding: 8px 14px; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; }}
    .pill-row {{ display: flex; align-items: center; gap: 6px; }}
    .pill-btn {{ width: 32px; height: 10px; background: #27272a; border: 1px solid #52525b; border-radius: 10px; transform: rotate(-15deg); cursor: pointer; }}
    .pill-label {{ font-size: 8px; font-weight: bold; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; }}
    
    .action-cluster {{ position: relative; width: 120px; height: 120px; background: rgba(24, 24, 27, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; }}
    .act-btn {{ position: absolute; width: 40px; height: 40px; border-radius: 50%; font-size: 13px; font-weight: bold; color: #fff; display: flex; align-items: center; justify-content: center; border: 1px solid #fff; cursor: pointer; user-select: none; box-shadow: 0 4px 10px rgba(0,0,0,0.6); transition: transform 0.1s; }}
    .btn-x {{ top: 2px; background: #18181b; border-color: #71717a; }}
    .btn-y {{ left: 2px; background: #581c87; border-color: #c084fc; }}
    .btn-b {{ bottom: 2px; background: #DE2626; border-color: #f87171; }}
    .btn-a {{ right: 2px; background: #047857; border-color: #34d399; }}
    .act-btn:active {{ transform: scale(0.9); filter: brightness(1.2); }}

    #intro-screen {{ position: absolute; inset: 0; z-index: 100; background: #050204; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; border-radius: 8px; }}

    footer {{ background: #09090b; border-top: 1px solid #27272a; padding: 6px 20px; font-size: 10px; color: #71717a; text-align: center; flex-shrink: 0; }}
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
        <h1 style="font-size: 26px; color: #fff; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; margin-bottom: 6px;">SHADOW LINK</h1>
        <p style="font-size: 11px; color: #DE2626; font-weight: bold; font-family: monospace; letter-spacing: 1px; margin-bottom: 20px;">SWORD SLASHER RPG: SHADOW LINK'S AWAKENING</p>
        <button id="btn-start-game" style="padding: 12px 28px; background: #DE2626; color: #fff; font-size: 13px; font-weight: bold; font-family: monospace; border: 1px solid #f87171; border-radius: 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 20px rgba(222,38,38,0.6);">START GAME</button>
        <p style="font-size: 10px; color: #71717a; font-family: monospace; margin-top: 20px;">Author: Elton Boehnen · BEJSON 105 Pure Data Engine</p>
      </div>
      <canvas id="gameCanvas" width="800" height="480"></canvas>
    </div>

    <div id="gamepad-deck">
      <div id="joystick" class="joystick-outer">
        <div id="joystick-knob" class="joystick-knob">
          <div class="joystick-core"></div>
        </div>
      </div>

      <div class="center-pills">
        <div class="pill-row">
          <button id="btn-select" class="pill-btn"></button>
          <span class="pill-label">SELECT</span>
        </div>
        <div class="pill-row">
          <button id="btn-start" class="pill-btn" style="background: #DE2626; border-color: #f87171;"></button>
          <span class="pill-label">START</span>
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

    let px = 320, py = 240;
    let playerFacing = 'UP';
    let playerHp = 120, playerMaxHp = 120;
    let playerHurtTime = 0;
    let playerKnockback = {{ vx: 0, vy: 0 }};
    let isMoving = false, isSheathed = false;
    let bHeldTime = 0, isCharging = false;
    let swordCooldown = 0;
    let slashAnim = null, spinAnim = null;

    let boomerangs = [];
    let droppedItems = [];

    const mapWorldWidth = 1024;
    const mapWorldHeight = 768;
    const zoomScale = 1.25;

    let props = [
      {{ id: 'p1', x: 260, y: 180, type: 'pot', destroyed: false }},
      {{ id: 'p2', x: 300, y: 180, type: 'bush', destroyed: false }},
      {{ id: 'p3', x: 500, y: 220, type: 'pot', destroyed: false }},
      {{ id: 'p4', x: 540, y: 220, type: 'bush', destroyed: false }}
    ];

    let enemies = [
      {{ id: 'e1', type: 'guard', x: 200, y: 150, hp: 60, maxHp: 60, hurtTime: 0, knockback: {{ vx: 0, vy: 0 }} }},
      {{ id: 'e2', type: 'slime', x: 580, y: 150, hp: 35, maxHp: 35, hurtTime: 0, knockback: {{ vx: 0, vy: 0 }} }},
      {{ id: 'e3', type: 'guard', x: 400, y: 120, hp: 60, maxHp: 60, hurtTime: 0, knockback: {{ vx: 0, vy: 0 }} }}
    ];

    const keys = {{}};
    let joystickVector = {{ x: 0, y: 0 }};

    window.addEventListener('keydown', e => {{
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (k === 'j' || k === 'z' || k === 'b') executeSwordSlash();
      if (k === 'y' || k === 'i') executeYItem();
      if (k === 'e' || k === 'a' || e.key === ' ') executeInteract();
    }});

    window.addEventListener('keyup', e => {{
      keys[e.key.toLowerCase()] = false;
    }});

    const joyEl = document.getElementById('joystick');
    const knobEl = document.getElementById('joystick-knob');
    let isJoyDragging = false;

    function handleJoystickPointer(clientX, clientY) {{
      const rect = joyEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const maxRadius = 30;
      const dist = Math.hypot(dx, dy);

      if (dist > maxRadius) {{
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }}

      knobEl.style.transform = `translate(${{dx}}px, ${{dy}}px)`;

      if (dist < 8) {{
        joystickVector = {{ x: 0, y: 0 }};
      }} else {{
        joystickVector = {{ x: dx / maxRadius, y: dy / maxRadius }};
      }}
    }}

    function resetJoystick() {{
      isJoyDragging = false;
      knobEl.style.transform = 'translate(0px, 0px)';
      joystickVector = {{ x: 0, y: 0 }};
    }}

    joyEl.addEventListener('mousedown', e => {{ isJoyDragging = true; handleJoystickPointer(e.clientX, e.clientY); }});
    joyEl.addEventListener('touchstart', e => {{ isJoyDragging = true; if (e.touches.length > 0) handleJoystickPointer(e.touches[0].clientX, e.touches[0].clientY); }}, {{ passive: false }});

    window.addEventListener('mousemove', e => {{ if (isJoyDragging) handleJoystickPointer(e.clientX, e.clientY); }});
    window.addEventListener('touchmove', e => {{ if (isJoyDragging && e.touches.length > 0) handleJoystickPointer(e.touches[0].clientX, e.touches[0].clientY); }}, {{ passive: false }});

    const btnStartGame = document.getElementById('btn-start-game');
    if (btnStartGame) {{
      btnStartGame.addEventListener('click', () => {{
        document.getElementById('intro-screen').style.display = 'none';
      }});
    }}

    window.addEventListener('mouseup', resetJoystick);
    window.addEventListener('touchend', resetJoystick);

    document.getElementById('btn-b').addEventListener('click', () => executeSwordSlash());
    document.getElementById('btn-y').addEventListener('click', () => executeYItem());
    document.getElementById('btn-a').addEventListener('click', () => executeInteract());
    document.getElementById('btn-x').addEventListener('click', () => {{ isSheathed = !isSheathed; }});

    function executeSwordSlash() {{
      if (isSheathed) {{ isSheathed = false; return; }}
      if (swordCooldown > 0 || (slashAnim && slashAnim.timer > 0)) return;

      slashAnim = {{ x: px, y: py, dir: playerFacing, timer: 14, maxTimer: 14 }};
      swordCooldown = 16;

      let hx = px, hy = py;
      const reach = 35;
      if (playerFacing === 'UP') hy -= reach;
      if (playerFacing === 'DOWN') hy += reach;
      if (playerFacing === 'LEFT') hx -= reach;
      if (playerFacing === 'RIGHT') hx += reach;

      props.forEach(p => {{
        if (!p.destroyed && Math.hypot(p.x - hx, p.y - hy) < 26) {{
          p.destroyed = true;
          droppedItems.push({{ x: p.x, y: p.y, type: 'heart', timer: 300 }});
        }}
      }});

      enemies = enemies.map(e => {{
        if (e.hp > 0 && Math.hypot(e.x - hx, e.y - hy) < 32) {{
          const angle = Math.atan2(e.y - py, e.x - px);
          const kb = {{ vx: Math.cos(angle) * 8, vy: Math.sin(angle) * 8 }};
          return {{ ...e, hp: Math.max(0, e.hp - 25), hurtTime: 14, knockback: kb }};
        }}
        return e;
      }});
    }}

    function executeWhirlingBlade() {{
      spinAnim = {{ x: px, y: py, timer: 18, maxTimer: 18 }};
      enemies = enemies.map(e => {{
        if (e.hp > 0 && Math.hypot(e.x - px, e.y - py) < 65) {{
          const angle = Math.atan2(e.y - py, e.x - px);
          const kb = {{ vx: Math.cos(angle) * 12, vy: Math.sin(angle) * 12 }};
          return {{ ...e, hp: Math.max(0, e.hp - 40), hurtTime: 16, knockback: kb }};
        }}
        return e;
      }});
    }}

    function executeYItem() {{
      isSheathed = false;
      let vx = 0, vy = 0;
      if (playerFacing === 'UP') vy = -8;
      if (playerFacing === 'DOWN') vy = 8;
      if (playerFacing === 'LEFT') vx = -8;
      if (playerFacing === 'RIGHT') vx = 8;
      boomerangs.push({{ x: px, y: py, vx, vy, life: 0, returning: false, startX: px, startY: py }});
    }}

    function executeInteract() {{
      playerHp = Math.min(playerMaxHp, playerHp + 10);
    }}

    function update() {{
      let speed = keys['shift'] ? 4.0 : 2.6;
      let dx = 0, dy = 0;

      if (keys['w'] || keys['arrowup']) {{ dy -= speed; playerFacing = 'UP'; }}
      if (keys['s'] || keys['arrowdown']) {{ dy += speed; playerFacing = 'DOWN'; }}
      if (keys['a'] || keys['arrowleft']) {{ dx -= speed; playerFacing = 'LEFT'; }}
      if (keys['d'] || keys['arrowright']) {{ dx += speed; playerFacing = 'RIGHT'; }}

      if (Math.hypot(joystickVector.x, joystickVector.y) > 0.1) {{
        dx = joystickVector.x * speed;
        dy = joystickVector.y * speed;
        if (Math.abs(dx) > Math.abs(dy)) {{
          playerFacing = dx > 0 ? 'RIGHT' : 'LEFT';
        }} else {{
          playerFacing = dy > 0 ? 'DOWN' : 'UP';
        }}
      }}

      isMoving = Math.hypot(dx, dy) > 0.1;

      px += dx + playerKnockback.vx;
      py += dy + playerKnockback.vy;
      playerKnockback.vx *= 0.8;
      playerKnockback.vy *= 0.8;

      px = Math.max(24, Math.min(mapWorldWidth - 24, px));
      py = Math.max(24, Math.min(mapWorldHeight - 24, py));

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

      boomerangs = boomerangs.filter(b => {{
        if (!b.returning) {{
          b.x += b.vx;
          b.y += b.vy;
          b.life++;
          
          props.forEach(p => {{
            if (!p.destroyed && Math.hypot(p.x - b.x, p.y - b.y) < 18) {{
              p.destroyed = true;
              droppedItems.push({{ x: p.x, y: p.y, type: 'heart', timer: 300 }});
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

      droppedItems = droppedItems.filter(i => {{
        i.timer--;
        if (Math.hypot(px - i.x, py - i.y) < 16) {{
          playerHp = Math.min(playerMaxHp, playerHp + 20);
          return false;
        }}
        return i.timer > 0;
      }});

      enemies = enemies.map(e => {{
        if (e.hp <= 0) return e;
        let ex = e.x + e.knockback.vx, ey = e.y + e.knockback.vy;
        e.knockback.vx *= 0.8; e.knockback.vy *= 0.8;

        const dist = Math.hypot(px - ex, py - ey);
        if (dist < 160 && dist > 18) {{
          ex += ((px - ex) / dist) * (e.type === 'guard' ? 1.4 : 0.9);
          ey += ((py - ey) / dist) * (e.type === 'guard' ? 1.4 : 0.9);
        }}

        if (dist < 16 && playerHurtTime <= 0) {{
          playerHp = Math.max(0, playerHp - 10);
          playerHurtTime = 24;
          const angle = Math.atan2(py - ey, px - ex);
          playerKnockback = {{ vx: Math.cos(angle) * 9, vy: Math.sin(angle) * 9 }};
        }}
        return {{ ...e, x: ex, y: ey, hurtTime: Math.max(0, e.hurtTime - 1) }};
      }});
    }}

    function render() {{
      ctx.fillStyle = '#050204';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const viewportWorldW = canvas.width / zoomScale;
      const viewportWorldH = canvas.height / zoomScale;

      let camX = px - viewportWorldW / 2;
      let camY = py - viewportWorldH / 2;

      camX = Math.max(0, Math.min(mapWorldWidth - viewportWorldW, camX));
      camY = Math.max(0, Math.min(mapWorldHeight - viewportWorldH, camY));

      ctx.save();
      ctx.scale(zoomScale, zoomScale);
      ctx.translate(-camX, -camY);

      ctx.strokeStyle = '#1a080d';
      ctx.lineWidth = 1;
      for (let x = 0; x <= mapWorldWidth; x += 32) {{ ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, mapWorldHeight); ctx.stroke(); }}
      for (let y = 0; y <= mapWorldHeight; y += 32) {{ ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(mapWorldWidth, y); ctx.stroke(); }}

      props.forEach(p => {{
        if (p.destroyed) return;
        ctx.fillStyle = p.type === 'pot' ? '#b45309' : '#14532d';
        ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
        ctx.strokeStyle = '#000'; ctx.strokeRect(p.x - 8, p.y - 8, 16, 16);
      }});

      droppedItems.forEach(i => {{
        ctx.fillStyle = '#DE2626';
        ctx.fillRect(i.x - 4, i.y - 4, 8, 8);
      }});

      enemies.forEach(e => {{
        if (e.hp <= 0) return;
        const sprKey = e.type === 'guard' ? 'guard_sheet' : 'slime_sheet';
        const img = spriteImages[sprKey];
        if (img && img.complete) {{
          ctx.drawImage(img, e.x - 16, e.y - 16, 32, 32);
        }} else {{
          ctx.fillStyle = e.hurtTime > 0 ? '#ffffff' : (e.type === 'guard' ? '#2563eb' : '#16a34a');
          ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
          ctx.strokeStyle = '#000'; ctx.strokeRect(e.x - 10, e.y - 10, 20, 20);
        }}
        ctx.fillStyle = '#18181b';
        ctx.fillRect(e.x - 12, e.y - 18, 24, 3);
        ctx.fillStyle = '#DE2626';
        ctx.fillRect(e.x - 12, e.y - 18, (e.hp / e.maxHp) * 24, 3);
      }});

      boomerangs.forEach(b => {{
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
      }});

      const isHurt = playerHurtTime > 0 && Math.floor(playerHurtTime / 3) % 2 === 0;

      const renderShield = () => {{
        if (playerFacing === 'UP') {{
          ctx.fillStyle = '#000000'; ctx.fillRect(px - 6, py - 8, 12, 15);
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.strokeRect(px - 6, py - 8, 12, 15);
          ctx.fillStyle = '#DE2626';
          ctx.beginPath(); ctx.moveTo(px - 4, py - 5); ctx.lineTo(px + 4, py - 5); ctx.lineTo(px, py + 4); ctx.closePath(); ctx.fill();
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
        ctx.fillStyle = isHurt ? '#ffffff' : '#000000';
        ctx.fillRect(px - 9, py - 10, 18, 20);
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

        ctx.fillStyle = 'rgba(222, 38, 38, 0.4)';
        ctx.beginPath();
        ctx.arc(px, py, 32, baseAngle - Math.PI * 0.5, baseAngle + Math.PI * 0.5);
        ctx.lineTo(px, py);
        ctx.fill();

        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(px, py, 28, baseAngle - Math.PI * 0.5, baseAngle + Math.PI * 0.5); ctx.stroke();
        slashAnim.timer--;
      }}

      if (spinAnim && spinAnim.timer > 0) {{
        ctx.fillStyle = 'rgba(222, 38, 38, 0.3)';
        ctx.beginPath(); ctx.arc(px, py, 50, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#DE2626'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(px, py, 45, 0, Math.PI * 2); ctx.stroke();
        spinAnim.timer--;
      }}

      ctx.restore();

      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, canvas.width, 30);
      ctx.fillStyle = '#DE2626'; ctx.font = 'bold 11px monospace';
      ctx.fillText(`SHADOW LINK | HP: ${{playerHp}}/${{playerMaxHp}} | BEJSON 105 ENGINE CAMERA (ZOOM: 1.25x)`, 12, 19);
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

    print("-" * 60)
    print(f"[SUCCESS] Compiled {len(collected_datasets)} raw BEJSON datasets into standalone files:")
    print(f"          1. Dataset Bundle JSON: -> {compiled_file_path}")
    print(f"          2. Single-File HTML Game: -> {standalone_html_path}")
    print("=" * 60)

def show_compiler_menu():
    config = load_config()
    raw_path, compiled_path, engine_path = resolve_paths(config)
    while True:
        print("\n" + "=" * 60)
        print("  SWORD SLASHER RPG: BEJSON COMPILER & ENGINE MENU")
        print("=" * 60)
        print(f"  Config Path:    {CONFIG_PATH}")
        print(f"  Engine Root:    {engine_path}")
        print(f"  Game Data Raw:  {raw_path}")
        print(f"  Compiled Path:  {compiled_path}")
        print("-" * 60)
        print("  [1] Compile BEJSON Data & Build Standalone HTML Game")
        print("  [2] Run Standalone BEJSON Chunker (data_chunker.py)")
        print("  [3] Print Persistent Config Details")
        print("  [0] Exit Menu")
        print("=" * 60)

        try:
            choice = input("Select an option [0-3]: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting compiler menu.")
            break

        if choice == "1":
            compile_bejson_datasets()
        elif choice == "2":
            chunker_script = os.path.join(COMPILER_DIR, "data_chunker.py")
            if os.path.exists(chunker_script):
                os.system(f"python3 {chunker_script}")
            else:
                print(f"[!] Chunker script not found at {chunker_script}")
        elif choice == "3":
            print(json.dumps(config, indent=2))
        elif choice == "0":
            print("Exiting compiler menu.")
            break
        else:
            print("[!] Invalid selection. Please choose 0-3.")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ["--batch", "--compile", "-c"]:
        compile_bejson_datasets()
    else:
        show_compiler_menu()
