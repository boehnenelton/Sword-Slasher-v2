/**
 * Library:         lib_bejson_Gaming_screen_effects.js
 * Family:          Gaming
 * Module Purpose:  Cinematic screen shake, flash, fade, letterboxing, and color overlays for BEJSON gaming applications
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-10-27
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   c89f3102-105a-4e2b-8a02-921a88b105ef
 */

class BEJSONGamingScreenEffects {
  constructor() {
    this.shake = {
      intensity: 0,
      duration: 0,
      elapsed: 0,
      decay: 0.9,
      offsetX: 0,
      offsetY: 0,
    };

    this.flash = {
      color: "#FFFFFF",
      opacity: 0,
      duration: 0,
      elapsed: 0,
    };

    this.fade = {
      color: "#000000",
      startOpacity: 0,
      targetOpacity: 0,
      currentOpacity: 0,
      duration: 0,
      elapsed: 0,
    };

    this.letterbox = {
      barHeight: 0,
      targetHeight: 0,
      speed: 120,
    };
  }

  triggerShake(intensity = 8, duration = 0.35, decay = 0.88) {
    this.shake.intensity = intensity;
    this.shake.duration = duration;
    this.shake.elapsed = 0;
    this.shake.decay = decay;
  }

  triggerFlash(color = "#DE2626", opacity = 0.65, duration = 0.25) {
    this.flash.color = color;
    this.flash.opacity = opacity;
    this.flash.duration = duration;
    this.flash.elapsed = 0;
  }

  startFade(targetOpacity, duration = 0.5, color = "#000000") {
    this.fade.color = color;
    this.fade.startOpacity = this.fade.currentOpacity;
    this.fade.targetOpacity = targetOpacity;
    this.fade.duration = duration;
    this.fade.elapsed = 0;
  }

  setLetterbox(targetHeightPx, speedPxPerSec = 100) {
    this.letterbox.targetHeight = targetHeightPx;
    this.letterbox.speed = speedPxPerSec;
  }

  update(dt) {
    if (this.shake.elapsed < this.shake.duration && this.shake.intensity > 0.01) {
      this.shake.elapsed += dt;
      const angle = Math.random() * Math.PI * 2;
      this.shake.offsetX = Math.cos(angle) * this.shake.intensity;
      this.shake.offsetY = Math.sin(angle) * this.shake.intensity;
      this.shake.intensity *= Math.pow(this.shake.decay, dt * 60);
    } else {
      this.shake.offsetX = 0;
      this.shake.offsetY = 0;
      this.shake.intensity = 0;
    }

    if (this.flash.elapsed < this.flash.duration) {
      this.flash.elapsed += dt;
      const progress = this.flash.elapsed / this.flash.duration;
      this.flash.opacity = Math.max(0, this.flash.opacity * (1 - progress * dt * 8));
    } else {
      this.flash.opacity = 0;
    }

    if (this.fade.elapsed < this.fade.duration) {
      this.fade.elapsed += dt;
      const t = Math.min(1, this.fade.elapsed / this.fade.duration);
      this.fade.currentOpacity = this.fade.startOpacity + (this.fade.targetOpacity - this.fade.startOpacity) * t;
    } else {
      this.fade.currentOpacity = this.fade.targetOpacity;
    }

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

  renderCanvasOverlay(ctx, width, height) {
    ctx.save();

    if (this.flash.opacity > 0.001) {
      ctx.fillStyle = this.flash.color;
      ctx.globalAlpha = Math.min(1, Math.max(0, this.flash.opacity));
      ctx.fillRect(0, 0, width, height);
    }

    if (this.fade.currentOpacity > 0.001) {
      ctx.fillStyle = this.fade.color;
      ctx.globalAlpha = Math.min(1, Math.max(0, this.fade.currentOpacity));
      ctx.fillRect(0, 0, width, height);
    }

    ctx.globalAlpha = 1.0;

    if (this.letterbox.barHeight > 0.5) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, this.letterbox.barHeight);
      ctx.fillRect(0, height - this.letterbox.barHeight, width, this.letterbox.barHeight);
    }

    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BEJSONGamingScreenEffects };
}

export { BEJSONGamingScreenEffects };
export default BEJSONGamingScreenEffects;
