/**
 * Library:         lib_bejson_Gaming_engine.js
 * Family:          Gaming
 * Module Purpose:  JavaScript Mirror - BEJSON Gaming Specification Engine & Field Map Cache Provider
 * Architecture:    BEJSON 105 game data layout, O(1) column resolution, string sanitization, archetype lookups
 * Version:         3.0.0
 * Release_Version: 300
 * Date:            2026-10-27
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   105a0401-2026-1027-9999-000000000401
 */

import { bejsonCore } from './lib_bejson_Core_bejson_core.js';
import {
  E_GAMING_LEVEL_NOT_FOUND,
  E_GAMING_ITEM_DEFINITION_MISSING
} from './lib_bejson_Gaming_bejson_errors.js';

export class BejsonGamingEngine {
  constructor() {
    this.documents = new Map();
  }

  registerDocument(docKey, doc) {
    const sanitization = bejsonCore.validateDocument(doc);
    if (!sanitization.valid) {
      console.warn(`[BEJSON Gaming Engine JS] Document ${docKey} validation warnings:`, sanitization.errors);
    }
    this.documents.set(docKey, doc);
    bejsonCore.buildFieldMapCache(docKey, doc.Fields);
  }

  getDocument(docKey) {
    return this.documents.get(docKey);
  }

  getAllDocuments() {
    return this.documents;
  }

  getLevels() {
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

  getLevelBySlug(slug) {
    const lvl = this.getLevels().find(l => l.slug === slug);
    if (!lvl) {
      throw new Error(`${E_GAMING_LEVEL_NOT_FOUND}: Level slug '${slug}' not found in BEJSON dataset`);
    }
    return lvl;
  }

  getActorsForLevel(levelSlug) {
    const doc = this.documents.get('actors');
    const lvlDoc = this.getLevels().find(l => l.slug === levelSlug);
    if (!doc || !lvlDoc) return [];

    return doc.Values
      .filter(row => bejsonCore.getFieldValue('actors', row, 'actor_lvl_uuid_fk') === lvlDoc.uuid)
      .map(row => {
        let inv = [];
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

  getItemBySlug(slug) {
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

  getBiomes() {
    const doc = this.documents.get('biomes');
    if (!doc) return [];
    return doc.Values.map(row => {
      let audioProf = {
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

  getBiomeBySlug(slug) {
    const biome = this.getBiomes().find(b => b.slug === slug);
    if (!biome) {
      throw new Error(`Biome slug '${slug}' not found in BEJSON dataset`);
    }
    return biome;
  }

  getAudioProfileForBiome(slug) {
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
export default bejsonGaming;

