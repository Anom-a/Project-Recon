import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, PieChart, ArrowUpRight } from 'lucide-react';
import { MOCK_ANALYTICS } from '@/src/shared/constants/mock-data';

const d = MOCK_ANALYTICS;

export default function AnalyticsDashboard() {
  const maxRevenue = Math.max(...d.monthlyRevenue.map(m => m.amount));
  const maxEnroll = Math.max(...d.enrollmentTrend.map(m => m.count));
  const totalProgramStudents = d.programDistribution.reduce((a, b) => a + b.count, 0);

  return (
    <div className="flex flex-col gap-6">
      <div><h3 className="font-display font-bold text-xl text-slate-900">Business Analytics</h3><p className="text-xs text-slate-500 mt-1">Real-time platform performance metrics</p></div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {d.topMetrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
            <p className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">{m.label}</p>
            <p className="font-display font-extrabold text-2xl text-slate-900 mb-1">{m.value}</p>
            <div className={`flex items-center gap-1 text-xs font-semibold ${m.trend === 'up' ? 'text-emerald-500' : 'text-red-400'}`}>
              {m.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}{m.change}
              <span className="text-slate-400 font-normal ml-1">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#2563EB]" />Monthly Revenue</h4>
            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" />+23.6%</span>
          </div>
          <div className="flex items-end gap-3 h-44">
            {d.monthlyRevenue.map((m, i) => (
              <motion.div key={m.month} initial={{ height: 0 }} animate={{ height: `${(m.amount / maxRevenue) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-[#2563EB] to-blue-400 rounded-t-lg relative group cursor-pointer" style={{ height: '100%' }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-50 text-white text-[10px] font-mono font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {(m.amount / 1000).toFixed(0)}K ETB
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{m.month}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Enrollment Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" />Enrollment Trend</h4>
            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" />+32.1%</span>
          </div>
          <div className="flex items-end gap-3 h-44">
            {d.enrollmentTrend.map((m, i) => (
              <motion.div key={m.month} initial={{ height: 0 }} animate={{ height: `${(m.count / maxEnroll) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-lg relative group cursor-pointer" style={{ height: '100%' }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-50 text-white text-[10px] font-mono font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {m.count} students
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{m.month}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Program Distribution */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6">
          <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2 mb-5"><PieChart className="w-4 h-4 text-purple-500" />Program Distribution</h4>
          <div className="space-y-3">
            {d.programDistribution.map((p, i) => (
              <motion.div key={p.program} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">{p.program}</span><span className="font-mono text-slate-500">{p.count} students</span></div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(p.count / totalProgramStudents) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="h-full rounded-full" style={{ backgroundColor: p.color }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2"><DollarSign className="w-4 h-4 text-amber-500" />Recent Transactions</h4></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-slate-50">
                {['Student', 'Type', 'Amount', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-4 py-2.5 text-left">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {d.recentTransactions.map((tx, i) => (
                  <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{tx.student}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{tx.type}</td>
                    <td className="px-4 py-3 font-mono font-bold text-sm text-slate-900">{tx.amount.toLocaleString()} ETB</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{tx.date}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{tx.status}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
