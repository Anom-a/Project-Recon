import React from 'react';
import { motion } from 'motion/react';
import { LogOut, MoreHorizontal, X, Menu, Settings, ChevronLeft } from 'lucide-react';
import BrandLogo from './BrandLogo';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  group?: string;
}

interface SidebarProps {
  items: NavItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  onLogout?: () => void;
  title: string;
  icon: React.ElementType;
  accentColor?: 'red' | 'blue';
  userName?: string;
  userRole?: string;
  collapsed?: boolean;
  drawerOpen?: boolean;
  onCollapseToggle?: () => void;
  onDrawerToggle?: (open: boolean) => void;
}

const groupLabels: Record<string, string> = {
  main: 'Main',
  vex: 'VEX',
  system: 'System',
};

export function Sidebar({
  items,
  activeSection,
  onSectionChange,
  onLogout,
  title,
  userName,
  userRole,
  collapsed = false,
  drawerOpen = false,
  onCollapseToggle,
  onDrawerToggle,
}: SidebarProps) {
  const grouped = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group || 'main';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  const mobilePrimary = items.slice(0, 5);
  const mobileSecondary = items.slice(5);
  const isActiveInMore = !mobilePrimary.some(i => i.id === activeSection);

  const handleNav = (id: string) => {
    onSectionChange(id);
    onDrawerToggle?.(false);
  };

  return (
    <>
      <button
        onClick={() => onDrawerToggle?.(true)}
        className="sidebar-toggle fixed top-3 left-3 z-40 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>

      {drawerOpen && <div className="sidebar-backdrop" onClick={() => onDrawerToggle?.(false)} />}

      <aside
        className={`sidebar${collapsed ? ' collapsed' : ''}${drawerOpen ? ' open' : ''}`}
      >
        <div className="sidebar-header">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-gradient-to-br from-[#1a2670] to-brand-blue-dark border border-brand-blue-dark/20 pl-3 pr-2 py-2.5">
            <button onClick={() => handleNav('dashboard')} className="hover:opacity-80 transition-opacity"><BrandLogo className="sidebar-logo h-7 w-[90px]" /></button>
            <div className="sidebar-header-actions flex items-center gap-1">
              <button
                onClick={() => onCollapseToggle?.()}
                className="sidebar-collapse-btn p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => onDrawerToggle?.(false)}
                className="sidebar-close-btn p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="sidebar-scroll">
          {Object.entries(grouped).map(([group, navItems]) => {
            const hasActive = navItems.some(item => item.id === activeSection);
            const label = groupLabels[group] || group;
            return (
              <div key={group} className="mb-2">
                <div className={`sidebar-group-label flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
                  hasActive ? 'text-brand-red' : 'text-slate-400'
                }`}>
                  <span>{label}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="flex flex-col gap-0.5">
                  {navItems.map(item => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className="sidebar-nav-item flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all"
                        title={collapsed ? item.label : undefined}
                      >
                        {isActive && (
                          <motion.div layoutId="sidebar-active-bar" className="sidebar-active-indicator w-0.5 h-5 rounded-full bg-brand-red shrink-0" />
                        )}
                        {!isActive && <div className="sidebar-active-indicator w-0.5 h-5 shrink-0" />}
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="sidebar-nav-label text-sm whitespace-nowrap overflow-hidden text-ellipsis tracking-wide">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
              {userName?.charAt(0) || 'U'}
            </div>
            <div className="sidebar-user-info min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">{userName || title}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate">{userRole || 'User'}</p>
            </div>
            <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-brand-red hover:bg-brand-red/5 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span className="sidebar-logout-label">Sign out</span>
            </button>
          )}
        </div>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-area-bottom md:hidden">
        <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
          {mobilePrimary.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => { onSectionChange(item.id); }}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[48px] ${isActive ? 'text-brand-red bg-brand-red/5' : 'text-slate-400'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-[9px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
          {mobileSecondary.length > 0 && (
            <button onClick={() => onDrawerToggle?.(true)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[48px] ${isActiveInMore ? 'text-brand-red bg-brand-red/5' : 'text-slate-400'}`}
            >
              <MoreHorizontal className={`w-5 h-5 ${isActiveInMore ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[9px] ${isActiveInMore ? 'font-bold' : 'font-medium'}`}>More</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
