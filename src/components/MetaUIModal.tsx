/**
 * Library:         MetaUIModal.tsx
 * Module Purpose:  Mandatory Three-Tab Architecture Meta-UI Modal & AI Architect Launch
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0007-2026-1025-9999-000000000111
 * Version:         300102
 */

import React, { useState } from 'react';
import { X, Copy, Download, Archive, User, FileText, Code2, Check, ExternalLink, Cpu, Sparkles } from 'lucide-react';
import { bejsonEngine } from '../engine/bejsonEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenJsParity?: () => void;
}

export const MetaUIModal: React.FC<Props> = ({ isOpen, onClose, onOpenJsParity }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'changelog' | 'assets'>('about');
  const [selectedSchemaKey, setSelectedSchemaKey] = useState<string>('manifest');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const docs = bejsonEngine.getAllDocuments();
  const schemaKeys = Array.from(docs.keys());

  const selectedDoc = docs.get(selectedSchemaKey);
  const rawPayload = selectedDoc ? JSON.stringify(selectedDoc, null, 2) : '{}';

  const handleCopy = () => {
    navigator.clipboard.writeText(rawPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveFile = () => {
    const blob = new Blob([rawPayload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSchemaKey}.105.bejson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveZip = () => {
    const bundle: { [key: string]: any } = {};
    docs.forEach((v, k) => {
      bundle[k] = v;
    });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bejson_105_schemas_package_128.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 font-mono text-white select-none overflow-hidden">
      <div className="bg-zinc-950 border border-white/10 rounded-2xl max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-zinc-900/90 border-b border-white/10 p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="text-sm font-bold uppercase text-white tracking-wider">
              APPLICATION META-UI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Three-Tab Header Bar */}
        <div className="bg-zinc-900/60 border-b border-white/10 px-6 pt-2 flex gap-2">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg flex items-center gap-2 border-t border-x cursor-pointer transition-colors ${
              activeTab === 'about'
                ? 'bg-zinc-950 text-white border-white/10'
                : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <User className="w-4 h-4 text-red-400" /> Tab 1: About (Account)
          </button>
          <button
            onClick={() => setActiveTab('changelog')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg flex items-center gap-2 border-t border-x cursor-pointer transition-colors ${
              activeTab === 'changelog'
                ? 'bg-zinc-950 text-white border-white/10'
                : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4 text-red-400" /> Tab 2: Change Log
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg flex items-center gap-2 border-t border-x cursor-pointer transition-colors ${
              activeTab === 'assets'
                ? 'bg-zinc-950 text-white border-white/10'
                : 'bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-4 h-4 text-red-400" /> Tab 3: Assets (Schemas)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-zinc-950 text-zinc-300 text-xs">
          {/* TAB 1: ABOUT / ACCOUNT */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Author Attribution */}
              <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl">
                <h3 className="text-xs font-bold text-white uppercase mb-3 text-red-400">
                  AUTHOR ATTRIBUTION & CREDITING
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div><span className="text-zinc-500 font-semibold">Author:</span> <span className="text-white font-bold">Elton Boehnen</span></div>
                  <div><span className="text-zinc-500 font-semibold">Email:</span> <a href="mailto:boehnenelton2024@gmail.com" className="text-red-400 underline">boehnenelton2024@gmail.com</a></div>
                  <div><span className="text-zinc-500 font-semibold">Website:</span> <a href="https://boehnenelton2024.pages.dev" target="_blank" rel="noreferrer" className="text-red-400 underline">boehnenelton2024.pages.dev</a></div>
                  <div><span className="text-zinc-500 font-semibold">GitHub:</span> <a href="https://github.com/boehnenelton" target="_blank" rel="noreferrer" className="text-red-400 underline">github.com/boehnenelton</a></div>
                </div>
              </div>

              {/* Project Metadata */}
              <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-white uppercase text-red-400">
                  PROJECT METADATA & SYSTEM SPEC
                </h3>
                <div><span className="text-zinc-500 font-semibold">Application Name:</span> <span className="text-white font-bold">Sword_Slasher_RPG_Shadow_Link_Awakening</span></div>
                <div><span className="text-zinc-500 font-semibold">Active Version:</span> <span className="text-white font-bold">1.0.28 (Package 128)</span></div>
                <div><span className="text-zinc-500 font-semibold">Gaming Library Family:</span> <span className="text-emerald-400 font-bold font-mono">lib_bejson_gamingss2_engine</span></div>
                <div><span className="text-zinc-500 font-semibold">Specification Standard:</span> <span className="text-white font-bold">BEJSON 105 Schema v2.0.0-105</span></div>
                <div><span className="text-zinc-500 font-semibold">Release Date:</span> <span className="text-white">November 2, 2026</span></div>
              </div>
            </div>
          )}

          {/* TAB 2: CHANGE LOG */}
          {activeTab === 'changelog' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl space-y-3">
                <div className="border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-red-400">Version 1.0.28 (Package 128)</span>
                  <span className="text-[11px] text-zinc-500 ml-2">2026-11-02</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
                  <li>Transitioned to Sword Slasher 2 (SS2) modular engine architecture (`lib_bejson_gamingss2_engine` family).</li>
                  <li>Replaced obsolete live parity runner with Gemini AI Engine Architect Advisor modal.</li>
                  <li>Full screen system menu overlay with seamless dark transparent borders and clean minimal padding.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: ASSETS (SCHEMAS) */}
          {activeTab === 'assets' && (
            <div className="space-y-4 flex flex-col h-full">
              {/* Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 p-3 border border-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase">SELECT SCHEMA:</span>
                  <select
                    value={selectedSchemaKey}
                    onChange={e => setSelectedSchemaKey(e.target.value)}
                    className="bg-zinc-950 border border-white/10 text-white font-mono text-xs px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    {schemaKeys.map(k => (
                      <option key={k} value={k}>
                        {k}.105.bejson
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                    {copied ? 'COPIED!' : 'COPY'}
                  </button>
                  <button
                    onClick={handleSaveFile}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" /> SAVE BEJSON FILE
                  </button>
                  <button
                    onClick={handleSaveZip}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 border border-red-500/30 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" /> SAVE SCHEMAS BUNDLE
                  </button>
                </div>
              </div>

              {/* Text Display Code Area */}
              <div className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl p-4 font-mono text-[11px] text-emerald-400 overflow-auto max-h-[350px]">
                <pre>{rawPayload}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
