/**
 * Library:         lib_bejson_Gaming_spatial_world_engine.js
 * Family:          Gaming
 * Module Purpose:  O(1) Bit-Shift Spatial Coordinate Math, 8x8 Overworld Sector Grid, 16x16 Underworld Supertile/Quadrant Engine, Dual-Realm Overlay, TileMutationBuffer ($05A0), RoomPersistenceFlags, and PLMVTBL Movement State Machine
 * Architecture:    BEJSON 105 Format / Decoupled Spatial World Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-23
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * License:         PolyForm-Noncommercial-1.0.0
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export const SPATIAL_CONSTANTS = Object.freeze({
  SUBTILE_PX: 8,            // >> 3
  METATILE_PX: 16,          // >> 4
  MEGATILE_PX: 32,          // >> 5
  QUADRANT_PX: 256,         // >> 8 (16x16 metatiles)
  SECTOR_PX: 512,           // >> 9 (32x32 metatiles)
  OVERWORLD_COLS: 8,
  OVERWORLD_ROWS: 8,
  OVERWORLD_TOTAL_SECTORS: 64,
  OVERWORLD_TOTAL_PX: 4096, // 0x1000
  UNDERWORLD_COLS: 16,
  UNDERWORLD_ROWS: 16,
  UNDERWORLD_TOTAL_SUPERTILES: 256,
  SECONDARY_INTERIOR_COUNT: 40,
  HOME_SUPERTILE_ID: 0x00,  // Shadow Cave (Home Base)
  HOME_OVERWORLD_SECTOR_ID: 0x1B, // Col 3, Row 3 (Center of 8x8 Overworld)
  HOME_THRESHOLD_WORLD_X: 1792,
  HOME_THRESHOLD_WORLD_Y: 1808,
  BIT_VISITED: 1 << 15
});

export const MOVEMENT_MODES = Object.freeze({
  LNMOVE_WALK: 0x00,
  SWMOVE_SWIM: 0x01,
  JUMPMV_LEDGE: 0x02,
  DASHMV_BOOTS: 0x03,
  HLDEMO_PITFALL: 0x04,
  BGISMV_CARRY: 0x05,
  ITMHKM_GRAPPLE: 0x06
});

/**
 * Pure O(1) Bit-Shift Spatial Coordinate Math Utilities
 */
export class SpatialCoordinateMath {
  static toSubtile(px) {
    return px >> 3;
  }

  static toMetatile(px) {
    return px >> 4;
  }

  static toMegatile(px) {
    return px >> 5;
  }

  static toOverworldSectorCol(worldX) {
    return Math.max(0, Math.min(7, (worldX >> 9) & 0x07));
  }

  static toOverworldSectorRow(worldY) {
    return Math.max(0, Math.min(7, (worldY >> 9) & 0x07));
  }

  static toOverworldSectorId(worldX, worldY) {
    const col = this.toOverworldSectorCol(worldX);
    const row = this.toOverworldSectorRow(worldY);
    return (row << 3) | col; // 0x00..0x3F
  }

  static toSectorLocalPx(worldCoord) {
    return worldCoord & 0x01FF; // 0..511
  }

  static toSectorLocalMetatile(worldCoord) {
    return (worldCoord & 0x01FF) >> 4; // 0..31
  }

  static toSectorCellIndex(worldX, worldY) {
    const ltx = (worldX & 0x01FF) >> 4;
    const lty = (worldY & 0x01FF) >> 4;
    return (lty << 5) | ltx; // 0..1023
  }

  static toSupertileQuadrant(localX, localY) {
    const qx = (Math.max(0, Math.min(511, localX)) >> 8) & 1;
    const qy = (Math.max(0, Math.min(511, localY)) >> 8) & 1;
    return (qy << 1) | qx; // 0=NW, 1=NE, 2=SW, 3=SE
  }

  static projectToMode7MapSpace(worldX, worldY) {
    return {
      mapX: Math.max(0, Math.min(1023, worldX >> 2)),
      mapY: Math.max(0, Math.min(1023, worldY >> 2))
    };
  }
}

/**
 * Spatial World, Dual-Grid Underworld & Camera Scroll Clamp ($0600) Engine
 */
