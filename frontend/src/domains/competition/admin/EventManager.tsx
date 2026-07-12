import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, X, Loader2, AlertCircle, Calendar, MapPin, Users, Tag, Globe,
  CheckCircle, Eye, Edit3, Trash2, Send, ToggleLeft, ToggleRight, Clock, Youtube,
  Trophy, GraduationCap, Swords, UserPlus, Image, DollarSign, Lock, Unlock,
  FileText, Settings, ChevronRight, Sparkles, ArrowRight, ExternalLink
} from 'lucide-react';
import * as eventsApi from '../../competition/api/eventsApi';
import type { BackendEvent } from '../../competition/api/eventsApi';

const defaultForm = {
  title: '', description: '', location: '', event_type: 'GENERAL' as eventsApi.EventType,
  start_datetime: '', end_datetime: '', registration_deadline: '',
  visibility: 'PUBLIC' as eventsApi.Visibility,
  registration_enabled: false, registration_mode: 'PUBLIC' as eventsApi.RegistrationMode,
  payment_required: false, registration_fee: '', capacity: '', youtube_live_url: '',
  branch: '',
};

const EVENT_TYPE_OPTIONS = [
  { value: 'GENERAL' as const, label: 'General', icon: Calendar, desc: 'Standard event listing', color: 'text-slate-600', bg: 'bg-slate-50' },
  { value: 'TOURNAMENT' as const, label: 'Tournament', icon: Trophy, desc: 'Competition with teams & matches', color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'WORKSHOP' as const, label: 'Workshop', icon: GraduationCap, desc: 'Educational session with instructor', color: 'text-cyan-600', bg: 'bg-cyan-50' },
];

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC' as const, label: 'Public', icon: Globe, desc: 'Visible to everyone on the website' },
  { value: 'PRIVATE' as const, label: 'Private', icon: Lock, desc: 'Only visible to staff and registered users' },
];

const REGISTRATION_MODES = [
  { value: 'PUBLIC' as const, label: 'Public', desc: 'Anyone can register' },
  { value: 'STUDENT' as const, label: 'Student', desc: 'Only registered students' },
  { value: 'SUBPROGRAM_STUDENT' as const, label: 'Sub-Program', desc: 'Students in specific sub-programs' },
];

interface EventManagerProps {
  onNavigate?: (section: string) => void;
}

