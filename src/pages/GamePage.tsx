import React, { useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import GameCanvas from '../components/GameCanvas';
import { motion, AnimatePresence } from 'framer-motion';

const GamePage: React.FC = () => {
  const setStatus = useGameStore((state) => state.setStatus);
  const checkWin = useGameStore((state) => state.checkWin);
  const vehicle = useGameStore((state) => state.vehicle);

  const handleGameOver = useCallback(() => {
    checkWin();
  }, [checkWin]);

  const handleWin = useCallback(() => {
    setStatus('result');
  }, [setStatus]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none font-sans">
      {/* Game Canvas - Memoized and only depends on stable callbacks and vehicle */}
      <GameCanvas onGameOver={handleGameOver} onWin={handleWin} vehicle={vehicle} />

      {/* --- PREMIUM HUD OVERLAY --- */}
      <GameHUD />
    </div>
  );
};

// Extracted HUD to prevent GameCanvas re-renders on every stat update
const GameHUD: React.FC = () => {
  const stats = useGameStore((state) => state.stats);

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-40">
      
      {/* TOP CONSOLE: Stats & Progress */}
      <div className="flex justify-between items-start">
        
        {/* Left Console: Distance & Score */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="metallic-panel border-l-4 border-yamaha-glow p-4 flex flex-col gap-2 min-w-[140px]"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
        >
          <div>
            <p className="text-[9px] uppercase font-black text-white/40 tracking-[0.2em] mb-1">Traveled</p>
            <p className="text-3xl font-black italic tracking-tighter text-white leading-none">
              {stats.distance.toLocaleString()}<span className="text-xs ml-1 text-yamaha-glow opacity-80">M</span>
            </p>
          </div>
          <div className="h-[1px] bg-white/10 w-full" />
          <div>
            <p className="text-[9px] uppercase font-black text-white/40 tracking-[0.2em] mb-1">Score</p>
            <p className="text-2xl font-black italic tracking-tighter text-yamaha-glow leading-none">
              {stats.score.toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Right Console: Near Miss Fire */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="metallic-panel border-r-4 border-yellow-400 p-4 flex items-center gap-4"
          style={{ clipPath: 'polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
        >
          <div className="text-right">
            <p className="text-[9px] uppercase font-black text-white/40 tracking-[0.2em] mb-1">Near Miss</p>
            <p className="text-3xl font-black italic tracking-tighter text-yellow-400 leading-none">
              {stats.nearMisses}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-400/20 border-2 border-yellow-400/50 flex items-center justify-center animate-pulse">
              <span className="text-2xl">🔥</span>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM CONSOLE: Speedometer & Interaction */}
      <div className="flex justify-between items-end pb-8">
        
        {/* Interaction Guide */}
        <div className="flex flex-col gap-2">
           <motion.div 
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm"
           >
              <div className="w-2 h-2 rounded-full bg-yamaha-glow animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Swipe to dodge</span>
           </motion.div>
        </div>

        {/* HIGH-END SPEEDOMETER GAUGE */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-36 h-36 rounded-full metallic-panel p-2 border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
             {/* Digital Gauge Background */}
             <div className="w-full h-full rounded-full border-[10px] border-black/40 relative flex flex-col items-center justify-center overflow-hidden">
                
                {/* Rotating Gradient Indicator */}
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-transparent via-yamaha-glow/20 to-transparent opacity-40 transition-transform duration-100"
                  style={{ transform: `rotate(${(stats.speed / 180) * 180 - 90}deg)` }}
                />

                {/* Main Display */}
                <p className="text-4xl font-black italic text-white tracking-tighter leading-none relative z-10">
                  {stats.speed}
                </p>
                <p className="text-[9px] font-black text-yamaha-glow tracking-[0.4em] uppercase mt-1 relative z-10">KPH</p>
                
                {/* Gauge Decoration */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-yamaha-glow shadow-[0_0_10px_rgba(0,240,255,1)]" />
             </div>
          </div>

          {/* Pulsing Outer Ring */}
          <div className="absolute inset-0 rounded-full border-t-2 border-yamaha-glow opacity-30 animate-spin-slow pointer-events-none" />
        </motion.div>

      </div>

      {/* Warning Overlays */}
      <AnimatePresence>
        {stats.distance > 0 && stats.distance % 2000 > 1800 && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: -100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2, y: -50 }}
                className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-10 py-4 rounded-2xl font-black italic tracking-tighter text-3xl shadow-[0_0_40px_rgba(220,38,38,1)] border-2 border-white/40 z-50 pointer-events-none uppercase"
            >
                ⚠️ Danger Ahead ⚠️
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamePage;
