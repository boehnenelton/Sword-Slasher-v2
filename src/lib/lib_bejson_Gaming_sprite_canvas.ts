/**
 * Library:         lib_bejson_Gaming_sprite_canvas.ts
 * Family:          Gaming
 * Module Purpose:  HTML5 Canvas 2D Sprite Sheet, Item Texture Atlas & Animation Renderer for Shadow Link Awakening
 * Architecture:    BEJSON 105 Pure Data Sprite Engine (Pixel-Art 16x16 / 32x32 / 48x48)
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-14
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * License:         PolyForm Noncommercial License 1.0.0
 * RELATIONAL_ID:   c84e1122-2026-1114-9999-000000000401
 */

import { DirectionFacing, spritePerspectiveEngine } from './lib_bejson_Viewport_sprites';

export interface SpriteSheetConfig {
  slug: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  cols: number;
  rows: number;
  totalFrames: number;
}

export interface ItemTextureConfig {
  slug: string;
  url: string;
  size: number;
}

export interface TileTextureConfig {
  slug: string;
  url: string;
  size: number;
}

export interface VFXTextureConfig {
  slug: string;
  url: string;
  size: number;
}

export class BEJSONCanvasSpriteManager {
  private images: Map<string, HTMLImageElement> = new Map();
  private loaded: boolean = false;

  // Registered Sprite Sheets
  public sheets: Record<string, SpriteSheetConfig> = {
    shadow_link: {
      slug: 'shadow_link',
      url: '/assets/sprites/shadow_link_sheet_32x32.png',
      frameWidth: 32,
      frameHeight: 32,
      cols: 4,
      rows: 4,
      totalFrames: 16
    },
    ganon: {
      slug: 'ganon',
      url: '/assets/sprites/ganon_sheet_48x48.png',
      frameWidth: 48,
      frameHeight: 48,
      cols: 4,
      rows: 1,
      totalFrames: 4
    },
    slime: {
      slug: 'slime',
      url: '/assets/sprites/slime_sheet_32x32.png',
      frameWidth: 32,
      frameHeight: 32,
      cols: 4,
      rows: 1,
      totalFrames: 4
    },
    guard: {
      slug: 'guard',
      url: '/assets/sprites/guard_sheet_32x32.png',
      frameWidth: 32,
      frameHeight: 32,
      cols: 4,
      rows: 1,
      totalFrames: 4
    },
    shadow_link_bow: {
      slug: 'shadow_link_bow',
      url: '/assets/sprites/shadow_link_bow_sheet_32x32.png',
      frameWidth: 32,
      frameHeight: 32,
      cols: 4,
      rows: 4,
      totalFrames: 16
    },
    shadow_arrow_flight: {
      slug: 'shadow_arrow_flight',
      url: '/assets/sprites/shadow_arrow_flight_32x32.png',
      frameWidth: 32,
      frameHeight: 32,
      cols: 4,
      rows: 1,
      totalFrames: 4
    },
    arrow_impact_dynamics: {
      slug: 'arrow_impact_dynamics',
      url: '/assets/vfx/vfx_arrow_impact_dynamics_48x48.png',
      frameWidth: 48,
      frameHeight: 48,
      cols: 4,
      rows: 4,
      totalFrames: 16
    },
    hyrule_knight: {
      slug: 'hyrule_knight',
      url: '/assets/sprites/hyrule_knight_sheet_32x32.png',
      frameWidth: 32,
      frameHeight: 32,
      cols: 4,
      rows: 1,
      totalFrames: 4
    },
    hyrule_archer: {
      slug: 'hyrule_archer',
      url: '/assets/sprites/hyrule_archer_sheet_32x32.png',
      frameWidth: 32,
      frameHeight: 32,
      cols: 4,
      rows: 1,
      totalFrames: 4
    },
    hyrule_mage: {
      slug: 'hyrule_mage',
      url: '/assets/sprites/hyrule_mage_sheet_32x32.png',
      frameWidth: 32,
      frameHeight: 32,
      cols: 4,
      rows: 1,
      totalFrames: 4
    }
  };

