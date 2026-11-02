/**
 * Library:         SubScreenOverlay.tsx
 * Module Purpose:  Sub-Screen Overlay (Item Menu & Status) for Shadow Engine 105
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0032-2026-1025-9999-000000000307
 * Version:         200102
 */

import React, { useEffect, useState, useCallback } from 'react';
import { shadowEngine } from '../lib/lib_bejson_Gaming_shadow_engine';
import { soundEngine } from '../engine/soundEngine';
import { X, Sword, Shield, Key, Heart, Gem, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SubScreenOverlay: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = shadowEngine.yItems;

  useEffect(() => {
    if (isOpen) {
      const idx = items.findIndex(i => i.id === shadowEngine.activeYItemSlug);
      setSelectedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, items]);

  const handleSelectItem = useCallback((idx: number) => {
    if (idx < 0 || idx >= items.length) return;
    soundEngine.playChimeSFX();
    setSelectedIndex(idx);
    shadowEngine.setSelectedYItem(items[idx].id);
  }, [items]);

  // Keyboard navigation inside SubScreen Overlay
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const cols = 4;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        const next = (selectedIndex + 1) % items.length;
        handleSelectItem(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        const prev = (selectedIndex - 1 + items.length) % items.length;
        handleSelectItem(prev);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        const down = Math.min(items.length - 1, selectedIndex + cols);
        handleSelectItem(down);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        const up = Math.max(0, selectedIndex - cols);
        handleSelectItem(up);
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        soundEngine.playChimeSFX();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, items.length, handleSelectItem, onClose]);

  if (!isOpen) return null;

  const activeYItem = shadowEngine.getActiveYItem();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono text-white select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border-4 border-[#DE2626] rounded-xl max-w-2xl w-full p-5 shadow-[0_0_35px_rgba(222,38,38,0.6)] flex flex-col gap-4 max-h-[75vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#DE2626] text-white font-['Press_Start_2P'] text-[10px] uppercase rounded">
              SUB SCREEN
            </span>
            <span className="text-xs text-zinc-400 font-bold">PAUSED · SELECT Y-ITEM & GEAR</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* COLUMN 1: ITEM WINDOW & DO WINDOW */}
          <div className="space-y-4">
            {/* ITEM Window */}
            <div className="bg-zinc-900 border-2 border-zinc-700 rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block border-b border-zinc-800 pb-1">
                INVENTORY ITEMS (D-PAD NAVIGATE)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {items.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(idx)}
                      className={`p-2 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#DE2626]/30 border-[#DE2626] shadow-[0_0_12px_rgba(222,38,38,0.8)] scale-105 ring-2 ring-[#DE2626]'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-[8px] font-bold text-zinc-300 truncate w-full text-center">
                        {item.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DO WINDOW (A-Button Action Context) */}
            <div className="bg-zinc-900 border-2 border-zinc-700 rounded-lg p-3 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block border-b border-zinc-800 pb-1">
                DO WINDOW (A BUTTON)
              </span>
              <div className="flex items-center justify-between text-xs text-zinc-200">
                <span className="font-bold text-[#DE2626]">ACTIONS:</span>
                <span className="bg-zinc-950 px-3 py-1 border border-zinc-700 rounded text-emerald-400 font-bold text-[11px]">
                  {shadowEngine.doActionName}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: ACTIVE ITEM DISPLAY, EQUIPMENT & STATS */}
          <div className="space-y-4">
            {/* ITEM Name & Description Display */}
            <div className="bg-zinc-900 border-2 border-zinc-700 rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block border-b border-zinc-800 pb-1">
                EQUIPPED Y-ITEM
              </span>
              <div className="flex items-center gap-3 bg-zinc-950 p-2.5 border border-zinc-800 rounded-lg">
                <span className="text-3xl">{activeYItem?.icon || '🪃'}</span>
                <div>
                  <span className="text-xs font-bold text-white block">{activeYItem?.name}</span>
                  <span className="text-[10px] text-zinc-400">{activeYItem?.description}</span>
                </div>
              </div>
            </div>

            {/* Equipment Window */}
            <div className="bg-zinc-900 border-2 border-zinc-700 rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block border-b border-zinc-800 pb-1">
                SHADOW LINK GEAR
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded border border-zinc-800">
                  <Sword className="w-4 h-4 text-[#DE2626]" />
                  <div>
                    <span className="text-[10px] text-zinc-500 block">WEAPON</span>
                    <span className="font-bold text-white">Shadow Blade</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded border border-zinc-800">
                  {/* Black shield icon with inverted red triangle */}
                  <div className="w-4 h-5 bg-black border border-[#DE2626] rounded-b flex items-center justify-center relative">
                    <span className="text-[8px] text-[#DE2626] leading-none transform rotate-180">▲</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">SHIELD</span>
                    <span className="font-bold text-white">Obsidian Shield</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dungeon Items & Counters */}
            <div className="bg-zinc-900 border-2 border-zinc-700 rounded-lg p-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">RUPEES</span>
                <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <Gem className="w-3.5 h-3.5" /> {shadowEngine.rupees}
                </span>
              </div>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">KEYS</span>
                <span className="text-amber-400 font-bold flex items-center justify-center gap-1">
                  <Key className="w-3.5 h-3.5" /> {shadowEngine.smallKeys}
                </span>
              </div>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">PIECES</span>
                <span className="text-[#DE2626] font-bold flex items-center justify-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-current" /> {shadowEngine.heartPieces}/4
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-[10px] text-zinc-400">
          <span>PRESS [START] / [SELECT] / [ENTER] TO CLOSE & EQUIP</span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#DE2626] hover:bg-red-700 text-white font-['Press_Start_2P'] text-[10px] uppercase rounded cursor-pointer transition-colors"
          >
            EQUIP & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
