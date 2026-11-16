/**
 * Library:         lib_bejson_Gaming_npc_combat_ai.ts
 * Family:          Gaming
 * Module Purpose:  Top-Down Standard NPC Combat AI (Two-Tiered State Machine,
 *                  Staggered 1-in-4 Frame Rules, Linear Search Probes, Frontal Shielding,
 *                  and Ranged Flank/Evasion for Hyrule Forces)
 * Version:         1.0.0
 * Release_Version: 300
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * License:         PolyForm-Noncommercial-1.0.0
 */

export type CardinalFacing = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const OPPOSITE_FACING: Record<CardinalFacing, CardinalFacing> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT'
};

const CARDINAL_DIRS: CardinalFacing[] = ['DOWN', 'LEFT', 'UP', 'RIGHT'];
const HUMANOID_TYPES = new Set(['guard', 'hyrule_knight', 'hyrule_archer', 'hyrule_mage']);

export function isHumanoidNpc(type: string): boolean {
  return HUMANOID_TYPES.has(type);
}

export function isFrontalShieldBlock(
  enemy: { type: string; facing?: CardinalFacing; stunTimer?: number },
  playerFacing: CardinalFacing
): boolean {
  if (!enemy || enemy.type !== 'hyrule_knight') return false;
  if ((enemy.stunTimer || 0) > 0) return false;
  const enemyFacing: CardinalFacing = enemy.facing || 'DOWN';
  return OPPOSITE_FACING[enemyFacing] === playerFacing;
}

export function evaluateLinearSearchProbe(
  enemy: { x: number; y: number; facing?: CardinalFacing },
  px: number,
  py: number,
  isSolidAt?: (x: number, y: number) => boolean,
  rangePx: number = 176
): boolean {
  const facing: CardinalFacing = enemy.facing || 'DOWN';
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

export { CARDINAL_DIRS };
