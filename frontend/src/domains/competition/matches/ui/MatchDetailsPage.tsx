import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Clock, Calendar, Gamepad2, Loader2, AlertCircle,
  CheckCircle, Trophy, RefreshCw,
} from 'lucide-react';
import { getPublicMatchById, type MatchDetail } from '../../api/competitionApi';
import VexAllianceDisplay, { sidesFromMatch } from '../../shared/VexAllianceDisplay';
import { VEX_ALLIANCE_CONFIG } from '../../shared/vexConstants';

interface MatchDetailsPageProps {
  matchId: string;
  onBack: () => void;
}

export default function MatchDetailsPage({ matchId, onBack }: MatchDetailsPageProps) {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatch = () => {
    getPublicMatchById(matchId)
      .then(m => {
        if (!m) { setError('Match not found'); return; }
        setMatch(m);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchMatch();
  }, [matchId]);

  useEffect(() => {
    if (!match || match.status !== 'LIVE') return;
    const interval = setInterval(fetchMatch, 10000);
    return () => clearInterval(interval);
  }, [matchId, match?.status]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
    </div>
  );

  if (error || !match) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p className="text-sm font-bold text-red-700">{error || 'Match not found'}</p>
      <button onClick={onBack} className="mt-3 text-xs font-bold text-red-600 underline">Go back</button>
    </div>
  );

  const { sideA, sideB } = sidesFromMatch(match.sides);
  const isLive = match.status === 'LIVE';
  const isCompleted = match.status === 'COMPLETED';

  const statusBadgeClass = () => {
    switch (match.status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700';
      case 'LIVE': return 'bg-red-100 text-red-700 animate-pulse';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-slate-100 text-slate-500';
    }
  };

  const winnerLabel = match.winningSide === 'SIDE_A'
    ? VEX_ALLIANCE_CONFIG.redLabel
    : match.winningSide === 'SIDE_B'
      ? VEX_ALLIANCE_CONFIG.blueLabel
      : null;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-red mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Live View
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`rounded-3xl border p-6 md:p-8 mb-6 relative overflow-hidden ${
          isLive
            ? 'bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 border-red-500/40 text-white shadow-xl shadow-red-500/20'
            : isCompleted
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white'
              : 'bg-white border-slate-200'
        }`}>
          {isLive && (
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }} />
          )}

          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Gamepad2 className={`w-5 h-5 ${isLive || isCompleted ? 'text-white/80' : 'text-brand-red'}`} />
                  <h2 className={`font-black text-lg md:text-2xl ${isLive || isCompleted ? 'text-white' : 'text-slate-900'}`}>
                    {match.round || 'Match'}
                  </h2>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusBadgeClass()}`}>{match.status}</span>
                </div>
                <p className={`text-xs mt-1 ${isLive || isCompleted ? 'text-white/60' : 'text-slate-500'}`}>{match.tournamentName}</p>
              </div>
              <div className="flex items-center gap-2">
                {isLive && (
                  <>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-[10px] font-black uppercase shadow-lg shadow-red-500/30">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      LIVE
                    </span>
                    <button onClick={fetchMatch} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Refresh">
                      <RefreshCw className="w-4 h-4 text-white/70" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <VexAllianceDisplay
              sideA={sideA}
              sideB={sideB}
              winningSide={match.winningSide}
              variant="broadcast"
              isLive={isLive}
            />

            {winnerLabel && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-amber-400">
                <Trophy className="w-5 h-5" />
                {winnerLabel} Wins
              </div>
            )}

            <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 ${isLive || isCompleted ? 'text-white/80' : ''}`}>
              <div className={`rounded-xl p-3 ${isLive || isCompleted ? 'bg-white/5 border border-white/10' : 'bg-slate-50'}`}>
                <Calendar className={`w-4 h-4 mb-1 ${isLive || isCompleted ? 'text-white/60' : 'text-brand-red'}`} />
                <p className="text-[9px] font-black uppercase tracking-wider opacity-60">Scheduled</p>
                <p className="text-xs font-bold mt-0.5">{match.scheduledAt ? new Date(match.scheduledAt).toLocaleString() : '—'}</p>
              </div>
              <div className={`rounded-xl p-3 ${isLive || isCompleted ? 'bg-white/5 border border-white/10' : 'bg-slate-50'}`}>
                <Clock className={`w-4 h-4 mb-1 ${isLive || isCompleted ? 'text-white/60' : 'text-brand-red'}`} />
                <p className="text-[9px] font-black uppercase tracking-wider opacity-60">Started</p>
                <p className="text-xs font-bold mt-0.5">{match.startedAt ? new Date(match.startedAt).toLocaleString() : '—'}</p>
              </div>
              <div className={`rounded-xl p-3 ${isLive || isCompleted ? 'bg-white/5 border border-white/10' : 'bg-slate-50'}`}>
                <CheckCircle className={`w-4 h-4 mb-1 ${isLive || isCompleted ? 'text-white/60' : 'text-brand-red'}`} />
                <p className="text-[9px] font-black uppercase tracking-wider opacity-60">Completed</p>
                <p className="text-xs font-bold mt-0.5">{match.completedAt ? new Date(match.completedAt).toLocaleString() : '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
