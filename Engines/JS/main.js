/**
 * Library:         main.js
 * Family:          Vanilla JS Mirror Application
 * Module Purpose:  Standalone Vanilla JS Game Engine Client for BEJSON 105 (Absolute Parity Edition) - Engines/JS
 * Architecture:    BEJSON 105 Pure Data Engine, Web Audio Synthesis, AABB Physics & 2.5D Canvas Renderer Mirror
 * Version:         3.3.2
 * Release_Version: 300
 * Date:            2026-11-15
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   3b39b835-95d1-4398-a13f-cee1ea129c56
 */

import { bejsonCore } from '../../src/lib/lib_js/lib_bejson_Gaming_core_adapter.js';
import { bejsonGaming } from '../../src/lib/lib_js/lib_bejson_Gaming_engine.js';
import { shadowEngine } from '../../src/lib/lib_js/lib_bejson_Gaming_shadow_engine.js';
import { BEJSONGamingScreenEffects } from '../../src/lib/lib_js/lib_bejson_Gaming_screen_effects.js';
import { physicsEngine } from '../../src/lib/lib_js/lib_bejson_Gaming_physics_engine.js';
import { projectilePhysics } from '../../src/lib/lib_js/lib_bejson_Gaming_projectile_physics.js';
import { ancillaEngine, itemRegistry, inventoryState } from '../../src/lib/lib_js/lib_bejson_Gaming_ancilla_item_engine.js';

console.log("initializing...");

const screenEffects = new BEJSONGamingScreenEffects();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Map World & Viewport Scale Constants (100% Identical to React GameViewport)
let tilesW = 64;
let tilesH = 64;
const tileUnitPx = 16;
let mapWorldWidth = tilesW * tileUnitPx;   // 1024px
let mapWorldHeight = tilesH * tileUnitPx; // 1024px
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

let currentAmbientDroneHz = 0;
let ambientOsc = null;
let ambientGain = null;
let ambientFilter = null;

function updateAmbientBiomeDrone(audioProfile) {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  if (currentAmbientDroneHz === audioProfile.ambientDroneHz && ambientOsc) return;

  const now = audioCtx.currentTime;

  if (!ambientOsc) {
    ambientOsc = audioCtx.createOscillator();
    ambientGain = audioCtx.createGain();
    ambientFilter = audioCtx.createBiquadFilter();

    ambientOsc.type = audioProfile.ambientWaveform || 'sine';
    ambientOsc.frequency.setValueAtTime(audioProfile.ambientDroneHz || 65, now);

    ambientFilter.type = 'lowpass';
    ambientFilter.frequency.setValueAtTime(audioProfile.filterCutoff || 900, now);

    ambientGain.gain.setValueAtTime(0.01, now);
    ambientGain.gain.linearRampToValueAtTime(0.08, now + 1.0);

    ambientOsc.connect(ambientFilter);
    ambientFilter.connect(ambientGain);
    ambientGain.connect(audioCtx.destination);

    ambientOsc.start(now);
  } else if (ambientOsc && ambientGain && ambientFilter) {
    ambientOsc.frequency.linearRampToValueAtTime(audioProfile.ambientDroneHz || 65, now + 0.5);
    ambientFilter.frequency.linearRampToValueAtTime(audioProfile.filterCutoff || 900, now + 0.5);
  }

  currentAmbientDroneHz = audioProfile.ambientDroneHz || 65;
}

function playBiomeFootstep(audioProfile) {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = audioProfile.ambientWaveform === 'sawtooth' ? 'sawtooth' : 'triangle';
  osc.frequency.setValueAtTime(audioProfile.footstepFreq || 220, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, (audioProfile.footstepFreq || 220) * 0.4), now + 0.08);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(audioProfile.filterCutoff || 900, now);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (0.06 * (audioProfile.reverbDecay || 0.8)));

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + (0.06 * (audioProfile.reverbDecay || 0.8)));
}

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
let bowCooldown = 0;
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

// Register items through decoupled Item System Interface (ALttP Subsystem Parity)
itemRegistry.registerItem({
  id: 'shadow_boomerang',
  name: 'Shadow Boomerang',
  icon: '🪃',
  category: 'Y_ITEM',
  quota: 1, // ALttP: Only 1 active boomerang allowed in front slots (Slots 0-4)
  cooldownFrames: 16,
  useAnimationFrames: 12,
  onExecute: (ctx, engine) => {
    if (engine.getActiveQuotaCount('shadow_boomerang') > 0) return false;
    sfx.boomerang();
    const speed = 6.0;
    let vx = 0, vy = 0;
    if (ctx.playerFacing === 'UP') vy = -speed;
    else if (ctx.playerFacing === 'DOWN') vy = speed;
    else if (ctx.playerFacing === 'LEFT') vx = -speed;
    else if (ctx.playerFacing === 'RIGHT') vx = speed;

    return engine.spawnAncilla({
      type: 'boomerang',
      itemId: 'shadow_boomerang',
      category: 'primary',
      x: ctx.px,
      y: ctx.py,
      vx,
      vy,
      angle: Math.atan2(vy, vx),
      timer: 100,
      state: { outwardTimer: 25 },
      onUpdate: (slot, c) => {
        if (slot.state.outwardTimer > 0) {
          slot.state.outwardTimer--;
        } else {
          const dx = c.px - slot.x;
          const dy = c.py - slot.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 18) return false; // Return completed
          const returnSpeed = 7.0;
          slot.vx = (dx / dist) * returnSpeed;
          slot.vy = (dy / dist) * returnSpeed;
        }
        slot.angle += 0.3;
        if (typeof c.onBoomerangStep === 'function') {
          c.onBoomerangStep(slot);
        }
        return true;
      },
      onRender: (slot, renderCtx) => {
        renderCtx.save();
        renderCtx.translate(slot.x, slot.y);
        renderCtx.rotate(slot.angle);
        renderCtx.font = '16px monospace';
        renderCtx.textAlign = 'center';
        renderCtx.textBaseline = 'middle';
        renderCtx.fillText('🪃', 0, 0);
        renderCtx.restore();
      }
    });
  }
});

