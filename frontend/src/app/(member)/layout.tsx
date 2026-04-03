"use client";

import React from 'react';
import { MemberSidebar } from "@/components/MemberSidebar";
import { Bell, Search, UserCircle, LogOut } from 'lucide-react';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#f7fbf8] dark:bg-[#07130d] text-emerald-950 dark:text-emerald-50 font-sans selection:bg-lime-400/30 selection:text-lime-200">
      <MemberSidebar />
      <main className="flex-1 ml-68 min-h-screen transition-all duration-300">
        
        {/* Top Header */}
        <header className="h-[68px] border-b border-emerald-900/5 dark:border-emerald-800/10 flex items-center justify-between px-10 bg-white/80 dark:bg-emerald-950/40 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <h2 className="text-sm font-black text-emerald-950 dark:text-white uppercase tracking-[1.5px] leading-tight">Umoja Drivers Sacco</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold text-emerald-600/60 dark:text-emerald-400/40 uppercase tracking-widest">Active Member Session</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 flex items-center justify-center text-emerald-900/40 dark:text-emerald-400/40 hover:text-emerald-950 dark:hover:text-emerald-50 transition-colors">
               <Search size={20} />
            </button>
            <button className="relative w-10 h-10 flex items-center justify-center text-emerald-900/40 dark:text-emerald-400/40 hover:text-emerald-950 dark:hover:text-emerald-50 transition-colors">
               <Bell size={20} />
               <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-emerald-900 shadow-sm" />
            </button>
            
            <div className="h-8 w-px bg-emerald-900/10 dark:bg-emerald-800/20" />

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-black text-emerald-950 dark:text-white uppercase tracking-wider leading-none mb-1">Hon. Member</span>
                <span className="text-[9px] font-bold text-emerald-400/40 uppercase tracking-widest">Verified Account</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-900 to-emerald-950 flex items-center justify-center border border-emerald-800/30 text-lime-400 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                 <UserCircle size={22} />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
