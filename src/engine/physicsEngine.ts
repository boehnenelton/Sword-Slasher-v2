/**
 * Library:         physicsEngine.ts
 * Module Purpose:  BEJSON 105 High-Performance AABB Bounding Box Physics & Vector Knockback Engine
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   88a0a212-5e93-4712-bcca-24792e786d03
 * Version:         200106
 */

export interface AABBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface KnockbackState {
  vx: number;
  vy: number;
}

class PhysicsEngine {
  /**
   * Fast Axis-Aligned Bounding Box (AABB) intersection check
   */
  public checkAABB(a: AABBBox, b: AABBBox): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Fast AABB check with raw coordinates (zero object creation)
   */
  public checkAABBRaw(
    ax: number,
    ay: number,
    aw: number,
    ah: number,
    bx: number,
    by: number,
    bw: number,
    bh: number
  ): boolean {
    return (
      ax < bx + bw &&
      ax + aw > bx &&
      ay < by + bh &&
      ay + ah > by
    );
  }

  /**
   * Directional Vector Knockback Calculation
   * Normalizes direction vector from source (attacker) to target (victim)
   * and scales by knockback force.
   */
  public calculateKnockbackVector(
    srcX: number,
    srcY: number,
    tgtX: number,
    tgtY: number,
    force: number
  ): KnockbackState {
    let dx = tgtX - srcX;
    let dy = tgtY - srcY;
    let dist = Math.hypot(dx, dy);

    if (dist < 0.001) {
      dx = 0;
      dy = 1;
      dist = 1;
    }

    return {
      vx: (dx / dist) * force,
      vy: (dy / dist) * force,
    };
  }

  /**
   * 6px Inner Margin Corner-Sliding Box Collision check
   * Applies an inner margin to actor bounding box prior to testing, allowing smooth sliding along walls and tile corners without snagging.
   */
  public checkCornerSlidingCollision(
    x: number,
    y: number,
    w: number,
    h: number,
    vx: number,
    vy: number,
    solidTilesMap: Map<string, boolean>,
    innerMargin: number = 6,
    tileSize: number = 16
  ): { collideX: boolean; collideY: boolean; adjustedX: number; adjustedY: number } {
    let adjustedX = x + vx;
    let adjustedY = y + vy;
    let collideX = false;
    let collideY = false;

    // Test X movement with Y inner margin
    const testX = x + vx;
    const minY_X = y + innerMargin;
    const maxY_X = y + h - innerMargin;

    const startTileX = Math.floor(testX / tileSize);
    const endTileX = Math.floor((testX + w) / tileSize);
    const startTileY_X = Math.floor(minY_X / tileSize);
    const endTileY_X = Math.floor(maxY_X / tileSize);

    for (let tx = startTileX; tx <= endTileX; tx++) {
      for (let ty = startTileY_X; ty <= endTileY_X; ty++) {
        if (solidTilesMap.get(`${tx}_${ty}`)) {
          collideX = true;
          adjustedX = x; // Stop horizontal movement
          break;
        }
      }
      if (collideX) break;
    }

    // Test Y movement with X inner margin
    const testY = y + vy;
    const minX_Y = x + innerMargin;
    const maxX_Y = x + w - innerMargin;

    const startTileY = Math.floor(testY / tileSize);
    const endTileY = Math.floor((testY + h) / tileSize);
    const startTileX_Y = Math.floor(minX_Y / tileSize);
    const endTileX_Y = Math.floor(maxX_Y / tileSize);

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX_Y; tx <= endTileX_Y; tx++) {
        if (solidTilesMap.get(`${tx}_${ty}`)) {
          collideY = true;
          adjustedY = y; // Stop vertical movement
          break;
        }
      }
      if (collideY) break;
    }

    return { collideX, collideY, adjustedX, adjustedY };
  }

  /**
   * Applies friction decay to knockback velocity
   */
  public applyFriction(knockback: KnockbackState, friction: number = 0.82): void {
    knockback.vx *= friction;
    knockback.vy *= friction;
    if (Math.abs(knockback.vx) < 0.05) knockback.vx = 0;
    if (Math.abs(knockback.vy) < 0.05) knockback.vy = 0;
  }
}

export const physicsEngine = new PhysicsEngine();
