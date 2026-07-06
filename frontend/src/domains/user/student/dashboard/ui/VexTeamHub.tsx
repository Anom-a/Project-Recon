import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Trophy, Swords, User, Wrench, Medal, BookOpen, ChevronRight, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { MOCK_VEX_TEAM, MOCK_VEX_ROBOTS, MOCK_VEX_AWARDS, MOCK_VEX_MATCHES, MOCK_VEX_NOTEBOOK } from '@/src/shared/constants/mock-data';

type VexTab = 'overview' | 'robots' | 'awards' | 'matches' | 'notebook';

export default function VexTeamHub() {
  const [activeTab, setActiveTab] = useState<VexTab>('overview');

  const tabs: { id: VexTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Team Overview', icon: Cpu },
    { id: 'robots', label: 'Robots', icon: Wrench },
    { id: 'awards', label: 'Awards', icon: Medal },
    { id: 'matches', label: 'Matches', icon: Swords },
    { id: 'notebook', label: 'Notebook', icon: BookOpen },
  ];

  return (
    <div className="pb-8">
      <div className="bg-white border border-brand-border rounded-2xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-brand-red/5 via-brand-blue/5 to-white px-5 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-5 h-5 text-brand-red" />
              <h2 className="font-black text-lg text-slate-900">{MOCK_VEX_TEAM.name}</h2>
              <span className="text-[10px] font-mono font-bold bg-brand-red/10 text-brand-red px-2 py-0.5 rounded-full">#{MOCK_VEX_TEAM.number}</span>
            </div>
            <p className="text-xs text-slate-500">{MOCK_VEX_TEAM.school} · {MOCK_VEX_TEAM.location}</p>
          </div>
          <div className="text-3xl">{MOCK_VEX_TEAM.avatar}</div>
        </div>
        <div className="grid grid-cols-4 gap-px bg-brand-border">
          {[
            { label: 'Active Robots', value: MOCK_VEX_ROBOTS.filter(r => r.status === 'active').length.toString() },
            { label: 'Awards Won', value: MOCK_VEX_AWARDS.filter(a => !a.upcoming).length.toString() },
            { label: 'Match Wins', value: MOCK_VEX_MATCHES.filter(m => m.result === 'win').length.toString() },
            { label: 'Members', value: MOCK_VEX_TEAM.members.length.toString() },
          ].map((s, i) => (
            <div key={i} className="bg-white px-4 py-3 text-center">
              <p className="font-black text-xl text-slate-900">{s.value}</p>
              <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {tabs.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isActive ? 'bg-brand-red text-white shadow-sm' : 'bg-white border border-brand-border text-slate-500 hover:border-slate-300'}`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'overview' && <TeamOverview />}
        {activeTab === 'robots' && <RobotsList />}
        {activeTab === 'awards' && <AwardsList />}
        {activeTab === 'matches' && <MatchHistory />}
        {activeTab === 'notebook' && <NotebookEntries />}
      </motion.div>
    </div>
  );
}

function TeamOverview() {
  return (
    <div className="bg-white border border-brand-border rounded-2xl p-5">
      <h3 className="font-bold text-sm text-slate-900 mb-4">Team Members</h3>
      <div className="space-y-2.5">
        {MOCK_VEX_TEAM.members.map((name, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center text-white font-black text-xs">
              {name.charAt(0)}
            </div>
            <span className="text-sm text-slate-700 font-medium">{name}</span>
            {i === 0 && <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/5 px-1.5 py-0.5 rounded">Captain</span>}
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-brand-border">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>{MOCK_VEX_TEAM.location}</span>
        </div>
      </div>
    </div>
  );
}

function RobotsList() {
  return (
    <div className="grid gap-3">
      {MOCK_VEX_ROBOTS.map((robot, i) => (
        <div key={i} className="bg-white border border-brand-border rounded-xl p-4 flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 border border-brand-border flex items-center justify-center text-2xl shrink-0">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-bold text-sm text-slate-900">{robot.name}</h4>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${robot.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{robot.status}</span>
            </div>
            <p className="text-xs text-slate-500">{robot.competition} · {robot.season}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {robot.specs.map((spec, j) => (
                <span key={j} className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-brand-border">{spec}</span>
              ))}
            </div>
            {robot.achievements.length > 0 && (
              <div className="mt-2">
                {robot.achievements.map((a, j) => (
                  <p key={j} className="text-[10px] text-brand-red font-medium flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> {a}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AwardsList() {
  return (
    <div className="grid gap-2.5">
      {MOCK_VEX_AWARDS.map((award, i) => (
        <div key={i} className={`bg-white border rounded-xl p-4 ${award.upcoming ? 'border-dashed border-amber-300/50 bg-amber-50/30' : 'border-brand-border'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${award.upcoming ? 'bg-amber-100' : 'bg-brand-red/10'}`}>
                {award.upcoming ? '📅' : '🏆'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{award.name}</h4>
                <p className="text-xs text-slate-500">{award.event}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {award.date}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${award.upcoming ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{award.upcoming ? 'Upcoming' : 'Awarded'}</span>
                </div>
              </div>
            </div>
            {!award.upcoming && (
              <span className="text-xs font-black text-brand-red">{award.category}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatchHistory() {
  return (
    <div className="bg-white border border-brand-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-brand-border">
              <th className="text-left px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Event</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Round</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Opponent</th>
              <th className="text-center px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Score</th>
              <th className="text-center px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Result</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_VEX_MATCHES.map((m, i) => (
              <tr key={i} className="border-b border-brand-border hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-xs text-slate-700">{m.event}</td>
                <td className="px-4 py-3 text-xs text-slate-700">{m.round}</td>
                <td className="px-4 py-3 text-xs text-slate-700">{m.opponent}</td>
                <td className="px-4 py-3 text-xs text-slate-900 font-bold text-center">{m.score}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${m.result === 'win' ? 'bg-emerald-100 text-emerald-700' : m.result === 'loss' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                    {m.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotebookEntries() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {MOCK_VEX_NOTEBOOK.map((entry, i) => {
        const isOpen = expanded === entry.id;
        return (
          <div key={entry.id} className="bg-white border border-brand-border rounded-xl overflow-hidden">
            <button onClick={() => setExpanded(isOpen ? null : entry.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
            >
              <div>
                <h4 className="font-bold text-sm text-slate-900">{entry.title}</h4>
                <p className="text-[10px] text-slate-400">{entry.date} · {entry.author}</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-brand-border">
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{entry.content}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
