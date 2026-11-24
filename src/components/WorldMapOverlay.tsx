/**
 * Library:         WorldMapOverlay.tsx
 * Module Purpose:  Context-Sensitive X-Button Spatial Map (Mode 7 8x8 Overworld Sector Map & Underworld 16x16 Supertile/Quadrant Map)
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * License:         PolyForm-Noncommercial-1.0.0
 * Relational_ID:   105a0035-2026-1123-9999-000000000316
 * Version:         200102
 */

import React, { useState } from 'react';
import { bejsonEngine } from '../engine/bejsonEngine';
import { soundEngine } from '../engine/soundEngine';
import { spatialWorldEngine, SpatialCoordinateMath, SPATIAL_CONSTANTS } from '../lib/lib_bejson_Gaming_spatial_world_engine';
import { X, MapPin, Compass, Layers, Home } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WorldMapOverlay: React.FC<Props> = ({ isOpen, onClose }) => {
  const isCurrentlyOverworld = bejsonEngine.currentLevelSlug === 'overworld_grid';
  const [viewMode, setViewMode] = useState<'OVERWORLD' | 'UNDERWORLD'>(
    isCurrentlyOverworld ? 'OVERWORLD' : 'UNDERWORLD'
  );
  const [perspectiveTilt, setPerspectiveTilt] = useState<boolean>(true);

  if (!isOpen) return null;

  const px = Math.round(bejsonEngine.playerX);
  const py = Math.round(bejsonEngine.playerY);
  const activeSectorId = isCurrentlyOverworld
    ? SpatialCoordinateMath.toOverworldSectorId(px, py)
    : SPATIAL_CONSTANTS.HOME_OVERWORLD_SECTOR_ID;
  const activeQuadrantId = !isCurrentlyOverworld
    ? SpatialCoordinateMath.toSupertileQuadrant(px, py)
    : 0;
  const mode7Coords = SpatialCoordinateMath.projectToMode7MapSpace(
    isCurrentlyOverworld ? px : SPATIAL_CONSTANTS.HOME_THRESHOLD_WORLD_X,
    isCurrentlyOverworld ? py : SPATIAL_CONSTANTS.HOME_THRESHOLD_WORLD_Y
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-mono text-white select-none">
      <div className="bg-zinc-950 border-4 border-[#DE2626] rounded-xl max-w-2xl w-full p-5 shadow-[0_0_35px_rgba(222,38,38,0.7)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#DE2626] text-white font-['Press_Start_2P'] text-[10px] uppercase rounded">
              {viewMode === 'OVERWORLD' ? 'FIELD MAP (8x8)' : 'SUPERTILE MAP'}
            </span>
            <span className="text-xs text-zinc-400 font-bold">
              {viewMode === 'OVERWORLD'
                ? '4096x4096 PX · 64 SECTORS (0x00..0x3F)'
                : 'SUPERTILE 0x00 · SHADOW CAVE (HOME BASE)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playChimeSFX();
                setViewMode(viewMode === 'OVERWORLD' ? 'UNDERWORLD' : 'OVERWORLD');
              }}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-amber-400 rounded border border-amber-700/60 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              {viewMode === 'OVERWORLD' ? 'VIEW HOME CAVE (0x00)' : 'VIEW 8x8 OVERWORLD'}
            </button>
            <button
              onClick={() => {
                soundEngine.playChimeSFX();
                onClose();
              }}
              className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {viewMode === 'OVERWORLD' ? (
          <div className="flex flex-col gap-3">
            {/* Sub-Toolbar for Mode 7 Affine Perspective vs 2D Ortho */}
            <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded text-[10px]">
              <div className="flex items-center gap-3">
                <span className="text-zinc-400">
                  ACTIVE SECTOR:{' '}
                  <strong className="text-emerald-400">
                    0x{activeSectorId.toString(16).toUpperCase().padStart(2, '0')} ({activeSectorId & 7},{(activeSectorId >> 3) & 7})
                  </strong>
                </span>
                <span className="text-zinc-400">
                  MODE 7 (1:4): <strong className="text-amber-400">({mode7Coords.mapX}, {mode7Coords.mapY})</strong>
                </span>
              </div>
              <button
                onClick={() => {
                  soundEngine.playChimeSFX();
                  setPerspectiveTilt(!perspectiveTilt);
                }}
                className="px-2 py-0.5 bg-zinc-950 border border-zinc-700 hover:border-red-500 rounded text-[9px] font-bold text-zinc-200 cursor-pointer"
              >
                {perspectiveTilt ? 'PERSPECTIVE: MODE 7 TILT' : 'PERSPECTIVE: 2D ORTHO'}
              </button>
            </div>

            {/* 8x8 Sector Grid (64 Sectors: 0x00..0x3F) */}
            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-lg p-4 flex flex-col items-center justify-center overflow-hidden">
              <div
                className="grid grid-cols-8 gap-1 w-full max-w-[440px] transition-transform duration-300"
                style={{
                  transform: perspectiveTilt ? 'perspective(620px) rotateX(22deg) scale(0.95)' : 'none'
                }}
              >
                {spatialWorldEngine.overworldSectors.map(sec => {
                  const isPlayerHere = isCurrentlyOverworld && sec.sectorId === activeSectorId;
                  const isHomeSector = sec.sectorId === SPATIAL_CONSTANTS.HOME_OVERWORLD_SECTOR_ID;
                  const isVisited = spatialWorldEngine.isOverworldSectorVisited(sec.sectorId);
                  const hexId = sec.sectorId.toString(16).toUpperCase().padStart(2, '0');

                  return (
                    <div
                      key={sec.sectorId}
                      className={`h-11 rounded border flex flex-col items-center justify-between p-1 text-[8px] relative transition-all ${
                        isPlayerHere
                          ? 'bg-[#DE2626]/30 border-[#DE2626] ring-1 ring-[#DE2626]'
                          : isHomeSector
                          ? 'bg-amber-950/40 border-amber-500/80'
                          : isVisited
                          ? 'bg-emerald-950/30 border-emerald-700/50'
                          : 'bg-zinc-950/70 border-zinc-800/70 opacity-60'
                      }`}
                      title={sec.title}
                    >
                      <div className="w-full flex justify-between items-center text-[7px] text-zinc-400">
                        <span>{hexId}</span>
                        <span>{sec.col},{sec.row}</span>
                      </div>

                      {/* Decoupled OAM Sprite Markers */}
                      <div className="flex items-center justify-center gap-0.5">
                        {isHomeSector && (
                          <span title="Shadow Cave (Home Base Threshold)" className="text-amber-400">
                            <Home className="w-3 h-3" />
                          </span>
                        )}
                        {isPlayerHere && (
                          <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#DE2626] animate-ping" />
                        )}
                      </div>

                      <div className="text-[6px] text-zinc-500 truncate w-full text-center">
                        {isHomeSector ? 'SHADOW CAVE' : 'EMPTY'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* UNDERWORLD SUPERTILE 0x00 (SHADOW CAVE HOME BASE) 4-QUADRANT VIEW */
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded text-[10px]">
              <span className="text-zinc-400">
                SUPERTILE: <strong className="text-amber-400">0x00 (SHADOW CAVE · HOME BASE)</strong>
              </span>
              <span className="text-zinc-400">
                FLOOR: <strong className="text-emerald-400">1F (FULL_4Q · 512x512 PX)</strong>
              </span>
              <span className="text-zinc-400">
                QUADRANT: <strong className="text-white">{['NW (Q0)', 'NE (Q1)', 'SW (Q2)', 'SE (Q3)'][activeQuadrantId]}</strong>
              </span>
            </div>

            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-lg p-5 flex flex-col items-center justify-center gap-3">
              <div className="grid grid-cols-2 gap-2 w-64 h-64 p-2 bg-zinc-950 border-2 border-amber-500/80 rounded-lg relative">
                {(['NW (Q0)', 'NE (Q1)', 'SW (Q2)', 'SE (Q3)'] as const).map((qLabel, qIdx) => {
                  const isActiveQuad = !isCurrentlyOverworld && activeQuadrantId === qIdx;
                  return (
                    <div
                      key={qLabel}
                      className={`rounded border border-dashed flex flex-col items-center justify-between p-2 ${
                        isActiveQuad
                          ? 'bg-[#DE2626]/25 border-[#DE2626]'
                          : 'bg-zinc-900/60 border-zinc-700'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-zinc-300">{qLabel}</span>
                      {isActiveQuad ? (
                        <div className="flex flex-col items-center gap-1">
                          <MapPin className="w-4 h-4 text-[#DE2626] animate-bounce" />
                          <span className="text-[8px] text-white font-bold">SHADOW LINK</span>
                        </div>
                      ) : (
                        <span className="text-[8px] text-zinc-500">256x256 PX</span>
                      )}
                      <span className="text-[7px] text-zinc-500">16x16 METATILES</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[10px] text-amber-400 font-bold flex items-center gap-2">
                <Compass className="w-3.5 h-3.5" />
                SOUTH EXIT DOORWAY (TILE 16,30) ➔ OVERWORLD SECTOR 0x1B (1792, 1808)
              </div>
            </div>
          </div>
        )}

        {/* Footer Quick Travel & Close */}
        <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-[10px] text-zinc-400">
          <span>
            WORLD POS: ({px}, {py}) · METATILE: ({px >> 4}, {py >> 4})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playChimeSFX();
                bejsonEngine.currentLevelSlug = 'shadow_cave';
                bejsonEngine.playerX = 256;
                bejsonEngine.playerY = 256;
                spatialWorldEngine.activeDomain = 'UNDERWORLD';
                onClose();
              }}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/70 text-amber-400 rounded font-bold text-[9px] cursor-pointer"
            >
              WARP: SHADOW CAVE (HOME)
            </button>
            <button
              onClick={() => {
                soundEngine.playChimeSFX();
                onClose();
              }}
              className="px-3 py-1.5 bg-[#DE2626] hover:bg-red-700 text-white rounded font-bold text-[9px] cursor-pointer"
            >
              CLOSE [X]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
