/**
 * Library:         main.js
 * Family:          Vanilla JS Mirror Application
 * Module Purpose:  Standalone Vanilla JS Game Engine Client for BEJSON 105 (Absolute Parity Edition)
 * Architecture:    BEJSON 105 Pure Data Engine, Web Audio Synthesis, AABB Physics & 2.5D Canvas Renderer Mirror
 * Version:         3.3.0
 * Release_Version: 300
 * Date:            2026-11-10
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   105a0500-2026-1110-9999-000000000503
 */

import { bejsonCore } from '../src/lib/lib_js/lib_bejson_Core_bejson_core.js';
import { bejsonGaming } from '../src/lib/lib_js/lib_bejson_Gaming_engine.js';
import { shadowEngine } from '../src/lib/lib_js/lib_bejson_Gaming_shadow_engine.js';
import { BEJSONGamingScreenEffects } from '../src/lib/lib_js/lib_bejson_Gaming_screen_effects.js';
import { physicsEngine } from '../src/lib/lib_js/lib_bejson_Gaming_physics_engine.js';
import { projectilePhysics } from '../src/lib/lib_js/lib_bejson_Gaming_projectile_physics.js';

console.log("initializing...");

const screenEffects = new BEJSONGamingScreenEffects();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Map World & Viewport Scale Constants (100% Identical to React GameViewport)
const tilesW = 64;
const tilesH = 64;
const tileUnitPx = 16;
const mapWorldWidth = tilesW * tileUnitPx;   // 1024px
const mapWorldHeight = tilesH * tileUnitPx; // 1024px
const zoomScale = 1.25;

// Web Audio Retro Synthesizer Engine
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function playSfxTone(freq, endFreq, dur, type = 'sawtooth', volume = 0.3) {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (endFreq && endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + dur);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + dur);
}

const sfx = {
  slash: () => playSfxTone(520, 90, 0.14, 'sawtooth', 0.4),
  spin: () => playSfxTone(220, 110, 0.35, 'square', 0.5),
  potBreak: () => playSfxTone(1400, 300, 0.12, 'sawtooth', 0.3),
  bushCut: () => playSfxTone(900, 400, 0.1, 'triangle', 0.25),
  hit: () => playSfxTone(140, 35, 0.12, 'sawtooth', 0.5),
  enemyDeath: () => playSfxTone(300, 40, 0.28, 'square', 0.5),
  playerHurt: () => playSfxTone(180, 50, 0.18, 'square', 0.5),
  rupee: () => playSfxTone(880, 1320, 0.14, 'triangle', 0.4),
  heart: () => playSfxTone(659.25, 783.99, 0.14, 'triangle', 0.4),
  boomerang: () => playSfxTone(350, 300, 0.16, 'triangle', 0.3),
  chime: () => playSfxTone(523.25, 659.25, 0.15, 'triangle', 0.35)
};

// Player Entity State
let px = 320;
let py = 300;
let playerFacing = 'DOWN';
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
let tickCount = 0;

// Destructible Props
let props = [
  { id: 'p1', x: 300, y: 400, type: 'pot', destroyed: false },
  { id: 'p2', x: 340, y: 400, type: 'bush', destroyed: false },
  { id: 'p3', x: 600, y: 450, type: 'pot', destroyed: false },
  { id: 'p4', x: 640, y: 450, type: 'bush', destroyed: false },
  { id: 'p5', x: 512, y: 600, type: 'pot', destroyed: false },
  { id: 'p6', x: 200, y: 700, type: 'bush', destroyed: false },
  { id: 'p7', x: 800, y: 700, type: 'pot', destroyed: false },
  { id: 'p8', x: 450, y: 300, type: 'bush', destroyed: false },
  { id: 'p9', x: 550, y: 300, type: 'pot', destroyed: false }
];

