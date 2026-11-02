/**
 * Library:         lib_bejson_gamingss2_engine_effects.ts
 * Family:          GamingSS2
 * Module Purpose:  Screen shake, directional color flashes, and hit particle emitter burst FX.
 * Architecture:    BEJSON 105 Format / FX Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export class GamingSS2EngineEffects {
  private particles: Particle[] = [];
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;

  public triggerScreenShake(intensity: number = 8, duration: number = 0.25): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  public getScreenShakeOffset(): { offsetX: number; offsetY: number } {
    if (this.shakeDuration <= 0) return { offsetX: 0, offsetY: 0 };
    return {
      offsetX: (Math.random() - 0.5) * this.shakeIntensity,
      offsetY: (Math.random() - 0.5) * this.shakeIntensity,
    };
  }

  public spawnHitBurst(x: number, y: number, color: string = '#DE2626', count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.2 + Math.random() * 0.2,
        color,
      });
    }
  }

  public update(dt: number): void {
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
    }

    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
    }

    this.particles = this.particles.filter(p => p.life < p.maxLife);
  }

  public renderParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.restore();
  }
}
