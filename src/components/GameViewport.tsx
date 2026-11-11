/**
 * Library:         GameViewport.tsx
 * Module Purpose:  Top-Down Pixel-Art Engine with AABB Bounding Box Physics, Vector Knockback, Y-Sorted Depth & In-Canvas HUD
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0003-2026-1025-9999-000000000112
 * Version:         200113
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { bejsonEngine, GameEventData } from '../engine/bejsonEngine';
import { shadowEngine } from '../lib/lib_bejson_Gaming_shadow_engine';
import { bejsonGaming } from '../lib/lib_bejson_Gaming_engine';
import { projectilePhysics, DroppedItem, ObjectCollisionBox } from '../lib/lib_bejson_Gaming_projectile_physics';
import { soundEngine } from '../engine/soundEngine';
import { physicsEngine, KnockbackState } from '../engine/physicsEngine';
import { screenEffects } from '../lib/lib_bejson_Gaming_screen_effects';
import { spritePerspectiveEngine } from '../lib/lib_bejson_Viewport_sprites';
import { GamepadDeck } from './GamepadDeck';

interface Props {
  onTriggerDialogue: (event: GameEventData) => void;
  crtEnabled: boolean;
  onOpenInventory: () => void;
  onOpenSettings: () => void;
  onOpenWorldMap: () => void;
}

interface EnemyState {
  id: string;
  name: string;
  type: 'slime' | 'guard';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  facing: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  hurtTime: number;
  knockback: KnockbackState;
}

interface OtherProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'arrow' | 'bomb';
  timer: number;
}

interface DestructibleProp {
  id: string;
  x: number;
  y: number;
  type: 'pot' | 'bush' | 'pedestal';
  destroyed: boolean;
  icon?: string;
  title?: string;
  itemId?: string;
}

// Y-Renderable interface for 2.5D Top-to-Bottom depth sorting
interface RenderableEntity {
  sortY: number;
  type: 'prop' | 'item' | 'portal' | 'ganon' | 'enemy' | 'projectile' | 'player';
  data: any;
}

export const GameViewport: React.FC<Props> = ({
  onTriggerDialogue,
  crtEnabled,
  onOpenInventory,
  onOpenSettings,
  onOpenWorldMap
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const joystickVectorRef = useRef({ x: 0, y: 0 });

  // Player Knockback Vector & Invincibility State
  const playerKnockbackRef = useRef<KnockbackState>({ vx: 0, vy: 0 });
  const playerHurtRef = useRef<number>(0);

  // Sword Charge State (Holding B / J / Z Button)
  const bHeldTimeRef = useRef<number>(0);
  const isChargingRef = useRef<boolean>(false);

  // Active Non-Boomerang Projectiles & Props
  const otherProjectilesRef = useRef<OtherProjectile[]>([]);
  const propsRef = useRef<DestructibleProp[]>([
    { id: 'p1', x: 300, y: 400, type: 'pot', destroyed: false },
    { id: 'p2', x: 340, y: 400, type: 'bush', destroyed: false },
    { id: 'p3', x: 600, y: 450, type: 'pot', destroyed: false },
    { id: 'p4', x: 640, y: 450, type: 'bush', destroyed: false },
    { id: 'p5', x: 512, y: 600, type: 'pot', destroyed: false },
    { id: 'p6', x: 200, y: 700, type: 'bush', destroyed: false },
    { id: 'p7', x: 800, y: 700, type: 'pot', destroyed: false },
    { id: 'p8', x: 450, y: 300, type: 'bush', destroyed: false },
    { id: 'p9', x: 550, y: 300, type: 'pot', destroyed: false }
  ]);

  // Dynamic Level Enemy States
  const enemiesRef = useRef<EnemyState[]>([]);
  const slashAnimRef = useRef<{ x: number; y: number; dir: string; timer: number; maxTimer: number; variation: number } | null>(null);
  const swordVariationRef = useRef<number>(0);
  const spinAnimRef = useRef<{ x: number; y: number; timer: number; maxTimer: number } | null>(null);
  const swordCooldownRef = useRef<number>(0);
  const bowCooldownRef = useRef<number>(0);
  const isSheathedRef = useRef<boolean>(false);
  const openingTriggeredRef = useRef(false);

  // Item pickup handler callback
  const handleItemPickup = useCallback((item: DroppedItem) => {
    if (item.type === 'rupee') {
      soundEngine.playRupeePickupSFX();
      shadowEngine.rupees = Math.min(shadowEngine.maxRupees, shadowEngine.rupees + item.value);
    } else if (item.type === 'heart') {
      soundEngine.playHeartPickupSFX();
      bejsonEngine.playerHp = Math.min(bejsonEngine.playerMaxHp, bejsonEngine.playerHp + item.value);
    } else if (item.type === 'bomb') {
      soundEngine.playChimeSFX();
      shadowEngine.bombs = Math.min(shadowEngine.maxBombs, shadowEngine.bombs + item.value);
    } else if (item.type === 'arrow') {
      soundEngine.playChimeSFX();
      shadowEngine.arrows = Math.min(shadowEngine.maxArrows, shadowEngine.arrows + item.value);
    } else {
      soundEngine.playChimeSFX();
    }
  }, []);

  // Initialize level actors
  const syncEnemiesForLevel = useCallback((levelSlug: string) => {
    const actorInstances = bejsonEngine.getActorsForLevel(levelSlug);
    const enemyList: EnemyState[] = actorInstances
      .filter(a => a.role === 'ENEMY_MOB')
      .map(a => ({
        id: a.uuid,
        name: a.displayName,
        type: a.archetypeSlug === 'guard' ? 'guard' : 'slime',
        x: a.x,
        y: a.y,
        hp: a.hp,
        maxHp: a.archetypeSlug === 'guard' ? 60 : 35,
        attack: a.attack,
        facing: 'DOWN',
        hurtTime: 0,
        knockback: { vx: 0, vy: 0 }
      }));
    enemiesRef.current = enemyList;
  }, []);

  const syncPropsForLevel = useCallback((levelSlug: string) => {
    if (levelSlug === 'debug_chamber') {
      const cx = 512;
      const cy = 512;
      propsRef.current = [
        // Item Testing Pedestals (North Section)
        { id: 'ped_boomerang', x: cx - 120, y: cy - 180, type: 'pedestal', destroyed: false, itemId: 'shadow_boomerang', icon: '🪃', title: 'BOOMERANG' },
        { id: 'ped_bow', x: cx - 40, y: cy - 180, type: 'pedestal', destroyed: false, itemId: 'dark_bow', icon: '🏹', title: 'DARK BOW' },

        // Zone Props
        { id: 'p1', x: cx - 160, y: cy - 80, type: 'pot', destroyed: false },
        { id: 'p2', x: cx - 200, y: cy - 80, type: 'bush', destroyed: false },
        { id: 'p3', x: cx + 160, y: cy - 80, type: 'pot', destroyed: false },
        { id: 'p4', x: cx + 200, y: cy - 80, type: 'bush', destroyed: false }
      ];
    } else {
      propsRef.current = [
        { id: 'p1', x: 300, y: 400, type: 'pot', destroyed: false },
        { id: 'p2', x: 340, y: 400, type: 'bush', destroyed: false },
        { id: 'p3', x: 600, y: 450, type: 'pot', destroyed: false },
        { id: 'p4', x: 640, y: 450, type: 'bush', destroyed: false },
        { id: 'p5', x: 512, y: 600, type: 'pot', destroyed: false },
        { id: 'p6', x: 200, y: 700, type: 'bush', destroyed: false },
        { id: 'p7', x: 800, y: 700, type: 'pot', destroyed: false },
        { id: 'p8', x: 450, y: 300, type: 'bush', destroyed: false },
        { id: 'p9', x: 550, y: 300, type: 'pot', destroyed: false }
      ];
    }
  }, []);

  useEffect(() => {
    syncEnemiesForLevel(bejsonEngine.currentLevelSlug);
    syncPropsForLevel(bejsonEngine.currentLevelSlug);
  }, [syncEnemiesForLevel, syncPropsForLevel]);

  // Execute Sword Slash (SNES Fast Swing Arc with Vector Knockback & Sheathing Mechanic)
  const executeSwordSlash = useCallback(() => {
    // If currently sheathed, tap once to un-sheathe equipment! Tap again to swing!
    if (isSheathedRef.current) {
      isSheathedRef.current = false;
      soundEngine.playChimeSFX();
      bHeldTimeRef.current = 0;
      return;
    }

    if (swordCooldownRef.current > 0 || (slashAnimRef.current && slashAnimRef.current.timer > 0)) {
      return;
    }

    soundEngine.playSlashSFX();
    const px = bejsonEngine.playerX;
    const py = bejsonEngine.playerY;
    const dir = bejsonEngine.playerFacing;

    // Fast 14-Frame Swing Arc with 3 Arc Variations & Extended Reach (+3px)
    const varIdx = swordVariationRef.current % 3;
    swordVariationRef.current = (swordVariationRef.current + 1) % 3;

    slashAnimRef.current = { x: px, y: py, dir, timer: 14, maxTimer: 14, variation: varIdx };
    swordCooldownRef.current = 16;

    let hitX = px;
    let hitY = py;
    const reach = 35; // Extended reach (+3 pixels)
    if (dir === 'UP') hitY -= reach;
    if (dir === 'DOWN') hitY += reach;
    if (dir === 'LEFT') hitX -= reach;
    if (dir === 'RIGHT') hitX += reach;

    // Cut bushes / break pots / activate pedestals with AABB check
    propsRef.current = propsRef.current.map(prop => {
      if (!prop.destroyed && physicsEngine.checkAABBRaw(hitX - 16, hitY - 16, 32, 32, prop.x - 10, prop.y - 10, 20, 20)) {
        if (prop.type === 'pedestal') {
          if (prop.itemId) {
            shadowEngine.setSelectedYItem(prop.itemId);
            soundEngine.playChimeSFX();
            screenEffects.triggerFlash('#FFFFFF', 0.3, 0.2);
          }
          return prop;
        }
        if (prop.type === 'pot') {
          soundEngine.playPotBreakSFX();
        } else {
          soundEngine.playBushCutSFX();
        }
        projectilePhysics.spawnDrop(prop.x, prop.y);
        return { ...prop, destroyed: true };
      }
      return prop;
    });

    // Damage & Vector Knockback Enemies
    enemiesRef.current = enemiesRef.current.map(enemy => {
      if (enemy.hp <= 0) return enemy;
      const isHit = physicsEngine.checkAABBRaw(hitX - 18, hitY - 18, 36, 36, enemy.x - 12, enemy.y - 12, 24, 24);
      if (isHit) {
        screenEffects.triggerShake(6, 0.25);
        const newHp = Math.max(0, enemy.hp - 25);
        if (newHp === 0) {
          soundEngine.playEnemyDeathSFX();
          projectilePhysics.spawnDrop(enemy.x, enemy.y);
        } else {
          soundEngine.playHitSFX();
        }

        // Vector Knockback calculation
        const kb = physicsEngine.calculateKnockbackVector(px, py, enemy.x, enemy.y, 8.5);
        return {
          ...enemy,
          hp: newHp,
          hurtTime: 14,
          knockback: kb
        };
      }
      return enemy;
    });
  }, []);

  // Whirling Blade (Full 360° Spin Attack with Heavy Vector Knockback)
  const executeWhirlingBlade = useCallback(() => {
    soundEngine.playSpinAttackSFX();
    screenEffects.triggerShake(12, 0.4);
    screenEffects.triggerFlash('#DE2626', 0.35, 0.2);
    const px = bejsonEngine.playerX;
    const py = bejsonEngine.playerY;

    spinAnimRef.current = { x: px, y: py, timer: 18, maxTimer: 18 };

    // Damage surrounding enemies with 360° Vector Knockback
    enemiesRef.current = enemiesRef.current.map(enemy => {
      if (enemy.hp <= 0) return enemy;
      const isHit = physicsEngine.checkAABBRaw(px - 32, py - 32, 64, 64, enemy.x - 12, enemy.y - 12, 24, 24);
      if (isHit) {
        const newHp = Math.max(0, enemy.hp - 40);
        if (newHp === 0) {
          soundEngine.playEnemyDeathSFX();
          projectilePhysics.spawnDrop(enemy.x, enemy.y);
        } else {
          soundEngine.playHitSFX();
        }

        const kb = physicsEngine.calculateKnockbackVector(px, py, enemy.x, enemy.y, 14.0);
        return {
          ...enemy,
          hp: newHp,
          hurtTime: 16,
          knockback: kb
        };
      }
      return enemy;
    });

    // Cut all surrounding bushes & pots
    propsRef.current = propsRef.current.map(prop => {
      if (!prop.destroyed && physicsEngine.checkAABBRaw(px - 32, py - 32, 64, 64, prop.x - 10, prop.y - 10, 20, 20)) {
        if (prop.type === 'pot') {
          soundEngine.playPotBreakSFX();
        } else {
          soundEngine.playBushCutSFX();
        }
        projectilePhysics.spawnDrop(prop.x, prop.y);
        return { ...prop, destroyed: true };
      }
      return prop;
    });
  }, []);

  // Activate Currently Selected Y-Button Item
  const executeYItem = useCallback(() => {
    isSheathedRef.current = false;
    const activeItem = shadowEngine.getActiveYItem();
    if (!activeItem) return;

    const px = bejsonEngine.playerX;
    const py = bejsonEngine.playerY;
    const dir = bejsonEngine.playerFacing;

    if (activeItem.id === 'shadow_boomerang') {
      if (projectilePhysics.boomerangs.length > 0) return;
      soundEngine.playBoomerangSFX();
      projectilePhysics.spawnBoomerang(px, py, dir, 0);
    } else if (activeItem.id === 'dark_bow') {
      if (bowCooldownRef.current > 0) return; // Controlled reciprocation speed limit!
      if (shadowEngine.arrows <= 0) return;
      shadowEngine.arrows--;
      bowCooldownRef.current = 26; // ~0.43s reloading cooldown between shots

      soundEngine.playSlashSFX();

      let vx = 0;
      let vy = 0;
      const arrowSpeed = 5.2; // Controlled, realistic arrow velocity
      if (dir === 'UP') vy = -arrowSpeed;
      if (dir === 'DOWN') vy = arrowSpeed;
      if (dir === 'LEFT') vx = -arrowSpeed;
      if (dir === 'RIGHT') vx = arrowSpeed;

      otherProjectilesRef.current.push({ x: px, y: py, vx, vy, type: 'arrow', timer: 55 });
    } else if (activeItem.id === 'dark_bombs') {
      if (shadowEngine.bombs <= 0) return;
      shadowEngine.bombs--;
      soundEngine.playDarkAuraSFX();

      otherProjectilesRef.current.push({ x: px, y: py, vx: 0, vy: 0, type: 'bomb', timer: 60 });
    } else if (activeItem.id === 'dark_elixir') {
      if (bejsonEngine.playerHp < bejsonEngine.playerMaxHp) {
        bejsonEngine.playerHp = Math.min(bejsonEngine.playerMaxHp, bejsonEngine.playerHp + 50);
        bejsonEngine.magicPoints = Math.min(bejsonEngine.maxMagicPoints, bejsonEngine.magicPoints + 50);
        soundEngine.playChimeSFX();
      }
    }
  }, []);

  // Context Action A-Button (DO Window)
  const executeInteract = useCallback(() => {
    const px = bejsonEngine.playerX;
    const py = bejsonEngine.playerY;

    let interactedProp = false;
    propsRef.current = propsRef.current.map(prop => {
      if (!prop.destroyed && physicsEngine.checkAABBRaw(px - 18, py - 18, 36, 36, prop.x - 12, prop.y - 12, 24, 24)) {
        if (prop.type === 'pedestal') {
          if (prop.itemId) {
            shadowEngine.setSelectedYItem(prop.itemId);
            soundEngine.playChimeSFX();
            screenEffects.triggerFlash('#FFFFFF', 0.3, 0.2);
            interactedProp = true;
          }
          return prop;
        }
        soundEngine.playChimeSFX();
        interactedProp = true;
        projectilePhysics.spawnDrop(prop.x, prop.y);
        return { ...prop, destroyed: true };
      }
      return prop;
    });

    if (interactedProp) return;

    // Ganon interaction in Ganon Sanctuary
    if (bejsonEngine.currentLevelSlug === 'ganon_sanctuary' && Math.hypot(px - 512, py - 200) < 60) {
      const evt = bejsonEngine.triggerOpeningCutscene();
      if (evt) {
        soundEngine.playDarkAuraSFX();
        onTriggerDialogue(evt);
        openingTriggeredRef.current = true;
      }
    }

    // Princess Zelda interaction in Princess Tower
    if (bejsonEngine.currentLevelSlug === 'princess_tower' && Math.hypot(px - 256, py - 180) < 50) {
      const evt = bejsonEngine.getEventByUuid('994b1b9c-42b1-415f-8d21-6233d9672392');
      if (evt) {
        soundEngine.playChimeSFX();
        onTriggerDialogue(evt);
      }
    }
  }, [onTriggerDialogue]);

  const handleJoystickMove = useCallback((x: number, y: number) => {
    joystickVectorRef.current = { x, y };
  }, []);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;

      if (key === 'j' || key === 'z' || key === 'b') {
        executeSwordSlash();
      }
      if (key === 'k' || key === 'x') {
        soundEngine.playChimeSFX();
        onOpenWorldMap();
      }
      if (key === 'y' || key === 'i') {
        executeYItem();
      }
      if (key === 'e' || key === 'a' || e.key === ' ') {
        executeInteract();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [executeSwordSlash, executeYItem, executeInteract, onOpenWorldMap]);

  // Main Render & AABB Physics Game Loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const gameLoop = () => {
      tick++;

      // Current Level Map Specs
      const currentLvl = bejsonEngine.getCurrentLevelData();
      const tilesW = currentLvl?.width || 64;
      const tilesH = currentLvl?.height || 64;
      const tileUnitPx = 16;
      const mapWorldWidth = tilesW * tileUnitPx;
      const mapWorldHeight = tilesH * tileUnitPx;

      // Update Player Input & Velocity
      const speed = 2.8;
      let dx = 0;
      let dy = 0;

      if (keysRef.current['w'] || keysRef.current['arrowup']) {
        dy -= speed;
        bejsonEngine.playerFacing = 'UP';
      }
      if (keysRef.current['s'] || keysRef.current['arrowdown']) {
        dy += speed;
        bejsonEngine.playerFacing = 'DOWN';
      }
      if (keysRef.current['a'] || keysRef.current['arrowleft']) {
        dx -= speed;
        bejsonEngine.playerFacing = 'LEFT';
      }
      if (keysRef.current['d'] || keysRef.current['arrowright']) {
        dx += speed;
        bejsonEngine.playerFacing = 'RIGHT';
      }

      // Analog Joystick Input
      const jx = joystickVectorRef.current.x;
      const jy = joystickVectorRef.current.y;
      if (Math.hypot(jx, jy) > 0.15) {
        dx = jx * speed;
        dy = jy * speed;
        if (Math.abs(jx) > Math.abs(jy)) {
          bejsonEngine.playerFacing = jx > 0 ? 'RIGHT' : 'LEFT';
        } else {
          bejsonEngine.playerFacing = jy > 0 ? 'DOWN' : 'UP';
        }
      }

      const isMoving = Math.hypot(dx, dy) > 0.1;

      // Active Biome Audio Profile Calculation & Environmental Synth Dispatch
      let activeBiomeSlug = 'dark_grass';
      if (currentLvl?.slug === 'debug_chamber') {
        const pTileX = Math.floor(bejsonEngine.playerX / tileUnitPx);
        const pTileY = Math.floor(bejsonEngine.playerY / tileUnitPx);
        if (pTileX < 32 && pTileY < 32) activeBiomeSlug = 'dark_grass';
        else if (pTileX >= 32 && pTileY < 32) activeBiomeSlug = 'sanctuary_obsidian';
        else if (pTileX < 32 && pTileY >= 32) activeBiomeSlug = 'subterranean_cave';
        else activeBiomeSlug = 'desert_sand';
      } else if (currentLvl?.slug === 'ganon_sanctuary') {
        activeBiomeSlug = 'sanctuary_obsidian';
      } else if (currentLvl?.slug === 'forgotten_cavern') {
        activeBiomeSlug = 'subterranean_cave';
      }

      const activeAudioProf = bejsonGaming.getAudioProfileForBiome(activeBiomeSlug);

      if (isMoving && tick % 16 === 0) {
        soundEngine.playBiomeFootstep(activeAudioProf);
      }

      if (tick % 30 === 0) {
        soundEngine.updateAmbientBiomeDrone(activeAudioProf);
      }

      // Sword B Button Charging & Sheathing Logic
      if (keysRef.current['b'] || keysRef.current['j'] || keysRef.current['z']) {
        bHeldTimeRef.current++;
        // Stand still 2 seconds (120 frames) while holding B button to sheath equipment on back!
        if (!isMoving && bHeldTimeRef.current >= 120) {
          if (!isSheathedRef.current) {
            isSheathedRef.current = true;
            soundEngine.playChimeSFX();
          }
        } else if (bHeldTimeRef.current > 25 && !isSheathedRef.current) {
          isChargingRef.current = true;
        }
      } else {
        if (isChargingRef.current && !isSheathedRef.current) {
          executeWhirlingBlade();
        }
        bHeldTimeRef.current = 0;
        isChargingRef.current = false;
      }

      // Apply Player Knockback Physics & Friction Decay
      const pKb = playerKnockbackRef.current;
      dx += pKb.vx;
      dy += pKb.vy;
      physicsEngine.applyFriction(pKb, 0.82);

      if (swordCooldownRef.current > 0) swordCooldownRef.current--;
      if (bowCooldownRef.current > 0) bowCooldownRef.current--;

      if (playerHurtRef.current > 0) {
        playerHurtRef.current--;
      }

      // AABB Bounding Box Collision Check for Player against Map Boundaries & Props
      let nextPx = bejsonEngine.playerX + dx;
      let nextPy = bejsonEngine.playerY + dy;

      // Map Edge Boundaries
      nextPx = Math.max(24, Math.min(mapWorldWidth - 24, nextPx));
      nextPy = Math.max(24, Math.min(mapWorldHeight - 24, nextPy));

      // Prop Collisions (Solid pots & bushes block movement)
      propsRef.current.forEach(pr => {
        if (!pr.destroyed) {
          if (physicsEngine.checkAABBRaw(nextPx - 8, bejsonEngine.playerY - 8, 16, 16, pr.x - 9, pr.y - 9, 18, 18)) {
            nextPx = bejsonEngine.playerX;
          }
          if (physicsEngine.checkAABBRaw(bejsonEngine.playerX - 8, nextPy - 8, 16, 16, pr.x - 9, pr.y - 9, 18, 18)) {
            nextPy = bejsonEngine.playerY;
          }
        }
      });

      bejsonEngine.playerX = nextPx;
      bejsonEngine.playerY = nextPy;

      const px = bejsonEngine.playerX;
      const py = bejsonEngine.playerY;

      screenEffects.update(1 / 60);

      // Dynamic Camera Viewport Follow System
      const zoomScale = 1.25;
      const viewportWorldW = canvas.width / zoomScale;
      const viewportWorldH = canvas.height / zoomScale;

      let camX = px - viewportWorldW / 2 + screenEffects.shake.offsetX;
      let camY = py - viewportWorldH / 2 + screenEffects.shake.offsetY;

      camX = Math.max(0, Math.min(mapWorldWidth - viewportWorldW, camX));
      camY = Math.max(0, Math.min(mapWorldHeight - viewportWorldH, camY));

      // Frustum Culling bounds
      const minCol = Math.max(0, Math.floor(camX / tileUnitPx) - 1);
      const maxCol = Math.min(tilesW - 1, Math.ceil((camX + viewportWorldW) / tileUnitPx) + 1);
      const minRow = Math.max(0, Math.floor(camY / tileUnitPx) - 1);
      const maxRow = Math.min(tilesH - 1, Math.ceil((camY + viewportWorldH) / tileUnitPx) + 1);

      // Update Projectiles & Pickups
      projectilePhysics.updateBoomerangs(px, py, handleItemPickup);
      projectilePhysics.updateDroppedItems(px, py, handleItemPickup);

      // Build active object collision boxes (Props & World Wall Boundaries)
      const activeObjectCollisionBoxes: ObjectCollisionBox[] = [
        ...propsRef.current
          .filter(pr => !pr.destroyed)
          .map(pr => ({
            id: pr.id,
            x: pr.x,
            y: pr.y,
            width: 18,
            height: 18,
            isSolid: true,
            isBreakable: true,
            causesBoomerangReturn: false,
            boomerangCrushThrough: true
          })),
        {
          id: 'bound_top',
          x: mapWorldWidth / 2,
          y: 12,
          width: mapWorldWidth,
          height: 24,
          isSolid: true,
          isBreakable: false,
          causesBoomerangReturn: true,
          boomerangCrushThrough: false
        },
        {
          id: 'bound_bottom',
          x: mapWorldWidth / 2,
          y: mapWorldHeight - 12,
          width: mapWorldWidth,
          height: 24,
          isSolid: true,
          isBreakable: false,
          causesBoomerangReturn: true,
          boomerangCrushThrough: false
        },
        {
          id: 'bound_left',
          x: 12,
          y: mapWorldHeight / 2,
          width: 24,
          height: mapWorldHeight,
          isSolid: true,
          isBreakable: false,
          causesBoomerangReturn: true,
          boomerangCrushThrough: false
        },
        {
          id: 'bound_right',
          x: mapWorldWidth - 12,
          y: mapWorldHeight / 2,
          width: 24,
          height: mapWorldHeight,
          isSolid: true,
          isBreakable: false,
          causesBoomerangReturn: true,
          boomerangCrushThrough: false
        }
      ];

      // Check Boomerang collision with world objects & solid walls
      projectilePhysics.checkBoomerangObjectCollisions(
        activeObjectCollisionBoxes,
        (hitObj) => {
          // Breakable object hit: crush through & destroy prop, spawn drop
          const hitProp = propsRef.current.find(pr => pr.id === hitObj.id);
          if (hitProp && !hitProp.destroyed) {
            hitProp.destroyed = true;
            soundEngine.playHitSFX();
            screenEffects.triggerShake(4, 0.15);
            projectilePhysics.spawnDrop(hitProp.x, hitProp.y);
          }
        },
        (_b) => {
          // Solid non-breakable obstacle or boundary wall hit: bounce & return early!
          soundEngine.playHitSFX();
          screenEffects.triggerShake(3, 0.1);
        }
      );

      // Check Boomerang hit against enemies
      projectilePhysics.boomerangs.forEach(b => {
        enemiesRef.current = enemiesRef.current.map(e => {
          if (e.hp > 0 && physicsEngine.checkAABBRaw(b.x - 8, b.y - 8, 16, 16, e.x - 10, e.y - 10, 20, 20)) {
            soundEngine.playHitSFX();
            const newHp = Math.max(0, e.hp - 15);
            if (newHp === 0) projectilePhysics.spawnDrop(e.x, e.y);
            const kb = physicsEngine.calculateKnockbackVector(b.x, b.y, e.x, e.y, 6.0);
            return { ...e, hp: newHp, hurtTime: 10, knockback: kb };
          }
          return e;
        });
      });

      // Auto-trigger opening dialogue when walking up to Ganon
      if (
        bejsonEngine.currentLevelSlug === 'ganon_sanctuary' &&
        !openingTriggeredRef.current &&
        bejsonEngine.playerY <= 300
      ) {
        openingTriggeredRef.current = true;
        const evt = bejsonEngine.triggerOpeningCutscene();
        if (evt) {
          soundEngine.playDarkAuraSFX();
          onTriggerDialogue(evt);
        }
      }

      // Check level transition portals
      const portals = bejsonEngine.getPortalsForLevel(bejsonEngine.currentLevelSlug);
      portals.forEach(port => {
        const portPxX = port.sourceX * tileUnitPx;
        const portPxY = port.sourceY * tileUnitPx;
        if (physicsEngine.checkAABBRaw(px - 10, py - 10, 20, 20, portPxX - 12, portPxY - 12, 24, 24)) {
          bejsonEngine.switchLevelByUuid(port.targetLvlUuid, port.targetX, port.targetY);
          syncEnemiesForLevel(bejsonEngine.currentLevelSlug);
          soundEngine.playChimeSFX();
        }
      });

      // Update Other Projectiles
      otherProjectilesRef.current = otherProjectilesRef.current
        .map(p => {
          const nx = p.x + p.vx;
          const ny = p.y + p.vy;
          const nt = p.timer - 1;

          if (p.type === 'bomb' && nt === 0) {
            soundEngine.playHitSFX();
            enemiesRef.current = enemiesRef.current.map(e => {
              if (physicsEngine.checkAABBRaw(p.x - 30, p.y - 30, 60, 60, e.x - 10, e.y - 10, 20, 20)) {
                const newHp = Math.max(0, e.hp - 50);
                if (newHp === 0) projectilePhysics.spawnDrop(e.x, e.y);
                const kb = physicsEngine.calculateKnockbackVector(p.x, p.y, e.x, e.y, 16.0);
                return { ...e, hp: newHp, hurtTime: 15, knockback: kb };
              }
              return e;
            });
            propsRef.current = propsRef.current.map(pr => {
              if (physicsEngine.checkAABBRaw(p.x - 30, p.y - 30, 60, 60, pr.x - 10, pr.y - 10, 20, 20)) {
                projectilePhysics.spawnDrop(pr.x, pr.y);
                return { ...pr, destroyed: true };
              }
              return pr;
            });
          }

          if (p.type === 'arrow') {
            enemiesRef.current = enemiesRef.current.map(e => {
              if (e.hp > 0 && physicsEngine.checkAABBRaw(nx - 4, ny - 4, 8, 8, e.x - 10, e.y - 10, 20, 20)) {
                soundEngine.playHitSFX();
                const newHp = Math.max(0, e.hp - 20);
                if (newHp === 0) projectilePhysics.spawnDrop(e.x, e.y);
                const kb = physicsEngine.calculateKnockbackVector(p.x, p.y, e.x, e.y, 8.0);
                return { ...e, hp: newHp, hurtTime: 10, knockback: kb };
              }
              return e;
            });
          }

          return { ...p, x: nx, y: ny, timer: nt };
        })
        .filter(p => p.timer > 0);

      // Update Enemy AI & Vector Knockback
      enemiesRef.current = enemiesRef.current.map(e => {
        if (e.hp <= 0) return e;

        // Apply Enemy Knockback & Friction
        let ex = e.x + e.knockback.vx;
        let ey = e.y + e.knockback.vy;
        physicsEngine.applyFriction(e.knockback, 0.82);

        // AI Chasing logic when not heavily knocked back
        const dist = Math.hypot(bejsonEngine.playerX - ex, bejsonEngine.playerY - ey);
        if (Math.hypot(e.knockback.vx, e.knockback.vy) < 0.5 && dist < 180 && dist > 18) {
          const eSpeed = e.type === 'guard' ? 1.4 : 0.9;
          ex += ((bejsonEngine.playerX - ex) / dist) * eSpeed;
          ey += ((bejsonEngine.playerY - ey) / dist) * eSpeed;
        }

        // Check AABB collision with player to deal damage & trigger player knockback
        const hitPlayer = physicsEngine.checkAABBRaw(ex - 8, ey - 8, 16, 16, px - 8, py - 8, 16, 16);
        if (hitPlayer && playerHurtRef.current <= 0) {
          bejsonEngine.playerHp = Math.max(0, bejsonEngine.playerHp - e.attack);
          soundEngine.playPlayerHurtSFX();
          screenEffects.triggerShake(10, 0.35);
          screenEffects.triggerFlash('#DE2626', 0.55, 0.25);
          playerHurtRef.current = 24; // Invincibility frames

          // Vector knockback on player away from enemy
          playerKnockbackRef.current = physicsEngine.calculateKnockbackVector(ex, ey, px, py, 9.0);
        }

        return {
          ...e,
          x: Math.max(20, Math.min(mapWorldWidth - 20, ex)),
          y: Math.max(20, Math.min(mapWorldHeight - 20, ey)),
          hurtTime: Math.max(0, e.hurtTime - 1)
        };
      });

      // Decrement sword cooldown
      if (swordCooldownRef.current > 0) {
        swordCooldownRef.current--;
      }

      // Clear Canvas Background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // BEGIN WORLD TRANSFORM (CAMERA VIEWPORT CONTEXT)
      ctx.save();
      ctx.scale(zoomScale, zoomScale);
      ctx.translate(-camX, -camY);

      const isSanctuary = bejsonEngine.currentLevelSlug === 'ganon_sanctuary';

      // 1. TERRAIN BACKGROUND TILE GRID RENDERING
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const tx = c * tileUnitPx;
          const ty = r * tileUnitPx;
          const isBoundary = r === 0 || r === tilesH - 1 || c === 0 || c === tilesW - 1;

          if (isBoundary) {
            ctx.fillStyle = isSanctuary ? '#1f1924' : '#1c281e';
            ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);

            ctx.fillStyle = isSanctuary ? '#2d2436' : '#2d4232';
            ctx.fillRect(tx + 2, ty + 2, tileUnitPx - 4, 12);
            ctx.fillRect(tx + 2, ty + 18, tileUnitPx - 4, 12);

            ctx.strokeStyle = isSanctuary ? '#110c17' : '#0f1710';
            ctx.lineWidth = 1;
            ctx.strokeRect(tx, ty, tileUnitPx, tileUnitPx);
          } else if (bejsonEngine.currentLevelSlug === 'debug_chamber') {
            const isHallway = (c >= 30 && c <= 33) || (r >= 30 && r <= 33);
            if (isHallway) {
              // Cobblestone Hallway Walkway
              const altWay = (r + c) % 2 === 0;
              ctx.fillStyle = altWay ? '#52525b' : '#3f3f46';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
              ctx.strokeStyle = '#27272a';
              ctx.lineWidth = 0.5;
              ctx.strokeRect(tx, ty, tileUnitPx, tileUnitPx);
            } else if (c < 30 && r < 30) {
              // Zone A: Dark Grassland Biome
              const alt = (r + c) % 2 === 0;
              ctx.fillStyle = alt ? '#2e7d32' : '#256628';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
            } else if (c > 33 && r < 30) {
              // Zone B: Obsidian Sanctuary Biome
              const alt = (r + c) % 2 === 0;
              ctx.fillStyle = alt ? '#26262a' : '#1e1e22';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
              ctx.strokeStyle = '#333338';
              ctx.lineWidth = 0.5;
              ctx.strokeRect(tx + 1, ty + 1, tileUnitPx - 2, tileUnitPx - 2);
            } else if (c < 30 && r > 33) {
              // Zone C: Subterranean Cavern Biome
              const alt = (r + c) % 2 === 0;
              ctx.fillStyle = alt ? '#3f3f46' : '#27272a';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
            } else {
              // Zone D: Gerudo Dark Sands Biome
              const alt = (r + c) % 2 === 0;
              ctx.fillStyle = alt ? '#b45309' : '#92400e';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
            }
          } else if (isSanctuary) {
            const isCenterCarpet = c >= 14 && c <= 17;
            if (isCenterCarpet) {
              ctx.fillStyle = '#991b1b';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);

              ctx.fillStyle = '#7f1d1d';
              ctx.fillRect(tx + 4, ty + 4, tileUnitPx - 8, tileUnitPx - 8);

              if (c === 14) {
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(tx, ty, 3, tileUnitPx);
              }
              if (c === 17) {
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(tx + tileUnitPx - 3, ty, 3, tileUnitPx);
              }
            } else {
              const alt = (r + c) % 2 === 0;
              ctx.fillStyle = alt ? '#26262a' : '#1e1e22';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);

              ctx.strokeStyle = '#333338';
              ctx.lineWidth = 1;
              ctx.strokeRect(tx + 1, ty + 1, tileUnitPx - 2, tileUnitPx - 2);
            }
          } else {
            const altGrass = (r + c) % 2 === 0;
            ctx.fillStyle = altGrass ? '#2e7d32' : '#256628';
            ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);

            const seed = (r * 31 + c * 17) % 5;
            ctx.fillStyle = '#4caf50';
            if (seed === 0) {
              ctx.fillRect(tx + 6, ty + 8, 2, 6);
              ctx.fillRect(tx + 10, ty + 6, 2, 8);
            } else if (seed === 1) {
              ctx.fillRect(tx + 18, ty + 10, 2, 7);
            } else if (seed === 2) {
              ctx.fillStyle = '#DE2626';
              ctx.fillRect(tx + 14, ty + 14, 2, 2);
            }
          }
        }
      }

      // 2. CONSTRUCT Y-SORTED DRAW QUEUE (2.5D DEPTH SORTING FROM TOP TO BOTTOM)
      const renderQueue: RenderableEntity[] = [];

      // Add Props
      propsRef.current.forEach(pr => {
        if (!pr.destroyed) {
          renderQueue.push({ sortY: pr.y + 6, type: 'prop', data: pr });
        }
      });

      // Add Dropped Items
      projectilePhysics.droppedItems.forEach(item => {
        renderQueue.push({ sortY: item.y, type: 'item', data: item });
      });

      // Add Portals
      const levelPortals = bejsonEngine.getPortalsForLevel(bejsonEngine.currentLevelSlug);
      levelPortals.forEach(port => {
        renderQueue.push({ sortY: port.sourceY * tileUnitPx, type: 'portal', data: port });
      });

      // Add Ganon Sanctuary Boss Throne
      if (isSanctuary) {
        renderQueue.push({ sortY: 150, type: 'ganon', data: null });
      }

      // Add Enemies
      enemiesRef.current.forEach(e => {
        if (e.hp > 0) {
          renderQueue.push({ sortY: e.y + 10, type: 'enemy', data: e });
        }
      });

      // Add Projectiles
      otherProjectilesRef.current.forEach(p => {
        renderQueue.push({ sortY: p.y, type: 'projectile', data: p });
      });

      // Add Player (Shadow Link)
      renderQueue.push({ sortY: py + 8, type: 'player', data: null });

      // SORT DRAW QUEUE BY Y COORDINATE (Top-to-Bottom Render Order)
      renderQueue.sort((a, b) => a.sortY - b.sortY);

      // 3. EXECUTE Y-SORTED RENDERING
      renderQueue.forEach(item => {
        if (item.type === 'prop') {
          const pr: DestructibleProp = item.data;
          if (pr.x < camX - 20 || pr.x > camX + viewportWorldW + 20 || pr.y < camY - 20 || pr.y > camY + viewportWorldH + 20) return;

          if (pr.type === 'pedestal') {
            // Golden Item Testing Pedestal Base
            ctx.fillStyle = '#09090b';
            ctx.fillRect(pr.x - 14, pr.y - 2, 28, 12);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(pr.x - 12, pr.y - 12, 24, 10);
            ctx.strokeStyle = '#DE2626';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(pr.x - 12, pr.y - 12, 24, 10);

            // Floating Item Icon
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(pr.icon || '🪃', pr.x, pr.y - 16);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px monospace';
            ctx.fillText(pr.title || 'ITEM', pr.x, pr.y + 18);
          } else if (pr.type === 'pot') {
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.arc(pr.x, pr.y + 1, 9, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(pr.x - 2, pr.y - 1, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#78350f';
            ctx.fillRect(pr.x - 7, pr.y - 7, 14, 3);
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(pr.x - 4, pr.y - 6, 3, 2);
          } else {
            ctx.fillStyle = '#14532d';
            ctx.beginPath();
            ctx.arc(pr.x, pr.y + 2, 11, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(pr.x - 2, pr.y - 1, 9, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(pr.x - 4, pr.y - 3, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ef4444';
            ctx.fillRect(pr.x + 3, pr.y - 2, 2, 2);
            ctx.fillRect(pr.x - 5, pr.y + 3, 2, 2);
          }
        } else if (item.type === 'item') {
          const drop: DroppedItem = item.data;
          if (drop.x < camX - 20 || drop.x > camX + viewportWorldW + 20 || drop.y < camY - 20 || drop.y > camY + viewportWorldH + 20) return;

          if (drop.type === 'rupee') {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y - 7);
            ctx.lineTo(drop.x + 5, drop.y);
            ctx.lineTo(drop.x, drop.y + 7);
            ctx.lineTo(drop.x - 5, drop.y);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#a7f3d0';
            ctx.fillRect(drop.x - 1, drop.y - 4, 2, 4);
          } else if (drop.type === 'heart') {
            ctx.fillStyle = '#DE2626';
            ctx.beginPath();
            ctx.arc(drop.x - 3, drop.y - 2, 3, 0, Math.PI * 2);
            ctx.arc(drop.x + 3, drop.y - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(drop.x - 6, drop.y - 1);
            ctx.lineTo(drop.x, drop.y + 6);
            ctx.lineTo(drop.x + 6, drop.y - 1);
            ctx.fill();
          } else if (drop.type === 'bomb') {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(drop.x, drop.y, 5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(drop.x - 2, drop.y - 5, 4, 10);
          }
        } else if (item.type === 'portal') {
          const port = item.data;
          const portPx = port.sourceX * tileUnitPx;
          const portPy = port.sourceY * tileUnitPx;
          ctx.fillStyle = '#DE2626';
          ctx.beginPath();
          ctx.arc(portPx, portPy, 10 + Math.sin(tick * 0.2) * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '8px Source Code Pro';
          ctx.fillText('PORTAL', portPx - 18, portPy - 14);
        } else if (item.type === 'ganon') {
          // Throne Platform
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(470, 110, 84, 50);
          ctx.fillStyle = '#f59e0b';
          ctx.strokeRect(470, 110, 84, 50);

          // Torch Flames
          [440, 584].forEach(torchX => {
            ctx.fillStyle = '#334155';
            ctx.fillRect(torchX - 6, 120, 12, 24);
            ctx.fillStyle = tick % 10 < 5 ? '#f97316' : '#ef4444';
            ctx.beginPath();
            ctx.arc(torchX, 114, 6, 0, Math.PI * 2);
            ctx.fill();
          });

          // GANON Demon Pig King
          const gx = 512;
          const gy = 135;

          ctx.fillStyle = '#991b1b';
          ctx.fillRect(gx - 20, gy - 10, 40, 30);
          ctx.fillStyle = '#312e81';
          ctx.fillRect(gx - 14, gy - 8, 28, 24);

          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(gx - 18, gy - 12, 8, 8);
          ctx.fillRect(gx + 10, gy - 12, 8, 8);

          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(gx, gy - 16, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#4338ca';
          ctx.fillRect(gx - 5, gy - 14, 10, 6);

          ctx.fillStyle = '#ef4444';
          ctx.fillRect(gx - 7, gy - 19, 4, 3);
          ctx.fillRect(gx + 3, gy - 19, 4, 3);

          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(gx - 22, gy - 26, 3, 42);
        } else if (item.type === 'enemy') {
          const e: EnemyState = item.data;
          if (e.x < camX - 20 || e.x > camX + viewportWorldW + 20 || e.y < camY - 20 || e.y > camY + viewportWorldH + 20) return;

          if (e.type === 'slime') {
            const squish = Math.sin(tick * 0.2) * 2;
            ctx.fillStyle = e.hurtTime > 0 ? '#ffffff' : '#16a34a';
            ctx.beginPath();
            ctx.ellipse(e.x, e.y, 11 + squish, 9 - squish, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#86efac';
            ctx.fillRect(e.x - 4, e.y - 5, 3, 3);

            ctx.fillStyle = '#000000';
            ctx.fillRect(e.x - 5, e.y - 1, 3, 3);
            ctx.fillRect(e.x + 2, e.y - 1, 3, 3);
          } else {
            ctx.fillStyle = e.hurtTime > 0 ? '#ffffff' : '#2563eb';
            ctx.fillRect(e.x - 10, e.y - 10, 20, 20);

            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(e.x - 8, e.y - 14, 16, 8);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(e.x - 6, e.y - 11, 12, 2);

            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(e.x + 10, e.y - 16, 2, 28);
          }

          // HP Bar
          ctx.fillStyle = '#18181b';
          ctx.fillRect(e.x - 12, e.y - 20, 24, 3);
          ctx.fillStyle = '#DE2626';
          ctx.fillRect(e.x - 12, e.y - 20, (e.hp / e.maxHp) * 24, 3);
        } else if (item.type === 'projectile') {
          const p: OtherProjectile = item.data;
          if (p.type === 'arrow') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(p.x - 2, p.y - 2, 5, 5);
          } else if (p.type === 'bomb') {
            ctx.fillStyle = tick % 10 < 5 ? '#DE2626' : '#18181b';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (item.type === 'player') {
          // =========================================================================
          // SHADOW LINK SPRITE RENDERING (STRICT PALETTE: #000000, #FFFFFF, #DE2626)
          // =========================================================================
          const isSlashing = slashAnimRef.current && slashAnimRef.current.timer > 0;
          const isSpinning = spinAnimRef.current && spinAnimRef.current.timer > 0;
          const isSwordActive = isSlashing || isChargingRef.current || isSpinning;

          // =========================================================================
          // SHADOW LINK DIRECTIONAL LAYER ORDER (SWORD OVER BODY WHEN FACING RIGHT/DOWN)
          // =========================================================================
          const facing = bejsonEngine.playerFacing;
          const isSheathed = isSheathedRef.current;
          const isSwordOverBody = facing === 'RIGHT' || facing === 'DOWN';

          // Helper: Render Sword Slash Arc
          const renderSwordSlash = () => {
            if (slashAnimRef.current && slashAnimRef.current.timer > 0) {
              const anim = slashAnimRef.current;
              const maxT = anim.maxTimer || 14;
              const progress = 1 - anim.timer / maxT;
              const varIdx = anim.variation ?? 0;

              let baseAngle = Math.PI / 2;
              if (anim.dir === 'UP') baseAngle = -Math.PI / 2;
              if (anim.dir === 'LEFT') baseAngle = Math.PI;
              if (anim.dir === 'RIGHT') baseAngle = 0;

              // 3 Variations of Sweep Angle and Blade Extension
              let sweepSpan = Math.PI * 1.15;
              let extensionBonus = 3;
              if (varIdx === 1) {
                sweepSpan = Math.PI * 0.9;
                extensionBonus = 5;
              } else if (varIdx === 2) {
                sweepSpan = Math.PI * 1.3;
                extensionBonus = 2;
              }

              const startAngle = baseAngle - sweepSpan * 0.5;
              const currentSweep = (progress - 0.5) * sweepSpan;
              const currentBladeAngle = baseAngle + currentSweep;

              const bladeLength = 28 + extensionBonus;
              const bladeX = px + Math.cos(currentBladeAngle) * bladeLength;
              const bladeY = py + Math.sin(currentBladeAngle) * bladeLength;

              // 1. Dynamic Crescent Trail
              const trailStartAngle = Math.max(startAngle, currentBladeAngle - Math.PI * 0.55);
              ctx.fillStyle = varIdx === 1 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(222, 38, 38, 0.4)';
              ctx.beginPath();
              ctx.arc(px, py, bladeLength + 2, trailStartAngle, currentBladeAngle);
              ctx.lineTo(px, py);
              ctx.closePath();
              ctx.fill();

              // 2. White Blade Core
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(bladeX, bladeY);
              ctx.stroke();

              // 3. Dark Crimson Edge Aura (#DE2626)
              ctx.strokeStyle = '#DE2626';
              ctx.lineWidth = 5;
              ctx.beginPath();
              ctx.moveTo(px + Math.cos(currentBladeAngle) * 5, py + Math.sin(currentBladeAngle) * 5);
              ctx.lineTo(bladeX, bladeY);
              ctx.stroke();

              // 4. Blade Tip Spark
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(bladeX - 1.5, bladeY - 1.5, 3, 3);
            }
          };

          // Helper: Render Obsidian Shield
          const renderObsidianShield = () => {
            if (isSheathed) {
              // SHEATHED: Shield is mounted on Link's back
              if (facing === 'UP') {
                // Looking away (UP) while sheathed: We see the FRONT of the shield mounted on Link's back
                const sW = 12;
                const sH = 15;
                const sX = px - 6;
                const sY = py - 8;

                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.moveTo(sX, sY);
                ctx.lineTo(sX + sW, sY);
                ctx.lineTo(sX + sW, sY + sH - 4);
                ctx.lineTo(sX + sW / 2, sY + sH);
                ctx.lineTo(sX, sY + sH - 4);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#DE2626';
                ctx.beginPath();
                ctx.moveTo(sX + 2, sY + 3);
                ctx.lineTo(sX + sW - 2, sY + 3);
                ctx.lineTo(sX + sW / 2, sY + sH - 3);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(sX + 4, sY + 5);
                ctx.lineTo(sX + sW - 4, sY + 5);
                ctx.lineTo(sX + sW / 2, sY + sH - 5);
                ctx.closePath();
                ctx.fill();
              } else if (facing === 'LEFT' || facing === 'RIGHT') {
                // Sheathed side profile on back
                const sX = facing === 'LEFT' ? px - 10 : px + 2;
                const sY = py - 7;
                const sW = 4;
                const sH = 14;

                ctx.fillStyle = '#000000';
                ctx.fillRect(sX, sY, sW, sH);

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(sX, sY, 1.5, sH);

                ctx.fillStyle = '#DE2626';
                ctx.fillRect(sX + 1, sY + 3, 2, sH - 6);
              }
              // When facing DOWN and sheathed, shield is on back behind torso (hidden)
            } else {
              // UNSHEATHED: Shield is held in Link's hand (NOT on back!)
              if (facing === 'UP') {
                // Facing away (UP) while holding shield in hand:
                // Held in left hand sticking out to side, showing back of shield texture
                const sW = 10;
                const sH = 14;
                const sX = px - 14;
                const sY = py - 4;

                // Solid Black Back Texture
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.moveTo(sX, sY);
                ctx.lineTo(sX + sW, sY);
                ctx.lineTo(sX + sW, sY + sH - 3);
                ctx.lineTo(sX + sW / 2, sY + sH);
                ctx.lineTo(sX, sY + sH - 3);
                ctx.closePath();
                ctx.fill();

                // Crisp White Rim
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.2;
                ctx.stroke();

                // Dark Grey Handle Straps & Crimson Central Grip
                ctx.fillStyle = '#27272a';
                ctx.fillRect(sX + 2, sY + 3, sW - 4, 3);
                ctx.fillRect(sX + 2, sY + 8, sW - 4, 2);

                ctx.fillStyle = '#DE2626';
                ctx.fillRect(sX + sW / 2 - 1, sY + 3, 2, 3);
              } else if (facing === 'LEFT' || facing === 'RIGHT') {
                // Side Profile in Hand
                const sX = facing === 'LEFT' ? px - 11 : px + 7;
                const sY = py - 4;
                const sW = 4;
                const sH = 14;

                ctx.fillStyle = '#000000';
                ctx.fillRect(sX, sY, sW, sH);

                ctx.fillStyle = '#ffffff';
                if (facing === 'LEFT') {
                  ctx.fillRect(sX, sY, 1.5, sH);
                } else {
                  ctx.fillRect(sX + sW - 1.5, sY, 1.5, sH);
                }

                ctx.fillStyle = '#DE2626';
                ctx.fillRect(sX + 1, sY + 3, 2, sH - 6);

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(sX + 1, sY + 6, 2, 2);
              } else {
                // FRONT VIEW (DOWN) - Shield in hand facing camera
                const sW = 12;
                const sH = 15;
                const sX = px - 14;
                const sY = py - 3;

                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.moveTo(sX, sY);
                ctx.lineTo(sX + sW, sY);
                ctx.lineTo(sX + sW, sY + sH - 4);
                ctx.lineTo(sX + sW / 2, sY + sH);
                ctx.lineTo(sX, sY + sH - 4);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#DE2626';
                ctx.beginPath();
                ctx.moveTo(sX + 2, sY + 3);
                ctx.lineTo(sX + sW - 2, sY + 3);
                ctx.lineTo(sX + sW / 2, sY + sH - 3);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(sX + 4, sY + 5);
                ctx.lineTo(sX + sW - 4, sY + 5);
                ctx.lineTo(sX + sW / 2, sY + sH - 5);
                ctx.closePath();
                ctx.fill();
              }
            }
          };

          const shieldSlot = isSheathed ? 'BACK_MOUNT' : 'LEFT_HAND';
          const shieldLayerOrder = spritePerspectiveEngine.determineEquipmentLayer(facing, shieldSlot, isSheathed);

          // 1. IF BEHIND BODY: Render Shield FIRST so Player Body is rendered OVER the Shield
          if (shieldLayerOrder === 'BEHIND_BODY') {
            renderObsidianShield();
          }

          // 2. IF FACING LEFT OR UP: Render Sword BEHIND Body
          if (!isSwordOverBody) {
            renderSwordSlash();
          }

          // 3. RENDER SHADOW LINK BODY (Boots, Tunic, Belt, Sheath, Cap, Face)
          const isHurt = playerHurtRef.current > 0 && Math.floor(playerHurtRef.current / 3) % 2 === 0;
          const legBob = isMoving ? Math.sin(tick * 0.4) * 2.5 : 0;

          // Dark Boots (#000000)
          ctx.fillStyle = isHurt ? '#ffffff' : '#000000';
          ctx.fillRect(px - 7 + legBob, py + 10, 5, 5);
          ctx.fillRect(px + 2 - legBob, py + 10, 5, 5);

          // Dark Tunic & Belt (#000000 tunic, #DE2626 belt buckle)
          ctx.fillStyle = isHurt ? '#ffffff' : '#000000';
          ctx.fillRect(px - 9, py - 10, 18, 20);

          ctx.fillStyle = '#000000';
          ctx.fillRect(px - 9, py, 18, 4);
          ctx.fillStyle = '#DE2626'; // Subtle red buckle
          ctx.fillRect(px - 3, py, 6, 4);

          // Dark Sheath & Sword Hilt on back (ONLY visible when sheathed & sword is NOT active)
          if (!isSwordActive && isSheathed) {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            if (facing === 'RIGHT') {
              ctx.moveTo(px - 4, py - 18);
              ctx.lineTo(px - 14, py + 4);
              ctx.lineTo(px - 11, py + 5);
              ctx.lineTo(px - 1, py - 17);
            } else {
              ctx.moveTo(px + 4, py - 18);
              ctx.lineTo(px + 14, py + 4);
              ctx.lineTo(px + 11, py + 5);
              ctx.lineTo(px + 1, py - 17);
            }
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#DE2626';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Sword Hilt Poking Out Above Shoulder
            ctx.fillStyle = '#ffffff';
            if (facing === 'RIGHT') {
              ctx.fillRect(px - 8, py - 22, 6, 3);
              ctx.fillRect(px - 6, py - 25, 2, 4);
              ctx.fillStyle = '#DE2626';
              ctx.fillRect(px - 7, py - 21, 4, 2);
            } else {
              ctx.fillRect(px + 2, py - 22, 6, 3);
              ctx.fillRect(px + 4, py - 25, 2, 4);
              ctx.fillStyle = '#DE2626';
              ctx.fillRect(px + 3, py - 21, 4, 2);
            }
          }

          // Shadow Cap (#000000 pure black with subtle #DE2626 red fold)
          ctx.fillStyle = isHurt ? '#ffffff' : '#000000';
          ctx.fillRect(px - 10, py - 16, 20, 8);
          ctx.fillStyle = '#DE2626';
          if (facing === 'LEFT') {
            ctx.fillRect(px + 2, py - 18, 8, 4);
          } else if (facing === 'RIGHT') {
            ctx.fillRect(px - 10, py - 18, 8, 4);
          } else {
            ctx.fillRect(px - 4, py - 19, 8, 4);
          }

          // Dark Face & Crimson Eyes with White Pupil Highlight Speck
          ctx.fillStyle = '#000000';
          ctx.fillRect(px - 8, py - 9, 16, 7);

          ctx.fillStyle = '#DE2626';
          if (facing === 'DOWN') {
            ctx.fillRect(px - 6, py - 7, 4, 3);
            ctx.fillRect(px + 2, py - 7, 4, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px - 5, py - 6, 2, 1);
            ctx.fillRect(px + 3, py - 6, 2, 1);
          } else if (facing === 'LEFT') {
            ctx.fillRect(px - 7, py - 7, 4, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px - 6, py - 6, 2, 1);
          } else if (facing === 'RIGHT') {
            ctx.fillRect(px + 3, py - 7, 4, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 4, py - 6, 2, 1);
          }

          // 4. IF IN FRONT BODY: Render Shield AFTER Body
          if (shieldLayerOrder === 'IN_FRONT_BODY') {
            renderObsidianShield();
          }

          // 5. IF FACING RIGHT OR DOWN: Render Sword ON TOP / OVER Body
          if (isSwordOverBody) {
            renderSwordSlash();
          }

          // Decrement slash timer
          if (slashAnimRef.current && slashAnimRef.current.timer > 0) {
            slashAnimRef.current.timer--;
          }

          // Spin Attack Animation
          if (spinAnimRef.current && spinAnimRef.current.timer > 0) {
            const anim = spinAnimRef.current;
            const maxT = anim.maxTimer || 18;
            const progress = 1 - anim.timer / maxT;

            const spinAngle = progress * Math.PI * 4;
            const bladeLength = 32;
            const bladeX = px + Math.cos(spinAngle) * bladeLength;
            const bladeY = py + Math.sin(spinAngle) * bladeLength;

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(bladeX, bladeY);
            ctx.stroke();

            ctx.strokeStyle = '#DE2626';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(px, py, 38 + progress * 16, 0, Math.PI * 2);
            ctx.stroke();

            spinAnimRef.current.timer--;
          }

          // Charging Sparks
          if (isChargingRef.current && !isSlashing && !isSpinning) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + Math.sin(tick * 0.5) * 14, py + Math.cos(tick * 0.5) * 14, 4, 4);
            ctx.fillStyle = '#DE2626';
            ctx.fillRect(px - Math.sin(tick * 0.5) * 14, py - Math.cos(tick * 0.5) * 14, 4, 4);
          }
        }
      });

      // Render Boomerang on top
      projectilePhysics.boomerangs.forEach(b => {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 1.5);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#DE2626';
        ctx.stroke();
        ctx.restore();
      });

      ctx.restore(); // END WORLD TRANSFORM

      // =========================================================================
      // AUTHENTIC OVERLAID CANVAS HUD (HEALTH, ACTIVE Y-ITEM, NUMBERS & COUNTERS)
      // =========================================================================
      const cW = canvas.width;

      ctx.fillStyle = 'rgba(9, 9, 11, 0.88)';
      ctx.fillRect(0, 0, cW, 38);
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, cW, 38);

      // 1. Active Y-Item Box
      const activeItem = shadowEngine.getActiveYItem();
      ctx.fillStyle = '#000000';
      ctx.fillRect(8, 4, 30, 30);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 4, 30, 30);

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.fillText(activeItem?.icon || '🪃', 13, 25);

      // 2. Magic Meter
      ctx.fillStyle = '#000000';
      ctx.fillRect(44, 4, 8, 30);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.strokeRect(44, 4, 8, 30);

      const magicFillRatio = bejsonEngine.magicPoints / bejsonEngine.maxMagicPoints;
      const fillH = Math.max(0, Math.floor(28 * magicFillRatio));
      ctx.fillStyle = '#10b981';
      ctx.fillRect(45, 33 - fillH, 6, fillH);

      // 3. Numbers & Counters
      ctx.font = '9px Press Start 2P, monospace';

      // Rupees
      ctx.fillStyle = '#10b981';
      ctx.fillText(`💎${shadowEngine.rupees}`, 58, 16);

      // Bombs
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`💣${shadowEngine.bombs}`, 125, 16);

      // Arrows
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`🏹${shadowEngine.arrows}`, 58, 30);

      // Keys
      ctx.fillStyle = '#eab308';
      ctx.fillText(`🔑${shadowEngine.smallKeys}`, 125, 30);

      // 4. Life Hearts Header & Containers
      ctx.fillStyle = '#DE2626';
      ctx.font = '9px Press Start 2P, monospace';
      ctx.fillText('-LIFE-', cW - 160, 14);

      const maxHp = bejsonEngine.playerMaxHp;
      const currentHp = bejsonEngine.playerHp;
      const totalHearts = Math.ceil(maxHp / 20);
      const fullHearts = Math.floor(currentHp / 20);
      const hasHalfHeart = currentHp % 20 >= 10;

      const heartStartX = cW - 160;
      const heartStartY = 20;

      for (let i = 0; i < totalHearts; i++) {
        const hX = heartStartX + (i % 8) * 18;
        const hY = heartStartY + Math.floor(i / 8) * 12;

        if (i < fullHearts) {
          ctx.fillStyle = '#DE2626';
          ctx.beginPath();
          ctx.arc(hX + 3, hY + 3, 3, 0, Math.PI * 2);
          ctx.arc(hX + 9, hY + 3, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(hX, hY + 4);
          ctx.lineTo(hX + 6, hY + 11);
          ctx.lineTo(hX + 12, hY + 4);
          ctx.fill();
        } else if (i === fullHearts && hasHalfHeart) {
          ctx.fillStyle = '#f87171';
          ctx.fillRect(hX + 2, hY + 2, 8, 8);
        } else {
          ctx.fillStyle = '#27272a';
          ctx.fillRect(hX + 2, hY + 2, 8, 8);
        }
      }

      // Render Screen Effects (Flash, Fade, Letterboxing overlays)
      screenEffects.renderCanvasOverlay(ctx, canvas.width, canvas.height);

      animId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [syncEnemiesForLevel, onTriggerDialogue, executeWhirlingBlade, handleItemPickup]);

  return (
    <div className="relative w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-2 overflow-y-auto">
      {/* HTML5 Pixel Canvas with Overlaid HUD - Maximized Viewport */}
      <div className="relative border-4 border-zinc-800 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(222,38,38,0.4)] bg-black w-full max-w-xl aspect-square flex items-center justify-center max-h-[62vh]">
        <canvas
          ref={canvasRef}
          width={448}
          height={448}
          className="w-full h-full image-rendering-pixelated cursor-crosshair"
        />

        {/* CRT Scanline Overlay */}
        {crtEnabled && (
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
        )}
      </div>

      {/* Retro Gamepad Deck directly below Canvas with 360° Analog Joystick & Shadow Engine Controls */}
      <GamepadDeck
        onJoystickMove={handleJoystickMove}
        onButtonPressA={executeInteract}
        onButtonPressB={executeSwordSlash}
        onButtonPressY={executeYItem}
        onButtonPressX={onOpenWorldMap}
        onStartPress={onOpenInventory}
        onSelectPress={onOpenSettings}
      />
    </div>
  );
};
