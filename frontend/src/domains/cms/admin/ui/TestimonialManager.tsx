import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquareQuote, Plus, Edit2, Trash2, X, Search, Eye, EyeOff, Play, Image as ImageIcon,
  Film, LayoutGrid, List, ChevronLeft, ChevronRight, GripVertical, Star, Upload, RotateCcw,
  AlertCircle, CheckSquare, Square, Quote, ExternalLink,
} from 'lucide-react';
import { api, Testimonial, GalleryItem } from '../api/cmsApi';
import { formatApiError } from '@/shared/utils/formatApiError';

interface Props { addToast: (msg: string, type: 'success' | 'error') => void }

/** Backend `role` is the single category/role field (help_text: Parent, Student, Partner). */
const CATEGORIES = [
  'Student Success',
  'Alumni',
  'Parent',
  'Teacher',
  'Industry Partner',
  'Competition Winner',
  'Workshop',
  'Training',
  'Internship',
  'Other',
] as const;

const ACCEPTED_IMAGE = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
const PAGE_SIZE = 12;

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'published' | 'draft';
type MediaFilter = 'all' | 'image' | 'video';
type SortKey = 'order' | 'name' | 'created_at' | '-created_at';

const emptyForm = (): Partial<Testimonial> => ({
  name: '',
  role: CATEGORIES[0],
  quote: '',
  imageUrl: '',
  videoUrl: '',
  isActive: true,
  priority: 0,
});

function getVideoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

function isHttpsUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function imgOf(t: Partial<Testimonial>) {
  return (t.imageUrl || t.image || '') as string;
}

function videoOf(t: Partial<Testimonial>) {
  return (t.videoUrl || t.video_url || '') as string;
}

function activeOf(t: Partial<Testimonial>) {
  return !!(t.isActive ?? t.is_active);
}

function orderOf(t: Partial<Testimonial>) {
  return t.priority ?? t.order ?? 0;
}

