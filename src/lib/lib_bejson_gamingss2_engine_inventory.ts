/**
 * Library:         lib_bejson_gamingss2_engine_inventory.ts
 * Family:          GamingSS2
 * Module Purpose:  Equipment slots, dark weapons, shields, and inventory data management.
 * Architecture:    BEJSON 105 Format / Inventory Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export interface InventoryItem {
  itemId: string;
  name: string;
  category: 'weapon' | 'shield' | 'quest_item' | 'consumable';
  attackPower?: number;
  defensePower?: number;
  iconSvg?: string;
}

export class GamingSS2EngineInventory {
  private items: Map<string, InventoryItem> = new Map();
  private equippedWeaponId: string = 'dark_blade';
  private equippedShieldId?: string;

  constructor() {
    // Default dark blade
    this.addItem({
      itemId: 'dark_blade',
      name: "Ganon's Dark Blade",
      category: 'weapon',
      attackPower: 12,
    });
  }

  public addItem(item: InventoryItem): void {
    this.items.set(item.itemId, item);
  }

  public getItem(itemId: string): InventoryItem | undefined {
    return this.items.get(itemId);
  }

  public getEquippedWeapon(): InventoryItem | undefined {
    return this.items.get(this.equippedWeaponId);
  }

  public equipWeapon(itemId: string): boolean {
    if (this.items.has(itemId) && this.items.get(itemId)?.category === 'weapon') {
      this.equippedWeaponId = itemId;
      return true;
    }
    return false;
  }
}
