import React, { useState } from 'react';

export default function FrequencySettings({ players, onStartGame }) {
  const [rounds, setRounds] = useState(3);
  const [useTimer, setUseTimer] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);

  return (
    <div className="w-full h-full relative bg-[#050505] flex flex-col">
      <div className="shrink-0 px-6 pt-2 pb-4">
        <h2 className="text-3xl font-display font-black text-white uppercase">RATE IT 1 TO 10</h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Mind Reading Game</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-40 no-scrollbar">
        {/* ROUNDS SELECT */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mt-4">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4 pl-1">Total Rounds</p>
            <div className="flex gap-3">
                {[1, 3, 5].map(num => (
                    <button 
                        key={num} 
                        onClick={() => setRounds(num)} 
                        className={`flex-1 py-3 rounded-xl font-black text-lg border transition-all ${
                            rounds === num ? 'bg-purple-500 text-white border-purple-500' : 'bg-black text-zinc-600 border-white/10'
                        }`}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>

        {/* TIMER TOGGLE */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-1">Round Timer</p>
                <button 
                    onClick={() => setUseTimer(!useTimer)}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${useTimer ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}
                >
                    {useTimer ? 'ON' : 'OFF'}
                </button>
            </div>
            
            {useTimer && (
                <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Time Limit</p>
                        <span className="text-lg font-black text-white">{timeLimit}s</span>
                    </div>
                    <input 
                        type="range" min="30" max="120" step="15" 
                        value={timeLimit} 
                        onChange={(e) => setTimeLimit(parseInt(e.target.value))} 
                        className="w-full accent-purple-500 h-1 bg-black rounded-lg appearance-none cursor-pointer" 
                    />
                </div>
            )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-[#050505] border-t border-white/10 z-50">
        <button 
            onClick={() => onStartGame({ rounds, useTimer, timeLimit })} 
            className="w-full py-4 bg-purple-600 text-white font-display font-black tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all"
        >
            START GAME
        </button>
      </div>
    </div>
  );
}