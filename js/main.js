/**
 * Library:         main.js
 * Family:          Vanilla JS Mirror Application
 * Module Purpose:  Standalone Vanilla JS Game Engine Client for BEJSON 105
 * Architecture:    BEJSON 105 Pure Data Engine & Canvas Renderer Mirror
 * Version:         3.1.1
 * Release_Version: 300
 * Date:            2026-10-27
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   105a0500-2026-1027-9999-000000000501
 */

import { bejsonCore } from '/src/lib/lib_js/lib_bejson_Core_bejson_core.js';
import { bejsonGaming } from '/src/lib/lib_js/lib_bejson_Gaming_engine.js';
import { shadowEngine } from '/src/lib/lib_js/lib_bejson_Gaming_shadow_engine.js';
import { BEJSONGamingScreenEffects } from '/src/lib/lib_js/lib_bejson_Gaming_screen_effects.js';

console.log("initializing...");

const screenEffects = new BEJSONGamingScreenEffects();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Active Vanilla Player & Game State
let px = 320;
let py = 300;
let playerFacing = 'DOWN';
let playerHp = 120;
let playerMaxHp = 120;

let isMoving = false;
let isSheathed = false;
let bHeldTime = 0;
let isCharging = false;
let swordCooldown = 0;
let swordVariation = 0;
let slashAnim = null;