itemRegistry.registerItem({
  id: 'dark_bow',
  name: 'Dark Bow & Arrows',
  icon: '🏹',
  category: 'Y_ITEM',
  quota: 2, // ALttP: Quota of 2 active arrow projectiles in front slots (Slots 0-4)
  cooldownFrames: 24,
  useAnimationFrames: 14,
  ammoType: 'arrows',
  ammoCost: 1,
  onExecute: (ctx, engine) => {
    sfx.slash();
    let vx = 0, vy = 0;
    const arrowSpeed = 5.2;
    if (ctx.playerFacing === 'UP') vy = -arrowSpeed;
    else if (ctx.playerFacing === 'DOWN') vy = arrowSpeed;
    else if (ctx.playerFacing === 'LEFT') vx = -arrowSpeed;
    else if (ctx.playerFacing === 'RIGHT') vx = arrowSpeed;

    const slotIdx = engine.spawnAncilla({
      type: 'arrow',
      itemId: 'dark_bow',
      category: 'primary',
      x: ctx.px,
      y: ctx.py,
      vx,
      vy,
      angle: Math.atan2(vy, vx),
      timer: 55,
      onUpdate: (slot, c) => {
        if (typeof c.onArrowStep === 'function') {
          const hit = c.onArrowStep(slot);
          if (hit) return false;
        }
        return true;
      },
      onRender: (slot, renderCtx) => {
        renderCtx.save();
        renderCtx.translate(slot.x, slot.y);
        renderCtx.rotate(slot.angle);
        renderCtx.strokeStyle = '#38bdf8';
        renderCtx.lineWidth = 2;
        renderCtx.beginPath();
        renderCtx.moveTo(-8, 0);
        renderCtx.lineTo(8, 0);
        renderCtx.stroke();
        renderCtx.restore();
      }
    });

    // Spawn back-slot visual particle in slots 5-9
    engine.spawnAncilla({
      type: 'particle',
      itemId: 'dark_bow',
      category: 'particle',
      x: ctx.px + (Math.random() - 0.5) * 6,
      y: ctx.py + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      timer: 16,
      evictable: true,
      onRender: (slot, renderCtx) => {
        renderCtx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        renderCtx.fillRect(slot.x - 2, slot.y - 2, 4, 4);
      }
    });

    return slotIdx;
  }
});

// 24-slot inventory initialization ($7EF340+ SRAM parity)
inventoryState.setSlot(0, { itemId: 'shadow_boomerang', unlocked: true, tier: 1 });
inventoryState.setSlot(1, { itemId: 'dark_bow', unlocked: true, tier: 1 });
inventoryState.setEquippedYItem('shadow_boomerang');
let activeYItem = inventoryState.equippedYItemId || 'shadow_boomerang';

let otherProjectiles = [];
let droppedItems = [];

let currentLevelSlug = 'debug_chamber';

function setDebugRoom(slug) {
  ancillaEngine.clearAll();
  currentLevelSlug = slug;
  if (slug === 'forgotten_cavern' || slug === 'castle_courtyard') {
    tilesW = 96;
    tilesH = 96;
  } else {
    tilesW = 64;
    tilesH = 64;
  }
  mapWorldWidth = tilesW * tileUnitPx;
  mapWorldHeight = tilesH * tileUnitPx;

  px = mapWorldWidth / 2;
  py = mapWorldHeight / 2 + 40;

  if (slug === 'debug_chamber') {
    props = [
      { id: 'ped_boomerang', x: px - 120, y: py - 160, type: 'pedestal', destroyed: false, itemId: 'shadow_boomerang', icon: '🪃', title: 'BOOMERANG' },
      { id: 'ped_bow', x: px - 40, y: py - 160, type: 'pedestal', destroyed: false, itemId: 'dark_bow', icon: '🏹', title: 'DARK BOW' },
      { id: 'p1', x: px - 160, y: py - 60, type: 'pot', destroyed: false },
      { id: 'p2', x: px - 200, y: py - 60, type: 'bush', destroyed: false },
      { id: 'p3', x: px + 160, y: py - 60, type: 'pot', destroyed: false },
      { id: 'p4', x: px + 200, y: py - 60, type: 'bush', destroyed: false }
    ];
  } else {
    props = [
      { id: 'p1', x: px - 60, y: py - 50, type: 'pot', destroyed: false },
      { id: 'p2', x: px + 60, y: py - 50, type: 'bush', destroyed: false },
      { id: 'p3', x: px - 100, y: py + 50, type: 'pot', destroyed: false },
      { id: 'p4', x: px + 100, y: py + 50, type: 'bush', destroyed: false }
    ];
  }

  enemies = [
    { id: 'e1', name: 'Guard Knight', type: 'guard', x: px - 120, y: py - 120, hp: 60, maxHp: 60, attack: 15, hurtTime: 0, knockback: { vx: 0, vy: 0 }, aiState: 'PATROL', aiTimer: 60, targetX: px - 120, targetY: py - 120, chargeVx: 0, chargeVy: 0, patrolVx: 0, patrolVy: 0 },
    { id: 'e2', name: 'Green Slime', type: 'slime', x: px + 120, y: py - 120, hp: 35, maxHp: 35, attack: 10, hurtTime: 0, knockback: { vx: 0, vy: 0 }, aiState: 'PATROL', aiTimer: 40, targetX: px + 120, targetY: py - 120, chargeVx: 0, chargeVy: 0, patrolVx: 0, patrolVy: 0 }
  ];

  sfx.chime();
  screenEffects.triggerFlash('#DE2626', 0.25, 0.15);
  ['debug', 'sanctuary', 'cavern', 'courtyard'].forEach(name => {
    const btn = document.getElementById('btn-room-' + name);
    if (btn) {
      btn.style.background = '#27272a';
      btn.style.borderColor = '#3f3f46';
    }
  });
  const activeBtnId = slug === 'debug_chamber' ? 'btn-room-debug'
    : (slug === 'ganon_sanctuary' ? 'btn-room-sanctuary'
    : (slug === 'forgotten_cavern' ? 'btn-room-cavern' : 'btn-room-courtyard'));
  const activeBtn = document.getElementById(activeBtnId);
  if (activeBtn) {
    activeBtn.style.background = '#DE2626';
    activeBtn.style.borderColor = '#f87171';
  }
  console.log(`[DEBUG ROOM] Switched to level: ${slug} (${tilesW}x${tilesH} tiles, ${mapWorldWidth}x${mapWorldHeight}px)`);
}


