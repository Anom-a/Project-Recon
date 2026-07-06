import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, MapPin, Clock, X, Edit3, Trash2, Filter, Search, Users, Tag, ChevronDown, CheckCircle, AlertCircle, Globe, Video, Building, Sparkles } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'competition' | 'workshop' | 'webinar' | 'seminar';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  description: string;
  capacity: number;
  enrolled: number;
  color: string;
  dot: string;
}

const defaultEvents: EventItem[] = [
  { id: 'e1', title: 'VEX Regional Finals Prep', date: 'Sat 15th, Jun', time: '9:00 AM', location: 'Bole Arena', category: 'competition', status: 'upcoming', description: 'Intensive preparation session for the VEX Regional Finals. Teams will practice autonomous routines and driver control.', capacity: 50, enrolled: 34, color: 'border-l-[#2563EB]', dot: 'bg-[#2563EB]' },
  { id: 'e2', title: 'Enjoy AI Webinar', date: 'Wed 19th, Jun', time: '2:00 PM', location: 'Online (Zoom)', category: 'webinar', status: 'upcoming', description: 'Live webinar on AI-powered autonomous driving techniques using OpenCV and PID control.', capacity: 100, enrolled: 67, color: 'border-l-emerald-500', dot: 'bg-emerald-500' },
  { id: 'e3', title: 'Global STEM Tour Orientation', date: 'Fri 21st, Jun', time: '10:00 AM', location: 'Convention Center', category: 'seminar', status: 'upcoming', description: 'Orientation session for students participating in the Global STEM Tour program.', capacity: 80, enrolled: 45, color: 'border-l-purple-500', dot: 'bg-purple-500' },
  { id: 'e4', title: 'African Robotics Championship', date: 'Mon 1st, Jul', time: '8:00 AM', location: 'Addis Ababa University', category: 'competition', status: 'upcoming', description: 'The premier robotics championship in Africa featuring teams from 15+ countries.', capacity: 200, enrolled: 156, color: 'border-l-amber-500', dot: 'bg-amber-500' },
  { id: 'e5', title: 'Arduino IoT Workshop', date: 'Sat 22nd, Jun', time: '10:00 AM', location: 'Ethio Robotics Lab', category: 'workshop', status: 'ongoing', description: 'Hands-on workshop building IoT projects with Arduino Uno, sensors, and ESP32 connectivity.', capacity: 20, enrolled: 18, color: 'border-l-rose-500', dot: 'bg-rose-500' },
  { id: 'e6', title: 'Safety & Lab Protocol Seminar', date: 'Mon 10th, Jun', time: '9:00 AM', location: 'Main Auditorium', category: 'seminar', status: 'completed', description: 'Mandatory safety seminar covering LiPo battery handling, motor safety, and lab emergency procedures.', capacity: 150, enrolled: 148, color: 'border-l-slate-500', dot: 'bg-slate-500' },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  competition: Trophy,
  workshop: Building,
  webinar: Video,
  seminar: Globe,
};

function Trophy(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M6 9v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9M6 9h12"/><path d="M12 18v3m-3 0h6"/></svg>;
}

const CATEGORIES = ['all', 'competition', 'workshop', 'webinar', 'seminar'] as const;
const STATUSES = ['all', 'upcoming', 'ongoing', 'completed', 'cancelled'] as const;