export class SpatialWorldEngine {
  constructor() {
    // 256 Underworld Supertiles (0..255) + 64 Overworld Sectors (256..319)
    this.roomPersistenceFlags = new Uint32Array(320);
    // $05A0 Equivalent dynamic metatile replacement buffer
    this.tileMutationBuffer = new Map();

    // 8x8 Overworld Sector Table (64 empty sectors by default)
    this.overworldSectors = new Array(64);
    this.initBlankOverworldGrid();

    // 16x16 Primary Underworld Supertile Table (256 slots; 0x00 = Shadow Cave Home Base)
    this.underworldSupertiles = new Array(256);
    this.initUnderworldGrid();

    // Active Spatial Context
    this.activeDomain = 'UNDERWORLD'; // 'UNDERWORLD' | 'OVERWORLD' | 'DEBUG'
    this.activeRealmId = 0;           // 0 = Base Realm, 1 = Eclipse Rift Overlay
    this.activeSectorId = SPATIAL_CONSTANTS.HOME_OVERWORLD_SECTOR_ID;
    this.activeSupertileId = SPATIAL_CONSTANTS.HOME_SUPERTILE_ID;
    this.activeQuadrantId = 0;
    this.elevationLayer = 0;          // 0 = BG1 ground, 1 = BG2 upper bridge

    // Overworld return anchor cached when entering Shadow Cave or Secondary Interiors
    this.overworldReturnAnchor = {
      realmId: 0,
      sectorId: SPATIAL_CONSTANTS.HOME_OVERWORLD_SECTOR_ID,
      worldX: SPATIAL_CONSTANTS.HOME_THRESHOLD_WORLD_X,
      worldY: SPATIAL_CONSTANTS.HOME_THRESHOLD_WORLD_Y,
      facing: 'DOWN'
    };

    // Camera Scroll Boundaries ($0600 equivalent)
    this.cameraClamps = {
      minX: 0,
      minY: 0,
      maxX: 512,
      maxY: 512
    };

    // Movement State Machine (PLMVTBL equivalent)
    this.movementMode = MOVEMENT_MODES.LNMOVE_WALK;
    this.movementTimer = 0;
    this.playerZ = 0;

    // Mark Shadow Cave (Supertile 0x00) and Home Overworld Sector (0x1B) visited on boot
    this.markSupertileVisited(SPATIAL_CONSTANTS.HOME_SUPERTILE_ID);
    this.markOverworldSectorVisited(SPATIAL_CONSTANTS.HOME_OVERWORLD_SECTOR_ID);
  }

  initBlankOverworldGrid() {
    for (let id = 0; id < 64; id++) {
      const col = id & 0x07;
      const row = (id >> 3) & 0x07;
      const isHomeSector = id === SPATIAL_CONSTANTS.HOME_OVERWORLD_SECTOR_ID;
      this.overworldSectors[id] = {
        sectorId: id,
        col,
        row,
        rootSectorId: id, // Default 1x1 unlinked empty sector; supports 2x2 linking
        spanCols: 1,
        spanRows: 1,
        title: isHomeSector
          ? `[GAME WORLD 1] Sector 0x${id.toString(16).toUpperCase().padStart(2, '0')} (Shadow Cave Exterior)`
          : `[GAME WORLD 1] Empty Sector 0x${id.toString(16).toUpperCase().padStart(2, '0')} (${col},${row})`,
        hasHomeEntrance: isHomeSector,
        riftDeltaOverrides: []
      };
    }
  }

  initUnderworldGrid() {
    for (let id = 0; id < 256; id++) {
      const col = id & 0x0F;
      const row = (id >> 4) & 0x0F;
      if (id === SPATIAL_CONSTANTS.HOME_SUPERTILE_ID) {
        this.underworldSupertiles[id] = {
          supertileId: 0x00,
          col: 0,
          row: 0,
          floorLevel: 0, // 1F
          partitionLayout: 'FULL_4Q',
          slug: 'shadow_cave',
          title: '[GAME WORLD 1] Shadow Cave (Home Base)',
          isHomeBase: true,
          isPopulated: true,
          pitTargetSupertileId: null,
          layerInteractionMode: 1
        };
      } else {
        this.underworldSupertiles[id] = {
          supertileId: id,
          col,
          row,
          floorLevel: 0,
          partitionLayout: 'FULL_4Q',
          slug: `empty_supertile_${id.toString(16).padStart(2, '0')}`,
          title: `[GAME WORLD 1] Empty Supertile 0x${id.toString(16).toUpperCase().padStart(2, '0')}`,
          isHomeBase: false,
          isPopulated: false,
          pitTargetSupertileId: null,
          layerInteractionMode: 1
        };
      }
    }
  }

