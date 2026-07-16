import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Power, Search, X } from 'lucide-react';
import { storeAdminApi, type CategoryPayload } from '../api/storeAdminApi';
import type { ProductCategory } from '@/domains/store/model/types';

interface Props {
  addToast: (message: string, type: 'success' | 'error') => void;
}

const emptyForm = (): CategoryPayload => ({
  name: '',
  description: '',
  is_active: true,
});

const ORDERED_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function CategoryManager({ addToast }: Props) {
  const [items, setItems] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryPayload>(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await storeAdminApi.categories.list();
      setItems(data);
    } catch (e: any) {
      addToast(e.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (item: ProductCategory) => {
    setForm({ name: item.name, description: item.description, is_active: item.is_active });
    setEditing(item.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await storeAdminApi.categories.update(editing, form);
        addToast('Category updated', 'success');
      } else {
        await storeAdminApi.categories.create(form);
        addToast('Category created', 'success');
      }
      setShowModal(false);
      fetchItems();
    } catch (e: any) {
      addToast(e.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: ProductCategory) => {
    const action = item.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this category?`)) return;
    try {
      if (item.is_active) {
        await storeAdminApi.categories.deactivate(item.id);
      } else {
        await storeAdminApi.categories.activate(item.id);
      }
      addToast(`Category ${action}d`, 'success');
      fetchItems();
    } catch (e: any) {
      addToast(e.message || `Failed to ${action} category`, 'error');
    }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Categories</h3>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Category
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input type="text" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">{search ? 'No matches' : 'No categories yet'}</p>
      ) : (
        <div className="space-y-1">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{item.name}</p>
                  {!item.is_active && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">INACTIVE</span>
                  )}
                </div>
                {item.description && <p className="text-xs text-slate-500 truncate">{item.description}</p>}
                <p className="text-[11px] text-slate-400">{item.product_count} product(s)</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleToggleActive(item)}
                  title={item.is_active ? 'Deactivate' : 'Activate'}
                  className={`p-1.5 rounded-lg transition-all ${item.is_active ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-full max-w-md mx-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800">{editing ? 'Edit Category' : 'New Category'}</h4>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-700">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="px-3 py-1.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
