/**
 * Library:         FileHubView.tsx
 * Module Purpose:  Inventory & Gear Manager for Shadow Link
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0009-2026-1025-9999-000000000113
 * Version:         200101
 */

import React from 'react';
import { bejsonEngine } from '../engine/bejsonEngine';
import { Shield, Sparkles, Sword, Key, Heart } from 'lucide-react';

export const FileHubView: React.FC = () => {
  const items = bejsonEngine.playerInventory;

  return (
    <div className="w-full h-full p-6 bg-zinc-950 font-mono text-white overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-['Press_Start_2P'] uppercase text-white mb-1">
              SHADOW LINK'S INVENTORY & GEAR
            </h2>
            <p className="text-xs text-zinc-400">
              BEJSON 105 Item Definitions (`data/items/items.105.bejson`)
            </p>
          </div>
          <div className="px-3 py-1 bg-[#DE2626] text-white text-xs font-bold rounded uppercase">
            PLAYER: SHADOW LINK
          </div>
        </div>

        {/* Equipped Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center gap-3">
            <div className="p-3 bg-red-950 border border-red-700 rounded-lg text-[#DE2626]">
              <Sword className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">EQUIPPED WEAPON</span>
              <span className="text-sm font-bold text-white">Shadow Blade</span>
              <span className="text-xs text-emerald-400 block">+25 Attack Power</span>
            </div>
          </div>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center gap-3">
            <div className="p-3 bg-purple-950 border border-purple-700 rounded-lg text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">DARK SHIELD</span>
              <span className="text-sm font-bold text-white">Shadow Shield</span>
              <span className="text-xs text-emerald-400 block">+8 Defense Rating</span>
            </div>
          </div>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center gap-3">
            <div className="p-3 bg-amber-950 border border-amber-700 rounded-lg text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">SPELL / SPIN ATTACK</span>
              <span className="text-sm font-bold text-white">Dark Spin Burst</span>
              <span className="text-xs text-amber-400 block">15 MP Cost</span>
            </div>
          </div>
        </div>

        {/* Inventory Item Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            POSSESSED BEJSON 105 ITEMS ({items.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(item => (
              <div key={item.uuid} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex gap-3 items-start">
                <div className="p-2.5 bg-zinc-950 border border-zinc-700 rounded text-[#DE2626]">
                  {item.category === 'WEAPON' ? <Sword className="w-5 h-5" /> : item.category === 'KEY_ITEM' ? <Key className="w-5 h-5 text-amber-400" /> : <Heart className="w-5 h-5 text-emerald-400" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.displayName}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded uppercase font-mono">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
