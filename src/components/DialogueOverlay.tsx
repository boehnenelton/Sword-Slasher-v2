/**
 * Library:         DialogueOverlay.tsx
 * Module Purpose:  Zelda-style Pixel Art Dialogue Box & Opcode Script Runner
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0004-2026-1025-9999-000000000108
 * Version:         200102
 */

import React, { useEffect, useState } from 'react';
import { GameEventData } from '../engine/bejsonEngine';
import { soundEngine } from '../engine/soundEngine';
import { ChevronRight } from 'lucide-react';

interface Props {
  event: GameEventData | null;
  onClose: () => void;
}

export const DialogueOverlay: React.FC<Props> = ({ event, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  const opcodes = event?.opcodes || [];
  const currentOp = opcodes[currentIdx];

  useEffect(() => {
    if (!currentOp || currentOp.op !== 'SHOW_DIALOGUE') return;

    setDisplayedText('');
    let charIdx = 0;
    const fullText = currentOp.text || '';

    const interval = setInterval(() => {
      if (charIdx < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(charIdx));
        if (charIdx % 3 === 0) {
          soundEngine.playTextBeepSFX();
        }
        charIdx++;
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [currentIdx, event?.uuid]);

  if (!event || !currentOp) return null;

  const handleNext = () => {
    if (currentIdx < opcodes.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const getSpeakerBadgeColor = (speaker?: string) => {
    if (speaker?.includes('Ganon')) return 'bg-[#DE2626] text-white border-red-500';
    if (speaker?.includes('Zelda')) return 'bg-pink-600 text-white border-pink-400';
    if (speaker?.includes('Shadow')) return 'bg-zinc-900 text-[#DE2626] border-[#DE2626]';
    return 'bg-blue-600 text-white border-blue-400';
  };

  return (
    <div className="absolute inset-x-4 bottom-6 z-40 max-w-2xl mx-auto p-4 bg-zinc-950/95 border-2 border-[#DE2626] rounded-lg shadow-[0_0_20px_rgba(222,38,38,0.5)] font-mono text-white flex flex-col gap-2">
      {/* Speaker Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className={`px-2.5 py-0.5 text-xs font-bold font-['Press_Start_2P'] uppercase border rounded ${getSpeakerBadgeColor(currentOp.speaker)}`}>
          {currentOp.speaker || 'SYSTEM'}
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">
          [Press E / Space / Click to Advance] ({currentIdx + 1}/{opcodes.length})
        </span>
      </div>

      {/* Typed Dialogue Content */}
      <div className="min-h-[52px] text-sm text-zinc-200 leading-relaxed pt-1">
        {displayedText}
      </div>

      {/* Advance Button */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleNext}
          className="px-4 py-1.5 bg-[#DE2626] hover:bg-red-700 text-white text-xs font-bold font-mono uppercase rounded flex items-center gap-1 cursor-pointer transition-colors"
        >
          NEXT <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
