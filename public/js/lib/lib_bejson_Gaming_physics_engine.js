/**
 * Library:         lib_bejson_Gaming_physics_engine.js
 * Family:          Gaming
 * Module Purpose:  JavaScript Mirror - BEJSON 105 High-Performance AABB Bounding Box Physics & Vector Knockback Engine
 * Architecture:    AABB check, Vector Knockback, Corner-Sliding Box Collision logic
 * Version:         3.0.0
 * Release_Version: 300
 * Date:            2026-10-28
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0444-2026-1028-9999-000000000444
 */

class PhysicsEngine {
  constructor() {
    this.boxPoolA = { x: 0, y: 0, width: 0, height: 0 };
    this.boxPoolB = { x: 0, y: 0, width: 0, height: 0 };
  }

  /**
   * Fast Axis-Aligned Bounding Box (AABB) intersection check
   */
  checkAABB(a, b) {
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
  checkAABBRaw(ax, ay, aw, ah, bx, by, bw, bh) {
    return (
      ax < bx + bw &&
      ax + aw > bx &&
      ay < by + bh &&
      ay + ah > by
    );
  }

  /**
   * Directional Vector Knockback Calculation
   */
  calculateKnockbackVector(srcX, srcY, tgtX, tgtY, force) {
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
   */
  checkCornerSlidingCollision(x, y, w, h, vx, vy, solidTilesMap, innerMargin = 6, tileSize = 16) {
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
          adjustedX = x;
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
          adjustedY = y;
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
  applyFriction(knockback, friction = 0.82) {
    knockback.vx *= friction;
    knockback.vy *= friction;
    if (Math.abs(knockback.vx) < 0.05) knockback.vx = 0;
    if (Math.abs(knockback.vy) < 0.05) knockback.vy = 0;
  }
}

export const physicsEngine = new PhysicsEngine();
export default physicsEngine;
