import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  const { setUser } = useGameStore();
  const [formData, setFormData] = useState({ name: '', phone: '', gender: '' });
  const [error, setError] = useState('');

  const validatePhone = (phone: string) => {
    return /^9[78]\d{8}$/.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.gender) {
      setError('Please fill in all fields');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError('Invalid Nepali phone number (starts with 97/98, 10 digits)');
      return;
    }
    setUser(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-black relative overflow-hidden text-white carbon-pattern">

      {/* 1. EXTREME SPEED TUNNEL */}
      <div className="speed-bg" style={{ animationDuration: '8s', opacity: 0.8 }} />
      <div className="speed-bg" style={{ animationDuration: '12s', opacity: 0.5 }} />
      <div className="speed-bg" style={{ animationDuration: '20s', opacity: 0.3 }} />

      {/* 2. CRT ARCADE SCANLINES (Global) */}
      <div className="crt-overlay" />

      {/* 3. ATMOSPHERIC SHADING */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-yamaha-blue/30 via-transparent to-yamaha-glow/20 pointer-events-none" />

      {/* 4. HOLOGRAPHIC RING (Behind Card) */}
      <div className="holographic-ring" />

      <motion.div
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full max-w-sm flex flex-col items-center gap-10 z-10"
      >
        {/* BRAND IDENTITY */}
        <div className="flex flex-col items-center">
          <h1 className="text-7xl font-black italic tracking-[-0.05em] uppercase chrome-text leading-none text-ghosting">
            YAMAHA
          </h1>
          <div className="w-24 h-1 bg-yamaha-glow mt-2 shadow-[0_0_15px_rgba(0,240,255,1)]" />
          <div className="flex flex-col items-center mt-6">
            <p className="text-[11px] uppercase tracking-[0.4em] font-black text-yamaha-glow/80">Nepal Edition</p>
            <p className="text-[8px] uppercase tracking-[0.6em] font-bold text-white/20 mt-1">Pro Racing Series</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8 p-10 metallic-panel rounded-2xl relative overflow-visible shadow-[0_20px_80px_rgba(0,0,0,0.8)] border-2 border-white/5">

          {/* SCI-FI CORNERS */}
          <div className="corner-bracket cb-tl" />
          <div className="corner-bracket cb-tr" />
          <div className="corner-bracket cb-bl" />
          <div className="corner-bracket cb-br" />

          {/* Form Content */}
          <div className="flex flex-col gap-3 relative items-center">
            <label className="text-[11px] uppercase font-black tracking-[0.3em] text-yamaha-glow text-glow-premium">
              NAME
            </label>
            <input
              type="text"
              placeholder="ENTER YOUR NAME"
              className="w-full sci-fi-input placeholder:text-white/10"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-3 items-center">
            <label className="text-[11px] uppercase font-black tracking-[0.3em] text-yamaha-glow text-glow-premium">
              MOBILE NO
            </label>
            <input
              type="tel"
              placeholder="98XXXXXXXX"
              maxLength={10}
              className="w-full sci-fi-input placeholder:text-white/10"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) {
                  setFormData({ ...formData, phone: val });
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-3 items-center">
            <label className="text-[11px] uppercase font-black tracking-[0.3em] text-yamaha-glow text-glow-premium">
              GENDER
            </label>
            <div className="grid grid-cols-2 gap-4 w-full">
              {['Male', 'Female'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: g })}
                  className={`py-4 rounded-lg font-black uppercase tracking-widest text-[11px] transition-all border-2 ${formData.gender === g
                      ? 'bg-yamaha-glow text-black border-white shadow-[0_0_25px_rgba(0,240,255,0.6)] scale-105'
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] uppercase font-bold text-center animate-pulse">{error}</p>}

          <button
            type="submit"
            className="w-full arcade-btn py-6 mt-6 text-xl"
          >
            PROCEED
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LandingPage;
