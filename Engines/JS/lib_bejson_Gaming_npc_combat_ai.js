/**
 * Library:         lib_bejson_Gaming_npc_combat_ai.js
 * Family:          Gaming
 * Module Purpose:  Top-Down Standard NPC Combat AI (Two-Tiered State Machine,
 *                  Staggered 1-in-4 Frame Rules, Linear Search Probes, Frontal Shielding,
 *                  and Ranged Flank/Evasion for Hyrule Forces)
 * Version:         1.0.0
 * Release_Version: 300
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * License:         PolyForm-Noncommercial-1.0.0
 */

const OPPOSITE_FACING = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
const CARDINAL_DIRS = ['DOWN', 'LEFT', 'UP', 'RIGHT'];
const HUMANOID_TYPES = new Set(['guard', 'hyrule_knight', 'hyrule_archer', 'hyrule_mage']);

export function isHumanoidNpc(type) {
  return HUMANOID_TYPES.has(type);
}

export function isFrontalShieldBlock(enemy, playerFacing) {
  if (!enemy || enemy.type !== 'hyrule_knight') return false;
  if ((enemy.stunTimer || 0) > 0) return false;
  const enemyFacing = enemy.facing || 'DOWN';
  return OPPOSITE_FACING[enemyFacing] === playerFacing;
}

export function evaluateLinearSearchProbe(enemy, px, py, isSolidAt, rangePx = 176) {
  const facing = enemy.facing || 'DOWN';
  let dx = 0;
  let dy = 0;
  if (facing === 'UP') dy = -16;
  else if (facing === 'DOWN') dy = 16;
  else if (facing === 'LEFT') dx = -16;
  else if (facing === 'RIGHT') dx = 16;

  let sx = enemy.x;
  let sy = enemy.y;
  const steps = Math.floor(rangePx / 16);
  for (let i = 0; i < steps; i++) {
    sx += dx;
    sy += dy;
    if (isSolidAt && isSolidAt(sx, sy)) return false;
    if (Math.abs(sx - px) <= 18 && Math.abs(sy - py) <= 18) return true;
  }
  return false;
}

