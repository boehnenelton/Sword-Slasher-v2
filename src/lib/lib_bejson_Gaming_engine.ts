/**
 * Library:         lib_bejson_Gaming_engine.ts
 * Family:          Gaming
 * Module Purpose:  BEJSON Gaming Specification Engine & Field Map Cache Provider
 * Architecture:    BEJSON 105 game data layout, O(1) column resolution, string sanitization, archetype lookups
 * Version:         3.0.0
 * Release_Version: 300
 * Date:            2026-10-27
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

import { bejsonCore, BejsonDocument } from './lib_bejson_Gaming_core_adapter';
import {
  E_GAMING_INVALID_ARCHETYPE,
  E_GAMING_LEVEL_NOT_FOUND,
  E_GAMING_PORTAL_TARGET_INVALID,
  E_GAMING_ITEM_DEFINITION_MISSING
} from './lib_bejson_Gaming_bejson_errors';

export interface GamingLevelRecord {
  uuid: string;
  slug: string;
  title: string;
  mapSizeTier: string;
  width: number;
  height: number;
  tileSize: number;
  biomeUuid: string;
  bgmTrack: string;
  victoryType: string;
}

export interface GamingActorRecord {
  uuid: string;
  role: string;
  state: string;
  levelUuid: string;
  statUuid: string;
  archetypeSlug: string;
  displayName: string;
  x: number;
  y: number;
  facing: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  inventory: string[];
}

export interface GamingItemRecord {
  uuid: string;
  category: string;
  slug: string;
  displayName: string;
  attackBonus: number;
  defenseBonus: number;
  healPotency: number;
  colorHex: string;
  description: string;
}

export interface GamingPortalRecord {
  uuid: string;
  triggerType: string;
  slug: string;
  sourceLvlUuid: string;
  sourceX: number;
  sourceY: number;
  targetLvlUuid: string;
  targetX: number;
  targetY: number;
}

export interface GamingAudioProfile {
  ambientDroneHz: number;
  ambientWaveform: 'sine' | 'sawtooth' | 'triangle' | 'square';
  footstepFreq: number;
  reverbDecay: number;
  filterCutoff: number;
  echoIntervalMs: number;
  windNoise: number;
}

export interface GamingBiomeRecord {
  uuid: string;
  recordType: string;
  generationMode: string;
  climateCategory: string;
  slug: string;
  displayTitle: string;
  baseTileUuid: string;
  baseTileSlug: string;
  clusterRules: Record<string, any>;
  scatterRules: Record<string, any>;
  ambientColorHex: string;
  audioProfile: GamingAudioProfile;
  createdUtc: string;
}

export class BejsonGamingEngine {
  private documents: Map<string, BejsonDocument> = new Map();

  /**
   * Register a BEJSON 105 gaming document and initialize its O(1) Field Map Cache
   */
  public registerDocument(docKey: string, doc: BejsonDocument): void {
    const sanitization = bejsonCore.validateDocument(doc);
    if (!sanitization.valid) {
      console.warn(`[BEJSON Gaming Engine] Document ${docKey} validation warnings:`, sanitization.errors);
    }
    this.documents.set(docKey, doc);
    bejsonCore.buildFieldMapCache(docKey, doc.Fields);
  }

  public getDocument(docKey: string): BejsonDocument | undefined {
    return this.documents.get(docKey);
  }

  public getAllDocuments(): Map<string, BejsonDocument> {
    return this.documents;
  }

  /**
   * Parse Levels table via O(1) Field Map Cache
   */
  public getLevels(): GamingLevelRecord[] {
    const doc = this.documents.get('levels');
    if (!doc) return [];
    return doc.Values.map(row => ({
      uuid: bejsonCore.getFieldValue('levels', row, 'lvl_uuid'),
      slug: bejsonCore.getFieldValue('levels', row, 'lvl_slug_code'),
      title: bejsonCore.getFieldValue('levels', row, 'lvl_display_title'),
      mapSizeTier: bejsonCore.getFieldValue('levels', row, 'lvl_map_size_tier_type') || 'MEDIUM_64X64',
      width: Number(bejsonCore.getFieldValue('levels', row, 'lvl_width_tiles_count')),
      height: Number(bejsonCore.getFieldValue('levels', row, 'lvl_height_tiles_count')),
      tileSize: Number(bejsonCore.getFieldValue('levels', row, 'lvl_tile_unit_size_px')),
      biomeUuid: bejsonCore.getFieldValue('levels', row, 'lvl_biome_uuid_fk'),
      bgmTrack: bejsonCore.getFieldValue('levels', row, 'lvl_bgm_track_slug_code') || 'ganon_theme',
      victoryType: bejsonCore.getFieldValue('levels', row, 'lvl_victory_condition_type')
    }));
  }

  /**
   * Query Level by Slug Code
   */
  public getLevelBySlug(slug: string): GamingLevelRecord {
    const lvl = this.getLevels().find(l => l.slug === slug);
    if (!lvl) {
      throw new Error(`${E_GAMING_LEVEL_NOT_FOUND}: Level slug '${slug}' not found in BEJSON dataset`);
    }
    return lvl;
  }

  /**
   * Parse Actors for a specific level via O(1) Field Map Cache
   */
  public getActorsForLevel(levelSlug: string): GamingActorRecord[] {
    const doc = this.documents.get('actors');
    const lvlDoc = this.getLevels().find(l => l.slug === levelSlug);
    if (!doc || !lvlDoc) return [];

    return doc.Values
      .filter(row => bejsonCore.getFieldValue('actors', row, 'actor_lvl_uuid_fk') === lvlDoc.uuid)
      .map(row => {
        let inv: string[] = [];
        try {
          const invJson = bejsonCore.getFieldValue('actors', row, 'actor_inventory_item_uuids_json');
          inv = invJson ? JSON.parse(invJson) : [];
        } catch (_) {}

        return {
          uuid: bejsonCore.getFieldValue('actors', row, 'actor_uuid'),
          role: bejsonCore.getFieldValue('actors', row, 'actor_entity_role_type'),
          state: bejsonCore.getFieldValue('actors', row, 'actor_fsm_lifecycle_state_type'),
          levelUuid: bejsonCore.getFieldValue('actors', row, 'actor_lvl_uuid_fk'),
          statUuid: bejsonCore.getFieldValue('actors', row, 'actor_stat_uuid_fk'),
          archetypeSlug: bejsonCore.getFieldValue('actors', row, 'actor_archetype_slug_code'),
          displayName: bejsonCore.getFieldValue('actors', row, 'actor_display_name'),
          x: Number(bejsonCore.getFieldValue('actors', row, 'actor_current_position_x_px')),
          y: Number(bejsonCore.getFieldValue('actors', row, 'actor_current_position_y_px')),
          facing: bejsonCore.getFieldValue('actors', row, 'actor_facing_direction_type') || 'DOWN',
          hp: Number(bejsonCore.getFieldValue('actors', row, 'actor_current_health_points_count')),
          maxHp: 100,
          attack: Number(bejsonCore.getFieldValue('actors', row, 'actor_override_attack_power_metric')),
          defense: Number(bejsonCore.getFieldValue('actors', row, 'actor_override_defense_rating_metric')),
          inventory: inv
        };
      });
  }

  /**
   * Query Item by Slug Code
   */
  public getItemBySlug(slug: string): GamingItemRecord {
    const doc = this.documents.get('items');
    if (!doc) {
      throw new Error(`${E_GAMING_ITEM_DEFINITION_MISSING}: Items document not loaded`);
    }
    const row = doc.Values.find(r => bejsonCore.getFieldValue('items', r, 'item_slug_code') === slug);
    if (!row) {
      throw new Error(`${E_GAMING_ITEM_DEFINITION_MISSING}: Item slug '${slug}' missing from BEJSON items table`);
    }
    return {
      uuid: bejsonCore.getFieldValue('items', row, 'item_uuid'),
      category: bejsonCore.getFieldValue('items', row, 'item_category_type'),
      slug: bejsonCore.getFieldValue('items', row, 'item_slug_code'),
      displayName: bejsonCore.getFieldValue('items', row, 'item_display_name'),
      attackBonus: Number(bejsonCore.getFieldValue('items', row, 'item_attack_bonus_metric')),
      defenseBonus: Number(bejsonCore.getFieldValue('items', row, 'item_defense_bonus_metric')),
      healPotency: Number(bejsonCore.getFieldValue('items', row, 'item_heal_potency_count')),
      colorHex: bejsonCore.getFieldValue('items', row, 'item_color_badge_hex'),
      description: bejsonCore.getFieldValue('items', row, 'item_description_text')
    };
  }

  /**
   * Query Portals for level
   */
  public getPortalsForLevel(levelSlug: string): GamingPortalRecord[] {
    const doc = this.documents.get('portals');
    const lvlDoc = this.getLevels().find(l => l.slug === levelSlug);
    if (!doc || !lvlDoc) return [];

    return doc.Values
      .filter(row => bejsonCore.getFieldValue('portals', row, 'port_source_lvl_uuid_fk') === lvlDoc.uuid)
      .map(row => ({
        uuid: bejsonCore.getFieldValue('portals', row, 'port_uuid'),
        triggerType: bejsonCore.getFieldValue('portals', row, 'port_transition_trigger_type'),
        slug: bejsonCore.getFieldValue('portals', row, 'port_slug_code'),
        sourceLvlUuid: bejsonCore.getFieldValue('portals', row, 'port_source_lvl_uuid_fk'),
        sourceX: Number(bejsonCore.getFieldValue('portals', row, 'port_source_tile_coord_x_index')),
        sourceY: Number(bejsonCore.getFieldValue('portals', row, 'port_source_tile_coord_y_index')),
        targetLvlUuid: bejsonCore.getFieldValue('portals', row, 'port_target_lvl_uuid_fk'),
        targetX: Number(bejsonCore.getFieldValue('portals', row, 'port_target_spawn_coord_x_index')),
        targetY: Number(bejsonCore.getFieldValue('portals', row, 'port_target_spawn_coord_y_index'))
      }));
  }

  /**
   * Query Biomes table via O(1) Field Map Cache
   */
  public getBiomes(): GamingBiomeRecord[] {
    const doc = this.documents.get('biomes');
    if (!doc) return [];
    return doc.Values.map(row => {
      let audioProf: GamingAudioProfile = {
        ambientDroneHz: 65,
        ambientWaveform: 'triangle',
        footstepFreq: 220,
        reverbDecay: 0.8,
        filterCutoff: 900,
        echoIntervalMs: 1200,
        windNoise: 0.15
      };
      try {
        const rawJson = bejsonCore.getFieldValue('biomes', row, 'biome_audio_profile_json');
        if (rawJson) audioProf = JSON.parse(rawJson);
      } catch (_) {}

      let clusterRules = {};
      try {
        const raw = bejsonCore.getFieldValue('biomes', row, 'biome_cluster_rules_json');
        if (raw) clusterRules = JSON.parse(raw);
      } catch (_) {}

      let scatterRules = {};
      try {
        const raw = bejsonCore.getFieldValue('biomes', row, 'biome_scatter_rules_json');
        if (raw) scatterRules = JSON.parse(raw);
      } catch (_) {}

      return {
        uuid: bejsonCore.getFieldValue('biomes', row, 'biome_uuid'),
        recordType: bejsonCore.getFieldValue('biomes', row, 'biome_record_type') || 'WorldBiome',
        generationMode: bejsonCore.getFieldValue('biomes', row, 'biome_generation_mode_type') || 'HYBRID',
        climateCategory: bejsonCore.getFieldValue('biomes', row, 'biome_climate_category_type') || 'OVERWORLD',
        slug: bejsonCore.getFieldValue('biomes', row, 'biome_slug_code'),
        displayTitle: bejsonCore.getFieldValue('biomes', row, 'biome_display_title'),
        baseTileUuid: bejsonCore.getFieldValue('biomes', row, 'biome_base_tile_uuid_fk'),
        baseTileSlug: bejsonCore.getFieldValue('biomes', row, 'biome_base_tile_slug_code'),
        clusterRules,
        scatterRules,
        ambientColorHex: bejsonCore.getFieldValue('biomes', row, 'biome_ambient_color_hex') || '#000000',
        audioProfile: audioProf,
        createdUtc: bejsonCore.getFieldValue('biomes', row, 'biome_created_utc_timestamp')
      };
    });
  }

  public getBiomeBySlug(slug: string): GamingBiomeRecord {
    const biome = this.getBiomes().find(b => b.slug === slug);
    if (!biome) {
      throw new Error(`Biome slug '${slug}' not found in BEJSON dataset`);
    }
    return biome;
  }

  public getAudioProfileForBiome(slug: string): GamingAudioProfile {
    try {
      return this.getBiomeBySlug(slug).audioProfile;
    } catch (_) {
      return {
        ambientDroneHz: 65,
        ambientWaveform: 'triangle',
        footstepFreq: 220,
        reverbDecay: 0.8,
        filterCutoff: 900,
        echoIntervalMs: 1200,
        windNoise: 0.15
      };
    }
  }
}

export const bejsonGaming = new BejsonGamingEngine();
