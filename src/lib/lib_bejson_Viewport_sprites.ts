/**
 * Library:         lib_bejson_Viewport_sprites.ts
 * Family:          Viewport
 * Module Purpose:  2.5D Top-Down Sprite Layer Perspective, Equipment Mounting & Hand/Back Attachment Engine for BEJSON 105
 * Architecture:    BEJSON 105 Pure Data Sprite Viewport Perspective Rules
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-01
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   c92f8010-2026-1101-9999-000000000301
 */

export type DirectionFacing = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type EquipmentSlot = 'LEFT_HAND' | 'RIGHT_HAND' | 'BACK_MOUNT' | 'BACK_SHEATH' | 'HEAD' | 'CHEST';
export type EquipmentLayerOrder = 'BEHIND_BODY' | 'IN_FRONT_BODY';
export type RenderFace = 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'HIDDEN';

export interface AttachmentTransform {
  x: number;
  y: number;
  layerOrder: EquipmentLayerOrder;
  renderFace: RenderFace;
  isVisible: boolean;
}

export interface HandPositionSet {
  leftHand: { x: number; y: number };
  rightHand: { x: number; y: number };
  backCenter: { x: number; y: number };
}

export class BEJSONViewportSpritePerspectiveEngine {
  /**
   * Determines whether equipment in a designated slot should render BEHIND or IN_FRONT of the actor's body.
   */
  public determineEquipmentLayer(
    facing: DirectionFacing,
    slot: EquipmentSlot,
    isSheathed: boolean = false
  ): EquipmentLayerOrder {
    // 1. When facing UP (looking away from camera):
    // All mounted/held items (shields on back, items in hand) reside behind the torso depth plane.
    if (facing === 'UP') {
      return 'BEHIND_BODY';
    }

    // 2. When facing DOWN (looking toward camera):
    // Items in hands render IN_FRONT_BODY; mounted back items are hidden behind torso.
    if (facing === 'DOWN') {
      if (slot === 'LEFT_HAND' || slot === 'RIGHT_HAND') {
        return 'IN_FRONT_BODY';
      }
      return 'BEHIND_BODY';
    }

    // 3. Side Profiles (LEFT / RIGHT):
    // Hand closest to camera renders IN_FRONT_BODY; hand on far side renders BEHIND_BODY.
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
   */
  public calculateHandPositions(
    px: number,
    py: number,
    facing: DirectionFacing
  ): HandPositionSet {
    switch (facing) {
      case 'UP':
        return {
          leftHand: { x: px - 14, y: py - 4 },  // Shield/Item hand (left side from camera view when facing UP)
          rightHand: { x: px + 10, y: py - 4 }, // Weapon hand
          backCenter: { x: px - 6, y: py - 8 }  // Mounted back center
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
   * Calculates full attachment transform (position, layer order, and visible face) for equipment.
   */
  public calculateAttachmentTransform(
    px: number,
    py: number,
    facing: DirectionFacing,
    slot: EquipmentSlot,
    isSheathed: boolean = false
  ): AttachmentTransform {
    const hands = this.calculateHandPositions(px, py, facing);
    const layerOrder = this.determineEquipmentLayer(facing, slot, isSheathed);

    let x = px;
    let y = py;
    let renderFace: RenderFace = 'FRONT';
    let isVisible = true;

    if (isSheathed || slot === 'BACK_MOUNT' || slot === 'BACK_SHEATH') {
      x = hands.backCenter.x;
      y = hands.backCenter.y;

      if (facing === 'UP') {
        renderFace = 'FRONT'; // Mounted on back, front of shield faces camera
      } else if (facing === 'DOWN') {
        renderFace = 'HIDDEN'; // Covered by torso
        isVisible = false;
      } else if (facing === 'LEFT') {
        renderFace = 'SIDE_LEFT';
      } else {
        renderFace = 'SIDE_RIGHT';
      }
    } else if (slot === 'LEFT_HAND') {
      x = hands.leftHand.x;
      y = hands.leftHand.y;

      if (facing === 'UP') {
        renderFace = 'BACK'; // Looking away, see back of shield/item texture in hand
      } else if (facing === 'DOWN') {
        renderFace = 'FRONT'; // Facing camera, see front emblem
      } else if (facing === 'LEFT') {
        renderFace = 'SIDE_LEFT';
      } else {
        renderFace = 'SIDE_RIGHT';
      }
    } else if (slot === 'RIGHT_HAND') {
      x = hands.rightHand.x;
      y = hands.rightHand.y;
      renderFace = facing === 'UP' ? 'BACK' : (facing === 'DOWN' ? 'FRONT' : 'SIDE_RIGHT');
    }

    return {
      x,
      y,
      layerOrder,
      renderFace,
      isVisible
    };
  }
}

export const spritePerspectiveEngine = new BEJSONViewportSpritePerspectiveEngine();
