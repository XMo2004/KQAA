import React from 'react';
import { motion } from 'framer-motion';
import { CapsuleColor } from '../types';

interface CapsuleProps {
  color: CapsuleColor;
  size?: number;
  className?: string;
  layoutId?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Capsule: React.FC<CapsuleProps> = ({ 
  color, 
  size = 60, 
  className = '', 
  layoutId,
  onClick,
  style
}) => {
  return (
    <motion.div
      layoutId={layoutId}
      className={`rounded-full relative overflow-hidden shadow-lg border-2 border-black/10 cursor-pointer ${className} ${color.bg}`}
      style={{ width: size, height: size, ...style }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Top Shine */}
      <div className="absolute top-2 left-2 w-1/3 h-1/3 bg-white/40 rounded-full blur-[1px]" />
      
      {/* Bottom Half shading to make it look like a capsule/ball */}
      <div className={`absolute bottom-0 w-full h-[45%] ${color.dark} opacity-30`} />
      
      {/* Center Line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black/10 -translate-y-1/2" />
    </motion.div>
  );
};