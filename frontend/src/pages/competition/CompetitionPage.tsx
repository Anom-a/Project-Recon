import { useState } from 'react';
import { motion } from 'motion/react';
import CompetitionHub from '../../domains/competition/hub/ui/CompetitionHub';
import TournamentDetailPage from '../../domains/competition/tournaments/ui/TournamentDetailPage';
import MatchDetailsPage from '../../domains/competition/matches/ui/MatchDetailsPage';
import { UserProfile } from '../../shared/types';

type CompView = 'hub' | 'tournament-detail' | 'match-detail';

interface CompetitionPageProps {
  currentUser: UserProfile | null;
}

export default function CompetitionPage({ currentUser }: CompetitionPageProps) {
  const [view, setView] = useState<CompView>('hub');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  const openMatch = (id: string) => { setSelectedMatchId(id); setView('match-detail'); };
  const openTournament = (id: string) => { setSelectedTournamentId(id); setView('tournament-detail'); };
  const backToHub = () => { setView('hub'); setSelectedMatchId(null); setSelectedTournamentId(null); };

  return (
    <motion.div key="competitions-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <div className="min-h-[calc(100vh-76px)] bg-gradient-to-b from-white via-brand-paper to-white relative overflow-hidden">
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

        <div className="max-w-[1400px] mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {view === 'hub' && (
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
        </div>
      </div>
    </motion.div>
  );
}
