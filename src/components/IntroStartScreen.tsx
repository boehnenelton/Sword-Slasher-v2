/**
 * Library:         IntroStartScreen.tsx
 * Module Purpose:  Clean Pixel Art Start Screen with Title, Start Game, AI Advisor, and System Controls
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0002-2026-1025-9999-000000000106
 * Version:         200103
 */

import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../engine/soundEngine';
import { Volume2, VolumeX, Play, Info, Sparkles, Terminal, ToggleLeft, ToggleRight } from 'lucide-react';

interface Props {
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenMetaUI: () => void;
  onOpenJsParity?: () => void;
  isFlaskSystemEnabled: boolean;
  onToggleFlaskSystem: () => void;
  onOpenFlaskSystem: () => void;
}

export const IntroStartScreen: React.FC<Props> = ({
  onStartGame,
  onOpenMetaUI,
  onOpenJsParity,
  isFlaskSystemEnabled,
  onToggleFlaskSystem,
  onOpenFlaskSystem
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());

  useEffect(() => {
    // Start music soundtrack
    soundEngine.playMusic();

    // Canvas dark particle ambient animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      ctx.fillStyle = '#050204';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid matrix visualization
      ctx.strokeStyle = '#1f080e';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Floating BEJSON cubes
      for (let i = 0; i < 10; i++) {
        const cx = (i * 80 + time * 15) % (canvas.width + 60) - 30;
        const cy = 60 + Math.sin(time + i) * 20 + i * 25;
        const size = 16 + (i % 3) * 6;

        ctx.fillStyle = '#DE2626';
        ctx.fillRect(cx, cy, size, size);
        ctx.fillStyle = '#831843';
        ctx.fillRect(cx + size, cy + 4, size / 2, size);
        ctx.fillStyle = '#9f1239';
        ctx.fillRect(cx + 4, cy - size / 2, size, size / 2);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMute(next);
    if (!next) soundEngine.playMusic();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black text-white font-mono overflow-hidden select-none">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
      />

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black bg-[length:100%_4px]" />

      {/* Main Start Container */}
      <div className="relative z-10 max-w-md w-full mx-4 p-8 bg-zinc-950/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-wider leading-tight uppercase">
            SHADOW LINK
          </h1>
          <p className="text-xs font-mono text-red-400 mt-2 tracking-widest uppercase font-bold">
            SWORD SLASHER RPG: SHADOW LINK'S AWAKENING
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => {
              soundEngine.playChimeSFX();
              onStartGame();
            }}
            className="w-full py-4 px-6 bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer border border-red-500/30"
          >
            <Play className="w-5 h-5 fill-current" /> START GAME
          </button>

          <button
            onClick={onOpenMetaUI}
            className="w-full py-3 px-6 bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-zinc-200 hover:text-white font-mono text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-red-400" /> ABOUT / META-UI
          </button>

          {/* System Menu Switch Toggle (Red/Green LED Light Indicator) */}
          <button
            onClick={onToggleFlaskSystem}
            className={`w-full py-2.5 px-4 border text-xs font-mono font-bold uppercase rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              isFlaskSystemEnabled
                ? 'bg-zinc-900 border-white/10 text-white'
                : 'bg-zinc-950 border-white/5 text-zinc-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <Terminal className={`w-4 h-4 ${isFlaskSystemEnabled ? 'text-red-400' : 'text-zinc-600'}`} />
              <span>SYSTEM MENU SWITCH</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold ${isFlaskSystemEnabled ? 'text-emerald-400' : 'text-red-500'}`}>
                {isFlaskSystemEnabled ? 'ON' : 'OFF'}
              </span>
              <div className={`w-3 h-3 rounded-full border shadow-sm transition-all ${
                isFlaskSystemEnabled
                  ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : 'bg-red-600 border-red-500 shadow-[0_0_6px_rgba(220,38,38,0.5)]'
              }`} />
            </div>
          </button>

          <button
            onClick={toggleMute}
            className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-900 border border-white/10 text-zinc-400 font-mono text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-red-400" />}
            {isMuted ? 'AUDIO: MUTED' : 'AUDIO: ON'}
          </button>
        </div>

        {/* Author Footer */}
        <div className="mt-6 text-[10px] font-mono text-zinc-500 tracking-tight border-t border-white/5 pt-3 w-full flex justify-between items-center">
          <span>Author: Elton Boehnen</span>
          <span>BEJSON 105 Engine</span>
        </div>
      </div>
    </div>
  );
};
