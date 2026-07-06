import React, { useState } from 'react';
import { MessageSquare, AlertCircle, Reply, ArrowRightCircle } from 'lucide-react';

export default function CommunicationsCenter() {
  const [activeTab, setActiveTab] = useState<'messages' | 'complaints'>('messages');

  const items = activeTab === 'messages' ? [
    { sender: 'Abebe T.', subject: 'Question about VEX IQ', snippet: 'Hi, my son wants to join the upcoming VEX IQ competition...' },
    { sender: 'Sara M.', subject: 'Schedule Change', snippet: 'Can we move our Saturday session to Sunday?' },
  ] : [
    { sender: 'Dawit Y.', subject: 'Login Issue', snippet: 'I cannot access the student portal since yesterday.' },
    { sender: 'Helen B.', subject: 'Payment Error', snippet: 'My credit card was charged twice for the starter kit.' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#e1e2ed]/60">
      <h3 className="font-display font-bold text-slate-900 text-xl mb-6">Communications Center</h3>
      
      <div className="flex border-b border-slate-200 mb-4">
        <button 
          onClick={() => setActiveTab('messages')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'messages' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Parent Messages</div>
        </button>
        <button 
          onClick={() => setActiveTab('complaints')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'complaints' ? 'border-red-500 text-red-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Parent Complaints</div>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-slate-800 mb-1">{item.sender} <span className="text-slate-400 font-normal ml-2">Subj: {item.subject}</span></p>
              <p className="text-xs text-slate-600 line-clamp-1">{item.snippet}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="bg-[#2563EB] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 hover:bg-[#004ac6]">
                <Reply className="w-3.5 h-3.5" /> Reply
              </button>
              {activeTab === 'complaints' && (
                <button className="bg-amber-500 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 hover:bg-amber-600">
                  <ArrowRightCircle className="w-3.5 h-3.5" /> Escalate
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500 italic py-4 text-center">No new items in this queue.</p>}
      </div>
    </div>
  );
}
