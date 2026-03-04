import React, { useState } from 'react';
import { Check, Shuffle, Brain, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
import { IMPOSTER_DATA } from '../data/imposterWords';

export default function ImposterSettings({ players, onStartGame }) {
  // --- NEW: MULTI-SELECT CATEGORY STATE ---
  // Defaulting to the first available category instead of "Mix"
  const availableCategories = Object.keys(IMPOSTER_DATA);
  const [selectedCategories, setSelectedCategories] = useState([availableCategories[0]]);

  // Existing Game States
  const [imposterCount, setImposterCount] = useState(1);
  const [isRandomImposters, setIsRandomImposters] = useState(false);
  const [gameDuration, setGameDuration] = useState(3);
  const [useHints, setUseHints] = useState(false);
  const [useAltWord, setUseAltWord] = useState(false);
  const [useAssistant, setUseAssistant] = useState(false);

  const maxImposters = Math.max(1, players.length - 1);

  // --- NEW: CATEGORY TOGGLE LOGIC ---
  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
        // Prevent deselecting if it's the only one left
        if (selectedCategories.length > 1) {
            setSelectedCategories(selectedCategories.filter(c => c !== cat));
        }
    } else {
        setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleStart = () => {
    onStartGame({
      selectedCategories, // Passing the array of selected categories
      imposterCount: isRandomImposters ? -1 : imposterCount,
      gameDuration: Math.max(1, gameDuration),
      useHints,
      useAltWord,
      useAssistant
    });
  };

  return (
    <div className="w-full h-[100dvh] relative bg-[#050505] overflow-hidden">
      
      {/* 1. HEADER (Pinned to Top) */}
      <div className="absolute top-0 left-0 right-0 h-28 px-6 pt-8 pb-4 flex items-end justify-between bg-gradient-to-b from-black via-black/90 to-transparent z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <h2 className="text-3xl font-display font-black text-white leading-none">SETTINGS</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Configure Match</p>
        </div>
        <div className="pointer-events-auto text-xs text-black font-bold uppercase tracking-widest bg-gold-400 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            {players.length} Players
        </div>
      </div>

      {/* 2. SCROLLABLE CONTENT (Middle Layer) */}
      <div className="absolute inset-0 overflow-y-auto no-scrollbar pt-32 pb-32 px-6 space-y-8">
        
        {/* TOPIC (UPDATED TO MULTI-SELECT) */}
        <section>
          <div className="flex justify-between items-end mb-3 pl-1">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Select Categories</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map(cat => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                    isSelected 
                      ? 'bg-gold-400 text-black border-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-105' 
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* CONTROLS */}
        <section className="grid grid-cols-2 gap-4">
            {/* IMPOSTERS */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Imposters</p>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl font-black text-white">{isRandomImposters ? "?" : imposterCount}</span>
                    <button 
                        onClick={() => setIsRandomImposters(!isRandomImposters)}
                        className={`p-2 rounded-lg transition-colors ${isRandomImposters ? 'bg-purple-500 text-white' : 'bg-white/10 text-zinc-500'}`}
                    >
                        <Shuffle size={16} />
                    </button>
                </div>
                {!isRandomImposters && (
                    <input 
                        type="range" 
                        min="1" 
                        max={maxImposters} 
                        value={imposterCount}
                        onChange={(e) => setImposterCount(parseInt(e.target.value))}
                        className="w-full accent-purple-500 h-1 bg-black rounded-lg appearance-none cursor-pointer"
                    />
                )}
            </div>

            {/* TIMER */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Minutes</p>
                <div className="flex items-center gap-2 mt-1">
                    <input 
                        type="number" 
                        min="1"
                        value={gameDuration}
                        onChange={(e) => setGameDuration(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-transparent text-4xl font-black text-white w-full focus:outline-none"
                    />
                    <Clock className="text-zinc-600" size={24} />
                </div>
            </div>
        </section>

        {/* EXTRA ROLES */}
        <section className="space-y-3">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1 pl-1">Extra Roles</p>
          
          <ToggleOption 
            active={useHints} 
            onClick={() => setUseHints(!useHints)} 
            icon={<Brain size={18} />} 
            title="Enable Hints" 
            desc="Imposters get a vague clue." 
            color="blue"
          />
          <ToggleOption 
            active={useAltWord} 
            onClick={() => setUseAltWord(!useAltWord)} 
            icon={<Shuffle size={18} />} 
            title="Confused Imposter" 
            desc="Imposters see a similar wrong word." 
            color="red"
          />
          <ToggleOption 
            active={useAssistant} 
            onClick={() => setUseAssistant(!useAssistant)} 
            icon={<ShieldAlert size={18} />} 
            title="The Assistant" 
            desc="Knows the word. Helps Imposters." 
            color="green"
          />
        </section>
      </div>

      {/* 3. FOOTER (Pinned to Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-8 bg-gradient-to-t from-black via-black to-transparent z-50">
        <button 
            onClick={handleStart} 
            className="w-full py-4 bg-gradient-to-r from-gold-400 to-yellow-600 text-black font-display font-black tracking-widest rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.3)] active:scale-95 transition-all hover:brightness-110"
        >
            START MATCH
        </button>
      </div>
    </div>
  );
}

// Sub-component
function ToggleOption({ active, onClick, icon, title, desc, color }) {
    // We use dynamic classes based on the color string passed in
    const activeStyles = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/50",
        red: "text-red-400 bg-red-500/10 border-red-500/50",
        green: "text-green-400 bg-green-500/10 border-green-500/50"
    };

    const dotColors = {
        blue: "bg-blue-500",
        red: "bg-red-500",
        green: "bg-green-500"
    };

    return (
        <div onClick={onClick} className={`group flex justify-between items-center p-4 rounded-2xl cursor-pointer border transition-all ${active ? activeStyles[color] : 'bg-white/5 border-white/10 text-zinc-500'}`}>
            <div className="flex items-center gap-3">
                <div className={active ? `text-${color}-400` : "text-zinc-600"}>{icon}</div>
                <div>
                    <span className={`block font-bold text-sm ${active ? "text-white" : "text-zinc-400"}`}>{title}</span>
                    <span className="text-[10px] opacity-70 leading-tight">{desc}</span>
                </div>
            </div>
            {active && <div className={`w-5 h-5 rounded-full flex items-center justify-center ${dotColors[color]}`}><Check size={12} className="text-black" strokeWidth={3} /></div>}
        </div>
    );
}