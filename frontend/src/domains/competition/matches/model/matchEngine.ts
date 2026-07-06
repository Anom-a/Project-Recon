export interface MatchScore {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  round: string;
  status: 'scheduled' | 'live' | 'completed';
}

export function calculateWinner(match: MatchScore): string | null {
  if (match.status !== 'completed') return null;
  return match.score1 > match.score2 ? match.team1 : match.team2;
}

export function formatMatchTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const MATCH_DURATION = 105;
export const AUTONOMOUS_DURATION = 15;