const keys = {};
let joystickVector = { x: 0, y: 0 };

function initGamepadDeck() {
  const joyEl = document.getElementById('joystick');
  const knobEl = document.getElementById('joystick-knob');
  if (!joyEl || !knobEl) return;

  let activePointerId = null;

  function updateJoystickFromCoords(clientX, clientY) {
    const rect = joyEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const maxRadius = 44;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    knobEl.style.transform = `translate(${dx}px, ${dy}px)`;

    if (dist < 6) {
      joystickVector = { x: 0, y: 0 };
    } else {
      joystickVector = { x: dx / maxRadius, y: dy / maxRadius };
    }
  }

  function resetJoystick() {
    activePointerId = null;
    joyEl.classList.remove('active');
    knobEl.classList.remove('active');
    knobEl.style.transform = 'translate(0px, 0px)';
    joystickVector = { x: 0, y: 0 };
  }

  joyEl.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    initAudio();
    activePointerId = e.pointerId;
    joyEl.classList.add('active');
    knobEl.classList.add('active');
    try {
      joyEl.setPointerCapture(e.pointerId);
    } catch (err) {}
    updateJoystickFromCoords(e.clientX, e.clientY);
  });

  joyEl.addEventListener('pointermove', (e) => {
    if (activePointerId === e.pointerId) {
      e.preventDefault();
      e.stopPropagation();
      updateJoystickFromCoords(e.clientX, e.clientY);
    }
  });

  joyEl.addEventListener('pointerup', (e) => {
    if (activePointerId === e.pointerId) {
      e.preventDefault();
      e.stopPropagation();
      try {
        joyEl.releasePointerCapture(e.pointerId);
      } catch (err) {}
      resetJoystick();
    }
  });

  joyEl.addEventListener('pointercancel', (e) => {
    if (activePointerId === e.pointerId) {
      try {
        joyEl.releasePointerCapture(e.pointerId);
      } catch (err) {}
      resetJoystick();
    }
  });

  // Touch event fallbacks to prevent scroll and pinch
  joyEl.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
  joyEl.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });

  // B Button: Tap to slash, hold to charge spin attack
  const btnB = document.getElementById('btn-b');
  if (btnB) {
    btnB.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      initAudio();
      btnB.classList.add('active');
      keys['b'] = true;
      executeSwordSlash();
    });
    btnB.addEventListener('pointerup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      btnB.classList.remove('active');
      keys['b'] = false;
    });
    btnB.addEventListener('pointercancel', () => {
      btnB.classList.remove('active');
      keys['b'] = false;
    });
  }

  // Y Button: Fire active item (boomerang / dark bow)
  const btnY = document.getElementById('btn-y');
  if (btnY) {
    btnY.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      initAudio();
      btnY.classList.add('active');
      executeYItem();
    });
    btnY.addEventListener('pointerup', () => btnY.classList.remove('active'));
    btnY.addEventListener('pointercancel', () => btnY.classList.remove('active'));
  }

  // A Button: Main interaction / prop break
  const btnA = document.getElementById('btn-a');
  if (btnA) {
    btnA.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      initAudio();
      btnA.classList.add('active');
      executeInteract();
    });
    btnA.addEventListener('pointerup', () => btnA.classList.remove('active'));
    btnA.addEventListener('pointercancel', () => btnA.classList.remove('active'));
  }

  // X Button: Sheath / Unsheath sword
  const btnX = document.getElementById('btn-x');
  if (btnX) {
    btnX.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      initAudio();
      btnX.classList.add('active');
      isSheathed = !isSheathed;
      sfx.chime();
    });
    btnX.addEventListener('pointerup', () => btnX.classList.remove('active'));
    btnX.addEventListener('pointercancel', () => btnX.classList.remove('active'));
  }

  // SELECT: Toggle active Y-item (supports tapping button or row)
  const handleSelect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    initAudio();
    document.getElementById('btn-select')?.classList.add('active');
    document.getElementById('row-select')?.classList.add('active');
    const nextItem = activeYItem === 'shadow_boomerang' ? 'dark_bow' : 'shadow_boomerang';
    inventoryState.setEquippedYItem(nextItem);
    activeYItem = inventoryState.equippedYItemId || nextItem;
    shadowEngine.setSelectedYItem(activeYItem);
    sfx.chime();
    setTimeout(() => {
      document.getElementById('btn-select')?.classList.remove('active');
      document.getElementById('row-select')?.classList.remove('active');
    }, 150);
  };
  document.getElementById('btn-select')?.addEventListener('pointerdown', handleSelect);
  document.getElementById('row-select')?.addEventListener('pointerdown', handleSelect);

  // START: Recenter player / pause (supports tapping button or row)
  const handleStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    initAudio();
    document.getElementById('btn-start')?.classList.add('active');
    document.getElementById('row-start')?.classList.add('active');
    px = mapWorldWidth / 2;
    py = mapWorldHeight / 2 + 40;
    sfx.chime();
    screenEffects.triggerFlash('#DE2626', 0.25, 0.15);
    setTimeout(() => {
      document.getElementById('btn-start')?.classList.remove('active');
      document.getElementById('row-start')?.classList.remove('active');
    }, 150);
  };
  document.getElementById('btn-start')?.addEventListener('pointerdown', handleStart);
  document.getElementById('row-start')?.addEventListener('pointerdown', handleStart);
}

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  initAudio();

  if (k === '1') setDebugRoom('debug_chamber');
  if (k === '2') setDebugRoom('ganon_sanctuary');
  if (k === '3') setDebugRoom('forgotten_cavern');
  if (k === '4') setDebugRoom('castle_courtyard');

  if (k === 'w' || k === 'a' || k === 's' || k === 'd' || k.startsWith('arrow')) {
    document.getElementById('joystick')?.classList.add('active');
    document.getElementById('joystick-knob')?.classList.add('active');
  }

  if (k === 'q' || k === 'tab') {
    e.preventDefault();
    const nextItem = activeYItem === 'shadow_boomerang' ? 'dark_bow' : 'shadow_boomerang';
    inventoryState.setEquippedYItem(nextItem);
    activeYItem = inventoryState.equippedYItemId || nextItem;
    shadowEngine.setSelectedYItem(activeYItem);
    sfx.chime();
  }

  if (k === 'j' || k === 'z' || k === 'b') {
    document.getElementById('btn-b')?.classList.add('active');
    executeSwordSlash();
  }
  if (k === 'y' || k === 'i') {
    document.getElementById('btn-y')?.classList.add('active');
    executeYItem();
  }
  if (k === 'e' || k === 'a' || e.key === ' ') {
    document.getElementById('btn-a')?.classList.add('active');
    executeInteract();
  }
  if (k === 'x' || k === 'k') {
    document.getElementById('btn-x')?.classList.add('active');
  }
});

