import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, CapsuleColor } from '../types';
import { playFlip } from '../utils/audio';

interface QuestionCardProps {
  question: Question;
  color: CapsuleColor;
  onClose: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, color, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    playFlip();
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* The Morphing Card Container */}
      <div className="relative w-full max-w-sm aspect-[3/4] perspective-1000">
        <motion.div
          layoutId="active-capsule"
          className="w-full h-full relative cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={handleFlip}
        >
          {/* FRONT SIDE (Question) */}
          <div className={`absolute inset-0 w-full h-full rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center backface-hidden ${color.bg} border-8 border-white`}>
            <div className="bg-white/20 p-4 rounded-full mb-6">
              <span className="text-4xl">?</span>
            </div>
            <h3 className="text-white text-2xl font-bold mb-4 drop-shadow-md">
              问题 #{question.id}
            </h3>
            <p className="text-white text-xl font-semibold leading-relaxed drop-shadow-sm">
              {question.question}
            </p>
            <div className="mt-auto text-white/70 text-sm font-bold uppercase tracking-wider">
              点击查看答案
            </div>
          </div>

          {/* BACK SIDE (Answer) */}
          <div className={`absolute inset-0 w-full h-full rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 bg-white border-8 ${color.bg.replace('bg-', 'border-')}`}>
            <div className={`p-4 rounded-full mb-6 ${color.bg} text-white`}>
              <span className="text-4xl">!</span>
            </div>
            <h3 className={`text-2xl font-bold mb-4 ${color.dark.replace('bg-', 'text-')}`}>
              答案是
            </h3>
            <p className="text-slate-700 text-2xl font-bold leading-relaxed">
              {question.answer}
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className={`mt-auto px-6 py-3 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-opacity ${color.dark}`}
            >
              再玩一次
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};