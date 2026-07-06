import { motion } from 'motion/react';
import CompetitionHub from '../../domains/competition/hub/ui/CompetitionHub';
import { UserProfile } from '../../shared/types';

interface CompetitionPageProps {
  currentUser: UserProfile | null;
}

export default function CompetitionPage({ currentUser }: CompetitionPageProps) {
  return (
    <motion.div key="competitions-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <CompetitionHub currentUser={currentUser} />
    </motion.div>
  );
}