window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = false;
  if (!keys['w'] && !keys['a'] && !keys['s'] && !keys['d'] && !keys['arrowup'] && !keys['arrowdown'] && !keys['arrowleft'] && !keys['arrowright']) {
    if (Math.hypot(joystickVector.x, joystickVector.y) < 0.1) {
      document.getElementById('joystick')?.classList.remove('active');
      document.getElementById('joystick-knob')?.classList.remove('active');
    }
  }
  if (k === 'j' || k === 'z' || k === 'b') document.getElementById('btn-b')?.classList.remove('active');
  if (k === 'y' || k === 'i') document.getElementById('btn-y')?.classList.remove('active');
  if (k === 'e' || k === 'a' || e.key === ' ') document.getElementById('btn-a')?.classList.remove('active');
  if (k === 'x' || k === 'k') document.getElementById('btn-x')?.classList.remove('active');
});

function initControlsAndDeck() {
  document.getElementById('btn-room-debug')?.addEventListener('click', () => setDebugRoom('debug_chamber'));
  document.getElementById('btn-room-sanctuary')?.addEventListener('click', () => setDebugRoom('ganon_sanctuary'));
  document.getElementById('btn-room-cavern')?.addEventListener('click', () => setDebugRoom('forgotten_cavern'));
  document.getElementById('btn-room-courtyard')?.addEventListener('click', () => setDebugRoom('castle_courtyard'));
  initGamepadDeck();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initControlsAndDeck);
} else {
  initControlsAndDeck();
}

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

  // 18-frame (~0.3s) attack animation commit & delay
  slashAnim = { x: px, y: py, dir: playerFacing, timer: 18, maxTimer: 18, variation: varIdx };
  swordCooldown = 20;

  let hitX = px;
  let hitY = py;
  const reach = 48; // Extended sword reach (from 35 -> 48px)
  if (playerFacing === 'UP') hitY -= reach;
  if (playerFacing === 'DOWN') hitY += reach;
  if (playerFacing === 'LEFT') hitX -= reach;
  if (playerFacing === 'RIGHT') hitX += reach;

  // Cut bushes / break pots / activate pedestals with extended AABB
  props = props.map(prop => {
    if (!prop.destroyed && physicsEngine.checkAABBRaw(hitX - 20, hitY - 20, 40, 40, prop.x - 10, prop.y - 10, 20, 20)) {
      if (prop.type === 'pedestal') {
        if (prop.itemId) {
          inventoryState.setEquippedYItem(prop.itemId);
          activeYItem = inventoryState.equippedYItemId || prop.itemId;
          shadowEngine.setSelectedYItem(activeYItem);
          sfx.chime();
          screenEffects.triggerFlash('#FFFFFF', 0.3, 0.2);
        }
        return prop;
      }
      if (prop.type === 'pot') sfx.potBreak();
      else sfx.bushCut();
      spawnDropItem(prop.x, prop.y);
      return { ...prop, destroyed: true };
    }
    return prop;
  });

  // Damage enemies with 2D Vector Knockback (10.5 force) & 18f (~0.3s) Stun Physics
  enemies = enemies.map(enemy => {
    if (enemy.hp <= 0) return enemy;
    const isHit = physicsEngine.checkAABBRaw(hitX - 22, hitY - 22, 44, 44, enemy.x - 12, enemy.y - 12, 24, 24);
    if (isHit) {
      screenEffects.triggerShake(7, 0.25);
      const newHp = Math.max(0, enemy.hp - 25);
      if (newHp === 0) {
        sfx.enemyDeath();
        spawnDropItem(enemy.x, enemy.y);
      } else {
        sfx.hit();
      }
      const kb = physicsEngine.calculateKnockbackVector(px, py, enemy.x, enemy.y, 10.5);
      return { ...enemy, hp: newHp, hurtTime: 18, knockback: kb };
    }
    return enemy;
  });
}

