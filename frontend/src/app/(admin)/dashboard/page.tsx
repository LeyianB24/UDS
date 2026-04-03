"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
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
       <div className="w-12 h-12 border-4 border-[#0F392B] border-t-[#D0F764] rounded-full animate-spin mb-4" />
       <p className="text-[#0F392B]/40 text-[11px] font-black uppercase tracking-[2px]">Syncing USMS Records...</p>
    </div>
  );

  const displayStats = [
    { title: 'Registered Members', value: stats?.members_total || 0, change: '+12%', type: 'up', icon: Users },
    { title: 'Loan Exposure', value: `KES ${stats?.loans_exposure || '0'}`, change: '+5.2%', type: 'up', icon: TrendingUp },
    { title: 'Shares Portfolio', value: stats?.shares_count || 0, change: '-2%', type: 'down', icon: BarChart3 },
    { title: 'System Health', value: '100%', change: 'Stable', type: 'up', icon: Activity },
  ];

  return (
    <div className="space-y-12">
      
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2 leading-none">
              <span className="text-[11px] font-black text-emerald-900/40 uppercase tracking-[2px]">Admin Terminal</span>
              <div className="h-px w-8 bg-emerald-900/10" />
           </div>
           <h2 className="text-3xl font-black text-[#0F392B] underline decoration-[#D0F764] underline-offset-8 decoration-4 tracking-tight">System Overview</h2>
           <p className="text-sm font-medium text-slate-500 mt-4 max-w-lg">Monitoring financial inflow, loan performance, and member growth from the unified command center.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="h-14 px-8 bg-white border border-emerald-900/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#0F392B] hover:bg-emerald-50 transition-all flex items-center gap-3 shadow-md">
              <BarChart3 size={18} /> Analytical Reports
           </button>
           <button className="h-14 px-8 bg-[#0F392B] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#134e3b] transition-all flex items-center gap-3 shadow-xl shadow-[#0F392B]/20">
              <Plus size={18} /> Add Member
           </button>
        </div>
      </div>

      {/* Legacy Optimized Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {displayStats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="stat-card group"
          >
            <div className="flex items-center justify-between mb-8">
               <div className="w-12 h-12 rounded-xl bg-[#0F392B] flex items-center justify-center text-[#D0F764] group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#0F392B]/20">
                  <stat.icon size={22} />
               </div>
               <div className={cn(
                  "px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1.5",
                  stat.type === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
               )}>
                  {stat.type === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {stat.change}
               </div>
            </div>
            <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-[2.5px] leading-none mb-3">{stat.title}</p>
            <h3 className="text-2xl font-black text-[#0F392B] tracking-tighter leading-none">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Financial Inflow Card */}
         <div className="lg:col-span-2 bg-white border border-emerald-900/5 rounded-3xl p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] selection:bg-[#D0F764]/20">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h4 className="text-[11px] font-black text-[#0F392B] uppercase tracking-[3px] mb-2 leading-none">Revenue Stream</h4>
                  <p className="text-xs font-semibold text-slate-400">Monthly inflow across all active channels.</p>
               </div>
               <div className="text-right">
                  <p className="text-3xl font-black text-[#0F392B] leading-none mb-2 tracking-tighter self-end">KES 1.2M</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">12.5% vs Last Month</p>
               </div>
            </div>
            <div className="h-64 flex items-end gap-3 px-2">
               {[40, 65, 45, 90, 75, 55, 80, 60, 45, 70, 85, 100].map((h, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-4 group cursor-pointer">
                    <div className="w-full bg-[#f0f7f4] rounded-t-xl relative overflow-hidden" style={{ height: `${h}%` }}>
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: '100%' }}
                         className="absolute inset-x-0 bottom-0 bg-[#0F392B] group-hover:bg-[#D0F764] transition-colors"
                       />
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Security Status Card */}
         <div className="bg-[#0F392B] text-white rounded-3xl p-10 shadow-[25px_25px_60px_-15px_rgba(15,36,25,0.4)] relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D0F764]/10 border border-[#D0F764]/20 rounded-full mb-8">
                  <div className="w-1.5 h-1.5 bg-[#D0F764] rounded-full animate-pulse shadow-[0_0_8px_rgba(208,247,100,0.6)]" />
                  <span className="text-[10px] font-black text-[#D0F764] uppercase tracking-widest">Vault Secure</span>
               </div>
               <h4 className="text-2xl font-black tracking-tight leading-tight mb-6">Your data is <span className="text-[#D0F764]">verified.</span></h4>
               <p className="text-emerald-300/40 text-[13px] font-semibold leading-relaxed">No anomalies detected in the last 24 hours of operation across 3 portals.</p>
            </div>
            
            <div className="relative z-10">
               <button className="w-full h-14 bg-[#D0F764] text-[#0F392B] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3 shadow-2xl">
                  Run Integrity Audit <ChevronRight size={18} />
               </button>
            </div>
            
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20 pointer-events-none" />
         </div>

      </div>

    </div>
  );
}
