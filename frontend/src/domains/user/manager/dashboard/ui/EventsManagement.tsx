import React, { useEffect, useState } from 'react';
import { Calendar, Trophy, Users, Swords, GraduationCap, UserPlus } from 'lucide-react';
import EventManager from '@/domains/competition/admin/EventManager';
import TournamentManager from '@/domains/competition/admin/TournamentManager';
import TeamManager from '@/domains/competition/admin/TeamManager';
import MatchManager from '@/domains/competition/admin/MatchManager';
import WorkshopManager from '@/domains/competition/admin/WorkshopManager';
import RegistrationManager from '@/domains/competition/admin/RegistrationManager';
import type { UserProfile } from '@/shared/types';

export type ManagerEventsTab =
  | 'events'
  | 'tournaments'
  | 'teams'
  | 'matches'
  | 'workshops'
  | 'registrations';

/** Map ManagerDashboard section ids → workspace tabs. */
export function sectionToEventsTab(section: string): ManagerEventsTab {
  switch (section) {
    case 'tournaments':
      return 'tournaments';
    case 'tournament-teams':
      return 'teams';
    case 'matches':
      return 'matches';
    case 'workshops':
      return 'workshops';
    case 'event-registrations':
      return 'registrations';
    case 'events':
    default:
      return 'events';
  }
}

/** Map workspace tabs → ManagerDashboard section ids (sidebar sync). */
function eventsTabToSection(tab: ManagerEventsTab): string {
  switch (tab) {
    case 'tournaments':
      return 'tournaments';
    case 'teams':
      return 'tournament-teams';
    case 'matches':
      return 'matches';
    case 'workshops':
      return 'workshops';
    case 'registrations':
      return 'event-registrations';
    case 'events':
    default:
      return 'events';
  }
}

const TABS: { id: ManagerEventsTab; label: string; icon: typeof Calendar }[] = [
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'tournaments', label: 'Tournaments', icon: Trophy },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'matches', label: 'Matches', icon: Swords },
  { id: 'workshops', label: 'Workshops', icon: GraduationCap },
  { id: 'registrations', label: 'Registrations', icon: UserPlus },
];

interface EventsManagementProps {
  currentUser: UserProfile;
  onNavigate?: (section: string) => void;
  initialTab?: ManagerEventsTab;
}

export default function EventsManagement({
  currentUser,
  onNavigate,
  initialTab = 'events',
}: EventsManagementProps) {
  const [tab, setTab] = useState<ManagerEventsTab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const selectTab = (next: ManagerEventsTab) => {
    setTab(next);
    onNavigate?.(eventsTabToSection(next));
  };

  /** EventManager “Registrations” shortcut → registrations tab (or parent section). */
  const handleInternalNavigate = (section: string) => {
    const mapped = sectionToEventsTab(section);
    if (mapped === 'registrations' || section === 'event-registrations') {
      selectTab('registrations');
      return;
    }
    onNavigate?.(section);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                active
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {tab === 'events' && (
        <EventManager currentUser={currentUser} onNavigate={handleInternalNavigate} />
      )}
      {tab === 'tournaments' && <TournamentManager />}
      {tab === 'teams' && <TeamManager />}
      {tab === 'matches' && <MatchManager />}
      {tab === 'workshops' && <WorkshopManager />}
      {tab === 'registrations' && <RegistrationManager />}
    </div>
  );
}
