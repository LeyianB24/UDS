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
    <div className="min-h-screen flex bg-brand-forest/5 selection:bg-brand-lime/30 selection:text-brand-forest">
      <Sidebar />
      <main className="flex-1 ml-[268px] min-h-screen transition-all duration-300">
        
        {/* Top Header - Replicating Legacy Style */}
        <header className="h-[80px] border-b border-emerald-900/5 flex items-center justify-between px-10 bg-white/90 backdrop-blur-xl sticky top-0 z-40 transition-all duration-300">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <h2 className="text-lg font-extrabold text-[#0F392B] uppercase tracking-tight leading-tight">Admin Portal</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-pulse shadow-[0_0_8px_rgba(208,247,100,0.6)]" />
                   <span className="text-[10px] font-bold text-emerald-900/40 uppercase tracking-widest">Central Control Terminal</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 pr-6 border-r border-[#E5E7EB]">
               <button className="w-10 h-10 flex items-center justify-center text-emerald-900/30 hover:text-[#0F392B] transition-colors">
                  <Search size={22} />
               </button>
               <button className="relative w-10 h-10 flex items-center justify-center text-emerald-900/30 hover:text-[#0F392B] transition-colors">
                  <Bell size={22} />
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
               </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-black text-[#0F392B] uppercase tracking-wider leading-none mb-1">System Root</span>
                <span className="text-[9px] font-bold text-emerald-900/40 uppercase tracking-widest">Super Administrator</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#0F392B] flex items-center justify-center text-[#D0F764] shadow-[0_4px_15px_rgba(15,57,43,0.25)]">
                 <UserCircle size={22} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
