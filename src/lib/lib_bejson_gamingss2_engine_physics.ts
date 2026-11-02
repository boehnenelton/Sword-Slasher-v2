/**
 * Library:         lib_bejson_gamingss2_engine_physics.ts
 * Family:          GamingSS2
 * Module Purpose:  2D AABB bounding box collision, swept rigid body physics, and knockback vector impulse decay.
 * Architecture:    BEJSON 105 Format / Pure Decoupled Engine Physics
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d
 */

export interface AABBBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface KnockbackImpulse {
  vx: number;
  vy: number;
  decayRate: number;
}

export class GamingSS2EnginePhysics {
  public static checkAABBCollision(a: AABBBox, b: AABBBox, innerMargin: number = 0): boolean {
    return (
      a.x + innerMargin < b.x + b.w - innerMargin &&
      a.x + a.w - innerMargin > b.x + innerMargin &&
      a.y + innerMargin < b.y + b.h - innerMargin &&
      a.y + a.h - innerMargin > b.y + innerMargin
    );
  }

  public static applyKnockback(target: { x: number; y: number }, impulse: KnockbackImpulse, dt: number): KnockbackImpulse {
    target.x += impulse.vx * dt;
    target.y += impulse.vy * dt;

    const decayFactor = Math.max(0, 1 - impulse.decayRate * dt);
    return {
      vx: impulse.vx * decayFactor,
      vy: impulse.vy * decayFactor,
      decayRate: impulse.decayRate,
    };
  }

  public static calculateAttackArcHitbox(
    playerPos: { x: number; y: number },
    facingDir: 'up' | 'down' | 'left' | 'right',
    reach: number,
    arcAngle: number
  ): AABBBox {
    let x = playerPos.x;
    let y = playerPos.y;
    let w = reach;
    let h = reach;

    switch (facingDir) {
      case 'up':
        y -= reach;
        w = reach * 1.2;
        x -= (w - reach) / 2;
        break;
      case 'down':
        y += reach;
        w = reach * 1.2;
        x -= (w - reach) / 2;
        break;
      case 'left':
        x -= reach;
        h = reach * 1.2;
        y -= (h - reach) / 2;
        break;
      case 'right':
        x += reach;
        h = reach * 1.2;
        y -= (h - reach) / 2;
        break;
    }

    return { x, y, w, h };
  }
}
