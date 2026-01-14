import React from 'react';
import { motion } from 'framer-motion';

interface RippleProps {
  x: number;
  y: number;
}

export const RippleEffect: React.FC<RippleProps> = ({ x, y }) => {
  return (
    <div className="absolute top-0 left-0 w-0 h-0 mix-blend-plus-lighter pointer-events-none">
      {/* Outer Glow Ring */}
      <motion.div
        initial={{ opacity: 0.6, scale: 0, borderColor: 'rgba(255,255,255,0.8)', borderWidth: 3 }} 
        animate={{ opacity: 0, scale: 4, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 0 }} 
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute rounded-full border shadow-[0_0_40px_rgba(255,200,150,0.5)] box-border"
        style={{
          left: x - 50,
          top: y - 50,
          width: 100,
          height: 100,
        }}
      />
      
      {/* Inner Bright Spark */}
      <motion.div
        initial={{ opacity: 1, scale: 0 }}
        animate={{ opacity: 0, scale: 2 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute rounded-full bg-white blur-[6px] shadow-[0_0_30px_rgba(255,255,255,1)]"
        style={{
          left: x - 10,
          top: y - 10,
          width: 20,
          height: 20,
        }}
      />
    </div>
  );
};