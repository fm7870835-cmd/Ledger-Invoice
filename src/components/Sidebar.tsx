import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'create' | 'upload' | 'invoices' | 'settings' | 'signup';
  setActiveTab: (tab: 'dashboard' | 'create' | 'upload' | 'invoices' | 'settings' | 'signup') => void;
  user: UserProfile;
  onOpenUpgrade?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: 'dashboard' },
    { id: 'create' as const, label: 'Create Invoice', icon: 'add_notes' },
    { id: 'upload' as const, label: 'Upload Invoice', icon: 'upload_file' },
    { id: 'invoices' as const, label: 'Invoices', icon: 'description' },
    { id: 'signup' as const, label: 'Sign Up / Auth', icon: 'person_add' },
    { id: 'settings' as const, label: 'Settings', icon: 'settings' },
  ];

  const handleNav = (tab: 'dashboard' | 'create' | 'upload' | 'invoices' | 'settings' | 'signup') => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar (The Spine) */}
      <aside className="hidden lg:flex flex-col h-screen w-[280px] bg-black border-r border-[#ddc0be]/30 fixed left-0 top-0 z-40 select-none">
        <div className="p-8">
          <span className="font-headline-lg text-headline-lg text-[#ffdad7] uppercase tracking-wider block">
            Ledger
          </span>
          <span className="font-data-sm text-[10px] text-gray-400 uppercase tracking-widest mt-1 block">
            AI Bookkeeping Engine
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-4 py-4 px-6 text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white border-l-4 border-[#822426] font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="font-label-md text-label-md uppercase tracking-widest">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#a23b3b] flex items-center justify-center text-[#ffcbc8] font-bold text-sm shadow-sm">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white text-xs font-bold truncate">{user.name}</span>
              <span className="text-gray-400 text-[10px] uppercase tracking-tighter truncate">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top AppBar */}
      <header className="flex lg:hidden justify-between items-center px-4 py-3 w-full z-50 fixed top-0 left-0 bg-black shadow-sm text-white border-b border-[#ddc0be]/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1 hover:bg-white/10 rounded transition-colors text-[#ffdad7]"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
          <span className="font-headline-md text-headline-md text-[#ffdad7] tracking-wider uppercase">
            Ledger
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#a23b3b] flex items-center justify-center text-[#ffcbc8] text-[10px] font-bold">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black pt-16 flex flex-col justify-between">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-4 p-4 text-left rounded transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white border-l-4 border-[#822426]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-label-md text-label-md uppercase tracking-widest">{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#a23b3b] flex items-center justify-center text-[#ffcbc8] font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-bold">{user.name}</span>
                <span className="text-gray-400 text-xs">{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
