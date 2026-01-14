import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Ripple } from '../types';
import { LONG_PRESS_DURATION } from '../constants';
import { WoodBackground } from './WoodBackground';
import { SmartMenu } from './SmartMenu';
import { RippleEffect } from './RippleEffect';
import { SuccessBurst } from './SuccessBurst';

export const SmartTable: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [pressStart, setPressStart] = useState<number | null>(null);
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuLocked, setMenuLocked] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  
  // State to trigger the success burst animation
  const [burstTimestamp, setBurstTimestamp] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle Pointer Down (Touch or Click)
  const handlePointerDown = (e: React.PointerEvent) => {
    // If menu is already locked open, clicking elsewhere might close it
    if (menuVisible && menuLocked) {
      setMenuVisible(false);
      setMenuLocked(false);
      return;
    }

    const { clientX, clientY } = e;
    setIsPressed(true);
    setPressStart(Date.now());
    
    // Show menu immediately in "charging" state
    setMenuPos({ x: clientX, y: clientY });
    setMenuVisible(true);
    setMenuLocked(false);

    // Start Long Press Timer to LOCK the menu
    timerRef.current = setTimeout(() => {
      setIsPressed(false); 
      setMenuLocked(true); // Lock the menu open
      
      // Trigger the success light burst
      setBurstTimestamp(Date.now());

      if (navigator.vibrate) navigator.vibrate(50);
    }, LONG_PRESS_DURATION);
  };

  // Handle Pointer Up (Release)
  const handlePointerUp = (e: React.PointerEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsPressed(false);
    setPressStart(null);

    // If the menu hasn't locked yet (released before 1.5s), hide it
    if (!menuLocked) {
      setMenuVisible(false);
      
      // If it was a short tap, trigger ripple
      const pressDuration = Date.now() - (pressStart || 0);
      if (pressDuration < 200) { // Only ripple on quick taps, not failed long presses
        addRipple(e.clientX, e.clientY);
      }
    }
  };

  const addRipple = (x: number, y: number) => {
    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
      timestamp: Date.now(),
    };
    
    setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 2000);

    setRipples((prev) => [...prev, newRipple]);
  };

  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div 
      className="w-full h-full relative touch-none cursor-pointer select-none overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      <WoodBackground />

      {/* Layer 1: 2D Ripples (Bottom) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {ripples.map((ripple) => (
            <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} />
          ))}
        </AnimatePresence>
      </div>

      {/* Layer 2: UI Menu (Middle) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <AnimatePresence>
          {menuVisible && (
            <SmartMenu 
              originX={menuPos.x} 
              originY={menuPos.y} 
              onClose={() => {
                setMenuVisible(false);
                setMenuLocked(false);
              }} 
            />
          )}
        </AnimatePresence>
      </div>

      {/* Layer 3: High Priority Effects (Burst) - Renders ON TOP of menu */}
      <div className="absolute inset-0 z-30 pointer-events-none">
         <AnimatePresence>
          {burstTimestamp && (
            <SuccessBurst 
              key={burstTimestamp} 
              x={menuPos.x} 
              y={menuPos.y} 
              onComplete={() => setBurstTimestamp(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};