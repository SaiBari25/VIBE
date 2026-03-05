import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Trophy, Users, EyeOff, CheckSquare, Square } from 'lucide-react';
import { FREQUENCY_PROMPTS } from '../data/frequencyPrompts';

// 🎨 Smooth, Continuous 2-Color Gradient
const generateElegantGradient = () => {
  const baseHue = Math.floor(Math.random() * 360);
  const c1 = `hsl(${baseHue}, 90%, 50%)`;
  const c2 = `hsl(${(baseHue + 50) % 360}, 90%, 60%)`; 
  return `conic-gradient(from 0deg, ${c1} 0%, ${c2} 50%, ${c1} 100%)`;
};

// --- 3D INTERACTIVE CARD ---
const QuestionCard = ({ prompt, onSwipe }) => {
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
    tiltX.set(0);
    tiltY.set(0);
  };

  const handleDragEnd = (event, info) => {
    tiltX.set(0); tiltY.set(0);
    if (Math.abs(info.offset.x) > 100) onSwipe(); 
  };

  return (
    <motion.div 
        style={{ x, rotate, opacity, perspective: 1200 }} 
        drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6} 
        onDragEnd={handleDragEnd} 
        onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} 
        className="w-full max-w-sm cursor-grab active:cursor-grabbing absolute z-10 select-none"
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
            <div className="relative z-30 flex w-full flex-col items-stretch min-h-[300px] p-8" style={{ transformStyle: "preserve-3d" }}>
                <motion.div style={{ translateZ: 60 }} className="flex-1 flex items-center justify-center pointer-events-none">
                    <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight uppercase text-center drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] px-2">
                        {prompt}
                    </h2>
                </motion.div>
                
                <motion.div style={{ translateZ: 30 }} className="mt-8 flex flex-shrink-0 items-center justify-between font-mono text-white/50 pointer-events-none">
                    <div className="text-xs font-bold tracking-widest uppercase">Rate It 1-10</div>
                    <div className="text-xs text-white font-bold uppercase tracking-widest animate-pulse">Swipe &rarr;</div>
                </motion.div>
            </div>
        </motion.div>
    </motion.div>
  );
};

