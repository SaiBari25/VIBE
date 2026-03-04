import React, { useState } from 'react';
import { Clock, Layers } from 'lucide-react';

export default function FlagSettings({ players, onStartGame }) {
  const [timePerFlag, setTimePerFlag] = useState(5); // 5 seconds to guess
  const [totalRounds, setTotalRounds] = useState(3); // Everyone gets 3 turns

  const handleStart = () => {
    onStartGame({ timePerFlag, totalRounds });
  };

  return (
    <div className="w-full h-full relative bg-[#050505] overflow-hidden flex flex-col">
      <div className="shrink-0 px-6 pt-2 pb-4">
        <h2 className="text-3xl font-display font-black text-white leading-none">FLAG ROULETTE</h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">The Viral Guessing Game</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-32">
        {/* TIME TO GUESS */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Seconds To Guess</p>
            <div className="flex items-center gap-4">
                <Clock className="text-green-400" size={24} />
                <input 
                    type="range" min="3" max="10" step="1"
                    value={timePerFlag}
                    onChange={(e) => setTimePerFlag(parseInt(e.target.value))}
                    className="flex-1 accent-green-400 h-1 bg-black rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-2xl font-black text-white w-12 text-right">{timePerFlag}s</span>
            </div>
        </div>

        {/* TOTAL ROUNDS */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Rounds</p>
            <div className="flex items-center gap-4">
                <Layers className="text-emerald-500" size={24} />
                <input 
                    type="range" min="1" max="5" step="1"
                    value={totalRounds}
                    onChange={(e) => setTotalRounds(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-500 h-1 bg-black rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-2xl font-black text-white w-12 text-right">{totalRounds}</span>
            </div>
        </div>
      </div>

      {/* START BUTTON */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-8 bg-gradient-to-t from-black via-black to-transparent z-50">
        <button 
            onClick={handleStart} 
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-black font-display font-black tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all hover:brightness-110"
        >
            START ROULETTE
        </button>
      </div>
    </div>
  );
}