import React from 'react';
import { useGameStore } from './store/useGameStore';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import SelectionPage from './pages/SelectionPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';

const App: React.FC = () => {
  const status = useGameStore((state) => state.status);

  return (
    <div className="w-full h-full bg-black overflow-hidden select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-full h-full"
        >
          {status === 'landing' && <LandingPage />}
          {status === 'selecting' && <SelectionPage />}
          {status === 'playing' && <GamePage />}
          {status === 'result' && <ResultPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default App;
