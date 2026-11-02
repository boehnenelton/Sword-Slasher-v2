/**
 * Library:         lib_bejson_gamingss2_engine_core.js
 * Family:          GamingSS2
 * Module Purpose:  Core engine initialization, delta-time calibrated loop, and BEJSON matrix binding (Vanilla JS Mirror).
 * Architecture:    BEJSON 105 Format / Pure Decoupled Engine Runtime
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   e9f82d1a-4c3b-4f5a-8b1e-9d2c3f4a5b6c
 */

import { GAMINGSS2_ERRORS } from './lib_bejson_gamingss2_engine_errors.js';

export class GamingSS2EngineCore {
  constructor(config = {}) {
    this.config = {
      fpsTarget: 60,
      enableDebug: false,
      viewportWidth: 800,
      viewportHeight: 600,
      ...config,
    };
    this.isRunning = false;
    this.lastTime = 0;
    this.animFrameId = null;
    this.updateCallbacks = [];
    this.renderCallbacks = [];
    this.dataCache = new Map();
  }

  registerDataMatrix(key, matrix) {
    if (!matrix || !matrix.Fields || !matrix.Values) {
      throw new Error(`[GamingSS2Core Error ${GAMINGSS2_ERRORS.ERR_SS2_DATA_INVALID}] Invalid BEJSON matrix for ${key}`);
    }
    this.dataCache.set(key, matrix);
  }

  getDataMatrix(key) {
    return this.dataCache.get(key);
  }

  onUpdate(fn) {
    this.updateCallbacks.push(fn);
  }

  onRender(fn) {
    this.renderCallbacks.push(fn);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  loop = (currentTime) => {
    if (!this.isRunning) return;
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    for (const updateFn of this.updateCallbacks) {
      updateFn(dt);
    }

    for (const renderFn of this.renderCallbacks) {
      renderFn();
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };
}
