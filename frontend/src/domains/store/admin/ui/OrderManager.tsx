import React, { useState, useEffect } from 'react';
import { Search, X, Eye, ChevronRight, Clock, PackageCheck } from 'lucide-react';
import { storeAdminApi } from '../api/storeAdminApi';
import type { Order } from '@/domains/store/model/types';

interface Props {
  addToast: (message: string, type: 'success' | 'error' ) => void;
}

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-blue-50 text-blue-600',
  processing: 'bg-violet-50 text-violet-600',
  shipped: 'bg-indigo-50 text-indigo-600',
  delivered: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

const getNextStatuses = (current: string): string[] => {
  if (current === 'cancelled' || current === 'delivered') return [];
  if (current === 'pending') return ['confirmed', 'cancelled'];
  if (current === 'confirmed') return ['processing', 'cancelled'];
  if (current === 'processing') return ['shipped', 'cancelled'];
  if (current === 'shipped') return ['delivered', 'cancelled'];
  return [];
};

export default function OrderManager({ addToast }: Props) {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [detail, setDetail] = useState<Order | null>(null);
  const [statusModal, setStatusModal] = useState<Order | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const data = await storeAdminApi.orders.list(params);
      setItems(data);
    } catch (e: any) {
      addToast(e.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [statusFilter]);

  const handleStatusChange = async () => {
    if (!statusModal || !nextStatus) return;
    setStatusSaving(true);
    try {
      await storeAdminApi.orders.updateStatus(statusModal.id, {
        status: nextStatus,
        notes: statusNotes || undefined,
      });
      addToast(`Order status changed to ${nextStatus}`, 'success');
      setStatusModal(null);
      setStatusNotes('');
      setNextStatus('');
      fetchItems();
    } catch (e: any) {
      addToast(e.message || 'Failed to update status', 'error');
    } finally {
      setStatusSaving(false);
    }
  };

  const filtered = items.filter(i =>
    i.order_number.toLowerCase().includes(search.toLowerCase()) ||
    i.branch_name.toLowerCase().includes(search.toLowerCase()) ||
    (i.guest_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Orders</h3>
        <div className="text-xs text-slate-400">{items.length} total</div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="">All Statuses</option>
          {STATUS_FLOW.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">{search || statusFilter ? 'No matches' : 'No orders yet'}</p>
      ) : (
        <div className="space-y-1">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{item.order_number}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[item.status] || 'bg-slate-50 text-slate-500'}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {item.branch_name} &middot; {item.guest_name || 'Walk-in'} &middot; {item.total.toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button onClick={() => setDetail(item)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <Eye className="w-3 h-3" /> View
                </button>
                {getNextStatuses(item.status).length > 0 && (
                  <button onClick={() => { setStatusModal(item); setNextStatus(''); setStatusNotes(''); }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <ChevronRight className="w-3 h-3" /> Status
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-full max-w-lg mx-3 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800">Order {detail.order_number}</h4>
              <button onClick={() => setDetail(null)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-xs text-slate-500">Branch</span><p className="font-bold">{detail.branch_name}</p></div>
                <div><span className="text-xs text-slate-500">Status</span>
                  <p className={`font-bold ${detail.status === 'cancelled' ? 'text-red-600' : detail.status === 'delivered' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {detail.status.toUpperCase()}
                  </p>
                </div>
                <div><span className="text-xs text-slate-500">Customer</span><p className="font-bold">{detail.guest_name || 'Walk-in'}</p></div>
                <div><span className="text-xs text-slate-500">Contact</span><p className="font-bold">{detail.guest_email || detail.guest_phone || '-'}</p></div>
                <div><span className="text-xs text-slate-500">Total</span><p className="font-bold">{detail.total.toFixed(2)}</p></div>
                <div><span className="text-xs text-slate-500">Payment Ref</span><p className="font-bold text-xs">{detail.payment_reference || '-'}</p></div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs font-bold text-slate-600 mb-2">Items</p>
                {detail.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm text-slate-800">{item.product_name}</p>
                      <p className="text-xs text-slate-400">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-800">{item.quantity} &times; {item.unit_price.toFixed(2)}</p>
                      <p className="text-xs font-bold text-slate-600">{item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {detail.status_history.length > 0 && (
                <div className="border-t border-slate-200 pt-3">
                  <p className="text-xs font-bold text-slate-600 mb-2">Status History</p>
                  <div className="space-y-1.5">
                    {detail.status_history.map(h => (
                      <div key={h.id} className="flex items-start gap-2">
                        <Clock className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs">
                            <span className="font-bold">{h.previous_status || '-'}</span>
                            {' → '}
                            <span className="font-bold">{h.new_status}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {h.changed_by ? `${h.changed_by} · ` : ''}{new Date(h.changed_at).toLocaleString()}
                          </p>
                          {h.notes && <p className="text-[11px] text-slate-500">{h.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setStatusModal(null)}>
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-full max-w-sm mx-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800">Update Status</h4>
              <button onClick={() => setStatusModal(null)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Order <strong>{statusModal.order_number}</strong> &mdash; current: <strong>{statusModal.status}</strong>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">New Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {getNextStatuses(statusModal.status).map(s => (
                    <button key={s} onClick={() => setNextStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                        nextStatus === s
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Notes (optional)</label>
                <textarea value={statusNotes} onChange={e => setStatusNotes(e.target.value)} rows={2}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setStatusModal(null)}
                className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleStatusChange} disabled={statusSaving || !nextStatus}
                className="px-3 py-1.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {statusSaving ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
