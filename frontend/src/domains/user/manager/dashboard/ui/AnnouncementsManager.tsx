import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Plus, Send, Megaphone, Trash2 } from 'lucide-react';

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState([
    { id: 1, text: 'VEX Regional Prep session moved to Saturday 15th at 9AM.', date: 'Jun 12, 2026', audience: 'All Students' },
    { id: 2, text: 'All students must submit A13 by Friday.', date: 'Jun 10, 2026', audience: 'VEX Track' },
    { id: 3, text: 'Summer camp registration is now open — limited seats available.', date: 'Jun 8, 2026', audience: 'Public' },
  ]);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [audience, setAudience] = useState('All Students');

  const postAnnouncement = () => {
    if (!draft.trim()) return;
    setAnnouncements(prev => [{ id: Date.now(), text: draft.trim(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), audience }, ...prev]);
    setDraft('');
    setComposing(false);
  };

  const removeAnnouncement = (id: number) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900">Announcements</h3>
          <p className="font-sans text-xs text-slate-500 mt-1">Broadcast messages to students, instructors, and the public</p>
        </div>
        {!composing && (
          <button onClick={() => setComposing(true)} className="bg-[#2563EB] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        )}
      </div>

      <AnimatePresence>
        {composing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-[#e1e2ed]/60 shadow-sm p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-5 h-5 text-[#2563EB]" />
              <h4 className="font-display font-bold text-sm text-slate-900">Compose Announcement</h4>
            </div>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Type your announcement here..."
              rows={3} className="w-full bg-slate-50 border border-[#e1e2ed] rounded-xl px-4 py-3 text-sm text-slate-800 resize-none focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 mb-3" />
            <div className="flex items-center gap-3">
              <select value={audience} onChange={e => setAudience(e.target.value)}
                className="bg-slate-50 border border-[#e1e2ed] rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#2563EB]">
                <option>All Students</option>
                <option>VEX Track</option>
                <option>Enjoy AI Track</option>
                <option>Instructors Only</option>
                <option>Public</option>
              </select>
              <div className="flex-1" />
              <button onClick={() => { setComposing(false); setDraft(''); }}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={postAnnouncement}
                className="bg-[#2563EB] text-white font-bold text-xs px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Publish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        {announcements.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-[#e1e2ed]/60 shadow-sm p-5 flex items-start gap-4 group hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm text-slate-800 leading-relaxed">{a.text}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono text-[10px] text-slate-400">{a.date}</span>
                <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{a.audience}</span>
              </div>
            </div>
            <button onClick={() => removeAnnouncement(a.id)}
              className="p-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
