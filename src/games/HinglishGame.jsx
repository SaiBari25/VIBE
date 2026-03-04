import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Quote, Crown, Clock, Check, X } from 'lucide-react';
import { HINGLISH_PACK } from '../data/hinglishData';

// 🎨 Smooth, Continuous 2-Color Gradient (Gold/Yellow Theme)
const generateElegantGradient = () => {
  const c1 = `hsl(45, 100%, 65%)`; // Gold/Yellow
  const c2 = `hsl(20, 100%, 65%)`; // Orange/Amber
  return `conic-gradient(from 0deg at 50% 50%, ${c1} 0%, ${c2} 50%, ${c1} 100%)`;
};

// --- 3D INTERACTIVE CARD ---
const TranslationCard = ({ item, isAnswer, onSwipe, onToggleReveal }) => {
  const x = useMotionValue(0);
  
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const tiltX = useSpring(0, { stiffness: 300, damping: 30 });
  const tiltY = useSpring(0, { stiffness: 300, damping: 30 });

  const [borderGlow] = useState(() => generateElegantGradient());

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

  const handleDragEnd = (event, info) => {
    tiltX.set(0); tiltY.set(0);
    if (info.offset.x > 100) onSwipe(true); 
    else if (info.offset.x < -100) onSwipe(false); 
  };

  if (!item) return null;

  return (
    <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} 
        style={{ x, rotate, opacity, perspective: 1200 }} 
        drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6} 
        onDragEnd={handleDragEnd} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}
        className="w-full max-w-sm cursor-grab active:cursor-grabbing absolute z-10 select-none"
    >
        <motion.div 
            style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
            className="relative w-full rounded-[32px] p-[4px]"
            onClick={onToggleReveal}
        >
            {/* 1. TRUE BACKGROUND GLOW (25% opacity) */}
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
            <div className="relative z-30 flex w-full flex-col justify-center text-center min-h-[350px] p-8" style={{ transformStyle: "preserve-3d" }}>
                
                {!isAnswer ? (
                    <motion.div key="front" initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} className="flex flex-col items-center pointer-events-none">
                        <motion.div style={{ translateZ: 80 }} className="text-[#fbbf24] opacity-20 mb-6 rotate-180">
                            <Quote size={50} />
                        </motion.div>

                        <motion.div style={{ translateZ: 40 }} className="w-full flex flex-col items-center justify-center">
                            <p className="text-[#fbbf24] opacity-50 font-bold text-[10px] tracking-widest uppercase mb-4">{item.type}</p>
                            <h2 
                                className="font-display font-black text-white leading-tight w-full break-words"
                                style={{ fontSize: `clamp(1.5rem, ${200 / item.cryptic.length}px, 2.5rem)` }}
                            >
                                "{item.cryptic}"
                            </h2>
                        </motion.div>

                        <motion.div style={{ translateZ: 20 }} className="mt-12 flex flex-col items-center gap-2">
                            <p className="text-[#fbbf24] text-[10px] font-black uppercase tracking-widest animate-pulse">Tap to Reveal</p>
                        </motion.div>
                    </motion.div>
                ) : (
                    // The back of the card (where the buttons are)
                    <motion.div key="back" initial={{ opacity: 0, rotateY: -90 }} animate={{ opacity: 1, rotateY: 0 }} className="flex flex-col items-center w-full">
                        <motion.div style={{ translateZ: 60 }} className="bg-[#fbbf24]/10 border border-[#fbbf24]/20 w-full px-4 py-8 rounded-2xl mb-8 flex flex-col items-center justify-center shadow-xl pointer-events-none">
                            <p className="text-[#fbbf24] opacity-70 font-bold text-[10px] tracking-widest uppercase mb-4">Original Name</p>
                            <h2 
                                className="font-display font-black text-[#fbbf24] uppercase leading-none break-words text-center w-full"
                                style={{ fontSize: `clamp(1.5rem, ${200 / item.answer.length}px, 3rem)` }}
                            >
                                {item.answer}
                            </h2>
                        </motion.div>

                        {/* CLICKABLE BUTTONS SECTION */}
                        <motion.div style={{ translateZ: 30 }} className="pt-6 border-t border-white/10 w-full flex flex-col items-center gap-4">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] pointer-events-none">Tap or Swipe to Score</p>
                            <div className="flex justify-center gap-12 w-full">
                                
                                {/* WRONG BUTTON */}
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); // Prevents the card from flipping back over
                                        onSwipe(false); 
                                    }}
                                    className="flex flex-col items-center gap-2 text-red-500 active:scale-90 transition-all p-2"
                                >
                                    <X size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Wrong</span>
                                </button>

                                {/* CORRECT BUTTON */}
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); // Prevents the card from flipping back over
                                        onSwipe(true); 
                                    }}
                                    className="flex flex-col items-center gap-2 text-[#fbbf24] active:scale-90 transition-all p-2"
                                >
                                    <Check size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Correct</span>
                                </button>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    </motion.div>
  );
};

