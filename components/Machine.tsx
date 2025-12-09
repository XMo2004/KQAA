import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { MachineState, CapsuleColor } from '../types';
import { CAPSULE_COLORS } from '../constants';
import { Capsule } from './Capsule';
import { playCrank, playShuffle, stopShuffle } from '../utils/audio';

interface MachineProps {
  state: MachineState;
  onDraw: () => void;
  onCapsuleClick: () => void;
  prizeColor: CapsuleColor | null;
}

// Generate some random positions for the deco capsules inside the globe
const generateDecoCapsules = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 140 - 70, // Spread within the globe
    y: Math.random() * 140 - 70,
    color: CAPSULE_COLORS[i % CAPSULE_COLORS.length],
    rotation: Math.random() * 360,
  }));
};

const decoCapsules = generateDecoCapsules(8);

export const Machine: React.FC<MachineProps> = ({ state, onDraw, onCapsuleClick, prizeColor }) => {
  // Handle rotation animation
  const [handleRotation, setHandleRotation] = useState(0);

  // Sound Effect Logic for Shuffling
  useEffect(() => {
    if (state === 'SHUFFLING') {
      setHandleRotation((prev) => prev + 360);
      playShuffle();
    } else {
      stopShuffle();
    }
    // Cleanup on unmount
    return () => stopShuffle();
  }, [state]);

  const isShuffling = state === 'SHUFFLING';
  const isDropping = state === 'DROPPING';
  const isWaiting = state === 'WAITING_TO_OPEN';

  // Animation variants for internal capsules
  const capsuleVariants: Variants = {
    idle: (i: number) => ({
      y: [0, -10, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 3 + Math.random(),
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.2
      }
    }),
    shuffling: (i: number) => {
      // Create random keyframes for a chaotic shuffling effect
      // Use slightly different ranges for x/y to fit the container roughly
      const randomKeyframes = (range: number) => 
        Array.from({ length: 8 }).map(() => (Math.random() - 0.5) * range);

      return {
        x: randomKeyframes(180), // Move widely
        y: randomKeyframes(180),
        rotate: randomKeyframes(720), // Spin wildy
        scale: [1, 0.9, 1.1, 0.8, 1], // Squish effect
        zIndex: Math.floor(Math.random() * 10), // Random depth changes (simulated)
        transition: {
          duration: 0.6, // Fast changes
          repeat: Infinity,
          ease: "linear",
          repeatType: "mirror"
        }
      };
    }
  };

  const handleDrawClick = () => {
    if (state === 'IDLE') {
      playCrank();
      onDraw();
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* --- Machine Header / Globe --- */}
      <div className="relative z-10 w-72 h-72 bg-sky-100 rounded-full border-4 border-slate-300 shadow-xl overflow-hidden backdrop-blur-sm">
        {/* Glass Reflection */}
        <div className="absolute top-4 left-4 w-16 h-8 bg-white/40 rounded-full -rotate-12 z-20 pointer-events-none" />
        
        {/* Internal Capsules */}
        <div className="absolute inset-0 flex items-center justify-center">
          {decoCapsules.map((capsule) => (
            <motion.div
              key={capsule.id}
              className="absolute"
              initial={{ x: capsule.x, y: capsule.y, rotate: capsule.rotation }}
              animate={isShuffling ? "shuffling" : "idle"}
              custom={capsule.id}
              variants={capsuleVariants}
            >
              <Capsule color={capsule.color} size={50} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- Machine Body/Base --- */}
      <div className="relative z-0 -mt-10 w-64 h-64">
        {/* Main Base Shape */}
        <div className="w-full h-full bg-rose-400 rounded-3xl shadow-2xl flex flex-col items-center justify-end pb-6 border-b-8 border-rose-600">
           {/* Decorative Lines */}
           <div className="absolute top-12 w-full h-4 bg-rose-500/30" />

           {/* --- The Handle --- */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ rotate: handleRotation }}
                transition={{ duration: 1, ease: "easeInOut" }}
                onClick={handleDrawClick}
                disabled={state !== 'IDLE'}
                className={`w-24 h-24 rounded-full bg-white border-4 border-slate-200 shadow-lg flex items-center justify-center cursor-pointer ${state !== 'IDLE' ? 'cursor-not-allowed opacity-90' : ''}`}
                aria-label="Turn handle to draw"
              >
                {/* Handle Crossbar */}
                <div className="w-20 h-6 bg-slate-300 rounded-full absolute shadow-inner" />
                <div className="w-6 h-20 bg-slate-300 rounded-full absolute shadow-inner" />
                <div className="w-8 h-8 bg-slate-400 rounded-full absolute z-10" />
              </motion.button>
              <div className="mt-14 text-center font-bold text-rose-800 text-sm tracking-widest opacity-80 select-none">
                {state === 'IDLE' ? '点我' : '旋转中...'}
              </div>
           </div>

           {/* --- Output Tray (The Hole) --- */}
           <div className="relative w-32 h-20 bg-rose-800 rounded-t-full rounded-b-2xl shadow-inner overflow-visible flex items-end justify-center pb-2 z-30">
              
              {/* The Dropped Prize Capsule */}
              <AnimatePresence>
                {(isDropping || isWaiting) && prizeColor && (
                  <motion.div
                    layoutId="active-capsule" // Magic sauce for the reveal morph
                    initial={{ y: -150, scale: 0.5, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }} // If needed
                    transition={{ 
                      type: "spring", 
                      stiffness: 120, 
                      damping: 14,
                      mass: 1.2
                    }}
                    className="absolute bottom-2 z-40"
                  >
                    <Capsule 
                      color={prizeColor} 
                      size={70} 
                      onClick={onCapsuleClick}
                      className={isWaiting ? "animate-bounce cursor-pointer" : ""}
                    />
                    {isWaiting && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-xs font-bold px-2 py-1 rounded-md text-slate-700 shadow-sm"
                      >
                        点我打开！
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
        
        {/* Legs */}
        <div className="absolute -bottom-2 left-4 w-8 h-4 bg-rose-700 rounded-b-lg" />
        <div className="absolute -bottom-2 right-4 w-8 h-4 bg-rose-700 rounded-b-lg" />
      </div>
    </div>
  );
};