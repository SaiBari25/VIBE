import React, { useState } from 'react';
import { Clock, Hash, Users, Skull } from 'lucide-react';

export default function EvilExplainSettings({ players, onStartGame }) {
  // Calculate max players per team (round up for odd numbers)
  const maxRounds = Math.ceil(players.length / 2);
  
  // Create an array of available rounds [1, 2, 3... up to maxRounds]
  const roundOptions = Array.from({ length: maxRounds }, (_, i) => i + 1);

  const [rounds, setRounds] = useState(maxRounds); 
  const [roundTime, setRoundTime] = useState(60);
  const [teamGen, setTeamGen] = useState('random'); 
  const [evilMode, setEvilMode] = useState(false); // --- NEW: Evil Mode State ---

  const handleStart = () => {
    onStartGame({
      rounds,
      roundTime,
      teamGen,
      evilMode // Pass it to the game logic
    });
  };

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in w-full text-white bg-[#050505] overflow-y-auto custom-scrollbar">
      <h2 className="text-3xl font-display font-black uppercase tracking-tighter mb-8">Evil Settings</h2>

      <div className="space-y-8 flex-1">
        
        {/* Dynamic Rounds Setting */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <Hash size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight uppercase tracking-tighter">Total Rounds</h3>
              <p className="text-xs text-zinc-500 font-medium">Max rounds = players per team.</p>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {roundOptions.map(val => (
              <button
                key={val}
                onClick={() => setRounds(val)}
                className={`flex-1 min-w-[3rem] py-3 rounded-xl text-sm font-black transition-all ${
                  rounds === val 
                    ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                    : 'bg-black/40 text-zinc-500 border border-white/5 hover:border-red-500/30'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Time Limit Setting (Added 120s) */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight uppercase tracking-tighter">Timer</h3>
              <p className="text-xs text-zinc-500 font-medium">Seconds per turn.</p>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {[30, 45, 60, 90, 120].map(val => (
              <button
                key={val}
                onClick={() => setRoundTime(val)}
                className={`flex-1 min-w-[3.5rem] py-3 rounded-xl text-sm font-black transition-all ${
                  roundTime === val 
                    ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                    : 'bg-black/40 text-zinc-500 border border-white/5 hover:border-orange-500/30'
                }`}
              >
                {val}s
              </button>
            ))}
          </div>
        </div>

        {/* --- NEW: Evil Mode Setting --- */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Skull size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight uppercase tracking-tighter">Evil Mode</h3>
              <p className="text-xs text-zinc-500 font-medium">Lose 1 point for skipping cards.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setEvilMode(false)}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border transition-all ${
                !evilMode ? 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-black/40 border-white/10 text-zinc-500 hover:border-green-500/50'
              }`}
            >
              <span className="font-black uppercase text-sm">Standard</span>
              <span className="text-[9px] text-center opacity-70">No penalty</span>
            </button>
            <button
              onClick={() => setEvilMode(true)}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border transition-all ${
                evilMode ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-black/40 border-white/10 text-zinc-500 hover:border-purple-500/50'
              }`}
            >
              <span className="font-black uppercase text-sm">Evil</span>
              <span className="text-[9px] text-center opacity-70">-1 pt per skip</span>
            </button>
          </div>
        </div>

        {/* Team Generation Setup */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight uppercase tracking-tighter">Team Drafting</h3>
              <p className="text-xs text-zinc-500 font-medium">How should teams be made?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTeamGen('random')}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border transition-all ${
                teamGen === 'random' ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-black/40 border-white/10 text-zinc-500 hover:border-blue-500/50'
              }`}
            >
              <span className="font-black uppercase text-sm">Shuffle</span>
              <span className="text-[9px] text-center opacity-70">Totally random</span>
            </button>
            <button
              onClick={() => setTeamGen('custom')}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border transition-all ${
                teamGen === 'custom' ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-black/40 border-white/10 text-zinc-500 hover:border-blue-500/50'
              }`}
            >
              <span className="font-black uppercase text-sm">Input Order</span>
              <span className="text-[9px] text-center opacity-70">1st half vs 2nd half</span>
            </button>
          </div>
        </div>

      </div>

      <button onClick={handleStart} className="w-full py-4 mt-6 bg-white text-black font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-xl shrink-0">
        Start Game
      </button>
    </div>
  );
}