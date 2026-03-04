import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Check, X, Trophy, Globe } from 'lucide-react';
import { FLAG_DATA } from '../data/flagData';

// 🎨 Smooth, Continuous 2-Color Gradient
const generateElegantGradient = () => {
  const baseHue = Math.floor(Math.random() * 360);
  const c1 = `hsl(${baseHue}, 90%, 50%)`;
  const c2 = `hsl(${(baseHue + 50) % 360}, 90%, 60%)`; 
  return `conic-gradient(from 0deg, ${c1} 0%, ${c2} 50%, ${c1} 100%)`;
};

// --- 3D INTERACTIVE CARD ---
const FlagCard = ({ flag, phase, onSwipe, custom }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const tiltX = useSpring(0, { stiffness: 300, damping: 30 });
  const tiltY = useSpring(0, { stiffness: 300, damping: 30 });

  const [borderGlow] = useState(() => generateElegantGradient());

  const isInteractive = phase === 'VERIFY';

  const handlePointerMove = (e) => {
    if (!isInteractive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(yPct * -30);
    tiltY.set(xPct * 30);
  };

  const handlePointerLeave = () => {
    tiltX.set(0); tiltY.set(0);
  };

  const handleDragEnd = (event, info) => {
    tiltX.set(0); tiltY.set(0);
    if (!isInteractive) return;
    if (info.offset.x > 100) onSwipe(true); 
    else if (info.offset.x < -100) onSwipe(false); 
  };

  return (
    <motion.div 
        custom={custom} variants={{ initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: (dir) => ({ x: dir === 1 ? window.innerWidth : -window.innerWidth, opacity: 0, transition: { duration: 0.2 } }) }} 
        initial="initial" animate="animate" exit="exit" 
        style={{ x: isInteractive ? x : 0, rotate: isInteractive ? rotate : 0, opacity: isInteractive ? opacity : 1, perspective: 1200 }} 
        drag={isInteractive ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6} 
        onDragEnd={handleDragEnd} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}
        className={`w-full max-w-sm absolute z-10 select-none ${isInteractive ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
        <motion.div 
            style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
            className="relative w-full rounded-[32px] p-[4px]"
        >
            {/* 1. TRUE BACKGROUND GLOW */}
            <div className="absolute inset-0 rounded-[32px] overflow-visible pointer-events-none z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                    <div className="w-full h-full rounded-full animate-[spin_4s_linear_infinite] blur-[15px] opacity-25" style={{ background: borderGlow }} />
                </div>
            </div>

            {/* 2. SHARP LIGHT BORDER */}
            <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                    <div className="w-full h-full rounded-full animate-[spin_4s_linear_infinite]" style={{ background: borderGlow }} />
                </div>
            </div>

            {/* 3. SOLID BLACK CARD INTERIOR */}
            <div className="absolute inset-[4px] rounded-[28px] bg-[#0a0a0a] pointer-events-none z-20 shadow-[inset_0_0_20px_rgba(0,0,0,1)] border border-white/5" />

            {/* 4. TRUE 3D FLOATING CONTENT */}
            <div className="relative z-30 flex w-full flex-col items-center justify-center min-h-[380px] p-8" style={{ transformStyle: "preserve-3d" }}>
                
                <motion.div style={{ translateZ: 80 }} className="text-[120px] leading-none pointer-events-none drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]">
                    <span style={{ fontFamily: '"Twemoji Mozilla", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "EmojiOne Color", sans-serif' }}>
                        {flag?.emoji || '🌍'}
                    </span>
                </motion.div>

                <motion.div style={{ translateZ: 40 }} className="h-24 mt-8 flex items-center justify-center w-full text-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        {phase === 'VERIFY' ? (
                            <motion.div key="answer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full drop-shadow-xl px-2 overflow-hidden">
                                <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Country Name</p>
                                <h2 
                                    className="font-display font-black text-white uppercase tracking-tight leading-none whitespace-nowrap w-full"
                                    style={{ fontSize: flag?.name ? `min(2.5rem, ${15 / flag.name.length}rem)` : '2rem' }}
                                >
                                    {flag?.name}
                               </h2>
                            </motion.div>
                        ) : (
                            <motion.div key="hint" className="w-full">
                                <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest animate-pulse">
                                    {phase === 'SPINNING' ? 'Spinning...' : 'Guess the flag!'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

            </div>
        </motion.div>
    </motion.div>
  );
};

export default function FlagGame({ players, settings, onEnd }) {
  const [phase, setPhase] = useState('PRE'); 
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentFlag, setCurrentFlag] = useState(FLAG_DATA[0]);
  const [timeLeft, setTimeLeft] = useState(settings?.timePerFlag || 5);
  
  const [scores, setScores] = useState(players.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = settings?.rounds || 3; 
  const [swipeDir, setSwipeDir] = useState(1);

  const spin = () => {
    setPhase('SPINNING');
    let count = 0;
    const targetSpins = Math.floor(Math.random() * 36) + 30;
    const interval = setInterval(() => {
        setCurrentFlag(FLAG_DATA[Math.floor(Math.random() * FLAG_DATA.length)]);
        count++;
        if (count >= targetSpins) { 
            clearInterval(interval); 
            setTimeLeft(settings?.timePerFlag || 5); 
            setPhase('GUESSING'); 
        }
    }, 35); 
  };

  useEffect(() => {
    if (phase === 'GUESSING' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (phase === 'GUESSING' && timeLeft === 0) {
        if (navigator.vibrate) navigator.vibrate([200, 200, 200]);
        setPhase('VERIFY');
    }
  }, [phase, timeLeft]);

  const handleSwipe = (isRight) => {
    setSwipeDir(isRight ? 1 : -1);
    if (isRight) {
        const playerName = players[currentPlayerIndex];
        setScores(prev => ({ ...prev, [playerName]: prev[playerName] + 1 }));
    }
    if (navigator.vibrate) navigator.vibrate(isRight ? 30 : [20, 50]);

    const nextIndex = currentPlayerIndex + 1;
    if (nextIndex >= players.length) {
        if (currentRound >= totalRounds) {
            setPhase('GAME_OVER');
        } else {
            setCurrentRound(prev => prev + 1);
            setCurrentPlayerIndex(0);
            setPhase('PRE');
        }
    } else {
        setCurrentPlayerIndex(nextIndex);
        setPhase('PRE');
    }
  };

  const currentPlayer = players[currentPlayerIndex];

  if (phase === 'PRE') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
        <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Round {currentRound} of {totalRounds}</h2>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border bg-black border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] shrink-0">
            <Globe size={40} className="text-green-500" />
        </div>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Up Next</p>
        <h1 className="text-4xl sm:text-5xl font-display font-black text-white uppercase mb-12 tracking-tight truncate w-full px-2">
            {currentPlayer}
        </h1>
        <button onClick={spin} className="btn-primary w-full max-w-xs bg-green-600 text-white border-none shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            SPIN ROULETTE
        </button>
    </div>
  );

  if (phase === 'SPINNING' || phase === 'GUESSING' || phase === 'VERIFY') return (
    <div className="h-full flex flex-col p-6 items-center bg-[#050505] relative overflow-hidden w-full">
      <div className="flex justify-between items-center w-full mb-8 z-10 px-2">
        <div className="text-3xl font-mono font-black text-green-400">{phase === 'VERIFY' ? '0s' : `${timeLeft}s`}</div>
        <div className="text-xl font-black text-white">{scores[currentPlayer]} PTS</div>
      </div>
      <div className="flex-1 relative flex items-center justify-center z-10 w-full">
        <AnimatePresence mode="wait" custom={swipeDir}>
            <FlagCard key={`${currentRound}-${currentPlayerIndex}`} flag={currentFlag} phase={phase} onSwipe={handleSwipe} custom={swipeDir} />
        </AnimatePresence>
      </div>
      <div className="w-full grid grid-cols-2 gap-4 pb-6 mt-6 z-10 h-20">
        <AnimatePresence>
            {phase === 'VERIFY' && (
                <>
                    <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={() => handleSwipe(false)} className="py-4 rounded-3xl border border-red-500/20 bg-red-950/20 text-red-500 font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <X size={20} /> WRONG
                    </motion.button>
                    <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={() => handleSwipe(true)} className="py-4 rounded-3xl border border-green-500/20 bg-green-950/20 text-green-400 font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <Check size={20} /> CORRECT
                    </motion.button>
                </>
            )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (phase === 'GAME_OVER') {
    const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);
    const winner = sortedScores[0];

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
            <Trophy size={64} className="mb-6 text-green-500 shrink-0" />
            <h2 className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mb-2">FINAL RESULTS</h2>
            <div className="mb-8 w-full">
                <p className="text-green-500 font-bold uppercase text-[10px] tracking-widest mb-2">Champion</p>
                <h1 className="text-[10vw] sm:text-5xl font-display font-black text-white uppercase tracking-tight leading-none w-full truncate px-2">{winner[0]}</h1>
            </div>
            <div className="w-full max-w-xs space-y-3 mb-12 flex-1 overflow-y-auto no-scrollbar py-2">
                {sortedScores.map(([name, score], index) => (
                    <div key={name} className={`flex justify-between items-center p-5 rounded-2xl border ${index === 0 ? 'bg-green-950/40 border-green-500/50' : 'bg-white/5 border-white/10'}`}>
                        <div className="flex items-center gap-4">
                            <span className="text-zinc-500 font-black">{index + 1}</span>
                            <span className={`font-black text-lg uppercase truncate max-w-[120px] ${index === 0 ? 'text-green-500' : 'text-white'}`}>{name}</span>
                        </div>
                        <span className={`font-black text-2xl ${index === 0 ? 'text-green-500' : 'text-white'}`}>{score}</span>
                    </div>
                ))}
            </div>
            <button onClick={onEnd} className="w-full py-4 rounded-2xl border border-white/10 text-zinc-500 font-bold hover:text-white transition-all uppercase text-xs tracking-widest max-w-xs shrink-0">
                BACK TO HOME
            </button>
        </div>
    );
  }
}