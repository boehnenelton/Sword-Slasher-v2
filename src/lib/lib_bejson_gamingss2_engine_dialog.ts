/**
 * Library:         lib_bejson_gamingss2_engine_dialog.ts
 * Family:          GamingSS2
 * Module Purpose:  Dialogue event bus, typewriter rendering, and story decision trees.
 * Architecture:    BEJSON 105 Format / Dialogue Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export interface DialogNode {
  id: string;
  speaker: string;
  text: string;
  portraitSvg?: string;
  nextId?: string;
}

export class GamingSS2EngineDialog {
  private activeNode: DialogNode | null = null;
  private charIndex: number = 0;

  public startDialog(node: DialogNode): void {
    this.activeNode = node;
    this.charIndex = 0;
  }

  public updateTypewriter(dt: number, speedCharsPerSec: number = 30): void {
    if (!this.activeNode) return;
    if (this.charIndex < this.activeNode.text.length) {
      this.charIndex += Math.ceil(speedCharsPerSec * dt);
      if (this.charIndex > this.activeNode.text.length) {
        this.charIndex = this.activeNode.text.length;
      }
    }
  }

  public getVisibleText(): string {
    if (!this.activeNode) return '';
    return this.activeNode.text.substring(0, this.charIndex);
  }

  public isComplete(): boolean {
    if (!this.activeNode) return true;
    return this.charIndex >= this.activeNode.text.length;
  }

  public getActiveSpeaker(): string {
    return this.activeNode ? this.activeNode.speaker : '';
  }

  public dismiss(): void {
    this.activeNode = null;
    this.charIndex = 0;
  }
}
