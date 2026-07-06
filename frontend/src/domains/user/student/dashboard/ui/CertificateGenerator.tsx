import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Download, QrCode, ExternalLink, Shield, CheckCircle2, Trophy, Star } from 'lucide-react';
import { MOCK_CERTIFICATES } from '@/src/shared/constants/mock-data';

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  completion: { color: 'text-[#2563EB]', bg: 'bg-blue-50', border: 'border-blue-200', icon: Award },
  competition: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Trophy },
  milestone: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Star },
  award: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: Shield },
};

const DEFAULT_CFG = { color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', icon: Award };

export default function CertificateGenerator() {
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const selected = MOCK_CERTIFICATES.find(c => c.id === selectedCert);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-display font-bold text-xl text-slate-900">My Certificates</h3>
        <p className="text-xs text-slate-500 mt-1">Download and share your verified achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_CERTIFICATES.map((cert, i) => {
          const cfg = TYPE_CONFIG[cert.type] || DEFAULT_CFG;
          return (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedCert(cert.id)}
              className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg ${selectedCert === cert.id ? 'border-[#2563EB] shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center mb-3`}>
                <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${cfg.color} mb-1`}>{cert.type}</p>
              <h4 className="font-bold text-sm text-slate-900 leading-tight mb-1">{cert.programTitle}</h4>
              <p className="text-[10px] text-slate-400 font-mono">{cert.issueDate}</p>
              {cert.rank && <p className="text-xs font-bold text-amber-600 mt-2">🏅 {cert.rank}</p>}
            </motion.div>
          );
        })}
      </div>

      {/* Certificate Preview */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Certificate Visual */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-[#002f87] p-10 text-center">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <p className="font-mono text-[10px] text-amber-300 uppercase tracking-[0.3em] font-bold">CERTIFICATE OF {selected.type.toUpperCase()}</p>
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
              </div>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 mb-2 tracking-tight">ETHIO ROBOTICS</h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />
              <p className="text-slate-600 text-sm mb-1">This certifies that</p>
              <p className="font-display font-bold text-2xl text-slate-900 mb-1">{selected.studentName}</p>
              <p className="text-slate-600 text-sm mb-4">has successfully completed</p>
              <p className="font-display font-bold text-lg text-[#57dffe]">{selected.programTitle}</p>
              {selected.rank && <p className="text-amber-300 font-bold text-lg mt-2">🏆 {selected.rank}</p>}
              {selected.hoursCompleted && <p className="text-slate-400 text-xs mt-3">{selected.hoursCompleted} hours of training completed</p>}
              <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                <Shield className="w-4 h-4" />
                <p className="font-mono text-xs">{selected.verificationCode}</p>
              </div>
              <p className="text-slate-500 text-[10px] mt-2">{selected.issueDate}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-5 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Verified & Authentic
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                <QrCode className="w-3.5 h-3.5" />QR Code
              </button>
              <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />Share
              </button>
              <button className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-[#2563EB] px-4 py-2 rounded-lg hover:bg-[#004ac6] transition-colors">
                <Download className="w-3.5 h-3.5" />Download PDF
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
