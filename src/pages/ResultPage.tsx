import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';

const ResultPage: React.FC = () => {
  const { stats, resetStats, setStatus, lastWin } = useGameStore();

  const handlePlayAgain = () => {
    resetStats();
    setStatus('playing');
  };

  const handleHome = () => {
    resetStats();
    setStatus('landing');
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black relative overflow-hidden text-white p-6 carbon-pattern">
      
      {/* 2. CRT ARCADE SCANLINES (Global) */}
      <div className="crt-overlay" />

      {/* 3. HOLOGRAPHIC RING (Behind Report Card) */}
      <div className="holographic-ring" style={{ scale: 0.8 }} />

      {/* 4. ATMOSPHERIC SHADING */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-yamaha-blue/30 via-transparent to-yamaha-glow/20 pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm flex flex-col items-center gap-10 z-10"
      >
        {/* GAME OVER HEADER */}
        <div className="flex flex-col items-center relative overflow-visible w-full">
            <h1 className="text-6xl font-black italic tracking-tighter uppercase chrome-text text-ghosting leading-none px-12 whitespace-nowrap">
                <span className="inline-block pr-4">{lastWin ? 'VICTORY' : 'GAME OVER'}</span>
            </h1>
            <div className="w-24 h-1 bg-red-600 mt-4 shadow-[0_0_15px_rgba(255,0,0,1)]" />
        </div>

        {/* PERFORMANCE REPORT HUD */}
        <div className="w-full metallic-panel rounded-2xl p-8 relative overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-2 border-white/5">
            {/* CORNERS */}
            <div className="corner-bracket cb-tl" />
            <div className="corner-bracket cb-tr" />
            <div className="corner-bracket cb-bl" />
            <div className="corner-bracket cb-br" />

            <div className="flex flex-col gap-6 text-center">
                <div className="flex flex-col gap-1 items-center">
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Distance Reached</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter">{stats.distance.toLocaleString()}<span className="text-sm text-white/40 ml-1">M</span></p>
                </div>
                
                <div className="flex flex-col gap-1 items-center">
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Total Score</p>
                    <p className="text-4xl font-black text-yamaha-glow text-glow-premium italic tracking-tighter">{stats.score.toLocaleString()}</p>
                </div>

                <div className="flex flex-col gap-1 items-center">
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-yellow-500/60">Near Miss Bonus</p>
                    <p className="text-2xl font-black text-yellow-400 italic tracking-tighter">+{(stats.nearMisses * 1000).toLocaleString()}</p>
                </div>
            </div>
        </div>

        {/* ARCADE CONTROLS */}
        <div className="w-full flex flex-col gap-6 pt-4">
            <button 
                onClick={handlePlayAgain}
                className="w-full arcade-btn py-6 text-2xl"
            >
                REVIVE
            </button>
            
            <button 
                onClick={handleHome}
                className="w-full bg-white/5 border border-white/10 py-4 rounded-xl font-black uppercase tracking-[0.4em] text-[11px] text-white/40 hover:bg-white/10 transition-all hover:text-white"
            >
                EXIT TO HOME
            </button>
        </div>

        {/* Reward Overlay */}
        {lastWin && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-yellow-400 text-black font-black uppercase tracking-widest text-center italic rounded-xl shadow-[0_0_50px_rgba(250,204,21,0.5)] border-2 border-white/40"
            >
                YOU WON A ₹3000 DISCOUNT!
            </motion.div>
        )}
      </motion.div>

        {/* FOOTER BRANDING */}
        <div className="flex flex-col items-center mt-6">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase chrome-text text-ghosting opacity-50">
                YAMAHA
            </h2>
            <p className="text-[11px] uppercase tracking-[0.4em] font-black text-white/20 mt-2">Nepal Edition</p>
        </div>
    </div>
  );
};

export default ResultPage;
