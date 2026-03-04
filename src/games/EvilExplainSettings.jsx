import React, { useState } from 'react';

export default function EvilExplainSettings({ players, onStartGame }) {
  const [roundTime, setRoundTime] = useState(60);
  const [rounds, setRounds] = useState(3);

  return (
    <div className="w-full h-full relative bg-[#050505] flex flex-col">
      <div className="shrink-0 px-6 pt-2 pb-4">
        <h2 className="text-3xl font-display font-black text-white">EVIL EXPLAIN</h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Team vs Team</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-40 no-scrollbar">
        
        {/* TIME SLIDER */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mt-2">
            <div className="flex justify-between items-center mb-4">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-1">Time Per Turn</p>
                <span className="text-xl font-black text-white">{roundTime}s</span>
            </div>
            <input 
                type="range" 
                min="30" max="120" step="15" 
                value={roundTime} 
                onChange={(e) => setRoundTime(parseInt(e.target.value))} 
                className="w-full accent-red-500 h-1 bg-black rounded-lg appearance-none cursor-pointer" 
            />
        </div>

        {/* ROUNDS SELECT */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4 pl-1">Total Rounds</p>
            <div className="flex gap-3">
                {[1, 3, 5].map(num => (
                    <button 
                        key={num} 
                        onClick={() => setRounds(num)} 
                        className={`flex-1 py-3 rounded-xl font-black text-lg border transition-all ${
                            rounds === num 
                                ? 'bg-red-500 text-white border-red-500' 
                                : 'bg-black text-zinc-600 border-white/10'
                        }`}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-[#050505] border-t border-white/10 z-50">
        <button 
            onClick={() => onStartGame({ roundTime, rounds })} 
            className="w-full py-4 bg-red-600 text-white font-display font-black tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all"
        >
            CREATE TEAMS
        </button>
      </div>
    </div>
  );
}