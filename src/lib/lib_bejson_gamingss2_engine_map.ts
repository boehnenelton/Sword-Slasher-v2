/**
 * Library:         lib_bejson_gamingss2_engine_map.ts
 * Family:          GamingSS2
 * Module Purpose:  Spatial grid chunk manager, frustum culling, and tile matrix rendering.
 * Architecture:    BEJSON 105 Format / Decoupled Tile Map Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e
 */

export interface TileCell {
  x: number;
  y: number;
  tileId: number;
  isSolid: boolean;
  biomeVariant?: string;
}

export interface MapViewport {
  cameraX: number;
  cameraY: number;
  width: number;
  height: number;
}

export class GamingSS2EngineMap {
  private chunkSize: number;
  private tileGrid: Map<string, TileCell> = new Map();

  constructor(chunkSize: number = 16) {
    this.chunkSize = chunkSize;
  }

  public loadMapData(cells: TileCell[]): void {
    this.tileGrid.clear();
    for (const cell of cells) {
      const key = `${cell.x}_${cell.y}`;
      this.tileGrid.set(key, cell);
    }
  }

  public getVisibleTiles(viewport: MapViewport, tileSize: number = 16): TileCell[] {
    const minTileX = Math.floor(viewport.cameraX / tileSize) - 1;
    const maxTileX = Math.ceil((viewport.cameraX + viewport.width) / tileSize) + 1;
    const minTileY = Math.floor(viewport.cameraY / tileSize) - 1;
    const maxTileY = Math.ceil((viewport.cameraY + viewport.height) / tileSize) + 1;

    const visible: TileCell[] = [];
    for (let x = minTileX; x <= maxTileX; x++) {
      for (let y = minTileY; y <= maxTileY; y++) {
        const cell = this.tileGrid.get(`${x}_${y}`);
        if (cell) {
          visible.push(cell);
        }
      }
    }
    return visible;
  }

  public getTileAt(x: number, y: number): TileCell | undefined {
    return this.tileGrid.get(`${x}_${y}`);
  }
}
