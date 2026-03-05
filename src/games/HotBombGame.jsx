import React, { useState, useEffect } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { Bomb, AlertOctagon } from 'lucide-react';
import { HOT_BOMB_DATA } from '../data/hotBombData'; 

// 🎨 Smooth, Continuous 2-Color Gradient for the Bomb
const generateElegantGradient = () => {
  const baseHue = Math.floor(Math.random() * 360);
  const c1 = `hsl(${baseHue}, 90%, 65%)`;
  const c2 = `hsl(${(baseHue + 50) % 360}, 90%, 65%)`; 
  return `conic-gradient(from 0deg, ${c1} 0%, ${c2} 50%, ${c1} 100%)`;
};

// --- 3D INTERACTIVE GLOWING BOMB CIRCLE ---
const InteractiveBomb = ({ category, isCriticalTime, isLowTime, isExploding, rotationSpeed, bombKey }) => {
  const tiltX = useSpring(0, { stiffness: 300, damping: 30 });
  const tiltY = useSpring(0, { stiffness: 300, damping: 30 });

  // Generate a new color every time the bomb is passed
  const [borderGlow, setBorderGlow] = useState(() => generateElegantGradient());
  useEffect(() => {
    setBorderGlow(generateElegantGradient());
  }, [bombKey]);

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(yPct * -30);
    tiltY.set(xPct * 30);
  };

  const handlePointerLeave = () => {
    tiltX.set(0); tiltY.set(0);
  };

  return (
    <motion.div 
        style={{ perspective: 1200 }} 
        onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}
        className="select-none z-10"
    >
        <motion.div 
            style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
            className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-[4px] ${isCriticalTime ? 'animate-shake' : ''}`}
        >
            {/* 1. TRUE BACKGROUND GLOW (Circular) */}
            <div className="absolute inset-0 rounded-full overflow-visible pointer-events-none z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                    <div 
                        className="w-full h-full rounded-full animate-spin blur-[20px] opacity-30 transition-all duration-300" 
                        style={{ background: borderGlow, animationDuration: rotationSpeed }} 
                    />
                </div>
            </div>

            {/* 2. SHARP LIGHT BORDER */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                    <div 
                        className="w-full h-full rounded-full animate-spin transition-all duration-300" 
                        style={{ background: borderGlow, animationDuration: rotationSpeed }} 
                    />
                </div>
            </div>

            {/* 3. SOLID BLACK INTERIOR */}
            <div className="absolute inset-[4px] rounded-full bg-[#0a0a0a] pointer-events-none z-20 shadow-[inset_0_0_30px_rgba(0,0,0,1)] border border-white/5" />
            
            {/* 4. TRUE 3D FLOATING CONTENT */}
            <div className="relative z-30 flex flex-col items-center justify-center w-full h-full p-6 text-center" style={{ transformStyle: "preserve-3d" }}>
                
                <motion.div style={{ translateZ: 60 }} className="pointer-events-none mb-4">
                    <Bomb size={isCriticalTime ? 60 : 45} className={`${isExploding ? 'text-black animate-ping' : isLowTime ? 'text-red-500 animate-pulse' : 'text-white'} drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-all duration-300`} />
                </motion.div>
                
                <motion.div style={{ translateZ: 30 }} key={bombKey} className="animate-in zoom-in fade-in duration-300 w-full px-2 pointer-events-none overflow-hidden">
                    <h2 
                        className={`font-display font-black uppercase leading-none tracking-tighter drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] ${isCriticalTime ? 'text-white' : 'text-zinc-200'}`}
                        style={{ fontSize: `clamp(1rem, ${200 / category.length}px, 2rem)` }}
                    >
                        {category}
                    </h2>
                </motion.div>
            </div>
        </motion.div>
    </motion.div>
  );
};


// --- MAIN GAME LOGIC ---
export default function HotBombGame({ players, onEnd }) {
  const [phase, setPhase] = useState('PRE');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [category, setCategory] = useState('');
  const [isExploding, setIsExploding] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [key, setKey] = useState(0);

  const getRandomQuestion = () => HOT_BOMB_DATA[Math.floor(Math.random() * HOT_BOMB_DATA.length)];

  const startRound = () => {
    // --- FIX: Random timer strictly between 5 and 60 seconds ---
    const minFuse = 5;
    const maxFuse = 60;
    setTimeLeft(Math.floor(Math.random() * (maxFuse - minFuse + 1)) + minFuse);
    
    setCategory(getRandomQuestion());
    setIsExploding(false);
    setCurrentPlayerIndex(0);
    setPhase('PLAYING');
  };

  const passBomb = () => {
    if (isExploding || phase !== 'PLAYING') return;
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setCategory(getRandomQuestion());
    setKey(prev => prev + 1);
    if (navigator.vibrate) navigator.vibrate(40);
  };

  useEffect(() => {
    if (phase === 'PLAYING' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      if (timeLeft <= 5 && navigator.vibrate) navigator.vibrate([100, 100]); 
      else if (timeLeft <= 10 && navigator.vibrate) navigator.vibrate(50);
      return () => clearInterval(timer);
    } else if (phase === 'PLAYING' && timeLeft === 0) triggerExplosion();
  }, [phase, timeLeft]);

  const triggerExplosion = () => {
    setIsExploding(true);
    if (navigator.vibrate) navigator.vibrate([500, 110, 500, 110, 800]);
    setTimeout(() => setPhase('EXPLODED'), 1200);
  };

  const isLowTime = timeLeft <= 10;
  const isCriticalTime = timeLeft <= 5;
  const rotationSpeed = isCriticalTime ? "0.5s" : isLowTime ? "1.5s" : "4s"; 
  
  const currentPlayerName = players[currentPlayerIndex];

  if (phase === 'PRE') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] w-full overflow-hidden">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 animate-pulse shrink-0">
            <Bomb size={48} className="text-red-500" />
        </div>
        <h1 className="text-[12vw] sm:text-5xl font-display font-black text-white mb-2 uppercase tracking-tight w-full px-2">HOT BOMB</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-12">Pass it or perish.</p>
        <button onClick={startRound} className="btn-primary w-full max-w-xs bg-red-600 text-white border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
            IGNITE FUSE
        </button>
    </div>
  );

  if (phase === 'PLAYING') return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-[#050505] select-none overflow-hidden w-full cursor-pointer" onClick={passBomb}>
      
      {/* Screen Red Flash Overlay */}
      <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none z-0 ${isCriticalTime ? 'bg-red-900/20 opacity-100' : 'opacity-0'}`} />
      
      <p className={`text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] mb-12 transition-all z-10 ${isLowTime ? 'text-red-500 animate-pulse' : ''}`}>
        {isCriticalTime ? "IT'S ABOUT TO BLOW!" : "Tap anywhere to pass"}
      </p>
      
      <InteractiveBomb 
        category={category}
        isCriticalTime={isCriticalTime}
        isLowTime={isLowTime}
        isExploding={isExploding}
        rotationSpeed={rotationSpeed}
        bombKey={key}
      />

      <div className="mt-16 text-center w-full max-w-xs z-10 pointer-events-none flex flex-col items-center">
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Current Player</p>
        
        {/* --- FIX: DYNAMIC TEXT SCALING FOR CURRENT PLAYER --- */}
        <div className={`flex items-center justify-center bg-white/5 border rounded-3xl transition-all w-full shadow-xl overflow-hidden h-[72px] px-4 ${isLowTime ? 'border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-105' : 'border-white/10'}`}>
            <span 
                className="text-white font-black whitespace-nowrap leading-none"
                style={{ fontSize: `clamp(1rem, ${20 / Math.max(currentPlayerName.length, 1)}rem, 1.875rem)` }}
            >
                {currentPlayerName}
            </span>
        </div>
      </div>

    </div>
  );

  if (phase === 'EXPLODED') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-in fade-in zoom-in duration-500 w-full overflow-hidden">
        <AlertOctagon size={60} className="text-red-600 mb-6 animate-bounce shrink-0" />
        <div className="relative mb-6 w-full flex justify-center px-2">
            <h1 className="text-[10vw] sm:text-6xl font-display font-black text-red-600 tracking-tighter leading-none uppercase w-full text-center drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                KABOOM!
            </h1>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl mb-12 w-full max-w-xs flex flex-col items-center overflow-hidden">
            <p className="text-zinc-500 text-[10px] font-bold uppercase mb-2">Eliminated</p>
            
            {/* --- FIX: DYNAMIC TEXT SCALING FOR ELIMINATED PLAYER --- */}
            <p 
                className="text-white font-black whitespace-nowrap w-full text-center px-2"
                style={{ fontSize: `clamp(1.5rem, ${25 / Math.max(currentPlayerName.length, 1)}rem, 3rem)` }}
            >
                {currentPlayerName}
            </p>
        </div>
        
        <div className="w-full max-w-xs space-y-4">
            <button onClick={startRound} className="btn-primary w-full bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] font-black">
                TRY AGAIN
            </button>
            <button onClick={onEnd} className="w-full py-4 rounded-2xl border border-white/10 text-zinc-500 font-bold hover:text-white transition-all uppercase text-xs tracking-widest">
                EXIT GAME
            </button>
        </div>
    </div>
  );
}