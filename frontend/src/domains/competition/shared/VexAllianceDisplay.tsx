import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { VEX_ALLIANCE_CONFIG } from './vexConstants';

export interface AllianceSide {
  side: 'SIDE_A' | 'SIDE_B';
  score: number | null;
  teams: string[];
}

interface VexAllianceDisplayProps {
  sideA: AllianceSide;
  sideB: AllianceSide;
  winningSide?: string | null;
  variant?: 'compact' | 'standard' | 'broadcast';
  isLive?: boolean;
  showLabels?: boolean;
}

function AllianceColumn({
  label,
  teams,
  score,
  color,
  isWinner,
  variant,
  align,
}: {
  label: string;
  teams: string[];
  score: number | null;
  color: 'red' | 'blue';
  isWinner: boolean;
  variant: 'compact' | 'standard' | 'broadcast';
  align: 'left' | 'right';
}) {
  const isRed = color === 'red';
  const slots = [
    teams[0] || 'TBD',
    teams[1] || (variant === 'broadcast' ? 'Partner TBD' : null),
  ].filter(Boolean) as string[];

  const bg = isRed
    ? 'bg-gradient-to-br from-red-600/90 to-red-800/90'
    : 'bg-gradient-to-br from-blue-600/90 to-blue-800/90';
  const border = isRed ? 'border-red-400/30' : 'border-blue-400/30';
  const textAlign = align === 'left' ? 'text-left' : 'text-right';

  if (variant === 'compact') {
    return (
      <div className={`flex-1 min-w-0 ${textAlign}`}>
        <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isRed ? 'text-red-400' : 'text-blue-400'}`}>
          {label}
        </p>
        {slots.map((t, i) => (
          <p key={i} className={`text-xs font-bold truncate ${isWinner ? 'text-white' : 'text-slate-200'}`}>{t}</p>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex-1 rounded-2xl border ${border} ${bg} p-4 relative overflow-hidden ${isWinner ? 'ring-2 ring-amber-400/60' : ''}`}>
      {isWinner && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">
          <Trophy className="w-3 h-3" /> Winner
        </div>
      )}
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 ${isRed ? 'text-red-200' : 'text-blue-200'}`}>
        {label}
      </p>
      <div className="space-y-2">
        {slots.map((t, i) => (
          <div key={i} className="bg-black/20 rounded-xl px-3 py-2 border border-white/10">
            <p className="text-[8px] font-bold text-white/50 uppercase">Team {i + 1}</p>
            <p className={`font-black truncate ${variant === 'broadcast' ? 'text-base md:text-lg' : 'text-sm'} text-white`}>{t}</p>
          </div>
        ))}
      </div>
      {score !== null && variant !== 'standard' && (
        <p className={`mt-3 font-black tabular-nums ${variant === 'broadcast' ? 'text-3xl md:text-4xl' : 'text-2xl'} text-white ${textAlign}`}>
          {score}
        </p>
      )}
    </div>
  );
}

export default function VexAllianceDisplay({
  sideA,
  sideB,
  winningSide,
  variant = 'standard',
  isLive = false,
  showLabels = true,
}: VexAllianceDisplayProps) {
  const scoreA = sideA.score;
  const scoreB = sideB.score;
  const redWins = winningSide === 'SIDE_A' || (scoreA !== null && scoreB !== null && scoreA > scoreB);
  const blueWins = winningSide === 'SIDE_B' || (scoreA !== null && scoreB !== null && scoreB > scoreA);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <AllianceColumn label={showLabels ? 'Red' : ''} teams={sideA.teams} score={scoreA} color="red" isWinner={!!redWins && !blueWins} variant="compact" align="left" />
        <div className="shrink-0 text-center">
          <div className={`flex items-center gap-1.5 font-black tabular-nums ${isLive ? 'text-white text-xl' : 'text-slate-900 text-lg'}`}>
            <span>{scoreA ?? '-'}</span>
            <span className="text-slate-400 text-sm">:</span>
            <span>{scoreB ?? '-'}</span>
          </div>
        </div>
        <AllianceColumn label={showLabels ? 'Blue' : ''} teams={sideB.teams} score={scoreB} color="blue" isWinner={!!blueWins && !redWins} variant="compact" align="right" />
      </div>
    );
  }

  return (
    <div className={`flex items-stretch gap-3 md:gap-4 ${variant === 'broadcast' ? 'md:gap-6' : ''}`}>
      <AllianceColumn
        label={VEX_ALLIANCE_CONFIG.redLabel}
        teams={sideA.teams}
        score={scoreA}
        color="red"
        isWinner={!!redWins && !blueWins}
        variant={variant}
        align="left"
      />

      <div className="flex flex-col items-center justify-center shrink-0 px-1 md:px-3">
        {isLive && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[9px] font-black text-red-400 uppercase tracking-wider mb-2"
          >
            LIVE
          </motion.span>
        )}
        <div className={`flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 rounded-2xl font-black tabular-nums ${
          isLive
            ? 'bg-white/10 text-white text-2xl md:text-4xl border border-white/20'
            : 'bg-slate-100 text-slate-900 text-xl md:text-3xl border border-slate-200'
        }`}>
          <span>{scoreA ?? '-'}</span>
          <span className={`text-sm md:text-lg ${isLive ? 'text-white/40' : 'text-slate-300'}`}>:</span>
          <span>{scoreB ?? '-'}</span>
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest mt-2 ${isLive ? 'text-white/40' : 'text-slate-400'}`}>VS</span>
      </div>

      <AllianceColumn
        label={VEX_ALLIANCE_CONFIG.blueLabel}
        teams={sideB.teams}
        score={scoreB}
        color="blue"
        isWinner={!!blueWins && !redWins}
        variant={variant}
        align="right"
      />
    </div>
  );
}

export function sidesFromMatch(sides: { side: 'SIDE_A' | 'SIDE_B'; score: number; teams: string[] }[]) {
  const sideA = sides.find(s => s.side === 'SIDE_A');
  const sideB = sides.find(s => s.side === 'SIDE_B');
  return {
    sideA: { side: 'SIDE_A' as const, score: sideA?.score ?? null, teams: sideA?.teams?.filter(Boolean) || [] },
    sideB: { side: 'SIDE_B' as const, score: sideB?.score ?? null, teams: sideB?.teams?.filter(Boolean) || [] },
  };
}
