import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit3, Trash2, Search, X, Filter, ChevronDown, Handshake,
  Building, Globe, Phone, Mail, Calendar, DollarSign, Eye, Target,
  RefreshCw, Star, CheckCircle, XCircle, Users
} from 'lucide-react';
import { PartnerTier, PartnerType, SponsorPartner } from '@/src/shared/types';

const TIERS: { key: PartnerTier; label: string; color: string; bg: string; icon: string }[] = [
  { key: 'platinum', label: 'Platinum', color: 'text-slate-800', bg: 'bg-slate-100', icon: '★★★★★' },
  { key: 'gold', label: 'Gold', color: 'text-amber-700', bg: 'bg-amber-50', icon: '★★★★' },
  { key: 'silver', label: 'Silver', color: 'text-slate-600', bg: 'bg-slate-100', icon: '★★★' },
  { key: 'bronze', label: 'Bronze', color: 'text-orange-700', bg: 'bg-orange-50', icon: '★★' },
  { key: 'community', label: 'Community', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: '★' },
];

const TYPES: { key: PartnerType; label: string; icon: React.ElementType }[] = [
  { key: 'financial', label: 'Financial Sponsor', icon: DollarSign },
  { key: 'in-kind', label: 'In-Kind Donor', icon: Building },
  { key: 'media', label: 'Media Partner', icon: Globe },
  { key: 'educational', label: 'Educational Partner', icon: Users },
  { key: 'venue', label: 'Venue Partner', icon: Building },
];

const SPONSOR_LOGOS = [
  'https://images.unsplash.com/photo-1614680376593-902f74a9cb0d?w=150&q=80',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&q=80',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=150&q=80',
  'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=150&q=80',
];

const INITIAL_SPONSORS: SponsorPartner[] = [
  { id: '1', name: 'MINT', logo: SPONSOR_LOGOS[0], tier: 'platinum', type: 'financial', contactName: 'Amanuel D.', contactEmail: 'amanuel@mint.et', contactPhone: '+251-911-111-111', website: 'https://mint.et', contractStart: '2026-01-01', contractEnd: '2026-12-31', contractValue: 500000, active: true, description: 'Ministry of Innovation and Technology — lead sponsor for all VEX competitions and STEM programs.', impressions: 125000, reach: 450000, notes: 'Strategic government partner', joinedDate: '2025-06-01' },
  { id: '2', name: 'VEX Robotics', logo: SPONSOR_LOGOS[1], tier: 'platinum', type: 'educational', contactName: 'Sarah L.', contactEmail: 'sarah@vex.com', contactPhone: '+1-800-555-0100', website: 'https://vexrobotics.com', contractStart: '2026-01-01', contractEnd: '2027-01-01', contractValue: 750000, active: true, description: 'Official VEX robotics platform provider — curriculum, kits, and competition support.', impressions: 98000, reach: 320000, notes: 'Global franchise partner', joinedDate: '2025-01-15' },
  { id: '3', name: 'Addis University', logo: SPONSOR_LOGOS[2], tier: 'gold', type: 'educational', contactName: 'Dr. Tadesse M.', contactEmail: 'tadesse@addisuniversity.edu.et', contactPhone: '+251-911-222-333', website: 'https://addisuniversity.edu.et', contractStart: '2026-03-01', contractEnd: '2027-03-01', contractValue: 250000, active: true, description: 'Venue and academic partner — hosting robotics labs and research collaboration.', impressions: 45000, reach: 180000, notes: 'Renewed annually', joinedDate: '2025-09-01' },
  { id: '4', name: 'Entov AI', logo: SPONSOR_LOGOS[3], tier: 'silver', type: 'financial', contactName: 'Biruk T.', contactEmail: 'biruk@entov.ai', contactPhone: '+251-911-444-555', website: 'https://entov.ai', contractStart: '2026-02-01', contractEnd: '2026-08-01', contractValue: 120000, active: false, description: 'AI and robotics software sponsor — providing simulation tools and cloud compute credits.', impressions: 22000, reach: 95000, notes: 'Trial period ended', joinedDate: '2026-02-01' },
  { id: '5', name: 'Fana Broadcasting', logo: SPONSOR_LOGOS[4], tier: 'silver', type: 'media', contactName: 'Meron K.', contactEmail: 'meron@fana.et', contactPhone: '+251-911-666-777', website: 'https://fana.et', contractStart: '2026-04-01', contractEnd: '2026-10-01', contractValue: 80000, active: true, description: 'Media coverage partner — TV, radio, and digital promotion for robotics events.', impressions: 250000, reach: 1200000, notes: 'High impression value', joinedDate: '2026-04-01' },
  { id: '6', name: 'Ethio Telecom', logo: SPONSOR_LOGOS[5], tier: 'bronze', type: 'in-kind', contactName: 'Henok A.', contactEmail: 'henok@ethiotelecom.et', contactPhone: '+251-911-888-999', website: 'https://ethiotelecom.et', contractStart: '2026-05-01', contractEnd: '2026-12-31', contractValue: 50000, active: true, description: 'Connectivity and infrastructure sponsor — internet and server hosting for digital platforms.', impressions: 15000, reach: 60000, notes: '', joinedDate: '2026-05-01' },
];

