/**
 * Library:         lib_bejson_gamingss2_engine_settings.ts
 * Family:          GamingSS2
 * Module Purpose:  Persistent game config storage (localStorage for React, config files for Flask).
 * Architecture:    BEJSON 105 Format / Local Storage Engine
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export interface SS2EngineSettingsData {
  masterVolume: number;
  sfxVolume: number;
  enableExternalCustomKeys: boolean;
  virtualTouchScale: number;
  selectedModel: string;
}

const STORAGE_KEY = 'SS2_ENGINE_SETTINGS_DATA_V100';

export class GamingSS2EngineSettings {
  private settings: SS2EngineSettingsData;

  constructor() {
    this.settings = this.loadSettings();
  }

  public getSettings(): SS2EngineSettingsData {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<SS2EngineSettingsData>): void {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
  }

  private loadSettings(): SS2EngineSettingsData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...this.getDefaults(), ...JSON.parse(stored) };
      }
    } catch {
      // Fallback on defaults if localStorage fails
    }
    return this.getDefaults();
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore write errors in restricted environments
    }
  }

  private getDefaults(): SS2EngineSettingsData {
    return {
      masterVolume: 0.8,
      sfxVolume: 1.0,
      enableExternalCustomKeys: false,
      virtualTouchScale: 1.0,
      selectedModel: 'gemini-3.6-flash',
    };
  }
}
