/**
 * Library:         lib_bejson_gamingss2_engine_events.ts
 * Family:          GamingSS2
 * Module Purpose:  Game event bus dispatcher, trigger zones, and story event listeners.
 * Architecture:    BEJSON 105 Format / Event Bus Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export type SS2EventType = 'LEVEL_ENTER' | 'ENEMY_DEFEATED' | 'ZELDA_KIDNAPPED' | 'PROP_DESTROYED';

export interface SS2Event {
  type: SS2EventType;
  payload?: any;
}

export class GamingSS2EngineEvents {
  private listeners: Map<SS2EventType, Array<(event: SS2Event) => void>> = new Map();

  public subscribe(type: SS2EventType, callback: (event: SS2Event) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);

    return () => {
      const arr = this.listeners.get(type);
      if (arr) {
        const idx = arr.indexOf(callback);
        if (idx !== -1) arr.splice(idx, 1);
      }
    };
  }

  public emit(type: SS2EventType, payload?: any): void {
    const arr = this.listeners.get(type);
    if (arr) {
      const evt: SS2Event = { type, payload };
      for (const fn of arr) {
        fn(evt);
      }
    }
  }
}
