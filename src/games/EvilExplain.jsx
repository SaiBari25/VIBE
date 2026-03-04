import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Check, X, Users, Trophy } from 'lucide-react';
import { TABOO_DATA } from '../data/tabooData';

// 🎨 Smooth, Continuous 2-Color Gradient
const generateElegantGradient = () => {
  const baseHue = Math.floor(Math.random() * 360);
  const c1 = `hsl(${baseHue}, 90%, 50%)`;
  const c2 = `hsl(${(baseHue + 50) % 360}, 90%, 60%)`; 
  return `conic-gradient(from 0deg, ${c1} 0%, ${c2} 50%, ${c1} 100%)`;
};

// --- 3D INTERACTIVE CARD ---
const TabooCard = ({ card, onSwipe, custom }) => {
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

  if (!card) return null;

  return (
    <motion.div 
        custom={custom} variants={{ initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: (dir) => ({ x: dir === 1 ? window.innerWidth : -window.innerWidth, opacity: 0, transition: { duration: 0.2 } }) }} 
        initial="initial" animate="animate" exit="exit" 
        style={{ x, rotate, opacity, perspective: 1200 }} 
        drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6} 
        onDragEnd={handleDragEnd} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}
        className="w-full max-w-sm cursor-grab active:cursor-grabbing absolute z-10 select-none"
    >
        <motion.div 
            style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
            className="relative w-full rounded-[32px] p-[4px]"
        >
            {/* 1. TRUE BACKGROUND GLOW */}
            <div className="absolute inset-0 rounded-[32px] overflow-visible pointer-events-none z-0">
                {/* STRICT CENTERING WRAPPER (Fixes the wobble bug!) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px]">
                    {/* SPINNING ELEMENT */}
                    <div className="w-full h-full rounded-full animate-[spin_4s_linear_infinite] blur-[15px] opacity-25" style={{ background: borderGlow }} />
                </div>
            </div>

            {/* 2. SHARP LIGHT BORDER */}
            <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none z-10">
                {/* STRICT CENTERING WRAPPER (Fixes the wobble bug!) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                    {/* SPINNING ELEMENT */}
                    <div className="w-full h-full rounded-full animate-[spin_4s_linear_infinite]" style={{ background: borderGlow }} />
                </div>
            </div>

            {/* 3. SOLID BLACK CARD INTERIOR */}
            <div className="absolute inset-[4px] rounded-[28px] bg-[#0a0a0a] pointer-events-none z-20 shadow-[inset_0_0_20px_rgba(0,0,0,1)] border border-white/5" />
            
            {/* 4. TRUE 3D FLOATING CONTENT */}
            <div className="relative z-30 flex w-full flex-col items-stretch min-h-[400px] p-8" style={{ transformStyle: "preserve-3d" }}>
                
                {/* BULLETPROOF TEXT SCALING */}
                <motion.div style={{ translateZ: 60 }} className="bg-white text-black w-full px-6 py-6 rounded-2xl mb-6 flex items-center justify-center min-h-[100px] shadow-[0_20px_40px_rgba(0,0,0,0.8)] pointer-events-none overflow-hidden">
                    <h2 
                        className="font-display font-black uppercase leading-none whitespace-nowrap tracking-tighter text-center w-full"
                        style={{ fontSize: `min(2.5rem, ${15 / card.word.length}rem)` }}
                    >
                        {card.word}
                    </h2>
                </motion.div>
                
                <motion.div style={{ translateZ: 30 }} className="flex-1 flex flex-col justify-center gap-3 text-center w-full pointer-events-none">
                    <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-2">Forbidden Words</p>
                    {card.forbidden.map((word, i) => (
                        <div key={i} className="text-xl sm:text-2xl font-black text-white/90 uppercase tracking-widest drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]">{word}</div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    </motion.div>
  );
};

export default function EvilExplain({ players, settings, onEnd }) {
  const [phase, setPhase] = useState('SETUP'); 
  const [deck, setDeck] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState(1); 
  
  const [teams, setTeams] = useState({ red: [], blue: [] });
  const [currentTeam, setCurrentTeam] = useState('red'); 
  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [describer, setDescriber] = useState('');
  
  const [currentRound, setCurrentRound] = useState(1);
  const [turnScore, setTurnScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings?.roundTime || 60);

  useEffect(() => {
    setDeck([...TABOO_DATA].sort(() => Math.random() - 0.5));
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffledPlayers.length / 2);
    setTeams({ red: shuffledPlayers.slice(0, mid), blue: shuffledPlayers.slice(mid) });
    setPhase('PRE');
  }, [players]);

  useEffect(() => {
    if (phase === 'PRE') {
      const activeTeamPlayers = teams[currentTeam];
      if (activeTeamPlayers && activeTeamPlayers.length > 0) {
        setDescriber(activeTeamPlayers[Math.floor(Math.random() * activeTeamPlayers.length)]);
      }
    }
  }, [phase, currentTeam, teams]);

  useEffect(() => {
    if (phase === 'PLAYING' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (phase === 'PLAYING' && timeLeft === 0) {
      if (navigator.vibrate) navigator.vibrate([200, 200, 200]);
      setScores(prev => ({ ...prev, [currentTeam]: prev[currentTeam] + turnScore }));
      setPhase('SUMMARY');
    }
  }, [phase, timeLeft, currentTeam, turnScore]);

  const handleSwipe = (isRight) => {
    setSwipeDir(isRight ? 1 : -1);
    if (isRight) setTurnScore(prev => prev + 1);
    if (navigator.vibrate) navigator.vibrate(isRight ? 30 : [20, 50]);
    setCardIndex(prev => (prev + 1) % deck.length);
  };

  const handleNextTurn = () => {
    if (currentTeam === 'red') {
        setCurrentTeam('blue');
        setPhase('PRE');
    } else {
        if (currentRound >= settings.rounds) setPhase('GAME_OVER');
        else {
            setCurrentRound(prev => prev + 1);
            setCurrentTeam('red');
            setPhase('PRE');
        }
    }
  };

  const startTurn = () => {
    setTimeLeft(settings.roundTime);
    setTurnScore(0);
    setPhase('PLAYING');
  };

  const teamColorClass = currentTeam === 'red' ? 'text-red-500' : 'text-blue-500';
  const teamBgClass = currentTeam === 'red' ? 'bg-red-500' : 'bg-blue-500';

  if (phase === 'SETUP') return <div className="flex-1 bg-[#050505]" />;

  if (phase === 'PRE') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
        <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Round {currentRound} of {settings.rounds}</h2>
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border bg-black ${currentTeam === 'red' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]'}`}>
            <Users size={40} className={teamColorClass} />
        </div>
        <h1 className={`text-4xl sm:text-5xl font-display font-black uppercase mb-12 tracking-tight ${teamColorClass}`}>
            {currentTeam} TEAM
        </h1>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 w-full max-w-xs mb-12">
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Describer</p>
            <h2 className="text-2xl font-black text-white mb-4 truncate px-2">{describer}</h2>
            <div className="h-px w-full bg-white/10 mb-4" />
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Guessers</p>
            <p className={`font-bold ${teamColorClass}`}>Rest of {currentTeam} team</p>
        </div>
        <button onClick={startTurn} className={`btn-primary w-full max-w-xs text-white border-none ${teamBgClass}`}>
            START TURN
        </button>
    </div>
  );

  if (phase === 'PLAYING') return (
    <div className="h-full flex flex-col p-6 items-center bg-[#050505] relative overflow-hidden w-full">
      <div className="flex justify-between items-center w-full mb-8 z-10 px-2">
        <div className={`text-3xl font-mono font-black ${teamColorClass}`}>{timeLeft}s</div>
        <div className={`text-xl font-black ${teamColorClass}`}>{turnScore} PTS</div>
      </div>
      <div className="flex-1 relative flex items-center justify-center z-10 w-full">
        <AnimatePresence mode="wait" custom={swipeDir}>
            <TabooCard key={cardIndex} card={deck[cardIndex]} onSwipe={handleSwipe} custom={swipeDir} />
        </AnimatePresence>
      </div>
      <div className="w-full grid grid-cols-2 gap-4 pb-6 mt-6 z-10">
        <button onClick={() => handleSwipe(false)} className="py-4 rounded-3xl border border-red-500/20 bg-red-950/20 text-red-500 font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
            <X size={20} /> WRONG
        </button>
        <button onClick={() => handleSwipe(true)} className="py-4 rounded-3xl border border-green-500/20 bg-green-950/20 text-green-400 font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Check size={20} /> CORRECT
        </button>
      </div>
    </div>
  );

  if (phase === 'SUMMARY') return (
    <div className="h-full flex flex-col justify-center items-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
        <h2 className="text-zinc-500 font-black uppercase tracking-widest mb-6">TIME'S UP!</h2>
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-xs mb-12">
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">{currentTeam} Scored</p>
            <h1 className={`text-6xl font-display font-black ${teamColorClass}`}>+{turnScore}</h1>
        </div>
        <button onClick={handleNextTurn} className="btn-primary w-full max-w-xs bg-white text-black">
            CONTINUE
        </button>
    </div>
  );

  if (phase === 'GAME_OVER') {
    const isTie = scores.red === scores.blue;
    const winner = scores.red > scores.blue ? 'red' : 'blue';
    const winColorClass = winner === 'red' ? 'text-red-500' : 'text-blue-500';

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
            <Trophy size={64} className={`mb-6 ${isTie ? 'text-zinc-400' : winColorClass}`} />
            <h2 className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mb-2">FINAL RESULTS</h2>
            {isTie ? (
                <h1 className="text-[12vw] sm:text-6xl font-display font-black text-white uppercase tracking-tight mb-12 leading-none w-full">IT'S A TIE!</h1>
            ) : (
                <div className="mb-12">
                    <h1 className={`text-[12vw] sm:text-6xl font-display font-black uppercase tracking-tight leading-none w-full ${winColorClass}`}>{winner} WINS</h1>
                </div>
            )}
            <div className="w-full max-w-xs space-y-4 mb-12">
                <div className="flex justify-between items-center bg-red-950/20 border border-red-500/20 p-5 rounded-2xl">
                    <span className="text-red-500 font-black text-xl uppercase">RED TEAM</span>
                    <span className="text-red-500 font-black text-2xl">{scores.red}</span>
                </div>
                <div className="flex justify-between items-center bg-blue-950/20 border border-blue-500/20 p-5 rounded-2xl">
                    <span className="text-blue-500 font-black text-xl uppercase">BLUE TEAM</span>
                    <span className="text-blue-500 font-black text-2xl">{scores.blue}</span>
                </div>
            </div>
            <button onClick={onEnd} className="w-full py-4 rounded-2xl border border-white/10 text-zinc-500 font-bold hover:text-white transition-all uppercase text-xs tracking-widest max-w-xs">
                BACK TO HOME
            </button>
        </div>
    );
  }
}