export default function EventsManagement() {
  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '', date: '', time: '', location: '', category: 'workshop' as EventItem['category'],
    status: 'upcoming' as EventItem['status'], description: '', capacity: 30, enrolled: 0,
  });

  const openCreateForm = () => {
    setEditingEvent(null);
    setFormData({ title: '', date: '', time: '', location: '', category: 'workshop', status: 'upcoming', description: '', capacity: 30, enrolled: 0 });
    setShowForm(true);
  };

  const openEditForm = (ev: EventItem) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title, date: ev.date, time: ev.time, location: ev.location,
      category: ev.category, status: ev.status, description: ev.description,
      capacity: ev.capacity, enrolled: ev.enrolled,
    });
    setShowForm(true);
  };

  const saveEvent = () => {
    if (!formData.title || !formData.date || !formData.time) return;

    const colorMap: Record<string, string> = {
      competition: 'border-l-[#2563EB]', workshop: 'border-l-rose-500',
      webinar: 'border-l-emerald-500', seminar: 'border-l-purple-500',
    };
    const dotMap: Record<string, string> = {
      competition: 'bg-[#2563EB]', workshop: 'bg-rose-500',
      webinar: 'bg-emerald-500', seminar: 'bg-purple-500',
    };

    if (editingEvent) {
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? {
        ...ev, ...formData,
        color: colorMap[formData.category] || 'border-l-slate-500',
        dot: dotMap[formData.category] || 'bg-slate-500',
      } : ev));
    } else {
      const newEvent: EventItem = {
        id: `e-${Date.now()}`,
        ...formData,
        color: colorMap[formData.category] || 'border-l-slate-500',
        dot: dotMap[formData.category] || 'bg-slate-500',
      };
      setEvents(prev => [newEvent, ...prev]);
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  const deleteEvent = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this event?')) {
      setEvents(prev => prev.filter(ev => ev.id !== id));
    }
  };

  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ev.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: 'bg-blue-50 text-blue-600 border-blue-200/50',
      ongoing: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
      completed: 'bg-slate-100 text-slate-500 border-slate-200',
      cancelled: 'bg-red-50 text-red-500 border-red-200/50',
    };
    return styles[status] || styles.upcoming;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-lg text-slate-900">Events Calendar</h3>
          <p className="text-xs text-slate-500 mt-1">Manage competitions, workshops, webinars, and seminars</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-red/50 w-[180px]"
            />
          </div>
          <div className="relative">
            <button onClick={() => setFilterOpen(!filterOpen)}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-brand-red hover:border-brand-red/30 transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {filterOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-20 w-[240px]"
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Filter</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Category</label>
                      <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-red"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">Status</label>
                      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-red"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setFilterOpen(false); }}
                      className="text-[10px] font-bold text-brand-red hover:text-brand-red-dark"
                    >Clear Filters</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={openCreateForm}
            className="bg-gradient-to-r from-brand-red to-brand-red-dark text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-brand-red/25 hover:shadow-xl active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Showing <span className="font-bold text-slate-600">{filteredEvents.length}</span> of {events.length} events
        </p>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          {CATEGORIES.slice(1).map(cat => (
            <span key={cat} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${
                cat === 'competition' ? 'bg-[#2563EB]' : cat === 'workshop' ? 'bg-rose-500' :
                cat === 'webinar' ? 'bg-emerald-500' : 'bg-purple-500'
              }`} />
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((ev, i) => {
            const CatIcon = CATEGORY_ICONS[ev.category] || Calendar;
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 border-l-4 ${ev.color} hover:shadow-md transition-all group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center`}>
                      <CatIcon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{ev.title}</h4>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusBadge(ev.status)}`}>
                        {ev.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditForm(ev)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-red hover:bg-brand-red/10 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteEvent(ev.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ev.location}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3">{ev.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-medium">{ev.enrolled}/{ev.capacity}</span>
                    <span className="text-slate-400">registered</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(ev.enrolled / ev.capacity) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-red to-brand-red-dark"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700">No events found</h4>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or create a new event</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-2xl -z-10" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-brand-red/10 flex items-center justify-center">
                    {editingEvent ? <Edit3 className="w-4 h-4 text-brand-red" /> : <Plus className="w-4 h-4 text-brand-red" />}
                  </div>
                  <h3 className="font-black text-lg text-slate-900">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Event Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. VEX Robotics Workshop" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-red/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Date</label>
                    <input type="text" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                      placeholder="e.g. Sat 15th, Jun" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-red/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Time</label>
                    <input type="text" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                      placeholder="e.g. 9:00 AM" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-red/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bole Arena" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-red/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as EventItem['category'] })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-red/50"
                    >
                      <option value="workshop">Workshop</option>
                      <option value="competition">Competition</option>
                      <option value="webinar">Webinar</option>
                      <option value="seminar">Seminar</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Status</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as EventItem['status'] })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-red/50"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Capacity</label>
                    <input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-red/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Enrolled</label>
                    <input type="number" value={formData.enrolled} onChange={e => setFormData({ ...formData, enrolled: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-red/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3} placeholder="Event description..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-red/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >Cancel</button>
                <button onClick={saveEvent}
                  className="px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-brand-red to-brand-red-dark rounded-xl shadow-lg shadow-brand-red/25 hover:shadow-xl active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
