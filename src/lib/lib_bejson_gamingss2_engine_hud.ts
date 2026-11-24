/**
 * Library:         lib_bejson_gamingss2_engine_hud.ts
 * Family:          GamingSS2
 * Module Purpose:  In-canvas HUD rendering, heart containers, magic meter, and active item slots.
 * Architecture:    BEJSON 105 Format / Canvas Overlay HUD
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export interface HUDStats {
  hearts: number;
  maxHearts: number;
  magic: number;
  maxMagic: number;
  rupees: number;
  activeWeaponName?: string;
}

export class GamingSS2EngineHUD {
  public renderHUD(ctx: CanvasRenderingContext2D, stats: HUDStats, width: number, height: number): void {
    ctx.save();
    // Top-left dark HUD panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 220, 50);
    ctx.strokeStyle = '#DE2626';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, 220, 50);

    // Render Hearts
    ctx.fillStyle = '#DE2626';
    for (let i = 0; i < stats.maxHearts; i++) {
      const hx = 20 + i * 14;
      const hy = 24;
      if (i < stats.hearts) {
        ctx.fillRect(hx, hy, 10, 10);
      } else {
        ctx.strokeRect(hx, hy, 10, 10);
      }
    }

    // Render Magic Meter
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px monospace';
    ctx.fillText(`MP: ${stats.magic}/${stats.maxMagic}`, 20, 48);
    ctx.fillText(`RUPEES: ${stats.rupees}`, 130, 48);

    ctx.restore();
  }
}
