import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy, MapPin, Users, Calendar, Search, Loader2, AlertCircle,
  Clock, DollarSign, Lock, User, ExternalLink, GraduationCap,
  EyeOff, X, Shield, CheckCircle2, Activity, Zap, Gamepad2, Sparkles,
  Medal, Award, Swords, ChevronRight, Tv, TrendingUp, RotateCcw,
} from 'lucide-react';
import { UserProfile, type Tournament, type Workshop } from '@/src/shared/types';
import {
  getTournaments, getWorkshops,
  registerForEvent, getMyRegistrations,
  getPublicTeams, getAllPublicMatches,
  type PublicRegistrationData, type PublicTeamEntry,
} from '../../api/competitionApi';

interface CompetitionHubProps {
  currentUser?: UserProfile | null;
  onViewTournament?: (id: string) => void;
}

type HubTab = 'tournaments' | 'workshops' | 'leaderboard';
type TimeFilter = 'all' | 'upcoming' | 'live' | 'past';

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

/* ───── Skeleton ───── */

function HubSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-200 mb-3" />
            <div className="h-6 w-16 bg-slate-200 rounded mb-1.5" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="h-10 bg-slate-100" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-1/2 bg-slate-100 rounded" />
              <div className="flex gap-2">
                <div className="h-8 flex-1 bg-slate-100 rounded-xl" />
                <div className="h-8 flex-1 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── Main Component ───── */

