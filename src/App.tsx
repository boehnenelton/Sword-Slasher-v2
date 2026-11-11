/**
 * Library:         App.tsx
 * Module Purpose:  Main Application Entry & View State Manager (Single System Menu Overlay)
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0012-2026-1025-9999-000000000119
 * Version:         200107
 */

import React, { useEffect, useState } from 'react';
import { bejsonEngine, GameEventData } from './engine/bejsonEngine';
import { soundEngine } from './engine/soundEngine';
import { IntroStartScreen } from './components/IntroStartScreen';
import { GameViewport } from './components/GameViewport';
import { DialogueOverlay } from './components/DialogueOverlay';
import { FileHubView } from './components/FileHubView';
import { BejsonDatabaseView } from './components/BejsonDatabaseView';
import { TelemetryView } from './components/TelemetryView';
import { MetaUIModal } from './components/MetaUIModal';
import { SettingsModal } from './components/SettingsModal';
import { SubScreenOverlay } from './components/SubScreenOverlay';
import { WorldMapOverlay } from './components/WorldMapOverlay';
import { FlaskSystemModal } from './components/FlaskSystemModal';
import { Loader2, Terminal } from 'lucide-react';

export default function App() {
  console.log("initializing...");

  const [isLoading, setIsLoading] = useState(true);
  const [inGame, setInGame] = useState(false);
  const [activeTab] = useState('game');
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMetaUIOpen, setIsMetaUIOpen] = useState(false);
  const [isFlaskSystemEnabled, setIsFlaskSystemEnabled] = useState(true);
  const [isFlaskSystemOpen, setIsFlaskSystemOpen] = useState(false);
  const [flaskSystemInitialTab, setFlaskSystemInitialTab] = useState<'compiler' | 'advisor' | 'settings'>('compiler');
  const [isSubScreenOpen, setIsSubScreenOpen] = useState(false);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<GameEventData | null>(null);

  // Boot BEJSON 105 Simulation Engine
  useEffect(() => {
    bejsonEngine.bootEngine().then(() => {
      setIsLoading(false);
    });
  }, []);

  const handleStartGame = () => {
    setInGame(true);
    soundEngine.playMusic();
  };

  const handleOpenSystemMenu = (tab: 'compiler' | 'advisor' | 'settings' = 'compiler') => {
    setFlaskSystemInitialTab(tab);
    setIsFlaskSystemOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center font-mono space-y-4 select-none">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        <div className="text-sm font-bold uppercase text-white tracking-wider">
          LOADING BEJSON 105 ENGINE...
        </div>
        <p className="text-xs text-zinc-500">Parsing 22 Folder-Separated BEJSON Datasets</p>
      </div>
    );
  }

  if (!inGame) {
    return (
      <div className="w-screen h-screen bg-black relative">
        <IntroStartScreen
          onStartGame={handleStartGame}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMetaUI={() => setIsMetaUIOpen(true)}
          onOpenJsParity={() => handleOpenSystemMenu('advisor')}
          isFlaskSystemEnabled={isFlaskSystemEnabled}
          onToggleFlaskSystem={() => setIsFlaskSystemEnabled(!isFlaskSystemEnabled)}
          onOpenFlaskSystem={() => handleOpenSystemMenu('compiler')}
        />

        {/* Floating Controls Right - Single Unified System Menu Button */}
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          {isFlaskSystemEnabled && (
            <button
              onClick={() => handleOpenSystemMenu('compiler')}
              className="bg-zinc-900/90 hover:bg-zinc-800 text-white p-2.5 px-3.5 rounded-xl border border-white/10 hover:border-white/20 shadow-xl flex items-center gap-2 transition-all cursor-pointer group"
              title="Open System Menu"
            >
              <div className="w-7 h-7 bg-zinc-800 border border-white/10 rounded-lg flex items-center justify-center">
                <Terminal className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left font-mono">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-none">SYSTEM</div>
                <div className="text-xs font-bold text-white uppercase tracking-tight">MENU</div>
              </div>
            </button>
          )}
        </div>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          crtEnabled={crtEnabled}
          onToggleCrt={() => setCrtEnabled(!crtEnabled)}
        />
        <MetaUIModal
          isOpen={isMetaUIOpen}
          onClose={() => setIsMetaUIOpen(false)}
          onOpenJsParity={() => handleOpenSystemMenu('advisor')}
        />
        <FlaskSystemModal
          isOpen={isFlaskSystemOpen}
          onClose={() => setIsFlaskSystemOpen(false)}
          initialTab={flaskSystemInitialTab}
        />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black flex flex-col overflow-hidden font-mono select-none relative">
      {/* Main Viewport Container */}
      <div className="relative flex-1 bg-zinc-950 overflow-hidden flex flex-col items-center justify-center">
        {activeTab === 'game' && (
          <>
            <GameViewport
              onTriggerDialogue={evt => setActiveDialogue(evt)}
              crtEnabled={crtEnabled}
              onOpenInventory={() => setIsSubScreenOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenWorldMap={() => setIsWorldMapOpen(true)}
            />
            {activeDialogue && (
              <DialogueOverlay
                event={activeDialogue}
                onClose={() => setActiveDialogue(null)}
              />
            )}
          </>
        )}

        {activeTab === 'inventory' && <FileHubView />}
        {activeTab === 'bejson_db' && <BejsonDatabaseView />}
        {activeTab === 'telemetry' && <TelemetryView />}
      </div>

      {/* Sub Screen Inventory Overlay */}
      <SubScreenOverlay
        isOpen={isSubScreenOpen}
        onClose={() => setIsSubScreenOpen(false)}
        onExitToTitle={() => {
          setIsSubScreenOpen(false);
          soundEngine.stopMusic();
          setInGame(false);
        }}
        onWarpToDebug={() => {
          bejsonEngine.currentLevelSlug = 'debug_chamber';
          bejsonEngine.playerX = 320;
          bejsonEngine.playerY = 320;
          setIsSubScreenOpen(false);
        }}
      />

      {/* World Map Overlay */}
      <WorldMapOverlay
        isOpen={isWorldMapOpen}
        onClose={() => setIsWorldMapOpen(false)}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        crtEnabled={crtEnabled}
        onToggleCrt={() => setCrtEnabled(!crtEnabled)}
      />

      <MetaUIModal
        isOpen={isMetaUIOpen}
        onClose={() => setIsMetaUIOpen(false)}
        onOpenJsParity={() => handleOpenSystemMenu('advisor')}
      />

      <FlaskSystemModal
        isOpen={isFlaskSystemOpen}
        onClose={() => setIsFlaskSystemOpen(false)}
        initialTab={flaskSystemInitialTab}
      />
    </div>
  );
}
