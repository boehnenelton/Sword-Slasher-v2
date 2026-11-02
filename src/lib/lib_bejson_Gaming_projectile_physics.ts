/**
 * Library:         lib_bejson_Gaming_projectile_physics.ts
 * Family:          Gaming
 * Module Purpose:  Multi-Boomerang Homing Trajectory & Dropped Item Physics Engine
 * Architecture:    BEJSON 105 Kinematic Projectile & Item Pickup Specification
 * Version:         200101
 * Release_Version: 300
 * Date:            2026-10-25
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   105a0040-2026-1025-9999-000000000310
 */

export interface BoomerangProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  outwardTimer: number; // Ticks before returning to player
  maxTimer: number;
  angle: number;
  hasReturned: boolean;
}

export interface DroppedItem {
  id: string;
  x: number;
  y: number;
  type: 'rupee' | 'heart' | 'bomb' | 'arrow';
  value: number;
  timer: number;
}

export interface ObjectCollisionBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSolid: boolean;
  isBreakable: boolean;
  causesBoomerangReturn: boolean;
  boomerangCrushThrough: boolean;
}

export class ProjectilePhysicsEngine {
  public boomerangs: BoomerangProjectile[] = [];
  public droppedItems: DroppedItem[] = [];

  public spawnBoomerang(startX: number, startY: number, facing: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT', spreadAngle: number = 0) {
    let baseVx = 0;
    let baseVy = 0;
    const speed = 6.0;

    if (facing === 'UP') { baseVx = 0; baseVy = -speed; }
    if (facing === 'DOWN') { baseVx = 0; baseVy = speed; }
    if (facing === 'LEFT') { baseVx = -speed; baseVy = 0; }
    if (facing === 'RIGHT') { baseVx = speed; baseVy = 0; }

    // Apply spread angle offset for multi-boomerang fan throws
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

  public checkBoomerangObjectCollisions(
    objects: ObjectCollisionBox[],
    onCrushBreakable?: (obj: ObjectCollisionBox) => void,
    onBounceReturn?: (b: BoomerangProjectile) => void
  ) {
    this.boomerangs.forEach(b => {
      objects.forEach(obj => {
        const bx = b.x - 8;
        const by = b.y - 8;
        const bw = 16;
        const bh = 16;
        const ox = obj.x - obj.width / 2;
        const oy = obj.y - obj.height / 2;

        const isColliding =
          bx < ox + obj.width &&
          bx + bw > ox &&
          by < oy + obj.height &&
          by + bh > oy;

        if (isColliding) {
          if (obj.isBreakable || obj.boomerangCrushThrough) {
            // Breakable object: Crush through it and destroy prop, boomerang keeps flying!
            if (onCrushBreakable) {
              onCrushBreakable(obj);
            }
          } else if ((obj.isSolid || obj.causesBoomerangReturn) && b.outwardTimer > 0) {
            // Solid non-breakable object: Early boomerang return!
            b.outwardTimer = 0;
            if (onBounceReturn) {
              onBounceReturn(b);
            }
          }
        }
      });
    });
  }

  public spawnDrop(x: number, y: number) {
    const rand = Math.random();
    let type: 'rupee' | 'heart' | 'bomb' | 'arrow' = 'rupee';
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
      timer: 300 // Ticks before despawning
    });
  }

  public updateBoomerangs(playerX: number, playerY: number, onPickDrop?: (item: DroppedItem) => void) {
    this.boomerangs = this.boomerangs.filter(b => {
      if (b.outwardTimer > 0) {
        // Outward flight
        b.x += b.vx;
        b.y += b.vy;
        b.outwardTimer--;
      } else {
        // Homing return flight towards Shadow Link
        const dx = playerX - b.x;
        const dy = playerY - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 18) {
          // Returned to player!
          return false;
        }

        const returnSpeed = 7.0;
        b.vx = (dx / dist) * returnSpeed;
        b.vy = (dy / dist) * returnSpeed;
        b.x += b.vx;
        b.y += b.vy;
      }

      b.angle += 0.3; // Spinning rotation animation

      // Collect any dropped items touched by the returning boomerang
      if (onPickDrop) {
        this.droppedItems.forEach(item => {
          if (Math.hypot(item.x - b.x, item.y - b.y) < 24) {
            onPickDrop(item);
            item.timer = 0; // despawn item
          }
        });
      }

      return b.maxTimer-- > 0;
    });
  }

  public updateDroppedItems(playerX: number, playerY: number, onPickDrop: (item: DroppedItem) => void) {
    this.droppedItems = this.droppedItems.filter(item => {
      item.timer--;
      if (item.timer <= 0) return false;

      // Check player collision pickup
      if (Math.hypot(playerX - item.x, playerY - item.y) < 20) {
        onPickDrop(item);
        return false;
      }
      return true;
    });
  }
}

export const projectilePhysics = new ProjectilePhysicsEngine();
