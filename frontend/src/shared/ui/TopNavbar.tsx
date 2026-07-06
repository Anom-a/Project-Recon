import React, { useState, useRef, useEffect } from 'react';
import { Search, RefreshCw, X } from 'lucide-react';

interface TopNavbarProps {
  title: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
  searchValue?: string;
  actions?: React.ReactNode;
}

export function TopNavbar({ title, subtitle, onSearch, searchValue, actions }: TopNavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <header className="sticky top-0 z-20 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6 h-14">
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0">
              {subtitle && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</span>
              )}
            </div>
            <h1 className="font-bold text-base sm:text-lg text-slate-900 truncate leading-tight">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onSearch && (
            <>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={e => onSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue/40 focus:bg-white transition-all w-36 lg:w-48 ${
                    searchFocused ? 'border-brand-blue/40 bg-white' : ''
                  }`}
                />
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 bg-white border border-slate-200 px-1 py-0.5 rounded pointer-events-none">
                  ⌘K
                </kbd>
              </div>
              <button
                onClick={() => { setMobileSearchOpen(true); setTimeout(() => mobileSearchRef.current?.focus(), 100); }}
                className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 touch-target"
                aria-label="Open search"
              >
                <Search className="w-4 h-4" />
              </button>
              {mobileSearchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4 bg-black/20 backdrop-blur-sm sm:hidden" onClick={() => setMobileSearchOpen(false)}>
                  <div className="relative w-full max-w-sm" onClick={e => e.stopPropagation()}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      ref={mobileSearchRef}
                      type="text"
                      placeholder="Search..."
                      value={searchValue}
                      onChange={e => onSearch(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue shadow-lg"
                      autoFocus
                    />
                    <button onClick={() => setMobileSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 touch-target" aria-label="Close search">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-colors touch-target" aria-label="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {actions}
        </div>
      </div>
    </header>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 transition-colors"
      />
    </div>
  );
}
