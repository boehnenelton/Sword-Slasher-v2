/**
 * Library:         lib_bejson_gamingss2_engine_input.ts
 * Family:          GamingSS2
 * Module Purpose:  Touch joysticks, deadzone filtering, keyboard and gamepad controller bindings.
 * Architecture:    BEJSON 105 Format / Input Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f
 */

export interface InputVector {
  dx: number;
  dy: number;
}

export interface InputState {
  move: InputVector;
  btnA: boolean; // Dark Attack / Slash
  btnB: boolean; // Spin Attack / Charge
  btnX: boolean; // Dark Dash / Evade
  btnY: boolean; // Item / Inventory Action
  btnMenu: boolean;
}

export class GamingSS2EngineInput {
  private deadzone: number;
  private state: InputState = {
    move: { dx: 0, dy: 0 },
    btnA: false,
    btnB: false,
    btnX: false,
    btnY: false,
    btnMenu: false,
  };

  constructor(deadzone: number = 0.15) {
    this.deadzone = deadzone;
  }

  public updateJoystick(rawDx: number, rawDy: number): void {
    const mag = Math.hypot(rawDx, rawDy);
    if (mag < this.deadzone) {
      this.state.move.dx = 0;
      this.state.move.dy = 0;
    } else {
      const scale = (mag - this.deadzone) / (1 - this.deadzone);
      this.state.move.dx = (rawDx / mag) * scale;
      this.state.move.dy = (rawDy / mag) * scale;
    }
  }

  public setButton(btn: 'btnA' | 'btnB' | 'btnX' | 'btnY' | 'btnMenu', pressed: boolean): void {
    this.state[btn] = pressed;
  }

  public getInputState(): InputState {
    return { ...this.state, move: { ...this.state.move } };
  }
}
