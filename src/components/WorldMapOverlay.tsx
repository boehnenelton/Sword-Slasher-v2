/**
 * Library:         WorldMapOverlay.tsx
 * Module Purpose:  Dark World Map Overlay triggered via X Button
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0035-2026-1025-9999-000000000315
 * Version:         200101
 */

import React from 'react';
import { bejsonEngine } from '../engine/bejsonEngine';
import { soundEngine } from '../engine/soundEngine';
import { X, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WorldMapOverlay: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const levels = bejsonEngine.getLevels();
  const currentSlug = bejsonEngine.currentLevelSlug;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-mono text-white select-none">
      <div className="bg-zinc-950 border-4 border-[#DE2626] rounded-xl max-w-xl w-full p-5 shadow-[0_0_35px_rgba(222,38,38,0.7)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#DE2626] text-white font-['Press_Start_2P'] text-[10px] uppercase rounded">
              WORLD MAP
            </span>
            <span className="text-xs text-zinc-400 font-bold">HYRULE DARK REALM</span>
          </div>
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

        {/* World Map Grid View */}
        <div className="bg-zinc-900 border-2 border-zinc-800 rounded-lg p-4 relative flex flex-col gap-3 min-h-[260px] items-center justify-center">
          <div className="grid grid-cols-2 gap-3 w-full">
            {levels.map(lvl => {
              const isCurrent = lvl.slug === currentSlug;
              return (
                <button
                  key={lvl.uuid}
                  onClick={() => {
                    soundEngine.playChimeSFX();
                    bejsonEngine.currentLevelSlug = lvl.slug;
                    bejsonEngine.playerX = 320;
                    bejsonEngine.playerY = 320;
                    onClose();
                  }}
                  className={`p-3 rounded-lg border-2 flex flex-col gap-1 transition-all text-left cursor-pointer hover:scale-[1.02] ${
                    isCurrent
                      ? 'bg-[#DE2626]/20 border-[#DE2626] shadow-[0_0_15px_rgba(222,38,38,0.5)] ring-2 ring-[#DE2626]'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
                  }`}
                  title={`Warp to ${lvl.title}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white font-['Press_Start_2P'] truncate">
                      {lvl.title.split(' - ')[0]}
                    </span>
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-[#DE2626] bg-black px-2 py-0.5 rounded border border-[#DE2626] animate-pulse">
                        <MapPin className="w-3 h-3" /> YOU ARE HERE
                      </span>
                    ) : (
                      <span className="text-[9px] text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                        WARP ➔
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                    <span>SIZE: {lvl.mapSizeTier}</span>
                    <span className="text-emerald-400 font-bold">{lvl.width}x{lvl.height}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-[10px] text-zinc-400">
          <span>PRESS [X] OR [ESC] TO CLOSE WORLD MAP</span>
          <button
            onClick={() => {
              soundEngine.playChimeSFX();
              onClose();
            }}
            className="px-6 py-2 bg-[#DE2626] hover:bg-red-700 text-white font-['Press_Start_2P'] text-[10px] uppercase rounded cursor-pointer transition-colors"
          >
            RETURN TO GAME
          </button>
        </div>
      </div>
    </div>
  );
};
