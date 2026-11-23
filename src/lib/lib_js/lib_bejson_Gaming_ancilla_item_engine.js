/**
 * Library:         lib_bejson_Gaming_ancilla_item_engine.js
 * Family:          Gaming
 * Module Purpose:  Decoupled Item System Interface & 10-Slot Ancilla Sub-Entity Execution Engine
 * Architecture:    BEJSON 105 Kinematic Item Specification (ALttP Subsystem Parity)
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-23
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * License:         PolyForm-Noncommercial-1.0.0
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   105a0050-2026-1123-9999-000000000501
 */

/**
 * 10-Slot Parallel Ancilla Execution Engine (ALttP $0C4A Parallel Slot Architecture)
 * - Slots 0–4: Front slots reserved for primary gameplay objects / projectiles (quota-controlled)
 * - Slots 5–9: Back slots for visual particles, sparks, dust, and non-blocking fx
 */
export class AncillaEngineJS {
  constructor() {
    this.TOTAL_SLOTS = 10;
    this.FRONT_SLOT_MAX = 4; // Slots 0-4 are primary gameplay objects
    this.BACK_SLOT_MIN = 5;  // Slots 5-9 are particles / transient effects
    this.slots = new Array(this.TOTAL_SLOTS).fill(null);
    this.searchIndex = 9;   // $03C4 search fallback index
  }

  /**
   * Resets and clears all 10 slots (e.g. on room transitions).
   */
  clearAll() {
    for (let i = 0; i < this.TOTAL_SLOTS; i++) {
      this.slots[i] = null;
    }
  }

  /**
   * Counts active front slots occupied by a specific item.
   * @param {string} itemId
   * @returns {number}
   */
  getActiveQuotaCount(itemId) {
    if (!itemId) return 0;
    let count = 0;
    for (let i = 0; i <= this.FRONT_SLOT_MAX; i++) {
      const slot = this.slots[i];
      if (slot && slot.active && slot.itemId === itemId) {
        count++;
      }
    }
    return count;
  }

  /**
   * Scans for an eligible slot based on object priority and quotas.
   * - Front slots: scans 4 -> 0
   * - Back slots (particles): scans 9 -> 5 (or 9 -> 0 if full)
   * - Particle eviction fallback: evicts least significant particle from ($searchIndex -> 0)
   * @param {'primary' | 'particle'} slotCategory
   * @param {string} itemId
   * @param {number} quota
   * @returns {number} Slot index (0–9) or -1 if full/quota reached
   */
  allocateSlot(slotCategory, itemId, quota = 1) {
    if (slotCategory === 'primary') {
      // 1. Quota check against front slots 0-4
      if (itemId && quota > 0) {
        const activeCount = this.getActiveQuotaCount(itemId);
        if (activeCount >= quota) {
          return -1; // Quota reached
        }
      }

      // 2. Scan front slots 4 -> 0 for free slot
      for (let i = this.FRONT_SLOT_MAX; i >= 0; i--) {
        if (!this.slots[i] || !this.slots[i].active) {
          return i;
        }
      }

      // 3. Fallback: Evictable search ($03C4 particle eviction fallback)
      let startIdx = Math.min(this.searchIndex, this.TOTAL_SLOTS - 1);
      for (let i = startIdx; i >= 0; i--) {
        const slot = this.slots[i];
        if (slot && slot.active && slot.evictable) {
          this.slots[i] = null;
          return i;
        }
      }

      return -1; // All front slots occupied and no evictable particle found
    } else {
      // Particle allocation: scan 9 -> 5 first, then 4 -> 0 if evictable
      for (let i = this.TOTAL_SLOTS - 1; i >= this.BACK_SLOT_MIN; i--) {
        if (!this.slots[i] || !this.slots[i].active) {
          return i;
        }
      }
      for (let i = this.FRONT_SLOT_MAX; i >= 0; i--) {
        if (!this.slots[i] || !this.slots[i].active) {
          return i;
        }
      }
      return -1;
    }
  }