export default function EventManager({ onNavigate }: EventManagerProps) {
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [branches, setBranches] = useState<any[]>([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      eventsApi.adminGetEvents(),
      import('../../user/shared/api/adminApi').then(m => m.branchesApi.list() as Promise<any[]>).catch(() => []),
    ]).then(([evts, brs]) => {
      setEvents(Array.isArray(evts) ? evts : []);
      setBranches(Array.isArray(brs) ? brs : []);
    }).catch(err => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setErrors({});
    setError(null);
    setShowForm(true);
  };

  const openEdit = (e: BackendEvent) => {
    setEditingId(e.id);
    setErrors({});
    setError(null);
    setForm({
      title: e.title || '',
      description: e.description || '',
      location: e.location || '',
      event_type: e.event_type || 'GENERAL',
      start_datetime: e.start_datetime?.slice(0, 16) || '',
      end_datetime: e.end_datetime?.slice(0, 16) || '',
      registration_deadline: e.registration_deadline?.slice(0, 16) || '',
      visibility: e.visibility || 'PUBLIC',
      registration_enabled: e.registration_enabled || false,
      registration_mode: e.registration_mode || 'PUBLIC',
      payment_required: e.payment_required || false,
      registration_fee: e.registration_fee || '',
      capacity: e.capacity?.toString() || '',
      youtube_live_url: e.youtube_live_url || '',
      branch: e.branch || '',
    });
    setShowForm(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.start_datetime) errs.start_datetime = 'Start date is required';
    if (!form.end_datetime) errs.end_datetime = 'End date is required';
    if (form.start_datetime && form.end_datetime && form.start_datetime >= form.end_datetime) {
      errs.end_datetime = 'End date must be after start date';
    }
    if (!form.location.trim()) errs.location = 'Location is required';
    if (form.youtube_live_url && !form.youtube_live_url.startsWith('http')) {
      errs.youtube_live_url = 'Must be a valid URL starting with http';
    }
    if (form.capacity && (parseInt(form.capacity) < 1)) {
      errs.capacity = 'Capacity must be at least 1';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        event_type: form.event_type,
        start_datetime: form.start_datetime,
        end_datetime: form.end_datetime,
        registration_deadline: form.registration_deadline || null,
        visibility: form.visibility,
        registration_enabled: form.registration_enabled,
        registration_mode: form.registration_enabled ? form.registration_mode : null,
        payment_required: form.registration_enabled ? form.payment_required : false,
        registration_fee: form.registration_enabled && form.payment_required && form.registration_fee ? form.registration_fee : null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        youtube_live_url: form.youtube_live_url.trim() || null,
        branch: form.branch || null,
      };
      if (editingId) {
        await eventsApi.adminUpdateEvent(editingId, payload as Partial<BackendEvent>);
      } else {
        await eventsApi.adminCreateEvent(payload as Partial<BackendEvent>);
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event? This action cannot be undone.')) return;
    try {
      await eventsApi.adminDeleteEvent(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const target = events.find(e => e.id === id);
      if (!target) return;
      if (target.status === 'PUBLISHED') {
        await eventsApi.adminUnpublishEvent(id);
      } else {
        await eventsApi.adminPublishEvent(id);
      }
      load();
    } catch (err: any) { setError(err.message); }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      if (current) {
        await eventsApi.adminDeactivateEvent(id);
      } else {
        await eventsApi.adminActivateEvent(id);
      }
      load();
    } catch (err: any) { setError(err.message); }
  };

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      DRAFT: 'bg-amber-100 text-amber-700 border-amber-200',
      PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
      COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return map[s] || 'bg-slate-100 text-slate-600';
  };

  const typeBadge = (t: string) => {
    const map: Record<string, string> = {
      GENERAL: 'bg-slate-100 text-slate-600',
      TOURNAMENT: 'bg-purple-100 text-purple-700',
      WORKSHOP: 'bg-cyan-100 text-cyan-700',
    };
    return map[t] || 'bg-slate-100 text-slate-600';
  };

  const stats = useMemo(() => ({
    total: events.length,
    published: events.filter(e => e.status === 'PUBLISHED').length,
    tournaments: events.filter(e => e.event_type === 'TOURNAMENT').length,
    upcoming: events.filter(e => new Date(e.start_datetime) > new Date()).length,
  }), [events]);

  const formattedDate = (dt: string) => {
    try { return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return dt?.slice(0, 10) || '—'; }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-colors ${
      errors[field] ? 'border-red-400 focus:border-red-500' : 'border-brand-border focus:border-brand-red'
    }`;

  const renderTypeCard = (opt: typeof EVENT_TYPE_OPTIONS[0]) => {
    const Icon = opt.icon;
    const isActive = form.event_type === opt.value;
    return (
      <button key={opt.value} type="button" onClick={() => setForm(p => ({ ...p, event_type: opt.value }))}
        className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
          isActive ? 'border-brand-red bg-brand-red/5' : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl ${opt.bg} flex items-center justify-center shrink-0 ${isActive ? 'ring-2 ring-brand-red/20' : ''}`}>
          <Icon className={`w-5 h-5 ${opt.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${isActive ? 'text-brand-red' : 'text-slate-900'}`}>{opt.label}</span>
            {isActive && <CheckCircle className="w-4 h-4 text-brand-red" />}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
        </div>
      </button>
    );
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-red" /></div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-1">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Dashboard stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: stats.total, icon: Calendar, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Published', value: stats.published, icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tournaments', value: stats.tournaments, icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => {
          const SIcon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-all"
            >
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}><SIcon className={`w-4 h-4 ${stat.color}`} /></div>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-lg text-slate-900">Events</h3>
          <p className="text-xs text-slate-500 mt-0.5">{stats.total} events · {stats.published} published · {stats.upcoming} upcoming</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search events..."
              className="w-48 pl-9 pr-3 py-2 bg-white border border-brand-border rounded-xl text-xs focus:outline-none focus:border-brand-red" />
          </div>
          <button onClick={openCreate}
            className="bg-gradient-to-r from-brand-red to-brand-red-dark text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-brand-red/25 hover:shadow-xl active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> New Event
          </button>
        </div>
      </div>

      {/* Events table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-brand-border rounded-2xl">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-600">No events found</p>
          <button onClick={openCreate} className="mt-3 text-xs font-bold text-brand-red hover:underline">Create your first event</button>
        </div>
      ) : (
        <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-brand-border">
                  <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Active</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((e, i) => (
                  <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-red/10 to-brand-red/5 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-brand-red" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-slate-900 block truncate">{e.title}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {e.location}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${typeBadge(e.event_type)}`}>{e.event_type}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formattedDate(e.start_datetime)}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span>{formattedDate(e.end_datetime)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(e.status)}`}>{e.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleActive(e.id, e.is_active)}
                        className={`p-1.5 rounded-lg transition-colors ${e.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                        {e.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        <button onClick={() => window.open(`/event/${e.id}`, '_blank')} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10" title="View"><Eye className="w-3.5 h-3.5" /></button>
                        {e.event_type === 'TOURNAMENT' && (
                          <>
                            <button onClick={() => onNavigate?.('tournaments')} className="p-1.5 rounded-lg text-purple-500 hover:bg-purple-50" title="Tournament"><Trophy className="w-3.5 h-3.5" /></button>
                            <button onClick={() => onNavigate?.('tournament-teams')} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50" title="Teams"><Users className="w-3.5 h-3.5" /></button>
                            <button onClick={() => onNavigate?.('matches')} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50" title="Matches"><Swords className="w-3.5 h-3.5" /></button>
                          </>
                        )}
                        {e.event_type === 'WORKSHOP' && (
                          <button onClick={() => onNavigate?.('workshops')} className="p-1.5 rounded-lg text-cyan-500 hover:bg-cyan-50" title="Workshop"><GraduationCap className="w-3.5 h-3.5" /></button>
                        )}
                        <button onClick={() => onNavigate?.('event-registrations')} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10" title="Registrations"><UserPlus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handlePublish(e.id)}
                          className={`p-1.5 rounded-lg transition-colors ${e.status === 'PUBLISHED' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                          title={e.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}><Send className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (!saving) setShowForm(false); }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-red/10 to-brand-red/5 flex items-center justify-center">
                    {editingId ? <Edit3 className="w-5 h-5 text-brand-red" /> : <Sparkles className="w-5 h-5 text-brand-red" />}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">{editingId ? 'Edit Event' : 'Create Event'}</h3>
                    <p className="text-xs text-slate-500">{editingId ? 'Update event details' : 'Set up a new event, tournament, or workshop'}</p>
                  </div>
                </div>
                <button onClick={() => { if (!saving) setShowForm(false); }} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {/* Section: Event Type */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-md bg-brand-red/10 flex items-center justify-center"><Tag className="w-3 h-3 text-brand-red" /></div>
                    <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">Event Type</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {EVENT_TYPE_OPTIONS.map(renderTypeCard)}
                  </div>
                </div>

                {/* Section: Basic Info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-md bg-brand-red/10 flex items-center justify-center"><FileText className="w-3 h-3 text-brand-red" /></div>
                    <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">Basic Information</h4>
                  </div>
                  <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Title *</label>
                      <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. VEX Robotics Competition 2026"
                        className={inputClass('title')} />
                      {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Description</label>
                      <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        rows={3} placeholder="Describe the event, agenda, requirements..."
                        className={inputClass('description')} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Branch</label>
                        <select value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-red">
                          <option value="">All Branches (Global)</option>
                          {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Location *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                            placeholder="e.g. Addis Ababa, Ethiopia"
                            className={`${inputClass('location')} pl-10`} />
                        </div>
                        {errors.location && <p className="text-[10px] text-red-500 mt-1">{errors.location}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Schedule */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-md bg-brand-red/10 flex items-center justify-center"><Clock className="w-3 h-3 text-brand-red" /></div>
                    <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">Schedule</h4>
                  </div>
                  <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Start Date & Time *</label>
                        <input type="datetime-local" value={form.start_datetime}
                          onChange={e => setForm(p => ({ ...p, start_datetime: e.target.value }))}
                          className={inputClass('start_datetime')} />
                        {errors.start_datetime && <p className="text-[10px] text-red-500 mt-1">{errors.start_datetime}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">End Date & Time *</label>
                        <input type="datetime-local" value={form.end_datetime}
                          onChange={e => setForm(p => ({ ...p, end_datetime: e.target.value }))}
                          className={inputClass('end_datetime')} />
                        {errors.end_datetime && <p className="text-[10px] text-red-500 mt-1">{errors.end_datetime}</p>}
                      </div>
                    </div>
                    {form.start_datetime && form.end_datetime && form.start_datetime < form.end_datetime && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white rounded-lg px-3 py-2 border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        Duration: {Math.ceil((new Date(form.end_datetime).getTime() - new Date(form.start_datetime).getTime()) / (1000 * 60 * 60))} hours
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Registration */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-md bg-brand-red/10 flex items-center justify-center"><Users className="w-3 h-3 text-brand-red" /></div>
                    <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">Registration</h4>
                  </div>
                  <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 space-y-4">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <div className={`w-9 h-5 rounded-full transition-colors relative ${form.registration_enabled ? 'bg-brand-red' : 'bg-slate-300'}`}
                          onClick={() => setForm(p => ({ ...p, registration_enabled: !p.registration_enabled }))}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${form.registration_enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">Enable Registration</span>
                      </label>
                      <label className={`flex items-center gap-2.5 cursor-pointer select-none ${!form.registration_enabled ? 'opacity-40 pointer-events-none' : ''}`}>
                        <div className={`w-9 h-5 rounded-full transition-colors relative ${form.payment_required ? 'bg-brand-red' : 'bg-slate-300'}`}
                          onClick={() => setForm(p => ({ ...p, payment_required: !p.payment_required }))}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${form.payment_required ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">Payment Required</span>
                      </label>
                    </div>

                    {form.registration_enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Registration Mode</label>
                          <select value={form.registration_mode}
                            onChange={e => setForm(p => ({ ...p, registration_mode: e.target.value as eventsApi.RegistrationMode }))}
                            className="w-full px-4 py-2.5 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-red">
                            {REGISTRATION_MODES.map(m => <option key={m.value} value={m.value}>{m.label} — {m.desc}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Registration Deadline</label>
                          <input type="datetime-local" value={form.registration_deadline}
                            onChange={e => setForm(p => ({ ...p, registration_deadline: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-red" />
                        </div>
                        {form.payment_required && (
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Registration Fee</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input type="number" value={form.registration_fee}
                                onChange={e => setForm(p => ({ ...p, registration_fee: e.target.value }))}
                                placeholder="0.00" className="w-full pl-9 pr-4 py-2.5 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-red" />
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Capacity</label>
                          <input type="number" value={form.capacity}
                            onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                            placeholder="Unlimited" className={inputClass('capacity')} />
                          {errors.capacity && <p className="text-[10px] text-red-500 mt-1">{errors.capacity}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Advanced */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-md bg-brand-red/10 flex items-center justify-center"><Settings className="w-3 h-3 text-brand-red" /></div>
                    <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">Advanced Settings</h4>
                  </div>
                  <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Visibility</label>
                        <div className="grid grid-cols-2 gap-2">
                          {VISIBILITY_OPTIONS.map(opt => {
                            const Icon = opt.icon;
                            const isActive = form.visibility === opt.value;
                            return (
                              <button key={opt.value} type="button" onClick={() => setForm(p => ({ ...p, visibility: opt.value }))}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                                  isActive ? 'border-brand-red bg-brand-red/5 text-brand-red' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">YouTube Live URL</label>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input value={form.youtube_live_url}
                            onChange={e => setForm(p => ({ ...p, youtube_live_url: e.target.value }))}
                            placeholder="https://youtube.com/watch?v=..."
                            className={`${inputClass('youtube_live_url')} pl-10`} />
                        </div>
                        {errors.youtube_live_url && <p className="text-[10px] text-red-500 mt-1">{errors.youtube_live_url}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview card */}
                {form.title && (
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preview</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-red/10 to-brand-red/5 flex items-center justify-center shrink-0">
                        {form.event_type === 'TOURNAMENT' ? <Trophy className="w-5 h-5 text-purple-600" /> :
                         form.event_type === 'WORKSHOP' ? <GraduationCap className="w-5 h-5 text-cyan-600" /> :
                         <Calendar className="w-5 h-5 text-slate-600" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{form.title}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {form.location || 'Location TBD'}
                          <span className="mx-1">·</span>
                          <span>{EVENT_TYPE_OPTIONS.find(o => o.value === form.event_type)?.label}</span>
                        </p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">DRAFT</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-brand-border">
                <button onClick={() => setShowForm(false)} disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !form.title || !form.start_datetime || !form.end_datetime}
                  className="px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-brand-red to-brand-red-dark rounded-xl shadow-lg shadow-brand-red/25 hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 min-w-[120px] justify-center">
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : editingId ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
