/**
 * Library:         lib_bejson_gamingss2_engine_core.ts
 * Family:          GamingSS2
 * Module Purpose:  Core engine initialization, delta-time calibrated loop, and BEJSON matrix binding.
 * Architecture:    BEJSON 105 Format / Pure Decoupled Engine Runtime
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

import { GAMINGSS2_ERRORS } from './lib_bejson_gamingss2_engine_errors';

export interface EngineConfig {
  fpsTarget: number;
  enableDebug: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

export interface BEJSONDataMatrix {
  Format: string;
  Format_Version: string;
  Schema_Name?: string;
  Fields: Array<{ name: string; type: string }>;
  Values: Array<Array<any>>;
}

export class GamingSS2EngineCore {
  private config: EngineConfig;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private updateCallbacks: Array<(dt: number) => void> = [];
  private renderCallbacks: Array<() => void> = [];
  private dataCache: Map<string, BEJSONDataMatrix> = new Map();

  constructor(config?: Partial<EngineConfig>) {
    this.config = {
      fpsTarget: 60,
      enableDebug: false,
      viewportWidth: 800,
      viewportHeight: 600,
      ...config,
    };
  }

  public registerDataMatrix(key: string, matrix: BEJSONDataMatrix): void {
    if (!matrix || !matrix.Fields || !matrix.Values) {
      throw new Error(`[GamingSS2Core Error ${GAMINGSS2_ERRORS.ERR_SS2_DATA_INVALID}] Invalid BEJSON matrix for ${key}`);
    }
    this.dataCache.set(key, matrix);
  }

  public getDataMatrix(key: string): BEJSONDataMatrix | undefined {
    return this.dataCache.get(key);
  }

  public onUpdate(fn: (dt: number) => void): void {
    this.updateCallbacks.push(fn);
  }

  public onRender(fn: () => void): void {
    this.renderCallbacks.push(fn);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = (currentTime: number): void => {
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
