/**
 * Library:         GameHUD.tsx
 * Module Purpose:  Shadow Engine Authentic Main Screen HUD (Magic Meter, Item Box, Rupees, Bombs, Arrows, Hearts)
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0005-2026-1025-9999-000000000111
 * Version:         200104
 */

import React, { useEffect, useState } from 'react';
import { Heart, Key, Gem, Zap, Settings, Info, Cpu } from 'lucide-react';
import { bejsonEngine } from '../engine/bejsonEngine';
import { shadowEngine } from '../lib/lib_bejson_Gaming_shadow_engine';

interface Props {
  levelTitle: string;
  objective: string;
  onOpenSettings?: () => void;
  onOpenMetaUI?: () => void;
  onOpenJsParity?: () => void;
}

export const GameHUD: React.FC<Props> = ({ levelTitle, objective, onOpenSettings, onOpenMetaUI, onOpenJsParity }) => {
  const hp = bejsonEngine.playerHp;
  const maxHp = bejsonEngine.playerMaxHp;
  const mp = bejsonEngine.magicPoints;
  const maxMp = bejsonEngine.maxMagicPoints;

  const [activeItemSlug, setActiveItemSlug] = useState(shadowEngine.activeYItemSlug);

  useEffect(() => {
    return shadowEngine.subscribe(() => {
      setActiveItemSlug(shadowEngine.activeYItemSlug);
    });
  }, []);

  const activeYItem = shadowEngine.getActiveYItem();

  // Calculate heart containers (each heart = 20 HP)
  const totalHearts = Math.ceil(maxHp / 20);
  const fullHearts = Math.floor(hp / 20);
  const hasHalfHeart = hp % 20 >= 10;

  return (
    <div className="w-full bg-zinc-950 border-b-2 border-zinc-800 p-2 text-white font-mono flex flex-wrap items-center justify-between gap-2 select-none">
      {/* LEFT: SHADOW ENGINE HUD METERS (Magic Meter + Y-Item Box) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1. Vertical / Compact Magic Meter */}
        <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 border border-zinc-800 rounded">
          <Zap className="w-3.5 h-3.5 text-emerald-400 fill-current" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-zinc-400 uppercase">MAGIC</span>
            <div className="w-14 bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-700">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${(mp / maxMp) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Active Y-Item Display Box */}
        <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 border-2 border-amber-500/80 rounded bg-zinc-950/80 shadow-[0_0_10px_rgba(245,158,11,0.2)]" title="Active Y Button Item">
          <span className="text-lg">{activeYItem?.icon || '🪃'}</span>
          <div className="hidden sm:flex flex-col">
            <span className="text-[8px] font-bold text-amber-400 uppercase">Y ITEM</span>
            <span className="text-[9px] font-bold text-white truncate max-w-[70px]">{activeYItem?.name.split(' ')[0]}</span>
          </div>
        </div>

        {/* 3, 4, 5, 6: Counters (Rupees, Bombs, Arrows, Small Keys) */}
        <div className="hidden md:flex items-center gap-2 bg-zinc-900/90 px-2.5 py-1 border border-zinc-800 rounded text-xs font-bold">
          {/* Rupees */}
          <div className="flex items-center gap-1 text-emerald-400" title="Rupees">
            <Gem className="w-3 h-3 fill-current" />
            <span>{shadowEngine.rupees}</span>
          </div>

          <span className="text-zinc-700">|</span>

          {/* Bombs */}
          <div className="flex items-center gap-1 text-zinc-300" title="Bombs">
            <span>💣</span>
            <span>{shadowEngine.bombs}</span>
          </div>

          <span className="text-zinc-700">|</span>

          {/* Arrows */}
          <div className="flex items-center gap-1 text-zinc-300" title="Arrows">
            <span>🏹</span>
            <span>{shadowEngine.arrows}</span>
          </div>

          <span className="text-zinc-700">|</span>

          {/* Small Keys */}
          <div className="flex items-center gap-1 text-amber-400" title="Small Keys">
            <Key className="w-3 h-3" />
            <span>{shadowEngine.smallKeys}</span>
          </div>
        </div>
      </div>

      {/* CENTER: LEVEL TITLE & OBJECTIVE */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] sm:text-[11px] font-bold text-white uppercase font-['Press_Start_2P'] tracking-wider">
          {levelTitle}
        </span>
        <span className="text-[9px] text-[#DE2626] font-semibold truncate max-w-[240px] sm:max-w-[320px]">
          {objective}
        </span>
      </div>

      {/* RIGHT: HEART CONTAINERS & META BUTTONS */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 border border-zinc-800 rounded">
          <span className="text-[9px] text-zinc-400 font-bold uppercase mr-0.5">LIFE</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: totalHearts }).map((_, i) => {
              if (i < fullHearts) {
                return <Heart key={i} className="w-3.5 h-3.5 text-[#DE2626] fill-current" />;
              } else if (i === fullHearts && hasHalfHeart) {
                return <Heart key={i} className="w-3.5 h-3.5 text-red-400 fill-current opacity-60" />;
              } else {
                return <Heart key={i} className="w-3.5 h-3.5 text-zinc-700" />;
              }
            })}
          </div>
        </div>

        {onOpenJsParity && (
          <button
            onClick={onOpenJsParity}
            className="p-1.5 bg-zinc-900 hover:bg-emerald-800 text-emerald-400 hover:text-white rounded border border-emerald-600/50 transition-colors cursor-pointer"
            title="Run Vanilla JS Parity Engine"
          >
            <Cpu className="w-3.5 h-3.5" />
          </button>
        )}

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}

        {onOpenMetaUI && (
          <button
            onClick={onOpenMetaUI}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 transition-colors cursor-pointer"
            title="About / Meta UI"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