// Active Enemy Mobs
let enemies = [
  { id: 'e1', name: 'Guard Knight', type: 'guard', x: 200, y: 150, hp: 60, maxHp: 60, attack: 15, hurtTime: 0, knockback: { vx: 0, vy: 0 } },
  { id: 'e2', name: 'Green Slime', type: 'slime', x: 580, y: 150, hp: 35, maxHp: 35, attack: 10, hurtTime: 0, knockback: { vx: 0, vy: 0 } },
  { id: 'e3', name: 'Guard Knight', type: 'guard', x: 400, y: 120, hp: 60, maxHp: 60, attack: 15, hurtTime: 0, knockback: { vx: 0, vy: 0 } },
  { id: 'e4', name: 'Green Slime', type: 'slime', x: 750, y: 450, hp: 35, maxHp: 35, attack: 10, hurtTime: 0, knockback: { vx: 0, vy: 0 } }
];

// Non-Boomerang Projectiles (Arrows, Bombs)
let otherProjectiles = [];
let droppedItems = [];
let activeYItem = 'shadow_boomerang';

const keys = {};

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  initAudio();

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

function spawnDropItem(x, y) {
  const rand = Math.random();
  let type = 'rupee';
  if (rand < 0.45) type = 'heart';
  else if (rand < 0.7) type = 'rupee';
  else if (rand < 0.85) type = 'bomb';
  else type = 'arrow';
  droppedItems.push({ x, y, type, timer: 300 });
}

// Sword Slash Execution (Identical to React Engine)
function executeSwordSlash() {
  if (isSheathed) {
    isSheathed = false;
    bHeldTime = 0;
    sfx.chime();
    return;
  }

  if (swordCooldown > 0 || (slashAnim && slashAnim.timer > 0)) return;

  sfx.slash();
  const varIdx = swordVariation % 3;
  swordVariation = (swordVariation + 1) % 3;

  slashAnim = { x: px, y: py, dir: playerFacing, timer: 14, maxTimer: 14, variation: varIdx };
  swordCooldown = 16;

  let hitX = px;
  let hitY = py;
  const reach = 35;
  if (playerFacing === 'UP') hitY -= reach;
  if (playerFacing === 'DOWN') hitY += reach;
  if (playerFacing === 'LEFT') hitX -= reach;
  if (playerFacing === 'RIGHT') hitX += reach;

  // Cut bushes / break pots
  props = props.map(prop => {
    if (!prop.destroyed && physicsEngine.checkAABBRaw(hitX - 16, hitY - 16, 32, 32, prop.x - 10, prop.y - 10, 20, 20)) {
      if (prop.type === 'pot') sfx.potBreak();
      else sfx.bushCut();
      spawnDropItem(prop.x, prop.y);
      return { ...prop, destroyed: true };
    }
    return prop;
  });

  // Damage enemies with 2D Vector Knockback
  enemies = enemies.map(enemy => {
    if (enemy.hp <= 0) return enemy;
    const isHit = physicsEngine.checkAABBRaw(hitX - 18, hitY - 18, 36, 36, enemy.x - 12, enemy.y - 12, 24, 24);
    if (isHit) {
      screenEffects.triggerShake(6, 0.25);
      const newHp = Math.max(0, enemy.hp - 25);
      if (newHp === 0) {
        sfx.enemyDeath();
        spawnDropItem(enemy.x, enemy.y);
      } else {
        sfx.hit();
      }
      const kb = physicsEngine.calculateKnockbackVector(px, py, enemy.x, enemy.y, 8.5);
      return { ...enemy, hp: newHp, hurtTime: 14, knockback: kb };
    }
    return enemy;
  });
}

// Whirling Spin Attack Execution (Identical 360° Radial Impulse)
function executeWhirlingBlade() {
  sfx.spin();
  screenEffects.triggerShake(12, 0.4);
  screenEffects.triggerFlash('#DE2626', 0.35, 0.2);

  spinAnim = { x: px, y: py, timer: 18, maxTimer: 18 };

  enemies = enemies.map(enemy => {
    if (enemy.hp <= 0) return enemy;
    const isHit = physicsEngine.checkAABBRaw(px - 32, py - 32, 64, 64, enemy.x - 12, enemy.y - 12, 24, 24);
    if (isHit) {
      const newHp = Math.max(0, enemy.hp - 40);
      if (newHp === 0) {
        sfx.enemyDeath();
        spawnDropItem(enemy.x, enemy.y);
      } else {
        sfx.hit();
      }
      const kb = physicsEngine.calculateKnockbackVector(px, py, enemy.x, enemy.y, 14.0);
      return { ...enemy, hp: newHp, hurtTime: 16, knockback: kb };
    }
    return enemy;
  });

  props = props.map(prop => {
    if (!prop.destroyed && physicsEngine.checkAABBRaw(px - 32, py - 32, 64, 64, prop.x - 10, prop.y - 10, 20, 20)) {
      if (prop.type === 'pot') sfx.potBreak();
      else sfx.bushCut();
      spawnDropItem(prop.x, prop.y);
      return { ...prop, destroyed: true };
    }
    return prop;
  });
}

