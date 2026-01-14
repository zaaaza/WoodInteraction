import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, Car, Armchair, Square, 
  Wind, Lock, Power, X, Fan, Sliders, Volume2
} from 'lucide-react';
import { MenuItem } from '../types';
import { MENU_RADIUS } from '../constants';

interface SmartMenuProps {
  originX: number;
  originY: number;
  onClose: () => void;
}

interface DragHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'apps', label: '应用', icon: <LayoutGrid size={28} /> },
  { id: 'car', label: '车控', icon: <Car size={28} /> },
  { id: 'seat', label: '座椅', icon: <Armchair size={28} /> },
  { id: 'table', label: '桌板', icon: <Square size={28} /> },
  { id: 'volume', label: '音量', icon: <Volume2 size={28} /> },
];

const GLOW_CLASS = "mix-blend-plus-lighter bg-neutral-900/40 border border-white/20 shadow-[0_0_40px_rgba(255,200,150,0.15)] backdrop-blur-[1px]";
const DIMMED_CLASS = "bg-neutral-900/40 border border-white/10 backdrop-blur-[1px]"; // No glow, no blend mode

// --- Helper Math ---
const getRadialPos = (angleDeg: number, radius: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius
  };
};

// --- Volume Control Component ---

interface LayoutConfig {
  start: number;
  end: number;
  radius: number;
  isCircle: boolean;
}

