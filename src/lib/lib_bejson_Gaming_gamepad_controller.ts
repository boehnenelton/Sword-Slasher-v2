/**
 * Library:         lib_bejson_Gaming_gamepad_controller.ts
 * Family:          Gaming
 * Module Purpose:  Virtual Retro Gamepad Controller Deck State & Analog Joystick Input Dispatcher
 * Architecture:    BEJSON 105 Input Deck Binding Specification
 * Version:         200102
 * Release_Version: 300
 * Date:            2026-10-25
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   105a0020-2026-1025-9999-000000000300
 */

export interface GamepadButtonState {
  joystickX: number; // -1.0 to +1.0
  joystickY: number; // -1.0 to +1.0
  buttonA: boolean;
  buttonB: boolean;
  buttonX: boolean;
  buttonY: boolean;
  buttonSelect: boolean;
  buttonStart: boolean;
}

export class GamepadControllerState {
  public state: GamepadButtonState = {
    joystickX: 0,
    joystickY: 0,
    buttonA: false,
    buttonB: false,
    buttonX: false,
    buttonY: false,
    buttonSelect: false,
    buttonStart: false
  };

  public setJoystickVector(x: number, y: number) {
    this.state.joystickX = Math.max(-1, Math.min(1, x));
    this.state.joystickY = Math.max(-1, Math.min(1, y));
  }

  public setButton(btn: keyof GamepadButtonState, active: boolean) {
    if (typeof this.state[btn] === 'boolean') {
      (this.state as any)[btn] = active;
    }
  }

  public resetAll() {
    this.state.joystickX = 0;
    this.state.joystickY = 0;
    this.state.buttonA = false;
    this.state.buttonB = false;
    this.state.buttonX = false;
    this.state.buttonY = false;
    this.state.buttonSelect = false;
    this.state.buttonStart = false;
  }
}

export const gamepadController = new GamepadControllerState();
