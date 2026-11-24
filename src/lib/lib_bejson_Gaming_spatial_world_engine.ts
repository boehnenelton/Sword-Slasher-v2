/**
 * Library:         lib_bejson_Gaming_spatial_world_engine.ts
 * Family:          Gaming
 * Module Purpose:  TypeScript O(1) Bit-Shift Spatial Coordinate Math, 8x8 Overworld Sector Grid, 16x16 Underworld Supertile/Quadrant Engine, Dual-Realm Overlay, and $0600 Camera Clamps
 * Architecture:    BEJSON 105 Format / Decoupled Spatial World Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-23
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * License:         PolyForm-Noncommercial-1.0.0
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   a84d19f2-2026-1123-9999-000000000160
 */

export const SPATIAL_CONSTANTS = {
  SUBTILE_PX: 8,
  METATILE_PX: 16,
  MEGATILE_PX: 32,
  QUADRANT_PX: 256,
  SECTOR_PX: 512,
  OVERWORLD_COLS: 8,
  OVERWORLD_ROWS: 8,
  OVERWORLD_TOTAL_SECTORS: 64,
  OVERWORLD_TOTAL_PX: 4096,
  UNDERWORLD_COLS: 16,
  UNDERWORLD_ROWS: 16,
  UNDERWORLD_TOTAL_SUPERTILES: 256,
  SECONDARY_INTERIOR_COUNT: 40,
  HOME_SUPERTILE_ID: 0x00,
  HOME_OVERWORLD_SECTOR_ID: 0x1B, // Col 3, Row 3
  HOME_THRESHOLD_WORLD_X: 1792,
  HOME_THRESHOLD_WORLD_Y: 1808,
  BIT_VISITED: 1 << 15
} as const;

export interface OverworldSectorDescriptor {
  sectorId: number;
  col: number;
  row: number;
  rootSectorId: number;
  spanCols: number;
  spanRows: number;
  title: string;
  hasHomeEntrance: boolean;
}

export interface UnderworldSupertileDescriptor {
  supertileId: number;
  col: number;
  row: number;
  floorLevel: number;
  partitionLayout: 'FULL_4Q' | 'SPLIT_V_2X2Q' | 'SPLIT_H_2X2Q' | 'QUAD_4X1Q';
  slug: string;
  title: string;
  isHomeBase: boolean;
  isPopulated: boolean;
  pitTargetSupertileId: number | null;
}

export interface CameraClampBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class SpatialCoordinateMath {
  static toSubtile(px: number): number {
    return px >> 3;
  }

  static toMetatile(px: number): number {
    return px >> 4;
  }

  static toMegatile(px: number): number {
    return px >> 5;
  }

  static toOverworldSectorCol(worldX: number): number {
    return Math.max(0, Math.min(7, (worldX >> 9) & 0x07));
  }

  static toOverworldSectorRow(worldY: number): number {
    return Math.max(0, Math.min(7, (worldY >> 9) & 0x07));
  }

  static toOverworldSectorId(worldX: number, worldY: number): number {
    const col = this.toOverworldSectorCol(worldX);
    const row = this.toOverworldSectorRow(worldY);
    return (row << 3) | col;
  }

  static toSectorLocalPx(worldCoord: number): number {
    return worldCoord & 0x01FF;
  }

  static toSectorLocalMetatile(worldCoord: number): number {
    return (worldCoord & 0x01FF) >> 4;
  }

  static toSupertileQuadrant(localX: number, localY: number): number {
    const qx = (Math.max(0, Math.min(511, localX)) >> 8) & 1;
    const qy = (Math.max(0, Math.min(511, localY)) >> 8) & 1;
    return (qy << 1) | qx;
  }

  static projectToMode7MapSpace(worldX: number, worldY: number): { mapX: number; mapY: number } {
    return {
      mapX: Math.max(0, Math.min(1023, worldX >> 2)),
      mapY: Math.max(0, Math.min(1023, worldY >> 2))
    };
  }
}

export class SpatialWorldEngine {
  public roomPersistenceFlags: Uint32Array = new Uint32Array(320);
  public tileMutationBuffer: Map<number, number> = new Map();
  public overworldSectors: OverworldSectorDescriptor[] = [];
  public underworldSupertiles: UnderworldSupertileDescriptor[] = [];

  public activeDomain: 'UNDERWORLD' | 'OVERWORLD' | 'DEBUG' = 'UNDERWORLD';
  public activeRealmId: number = 0;
  public activeSectorId: number = SPATIAL_CONSTANTS.HOME_OVERWORLD_SECTOR_ID;
  public activeSupertileId: number = SPATIAL_CONSTANTS.HOME_SUPERTILE_ID;
  public activeQuadrantId: number = 0;
  public elevationLayer: number = 0;

  public overworldReturnAnchor = {
    realmId: 0,
    sectorId: SPATIAL_CONSTANTS.HOME_OVERWORLD_SECTOR_ID as number,
    worldX: SPATIAL_CONSTANTS.HOME_THRESHOLD_WORLD_X as number,
    worldY: SPATIAL_CONSTANTS.HOME_THRESHOLD_WORLD_Y as number,
    facing: 'DOWN' as const
  };

  public cameraClamps: CameraClampBounds = {
    minX: 0,
    minY: 0,
    maxX: 512,
    maxY: 512
  };

  constructor() {
    this.initBlankOverworldGrid();
    this.initUnderworldGrid();
    this.markSupertileVisited(SPATIAL_CONSTANTS.HOME_SUPERTILE_ID);
    this.markOverworldSectorVisited(SPATIAL_CONSTANTS.HOME_OVERWORLD_SECTOR_ID);
  }

