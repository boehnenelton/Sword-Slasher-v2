/**
 * Library:         lib_bejson_gamingss2_engine_player.ts
 * Family:          GamingSS2
 * Module Purpose:  Shadow Link player state, movement physics, sword attack arcs, and spin attack charging.
 * Architecture:    BEJSON 105 Format / Player Entity Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f
 */

import { InputState } from './lib_bejson_gamingss2_engine_input';

export interface PlayerStats {
  x: number;
  y: number;
  speed: number;
  facing: 'up' | 'down' | 'left' | 'right';
  isSlashing: boolean;
  slashTimer: number;
  isSpinCharging: boolean;
  spinChargeTime: number;
  isSpinning: boolean;
  isDashing: boolean;
  dashTimer: number;
}

export class GamingSS2EnginePlayer {
  private stats: PlayerStats = {
    x: 100,
    y: 100,
    speed: 120,
    facing: 'down',
    isSlashing: false,
    slashTimer: 0,
    isSpinCharging: false,
    spinChargeTime: 0,
    isSpinning: false,
    isDashing: false,
    dashTimer: 0,
  };

  public getStats(): PlayerStats {
    return { ...this.stats };
  }

  public setPosition(x: number, y: number): void {
    this.stats.x = x;
    this.stats.y = y;
  }

  public update(dt: number, input: InputState): void {
    // 1. Dash logic
    if (this.stats.isDashing) {
      this.stats.dashTimer -= dt;
      let dashSpeed = this.stats.speed * 2.5;
      if (this.stats.facing === 'left') this.stats.x -= dashSpeed * dt;
      if (this.stats.facing === 'right') this.stats.x += dashSpeed * dt;
      if (this.stats.facing === 'up') this.stats.y -= dashSpeed * dt;
      if (this.stats.facing === 'down') this.stats.y += dashSpeed * dt;

      if (this.stats.dashTimer <= 0) {
        this.stats.isDashing = false;
      }
      return;
    }

    if (input.btnX && !this.stats.isDashing) {
      this.stats.isDashing = true;
      this.stats.dashTimer = 0.2;
      return;
    }

    // 2. Slash logic
    if (this.stats.isSlashing) {
      this.stats.slashTimer -= dt;
      if (this.stats.slashTimer <= 0) {
        this.stats.isSlashing = false;
      }
      return;
    }

    if (input.btnA && !this.stats.isSlashing) {
      this.stats.isSlashing = true;
      this.stats.slashTimer = 0.18;
    }

    // 3. Movement
    const { dx, dy } = input.move;
    if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
      this.stats.x += dx * this.stats.speed * dt;
      this.stats.y += dy * this.stats.speed * dt;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.stats.facing = dx > 0 ? 'right' : 'left';
      } else {
        this.stats.facing = dy > 0 ? 'down' : 'up';
      }
    }
  }
}
