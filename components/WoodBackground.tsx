import React from 'react';
import { WOOD_TEXTURE_URL } from '../constants';

export const WoodBackground: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 z-0 select-none pointer-events-none bg-[#3e2723]" 
    >
      {/* 
        Layer 1: The Wood Texture 
        Displayed with full opacity and natural brightness.
      */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${WOOD_TEXTURE_URL})`,
          opacity: 1,
          // Slight contrast/saturation boost to make the grain pop naturally without darkening
          filter: 'contrast(1.1) saturate(1.1)' 
        }}
      />
    </div>
  );
};