function executeYItem() {
  isSheathed = false;
  sfx.boomerang();

  if (activeYItem === 'shadow_boomerang') {
    if (projectilePhysics.boomerangs.length > 0) return;
    projectilePhysics.spawnBoomerang(px, py, playerFacing, 0);
  } else if (activeYItem === 'dark_bow') {
    let vx = 0, vy = 0;
    if (playerFacing === 'UP') vy = -7;
    if (playerFacing === 'DOWN') vy = 7;
    if (playerFacing === 'LEFT') vx = -7;
    if (playerFacing === 'RIGHT') vx = 7;
    otherProjectiles.push({ x: px, y: py, vx, vy, type: 'arrow', timer: 50 });
  } else if (activeYItem === 'dark_bombs') {
    otherProjectiles.push({ x: px, y: py, vx: 0, vy: 0, type: 'bomb', timer: 60 });
  } else {
    playerHp = Math.min(playerMaxHp, playerHp + 40);
    sfx.chime();
  }
}

function executeInteract() {
  sfx.chime();
  screenEffects.triggerFlash('#FFFFFF', 0.2, 0.15);
  props = props.map(prop => {
    if (!prop.destroyed && physicsEngine.checkAABBRaw(px - 16, py - 16, 32, 32, prop.x - 10, prop.y - 10, 20, 20)) {
      spawnDropItem(prop.x, prop.y);
      return { ...prop, destroyed: true };
    }
    return prop;
  });
}

