/**
 * Library:         lib_bejson_gamingss2_engine_menu.ts
 * Family:          GamingSS2
 * Module Purpose:  Full-screen system menu, settings tabs, and modal window management.
 * Architecture:    BEJSON 105 Format / System UI Framework
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export interface SystemMenuTab {
  id: string;
  label: string;
}

export class GamingSS2EngineMenu {
  private activeTab: string = 'general';
  private isOpen: boolean = false;
  private tabs: SystemMenuTab[] = [
    { id: 'general', label: 'General' },
    { id: 'audio', label: 'Audio & Synth' },
    { id: 'controls', label: 'Controls & Touch' },
    { id: 'packages', label: 'Packages & Compiler' },
  ];

  public openMenu(): void {
    this.isOpen = true;
  }

  public closeMenu(): void {
    this.isOpen = false;
  }

  public isMenuOpen(): boolean {
    return this.isOpen;
  }

  public setActiveTab(tabId: string): void {
    if (this.tabs.some(t => t.id === tabId)) {
      this.activeTab = tabId;
    }
  }

  public getActiveTab(): string {
    return this.activeTab;
  }

  public getTabs(): SystemMenuTab[] {
    return [...this.tabs];
  }
}
