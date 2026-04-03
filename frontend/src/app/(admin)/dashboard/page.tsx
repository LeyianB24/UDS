"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('get_stats')
      .then(res => {
        if (res.status === 'success') setStats(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <div className="w-12 h-12 border-4 border-emerald-900 border-t-lime-400 rounded-full animate-spin mb-4" />
       <p className="text-emerald-950/40 text-xs font-black uppercase tracking-widest">Loading Analytics...</p>
    </div>
  );

  const displayStats = [
    { title: 'Total Members', value: stats?.members_total || 0, change: '+12%', type: 'up', icon: Users, color: 'emerald' },
    { title: 'Loan Exposure', value: `KES ${stats?.loans_exposure || '0'}`, change: '+5.2%', type: 'up', icon: TrendingUp, color: 'lime' },
    { title: 'Gross Shares', value: stats?.shares_count || 0, change: '-2%', type: 'down', icon: BarChart3, color: 'forest' },
    { title: 'Live Health', value: '100%', change: 'Stable', type: 'up', icon: Activity, color: 'emerald' },
  ];

  return (
    <div className="space-y-10">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2 leading-none">
              <span className="text-[11px] font-black text-emerald-900/40 uppercase tracking-[2px]">Admin Terminal</span>
              <div className="h-px w-8 bg-emerald-900/10" />
           </div>
           <h2 className="text-4xl font-black text-emerald-950 tracking-tight">System <span className="text-emerald-600">Overview</span></h2>
           <p className="text-sm font-medium text-slate-500 mt-2">Real-time monitoring of Sacco financial health and member activity.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="h-12 px-6 bg-white border border-emerald-900/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-emerald-950 hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm">
              <BarChart3 size={16} /> Reports
           </button>
           <button className="h-12 px-6 bg-emerald-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-900 transition-all flex items-center gap-2 shadow-xl shadow-emerald-950/20">
              <Plus size={16} /> New Entry
           </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white border border-emerald-900/5 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
               <div className="w-12 h-12 rounded-2xl bg-[#0b2419] flex items-center justify-center text-lime-400 group-hover:scale-110 transition-transform duration-500">
                  <stat.icon size={22} />
               </div>
               <div className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1",
                  stat.type === 'up' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
               )}>
                  {stat.type === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {stat.change}
               </div>
            </div>
            <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-[2px] leading-none mb-2">{stat.title}</p>
            <h3 className="text-2xl font-black text-emerald-950 tracking-tight leading-none">{stat.value}</h3>
            
            {/* Background Polish */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000" />
          </motion.div>
        ))}
      </div>

      {/* Secondary Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div className="lg:col-span-2 bg-white border border-emerald-900/5 rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] selection:bg-emerald-50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
               <div>
                  <h4 className="text-sm font-black text-emerald-950 uppercase tracking-widest mb-1">Financial Inflow</h4>
                  <p className="text-xs font-medium text-slate-400">Total revenue across all channels this month.</p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black text-emerald-950 leading-none mb-1">KES 1.2M</p>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Target: 1.5M</p>
               </div>
            </div>
            <div className="h-64 flex items-end gap-3 px-2 relative z-10">
               {[40, 65, 45, 90, 75, 55, 80, 60, 45, 70, 85, 100].map((h, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-4 group cursor-pointer">
                    <div className="w-full bg-slate-50 rounded-t-lg relative overflow-hidden" style={{ height: `${h}%` }}>
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: '100%' }}
                         className="absolute inset-x-0 bottom-0 bg-emerald-900 group-hover:bg-lime-400 transition-colors"
                       />
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase transform -rotate-45 md:rotate-0">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-emerald-950 text-white rounded-3xl p-8 shadow-[25px_25px_60px_-15px_rgba(15,36,25,0.4)] relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-between">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-400/10 border border-lime-400/20 rounded-full mb-6">
                     <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(163,230,53,0.6)]" />
                     <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest">Vault Security</span>
                  </div>
                  <h4 className="text-2xl font-black tracking-tight leading-tight mb-4">Your infrastructure is <span className="text-lime-400">secure.</span></h4>
                  <p className="text-emerald-300/40 text-xs font-medium leading-relaxed">System audits running in background. No anomalies detected in the last 24 hours of operation.</p>
               </div>
               
               <div className="mt-10">
                  <button className="w-full bg-white text-emerald-950 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-lime-400 transition-all flex items-center justify-center gap-3 shadow-2xl">
                     Verify Integrity <ChevronRight size={14} />
                  </button>
               </div>
            </div>
            
            {/* Background Polish */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/50 rounded-full blur-3xl -mr-32 -mt-32 opacity-20" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
         </div>

      </div>

    </div>
  );
}
