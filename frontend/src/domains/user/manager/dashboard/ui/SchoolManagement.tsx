import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit3, Trash2, Search, X, Building, MapPin, Phone, Mail,
  Users, BookOpen, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { SchoolPartner } from '@/src/shared/types';

const SCHOOL_LOGOS = [
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&q=80',
  'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=150&q=80',
  'https://images.unsplash.com/photo-1562774053-701939374585?w=150&q=80',
  'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?w=150&q=80',
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&q=80',
];

const INITIAL_SCHOOLS: SchoolPartner[] = [
  { id: 's1', name: 'Bole Preparatory School', logo: SCHOOL_LOGOS[0], location: 'Bole Sub-City, Addis Ababa', contactName: 'Tigist H.', contactEmail: 'tigist@boleprep.edu.et', contactPhone: '+251-911-000-001', partnershipType: 'tier-1', programs: ['VEX IQ', 'STEM Foundations', 'Arduino'], studentCount: 120, activeSince: '2024-09-01', status: 'active', notes: 'Flagship partner school — full VEX lab installed' },
  { id: 's2', name: 'Lideta Catholic Cathedral School', logo: SCHOOL_LOGOS[1], location: 'Lideta, Addis Ababa', contactName: 'Br. Tesfaye', contactEmail: 'tesfaye@lidetacatholic.edu.et', contactPhone: '+251-911-000-002', partnershipType: 'tier-1', programs: ['VEX V5', 'Enjoy AI', 'STEM Foundations'], studentCount: 85, activeSince: '2024-10-01', status: 'active', notes: 'VEX V5 competitive team in development' },
  { id: 's3', name: 'Addis Ababa Institute of Technology', logo: SCHOOL_LOGOS[2], location: 'Gulele, Addis Ababa', contactName: 'Dr. Henok M.', contactEmail: 'henok@aait.edu.et', contactPhone: '+251-911-000-003', partnershipType: 'tier-2', programs: ['Arduino', 'STEM Foundations'], studentCount: 45, activeSince: '2025-01-15', status: 'active', notes: 'University partnership — lab consultancy' },
  { id: 's4', name: 'St. Joseph\'s School', logo: SCHOOL_LOGOS[3], location: 'Saris, Addis Ababa', contactName: 'Sr. Mekdes', contactEmail: 'mekdes@stjosephs.edu.et', contactPhone: '+251-911-000-004', partnershipType: 'tier-2', programs: ['VEX IQ', 'Enjoy AI'], studentCount: 60, activeSince: '2025-02-01', status: 'active', notes: '' },
  { id: 's5', name: 'Mekelle STEM Academy', logo: SCHOOL_LOGOS[4], location: 'Mekelle, Tigray', contactName: 'Amanuel G.', contactEmail: 'amanuel@mekellestem.edu.et', contactPhone: '+251-911-000-005', partnershipType: 'tier-3', programs: ['STEM Foundations'], studentCount: 30, activeSince: '2025-06-01', status: 'pending', notes: 'Awaiting lab equipment shipment' },
];