  markSupertileVisited(supertileId) {
    if (supertileId >= 0 && supertileId < 256) {
      this.roomPersistenceFlags[supertileId] |= SPATIAL_CONSTANTS.BIT_VISITED;
    }
  }

  isSupertileVisited(supertileId) {
    if (supertileId < 0 || supertileId >= 256) return false;
    return (this.roomPersistenceFlags[supertileId] & SPATIAL_CONSTANTS.BIT_VISITED) !== 0;
  }

  markOverworldSectorVisited(sectorId) {
    if (sectorId >= 0 && sectorId < 64) {
      this.roomPersistenceFlags[256 + sectorId] |= SPATIAL_CONSTANTS.BIT_VISITED;
    }
  }

  isOverworldSectorVisited(sectorId) {
    if (sectorId < 0 || sectorId >= 64) return false;
    return (this.roomPersistenceFlags[256 + sectorId] & SPATIAL_CONSTANTS.BIT_VISITED) !== 0;
  }

  mutateMetatile(cellIndex, replacementTileId) {
    this.tileMutationBuffer.set(cellIndex, replacementTileId);
  }

  clearTransientMutations() {
    this.tileMutationBuffer.clear();
  }

  /**
   * Enters Shadow Cave (Home Base, Supertile 0x00) and caches Overworld return coordinates
   */
  enterShadowCaveFromOverworld(worldX, worldY) {
    if (typeof worldX === 'number' && typeof worldY === 'number') {
      const secId = SpatialCoordinateMath.toOverworldSectorId(worldX, worldY);
      this.overworldReturnAnchor = {
        realmId: this.activeRealmId,
        sectorId: secId,
        worldX,
        worldY: worldY + 20,
        facing: 'DOWN'
      };
    }
    this.activeDomain = 'UNDERWORLD';
    this.activeSupertileId = SPATIAL_CONSTANTS.HOME_SUPERTILE_ID;
    this.markSupertileVisited(SPATIAL_CONSTANTS.HOME_SUPERTILE_ID);
    this.clearTransientMutations();
    this.updateUnderworldCameraClamps(256, 256);
    return {
      levelSlug: 'shadow_cave',
      spawnX: 256,
      spawnY: 420,
      facing: 'UP'
    };
  }

  /**
   * Exits Shadow Cave South Doorway onto the Empty 8x8 Overworld Sector Grid
   */
  exitShadowCaveToOverworld() {
    this.activeDomain = 'OVERWORLD';
    const anchor = this.overworldReturnAnchor || {
      realmId: 0,
      sectorId: SPATIAL_CONSTANTS.HOME_OVERWORLD_SECTOR_ID,
      worldX: SPATIAL_CONSTANTS.HOME_THRESHOLD_WORLD_X,
      worldY: SPATIAL_CONSTANTS.HOME_THRESHOLD_WORLD_Y,
      facing: 'DOWN'
    };
    this.activeSectorId = SpatialCoordinateMath.toOverworldSectorId(anchor.worldX, anchor.worldY);
    this.markOverworldSectorVisited(this.activeSectorId);
    this.clearTransientMutations();
    this.updateOverworldCameraClamps(anchor.worldX, anchor.worldY);
    return {
      levelSlug: 'overworld_grid',
      spawnX: anchor.worldX,
      spawnY: anchor.worldY,
      sectorId: this.activeSectorId,
      facing: 'DOWN'
    };
  }

  /**
   * Updates $0600 Camera Clamps for Overworld Sector or Linked Multi-Sector Region
   */
  updateOverworldCameraClamps(worldX, worldY) {
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
    if (interRegionTransition) {
      this.clearTransientMutations();
    }

    return {
      sectorId: secId,
      sectorHex: `0x${secId.toString(16).toUpperCase().padStart(2, '0')}`,
      col: secId & 0x07,
      row: (secId >> 3) & 0x07,
      interRegionTransition,
      clamps: this.cameraClamps
    };
  }

