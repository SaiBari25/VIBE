import React, { useState } from 'react';
import { Clock, Layers } from 'lucide-react';

const CATEGORIES = ["MOVIE", "SONG", "DIALOGUE"]; 

export default function HinglishSettings({ players, onStartGame }) {
  const [selectedCategories, setSelectedCategories] = useState(["MOVIE"]);
  const [timePerRound, setTimePerRound] = useState(60);
  const [rounds, setRounds] = useState(3);

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
        if (selectedCategories.length > 1) setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
        setSelectedCategories([...selectedCategories, cat]);
    }
  };

  return (
    <div className="w-full h-full relative bg-[#050505] flex flex-col">
      <div className="shrink-0 px-6 pt-2 pb-4">
        <h2 className="text-3xl font-display font-black text-white">HINGLISH</h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Setup Interrogation</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-40 no-scrollbar">
        {/* CATEGORIES */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3 pl-1">Categories</p>
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => toggleCategory(cat)} className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${selectedCategories.includes(cat) ? 'bg-gold-500/20 text-gold-400 border-gold-500/50' : 'bg-black text-zinc-500 border-white/10'}`}>
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* TIME SLIDER */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-1">Time Per Turn</p>
                <span className="text-xl font-black text-white">{timePerRound}s</span>
            </div>
            <input type="range" min="30" max="120" step="15" value={timePerRound} onChange={(e) => setTimePerRound(parseInt(e.target.value))} className="w-full accent-gold-400 h-1 bg-black rounded-lg appearance-none cursor-pointer" />
        </div>

        {/* ROUNDS SELECT */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4 pl-1">Total Rounds</p>
            <div className="flex gap-3">
                {[1, 3, 5].map(num => (
                    <button key={num} onClick={() => setRounds(num)} className={`flex-1 py-3 rounded-xl font-black text-lg border transition-all ${rounds === num ? 'bg-gold-400 text-black border-gold-400' : 'bg-black text-zinc-600 border-white/10'}`}>
                        {num}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-[#050505] border-t border-white/10 z-50">
        <button onClick={() => onStartGame({ selectedCategories, timePerRound, rounds })} className="w-full py-4 bg-gold-400 text-black font-display font-black tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all">
            START MATCH
        </button>
      </div>
    </div>
  );
}