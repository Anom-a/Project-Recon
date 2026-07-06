import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gift, Copy, CheckCircle2, Users, Share2, Sparkles } from 'lucide-react';
import { MOCK_REFERRALS } from '@/src/shared/constants/mock-data';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-600' },
  enrolled: { bg: 'bg-blue-50', text: 'text-blue-600' },
  rewarded: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
};

export default function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const code = 'ABEBE-2026';

  const copyCode = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const sendInvite = () => { if (inviteEmail.trim()) { alert(`Invitation sent to ${inviteEmail}`); setInviteEmail(''); } };

  return (
    <div className="flex flex-col gap-6">
      <div><h3 className="font-display font-bold text-xl text-slate-900">Referral Program</h3><p className="text-xs text-slate-500 mt-1">Invite friends and earn rewards for every enrollment</p></div>

      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#2563EB] to-indigo-700 rounded-3xl p-8 text-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-100 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-100 rounded-full -ml-12 -mb-12" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4"><Gift className="w-8 h-8 text-amber-300" /><div><p className="font-display font-bold text-lg">Invite & Earn</p><p className="text-blue-200 text-xs">500 XP + 10% discount for each successful referral</p></div></div>
          <div className="bg-white/15 backdrop-blur rounded-xl px-5 py-4 flex items-center justify-between mt-4">
            <div><p className="text-blue-200 text-[10px] font-mono uppercase tracking-wider mb-1">Your Referral Code</p><p className="font-mono font-extrabold text-2xl tracking-wider">{code}</p></div>
            <button onClick={copyCode} className="bg-white text-[#2563EB] px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-blue-50 transition-colors active:scale-95">
              {copied ? <><CheckCircle2 className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy</>}
            </button>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 relative">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="friend@email.com" className="w-full bg-white/15 backdrop-blur border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-blue-200 outline-none focus:border-white/40" />
            </div>
            <button onClick={sendInvite} className="bg-amber-400 text-slate-900 px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-amber-300 transition-colors">
              <Share2 className="w-4 h-4" />Send Invite
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Total Referrals', value: MOCK_REFERRALS.length, icon: Users, color: 'text-[#2563EB]', bg: 'bg-blue-50' },
          { label: 'Enrolled', value: MOCK_REFERRALS.filter(r => r.status !== 'pending').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'XP Earned', value: '1,000', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' }].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div><p className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p><p className="font-display font-extrabold text-xl text-slate-900">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100"><h4 className="font-display font-bold text-sm text-slate-900">Referral History</h4></div>
        {MOCK_REFERRALS.map((ref, i) => {
          const sc = STATUS_COLORS[ref.status];
          return (
            <motion.div key={ref.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="px-5 py-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-sm text-slate-500">{ref.refereeName.charAt(0)}</div>
                <div><p className="font-bold text-sm text-slate-900">{ref.refereeName}</p><p className="text-[10px] text-slate-400">{ref.refereeEmail} • {ref.date}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500">{ref.reward}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>{ref.status}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
