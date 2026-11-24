/**
 * Library:         bejsonEngine.ts
 * Module Purpose:  BEJSON 105 Simulation Engine Core & Gaming Family Integrator
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0001-2026-1025-9999-000000000106
 * Version:         300100
 */

import { bejsonCore, BejsonDocument } from '../lib/lib_bejson_Core_bejson_core';
import { bejsonGaming, GamingLevelRecord, GamingActorRecord, GamingItemRecord, GamingPortalRecord } from '../lib/lib_bejson_Gaming_engine';

export interface GameEventData {
  uuid: string;
  triggerType: string;
  slug: string;
  lvlUuid?: string;
  x?: number;
  y?: number;
  opcodes: { op: string; speaker?: string; text?: string; sound?: string; item_uuid?: string; objective?: string; message?: string }[];
}

export class Bejson105Engine {
  private loaded: boolean = false;

  // Active Runtime State (Starts in Shadow Cave Home Base — Supertile 0x00)
  public currentLevelSlug: string = 'shadow_cave';
  public currentObjective: string = 'Shadow Cave (Home Base) — Step south to enter the 8x8 Overworld Grid';
  public playerHp: number = 120;
  public playerMaxHp: number = 120;
  public magicPoints: number = 100;
  public maxMagicPoints: number = 100;
  public playerX: number = 256;
  public playerY: number = 256;
  public playerFacing: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'DOWN';
  public isOpeningWalkCompleted: boolean = false;
  public activeDialogue: { speaker: string; text: string }[] | null = null;
  public activeDialogueIdx: number = 0;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;
  public victoryMessage: string = '';
  public playerInventory: GamingItemRecord[] = [];
  public telemetry = {
    fps: 60,
    physicsDuration: 0.8,
    renderDuration: 2.1,
    bodiesCount: 14,
    collisionsCount: 8
  };

  /**
   * Validate BEJSON 105 Document according to Era 105 Spec
   */
  public validateDocument(doc: BejsonDocument): { valid: boolean; errors: string[] } {
    return bejsonCore.validateDocument(doc);
  }

