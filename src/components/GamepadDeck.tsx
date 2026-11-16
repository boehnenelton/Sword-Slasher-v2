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
  onButtonDownB?: () => void;
  onButtonUpB?: () => void;
  onButtonPressX: () => void;
  onButtonPressY: () => void;
  onSelectPress: () => void;
  onStartPress: () => void;
}

export const GamepadDeck: React.FC<Props> = ({
  onJoystickMove,
  onButtonPressA,
  onButtonPressB,
  onButtonDownB,
  onButtonUpB,
  onButtonPressX,
  onButtonPressY,
  onSelectPress,
  onStartPress
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isStickActive, setIsStickActive] = useState(false);
  const [activeBtn, setActiveBtn] = useState<string | null>(null);

  const handlePointerMoveCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickRef.current) return;
      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const maxRadius = 44;
      const distance = Math.hypot(dx, dy);

      if (distance > maxRadius) {
        dx = (dx / distance) * maxRadius;
        dy = (dy / distance) * maxRadius;
      }

      setKnobPos({ x: dx, y: dy });

      // Normalized vector (-1.0 to 1.0)
      if (distance < 6) {
        onJoystickMove(0, 0);
      } else {
        onJoystickMove(dx / maxRadius, dy / maxRadius);
      }
    },
    [onJoystickMove]
  );

  const resetJoystick = useCallback(() => {
    activePointerIdRef.current = null;
    setIsStickActive(false);
    setKnobPos({ x: 0, y: 0 });
    onJoystickMove(0, 0);
  }, [onJoystickMove]);

  return (
    <div className="w-full max-w-2xl bg-zinc-950/95 border border-white/10 rounded-2xl p-2.5 mt-2 mb-1 shadow-2xl flex flex-nowrap items-center justify-between gap-3 sm:gap-6 font-mono select-none overflow-x-auto touch-none">
      {/* LEFT: 360° INTERACTIVE ANALOG JOYSTICK WITH POINTER CAPTURE (WHITE BY DEFAULT, #DE2626 WHEN ACTIVE) */}
      <div className="flex items-center justify-center shrink-0">
        <div
          ref={joystickRef}
          onPointerDown={e => {
            e.preventDefault();
            e.stopPropagation();
            activePointerIdRef.current = e.pointerId;
            setIsStickActive(true);
            try {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            } catch {}
            handlePointerMoveCoords(e.clientX, e.clientY);
          }}
          onPointerMove={e => {
            if (activePointerIdRef.current === e.pointerId) {
              e.preventDefault();
              e.stopPropagation();
              handlePointerMoveCoords(e.clientX, e.clientY);
            }
          }}
          onPointerUp={e => {
            if (activePointerIdRef.current === e.pointerId) {
              e.preventDefault();
              e.stopPropagation();
              try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              } catch {}
              resetJoystick();
            }
          }}
          onPointerCancel={e => {
            if (activePointerIdRef.current === e.pointerId) {
              try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              } catch {}
              resetJoystick();
            }
          }}
          onTouchStart={e => e.preventDefault()}
          onTouchMove={e => e.preventDefault()}
          className={`relative w-32 h-32 bg-zinc-900 rounded-full flex items-center justify-center shadow-inner cursor-grab active:cursor-grabbing touch-none select-none transition-all duration-100 ${
            isStickActive ? 'border-2 border-[#DE2626] shadow-[0_0_16px_rgba(222,38,38,0.45)]' : 'border-2 border-white/25'
          }`}
        >
          {/* Inner Guideline Cross */}
          <div className="absolute w-full h-[1px] bg-white/5 pointer-events-none" />
          <div className="absolute h-full w-[1px] bg-white/5 pointer-events-none" />

          {/* Movable Thumbstick Knob */}
          <div
            className={`rounded-full flex items-center justify-center pointer-events-none transition-all duration-100 ${
              isStickActive
                ? 'bg-[#DE2626] border-2 border-red-400 shadow-[0_0_18px_rgba(222,38,38,0.9)]'
                : 'bg-white border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
            }`}
            style={{
              width: '52px',
              height: '52px',
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
            }}
          >
            {/* Center Core */}
            <div
              className={`w-5 h-5 rounded-full transition-colors duration-100 ${
                isStickActive ? 'bg-white border border-white' : 'bg-black border border-zinc-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* CENTER: START & SELECT PILL BUTTONS (STACKED VERTICALLY: START TOP, SELECT BOTTOM) */}
      <div className="flex flex-col items-center justify-center gap-2.5 bg-zinc-900/60 px-3.5 py-2.5 border border-white/5 rounded-xl shrink-0">
        {/* START (Top) */}
        <div
          onPointerDown={e => {
            e.preventDefault();
            e.stopPropagation();
            setActiveBtn('start');
            onStartPress();
          }}
          onPointerUp={() => setActiveBtn(null)}
          onPointerCancel={() => setActiveBtn(null)}
          className="flex items-center gap-2 cursor-pointer touch-none"
        >
          <button
            onClick={onStartPress}
            className={`w-9 h-3 rounded-full rotate-[-15deg] cursor-pointer shadow-sm transition-all duration-75 active:scale-95 touch-none ${
              activeBtn === 'start'
                ? 'bg-[#DE2626] border border-red-400 shadow-[0_0_12px_rgba(222,38,38,0.85)]'
                : 'bg-white border border-white active:bg-[#DE2626] active:border-red-400'
            }`}
            title="START (Settings / Pause)"
          />
          <span
            className={`text-[9px] font-bold uppercase tracking-widest select-none pointer-events-none transition-colors duration-75 ${
              activeBtn === 'start' ? 'text-[#DE2626]' : 'text-zinc-300'
            }`}
          >
            START
          </span>
        </div>

        {/* SELECT (Bottom) */}
        <div
          onPointerDown={e => {
            e.preventDefault();
            e.stopPropagation();
            setActiveBtn('select');
            onSelectPress();
          }}
          onPointerUp={() => setActiveBtn(null)}
          onPointerCancel={() => setActiveBtn(null)}
          className="flex items-center gap-2 cursor-pointer touch-none"
        >
          <button
            onClick={onSelectPress}
            className={`w-9 h-3 rounded-full rotate-[-15deg] cursor-pointer shadow-sm transition-all duration-75 active:scale-95 touch-none ${
              activeBtn === 'select'
                ? 'bg-[#DE2626] border border-red-400 shadow-[0_0_12px_rgba(222,38,38,0.85)]'
                : 'bg-white border border-white active:bg-[#DE2626] active:border-red-400'
            }`}
            title="SELECT (Inventory / DB)"
          />
          <span
            className={`text-[9px] font-bold uppercase tracking-widest select-none pointer-events-none transition-colors duration-75 ${
              activeBtn === 'select' ? 'text-[#DE2626]' : 'text-zinc-400'
            }`}
          >
            SELECT
          </span>
        </div>
      </div>

      {/* RIGHT: ENLARGED Y, X, B, A ACTION BUTTON DIAMOND CLUSTER (WHITE BY DEFAULT, #DE2626 WHEN ACTIVE) */}
      <div className="flex items-center justify-center shrink-0">
        <div className="relative w-36 h-36 bg-zinc-900/80 border border-white/10 rounded-full flex items-center justify-center p-1 touch-none">
          {/* X Button (Top) */}
          <button
            onPointerDown={e => {
              e.preventDefault();
              e.stopPropagation();
              setActiveBtn('x');
              onButtonPressX();
            }}
            onPointerUp={() => setActiveBtn(null)}
            onPointerCancel={() => setActiveBtn(null)}
            onClick={onButtonPressX}
            className={`absolute top-1 w-11 h-11 rounded-full flex items-center justify-center font-black text-base shadow-lg cursor-pointer transition-all duration-75 active:scale-90 touch-none select-none ${
              activeBtn === 'x'
                ? 'bg-[#DE2626] text-white border-2 border-red-400 shadow-[0_0_18px_rgba(222,38,38,0.9)] scale-95'
                : 'bg-white text-black border-2 border-white shadow-[0_4px_12px_rgba(255,255,255,0.25)] hover:border-zinc-300 active:bg-[#DE2626] active:text-white active:border-red-400'
            }`}
            title="X: World Map Overlay"
          >
            X
          </button>

          {/* Y Button (Left) */}
          <button
            onPointerDown={e => {
              e.preventDefault();
              e.stopPropagation();
              setActiveBtn('y');
              onButtonPressY();
            }}
            onPointerUp={() => setActiveBtn(null)}
            onPointerCancel={() => setActiveBtn(null)}
            onClick={onButtonPressY}
            className={`absolute left-1 w-11 h-11 rounded-full flex items-center justify-center font-black text-base shadow-lg cursor-pointer transition-all duration-75 active:scale-90 touch-none select-none ${
              activeBtn === 'y'
                ? 'bg-[#DE2626] text-white border-2 border-red-400 shadow-[0_0_18px_rgba(222,38,38,0.9)] scale-95'
                : 'bg-white text-black border-2 border-white shadow-[0_4px_12px_rgba(255,255,255,0.25)] hover:border-zinc-300 active:bg-[#DE2626] active:text-white active:border-red-400'
            }`}
            title="Y: Use Y-Item"
          >
            Y
          </button>

          {/* B Button (Bottom): Tap to slash, hold to charge spin */}
          <button
            onPointerDown={e => {
              e.preventDefault();
              e.stopPropagation();
              setActiveBtn('b');
              if (onButtonDownB) onButtonDownB();
              else onButtonPressB();
            }}
            onPointerUp={e => {
              e.preventDefault();
              e.stopPropagation();
              setActiveBtn(null);
              if (onButtonUpB) onButtonUpB();
            }}
            onPointerCancel={() => {
              setActiveBtn(null);
              if (onButtonUpB) onButtonUpB();
            }}
            onClick={e => {
              if (!onButtonDownB) onButtonPressB();
            }}
            className={`absolute bottom-1 w-11 h-11 rounded-full flex items-center justify-center font-black text-base shadow-lg cursor-pointer transition-all duration-75 active:scale-90 touch-none select-none ${
              activeBtn === 'b'
                ? 'bg-[#DE2626] text-white border-2 border-red-400 shadow-[0_0_18px_rgba(222,38,38,0.9)] scale-95'
                : 'bg-white text-black border-2 border-white shadow-[0_4px_12px_rgba(255,255,255,0.25)] hover:border-zinc-300 active:bg-[#DE2626] active:text-white active:border-red-400'
            }`}
            title="B: Sword Slash / Charge Spin"
          >
            B
          </button>

          {/* A Button (Right) */}
          <button
            onPointerDown={e => {
              e.preventDefault();
              e.stopPropagation();
              setActiveBtn('a');
              onButtonPressA();
            }}
            onPointerUp={() => setActiveBtn(null)}
            onPointerCancel={() => setActiveBtn(null)}
            onClick={onButtonPressA}
            className={`absolute right-1 w-11 h-11 rounded-full flex items-center justify-center font-black text-base shadow-lg cursor-pointer transition-all duration-75 active:scale-90 touch-none select-none ${
              activeBtn === 'a'
                ? 'bg-[#DE2626] text-white border-2 border-red-400 shadow-[0_0_18px_rgba(222,38,38,0.9)] scale-95'
                : 'bg-white text-black border-2 border-white shadow-[0_4px_12px_rgba(255,255,255,0.25)] hover:border-zinc-300 active:bg-[#DE2626] active:text-white active:border-red-400'
            }`}
            title="A: Main Action / Interact"
          >
            A
          </button>
        </div>
      </div>
    </div>
  );
};