interface VolumeControlProps {
  layout: LayoutConfig;
  onClose: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ layout, onClose }) => {
  const [volume, setVolume] = useState(0.6); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine Geometry based on the menu layout
  // The 'Volume' item is the last one (index 4).
  // The Arc should span from Item 0 to Item 3 (approx).
  // The Close button stays at Item 4's position.
  
  const TOTAL_ITEMS = 5;
  // Calculate the angular step between items
  const range = layout.end - layout.start;
  const step = range / (TOTAL_ITEMS - 1);

  // Angles
  // Item 0 (Start of arc)
  const ARC_START_ANGLE = layout.start;
  // Item 4 (Position of Close Button)
  const BUTTON_ANGLE = layout.end;
  
  // We want the arc to stop before it hits the button.
  // Let's stop it roughly around the position of Item 3.5
  const paddingSteps = 0.8; // Space between arc end and button
  const ARC_END_ANGLE = layout.end - (step * paddingSteps);

  // --- Interaction Logic ---
  
  // Interpolate angle for current volume
  const currentHandleAngle = ARC_START_ANGLE + (ARC_END_ANGLE - ARC_START_ANGLE) * volume;
  const handlePos = getRadialPos(currentHandleAngle, layout.radius);
  const buttonPos = getRadialPos(BUTTON_ANGLE, layout.radius);

  const updateVolume = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle from center
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    let angleRad = Math.atan2(dy, dx); 
    let angleDeg = (angleRad * 180) / Math.PI;

    // Normalize angle
    const totalSpan = ARC_END_ANGLE - ARC_START_ANGLE;
    let relativeAngle = angleDeg - ARC_START_ANGLE;
    while (relativeAngle < -180) relativeAngle += 360;
    while (relativeAngle > 180) relativeAngle -= 360;
    
    let newVol = relativeAngle / totalSpan;
    setVolume(Math.max(0, Math.min(1, newVol)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateVolume(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    updateVolume(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // SVG Path Generation
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
      const start = getRadialPos(startAngle, radius);
      const end = getRadialPos(endAngle, radius);
      
      const isIncreasing = endAngle > startAngle;
      const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";
      const sweepFlag = isIncreasing ? "1" : "0";

      return [
          "M", x + start.x, y + start.y, 
          "A", radius, radius, 0, largeArcFlag, sweepFlag, x + end.x, y + end.y
      ].join(" ");
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center"
    >
        {/* Center Origin Reference for absolute positioning */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0 pointer-events-auto">
            
            {/* The Track (Clickable Area) */}
            <svg 
                className="absolute overflow-visible" 
                style={{ left: 0, top: 0, pointerEvents: 'auto', cursor: 'grab' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
               {/* Background Track */}
               <path 
                 d={describeArc(0, 0, layout.radius, ARC_START_ANGLE, ARC_END_ANGLE)}
                 fill="none"
                 stroke="rgba(80,80,80, 0.6)" 
                 strokeWidth="64"
                 strokeLinecap="round"
                 className="backdrop-blur-sm"
               />
               
               {/* Active Track */}
               <path 
                 d={describeArc(0, 0, layout.radius, ARC_START_ANGLE, currentHandleAngle)}
                 fill="none"
                 stroke="rgba(255,255,255,0.15)"
                 strokeWidth="64"
                 strokeLinecap="round"
               />
            </svg>

            {/* The Handle */}
            <motion.div
                className="absolute w-16 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] pointer-events-none flex items-center justify-center z-20"
                style={{ 
                    left: handlePos.x,
                    top: handlePos.y,
                    x: "-50%",
                    y: "-50%",
                }}
            />

            {/* Close Button */}
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute w-20 h-20 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-white hover:bg-white/30 transition-all z-20 backdrop-blur-md shadow-lg"
                style={{ 
                    left: buttonPos.x,
                    top: buttonPos.y,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <X size={32} />
            </button>

        </div>
    </motion.div>
  );
};

// --- Detail View Component (Level 2) ---

interface DetailViewProps {
  activeId: string;
  onClose: () => void;
  dragHandlers: DragHandlers;
}

const DetailView: React.FC<DetailViewProps> = ({ 
  activeId, 
  dragHandlers 
}) => {
  const getSubButtons = () => {
    switch (activeId) {
      case 'seat':
        return [
          { icon: <Power size={32} />, label: '加热' },
          { icon: <Fan size={32} />, label: '通风' },
          { icon: <Armchair size={32} />, label: '按摩' },
        ];
      case 'car':
        return [
          { icon: <Lock size={32} />, label: '车锁' },
          { icon: <Wind size={32} />, label: '车窗' },
          { icon: <Car size={32} />, label: '后备箱' },
        ];
      default:
        return [
          { icon: <Sliders size={32} />, label: '调节' },
          { icon: <Sliders size={32} />, label: '模式' },
          { icon: <Sliders size={32} />, label: '设置' },
        ];
    }
  };

  const subButtons = getSubButtons();
  
  const isSeat = activeId === 'seat';
  const containerClasses = isSeat 
    ? "w-full aspect-video rounded-3xl flex items-center justify-center relative overflow-visible"
    : "w-full aspect-video bg-white/15 backdrop-blur-md border border-white/40 rounded-3xl flex items-center justify-center relative overflow-hidden mix-blend-plus-lighter shadow-[0_0_80px_rgba(255,255,255,0.15)]";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10, x: "-50%" }}
      animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, scale: 0.9, y: 10, x: "-50%", transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="absolute bottom-full left-1/2 mb-6 flex flex-col items-center gap-6 w-[600px] pointer-events-auto origin-bottom cursor-move touch-none"
      onPointerDown={dragHandlers.onPointerDown}
      onPointerMove={dragHandlers.onPointerMove}
      onPointerUp={dragHandlers.onPointerUp}
    >
      <div className={containerClasses}>
        
        {isSeat ? (
           <div className="w-full h-full relative z-10 scale-125">
              <iframe 
                  title="Car Seat"
                  className="w-full h-full"
                  src="https://sketchfab.com/models/b7b76bc653f14420896f9e02c36e6e8a/embed?autostart=1&camera=0&transparent=1&ui_animations=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_hint=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  frameBorder="0"
                  allowFullScreen
              />
           </div>
        ) : (
           <>
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-60 pointer-events-none" />
              <motion.div 
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-white/40 text-5xl font-black uppercase tracking-widest select-none"
                  style={{ transformStyle: 'preserve-3d' }}
              >
              Model
              </motion.div>
              {/* Tech Decor for non-seat items */}
              <div className="absolute top-3 left-3 w-3 h-3 border-l-2 border-t-2 border-white/50 pointer-events-none z-20" />
              <div className="absolute top-3 right-3 w-3 h-3 border-r-2 border-t-2 border-white/50 pointer-events-none z-20" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-l-2 border-b-2 border-white/50 pointer-events-none z-20" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-r-2 border-b-2 border-white/50 pointer-events-none z-20" />
           </>
        )}
      </div>

      <div 
        className="flex items-center gap-4 cursor-auto"
        onPointerDown={(e) => e.stopPropagation()} 
      >
        {subButtons.map((btn, idx) => (
          <motion.button
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="w-20 h-20 rounded-full bg-white/15 border border-white/30 flex flex-col items-center justify-center text-white/90 hover:text-white hover:bg-white/25 hover:border-white/50 transition-all mix-blend-plus-lighter shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            {btn.icon}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// --- Main SmartMenu Component ---

export const SmartMenu: React.FC<SmartMenuProps> = ({ originX, originY /*, onClose */ }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const hasInteractedWithLevel2 = useRef(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    // Disable staggered entrance animation after a longer delay (1.6s)
    // to match the 1.5s long-press wake up sequence.
    const timer = setTimeout(() => {
      setHasEntered(true);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeId) {
      hasInteractedWithLevel2.current = true;
    }
  }, [activeId]);
  
  const [pos, setPos] = useState({ x: originX, y: originY });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPos({ x: originX, y: originY });
  }, [originX, originY]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    setPos({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    // Allows event to bubble to SmartTable to handle 'cancel' logic (hide menu if not locked)
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const dragHandlers: DragHandlers = { onPointerDown, onPointerMove, onPointerUp };

  const layout = useMemo(() => {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const threshold = 180; 
    
    const x = pos.x;
    const y = pos.y;

    const isTop = y < threshold;
    const isBottom = y > winH - threshold;
    const isLeft = x < threshold;
    const isRight = x > winW - threshold;

    let radius = MENU_RADIUS;
    let config = { start: 180, end: 360, radius, isCircle: false }; 
    const cornerRadius = 220;

    if (isTop && isLeft) config = { start: 0, end: 90, radius: cornerRadius, isCircle: false };
    else if (isTop && isRight) config = { start: 90, end: 180, radius: cornerRadius, isCircle: false };
    else if (isBottom && isRight) config = { start: 180, end: 270, radius: cornerRadius, isCircle: false };
    else if (isBottom && isLeft) config = { start: 270, end: 360, radius: cornerRadius, isCircle: false };
    else if (isTop) config = { start: 20, end: 160, radius, isCircle: false };
    else if (isBottom) config = { start: 200, end: 340, radius, isCircle: false };
    else if (isLeft) config = { start: -70, end: 70, radius, isCircle: false };
    else if (isRight) config = { start: 110, end: 250, radius, isCircle: false };

    return config;
  }, [pos]);

  const getItemConfig = (index: number, total: number) => {
    const isLinearView = activeId && activeId !== 'volume'; 

    if (isLinearView) {
      // Static layout: centered row
      // We center items around x=0 (the menu origin point).
      const spacing = 80;
      const centerOffset = (total - 1) / 2;
      const x = (index - centerOffset) * spacing;
      
      // Fixed Y position below the touch point/center.
      const y = 80; 
      
      return {
        x,
        y, 
        scale: 0.6, // Uniform scale
        opacity: 0.3, // Uniform opacity
        zIndex: 10,
      };
    } else {
      let angleDeg;
      if (layout.isCircle) {
          angleDeg = layout.start + (index * (360 / total));
      } else {
          const step = (layout.end - layout.start) / (total - 1);
          angleDeg = layout.start + (index * step);
      }
      const angleRad = angleDeg * (Math.PI / 180);
      const tx = Math.cos(angleRad) * layout.radius;
      const ty = Math.sin(angleRad) * layout.radius;
      
      return {
        x: tx,
        y: ty,
        scale: 1,
        opacity: 1,
        zIndex: 20,
      };
    }
  };

  return (
    <motion.div 
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <div 
        className="absolute w-0 h-0 z-30 pointer-events-auto touch-none"
        style={{ left: pos.x, top: pos.y }}
      >
        <div 
          className={`absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full cursor-move ${isDragging ? 'cursor-grabbing' : ''}`}
          {...dragHandlers}
        />

        <AnimatePresence mode="wait">
          {activeId === 'volume' ? (
             <VolumeControl 
                key="volume" 
                layout={layout} 
                onClose={() => setActiveId(null)} 
             />
          ) : activeId ? (
            <DetailView 
              key="detail"
              activeId={activeId} 
              onClose={() => setActiveId(null)} 
              dragHandlers={dragHandlers}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {MENU_ITEMS.map((item, index) => {
            const config = getItemConfig(index, MENU_ITEMS.length);
            
            // TARGET: Finish animation at ~1.5s (long press duration).
            // Formula: (LastItemIndex * Stagger) + Duration = ~1.5
            // 5 items (idx 0-4).
            // (4 * 0.17) + 0.8 = 0.68 + 0.8 = 1.48s
            const STAGGER = 0.25; 
            const DURATION = 1;
            
            const isEntryAnimation = !hasEntered && !activeId && !hasInteractedWithLevel2.current;
            const isVolumeActive = activeId === 'volume';
            const isLevel2 = !!activeId && activeId !== 'volume';

            return (
              <motion.div
                key={item.id}
                className={`${isLevel2 ? DIMMED_CLASS : GLOW_CLASS} absolute flex flex-col items-center justify-center overflow-hidden cursor-pointer rounded-full`}
                style={{
                  zIndex: config.zIndex,
                  x: "-50%",
                  y: "-50%",
                  pointerEvents: isVolumeActive ? 'none' : 'auto', 
                }}
                initial={{ 
                    scale: 0, 
                    opacity: 0, 
                    left: isEntryAnimation ? 0 : config.x, 
                    top: isEntryAnimation ? 0 : config.y 
                }}
                animate={{ 
                  scale: isVolumeActive ? 0 : config.scale, 
                  opacity: isVolumeActive ? 0 : config.opacity,
                  left: config.x,
                  top: config.y,
                  width: 96,
                  height: 96,
                }}
                exit={{ 
                  scale: 0, 
                  opacity: 0, 
                  left: 0, 
                  top: 0, 
                  transition: { duration: 0.2 } 
                }}
                transition={
                  isEntryAnimation
                    ? {
                        type: "spring",
                        duration: DURATION,
                        bounce: 0.2, // Slightly reduced bounce for smoother "filling" of time
                        delay: index * STAGGER
                      }
                    : {
                        type: "spring",
                        stiffness: 250,
                        damping: 25,
                        delay: 0
                      }
                }
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeId) {
                      setActiveId(null);
                  } else {
                      setActiveId(item.id);
                  }
                }}
                onPointerDown={(e) => e.stopPropagation()} 
              >
                 <motion.div 
                    className="flex flex-col items-center justify-center pointer-events-none"
                 >
                    <div className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)]">
                      {item.icon}
                    </div>
                    <span className="mt-2 text-xs font-bold text-white tracking-widest opacity-80 drop-shadow-[0_0_5px_rgba(0,0,0,1)]">
                      {item.label}
                    </span>
                  </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

      </div>
    </motion.div>
  );
};