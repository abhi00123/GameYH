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
        <div className="flex flex-col items-center justify-center w-full min-h-[100dvh] bg-black relative overflow-y-auto overflow-x-hidden text-white p-4 res-p carbon-pattern">

            {/* BOUNDED BACKGROUND EFFECTS CAGE (Stops animation from causing scroll!) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* 2. CRT ARCADE SCANLINES (Global) */}
                <div className="crt-overlay pointer-events-none" />

                {/* 3. HOLOGRAPHIC RING (Behind Report Card) */}
                <div className="holographic-ring scale-100 opacity-30 w-full h-full absolute flex items-center justify-center top-0 left-0" />

                {/* 4. ATMOSPHERIC SHADING */}
                <div className="absolute inset-0 bg-gradient-to-tr from-yamaha-blue/30 via-transparent to-yamaha-glow/20 pointer-events-none" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[400px] flex flex-col items-center gap-6 res-gap-lg z-10 py-4"
            >
                {/* GAME OVER HEADER */}
                <div className="flex flex-col items-center relative overflow-visible w-full text-center">
                    <h1 className="text-4xl res-logo font-black italic tracking-tighter uppercase chrome-text text-ghosting leading-none px-4 whitespace-nowrap">
                        <span className="inline-block">{lastWin ? 'VICTORY' : 'GAME OVER'}</span>
                    </h1>
                    <div className="w-16 h-1 bg-red-600 mt-2 res-mt shadow-[0_0_15px_rgba(255,0,0,1)]" />
                </div>

                {/* PERFORMANCE REPORT HUD */}
                <div className="w-full metallic-panel rounded-2xl p-6 res-p relative overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-2 border-white/5">
                    {/* CORNERS */}
                    <div className="corner-bracket cb-tl" />
                    <div className="corner-bracket cb-tr" />
                    <div className="corner-bracket cb-bl" />
                    <div className="corner-bracket cb-br" />

                    <div className="flex flex-col gap-4 res-gap text-center">
                        <div className="flex flex-col gap-1 items-center">
                            <p className="text-[8px] uppercase font-black tracking-[0.3em] text-white/40">Distance Reached</p>
                            <p className="text-2xl font-black text-white italic tracking-tighter">{stats.distance.toLocaleString()}<span className="text-xs text-white/40 ml-1">M</span></p>
                        </div>

                        <div className="flex flex-col gap-1 items-center">
                            <p className="text-[8px] uppercase font-black tracking-[0.3em] text-white/40">Total Score</p>
                            <p className="text-3xl font-black text-yamaha-glow text-glow-premium italic tracking-tighter">{stats.score.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* ARCADE CONTROLS */}
                <div className="w-full flex flex-col gap-4 res-gap pt-2">
                    <button
                        onClick={handlePlayAgain}
                        className="w-full arcade-btn py-4 res-py-btn text-xl"
                    >
                        PLAY AGAIN
                    </button>

                    <button
                        onClick={handleHome}
                        className="w-full bg-white/5 border border-white/10 py-3 res-py-btn rounded-xl font-black uppercase tracking-[0.4em] text-[9px] text-white/40 hover:bg-white/10 transition-all hover:text-white"
                    >
                        EXIT TO HOME
                    </button>
                </div>

                {/* MASSIVE GRAFFITI REWARD OVERLAY */}
                {lastWin && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
                        className="mt-4 res-mt relative w-full group cursor-pointer"
                    >
                        {/* Glowing Core Aura Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#FF0055] via-yellow-400 to-[#00F0FF] rounded-xl blur opacity-60 animate-pulse" />

                        {/* Main Golden Ticket */}
                        <div className="relative flex flex-col items-center p-6 res-p bg-black rounded-xl border-2 border-yellow-400 overflow-hidden shadow-[0_0_80px_rgba(250,204,21,0.3)]">

                            {/* Floating Celebration Particles */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                                className="absolute inset-0 pointer-events-none flex flex-wrap gap-4 p-2 justify-between"
                            >
                                {['★', '✦', '▲', '◆', '✖', '●', '✦', '★', '✖'].map((char, i) => (
                                    <motion.span
                                        key={i}
                                        animate={{ y: [0, -20, 0], rotate: [0, 360] }}
                                        transition={{ duration: 2 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
                                        className={`text-${i % 2 === 0 ? 'yellow-400' : 'white'} text-xl`}
                                    >{char}</motion.span>
                                ))}
                            </motion.div>

                            {/* Graffiti Typography */}
                            <motion.h4
                                animate={{ rotate: [-2, 2, -2], scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="text-yellow-400 font-black italic text-center text-3xl res-logo tracking-tighter uppercase leading-[0.9] [text-shadow:3px_3px_0_#FF0055,-1px_-1px_0_#00F0FF] z-10"
                            >
                                CONGRATS!
                            </motion.h4>

                            <p className="mt-2 text-white font-black tracking-[0.4em] text-[7px] text-center opacity-80 uppercase z-10">
                                Legendary Racing Performance
                            </p>

                            {/* Metallic Plaque */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="mt-4 res-mt py-3 px-6 bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-black text-xl italic uppercase tracking-tighter rounded-sm transform -skew-x-12 ring-2 ring-white/50 z-10 shadow-[0_0_30px_rgba(250,204,21,0.6)]"
                            >
                                <span className="block transform skew-x-12 whitespace-nowrap">
                                    WON ₹3,000 DISCOUNT!
                                </span>
                            </motion.div>

                            <p className="mt-4 res-mt text-[7px] text-yellow-400/80 uppercase tracking-[0.2em] text-center font-bold z-10">
                                Take a screenshot to claim at your nearest Yamaha Showroom
                            </p>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* FOOTER BRANDING */}
            <div className="flex flex-col items-center mt-6 res-mt">
                <h2 className="text-4xl res-logo font-black italic tracking-tighter uppercase chrome-text text-ghosting opacity-50">
                    YAMAHA
                </h2>
                <p className="text-[11px] uppercase tracking-[0.4em] font-black text-white/20 mt-2 res-mt">Nepal Edition</p>
            </div>
        </div>
    );
};

export default ResultPage;
