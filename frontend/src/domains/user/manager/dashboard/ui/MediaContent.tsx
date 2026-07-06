import React, { useState, useRef } from 'react';
import { Upload, Trash2, Edit, Film, Image, File, X, Check, Download } from 'lucide-react';

interface MediaItem {
  id: number;
  type: 'image' | 'video' | 'document';
  src: string;
  label: string;
  size: string;
  date: string;
}

export default function MediaContent() {
  const [items, setItems] = useState<MediaItem[]>([
    { id: 1, type: 'video', src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80', label: 'Hero Video 1', size: '24 MB', date: '2026-06-15' },
    { id: 2, type: 'image', src: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=400&q=80', label: 'About Us Banner', size: '3.2 MB', date: '2026-06-14' },
    { id: 3, type: 'video', src: 'https://images.unsplash.com/photo-1517077304055-6e89abf092ba?w=400&q=80', label: 'VEX Promo', size: '18 MB', date: '2026-06-12' },
    { id: 4, type: 'image', src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80', label: 'Team Photo', size: '4.1 MB', date: '2026-06-10' },
    { id: 5, type: 'document', src: '', label: 'VEX IQ Rules.pdf', size: '1.8 MB', date: '2026-06-08' },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [filter, setFilter] = useState<'all' | MediaItem['type']>('all');
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f: File) => {
      const fileType: MediaItem['type'] = f.type.startsWith('image/') ? 'image' : f.type.startsWith('video/') ? 'video' : 'document';
      const src = fileType === 'document' ? '' : URL.createObjectURL(f);
      setItems(prev => [{
        id: Date.now() + Math.random(),
        type: fileType,
        src,
        label: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
        date: new Date().toISOString().split('T')[0],
      }, ...prev]);
    });
    e.target.value = '';
  };

  const handleDelete = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  const startEdit = (item: MediaItem) => { setEditingId(item.id); setEditLabel(item.label); };
  const saveEdit = () => {
    if (editingId && editLabel.trim()) {
      setItems(prev => prev.map(i => i.id === editingId ? { ...i, label: editLabel } : i));
    }
    setEditingId(null);
  };

  const typeIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'image': return <Image className="w-3.5 h-3.5" />;
      case 'video': return <Film className="w-3.5 h-3.5" />;
      case 'document': return <File className="w-3.5 h-3.5" />;
    }
  };

  const typeColor = (type: MediaItem['type']) => {
    switch (type) {
      case 'image': return 'bg-blue-50 text-blue-600 border-blue-200/50';
      case 'video': return 'bg-purple-50 text-purple-600 border-purple-200/50';
      case 'document': return 'bg-amber-50 text-amber-600 border-amber-200/50';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
            <Film className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Media & Content</h3>
          <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded-full">{items.length} files</span>
        </div>
        <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileAdd} />
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-red text-white text-[11px] font-bold rounded-lg hover:bg-brand-red-dark transition-colors"
        >
          <Upload className="w-3.5 h-3.5" /> Upload
        </button>
      </div>

      <div className="flex gap-1">
        {(['all', 'image', 'video', 'document'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-brand-red/10 text-brand-red' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {f === 'all' ? 'All' : f + 's'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {filtered.map(item => (
          <div key={item.id} className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-all">
            {item.type !== 'document' ? (
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                <img src={item.src} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-amber-50 flex items-center justify-center">
                <File className="w-10 h-10 text-amber-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
              <button onClick={() => startEdit(item)} className="p-1.5 bg-white/90 rounded-lg text-slate-700 hover:bg-white transition-all"><Edit className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-500/90 rounded-lg text-white hover:bg-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="p-2 border-t border-slate-100">
              {editingId === item.id ? (
                <div className="flex items-center gap-1">
                  <input value={editLabel} onChange={e => setEditLabel(e.target.value)}
                    className="flex-1 text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-brand-red/30"
                    autoFocus onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                  />
                  <button onClick={saveEdit} className="p-0.5 text-emerald-500"><Check className="w-3 h-3" /></button>
                  <button onClick={() => setEditingId(null)} className="p-0.5 text-slate-400"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded border ${typeColor(item.type)}`}>
                      {typeIcon(item.type)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{item.size}</span>
                  </div>
                  <p className="text-[10px] text-slate-700 font-medium mt-0.5 truncate">{item.label}</p>
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-slate-300" />
            <p>No {filter === 'all' ? '' : filter + ' '}files yet. Upload one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
