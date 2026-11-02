/**
 * Library:         lib_bejson_Gaming_gamepad_controller.js
 * Family:          Gaming
 * Module Purpose:  Virtual Retro Gamepad Controller Deck State & Analog Joystick Input Dispatcher (JS Mirror)
 * Architecture:    BEJSON 105 Input Deck Binding Specification
 * Version:         200102
 * Release_Version: 300
 * Date:            2026-10-25
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   105a0021-2026-1025-9999-000000000301
 */

class GamepadControllerStateJS {
  constructor() {
    this.state = {
      joystickX: 0,
      joystickY: 0,
      buttonA: false,
      buttonB: false,
      buttonX: false,
      buttonY: false,
      buttonSelect: false,
      buttonStart: false
    };
  }

  setJoystickVector(x, y) {
    this.state.joystickX = Math.max(-1, Math.min(1, x));
    this.state.joystickY = Math.max(-1, Math.min(1, y));
  }

  setButton(btn, active) {
    if (typeof this.state[btn] === 'boolean') {
      this.state[btn] = active;
    }
  }

  resetAll() {
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GamepadControllerStateJS };
}

export { GamepadControllerStateJS };
export default GamepadControllerStateJS;