const keys = {};

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  if (k === 'j' || k === 'z' || k === 'b') {
    executeSwordSlash();
  }
  if (k === 'y' || k === 'i') {
    executeYItem();
  }
  if (k === 'e' || k === 'a' || e.key === ' ') {
    executeInteract();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Sword Slash Execution
function executeSwordSlash() {
  if (isSheathed) {
    isSheathed = false;
    bHeldTime = 0;
    return;
  }

  if (swordCooldown > 0 || (slashAnim && slashAnim.timer > 0)) {
    return;
  }

  const varIdx = swordVariation % 3;
  swordVariation = (swordVariation + 1) % 3;

  slashAnim = { timer: 14, maxTimer: 14, variation: varIdx, dir: playerFacing };
  swordCooldown = 16;
  screenEffects.triggerShake(6, 0.25);
}

// Whirling Spin Attack Execution
function executeWhirlingBlade() {
  slashAnim = { timer: 18, maxTimer: 18, variation: 2, dir: playerFacing, isSpin: true };
  screenEffects.triggerShake(12, 0.4);
  screenEffects.triggerFlash('#DE2626', 0.35, 0.2);
}

function executeYItem() {
  isSheathed = false;
  screenEffects.triggerShake(4, 0.15);
}

function executeInteract() {
  screenEffects.triggerFlash('#FFFFFF', 0.2, 0.15);
}

// Boot and load BEJSON datasets
async function bootVanillaEngine() {
  const filesToLoad = [
    { key: 'levels', url: '/data/levels/levels.105.bejson' },
    { key: 'actors', url: '/data/actors/actors.105.bejson' },
    { key: 'items', url: '/data/items/items.105.bejson' }
  ];

  for (const f of filesToLoad) {
    try {
      const resp = await fetch(f.url);
      if (resp.ok) {
        const doc = await resp.json();
        bejsonGaming.registerDocument(f.key, doc);
      }
    } catch (err) {
      console.warn(`[Vanilla Mirror] Failed loading ${f.url}:`, err);
    }
  }

  requestAnimationFrame(gameLoop);
}

function updatePhysics() {
  const speed = keys['shift'] ? 4.0 : 2.8;
  let dx = 0;
  let dy = 0;

  if (keys['w'] || keys['arrowup']) { dy -= speed; playerFacing = 'UP'; }
  if (keys['s'] || keys['arrowdown']) { dy -= speed; playerFacing = 'DOWN'; }
  if (keys['a'] || keys['arrowleft']) { dx -= speed; playerFacing = 'LEFT'; }
  if (keys['d'] || keys['arrowright']) { dx += speed; playerFacing = 'RIGHT'; }

  isMoving = Math.hypot(dx, dy) > 0.1;

  px += dx;
  py += dy;

  // Screen bounds
  px = Math.max(32, Math.min(canvas.width - 32, px));
  py = Math.max(48, Math.min(canvas.height - 32, py));

  // Sheathing & Charging Logic
  if (keys['b'] || keys['j'] || keys['z']) {
    bHeldTime++;
    if (!isMoving && bHeldTime >= 120) {
      if (!isSheathed) {
        isSheathed = true;
      }
    } else if (bHeldTime > 25 && !isSheathed) {
      isCharging = true;
    }
  } else {
    if (isCharging && !isSheathed) {
      executeWhirlingBlade();
    }
    bHeldTime = 0;
    isCharging = false;
  }

  if (swordCooldown > 0) swordCooldown--;

  // Update screen effects
  screenEffects.update(1 / 60);
}

function render() {
  // Clear canvas
  ctx.fillStyle = '#050204';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply Camera Shake Offset
  ctx.save();
  ctx.translate(screenEffects.shake.offsetX, screenEffects.shake.offsetY);

  // Tile Grid
  const tileSize = 32;
  for (let x = 0; x < canvas.width; x += tileSize) {
    for (let y = 0; y < canvas.height; y += tileSize) {
      ctx.strokeStyle = '#1f080e';
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  // Ganon Pyramid Banner
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(280, 40, 80, 50);
  ctx.strokeStyle = '#f59e0b';
  ctx.strokeRect(280, 40, 80, 50);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '10px monospace';
  ctx.fillText('LORD GANON', 288, 70);

  // Shadow Link Player Rendering Pass
  const facing = playerFacing;
  const isSwordOverBody = facing === 'RIGHT' || facing === 'DOWN';

  // Helper: Render Sword Slash
  const renderSwordSlash = () => {
    if (slashAnim && slashAnim.timer > 0) {
      const maxT = slashAnim.maxTimer || 14;
      const progress = 1 - slashAnim.timer / maxT;
      const varIdx = slashAnim.variation || 0;

      let baseAngle = Math.PI / 2;
      if (facing === 'UP') baseAngle = -Math.PI / 2;
      if (facing === 'LEFT') baseAngle = Math.PI;
      if (facing === 'RIGHT') baseAngle = 0;

      let sweepSpan = Math.PI * 1.15;
      let extensionBonus = 3;
      if (varIdx === 1) {
        sweepSpan = Math.PI * 0.9;
        extensionBonus = 5;
      } else if (varIdx === 2) {
        sweepSpan = Math.PI * 1.3;
        extensionBonus = 2;
      }

      const startAngle = baseAngle - sweepSpan * 0.5;
      const currentSweep = (progress - 0.5) * sweepSpan;
      const currentBladeAngle = baseAngle + currentSweep;

      const bladeLength = 28 + extensionBonus;
      const bladeX = px + Math.cos(currentBladeAngle) * bladeLength;
      const bladeY = py + Math.sin(currentBladeAngle) * bladeLength;

      const trailStartAngle = Math.max(startAngle, currentBladeAngle - Math.PI * 0.55);
      ctx.fillStyle = varIdx === 1 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(222, 38, 38, 0.4)';
      ctx.beginPath();
      ctx.arc(px, py, bladeLength + 2, trailStartAngle, currentBladeAngle);
      ctx.lineTo(px, py);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(bladeX, bladeY);
      ctx.stroke();

      ctx.strokeStyle = '#DE2626';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(px + Math.cos(currentBladeAngle) * 5, py + Math.sin(currentBladeAngle) * 5);
      ctx.lineTo(bladeX, bladeY);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bladeX - 1.5, bladeY - 1.5, 3, 3);
    }
  };

  // Helper: Render Obsidian Shield
  const renderObsidianShield = () => {
    if (isSheathed) {
      // SHEATHED: Shield is mounted on Link's back
      if (facing === 'UP') {
        // Looking away (UP) while sheathed: We see the FRONT of the shield mounted on Link's back
        const sW = 12;
        const sH = 15;
        const sX = px - 6;
        const sY = py - 8;

        ctx.fillStyle = '#000000';
        ctx.fillRect(sX, sY, sW, sH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sX, sY, sW, sH);

        ctx.fillStyle = '#DE2626';
        ctx.beginPath();
        ctx.moveTo(sX + 2, sY + 3);
        ctx.lineTo(sX + sW - 2, sY + 3);
        ctx.lineTo(sX + sW / 2, sY + sH - 3);
        ctx.closePath();
        ctx.fill();
      } else if (facing === 'LEFT' || facing === 'RIGHT') {
        // Sheathed side profile on back
        const sX = facing === 'LEFT' ? px - 10 : px + 2;
        const sY = py - 7;
        const sW = 4;
        const sH = 14;

        ctx.fillStyle = '#000000';
        ctx.fillRect(sX, sY, sW, sH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sX, sY, 1.5, sH);
        ctx.fillStyle = '#DE2626';
        ctx.fillRect(sX + 1, sY + 3, 2, sH - 6);
      }
    } else {
      // UNSHEATHED: Shield is held in Link's hand (NOT on back!)
      if (facing === 'UP') {
        // Facing away (UP) while holding shield in hand:
        // No shield on back! Held in left hand sticking out to side, showing back of shield texture
        const sW = 10;
        const sH = 14;
        const sX = px - 14;
        const sY = py - 4;

        ctx.fillStyle = '#000000';
        ctx.fillRect(sX, sY, sW, sH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(sX, sY, sW, sH);

        // Handles & Straps
        ctx.fillStyle = '#27272a';
        ctx.fillRect(sX + 2, sY + 3, sW - 4, 3);
        ctx.fillRect(sX + 2, sY + 8, sW - 4, 2);
        ctx.fillStyle = '#DE2626';
        ctx.fillRect(sX + sW / 2 - 1, sY + 3, 2, 3);
      } else if (facing === 'LEFT' || facing === 'RIGHT') {
        // Side Profile in Hand
        const sX = facing === 'LEFT' ? px - 11 : px + 7;
        const sY = py - 4;
        ctx.fillStyle = '#000000';
        ctx.fillRect(sX, sY, 4, 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(facing === 'LEFT' ? sX : sX + 2.5, sY, 1.5, 14);
        ctx.fillStyle = '#DE2626';
        ctx.fillRect(sX + 1, sY + 3, 2, 8);
      } else {
        // FRONT VIEW (DOWN) - Shield in hand facing camera
        const sW = 12;
        const sH = 15;
        const sX = px - 14;
        const sY = py - 3;

        ctx.fillStyle = '#000000';
        ctx.fillRect(sX, sY, sW, sH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sX, sY, sW, sH);

        ctx.fillStyle = '#DE2626';
        ctx.beginPath();
        ctx.moveTo(sX + 2, sY + 3);
        ctx.lineTo(sX + sW - 2, sY + 3);
        ctx.lineTo(sX + sW / 2, sY + sH - 3);
        ctx.closePath();
        ctx.fill();
      }
    }
  };

  // 1. IF FACING UP: Render Shield FIRST so Player Body is rendered OVER the Shield
  if (facing === 'UP') {
    renderObsidianShield();
  }

  // 2. Sword Behind Body when facing LEFT / UP
  if (!isSwordOverBody) {
    renderSwordSlash();
  }

  // 3. Body Drawing (Boots, Tunic, Belt, Sheath)
  ctx.fillStyle = '#000000';
  ctx.fillRect(px - 7, py + 10, 5, 5);
  ctx.fillRect(px + 2, py + 10, 5, 5);

  ctx.fillStyle = '#000000';
  ctx.fillRect(px - 9, py - 10, 18, 20);
  ctx.fillStyle = '#DE2626';
  ctx.fillRect(px - 3, py, 6, 4);

  if (isSheathed) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(px + 2, py - 22, 6, 3);
    ctx.fillStyle = '#DE2626';
    ctx.fillRect(px + 3, py - 21, 4, 2);
  }

  ctx.fillStyle = '#000000';
  ctx.fillRect(px - 10, py - 16, 20, 8);
  ctx.fillStyle = '#DE2626';
  ctx.fillRect(px - 4, py - 19, 8, 4);

  // Face & Crimson Eyes
  ctx.fillStyle = '#000000';
  ctx.fillRect(px - 8, py - 9, 16, 7);
  ctx.fillStyle = '#DE2626';
  if (facing === 'DOWN') {
    ctx.fillRect(px - 6, py - 7, 4, 3);
    ctx.fillRect(px + 2, py - 7, 4, 3);
  } else if (facing === 'LEFT') {
    ctx.fillRect(px - 7, py - 7, 4, 3);
  } else if (facing === 'RIGHT') {
    ctx.fillRect(px + 3, py - 7, 4, 3);
  }

  // 4. IF FACING NOT UP: Render Shield AFTER Body
  if (facing !== 'UP') {
    renderObsidianShield();
  }

  // 4. Sword Over Body when facing RIGHT / DOWN
  if (isSwordOverBody) {
    renderSwordSlash();
  }

  if (slashAnim && slashAnim.timer > 0) {
    slashAnim.timer--;
  }

  ctx.restore(); // Restore Camera Shake

  // Render Screen Overlay Effects (Flash & Fade)
  screenEffects.renderCanvasOverlay(ctx, canvas.width, canvas.height);

  // HUD Overlay
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, 32);
  ctx.fillStyle = '#DE2626';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`SHADOW LINK | HP: ${playerHp}/${playerMaxHp} | BEJSON 105 PARITY ENGINE`, 12, 20);
}

function gameLoop() {
  updatePhysics();
  render();
  requestAnimationFrame(gameLoop);
}

bootVanillaEngine();
