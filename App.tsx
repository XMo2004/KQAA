import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Machine } from './components/Machine';
import { QuestionCard } from './components/QuestionCard';
import { MachineState, Question, CapsuleColor } from './types';
import { QUESTIONS, CAPSULE_COLORS } from './constants';
import { playPop } from './utils/audio';

const App: React.FC = () => {
  const [machineState, setMachineState] = useState<MachineState>('IDLE');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentPrizeColor, setCurrentPrizeColor] = useState<CapsuleColor | null>(null);

  // Helper to get a random item
  const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const handleDraw = useCallback(() => {
    if (machineState !== 'IDLE') return;

    // 1. Start Shuffling
    setMachineState('SHUFFLING');
    
    // Select data immediately (hidden from user)
    const randomQ = getRandomItem(QUESTIONS);
    const randomColor = getRandomItem(CAPSULE_COLORS);
    setCurrentQuestion(randomQ);
    setCurrentPrizeColor(randomColor);

    // 2. Transition to Dropping after shuffle animation
    setTimeout(() => {
      setMachineState('DROPPING');
      
      // 3. Transition to Waiting state (capsule sits in tray)
      setTimeout(() => {
        setMachineState('WAITING_TO_OPEN');
      }, 600); // Time for the drop animation to finish landing
    }, 1500); // Duration of shuffling
  }, [machineState]);

  const handleOpenCapsule = useCallback(() => {
    if (machineState === 'WAITING_TO_OPEN') {
      playPop();
      setMachineState('REVEALED');
    }
  }, [machineState]);

  const handleReset = useCallback(() => {
    setMachineState('IDLE');
    // Clear data after exit animation
    setTimeout(() => {
      setCurrentQuestion(null);
      setCurrentPrizeColor(null);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-50 to-purple-100 overflow-hidden">
      
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">
          <span className="text-rose-500">趣味</span>扭蛋问答
        </h1>
        <p className="text-slate-500 font-bold text-lg">测测你的冷知识储备！</p>
      </header>

      {/* Main Machine Area */}
      <main className="relative w-full max-w-lg flex flex-col items-center">
        <Machine 
          state={machineState} 
          onDraw={handleDraw} 
          onCapsuleClick={handleOpenCapsule}
          prizeColor={currentPrizeColor}
        />
      </main>

      {/* Instructions / Status */}
      <div className="mt-12 h-8 text-center">
        <AnimatePresence mode="wait">
          {machineState === 'IDLE' && (
            <Instructions text="旋转手柄抽取一个问题！" />
          )}
          {machineState === 'SHUFFLING' && (
            <Instructions text="知识搅拌中..." />
          )}
          {machineState === 'WAITING_TO_OPEN' && (
            <Instructions text="抽到了！点击扭蛋打开。" />
          )}
        </AnimatePresence>
      </div>

      {/* The Revealed Card Modal */}
      <AnimatePresence>
        {machineState === 'REVEALED' && currentQuestion && currentPrizeColor && (
          <QuestionCard
            question={currentQuestion}
            color={currentPrizeColor}
            onClose={handleReset}
          />
        )}
      </AnimatePresence>

      <footer className="fixed bottom-4 text-slate-400 text-xs font-semibold">
        © {new Date().getFullYear()} GashaQuiz Inc.
      </footer>
    </div>
  );
};

// Simple text component with animation
const Instructions: React.FC<{ text: string }> = ({ text }) => (
  <motion.p
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="text-slate-600 font-bold text-lg"
  >
    {text}
  </motion.p>
);

export default App;