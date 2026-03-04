import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowLeft, Play, Info, X, BookOpen, ScrollText, MessageSquare } from 'lucide-react'; 
import { GAMES } from './data/games';
import PlayerSetup from './components/PlayerSetup';
import LiquidEther from './components/LiquidEther';

import ImposterGame from './games/ImposterGame';
import ImposterSettings from './games/ImposterSettings'; 
import HinglishGame from './games/HinglishGame';
import HinglishSettings from './games/HinglishSettings';
import HotBombGame from './games/HotBombGame';
import EvilExplain from './games/EvilExplain';
import EvilExplainSettings from './games/EvilExplainSettings';
import FrequencyGame from './games/FrequencyGame';
import FrequencySettings from './games/FrequencySettings';
import FlagGame from './games/FlagGame';
import FlagSettings from './games/FlagSettings';
import ImposterDrawing from './games/ImposterDrawing';
import ImposterDrawSettings from './games/ImposterDrawSettings';

// ==========================================
// 1. CINEMATIC "TAP TO START" SCREEN
// ==========================================
const StartScreen = ({ onEnter }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleTap = () => {
        setIsExiting(true);
        setTimeout(() => onEnter(), 1000); 
    };

    return (
        <motion.div 
            onClick={handleTap}
            className="relative w-full h-[100dvh] bg-[#050505] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
        >
            <motion.div 
                className="absolute w-[150vw] h-[150vw] sm:w-[800px] sm:h-[800px] bg-gradient-to-tr from-[#5227FF] via-[#B19EEF] to-[#FF9FFC] rounded-full blur-[100px] sm:blur-[140px] pointer-events-none opacity-40"
                animate={{
                    scale: isExiting ? 3 : [1, 1.2, 1],
                    rotate: isExiting ? 180 : [0, 180, 360],
                    opacity: isExiting ? 0 : 0.4
                }}
                transition={{
                    scale: { duration: isExiting ? 1 : 15, ease: isExiting ? "easeOut" : "easeInOut", repeat: isExiting ? 0 : Infinity },
                    rotate: { duration: 25, ease: "linear", repeat: Infinity },
                    opacity: { duration: 1 }
                }}
            />

            <motion.div
                animate={isExiting ? { scale: 1.5, opacity: 0, filter: "blur(20px)" } : { scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex flex-col items-center"
            >
                <motion.div 
                    initial={{ opacity: 0, y: 30, filter: "blur(20px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative text-7xl sm:text-9xl font-display font-black tracking-tighter mb-8"
                >
                    <span className="absolute inset-0 blur-[20px] text-white/30 translate-y-2 pointer-events-none select-none">
                        VIBE.
                    </span>
                    <span 
                        className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white via-white/60 to-white/10"
                        style={{ WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.5)' }}
                    >
                        VIBE
                    </span>
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-[#eb7a2b] to-[#8f3a46] drop-shadow-[0_0_15px_rgba(235,122,43,0.4)]">
                        .
                    </span>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="flex flex-col items-center gap-8"
                >
                    <div className="relative flex items-center justify-center">
                        <motion.div animate={{ scale: [1, 3], opacity: [0.5, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }} className="absolute w-12 h-12 bg-white/20 rounded-full" />
                        <motion.div animate={{ scale: [1, 2.2], opacity: [0.8, 0] }} transition={{ duration: 2.5, delay: 0.6, repeat: Infinity, ease: "easeOut" }} className="absolute w-12 h-12 bg-white/30 rounded-full" />
                        <div className="relative z-10 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            <Play size={20} fill="currentColor" className="ml-1 opacity-90" />
                        </div>
                    </div>
                    <p className="text-white/60 font-bold tracking-[0.4em] text-[10px] sm:text-xs uppercase drop-shadow-md">
                        Tap anywhere to start
                    </p>
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {isExiting && (
                    <motion.div initial={{ scale: 0, opacity: 1, borderWidth: "10px" }} animate={{ scale: 20, opacity: 0, borderWidth: "1px" }} transition={{ duration: 1.2, ease: "easeOut" }} className="absolute z-50 w-20 h-20 border-white rounded-full pointer-events-none" />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ==========================================
// 2. MAIN 3D CAROUSEL CARD
// ==========================================
const CarouselCard = ({ game, index, theta, radius, rotation, onSelect, onInfoClick }) => {
    const myAngle = index * theta;
    const rotateY = useTransform(rotation, r => r + myAngle);
    
    const tiltX = useSpring(0, { stiffness: 150, damping: 20 });
    const tiltY = useSpring(0, { stiffness: 150, damping: 20 });

    const absAngle = useTransform(rotateY, ry => {
        let normalized = ry % 360;
        if (normalized > 180) normalized -= 360;
        if (normalized < -180) normalized += 360;
        return Math.abs(normalized);
    });

    const opacity = useTransform(absAngle, [0, 60, 100, 180], [1, 0.8, 0, 0]);
    const scale = useTransform(absAngle, [0, 90, 180], [1, 0.85, 0.7]);
    const pointerEvents = useTransform(absAngle, (a) => (a < 35 ? "auto" : "none"));

    const cylinderTransform = useTransform(
        [rotateY, scale],
        ([ry, s]) => `rotateY(${ry}deg) translateZ(${radius}px) scale(${s})`
    );

    const startX = useRef(0);

    const handlePointerMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        tiltX.set(y * -15); 
        tiltY.set(x * 15);
    };

    const handlePointerLeave = () => { tiltX.set(0); tiltY.set(0); };
    const handlePointerDown = (e) => { startX.current = e.clientX; };

    const handlePointerUp = (e) => {
        const diffX = Math.abs(e.clientX - startX.current);
        if (diffX < 10) onSelect(game);
    };

    const renderTitle = () => {
        const words = game.title.trim().split(/\s+/);
        if (words.length > 1) {
            return (
                <h2 className="font-display font-black uppercase tracking-tighter text-white leading-[0.85] text-xl sm:text-2xl">
                    {words.map((w, i) => <span key={i} className="block">{w}</span>)}
                </h2>
            );
        }
        const isLong = game.title.length > 8;
        const fontSize = isLong ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl";
        return (
            <h2 className={`font-display font-black uppercase tracking-tighter text-white leading-none ${fontSize}`}>
                {game.title}
            </h2>
        );
    };

    return (
        <motion.div
            style={{ position: "absolute", inset: 0, transform: cylinderTransform, opacity, pointerEvents, transformStyle: "preserve-3d" }}
            className="flex items-center justify-center cursor-pointer"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
        >
            <motion.div 
                style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
                className="w-full h-full bg-[#111111] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 flex flex-col relative overflow-hidden group"
            >
                <button 
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    onTouchStartCapture={(e) => e.stopPropagation()}
                    onMouseDownCapture={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onInfoClick(game); }}
                    className="absolute top-4 right-4 z-[99] w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform"
                >
                    <Info size={20} />
                </button>

                <div className="absolute inset-0 z-0 pointer-events-none">
                    {game.mediaUrl && game.id !== 'imposter' ? (
                        <img src={game.mediaUrl} className="w-full h-full object-cover transition-all duration-700 opacity-20 brightness-50" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${game.gradient} ${game.id === 'imposter' ? 'opacity-40' : 'opacity-20'}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col h-full w-full pointer-events-none">
                    <div className="flex-1 flex items-center justify-center mt-4">
                        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md`}>
                            <game.icon size={44} className={game.color} />
                        </div>
                    </div>
                    
                    <div className="p-6 pt-0 w-full flex flex-col items-center text-center">
                        <div className="min-h-[60px] flex items-center justify-center w-full mb-2">
                            {renderTitle()}
                        </div>
                        <div className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-lg">
                            <Play size={14} fill="currentColor" /> PLAY GAME
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ==========================================
// 3. MAIN APP CONTROLLER
// ==========================================
export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [players, setPlayers] = useState([]); 
  const [view, setView] = useState('HOME'); 
  const [selectedGame, setSelectedGame] = useState(null);
  const [activePlayers, setActivePlayers] = useState([]); 
  const [gameSettings, setGameSettings] = useState(null);

  const [infoModalGame, setInfoModalGame] = useState(null);
  
  const rotation = useMotionValue(0);
  const theta = 360 / GAMES.length; 
  const radius = Math.round((240 / 2) / Math.tan(Math.PI / GAMES.length)) + 55; 

  useEffect(() => {
    if (infoModalGame) return; 
    const timer = setInterval(() => {
        const current = rotation.get();
        const target = Math.round(current / theta) * theta - theta;
        animate(rotation, target, { type: "spring", stiffness: 150, damping: 30 });
    }, 5000); 
    return () => clearInterval(timer);
  }, [rotation, theta, infoModalGame]);

  const handlePan = (e, info) => rotation.set(rotation.get() + info.delta.x * 0.4);
  const handlePanEnd = (e, info) => {
    const current = rotation.get();
    const vel = info.velocity.x * 0.1;
    const target = Math.round((current + vel) / theta) * theta;
    animate(rotation, target, { type: "spring", stiffness: 200, damping: 30 });
  };

  const enterApp = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
    setHasStarted(true);
  };

  const goHome = () => { setSelectedGame(null); setGameSettings(null); setView('HOME'); };

  const renderGame = () => {
      if (!selectedGame) return null;
      const props = { players: activePlayers, settings: gameSettings, onEnd: goHome, onPlayAgain: () => setView('SETTINGS') };
      switch(selectedGame.id) {
          case 'imposter': return <ImposterGame {...props} />;
          case 'imposter_draw': return <ImposterDrawing {...props} />;
          case 'hinglish': return <HinglishGame {...props} />;
          case 'hotbomb': return <HotBombGame players={activePlayers} onEnd={goHome} />;
          case 'taboo': return <EvilExplain {...props} />;
          case 'frequency': return <FrequencyGame {...props} />;
          case 'flags': return <FlagGame {...props} />;
          default: return null;
      }
  };

  if (!hasStarted) {
      return <StartScreen onEnter={enterApp} />;
  }

  return (
    <div className="w-full h-[100dvh] bg-[#050505] flex flex-col items-center font-body text-white overflow-hidden relative">
      {view === 'HOME' && (
        <>
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-80">
                <LiquidEther
                    colors={['#5227FF', '#FF9FFC', '#B19EEF']} 
                    mouseForce={20}
                    cursorSize={100}
                    iterationsPoisson={32}
                    resolution={0.5}
                    autoDemo={true}
                    autoSpeed={0.5}
                />
            </div>

            <header className="w-full max-w-md p-6 z-40 absolute top-0 text-center flex flex-col items-center">
                <h1 className="relative text-3xl sm:text-4xl font-display font-black tracking-tighter inline-block">
                    <span className="absolute inset-0 blur-[12px] text-white/30 translate-y-1 pointer-events-none select-none">
                        VIBE.
                    </span>
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white via-white/70 to-white/10" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.5)' }}>
                        VIBE
                    </span>
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-[#eb7a2b] to-[#8f3a46]">
                        .
                    </span>
                </h1>
            </header>
            
            <main className="w-full flex-1 flex flex-col justify-center items-center relative overflow-hidden z-10 touch-none">
                <div className="absolute z-40 w-full max-w-md flex justify-between px-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <button onClick={() => animate(rotation, Math.round(rotation.get()/theta)*theta + theta, {type:"spring", stiffness:200})} className="pointer-events-auto p-3 text-white bg-black/50 rounded-full border border-white/10 active:scale-90"><ChevronLeft size={32}/></button>
                    <button onClick={() => animate(rotation, Math.round(rotation.get()/theta)*theta - theta, {type:"spring", stiffness:200})} className="pointer-events-auto p-3 text-white bg-black/50 rounded-full border border-white/10 active:scale-90"><ChevronRight size={32}/></button>
                </div>
                
                <div className="w-[240px] h-[340px] sm:w-[280px] sm:h-[400px] relative mt-8" style={{ perspective: '1200px' }}>
                    <motion.div onPan={handlePan} onPanEnd={handlePanEnd} className="absolute inset-0 cursor-grab active:cursor-grabbing" style={{ transformStyle: "preserve-3d" }}>
                        {GAMES.map((game, index) => (
                            <CarouselCard 
                                key={game.id} 
                                game={game} 
                                index={index} 
                                theta={theta} 
                                radius={radius} 
                                rotation={rotation} 
                                onSelect={(g) => { setSelectedGame(g); setView('SETUP'); }} 
                                onInfoClick={(g) => setInfoModalGame(g)} 
                            />
                        ))}
                    </motion.div>
                </div>

                {/* --- MOVED TO BOTTOM RIGHT --- */}
                <div className="absolute bottom-6 right-6 z-50 pointer-events-auto">
                    <a 
                        href="mailto:saibari257@gmail.com?subject=VIBE%20App%20Suggestion"
                        className="flex flex-col items-center gap-1 group text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all shadow-lg active:scale-90">
                            <MessageSquare size={20} />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-80 group-hover:opacity-100 mt-1">
                            Suggest
                        </span>
                    </a>
                </div>
            </main>

            {/* --- TRUE GLASSMORPHISM RULES MODAL --- */}
            <AnimatePresence>
                {infoModalGame && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setInfoModalGame(null)} 
                        className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()} 
                            className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col"
                        >
                            <button onClick={() => setInfoModalGame(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X size={20} /></button>

                            <div className="flex items-center gap-4 mb-8 pr-8">
                                <div className={`w-14 h-14 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center shrink-0 shadow-lg ${infoModalGame.color}`}>
                                    <infoModalGame.icon size={28} />
                                </div>
                                <div>
                                    <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tighter text-white leading-none shadow-black drop-shadow-md">
                                        {infoModalGame.title}
                                    </h2>
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                                        {infoModalGame.minPlayers}+ Players
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-6 max-h-[45vh] custom-scrollbar text-left">
                                <section>
                                    <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-[11px] tracking-widest mb-3">
                                        <BookOpen size={14} /> How to Play
                                    </div>
                                    <div className="text-white/90 leading-relaxed text-sm bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                                        {infoModalGame.howToPlay}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-[11px] tracking-widest mb-3">
                                        <ScrollText size={14} /> Official Rules
                                    </div>
                                    <div className="text-white/70 leading-relaxed text-sm space-y-2 px-1">
                                        {infoModalGame.rules?.split('\n').map((line, i) => (
                                            <p key={i} className="flex gap-2">
                                                <span className="text-white/30">•</span>
                                                <span>{line}</span>
                                            </p>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <button onClick={() => setInfoModalGame(null)} className="w-full mt-8 py-4 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl active:scale-95 transition-all backdrop-blur-md">
                                Got it, let's play
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
      )}

      {view === 'SETUP' && selectedGame && (
        <main className="w-full max-w-md h-full flex flex-col bg-[#050505] animate-fade-in relative z-30">
          <div className="p-6 pb-2 shrink-0">
            <button onClick={goHome} className="text-zinc-500 text-xs font-bold uppercase mb-6 flex items-center gap-2 hover:text-white transition-colors"><ArrowLeft size={14} /> Back</button>
            <h1 className="text-3xl font-display font-black uppercase mb-1">{selectedGame.title}</h1>
          </div>
          <div className="w-full flex-1 overflow-hidden relative">
            <PlayerSetup savedPlayers={players} minPlayers={selectedGame.minPlayers || 3} onStart={(pList) => { setPlayers(pList); const valid = pList.filter(p => p.name.trim().length > 0).map(p => p.name.trim()); setActivePlayers(valid); if (selectedGame.id === 'hotbomb') setView('GAME'); else setView('SETTINGS'); }} />
          </div>
        </main>
      )}

      {view === 'SETTINGS' && selectedGame && (
        <main className="w-full max-w-md h-full bg-[#050505] flex flex-col animate-fade-in relative z-30">
            <div className="p-6 pb-2 z-50">
                <button onClick={() => setView('SETUP')} className="text-zinc-500 text-xs font-bold uppercase flex items-center gap-2 hover:text-white transition-colors"><ArrowLeft size={14} /> Back</button>
            </div>
            <div className="flex-1 overflow-hidden relative">
                {selectedGame.id === 'imposter' ? <ImposterSettings players={activePlayers} onStartGame={(s) => {setGameSettings(s); setView('GAME');}} /> : 
                 selectedGame.id === 'imposter_draw' ? <ImposterDrawSettings players={activePlayers} onStartGame={(s) => {setGameSettings(s); setView('GAME');}} /> : 
                 selectedGame.id === 'hinglish' ? <HinglishSettings players={activePlayers} onStartGame={(s) => {setGameSettings(s); setView('GAME');}} /> : 
                 selectedGame.id === 'taboo' ? <EvilExplainSettings players={activePlayers} onStartGame={(s) => {setGameSettings(s); setView('GAME');}} /> : 
                 selectedGame.id === 'frequency' ? <FrequencySettings players={activePlayers} onStartGame={(s) => {setGameSettings(s); setView('GAME');}} /> : 
                 selectedGame.id === 'flags' ? <FlagSettings players={activePlayers} onStartGame={(s) => {setGameSettings(s); setView('GAME');}} /> : null}
            </div>
        </main>
      )}

      {view === 'GAME' && selectedGame && (
        <main className="w-full max-w-md h-full bg-[#050505] flex flex-col animate-fade-in z-30 relative">
          <div className="flex-1 relative overflow-hidden">{renderGame()}</div>
        </main>
      )}
    </div>
  );
}