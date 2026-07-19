import React, { useEffect, useState } from 'react';
import { BarChart3, Save, Trash2, Users, BookOpen, Trophy, Globe } from 'lucide-react';
import { api, type HomepageStatistic } from '../api/cmsApi';
import { formatStatCount } from '@/domains/learning/programs/ui/Hero';
import type { Toast } from './CmsDashboard';

interface Props { addToast: (msg: string, type: 'success' | 'error') => void }

const emptyForm = (): Partial<HomepageStatistic> => ({
  future_engineers: 0,
  programs: 0,
  competitions: 0,
  mission_current: 0,
  mission_target: 0,
});

export default function HomepageStatsManager({ addToast }: Props) {
  const [items, setItems] = useState<HomepageStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<HomepageStatistic>>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await api.getAll<HomepageStatistic>('homepage/statistics');
      setItems(rows);
      if (rows[0]) setForm({ ...rows[0] });
      else setForm(emptyForm());
    } catch {
      setItems([]);
      addToast('Failed to load homepage stats', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setNum = (key: keyof HomepageStatistic, raw: string) => {
    const n = Number(raw.replace(/,/g, ''));
    setForm(prev => ({ ...prev, [key]: Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0 }));
  };

  const save = async () => {
    setSaving(true);
    try {
      if (form.id) {
        await api.update('homepage/statistics', form.id, form);
        addToast('Homepage stats updated', 'success');
      } else {
        await api.create('homepage/statistics', form);
        addToast('Homepage stats created', 'success');
      }
      await load();
    } catch (e: any) {
      addToast(e?.message || 'Save failed', 'error');
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this homepage stats record?')) return;
    try {
      await api.delete('homepage/statistics', id);
      addToast('Deleted', 'success');
      await load();
    } catch {
      addToast('Delete failed', 'error');
    }
  };

  const pct = form.mission_target
    ? Math.round(((form.mission_current ?? 0) / form.mission_target) * 10000) / 100
    : 0;

  const preview = [
    { label: 'Future Engineers', value: formatStatCount(form.future_engineers ?? 0), icon: Users },
    { label: 'Programs', value: formatStatCount(form.programs ?? 0), icon: BookOpen },
    { label: 'Competitions', value: formatStatCount(form.competitions ?? 0), icon: Trophy },
    { label: 'Mission Progress', value: `${pct}%`, icon: Globe },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          <h2 className="font-bold text-slate-800">Homepage Statistics</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
            Public homepage
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-400">Loading...</div>
      ) : (
        <div className="p-4 space-y-5">
          <div className="rounded-2xl bg-slate-950 text-white p-5 border border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Live preview</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {preview.map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center">
                  <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white/80" />
                  </div>
                  <p className="text-xl font-black tracking-tight">{value}</p>
                  <p className="text-[11px] text-white/55 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex justify-between text-[11px] text-white/45 font-mono mb-1">
                <span>Mission Progress</span>
                <span>{(form.mission_current ?? 0).toLocaleString()} / {(form.mission_target ?? 0).toLocaleString()}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <p className="text-[10px] text-white/30 text-right mt-1">{pct}% of National Goal</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <NumField label="Future Engineers" value={form.future_engineers ?? 0} onChange={v => setNum('future_engineers', v)} />
            <NumField label="Programs" value={form.programs ?? 0} onChange={v => setNum('programs', v)} />
            <NumField label="Competitions" value={form.competitions ?? 0} onChange={v => setNum('competitions', v)} />
            <NumField label="Mission Current" value={form.mission_current ?? 0} onChange={v => setNum('mission_current', v)} />
            <NumField label="Mission Target" value={form.mission_target ?? 0} onChange={v => setNum('mission_target', v)} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 p-4 border-t border-slate-200">
        <div className="text-xs text-slate-400">
          {items.length > 1 ? `${items.length} records — newest is used as current` : form.id ? 'Editing current record' : 'No record yet — create one'}
        </div>
        <div className="flex gap-2">
          {form.id && (
            <button onClick={() => remove(form.id!)} className="px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
          <button onClick={save} disabled={saving || loading}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : form.id ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{label}</label>
      <input type="number" min={0} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
    </div>
  );
}
