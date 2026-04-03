"use client";

import React from 'react';
import { Sidebar } from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50 font-sans">
      <Sidebar aria-label="Admin Navigation" />
      <main className="flex-1 ml-64 min-h-screen transition-all duration-300">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
          <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-white">System Admin</span>
              <span className="text-[10px] text-slate-400">Total Control Mode</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
              A
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
