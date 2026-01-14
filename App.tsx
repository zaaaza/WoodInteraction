import React from 'react';
import { SmartTable } from './components/SmartTable';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen relative overflow-hidden bg-[#2d1b0e]">
      <SmartTable />
      
      {/* Overlay Instructions */}
      <div className="absolute bottom-10 left-0 right-0 pointer-events-none flex justify-center z-50 mix-blend-plus-lighter">
        <p className="text-white/80 text-xs font-bold tracking-[0.2em] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          Tap to interact • Hold 1.5s for Menu
        </p>
      </div>
    </div>
  );
};

export default App;