export default function SponsorManagement() {
  const [sponsors, setSponsors] = useState<SponsorPartner[]>(INITIAL_SPONSORS);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<PartnerTier | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<PartnerType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SponsorPartner | null>(null);
  const [form, setForm] = useState<Partial<SponsorPartner>>({});

  const filtered = sponsors.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.contactName.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || s.tier === tierFilter;
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    return matchesSearch && matchesTier && matchesType;
  });

  const activeCount = sponsors.filter(s => s.active).length;
  const totalValue = sponsors.reduce((sum, s) => sum + (s.active ? s.contractValue : 0), 0);
  const totalImpressions = sponsors.reduce((sum, s) => sum + s.impressions, 0);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', logo: SPONSOR_LOGOS[0], tier: 'silver', type: 'financial', contactName: '', contactEmail: '', contactPhone: '', website: '', contractStart: '', contractEnd: '', contractValue: 0, active: true, description: '', impressions: 0, reach: 0, notes: '', joinedDate: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (s: SponsorPartner) => {
    setEditing(s);
    setForm({ ...s });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editing) {
      setSponsors(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } as SponsorPartner : s));
    } else {
      const newSponsor: SponsorPartner = {
        ...form as SponsorPartner,
        id: Date.now().toString(),
        joinedDate: form.joinedDate || new Date().toISOString().split('T')[0],
      };
      setSponsors(prev => [...prev, newSponsor]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Remove this sponsor/partner?')) {
      setSponsors(prev => prev.filter(s => s.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setSponsors(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const tierInfo = (tier: PartnerTier) => TIERS.find(t => t.key === tier)!;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Partners', value: sponsors.length, icon: Handshake, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Active Now', value: activeCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Contract Value', value: `${(totalValue / 1000).toFixed(0)}K ETB`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Impressions', value: `${(totalImpressions / 1000).toFixed(0)}K`, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
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
              <input type="text" placeholder="Search partners..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-400 w-[180px]"
              />
            </div>
            <select value={tierFilter} onChange={e => setTierFilter(e.target.value as PartnerTier | 'all')}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-400"
            >
              <option value="all">All Tiers</option>
              {TIERS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as PartnerType | 'all')}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-400"
            >
              <option value="all">All Types</option>
              {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <button onClick={openAdd}
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Partner
          </button>
        </div>

        <div className="p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Handshake className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No partners match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((s, i) => {
                const tier = tierInfo(s.tier);
                const TypeIcon = TYPES.find(t => t.key === s.type)?.icon || Building;
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="group relative bg-slate-50 rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <img src={s.logo} alt={s.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{s.name}</h4>
                          <div className={`w-2 h-2 rounded-full shrink-0 ${s.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tier.color} ${tier.bg}`}>{tier.label}</span>
                          <TypeIcon className="w-3 h-3 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <DollarSign className="w-3 h-3 shrink-0" />
                        <span>{s.contractValue.toLocaleString()} ETB</span>
                        <span className="text-slate-300">·</span>
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{s.contractStart} → {s.contractEnd}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Eye className="w-3 h-3 shrink-0" />
                        <span>{s.impressions.toLocaleString()} impressions</span>
                        <span className="text-slate-300">·</span>
                        <Target className="w-3 h-3 shrink-0" />
                        <span>{s.reach.toLocaleString()} reach</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(s)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-all">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => toggleActive(s.id)}
                        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all ${s.active ? 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`}
                        title={s.active ? 'Deactivate' : 'Activate'}
                      >
                        {s.active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
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
                  <h3 className="font-bold text-lg text-slate-900">{editing ? 'Edit Partner' : 'New Partner'}</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Partner Name *</label>
                      <input type="text" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Tier</label>
                      <select value={form.tier || 'silver'} onChange={e => setForm({ ...form, tier: e.target.value as PartnerTier })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-400"
                      >
                        {TIERS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Partner Type</label>
                      <select value={form.type || 'financial'} onChange={e => setForm({ ...form, type: e.target.value as PartnerType })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-400"
                      >
                        {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Logo</label>
                      <div className="flex gap-2 flex-wrap">
                        {SPONSOR_LOGOS.map((url, i) => (
                          <button key={i} onClick={() => setForm({ ...form, logo: url })}
                            className={`w-10 h-10 rounded-lg border-2 overflow-hidden transition-all ${form.logo === url ? 'border-sky-500 ring-2 ring-sky-200' : 'border-slate-200 hover:border-slate-300'}`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Contact Name</label>
                      <input type="text" value={form.contactName || ''} onChange={e => setForm({ ...form, contactName: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Contact Email</label>
                      <input type="email" value={form.contactEmail || ''} onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Contact Phone</label>
                      <input type="text" value={form.contactPhone || ''} onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Website</label>
                      <input type="url" value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Contract Start</label>
                      <input type="date" value={form.contractStart || ''} onChange={e => setForm({ ...form, contractStart: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Contract End</label>
                      <input type="date" value={form.contractEnd || ''} onChange={e => setForm({ ...form, contractEnd: e.target.value })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Contract Value (ETB)</label>
                      <input type="number" value={form.contractValue || 0} onChange={e => setForm({ ...form, contractValue: Number(e.target.value) })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Status</label>
                      <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={form.active ?? true} onChange={e => setForm({ ...form, active: e.target.checked })} className="rounded" />
                        <span className="text-sm text-slate-700">{form.active ? 'Active' : 'Inactive'}</span>
                      </label>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Impressions</label>
                      <input type="number" value={form.impressions || 0} onChange={e => setForm({ ...form, impressions: Number(e.target.value) })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Reach</label>
                      <input type="number" value={form.reach || 0} onChange={e => setForm({ ...form, reach: Number(e.target.value) })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Description</label>
                    <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400 resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Notes</label>
                    <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-sky-400 resize-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
                  <button onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button onClick={handleSave}
                    className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5">
                    {editing ? 'Update Partner' : 'Add Partner'}
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
