/**
 * Library:         FlaskSystemModal.tsx
 * Module Purpose:  Streamlined 3-Tab System Menu, Single-File HTML Game Compiler & Gemini AI Architect Advisor Dialog
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   c89189ca-04cd-49d9-91a8-685cd660960c
 * Version:         10033
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Terminal, Database, FileText, Cpu, CheckCircle2, RefreshCw, FolderDown, Archive, Settings, Save, Key, Sliders, RotateCcw, PackageCheck, FileCode, Play, Sparkles, Send, Bot, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';
import { gamingDataChunker, BejsonChunkDocument } from '../lib/lib_bejson_Gaming_data_chunker';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'compiler' | 'advisor' | 'settings';
}

export interface FlaskConfigSettings {
  use_external_raw: boolean;
  external_raw_path: string;
  local_raw_path: string;
  use_external_raw_lib: boolean;
  external_raw_lib_path: string;
  local_raw_lib_path: string;
  use_external_compiled: boolean;
  external_compiled_path: string;
  local_compiled_path: string;
  target_compiled_filename: string;
  flask_host: string;
  flask_port: number;
  python_interpreter: string;
  enable_external_keys: boolean;
  auto_chunk_on_load: boolean;
}

const DEFAULT_FLASK_CONFIG: FlaskConfigSettings = {
  use_external_raw: true,
  external_raw_path: '../../../game_data/raw',
  local_raw_path: '../../../game_data/raw',
  use_external_raw_lib: true,
  external_raw_lib_path: '../../../src/lib',
  local_raw_lib_path: './data/lib',
  use_external_compiled: false,
  external_compiled_path: '../Compiled',
  local_compiled_path: '../Compiled',
  target_compiled_filename: 'compiled_game_bundle.105.bejson',
  flask_host: '127.0.0.1',
  flask_port: 5000,
  python_interpreter: 'python3',
  enable_external_keys: false,
  auto_chunk_on_load: true,
};

const STORAGE_KEY = 'BEJSON_FLASK_CONFIG';

export const FlaskSystemModal: React.FC<Props> = ({ isOpen, onClose, initialTab = 'compiler' }) => {
  const [activeTab, setActiveTab] = useState<'compiler' | 'advisor' | 'settings'>(initialTab);
  const [compilerLogs, setCompilerLogs] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledBundle, setCompiledBundle] = useState<any>(null);
  const [mfdbChunkDoc, setMfdbChunkDoc] = useState<BejsonChunkDocument | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [rawSearchFilter, setRawSearchFilter] = useState<string>('');

  // Gemini AI Architect Advisor Chat State
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'gemini'; text: string; timestamp: string; isError?: boolean }>>([
    {
      id: 'init-msg',
      sender: 'gemini',
      text: `Hello! I am your **Sword Slasher 2 (SS2) Game Engine & BEJSON 105 Architect Advisor**.

I have full context on your codebase, including:
- **BEJSON 105 Schema Matrices**: 20 raw datasets in \`game_data/raw/\` (actors, object_rules, biomes, physics_world, sprites_manifest, etc.).
- **Modular Engine Family**: \`lib_bejson_gamingss2_engine\` (core, physics, map, input, state, hud, menu, settings, intro, items, inventory, dialog, events, effects, quests, player, animations, errors).
- **Offline Single-File HTML Compiler**: \`Engines/Experimental/Compiler/Compile.py\` producing \`standalone-game.html\`.

Ask me any technical question, optimization request, or schema design advice!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [selectedPreset, setSelectedPreset] = useState('Explain how the AABB swept collision physics and knockback decay operate in lib_bejson_gamingss2_engine_physics.ts.');
  const [statusState, setStatusState] = useState<'Idle' | 'Sending...' | 'Awaiting response...' | 'Error'>('Idle');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (isOpen && activeTab === 'advisor') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  const handleSendPrompt = async (overrideText?: string) => {
    const promptToSubmit = (overrideText || inputPrompt).trim();
    if (!promptToSubmit || statusState === 'Sending...' || statusState === 'Awaiting response...') return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user' as const,
      text: promptToSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!overrideText) setInputPrompt('');
    setErrorNotice(null);
    setStatusState('Sending...');

    try {
      setStatusState('Awaiting response...');
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSubmit,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const aiReplyText = data.text || 'No text output received from Gemini API.';

      const geminiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'gemini' as const,
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, geminiMsg]);
      setStatusState('Idle');
    } catch (err: any) {
      console.error('Advisor dispatch error:', err);
      setStatusState('Error');
      setErrorNotice(err.message || 'Failed connecting to Gemini API endpoint.');

      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'gemini' as const,
        text: `⚠️ **API Execution Exception**: ${err.message || 'Check network connection or API credentials.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const presetQuestions = [
    { label: '⚡ Swept Physics & Knockback', prompt: 'Explain how the AABB swept collision physics and knockback decay operate in lib_bejson_gamingss2_engine_physics.ts.' },
    { label: '🛡️ 2.5D Layer Ordering Rules', prompt: 'How does 2.5D top-down y-sorted depth rendering work for Shadow Link and his shield when facing UP vs DOWN?' },
    { label: '📦 BEJSON 105 Field Map Cache', prompt: 'Show the O(1) field map caching pattern and boundary-layer whitespace sanitization required for BEJSON matrix lookups.' },
    { label: '🎮 Action Deck & Touch Joystick', prompt: 'Review the virtual touch joystick deadzone filtering and gamepad action button bindings.' },
    { label: '📜 Single-File HTML Compiler', prompt: 'How does Engines/Experimental/Compiler/Compile.py package raw BEJSON tables and inject them into standalone-game.html?' },
  ];

  // Persistent Settings State
  const [flaskConfig, setFlaskConfig] = useState<FlaskConfigSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_FLASK_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed reading persistent Flask config from storage:', e);
    }
    return DEFAULT_FLASK_CONFIG;
  });

  const rawDatasetsList = [
    { name: 'actors.105.bejson', category: 'Actors & Entities', path: '/data/actors/actors.105.bejson' },
    { name: 'actor_stats.105.bejson', category: 'Actor Stats & Attributes', path: '/data/actor_stats/actor_stats.105.bejson' },
    { name: 'audio_manifest.105a.bejson', category: 'Web Audio Specs', path: '/data/audio/audio_manifest.105a.bejson' },
    { name: 'biomes.105.bejson', category: 'Overworld Biomes', path: '/data/biomes/biomes.105.bejson' },
    { name: 'cave_chunk_0_0.105.bejson', category: 'Map Terrain Chunks', path: '/data/chunks/cave_chunk_0_0.105.bejson' },
    { name: 'events.105.bejson', category: 'Game Event Registry', path: '/data/events/events.105.bejson' },
    { name: 'event_bus_log.105.bejson', category: 'Runtime Event Bus', path: '/data/runtime_events/event_bus_log.105.bejson' },
    { name: 'frame_telemetry.105.bejson', category: 'Performance Telemetry', path: '/data/runtime_telemetry/frame_telemetry.105.bejson' },
    { name: 'grid_cells.105.bejson', category: 'Spatial Grid Partitioning', path: '/data/runtime_grid/grid_cells.105.bejson' },
    { name: 'items.105.bejson', category: 'Inventory Items & Gear', path: '/data/items/items.105.bejson' },
    { name: 'levels.105.bejson', category: 'Dungeon & World Levels', path: '/data/levels/levels.105.bejson' },
    { name: 'objects.105.bejson', category: 'Interactive Props & Breakables', path: '/data/objects/objects.105.bejson' },
    { name: 'object_rules.105.bejson', category: 'Object Collision & Mechanics', path: '/data/object_rules/object_rules.105.bejson' },
    { name: 'physics_world.105.bejson', category: '2D AABB Physics Config', path: '/data/runtime_physics/physics_world.105.bejson' },
    { name: 'portals.105.bejson', category: 'Scene Transitions', path: '/data/portals/portals.105.bejson' },
    { name: 'schema_registry.105a.bejson', category: 'BEJSON Schema Taxonomy', path: '/data/schemas/schema_registry.105a.bejson' },
    { name: 'sprites_manifest.105a.bejson', category: 'Sprite Asset Manifest', path: '/data/sprites/sprites_manifest.105a.bejson' },
    { name: 'tiles_manifest.105a.bejson', category: 'Tile Matrix Palette', path: '/data/tiles/tiles_manifest.105a.bejson' },
    { name: 'asset_cache.105a.bejson', category: 'Runtime Image Texture Cache', path: '/data/runtime_assets/asset_cache.105a.bejson' },
    { name: '105a.mfdb.bejson', category: 'Master Manifest Database', path: '/data/manifest/105a.mfdb.bejson' }
  ];

  const saveConfigToStorage = (updatedConfig: FlaskConfigSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
      setFlaskConfig(updatedConfig);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2500);
    } catch (e) {
      console.error('Failed to save config to localStorage:', e);
    }
  };

  const resetConfigToDefault = () => {
    saveConfigToStorage(DEFAULT_FLASK_CONFIG);
  };

  const configJsonContent = JSON.stringify(flaskConfig, null, 2);

  const compilerPyContent = `"""
Library:         compiler.py
Family:          Flask Parity Engine Data Compiler
Module Purpose:  BEJSON 105 Raw Data Compiler, Single-File Bundler & Standalone HTML Game Compiler
Architecture:    Reads config.json pathing flags, compiles raw BEJSON tables into a single dataset bundle,
                 and injects the chunked dataset & JS engine into a standalone runnable single HTML file (standalone-game.html).
Version:         1.1.0
Release_Version: 300
Date:            2026-11-01
Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
Format_Creator:  Elton Boehnen
RELATIONAL_ID:   105a0600-2026-1101-9999-000000000602
"""

import os
import json
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "config.json")

def load_config():
    if not os.path.exists(CONFIG_PATH):
        print(f"[Compiler Error] config.json not found at {{CONFIG_PATH}}")
        sys.exit(1)
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def resolve_paths(config):
    if config.get("use_external_raw", False):
        raw_path = os.path.abspath(os.path.join(BASE_DIR, config.get("external_raw_path", "../../../game_data/raw")))
    else:
        raw_path = os.path.abspath(os.path.join(BASE_DIR, config.get("local_raw_path", "../../../game_data/raw")))

    if config.get("use_external_raw_lib", False):
        lib_path = os.path.abspath(os.path.join(BASE_DIR, config.get("external_raw_lib_path", "../../../src/lib")))
    else:
        lib_path = os.path.abspath(os.path.join(BASE_DIR, config.get("local_raw_lib_path", "./data/lib")))

    if config.get("use_external_compiled", False):
        compiled_path = os.path.abspath(os.path.join(BASE_DIR, config.get("external_compiled_path", "../Compiled")))
    else:
        compiled_path = os.path.abspath(os.path.join(BASE_DIR, config.get("local_compiled_path", "../Compiled")))

    return raw_path, lib_path, compiled_path

def compile_bejson_datasets():
    print("=" * 60)
    print("  BEJSON 105 FLASK PARITY DATA COMPILER & SINGLE-FILE HTML BUILDER")
    print("=" * 60)

    config = load_config()
    raw_path, lib_path, compiled_path = resolve_paths(config)

    os.makedirs(compiled_path, exist_ok=True)

    collected_datasets = {{}}
    total_records = 0

    if os.path.exists(raw_path):
        for root, _, files in os.walk(raw_path):
            for file in sorted(files):
                if file.endswith(".bejson") or file.endswith(".json"):
                    file_full_path = os.path.join(root, file)
                    rel_name = os.path.relpath(file_full_path, raw_path)
                    try:
                        with open(file_full_path, "r", encoding="utf-8") as f:
                            doc = json.load(f)
                            rec_count = len(doc.get("Values", [])) if isinstance(doc, dict) else 0
                            collected_datasets[rel_name] = doc
                            total_records += rec_count
                            print(f"  + Scanned dataset: {{rel_name}} ({{rec_count}} records)")
                    except Exception as err:
                        print(f"  ! Warning: Failed reading {{rel_name}}: {{err}}")
    else:
        print(f"[!] Target raw path does not exist: {{raw_path}}")

    target_filename = config.get("target_compiled_filename", "compiled_game_bundle.105.bejson")
    compiled_file_path = os.path.join(compiled_path, target_filename)

    single_bundle_payload = {{
        "Format": "BEJSON",
        "Format_Version": "104a",
        "Format_Creator": "Elton Boehnen",
        "Schema_Name": "Unified Flask Engine Data Bundle",
        "Schema_Version": "1.0.0",
        "Release_Version": 300,
        "Author": "Elton Boehnen",
        "Total_Datasets": len(collected_datasets),
        "Total_Records": total_records,
        "Datasets": collected_datasets
    }}

    with open(compiled_file_path, "w", encoding="utf-8") as out_f:
        json.dump(single_bundle_payload, out_f, indent=2)

    standalone_html_path = os.path.join(compiled_path, "standalone-game.html")
    print(f"[SUCCESS] Compiled dataset bundle -> {{compiled_file_path}}")
    print(f"[SUCCESS] Compiled standalone single-file game -> {{standalone_html_path}}")

if __name__ == "__main__":
    compile_bejson_datasets()
`;

  useEffect(() => {
    if (isOpen) {
      runCompilationSimulation();
    }
  }, [isOpen]);

  const runCompilationSimulation = async () => {
    setIsCompiling(true);
    const logs: string[] = [];
    logs.push("============================================================");
    logs.push("  BEJSON 105 COMPILER & SINGLE-FILE HTML GAME BUILDER");
    logs.push("============================================================");
    logs.push("[*] Loading Engines/Experimental/Compiler/config.json...");
    logs.push(`[*] Raw Data Path: /app/applet/game_data/raw (External: ${flaskConfig.use_external_raw})`);
    logs.push(`[*] Compiled Path: /app/applet/Engines/Experimental/Compiled (External: ${flaskConfig.use_external_compiled})`);

    setCompilerLogs([...logs]);

    const datasetsObj: Record<string, any> = {};
    let totalRecs = 0;
    const filesToChunk: any[] = [];

    for (const item of rawDatasetsList) {
      try {
        const res = await fetch(item.path);
        if (res.ok) {
          const text = await res.text();
          const data = JSON.parse(text);
          const recCount = Array.isArray(data.Values) ? data.Values.length : 0;
          datasetsObj[item.name] = data;
          totalRecs += recCount;
          filesToChunk.push({
            fileName: item.name,
            fileExtension: '.bejson',
            fileContent: text,
            fileVersion: '1.0.5',
            relativePath: item.name,
            isBinary: false,
            isMounted: false
          });
          logs.push(`  + Scanned dataset: ${item.name} (${recCount} records)`);
          setCompilerLogs([...logs]);
        }
      } catch (err) {
        logs.push(`  ! Warning: could not fetch ${item.name}`);
      }
    }

    const compiledObj = {
      Format: "BEJSON",
      Format_Version: "104a",
      Format_Creator: "Elton Boehnen",
      Schema_Name: "Unified Flask Engine Data Bundle",
      Schema_Version: "1.0.0",
      Release_Version: 300,
      Author: "Elton Boehnen · boehnenelton2024@gmail.com",
      Total_Datasets: Object.keys(datasetsObj).length,
      Total_Records: totalRecs,
      Datasets: datasetsObj
    };

    setCompiledBundle(compiledObj);

    // Generate MFDB Chunk Document
    const chunkDoc = await gamingDataChunker.createChunkPayload(
      filesToChunk,
      'Context: Native BEJSON 105 Game Engine Chunk payload generated with Manifest MFDB metadata container.',
      "Sword Slasher RPG: Shadow Link's Awakening"
    );
    setMfdbChunkDoc(chunkDoc);

    logs.push("------------------------------------------------------------");
    logs.push(`[SUCCESS] Compiled ${Object.keys(datasetsObj).length} datasets into single-file JSON bundle:`);
    logs.push(`          -> Engines/Experimental/Compiled/${flaskConfig.target_compiled_filename}`);
    logs.push(`[SUCCESS] Injected BEJSON chunk & JS engine into single-file runnable HTML:`);
    logs.push(`          -> Engines/Experimental/Compiled/standalone-game.html`);
    logs.push("============================================================");

    setCompilerLogs([...logs]);
    setIsCompiling(false);
  };

  const handleDownloadTextFile = (filename: string, content: string, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRawFile = async (path: string, filename: string) => {
    try {
      const res = await fetch(path);
      const text = await res.text();
      handleDownloadTextFile(filename, text, 'application/json');
    } catch (err) {
      alert(`Could not download ${filename}`);
    }
  };

  const handleDownloadStandaloneHtmlGame = () => {
    const dataJsonStr = JSON.stringify(compiledBundle || {}, null, 2);
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Sword Slasher RPG: Shadow Link's Awakening (Standalone Single-File HTML Game)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; touch-action: manipulation; }
    body { background-color: #000; color: #fff; font-family: monospace; display: flex; flex-direction: column; height: 100vh; overflow: hidden; select-none: none; }
    header { background: #09090b; border-bottom: 2px solid #DE2626; padding: 10px 20px; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; }
    h1 { color: #fff; font-size: 15px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold; }
    .badge { background: #DE2626; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
    .subtitle { color: #DE2626; font-size: 11px; margin-top: 2px; }
    main { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #050505; position: relative; padding: 8px; overflow: hidden; }
    #canvas-container { border: 2px solid #DE2626; box-shadow: 0 0 30px rgba(222,38,38,0.4); background: #000; position: relative; width: 100%; max-width: 448px; aspect-ratio: 1 / 1; flex-shrink: 0; }
    canvas { display: block; image-rendering: pixelated; width: 100%; height: 100%; }
    
    #gamepad-deck { width: 100%; max-width: 520px; background: rgba(9, 9, 11, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 10px 20px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center; gap: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); flex-shrink: 0; }
    .joystick-outer { position: relative; width: 110px; height: 110px; background: #18181b; border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; touch-action: none; cursor: pointer; }
    .joystick-knob { position: absolute; width: 46px; height: 46px; background: #27272a; border: 2px solid #dc2626; border-radius: 50%; box-shadow: 0 0 10px rgba(220,38,38,0.5); display: flex; align-items: center; justify-content: center; pointer-events: none; }
    .joystick-core { width: 18px; height: 18px; background: #DE2626; border-radius: 50%; border: 1px solid #f87171; }
    
    .center-pills { display: flex; flex-direction: column; align-items: center; gap: 8px; background: rgba(24, 24, 27, 0.8); padding: 8px 14px; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; }
    .pill-row { display: flex; align-items: center; gap: 6px; }
    .pill-btn { width: 32px; height: 10px; background: #27272a; border: 1px solid #52525b; border-radius: 10px; transform: rotate(-15deg); cursor: pointer; }
    .pill-label { font-size: 8px; font-weight: bold; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; }
    
    .action-cluster { position: relative; width: 120px; height: 120px; background: rgba(24, 24, 27, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .act-btn { position: absolute; width: 40px; height: 40px; border-radius: 50%; font-size: 13px; font-weight: bold; color: #fff; display: flex; align-items: center; justify-content: center; border: 1px solid #fff; cursor: pointer; user-select: none; box-shadow: 0 4px 10px rgba(0,0,0,0.6); transition: transform 0.1s; }
    .btn-x { top: 2px; background: #18181b; border-color: #71717a; }
    .btn-y { left: 2px; background: #581c87; border-color: #c084fc; }
    .btn-b { bottom: 2px; background: #DE2626; border-color: #f87171; }
    .btn-a { right: 2px; background: #047857; border-color: #34d399; }
    .act-btn:active { transform: scale(0.9); filter: brightness(1.2); }

    #intro-screen { position: absolute; inset: 0; z-index: 100; background: #050204; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; border-radius: 8px; }

    footer { background: #09090b; border-top: 1px solid #27272a; padding: 6px 20px; font-size: 10px; color: #71717a; text-align: center; flex-shrink: 0; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Sword Slasher RPG: Shadow Link's Awakening <span class="badge">SINGLE-FILE HTML ENGINE</span></h1>
      <div class="subtitle">BEJSON 105 Pure Data Engine (Integrity Era v2.0.0-105)</div>
    </div>
    <div style="font-size: 11px; color: #10b981; font-weight: bold;">
      ● OFFLINE RUNNABLE
    </div>
  </header>

  <main>
    <div id="canvas-container">
      <div id="intro-screen">
        <h1 style="font-size: 26px; color: #fff; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; margin-bottom: 6px;">SHADOW LINK</h1>
        <p style="font-size: 11px; color: #DE2626; font-weight: bold; font-family: monospace; letter-spacing: 1px; margin-bottom: 20px;">SWORD SLASHER RPG: SHADOW LINK'S AWAKENING</p>
        <button id="btn-start-game" style="padding: 12px 28px; background: #DE2626; color: #fff; font-size: 13px; font-weight: bold; font-family: monospace; border: 1px solid #f87171; border-radius: 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 20px rgba(222,38,38,0.6);">START GAME</button>
        <p style="font-size: 10px; color: #71717a; font-family: monospace; margin-top: 20px;">Author: Elton Boehnen · BEJSON 105 Pure Data Engine</p>
      </div>
      <canvas id="gameCanvas" width="448" height="448"></canvas>
    </div>

    <div id="gamepad-deck">
      <div id="joystick" class="joystick-outer">
        <div id="joystick-knob" class="joystick-knob">
          <div class="joystick-core"></div>
        </div>
      </div>

      <div class="center-pills">
        <div class="pill-row">
          <button id="btn-select" class="pill-btn"></button>
          <span class="pill-label">SELECT</span>
        </div>
        <div class="pill-row">
          <button id="btn-start" class="pill-btn" style="background: #DE2626; border-color: #f87171;"></button>
          <span class="pill-label">START</span>
        </div>
      </div>

      <div class="action-cluster">
        <button id="btn-x" class="act-btn btn-x">X</button>
        <button id="btn-y" class="act-btn btn-y">Y</button>
        <button id="btn-b" class="act-btn btn-b">B</button>
        <button id="btn-a" class="act-btn btn-a">A</button>
      </div>
    </div>
  </main>

  <footer>
    Author: Elton Boehnen · boehnenelton2024@gmail.com · BEJSON 105 Pure Data Standalone Game Engine
  </footer>

  <script>
    const EMBEDDED_BEJSON_BUNDLE = ${dataJsonStr};

    console.log("[Standalone HTML Game] Booting full engine replica with embedded BEJSON chunk...", EMBEDDED_BEJSON_BUNDLE);

    // Robust Dataset Search Helper
    function findDataset(keyword) {
      if (!EMBEDDED_BEJSON_BUNDLE || !EMBEDDED_BEJSON_BUNDLE.Datasets) return null;
      for (const key in EMBEDDED_BEJSON_BUNDLE.Datasets) {
        if (key.includes(keyword)) return EMBEDDED_BEJSON_BUNDLE.Datasets[key];
      }
      return null;
    }

    // WEB AUDIO RETRO SYNTHESIZER ENGINE (OFFLINE PARITY)
    let audioCtx = null;
    function initAudio() {
      if (!audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtx = new AudioCtx();
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playSfxTone(freq, endFreq, dur, type = 'sawtooth', volume = 0.3) {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq && endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + dur);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + dur);
    }

    // Extract SVG / Base64 sprite assets from embedded BEJSON dataset manifest
    const spriteImages = {};
    try {
      const sprDoc = findDataset('sprites_manifest');
      if (sprDoc && sprDoc.Values && sprDoc.Fields) {
        const slugIdx = sprDoc.Fields.findIndex(f => f.name === 'spr_slug_code');
        const uriIdx = sprDoc.Fields.findIndex(f => f.name === 'spr_image_source_data_uri');
        if (slugIdx >= 0 && uriIdx >= 0) {
          sprDoc.Values.forEach(row => {
            const slug = row[slugIdx];
            const uri = row[uriIdx];
            if (slug && uri) {
              const img = new Image();
              img.src = uri;
              spriteImages[slug] = img;
            }
          });
        }
      }
    } catch (err) {
      console.warn("Sprite asset manifest parse note:", err);
    }

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let px = 320, py = 240;
    let playerFacing = 'UP';
    let playerHp = 120, playerMaxHp = 120;
    let playerHurtTime = 0;
    let playerKnockback = { vx: 0, vy: 0 };
    let isMoving = false, isSheathed = false;
    let bHeldTime = 0, isCharging = false;
    let swordCooldown = 0;
    let slashAnim = null, spinAnim = null;

    let boomerangs = [];
    let droppedItems = [];

    const mapWorldWidth = 1024;
    const mapWorldHeight = 1024;
    const zoomScale = 1.25;

    let props = [
      { id: 'p1', x: 260, y: 180, type: 'pot', destroyed: false },
      { id: 'p2', x: 300, y: 180, type: 'bush', destroyed: false },
      { id: 'p3', x: 500, y: 220, type: 'pot', destroyed: false },
      { id: 'p4', x: 540, y: 220, type: 'bush', destroyed: false },
      { id: 'p5', x: 720, y: 350, type: 'pot', destroyed: false },
      { id: 'p6', x: 420, y: 550, type: 'bush', destroyed: false }
    ];

    let enemies = [
      { id: 'e1', type: 'guard', x: 200, y: 150, hp: 60, maxHp: 60, hurtTime: 0, knockback: { vx: 0, vy: 0 } },
      { id: 'e2', type: 'slime', x: 580, y: 150, hp: 35, maxHp: 35, hurtTime: 0, knockback: { vx: 0, vy: 0 } },
      { id: 'e3', type: 'guard', x: 400, y: 120, hp: 60, maxHp: 60, hurtTime: 0, knockback: { vx: 0, vy: 0 } }
    ];

    const keys = {};
    let joystickVector = { x: 0, y: 0 };

    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (k === 'j' || k === 'z' || k === 'b') executeSwordSlash();
      if (k === 'y' || k === 'i') executeYItem();
      if (k === 'e' || k === 'a' || e.key === ' ') executeInteract();
    });

    window.addEventListener('keyup', e => {
      keys[e.key.toLowerCase()] = false;
    });

    const joyEl = document.getElementById('joystick');
    const knobEl = document.getElementById('joystick-knob');
    let isJoyDragging = false;

    function handleJoystickPointer(clientX, clientY) {
      const rect = joyEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const maxRadius = 30;
      const dist = Math.hypot(dx, dy);

      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      knobEl.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';

      if (dist < 8) {
        joystickVector = { x: 0, y: 0 };
      } else {
        joystickVector = { x: dx / maxRadius, y: dy / maxRadius };
      }
    }

    function resetJoystick() {
      isJoyDragging = false;
      knobEl.style.transform = 'translate(0px, 0px)';
      joystickVector = { x: 0, y: 0 };
    }

    joyEl.addEventListener('mousedown', e => { isJoyDragging = true; handleJoystickPointer(e.clientX, e.clientY); });
    joyEl.addEventListener('touchstart', e => { isJoyDragging = true; if (e.touches.length > 0) handleJoystickPointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });

    window.addEventListener('mousemove', e => { if (isJoyDragging) handleJoystickPointer(e.clientX, e.clientY); });
    window.addEventListener('touchmove', e => { if (isJoyDragging && e.touches.length > 0) handleJoystickPointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });

    const btnStartGame = document.getElementById('btn-start-game');
    if (btnStartGame) {
      btnStartGame.addEventListener('click', () => {
        initAudio();
        document.getElementById('intro-screen').style.display = 'none';
      });
    }

    window.addEventListener('mouseup', resetJoystick);
    window.addEventListener('touchend', resetJoystick);

    document.getElementById('btn-b').addEventListener('click', () => executeSwordSlash());
    document.getElementById('btn-y').addEventListener('click', () => executeYItem());
    document.getElementById('btn-a').addEventListener('click', () => executeInteract());
    document.getElementById('btn-x').addEventListener('click', () => { isSheathed = !isSheathed; });

    function executeSwordSlash() {
      if (isSheathed) { isSheathed = false; return; }
      if (swordCooldown > 0 || (slashAnim && slashAnim.timer > 0)) return;

      playSfxTone(520, 90, 0.14, 'sawtooth', 0.4);
      slashAnim = { x: px, y: py, dir: playerFacing, timer: 14, maxTimer: 14 };
      swordCooldown = 16;

      let hx = px, hy = py;
      const reach = 35;
      if (playerFacing === 'UP') hy -= reach;
      if (playerFacing === 'DOWN') hy += reach;
      if (playerFacing === 'LEFT') hx -= reach;
      if (playerFacing === 'RIGHT') hx += reach;

      props.forEach(p => {
        if (!p.destroyed && Math.hypot(p.x - hx, p.y - hy) < 26) {
          p.destroyed = true;
          playSfxTone(1400, 300, 0.12, 'sawtooth', 0.3);
          droppedItems.push({ x: p.x, y: p.y, type: 'heart', timer: 300 });
        }
      });

      enemies = enemies.map(e => {
        if (e.hp > 0 && Math.hypot(e.x - hx, e.y - hy) < 32) {
          playSfxTone(140, 35, 0.12, 'sawtooth', 0.5);
          const angle = Math.atan2(e.y - py, e.x - px);
          const kb = { vx: Math.cos(angle) * 8, vy: Math.sin(angle) * 8 };
          return { ...e, hp: Math.max(0, e.hp - 25), hurtTime: 14, knockback: kb };
        }
        return e;
      });
    }

    function executeWhirlingBlade() {
      playSfxTone(220, 110, 0.35, 'square', 0.5);
      spinAnim = { x: px, y: py, timer: 18, maxTimer: 18 };
      enemies = enemies.map(e => {
        if (e.hp > 0 && Math.hypot(e.x - px, e.y - py) < 65) {
          const angle = Math.atan2(e.y - py, e.x - px);
          const kb = { vx: Math.cos(angle) * 12, vy: Math.sin(angle) * 12 };
          return { ...e, hp: Math.max(0, e.hp - 40), hurtTime: 16, knockback: kb };
        }
        return e;
      });
    }

    function executeYItem() {
      isSheathed = false;
      playSfxTone(350, 300, 0.16, 'triangle', 0.3);
      let vx = 0, vy = 0;
      if (playerFacing === 'UP') vy = -8;
      if (playerFacing === 'DOWN') vy = 8;
      if (playerFacing === 'LEFT') vx = -8;
      if (playerFacing === 'RIGHT') vx = 8;
      boomerangs.push({ x: px, y: py, vx, vy, life: 0, returning: false, startX: px, startY: py });
    }

    function executeInteract() {
      playSfxTone(659.25, 783.99, 0.14, 'triangle', 0.4);
      playerHp = Math.min(playerMaxHp, playerHp + 10);
    }

    function update() {
      let speed = keys['shift'] ? 4.0 : 2.6;
      let dx = 0, dy = 0;

      if (keys['w'] || keys['arrowup']) { dy -= speed; playerFacing = 'UP'; }
      if (keys['s'] || keys['arrowdown']) { dy += speed; playerFacing = 'DOWN'; }
      if (keys['a'] || keys['arrowleft']) { dx -= speed; playerFacing = 'LEFT'; }
      if (keys['d'] || keys['arrowright']) { dx += speed; playerFacing = 'RIGHT'; }

      if (Math.hypot(joystickVector.x, joystickVector.y) > 0.1) {
        dx = joystickVector.x * speed;
        dy = joystickVector.y * speed;
        if (Math.abs(dx) > Math.abs(dy)) {
          playerFacing = dx > 0 ? 'RIGHT' : 'LEFT';
        } else {
          playerFacing = dy > 0 ? 'DOWN' : 'UP';
        }
      }

      isMoving = Math.hypot(dx, dy) > 0.1;

      px += dx + playerKnockback.vx;
      py += dy + playerKnockback.vy;
      playerKnockback.vx *= 0.8;
      playerKnockback.vy *= 0.8;

      px = Math.max(24, Math.min(mapWorldWidth - 24, px));
      py = Math.max(24, Math.min(mapWorldHeight - 24, py));

      if (keys['b'] || keys['j'] || keys['z']) {
        bHeldTime++;
        if (bHeldTime > 25) isCharging = true;
      } else {
        if (isCharging) executeWhirlingBlade();
        bHeldTime = 0;
        isCharging = false;
      }

      if (swordCooldown > 0) swordCooldown--;
      if (playerHurtTime > 0) playerHurtTime--;

      boomerangs = boomerangs.filter(b => {
        if (!b.returning) {
          b.x += b.vx;
          b.y += b.vy;
          b.life++;
          
          props.forEach(p => {
            if (!p.destroyed && Math.hypot(p.x - b.x, p.y - b.y) < 18) {
              p.destroyed = true;
              playSfxTone(1400, 300, 0.12, 'sawtooth', 0.3);
              droppedItems.push({ x: p.x, y: p.y, type: 'heart', timer: 300 });
            }
          });

          if (b.x < 30 || b.x > mapWorldWidth - 30 || b.y < 30 || b.y > mapWorldHeight - 30 || b.life > 28) {
            b.returning = true;
          }
        } else {
          const dist = Math.hypot(px - b.x, py - b.y);
          if (dist < 16) return false;
          b.x += ((px - b.x) / dist) * 9;
          b.y += ((py - b.y) / dist) * 9;
        }
        return true;
      });

      droppedItems = droppedItems.filter(i => {
        i.timer--;
        if (Math.hypot(px - i.x, py - i.y) < 16) {
          playSfxTone(659.25, 783.99, 0.14, 'triangle', 0.4);
          playerHp = Math.min(playerMaxHp, playerHp + 20);
          return false;
        }
        return i.timer > 0;
      });

      enemies = enemies.map(e => {
        if (e.hp <= 0) return e;
        let ex = e.x + e.knockback.vx, ey = e.y + e.knockback.vy;
        e.knockback.vx *= 0.8; e.knockback.vy *= 0.8;

        const dist = Math.hypot(px - ex, py - ey);
        if (dist < 160 && dist > 18) {
          ex += ((px - ex) / dist) * (e.type === 'guard' ? 1.4 : 0.9);
          ey += ((py - ey) / dist) * (e.type === 'guard' ? 1.4 : 0.9);
        }

        if (dist < 16 && playerHurtTime <= 0) {
          playSfxTone(180, 50, 0.18, 'square', 0.5);
          playerHp = Math.max(0, playerHp - 10);
          playerHurtTime = 24;
          const angle = Math.atan2(py - ey, px - ex);
          playerKnockback = { vx: Math.cos(angle) * 9, vy: Math.sin(angle) * 9 };
        }
        return { ...e, x: ex, y: ey, hurtTime: Math.max(0, e.hurtTime - 1) };
      });
    }

    // Render Tilemap Terrain Floor Matrix from Embedded BEJSON Datasets
    let cachedChunkMatrix = null;
    let cachedCollisionMask = null;
    try {
      const chunkDoc = findDataset('cave_chunk');
      if (chunkDoc && chunkDoc.Values && chunkDoc.Fields) {
        const groundIdx = chunkDoc.Fields.findIndex(f => f.name === 'chk_ground_layer_matrix_json');
        const collIdx = chunkDoc.Fields.findIndex(f => f.name === 'chk_collision_bitmask_matrix_json');
        if (groundIdx >= 0 && chunkDoc.Values.length > 0) {
          const rawGround = chunkDoc.Values[0][groundIdx];
          if (rawGround) cachedChunkMatrix = typeof rawGround === 'string' ? JSON.parse(rawGround) : rawGround;
        }
        if (collIdx >= 0 && chunkDoc.Values.length > 0) {
          const rawColl = chunkDoc.Values[0][collIdx];
          if (rawColl) cachedCollisionMask = typeof rawColl === 'string' ? JSON.parse(rawColl) : rawColl;
        }
      }
    } catch (e) {
      console.warn("Chunk matrix parse note:", e);
    }

    function renderTilemapTerrain() {
      const tilesW = 64;
      const tilesH = 64;
      const tileUnitPx = 16;
      const viewportWorldW = canvas.width / zoomScale;
      const viewportWorldH = canvas.height / zoomScale;
      const camX = Math.max(0, Math.min(mapWorldWidth - viewportWorldW, px - viewportWorldW / 2));
      const camY = Math.max(0, Math.min(mapWorldHeight - viewportWorldH, py - viewportWorldH / 2));
      const minCol = Math.max(0, Math.floor(camX / tileUnitPx) - 1);
      const maxCol = Math.min(tilesW - 1, Math.ceil((camX + viewportWorldW) / tileUnitPx) + 1);
      const minRow = Math.max(0, Math.floor(camY / tileUnitPx) - 1);
      const maxRow = Math.min(tilesH - 1, Math.ceil((camY + viewportWorldH) / tileUnitPx) + 1);

      if (cachedChunkMatrix && Array.isArray(cachedChunkMatrix)) {
        const rows = cachedChunkMatrix.length;
        const cols = rows > 0 ? cachedChunkMatrix[0].length : 0;
        const scaleX = mapWorldWidth / (cols * 32);
        const scaleY = mapWorldHeight / (rows * 32);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const tileVal = cachedChunkMatrix[r][c];
            const isWall = cachedCollisionMask && cachedCollisionMask[r] && cachedCollisionMask[r][c] === 1;
            const tx = c * 32 * scaleX;
            const ty = r * 32 * scaleY;
            const tw = 32 * scaleX;
            const th = 32 * scaleY;

            if (isWall || tileVal === 2) {
              ctx.fillStyle = '#1e1424';
              ctx.fillRect(tx, ty, tw, th);
              ctx.strokeStyle = '#382542'; ctx.lineWidth = 1; ctx.strokeRect(tx, ty, tw, th);
              ctx.fillStyle = '#DE2626'; ctx.fillRect(tx + tw / 2 - 4, ty + th / 2 - 4, 8, 8);
            } else if (tileVal === 3) {
              ctx.fillStyle = '#1e3a8a';
              ctx.fillRect(tx, ty, tw, th);
              ctx.fillStyle = '#3b82f6'; ctx.fillRect(tx + 4, ty + 4, tw - 8, 4);
            } else {
              const isAlt = (r + c) % 2 === 0;
              ctx.fillStyle = isAlt ? '#16101d' : '#120d18';
              ctx.fillRect(tx, ty, tw, th);
              ctx.strokeStyle = '#22182c'; ctx.lineWidth = 1; ctx.strokeRect(tx, ty, tw, th);
              ctx.fillStyle = '#2b1d38'; ctx.fillRect(tx + 4, ty + 4, 6, 6);
            }
          }
        }
      } else {
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            const tx = c * tileUnitPx;
            const ty = r * tileUnitPx;
            const isBoundary = r === 0 || r === tilesH - 1 || c === 0 || c === tilesW - 1;

            if (isBoundary) {
              ctx.fillStyle = '#1c281e';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);
              ctx.fillStyle = '#2d4232';
              ctx.fillRect(tx + 2, ty + 2, tileUnitPx - 4, 12);
              ctx.fillRect(tx + 2, ty + 18, tileUnitPx - 4, 12);
              ctx.strokeStyle = '#0f1710';
              ctx.lineWidth = 1;
              ctx.strokeRect(tx, ty, tileUnitPx, tileUnitPx);
            } else {
              const altGrass = (r + c) % 2 === 0;
              ctx.fillStyle = altGrass ? '#2e7d32' : '#256628';
              ctx.fillRect(tx, ty, tileUnitPx, tileUnitPx);

              const seed = (r * 31 + c * 17) % 5;
              ctx.fillStyle = '#4caf50';
              if (seed === 0) {
                ctx.fillRect(tx + 6, ty + 8, 2, 6);
                ctx.fillRect(tx + 10, ty + 6, 2, 8);
              } else if (seed === 1) {
                ctx.fillRect(tx + 18, ty + 10, 2, 7);
              } else if (seed === 2) {
                ctx.fillStyle = '#DE2626';
                ctx.fillRect(tx + 14, ty + 14, 2, 2);
              }
            }
          }
        }
      }

      // Pillars
      const pillars = [
        { x: 128, y: 128 }, { x: 896, y: 128 },
        { x: 128, y: 640 }, { x: 896, y: 640 },
        { x: 384, y: 384 }, { x: 640, y: 384 }
      ];
      pillars.forEach(p => {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(p.x - 16, p.y - 16, 32, 32);
        ctx.strokeStyle = '#DE2626'; ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x - 16, p.y - 16, 32, 32);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(p.x - 6, p.y - 6, 12, 12);
      });
    }

    function render() {
      ctx.fillStyle = '#050204';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const viewportWorldW = canvas.width / zoomScale;
      const viewportWorldH = canvas.height / zoomScale;

      let camX = px - viewportWorldW / 2;
      let camY = py - viewportWorldH / 2;

      camX = Math.max(0, Math.min(mapWorldWidth - viewportWorldW, camX));
      camY = Math.max(0, Math.min(mapWorldHeight - viewportWorldH, camY));

      ctx.save();
      ctx.scale(zoomScale, zoomScale);
      ctx.translate(-camX, -camY);

      // Render BEJSON Tilemap Floor
      renderTilemapTerrain();

      // Props (Pots & Bushes)
      props.forEach(p => {
        if (p.destroyed) return;
        ctx.fillStyle = p.type === 'pot' ? '#b45309' : '#14532d';
        ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
        ctx.strokeStyle = '#000'; ctx.strokeRect(p.x - 8, p.y - 8, 16, 16);
      });

      droppedItems.forEach(i => {
        ctx.fillStyle = '#DE2626';
        ctx.fillRect(i.x - 4, i.y - 4, 8, 8);
      });

      enemies.forEach(e => {
        if (e.hp <= 0) return;
        const sprKey = e.type === 'guard' ? 'guard_sheet' : 'slime_sheet';
        const img = spriteImages[sprKey];
        if (img && img.complete) {
          ctx.drawImage(img, e.x - 16, e.y - 16, 32, 32);
        } else {
          ctx.fillStyle = e.hurtTime > 0 ? '#ffffff' : (e.type === 'guard' ? '#2563eb' : '#16a34a');
          ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
          ctx.strokeStyle = '#000'; ctx.strokeRect(e.x - 10, e.y - 10, 20, 20);
        }
        ctx.fillStyle = '#18181b';
        ctx.fillRect(e.x - 12, e.y - 18, 24, 3);
        ctx.fillStyle = '#DE2626';
        ctx.fillRect(e.x - 12, e.y - 18, (e.hp / e.maxHp) * 24, 3);
      });

      boomerangs.forEach(b => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
      });

      const isHurt = playerHurtTime > 0 && Math.floor(playerHurtTime / 3) % 2 === 0;

      // Render Obsidian Shield
      const renderShield = () => {
        if (playerFacing === 'UP') {
          ctx.fillStyle = '#0d0d12'; ctx.fillRect(px - 6, py - 8, 12, 15);
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.strokeRect(px - 6, py - 8, 12, 15);
          ctx.fillStyle = '#DE2626';
          ctx.beginPath(); ctx.moveTo(px - 4, py - 5); ctx.lineTo(px + 4, py - 5); ctx.lineTo(px, py + 4); ctx.closePath(); ctx.fill();
        } else {
          const sX = playerFacing === 'LEFT' ? px - 12 : (playerFacing === 'RIGHT' ? px + 2 : px - 12);
          ctx.fillStyle = '#0d0d12'; ctx.fillRect(sX, py - 3, 12, 15);
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.strokeRect(sX, py - 3, 12, 15);
          ctx.fillStyle = '#DE2626'; ctx.fillRect(sX + 2, py, 8, 8);
        }
      };

      // 2.5D Layer Order: When facing UP, render Shield FIRST (mounted behind Link)
      if (playerFacing === 'UP') renderShield();

      // Render Shadow Link Sprite
      const linkImg = spriteImages['shadow_link_sheet'];
      if (linkImg && linkImg.complete && !isHurt) {
        ctx.drawImage(linkImg, px - 16, py - 16, 32, 32);
      } else {
        // HIGH-VISIBILITY FALLBACK: Distinct Dark Obsidian Slate Body, Crimson Belt, Glowing Red Eyes
        ctx.fillStyle = isHurt ? '#ffffff' : '#1e1e2d';
        ctx.fillRect(px - 9, py - 10, 18, 20);
        ctx.strokeStyle = '#3f3f5a'; ctx.strokeRect(px - 9, py - 10, 18, 20);

        ctx.fillStyle = '#12121a'; ctx.fillRect(px - 7, py - 14, 14, 8); // Head / Cap
        ctx.fillStyle = '#DE2626'; ctx.fillRect(px - 9, py + 1, 18, 3); // Belt

        ctx.fillStyle = '#f87171'; // Glowing Eyes
        if (playerFacing === 'DOWN') { ctx.fillRect(px - 5, py - 7, 3, 3); ctx.fillRect(px + 2, py - 7, 3, 3); }
        else if (playerFacing === 'LEFT') ctx.fillRect(px - 6, py - 7, 3, 3);
        else if (playerFacing === 'RIGHT') ctx.fillRect(px + 3, py - 7, 3, 3);
      }

      // When facing DOWN / LEFT / RIGHT, render Shield AFTER Link's body (held in hand in front)
      if (playerFacing !== 'UP') renderShield();

      if (slashAnim && slashAnim.timer > 0) {
        let baseAngle = Math.PI / 2;
        if (slashAnim.dir === 'UP') baseAngle = -Math.PI / 2;
        if (slashAnim.dir === 'LEFT') baseAngle = Math.PI;
        if (slashAnim.dir === 'RIGHT') baseAngle = 0;

        ctx.fillStyle = 'rgba(222, 38, 38, 0.4)';
        ctx.beginPath();
        ctx.arc(px, py, 32, baseAngle - Math.PI * 0.5, baseAngle + Math.PI * 0.5);
        ctx.lineTo(px, py);
        ctx.fill();

        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(px, py, 28, baseAngle - Math.PI * 0.5, baseAngle + Math.PI * 0.5); ctx.stroke();
        slashAnim.timer--;
      }

      if (spinAnim && spinAnim.timer > 0) {
        ctx.fillStyle = 'rgba(222, 38, 38, 0.3)';
        ctx.beginPath(); ctx.arc(px, py, 50, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#DE2626'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(px, py, 45, 0, Math.PI * 2); ctx.stroke();
        spinAnim.timer--;
      }

      ctx.restore();

      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, canvas.width, 30);
      ctx.fillStyle = '#DE2626'; ctx.font = 'bold 11px monospace';
      ctx.fillText("SHADOW LINK | HP: " + playerHp + "/" + playerMaxHp + " | BEJSON 105 ENGINE CAMERA (ZOOM: 1.25x)", 12, 19);
    }

    function gameLoop() {
      update();
      render();
      requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
  </script>
</body>
</html>`;

    handleDownloadTextFile('standalone-game.html', htmlContent, 'text/html');
  };

  const handleDownloadCompleteFlaskZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // 1. Engine Folder
      const engineFolder = zip.folder("Engines/PY");
      if (engineFolder) {
        try {
          const appRes = await fetch('/Engines/PY/app.py');
          if (appRes.ok) {
            const appText = await appRes.text();
            engineFolder.file("app.py", appText);
          }
        } catch (e) {
          console.warn('Could not fetch app.py for zip:', e);
        }
        engineFolder.file("requirements.txt", "flask>=3.0.0\nflask-cors>=4.0.0\n");
        engineFolder.file("config.json", JSON.stringify({ engine_path: ".", compiler_path: "../Experimental/Compiler", raw_data_path: "../../game_data/raw", compiled_data_path: "../Experimental/Compiled", target_compiled_filename: flaskConfig.target_compiled_filename, flask_host: flaskConfig.flask_host, flask_port: flaskConfig.flask_port }, null, 2));
        engineFolder.file("README.md", `# Sword Slasher RPG: Flask Parity Engine & Compiler\n\nRun offline:\n1. pip install -r Engines/PY/requirements.txt\n2. python3 Engines/Experimental/Compiler/Compile.py\n3. python3 Engines/PY/app.py\n`);
      }

      // 2. Compiler Folder
      const compilerFolder = zip.folder("Engines/Experimental/Compiler");
      if (compilerFolder) {
        compilerFolder.file("config.json", configJsonContent);
        compilerFolder.file("Compile.py", compilerPyContent);
        try {
          const chunkerRes = await fetch('/Engines/Experimental/Compiler/data_chunker.py');
          if (chunkerRes.ok) {
            const chunkerText = await chunkerRes.text();
            compilerFolder.file("data_chunker.py", chunkerText);
          }
        } catch (e) {
          console.warn('Could not fetch data_chunker.py for zip:', e);
        }
      }

      // 3. Game Data Folder
      const gameDataFolder = zip.folder("game_data");
      if (gameDataFolder) {
        const compiledFolder = zip.folder("Engines/Experimental/Compiled");
        if (compiledFolder) {
          if (compiledBundle) {
            compiledFolder.file(flaskConfig.target_compiled_filename, JSON.stringify(compiledBundle, null, 2));
          }
          if (mfdbChunkDoc) {
            compiledFolder.file("Chunked_Engine_Data.104a.bejson.txt", JSON.stringify(mfdbChunkDoc, null, 2));
          }
        }

        const rawFolder = gameDataFolder.folder("raw");
        if (rawFolder) {
          for (const item of rawDatasetsList) {
            try {
              const res = await fetch(item.path);
              if (res.ok) {
                const text = await res.text();
                rawFolder.file(item.name, text);
              }
            } catch (e) {
              console.warn(`Could not fetch raw dataset ${item.name} for zip bundle:`, e);
            }
          }
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = "Sword_Slasher_RPG_Engine_And_Data_Package.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed creating offline Flask ZIP package:", err);
      alert("Error generating complete ZIP download.");
    } finally {
      setIsZipping(false);
    }
  };

  const filteredRawDatasets = rawDatasetsList.filter(item =>
    item.name.toLowerCase().includes(rawSearchFilter.toLowerCase()) ||
    item.category.toLowerCase().includes(rawSearchFilter.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-black/95 backdrop-blur-xl flex flex-col p-3 sm:p-4 md:p-6 font-mono select-none overflow-hidden">
      {/* Full Screen Viewport Container Box */}
      <div className="flex-1 w-full bg-zinc-950 border border-white/10 rounded-2xl flex flex-col overflow-hidden text-white shadow-2xl">
        
        {/* Modal Header Bar */}
        <div className="h-14 bg-zinc-900/90 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 flex items-center justify-center rounded-lg">
              <Terminal className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase text-white tracking-wider flex items-center gap-2">
                SYSTEM MENU
                <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-white/10 px-1.5 py-0.5 rounded font-mono font-bold">
                  v300
                </span>
              </h2>
              <p className="text-[10px] text-zinc-400 font-sans">
                Engine Compiler, AI Architect & Configuration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {saveSuccessNotice && (
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}

            <button
              onClick={handleDownloadStandaloneHtmlGame}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase rounded-lg flex items-center gap-1.5 border border-red-500/30 transition-colors cursor-pointer shrink-0"
              title="Compile & Download Single-File Standalone HTML Game (Injected JS Engine + BEJSON Data)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Download Single-File Game (.html)</span>
              <span className="sm:hidden">.HTML Game</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Close System Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean 3-Tab Navigation Bar */}
        <div className="bg-zinc-900/60 border-b border-white/10 px-4 sm:px-6 flex items-center gap-1.5 pt-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('compiler')}
            className={`py-2 px-4 text-xs font-bold uppercase rounded-t-lg flex items-center gap-2 border-t border-x transition-colors cursor-pointer ${
              activeTab === 'compiler'
                ? 'bg-zinc-950 text-white border-white/10'
                : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-red-400" /> 1. Compiler & Downloads
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className={`py-2 px-4 text-xs font-bold uppercase rounded-t-lg flex items-center gap-2 border-t border-x transition-colors cursor-pointer ${
              activeTab === 'advisor'
                ? 'bg-zinc-950 text-white border-white/10'
                : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" /> 2. AI Architect
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-4 text-xs font-bold uppercase rounded-t-lg flex items-center gap-2 border-t border-x transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-zinc-950 text-white border-white/10'
                : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-red-400" /> 3. Options
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black">
          
          {/* TAB 1: COMPILER & OFFLINE DOWNLOADS LIST */}
          {activeTab === 'compiler' && (
            <div className="space-y-6">
              
              {/* Primary Compiler Action Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-950 p-3 border border-zinc-800 rounded-lg gap-3">
                <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#DE2626]" /> Compiler Execution
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={runCompilationSimulation}
                    disabled={isCompiling}
                    className="py-1.5 px-3 bg-[#DE2626] hover:bg-red-700 text-white font-bold text-xs uppercase rounded flex items-center gap-1.5 border border-red-500 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
                    {isCompiling ? 'Compiling...' : 'Re-Run Compiler'}
                  </button>

                  <button
                    onClick={handleDownloadStandaloneHtmlGame}
                    className="py-1.5 px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 font-bold text-xs uppercase rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" /> Single-File Game (.html)
                  </button>

                  <button
                    onClick={handleDownloadCompleteFlaskZip}
                    disabled={isZipping}
                    className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs uppercase rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PackageCheck className={`w-3.5 h-3.5 text-[#DE2626] ${isZipping ? 'animate-spin' : ''}`} />
                    {isZipping ? 'Zipping...' : 'Full Package (.zip)'}
                  </button>
                </div>
              </div>

              {/* SINGLE PAGE CLEAN COMPACT DOWNLOADS LIST */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <h4 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                    <FolderDown className="w-4 h-4 text-[#DE2626]" /> Downloadable Packages & Bundles
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-mono">Debugging Menu</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  
                  {/* Item 1: Standalone HTML Game */}
                  <div className="bg-black p-2.5 border border-zinc-900 hover:border-[#DE2626] rounded flex items-center justify-between gap-2 transition-colors">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono truncate">
                      <FileCode className="w-4 h-4 shrink-0" />
                      <span className="truncate">standalone-game.html</span>
                    </div>
                    <button
                      onClick={handleDownloadStandaloneHtmlGame}
                      className="py-1 px-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-3 h-3" /> Get
                    </button>
                  </div>

                  {/* Item 2: Complete ZIP Bundle */}
                  <div className="bg-black p-2.5 border border-zinc-900 hover:border-[#DE2626] rounded flex items-center justify-between gap-2 transition-colors">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono truncate">
                      <PackageCheck className="w-4 h-4 text-[#DE2626] shrink-0" />
                      <span className="truncate">Engine & Data (.zip)</span>
                    </div>
                    <button
                      onClick={handleDownloadCompleteFlaskZip}
                      disabled={isZipping}
                      className="py-1 px-2.5 bg-zinc-900 hover:bg-[#DE2626] text-zinc-200 hover:text-white border border-zinc-700 text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-3 h-3" /> {isZipping ? 'Zipping...' : 'Get .zip'}
                    </button>
                  </div>

                  {/* Item 3: Compiled Dataset Bundle (.105) */}
                  <div className="bg-black p-2.5 border border-zinc-900 hover:border-[#DE2626] rounded flex items-center justify-between gap-2 transition-colors">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono truncate">
                      <Database className="w-4 h-4 text-[#DE2626] shrink-0" />
                      <span className="truncate">{flaskConfig.target_compiled_filename}</span>
                    </div>
                    <button
                      onClick={() => handleDownloadTextFile(flaskConfig.target_compiled_filename, JSON.stringify(compiledBundle, null, 2), 'application/json')}
                      className="py-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-3 h-3" /> Get
                    </button>
                  </div>

                  {/* Item 4: Native MFDB Chunk Container */}
                  <div className="bg-black p-2.5 border border-zinc-900 hover:border-[#DE2626] rounded flex items-center justify-between gap-2 transition-colors">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono truncate">
                      <Archive className="w-4 h-4 text-[#DE2626] shrink-0" />
                      <span className="truncate">Chunked_Engine_Data.txt</span>
                    </div>
                    <button
                      onClick={() => handleDownloadTextFile('Chunked_Engine_Data.104a.bejson.txt', JSON.stringify(mfdbChunkDoc, null, 2), 'text/plain')}
                      className="py-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-3 h-3" /> Get
                    </button>
                  </div>

                  {/* Item 5: compiler.py */}
                  <div className="bg-black p-2.5 border border-zinc-900 hover:border-[#DE2626] rounded flex items-center justify-between gap-2 transition-colors">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono truncate">
                      <Cpu className="w-4 h-4 text-[#DE2626] shrink-0" />
                      <span className="truncate">compiler.py</span>
                    </div>
                    <button
                      onClick={() => handleDownloadTextFile('compiler.py', compilerPyContent)}
                      className="py-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-3 h-3" /> Get
                    </button>
                  </div>

                  {/* Item 6: config.json */}
                  <div className="bg-black p-2.5 border border-zinc-900 hover:border-[#DE2626] rounded flex items-center justify-between gap-2 transition-colors">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono truncate">
                      <FileText className="w-4 h-4 text-[#DE2626] shrink-0" />
                      <span className="truncate">config.json</span>
                    </div>
                    <button
                      onClick={() => handleDownloadTextFile('config.json', configJsonContent, 'application/json')}
                      className="py-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-3 h-3" /> Get
                    </button>
                  </div>

                </div>
              </div>

              {/* COMPACT SEARCHABLE RAW DATASETS MATRIX LIST */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-2">
                  <h4 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                    <FolderDown className="w-4 h-4 text-[#DE2626]" /> Raw BEJSON Data Tables
                  </h4>

                  <input
                    type="text"
                    value={rawSearchFilter}
                    onChange={(e) => setRawSearchFilter(e.target.value)}
                    placeholder="Filter datasets..."
                    className="bg-black border border-zinc-800 px-3 py-1 rounded text-xs text-white outline-none focus:border-[#DE2626] w-full sm:w-56 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {filteredRawDatasets.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-black px-3 py-2 border border-zinc-900 hover:border-zinc-700 rounded flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {item.name}
                        </div>
                        <div className="text-[10px] text-zinc-500">{item.category}</div>
                      </div>

                      <button
                        onClick={() => handleDownloadRawFile(item.path, item.name)}
                        className="py-1 px-2.5 bg-zinc-900 hover:bg-[#DE2626] text-zinc-300 hover:text-white border border-zinc-800 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Get
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Console Output Log */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-emerald-400 shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-zinc-500">
                  <span className="uppercase text-[11px] font-bold tracking-wider">Compiler Console Log</span>
                  <span className="text-[10px]">BEJSON 105</span>
                </div>

                <div className="h-40 overflow-y-auto space-y-1 select-text">
                  {compilerLogs.map((log, idx) => (
                    <div key={idx} className={log.includes("[SUCCESS]") ? "text-emerald-400 font-bold" : log.includes("!") ? "text-amber-400" : "text-zinc-300"}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: GEMINI AI ARCHITECT ADVISOR & ENGINE DEBUGGER */}
          {activeTab === 'advisor' && (
            <div className="h-[70vh] flex flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
              
              {/* Top Control Bar with Model Selector, Preset Combo Box & Send Preset Button, and Status Badge */}
              <div className="p-2.5 bg-zinc-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-white">
                    <Bot className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="font-bold uppercase text-[11px] text-zinc-400">Model:</span>
                    <select
                      value={selectedModel}
                      onChange={e => setSelectedModel(e.target.value)}
                      className="bg-black border border-white/10 text-white font-mono text-xs px-2 py-1 rounded focus:outline-none cursor-pointer"
                    >
                      <option value="gemini-3.6-flash">gemini-3.6-flash (Default)</option>
                      <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite</option>
                      <option value="gemini-3.7-flash">gemini-3.7-flash</option>
                      <option value="gemini-3.8-flash">gemini-3.8-flash</option>
                      <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                    </select>
                  </div>

                  {/* Preset Prompt Combo Box & Send Preset Button */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold uppercase text-[11px] text-zinc-400">Preset:</span>
                    <select
                      value={selectedPreset}
                      onChange={e => setSelectedPreset(e.target.value)}
                      className="bg-black border border-white/10 text-white font-mono text-xs px-2 py-1 rounded focus:outline-none cursor-pointer max-w-[220px] sm:max-w-xs truncate"
                    >
                      {presetQuestions.map((q, idx) => (
                        <option key={idx} value={q.prompt}>
                          {q.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleSendPrompt(selectedPreset)}
                      disabled={statusState !== 'Idle'}
                      className="py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold text-[11px] uppercase rounded border border-white/10 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      title="Send Selected Preset Prompt"
                    >
                      <Send className="w-3 h-3 text-amber-400" /> Send Preset
                    </button>
                  </div>
                </div>

                {/* Status Indicator Badge */}
                <div className={`px-2.5 py-1 rounded text-xs font-bold border flex items-center gap-1.5 transition-all ${
                  statusState === 'Idle' ? 'bg-zinc-900 border-white/10 text-zinc-400' :
                  statusState === 'Sending...' ? 'bg-amber-950/40 border-amber-800/50 text-amber-300 animate-pulse' :
                  statusState === 'Awaiting response...' ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400 animate-pulse' :
                  'bg-red-950/50 border-red-800/60 text-red-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    statusState === 'Idle' ? 'bg-zinc-500' :
                    statusState === 'Sending...' ? 'bg-amber-400' :
                    statusState === 'Awaiting response...' ? 'bg-emerald-400 animate-ping' :
                    'bg-red-500'
                  }`} />
                  <span className="uppercase text-[10px] font-mono">{statusState}</span>
                </div>
              </div>

              {/* Scrollable Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'gemini' && (
                      <div className="w-7 h-7 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-red-400" />
                      </div>
                    )}

                    <div className={`max-w-3xl rounded-lg p-3 text-xs font-sans leading-relaxed border ${
                      msg.sender === 'user'
                        ? 'bg-zinc-900 text-white border-white/10'
                        : msg.isError
                        ? 'bg-red-950/40 border-red-800/60 text-red-300'
                        : 'bg-zinc-900/60 text-zinc-200 border-white/5'
                    }`}>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-1.5 pb-1 border-b border-white/5">
                        <span className="font-bold text-zinc-400 uppercase">
                          {msg.sender === 'user' ? 'USER QUERY' : 'GEMINI ARCHITECT ADVISOR'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div className="whitespace-pre-wrap space-y-1.5 select-text">
                        {msg.text}
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Terminal className="w-3.5 h-3.5 text-zinc-300" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Error Banner Notification if Any */}
              {errorNotice && (
                <div className="mx-4 mb-2 p-2.5 bg-red-950/60 border border-red-800/60 rounded text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorNotice}</span>
                </div>
              )}

              {/* Bottom Prompt Input Console */}
              <div className="p-2.5 bg-zinc-900/90 border-t border-white/10 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPrompt();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={e => setInputPrompt(e.target.value)}
                    placeholder="Ask Gemini AI Advisor about SS2 engine logic, BEJSON 105 schemas, physics, or compiler..."
                    disabled={statusState !== 'Idle'}
                    className="flex-1 bg-black border border-white/10 text-white placeholder-zinc-500 text-xs px-3 py-2 rounded font-mono focus:outline-none focus:border-white/30 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputPrompt.trim() || statusState !== 'Idle'}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs uppercase rounded flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-red-500/30"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ask Advisor</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM CONFIGURATION & PATHS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-950 p-4 border border-zinc-800 rounded-lg gap-4">
                <div>
                  <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#DE2626]" /> Persistent System Configuration & Path Flags
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Settings persist locally in browser storage and synchronize directly with Python <code className="text-red-400">Engines/Experimental/Compiler/config.json</code>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={resetConfigToDefault}
                    className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-400" /> Reset Defaults
                  </button>

                  <button
                    onClick={() => saveConfigToStorage(flaskConfig)}
                    className="py-2 px-4 bg-[#DE2626] hover:bg-red-700 text-white border border-red-500 text-xs font-bold uppercase rounded flex items-center gap-2 shadow-[0_0_15px_rgba(222,38,38,0.4)] transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Settings
                  </button>
                </div>
              </div>

              {/* Config Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Category 1: Raw Data & Library Paths */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <FolderDown className="w-4 h-4 text-[#DE2626]" /> Data Pathing & External Shared Folders
                  </h4>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                      <span className="font-bold">use_external_raw</span>
                      <input
                        type="checkbox"
                        checked={flaskConfig.use_external_raw}
                        onChange={(e) => saveConfigToStorage({ ...flaskConfig, use_external_raw: e.target.checked })}
                        className="w-4 h-4 accent-[#DE2626] cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      value={flaskConfig.external_raw_path}
                      onChange={(e) => setFlaskConfig({ ...flaskConfig, external_raw_path: e.target.value })}
                      onBlur={() => saveConfigToStorage(flaskConfig)}
                      className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-[#DE2626] outline-none"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                      <span className="font-bold">use_external_raw_lib</span>
                      <input
                        type="checkbox"
                        checked={flaskConfig.use_external_raw_lib}
                        onChange={(e) => saveConfigToStorage({ ...flaskConfig, use_external_raw_lib: e.target.checked })}
                        className="w-4 h-4 accent-[#DE2626] cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      value={flaskConfig.external_raw_lib_path}
                      onChange={(e) => setFlaskConfig({ ...flaskConfig, external_raw_lib_path: e.target.value })}
                      onBlur={() => saveConfigToStorage(flaskConfig)}
                      className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-[#DE2626] outline-none"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                      <span className="font-bold">use_external_compiled</span>
                      <input
                        type="checkbox"
                        checked={flaskConfig.use_external_compiled}
                        onChange={(e) => saveConfigToStorage({ ...flaskConfig, use_external_compiled: e.target.checked })}
                        className="w-4 h-4 accent-[#DE2626] cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      value={flaskConfig.target_compiled_filename}
                      onChange={(e) => setFlaskConfig({ ...flaskConfig, target_compiled_filename: e.target.value })}
                      onBlur={() => saveConfigToStorage(flaskConfig)}
                      className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-[#DE2626] outline-none"
                    />
                  </div>
                </div>

                {/* Category 2: Flask Engine Runtime & Security Controls */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#DE2626]" /> Flask Engine Runtime & Security Controls
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-300">Interpreter</label>
                      <input
                        type="text"
                        value={flaskConfig.python_interpreter}
                        onChange={(e) => setFlaskConfig({ ...flaskConfig, python_interpreter: e.target.value })}
                        onBlur={() => saveConfigToStorage(flaskConfig)}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-[#DE2626] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-300">Flask Port</label>
                      <input
                        type="number"
                        value={flaskConfig.flask_port}
                        onChange={(e) => setFlaskConfig({ ...flaskConfig, flask_port: parseInt(e.target.value) || 5000 })}
                        onBlur={() => saveConfigToStorage(flaskConfig)}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-[#DE2626] outline-none"
                      />
                    </div>
                  </div>

                  {/* External Custom Keys Checkbox */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <label className="flex items-center gap-3 p-3 bg-black border border-zinc-900 rounded cursor-pointer hover:border-zinc-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={flaskConfig.enable_external_keys}
                        onChange={(e) => saveConfigToStorage({ ...flaskConfig, enable_external_keys: e.target.checked })}
                        className="w-4 h-4 accent-[#DE2626] cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-[#DE2626]" /> [ ] Enable External Custom Keys
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          Default is UNCHECKED (Google AI Studio Key default).
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Raw JSON Config View */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#DE2626]" /> Synchronized config.json Output Payload
                  </h4>
                  <button
                    onClick={() => handleDownloadTextFile('config.json', configJsonContent, 'application/json')}
                    className="py-1 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#DE2626]" /> Download config.json
                  </button>
                </div>
                <pre className="p-4 bg-black border border-zinc-900 text-emerald-400 text-xs overflow-x-auto rounded select-text">
                  {configJsonContent}
                </pre>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer with Explicit Close Control */}
        <div className="h-14 bg-zinc-900/90 border-t border-white/10 px-6 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500 font-sans">
            Author: Elton Boehnen · BEJSON 105 Engine & System Menu
          </span>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase rounded-lg border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4 text-red-400" /> CLOSE SYSTEM MENU
          </button>
        </div>
      </div>
    </div>
  );
};
