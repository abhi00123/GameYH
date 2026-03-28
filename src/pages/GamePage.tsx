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
    <div className="relative w-full h-full overflow-hidden bg-black select-none font-sans">
      <GameCanvas onGameOver={handleGameOver} onWin={handleWin} vehicle={vehicle} />
      <GameHUD />
    </div>
  );
};

// Extracted HUD to prevent GameCanvas re-renders on every stat update
const GameHUD: React.FC = React.memo(() => {
  const stats = useGameStore((state) => state.stats);

  // SVG Gauge calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius; // ~289
  const arcLength = circumference * 0.75; // 270 degree arc (~216.7)
  const maxSpeed = 280; // Top speed scale reference
  const speedRatio = Math.min(stats.speed / maxSpeed, 1);
  const strokeDashoffset = arcLength * (1 - speedRatio);

  return (
    <div className="absolute inset-0 pointer-events-none p-4 res-p flex flex-col justify-between z-40">
      
      {/* TOP CONSOLE: Stats & Progress */}
      <div className="flex justify-between items-start mt-2">
        
        {/* Left Console: Distance & Score */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col gap-2 relative pl-3"
        >
          {/* Cyber Edge Frame */}
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-yamaha-glow via-yamaha-glow/50 to-transparent shadow-[0_0_15px_rgba(0,240,255,1)]" />
          
          <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 pb-2 rounded-r-xl border border-white/5 shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            <p className="text-[8px] uppercase font-black text-white/50 tracking-[0.3em] mb-[2px]">Traveled</p>
            <p className="text-3xl font-black italic tracking-tighter text-white leading-none tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {stats.distance.toLocaleString()}<span className="text-[11px] ml-1 text-yamaha-glow/80 italic tracking-normal">M</span>
            </p>
          </div>
          
          <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 pb-2 rounded-r-xl border border-white/5 shadow-[0_10px_20px_rgba(0,0,0,0.5)] ml-4">
            <p className="text-[8px] uppercase font-black text-white/50 tracking-[0.3em] mb-[2px]">Score</p>
            <p className="text-2xl font-black italic tracking-tighter text-yamaha-glow text-glow-premium leading-none tabular-nums">
              {stats.score.toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Right Console: Near Miss Fire */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/60 backdrop-blur-md border border-yellow-400/20 pl-4 py-1.5 pr-1.5 pb-1.5 rounded-l-full rounded-r-full flex items-center gap-3 shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
        >
          <div className="text-right mt-1">
            <p className="text-[8px] uppercase font-black text-yellow-500/60 tracking-[0.2em] mb-[2px]">Near Miss</p>
            <p className="text-2xl font-black italic tracking-tighter text-yellow-400 leading-none tabular-nums drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
              {stats.nearMisses}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.8)] border-2 border-yellow-200">
              <span className="text-xl drop-shadow-md relative top-[1px]">🔥</span>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM CONSOLE: Interaction & Speedometer */}
      <div className="flex justify-between items-end pb-4 res-p">
        
        {/* Interaction Guide */}
        <div className="flex flex-col gap-2 mb-2">
           <motion.div 
              animate={{ opacity: [0.3, 1, 0.3], x: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-transparent via-white/10 to-transparent border-y border-white/5 backdrop-blur-sm"
           >
              <div className="w-2 h-2 rounded-full bg-yamaha-glow shadow-[0_0_8px_rgba(0,240,255,1)] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 italic drop-shadow-md scale-y-110">SWIPE TO DODGE</span>
           </motion.div>
        </div>

        {/* HIGH-END SVG ARC SPEEDOMETER */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative origin-bottom-right drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
        >
          <div className="w-[120px] h-[120px] relative flex items-center justify-center">
             
             {/* Background Pulse Ring */}
             <div className="absolute inset-2 bg-yamaha-glow/10 rounded-full blur-xl animate-pulse" />

             {/* SVG HUD Track */}
             <svg className="absolute inset-0 w-full h-full -rotate-[135deg] pointer-events-none">
               {/* Dark Track */}
               <circle 
                 cx="60" cy="60" r={radius} 
                 fill="none" 
                 stroke="rgba(255,255,255,0.1)" 
                 strokeWidth="8" 
                 strokeDasharray={`${arcLength} ${circumference}`} 
                 strokeLinecap="round" 
               />
               
               {/* Neon Progress Track */}
               <circle 
                 cx="60" cy="60" r={radius} 
                 fill="none" 
                 stroke="#00F0FF" 
                 strokeWidth="8" 
                 strokeDasharray={`${arcLength} ${circumference}`}
                 strokeDashoffset={strokeDashoffset}
                 strokeLinecap="round"
                 style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                 className="drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]"
               />

               {/* Inner decorative dotted track */}
               <circle 
                 cx="60" cy="60" r={radius - 12} 
                 fill="none" 
                 stroke="rgba(255,255,255,0.2)" 
                 strokeWidth="2" 
                 strokeDasharray="4 8"
                 strokeLinecap="round" 
               />
             </svg>
             
             {/* Digital Number Center */}
             <div className="w-[82px] h-[82px] bg-black/80 backdrop-blur-md rounded-full border border-yamaha-glow/30 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,240,255,0.15)] z-10">
                <p className="text-[40px] font-black italic text-white tracking-tighter leading-none tabular-nums drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] relative top-1">
                  {stats.speed}
                </p>
                <p className="text-[9px] font-black text-yamaha-glow tracking-[0.3em] uppercase opacity-80 mt-1">KPH</p>
             </div>
          </div>
        </motion.div>

      </div>

      {/* Warning Overlays */}
      <AnimatePresence>
        {stats.distance > 0 && stats.distance % 2000 > 1800 && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: -100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2, y: -50 }}
                className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-8 py-3 rounded-2xl font-black italic tracking-[0.1em] text-2xl shadow-[0_0_40px_rgba(220,38,38,1)] border-2 border-red-400/50 z-50 pointer-events-none uppercase text-center backdrop-blur-sm"
            >
                ⚠️ DANGER AHEAD ⚠️
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default GamePage;
