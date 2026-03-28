import React, { useState } from 'react';
import { useGameStore, type VehicleType } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

const SelectionPage: React.FC = () => {
  const { setVehicle, vehicle, setStatus } = useGameStore();
  const [direction, setDirection] = useState(0);

  const riders: { id: VehicleType; name: string; vehicle: string; image: string; racerId: string }[] = [
    { 
      id: 'bike', 
      name: 'MAX TORQUE', 
      vehicle: 'Yamaha R15', 
      image: '/assets/male.png',
      racerId: 'RC-001'
    },
    { 
      id: 'scooter', 
      name: 'LUNA SPEED', 
      vehicle: 'Yamaha Aerox 155', 
      image: '/assets/female.png',
      racerId: 'RC-002'
    }
  ];

  const currentIndex = riders.findIndex(r => r.id === vehicle);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    const nextIndex = (currentIndex + newDirection + riders.length) % riders.length;
    setVehicle(riders[nextIndex].id);
  };

  const handleStart = () => {
    setStatus('playing');
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)'
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)'
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)'
    })
  };

  return (
    <div className="flex flex-col items-center justify-between w-full min-h-[100dvh] bg-black text-white relative p-4 res-p select-none font-sans overflow-hidden">
      
      {/* 2. CRT ARCADE SCANLINES (Global) */}
      <div className="crt-overlay pointer-events-none" />

      {/* Top Branding Section */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full mt-4 res-mt flex flex-col items-center gap-1 relative z-50 pt-4"
      >
        <h1 className="text-4xl res-logo font-black italic tracking-[-0.05em] uppercase chrome-text text-ghosting leading-none">
            YAMAHA
        </h1>
        <div className="w-16 h-1 bg-yamaha-glow mt-2 res-mt shadow-[0_0_15px_rgba(0,240,255,1)]" />
        <div className="mt-4 res-mt">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-yamaha-glow text-glow-premium">
                Select <span className="text-white">Your</span> Pilot
            </h2>
        </div>
      </motion.div>

      {/* --- Main Carousel Slot --- */}
      <div className="flex-1 w-full flex items-center justify-center relative z-40 mt-4 res-mt">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={vehicle}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset }) => {
              const swipe = offset.x;
              if (swipe < -50) paginate(1);
              else if (swipe > 50) paginate(-1);
            }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 cursor-grab active:cursor-grabbing"
          >
            {/* High-Impact Metallic Card */}
            <div className="relative w-full max-w-[min(92vw,440px)] h-[65vh] max-h-[550px] min-h-[400px] metallic-panel rounded-3xl border-2 border-white/10 flex flex-col items-center overflow-hidden">
              
              {/* Profile Context - Bottom-Left HUD */}
              <div className="absolute bottom-6 res-p left-6 res-p z-30">
                <div className="flex flex-col gap-0 items-start">
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck size={12} className="text-yamaha-glow" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-yamaha-glow opacity-80">
                             {riders[currentIndex].racerId} // PRO STATUS
                        </span>
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] leading-none">
                        {riders[currentIndex].name}
                    </h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60 italic mt-1">
                        {riders[currentIndex].vehicle}
                    </p>
                </div>
              </div>

              {/* HUGE CHARACTER IMAGE - FULLY ENCLOSED */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pb-4">
                <img 
                  src={riders[currentIndex].image}
                  alt={riders[currentIndex].name}
                  className="h-[95%] w-auto max-w-none object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.8)]"
                  draggable={false}
                />
              </div>

              {/* Pagination Dots */}
              <div className="absolute bottom-6 res-p z-30 flex gap-2">
                {riders.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-yamaha-glow shadow-[0_0_10px_rgba(0,240,255,1)]' : 'w-2 bg-white/10'}`}
                    />
                ))}
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Side Nav Arrows */}
        <button onClick={() => paginate(-1)} className="absolute left-2 z-50 p-2 opacity-30 hover:opacity-100 transition-opacity nav-glow-pulse">
          <ChevronLeft size={36} className="text-yamaha-glow" />
        </button>
        <button onClick={() => paginate(1)} className="absolute right-2 z-50 p-2 opacity-30 hover:opacity-100 transition-opacity nav-glow-pulse">
          <ChevronRight size={36} className="text-yamaha-glow" />
        </button>
      </div>

      {/* --- Final Call to Action --- */}
      <div className="w-full flex flex-col items-center gap-4 res-gap-lg px-4 pb-8 res-p z-50 mt-auto">
        <button
          onClick={handleStart}
          className="w-full arcade-btn py-4 res-py-btn text-xl"
        >
          START
        </button>
        
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 text-center animate-pulse">
            Swipe to switch
        </p>
      </div>

    </div>
  );
};

export default SelectionPage;
