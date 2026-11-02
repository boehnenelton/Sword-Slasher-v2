/**
 * Library:         HorizToolbar.tsx
 * Module Purpose:  Dynamic Horizontally-Scrolling Toolbar for Viewport Navigation
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0006-2026-1025-9999-000000000110
 * Version:         200101
 */

import React from 'react';
import { Gamepad2, Package, Database, Activity, Settings, Info, RefreshCw, Cpu } from 'lucide-react';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onResetGame: () => void;
  onOpenJsParity?: () => void;
}

export const HorizToolbar: React.FC<Props> = ({ activeTab, onTabChange, onResetGame, onOpenJsParity }) => {
  const tabs = [
    { id: 'game', label: 'GAME VIEWPORT', icon: Gamepad2 },
    { id: 'js_parity', label: 'JS ENGINE RUNNER', icon: Cpu },
    { id: 'inventory', label: 'FILE HUB & GEAR', icon: Package },
    { id: 'bejson_db', label: 'BEJSON 105 DATABASE', icon: Database },
    { id: 'telemetry', label: 'TELEMETRY & PHYSICS', icon: Activity },
    { id: 'settings', label: 'ENGINE SETTINGS', icon: Settings },
    { id: 'meta_ui', label: 'ABOUT / META-UI', icon: Info }
  ];

  return (
    <div className="w-full bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap scrollbar-none select-none">
      {/* Scrollable Buttons Row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                if (t.id === 'js_parity' && onOpenJsParity) {
                  onOpenJsParity();
                } else {
                  onTabChange(t.id);
                }
              }}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#DE2626] text-white shadow-[0_0_10px_rgba(222,38,38,0.5)] border border-red-500'
                  : t.id === 'js_parity'
                  ? 'bg-zinc-800 hover:bg-[#DE2626] text-emerald-400 hover:text-white border border-emerald-600/50 hover:border-red-500'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : t.id === 'js_parity' ? 'text-emerald-400' : 'text-zinc-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Restart Level Action */}
      <button
        onClick={onResetGame}
        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        title="Reset Game State"
      >
        <RefreshCw className="w-3.5 h-3.5 text-[#DE2626]" />
        <span className="hidden sm:inline">RESET</span>
      </button>
    </div>
  );
};
