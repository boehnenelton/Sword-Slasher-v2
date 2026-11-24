/**
 * Library:         lib_bejson_Core_bejson_state.ts
 * Family:          Core
 * Description:     State management container for BEJSON 104a/105a stores in TypeScript.
 * Version:         1.0.0
 * Release_Version: 301
 * Date:            2026-11-24
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * RELATIONAL_ID:   e94df028-67a5-4268-a7fd-18260677192f
 * License:         PolyForm-Noncommercial-1.0.0
 */
export class BEJSONStateStore {
  private state: Record<string, any> = {};
  public get(key: string, fallback: any = null): any {
    return Object.prototype.hasOwnProperty.call(this.state, key) ? this.state[key] : fallback;
  }
  public set(key: string, value: any): void {
    this.state[key] = value;
  }
  public dump(): Record<string, any> {
    return { ...this.state };
  }
}
