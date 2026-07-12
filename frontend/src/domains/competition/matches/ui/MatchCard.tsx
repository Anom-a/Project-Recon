import { motion } from 'motion/react';
import { Clock, Gamepad2, ExternalLink } from 'lucide-react';
import type { MatchDetail } from '../../api/competitionApi';
import VexAllianceDisplay, { sidesFromMatch } from '../../shared/VexAllianceDisplay';

interface MatchCardProps {
  match: MatchDetail;
  onClick?: () => void;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const { sideA, sideB } = sidesFromMatch(match.sides);
  const isLive = match.status === 'LIVE';
  const isCompleted = match.status === 'COMPLETED';

  const statusBadge = () => {
    if (isLive) return 'bg-red-500 text-white';
    if (isCompleted) return 'bg-emerald-500 text-white';
    if (match.status === 'CANCELLED') return 'bg-slate-400 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`bg-white rounded-2xl border overflow-hidden transition-all cursor-pointer group ${
        isLive
          ? 'border-red-400 shadow-lg shadow-red-200/50 ring-1 ring-red-400/30'
          : 'border-slate-200 hover:shadow-lg hover:border-brand-red/20'
      }`}
    >
      <div className={`px-5 py-2.5 flex items-center justify-between ${
        isLive ? 'bg-gradient-to-r from-red-600 to-red-700' : isCompleted ? 'bg-emerald-50' : 'bg-slate-50'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isLive ? 'bg-white/20' : isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
          }`}>
            <Gamepad2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold ${isLive ? 'text-white/80' : 'text-slate-500'}`}>{match.tournamentName}</span>
              <span className={`text-[8px] ${isLive ? 'text-white/40' : 'text-slate-300'}`}>·</span>
              <span className={`text-[10px] font-semibold ${isLive ? 'text-white' : 'text-slate-600'}`}>{match.round}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-[9px] font-black text-white uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live
            </span>
          )}
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadge()}`}>
            {match.status}
          </span>
        </div>
      </div>

      <div className="px-4 py-4">
        <VexAllianceDisplay
          sideA={sideA}
          sideB={sideB}
          winningSide={match.winningSide}
          variant="standard"
          isLive={isLive}
        />
      </div>

      <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {match.scheduledAt ? new Date(match.scheduledAt).toLocaleString() : '—'}
        </span>
        <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-brand-red transition-colors" />
      </div>
    </motion.div>
  );
}
