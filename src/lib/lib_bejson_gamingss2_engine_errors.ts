/**
 * Library:         lib_bejson_gamingss2_engine_errors.ts
 * Family:          GamingSS2
 * Module Purpose:  Centralized error code definitions for Sword Slasher 2 engine modules.
 * Architecture:    BEJSON 105 Format / Error Registry (Range 400 - 450)
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   c84d72e9-11a3-48e2-9b2f-76a2e847192f
 */

export const GAMINGSS2_ERRORS = {
  ERR_SS2_INIT_FAILED: 400,
  ERR_SS2_DATA_INVALID: 401,
  ERR_SS2_PHYSICS_COLLISION: 402,
  ERR_SS2_MAP_CHUNK_MISSING: 403,
  ERR_SS2_INPUT_UNBOUND: 404,
  ERR_SS2_STATE_TRANSITION_FAILED: 405,
  ERR_SS2_HUD_RENDER_ERROR: 406,
  ERR_SS2_MENU_ACTION_INVALID: 407,
  ERR_SS2_SETTINGS_PERSIST_FAILED: 408,
  ERR_SS2_AUDIO_SYNTH_FAIL: 409,
  ERR_SS2_ITEM_NOT_FOUND: 410,
  ERR_SS2_INVENTORY_FULL: 411,
  ERR_SS2_DIALOG_BUS_ERROR: 412,
  ERR_SS2_EVENT_TRIGGER_INVALID: 413,
  ERR_SS2_EFFECT_RENDER_FAIL: 414,
  ERR_SS2_QUEST_STEP_INVALID: 415,
  ERR_SS2_PLAYER_ACTION_BLOCKED: 416,
  ERR_SS2_ANIMATION_FRAME_MISSING: 417
} as const;

export type GamingSS2ErrorCode = typeof GAMINGSS2_ERRORS[keyof typeof GAMINGSS2_ERRORS];
