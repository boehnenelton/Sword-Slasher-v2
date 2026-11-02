/**
 * Library:         lib_bejson_Gaming_screen_effects.ts
 * Family:          Gaming
 * Module Purpose:  Cinematic screen shake, flash, fade, letterboxing, and color overlays for BEJSON gaming applications
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-10-27
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   c89f3102-105a-4e2b-8a02-921a88b105ef
 */

export interface ScreenShakeState {
  intensity: number;
  duration: number; // In seconds
  elapsed: number;
  decay: number;
  offsetX: number;
  offsetY: number;
}

export interface ScreenFlashState {
  color: string;
  opacity: number;
  duration: number; // In seconds
  elapsed: number;
}

export interface ScreenFadeState {
  color: string;
  startOpacity: number;
  targetOpacity: number;
  currentOpacity: number;
  duration: number;
  elapsed: number;
}

export interface LetterboxState {
  barHeight: number;      // Current height in px
  targetHeight: number;   // Target height in px
  speed: number;          // Transition speed px/s
}

export class BEJSONGamingScreenEffects {
  public shake: ScreenShakeState = {
    intensity: 0,
    duration: 0,
    elapsed: 0,
    decay: 0.9,
    offsetX: 0,
    offsetY: 0,
  };

  public flash: ScreenFlashState = {
    color: "#FFFFFF",
    opacity: 0,
    duration: 0,
    elapsed: 0,
  };

  public fade: ScreenFadeState = {
    color: "#000000",
    startOpacity: 0,
    targetOpacity: 0,
    currentOpacity: 0,
    duration: 0,
    elapsed: 0,
  };

  public letterbox: LetterboxState = {
    barHeight: 0,
    targetHeight: 0,
    speed: 120,
  };

  /**
   * Triggers a screen shake with specified magnitude and duration
   */
  public triggerShake(intensity: number = 8, duration: number = 0.35, decay: number = 0.88): void {
    this.shake.intensity = intensity;
    this.shake.duration = duration;
    this.shake.elapsed = 0;
    this.shake.decay = decay;
  }

  /**
   * Triggers a screen flash (e.g. vivid red on hit, pure white on explosion)
   */
  public triggerFlash(color: string = "#DE2626", opacity: number = 0.65, duration: number = 0.25): void {
    this.flash.color = color;
    this.flash.opacity = opacity;
    this.flash.duration = duration;
    this.flash.elapsed = 0;
  }

  /**
   * Starts a smooth screen fade (e.g. level transition, game over, cutscene)
   */
  public startFade(targetOpacity: number, duration: number = 0.5, color: string = "#000000"): void {
    this.fade.color = color;
    this.fade.startOpacity = this.fade.currentOpacity;
    this.fade.targetOpacity = targetOpacity;
    this.fade.duration = duration;
    this.fade.elapsed = 0;
  }

  /**
   * Sets target cinematic letterbox bar height (0 for gameplay, ~32px for cutscene)
   */
  public setLetterbox(targetHeightPx: number, speedPxPerSec: number = 100): void {
    this.letterbox.targetHeight = targetHeightPx;
    this.letterbox.speed = speedPxPerSec;
  }

  /**
   * Core frame update loop for updating active screen effects
   * @param dt Delta time in seconds
   */
  public update(dt: number): void {
    // 1. Update Screen Shake
    if (this.shake.elapsed < this.shake.duration && this.shake.intensity > 0.01) {
      this.shake.elapsed += dt;
      // High frequency pseudo-random offset
      const angle = Math.random() * Math.PI * 2;
      this.shake.offsetX = Math.cos(angle) * this.shake.intensity;
      this.shake.offsetY = Math.sin(angle) * this.shake.intensity;
      this.shake.intensity *= Math.pow(this.shake.decay, dt * 60);
    } else {
      this.shake.offsetX = 0;
      this.shake.offsetY = 0;
      this.shake.intensity = 0;
    }

    // 2. Update Screen Flash
    if (this.flash.elapsed < this.flash.duration) {
      this.flash.elapsed += dt;
      const progress = this.flash.elapsed / this.flash.duration;
      this.flash.opacity = Math.max(0, this.flash.opacity * (1 - progress * dt * 8));
    } else {
      this.flash.opacity = 0;
    }

    // 3. Update Screen Fade
    if (this.fade.elapsed < this.fade.duration) {
      this.fade.elapsed += dt;
      const t = Math.min(1, this.fade.elapsed / this.fade.duration);
      this.fade.currentOpacity = this.fade.startOpacity + (this.fade.targetOpacity - this.fade.startOpacity) * t;
    } else {
      this.fade.currentOpacity = this.fade.targetOpacity;
    }

    // 4. Update Letterbox Transition
    if (Math.abs(this.letterbox.barHeight - this.letterbox.targetHeight) > 0.1) {
      const dir = Math.sign(this.letterbox.targetHeight - this.letterbox.barHeight);
      this.letterbox.barHeight += dir * this.letterbox.speed * dt;
      if (dir > 0 && this.letterbox.barHeight > this.letterbox.targetHeight) {
        this.letterbox.barHeight = this.letterbox.targetHeight;
      } else if (dir < 0 && this.letterbox.barHeight < this.letterbox.targetHeight) {
        this.letterbox.barHeight = this.letterbox.targetHeight;
      }
    }
  }

  /**
   * Renders flash, fade, and letterboxing directly onto a target Canvas 2D context
   */
  public renderCanvasOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();

    // Flash Overlay
    if (this.flash.opacity > 0.001) {
      ctx.fillStyle = this.flash.color;
      ctx.globalAlpha = Math.min(1, Math.max(0, this.flash.opacity));
      ctx.fillRect(0, 0, width, height);
    }

    // Fade Overlay
    if (this.fade.currentOpacity > 0.001) {
      ctx.fillStyle = this.fade.color;
      ctx.globalAlpha = Math.min(1, Math.max(0, this.fade.currentOpacity));
      ctx.fillRect(0, 0, width, height);
    }

    ctx.globalAlpha = 1.0;

    // Letterboxing Top & Bottom Bars
    if (this.letterbox.barHeight > 0.5) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, this.letterbox.barHeight);
      ctx.fillRect(0, height - this.letterbox.barHeight, width, this.letterbox.barHeight);
    }

    ctx.restore();
  }
}

export const screenEffects = new BEJSONGamingScreenEffects();
