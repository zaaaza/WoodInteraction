import React from 'react';
import { motion } from 'framer-motion';

interface SuccessBurstProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

export const SuccessBurst: React.FC<SuccessBurstProps> = ({ x, y, onComplete }) => {
  return (
    <div 
      className="absolute top-0 left-0 w-0 h-0 pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      {/* 1. The Main Shockwave Ring */}
      <motion.div
        initial={{ scale: 0, opacity: 1, borderWidth: 8, x: "-50%", y: "-50%" }}
        animate={{ scale: 4, opacity: 0, borderWidth: 0, x: "-50%", y: "-50%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onAnimationComplete={onComplete}
        className="absolute w-40 h-40 rounded-full border-white bg-transparent mix-blend-plus-lighter shadow-[0_0_40px_rgba(255,255,255,0.8)] box-border"
      />

      {/* 2. Secondary Faster Ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8, x: "-50%", y: "-50%" }}
        animate={{ scale: 2.5, opacity: 0, x: "-50%", y: "-50%" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute w-40 h-40 rounded-full border border-white/50 bg-transparent mix-blend-plus-lighter"
      />

      {/* 3. Center Flash */}
      <motion.div
        initial={{ scale: 0, opacity: 1, x: "-50%", y: "-50%" }}
        animate={{ scale: 1.5, opacity: 0, x: "-50%", y: "-50%" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute w-12 h-12 rounded-full bg-white blur-md mix-blend-plus-lighter"
      />
    </div>
  );
};