const PARTNERSHIP_TYPES = [
  { key: 'tier-1', label: 'Tier 1 — Full Partner', desc: 'Full lab, all programs', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'tier-2', label: 'Tier 2 — Standard', desc: 'Limited programs, shared lab', color: 'text-sky-600', bg: 'bg-sky-50' },
  { key: 'tier-3', label: 'Tier 3 — Basic', desc: 'STEM Foundations only', color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'affiliate', label: 'Affiliate', desc: 'Events & workshops access', color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function SchoolManagement() {
  const [schools, setSchools] = useState<SchoolPartner[]>(INITIAL_SCHOOLS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SchoolPartner | null>(null);
  const [form, setForm] = useState<Partial<SchoolPartner>>({});

  const filtered = schools.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase()) || s.contactName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeSchools = schools.filter(s => s.status === 'active').length;
  const totalStudents = schools.reduce((sum, s) => sum + s.studentCount, 0);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', logo: SCHOOL_LOGOS[0], location: '', contactName: '', contactEmail: '', contactPhone: '', partnershipType: 'tier-2', programs: [], studentCount: 0, activeSince: new Date().toISOString().split('T')[0], status: 'pending', notes: '' });
    setShowModal(true);
  };

  const openEdit = (s: SchoolPartner) => {
    setEditing(s);
    setForm({ ...s });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editing) {
      setSchools(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } as SchoolPartner : s));
    } else {
      setSchools(prev => [...prev, { ...form as SchoolPartner, id: Date.now().toString() }]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Remove this school partnership?')) setSchools(prev => prev.filter(s => s.id !== id));
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'inactive': return <XCircle className="w-3.5 h-3.5 text-slate-400" />;
      case 'pending': return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      default: return null;
    }
  };

  const allPrograms = ['VEX IQ', 'VEX V5', 'Enjoy AI', 'Arduino', 'STEM Foundations', 'Coding'];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Partner Schools', value: schools.length, icon: Building, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Active Schools', value: activeSchools, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Pending Approval', value: schools.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => {
          const SIcon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}><SIcon className={`w-4 h-4 ${stat.color}`} /></div>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search schools..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-400 w-[180px]"
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <button onClick={openAdd}
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add School
          </button>
        </div>

        <div className="p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No schools match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((s, i) => {
                const pt = PARTNERSHIP_TYPES.find(t => t.key === s.partnershipType)!;
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="group relative bg-slate-50 rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white border border-slate-200">
                        <img src={s.logo} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{s.name}</h4>
                          {statusIcon(s.status)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{s.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pt.color} ${pt.bg}`}>{pt.label}</span>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users className="w-3 h-3 shrink-0" />
                        <span>{s.studentCount} students</span>
                        <span className="text-slate-300">·</span>
                        <BookOpen className="w-3 h-3 shrink-0" />
                        <span className="truncate">{s.programs.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span>{s.contactEmail}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(s)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-all">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleDelete(s.id)}
                        className="flex items-center justify-center p-1.5 rounded-lg border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <h3 className="font-bold text-lg text-slate-900">{editing ? 'Edit School' : 'Add School'}</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">School Name *</label>
                      <input type="text" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Location</label>
                      <input type="text" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Partnership Type</label>
                      <select value={form.partnershipType || 'tier-2'} onChange={e => setForm({ ...form, partnershipType: e.target.value as SchoolPartner['partnershipType'] })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-400">
                        {PARTNERSHIP_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Status</label>
                      <select value={form.status || 'pending'} onChange={e => setForm({ ...form, status: e.target.value as SchoolPartner['status'] })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-400">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Contact Name</label>
                      <input type="text" value={form.contactName || ''} onChange={e => setForm({ ...form, contactName: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Contact Email</label>
                      <input type="email" value={form.contactEmail || ''} onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Contact Phone</label>
                      <input type="text" value={form.contactPhone || ''} onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Student Count</label>
                      <input type="number" value={form.studentCount || 0} onChange={e => setForm({ ...form, studentCount: Number(e.target.value) })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600">Programs</label>
                      <div className="flex flex-wrap gap-2">
                        {allPrograms.map(p => (
                          <button key={p} onClick={() => {
                            const current = form.programs || [];
                            const updated = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
                            setForm({ ...form, programs: updated });
                          }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${(form.programs || []).includes(p) ? 'bg-sky-50 border-sky-300 text-sky-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}
                          >{p}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600">Logo</label>
                      <div className="flex gap-2">
                        {SCHOOL_LOGOS.map((url, i) => (
                          <button key={i} onClick={() => setForm({ ...form, logo: url })}
                            className={`w-10 h-10 rounded-lg border-2 overflow-hidden transition-all ${form.logo === url ? 'border-sky-500 ring-2 ring-sky-200' : 'border-slate-200 hover:border-slate-300'}`}
                          ><img src={url} alt="" className="w-full h-full object-cover" /></button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600">Notes</label>
                      <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button onClick={handleSave}
                    className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                    {editing ? 'Update' : 'Add School'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
