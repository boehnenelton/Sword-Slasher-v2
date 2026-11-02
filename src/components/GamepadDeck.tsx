/**
 * Library:         GamepadDeck.tsx
 * Module Purpose:  360° Analog Virtual Joystick & Scaled Action Deck (Vertical Select/Start & Larger Buttons)
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0022-2026-1025-9999-000000000303
 * Version:         200103
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface Props {
  onJoystickMove: (x: number, y: number) => void;
  onButtonPressA: () => void;
  onButtonPressB: () => void;
  onButtonPressX: () => void;
  onButtonPressY: () => void;
  onSelectPress: () => void;
  onStartPress: () => void;
}

export const GamepadDeck: React.FC<Props> = ({
  onJoystickMove,
  onButtonPressA,
  onButtonPressB,
  onButtonPressX,
  onButtonPressY,
  onSelectPress,
  onStartPress
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickRef.current) return;
      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const maxRadius = 38;
      const distance = Math.hypot(dx, dy);

      if (distance > maxRadius) {
        dx = (dx / distance) * maxRadius;
        dy = (dy / distance) * maxRadius;
      }

      setKnobPos({ x: dx, y: dy });

      // Normalized vector (-1.0 to 1.0)
      const vectorX = dx / maxRadius;
      const vectorY = dy / maxRadius;
      onJoystickMove(vectorX, vectorY);
    },
    [onJoystickMove]
  );

  const handlePointerEnd = useCallback(() => {
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onJoystickMove(0, 0);
  }, [onJoystickMove]);

  // Global Mouse / Touch listeners during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handlePointerEnd);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handlePointerEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handlePointerEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handlePointerEnd);
    };
  }, [isDragging, handlePointerMove, handlePointerEnd]);

  return (
    <div className="w-full max-w-2xl bg-zinc-950/95 border border-white/10 rounded-2xl p-2.5 mt-2 mb-1 shadow-2xl flex flex-nowrap items-center justify-between gap-3 sm:gap-6 font-mono select-none overflow-x-auto">
      {/* LEFT: 360° INTERACTIVE ANALOG JOYSTICK (NO LABEL BELOW) */}
      <div className="flex items-center justify-center shrink-0">
        <div
          ref={joystickRef}
          onMouseDown={e => {
            setIsDragging(true);
            handlePointerMove(e.clientX, e.clientY);
          }}
          onTouchStart={e => {
            setIsDragging(true);
            if (e.touches.length > 0) {
              handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          className="relative w-28 h-28 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center shadow-inner cursor-grab active:cursor-grabbing touch-none"
        >
          {/* Inner Guideline Cross */}
          <div className="absolute w-full h-[1px] bg-white/5 pointer-events-none" />
          <div className="absolute h-full w-[1px] bg-white/5 pointer-events-none" />

          {/* Movable Thumbstick Knob */}
          <div
            className="w-12 h-12 bg-zinc-800 border-2 border-red-500 rounded-full shadow-lg flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
            }}
          >
            {/* Center Core */}
            <div className="w-5 h-5 bg-red-600 rounded-full border border-red-400" />
          </div>
        </div>
      </div>

      {/* CENTER: SELECT & START PILL BUTTONS (VERTICALLY STACKED) */}
      <div className="flex flex-col items-center justify-center gap-2 bg-zinc-900/60 px-3.5 py-2.5 border border-white/5 rounded-xl shrink-0">
        {/* SELECT (Top) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectPress}
            className="w-8 h-2.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 rounded-full rotate-[-15deg] cursor-pointer shadow-sm transition-transform active:scale-95"
            title="SELECT (Inventory / DB)"
          />
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">SELECT</span>
        </div>

        {/* START (Bottom) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStartPress}
            className="w-8 h-2.5 bg-red-800 hover:bg-red-700 active:bg-red-600 border border-red-500 rounded-full rotate-[-15deg] cursor-pointer shadow-sm transition-transform active:scale-95"
            title="START (Settings / Pause)"
          />
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">START</span>
        </div>
      </div>

      {/* RIGHT: INCREASED SIZE Y, X, B, A ACTION BUTTON DIAMOND CLUSTER (NO LABEL BELOW) */}
      <div className="flex items-center justify-center shrink-0">
        <div className="relative w-32 h-32 bg-zinc-900/80 border border-white/10 rounded-full flex items-center justify-center p-1">
          {/* X Button (Top) */}
          <button
            onClick={onButtonPressX}
            className="absolute top-0.5 w-10 h-10 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-500 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-lg cursor-pointer transition-transform active:scale-90"
            title="X: World Map Overlay"
          >
            X
          </button>

          {/* Y Button (Left) */}
          <button
            onClick={onButtonPressY}
            className="absolute left-0.5 w-10 h-10 bg-purple-900 hover:bg-purple-800 active:bg-purple-600 border border-purple-400 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-lg cursor-pointer transition-transform active:scale-90"
            title="Y: Use Y-Item"
          >
            Y
          </button>

          {/* B Button (Bottom) */}
          <button
            onClick={onButtonPressB}
            className="absolute bottom-0.5 w-10 h-10 bg-red-600 hover:bg-red-500 active:bg-red-700 border border-red-400 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-lg cursor-pointer transition-transform active:scale-90"
            title="B: Sword Slash"
          >
            B
          </button>

          {/* A Button (Right) */}
          <button
            onClick={onButtonPressA}
            className="absolute right-0.5 w-10 h-10 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 border border-emerald-400 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-lg cursor-pointer transition-transform active:scale-90"
            title="A: Main Action / Interact"
          >
            A
          </button>
        </div>
      </div>
    </div>
  );
};