  /**
   * Bootstraps and registers all BEJSON 105 documents into the lib_bejson_Gaming_ engine
   */
  public async bootEngine(): Promise<boolean> {
    const filesToLoad = [
      { key: 'manifest', url: '/data/manifest/105a.mfdb.bejson' },
      { key: 'schema_registry', url: '/data/schemas/schema_registry.105a.bejson' },
      { key: 'biomes', url: '/data/biomes/biomes.105.bejson' },
      { key: 'levels', url: '/data/levels/levels.105.bejson' },
      { key: 'cave_chunk', url: '/data/chunks/cave_chunk_0_0.105.bejson' },
      { key: 'actor_stats', url: '/data/actor_stats/actor_stats.105.bejson' },
      { key: 'actors', url: '/data/actors/actors.105.bejson' },
      { key: 'items', url: '/data/items/items.105.bejson' },
      { key: 'objects', url: '/data/objects/objects.105.bejson' },
      { key: 'object_rules', url: '/data/object_rules/object_rules.105.bejson' },
      { key: 'portals', url: '/data/portals/portals.105.bejson' },
      { key: 'events', url: '/data/events/events.105.bejson' },
      { key: 'sprites', url: '/data/sprites/sprites_manifest.105a.bejson' },
      { key: 'tiles', url: '/data/tiles/tiles_manifest.105a.bejson' },
      { key: 'audio', url: '/data/audio/audio_manifest.105a.bejson' },
      { key: 'runtime_physics', url: '/data/runtime_physics/physics_world.105.bejson' },
      { key: 'runtime_assets', url: '/data/runtime_assets/asset_cache.105a.bejson' },
      { key: 'runtime_events', url: '/data/runtime_events/event_bus_log.105.bejson' },
      { key: 'runtime_grid', url: '/data/runtime_grid/grid_cells.105.bejson' },
      { key: 'runtime_telemetry', url: '/data/runtime_telemetry/frame_telemetry.105.bejson' },
      { key: 'engine_config', url: '/config/engine_config/engine_config.105a.bejson' },
      { key: 'project_meta', url: '/config/project_meta/bejson_project.105a.bejson' }
    ];

    for (const f of filesToLoad) {
      try {
        const resp = await fetch(f.url);
        if (resp.ok) {
          const doc: BejsonDocument = await resp.json();
          bejsonGaming.registerDocument(f.key, doc);
        }
      } catch (err) {
        console.warn(`Failed to fetch BEJSON file ${f.url}:`, err);
      }
    }

    this.loaded = true;

    // Load initial item definition for Shadow Blade from lib_bejson_Gaming_ family
    try {
      const itemBlade = bejsonGaming.getItemBySlug('shadow_blade');
      if (itemBlade) {
        this.playerInventory.push(itemBlade);
      }
    } catch (e) {
      console.warn("Item load shadow_blade fallback:", e);
    }

    return true;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public getDocument(key: string): BejsonDocument | undefined {
    return bejsonGaming.getDocument(key);
  }

  public getAllDocuments(): Map<string, BejsonDocument> {
    return bejsonGaming.getAllDocuments();
  }

  public getLevels(): GamingLevelRecord[] {
    return bejsonGaming.getLevels();
  }

  public getCurrentLevelData(): GamingLevelRecord | undefined {
    try {
      return bejsonGaming.getLevelBySlug(this.currentLevelSlug);
    } catch (_) {
      return undefined;
    }
  }

  public getActorsForLevel(levelSlug: string): GamingActorRecord[] {
    return bejsonGaming.getActorsForLevel(levelSlug);
  }

  public getItemBySlug(slug: string): GamingItemRecord | undefined {
    try {
      return bejsonGaming.getItemBySlug(slug);
    } catch (_) {
      return undefined;
    }
  }

  public getEventByUuid(uuid: string): GameEventData | undefined {
    const doc = bejsonGaming.getDocument('events');
    if (!doc) return undefined;
    const row = doc.Values.find(r => bejsonCore.getFieldValue('events', r, 'evt_uuid') === uuid);
    if (!row) return undefined;
    let opcodes = [];
    try {
      const rawJson = bejsonCore.getFieldValue('events', row, 'evt_opcodes_list_json');
      opcodes = rawJson ? JSON.parse(rawJson) : [];
    } catch (_) {}

    return {
      uuid: bejsonCore.getFieldValue('events', row, 'evt_uuid'),
      triggerType: bejsonCore.getFieldValue('events', row, 'evt_trigger_type'),
      slug: bejsonCore.getFieldValue('events', row, 'evt_slug_code'),
      x: Number(bejsonCore.getFieldValue('events', row, 'evt_trigger_coord_x_px')),
      y: Number(bejsonCore.getFieldValue('events', row, 'evt_trigger_coord_y_px')),
      opcodes
    };
  }

  public getPortalsForLevel(levelSlug: string): GamingPortalRecord[] {
    return bejsonGaming.getPortalsForLevel(levelSlug);
  }

  public switchLevelByUuid(targetLvlUuid: string, spawnTileX: number, spawnTileY: number) {
    const lvl = this.getLevels().find(l => l.uuid === targetLvlUuid);
    if (lvl) {
      this.currentLevelSlug = lvl.slug;
      this.playerX = spawnTileX * 16;
      this.playerY = spawnTileY * 16;
    }
  }

  public triggerOpeningCutscene(): GameEventData | undefined {
    const doc = bejsonGaming.getDocument('events');
    if (!doc) return undefined;
    const row = doc.Values.find(r => bejsonCore.getFieldValue('events', r, 'evt_slug_code') === 'ganon_opening_command');
    if (!row) return undefined;
    return this.getEventByUuid(bejsonCore.getFieldValue('events', row, 'evt_uuid'));
  }
}

export const bejsonEngine = new Bejson105Engine();