export default function CompetitionHub({ currentUser, onViewTournament }: CompetitionHubProps) {
  const [hubTab, setHubTab] = useState<HubTab>('tournaments');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [teams, setTeams] = useState<PublicTeamEntry[]>([]);
  const [liveMatchCount, setLiveMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regTarget, setRegTarget] = useState<{ id: string; title: string } | null>(null);
  const [regForm, setRegForm] = useState<PublicRegistrationData>({ public_full_name: '', public_email: '' });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [detailEvent, setDetailEvent] = useState<Tournament | Workshop | null>(null);

  const fetchAll = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      getTournaments(),
      getWorkshops(),
      getPublicTeams(),
      getAllPublicMatches(),
    ]).then(([ts, ws, tms, matches]) => {
      setTournaments(ts);
      setWorkshops(ws);
      setTeams(tms);
      setLiveMatchCount(matches.filter(m => m.status === 'LIVE').length);
    }).catch(err => {
      console.error(err);
      setError('Failed to load events');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (currentUser) {
      getMyRegistrations().then(regs => {
        setRegisteredIds(regs.filter((r: any) =>
          r.registration_status === 'PENDING' || r.registration_status === 'APPROVED'
        ).map((r: any) => r.event));
      }).catch(() => {});
    }
  }, [currentUser]);

  /* Derived data */
  const allEvents = useMemo(() => [...tournaments, ...workshops], [tournaments, workshops]);
  const liveEvents = useMemo(() => allEvents.filter(e => e.computedState === 'LIVE'), [allEvents]);
  const upcomingEvents = useMemo(() => allEvents.filter(e => e.computedState === 'FUTURE'), [allEvents]);
  const pastEvents = useMemo(() => allEvents.filter(e => e.computedState === 'PAST'), [allEvents]);
  const featured = useMemo(() => {
    return upcomingEvents[0] || liveEvents[0] || tournaments[0] || null;
  }, [upcomingEvents, liveEvents, tournaments]);

  const events = hubTab === 'tournaments' ? tournaments : workshops;
  const filtered = events.filter(e => {
    if (timeFilter === 'upcoming' && e.computedState !== 'FUTURE') return false;
    if (timeFilter === 'live' && e.computedState !== 'LIVE') return false;
    if (timeFilter === 'past' && e.computedState !== 'PAST') return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const computedCounts = {
    all: events.length,
    upcoming: events.filter(e => e.computedState === 'FUTURE').length,
    live: events.filter(e => e.computedState === 'LIVE').length,
    past: events.filter(e => e.computedState === 'PAST').length,
  };

  const topTeams = useMemo(() =>
    [...teams].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 3),
  [teams]);

  /* Registration handlers */
  const openRegModal = (id: string, title: string) => {
    setRegTarget({ id, title });
    setRegForm({
      public_full_name: currentUser?.name || '',
      public_email: currentUser?.email || '',
      public_phone: currentUser?.phone_number || '',
      public_organization: '',
    });
    setRegError(null);
    setShowRegModal(true);
  };

  const submitRegistration = async () => {
    if (!regTarget) return;
    if (!regForm.public_full_name.trim()) { setRegError('Full name is required.'); return; }
    const email = regForm.public_email.trim();
    if (!email) { setRegError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setRegError('Enter a valid email.'); return; }
    setRegSubmitting(true);
    setRegError(null);
    try {
      await registerForEvent(regTarget.id, regForm);
      setRegisteredIds(prev => [...prev, regTarget.id]);
      setShowRegModal(false);
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegSubmitting(false);
    }
  };

  const isRegistered = (id: string) => registeredIds.includes(id);

  const totalTournaments = tournaments.length;
  const totalTeams = teams.length;
  const totalParticipants = [...new Set(teams.map(t => t.teamName))].length;

  const FILTERS: { id: TimeFilter; label: string; icon: typeof Calendar }[] = [
    { id: 'all', label: 'All', icon: Trophy },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    { id: 'live', label: 'Live', icon: Zap },
    { id: 'past', label: 'Past', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8">
      {/* ════════════════════════════════════════ */}
      {/* HERO */}
      {/* ════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/60 p-6 md:p-10">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
              <Trophy className="w-3.5 h-3.5" /> EthioRobotics
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
              <Sparkles className="w-3 h-3" /> 2025 Season
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Competitions & Events
          </h1>
          <p className="mt-2 text-base md:text-lg text-slate-300 max-w-2xl">
            Browse upcoming tournaments, workshops, and events. Register to participate and showcase your skills.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Tournaments', value: totalTournaments, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { label: 'Teams', value: totalTeams, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { label: 'Participants', value: totalParticipants, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: 'Live Now', value: liveEvents.length, icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            ].map(s => (
              <div key={s.label}
                className={`${s.bg} ${s.border} border rounded-2xl p-4 backdrop-blur-sm`}>
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{s.label}</span>
                </div>
                <p className="text-2xl font-black text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* FEATURED TOURNAMENT */}
      {/* ════════════════════════════════════════ */}
      {featured && !loading && hubTab === 'tournaments' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-amber-50 rounded-3xl border border-indigo-100 p-6 md:p-8"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/30 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-200/30 rounded-full blur-2xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                  Featured Tournament
                </span>
                {featured.computedState === 'LIVE' && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                  </span>
                )}
              </div>
              <h3 className="font-black text-xl md:text-2xl text-slate-900 truncate">{featured.title}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(featured.startDateTime).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {featured.location}</span>
                {featured.eventType === 'TOURNAMENT' && (
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {(featured as Tournament).enrolledCount} / {(featured as Tournament).maxTeams || '∞'} teams</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0 w-full md:w-auto">
              <button onClick={() => onViewTournament?.(featured.id)}
                className="flex-1 md:flex-none bg-gradient-to-r from-brand-red to-brand-red-dark text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-red/25 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Swords className="w-4 h-4" /> View Tournament
              </button>
              <button onClick={() => openRegModal(featured.id, featured.title)}
                className="flex-1 md:flex-none bg-white text-slate-700 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Register
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* LIVE MATCHES BAR */}
      {/* ════════════════════════════════════════ */}
      <AnimatePresence>
        {liveMatchCount > 0 && !loading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-2xl p-4 shadow-lg shadow-red-500/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-wider">
                  {liveMatchCount} Match{liveMatchCount > 1 ? 'es' : ''} Live Now
                </p>
                <p className="text-[11px] text-red-200">Watch live matches and follow the action</p>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" /> Watch
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════ */}
      {/* NAV TABS */}
      {/* ════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm">
          {([
            { id: 'tournaments' as HubTab, label: 'Tournaments', icon: Trophy },
            { id: 'workshops' as HubTab, label: 'Workshops', icon: GraduationCap },
            { id: 'leaderboard' as HubTab, label: 'Leaderboard', icon: Medal },
          ]).map(tab => {
            const TabIcon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setHubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  hubTab === tab.id
                    ? 'bg-gradient-to-r from-brand-red to-brand-red-dark text-white shadow-md shadow-brand-red/20'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {hubTab !== 'leaderboard' && (
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => {
              const FIcon = f.icon;
              return (
                <button key={f.id} onClick={() => setTimeFilter(f.id)}
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    timeFilter === f.id
                      ? 'bg-gradient-to-r from-brand-red to-brand-red-dark text-white shadow-md shadow-brand-red/20'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <FIcon className="w-3 h-3" />
                  {f.label}
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                    timeFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>{computedCounts[f.id]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════ */}
      {/* LEADERBOARD FULL VIEW */}
      {/* ════════════════════════════════════════ */}
      {hubTab === 'leaderboard' ? (
        <LeaderboardSection
          teams={teams}
          topTeams={topTeams}
          loading={loading}
          onViewTournament={onViewTournament}
        />
      ) : (
        <>
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${hubTab}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/20 transition-all" />
          </div>

          {/* Content */}
          {loading ? (
            <HubSkeleton />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-10 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-base font-bold text-red-700">{error}</p>
              <button onClick={fetchAll}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-14 flex flex-col items-center text-center">
              <Trophy className="w-14 h-14 text-slate-300 mb-4" />
              <h3 className="font-black text-xl text-slate-600 mb-1">No {hubTab === 'tournaments' ? 'Tournaments' : 'Workshops'} Found</h3>
              <p className="text-sm text-slate-400 max-w-xs">
                {search || timeFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : `No published events are available right now.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(event => {
                const isTournament = event.eventType === 'TOURNAMENT';
                const isLive = event.computedState === 'LIVE';
                const tEvent = event as Tournament;
                return (
                  <motion.div key={event.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-brand-red/20 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Top accent */}
                    <div className={`h-1.5 ${isLive ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-brand-red/60 to-brand-blue/60'}`} />

                    {/* Header */}
                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isTournament
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {isTournament
                            ? <Trophy className="w-5 h-5" />
                            : <GraduationCap className="w-5 h-5" />
                          }
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{event.eventType}</span>
                          {isTournament && (event as any).category && (
                            <span className="ml-1 text-[10px] text-slate-400">· {(event as any).category}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[event.storedStatus] || 'bg-slate-100 text-slate-600'}`}>
                          {event.storedStatus}
                        </span>
                        {event.visibility === 'PRIVATE' && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                            <EyeOff className="w-2.5 h-2.5 inline-block mr-0.5" />PRIVATE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-5 pb-4">
                      <h3 className="font-black text-base text-slate-900 mb-1 leading-snug line-clamp-1">{event.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{event.description}</p>

                      {/* Info chips */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(event.startDateTime).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 max-w-[140px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </span>
                        {isTournament && tEvent.maxTeams > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            <Users className="w-3 h-3 text-slate-400" />
                            {tEvent.enrolledCount}/{tEvent.maxTeams}
                          </span>
                        )}
                        {event.computedState === 'LIVE' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            LIVE
                          </span>
                        )}
                      </div>

                      {/* Capacity bar */}
                      {isTournament && tEvent.maxTeams > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mb-1">
                            <span>Capacity</span>
                            <span>{Math.min(100, Math.round((tEvent.enrolledCount / tEvent.maxTeams) * 100))}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (tEvent.enrolledCount / tEvent.maxTeams) * 100)}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-brand-red to-brand-red-dark rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      {/* Registration / Fee info */}
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        {event.registrationMode !== 'NONE' && (
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {event.registrationMode}
                          </span>
                        )}
                        {event.paymentRequired && event.registrationFee && (
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <DollarSign className="w-3 h-3" />
                            {event.registrationFee} ETB
                          </span>
                        )}
                        {event.registrationDeadline && (
                          <span className="text-slate-400">· until {new Date(event.registrationDeadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-5 pb-5 flex gap-2">
                      <button onClick={() => {
                        if (isTournament && onViewTournament) {
                          onViewTournament(event.id);
                        } else {
                          setDetailEvent(event);
                        }
                      }}
                        className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider border border-slate-200 hover:bg-brand-blue/10 hover:text-brand-blue hover:border-brand-blue/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3 h-3" /> Details
                      </button>
                      {isRegistered(event.id) ? (
                        <div className="flex-1 bg-emerald-50 text-emerald-600 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                        </div>
                      ) : !event.registrationEnabled || event.storedStatus !== 'PUBLISHED' ? (
                        <div className="flex-1 bg-slate-100 text-slate-400 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" /> Closed
                        </div>
                      ) : event.visibility === 'PRIVATE' && !currentUser ? (
                        <a href="/login"
                          className="flex-1 bg-gradient-to-r from-brand-red to-brand-red-dark text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-md shadow-brand-red/20 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5" /> Sign In
                        </a>
                      ) : event.registrationMode === 'STUDENT' && (!currentUser || currentUser.role !== 'Student') ? (
                        !currentUser ? (
                          <a href="/login"
                            className="flex-1 bg-gradient-to-r from-brand-red to-brand-red-dark text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5"
                          >
                            <User className="w-3.5 h-3.5" /> Sign In
                          </a>
                        ) : (
                          <div className="flex-1 bg-amber-50 text-amber-600 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> Students Only
                          </div>
                        )
                      ) : event.registrationMode === 'NONE' ? (
                        <div className="flex-1 bg-slate-100 text-slate-400 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" /> No Registration
                        </div>
                      ) : (
                        <button onClick={() => openRegModal(event.id, event.title)}
                          className="flex-1 bg-gradient-to-r from-brand-red to-brand-red-dark text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-md shadow-brand-red/20 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          {event.registrationMode === 'PUBLIC' ? 'Register' : 'Register'}
                          {event.paymentRequired && event.registrationFee && ` · ${event.registrationFee} ETB`}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════ */}
      {/* REGISTRATION MODAL */}
      {/* ════════════════════════════════════════ */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRegModal(false)}>
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-slate-900">Register</h3>
                <p className="text-xs text-slate-500">{regTarget?.title}</p>
              </div>
              <button onClick={() => setShowRegModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {regTarget && (() => {
                const ev = allEvents.find(e => e.id === regTarget.id);
                if (ev?.paymentRequired && ev.registrationFee) {
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-[11px] font-bold text-amber-700">Fee: {ev.registrationFee} ETB</p>
                    </div>
                  );
                }
                return null;
              })()}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Full Name *</label>
                <input value={regForm.public_full_name} onChange={e => setRegForm(p => ({ ...p, public_full_name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-red" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Email *</label>
                <input type="email" value={regForm.public_email} onChange={e => setRegForm(p => ({ ...p, public_email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Phone</label>
                <input type="tel" value={regForm.public_phone || ''} onChange={e => setRegForm(p => ({ ...p, public_phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Organization</label>
                <input value={regForm.public_organization || ''} onChange={e => setRegForm(p => ({ ...p, public_organization: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              {regError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />{regError}
                </div>
              )}
            </div>
            <div className="p-6 pt-0">
              <button onClick={submitRegistration} disabled={regSubmitting}
                className="w-full bg-gradient-to-r from-brand-red to-brand-red-dark text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand-red/25 hover:shadow-xl disabled:opacity-50 transition-all"
              >
                {regSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : <><Shield className="w-4 h-4" />Confirm Registration</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* EVENT DETAIL MODAL */}
      {/* ════════════════════════════════════════ */}
      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          currentUser={currentUser}
          isRegistered={isRegistered(detailEvent.id)}
          onRegister={() => {
            setDetailEvent(null);
            openRegModal(detailEvent.id, detailEvent.title);
          }}
          onViewFull={detailEvent.eventType === 'TOURNAMENT' && onViewTournament ? () => {
            setDetailEvent(null);
            onViewTournament(detailEvent.id);
          } : undefined}
        />
      )}
    </div>
  );
}

/* ───── Leaderboard Section ───── */

function LeaderboardSection({ teams, topTeams, loading, onViewTournament }: {
  teams: PublicTeamEntry[];
  topTeams: PublicTeamEntry[];
  loading: boolean;
  onViewTournament?: (id: string) => void;
}) {
  const totalTournaments = useMemo(() => new Set(teams.map(t => t.tournamentId)).size, [teams]);
  const totalPoints = useMemo(() => teams.reduce((a, b) => a + b.points, 0), [teams]);

  if (loading) return <HubSkeleton />;

  if (teams.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-14 flex flex-col items-center text-center">
        <Medal className="w-14 h-14 text-slate-300 mb-4" />
        <h3 className="font-black text-xl text-slate-600 mb-1">Leaderboard</h3>
        <p className="text-sm text-slate-400 max-w-md">
          Leaderboard will appear once matches begin and standings are published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Teams', value: teams.length, icon: Users, color: 'text-brand-blue', bg: 'bg-brand-blue/5' },
          { label: 'Tournaments', value: totalTournaments, icon: Trophy, color: 'text-brand-red', bg: 'bg-brand-red/5' },
          { label: 'Total Points', value: totalPoints, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Top Score', value: topTeams[0]?.points || 0, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-1.5`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="font-black text-xl text-slate-900">{s.value}</p>
            <p className="text-[10px] font-bold text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Podium */}
      {topTeams.length >= 3 && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/60 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-red/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <Medal className="w-5 h-5 text-amber-400" />
              <h4 className="font-black text-xs text-amber-400 uppercase tracking-widest">Top Teams</h4>
            </div>
            <div className="flex items-end justify-center gap-4 md:gap-8">
              {[1, 0, 2].map(pos => {
                const entry = topTeams[pos];
                if (!entry) return null;
                const isFirst = pos === 0;
                return (
                  <div key={entry.teamName}
                    className={`flex flex-col items-center gap-2 ${isFirst ? 'order-2' : pos === 0 ? 'order-1' : 'order-3'}`}
                  >
                    <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-lg md:text-2xl ${
                      pos === 0 ? 'bg-amber-400/20 ring-2 ring-amber-400/40' :
                      pos === 1 ? 'bg-slate-400/20 ring-2 ring-slate-400/40' :
                      'bg-orange-400/20 ring-2 ring-orange-400/40'
                    }`}>
                      {['🥇', '🥈', '🥉'][pos]}
                    </div>
                    <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                      pos === 0 ? 'bg-amber-400/20 text-amber-300' :
                      pos === 1 ? 'bg-slate-400/20 text-slate-300' :
                      'bg-orange-400/20 text-orange-300'
                    }`}>
                      {entry.points} pts
                    </div>
                    <div className={`w-20 md:w-28 rounded-t-xl flex flex-col items-center justify-end pb-2 ${
                      pos === 0 ? 'h-28 md:h-32 bg-gradient-to-t from-amber-500/40 to-amber-500/10' :
                      pos === 1 ? 'h-20 md:h-24 bg-gradient-to-t from-slate-500/40 to-slate-500/10' :
                      'h-16 md:h-20 bg-gradient-to-t from-orange-500/40 to-orange-500/10'
                    }`}>
                      <span className={`font-black text-lg md:text-xl ${
                        pos === 0 ? 'text-amber-300' : pos === 1 ? 'text-slate-300' : 'text-orange-300'
                      }`}>{entry.wins}W</span>
                    </div>
                    <span className={`font-black text-sm md:text-base text-center leading-tight max-w-28 truncate ${
                      pos === 0 ? 'text-white' : 'text-slate-300'
                    }`}>{entry.teamName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-center px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider w-14">Rank</th>
                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider">Team</th>
                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider hidden sm:table-cell">Tournament</th>
                <th className="text-center px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider">W</th>
                <th className="text-center px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider">L</th>
                <th className="text-center px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider">D</th>
                <th className="text-center px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teams.map((t, i) => (
                <tr key={t.id} className={`transition-colors ${i < 3 ? 'bg-amber-50/50' : 'hover:bg-slate-50/80'}`}>
                  <td className="px-4 py-3 text-center">
                    {i < 3 ? (
                      <span className="text-base">{['🥇', '🥈', '🥉'][i]}</span>
                    ) : (
                      <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-xs font-black bg-slate-100 text-slate-400">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-slate-900">{t.teamName}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {onViewTournament ? (
                      <button onClick={() => onViewTournament(t.tournamentId)}
                        className="text-xs font-semibold text-brand-blue hover:underline">{t.tournamentName}</button>
                    ) : (
                      <span className="text-xs text-slate-500">{t.tournamentName}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-bold text-emerald-600">{t.wins}</td>
                  <td className="px-4 py-3 text-center text-xs font-bold text-red-500">{t.losses}</td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500">{t.draws}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-base font-black text-slate-900">{t.points}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ───── Event Detail Modal ───── */

function EventDetailModal({ event, onClose, currentUser, isRegistered, onRegister, onViewFull }: {
  event: Tournament | Workshop;
  onClose: () => void;
  currentUser?: UserProfile | null;
  isRegistered: boolean;
  onRegister: () => void;
  onViewFull?: (() => void) | undefined;
}) {
  const isTournament = event.eventType === 'TOURNAMENT';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className={`p-6 ${isTournament
          ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/5'
          : 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5'
        } border-b border-slate-200`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isTournament ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
                {isTournament
                  ? <Trophy className="w-6 h-6 text-amber-600" />
                  : <GraduationCap className="w-6 h-6 text-emerald-600" />
                }
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">{event.title}</h3>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[event.storedStatus]}`}>
                  {event.storedStatus}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h4 className="font-bold text-xs text-slate-700 mb-1.5">Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{event.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <Calendar className="w-4 h-4 text-slate-400 mb-1" />
              <p className="text-[9px] font-black uppercase text-slate-500">Date</p>
              <p className="text-xs font-bold text-slate-800">{new Date(event.startDateTime).toLocaleDateString()}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <MapPin className="w-4 h-4 text-slate-400 mb-1" />
              <p className="text-[9px] font-black uppercase text-slate-500">Location</p>
              <p className="text-xs font-bold text-slate-800 truncate">{event.location}</p>
            </div>
            {isTournament && (
              <div className="bg-slate-50 rounded-xl p-3">
                <Users className="w-4 h-4 text-slate-400 mb-1" />
                <p className="text-[9px] font-black uppercase text-slate-500">Teams</p>
                <p className="text-xs font-bold text-slate-800">{(event as Tournament).enrolledCount} / {(event as Tournament).maxTeams || '∞'}</p>
              </div>
            )}
            <div className="bg-slate-50 rounded-xl p-3">
              <Shield className="w-4 h-4 text-slate-400 mb-1" />
              <p className="text-[9px] font-black uppercase text-slate-500">Registration</p>
              <p className="text-xs font-bold text-slate-800">{event.registrationMode}</p>
            </div>
            {event.computedState === 'LIVE' && (
              <div className="bg-red-50 rounded-xl p-3 col-span-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-black text-red-700 uppercase">This event is currently live</span>
              </div>
            )}
            {event.paymentRequired && event.registrationFee && (
              <div className="bg-amber-50 rounded-xl p-3 col-span-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-bold text-amber-700">Registration Fee: {event.registrationFee} ETB</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-2">
          {onViewFull && (
            <button onClick={onViewFull}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-brand-blue/10 hover:text-brand-blue transition-all">
              <Swords className="w-4 h-4 inline-block mr-1.5" />Full Details
            </button>
          )}
          {isRegistered ? (
            <div className="flex-1 bg-emerald-50 text-emerald-600 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />Registered
            </div>
          ) : !event.registrationEnabled || event.storedStatus !== 'PUBLISHED' ? (
            <div className="flex-1 bg-slate-100 text-slate-400 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />Closed
            </div>
          ) : (
            <button onClick={onRegister}
              className="flex-1 bg-gradient-to-r from-brand-red to-brand-red-dark text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-red/25 hover:shadow-xl transition-all">
              <Shield className="w-4 h-4 inline-block mr-1.5" />Register Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
