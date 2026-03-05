import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { User, EyeOff, AlertTriangle, Palette, Undo, Check, ChevronRight } from 'lucide-react';
import { IMPOSTER_DRAW_DATA } from '../data/imposterDrawData'; 

// 🎨 TRUE CLOCKWISE LIGHT BEAM 
const generateImposterBeam = () => {
  const pLight = `hsl(280, 100%, 65%)`; 
  const pDark = `hsl(280, 100%, 15%)`;  
  const rLight = `hsl(0, 100%, 65%)`;   
  const rDark = `hsl(0, 100%, 15%)`;    
  
  return `conic-gradient(from 0deg at 50% 50%, ${pDark} 0%, ${pLight} 25%, ${rDark} 50%, ${rLight} 75%, ${pDark} 100%)`;
};

// 🖌️ AVAILABLE COLORS & BRUSH SIZES
const PALETTE_COLORS = ['#ffffff', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#0a0a0a'];
const BRUSH_SIZES = [4, 8, 16];

// --- 3D INTERACTIVE ROLE REVEAL CARD ---
const RoleCard = ({ role, secretWord, altWord, hint, imposters, settings }) => {
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

  const handlePointerLeave = () => { tiltX.set(0); tiltY.set(0); };
  const roleColor = role === 'Imposter' ? 'text-red-500' : role === 'Assistant' ? 'text-green-500' : 'text-blue-400';

  return (
    <motion.div style={{ perspective: 1200 }} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm select-none">
        <motion.div style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }} className="relative w-full rounded-[32px] p-[4px]">
            
            {/* 1. THE PERFECT AURA GLOW */}
            <div className="absolute inset-0 rounded-[32px] overflow-hidden blur-[12px] opacity-30 pointer-events-none z-0 scale-[1.04]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                    <motion.div animate={{ rotate: 360 }} transition={{ ease: "linear", duration: 4, repeat: Infinity }} className="w-full h-full rounded-full" style={{ background: borderGlow }} />
                </div>
            </div>

            {/* 2. THE SHARP LIGHT BORDER */}
            <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                    <motion.div animate={{ rotate: 360 }} transition={{ ease: "linear", duration: 4, repeat: Infinity }} className="w-full h-full rounded-full" style={{ background: borderGlow }} />
                </div>
            </div>

            {/* 3. SOLID BLACK CARD INTERIOR */}
            <div className="absolute inset-[4px] rounded-[28px] bg-[#0a0a0a] pointer-events-none z-20 shadow-[inset_0_0_20px_rgba(0,0,0,1)] border border-white/5" />
            
            {/* 4. TRUE 3D FLOATING CONTENT */}
            <div className="relative z-30 flex w-full flex-col items-center justify-center min-h-[400px] p-6 text-center" style={{ transformStyle: "preserve-3d" }}>
                <motion.div style={{ translateZ: 80 }} className="mb-8 pointer-events-none drop-shadow-2xl">
                    <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mb-2">You are a</p>
                    <h1 className={`text-4xl font-display font-black uppercase tracking-tight leading-none ${roleColor}`}>{role}</h1>
                </motion.div>
                
                <motion.div style={{ translateZ: 40 }} className="w-full flex flex-col items-center pointer-events-none">
                    {role === 'Crewmate' && (
                        <div className="bg-white/5 border border-white/10 w-full py-6 rounded-2xl overflow-hidden px-2 flex flex-col items-center justify-center">
                            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Secret Word</p>
                            <h2 
                                className="font-display font-black text-white leading-none tracking-tighter text-center w-full break-words" 
                                style={{ fontSize: `clamp(1.5rem, ${240 / secretWord.length}px, 2.5rem)` }}
                            >
                                {secretWord}
                            </h2>
                        </div>
                    )}
                    {role === 'Imposter' && (
                        <div className="bg-red-950/20 border border-red-500/20 w-full py-6 px-2 rounded-2xl flex flex-col items-center">
                            {settings.useAltWord ? (
                                <>
                                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Decoy Word</p>
                                    <h2 
                                        className="font-black text-white/50 line-through decoration-red-500 mb-4 text-center break-words w-full"
                                        style={{ fontSize: `clamp(1.2rem, ${200 / altWord.length}px, 2rem)` }}
                                    >
                                        {altWord}
                                    </h2>
                                </>
                            ) : <AlertTriangle size={40} className="text-red-500 mb-4" />}
                            {settings.useHints && (
                                <div className="pt-4 border-t border-red-500/20 w-full"><p className="text-red-400/50 font-bold uppercase text-[10px] tracking-widest mb-1">Hint</p><p className="text-red-400 font-bold text-sm italic break-words px-2">"{hint}"</p></div>
                            )}
                        </div>
                    )}
                    {role === 'Assistant' && (
                        <div className="bg-green-950/20 border border-green-500/20 w-full py-6 px-2 rounded-2xl flex flex-col items-center overflow-hidden">
                            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Secret Word</p>
                            <h2 
                                className="font-display font-black text-white leading-none tracking-tighter text-center w-full break-words mb-6" 
                                style={{ fontSize: `clamp(1.5rem, ${240 / secretWord.length}px, 2.5rem)` }}
                            >
                                {secretWord}
                            </h2>
                            <div className="pt-4 border-t border-green-500/20 w-full">
                                <p className="text-green-500/50 font-bold uppercase text-[10px] tracking-widest mb-2">The Imposters Are</p>
                                <p className="text-green-400 font-black text-lg break-words px-2">{imposters.join(", ")}</p>
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
export default function ImposterDrawing({ players, settings, onEnd, onPlayAgain }) {
  const [phase, setPhase] = useState('SETUP');
  
  // Game State
  const [secretWord, setSecretWord] = useState('');
  const [altWord, setAltWord] = useState('');
  const [hint, setHint] = useState('');
  const [roles, setRoles] = useState({}); 
  const [imposters, setImposters] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  
  // Drawing Canvas State
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  
  // Custom Tool State
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(8);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    const chosenCategories = settings?.selectedCategories?.length > 0 ? settings.selectedCategories : Object.keys(IMPOSTER_DRAW_DATA);
    const randomCategoryName = chosenCategories[Math.floor(Math.random() * chosenCategories.length)];
    const categoryWords = IMPOSTER_DRAW_DATA[randomCategoryName];
    if (!categoryWords || categoryWords.length === 0) return;

    const randomPair = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    setSecretWord(randomPair.word || "ERROR"); 
    setAltWord(randomPair.alts ? randomPair.alts[Math.floor(Math.random() * randomPair.alts.length)] : "ERROR");
    setHint(randomPair.hints ? randomPair.hints[Math.floor(Math.random() * randomPair.hints.length)] : "No hint.");

    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    let actualImposterCount = settings.imposterCount === -1 ? Math.floor(Math.random() * Math.max(1, players.length - 2)) + 1 : settings.imposterCount;
    const assignedImposters = shuffledPlayers.slice(0, actualImposterCount);
    setImposters(assignedImposters);

    const assignedCrewmates = shuffledPlayers.slice(actualImposterCount);
    const newRoles = {};
    
    assignedImposters.forEach(p => newRoles[p] = "Imposter");
    assignedCrewmates.forEach(p => newRoles[p] = "Crewmate");
    
    setRoles(newRoles);
    setPhase('PRE_ROLE');
  }, [players, settings]);

  // --- PROGRESSION HANDLERS ---
  const handleNextReveal = () => {
    const nextIndex = currentPlayerIndex + 1;
    if (nextIndex >= players.length) {
        setCurrentPlayerIndex(0);
        setPhase('DRAWING'); 
    }
    else { setCurrentPlayerIndex(nextIndex); setPhase('PRE_ROLE'); }
  };

  const handleNextTurn = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setShowTools(false); 
  };

  // --- DRAWING HANDLERS ---
  const getCoordinates = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handlePointerDown = (e) => {
    if (showTools) setShowTools(false);
    e.target.setPointerCapture(e.pointerId);
    const coords = getCoordinates(e);
    setCurrentLine({ color: brushColor, size: brushSize, points: [coords] });
  };

  const handlePointerMove = (e) => {
    if (!currentLine) return;
    const coords = getCoordinates(e);
    setCurrentLine(prev => ({ ...prev, points: [...prev.points, coords] }));
  };

  const handlePointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    if (currentLine) {
      setLines(prev => [...prev, currentLine]);
      setCurrentLine(null);
    }
  };

  const undoLastLine = () => {
    if (lines.length > 0) setLines(prev => prev.slice(0, -1));
  };

  const playerName = players[currentPlayerIndex];
  const playerRole = roles[playerName];

  // ==========================================
  // RENDER VIEWS
  // ==========================================

  if (phase === 'PRE_ROLE') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in w-full overflow-hidden">
        <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Role Reveal {currentPlayerIndex + 1} of {players.length}</h2>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border bg-black border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0">
            <User size={40} className="text-white" />
        </div>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">Pass phone to</p>
        
        {/* --- FIX: DYNAMIC TEXT SCALING FOR LONG NAMES --- */}
        <h1 
            className="font-display font-black text-white uppercase mb-12 tracking-tight w-full whitespace-nowrap overflow-visible px-2 leading-tight"
            style={{ fontSize: `clamp(1.5rem, ${25 / Math.max(playerName.length, 1)}rem, 4rem)` }}
        >
            {playerName}
        </h1>

        <button onClick={() => setPhase('REVEAL_ROLE')} className="btn-primary w-full max-w-xs bg-white text-black border-none shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3">
            <EyeOff size={20} /> I AM READY
        </button>
    </div>
  );

  if (phase === 'REVEAL_ROLE') return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505] animate-fade-in overflow-hidden w-full">
        <h2 className="text-red-500 text-[10px] uppercase font-black tracking-widest mb-8 animate-pulse break-words px-4">
            ONLY {playerName.toUpperCase()} SHOULD LOOK!
        </h2>
        <div className="w-full flex justify-center mb-12 relative z-10">
            <RoleCard role={playerRole} secretWord={secretWord} altWord={altWord} hint={hint} imposters={imposters} settings={settings} />
        </div>
        <button onClick={handleNextReveal} className="btn-primary w-full max-w-xs bg-white text-black border-none z-10">
            {currentPlayerIndex + 1 === players.length ? "START DRAWING" : "HIDE & PASS"}
        </button>
    </div>
  );

  if (phase === 'DRAWING') return (
    <div className="h-full flex flex-col items-center bg-[#050505] w-full overflow-hidden relative pb-6 pt-2 px-2">
        
        <div className="w-full flex justify-between items-center mb-2 px-2 text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[200px]">
                TURN: <span className="text-white text-sm ml-1">{playerName}</span>
            </span>
            <button onClick={undoLastLine} className="p-2 active:scale-95 text-white/50 hover:text-white transition-colors shrink-0">
                <Undo size={18} />
            </button>
        </div>

        {/* 🎨 DRAWING CANVAS */}
        <div className="flex-1 w-full relative bg-[#1A1A1A] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] touch-none select-none">
            <svg 
                className="w-full h-full cursor-crosshair"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                {lines.map((line, i) => {
                    const pathData = "M " + line.points.map(p => `${p.x} ${p.y}`).join(" L ");
                    return <path key={i} d={pathData} stroke={line.color} strokeWidth={line.size} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
                })}
                {currentLine && (
                    <path 
                        d={"M " + currentLine.points.map(p => `${p.x} ${p.y}`).join(" L ")} 
                        stroke={currentLine.color} strokeWidth={currentLine.size} fill="none" strokeLinecap="round" strokeLinejoin="round" 
                    />
                )}
            </svg>

            {/* FLOATING TOOLS MENU */}
            <div className="absolute bottom-4 left-4 z-20">
                <AnimatePresence>
                    {showTools && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            exit={{ opacity: 0, y: 10, scale: 0.9 }} 
                            className="bg-black/80 backdrop-blur-md border border-white/20 p-4 rounded-2xl mb-2 flex flex-col gap-4 shadow-2xl"
                        >
                            <div className="flex gap-4 items-center justify-center">
                                {BRUSH_SIZES.map(s => (
                                    <button 
                                        key={s} onClick={() => setBrushSize(s)} 
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${brushSize === s ? 'border-white bg-white/20' : 'border-transparent'}`}
                                    >
                                        <div className="bg-white rounded-full" style={{ width: s, height: s }} />
                                    </button>
                                ))}
                            </div>
                            <div className="w-full h-px bg-white/10" />
                            <div className="flex flex-wrap gap-2 justify-center max-w-[150px]">
                                {PALETTE_COLORS.map(c => (
                                    <button 
                                        key={c} onClick={() => setBrushColor(c)} 
                                        className={`w-6 h-6 rounded-full border-2 transition-all ${brushColor === c ? 'border-white scale-125' : 'border-black/50'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button 
                    onClick={() => setShowTools(!showTools)} 
                    className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-white/20 flex items-center justify-center shadow-lg active:scale-95"
                >
                    <div className="w-5 h-5 rounded-full border-2 border-white/50" style={{ backgroundColor: brushColor }} />
                </button>
            </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="w-full flex gap-3 mt-4 h-16 shrink-0">
            <button 
                onClick={() => setPhase('DISCUSSION')} 
                className="flex-1 bg-red-950/30 border border-red-500/30 text-red-500 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center"
            >
                Reveal
            </button>
            <button 
                onClick={handleNextTurn} 
                className="flex-1 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-1"
            >
                Next <ChevronRight size={16} />
            </button>
        </div>
    </div>
  );

  if (phase === 'DISCUSSION') return (
    <div className="h-full flex flex-col items-center p-6 bg-[#050505] w-full overflow-hidden relative">
        <h1 className="text-3xl font-display font-black text-white uppercase text-center mt-6 mb-2 leading-tight">
            Discuss
        </h1>
        <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-8 text-center max-w-xs">
            Who is the Fake Artist?
        </p>
        
        <div className="flex-1 w-full max-w-sm relative bg-[#1A1A1A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl pointer-events-none mb-8 opacity-80">
            <svg className="w-full h-full">
                {lines.map((line, i) => {
                    const pathData = "M " + line.points.map(p => `${p.x} ${p.y}`).join(" L ");
                    return <path key={i} d={pathData} stroke={line.color} strokeWidth={line.size} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
                })}
            </svg>
        </div>

        <button onClick={() => setPhase('SUMMARY')} className="py-4 w-full max-w-xs rounded-2xl border-none bg-red-600 text-white font-black shadow-[0_0_30px_rgba(220,38,38,0.4)] uppercase tracking-widest text-xs active:scale-95 transition-all shrink-0">
            SHOW THE IMPOSTER
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
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">The Drawing Prompt Was</p>
            <h2 className="text-2xl font-black text-white break-words">{secretWord}</h2>
        </div>

        <div className="w-full space-y-4 max-w-xs mt-auto shrink-0">
            <button onClick={onPlayAgain} className="btn-primary w-full bg-red-600 text-white border-none shadow-[0_0_20px_rgba(220,38,38,0.4)] font-black">
                PLAY AGAIN
            </button>
            <button onClick={onEnd} className="w-full py-4 rounded-2xl border border-white/10 text-zinc-500 font-bold hover:text-white transition-all uppercase text-xs tracking-widest">
                BACK TO HOME
            </button>
        </div>
    </div>
  );
}