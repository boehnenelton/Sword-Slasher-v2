/**
 * Library:         lib_bejson_Gaming_shadow_engine.js
 * Family:          Gaming
 * Module Purpose:  Shadow Engine 105 Feature Parity & Sub Screen State Manager
 * Architecture:    BEJSON 105 Shadow Engine Sub-Screen & Item Selection Specification
 * Version:         200105
 * Release_Version: 300
 * Date:            2026-10-25
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   105a0030-2026-1025-9999-000000000305
 */

export class ShadowEngineState {
  constructor() {
    this.rupees = 250;
    this.maxRupees = 999;
    this.bombs = 10;
    this.maxBombs = 10;
    this.arrows = 30;
    this.maxArrows = 30;
    this.smallKeys = 2;
    this.heartPieces = 3;
    this.activeYItemSlug = 'shadow_boomerang';
    this.doActionName = 'LIFT · TALK · PULL · DASH';

    this.yItems = [
      { id: 'shadow_boomerang', name: 'Shadow Boomerang', icon: '🪃', category: 'Y_ITEM', unlocked: true, description: 'Homing boomerang that returns to Shadow Link.' },
      { id: 'dark_bow', name: 'Dark Bow & Arrows', icon: '🏹', category: 'Y_ITEM', ammo: 30, maxAmmo: 30, unlocked: true, description: 'Fires shadow piercing arrows across distances.' },
      { id: 'dark_bombs', name: 'Dark Bombs', icon: '💣', category: 'Y_ITEM', ammo: 10, maxAmmo: 10, unlocked: true, description: 'Demolishes cracked walls and heavy barriers.' },
      { id: 'magic_powder', name: 'Shadow Powder', icon: '✨', category: 'Y_ITEM', unlocked: true, description: 'Transforms dark magic hazards into health items.' },
      { id: 'hookshot', name: 'Shadow Hookshot', icon: '🪝', category: 'Y_ITEM', unlocked: true, description: 'Grapples onto wooden chests and far posts.' },
      { id: 'dark_elixir', name: 'Dark Elixir', icon: '🧪', category: 'Y_ITEM', ammo: 2, maxAmmo: 4, unlocked: true, description: 'Restores 50 health points for Shadow Link.' },
      { id: 'fire_rod', name: 'Flame Rod', icon: '🔥', category: 'Y_ITEM', unlocked: true, description: 'Launches dark crimson flames.' },
      { id: 'ice_rod', name: 'Frost Rod', icon: '❄️', category: 'Y_ITEM', unlocked: true, description: 'Freezes enemies in solid ice blocks.' }
    ];
  }

  setSelectedYItem(slug) {
    const item = this.yItems.find(i => i.id === slug && i.unlocked);
    if (item) {
      this.activeYItemSlug = item.id;
    }
  }

  getActiveYItem() {
    return this.yItems.find(i => i.id === this.activeYItemSlug);
  }
}

export const shadowEngine = new ShadowEngineState();
export default shadowEngine;
