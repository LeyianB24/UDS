"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  PlusCircle, 
  Download, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Inbox,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function MemberSavingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.append('type', typeFilter);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const res = await fetchApi(`member_savings?${params.toString()}`);
    if (res.status === 'success') {
      setData(res.data);
    }
    setLoading(false);
  }, [typeFilter, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <div className="w-12 h-12 border-4 border-[#0b2419] border-t-[#a3e635] rounded-full animate-spin mb-4" />
       <p className="text-[#0b2419]/40 text-[11px] font-black uppercase tracking-[2px]">Syncing Portfolio...</p>
    </div>
  );

  const stats = [
    { label: 'Total Deposited', value: data?.balances?.total_deposited || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', barColor: 'bg-emerald-500', pct: 100 },
    { label: 'Total Withdrawn', value: data?.balances?.total_withdrawn || 0, icon: ArrowUpCircle, color: 'text-red-500', bg: 'bg-red-50', barColor: 'bg-red-500', pct: (data?.balances?.total_withdrawn / data?.balances?.total_deposited) * 100 || 0 },
    { label: 'Retention Rate', value: ((data?.balances?.net_savings / data?.balances?.total_deposited) * 100).toFixed(1) + '%', icon: ShieldCheck, color: 'text-lime-600', bg: 'bg-lime-50', barColor: 'bg-lime-400', pct: (data?.balances?.net_savings / data?.balances?.total_deposited) * 100 || 0 },
  ];

  return (
    <div className="space-y-0">
      
      {/* Premium Hero Section */}
      <div className="relative bg-[#0b2419] rounded-[32px] overflow-hidden p-10 md:p-14 mb-16 shadow-[0_20px_50px_rgba(11,36,25,0.3)]">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full border border-lime-400 opacity-20" />
          <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full border border-lime-400 opacity-10" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <Link href="/member/dashboard" className="flex items-center gap-2 text-[11px] font-black text-white/40 hover:text-lime-400 uppercase tracking-widest transition-colors">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <span className="text-[9px] font-black text-white/10 uppercase tracking-[2px]">Umoja Drivers Sacco</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-0.5 bg-lime-400 opacity-50 rounded-full" />
                <span className="text-[10px] font-black text-lime-400 uppercase tracking-[2px]">Savings Portfolio</span>
              </div>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-2">Net Withdrawable Balance</p>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
                <span className="text-2xl md:text-3xl font-bold opacity-30 mr-2">KES</span>
                {Number(data?.balances?.net_savings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <div className="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 px-3 py-1.5 rounded-full mb-10">
                <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest leading-none">Interest-bearing · 2.4% APR</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/member/mpesa" className="h-14 px-8 bg-lime-400 text-[#0b2419] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-3 shadow-xl shadow-lime-400/20">
                  <PlusCircle size={18} /> Add Funds
                </Link>
                <Link href="/member/withdraw" className="h-14 px-8 bg-white/5 border border-white/10 text-white/80 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                  <ArrowUpCircle size={18} /> Withdraw
                </Link>
              </div>
            </div>

            {/* Sparkline Visual */}
            <div className="hidden lg:block">
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[2px] mb-6">6-Month Deposit Trend</p>
              <div className="h-24 w-full relative">
                 <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a3e635" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Simplified path generation for visualization */}
                    <path 
                      d={`M ${data?.trend?.data.map((v: number, i: number) => `${(i / 5) * 400},${100 - (v / Math.max(...data.trend.data, 1)) * 80}`).join(' L ')} L 400,100 L 0,100 Z`}
                      fill="url(#trendGradient)"
                    />
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      d={`M ${data?.trend?.data.map((v: number, i: number) => `${(i / 5) * 400},${100 - (v / Math.max(...data.trend.data, 1)) * 80}`).join(' L ')}`}
                      fill="none" 
                      stroke="#a3e635" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                    {data?.trend?.data.map((v: number, i: number) => (
                      <circle 
                        key={i}
                        cx={(i / 5) * 400} 
                        cy={100 - (v / Math.max(...data.trend.data, 1)) * 80} 
                        r="4" 
                        fill="#0b2419" 
                        stroke="#a3e635" 
                        strokeWidth="2"
                      />
                    ))}
                 </svg>
                 <div className="flex justify-between mt-4">
                    {data?.trend?.labels.map((l: string, i: number) => (
                      <span key={i} className="text-[9px] font-black text-white/10 uppercase">{l}</span>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-24 relative z-20 px-4 md:px-0 mb-16">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="bg-white border border-emerald-900/5 p-8 rounded-3xl shadow-[0_10px_40px_rgba(11,36,25,0.08)] group hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6", stat.bg, stat.color)}>
              <stat.icon size={22} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
            <h3 className="text-2xl font-black text-[#0b2419] tracking-tight leading-none mb-5">
              {idx < 2 ? 'KES ' : ''}{idx < 2 ? Number(stat.value).toLocaleString() : stat.value}
            </h3>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${stat.pct}%` }} 
                 className={cn("h-full rounded-full", stat.barColor)} 
               />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transaction History Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-900/5">
           <div className="flex items-center gap-4">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Activity Stream</span>
              <div className="h-px w-8 bg-emerald-900/10" />
           </div>
           
           <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white border border-emerald-900/5 p-1 rounded-2xl flex shadow-sm">
                <button 
                  onClick={() => setTypeFilter('')}
                  className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", typeFilter === '' ? "bg-[#0b2419] text-white" : "text-slate-400 hover:text-[#0b2419]")}
                >All</button>
                <button 
                  onClick={() => setTypeFilter('deposit')}
                  className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2", typeFilter === 'deposit' ? "bg-[#0b2419] text-white" : "text-slate-400 hover:text-[#0b2419]")}
                ><ArrowDownCircle size={12} /> Deposits</button>
                <button 
                  onClick={() => setTypeFilter('withdrawal')}
                  className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2", typeFilter === 'withdrawal' ? "bg-[#0b2419] text-white" : "text-slate-400 hover:text-[#0b2419]")}
                ><ArrowUpCircle size={12} /> Withdrawals</button>
              </div>

              <div className="flex items-center bg-white border border-emerald-900/5 px-4 py-2 rounded-2xl shadow-sm gap-3">
                 <Calendar size={14} className="text-slate-300" />
                 <input type="date" className="bg-transparent border-none p-0 text-[11px] font-bold text-[#0b2419] focus:ring-0 outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} title="Start Date" />
                 <div className="w-px h-3 bg-slate-200" />
                 <input type="date" className="bg-transparent border-none p-0 text-[11px] font-bold text-[#0b2419] focus:ring-0 outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} title="End Date" />
                 <button onClick={loadData} className="w-7 h-7 bg-[#0b2419] text-lime-400 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" aria-label="Filter Results"><ArrowRight size={14} /></button>
              </div>
           </div>
        </div>

        <div className="bg-white border border-emerald-900/5 rounded-[32px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
           <div className="bg-slate-50/50 px-8 py-5 border-b border-emerald-900/5 flex items-center justify-between">
              <span className="text-[11px] font-black text-[#0b2419] uppercase tracking-widest">Recent Activity</span>
              <button 
                title="Download Statement"
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-[#0b2419] uppercase tracking-widest transition-colors"
                aria-label="Download Statement"
              >
                <Download size={14} /> Export List
              </button>
           </div>

           <div className="flex flex-col">
              {data?.history?.map((txn: any) => {
                const isIn = ['deposit','contribution','savings_deposit'].includes(txn.transaction_type.toLowerCase());
                return (
                  <div key={txn.id} className="group flex items-center justify-between px-8 py-6 border-b border-emerald-900/5 last:border-0 hover:bg-[#f0f7f4]/20 transition-all">
                     <div className="flex items-center gap-5">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", isIn ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500")}>
                           {isIn ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                        </div>
                        <div>
                           <p className="text-sm font-black text-[#0b2419] leading-none mb-1">{txn.transaction_type.replace(/_/g, ' ').toUpperCase()}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{txn.notes || 'System processed transaction'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                           <div className="w-1 h-1 bg-emerald-600 rounded-full" />
                           Done
                        </div>
                        <div className="text-right">
                           <p className={cn("text-lg font-black leading-none mb-1 tracking-tighter", isIn ? "text-emerald-600" : "text-red-500")}>
                             {isIn ? '+' : '−'} {Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                             <span className="text-[9px] font-bold opacity-30 ml-1">KES</span>
                           </p>
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                             {new Date(txn.created_at).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                     </div>
                  </div>
                );
              })}

              {data?.history?.length === 0 && (
                <div className="py-24 text-center">
                   <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-slate-200">
                      <Inbox size={40} />
                   </div>
                   <h4 className="text-sm font-black text-[#0b2419] uppercase tracking-widest mb-2">No Transactions Found</h4>
                   <p className="text-xs text-slate-400">Try adjusting your filters or date range.</p>
                </div>
              )}
           </div>
        </div>
      </div>

    </div>
  );
}