  /**
   * Updates $0600 Camera Clamps and Quadrant Tracking Indoors
   */
  updateUnderworldCameraClamps(localX, localY) {
    const quadId = SpatialCoordinateMath.toSupertileQuadrant(localX, localY);
    this.activeQuadrantId = quadId;
    const st = this.underworldSupertiles[this.activeSupertileId];
    const layout = st ? st.partitionLayout : 'FULL_4Q';

    const qx = quadId & 1;
    const qy = (quadId >> 1) & 1;

    if (layout === 'QUAD_4X1Q') {
      this.cameraClamps = {
        minX: qx * 256,
        minY: qy * 256,
        maxX: (qx + 1) * 256,
        maxY: (qy + 1) * 256
      };
    } else if (layout === 'SPLIT_V_2X2Q') {
      this.cameraClamps = {
        minX: qx * 256,
        minY: 0,
        maxX: (qx + 1) * 256,
        maxY: 512
      };
    } else if (layout === 'SPLIT_H_2X2Q') {
      this.cameraClamps = {
        minX: 0,
        minY: qy * 256,
        maxX: 512,
        maxY: (qy + 1) * 256
      };
    } else {
      // FULL_4Q (512x512 supertile)
      this.cameraClamps = {
        minX: 0,
        minY: 0,
        maxX: 512,
        maxY: 512
      };
    }

    return {
      supertileId: this.activeSupertileId,
      quadrantId: quadId,
      quadrantLabel: ['NW', 'NE', 'SW', 'SE'][quadId] || 'NW',
      clamps: this.cameraClamps
    };
  }

  /**
   * Clamps viewport camera coordinates to the active $0600 scroll boundaries
   */
  clampCamera(targetX, targetY, viewWidth, viewHeight) {
    const minCamX = this.cameraClamps.minX;
    const minCamY = this.cameraClamps.minY;
    const maxCamX = Math.max(minCamX, this.cameraClamps.maxX - viewWidth);
    const maxCamY = Math.max(minCamY, this.cameraClamps.maxY - viewHeight);

    return {
      cameraX: Math.max(minCamX, Math.min(targetX - viewWidth / 2, maxCamX)),
      cameraY: Math.max(minCamY, Math.min(targetY - viewHeight / 2, maxCamY))
    };
  }

  /**
   * Returns live spatial telemetry snapshot for HUD and X-Button Map Overlays
   */
  getTelemetrySnapshot(px, py) {
    if (this.activeDomain === 'OVERWORLD') {
      const secId = SpatialCoordinateMath.toOverworldSectorId(px, py);
      const col = SpatialCoordinateMath.toOverworldSectorCol(px);
      const row = SpatialCoordinateMath.toOverworldSectorRow(px);
      const mode7 = SpatialCoordinateMath.projectToMode7MapSpace(px, py);
      return {
        domain: 'OVERWORLD',
        realmId: this.activeRealmId,
        sectorId: secId,
        sectorHex: `0x${secId.toString(16).toUpperCase().padStart(2, '0')}`,
        sectorCol: col,
        sectorRow: row,
        metatileX: SpatialCoordinateMath.toMetatile(px),
        metatileY: SpatialCoordinateMath.toMetatile(py),
        megatileX: SpatialCoordinateMath.toMegatile(px),
        megatileY: SpatialCoordinateMath.toMegatile(py),
        localPx: SpatialCoordinateMath.toSectorLocalPx(px),
        localPy: SpatialCoordinateMath.toSectorLocalPx(py),
        mode7MapX: mode7.mapX,
        mode7MapY: mode7.mapY,
        elevationLayer: this.elevationLayer,
        clamps: this.cameraClamps
      };
    }

    const quadId = SpatialCoordinateMath.toSupertileQuadrant(px, py);
    return {
      domain: this.activeDomain,
      supertileId: this.activeSupertileId,
      supertileHex: `0x${this.activeSupertileId.toString(16).toUpperCase().padStart(2, '0')}`,
      quadrantId: quadId,
      quadrantLabel: ['NW', 'NE', 'SW', 'SE'][quadId] || 'NW',
      metatileX: SpatialCoordinateMath.toMetatile(px),
      metatileY: SpatialCoordinateMath.toMetatile(py),
      elevationLayer: this.elevationLayer,
      clamps: this.cameraClamps
    };
  }
}

export const spatialWorldEngine = new SpatialWorldEngine();