  // Registered Item Textures
  public items: Record<string, ItemTextureConfig> = {
    shadow_blade: { slug: 'shadow_blade', url: '/assets/items/item_shadow_blade_16x16.png', size: 16 },
    obsidian_shield: { slug: 'obsidian_shield', url: '/assets/items/item_obsidian_shield_16x16.png', size: 16 },
    dark_elixir: { slug: 'dark_elixir', url: '/assets/items/item_dark_elixir_16x16.png', size: 16 },
    sanctuary_seal: { slug: 'sanctuary_seal', url: '/assets/items/item_sanctuary_seal_16x16.png', size: 16 },
    boomerang: { slug: 'boomerang', url: '/assets/items/item_boomerang_16x16.png', size: 16 },
    heart_container: { slug: 'heart_container', url: '/assets/items/item_heart_container_16x16.png', size: 16 },
    bomb: { slug: 'bomb', url: '/assets/items/item_bomb_16x16.png', size: 16 }
  };

  // Registered Terrain Tiles
  public tiles: Record<string, TileTextureConfig> = {
    sanctuary_floor: { slug: 'sanctuary_floor', url: '/assets/tiles/tile_sanctuary_floor_32x32.png', size: 32 },
    sanctuary_carpet: { slug: 'sanctuary_carpet', url: '/assets/tiles/tile_sanctuary_carpet_32x32.png', size: 32 },
    dark_grass: { slug: 'dark_grass', url: '/assets/tiles/tile_dark_grass_32x32.png', size: 32 },
    dungeon_wall: { slug: 'dungeon_wall', url: '/assets/tiles/tile_dungeon_wall_32x32.png', size: 32 }
  };

  // Registered Combat VFX Textures
  public vfx: Record<string, VFXTextureConfig> = {
    sword_slash_arc: { slug: 'sword_slash_arc', url: '/assets/vfx/vfx_sword_slash_arc_32x32.png', size: 32 },
    spin_attack_ring: { slug: 'spin_attack_ring', url: '/assets/vfx/vfx_spin_attack_ring_48x48.png', size: 48 },
    arrow_impact_dynamics: { slug: 'arrow_impact_dynamics', url: '/assets/vfx/vfx_arrow_impact_dynamics_48x48.png', size: 48 }
  };

  /**
   * Preload all textures into in-memory HTMLImageElement instances.
   */
  public async preloadAll(): Promise<void> {
    if (this.loaded) return;
    const promises: Promise<void>[] = [];

    // Preload sprite sheets
    for (const [key, cfg] of Object.entries(this.sheets)) {
      promises.push(this.loadImage(key, cfg.url));
    }
    // Preload item textures
    for (const [key, cfg] of Object.entries(this.items)) {
      promises.push(this.loadImage(`item_${key}`, cfg.url));
    }
    // Preload tiles
    for (const [key, cfg] of Object.entries(this.tiles)) {
      promises.push(this.loadImage(`tile_${key}`, cfg.url));
    }
    // Preload VFX
    for (const [key, cfg] of Object.entries(this.vfx)) {
      promises.push(this.loadImage(`vfx_${key}`, cfg.url));
    }

    await Promise.all(promises);
    this.loaded = true;
  }