// Boot and load BEJSON datasets
async function bootVanillaEngine() {
  const filesToLoad = [
    { key: 'levels', url: '/data/levels/levels.105.bejson' },
    { key: 'actors', url: '/data/actors/actors.105.bejson' },
    { key: 'items', url: '/data/items/items.105.bejson' },
    { key: 'sprites', url: '/data/sprites/sprites_manifest.105a.bejson' },
    { key: 'tiles', url: '/data/tiles/tiles_manifest.105a.bejson' },
    { key: 'chunk', url: '/data/chunks/cave_chunk_0_0.105.bejson' }
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
  tickCount++;
  const speed = keys['shift'] ? 4.0 : 2.8;
  let dx = 0;
  let dy = 0;

  if (keys['w'] || keys['arrowup']) { dy -= speed; playerFacing = 'UP'; }
  if (keys['s'] || keys['arrowdown']) { dy += speed; playerFacing = 'DOWN'; }
  if (keys['a'] || keys['arrowleft']) { dx -= speed; playerFacing = 'LEFT'; }
  if (keys['d'] || keys['arrowright']) { dx += speed; playerFacing = 'RIGHT'; }

  isMoving = Math.hypot(dx, dy) > 0.1;

  // Apply Player Vector Knockback Physics & Friction Decay
  dx += playerKnockback.vx;
  dy += playerKnockback.vy;
  physicsEngine.applyFriction(playerKnockback, 0.82);

  if (playerHurtTime > 0) playerHurtTime--;

  let nextPx = px + dx;
  let nextPy = py + dy;

  nextPx = Math.max(24, Math.min(mapWorldWidth - 24, nextPx));
  nextPy = Math.max(24, Math.min(mapWorldHeight - 24, nextPy));

  // Prop collisions with axis-separated box sliding
  props.forEach(pr => {
    if (!pr.destroyed) {
      if (physicsEngine.checkAABBRaw(nextPx - 8, py - 8, 16, 16, pr.x - 9, pr.y - 9, 18, 18)) nextPx = px;
      if (physicsEngine.checkAABBRaw(px - 8, nextPy - 8, 16, 16, pr.x - 9, pr.y - 9, 18, 18)) nextPy = py;
    }
  });

  px = nextPx;
  py = nextPy;

  // Sheathing & Charging Logic
  if (keys['b'] || keys['j'] || keys['z']) {
    bHeldTime++;
    if (!isMoving && bHeldTime >= 120) {
      if (!isSheathed) {
        isSheathed = true;
        sfx.chime();
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

  // Update Boomerangs
  projectilePhysics.updateBoomerangs(px, py, (item) => {
    if (item.type === 'rupee') { sfx.rupee(); shadowEngine.rupees += 5; }
    else if (item.type === 'heart') { sfx.heart(); playerHp = Math.min(playerMaxHp, playerHp + 20); }
  });

  // Update Dropped Item Pickups
  droppedItems = droppedItems.filter(i => {
    i.timer--;
    if (Math.hypot(px - i.x, py - i.y) < 16) {
      if (i.type === 'rupee') { sfx.rupee(); shadowEngine.rupees += 5; }
      else if (i.type === 'heart') { sfx.heart(); playerHp = Math.min(playerMaxHp, playerHp + 20); }
      else sfx.chime();
      return false;
    }
    return i.timer > 0;
  });

  // Update Other Projectiles
  otherProjectiles = otherProjectiles
    .map(p => {
      const nx = p.x + p.vx;
      const ny = p.y + p.vy;
      const nt = p.timer - 1;

      if (p.type === 'bomb' && nt === 0) {
        sfx.hit();
        enemies = enemies.map(e => {
          if (physicsEngine.checkAABBRaw(p.x - 30, p.y - 30, 60, 60, e.x - 10, e.y - 10, 20, 20)) {
            const newHp = Math.max(0, e.hp - 50);
            if (newHp === 0) spawnDropItem(e.x, e.y);
            const kb = physicsEngine.calculateKnockbackVector(p.x, p.y, e.x, e.y, 16.0);
            return { ...e, hp: newHp, hurtTime: 15, knockback: kb };
          }
          return e;
        });
        props = props.map(pr => {
          if (physicsEngine.checkAABBRaw(p.x - 30, p.y - 30, 60, 60, pr.x - 10, pr.y - 10, 20, 20)) {
            spawnDropItem(pr.x, pr.y);
            return { ...pr, destroyed: true };
          }
          return pr;
        });
      }

      if (p.type === 'arrow') {
        enemies = enemies.map(e => {
          if (e.hp > 0 && physicsEngine.checkAABBRaw(nx - 4, ny - 4, 8, 8, e.x - 10, e.y - 10, 20, 20)) {
            sfx.hit();
            const newHp = Math.max(0, e.hp - 20);
            if (newHp === 0) spawnDropItem(e.x, e.y);
            const kb = physicsEngine.calculateKnockbackVector(p.x, p.y, e.x, e.y, 8.0);
            return { ...e, hp: newHp, hurtTime: 10, knockback: kb };
          }
          return e;
        });
      }

      return { ...p, x: nx, y: ny, timer: nt };
    })
    .filter(p => p.timer > 0);

  // Update Enemy AI & Chasing Physics
  enemies = enemies.map(e => {
    if (e.hp <= 0) return e;

    let ex = e.x + e.knockback.vx;
    let ey = e.y + e.knockback.vy;
    physicsEngine.applyFriction(e.knockback, 0.82);

    const dist = Math.hypot(px - ex, py - ey);
    if (Math.hypot(e.knockback.vx, e.knockback.vy) < 0.5 && dist < 180 && dist > 18) {
      const eSpeed = e.type === 'guard' ? 1.4 : 0.9;
      ex += ((px - ex) / dist) * eSpeed;
      ey += ((py - ey) / dist) * eSpeed;
    }

    const hitPlayer = physicsEngine.checkAABBRaw(ex - 8, ey - 8, 16, 16, px - 8, py - 8, 16, 16);
    if (hitPlayer && playerHurtTime <= 0) {
      playerHp = Math.max(0, playerHp - e.attack);
      sfx.playerHurt();
      screenEffects.triggerShake(10, 0.35);
      screenEffects.triggerFlash('#DE2626', 0.55, 0.25);
      playerHurtTime = 24;
      playerKnockback = physicsEngine.calculateKnockbackVector(ex, ey, px, py, 9.0);
    }

    return {
      ...e,
      x: Math.max(20, Math.min(mapWorldWidth - 20, ex)),
      y: Math.max(20, Math.min(mapWorldHeight - 20, ey)),
      hurtTime: Math.max(0, e.hurtTime - 1)
    };
  });

  screenEffects.update(1 / 60);
}

function render() {
  ctx.fillStyle = '#050204';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const viewportWorldW = canvas.width / zoomScale;
  const viewportWorldH = canvas.height / zoomScale;

  let camX = px - viewportWorldW / 2 + screenEffects.shake.offsetX;
  let camY = py - viewportWorldH / 2 + screenEffects.shake.offsetY;

  camX = Math.max(0, Math.min(mapWorldWidth - viewportWorldW, camX));
  camY = Math.max(0, Math.min(mapWorldHeight - viewportWorldH, camY));

  ctx.save();
  ctx.scale(zoomScale, zoomScale);
  ctx.translate(-camX, -camY);

  // 1. TERRAIN TILEMAP MATRIX FLOOR RENDERING (100% Identical to React GameViewport)
  const minCol = Math.max(0, Math.floor(camX / tileUnitPx) - 1);
  const maxCol = Math.min(tilesW - 1, Math.ceil((camX + viewportWorldW) / tileUnitPx) + 1);
  const minRow = Math.max(0, Math.floor(camY / tileUnitPx) - 1);
  const maxRow = Math.min(tilesH - 1, Math.ceil((camY + viewportWorldH) / tileUnitPx) + 1);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const tx = c * tileUnitPx;
      const ty = r * tileUnitPx;
      const isBoundary = r === 0 || r === tilesH - 1 || c === 0 || c === tilesW - 1;

      if (isBoundary) {
        ctx.fillStyle = '#1c281e';
        ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
        ctx.fillStyle = '#2d4232';
        ctx.fillRect(tx + 2, ty + 2, tileUnitPx - 4, 12);
        ctx.fillRect(tx + 2, ty + 18, tileUnitPx - 4, 12);
        ctx.strokeStyle = '#0f1710';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx, ty, tileUnitPx, tileUnitPx);
      } else {
        const altGrass = (r + c) % 2 === 0;
        ctx.fillStyle = altGrass ? '#2e7d32' : '#256628';
        ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);

        const seed = (r * 31 + c * 17) % 5;
        ctx.fillStyle = '#4caf50';
        if (seed === 0) {
          ctx.fillRect(tx + 6, ty + 8, 2, 6);
          ctx.fillRect(tx + 10, ty + 6, 2, 8);
        } else if (seed === 1) {
          ctx.fillRect(tx + 18, ty + 10, 2, 7);
        } else if (seed === 2) {
          ctx.fillStyle = '#DE2626';
          ctx.fillRect(tx + 14, ty + 14, 2, 2);
        }
      }
    }
  }

  // Stone Pillars
  const pillars = [
    { x: 128, y: 128 }, { x: 896, y: 128 },
    { x: 128, y: 640 }, { x: 896, y: 640 },
    { x: 384, y: 384 }, { x: 640, y: 384 }
  ];
  pillars.forEach(p => {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(p.x - 16, p.y - 16, 32, 32);
    ctx.strokeStyle = '#DE2626'; ctx.lineWidth = 1.5; ctx.strokeRect(p.x - 16, p.y - 16, 32, 32);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(p.x - 6, p.y - 6, 12, 12);
  });

  // 2. CONSTRUCT 2.5D Y-SORTED DRAW QUEUE (TOP-TO-BOTTOM DEPTH SORTING)
  const renderQueue = [];

  props.forEach(pr => {
    if (!pr.destroyed) renderQueue.push({ sortY: pr.y + 6, type: 'prop', data: pr });
  });

  droppedItems.forEach(item => {
    renderQueue.push({ sortY: item.y, type: 'item', data: item });
  });

  enemies.forEach(e => {
    if (e.hp > 0) renderQueue.push({ sortY: e.y + 10, type: 'enemy', data: e });
  });

  otherProjectiles.forEach(p => {
    renderQueue.push({ sortY: p.y, type: 'projectile', data: p });
  });

  projectilePhysics.boomerangs.forEach(b => {
    renderQueue.push({ sortY: b.y, type: 'boomerang', data: b });
  });

  renderQueue.push({ sortY: 150, type: 'ganon', data: null });
  renderQueue.push({ sortY: py + 8, type: 'player', data: null });

  renderQueue.sort((a, b) => a.sortY - b.sortY);

  // 3. EXECUTE Y-SORTED DRAW PASS
  renderQueue.forEach(item => {
    if (item.type === 'prop') {
      const pr = item.data;
      if (pr.type === 'pot') {
        ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(pr.x, pr.y + 1, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(pr.x - 2, pr.y - 1, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#78350f'; ctx.fillRect(pr.x - 7, pr.y - 7, 14, 3);
        ctx.fillStyle = '#fef3c7'; ctx.fillRect(pr.x - 4, pr.y - 6, 3, 2);
      } else {
        ctx.fillStyle = '#14532d'; ctx.beginPath(); ctx.arc(pr.x, pr.y + 2, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.arc(pr.x - 2, pr.y - 1, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(pr.x - 4, pr.y - 3, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ef4444'; ctx.fillRect(pr.x + 3, pr.y - 2, 2, 2); ctx.fillRect(pr.x - 5, pr.y + 3, 2, 2);
      }
    } else if (item.type === 'item') {
      const drop = item.data;
      if (drop.type === 'rupee') {
        ctx.fillStyle = '#10b981'; ctx.beginPath();
        ctx.moveTo(drop.x, drop.y - 7); ctx.lineTo(drop.x + 5, drop.y); ctx.lineTo(drop.x, drop.y + 7); ctx.lineTo(drop.x - 5, drop.y);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#a7f3d0'; ctx.fillRect(drop.x - 1, drop.y - 4, 2, 4);
      } else if (drop.type === 'heart') {
        ctx.fillStyle = '#DE2626'; ctx.beginPath();
        ctx.arc(drop.x - 3, drop.y - 2, 3, 0, Math.PI * 2); ctx.arc(drop.x + 3, drop.y - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(drop.x - 6, drop.y - 1); ctx.lineTo(drop.x, drop.y + 6); ctx.lineTo(drop.x + 6, drop.y - 1); ctx.fill();
      } else {
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(drop.x - 2, drop.y - 5, 4, 10);
      }
    } else if (item.type === 'ganon') {
      ctx.fillStyle = '#7f1d1d'; ctx.fillRect(470, 110, 84, 50);
      ctx.strokeStyle = '#f59e0b'; ctx.strokeRect(470, 110, 84, 50);

      [440, 584].forEach(torchX => {
        ctx.fillStyle = '#334155'; ctx.fillRect(torchX - 6, 120, 12, 24);
        ctx.fillStyle = tickCount % 10 < 5 ? '#f97316' : '#ef4444';
        ctx.beginPath(); ctx.arc(torchX, 114, 6, 0, Math.PI * 2); ctx.fill();
      });

      const gx = 512, gy = 135;
      ctx.fillStyle = '#991b1b'; ctx.fillRect(gx - 20, gy - 10, 40, 30);
      ctx.fillStyle = '#312e81'; ctx.fillRect(gx - 14, gy - 8, 28, 24);
      ctx.fillStyle = '#1e1b4b'; ctx.beginPath(); ctx.arc(gx, gy - 16, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ef4444'; ctx.fillRect(gx - 7, gy - 19, 4, 3); ctx.fillRect(gx + 3, gy - 19, 4, 3);
    } else if (item.type === 'enemy') {
      const e = item.data;
      if (e.type === 'slime') {
        const squish = Math.sin(tickCount * 0.2) * 2;
        ctx.fillStyle = e.hurtTime > 0 ? '#ffffff' : '#16a34a';
        ctx.beginPath(); ctx.ellipse(e.x, e.y, 11 + squish, 9 - squish, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#86efac'; ctx.fillRect(e.x - 4, e.y - 5, 3, 3);
        ctx.fillStyle = '#000000'; ctx.fillRect(e.x - 5, e.y - 1, 3, 3); ctx.fillRect(e.x + 2, e.y - 1, 3, 3);
      } else {
        ctx.fillStyle = e.hurtTime > 0 ? '#ffffff' : '#2563eb';
        ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(e.x - 8, e.y - 14, 16, 8);
        ctx.fillStyle = '#0f172a'; ctx.fillRect(e.x - 6, e.y - 11, 12, 2);
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(e.x + 10, e.y - 16, 2, 28);
      }
      ctx.fillStyle = '#18181b'; ctx.fillRect(e.x - 12, e.y - 20, 24, 3);
      ctx.fillStyle = '#DE2626'; ctx.fillRect(e.x - 12, e.y - 20, (e.hp / e.maxHp) * 24, 3);
    } else if (item.type === 'projectile') {
      const p = item.data;
      if (p.type === 'arrow') {
        ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - 2, p.y - 2, 5, 5);
      } else if (p.type === 'bomb') {
        ctx.fillStyle = tickCount % 10 < 5 ? '#DE2626' : '#18181b'; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill();
      }
    } else if (item.type === 'boomerang') {
      const b = item.data;
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
    } else if (item.type === 'player') {
      const facing = playerFacing;
      const isSwordOverBody = facing === 'RIGHT' || facing === 'DOWN';
      const isHurt = playerHurtTime > 0 && Math.floor(playerHurtTime / 3) % 2 === 0;

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
          if (varIdx === 1) { sweepSpan = Math.PI * 0.9; extensionBonus = 5; }
          else if (varIdx === 2) { sweepSpan = Math.PI * 1.3; extensionBonus = 2; }

          const startAngle = baseAngle - sweepSpan * 0.5;
          const currentSweep = (progress - 0.5) * sweepSpan;
          const currentBladeAngle = baseAngle + currentSweep;

          const bladeLength = 28 + extensionBonus;
          const bladeX = px + Math.cos(currentBladeAngle) * bladeLength;
          const bladeY = py + Math.sin(currentBladeAngle) * bladeLength;

          const trailStartAngle = Math.max(startAngle, currentBladeAngle - Math.PI * 0.55);
          ctx.fillStyle = varIdx === 1 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(222, 38, 38, 0.4)';
          ctx.beginPath(); ctx.arc(px, py, bladeLength + 2, trailStartAngle, currentBladeAngle); ctx.lineTo(px, py); ctx.closePath(); ctx.fill();

          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bladeX, bladeY); ctx.stroke();
          ctx.strokeStyle = '#DE2626'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(px + Math.cos(currentBladeAngle) * 5, py + Math.sin(currentBladeAngle) * 5); ctx.lineTo(bladeX, bladeY); ctx.stroke();
          ctx.fillStyle = '#ffffff'; ctx.fillRect(bladeX - 1.5, bladeY - 1.5, 3, 3);
        }
      };

      const renderObsidianShield = () => {
        if (isSheathed) {
          if (facing === 'UP') {
            const sW = 12, sH = 15, sX = px - 6, sY = py - 8;
            ctx.fillStyle = '#0d0d12'; ctx.beginPath(); ctx.moveTo(sX, sY); ctx.lineTo(sX + sW, sY); ctx.lineTo(sX + sW, sY + sH - 4); ctx.lineTo(sX + sW / 2, sY + sH); ctx.lineTo(sX, sY + sH - 4); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = '#DE2626'; ctx.beginPath(); ctx.moveTo(sX + 2, sY + 3); ctx.lineTo(sX + sW - 2, sY + 3); ctx.lineTo(sX + sW / 2, sY + sH - 3); ctx.closePath(); ctx.fill();
          } else if (facing === 'LEFT' || facing === 'RIGHT') {
            const sX = facing === 'LEFT' ? px - 10 : px + 2, sY = py - 7;
            ctx.fillStyle = '#0d0d12'; ctx.fillRect(sX, sY, 4, 14);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(sX, sY, 1.5, 14);
            ctx.fillStyle = '#DE2626'; ctx.fillRect(sX + 1, sY + 3, 2, 8);
          }
        } else {
          if (facing === 'UP') {
            const sW = 10, sH = 14, sX = px - 14, sY = py - 4;
            ctx.fillStyle = '#0d0d12'; ctx.beginPath(); ctx.moveTo(sX, sY); ctx.lineTo(sX + sW, sY); ctx.lineTo(sX + sW, sY + sH - 3); ctx.lineTo(sX + sW / 2, sY + sH); ctx.lineTo(sX, sY + sH - 3); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke();
            ctx.fillStyle = '#27272a'; ctx.fillRect(sX + 2, sY + 3, sW - 4, 3); ctx.fillRect(sX + 2, sY + 8, sW - 4, 2);
            ctx.fillStyle = '#DE2626'; ctx.fillRect(sX + sW / 2 - 1, sY + 3, 2, 3);
          } else if (facing === 'LEFT' || facing === 'RIGHT') {
            const sX = facing === 'LEFT' ? px - 11 : px + 7, sY = py - 4;
            ctx.fillStyle = '#0d0d12'; ctx.fillRect(sX, sY, 4, 14);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(facing === 'LEFT' ? sX : sX + 2.5, sY, 1.5, 14);
            ctx.fillStyle = '#DE2626'; ctx.fillRect(sX + 1, sY + 3, 2, 8);
          } else {
            const sW = 12, sH = 15, sX = px - 14, sY = py - 3;
            ctx.fillStyle = '#0d0d12'; ctx.beginPath(); ctx.moveTo(sX, sY); ctx.lineTo(sX + sW, sY); ctx.lineTo(sX + sW, sY + sH - 4); ctx.lineTo(sX + sW / 2, sY + sH); ctx.lineTo(sX, sY + sH - 4); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = '#DE2626'; ctx.beginPath(); ctx.moveTo(sX + 2, sY + 3); ctx.lineTo(sX + sW - 2, sY + 3); ctx.lineTo(sX + sW / 2, sY + sH - 3); ctx.closePath(); ctx.fill();
          }
        }
      };

      if (facing === 'UP') renderObsidianShield();
      if (!isSwordOverBody) renderSwordSlash();

      // Shadow Link Body
      ctx.fillStyle = isHurt ? '#ffffff' : '#ffffff';
      ctx.fillRect(px - 7, py + 10, 5, 5); ctx.fillRect(px + 2, py + 10, 5, 5);

      ctx.fillStyle = isHurt ? '#ffffff' : '#1e1e2d';
      ctx.fillRect(px - 9, py - 10, 18, 20);
      ctx.strokeStyle = '#3f3f5a'; ctx.lineWidth = 1; ctx.strokeRect(px - 9, py - 10, 18, 20);

      ctx.fillStyle = '#DE2626'; ctx.fillRect(px - 9, py + 1, 18, 3);
      ctx.fillStyle = '#12121a'; ctx.fillRect(px - 7, py - 14, 14, 8);

      ctx.fillStyle = '#f87171';
      if (facing === 'DOWN') { ctx.fillRect(px - 5, py - 7, 3, 3); ctx.fillRect(px + 2, py - 7, 3, 3); }
      else if (facing === 'LEFT') ctx.fillRect(px - 6, py - 7, 3, 3);
      else if (facing === 'RIGHT') ctx.fillRect(px + 3, py - 7, 3, 3);

      if (facing !== 'UP') renderObsidianShield();
      if (isSwordOverBody) renderSwordSlash();

      if (slashAnim && slashAnim.timer > 0) slashAnim.timer--;
      if (spinAnim && spinAnim.timer > 0) spinAnim.timer--;
    }
  });

  ctx.restore();

  screenEffects.renderCanvasOverlay(ctx, canvas.width, canvas.height);

  // In-Canvas Top HUD Overlay
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