export function updateStandardNpcCombatAI({
  enemy,
  slotIndex,
  tickCount,
  px,
  py,
  mapWorldWidth,
  mapWorldHeight,
  isSolidAt,
  onSpawnProjectile,
  onHitPlayer
}) {
  if (enemy.hp <= 0) return enemy;

  let ex = enemy.x + enemy.knockback.vx;
  let ey = enemy.y + enemy.knockback.vy;
  enemy.knockback.vx *= 0.85;
  enemy.knockback.vy *= 0.85;
  if (Math.abs(enemy.knockback.vx) < 0.05) enemy.knockback.vx = 0;
  if (Math.abs(enemy.knockback.vy) < 0.05) enemy.knockback.vy = 0;

  let state = enemy.aiState || 'PATROL';
  let timer = enemy.aiTimer || 0;
  let facing = enemy.facing || 'DOWN';
  let tx = enemy.targetX ?? ex;
  let ty = enemy.targetY ?? ey;
  let cvx = enemy.chargeVx || 0;
  let cvy = enemy.chargeVy || 0;
  let pvx = enemy.patrolVx || 0;
  let pvy = enemy.patrolVy || 0;
  let stunTimer = enemy.stunTimer || 0;
  let iframeTime = Math.max(0, (enemy.iframeTime || 0) - 1);

  const distToPlayer = Math.hypot(px - ex, py - ey);
  const evalFrame = ((tickCount ^ slotIndex) & 3) === 0;
  const isRanged = enemy.type === 'hyrule_archer' || enemy.type === 'hyrule_mage';

  // Global Status Mode 1: STUNNED (Boomerang / stun override)
  if (stunTimer > 0) {
    stunTimer--;
    return {
      ...enemy, x: ex, y: ey, aiState: 'STUNNED', aiTimer: stunTimer,
      stunTimer, iframeTime, facing, targetX: tx, targetY: ty,
      chargeVx: 0, chargeVy: 0, patrolVx: 0, patrolVy: 0
    };
  } else if (state === 'STUNNED') {
    state = 'COOLDOWN';
    timer = 24;
  }

  // Global Status Mode 2: HURT / RECOIL
  if (enemy.hurtTime > 0) {
    state = 'HURT';
    timer = enemy.hurtTime;
  } else if (state === 'HURT') {
    state = isRanged && distToPlayer < 90 ? 'RETREAT' : 'COOLDOWN';
    timer = 26;
  }

  if (state === 'PATROL') {
    timer--;
    if (timer <= 0) {
      timer = 48 + Math.floor(Math.random() * 40);
      const dirIdx = Math.floor(Math.random() * 4);
      facing = CARDINAL_DIRS[dirIdx];
      const wanderSpeed = isHumanoidNpc(enemy.type) ? 0.55 : 0.4;
      pvx = facing === 'LEFT' ? -wanderSpeed : facing === 'RIGHT' ? wanderSpeed : 0;
      pvy = facing === 'UP' ? -wanderSpeed : facing === 'DOWN' ? wanderSpeed : 0;
    }
    const nx = ex + pvx;
    const ny = ey + pvy;
    if (!isSolidAt || !isSolidAt(nx, ny)) {
      ex = nx;
      ey = ny;
    } else {
      timer = 0;
    }

    // Staggered Frame Rule: evaluate linear search probe (humanoids) or proximity (slimes)
    if (evalFrame) {
      const detected = isHumanoidNpc(enemy.type)
        ? (distToPlayer < 26 || evaluateLinearSearchProbe({ x: ex, y: ey, facing }, px, py, isSolidAt, 176))
        : distToPlayer < 150;
      if (detected) {
        state = 'ALERT';
        timer = 18;
        pvx = 0; pvy = 0;
      }
    }
  } else if (state === 'ALERT') {
    timer--;
    if (timer <= 0) {
      if (isRanged && distToPlayer < 88) {
        state = 'RETREAT';
        timer = 28;
      } else {
        state = 'LOCK_ON';
        timer = 24;
        tx = px;
        ty = py;
      }
    }
  } else if (state === 'RETREAT') {
    // Ranged Flanker Evasion: step away / orthogonally to re-establish cardinal firing line
    timer--;
    const awayDist = Math.max(1, distToPlayer);
    const step = 1.35;
    const nx = ex + ((ex - px) / awayDist) * step;
    const ny = ey + ((ey - py) / awayDist) * step;
    if (!isSolidAt || !isSolidAt(nx, ny)) {
      ex = nx;
      ey = ny;
    }
    if (timer <= 0 || distToPlayer >= 115) {
      state = 'LOCK_ON';
      timer = 22;
      tx = px;
      ty = py;
    }
  } else if (state === 'LOCK_ON') {
    const dx = px - ex;
    const dy = py - ey;
    facing = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'RIGHT' : 'LEFT') : (dy >= 0 ? 'DOWN' : 'UP');
    timer--;
    if (timer <= 0) {
      if (isRanged) {
        if (onSpawnProjectile) {
          const speed = enemy.type === 'hyrule_archer' ? 4.4 : 3.6;
          let vx = 0, vy = 0;
          if (facing === 'UP') vy = -speed;
          else if (facing === 'DOWN') vy = speed;
          else if (facing === 'LEFT') vx = -speed;
          else vx = speed;
          onSpawnProjectile({
            x: ex,
            y: ey,
            vx,
            vy,
            type: enemy.type === 'hyrule_archer' ? 'enemy_arrow' : 'enemy_bolt',
            damage: enemy.attack || 12,
            timer: 75
          });
        }
        state = 'COOLDOWN';
        timer = 45;
      } else {
        state = 'CHARGE';
        timer = 34;
        const chargeDist = Math.hypot(tx - ex, ty - ey);
        const chargeSpeed = enemy.type === 'hyrule_knight' ? 2.8 : (enemy.type === 'guard' ? 2.6 : 1.8);
        if (chargeDist > 4) {
          cvx = ((tx - ex) / chargeDist) * chargeSpeed;
          cvy = ((ty - ey) / chargeDist) * chargeSpeed;
        } else {
          cvx = 0; cvy = 0;
        }
      }
    }
  } else if (state === 'CHARGE') {
    const nx = ex + cvx;
    const ny = ey + cvy;
    if (!isSolidAt || !isSolidAt(nx, ny)) {
      ex = nx;
      ey = ny;
    } else {
      timer = 0;
    }
    timer--;

    const distToTarget = Math.hypot(tx - ex, ty - ey);
    if (distToTarget < 12 || timer <= 0 || ex < 24 || ex > mapWorldWidth - 24 || ey < 24 || ey > mapWorldHeight - 24) {
      state = 'COOLDOWN';
      timer = 38;
      cvx = 0; cvy = 0;
    }

    if (onHitPlayer && Math.abs(ex - px) < 16 && Math.abs(ey - py) < 16 && enemy.hurtTime <= 0) {
      onHitPlayer(enemy);
    }
  } else if (state === 'COOLDOWN') {
    timer--;
    if (timer <= 0) {
      state = 'PATROL';
      timer = 30;
    }
  }

  return {
    ...enemy,
    x: Math.max(24, Math.min(mapWorldWidth - 24, ex)),
    y: Math.max(24, Math.min(mapWorldHeight - 24, ey)),
    aiState: state,
    aiTimer: timer,
    facing,
    stunTimer,
    iframeTime,
    targetX: tx,
    targetY: ty,
    chargeVx: cvx,
    chargeVy: cvy,
    patrolVx: pvx,
    patrolVy: pvy,
    hurtTime: Math.max(0, enemy.hurtTime - 1)
  };
}
