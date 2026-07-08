import React, { useState } from 'react';
import { Search, Calendar, ChevronDown, Download, Filter, CheckCircle, Clock, XCircle, AlertCircle, Eye, X } from 'lucide-react';

const MOCK_REGISTRATIONS = [
  { id: 'REG-001', program: 'VEX Robotics Competition', level: 'Advanced', date: '2026-09-15', fee: 2500, status: 'confirmed', type: 'Competition' },
  { id: 'REG-002', program: 'Drone Pilot Fundamentals', level: 'Intermediate', date: '2026-10-01', fee: 1800, status: 'pending', type: 'Workshop' },
  { id: 'REG-003', program: 'AI & Machine Learning', level: 'Advanced', date: '2026-08-20', fee: 3200, status: 'confirmed', type: 'Course' },
  { id: 'REG-004', program: 'IoT Smart Systems', level: 'Intermediate', date: '2026-11-05', fee: 1500, status: 'waitlist', type: 'Course' },
  { id: 'REG-005', program: 'Summer Robotics Camp', level: 'Beginner', date: '2026-07-10', fee: 4000, status: 'cancelled', type: 'Camp' },
];

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  waitlist: 'bg-blue-100 text-blue-600',
  cancelled: 'bg-red-100 text-red-600',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  confirmed: CheckCircle,
  pending: Clock,
  waitlist: AlertCircle,
  cancelled: XCircle,
};

export default function MyRegistrations() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [registrations, setRegistrations] = useState(MOCK_REGISTRATIONS);

  const filtered = registrations.filter(r => {
    const matchSearch = r.program.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const cancelRegistration = (id: string) => {
    setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r));
  };

  const totalFee = registrations.filter(r => r.status === 'confirmed' || r.status === 'pending').reduce((sum, r) => sum + r.fee, 0);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Registrations', value: registrations.length.toString(), color: 'text-brand-blue' },
          { label: 'Confirmed', value: registrations.filter(r => r.status === 'confirmed').length.toString(), color: 'text-emerald-600' },
          { label: 'Pending', value: registrations.filter(r => r.status === 'pending').length.toString(), color: 'text-amber-600' },
          { label: 'Total Fees', value: `ETB ${totalFee.toLocaleString()}`, color: 'text-brand-red' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-brand-border rounded-xl px-4 py-3">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`font-black text-lg mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-brand-border rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-brand-border">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search registrations..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-brand-border rounded-lg text-xs text-slate-700 focus:outline-none focus:border-brand-red"
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-brand-border rounded-lg text-xs text-slate-700 focus:outline-none focus:border-brand-red"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="waitlist">Waitlist</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="p-1.5 bg-slate-50 border border-brand-border rounded-lg text-slate-400 hover:text-brand-red transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-brand-border">
                <th className="text-left px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Program</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Level</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Fee (ETB)</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg, i) => {
                const StatusIcon = STATUS_ICONS[reg.status];
                return (
                  <tr key={reg.id} className="border-b border-brand-border last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-[11px] font-mono text-slate-500">{reg.id}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{reg.program}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{reg.type}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{reg.level}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {reg.date}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-900 text-right">{reg.fee.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[reg.status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50" title="View details"><Eye className="w-3.5 h-3.5" /></button>
                        {reg.status !== 'cancelled' && (
                          <button onClick={() => cancelRegistration(reg.id)} className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" title="Cancel registration"><X className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-xs text-slate-400">No registrations found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