  private loadImage(key: string, url: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        this.images.set(key, img);
        resolve();
      };
      img.onerror = () => {
        // Non-blocking fallback
        resolve();
      };
    });
  }

  public isReady(): boolean {
    return this.loaded;
  }

  public getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  /**
   * Draw a specific sprite cell from a sheet onto a 2D canvas context.
   */
  public drawCell(
    ctx: CanvasRenderingContext2D,
    sheetKey: string,
    col: number,
    row: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    flipX: boolean = false
  ): boolean {
    const img = this.images.get(sheetKey);
    const cfg = this.sheets[sheetKey];
    if (!img || !cfg) return false;

    const sx = col * cfg.frameWidth;
    const sy = row * cfg.frameHeight;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (flipX) {
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, sy, cfg.frameWidth, cfg.frameHeight, 0, 0, dw, dh);
    } else {
      ctx.drawImage(img, sx, sy, cfg.frameWidth, cfg.frameHeight, dx, dy, dw, dh);
    }

    ctx.restore();
    return true;
  }

  /**
   * Draw Shadow Link character walk frame.
   * Row 0: DOWN, Row 1: UP, Row 2: LEFT, Row 3: RIGHT.
   */
  public drawShadowLink(
    ctx: CanvasRenderingContext2D,
    facing: DirectionFacing,
    frameIndex: number,
    px: number,
    py: number,
    isHurt: boolean = false
  ): boolean {
    let row = 0;
    if (facing === 'DOWN') row = 0;
    else if (facing === 'UP') row = 1;
    else if (facing === 'LEFT') row = 2;
    else if (facing === 'RIGHT') row = 3;

    const col = frameIndex % 4;

    // Center 32x32 sprite around player anchor (px, py)
    const dx = Math.round(px - 16);
    const dy = Math.round(py - 20);

    ctx.save();
    if (isHurt) {
      ctx.filter = 'brightness(2.0) drop-shadow(0 0 4px #FFFFFF)';
    }
    const success = this.drawCell(ctx, 'shadow_link', col, row, dx, dy, 32, 32);
    ctx.restore();
    return success;
  }

  /**
   * Draw an item icon onto the canvas.
   */
  public drawItem(
    ctx: CanvasRenderingContext2D,
    itemSlug: string,
    dx: number,
    dy: number,
    size: number = 16
  ): boolean {
    const img = this.images.get(`item_${itemSlug}`);
    if (!img) return false;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, size, size);
    ctx.restore();
    return true;
  }

  /**
   * Draw a terrain tile onto the canvas.
   */
  public drawTile(
    ctx: CanvasRenderingContext2D,
    tileSlug: string,
    dx: number,
    dy: number,
    size: number = 32
  ): boolean {
    const img = this.images.get(`tile_${tileSlug}`);
    if (!img) return false;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, size, size);
    ctx.restore();
    return true;
  }

  /**
   * Draw Slime enemy animation frame.
   */
  public drawSlime(
    ctx: CanvasRenderingContext2D,
    frameIndex: number,
    sx: number,
    sy: number,
    isHurt: boolean = false
  ): boolean {
    const col = frameIndex % 4;
    const dx = Math.round(sx - 16);
    const dy = Math.round(sy - 16);

    ctx.save();
    if (isHurt) {
      ctx.filter = 'brightness(2.0) drop-shadow(0 0 4px #FFFFFF)';
    }
    const success = this.drawCell(ctx, 'slime', col, 0, dx, dy, 32, 32);
    ctx.restore();
    return success;
  }

  /**
   * Draw Guard enemy animation frame.
   */
  public drawGuard(
    ctx: CanvasRenderingContext2D,
    frameIndex: number,
    gx: number,
    gy: number,
    isHurt: boolean = false
  ): boolean {
    const col = frameIndex % 4;
    const dx = Math.round(gx - 16);
    const dy = Math.round(gy - 16);

    ctx.save();
    if (isHurt) {
      ctx.filter = 'brightness(2.0) drop-shadow(0 0 4px #FFFFFF)';
    }
    const success = this.drawCell(ctx, 'guard', col, 0, dx, dy, 32, 32);
    ctx.restore();
    return success;
  }

  /**
   * Draw Ganon boss sprite.
   */
  public drawGanon(
    ctx: CanvasRenderingContext2D,
    frameIndex: number,
    gx: number,
    gy: number
  ): boolean {
    const col = frameIndex % 4;
    const dx = Math.round(gx - 24);
    const dy = Math.round(gy - 24);

    return this.drawCell(ctx, 'ganon', col, 0, dx, dy, 48, 48);
  }

  /**
   * Draw Combat VFX (sword slash arc, spin attack ring).
   */
  public drawVFX(
    ctx: CanvasRenderingContext2D,
    vfxSlug: string,
    x: number,
    y: number,
    size: number = 32,
    rotationRad: number = 0
  ): boolean {
    const img = this.images.get(`vfx_${vfxSlug}`);
    if (!img) return false;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y);
    if (rotationRad !== 0) {
      ctx.rotate(rotationRad);
    }
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
    return true;
  }
}

export const canvasSpriteManager = new BEJSONCanvasSpriteManager();
