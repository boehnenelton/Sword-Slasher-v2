/**
 * Library:         lib_bejson_Gaming_projectile_physics.js
 * Family:          Gaming
 * Module Purpose:  Multi-Boomerang Homing Trajectory & Dropped Item Physics Engine (JS Mirror)
 * Architecture:    BEJSON 105 Kinematic Projectile & Item Pickup Specification
 * Version:         200101
 * Release_Version: 300
 * Date:            2026-10-25
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   105a0041-2026-1025-9999-000000000311
 */

class ProjectilePhysicsEngineJS {
  constructor() {
    this.boomerangs = [];
    this.droppedItems = [];
  }

  spawnBoomerang(startX, startY, facing, spreadAngle = 0) {
    let baseVx = 0;
    let baseVy = 0;
    const speed = 6.0;

    if (facing === 'UP') { baseVx = 0; baseVy = -speed; }
    if (facing === 'DOWN') { baseVx = 0; baseVy = speed; }
    if (facing === 'LEFT') { baseVx = -speed; baseVy = 0; }
    if (facing === 'RIGHT') { baseVx = speed; baseVy = 0; }

    const cos = Math.cos(spreadAngle);
    const sin = Math.sin(spreadAngle);
    const vx = baseVx * cos - baseVy * sin;
    const vy = baseVx * sin + baseVy * cos;

    this.boomerangs.push({
      id: Math.random().toString(36).substring(2, 9),
      x: startX,
      y: startY,
      vx,
      vy,
      outwardTimer: 25,
      maxTimer: 100,
      angle: Math.atan2(vy, vx),
      hasReturned: false
    });
  }

  checkBoomerangObjectCollisions(objects, onCrushBreakable, onBounceReturn) {
    this.boomerangs.forEach(b => {
      objects.forEach(obj => {
        const bx = b.x - 8;
        const by = b.y - 8;
        const bw = 16;
        const bh = 16;
        const ox = obj.x - (obj.width || 16) / 2;
        const oy = obj.y - (obj.height || 16) / 2;
        const ow = obj.width || 16;
        const oh = obj.height || 16;

        const isColliding =
          bx < ox + ow &&
          bx + bw > ox &&
          by < oy + oh &&
          by + bh > oy;

        if (isColliding) {
          if (obj.isBreakable || obj.boomerangCrushThrough) {
            if (onCrushBreakable) {
              onCrushBreakable(obj);
            }
          } else if ((obj.isSolid || obj.causesBoomerangReturn) && b.outwardTimer > 0) {
            b.outwardTimer = 0;
            if (onBounceReturn) {
              onBounceReturn(b);
            }
          }
        }
      });
    });
  }

  spawnDrop(x, y) {
    const rand = Math.random();
    let type = 'rupee';
    let value = 5;

    if (rand < 0.45) {
      type = 'rupee';
      value = 5;
    } else if (rand < 0.70) {
      type = 'heart';
      value = 20;
    } else if (rand < 0.85) {
      type = 'bomb';
      value = 2;
    } else {
      type = 'arrow';
      value = 5;
    }

    this.droppedItems.push({
      id: Math.random().toString(36).substring(2, 9),
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      type,
      value,
      timer: 300
    });
  }

  updateBoomerangs(playerX, playerY, onPickDrop) {
    this.boomerangs = this.boomerangs.filter(b => {
      if (b.outwardTimer > 0) {
        b.x += b.vx;
        b.y += b.vy;
        b.outwardTimer--;
      } else {
        const dx = playerX - b.x;
        const dy = playerY - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 18) {
          return false;
        }

        const returnSpeed = 7.0;
        b.vx = (dx / dist) * returnSpeed;
        b.vy = (dy / dist) * returnSpeed;
        b.x += b.vx;
        b.y += b.vy;
      }

      b.angle += 0.3;

      if (onPickDrop) {
        this.droppedItems.forEach(item => {
          if (Math.hypot(item.x - b.x, item.y - b.y) < 24) {
            onPickDrop(item);
            item.timer = 0;
          }
        });
      }

      return b.maxTimer-- > 0;
    });
  }

  updateDroppedItems(playerX, playerY, onPickDrop) {
    this.droppedItems = this.droppedItems.filter(item => {
      item.timer--;
      if (item.timer <= 0) return false;

      if (Math.hypot(playerX - item.x, playerY - item.y) < 20) {
        onPickDrop(item);
        return false;
      }
      return true;
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProjectilePhysicsEngineJS };
}

export { ProjectilePhysicsEngineJS };
export default ProjectilePhysicsEngineJS;
