/**
 * Library:         BejsonDatabaseView.tsx
 * Module Purpose:  BEJSON 105 Dataset Matrix & Schema Integrity Inspector
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0010-2026-1025-9999-000000000114
 * Version:         200101
 */

import React, { useState } from 'react';
import { bejsonEngine } from '../engine/bejsonEngine';
import { Database, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

export const BejsonDatabaseView: React.FC = () => {
  const docs = bejsonEngine.getAllDocuments();
  const keys = Array.from(docs.keys());
  const [selectedKey, setSelectedKey] = useState<string>('manifest');
  const [searchTerm, setSearchTerm] = useState('');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);

  const activeDoc = docs.get(selectedKey);

  const handleValidate = () => {
    if (activeDoc) {
      const result = bejsonEngine.validateDocument(activeDoc);
      setValidationResult(result);
    }
  };

  return (
    <div className="w-full h-full p-6 bg-zinc-950 font-mono text-white overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-[#DE2626]" />
            <div>
              <h2 className="text-base font-bold font-['Press_Start_2P'] uppercase text-white">
                BEJSON 105 DATABASE INSPECTOR
              </h2>
              <p className="text-xs text-zinc-400">
                Loaded 22 BEJSON 105 dataset tables in memory
              </p>
            </div>
          </div>

          <button
            onClick={handleValidate}
            className="px-4 py-2 bg-[#DE2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> VALIDATE SCHEMA INTEGRITY
          </button>
        </div>

        {/* Validation Output Banner */}
        {validationResult && (
          <div className={`p-4 rounded-lg border text-xs font-mono ${validationResult.valid ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'}`}>
            <div className="font-bold flex items-center gap-2 mb-1">
              {validationResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
              {validationResult.valid ? 'BEJSON 105 VALIDATION PASSED PERFECTLY!' : 'VALIDATION ISSUES DETECTED'}
            </div>
            {validationResult.valid ? (
              <p>Format, Version string, Creator, and Positional Enums meet all Era 105 strict requirements.</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {validationResult.errors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Table Selector & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 p-3 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase">ACTIVE DATASET:</span>
            <select
              value={selectedKey}
              onChange={e => {
                setSelectedKey(e.target.value);
                setValidationResult(null);
              }}
              className="bg-zinc-950 border border-zinc-700 text-white font-mono text-xs px-3 py-1.5 rounded focus:outline-none focus:border-[#DE2626]"
            >
              {keys.map(k => (
                <option key={k} value={k}>
                  {k}.105.bejson
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 border border-zinc-700 rounded w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Table Metadata Header Block */}
        {activeDoc && (
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div><span className="text-zinc-500 font-semibold block">Format:</span> <span className="text-white">{activeDoc.Format} ({activeDoc.Format_Version})</span></div>
            <div><span className="text-zinc-500 font-semibold block">Format Creator:</span> <span className="text-white">{activeDoc.Format_Creator}</span></div>
            <div><span className="text-zinc-500 font-semibold block">Primary Key Field:</span> <span className="text-[#DE2626] font-bold">{(activeDoc as Record<string, any>).Primary_Key_Field || 'None'}</span></div>
            <div><span className="text-zinc-500 font-semibold block">Total Records:</span> <span className="text-emerald-400 font-bold">{activeDoc.Values.length}</span></div>
          </div>
        )}

        {/* Table Matrix View */}
        {activeDoc && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto max-h-[450px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 sticky top-0">
                <tr>
                  <th className="p-3 font-bold border-r border-zinc-800">#</th>
                  {activeDoc.Fields.map((f, idx) => (
                    <th key={idx} className="p-3 font-bold border-r border-zinc-800 min-w-[140px]">
                      <div className="text-white">{f.name}</div>
                      <div className="text-[10px] text-zinc-500 font-normal">
                        {f.type} {f.required && '• req'} {f.primary_key && '• PK'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px] text-zinc-300">
                {activeDoc.Values.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-800/50">
                    <td className="p-3 text-zinc-500 font-bold border-r border-zinc-800">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 border-r border-zinc-800/60 truncate max-w-[200px]" title={String(cell)}>
                        {cell === null ? <span className="text-zinc-600 italic">null</span> : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
