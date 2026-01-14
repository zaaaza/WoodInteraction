
import React from 'react';
import { motion } from 'framer-motion';

interface ChargeEffectProps {
  x: number;
  y: number;
  duration: number; // ms
}

export const ChargeEffect: React.FC<ChargeEffectProps> = ({ x, y, duration }) => {
  return (
    <motion.div 
      className="absolute pointer-events-none"
      style={{ 
        left: x, 
        top: y, 
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'plus-lighter' // Best for transparent displays
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
    >
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* 1. Core Light Source (Bright center) */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,1)]"
        />

        {/* 2. Expanding White Glow (Ambient) */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: 1.2, 
            opacity: 0.4,
            transition: { duration: duration / 1000, ease: "easeInOut" }
          }}
          className="absolute w-20 h-20 bg-white rounded-full blur-2xl"
        />

        {/* 3. Progress Ring (Visual feedback for hold duration) */}
        <motion.svg 
          className="absolute w-28 h-28 -rotate-90 overflow-visible"
        >
          {/* Background track */}
          <circle
             cx="56"
             cy="56"
             r="52"
             stroke="rgba(255,255,255,0.2)"
             strokeWidth="2"
             fill="none"
          />
          {/* Active progress - WHITE */}
          <motion.circle
            cx="56"
            cy="56"
            r="52"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 1,
              transition: { duration: duration / 1000, ease: "linear" }
            }}
          />
        </motion.svg>
      </div>
    </motion.div>
  );
};