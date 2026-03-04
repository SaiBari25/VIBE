import React, { useState } from 'react';
import { UserPlus, X, ChevronRight, AlertCircle, AlertTriangle } from 'lucide-react';

export default function PlayerSetup({ savedPlayers, minPlayers, onStart }) {
  const [players, setPlayers] = useState(() => {
    let initial = savedPlayers?.length ? [...savedPlayers] : [];
    while (initial.length < minPlayers) {
      initial.push({ id: Date.now() + Math.random(), name: '' });
    }
    return initial;
  });

  const validNames = players.map(p => p.name.trim()).filter(n => n.length > 0);
  
  // DUPLICATE NAME CHECK
  const lowerCaseNames = validNames.map(n => n.toLowerCase());
  const hasDuplicates = new Set(lowerCaseNames).size !== lowerCaseNames.length;
  
  const hasEnoughPlayers = validNames.length >= minPlayers;
  const canStart = hasEnoughPlayers && !hasDuplicates;

  const addPlayer = () => {
    setPlayers([...players, { id: Date.now(), name: '' }]);
  };

  const updatePlayerName = (id, newName) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050505] pb-32">
      <div className="px-6 pb-4 shrink-0">
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={12} className="text-gold-400" /> Minimum {minPlayers} players required
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-3 no-scrollbar pb-10">
        {players.map((player, index) => (
          <div key={player.id} className="relative group flex items-center">
            <div className="absolute left-4 text-zinc-600 font-black text-sm w-4">{index + 1}</div>
            <input
              type="text"
              placeholder={`Player ${index + 1}`}
              value={player.name}
              onChange={(e) => updatePlayerName(player.id, e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold-400/50 focus:bg-white/10 transition-all font-bold"
            />
            {players.length > minPlayers && (
              <button onClick={() => removePlayer(player.id)} className="absolute right-4 text-zinc-600 hover:text-red-500 transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
        ))}

        <button onClick={addPlayer} className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-zinc-500 font-bold flex items-center justify-center gap-2 hover:border-white/20 hover:text-white transition-colors mt-4">
          <UserPlus size={18} /> ADD PLAYER
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-[#050505] border-t border-white/10 z-50">
        {canStart ? (
          <button onClick={() => onStart(players)} className="w-full py-4 bg-gradient-to-r from-gold-400 to-yellow-600 text-black font-display font-black tracking-widest rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2">
              NEXT STEP <ChevronRight size={20} strokeWidth={3} />
          </button>
        ) : hasDuplicates ? (
          <div className="w-full py-4 bg-red-900/20 border border-red-500/50 text-red-400 font-display font-black tracking-widest rounded-2xl flex items-center justify-center gap-2 text-center text-sm">
              <AlertTriangle size={18} /> NAMES MUST BE UNIQUE
          </div>
        ) : (
          <div className="w-full py-4 bg-white/5 border border-white/10 text-zinc-600 font-display font-black tracking-widest rounded-2xl flex items-center justify-center text-center">
              ADD {minPlayers - validNames.length} MORE TO START
          </div>
        )}
      </div>
    </div>
  );
}