/**
 * Library:         lib_bejson_gamingss2_engine_items.ts
 * Family:          GamingSS2
 * Module Purpose:  Dropped pickup items, rupees, heart containers, and prop interactions.
 * Architecture:    BEJSON 105 Format / Item Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export interface DroppedItem {
  id: string;
  type: 'heart' | 'rupee' | 'magic_jar' | 'key';
  value: number;
  x: number;
  y: number;
  isCollected: boolean;
}

export class GamingSS2EngineItems {
  private activeDrops: DroppedItem[] = [];

  public spawnDrop(type: 'heart' | 'rupee' | 'magic_jar' | 'key', x: number, y: number, value: number = 1): void {
    this.activeDrops.push({
      id: `drop_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      value,
      x,
      y,
      isCollected: false,
    });
  }

  public getActiveDrops(): DroppedItem[] {
    return this.activeDrops.filter(d => !d.isCollected);
  }

  public collectDrop(id: string): DroppedItem | undefined {
    const item = this.activeDrops.find(d => d.id === id);
    if (item && !item.isCollected) {
      item.isCollected = true;
      return item;
    }
    return undefined;
  }
}
