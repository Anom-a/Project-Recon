import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Gamepad2, Users, BarChart3, ClipboardList } from 'lucide-react';
import CompetitionHub from '../../domains/competition/hub/ui/CompetitionHub';
import EventDashboard from '../../domains/competition/hub/ui/EventDashboard';
import TournamentDetailPage from '../../domains/competition/tournaments/ui/TournamentDetailPage';
import TeamListPage from '../../domains/competition/teams/ui/TeamListPage';
import TeamDetailsPage from '../../domains/competition/teams/ui/TeamDetailsPage';
import MatchListPage from '../../domains/competition/matches/ui/MatchListPage';
import MatchDetailsPage from '../../domains/competition/matches/ui/MatchDetailsPage';
import RegistrationDashboard from '../../domains/competition/registrations/ui/RegistrationDashboard';
import { UserProfile } from '../../shared/types';
import { canAccessTab } from '../../shared/auth/permissions';

type CompView = 'hub' | 'dashboard' | 'teams' | 'team-detail' | 'matches' | 'match-detail' | 'tournament-detail' | 'registrations';

interface CompetitionPageProps {
  currentUser: UserProfile | null;
}

export default function CompetitionPage({ currentUser }: CompetitionPageProps) {
  const [view, setView] = useState<CompView>('hub');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  const navTo = (v: CompView) => {
    setView(v);
    if (v !== 'team-detail') setSelectedTeamId(null);
    if (v !== 'match-detail') setSelectedMatchId(null);
    if (v !== 'tournament-detail') setSelectedTournamentId(null);
  };

  const openTeam = (id: string) => { setSelectedTeamId(id); setView('team-detail'); };
  const openMatch = (id: string) => { setSelectedMatchId(id); setView('match-detail'); };
  const openTournament = (id: string) => { setSelectedTournamentId(id); setView('tournament-detail'); };

  const role = currentUser?.role || null;
  const isStaff = role === 'Admin' || role === 'Manager' || role === 'EventManager';

  const tabs: { id: CompView; label: string; icon: typeof Trophy; staffOnly?: boolean }[] = [
    { id: 'hub', label: 'Events', icon: Trophy },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, staffOnly: true },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'matches', label: 'Matches', icon: Gamepad2 },
    { id: 'registrations', label: 'Registrations', icon: ClipboardList, staffOnly: true },
  ];

  const visibleTabs = tabs.filter(t => !t.staffOnly || isStaff);
  const activeTab = visibleTabs.find(t => t.id === view) ? view : 'hub';

  return (
    <motion.div key="competitions-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <div className="min-h-[calc(100vh-76px)] bg-gradient-to-b from-white via-brand-paper to-white relative overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(37, 51, 141, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37, 51, 141, 0.06) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />
        {/* Soft red accent blob - top right */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-red/[0.03] blur-3xl pointer-events-none" />
        {/* Soft blue accent blob - bottom left */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-brand-blue/[0.03] blur-3xl pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Page header with navigation tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Competition Portal</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage and browse all robotics events, teams, and matches</p>
            </div>
            <div className="flex gap-1 p-0.5 bg-white border border-brand-border-light rounded-2xl shadow-sm w-fit overflow-x-auto">
              {visibleTabs.map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => navTo(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-red to-brand-red-dark text-white shadow-md shadow-brand-red/20'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'hub' && <CompetitionHub currentUser={currentUser} onViewTournament={openTournament} />}
          {activeTab === 'dashboard' && isStaff && <EventDashboard />}
          {activeTab === 'teams' && <TeamListPage onSelectTeam={openTeam} />}
          {view === 'team-detail' && selectedTeamId && (
            <TeamDetailsPage teamId={selectedTeamId} onBack={() => navTo('teams')} />
          )}
          {activeTab === 'matches' && <MatchListPage onSelectMatch={openMatch} />}
          {view === 'match-detail' && selectedMatchId && (
            <MatchDetailsPage matchId={selectedMatchId} onBack={() => navTo('matches')} />
          )}
          {view === 'tournament-detail' && selectedTournamentId && (
            <TournamentDetailPage tournamentId={selectedTournamentId} onBack={() => navTo('hub')} currentUser={currentUser} />
          )}
          {activeTab === 'registrations' && isStaff && <RegistrationDashboard />}
        </div>
      </div>
    </motion.div>
  );
}
