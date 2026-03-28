import React, { useCallback, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import GameCanvas from '../components/GameCanvas';
import { motion, AnimatePresence } from 'framer-motion';

const GamePage: React.FC = () => {
  const checkWin = useGameStore((state) => state.checkWin);
  const vehicle = useGameStore((state) => state.vehicle);
  const [showTutorial, setShowTutorial] = useState(true);

  const handleGameOver = useCallback(() => {
    checkWin();
  }, [checkWin]);

  // Note: Winning is now handled directly via Game Over logic evaluating the score threshold

  const dismissTutorial = () => {
    if (showTutorial) setShowTutorial(false);
  };

  return (
    <div 
        className="relative w-full h-full overflow-hidden bg-black select-none font-sans"
        onTouchStart={dismissTutorial}
        onMouseDown={dismissTutorial}
    >
      <GameCanvas onGameOver={handleGameOver} vehicle={vehicle} isPaused={showTutorial} />
      <GameHUD showTutorial={showTutorial} />
    </div>
  );
};

// Extracted HUD to prevent GameCanvas re-renders on every stat update
const GameHUD: React.FC<{showTutorial: boolean}> = React.memo(({ showTutorial }) => {
  const stats = useGameStore((state) => state.stats);

  // SVG Gauge calculations (Upgraded Size)
  const radius = 56;
  const circumference = 2 * Math.PI * radius; // ~351
  const arcLength = circumference * 0.75; // 270 degree arc (~263)
  const maxSpeed = 280; // Top speed scale reference
  const speedRatio = Math.min(stats.speed / maxSpeed, 1);
  const strokeDashoffset = arcLength * (1 - speedRatio);
  
  // Dynamic color threshold
  const isHighSpeed = stats.speed > 160;

  return (
    <div className="absolute inset-0 pointer-events-none px-4 pt-12 pb-6 flex flex-col justify-between z-40">
      
      {/* FULL SCREEN TUTORIAL OVERLAY */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none"
          >
            <div className="flex gap-8 items-end mb-8">
               {/* Gesture 1: Swipe to Dodge */}
               <div className="flex flex-col items-center">
                 <motion.div
                   animate={{ x: [-35, 35, -35] }}
                   transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                   className="mb-4"
                 >
                   <div className="w-16 h-16 bg-yamaha-glow/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.6)] border border-yamaha-glow/30">
                     <span className="text-4xl drop-shadow-[0_0_20px_rgba(0,240,255,1)]">👆</span>
                   </div>
                 </motion.div>
                 <h2 className="text-xl font-black italic tracking-widest uppercase chrome-text text-ghosting text-center leading-tight">
                    SWIPE<br/>TO DODGE
                 </h2>
               </div>

               {/* Divider Ring */}
               <div className="w-[1px] h-24 bg-white/20 relative top-2 rounded-full" />

               {/* Gesture 2: Hold to Accelerate */}
               <div className="flex flex-col items-center">
                 <motion.div
                   animate={{ scale: [1, 0.8, 1] }}
                   transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                   className="mb-4 relative"
                 >
                   <div className="absolute inset-0 bg-yellow-400 rounded-full blur animate-ping opacity-30" />
                   <div className="w-16 h-16 relative bg-yellow-400/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.6)] border border-yellow-400/30">
                     <span className="text-4xl drop-shadow-[0_0_20px_rgba(250,204,21,1)]">👆</span>
                   </div>
                 </motion.div>
                 <h2 className="text-xl font-black italic tracking-widest uppercase text-yellow-400 text-glow-premium text-center leading-tight [text-shadow:0_0_20px_rgba(250,204,21,0.8)]">
                    HOLD<br/>TO ACCEL
                 </h2>
               </div>
            </div>

            <p className="mt-8 text-[11px] font-black tracking-[0.6em] uppercase text-white animate-pulse bg-white/10 py-3 px-8 rounded-full border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                TAP TO START RACING
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP CONSOLE: Stats & Progress */}
      <div className="flex justify-between items-start">
        
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
      {/* PB-20 shifts it forcefully above iOS Safari bottom navigation tabs / UI elements */}
      <div className="flex justify-end items-end pb-20 pr-6 xl:pb-12 xl:pr-4">
        
        {/* AGGRESSIVE NEON SPEEDOMETER */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative origin-bottom-right drop-shadow-[0_10px_30px_rgba(0,0,0,1)]"
        >
          <div className="w-[140px] h-[140px] relative flex flex-col items-center justify-center">
             
             {/* Dynamic Neon Flare */}
             <div className={`absolute inset-4 rounded-full blur-[20px] animate-pulse ${isHighSpeed ? 'bg-[#FF0055]/30' : 'bg-yamaha-glow/20'}`} />

             {/* Tech Grid Core */}
             <div className="absolute inset-1 rounded-full border border-white/5 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)'}} />

             <svg className="absolute inset-0 w-full h-full -rotate-[135deg] pointer-events-none">
               {/* Heavy Backbone Track */}
               <circle 
                 cx="70" cy="70" r={radius} 
                 fill="none" stroke="rgba(0,0,0,0.8)" strokeWidth="14" 
                 strokeDasharray={`${arcLength} ${circumference}`} strokeLinecap="round" 
               />
               <circle 
                 cx="70" cy="70" r={radius} 
                 fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" 
                 strokeDasharray={`${arcLength} ${circumference}`} strokeLinecap="round" 
               />
               
               {/* High-Voltage Velocity Arc */}
               <circle 
                 cx="70" cy="70" r={radius} 
                 fill="none" 
                 stroke={isHighSpeed ? "#FF0055" : "#00F0FF"} 
                 strokeWidth="10" 
                 strokeDasharray={`${arcLength} ${circumference}`}
                 strokeDashoffset={strokeDashoffset}
                 strokeLinecap="round"
                 style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
                 className={isHighSpeed ? "drop-shadow-[0_0_15px_rgba(255,0,85,1)]" : "drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]"}
               />

               {/* Precision Tick Marks */}
               <circle 
                 cx="70" cy="70" r={radius - 18} 
                 fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" 
                 strokeDasharray="2 12" strokeLinecap="round" 
               />
             </svg>
             
             {/* Digital Engine Display */}
             <div className="absolute w-[94px] h-[94px] bg-black/90 backdrop-blur-md rounded-full border border-white/10 flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,1)] z-10">
                <p className={`text-[46px] font-black italic tracking-tighter leading-none tabular-nums relative top-1 transition-colors duration-300 ${isHighSpeed ? 'text-[#FF0055] drop-shadow-[0_0_15px_rgba(255,0,85,0.8)]' : 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]'}`}>
                  {stats.speed}
                </p>
                <p className="text-[10px] font-black text-yamaha-glow tracking-[0.3em] uppercase opacity-70 mt-1">
                  KPH
                </p>
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
