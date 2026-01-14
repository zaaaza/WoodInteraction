import React from 'react';

export const WoodBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 select-none pointer-events-none bg-[#463325] overflow-hidden">
      {/* 
        CSS-only Wood Texture 
        Replaces the network image with a high-performance procedural texture
        matching the uploaded dark walnut reference.
      */}
      
      {/* 1. Base Gradient (Warm Walnut) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#5c4232] to-[#3e2b22]" />

      {/* 2. Micro Grain (Fine lines) */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 1px,
            rgba(0,0,0,0.15) 1px,
            transparent 3px
          )`,
          backgroundSize: '100% 100%'
        }}
      />

      {/* 3. Macro Grain (Darker natural streaks) */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-color-burn"
        style={{
           backgroundImage: `repeating-linear-gradient(
            90.5deg,
            transparent 0px,
            transparent 8px,
            rgba(30,15,5,0.2) 9px,
            transparent 20px
          )`
        }}
      />
      
      {/* 4. Organic Texture (SVG Noise for realism) */}
      <div 
         className="absolute inset-0 opacity-15 mix-blend-overlay"
         style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
             filter: 'contrast(120%) brightness(100%)'
         }}
      />

      {/* 5. Subtle Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(20,10,5,0.4)_100%)]" />
    </div>
  );
};