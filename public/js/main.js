/**
 * Library:         main.js
 * Family:          Vanilla JS Mirror Application
 * Module Purpose:  Standalone Vanilla JS Game Engine Client for BEJSON 105
 * Architecture:    BEJSON 105 Pure Data Engine & Canvas Renderer Mirror
 * Version:         3.2.1
 * Release_Version: 300
 * Date:            2026-10-28
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   105a0500-2026-1028-9999-000000000503
 */

import { bejsonCore } from './lib/lib_bejson_Core_bejson_core.js';
import { bejsonGaming } from './lib/lib_bejson_Gaming_engine.js';
import { shadowEngine } from './lib/lib_bejson_Gaming_shadow_engine.js';
import { BEJSONGamingScreenEffects } from './lib/lib_bejson_Gaming_screen_effects.js';
import { physicsEngine } from './lib/lib_bejson_Gaming_physics_engine.js';
import { ProjectilePhysicsEngineJS } from './lib/lib_bejson_Gaming_projectile_physics.js';

console.log("initializing Vanilla JS Parity Engine...");

// Engine Components
const screenEffects = new BEJSONGamingScreenEffects();
const projectilePhysics = new ProjectilePhysicsEngineJS();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let currentLevelSlug = 'ganon_sanctuary';
let px = 320;
let py = 500;
let playerFacing = 'UP';
let playerHp = 120;
let playerMaxHp = 120;
let playerHurtTime = 0;
let playerKnockback = { vx: 0, vy: 0 };

let isMoving = false;
let isSheathed = false;
let bHeldTime = 0;
let isCharging = false;
let swordCooldown = 0;
let swordVariation = 0;
let slashAnim = null;
let spinAnim = null;

let enemies = [];
let props = [
  { id: 'p1', x: 300, y: 400, type: 'pot', destroyed: false },
  { id: 'p2', x: 340, y: 400, type: 'bush', destroyed: false },
  { id: 'p3', x: 600, y: 450, type: 'pot', destroyed: false },
  { id: 'p4', x: 640, y: 450, type: 'bush', destroyed: false }
];

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

function executeSwordSlash() {
  if (isSheathed) {
    isSheathed = false;
    bHeldTime = 0;
    return;
  }
  if (swordCooldown > 0 || (slashAnim && slashAnim.timer > 0)) return;

  const varIdx = swordVariation % 3;
  swordVariation = (swordVariation + 1) % 3;
  slashAnim = { x: px, y: py, dir: playerFacing, timer: 14, maxTimer: 14, variation: varIdx };
  swordCooldown = 16;
  screenEffects.triggerShake(6, 0.25);

  // Simple hit check
  let hx = px, hy = py;
  const reach = 35;
  if (playerFacing === 'UP') hy -= reach;
  if (playerFacing === 'DOWN') hy += reach;
  if (playerFacing === 'LEFT') hx -= reach;
  if (playerFacing === 'RIGHT') hx += reach;

  props.forEach(p => {
    if (!p.destroyed && Math.hypot(p.x - hx, p.y - hy) < 25) {
      p.destroyed = true;
      projectilePhysics.spawnDrop(p.x, p.y);
    }
  });

  enemies = enemies.map(e => {
    if (e.hp > 0 && Math.hypot(e.x - hx, e.y - hy) < 30) {
      const kb = physicsEngine.calculateKnockbackVector(px, py, e.x, e.y, 8.5);
      return { ...e, hp: Math.max(0, e.hp - 25), hurtTime: 14, knockback: kb };
    }
    return e;
  });
}

function executeWhirlingBlade() {
  spinAnim = { x: px, y: py, timer: 18, maxTimer: 18 };
  screenEffects.triggerShake(12, 0.4);
  screenEffects.triggerFlash('#DE2626', 0.35, 0.2);

  enemies = enemies.map(e => {
    if (e.hp > 0 && Math.hypot(e.x - px, e.y - py) < 60) {
      const kb = physicsEngine.calculateKnockbackVector(px, py, e.x, e.y, 14);
      return { ...e, hp: Math.max(0, e.hp - 40), hurtTime: 16, knockback: kb };
    }
    return e;
  });
}

