import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Image, FileText, Handshake, Building,
  MessageSquare, HelpCircle, X, CheckCircle, AlertCircle, ChevronRight,
} from 'lucide-react';
import CMSBranding from '@/src/domains/user/manager/dashboard/ui/CMSBranding';
import HeroBannerManager from './HeroBannerManager';
import NewsManager from './NewsManager';
import CmsPartnerManager from './CmsPartnerManager';
import AboutUsManager from './AboutUsManager';
import ContactRequestManager from './ContactRequestManager';
import FaqManager from './FaqManager';

type CmsSection = 'branding' | 'hero-banners' | 'news' | 'partners' | 'about' | 'contact-requests' | 'faqs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface CmsSubNavItem {
  id: CmsSection;
  label: string;
  icon: React.ElementType;
}

const SUB_NAV: CmsSubNavItem[] = [
  { id: 'branding', label: 'Branding', icon: LayoutDashboard },
  { id: 'hero-banners', label: 'Hero Banners', icon: Image },
  { id: 'news', label: 'News & Announcements', icon: FileText },
  { id: 'partners', label: 'Partners & Sponsors', icon: Handshake },
  { id: 'about', label: 'About Us', icon: Building },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'contact-requests', label: 'Contact Requests', icon: MessageSquare },
];

let toastCounter = 0;

export default function CmsDashboard() {
  const [section, setSection] = useState<CmsSection>('branding');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = `toast-${++toastCounter}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const activeLabel = SUB_NAV.find(n => n.id === section)?.label ?? '';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SUB_NAV.map(item => {
          const Icon = item.icon;
          const isActive = section === item.id;
          return (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {section === 'branding' && <CMSBranding />}
            {section === 'hero-banners' && <HeroBannerManager addToast={addToast} />}
            {section === 'news' && <NewsManager addToast={addToast} />}
            {section === 'partners' && <CmsPartnerManager addToast={addToast} />}
            {section === 'about' && <AboutUsManager addToast={addToast} />}
            {section === 'faqs' && <FaqManager addToast={addToast} />}
            {section === 'contact-requests' && <ContactRequestManager addToast={addToast} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div key={toast.id} initial={{ opacity: 0, x: 100, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 100, scale: 0.95 }}
              className={`flex items-start gap-2 p-3 rounded-xl shadow-lg border ${
                toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
