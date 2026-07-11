import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Download, Shield, CheckCircle2, Trophy, Star, Loader2, ExternalLink } from 'lucide-react';
import { fetchStudentCertificatesApi, downloadCertificateReportPdf } from '@/src/domains/learning/academics/api/academicApi';
import type { StudentCertificate } from '@/src/shared/types';

interface Props { studentId: string }

export default function CertificateGenerator({ studentId }: Props) {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const selected = certificates.find(c => c.id === selectedCert);

  useEffect(() => {
    fetchStudentCertificatesApi(studentId).then(setCertificates).catch(() => {}).finally(() => setLoading(false));
  }, [studentId]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-display font-bold text-xl text-slate-900">My Certificates</h3>
        <p className="text-xs text-slate-500 mt-1">Download and share your verified achievements</p>
      </div>

      {loading ? (
        <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No certificates issued yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {certificates.map((cert, i) => (
              <motion.div key={cert.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedCert(cert.id)}
                className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg ${selectedCert === cert.id ? 'border-brand-red shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
                <div className={`w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3`}>
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600 mb-1">Certificate</p>
                <h4 className="font-bold text-sm text-slate-900 leading-tight mb-1">{cert.certificate_title || cert.sub_program_name || 'Certificate'}</h4>
                <p className="text-[10px] text-slate-400 font-mono">{cert.issued_at?.slice(0, 10)}</p>
              </motion.div>
            ))}
          </div>

          {selected && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-[#002f87] p-10 text-center">
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                    <p className="font-mono text-[10px] text-amber-300 uppercase tracking-[0.3em] font-bold">CERTIFICATE</p>
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  </div>
                  <h2 className="font-display font-extrabold text-3xl text-slate-900 mb-2 tracking-tight">ETHIO ROBOTICS</h2>
                  <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />
                  <p className="text-slate-600 text-sm mb-1">This certifies that</p>
                  <p className="font-display font-bold text-2xl text-slate-900 mb-1">{selected.student_name}</p>
                  <p className="text-slate-600 text-sm mb-4">has completed</p>
                  <p className="font-display font-bold text-lg text-[#57dffe]">{selected.certificate_title || selected.sub_program_name}</p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                    <Shield className="w-4 h-4" />
                    <p className="font-mono text-xs">{selected.certificate_number}</p>
                  </div>
                  <p className="text-slate-500 text-[10px] mt-2">{selected.issued_at?.slice(0, 10)}</p>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Verified & Authentic
                </div>
                <div className="flex gap-2">
                  <button onClick={() => downloadCertificateReportPdf(studentId)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-brand-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}