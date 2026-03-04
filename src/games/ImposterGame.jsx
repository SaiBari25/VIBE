import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { User, EyeOff, Clock, AlertTriangle } from 'lucide-react';
import { IMPOSTER_DATA } from '../data/imposterWords'; 

// --- IMPORTS ---
import imposterBg from '../components/ImposterCharacter.png'; 
import crewmateBg from '../components/Crewmate.png'; 

// 🎨 TRUE CLOCKWISE LIGHT BEAM (Uses Red/Purple for a suspicious "Imposter" vibe)
const generateImposterBeam = () => {
  const c1 = `hsl(280, 100%, 65%)`; // Purple
  const c2 = `hsl(0, 100%, 65%)`;   // Red
  return `conic-gradient(from 0deg at 50% 50%, ${c1} 0%, ${c2} 50%, ${c1} 100%)`;
};

// --- 3D INTERACTIVE ROLE REVEAL CARD ---
const RoleCard = ({ role, secretWord, altWord, hint, imposters, settings }) => {
  // 3D Tilt Physics
  const tiltX = useSpring(0, { stiffness: 300, damping: 30 });
  const tiltY = useSpring(0, { stiffness: 300, damping: 30 });

  const [borderGlow] = useState(() => generateImposterBeam());

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

  // Determine text color and background image based on role
  const isImposter = role === 'Imposter';
  const roleColor = isImposter ? 'text-red-500' : role === 'Assistant' ? 'text-green-500' : 'text-blue-400';
  const bgImage = isImposter ? imposterBg : crewmateBg;

  return (
    <motion.div 
        style={{ perspective: 1200 }} 
        onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm select-none"
    >
        <motion.div 
            style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
            className="relative w-full rounded-[32px] p-[4px]"
        >
            {/* 1. TRUE BACKGROUND GLOW (25% Opacity) */}
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

{/* 3. CARD INTERIOR WITH DYNAMIC BACKGROUND IMAGE */}
            <div className="absolute inset-[4px] rounded-[28px] bg-[#0a0a0a] overflow-hidden pointer-events-none z-20 shadow-[inset_0_0_20px_rgba(0,0,0,1)] border border-white/5">
                {/* Background Image - TURNED UP BRIGHTNESS & OPACITY */}
                <img 
                    src={bgImage} 
                    className={`w-full h-full object-cover transition-all duration-700 opacity-90 ${isImposter ? 'brightness-150 saturate-150 scale-105' : 'brightness-110 scale-105'}`} 
                    alt="Role Background"
                />
                {/* Lighter gradient overlay: dark at the top/bottom for text, clear in the middle for the character */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
            </div>
            
            {/* 4. TRUE 3D FLOATING CONTENT */}
            <div className="relative z-30 flex w-full flex-col items-center justify-center min-h-[350px] p-8 text-center" style={{ transformStyle: "preserve-3d" }}>
                
                {/* ROLE TITLE (Floating high) */}
                <motion.div style={{ translateZ: 80 }} className="mb-8 pointer-events-none drop-shadow-2xl">
                    <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest mb-2">You are a</p>
                    <h1 className={`text-4xl font-display font-black uppercase tracking-tight leading-none ${roleColor}`}>
                        {role}
                    </h1>
                </motion.div>

                {/* DYNAMIC CONTENT BASED ON ROLE (Floating medium) */}
                <motion.div style={{ translateZ: 40 }} className="w-full flex flex-col items-center pointer-events-none">
                    
                    {role === 'Crewmate' && (
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 w-full py-6 rounded-2xl shadow-xl">
                            <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mb-2">Secret Word</p>
                            <h2 className="text-2xl font-black text-white px-2 break-words leading-tight drop-shadow-md">{secretWord}</h2>
                        </div>
                    )}
                    
                    {role === 'Imposter' && (
                        <div className="bg-red-950/40 backdrop-blur-md border border-red-500/30 w-full py-6 px-4 rounded-2xl flex flex-col items-center shadow-xl">
                            {settings.useAltWord ? (
                                <>
                                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mb-2">Decoy Word</p>
                                    <h2 className="text-2xl font-black text-white/60 line-through decoration-red-500 mb-4">{altWord}</h2>
                                </>
                            ) : (
                                <AlertTriangle size={40} className="text-red-500 mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                            )}
                            
                            {settings.useHints && (
                                <div className="pt-4 border-t border-red-500/30 w-full">
                                    <p className="text-red-400/70 font-bold uppercase text-[10px] tracking-widest mb-1">Hint</p>
                                    <p className="text-red-400 font-bold text-sm italic">"{hint}"</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {role === 'Assistant' && (
                        <div className="bg-green-950/40 backdrop-blur-md border border-green-500/30 w-full py-6 px-4 rounded-2xl flex flex-col items-center shadow-xl">
                            <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mb-2">Secret Word</p>
                            <h2 className="text-2xl font-black text-white mb-6 leading-tight break-words drop-shadow-md">{secretWord}</h2>
                            <div className="pt-4 border-t border-green-500/30 w-full">
                                <p className="text-green-500/70 font-bold uppercase text-[10px] tracking-widest mb-2">The Imposters Are</p>
                                <p className="text-green-400 font-black text-lg drop-shadow-md">{imposters.join(", ")}</p>
                            </div>
                        </div>
                    )}

                </motion.div>
            </div>
        </motion.div>
    </motion.div>
  );
};


// --- MAIN GAME LOGIC ---
export default function ImposterGame({ players, settings, onEnd, onPlayAgain }) {
  const [phase, setPhase] = useState('SETUP');
  const [secretWord, setSecretWord] = useState('');
  const [altWord, setAltWord] = useState('');
  const [hint, setHint] = useState('');
  const [roles, setRoles] = useState({}); 
  const [imposters, setImposters] = useState([]);
  const [assistant, setAssistant] = useState(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const chosenCategories = settings?.selectedCategories?.length > 0 ? settings.selectedCategories : Object.keys(IMPOSTER_DATA);
    const randomCategoryName = chosenCategories[Math.floor(Math.random() * chosenCategories.length)];
    const categoryWords = IMPOSTER_DATA[randomCategoryName];
    if (!categoryWords || categoryWords.length === 0) return;

    const randomPair = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    setSecretWord(randomPair.word || "ERROR"); 
    setAltWord(randomPair.alts ? randomPair.alts[Math.floor(Math.random() * randomPair.alts.length)] : "ERROR");
    setHint(randomPair.hints ? randomPair.hints[Math.floor(Math.random() * randomPair.hints.length)] : "No hint.");

    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    let actualImposterCount = settings.imposterCount === -1 ? Math.floor(Math.random() * Math.max(1, players.length - 2)) + 1 : settings.imposterCount;
    const assignedImposters = shuffledPlayers.slice(0, actualImposterCount);
    setImposters(assignedImposters);

    let assignedAssistant = null;
    let crewmateStartIdx = actualImposterCount;
    if (settings.useAssistant && shuffledPlayers.length > actualImposterCount + 1) {
        assignedAssistant = shuffledPlayers[actualImposterCount];
        setAssistant(assignedAssistant);
        crewmateStartIdx += 1;
    }

    const assignedCrewmates = shuffledPlayers.slice(crewmateStartIdx);
    const newRoles = {};
    assignedImposters.forEach(p => newRoles[p] = "Imposter");
    if (assignedAssistant) newRoles[assignedAssistant] = "Assistant";
    assignedCrewmates.forEach(p => newRoles[p] = "Crewmate");

    setRoles(newRoles);
    setTimeLeft((settings.gameDuration || 3) * 60); 
    setPhase('PRE_ROLE');
  }, [players, settings]);

  useEffect(() => {
    if (phase === 'PLAYING' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (phase === 'PLAYING' && timeLeft === 0) {
      setPhase('TIMES_UP'); 
    }
  }, [phase, timeLeft]);

  const handleNextPlayer = () => {
    const nextIndex = currentPlayerIndex + 1;
    if (nextIndex >= players.length) setPhase('PLAYING');
    else { setCurrentPlayerIndex(nextIndex); setPhase('PRE_ROLE'); }
  };

  const playerName = players[currentPlayerIndex];
  const playerRole = roles[playerName];

  if (phase === 'PRE_ROLE') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
        <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Player {currentPlayerIndex + 1} of {players.length}</h2>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border bg-black border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0">
            <User size={40} className="text-white" />
        </div>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Pass phone to</p>
        <h1 className="text-4xl sm:text-5xl font-display font-black text-white uppercase mb-12 tracking-tight truncate w-full px-2">
            {playerName}
        </h1>
        <button onClick={() => setPhase('REVEAL_ROLE')} className="btn-primary w-full max-w-xs bg-white text-black border-none shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3">
            <EyeOff size={20} /> I AM {playerName}
        </button>
    </div>
  );

  if (phase === 'REVEAL_ROLE') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in overflow-hidden w-full">
        <h2 className="text-red-500 text-[10px] uppercase font-black tracking-widest mb-8 animate-pulse">
            ONLY {playerName.toUpperCase()} SHOULD LOOK!
        </h2>
        
        <div className="w-full flex justify-center mb-12 relative z-10">
            <RoleCard 
                role={playerRole} 
                secretWord={secretWord} 
                altWord={altWord} 
                hint={hint} 
                imposters={imposters} 
                settings={settings} 
            />
        </div>

        <button onClick={handleNextPlayer} className="btn-primary w-full max-w-xs bg-white text-black border-none z-10">
            {currentPlayerIndex + 1 === players.length ? "START GAME TIMER" : "HIDE & PASS"}
        </button>
    </div>
  );

  if (phase === 'PLAYING') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] w-full overflow-hidden">
        <Clock size={48} className={`mb-6 ${timeLeft <= 30 ? 'text-red-500 animate-bounce' : 'text-white'}`} />
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Find the Imposter</p>
        <div className={`text-7xl font-mono font-black mb-12 tracking-tighter ${timeLeft <= 30 ? 'text-red-500' : 'text-white'}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        <button onClick={() => setPhase('TIMES_UP')} className="py-4 px-8 rounded-3xl border border-red-500/20 bg-red-950/20 text-red-500 font-black uppercase tracking-widest text-xs active:scale-95 transition-all">
            END TIMER EARLY
        </button>
    </div>
  );

  if (phase === 'TIMES_UP') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border bg-red-950 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)] shrink-0 animate-pulse">
            <AlertTriangle size={40} className="text-red-500" />
        </div>
        <h1 className="text-[12vw] sm:text-6xl font-display font-black text-red-500 uppercase tracking-tight mb-12 leading-none w-full">
            TIME'S UP!
        </h1>
        <p className="text-zinc-400 font-bold text-sm max-w-xs mb-12">
            Everyone must point to who they think the Imposter is on the count of 3!
        </p>
        <button onClick={() => setPhase('SUMMARY')} className="btn-primary w-full max-w-xs bg-white text-black border-none">
            REVEAL TRUTH
        </button>
    </div>
  );

  if (phase === 'SUMMARY') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
        <h2 className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4">THE IMPOSTERS WERE</h2>
        
        <div className="w-full max-w-xs bg-red-950/30 border border-red-500/50 rounded-3xl p-6 mb-8 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <h1 className="text-2xl sm:text-3xl font-display font-black uppercase text-red-500 break-words leading-tight">
                {imposters.join(", ")}
            </h1>
        </div>

        <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-3xl p-6 mb-12">
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">The Secret Word Was</p>
            <h2 className="text-2xl font-black text-white break-words">{secretWord}</h2>
        </div>

        <div className="w-full space-y-4 max-w-xs mt-auto shrink-0">
            <button onClick={onPlayAgain} className="btn-primary w-full bg-red-600 text-white border-none shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                PLAY AGAIN
            </button>
            <button onClick={onEnd} className="w-full py-4 rounded-2xl border border-white/10 text-zinc-500 font-bold hover:text-white transition-all uppercase text-xs tracking-widest">
                BACK TO HOME
            </button>
        </div>
    </div>
  );
}