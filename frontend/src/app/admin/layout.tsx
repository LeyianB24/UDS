"use client";

import React from 'react';
import { Sidebar } from "@/components/Sidebar";
import { Search, Bell, UserCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[var(--background)] selection:bg-[var(--brand-lime)]/30 selection:text-[var(--brand-forest)] transition-colors duration-500">
      <Sidebar />
      <main className="flex-1 ml-[268px] min-h-screen transition-all duration-300">
        
        {/* Top Header - High Fidelity Terminal */}
        <header className="h-[80px] border-b border-[var(--border-color)] flex items-center justify-between px-10 bg-[var(--bg-surface)] backdrop-blur-xl sticky top-0 z-40 transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <h2 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight leading-tight">Admin Terminal</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-1.5 h-1.5 bg-[var(--brand-lime)] rounded-full animate-pulse shadow-[0_0_8px_rgba(208,247,100,0.6)]" />
                   <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Unified Sacco Management System</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 pr-6 border-r border-[var(--border-color)]">
               <button title="Search Terminal" className="w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  <Search size={20} />
               </button>
               <button title="Notifications" className="relative w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  <Bell size={20} />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-surface)] shadow-sm" />
               </button>
               <button title="Settings" className="w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  <Settings size={20} />
               </button>
            </div>
            
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-wider leading-none mb-1 group-hover:text-[var(--brand-lime)] transition-colors">Root Access</span>
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">System Overseer</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-forest)] flex items-center justify-center text-[var(--brand-lime)] shadow-[0_4px_15px_rgba(15,57,43,0.25)] border border-[var(--brand-lime)]/20 transition-transform group-hover:scale-105">
                 <UserCircle size={22} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
