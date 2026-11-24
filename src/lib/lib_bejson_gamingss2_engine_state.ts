/**
 * Library:         lib_bejson_gamingss2_engine_state.ts
 * Family:          GamingSS2
 * Module Purpose:  Level state transitions, portal teleports, and actor lifecycle management.
 * Architecture:    BEJSON 105 Format / Level State Machine
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export interface LevelPortal {
  id: string;
  targetLevel: string;
  targetX: number;
  targetY: number;
}

export interface LevelState {
  levelId: string;
  name: string;
  portals: LevelPortal[];
  bgMusicTrack?: string;
}

export class GamingSS2EngineState {
  private currentLevelId: string = 'sanctuary';
  private levels: Map<string, LevelState> = new Map();

  public registerLevel(level: LevelState): void {
    this.levels.set(level.levelId, level);
  }

  public getCurrentLevel(): LevelState | undefined {
    return this.levels.get(this.currentLevelId);
  }

  public transitionToLevel(levelId: string): LevelState | undefined {
    if (this.levels.has(levelId)) {
      this.currentLevelId = levelId;
      return this.levels.get(levelId);
    }
    return undefined;
  }
}
