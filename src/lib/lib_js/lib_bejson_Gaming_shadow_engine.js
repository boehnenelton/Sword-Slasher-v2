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
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
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
      { id: 'shadow_boomerang', name: 'Shadow Boomerang', icon: '🪃', category: 'Y_ITEM', unlocked: true, description: 'Homing boomerang that returns to Shadow Link and crushes props.' },
      { id: 'dark_bow', name: 'Dark Bow & Arrows', icon: '🏹', category: 'Y_ITEM', ammo: 30, maxAmmo: 30, unlocked: true, description: 'Fires shadow piercing arrows across distances.' }
    ];
    this.listeners = new Set();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  setSelectedYItem(slug) {
    const item = this.yItems.find(i => i.id === slug && i.unlocked);
    if (item) {
      this.activeYItemSlug = item.id;
      this.notify();
    }
  }

  getActiveYItem() {
    return this.yItems.find(i => i.id === this.activeYItemSlug);
  }
}

export const shadowEngine = new ShadowEngineState();
export default shadowEngine;
