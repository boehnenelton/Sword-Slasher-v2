/**
 * Library:         SettingsModal.tsx
 * Module Purpose:  Full-Screen Overlay Engine Settings & Gemini API Key Governance Modal
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0008-2026-1025-9999-000000000112
 * Version:         300102
 */

import React, { useState } from 'react';
import { X, Key, Tv, Volume2, ShieldCheck, Lock, Wrench } from 'lucide-react';
import { soundEngine } from '../engine/soundEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  isDebugMode?: boolean;
  onToggleDebugMode?: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  crtEnabled,
  onToggleCrt,
  isDebugMode = false,
  onToggleDebugMode
}) => {
  const [enableExternalKeys, setEnableExternalKeys] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());

  if (!isOpen) return null;

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMute(next);
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 font-mono text-white select-none overflow-hidden">
      {/* Seamless Dark Floating Modal Box */}
      <div className="bg-zinc-950 border border-white/10 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl flex flex-col gap-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold uppercase text-white tracking-wider">
                SWORD SLASHER 2 ENGINE SETTINGS
              </h2>
              <p className="text-[11px] text-zinc-400 font-sans">
                Display Scanlines, Web Audio Synth, and Security Governance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-white/10 transition-colors cursor-pointer"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio & Display Settings */}
        <div className="space-y-4 bg-zinc-900/60 p-5 border border-white/5 rounded-xl">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            DISPLAY & AUDIO CONFIGURATION
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-200 flex items-center gap-2">
              <Tv className="w-4 h-4 text-zinc-400" /> RETRO CRT SCANLINES:
            </span>
            <button
              onClick={onToggleCrt}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors border ${
                crtEnabled
                  ? 'bg-red-600/90 text-white border-red-500'
                  : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              {crtEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-xs text-zinc-200 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-zinc-400" /> CHIPTUNE SOUNDTRACK:
            </span>
            <button
              onClick={toggleMute}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors border ${
                !isMuted
                  ? 'bg-emerald-600/90 text-white border-emerald-500'
                  : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              {!isMuted ? 'AUDIO ON' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* Debug World & Environment Isolation Switch */}
        <div className="space-y-3 bg-zinc-900/60 p-5 border border-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Wrench className="w-4 h-4 text-amber-400" /> DEBUG MODE SWITCH
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                Isolate debug testing chamber from real game world campaign.
              </p>
            </div>
            <button
              onClick={() => onToggleDebugMode && onToggleDebugMode(!isDebugMode)}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all border font-mono ${
                isDebugMode
                  ? 'bg-amber-600/90 text-white border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/30'
              }`}
            >
              {isDebugMode ? 'DEBUG: ON' : 'DEBUG: OFF'}
            </button>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-white/5 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-mono">ACTIVE REALM:</span>
            <span className={`font-bold font-mono ${isDebugMode ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isDebugMode ? '🔧 [DEBUG DOMAIN] TEST CHAMBER' : '🗡️ [GAME WORLD 1] CAMPAIGN REALM'}
            </span>
          </div>
        </div>

        {/* Gemini API Key Configuration (§11.2 Policy Standard) */}
        <div className="space-y-4 bg-zinc-900/60 p-5 border border-white/5 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
            <Key className="w-4 h-4 text-red-400" /> GEMINI API KEY GOVERNANCE
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans bg-zinc-950 p-3 rounded-lg border border-white/5">
            Default runtime utilizes built-in Google AI Studio credentials. Custom external API key slots remain locked by default.
          </p>

          {/* Policy Mandatory Checkbox */}
          <label className="flex items-center gap-3 text-xs text-zinc-200 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={enableExternalKeys}
              onChange={e => setEnableExternalKeys(e.target.checked)}
              className="w-4 h-4 accent-red-500 rounded cursor-pointer"
            />
            <span className="font-bold text-white">[ ] Enable External Custom Keys</span>
          </label>

          {enableExternalKeys ? (
            <div className="space-y-2 pt-2">
              <label className="text-[11px] text-zinc-400 block font-mono">Custom Gemini API Key Slot 1:</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={customApiKey}
                onChange={e => setCustomApiKey(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 text-xs px-3 py-2.5 rounded-lg text-white font-mono focus:outline-none focus:border-white/30"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40">
              <Lock className="w-3.5 h-3.5" /> Using Default Google AI Studio Credentials
            </div>
          )}
        </div>

        {/* Footer Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors shadow-lg"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