export default function TestimonialManager({ addToast }: Props) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [preview, setPreview] = useState<Testimonial | null>(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<StatusFilter>('all');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('order');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [galleryPicker, setGalleryPicker] = useState<'image' | 'video' | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await api.getAll<Testimonial>('testimonials');
      setItems(rows);
    } catch (e) {
      setItems([]);
      setLoadError(formatApiError(e));
    }
    setLoading(false);
  };

  const openGalleryPicker = async (kind: 'image' | 'video') => {
    setGalleryPicker(kind);
    setGalleryLoading(true);
    try {
      setGalleryItems(await api.getAll<GalleryItem>('gallery'));
    } catch {
      setGalleryItems([]);
      addToast('Failed to load gallery media', 'error');
    }
    setGalleryLoading(false);
  };

  const published = items.filter(i => activeOf(i)).length;
  const drafts = items.length - published;
  const withVideo = items.filter(i => !!videoOf(i)).length;
  const withImage = items.filter(i => !!imgOf(i) && !videoOf(i)).length;
  const minOrder = items.length ? Math.min(...items.map(orderOf)) : 0;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let rows = items.filter(item => {
      const active = activeOf(item);
      if (statusTab === 'published' && !active) return false;
      if (statusTab === 'draft' && active) return false;

      const hasVideo = !!videoOf(item);
      const hasImage = !!imgOf(item);
      if (mediaFilter === 'video' && !hasVideo) return false;
      if (mediaFilter === 'image' && (!hasImage || hasVideo)) return false;

      if (categoryFilter !== 'all' && (item.role || '') !== categoryFilter) return false;

      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.role?.toLowerCase().includes(q) ||
        item.quote?.toLowerCase().includes(q)
      );
    });

    rows = [...rows].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'created_at') return (a.created_at || '').localeCompare(b.created_at || '');
      if (sortKey === '-created_at') return (b.created_at || '').localeCompare(a.created_at || '');
      return orderOf(a) - orderOf(b);
    });

    return rows;
  }, [items, search, statusTab, mediaFilter, categoryFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusTab, mediaFilter, categoryFilter, sortKey]);

  const openCreate = () => {
    const nextOrder = items.length ? Math.max(...items.map(orderOf)) + 1 : 0;
    setEditing({ ...emptyForm(), priority: nextOrder });
    setFormErrors({});
  };
  const openEdit = (item: Testimonial) => { setEditing({ ...item }); setFormErrors({}); };
  const closeForm = () => { setEditing(null); setFormErrors({}); setGalleryPicker(null); };

  const clearError = (field: string) => {
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editing?.name?.trim()) errors.name = 'Full name is required';
    if (!editing?.role?.trim()) errors.role = 'Category is required';
    if (!editing?.quote?.trim()) errors.quote = 'Review is required';

    const image = imgOf(editing || {});
    const video = videoOf(editing || {});
    if (image && !image.startsWith('data:') && !isHttpsUrl(image)) {
      errors.imageUrl = 'Image must be an HTTPS URL';
    }
    if (video && !isHttpsUrl(video)) {
      errors.videoUrl = 'Video must be an HTTPS URL';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const save = async () => {
    if (!editing || !validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name?.trim(),
        role: editing.role?.trim(),
        quote: editing.quote?.trim(),
        imageUrl: imgOf(editing) || null,
        videoUrl: videoOf(editing) || null,
        isActive: activeOf(editing),
        priority: orderOf(editing),
      };
      if (editing.id) {
        await api.update('testimonials', editing.id, payload);
        addToast('Testimonial updated', 'success');
      } else {
        await api.create('testimonials', payload);
        addToast('Testimonial added', 'success');
      }
      closeForm();
      load();
    } catch (e) {
      addToast(formatApiError(e), 'error');
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this testimonial?')) return;
    try {
      await api.delete('testimonials', id);
      addToast('Testimonial removed', 'success');
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      load();
    } catch (e) {
      addToast(formatApiError(e), 'error');
    }
  };

  const toggleActive = async (item: Testimonial) => {
    try {
      await api.update('testimonials', item.id, { isActive: !activeOf(item) });
      load();
    } catch (e) {
      addToast(formatApiError(e), 'error');
    }
  };

  /** Featured ≈ lowest display order (public About page highlights first by order). */
  const toggleFeatured = async (item: Testimonial) => {
    const isFeatured = orderOf(item) === minOrder && items.length > 0;
    try {
      if (isFeatured) {
        await api.update('testimonials', item.id, { priority: minOrder + 1 });
      } else {
        await api.update('testimonials', item.id, { priority: minOrder - 1 });
      }
      load();
    } catch (e) {
      addToast(formatApiError(e), 'error');
    }
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editing) return;

    const okType = /image\/(jpeg|png|webp)/i.test(file.type)
      || /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!okType) {
      setFormErrors(prev => ({ ...prev, imageUrl: 'Only JPG, PNG, or WEBP images are accepted' }));
      return;
    }

    setUploadingImage(true);
    clearError('imageUrl');
    try {
      // Testimonials.image is a HTTPS URLField — upload via existing Gallery ImageField, then reuse URL.
      const reader = new FileReader();
      const dataUri = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
      });

      const created = await api.create('gallery', {
        title: `Testimonial — ${editing.name || 'Photo'}`,
        description: 'Uploaded for testimonial',
        imageUrl: dataUri,
        isActive: false,
      }) as { image?: string; imageUrl?: string };

      const url = created.imageUrl || created.image || '';
      if (!url) throw new Error('Upload succeeded but no image URL was returned');
      if (!isHttpsUrl(url)) {
        throw new Error('Uploaded image URL must be HTTPS. Paste an HTTPS image URL instead.');
      }
      setEditing(prev => prev ? { ...prev, imageUrl: url, image: url } : prev);
      addToast('Image uploaded', 'success');
    } catch (err) {
      setFormErrors(prev => ({ ...prev, imageUrl: formatApiError(err) }));
    }
    setUploadingImage(false);
  };

  const selectGalleryMedia = (item: GalleryItem) => {
    if (!editing || !galleryPicker) return;
    if (galleryPicker === 'image') {
      const url = item.imageUrl || item.image || '';
      if (!url) { addToast('That gallery item has no image', 'error'); return; }
      if (!isHttpsUrl(url)) {
        addToast('Gallery image must be an HTTPS URL to attach', 'error');
        return;
      }
      setEditing({ ...editing, imageUrl: url, image: url });
      clearError('imageUrl');
    } else {
      const url = item.videoUrl || item.video_url || '';
      if (!url) { addToast('That gallery item has no video', 'error'); return; }
      if (!isHttpsUrl(url)) {
        addToast('Video must be an HTTPS URL', 'error');
        return;
      }
      setEditing({ ...editing, videoUrl: url, video_url: url });
      clearError('videoUrl');
    }
    setGalleryPicker(null);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectPage = () => {
    const ids = pageItems.map(i => i.id);
    const allSelected = ids.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  };

  const runBulk = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selected.size === 0) return;
    if (action === 'delete' && !confirm(`Delete ${selected.size} testimonial(s)?`)) return;
    setBulkBusy(true);
    const ids = [...selected];
    let failed = 0;
    for (const id of ids) {
      try {
        if (action === 'delete') await api.delete('testimonials', id);
        else await api.update('testimonials', id, { isActive: action === 'publish' });
      } catch { failed += 1; }
    }
    setSelected(new Set());
    await load();
    setBulkBusy(false);
    if (failed) addToast(`${failed} action(s) failed`, 'error');
    else addToast(
      action === 'delete' ? 'Selected testimonials deleted'
        : action === 'publish' ? 'Selected testimonials published'
          : 'Selected testimonials unpublished',
      'success',
    );
  };

  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const ordered = [...items].sort((a, b) => orderOf(a) - orderOf(b));
    const from = ordered.findIndex(i => i.id === dragId);
    const to = ordered.findIndex(i => i.id === targetId);
    if (from < 0 || to < 0) { setDragId(null); return; }
    const next = [...ordered];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDragId(null);
    const withOrder = next.map((item, idx) => ({ ...item, priority: idx, order: idx }));
    setItems(withOrder);
    try {
      await Promise.all(
        next.map((item, idx) =>
          orderOf(item) === idx ? Promise.resolve() : api.update('testimonials', item.id, { priority: idx }),
        ),
      );
      addToast('Order updated', 'success');
      load();
    } catch (e) {
      addToast(formatApiError(e), 'error');
      load();
    }
  };

  const rolesInUse = useMemo(() => {
    const set = new Set(items.map(i => i.role).filter(Boolean));
    return [...set].sort();
  }, [items]);

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between">
          <div className="h-5 w-36 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-36 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="p-3 border-b border-slate-100 flex gap-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-7 w-20 bg-slate-100 rounded-full animate-pulse" />)}
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 bg-slate-200 rounded" />
                <div className="h-3 w-64 bg-slate-100 rounded" />
              </div>
              <div className="h-5 w-16 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (loadError) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-800 mb-1">Couldn’t load testimonials</p>
        <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">{loadError}</p>
        <button onClick={load}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
          <RotateCcw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const formImage = editing ? imgOf(editing) : '';
  const formVideo = editing ? videoOf(editing) : '';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-800">Testimonials</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
            About page
          </span>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {filtered.length} / {items.length}
          </span>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
          <Plus className="w-3.5 h-3.5" /> Add Testimonial
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
        {([
          { key: 'all' as StatusFilter, label: 'All', count: items.length },
          { key: 'published' as StatusFilter, label: 'Published', count: published },
          { key: 'draft' as StatusFilter, label: 'Drafts', count: drafts },
        ]).map(t => (
          <button key={t.key} onClick={() => setStatusTab(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              statusTab === t.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-[10px] ${statusTab === t.key ? 'text-white/70' : 'text-slate-400'}`}>{t.count}</span>
          </button>
        ))}

        <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />

        {([
          { key: 'all' as MediaFilter, label: 'All Media' },
          { key: 'image' as MediaFilter, label: 'Photos', count: withImage },
          { key: 'video' as MediaFilter, label: 'Videos', count: withVideo },
        ]).map(t => (
          <button key={t.key} onClick={() => setMediaFilter(t.key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              mediaFilter === t.key ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`text-[10px] ${mediaFilter === t.key ? 'text-white/70' : 'text-slate-400'}`}>{t.count}</span>
            )}
          </button>
        ))}

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          {rolesInUse.filter(r => !(CATEGORIES as readonly string[]).includes(r)).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="order">Sort: Display order</option>
          <option value="name">Sort: Name</option>
          <option value="-created_at">Sort: Newest</option>
          <option value="created_at">Sort: Oldest</option>
        </select>

        <div className="relative max-w-xs grow sm:grow-0 sm:ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search testimonials..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>

        <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
          <button onClick={() => setViewMode('list')} title="List view"
            className={`p-1.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
            <List className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setViewMode('grid')} title="Grid view"
            className={`p-1.5 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="px-3 py-2 border-b border-blue-100 bg-blue-50 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-blue-700">{selected.size} selected</span>
          <button disabled={bulkBusy} onClick={() => runBulk('publish')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
            Publish
          </button>
          <button disabled={bulkBusy} onClick={() => runBulk('unpublish')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-200 text-amber-700 hover:bg-amber-50 disabled:opacity-50">
            Unpublish
          </button>
          <button disabled={bulkBusy} onClick={() => runBulk('delete')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-200 text-red-600 hover:bg-red-50 disabled:opacity-50">
            Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-slate-500 hover:text-slate-700">
            Clear
          </button>
        </div>
      )}

      {/* Empty */}
      {items.length === 0 ? (
        <div className="p-12 text-center">
          <MessageSquareQuote className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">No testimonials available.</p>
          <button onClick={openCreate}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="w-3.5 h-3.5" /> Add first testimonial
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-400">
          No testimonials match your search
        </div>
      ) : viewMode === 'list' ? (
        <div className="divide-y divide-slate-100">
          <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <button onClick={toggleSelectPage} className="p-0.5 text-slate-400 hover:text-blue-600">
              {pageItems.every(i => selected.has(i.id)) && pageItems.length > 0
                ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </button>
            <span className="w-4" />
            <span className="w-12">Media</span>
            <span className="flex-1">Name</span>
            <span className="w-28 hidden md:block">Category</span>
            <span className="w-20 hidden lg:block">Order</span>
            <span className="w-24 hidden lg:block">Date</span>
            <span className="w-28">Status</span>
            <span className="w-28 text-right">Actions</span>
          </div>
          {pageItems.map(item => {
            const hasVideo = !!videoOf(item);
            const hasImage = !!imgOf(item);
            const featured = orderOf(item) === minOrder;
            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => onDragStart(item.id)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(item.id)}
                className={`flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors ${dragId === item.id ? 'opacity-50' : ''}`}
              >
                <button onClick={() => toggleSelect(item.id)} className="p-0.5 text-slate-400 hover:text-blue-600 shrink-0">
                  {selected.has(item.id) ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />}
                </button>
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0 cursor-grab" title="Drag to reorder" />
                <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0 flex items-center justify-center overflow-hidden relative">
                  {hasImage ? (
                    <img src={imgOf(item)} alt="" className="w-full h-full object-cover" />
                  ) : hasVideo ? (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white/80" />
                    </div>
                  ) : (
                    <MessageSquareQuote className="w-5 h-5 text-slate-400" />
                  )}
                  {hasVideo && (
                    <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded bg-black/70 flex items-center justify-center">
                      <Film className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                    {featured && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                        <Star className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate sm:hidden">{item.role}</p>
                  <p className="text-xs text-slate-400 truncate hidden sm:block">{item.quote}</p>
                </div>
                <span className="w-28 hidden md:block text-xs text-slate-600 truncate">{item.role}</span>
                <span className="w-20 hidden lg:block text-xs text-slate-500 font-mono">{orderOf(item)}</span>
                <span className="w-24 hidden lg:block text-xs text-slate-400">{fmtDate(item.created_at)}</span>
                <div className="w-28 flex items-center gap-1 shrink-0">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeOf(item) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>{activeOf(item) ? 'Published' : 'Draft'}</span>
                </div>
                <div className="w-28 flex items-center justify-end gap-0.5 shrink-0">
                  <button onClick={() => setPreview(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100" title="Preview">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleFeatured(item)}
                    className={`p-1.5 rounded-lg transition-colors ${featured ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                    title={featured ? 'Unpin featured' : 'Set as featured (top order)'}>
                    <Star className={`w-3.5 h-3.5 ${featured ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={() => toggleActive(item)}
                    className={`p-1.5 rounded-lg transition-colors ${activeOf(item) ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                    title={activeOf(item) ? 'Unpublish' : 'Publish'}>
                    {activeOf(item) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pageItems.map(item => {
            const hasVideo = !!videoOf(item);
            const hasImage = !!imgOf(item);
            const featured = orderOf(item) === minOrder;
            return (
              <div key={item.id}
                className="rounded-xl border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-sm transition-all group">
                <div className="relative aspect-video bg-slate-100">
                  {hasVideo && getVideoEmbed(videoOf(item)) ? (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white/80" />
                    </div>
                  ) : hasImage ? (
                    <img src={imgOf(item)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
                      <Quote className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <button onClick={() => toggleSelect(item.id)}
                      className="p-1 rounded-md bg-white/90 text-slate-500 shadow-sm">
                      {selected.has(item.id) ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {hasVideo && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase text-white bg-black/60 px-1.5 py-0.5 rounded-full">
                        <Film className="w-2.5 h-2.5" /> Video
                      </span>
                    )}
                    {featured && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full">
                        <Star className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 truncate">{item.role}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      activeOf(item) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>{activeOf(item) ? 'Published' : 'Draft'}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">&ldquo;{item.quote}&rdquo;</p>
                  <p className="text-[10px] text-slate-400 mt-2">{fmtDate(item.created_at)} · Order {orderOf(item)}</p>
                  <div className="flex items-center justify-end gap-0.5 mt-2 pt-2 border-t border-slate-100">
                    <button onClick={() => setPreview(item)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" title="Preview">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleFeatured(item)} className={`p-1.5 rounded-lg ${featured ? 'text-amber-500' : 'text-slate-400'} hover:bg-amber-50`} title="Featured">
                      <Star className={`w-3.5 h-3.5 ${featured ? 'fill-current' : ''}`} />
                    </button>
                    <button onClick={() => toggleActive(item)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" title={activeOf(item) ? 'Unpublish' : 'Publish'}>
                      {activeOf(item) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button disabled={currentPage <= 1} onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 px-2">{currentPage} / {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={closeForm}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-slate-800">{editing.id ? 'Edit Testimonial' : 'New Testimonial'}</h3>
              <button onClick={closeForm} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <Field label="Full Name" value={editing.name ?? ''} onChange={v => { setEditing({ ...editing, name: v }); clearError('name'); }}
                error={formErrors.name} required placeholder="e.g. Hanna Bekele" />

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Category <span className="text-red-400 ml-0.5">*</span>
                </label>
                <select
                  value={editing.role ?? ''}
                  onChange={e => { setEditing({ ...editing, role: e.target.value }); clearError('role'); }}
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                    formErrors.role ? 'border-red-300 focus:ring-red-300 bg-red-50' : 'border-slate-200 focus:ring-blue-500/30'
                  }`}
                >
                  <option value="" disabled>Select one category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  {editing.role && !(CATEGORIES as readonly string[]).includes(editing.role) && (
                    <option value={editing.role}>{editing.role}</option>
                  )}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Maps to backend role · choose one only</p>
                {formErrors.role && <p className="text-xs text-red-500 mt-1">{formErrors.role}</p>}
              </div>

              <Textarea label="Review" value={editing.quote ?? ''} onChange={v => { setEditing({ ...editing, quote: v }); clearError('quote'); }}
                error={formErrors.quote} required placeholder="Their testimonial review..." />

              {/* Media card — single image, single video, single category */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-4 bg-slate-50/50">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Media</p>

                {/* Image — choose one */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Image <span className="text-slate-400 font-medium normal-case">(choose one)</span>
                    </label>
                    {formImage && (
                      <button type="button" onClick={() => setEditing({ ...editing, imageUrl: '', image: null })}
                        className="text-[11px] font-bold text-red-500 hover:text-red-600">Remove</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <input type="file" accept={ACCEPTED_IMAGE} ref={imageInputRef} onChange={handleImageFile} className="hidden" />
                    <button type="button" disabled={uploadingImage} onClick={() => imageInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50">
                      <Upload className="w-3.5 h-3.5" /> {uploadingImage ? 'Uploading…' : formImage ? 'Replace' : 'Upload'}
                    </button>
                    <button type="button" onClick={() => openGalleryPicker('image')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600">
                      Select from Gallery
                    </button>
                  </div>
                  <input
                    value={formImage.startsWith('data:') ? '' : formImage}
                    onChange={e => { setEditing({ ...editing, imageUrl: e.target.value }); clearError('imageUrl'); }}
                    placeholder="Or paste HTTPS image URL"
                    className={`w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 ${
                      formErrors.imageUrl ? 'border-red-300 focus:ring-red-300' : 'border-slate-200 focus:ring-blue-500/30'
                    }`}
                  />
                  {formErrors.imageUrl && <p className="text-xs text-red-500 mt-1">{formErrors.imageUrl}</p>}
                  {formImage && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white p-3 flex justify-center">
                      <img src={formImage} alt="Preview" className="max-h-40 max-w-full rounded-lg object-contain"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, or WEBP · one image only</p>
                </div>

                {/* Video — choose one */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> Video <span className="text-slate-400 font-medium normal-case">(choose one)</span>
                    </label>
                    {formVideo && (
                      <button type="button" onClick={() => setEditing({ ...editing, videoUrl: '', video_url: null })}
                        className="text-[11px] font-bold text-red-500 hover:text-red-600">Remove</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button type="button" onClick={() => openGalleryPicker('video')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600">
                      Select existing video
                    </button>
                  </div>
                  <input
                    value={formVideo}
                    onChange={e => { setEditing({ ...editing, videoUrl: e.target.value }); clearError('videoUrl'); }}
                    placeholder="Or paste HTTPS YouTube / Vimeo / mp4 URL"
                    className={`w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 ${
                      formErrors.videoUrl ? 'border-red-300 focus:ring-red-300' : 'border-slate-200 focus:ring-blue-500/30'
                    }`}
                  />
                  {formErrors.videoUrl && <p className="text-xs text-red-500 mt-1">{formErrors.videoUrl}</p>}
                  {formVideo && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video">
                      {getVideoEmbed(formVideo) ? (
                        <iframe src={getVideoEmbed(formVideo)!} title="Video preview" className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      ) : isDirectVideo(formVideo) ? (
                        <video controls className="w-full h-full object-contain" src={formVideo} poster={formImage || undefined} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/70 p-4">
                          <Film className="w-8 h-8" />
                          <a href={formVideo} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-300 hover:underline">
                            <ExternalLink className="w-3 h-3" /> Open video URL
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">One video only · HTTPS URL or gallery selection</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Display Order</label>
                  <input type="number" value={orderOf(editing)}
                    onChange={e => setEditing({ ...editing, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date</label>
                  <input type="text" readOnly value={editing.created_at ? fmtDate(editing.created_at) : 'Set on create'}
                    className="w-full px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-500" />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={activeOf(editing)}
                    onChange={e => setEditing({ ...editing, isActive: e.target.checked })} className="rounded" />
                  Published
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700" title="Lowest display order appears first on the About page">
                  <input
                    type="checkbox"
                    checked={orderOf(editing) === minOrder && !!items.length}
                    onChange={e => {
                      if (e.target.checked) setEditing({ ...editing, priority: minOrder - 1 });
                      else setEditing({ ...editing, priority: minOrder + 1 });
                    }}
                    className="rounded"
                  />
                  Featured <span className="text-[10px] text-slate-400">(top of order)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end p-4 border-t border-slate-200 sticky bottom-0 bg-white">
              <button onClick={closeForm} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={save} disabled={saving || uploadingImage}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : editing.id ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery picker (single select) */}
      {galleryPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setGalleryPicker(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">
                Select one {galleryPicker === 'image' ? 'image' : 'video'}
              </h3>
              <button onClick={() => setGalleryPicker(null)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-3 overflow-y-auto flex-1">
              {galleryLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
                </div>
              ) : (() => {
                const options = galleryItems.filter(g =>
                  galleryPicker === 'image'
                    ? !!(g.imageUrl || g.image)
                    : !!(g.videoUrl || g.video_url),
                );
                if (options.length === 0) {
                  return (
                    <p className="text-sm text-slate-400 text-center py-8">
                      No {galleryPicker === 'image' ? 'images' : 'videos'} in gallery.
                    </p>
                  );
                }
                return (
                  <div className="space-y-2">
                    {options.map(g => (
                      <button key={g.id} type="button" onClick={() => selectGalleryMedia(g)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors">
                        <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {galleryPicker === 'image' ? (
                            <img src={g.imageUrl || g.image || ''} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Play className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{g.title}</p>
                          <p className="text-xs text-slate-400 truncate">{g.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Public-style preview */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreview(null)}>
          <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-slate-800">Public preview</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">About page appearance</p>
              </div>
              <button onClick={() => setPreview(null)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 md:p-6">
              <PublicTestimonialCard item={preview} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Mirrors the About page testimonial card layout. */
function PublicTestimonialCard({ item }: { item: Testimonial }) {
  const video = videoOf(item);
  const image = imgOf(item);
  const embed = video ? getVideoEmbed(video) : null;
  const direct = video ? isDirectVideo(video) : false;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid md:grid-cols-2">
      <div className="relative min-h-[200px] bg-slate-900 aspect-video md:aspect-auto">
        {embed ? (
          <iframe src={embed} title={`${item.name} testimonial`} className="absolute inset-0 w-full h-full" allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        ) : direct && video ? (
          <video controls className="absolute inset-0 w-full h-full object-cover" src={video} poster={image || undefined} />
        ) : image ? (
          <img src={image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#25338d] to-[#1a2670]">
            <Quote className="w-14 h-14 text-white/25" />
          </div>
        )}
      </div>
      <div className="p-6 md:p-8 flex flex-col justify-center">
        <Quote className="w-6 h-6 text-blue-600/40 mb-4" />
        <p className="text-slate-800 text-base leading-relaxed mb-6">&ldquo;{item.quote}&rdquo;</p>
        <div className="flex items-center gap-3">
          {image ? (
            <img src={image} alt={item.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-50" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-[#1a2670] flex items-center justify-center text-white font-bold">
              {item.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-bold text-slate-900">{item.name}</h3>
            <p className="text-sm text-slate-500">{item.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error, required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
          error ? 'border-red-300 focus:ring-red-300 bg-red-50' : 'border-slate-200 focus:ring-blue-500/30'
        }`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Textarea({ label, value, onChange, error, required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
          error ? 'border-red-300 focus:ring-red-300 bg-red-50' : 'border-slate-200 focus:ring-blue-500/30'
        }`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