  /**
   * Spawns an Ancilla entity into the parallel slot table.
   * @param {Object} def Ancilla definition
   * @returns {number} Slot index, or -1 if allocation failed
   */
  spawnAncilla(def) {
    const category = def.category || (def.type === 'particle' ? 'particle' : 'primary');
    const slotIdx = this.allocateSlot(category, def.itemId, def.quota ?? 1);
    if (slotIdx === -1) return -1;

    this.slots[slotIdx] = {
      slotId: slotIdx,
      active: true,
      category,
      itemId: def.itemId || 'generic',
      type: def.type || 'generic',
      x: def.x || 0,
      y: def.y || 0,
      vx: def.vx || 0,
      vy: def.vy || 0,
      angle: def.angle || 0,
      timer: def.timer ?? 60,
      maxTimer: def.timer ?? 60,
      layer: def.layer ?? 0,
      evictable: def.evictable ?? (category === 'particle'),
      state: def.state || {},
      onUpdate: def.onUpdate || null,
      onRender: def.onRender || null,
      onCollide: def.onCollide || null
    };

    return slotIdx;
  }

  /**
   * Steps all active ancillae through the tick loop.
   * @param {Object} context Execution context (player, map, physics, etc.)
   */
  updateAll(context) {
    for (let i = 0; i < this.TOTAL_SLOTS; i++) {
      const slot = this.slots[i];
      if (!slot || !slot.active) continue;

      // Position step
      slot.x += slot.vx;
      slot.y += slot.vy;
      slot.timer--;

      // Custom callback
      if (typeof slot.onUpdate === 'function') {
        const keepAlive = slot.onUpdate(slot, context);
        if (keepAlive === false) {
          slot.active = false;
          this.slots[i] = null;
          continue;
        }
      }

      // Lifespan termination
      if (slot.timer <= 0) {
        slot.active = false;
        this.slots[i] = null;
      }
    }
  }

  /**
   * Collects all active ancillae for Y-sorted rendering.
   * @returns {Array} Array of active ancilla slot objects
   */
  getActiveAncillae() {
    const list = [];
    for (let i = 0; i < this.TOTAL_SLOTS; i++) {
      const slot = this.slots[i];
      if (slot && slot.active) {
        list.push(slot);
      }
    }
    return list;
  }
}

/**
 * Decoupled Item Registry Interface
 * Enforces clean separation between engine runtime and game item specifications.
 */
export class ItemRegistry {
  constructor() {
    this.itemMap = new Map();
  }

  /**
   * Registers an item definition.
   * @param {Object} itemDef
   * - id: string
   * - name: string
   * - icon: string
   * - category: 'Y_ITEM' | 'PASSIVE' | 'BOTTLE'
   * - quota: number (max active front-slot ancillae, default 1)
   * - cooldownFrames: number (post-use lockout cooldown)
   * - useAnimationFrames: number (player animation lock)
   * - ammoType: string | null ('arrows' | 'bombs' | null)
   * - ammoCost: number
   * - onExecute: function(context, ancillaEngine) => boolean
   */
  registerItem(itemDef) {
    if (!itemDef || !itemDef.id) {
      throw new Error('[ItemRegistry] Item definition must have a valid string id.');
    }
    this.itemMap.set(itemDef.id, {
      quota: 1,
      cooldownFrames: 20,
      useAnimationFrames: 14,
      ammoType: null,
      ammoCost: 0,
      category: 'Y_ITEM',
      ...itemDef
    });
  }

  getItem(id) {
    return this.itemMap.get(id) || null;
  }

  hasItem(id) {
    return this.itemMap.has(id);
  }

  getAllItems() {
    return Array.from(this.itemMap.values());
  }
}

/**
 * 24-Slot Inventory & Player State Machine Coordinator ($7EF340+ & $0202 Parity)
 * Enforces Miyamoto's single-slot active Y-item economy and strict state lockouts.
 */
