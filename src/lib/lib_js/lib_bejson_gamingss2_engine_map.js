/**
 * Library:         lib_bejson_gamingss2_engine_map.js
 * Family:          GamingSS2
 * Module Purpose:  Spatial grid chunk manager, frustum culling, and tile matrix rendering.
 * Architecture:    BEJSON 105 Format / Decoupled Tile Map Subsystem
 * Version:         1.0.1
 * Release_Version: 300
 * Date:            2026-11-13
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export class GamingSS2EngineMap {
  constructor(chunkSize = 16) {
    this.chunkSize = chunkSize;
    this.tileGrid = new Map();
  }

  loadMapData(cells) {
    this.tileGrid.clear();
    if (!Array.isArray(cells)) return;
    for (const cell of cells) {
      const key = `${cell.x}_${cell.y}`;
      this.tileGrid.set(key, cell);
    }
  }

  getVisibleTiles(viewport, tileSize = 16) {
    const ts = tileSize || 16;
    const minTileX = Math.floor(viewport.cameraX / ts) - 1;
    const maxTileX = Math.ceil((viewport.cameraX + viewport.width) / ts) + 1;
    const minTileY = Math.floor(viewport.cameraY / ts) - 1;
    const maxTileY = Math.ceil((viewport.cameraY + viewport.height) / ts) + 1;

    const visible = [];
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

  getTileAt(x, y) {
    return this.tileGrid.get(`${x}_${y}`);
  }
}

export const gamingSS2EngineMap = new GamingSS2EngineMap();
export default gamingSS2EngineMap;