export default function FrequencyGame({ players, settings, onEnd }) {
  const [phase, setPhase] = useState('PRE'); 
  const [currentRound, setCurrentRound] = useState(1);
  const [describerIndex, setDescriberIndex] = useState(0);
  const [secretNumber, setSecretNumber] = useState(0);
  const [scores, setScores] = useState(players.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [promptIndex, setPromptIndex] = useState(0);
  const [shuffledPrompts, setShuffledPrompts] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [correctGuessers, setCorrectGuessers] = useState([]);

  useEffect(() => {
    setShuffledPrompts([...FREQUENCY_PROMPTS].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (phase === 'QUESTIONS' && settings.useTimer && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (phase === 'QUESTIONS' && settings.useTimer && timeLeft === 0) {
      if (navigator.vibrate) navigator.vibrate([200, 200, 200]);
      setPhase('SCORING');
    }
  }, [phase, timeLeft, settings.useTimer]);

  const describer = players[describerIndex];
  const guessers = players.filter(p => p !== describer);

  const startSecretPhase = () => {
    setSecretNumber(Math.floor(Math.random() * 10) + 1); 
    setPhase('SECRET_NUMBER');
  };

  const startQuestionPhase = () => {
    if (settings.useTimer) setTimeLeft(settings.timeLimit);
    setCorrectGuessers([]); 
    setPhase('QUESTIONS');
  };

  const handleCardSwipe = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    setPromptIndex((prev) => (prev + 1) % shuffledPrompts.length);
  };

  const toggleGuesser = (player) => {
    if (correctGuessers.includes(player)) {
        setCorrectGuessers(correctGuessers.filter(p => p !== player));
    } else {
        setCorrectGuessers([...correctGuessers, player]);
    }
  };

  const submitScores = () => {
    let newScores = { ...scores };
    correctGuessers.forEach(p => { newScores[p] += 1; });
    newScores[describer] += correctGuessers.length;
    setScores(newScores);

    const nextIndex = describerIndex + 1;
    if (nextIndex >= players.length) {
        if (currentRound >= settings.rounds) setPhase('GAME_OVER');
        else {
            setCurrentRound(prev => prev + 1);
            setDescriberIndex(0);
            setPhase('PRE');
        }
    } else {
        setDescriberIndex(nextIndex);
        setPhase('PRE');
    }
  };

  if (phase === 'PRE') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
        <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Round {currentRound} of {settings.rounds}</h2>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border bg-black border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] shrink-0">
            <Users size={40} className="text-purple-500" />
        </div>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Up Next</p>
        
        {/* --- FIX: DYNAMIC TEXT SCALING FOR LONG NAMES --- */}
        <h1 
            className="font-display font-black text-white uppercase mb-12 tracking-tight whitespace-nowrap overflow-visible w-full px-2"
            style={{ fontSize: `clamp(1.5rem, ${25 / Math.max(describer.length, 1)}rem, 3.5rem)` }}
        >
            {describer}
        </h1>

        <button onClick={startSecretPhase} className="btn-primary w-full max-w-xs bg-purple-600 text-white border-none shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            VIEW SECRET NUMBER
        </button>
    </div>
  );

  if (phase === 'SECRET_NUMBER') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full">
        <EyeOff size={40} className="text-purple-500 mb-6" />
        
        {/* --- FIX: DYNAMIC SCALING FOR DESCRIBER NAME IN INSTRUCTION --- */}
        <h2 
            className="text-red-500 font-black uppercase text-[10px] tracking-widest mb-2 whitespace-nowrap px-2"
            style={{ fontSize: `clamp(0.6rem, ${15 / Math.max(describer.length, 1)}rem, 1rem)` }}
        >
            Only {describer} should look!
        </h2>
        
        <div className="my-12">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Your Secret Number Is</p>
            <h1 className="text-[25vw] sm:text-9xl font-display font-black text-white leading-none tracking-tighter">
                {secretNumber}
            </h1>
            <p className="text-purple-500 text-[10px] font-bold uppercase tracking-widest mt-4">(1 = Worst, 10 = Best)</p>
        </div>
        <button onClick={startQuestionPhase} className="btn-primary w-full max-w-xs bg-white text-black border-none">
            I MEMORIZED IT, PASS PHONE
        </button>
    </div>
  );

  if (phase === 'QUESTIONS') return (
    <div className="h-full flex flex-col p-6 items-center bg-[#050505] relative overflow-hidden w-full">
        {settings.useTimer && (
            <div className="w-full flex justify-center mb-4 z-10">
                <div className={`px-6 py-2 rounded-full border ${timeLeft <= 10 ? 'bg-red-950/50 border-red-500 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-white'} font-mono font-black text-xl`}>
                    {timeLeft}s
                </div>
            </div>
        )}

        <div className="text-center z-10 mb-8 w-full">
            <h2 
                className="text-purple-400 font-bold uppercase tracking-widest mb-2 truncate px-2"
                style={{ fontSize: `clamp(0.6rem, ${15 / Math.max(describer.length, 1)}rem, 0.75rem)` }}
            >
                Read Category to {describer}
            </h2>
            <p className="text-zinc-500 text-[10px] uppercase font-bold max-w-[250px] mx-auto">
                They will answer based on their secret 1-10 rating.
            </p>
        </div>

        <div className="flex-1 w-full relative flex items-center justify-center z-10">
            <AnimatePresence>
                {shuffledPrompts.length > 0 && (
                    <QuestionCard key={promptIndex} prompt={shuffledPrompts[promptIndex]} onSwipe={handleCardSwipe} />
                )}
            </AnimatePresence>
        </div>

        <div className="w-full mt-8 flex flex-col items-center justify-center z-10">
            <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest mb-4 animate-pulse">
                Swipe card to change category
            </p>
            <button onClick={() => setPhase('SCORING')} className="btn-primary w-full max-w-xs bg-purple-600 text-white border-none shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                GUESS THE NUMBER
            </button>
        </div>
    </div>
  );

  if (phase === 'SCORING') return (
    <div className="h-full flex flex-col p-6 items-center bg-[#050505] animate-fade-in w-full overflow-hidden">
        <div className="text-center mb-6 mt-2 w-full">
            <p 
                className="text-zinc-500 font-bold uppercase tracking-widest mb-1 truncate px-2"
                style={{ fontSize: `clamp(0.5rem, ${12 / Math.max(describer.length, 1)}rem, 0.625rem)` }}
            >
                {describer}'s Number Was
            </p>
            <h1 className="text-6xl font-display font-black text-white">{secretNumber}</h1>
        </div>

        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 flex-1 overflow-y-auto no-scrollbar flex flex-col">
            <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mb-4 text-center">Who guessed it right offline?</p>
            <div className="space-y-3 flex-1">
                {guessers.map(player => {
                    const isSelected = correctGuessers.includes(player);
                    return (
                        <div key={player} onClick={() => toggleGuesser(player)} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-purple-900/30 border-purple-500' : 'bg-black border-white/10'}`}>
                            <span className={`font-black uppercase truncate pr-4 ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                {player}
                            </span>
                            {isSelected ? <CheckSquare className="text-purple-500 shrink-0" /> : <Square className="text-zinc-600 shrink-0" />}
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 text-center border-t border-white/10 pt-4 w-full">
                <p 
                    className="text-zinc-500 font-bold uppercase tracking-widest truncate px-2"
                    style={{ fontSize: `clamp(0.5rem, ${12 / Math.max(describer.length, 1)}rem, 0.625rem)` }}
                >
                    {describer} gets
                </p>
                <p className="text-purple-400 font-black text-xl">+{correctGuessers.length} Points</p>
            </div>
        </div>
        <button onClick={submitScores} className="btn-primary w-full max-w-xs bg-white text-black mt-6 shrink-0">
            SUBMIT SCORES
        </button>
    </div>
  );

  if (phase === 'GAME_OVER') {
    const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);
    const winner = sortedScores[0];

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
            <Trophy size={64} className="mb-6 text-purple-500 shrink-0" />
            <h2 className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mb-2">FINAL RESULTS</h2>
            <div className="mb-8 w-full">
                <p className="text-purple-500 font-bold uppercase text-[10px] tracking-widest mb-2">Champion</p>
                
                {/* --- FIX: DYNAMIC TEXT SCALING FOR CHAMPION --- */}
                <h1 
                    className="font-display font-black text-white uppercase tracking-tight leading-none w-full whitespace-nowrap overflow-visible px-2"
                    style={{ fontSize: `clamp(2rem, ${30 / Math.max(winner[0].length, 1)}rem, 4rem)` }}
                >
                    {winner[0]}
                </h1>
            </div>
            <div className="w-full max-w-xs space-y-3 mb-12 flex-1 overflow-y-auto no-scrollbar py-2">
                {sortedScores.map(([name, score], index) => (
                    <div key={name} className={`flex justify-between items-center p-5 rounded-2xl border ${index === 0 ? 'bg-purple-950/40 border-purple-500/50' : 'bg-white/5 border-white/10'}`}>
                        <div className="flex items-center gap-4">
                            <span className="text-zinc-500 font-black">{index + 1}</span>
                            <span className={`font-black text-lg uppercase truncate max-w-[120px] ${index === 0 ? 'text-purple-500' : 'text-white'}`}>{name}</span>
                        </div>
                        <span className={`font-black text-2xl ${index === 0 ? 'text-purple-500' : 'text-white'}`}>{score}</span>
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