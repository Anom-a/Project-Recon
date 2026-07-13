import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck, Loader2, BellOff, ExternalLink, X, Filter } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, dismissNotification } from '@/src/domains/notification/model/notificationApi';
import type { AppNotification } from '@/src/shared/types';
import PageHeader from '../../../shared/ui/PageHeader';
import EmptyState from '../../../shared/ui/EmptyState';
import LoadingSkeleton from '../../../shared/ui/LoadingSkeleton';

const TYPE_ICONS: Record<string, string> = { info: '📢', success: '✅', warning: '⚠️', alert: '🚨' };
const TYPE_COLORS: Record<string, string> = {
  info: 'text-brand-blue bg-brand-blue/10',
  success: 'text-emerald-500 bg-emerald-50',
  warning: 'text-amber-500 bg-amber-50',
  alert: 'text-brand-red bg-brand-red/10',
};

type FilterType = 'all' | 'unread' | 'academic' | 'event' | 'system';

function timeAgo(timestamp: string): string {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'academic') return n.title.toLowerCase().includes('academic') || n.message.toLowerCase().includes('course') || n.message.toLowerCase().includes('grade');
    if (filter === 'event') return n.title.toLowerCase().includes('event') || n.message.toLowerCase().includes('tournament') || n.message.toLowerCase().includes('match');
    if (filter === 'system') return n.type === 'alert' || n.type === 'warning';
    return true;
  });

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDismiss = async (id: string) => {
    await dismissNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { id: 'academic', label: 'Academic' },
    { id: 'event', label: 'Events' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Academic, event, and system updates in one place"
        icon={Bell}
        actions={
          unreadCount > 0 ? (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <Filter className="w-4 h-4 text-slate-400 self-center" />
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-brand-border rounded-2xl">
          <EmptyState
            icon={BellOff}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            description={filter === 'all' ? "You're all caught up!" : 'Try a different filter.'}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => !n.read && handleMarkRead(n.id)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm ${
                  n.read ? 'border-brand-border opacity-80' : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm ${TYPE_COLORS[n.type] || TYPE_COLORS.info}`}>
                    {TYPE_ICONS[n.type] || '📢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-semibold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h4>
                      <button
                        onClick={e => { e.stopPropagation(); handleDismiss(n.id); }}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 shrink-0"
                        aria-label="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-400">{timeAgo(n.timestamp)}</span>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                      {n.actionUrl && (
                        <a href={n.actionUrl} onClick={e => e.stopPropagation()}
                          className="text-[10px] font-semibold text-blue-600 flex items-center gap-0.5 hover:underline">
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
