/**
 * Library:         lib_bejson_Viewport_sprites.js
 * Family:          Viewport
 * Module Purpose:  2.5D Top-Down Sprite Layer Perspective, Equipment Mounting & Hand/Back Attachment Engine for BEJSON 105 (Vanilla JS Mirror)
 * Architecture:    BEJSON 105 Pure Data Sprite Viewport Perspective Rules
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-01
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export class BEJSONViewportSpritePerspectiveEngineJS {
  /**
   * Determines whether equipment in a designated slot should render BEHIND or IN_FRONT of the actor's body.
   * @param {string} facing 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
   * @param {string} slot 'LEFT_HAND' | 'RIGHT_HAND' | 'BACK_MOUNT' | 'BACK_SHEATH'
   * @param {boolean} isSheathed
   * @returns {'BEHIND_BODY' | 'IN_FRONT_BODY'}
   */
  determineEquipmentLayer(facing, slot, isSheathed = false) {
    if (facing === 'UP') {
      return 'BEHIND_BODY';
    }
    if (facing === 'DOWN') {
      if (slot === 'LEFT_HAND' || slot === 'RIGHT_HAND') {
        return 'IN_FRONT_BODY';
      }
      return 'BEHIND_BODY';
    }
    if (facing === 'LEFT') {
      if (slot === 'LEFT_HAND') return 'IN_FRONT_BODY';
      if (slot === 'RIGHT_HAND') return 'BEHIND_BODY';
      return isSheathed ? 'BEHIND_BODY' : 'IN_FRONT_BODY';
    }
    if (facing === 'RIGHT') {
      if (slot === 'RIGHT_HAND') return 'IN_FRONT_BODY';
      if (slot === 'LEFT_HAND') return 'BEHIND_BODY';
      return isSheathed ? 'BEHIND_BODY' : 'IN_FRONT_BODY';
    }
    return 'IN_FRONT_BODY';
  }

  /**
   * Calculates anchor coordinates for left hand, right hand, and back mount for an actor.
   * @param {number} px
   * @param {number} py
   * @param {string} facing
   */
  calculateHandPositions(px, py, facing) {
    switch (facing) {
      case 'UP':
        return {
          leftHand: { x: px - 14, y: py - 4 },
          rightHand: { x: px + 10, y: py - 4 },
          backCenter: { x: px - 6, y: py - 8 }
        };
      case 'DOWN':
        return {
          leftHand: { x: px - 14, y: py - 3 },
          rightHand: { x: px + 10, y: py - 3 },
          backCenter: { x: px - 6, y: py - 8 }
        };
      case 'LEFT':
        return {
          leftHand: { x: px - 11, y: py - 4 },
          rightHand: { x: px + 4, y: py - 4 },
          backCenter: { x: px - 10, y: py - 7 }
        };
      case 'RIGHT':
        return {
          leftHand: { x: px - 4, y: py - 4 },
          rightHand: { x: px + 7, y: py - 4 },
          backCenter: { x: px + 2, y: py - 7 }
        };
    }
  }

  /**
   * Calculates full attachment transform.
   * @param {number} px
   * @param {number} py
   * @param {string} facing
   * @param {string} slot
   * @param {boolean} isSheathed
   */
  calculateAttachmentTransform(px, py, facing, slot, isSheathed = false) {
    const hands = this.calculateHandPositions(px, py, facing);
    const layerOrder = this.determineEquipmentLayer(facing, slot, isSheathed);

    let x = px;
    let y = py;
    let renderFace = 'FRONT';
    let isVisible = true;

    if (isSheathed || slot === 'BACK_MOUNT' || slot === 'BACK_SHEATH') {
      x = hands.backCenter.x;
      y = hands.backCenter.y;
      if (facing === 'UP') renderFace = 'FRONT';
      else if (facing === 'DOWN') { renderFace = 'HIDDEN'; isVisible = false; }
      else if (facing === 'LEFT') renderFace = 'SIDE_LEFT';
      else renderFace = 'SIDE_RIGHT';
    } else if (slot === 'LEFT_HAND') {
      x = hands.leftHand.x;
      y = hands.leftHand.y;
      if (facing === 'UP') renderFace = 'BACK';
      else if (facing === 'DOWN') renderFace = 'FRONT';
      else if (facing === 'LEFT') renderFace = 'SIDE_LEFT';
      else renderFace = 'SIDE_RIGHT';
    } else if (slot === 'RIGHT_HAND') {
      x = hands.rightHand.x;
      y = hands.rightHand.y;
      renderFace = facing === 'UP' ? 'BACK' : (facing === 'DOWN' ? 'FRONT' : 'SIDE_RIGHT');
    }

    return { x, y, layerOrder, renderFace, isVisible };
  }
}

export const spritePerspectiveEngineJS = new BEJSONViewportSpritePerspectiveEngineJS();
