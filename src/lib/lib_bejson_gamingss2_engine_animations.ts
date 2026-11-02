/**
 * Library:         lib_bejson_gamingss2_engine_animations.ts
 * Family:          GamingSS2
 * Module Purpose:  4-directional walking cycles, SVG frame resolution, and 2.5D layer ordering.
 * Architecture:    BEJSON 105 Format / Animation & Graphics Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   d6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a
 */

export interface RenderableEntity {
  id: string;
  x: number;
  y: number;
  zOrder: number;
  renderFn: (ctx: CanvasRenderingContext2D) => void;
}

export class GamingSS2EngineAnimations {
  private frameTimer: number = 0;
  private currentFrame: number = 0;

  public updateAnimFrame(dt: number, frameCount: number = 4, fps: number = 8): number {
    this.frameTimer += dt;
    if (this.frameTimer >= 1 / fps) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % frameCount;
    }
    return this.currentFrame;
  }

  public sortAndRender25D(ctx: CanvasRenderingContext2D, entities: RenderableEntity[]): void {
    // Sort top to bottom (y-axis depth sorting)
    const sorted = [...entities].sort((a, b) => {
      if (a.zOrder !== b.zOrder) return a.zOrder - b.zOrder;
      return a.y - b.y;
    });

    for (const entity of sorted) {
      entity.renderFn(ctx);
    }
  }
}
