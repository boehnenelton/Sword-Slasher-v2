/**
 * Library:         SubScreenOverlay.tsx
 * Module Purpose:  Compact Authentic Link to the Past Inventory & Status Sub-Screen Overlay
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   bb62575c-3aad-4d9b-8b31-82c56d97bc9e
 * Version:         200301
 */

import React, { useEffect, useState, useCallback } from 'react';
import { shadowEngine } from '../lib/lib_bejson_Gaming_shadow_engine';
import { soundEngine } from '../engine/soundEngine';
import { X, Key, Heart, Gem, Compass } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExitToTitle?: () => void;
  onWarpToDebug?: () => void;
  isDebugMode?: boolean;
}

export const SubScreenOverlay: React.FC<Props> = ({ isOpen, onClose, onExitToTitle, onWarpToDebug, isDebugMode = false }) => {
  const [activeTab, setActiveTab] = useState<'yItems' | 'gear'>('yItems');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = shadowEngine.yItems; // Strictly Boomerang and Dark Bow

  // Build 5x4 Grid (20 Slots) with items placed at top-left positions (0 and 1)
  const totalSlots = 20;
  const gridSlots = Array.from({ length: totalSlots }).map((_, idx) => {
    if (idx < items.length) {
      return { ...items[idx], isItem: true };
    }
    return { id: `empty_${idx}`, name: 'Empty Slot', icon: '', isItem: false, description: 'Empty inventory slot.' };
  });

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
      const k = e.key;
      if (k === 'Q' || k === 'q' || k === 'PageUp') {
        e.preventDefault();
        soundEngine.playChimeSFX();
        setActiveTab('yItems');
      } else if (k === 'E' || k === 'e' || k === 'PageDown' || k === 'Tab') {
        e.preventDefault();
        soundEngine.playChimeSFX();
        setActiveTab('gear');
      } else if (activeTab === 'yItems') {
        if (k === 'ArrowRight' || k === 'd' || k === 'D') {
          e.preventDefault();
          const next = (selectedIndex + 1) % items.length;
          handleSelectItem(next);
        } else if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
          e.preventDefault();
          const prev = (selectedIndex - 1 + items.length) % items.length;
          handleSelectItem(prev);
        } else if (k === 'Enter' || k === ' ' || k === 'Escape') {
          e.preventDefault();
          soundEngine.playChimeSFX();
          onClose();
        }
      } else if (k === 'Enter' || k === ' ' || k === 'Escape') {
        e.preventDefault();
        soundEngine.playChimeSFX();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, selectedIndex, items.length, handleSelectItem, onClose]);

  if (!isOpen) return null;

  const activeYItem = shadowEngine.getActiveYItem();
  const selectedSlot = gridSlots[selectedIndex] || gridSlots[0];

  // ALTTP Shadow Link Gear Data for Page 2 (Basic starting gear equipped by default; rest in debug chests)
  const gearItems = [
    { name: 'Shadow Blade', icon: '🗡️', desc: 'Master Shadow Blade with crimson arc impulse.', slot: 'WEAPON', status: 'EQUIPPED', unlocked: true },
    { name: 'Obsidian Shield', icon: '🛡️', desc: 'Reflects dark magic beams and projectile strikes.', slot: 'SHIELD', status: 'EQUIPPED', unlocked: true },
    { name: 'Power Glove', icon: '🧤', desc: 'Unbuilt item - In Debug Room Treasure Chest.', slot: 'GLOVE', status: 'IN DEBUG CHEST', unlocked: false },
    { name: 'Pegasus Boots', icon: '👢', desc: 'Unbuilt item - In Debug Room Treasure Chest.', slot: 'BOOTS', status: 'IN DEBUG CHEST', unlocked: false },
    { name: 'Moon Pearl', icon: '🔮', desc: 'Unbuilt item - In Debug Room Treasure Chest.', slot: 'RELIC', status: 'IN DEBUG CHEST', unlocked: false },
    { name: 'Zora Flippers', icon: '🦭', desc: 'Unbuilt item - In Debug Room Treasure Chest.', slot: 'FLIPPERS', status: 'IN DEBUG CHEST', unlocked: false },
    { name: 'Crimson Pendant', icon: '🏅', desc: 'Unbuilt item - In Debug Room Treasure Chest.', slot: 'PENDANT', status: 'IN DEBUG CHEST', unlocked: false },
    { name: 'Shadow Pendant', icon: '🏅', desc: 'Unbuilt item - In Debug Room Treasure Chest.', slot: 'PENDANT', status: 'IN DEBUG CHEST', unlocked: false }
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 font-mono text-white select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border-3 border-[#DE2626] rounded-lg max-w-xl w-full p-4 shadow-[0_0_30px_rgba(222,38,38,0.5)] flex flex-col gap-3 relative"
      >
        {/* Top Header Bar & Tab Selector */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#DE2626] text-white font-['Press_Start_2P'] text-[9px] uppercase rounded">
              SUB-SCREEN
            </span>
            <div className="flex bg-zinc-900 rounded p-0.5 border border-zinc-800">
              <button
                onClick={() => { soundEngine.playChimeSFX(); setActiveTab('yItems'); }}
                className={`px-2.5 py-1 text-[9px] font-['Press_Start_2P'] uppercase rounded cursor-pointer transition-colors ${
                  activeTab === 'yItems' ? 'bg-[#DE2626] text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Y-ITEMS
              </button>
              <button
                onClick={() => { soundEngine.playChimeSFX(); setActiveTab('gear'); }}
                className={`px-2.5 py-1 text-[9px] font-['Press_Start_2P'] uppercase rounded cursor-pointer transition-colors ${
                  activeTab === 'gear' ? 'bg-[#DE2626] text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                GEAR
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Horizontal Toolbar (Equipped Items & Status Counters) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded p-2 flex items-center justify-between gap-2 text-xs">
          {/* Equipped Y-Item Box */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-tight">EQUIPPED:</span>
            <div className="w-9 h-9 bg-zinc-950 border border-[#DE2626] rounded flex items-center justify-center text-xl shadow-[0_0_8px_rgba(222,38,38,0.4)]">
              {activeYItem?.icon || '🪃'}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white leading-tight font-['Press_Start_2P'] truncate max-w-[120px]">
                {activeYItem?.name.split(' ')[0]}
              </span>
              {activeYItem?.ammo !== undefined && (
                <span className="text-[9px] text-emerald-400 font-bold">
                  AMMO: {activeYItem.ammo}/{activeYItem.maxAmmo}
                </span>
              )}
            </div>
          </div>

          {/* Equipped Weapon & Shield Boxes */}
          <div className="hidden sm:flex items-center gap-1.5 border-l border-r border-zinc-800 px-2">
            <div className="w-8 h-8 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center text-base" title="Shadow Blade">
              🗡️
            </div>
            <div className="w-8 h-8 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center text-base" title="Obsidian Shield">
              🛡️
            </div>
          </div>

          {/* Compact Counters */}
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              <Gem className="w-3 h-3" /> {shadowEngine.rupees}
            </span>
            <span className="text-amber-400 flex items-center gap-1">
              <Key className="w-3 h-3" /> {shadowEngine.smallKeys}
            </span>
            <span className="text-red-400 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" /> {shadowEngine.heartPieces}/4
            </span>
          </div>
        </div>

        {/* PAGE 1: Y-ITEMS COMPACT GRID */}
        {activeTab === 'yItems' && (
          <div className="space-y-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2 border-b border-zinc-800 pb-1 flex justify-between">
                <span>INVENTORY GRID (SELECT Y-ITEM)</span>
                <span className="text-emerald-400">DO: {shadowEngine.doActionName.split(' · ')[0]}</span>
              </div>
              
              {/* 5x4 Grid (20 Slots) */}
              <div className="grid grid-cols-5 gap-2">
                {gridSlots.map((slot, idx) => {
                  const isSelected = idx === selectedIndex && slot.isItem;
                  return (
                    <button
                      key={slot.id}
                      disabled={!slot.isItem}
                      onClick={() => slot.isItem && handleSelectItem(idx)}
                      className={`h-12 rounded border flex flex-col items-center justify-center transition-all ${
                        slot.isItem
                          ? isSelected
                            ? 'bg-[#DE2626]/30 border-[#DE2626] ring-2 ring-[#DE2626] scale-105 cursor-pointer shadow-[0_0_10px_rgba(222,38,38,0.7)]'
                            : 'bg-zinc-950 border-zinc-700 hover:border-zinc-500 cursor-pointer'
                          : 'bg-zinc-950/40 border-zinc-900 opacity-40 cursor-default'
                      }`}
                    >
                      {slot.isItem ? (
                        <span className="text-2xl">{slot.icon}</span>
                      ) : (
                        <span className="text-[10px] text-zinc-800">·</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1-Line Tooltip Banner */}
            <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 flex items-center justify-between text-[10px]">
              <span className="font-bold text-white uppercase font-['Press_Start_2P'] text-[9px]">
                {selectedSlot.name}
              </span>
              <span className="text-zinc-400 truncate max-w-[320px]">
                {selectedSlot.description}
              </span>
            </div>
          </div>
        )}

        {/* PAGE 2: GEAR MATRIX */}
        {activeTab === 'gear' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                BASIC EQUIPMENT (SWORD & SHIELD EQUIPPED)
              </span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase">
                TEST UNBUILT ITEMS IN DEBUG CHESTS
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {gearItems.map((g, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border flex flex-col items-center text-center gap-1 ${
                    g.unlocked
                      ? 'bg-zinc-950 border-zinc-700'
                      : 'bg-zinc-950/40 border-zinc-900 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{g.unlocked ? g.icon : '🔒'}</span>
                  <span className={`text-[8px] font-bold uppercase truncate w-full font-['Press_Start_2P'] ${g.unlocked ? 'text-white' : 'text-zinc-600'}`}>
                    {g.name.split(' ')[0]}
                  </span>
                  <span className={`text-[7px] font-bold uppercase ${g.unlocked ? 'text-emerald-400' : 'text-amber-500/80'}`}>
                    {g.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-[9px] text-zinc-400">
          <span>PRESS [Q] / [E] SWITCH TAB · [ENTER] RETURN</span>
          <div className="flex items-center gap-1.5">
            {onWarpToDebug && isDebugMode && (
              <button
                onClick={() => { soundEngine.playChimeSFX(); onWarpToDebug(); }}
                className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-600/50 font-['Press_Start_2P'] text-[8px] uppercase rounded cursor-pointer transition-colors flex items-center gap-1"
              >
                <Compass className="w-3 h-3" /> DEBUG
              </button>
            )}
            {onExitToTitle && (
              <button
                onClick={onExitToTitle}
                className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-[#DE2626] font-['Press_Start_2P'] text-[8px] uppercase rounded cursor-pointer transition-colors"
              >
                EXIT
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#DE2626] hover:bg-red-700 text-white font-['Press_Start_2P'] text-[8px] uppercase rounded cursor-pointer transition-colors"
            >
              RETURN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