// --- MAIN GAME LOGIC ---
export default function HinglishGame({ players, settings, onEnd }) {
  const [phase, setPhase] = useState('PRE_TURN');
  const [currentRound, setCurrentRound] = useState(1);
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timePerRound);
  
  const [deck, setDeck] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const [turnPoints, setTurnPoints] = useState(0);
  const [totalScores, setTotalScores] = useState(players.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));

  useEffect(() => {
    const filtered = HINGLISH_PACK.filter(item => settings.selectedCategories.includes(item.type));
    setDeck([...filtered].sort(() => Math.random() - 0.5));
  }, [settings]);

  useEffect(() => {
    if (phase === 'PLAYING' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (phase === 'PLAYING' && timeLeft === 0) {
      handleTurnEnd();
    }
  }, [phase, timeLeft]);

  const handleTurnEnd = () => {
    setTotalScores(prev => ({ ...prev, [players[activePlayerIdx]]: prev[players[activePlayerIdx]] + turnPoints }));
    setPhase('ROUND_RESULTS');
  };

  const handleSwipe = (isCorrect) => {
    if (isCorrect) setTurnPoints(prev => prev + 1);
    if (navigator.vibrate) navigator.vibrate(isCorrect ? 30 : [20, 50]);
    
    setShowAnswer(false);
    setCardIndex(prev => (prev + 1) % deck.length);
  };

  const handleNextPlayer = () => {
    const isLastPlayer = activePlayerIdx === players.length - 1;
    if (isLastPlayer) {
      if (currentRound >= settings.rounds) setPhase('FINAL_SUMMARY');
      else {
        setCurrentRound(prev => prev + 1);
        setActivePlayerIdx(0);
        setPhase('PRE_TURN');
      }
    } else {
      setActivePlayerIdx(prev => prev + 1);
      setPhase('PRE_TURN');
    }
  };

  const currentPlayer = players[activePlayerIdx];

  // --- VIEWS ---

  if (phase === 'PRE_TURN') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in overflow-hidden w-full">
        <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Round {currentRound} of {settings.rounds}</h2>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border bg-black border-[#fbbf24]/50 shadow-[0_0_20px_rgba(251,191,36,0.2)] shrink-0">
            <Quote size={40} className="text-[#fbbf24] rotate-180" />
        </div>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Up Next</p>
        <h1 className="text-4xl sm:text-5xl font-display font-black text-white uppercase mb-12 tracking-tight truncate w-full px-2">
            {currentPlayer}
        </h1>
        <button onClick={() => { setTimeLeft(settings.timePerRound); setTurnPoints(0); setPhase('PLAYING'); }} className="btn-primary w-full max-w-xs bg-[#fbbf24] text-black border-none shadow-[0_0_20px_rgba(251,191,36,0.4)]">
            START TURN
        </button>
    </div>
  );

  if (phase === 'PLAYING') return (
    <div className="h-full flex flex-col p-6 items-center bg-[#050505] relative overflow-hidden w-full">
      <div className="flex justify-between items-center w-full mb-8 z-10 px-2">
        <div className={`text-3xl font-mono font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#fbbf24]'}`}>{timeLeft}s</div>
        <div className="text-xl font-black text-white">{turnPoints} PTS</div>
      </div>

      <div className="flex-1 relative flex items-center justify-center z-10 w-full">
        <AnimatePresence>
            {deck.length > 0 && (
                <TranslationCard 
                    key={cardIndex} 
                    item={deck[cardIndex]} 
                    isAnswer={showAnswer}
                    onSwipe={handleSwipe}
                    onToggleReveal={() => setShowAnswer(!showAnswer)}
                />
            )}
        </AnimatePresence>
      </div>
      
      <div className="h-20" /> {/* Spacer to keep card centered visually */}
    </div>
  );

  if (phase === 'ROUND_RESULTS') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
        <h2 className="text-zinc-500 font-black uppercase tracking-widest mb-6">TIME'S UP!</h2>
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-xs mb-12">
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">{currentPlayer} Scored</p>
            <h1 className="text-6xl font-display font-black text-[#fbbf24]">+{turnPoints}</h1>
        </div>
        <button onClick={handleNextPlayer} className="btn-primary w-full max-w-xs bg-white text-black">
            CONTINUE
        </button>
    </div>
  );

  if (phase === 'FINAL_SUMMARY') {
    const sorted = Object.entries(totalScores).sort(([,a], [,b]) => b-a);
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
            <Trophy size={64} className="mb-6 text-[#fbbf24] shrink-0" />
            <h2 className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mb-2">FINAL RESULTS</h2>
            <div className="mb-8 w-full">
                <p className="text-[#fbbf24] font-bold uppercase text-[10px] tracking-widest mb-2">Champion</p>
                <h1 className="text-[12vw] sm:text-5xl font-display font-black text-white uppercase tracking-tight leading-none w-full truncate px-2">
                    {sorted[0][0]}
                </h1>
            </div>
            <div className="w-full max-w-xs space-y-3 mb-12 flex-1 overflow-y-auto no-scrollbar py-2">
                {sorted.map(([name, score], index) => (
                    <div key={name} className={`flex justify-between items-center p-5 rounded-2xl border ${index === 0 ? 'bg-[#fbbf24]/20 border-[#fbbf24]/50' : 'bg-white/5 border-white/10'}`}>
                        <div className="flex items-center gap-4">
                            <span className="text-zinc-500 font-black">{index + 1}</span>
                            <span className={`font-black text-lg uppercase truncate max-w-[120px] ${index === 0 ? 'text-[#fbbf24]' : 'text-white'}`}>{name}</span>
                        </div>
                        <span className={`font-black text-2xl ${index === 0 ? 'text-[#fbbf24]' : 'text-white'}`}>{score}</span>
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