export class InventoryState {
  constructor(itemRegistry = null) {
    this.registry = itemRegistry || new ItemRegistry();
    this.SLOT_COUNT = 24;
    this.slots = new Array(this.SLOT_COUNT).fill(null);
    this.equippedYItemId = null; // $0202 equipped item index / slug

    // State lockouts ($3C sword charge lockout & $0301 active item lock)
    this.swordLockout = false;      // True when holding B / sword charge / spin attack
    this.actionLockoutTimer = 0;    // Remaining frames for active item animation commit
    this.activeItemCooldown = 0;    // Cooldown frames before Y can be pressed again

    this.listeners = new Set();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  setSwordLockout(isLocked) {
    this.swordLockout = !!isLocked;
  }

  tickLockouts() {
    if (this.actionLockoutTimer > 0) this.actionLockoutTimer--;
    if (this.activeItemCooldown > 0) this.activeItemCooldown--;
  }

  /**
   * Sets the active Y-button item ($0202 parity).
   * @param {string} itemId
   */
  setEquippedYItem(itemId) {
    if (!itemId) {
      this.equippedYItemId = null;
      this.notify();
      return;
    }
    const item = this.registry.getItem(itemId);
    if (item) {
      this.equippedYItemId = item.id;
      this.notify();
    }
  }

  getEquippedYItem() {
    return this.registry.getItem(this.equippedYItemId);
  }

  /**
   * Sets slot data in the 24-slot array ($7EF340+ parity).
   * @param {number} slotIndex (0-23)
   * @param {Object} slotData
   */
  setSlot(slotIndex, slotData) {
    if (slotIndex < 0 || slotIndex >= this.SLOT_COUNT) return;
    this.slots[slotIndex] = slotData;
    this.notify();
  }

  getSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.SLOT_COUNT) return null;
    return this.slots[slotIndex];
  }

  /**
   * Triggers the equipped Y-button item through the decoupled interface.
   * Enforces sword lockout, action lock, ammo verification, and ancilla dispatch.
   * @param {Object} context Execution context (player x, y, facing, ammo counts, sfx, etc.)
   * @param {AncillaEngineJS} ancillaEngine
   * @returns {Object} Result { success: boolean, reason?: string, slotIndex?: number }
   */
  executeEquippedYItem(context, ancillaEngine) {
    // 1. Check sword lockout ($3C parity: charging/holding sword locks out Y and A items)
    if (this.swordLockout) {
      return { success: false, reason: 'SWORD_LOCKOUT' };
    }

    // 2. Check item action lockout ($0301 parity: busy with animation commit)
    if (this.actionLockoutTimer > 0 || this.activeItemCooldown > 0) {
      return { success: false, reason: 'ACTION_LOCKED' };
    }

    // 3. Resolve active item
    const item = this.getEquippedYItem();
    if (!item) {
      return { success: false, reason: 'NO_ITEM_EQUIPPED' };
    }

    // 4. Ammo check if required
    if (item.ammoType && typeof context.getAmmo === 'function') {
      const currentAmmo = context.getAmmo(item.ammoType);
      const cost = item.ammoCost || 1;
      if (currentAmmo < cost) {
        return { success: false, reason: 'OUT_OF_AMMO' };
      }
      if (typeof context.consumeAmmo === 'function') {
        context.consumeAmmo(item.ammoType, cost);
      }
    }

    // 5. Execute item interface callback
    let spawnResult = null;
    if (typeof item.onExecute === 'function') {
      spawnResult = item.onExecute(context, ancillaEngine);
      if (spawnResult === false || spawnResult === -1) {
        return { success: false, reason: 'EXECUTION_REJECTED' };
      }
    }

    // 6. Commit animation lock & cooldown
    this.actionLockoutTimer = item.useAnimationFrames || 14;
    this.activeItemCooldown = item.cooldownFrames || 20;

    return { success: true, slotIndex: spawnResult };
  }
}

// Module Singletons
export const ancillaEngine = new AncillaEngineJS();
export const itemRegistry = new ItemRegistry();
export const inventoryState = new InventoryState(itemRegistry);

export default {
  AncillaEngineJS,
  ItemRegistry,
  InventoryState,
  ancillaEngine,
  itemRegistry,
  inventoryState
};
