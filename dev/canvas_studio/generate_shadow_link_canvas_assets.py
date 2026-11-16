#!/usr/bin/env python3
"""
Script: generate_shadow_link_canvas_assets.py
Description: Generates the complete pixel-art Canvas/SVG asset library for Shadow Link Awakening:
             character sprite sheets (Shadow Link, Ganon, Slime, Guard), 16x16 item textures,
             32x32 terrain tiles, and combat VFX animations.
Author: Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
License: PolyForm Noncommercial License 1.0.0
Release_Version: 300
"""

import os
import sys
import json
import asyncio
import logging
from pathlib import Path
from PIL import Image

from termux_playwright import async_playwright_termux, launch

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("ShadowLinkCanvasAssets")

REPO_ROOT = Path("/storage/emulated/0/Admin/Dev/Repos/Shadow_Link_Awakening")
PUBLIC_ASSETS = REPO_ROOT / "public" / "assets"
SPRITES_DIR = PUBLIC_ASSETS / "sprites"
ITEMS_DIR = PUBLIC_ASSETS / "items"
TILES_DIR = PUBLIC_ASSETS / "tiles"
VFX_DIR = PUBLIC_ASSETS / "vfx"

for d in [SPRITES_DIR, ITEMS_DIR, TILES_DIR, VFX_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# -----------------------------------------------------------------------------
# 1. CHARACTER SPRITE SHEETS (SVG Definitions)
# -----------------------------------------------------------------------------

def svg_shadow_link_sheet() -> str:
    """
    Shadow Link 4-Directional Walk Cycle Sheet: 128x128 px (4 cols x 4 rows, 32x32 per cell).
    Row 0: Down (Frames 0-3: Idle, Walk Left Leg, Neutral, Walk Right Leg)
    Row 1: Up (Frames 0-3)
    Row 2: Left (Frames 0-3)
    Row 3: Right (Frames 0-3)
    Colors: Black Tunic (#0A0A10), Vivid Red Belt Buckle & Eye Accents (#DE2626),
            Dark Violet Shadows (#161622), White Highlights (#FFFFFF).
    """
    return """<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;shape-rendering:crispEdges;">
  <rect width="128" height="128" fill="none"/>
  
  <!-- ROW 0: FACING DOWN (y=0..32) -->
  <!-- Col 0: Idle Down -->
  <g id="down_idle" transform="translate(0, 0)">
    <!-- Cap -->
    <polygon points="12,4 20,4 22,8 10,8" fill="#0E0E16"/>
    <rect x="8" y="8" width="16" height="5" fill="#0E0E16"/>
    <!-- Face & Crimson Eyes -->
    <rect x="10" y="13" width="12" height="5" fill="#1A1A26"/>
    <rect x="12" y="14" width="2" height="2" fill="#DE2626"/>
    <rect x="18" y="14" width="2" height="2" fill="#DE2626"/>
    <!-- Tunic & Belt -->
    <rect x="9" y="18" width="14" height="8" fill="#0A0A10"/>
    <rect x="9" y="21" width="14" height="2" fill="#050508"/>
    <rect x="15" y="21" width="2" height="2" fill="#DE2626"/>
    <!-- Boots -->
    <rect x="10" y="26" width="4" height="4" fill="#000000"/>
    <rect x="18" y="26" width="4" height="4" fill="#000000"/>
  </g>
  
  <!-- Col 1: Walk Down 1 (Left Leg Forward) -->
  <g id="down_walk_1" transform="translate(32, 0)">
    <polygon points="12,5 20,5 22,9 10,9" fill="#0E0E16"/>
    <rect x="8" y="9" width="16" height="5" fill="#0E0E16"/>
    <rect x="10" y="14" width="12" height="5" fill="#1A1A26"/>
    <rect x="12" y="15" width="2" height="2" fill="#DE2626"/>
    <rect x="18" y="15" width="2" height="2" fill="#DE2626"/>
    <rect x="9" y="19" width="14" height="8" fill="#0A0A10"/>
    <rect x="9" y="22" width="14" height="2" fill="#050508"/>
    <rect x="15" y="22" width="2" height="2" fill="#DE2626"/>
    <!-- Left boot step -->
    <rect x="10" y="27" width="4" height="4" fill="#000000"/>
    <rect x="18" y="25" width="4" height="4" fill="#000000"/>
  </g>

  <!-- Col 2: Neutral Down -->
  <g id="down_walk_2" transform="translate(64, 0)">
    <polygon points="12,4 20,4 22,8 10,8" fill="#0E0E16"/>
    <rect x="8" y="8" width="16" height="5" fill="#0E0E16"/>
    <rect x="10" y="13" width="12" height="5" fill="#1A1A26"/>
    <rect x="12" y="14" width="2" height="2" fill="#DE2626"/>
    <rect x="18" y="14" width="2" height="2" fill="#DE2626"/>
    <rect x="9" y="18" width="14" height="8" fill="#0A0A10"/>
    <rect x="9" y="21" width="14" height="2" fill="#050508"/>
    <rect x="15" y="21" width="2" height="2" fill="#DE2626"/>
    <rect x="10" y="26" width="4" height="4" fill="#000000"/>
    <rect x="18" y="26" width="4" height="4" fill="#000000"/>
  </g>

  <!-- Col 3: Walk Down 2 (Right Leg Forward) -->
  <g id="down_walk_3" transform="translate(96, 0)">
    <polygon points="12,5 20,5 22,9 10,9" fill="#0E0E16"/>
    <rect x="8" y="9" width="16" height="5" fill="#0E0E16"/>
    <rect x="10" y="14" width="12" height="5" fill="#1A1A26"/>
    <rect x="12" y="15" width="2" height="2" fill="#DE2626"/>
    <rect x="18" y="15" width="2" height="2" fill="#DE2626"/>
    <rect x="9" y="19" width="14" height="8" fill="#0A0A10"/>
    <rect x="9" y="22" width="14" height="2" fill="#050508"/>
    <rect x="15" y="22" width="2" height="2" fill="#DE2626"/>
    <!-- Right boot step -->
    <rect x="10" y="25" width="4" height="4" fill="#000000"/>
    <rect x="18" y="27" width="4" height="4" fill="#000000"/>
  </g>

  <!-- ROW 1: FACING UP (y=32..64) -->
  <g id="up_idle" transform="translate(0, 32)">
    <polygon points="12,4 20,4 24,9 8,9" fill="#0E0E16"/>
    <polygon points="10,9 22,9 20,16 12,16" fill="#0E0E16"/>
    <!-- Tunic Back -->
    <rect x="9" y="17" width="14" height="9" fill="#0A0A10"/>
    <rect x="9" y="21" width="14" height="2" fill="#050508"/>
    <!-- Back Sheath Anchor Slot -->
    <line x1="14" y1="14" x2="18" y2="24" stroke="#DE2626" stroke-width="1.5"/>
    <rect x="10" y="26" width="4" height="4" fill="#000000"/>
    <rect x="18" y="26" width="4" height="4" fill="#000000"/>
  </g>
  <g id="up_walk_1" transform="translate(32, 32)">
    <polygon points="12,5 20,5 24,10 8,10" fill="#0E0E16"/>
    <polygon points="10,10 22,10 20,17 12,17" fill="#0E0E16"/>
    <rect x="9" y="18" width="14" height="9" fill="#0A0A10"/>
    <rect x="9" y="22" width="14" height="2" fill="#050508"/>
    <line x1="14" y1="15" x2="18" y2="25" stroke="#DE2626" stroke-width="1.5"/>
    <rect x="10" y="27" width="4" height="4" fill="#000000"/>
    <rect x="18" y="25" width="4" height="4" fill="#000000"/>
  </g>
  <g id="up_walk_2" transform="translate(64, 32)">
    <polygon points="12,4 20,4 24,9 8,9" fill="#0E0E16"/>
    <polygon points="10,9 22,9 20,16 12,16" fill="#0E0E16"/>
    <rect x="9" y="17" width="14" height="9" fill="#0A0A10"/>
    <rect x="9" y="21" width="14" height="2" fill="#050508"/>
    <line x1="14" y1="14" x2="18" y2="24" stroke="#DE2626" stroke-width="1.5"/>
    <rect x="10" y="26" width="4" height="4" fill="#000000"/>
    <rect x="18" y="26" width="4" height="4" fill="#000000"/>
  </g>
  <g id="up_walk_3" transform="translate(96, 32)">
    <polygon points="12,5 20,5 24,10 8,10" fill="#0E0E16"/>
    <polygon points="10,10 22,10 20,17 12,17" fill="#0E0E16"/>
    <rect x="9" y="18" width="14" height="9" fill="#0A0A10"/>
    <rect x="9" y="22" width="14" height="2" fill="#050508"/>
    <line x1="14" y1="15" x2="18" y2="25" stroke="#DE2626" stroke-width="1.5"/>
    <rect x="10" y="25" width="4" height="4" fill="#000000"/>
    <rect x="18" y="27" width="4" height="4" fill="#000000"/>
  </g>

  <!-- ROW 2: FACING LEFT (y=64..96) -->
  <g id="left_idle" transform="translate(0, 64)">
    <polygon points="16,4 22,7 24,14 14,11" fill="#0E0E16"/>
    <rect x="10" y="12" width="6" height="5" fill="#1A1A26"/>
    <rect x="11" y="13" width="2" height="2" fill="#DE2626"/>
    <rect x="11" y="17" width="10" height="9" fill="#0A0A10"/>
    <rect x="11" y="21" width="10" height="2" fill="#050508"/>
    <rect x="10" y="26" width="5" height="4" fill="#000000"/>
    <rect x="16" y="26" width="5" height="4" fill="#000000"/>
  </g>
  <g id="left_walk_1" transform="translate(32, 64)">
    <polygon points="16,5 22,8 24,15 14,12" fill="#0E0E16"/>
    <rect x="10" y="13" width="6" height="5" fill="#1A1A26"/>
    <rect x="11" y="14" width="2" height="2" fill="#DE2626"/>
    <rect x="11" y="18" width="10" height="9" fill="#0A0A10"/>
    <rect x="11" y="22" width="10" height="2" fill="#050508"/>
    <rect x="7" y="27" width="5" height="4" fill="#000000"/>
    <rect x="18" y="25" width="5" height="4" fill="#000000"/>
  </g>
  <g id="left_walk_2" transform="translate(64, 64)">
    <polygon points="16,4 22,7 24,14 14,11" fill="#0E0E16"/>
    <rect x="10" y="12" width="6" height="5" fill="#1A1A26"/>
    <rect x="11" y="13" width="2" height="2" fill="#DE2626"/>
    <rect x="11" y="17" width="10" height="9" fill="#0A0A10"/>
    <rect x="11" y="21" width="10" height="2" fill="#050508"/>
    <rect x="10" y="26" width="5" height="4" fill="#000000"/>
    <rect x="16" y="26" width="5" height="4" fill="#000000"/>
  </g>
  <g id="left_walk_3" transform="translate(96, 64)">
    <polygon points="16,5 22,8 24,15 14,12" fill="#0E0E16"/>
    <rect x="10" y="13" width="6" height="5" fill="#1A1A26"/>
    <rect x="11" y="14" width="2" height="2" fill="#DE2626"/>
    <rect x="11" y="18" width="10" height="9" fill="#0A0A10"/>
    <rect x="11" y="22" width="10" height="2" fill="#050508"/>
    <rect x="12" y="25" width="5" height="4" fill="#000000"/>
    <rect x="16" y="27" width="5" height="4" fill="#000000"/>
  </g>

  <!-- ROW 3: FACING RIGHT (y=96..128) -->
  <g id="right_idle" transform="translate(0, 96)">
    <polygon points="16,4 10,7 8,14 18,11" fill="#0E0E16"/>
    <rect x="16" y="12" width="6" height="5" fill="#1A1A26"/>
    <rect x="19" y="13" width="2" height="2" fill="#DE2626"/>
    <rect x="11" y="17" width="10" height="9" fill="#0A0A10"/>
    <rect x="11" y="21" width="10" height="2" fill="#050508"/>
    <rect x="11" y="26" width="5" height="4" fill="#000000"/>
    <rect x="17" y="26" width="5" height="4" fill="#000000"/>
  </g>
  <g id="right_walk_1" transform="translate(32, 96)">
    <polygon points="16,5 10,8 8,15 18,12" fill="#0E0E16"/>
    <rect x="16" y="13" width="6" height="5" fill="#1A1A26"/>
    <rect x="19" y="14" width="2" height="2" fill="#DE2626"/>
    <rect x="11" y="18" width="10" height="9" fill="#0A0A10"/>
    <rect x="11" y="22" width="10" height="2" fill="#050508"/>
    <rect x="9" y="25" width="5" height="4" fill="#000000"/>
    <rect x="20" y="27" width="5" height="4" fill="#000000"/>
  </g>
  <g id="right_walk_2" transform="translate(64, 96)">
    <polygon points="16,4 10,7 8,14 18,11" fill="#0E0E16"/>
    <rect x="16" y="12" width="6" height="5" fill="#1A1A26"/>
    <rect x="19" y="13" width="2" height="2" fill="#DE2626"/>
    <rect x="11" y="17" width="10" height="9" fill="#0A0A10"/>
    <rect x="11" y="21" width="10" height="2" fill="#050508"/>
    <rect x="11" y="26" width="5" height="4" fill="#000000"/>
    <rect x="17" y="26" width="5" height="4" fill="#000000"/>
  </g>
  <g id="right_walk_3" transform="translate(96, 96)">
    <polygon points="16,5 10,8 8,15 18,12" fill="#0E0E16"/>
    <rect x="16" y="13" width="6" height="5" fill="#1A1A26"/>
    <rect x="19" y="14" width="2" height="2" fill="#DE2626"/>
    <rect x="11" y="18" width="10" height="9" fill="#0A0A10"/>
    <rect x="11" y="22" width="10" height="2" fill="#050508"/>
    <rect x="11" y="27" width="5" height="4" fill="#000000"/>
    <rect x="15" y="25" width="5" height="4" fill="#000000"/>
  </g>
</svg>"""

def svg_ganon_sheet() -> str:
    """Lord Ganon 48x48 4-frame boss sheet (192x48)."""
    return """<svg width="192" height="48" viewBox="0 0 192 48" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="192" height="48" fill="none"/>
  <!-- Frame 0: Idle Standing -->
  <g transform="translate(0, 0)">
    <rect x="8" y="10" width="32" height="34" fill="#7F1D1D"/>
    <rect x="12" y="14" width="24" height="26" fill="#1E1B4B"/>
    <!-- Golden Skull Crest -->
    <polygon points="20,4 28,4 26,10 22,10" fill="#F59E0B"/>
    <rect x="22" y="7" width="4" height="3" fill="#DE2626"/>
    <!-- Glowing Eyes -->
    <rect x="17" y="14" width="4" height="3" fill="#EF4444"/>
    <rect x="27" y="14" width="4" height="3" fill="#EF4444"/>
    <!-- Golden Trident -->
    <rect x="4" y="6" width="3" height="38" fill="#F59E0B"/>
    <polygon points="2,6 5,1 8,6" fill="#F59E0B"/>
    <line x1="1" y1="10" x2="9" y2="10" stroke="#F59E0B" stroke-width="2"/>
  </g>
  <!-- Frame 1: Trident Raise Pulse -->
  <g transform="translate(48, 0)">
    <rect x="8" y="9" width="32" height="35" fill="#7F1D1D"/>
    <rect x="12" y="13" width="24" height="27" fill="#1E1B4B"/>
    <polygon points="20,3 28,3 26,9 22,9" fill="#F59E0B"/>
    <rect x="22" y="6" width="4" height="3" fill="#DE2626"/>
    <rect x="17" y="13" width="4" height="3" fill="#EF4444"/>
    <rect x="27" y="13" width="4" height="3" fill="#EF4444"/>
    <rect x="4" y="2" width="3" height="42" fill="#F59E0B"/>
    <polygon points="2,2 5,-3 8,2" fill="#F59E0B"/>
    <line x1="1" y1="6" x2="9" y2="6" stroke="#DE2626" stroke-width="2"/>
  </g>
  <!-- Frame 2: Dark Aura Stance -->
  <g transform="translate(96, 0)">
    <rect x="7" y="10" width="34" height="34" fill="#991B1B"/>
    <rect x="11" y="14" width="26" height="26" fill="#312E81"/>
    <polygon points="20,4 28,4 26,10 22,10" fill="#F59E0B"/>
    <rect x="22" y="7" width="4" height="3" fill="#DE2626"/>
    <rect x="16" y="14" width="5" height="3" fill="#EF4444"/>
    <rect x="27" y="14" width="5" height="3" fill="#EF4444"/>
    <rect x="3" y="6" width="3" height="38" fill="#F59E0B"/>
    <polygon points="1,6 4,1 7,6" fill="#F59E0B"/>
  </g>
  <!-- Frame 3: Flame Strike Telegraph -->
  <g transform="translate(144, 0)">
    <rect x="8" y="11" width="32" height="33" fill="#7F1D1D"/>
    <rect x="12" y="15" width="24" height="25" fill="#1E1B4B"/>
    <polygon points="20,5 28,5 26,11 22,11" fill="#F59E0B"/>
    <rect x="22" y="8" width="4" height="3" fill="#DE2626"/>
    <rect x="17" y="15" width="4" height="3" fill="#EF4444"/>
    <rect x="27" y="15" width="4" height="3" fill="#EF4444"/>
    <rect x="5" y="8" width="3" height="36" fill="#DE2626"/>
    <polygon points="3,8 6,3 9,8" fill="#F59E0B"/>
  </g>
</svg>"""

def svg_slime_sheet() -> str:
    """Slime enemy 32x32 4-frame animation sheet (128x32)."""
    return """<svg width="128" height="32" viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="128" height="32" fill="none"/>
  <!-- F0: Normal Blob -->
  <g transform="translate(0,0)">
    <ellipse cx="16" cy="18" rx="11" ry="8" fill="#16A34A"/>
    <ellipse cx="16" cy="18" rx="8" ry="5" fill="#22C55E"/>
    <rect x="11" y="14" width="3" height="3" fill="#FFFFFF"/>
    <rect x="18" y="14" width="3" height="3" fill="#FFFFFF"/>
    <rect x="12" y="15" width="2" height="2" fill="#000000"/>
    <rect x="19" y="15" width="2" height="2" fill="#000000"/>
  </g>
  <!-- F1: Squash Bounce -->
  <g transform="translate(32,0)">
    <ellipse cx="16" cy="21" rx="13" ry="6" fill="#16A34A"/>
    <ellipse cx="16" cy="21" rx="10" ry="4" fill="#22C55E"/>
    <rect x="10" y="18" width="3" height="3" fill="#FFFFFF"/>
    <rect x="19" y="18" width="3" height="3" fill="#FFFFFF"/>
    <rect x="11" y="19" width="2" height="2" fill="#000000"/>
    <rect x="20" y="19" width="2" height="2" fill="#000000"/>
  </g>
  <!-- F2: Stretch Jump -->
  <g transform="translate(64,0)">
    <ellipse cx="16" cy="14" rx="8" ry="11" fill="#16A34A"/>
    <ellipse cx="16" cy="14" rx="6" ry="8" fill="#22C55E"/>
    <rect x="12" y="10" width="3" height="3" fill="#FFFFFF"/>
    <rect x="17" y="10" width="3" height="3" fill="#FFFFFF"/>
    <rect x="13" y="11" width="2" height="2" fill="#000000"/>
    <rect x="18" y="11" width="2" height="2" fill="#000000"/>
  </g>
  <!-- F3: Landing Rebound -->
  <g transform="translate(96,0)">
    <ellipse cx="16" cy="19" rx="12" ry="7" fill="#16A34A"/>
    <ellipse cx="16" cy="19" rx="9" ry="5" fill="#22C55E"/>
    <rect x="11" y="15" width="3" height="3" fill="#FFFFFF"/>
    <rect x="18" y="15" width="3" height="3" fill="#FFFFFF"/>
    <rect x="12" y="16" width="2" height="2" fill="#000000"/>
    <rect x="19" y="16" width="2" height="2" fill="#000000"/>
  </g>
</svg>"""

def svg_guard_sheet() -> str:
    """Guard soldier 32x32 4-frame walk sheet (128x32)."""
    return """<svg width="128" height="32" viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="128" height="32" fill="none"/>
  <!-- F0: Stand -->
  <g transform="translate(0,0)">
    <rect x="10" y="10" width="12" height="16" fill="#1D4ED8"/>
    <rect x="11" y="5" width="10" height="6" fill="#94A3B8"/>
    <rect x="13" y="7" width="6" height="2" fill="#0F172A"/>
    <rect x="23" y="4" width="2" height="24" fill="#CBD5E1"/>
    <polygon points="22,4 24,0 26,4" fill="#CBD5E1"/>
    <rect x="10" y="26" width="4" height="4" fill="#0F172A"/>
    <rect x="18" y="26" width="4" height="4" fill="#0F172A"/>
  </g>
  <!-- F1: March 1 -->
  <g transform="translate(32,0)">
    <rect x="10" y="11" width="12" height="16" fill="#1D4ED8"/>
    <rect x="11" y="6" width="10" height="6" fill="#94A3B8"/>
    <rect x="13" y="8" width="6" height="2" fill="#0F172A"/>
    <rect x="23" y="3" width="2" height="24" fill="#CBD5E1"/>
    <polygon points="22,3 24,-1 26,3" fill="#CBD5E1"/>
    <rect x="9" y="27" width="4" height="4" fill="#0F172A"/>
    <rect x="19" y="25" width="4" height="4" fill="#0F172A"/>
  </g>
  <!-- F2: Neutral -->
  <g transform="translate(64,0)">
    <rect x="10" y="10" width="12" height="16" fill="#1D4ED8"/>
    <rect x="11" y="5" width="10" height="6" fill="#94A3B8"/>
    <rect x="13" y="7" width="6" height="2" fill="#0F172A"/>
    <rect x="23" y="4" width="2" height="24" fill="#CBD5E1"/>
    <polygon points="22,4 24,0 26,4" fill="#CBD5E1"/>
    <rect x="10" y="26" width="4" height="4" fill="#0F172A"/>
    <rect x="18" y="26" width="4" height="4" fill="#0F172A"/>
  </g>
  <!-- F3: March 2 -->
  <g transform="translate(96,0)">
    <rect x="10" y="11" width="12" height="16" fill="#1D4ED8"/>
    <rect x="11" y="6" width="10" height="6" fill="#94A3B8"/>
    <rect x="13" y="8" width="6" height="2" fill="#0F172A"/>
    <rect x="23" y="5" width="2" height="24" fill="#CBD5E1"/>
    <polygon points="22,5 24,1 26,5" fill="#CBD5E1"/>
    <rect x="11" y="25" width="4" height="4" fill="#0F172A"/>
    <rect x="17" y="27" width="4" height="4" fill="#0F172A"/>
  </g>
</svg>"""


# -----------------------------------------------------------------------------
# 2. 16x16 ITEM TEXTURES (SVG Definitions)
# -----------------------------------------------------------------------------

def svg_item_shadow_blade() -> str:
    """16x16 Shadow Blade Item Icon."""
    return """<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="16" height="16" fill="none"/>
  <!-- Hilt & Pommel -->
  <rect x="2" y="13" width="2" height="2" fill="#FFFFFF"/>
  <rect x="3" y="12" width="2" height="2" fill="#181822"/>
  <rect x="4" y="11" width="2" height="2" fill="#181822"/>
  <!-- Crossguard -->
  <rect x="3" y="9" width="5" height="2" fill="#DE2626"/>
  <!-- Dark Blade with Red Edge Glow -->
  <rect x="5" y="8" width="2" height="2" fill="#0C0C12"/>
  <rect x="6" y="7" width="2" height="2" fill="#0C0C12"/>
  <rect x="7" y="6" width="2" height="2" fill="#0C0C12"/>
  <rect x="8" y="5" width="2" height="2" fill="#0C0C12"/>
  <rect x="9" y="4" width="2" height="2" fill="#0C0C12"/>
  <rect x="10" y="3" width="2" height="2" fill="#0C0C12"/>
  <rect x="11" y="2" width="2" height="2" fill="#0C0C12"/>
  <!-- Blade Edge Accents -->
  <rect x="6" y="9" width="1" height="1" fill="#DE2626"/>
  <rect x="8" y="7" width="1" height="1" fill="#DE2626"/>
  <rect x="10" y="5" width="1" height="1" fill="#DE2626"/>
  <rect x="12" y="3" width="1" height="1" fill="#FFFFFF"/>
  <!-- Tip -->
  <polygon points="12,1 14,1 14,3" fill="#FFFFFF"/>
</svg>"""

def svg_item_obsidian_shield() -> str:
    """16x16 Obsidian Shield Item Icon."""
    return """<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="16" height="16" fill="none"/>
  <!-- Outer Shield Rim -->
  <polygon points="2,2 14,2 14,10 8,15 2,10" fill="#0C0C12" stroke="#FFFFFF" stroke-width="1"/>
  <!-- Inner Obsidian Body -->
  <polygon points="4,4 12,4 12,9 8,13 4,9" fill="#161622"/>
  <!-- Crimson Crest Core -->
  <polygon points="8,5 10,8 8,11 6,8" fill="#DE2626"/>
  <circle cx="8" cy="8" r="1" fill="#FFFFFF"/>
</svg>"""

def svg_item_dark_elixir() -> str:
    """16x16 Dark Elixir Potion Vial."""
    return """<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="16" height="16" fill="none"/>
  <!-- Cork -->
  <rect x="6" y="2" width="4" height="2" fill="#78350F"/>
  <!-- Bottle Neck -->
  <rect x="7" y="4" width="2" height="2" fill="#E2E8F0" fill-opacity="0.6"/>
  <!-- Glass Flask Body -->
  <rect x="4" y="6" width="8" height="8" rx="2" fill="#6B21A8"/>
  <!-- Red Liquid Core -->
  <rect x="5" y="8" width="6" height="5" fill="#DE2626"/>
  <circle cx="7" cy="9" r="1" fill="#FFFFFF"/>
</svg>"""

def svg_item_sanctuary_seal() -> str:
    """16x16 Sanctuary Seal Medallion."""
    return """<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="16" height="16" fill="none"/>
  <circle cx="8" cy="8" r="7" fill="#B45309" stroke="#F59E0B" stroke-width="1"/>
  <circle cx="8" cy="8" r="5" fill="#181824"/>
  <polygon points="8,4 11,9 5,9" fill="#F59E0B"/>
  <circle cx="8" cy="8" r="2" fill="#DE2626"/>
</svg>"""

def svg_item_boomerang() -> str:
    """16x16 Boomerang Weapon Icon."""
    return """<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="16" height="16" fill="none"/>
  <path d="M3,3 L8,6 L13,3 L11,7 L7,10 L3,14 L3,9 Z" fill="#92400E" stroke="#F59E0B" stroke-width="1"/>
  <circle cx="8" cy="6" r="1.5" fill="#DE2626"/>
  <circle cx="3" cy="3" r="1" fill="#FFFFFF"/>
  <circle cx="13" cy="3" r="1" fill="#FFFFFF"/>
</svg>"""

def svg_item_heart_container() -> str:
    """16x16 Heart Container Icon."""
    return """<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="16" height="16" fill="none"/>
  <path d="M8,14 L2,8 C0,5 3,2 6,4 L8,6 L10,4 C13,2 16,5 14,8 Z" fill="#DE2626" stroke="#FFFFFF" stroke-width="1"/>
  <circle cx="5" cy="5" r="1" fill="#FFFFFF"/>
</svg>"""

def svg_item_bomb() -> str:
    """16x16 Bomb Item Icon."""
    return """<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="16" height="16" fill="none"/>
  <!-- Fuse & Spark -->
  <path d="M8,4 Q10,1 12,2" fill="none" stroke="#F59E0B" stroke-width="1"/>
  <rect x="12" y="1" width="2" height="2" fill="#DE2626"/>
  <!-- Bomb Body -->
  <circle cx="8" cy="9" r="6" fill="#0F172A" stroke="#334155" stroke-width="1"/>
  <circle cx="6" cy="7" r="1.5" fill="#FFFFFF"/>
</svg>"""


# -----------------------------------------------------------------------------
# 3. 32x32 TERRAIN TILES (SVG Definitions)
# -----------------------------------------------------------------------------

def svg_tile_sanctuary_floor() -> str:
    """32x32 Obsidian Sanctuary Floor Tile."""
    return """<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="32" height="32" fill="#181820"/>
  <rect x="1" y="1" width="14" height="14" fill="#20202A"/>
  <rect x="17" y="1" width="14" height="14" fill="#1C1C26"/>
  <rect x="1" y="17" width="14" height="14" fill="#1C1C26"/>
  <rect x="17" y="17" width="14" height="14" fill="#242432"/>
  <!-- Mortar Groove Lines -->
  <line x1="0" y1="16" x2="32" y2="16" stroke="#0C0C12" stroke-width="1"/>
  <line x1="16" y1="0" x2="16" y2="32" stroke="#0C0C12" stroke-width="1"/>
  <!-- Micro Stone Pits -->
  <rect x="5" y="6" width="2" height="2" fill="#14141A"/>
  <rect x="23" y="24" width="2" height="2" fill="#14141A"/>
</svg>"""

def svg_tile_sanctuary_carpet() -> str:
    """32x32 Royal Crimson Carpet Tile."""
    return """<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="32" height="32" fill="#991B1B"/>
  <rect x="2" y="2" width="28" height="28" fill="#7F1D1D"/>
  <!-- Gold Braided Borders -->
  <rect x="0" y="0" width="3" height="32" fill="#F59E0B"/>
  <rect x="29" y="0" width="3" height="32" fill="#F59E0B"/>
  <!-- Inner Velvet Diamond Motif -->
  <polygon points="16,6 24,16 16,26 8,16" fill="#991B1B"/>
  <circle cx="16" cy="16" r="3" fill="#B91C1C"/>
</svg>"""

def svg_tile_dark_grass() -> str:
    """32x32 Dark World Grassland Tile."""
    return """<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="32" height="32" fill="#1B4D24"/>
  <rect x="0" y="0" width="16" height="16" fill="#21592A"/>
  <rect x="16" y="16" width="16" height="16" fill="#21592A"/>
  <!-- Grass Blades -->
  <line x1="6" y1="12" x2="8" y2="6" stroke="#2E7D32" stroke-width="2"/>
  <line x1="10" y1="12" x2="8" y2="6" stroke="#4CAF50" stroke-width="1.5"/>
  <line x1="22" y1="26" x2="24" y2="20" stroke="#2E7D32" stroke-width="2"/>
  <line x1="26" y1="26" x2="24" y2="20" stroke="#4CAF50" stroke-width="1.5"/>
  <!-- Crimson Micro Flower -->
  <rect x="18" y="8" width="2" height="2" fill="#DE2626"/>
</svg>"""

def svg_tile_dungeon_wall() -> str:
    """32x32 Dungeon Brick Wall Tile."""
    return """<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="32" height="32" fill="#0C0A10"/>
  <!-- Top Brick Course -->
  <rect x="1" y="1" width="14" height="13" fill="#241E2E"/>
  <rect x="17" y="1" width="14" height="13" fill="#2D263A"/>
  <!-- Bottom Staggered Brick Course -->
  <rect x="1" y="16" width="22" height="14" fill="#2A2234"/>
  <rect x="25" y="16" width="6" height="14" fill="#241E2E"/>
  <!-- Bevel Highlights -->
  <line x1="1" y1="1" x2="15" y2="1" stroke="#3D334E" stroke-width="1"/>
  <line x1="17" y1="1" x2="31" y2="1" stroke="#3D334E" stroke-width="1"/>
  <line x1="1" y1="16" x2="23" y2="16" stroke="#3D334E" stroke-width="1"/>
</svg>"""


# -----------------------------------------------------------------------------
# 4. COMBAT & MOTION VFX (SVG Definitions)
# -----------------------------------------------------------------------------

def svg_vfx_sword_slash() -> str:
    """32x32 Crimson Energy Slash Arc."""
    return """<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="32" height="32" fill="none"/>
  <!-- Outer Energy Arc -->
  <path d="M4,28 A20,20 0 0,1 28,4" fill="none" stroke="#DE2626" stroke-width="4" stroke-linecap="round"/>
  <!-- Core White Laser Center -->
  <path d="M6,26 A18,18 0 0,1 26,6" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
  <!-- Leading Plasma Spark -->
  <circle cx="28" cy="4" r="3" fill="#FFFFFF"/>
  <circle cx="28" cy="4" r="1.5" fill="#DE2626"/>
</svg>"""

def svg_vfx_spin_attack_ring() -> str:
    """48x48 360-Degree Spin Attack Shockwave Ring."""
    return """<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
  <rect width="48" height="48" fill="none"/>
  <circle cx="24" cy="24" r="20" fill="none" stroke="#DE2626" stroke-width="3" stroke-dasharray="6,4"/>
  <circle cx="24" cy="24" r="16" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <circle cx="24" cy="4" r="3" fill="#DE2626"/>
  <circle cx="44" cy="24" r="3" fill="#DE2626"/>
  <circle cx="24" cy="44" r="3" fill="#DE2626"/>
  <circle cx="4" cy="24" r="3" fill="#DE2626"/>
</svg>"""


# -----------------------------------------------------------------------------
# MAIN GENERATION & RASTERIZATION LOOP
# -----------------------------------------------------------------------------

async def main():
    logger.info("=== Starting Shadow Link Awakening Canvas Asset Compilation ===")

    asset_manifest = [
        # Sprites
        {"name": "shadow_link_sheet_32x32", "dir": SPRITES_DIR, "svg": svg_shadow_link_sheet(), "w": 128, "h": 128},
        {"name": "ganon_sheet_48x48", "dir": SPRITES_DIR, "svg": svg_ganon_sheet(), "w": 192, "h": 48},
        {"name": "slime_sheet_32x32", "dir": SPRITES_DIR, "svg": svg_slime_sheet(), "w": 128, "h": 32},
        {"name": "guard_sheet_32x32", "dir": SPRITES_DIR, "svg": svg_guard_sheet(), "w": 128, "h": 32},
        # Items
        {"name": "item_shadow_blade_16x16", "dir": ITEMS_DIR, "svg": svg_item_shadow_blade(), "w": 16, "h": 16},
        {"name": "item_obsidian_shield_16x16", "dir": ITEMS_DIR, "svg": svg_item_obsidian_shield(), "w": 16, "h": 16},
        {"name": "item_dark_elixir_16x16", "dir": ITEMS_DIR, "svg": svg_item_dark_elixir(), "w": 16, "h": 16},
        {"name": "item_sanctuary_seal_16x16", "dir": ITEMS_DIR, "svg": svg_item_sanctuary_seal(), "w": 16, "h": 16},
        {"name": "item_boomerang_16x16", "dir": ITEMS_DIR, "svg": svg_item_boomerang(), "w": 16, "h": 16},
        {"name": "item_heart_container_16x16", "dir": ITEMS_DIR, "svg": svg_item_heart_container(), "w": 16, "h": 16},
        {"name": "item_bomb_16x16", "dir": ITEMS_DIR, "svg": svg_item_bomb(), "w": 16, "h": 16},
        # Tiles
        {"name": "tile_sanctuary_floor_32x32", "dir": TILES_DIR, "svg": svg_tile_sanctuary_floor(), "w": 32, "h": 32},
        {"name": "tile_sanctuary_carpet_32x32", "dir": TILES_DIR, "svg": svg_tile_sanctuary_carpet(), "w": 32, "h": 32},
        {"name": "tile_dark_grass_32x32", "dir": TILES_DIR, "svg": svg_tile_dark_grass(), "w": 32, "h": 32},
        {"name": "tile_dungeon_wall_32x32", "dir": TILES_DIR, "svg": svg_tile_dungeon_wall(), "w": 32, "h": 32},
        # VFX
        {"name": "vfx_sword_slash_arc_32x32", "dir": VFX_DIR, "svg": svg_vfx_sword_slash(), "w": 32, "h": 32},
        {"name": "vfx_spin_attack_ring_48x48", "dir": VFX_DIR, "svg": svg_vfx_spin_attack_ring(), "w": 48, "h": 48}
    ]

    logger.info("Writing vector SVG source files...")
    for item in asset_manifest:
        svg_path = item["dir"] / f"{item['name']}.svg"
        svg_path.write_text(item["svg"], encoding="utf-8")
        logger.info(f"Wrote SVG: {svg_path.relative_to(REPO_ROOT)}")

    logger.info("Launching headless Chromium via termux_playwright for crisp pixel rasterization...")
    async with async_playwright_termux() as p:
        browser = await launch(p)
        page = await browser.new_page(viewport={"width": 1024, "height": 1024}, device_scale_factor=1)
        temp_stage = REPO_ROOT / "dev" / "canvas_studio" / "_temp_stage.html"
        
        for item in asset_manifest:
            w, h = item["w"], item["h"]
            stage_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body, html {{ width: 1024px; height: 1024px; background: transparent; image-rendering: pixelated; }}
  #stage {{ position: absolute; top: 0; left: 0; width: {w}px; height: {h}px; display: block; }}
</style>
</head>
<body>
<div id="stage">{item['svg']}</div>
</body>
</html>"""
            temp_stage.write_text(stage_html, encoding="utf-8")
            await page.goto(f"file://{temp_stage.resolve()}", wait_until="domcontentloaded")
            await page.wait_for_timeout(30)
            
            png_path = item["dir"] / f"{item['name']}.png"
            await page.locator("#stage").screenshot(path=str(png_path), omit_background=True, animations="disabled", timeout=5000)
            logger.info(f"Rasterized PNG: {png_path.relative_to(REPO_ROOT)} ({w}x{h} px)")

        await browser.close()
        if temp_stage.exists():
            temp_stage.unlink()

    logger.info("=== Successfully compiled all Shadow Link Awakening Canvas & Sprite Assets! ===")

if __name__ == "__main__":
    asyncio.run(main())