  public initBlankOverworldGrid(): void {
    this.overworldSectors = [];
    for (let id = 0; id < 64; id++) {
      const col = id & 0x07;
      const row = (id >> 3) & 0x07;
      const isHomeSector = id === SPATIAL_CONSTANTS.HOME_OVERWORLD_SECTOR_ID;
      this.overworldSectors.push({
        sectorId: id,
        col,
        row,
        rootSectorId: id,
        spanCols: 1,
        spanRows: 1,
        title: isHomeSector
          ? `[GAME WORLD 1] Sector 0x${id.toString(16).toUpperCase().padStart(2, '0')} (Shadow Cave Exterior)`
          : `[GAME WORLD 1] Empty Sector 0x${id.toString(16).toUpperCase().padStart(2, '0')} (${col},${row})`,
        hasHomeEntrance: isHomeSector
      });
    }
  }

  public initUnderworldGrid(): void {
    this.underworldSupertiles = [];
    for (let id = 0; id < 256; id++) {
      const col = id & 0x0F;
      const row = (id >> 4) & 0x0F;
      if (id === SPATIAL_CONSTANTS.HOME_SUPERTILE_ID) {
        this.underworldSupertiles.push({
          supertileId: 0x00,
          col: 0,
          row: 0,
          floorLevel: 0,
          partitionLayout: 'FULL_4Q',
          slug: 'shadow_cave',
          title: '[GAME WORLD 1] Shadow Cave (Home Base)',
          isHomeBase: true,
          isPopulated: true,
          pitTargetSupertileId: null
        });
      } else {
        this.underworldSupertiles.push({
          supertileId: id,
          col,
          row,
          floorLevel: 0,
          partitionLayout: 'FULL_4Q',
          slug: `empty_supertile_${id.toString(16).padStart(2, '0')}`,
          title: `[GAME WORLD 1] Empty Supertile 0x${id.toString(16).toUpperCase().padStart(2, '0')}`,
          isHomeBase: false,
          isPopulated: false,
          pitTargetSupertileId: null
        });
      }
    }
  }

  public markSupertileVisited(supertileId: number): void {
    if (supertileId >= 0 && supertileId < 256) {
      this.roomPersistenceFlags[supertileId] |= SPATIAL_CONSTANTS.BIT_VISITED;
    }
  }

  public isSupertileVisited(supertileId: number): boolean {
    if (supertileId < 0 || supertileId >= 256) return false;
    return (this.roomPersistenceFlags[supertileId] & SPATIAL_CONSTANTS.BIT_VISITED) !== 0;
  }

  public markOverworldSectorVisited(sectorId: number): void {
    if (sectorId >= 0 && sectorId < 64) {
      this.roomPersistenceFlags[256 + sectorId] |= SPATIAL_CONSTANTS.BIT_VISITED;
    }
  }

  public isOverworldSectorVisited(sectorId: number): boolean {
    if (sectorId < 0 || sectorId >= 64) return false;
    return (this.roomPersistenceFlags[256 + sectorId] & SPATIAL_CONSTANTS.BIT_VISITED) !== 0;
  }

  public updateOverworldCameraClamps(worldX: number, worldY: number) {
    const secId = SpatialCoordinateMath.toOverworldSectorId(worldX, worldY);
    const prevSec = this.overworldSectors[this.activeSectorId];
    const nextSec = this.overworldSectors[secId];
    const sectorChanged = secId !== this.activeSectorId;

    this.activeSectorId = secId;
    this.markOverworldSectorVisited(secId);

    const rootId = nextSec ? nextSec.rootSectorId : secId;
    const spanCols = nextSec ? nextSec.spanCols : 1;
    const spanRows = nextSec ? nextSec.spanRows : 1;
    const rootCol = rootId & 0x07;
    const rootRow = (rootId >> 3) & 0x07;

    this.cameraClamps = {
      minX: rootCol * SPATIAL_CONSTANTS.SECTOR_PX,
      minY: rootRow * SPATIAL_CONSTANTS.SECTOR_PX,
      maxX: (rootCol + spanCols) * SPATIAL_CONSTANTS.SECTOR_PX,
      maxY: (rootRow + spanRows) * SPATIAL_CONSTANTS.SECTOR_PX
    };

    const interRegionTransition =
      sectorChanged && (!prevSec || prevSec.rootSectorId !== nextSec.rootSectorId);

    return {
      sectorId: secId,
      sectorHex: `0x${secId.toString(16).toUpperCase().padStart(2, '0')}`,
      col: secId & 0x07,
      row: (secId >> 3) & 0x07,
      interRegionTransition,
      clamps: this.cameraClamps
    };
  }

  public updateUnderworldCameraClamps(localX: number, localY: number) {
    const quadId = SpatialCoordinateMath.toSupertileQuadrant(localX, localY);
    this.activeQuadrantId = quadId;
    this.cameraClamps = {
      minX: 0,
      minY: 0,
      maxX: 512,
      maxY: 512
    };
    return {
      supertileId: this.activeSupertileId,
      quadrantId: quadId,
      quadrantLabel: (['NW', 'NE', 'SW', 'SE'][quadId] || 'NW') as 'NW' | 'NE' | 'SW' | 'SE',
      clamps: this.cameraClamps
    };
  }
}

export const spatialWorldEngine = new SpatialWorldEngine();
