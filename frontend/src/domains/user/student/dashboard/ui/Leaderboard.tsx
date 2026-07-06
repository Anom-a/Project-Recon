import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, TrendingDown, Minus, Flame, Award, Search, Filter } from 'lucide-react';
import { MOCK_LEADERBOARD } from '@/src/shared/constants/mock-data';

export default function Leaderboard() {
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const programs = ['all', ...new Set(MOCK_LEADERBOARD.map(e => e.program))];
  const filtered = MOCK_LEADERBOARD.filter(e =>
    (programFilter === 'all' || e.program === programFilter) &&
    (search === '' || e.name.toLowerCase().includes(search.toLowerCase()) || e.school.toLowerCase().includes(search.toLowerCase()))
  );
  const TrendIcon = { up: TrendingUp, down: TrendingDown, same: Minus };
  const trendColor = { up: 'text-emerald-500', down: 'text-red-400', same: 'text-slate-400' };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900">Global Leaderboard</h3>
          <p className="text-xs text-slate-500 mt-1">Compete with students across all Ethio Robotics branches</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs w-40 focus:outline-none focus:border-[#2563EB]" />
          </div>
          <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 focus:outline-none focus:border-[#2563EB] capitalize">
            {programs.map(p => <option key={p} value={p}>{p === 'all' ? 'All Programs' : p}</option>)}
          </select>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3">
        {filtered.slice(0, 3).map((entry, i) => (
          <motion.div key={entry.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`bg-white rounded-2xl border-2 p-5 text-center ${i === 0 ? 'border-amber-300 shadow-lg shadow-amber-100 -mt-2' : 'border-slate-200'}`}>
            <div className="text-4xl mb-2">{entry.avatar}</div>
            <p className="font-display font-bold text-base text-slate-900">{entry.name}</p>
            <p className="text-[10px] text-slate-500 mb-3">{entry.school}</p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 mb-2">
              <p className="font-mono font-extrabold text-2xl text-[#2563EB]">{entry.xp.toLocaleString()}</p>
              <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">XP Points</p>
            </div>
            <div className="flex justify-center gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><Award className="w-3 h-3 text-purple-400" />{entry.badges}</span>
              <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" />{entry.streak}d</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              {['Rank', 'Student', 'Program', 'XP', 'Badges', 'Streak', 'Trend'].map(h => (
                <th key={h} className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-4 py-3 text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((entry, i) => {
                const TIcon = TrendIcon[entry.trend];
                return (
                  <motion.tr key={entry.rank} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3"><span className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold text-xs ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{entry.rank}</span></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><span className="text-lg">{entry.avatar}</span><div><p className="font-bold text-sm text-slate-900">{entry.name}</p><p className="text-[10px] text-slate-400">{entry.school}</p></div></div></td>
                    <td className="px-4 py-3"><span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-1 rounded-full">{entry.program}</span></td>
                    <td className="px-4 py-3 font-mono font-bold text-sm text-slate-900">{entry.xp.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1 text-sm"><Award className="w-3.5 h-3.5 text-purple-400" />{entry.badges}</span></td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1 text-sm text-orange-500"><Flame className="w-3.5 h-3.5" />{entry.streak}d</span></td>
                    <td className="px-4 py-3"><TIcon className={`w-4 h-4 ${trendColor[entry.trend]}`} /></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