function executeYItem() {
  isSheathed = false;
  projectilePhysics.spawnBoomerang(px, py, playerFacing, 0);
}

function executeInteract() {
  screenEffects.triggerFlash('#FFFFFF', 0.2, 0.15);
}

function syncEnemies() {
  const actorInstances = bejsonGaming.getActorsForLevel(currentLevelSlug);
  enemies = actorInstances
    .filter(a => a.role === 'ENEMY_MOB')
    .map(a => ({
      id: a.uuid,
      type: a.archetypeSlug === 'guard' ? 'guard' : 'slime',
      x: a.x,
      y: a.y,
      hp: a.archetypeSlug === 'guard' ? 60 : 35,
      maxHp: a.archetypeSlug === 'guard' ? 60 : 35,
      attack: a.attack,
      hurtTime: 0,
      knockback: { vx: 0, vy: 0 }
    }));
}

async function bootVanillaEngine() {
  const filesToLoad = [
    { key: 'levels', url: '/data/levels/levels.105.bejson' },
    { key: 'actors', url: '/data/actors/actors.105.bejson' },
    { key: 'items', url: '/data/items/items.105.bejson' },
    { key: 'events', url: '/data/events/events.105.bejson' }
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

  syncEnemies();
  requestAnimationFrame(gameLoop);
}

function update() {
  const speed = keys['shift'] ? 4.2 : 2.8;
  let dx = 0, dy = 0;

  if (keys['w'] || keys['arrowup']) { dy -= speed; playerFacing = 'UP'; }
  if (keys['s'] || keys['arrowdown']) { dy += speed; playerFacing = 'DOWN'; }
  if (keys['a'] || keys['arrowleft']) { dx -= speed; playerFacing = 'LEFT'; }
  if (keys['d'] || keys['arrowright']) { dx += speed; playerFacing = 'RIGHT'; }

  isMoving = Math.hypot(dx, dy) > 0.1;

  // Apply knockback
  dx += playerKnockback.vx;
  dy += playerKnockback.vy;
  physicsEngine.applyFriction(playerKnockback, 0.82);

  // Collision
  px += dx;
  py += dy;

  try {
    const currentLvl = bejsonGaming.getLevelBySlug(currentLevelSlug);
    if (currentLvl) {
      const mw = currentLvl.width * 16, mh = currentLvl.height * 16;
      px = Math.max(24, Math.min(mw - 24, px));
      py = Math.max(24, Math.min(mh - 24, py));
    }
  } catch(e) {}

  // Sheathing/Charging
  if (keys['b'] || keys['j'] || keys['z']) {
    bHeldTime++;
    if (!isMoving && bHeldTime >= 120) {
      if (!isSheathed) { isSheathed = true; }
    } else if (bHeldTime > 25 && !isSheathed) {
      isCharging = true;
    }
  } else {
    if (isCharging && !isSheathed) executeWhirlingBlade();
    bHeldTime = 0;
    isCharging = false;
  }

  if (swordCooldown > 0) swordCooldown--;
  if (playerHurtTime > 0) playerHurtTime--;

  // Update projectiles
  projectilePhysics.updateBoomerangs(px, py, (item) => {
    if (item.type === 'heart') playerHp = Math.min(playerMaxHp, playerHp + 20);
  });
  projectilePhysics.updateDroppedItems(px, py, (item) => {
    if (item.type === 'heart') playerHp = Math.min(playerMaxHp, playerHp + 20);
  });

  // Boomerang object bounding box collisions
  const propCollisionBoxes = props.filter(p => !p.destroyed).map(p => ({
    id: p.id,
    x: p.x,
    y: p.y,
    width: 18,
    height: 18,
    isSolid: true,
    isBreakable: true,
    causesBoomerangReturn: false,
    boomerangCrushThrough: true
  }));

  projectilePhysics.checkBoomerangObjectCollisions(
    propCollisionBoxes,
    (hitObj) => {
      const hitProp = props.find(p => p.id === hitObj.id);
      if (hitProp && !hitProp.destroyed) {
        hitProp.destroyed = true;
        screenEffects.triggerShake(4, 0.15);
        projectilePhysics.spawnDrop(hitProp.x, hitProp.y);
      }
    },
    (_b) => {
      screenEffects.triggerShake(3, 0.1);
    }
  );

  // Update Enemies
  enemies = enemies.map(e => {
    if (e.hp <= 0) return e;
    let ex = e.x + e.knockback.vx, ey = e.y + e.knockback.vy;
    physicsEngine.applyFriction(e.knockback, 0.82);
    const d = Math.hypot(px - ex, py - ey);
    if (Math.hypot(e.knockback.vx, e.knockback.vy) < 0.5 && d < 180 && d > 18) {
      ex += ((px - ex) / d) * (e.type === 'guard' ? 1.4 : 0.9);
      ey += ((py - ey) / d) * (e.type === 'guard' ? 1.4 : 0.9);
    }
    if (d < 16 && playerHurtTime <= 0) {
      playerHp = Math.max(0, playerHp - 10);
      playerHurtTime = 24;
      playerKnockback = physicsEngine.calculateKnockbackVector(ex, ey, px, py, 9.0);
      screenEffects.triggerShake(10, 0.35);
      screenEffects.triggerFlash('#DE2626', 0.5, 0.2);
    }
    return { ...e, x: ex, y: ey, hurtTime: Math.max(0, e.hurtTime - 1) };
  });

  screenEffects.update(1 / 60);
}

function render() {
  ctx.fillStyle = '#050204';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const zoom = 1.25;
  const vw = canvas.width / zoom, vh = canvas.height / zoom;
  let cx = px - vw / 2 + screenEffects.shake.offsetX;
  let cy = py - vh / 2 + screenEffects.shake.offsetY;

  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(-cx, -cy);

  // Background
  ctx.strokeStyle = '#1f080e';
  for (let x = -100; x < vw + 200; x += 16) {
    const rx = cx + x - (cx % 16);
    ctx.beginPath(); ctx.moveTo(rx, cy); ctx.lineTo(rx, cy + vh); ctx.stroke();
  }
  for (let y = -100; y < vh + 200; y += 16) {
    const ry = cy + y - (cy % 16);
    ctx.beginPath(); ctx.moveTo(cx, ry); ctx.lineTo(cx + vw, ry); ctx.stroke();
  }

  // Draw Props
  props.forEach(p => {
    if (p.destroyed) return;
    ctx.fillStyle = p.type === 'pot' ? '#b45309' : '#14532d';
    ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
  });

  // Draw Items
  projectilePhysics.droppedItems.forEach(i => {
    ctx.fillStyle = i.type === 'heart' ? '#DE2626' : '#10b981';
    ctx.fillRect(i.x - 4, i.y - 4, 8, 8);
  });

  // Draw Enemies
  enemies.forEach(e => {
    if (e.hp <= 0) return;
    ctx.fillStyle = e.hurtTime > 0 ? '#fff' : (e.type === 'guard' ? '#2563eb' : '#16a34a');
    ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
  });

  // Draw Shadow Link
  const isHurt = playerHurtTime > 0 && Math.floor(playerHurtTime / 3) % 2 === 0;

  const renderObsidianShield = () => {
    if (isSheathed) {
      if (playerFacing === 'UP') {
        const sW = 12, sH = 15, sX = px - 6, sY = py - 8;
        ctx.fillStyle = '#000000'; ctx.fillRect(sX, sY, sW, sH);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.strokeRect(sX, sY, sW, sH);
        ctx.fillStyle = '#DE2626';
        ctx.beginPath(); ctx.moveTo(sX + 2, sY + 3); ctx.lineTo(sX + sW - 2, sY + 3); ctx.lineTo(sX + sW / 2, sY + sH - 3); ctx.closePath(); ctx.fill();
      } else if (playerFacing === 'LEFT' || playerFacing === 'RIGHT') {
        const sX = playerFacing === 'LEFT' ? px - 10 : px + 2, sY = py - 7;
        ctx.fillStyle = '#000000'; ctx.fillRect(sX, sY, 4, 14);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(sX, sY, 1.5, 14);
        ctx.fillStyle = '#DE2626'; ctx.fillRect(sX + 1, sY + 3, 2, 8);
      }
    } else {
      if (playerFacing === 'UP') {
        const sW = 10, sH = 14, sX = px - 14, sY = py - 4;
        ctx.fillStyle = '#000000'; ctx.fillRect(sX, sY, sW, sH);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.strokeRect(sX, sY, sW, sH);
        ctx.fillStyle = '#27272a'; ctx.fillRect(sX + 2, sY + 3, sW - 4, 3); ctx.fillRect(sX + 2, sY + 8, sW - 4, 2);
        ctx.fillStyle = '#DE2626'; ctx.fillRect(sX + sW / 2 - 1, sY + 3, 2, 3);
      } else if (playerFacing === 'LEFT' || playerFacing === 'RIGHT') {
        const sX = playerFacing === 'LEFT' ? px - 11 : px + 7, sY = py - 4;
        ctx.fillStyle = '#000000'; ctx.fillRect(sX, sY, 4, 14);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(playerFacing === 'LEFT' ? sX : sX + 2.5, sY, 1.5, 14);
        ctx.fillStyle = '#DE2626'; ctx.fillRect(sX + 1, sY + 3, 2, 8);
      } else {
        const sW = 12, sH = 15, sX = px - 14, sY = py - 3;
        ctx.fillStyle = '#000000'; ctx.fillRect(sX, sY, sW, sH);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.strokeRect(sX, sY, sW, sH);
        ctx.fillStyle = '#DE2626';
        ctx.beginPath(); ctx.moveTo(sX + 2, sY + 3); ctx.lineTo(sX + sW - 2, sY + 3); ctx.lineTo(sX + sW / 2, sY + sH - 3); ctx.closePath(); ctx.fill();
      }
    }
  };

  if (playerFacing === 'UP') renderObsidianShield();

  ctx.fillStyle = isHurt ? '#fff' : '#000';
  ctx.fillRect(px - 9, py - 10, 18, 20); // body
  ctx.fillStyle = '#DE2626';
  ctx.fillRect(px - 3, py, 6, 4); // belt
  // Eyes
  ctx.fillStyle = '#DE2626';
  if (playerFacing === 'DOWN') { ctx.fillRect(px - 6, py - 7, 4, 3); ctx.fillRect(px + 2, py - 7, 4, 3); }
  else if (playerFacing === 'LEFT') ctx.fillRect(px - 7, py - 7, 4, 3);
  else if (playerFacing === 'RIGHT') ctx.fillRect(px + 3, py - 7, 4, 3);

  if (playerFacing !== 'UP') renderObsidianShield();

  // Sword Slash Arc (simplified)
  if (slashAnim && slashAnim.timer > 0) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(px, py, 30, 0, Math.PI * 2); ctx.stroke();
    slashAnim.timer--;
  }
  if (spinAnim && spinAnim.timer > 0) {
    ctx.strokeStyle = '#DE2626'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(px, py, 45, 0, Math.PI * 2); ctx.stroke();
    spinAnim.timer--;
  }

  ctx.restore();
  screenEffects.renderCanvasOverlay(ctx, canvas.width, canvas.height);

  // HUD
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, 32);
  ctx.fillStyle = '#DE2626'; ctx.font = 'bold 11px monospace';
  ctx.fillText(`SHADOW LINK | HP: ${playerHp}/${playerMaxHp} | VANILLA JS ENGINE`, 12, 20);
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

bootVanillaEngine();
