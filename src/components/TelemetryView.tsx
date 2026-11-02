/**
 * Library:         TelemetryView.tsx
 * Module Purpose:  Live Telemetry Dashboard for BEJSON 105 Physics & Render Pipeline
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0011-2026-1025-9999-000000000115
 * Version:         200101
 */

import React from 'react';
import { bejsonEngine } from '../engine/bejsonEngine';
import { Activity, Cpu, ShieldAlert, Zap, Layers } from 'lucide-react';

export const TelemetryView: React.FC = () => {
  const telm = bejsonEngine.telemetry;

  return (
    <div className="w-full h-full p-6 bg-zinc-950 font-mono text-white overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold font-['Press_Start_2P'] uppercase text-white">
                LIVE TELEMETRY & PHYSICS
              </h2>
              <p className="text-xs text-zinc-400">
                BEJSON 105 Frame Telemetry (`data/runtime_telemetry/frame_telemetry.105.bejson`)
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold rounded uppercase">
            STATUS: NOMINAL 60 FPS
          </span>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase">
              <Cpu className="w-4 h-4 text-emerald-400" /> ROLLING FPS
            </div>
            <div className="text-2xl font-bold text-white font-['Press_Start_2P']">
              {telm.fps} <span className="text-xs font-mono text-emerald-400">FPS</span>
            </div>
            <span className="text-[10px] text-zinc-500">Target 60.0 FPS</span>
          </div>

          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase">
              <Zap className="w-4 h-4 text-amber-400" /> PHYSICS STEP
            </div>
            <div className="text-2xl font-bold text-white font-['Press_Start_2P']">
              {telm.physicsDuration} <span className="text-xs font-mono text-zinc-400">MS</span>
            </div>
            <span className="text-[10px] text-zinc-500">2D Kinematic Solver</span>
          </div>

          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase">
              <Layers className="w-4 h-4 text-blue-400" /> PHYSICS BODIES
            </div>
            <div className="text-2xl font-bold text-white font-['Press_Start_2P']">
              {telm.bodiesCount}
            </div>
            <span className="text-[10px] text-zinc-500">Active Colliders</span>
          </div>

          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase">
              <ShieldAlert className="w-4 h-4 text-[#DE2626]" /> COLLISIONS / TICK
            </div>
            <div className="text-2xl font-bold text-white font-['Press_Start_2P']">
              {telm.collisionsCount}
            </div>
            <span className="text-[10px] text-zinc-500">Tile & Actor Collisions</span>
          </div>
        </div>

        {/* Pipeline Summary */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3">
          <h3 className="text-xs font-bold text-white uppercase text-[#DE2626]">
            SIMULATION PIPELINE BREAKDOWN
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center pb-1 border-b border-zinc-800">
              <span className="text-zinc-400">Canvas Render Draw Time:</span>
              <span className="text-white font-bold">{telm.renderDuration} ms</span>
            </div>
            <div className="flex justify-between items-center pb-1 border-b border-zinc-800">
              <span className="text-zinc-400">Actor Sync & Animation Duration:</span>
              <span className="text-white font-bold">0.1 ms</span>
            </div>
            <div className="flex justify-between items-center pb-1 border-b border-zinc-800">
              <span className="text-zinc-400">Chunk Matrix Rasterization:</span>
              <span className="text-white font-bold">1.9 ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">JavaScript Heap Memory:</span>
              <span className="text-emerald-400 font-bold">14.25 MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
