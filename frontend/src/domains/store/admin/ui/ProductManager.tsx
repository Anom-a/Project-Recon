import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Image } from 'lucide-react';
import { storeAdminApi, type ProductPayload } from '../api/storeAdminApi';
import type { Product, ProductCategory } from '@/domains/store/model/types';

interface Props {
  addToast: (message: string, type: 'success' | 'error') => void;
}

const emptyForm = (): ProductPayload => ({
  category: '', name: '', short_description: '', description: '',
  sku: '', barcode: '', price: 0, currency: 'ETB', weight: 0, is_active: true,
});

export default function ProductManager({ addToast }: Props) {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProductPayload>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const [data, cats] = await Promise.all([
        storeAdminApi.products.list(),
        storeAdminApi.categories.list(),
      ]);
      setItems(data);
      setCategories(cats);
    } catch (e: any) {
      addToast(e.message || 'Failed to load products', 'error');
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

  const openEdit = (item: Product) => {
    setForm({
      category: item.category, name: item.name, short_description: item.short_description,
      description: item.description, sku: item.sku, barcode: item.barcode, price: item.price,
      currency: item.currency, weight: item.weight, is_active: item.is_active,
    });
    setEditing(item.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await storeAdminApi.products.update(editing, form);
        addToast('Product updated', 'success');
      } else {
        await storeAdminApi.products.create(form);
        addToast('Product created', 'success');
      }
      setShowModal(false);
      fetchItems();
    } catch (e: any) {
      addToast(e.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await storeAdminApi.products.delete(id);
      addToast('Product deleted', 'success');
      fetchItems();
    } catch (e: any) {
      addToast(e.message || 'Failed to delete product', 'error');
    }
  };

  const handleImageUpload = async (productId: string, file: File) => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await storeAdminApi.products.uploadImage(productId, fd);
      addToast('Image uploaded', 'success');
      fetchItems();
    } catch (e: any) {
      addToast(e.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await storeAdminApi.products.deleteImage(imageId);
      addToast('Image deleted', 'success');
      fetchItems();
    } catch (e: any) {
      addToast(e.message || 'Failed to delete image', 'error');
    }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase()) ||
    i.category_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Products</h3>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Product
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">{search ? 'No matches' : 'No products yet'}</p>
      ) : (
        <div className="space-y-1">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {item.primary_image?.image_url ? (
                  <img src={item.primary_image.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{item.name}</p>
                  {!item.is_active && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">INACTIVE</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{item.category_name} &middot; {item.sku} &middot; {item.currency} {Number(item.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-full max-w-lg mx-3 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800">{editing ? 'Edit Product' : 'New Product'}</h4>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">-- Select --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">SKU</label>
                  <input type="text" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Barcode</label>
                  <input type="text" value={form.barcode} onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Price</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Currency</label>
                  <input type="text" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Weight</label>
                  <input type="number" step="0.01" min="0" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Short Description</label>
                <input type="text" value={form.short_description} onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Full Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-700">Active</span>
              </label>

              {editing && (
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <p className="text-xs font-bold text-slate-600 mb-2">Images</p>
                  {items.find(i => i.id === editing)?.images.map(img => (
                    <div key={img.id} className="flex items-center gap-2 mb-1">
                      <img src={img.image_url || img.image} alt={img.alt_text} className="w-8 h-8 rounded object-cover" />
                      <span className="text-xs text-slate-500 flex-1">{img.is_primary ? 'Primary' : img.alt_text || 'Image'}</span>
                      <button onClick={() => handleImageDelete(img.id)}
                        className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs text-blue-600 font-bold hover:text-blue-700">
                    <Image className="w-3.5 h-3.5" />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file && editing) handleImageUpload(editing, file);
                      e.target.value = '';
                    }} />
                  </label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.category}
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