// Whirling Spin Attack Execution (Identical 360° Radial Impulse)
function executeWhirlingBlade() {
  sfx.spin();
  screenEffects.triggerShake(12, 0.4);
  screenEffects.triggerFlash('#DE2626', 0.35, 0.2);

  spinAnim = { x: px, y: py, timer: 20, maxTimer: 20 };

  enemies = enemies.map(enemy => {
    if (enemy.hp <= 0) return enemy;
    const isHit = physicsEngine.checkAABBRaw(px - 38, py - 38, 76, 76, enemy.x - 12, enemy.y - 12, 24, 24);
    if (isHit) {
      const newHp = Math.max(0, enemy.hp - 40);
      if (newHp === 0) {
        sfx.enemyDeath();
        spawnDropItem(enemy.x, enemy.y);
      } else {
        sfx.hit();
      }
      const kb = physicsEngine.calculateKnockbackVector(px, py, enemy.x, enemy.y, 15.0);
      return { ...enemy, hp: newHp, hurtTime: 20, knockback: kb };
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

  // Enforce Miyamoto's Sword Mandate ($3C lockout): charging/holding/swinging sword locks out Y items
  const isSwordBusy = bHeldTime > 0 || isCharging || (slashAnim && slashAnim.timer > 0) || swordCooldown > 0;
  inventoryState.setSwordLockout(isSwordBusy);

  const context = {
    px,
    py,
    playerFacing,
    getAmmo: (type) => (type === 'arrows' ? shadowEngine.arrows : 0),
    consumeAmmo: (type, amount) => {
      if (type === 'arrows') shadowEngine.arrows = Math.max(0, shadowEngine.arrows - amount);
    },
    onBoomerangStep: (bSlot) => {
      props = props.map(prop => {
        if (!prop.destroyed && physicsEngine.checkAABBRaw(bSlot.x - 8, bSlot.y - 8, 16, 16, prop.x - 10, prop.y - 10, 20, 20)) {
          if (prop.type === 'pot') sfx.potBreak();
          else sfx.bushCut();
          spawnDropItem(prop.x, prop.y);
          return { ...prop, destroyed: true };
        }
        return prop;
      });
      droppedItems.forEach(item => {
        if (Math.hypot(item.x - bSlot.x, item.y - bSlot.y) < 24) {
          if (item.type === 'rupee') { sfx.rupee(); shadowEngine.rupees += 5; }
          else if (item.type === 'heart') { sfx.heart(); playerHp = Math.min(playerMaxHp, playerHp + 20); }
          item.timer = 0;
        }
      });
    },
    onArrowStep: (aSlot) => {
      let hit = false;
      enemies = enemies.map(e => {
        if (e.hp > 0 && physicsEngine.checkAABBRaw(aSlot.x - 4, aSlot.y - 4, 8, 8, e.x - 10, e.y - 10, 20, 20)) {
          hit = true;
          sfx.hit();
          const newHp = Math.max(0, e.hp - 20);
          if (newHp === 0) spawnDropItem(e.x, e.y);
          const kb = physicsEngine.calculateKnockbackVector(aSlot.x, aSlot.y, e.x, e.y, 8.0);
          return { ...e, hp: newHp, hurtTime: 10, knockback: kb };
        }
        return e;
      });
      return hit;
    }
  };

  const res = inventoryState.executeEquippedYItem(context, ancillaEngine);
  if (!res.success) {
    return;
  }
}

function executeInteract() {
  sfx.chime();
  screenEffects.triggerFlash('#FFFFFF', 0.2, 0.15);
  props = props.map(prop => {
    if (!prop.destroyed && physicsEngine.checkAABBRaw(px - 18, py - 18, 36, 36, prop.x - 12, prop.y - 12, 24, 24)) {
      if (prop.type === 'pedestal') {
        if (prop.itemId) {
          inventoryState.setEquippedYItem(prop.itemId);
          activeYItem = inventoryState.equippedYItemId || prop.itemId;
          shadowEngine.setSelectedYItem(activeYItem);
        }
        return prop;
      }
      spawnDropItem(prop.x, prop.y);
      return { ...prop, destroyed: true };
    }
    return prop;
  });
}

// Boot and load BEJSON datasets
async function bootVanillaEngine() {
  // Data root resolves relative to this module via Engines/JS/config.json (-> root game_data/raw).
  let rawRoot = '../../game_data/raw';
  try {
    const cfgResp = await fetch(new URL('./config.json', import.meta.url));
    if (cfgResp.ok) {
      const cfg = await cfgResp.json();
      if (cfg && typeof cfg.raw_data_path === 'string') rawRoot = cfg.raw_data_path.trim();
    }
  } catch (err) {
    console.warn('[Vanilla Mirror] config.json unreadable, using default raw_data_path:', err);
  }
  const rawBase = new URL(rawRoot.endsWith('/') ? rawRoot : rawRoot + '/', import.meta.url);

  const filesToLoad = [
    { key: 'levels', url: new URL('levels/levels.105.bejson', rawBase).href },
    { key: 'actors', url: new URL('actors/actors.105.bejson', rawBase).href },
    { key: 'items', url: new URL('items/items.105.bejson', rawBase).href },
    { key: 'sprites', url: new URL('sprites/sprites_manifest.105a.bejson', rawBase).href },
    { key: 'tiles', url: new URL('tiles/tiles_manifest.105a.bejson', rawBase).href },
    { key: 'chunk', url: new URL('chunks/cave_chunk_0_0.105.bejson', rawBase).href }
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
  setDebugRoom('debug_chamber');
  requestAnimationFrame(gameLoop);
}

function updatePhysics() {
  tickCount++;
  // Balanced movement speed: 2.2 normal walk, 3.2 shift sprint (Zelda ALttP calibrated)
  const speed = keys['shift'] ? 3.2 : 2.2;
  let dx = 0;
  let dy = 0;

  const up = keys['w'] || keys['arrowup'];
  const down = keys['s'] || keys['arrowdown'];
  const left = keys['a'] || keys['arrowleft'];
  const right = keys['d'] || keys['arrowright'];

  if (up) dy -= speed;
  if (down) dy += speed;
  if (left) dx -= speed;
  if (right) dx += speed;

  if (Math.hypot(joystickVector.x, joystickVector.y) > 0.12) {
    dx = joystickVector.x * speed;
    dy = joystickVector.y * speed;
  }

  // 8-directional movement with 4-directional cardinal facing & first-input priority latch
  const isH = Math.abs(dx) > 0.05;
  const isV = Math.abs(dy) > 0.05;
  if (isH && isV) {
    const matchesH = (dx > 0 && playerFacing === 'RIGHT') || (dx < 0 && playerFacing === 'LEFT');
    const matchesV = (dy > 0 && playerFacing === 'DOWN') || (dy < 0 && playerFacing === 'UP');
    if (!matchesH && !matchesV) {
      playerFacing = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'RIGHT' : 'LEFT') : (dy > 0 ? 'DOWN' : 'UP');
    }
  } else if (isH) {
    playerFacing = dx > 0 ? 'RIGHT' : 'LEFT';
  } else if (isV) {
    playerFacing = dy > 0 ? 'DOWN' : 'UP';
  }

  // Hit animation stun delay: attack swing commits player (~0.3s) or player damage stun
  if ((slashAnim && slashAnim.timer > 0) || playerHurtTime > 0) {
    dx = 0;
    dy = 0;
  }

  isMoving = Math.hypot(dx, dy) > 0.1;

  // Active Biome Audio Profile Calculation & Environmental Synth Dispatch
  let activeBiomeSlug = 'dark_grass';
  if (currentLevelSlug === 'debug_chamber') {
    const pTileX = Math.floor(px / tileUnitPx);
    const pTileY = Math.floor(py / tileUnitPx);
    if (pTileX < 32 && pTileY < 32) activeBiomeSlug = 'dark_grass';
    else if (pTileX >= 32 && pTileY < 32) activeBiomeSlug = 'sanctuary_obsidian';
    else if (pTileX < 32 && pTileY >= 32) activeBiomeSlug = 'subterranean_cave';
    else activeBiomeSlug = 'desert_sand';
  } else if (currentLevelSlug === 'ganon_sanctuary') {
    activeBiomeSlug = 'sanctuary_obsidian';
  } else if (currentLevelSlug === 'forgotten_cavern') {
    activeBiomeSlug = 'subterranean_cave';
  }

  const activeAudioProf = bejsonGaming.getAudioProfileForBiome ? bejsonGaming.getAudioProfileForBiome(activeBiomeSlug) : {
    ambientDroneHz: 65, ambientWaveform: 'triangle', footstepFreq: 220, reverbDecay: 0.8, filterCutoff: 900
  };

  if (isMoving && tickCount % 16 === 0) {
    playBiomeFootstep(activeAudioProf);
  }

  if (tickCount % 30 === 0) {
    updateAmbientBiomeDrone(activeAudioProf);
  }

  // Apply Player Vector Knockback Physics & Friction Decay
  dx += playerKnockback.vx;
  dy += playerKnockback.vy;
  physicsEngine.applyFriction(playerKnockback, 0.85);

  if (swordCooldown > 0) swordCooldown--;
  if (bowCooldown > 0) bowCooldown--;
  if (playerHurtTime > 0) playerHurtTime--;

  // 45° Diagonal Wall-Sliding Vector Math
  let nextPx = px + dx;
  let nextPy = py + dy;

  if (nextPx < 24 || nextPx > mapWorldWidth - 24) {
    dx = 0; // Perpendicular horizontal incidence zeroes out, vertical slide preserved
    nextPx = Math.max(24, Math.min(mapWorldWidth - 24, px + playerKnockback.vx));
  }
  if (nextPy < 24 || nextPy > mapWorldHeight - 24) {
    dy = 0; // Perpendicular vertical incidence zeroes out, horizontal slide preserved
    nextPy = Math.max(24, Math.min(mapWorldHeight - 24, py + playerKnockback.vy));
  }

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

  // Step inventory lockout timers ($3C sword lockout & $0301 action commit)
  const isSwordBusy = bHeldTime > 0 || isCharging || (slashAnim && slashAnim.timer > 0);
  inventoryState.setSwordLockout(isSwordBusy);
  inventoryState.tickLockouts();

  // Step 10-Slot Ancilla Engine (ALttP $0C4A Parallel Slot Architecture)
  ancillaEngine.updateAll({
    px,
    py,
    onBoomerangStep: (bSlot) => {
      props = props.map(prop => {
        if (!prop.destroyed && physicsEngine.checkAABBRaw(bSlot.x - 8, bSlot.y - 8, 16, 16, prop.x - 10, prop.y - 10, 20, 20)) {
          if (prop.type === 'pot') sfx.potBreak();
          else sfx.bushCut();
          spawnDropItem(prop.x, prop.y);
          return { ...prop, destroyed: true };
        }
        return prop;
      });
      droppedItems.forEach(item => {
        if (Math.hypot(item.x - bSlot.x, item.y - bSlot.y) < 24) {
          if (item.type === 'rupee') { sfx.rupee(); shadowEngine.rupees += 5; }
          else if (item.type === 'heart') { sfx.heart(); playerHp = Math.min(playerMaxHp, playerHp + 20); }
          item.timer = 0;
        }
      });
    },
    onArrowStep: (aSlot) => {
      let hit = false;
      enemies = enemies.map(e => {
        if (e.hp > 0 && physicsEngine.checkAABBRaw(aSlot.x - 4, aSlot.y - 4, 8, 8, e.x - 10, e.y - 10, 20, 20)) {
          hit = true;
          sfx.hit();
          const newHp = Math.max(0, e.hp - 20);
          if (newHp === 0) spawnDropItem(e.x, e.y);
          const kb = physicsEngine.calculateKnockbackVector(aSlot.x, aSlot.y, e.x, e.y, 8.0);
          return { ...e, hp: newHp, hurtTime: 10, knockback: kb };
        }
        return e;
      });
      return hit;
    }
  });

  // Update Boomerangs (legacy fallback)
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

  // Update Enemy AI & Chasing Physics (State-Driven AI Parity: PATROL -> ALERT -> LOCK_ON -> CHARGE -> COOLDOWN)
  enemies = enemies.map(e => {
    if (e.hp <= 0) return e;

    let ex = e.x + e.knockback.vx;
    let ey = e.y + e.knockback.vy;
    physicsEngine.applyFriction(e.knockback, 0.85);

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
    if (e.hurtTime > 0) {
      state = 'HURT';
      timer = e.hurtTime;
    } else if (state === 'HURT') {
      state = 'COOLDOWN';
      timer = 30; // 0.5s recovery post-hurt
    }

    if (state === 'PATROL') {
      // Slow wander pace
      timer--;
      if (timer <= 0) {
        timer = 50 + Math.floor(Math.random() * 40);
        const angle = Math.random() * Math.PI * 2;
        const wanderSpeed = e.type === 'guard' ? 0.6 : 0.4;
        pvx = Math.cos(angle) * wanderSpeed;
        pvy = Math.sin(angle) * wanderSpeed;
      }
      ex += pvx;
      ey += pvy;

      // Stage 1: Awareness detection within 160px
      if (distToPlayer < 160) {
        state = 'ALERT';
        timer = 20; // 20 frames (~0.33s) startled pause with '!'
        pvx = 0; pvy = 0;
      }
    } else if (state === 'ALERT') {
      // Stage 2: Brief stunned awareness pause
      timer--;
      if (timer <= 0) {
        state = 'LOCK_ON';
        timer = 26; // 26 frames (~0.43s) telegraph delay
        // Lock Link's position at start of lock-on
        tx = px;
        ty = py;
      }
    } else if (state === 'LOCK_ON') {
      // Stage 3: Telegraph delay - enemy freezes & aims at locked target position
      // Giving the player ample time to dodge/move!
      timer--;
      if (timer <= 0) {
        state = 'CHARGE';
        timer = 35; // Max blind charge duration (~0.6s)
        const chargeDist = Math.hypot(tx - ex, ty - ey);
        const chargeSpeed = e.type === 'guard' ? 2.6 : 1.8;
        if (chargeDist > 4) {
          cvx = ((tx - ex) / chargeDist) * chargeSpeed;
          cvy = ((ty - ey) / chargeDist) * chargeSpeed;
        } else {
          cvx = 0; cvy = 0;
        }
      }
    } else if (state === 'CHARGE') {
      // Stage 4: Blind straight-line charge (does NOT track player mid-lunge)
      ex += cvx;
      ey += cvy;
      timer--;

      const distToTarget = Math.hypot(tx - ex, ty - ey);
      if (distToTarget < 12 || timer <= 0 || ex < 24 || ex > mapWorldWidth - 24 || ey < 24 || ey > mapWorldHeight - 24) {
        state = 'COOLDOWN';
        timer = 40; // 40 frames (~0.67s) punish opening
        cvx = 0; cvy = 0;
      }

      // Collision with Link during blind charge
      const hitPlayer = physicsEngine.checkAABBRaw(ex - 8, ey - 8, 16, 16, px - 8, py - 8, 16, 16);
      if (hitPlayer && playerHurtTime <= 0 && e.hurtTime <= 0) {
        playerHp = Math.max(0, playerHp - (e.attack || (e.type === 'guard' ? 15 : 10)));
        sfx.playerHurt();
        screenEffects.triggerShake(10, 0.35);
        screenEffects.triggerFlash('#DE2626', 0.55, 0.25);
        playerHurtTime = 18; // 0.3s player incapacitation stun
        playerKnockback = physicsEngine.calculateKnockbackVector(ex, ey, px, py, 9.5);
        state = 'COOLDOWN';
        timer = 40;
        cvx = 0; cvy = 0;
      }
    } else if (state === 'COOLDOWN') {
      // Stage 5: Cooldown / exhaustion recovery window (completely vulnerable)
      timer--;
      if (timer <= 0) {
        if (distToPlayer < 140) {
          state = 'ALERT';
          timer = 20;
        } else {
          state = 'PATROL';
          timer = 45;
        }
      }
    }

    return {
      ...e,
      x: Math.max(20, Math.min(mapWorldWidth - 20, ex)),
      y: Math.max(20, Math.min(mapWorldHeight - 20, ey)),
      aiState: state,
      aiTimer: timer,
      targetX: tx,
      targetY: ty,
      chargeVx: cvx,
      chargeVy: cvy,
      patrolVx: pvx,
      patrolVy: pvy,
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
      } else if (currentLevelSlug === 'debug_chamber') {
        const isHallway = (c >= 30 && c <= 33) || (r >= 30 && r <= 33);
        if (isHallway) {
          const altWay = (r + c) % 2 === 0;
          ctx.fillStyle = altWay ? '#52525b' : '#3f3f46';
          ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
        } else if (c < 30 && r < 30) {
          const alt = (r + c) % 2 === 0;
          ctx.fillStyle = alt ? '#2e7d32' : '#256628';
          ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
        } else if (c > 33 && r < 30) {
          const alt = (r + c) % 2 === 0;
          ctx.fillStyle = alt ? '#26262a' : '#1e1e22';
          ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
        } else if (c < 30 && r > 33) {
          const alt = (r + c) % 2 === 0;
          ctx.fillStyle = alt ? '#3f3f46' : '#27272a';
          ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
        } else {
          const alt = (r + c) % 2 === 0;
          ctx.fillStyle = alt ? '#b45309' : '#92400e';
          ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
        }
      } else if (currentLevelSlug === 'ganon_sanctuary') {
        const isCenterCarpet = (c >= 14 && c <= 17) || (c >= 30 && c <= 33);
        if (isCenterCarpet) {
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(tx + 4, ty + 4, tileUnitPx - 8, tileUnitPx - 8);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(tx, ty, tileUnitPx, tileUnitPx);
        } else {
          const alt = (r + c) % 2 === 0;
          ctx.fillStyle = alt ? '#26262a' : '#1e1e22';
          ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
          ctx.strokeStyle = '#333338';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(tx + 1, ty + 1, tileUnitPx - 2, tileUnitPx - 2);
        }
      } else if (currentLevelSlug === 'forgotten_cavern') {
        // Forgotten Dark Cavern Biome: Subterranean Slate Floor & Blue Water Streams
        const isWaterStream = (c >= 44 && c <= 52) || (r >= 44 && r <= 52);
        if (isWaterStream) {
          const altWater = (r + c) % 2 === 0;
          ctx.fillStyle = altWater ? '#1e3a8a' : '#172554';
          ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
          if ((r * 13 + c * 7) % 4 === 0) {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(tx + 4, ty + 7, 6, 2);
          }
        } else {
          const altCavern = (r + c) % 2 === 0;
          ctx.fillStyle = altCavern ? '#27272a' : '#1e1e24';
          ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
          ctx.strokeStyle = '#18181b';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(tx + 1, ty + 1, tileUnitPx - 2, tileUnitPx - 2);
        }
      } else if (currentLevelSlug === 'castle_courtyard') {
        // Castle Courtyard Biome: Cobblestone Path Crossroads & Royal Green Gardens
        const isPath = (c >= 44 && c <= 50) || (r >= 44 && r <= 50);
        if (isPath) {
          const altCobble = (r + c) % 2 === 0;
          ctx.fillStyle = altCobble ? '#71717a' : '#52525b';
          ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
          ctx.strokeStyle = '#3f3f46';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(tx, ty, tileUnitPx, tileUnitPx);
        } else {
          const altLawn = (r + c) % 2 === 0;
          ctx.fillStyle = altLawn ? '#15803d' : '#166534';
          ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
          const flowerSeed = (r * 29 + c * 11) % 7;
          if (flowerSeed === 0) {
            ctx.fillStyle = '#DE2626'; // Crimson flower accent
            ctx.fillRect(tx + 6, ty + 6, 3, 3);
          } else if (flowerSeed === 1) {
            ctx.fillStyle = '#4ade80'; // Bright grass tuft
            ctx.fillRect(tx + 8, ty + 7, 2, 5);
          }
        }
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

  // 10-Slot Parallel Ancilla Engine Entities & Particles (ALttP $0C4A Parity)
  ancillaEngine.getActiveAncillae().forEach(anc => {
    renderQueue.push({ sortY: anc.y, type: 'ancilla', data: anc });
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
      if (pr.type === 'pedestal') {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(pr.x - 14, pr.y - 2, 28, 12);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(pr.x - 12, pr.y - 12, 24, 10);
        ctx.strokeStyle = '#DE2626';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pr.x - 12, pr.y - 12, 24, 10);

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pr.icon || '🪃', pr.x, pr.y - 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(pr.title || 'ITEM', pr.x, pr.y + 18);
      } else if (pr.type === 'pot') {
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

      // State Indicators: ALERT (!), LOCK_ON (pulsing ! & crosshair), COOLDOWN (•••)
      if (e.aiState === 'ALERT') {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(e.x, e.y - 26, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#000000'; ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('!', e.x, e.y - 26);
      } else if (e.aiState === 'LOCK_ON') {
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
      } else if (e.aiState === 'COOLDOWN') {
        ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('•••', e.x, e.y - 24);
      }
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
    } else if (item.type === 'ancilla') {
      const anc = item.data;
      if (typeof anc.onRender === 'function') {
        anc.onRender(anc, ctx);
      }
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

          const bladeLength = 40 + extensionBonus;
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

  // In-Canvas Top & Bottom HUD Overlay
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, 32);
  ctx.fillStyle = '#DE2626';
  ctx.font = 'bold 11px monospace';

  const curItem = inventoryState.getEquippedYItem();
  const yItemLabel = curItem ? `${curItem.icon} ${curItem.name.toUpperCase()}` : (activeYItem === 'shadow_boomerang' ? '🪃 BOOMERANG' : '🏹 DARK BOW');
  const roomName = currentLevelSlug.replace('_', ' ').toUpperCase();
  ctx.fillText(`SHADOW LINK | HP: ${playerHp}/${playerMaxHp} | Y: ${yItemLabel}`, 12, 20);

  // Bottom HUD Status Bar with Real-Time Camera Coordinates
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
  ctx.fillStyle = '#10b981';
  ctx.font = '10px monospace';
  ctx.fillText(`ROOM: ${roomName} (${tilesW}x${tilesH}) | CAM FOLLOW: (${Math.round(px)}, ${Math.round(py)})`, 12, canvas.height - 8);
}

function gameLoop() {
  updatePhysics();
  render();
  requestAnimationFrame(gameLoop);
}

bootVanillaEngine();
