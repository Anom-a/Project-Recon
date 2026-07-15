import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { storeAdminApi, type InventoryPayload, type InventoryTransferPayload } from '../api/storeAdminApi';
import { branchesApi } from '@/domains/user/shared/api/adminApi';
import type { BranchInventory } from '@/domains/store/model/types';

interface Props {
  addToast: (message: string, type: 'success' | 'error') => void;
}

interface BranchOption {
  id: string;
  name: string;
}

const emptyInventory = (): InventoryPayload => ({
  branch: '', product: '', quantity: 0, minimum_quantity: 0,
});

type ActionType = 'add' | 'reduce' | 'correct' | 'transfer';

interface ActionState {
  type: ActionType;
  inventoryId: string;
  branch: string;
  product: string;
  quantity: string;
  newQuantity: string;
  toBranch: string;
}

const initialAction = (): ActionState => ({
  type: 'add',
  inventoryId: '',
  branch: '',
  product: '',
  quantity: '',
  newQuantity: '',
  toBranch: '',
});

export default function InventoryManager({ addToast }: Props) {
  const [items, setItems] = useState<BranchInventory[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<InventoryPayload>(emptyInventory());
  const [creating, setCreating] = useState(false);

  const [showActionModal, setShowActionModal] = useState(false);
  const [action, setAction] = useState<ActionState>(initialAction());
  const [actioning, setActioning] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (branchFilter) params.branch = branchFilter;
      const [data, branchData] = await Promise.all([
        storeAdminApi.inventory.list(params),
        branchesApi.list(),
      ]);
      setItems(data);
      setBranches(branchData.map((b: any) => ({ id: b.id || b.uuid, name: b.name })));
    } catch (e: any) {
      addToast(e.message || 'Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [branchFilter]);

  const openCreate = () => {
    setCreateForm(emptyInventory());
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await storeAdminApi.inventory.create(createForm);
      addToast('Inventory record created', 'success');
      setShowCreateModal(false);
      fetchAll();
    } catch (e: any) {
      addToast(e.message || 'Failed to create inventory record', 'error');
    } finally {
      setCreating(false);
    }
  };

  const openAction = (item?: BranchInventory) => {
    setAction({
      ...initialAction(),
      inventoryId: item?.id || '',
      product: item?.product || '',
      branch: item?.branch || '',
    });
    setShowActionModal(true);
  };

  const handleAction = async () => {
    setActioning(true);
    try {
      switch (action.type) {
        case 'add':
          await storeAdminApi.inventory.adjust(action.inventoryId, { quantity: parseInt(action.quantity) || 0 });
          break;
        case 'reduce':
          await storeAdminApi.inventory.reduce(action.inventoryId, { quantity: parseInt(action.quantity) || 0 });
          break;
        case 'correct':
          await storeAdminApi.inventory.correct(action.inventoryId, { quantity: parseInt(action.newQuantity) || 0 });
          break;
        case 'transfer': {
          const payload: InventoryTransferPayload = {
            from_branch: action.branch,
            to_branch: action.toBranch,
            product: action.product,
            quantity: parseInt(action.quantity) || 0,
          };
          await storeAdminApi.inventory.transfer(payload);
          break;
        }
      }
      addToast('Inventory action completed', 'success');
      setShowActionModal(false);
      fetchAll();
    } catch (e: any) {
      addToast(e.message || 'Failed to perform action', 'error');
    } finally {
      setActioning(false);
    }
  };

  const filtered = items.filter(i =>
    i.product_name.toLowerCase().includes(search.toLowerCase()) ||
    i.product_sku.toLowerCase().includes(search.toLowerCase()) ||
    i.branch_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Branch Inventory</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => openAction()}
            className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition-colors">
            Stock Action
          </button>
          <button onClick={openCreate}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
            New Record
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">{search || branchFilter ? 'No matches' : 'No inventory records'}</p>
      ) : (
        <div className="space-y-1">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{item.product_name}</p>
                <p className="text-xs text-slate-500">
                  {item.branch_name} &middot; SKU: {item.product_sku}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    item.quantity <= item.minimum_quantity
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    Qty: {item.quantity}
                  </span>
                  <span className="text-[11px] text-slate-400">Min: {item.minimum_quantity}</span>
                </div>
              </div>
              <button onClick={() => openAction(item)}
                className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shrink-0 ml-2">
                Action
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-full max-w-md mx-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800">New Inventory Record</h4>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Branch</label>
                <select value={createForm.branch} onChange={e => setCreateForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">-- Select --</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Product ID</label>
                <input type="text" value={createForm.product} onChange={e => setCreateForm(p => ({ ...p, product: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Quantity</label>
                  <input type="number" min="0" value={createForm.quantity} onChange={e => setCreateForm(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Min Quantity</label>
                  <input type="number" min="0" value={createForm.minimum_quantity} onChange={e => setCreateForm(p => ({ ...p, minimum_quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !createForm.branch || !createForm.product}
                className="px-3 py-1.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowActionModal(false)}>
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-full max-w-md mx-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800">Stock Action</h4>
              <button onClick={() => setShowActionModal(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Action</label>
                <select value={action.type} onChange={e => setAction(p => ({ ...p, type: e.target.value as ActionType }))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="add">Add Stock</option>
                  <option value="reduce">Reduce Stock</option>
                  <option value="correct">Correct Quantity</option>
                  <option value="transfer">Transfer to Branch</option>
                </select>
              </div>
              {(action.type === 'add' || action.type === 'reduce' || action.type === 'transfer') && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Quantity</label>
                  <input type="number" min="0" value={action.quantity} onChange={e => setAction(p => ({ ...p, quantity: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              )}
              {action.type === 'correct' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">New Quantity</label>
                  <input type="number" min="0" value={action.newQuantity} onChange={e => setAction(p => ({ ...p, newQuantity: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              )}
              {action.type === 'transfer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Destination Branch</label>
                  <select value={action.toBranch} onChange={e => setAction(p => ({ ...p, toBranch: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="">-- Select --</option>
                    {branches.filter(b => b.id !== action.branch).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowActionModal(false)}
                className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleAction} disabled={actioning}
                className="px-3 py-1.5 text-sm font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
                {actioning ? 'Processing...' : 'Execute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
