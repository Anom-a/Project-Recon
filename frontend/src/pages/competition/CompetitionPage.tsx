import { useState } from 'react';
import { motion } from 'motion/react';
import CompetitionHub from '../../domains/competition/hub/ui/CompetitionHub';
import TournamentDetailPage from '../../domains/competition/tournaments/ui/TournamentDetailPage';
import MatchDetailsPage from '../../domains/competition/matches/ui/MatchDetailsPage';
import CompetitionNavPanel from '../../domains/competition/shared/CompetitionNavPanel';
import CompetitionLeaderboardPanel from '../../domains/competition/shared/CompetitionLeaderboardPanel';
import LiveLeaderboardWidget from '../../domains/competition/shared/LiveLeaderboardWidget';
import { UserProfile } from '../../shared/types';

type CompView = 'hub' | 'tournament-detail' | 'match-detail';

interface CompetitionPageProps {
  currentUser: UserProfile | null;
}

export default function CompetitionPage({ currentUser }: CompetitionPageProps) {
  const [view, setView] = useState<CompView>('hub');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'live' | 'events' | 'rules' | 'leaderboard'>('live');
  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false);

  const openMatch = (id: string) => { setSelectedMatchId(id); setView('match-detail'); };
  const openTournament = (id: string) => { setSelectedTournamentId(id); setView('tournament-detail'); };
  const backToHub = () => { setView('hub'); setSelectedMatchId(null); setSelectedTournamentId(null); };

  const isHub = view === 'hub';

  return (
    <motion.div key="competitions-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <div className="min-h-[calc(100vh-76px)] bg-gradient-to-b from-white via-brand-paper to-white relative overflow-x-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(37, 51, 141, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37, 51, 141, 0.06) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-red/[0.03] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-brand-blue/[0.03] blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1800px] mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Desktop 3-column: Nav | Content | Leaderboard */}
          <div className={`grid gap-6 lg:gap-8 items-start ${
            isHub
              ? 'grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_300px]'
              : 'grid-cols-1'
          }`}>
            {/* Left nav — visible on md+ when on hub */}
            {isHub && (
              <aside className="hidden md:block sticky top-24 self-start">
                <CompetitionNavPanel activeSection={activeSection} onNavigate={setActiveSection} />
              </aside>
            )}

            {/* Main content */}
            <main className="min-w-0">
              {isHub && (
                <CompetitionHub
                  currentUser={currentUser}
                  onViewTournament={openTournament}
                  onSelectMatch={openMatch}
                />
              )}
              {view === 'match-detail' && selectedMatchId && (
                <MatchDetailsPage matchId={selectedMatchId} onBack={backToHub} />
              )}
              {view === 'tournament-detail' && selectedTournamentId && (
                <TournamentDetailPage
                  tournamentId={selectedTournamentId}
                  onBack={backToHub}
                  currentUser={currentUser}
                />
              )}
            </main>

            {/* Right leaderboard — visible on xl+ when on hub */}
            {isHub && (
              <div className="hidden xl:block">
                <CompetitionLeaderboardPanel
                  onSelectMatch={openMatch}
                  onViewTournament={openTournament}
                />
              </div>
            )}
          </div>

          {/* Tablet: leaderboard below content */}
          {isHub && (
            <div className="hidden md:block xl:hidden mt-8">
              <CompetitionLeaderboardPanel
                onSelectMatch={openMatch}
                onViewTournament={openTournament}
              />
            </div>
          )}

          {/* Mobile nav strip */}
          {isHub && (
            <div className="md:hidden mt-6">
              <CompetitionNavPanel activeSection={activeSection} onNavigate={setActiveSection} />
            </div>
          )}

          {/* Mobile leaderboard FAB */}
          {isHub && (
            <>
              <button
                onClick={() => setShowMobileLeaderboard(true)}
                className="md:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl shadow-slate-900/30 border border-white/10"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider">Leaderboard</span>
              </button>
              {showMobileLeaderboard && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end"
                  onClick={() => setShowMobileLeaderboard(false)}>
                  <div className="w-full max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl p-4 shadow-2xl"
                    onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">Live Leaderboard</h3>
                      <button onClick={() => setShowMobileLeaderboard(false)}
                        className="text-xs font-bold text-slate-500 px-3 py-1.5 bg-slate-100 rounded-lg">Close</button>
                    </div>
                    <LiveLeaderboardWidget
                      maxRows={15}
                      pollIntervalMs={10000}
                      onTeamClick={openTournament}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
