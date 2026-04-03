"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  PieChart, 
  TrendingUp, 
  Award, 
  PlusCircle, 
  RefreshCcw, 
  Globe,
  Inbox,
  ArrowUpRight,
  LogOut,
  Landmark,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function MemberSharesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchApi('member_shares');
    if (res.status === 'success') {
      setData(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <div className="w-12 h-12 border-4 border-[#0b2419] border-t-[#a3e635] rounded-full animate-spin mb-4" />
       <p className="text-[#0b2419]/40 text-[11px] font-black uppercase tracking-[2px]">Evaluating Portfolio...</p>
    </div>
  );

  const stats = [
    { label: 'Ownership Units', value: Number(data?.valuation?.ownership_pct * 100).toFixed(4) + '%', sub: 'Of total SACCO equity', icon: PieChart, color: 'text-emerald-600', bg: 'bg-emerald-50', barColor: 'bg-emerald-500' },
    { label: 'Share Price', value: 'KES ' + Number(data?.valuation?.share_price).toLocaleString(), sub: 'Current valuation', icon: Globe, color: 'text-lime-600', bg: 'bg-lime-50', barColor: 'bg-lime-400' },
    { label: 'Projected Dividend', value: 'KES ' + Number(data?.valuation?.projected_dividend).toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: '12.5% Annual Est.', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', barColor: 'bg-amber-500' },
    { label: 'Capital Gain', value: (data?.valuation?.gain_pct >= 0 ? '+' : '') + Number(data?.valuation?.gain_pct).toFixed(2) + '%', sub: 'Since inception', icon: TrendingUp, color: data?.valuation?.gain_pct >= 0 ? 'text-emerald-600' : 'text-red-500', bg: data?.valuation?.gain_pct >= 0 ? 'bg-emerald-50' : 'bg-red-50', barColor: data?.valuation?.gain_pct >= 0 ? 'bg-emerald-500' : 'bg-red-500' },
  ];

  const gainPct = data?.valuation?.gain_pct || 0;

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
                <span className="text-[10px] font-black text-lime-400 uppercase tracking-[2px]">Equity Portfolio</span>
              </div>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-2">Current Portfolio Value</p>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
                <span className="text-2xl md:text-3xl font-bold opacity-30 mr-2">KES</span>
                {Number(data?.valuation?.portfolio_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-10",
                gainPct >= 0 ? "bg-lime-400/10 border border-lime-400/20 text-lime-400" : "bg-red-400/10 border border-red-400/20 text-red-400"
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", gainPct >= 0 ? "bg-lime-400" : "bg-red-400")} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}% capital growth
                </span>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/member/mpesa" className="h-14 px-8 bg-lime-400 text-[#0b2419] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-3 shadow-xl shadow-lime-400/20">
                  <PlusCircle size={18} /> Buy Shares
                </Link>
                <Link href="/member/withdraw" className="h-14 px-8 bg-white/5 border border-white/10 text-white/80 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                  <Landmark size={18} /> Dividends
                </Link>
                <Link href="/member/exit" className="h-14 px-8 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-3">
                  <LogOut size={18} /> Quit SACCO
                </Link>
              </div>
            </div>

            {/* Sparkline Visual */}
            <div className="hidden lg:block">
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[2px] mb-6">Portfolio Growth History</p>
              <div className="h-24 w-full relative">
                 <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="shareTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a3e635" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {data?.chart?.data?.length > 1 ? (
                      <>
                        <path 
                          d={`M ${data.chart.data.map((v: number, i: number) => `${(i / (data.chart.data.length - 1)) * 400},${100 - (v / Math.max(...data.chart.data, 1)) * 80}`).join(' L ')} L 400,100 L 0,100 Z`}
                          fill="url(#shareTrendGradient)"
                        />
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          d={`M ${data.chart.data.map((v: number, i: number) => `${(i / (data.chart.data.length - 1)) * 400},${100 - (v / Math.max(...data.chart.data, 1)) * 80}`).join(' L ')}`}
                          fill="none" 
                          stroke="#a3e635" 
                          strokeWidth="3" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                        {data.chart.data.map((v: number, i: number) => (
                          <circle 
                            key={i}
                            cx={(i / (data.chart.data.length - 1)) * 400} 
                            cy={100 - (v / Math.max(...data.chart.data, 1)) * 80} 
                            r="4" 
                            fill="#0b2419" 
                            stroke="#a3e635" 
                            strokeWidth="2"
                          />
                        ))}
                      </>
                    ) : (
                      <rect width="400" height="2" y="98" fill="white" fillOpacity="0.1" />
                    )}
                 </svg>
                 <div className="flex justify-between mt-4">
                    {data?.chart?.labels?.map((l: string, i: number) => (
                      <span key={i} className="text-[9px] font-black text-white/10 uppercase">{l}</span>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 -mt-24 relative z-20 px-4 md:px-0 mb-16">
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
            <h3 className={cn("text-2xl font-black tracking-tight leading-none mb-2", stat.color.split(' ')[0] === 'text-emerald-600' || stat.color.split(' ')[0] === 'text-lime-600' ? "text-[#0b2419]" : stat.color)}>
              {stat.value}
            </h3>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-5">{stat.sub}</p>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `100%` }} 
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
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Share Ledger</span>
              <div className="h-px w-8 bg-emerald-900/10" />
           </div>
           
           <button 
             onClick={loadData}
             className="h-10 px-6 bg-white border border-emerald-900/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#0b2419] hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
           >
             <RefreshCcw size={14} /> Refresh Ledger
           </button>
        </div>

        <div className="bg-white border border-emerald-900/5 rounded-[32px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
           <div className="bg-slate-50/50 px-8 py-5 border-b border-emerald-900/5 flex items-center justify-between">
              <span className="text-[11px] font-black text-[#0b2419] uppercase tracking-widest">Transaction History</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data?.history?.length || 0} Records</span>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Reference</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Equity Units</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/5">
                  {data?.history?.map((txn: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-[#f0f7f4]/20 transition-all">
                      <td className="px-8 py-5">
                         <p className="text-sm font-black text-[#0b2419] leading-none mb-1">
                           {new Date(txn.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                         </p>
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">{txn.reference_no}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-[10px]">
                              U
                           </div>
                           <span className="text-sm font-black text-[#0b2419]">{Number(txn.share_units || (txn.total_value / data.valuation.share_price)).toFixed(4)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-400">
                        KES {Number(txn.unit_price || data.valuation.share_price).toLocaleString()}
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-[#0b2419]">KES {Number(txn.total_value).toLocaleString()}</p>
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{txn.transaction_type}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            <ShieldCheck size={12} /> Confirmed
                         </span>
                      </td>
                    </tr>
                  ))}
                  {data?.history?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-slate-200">
                           <Inbox size={40} />
                        </div>
                        <h4 className="text-sm font-black text-[#0b2419] uppercase tracking-widest mb-2">Portfolio Empty</h4>
                        <p className="text-xs text-slate-400">You haven't acquired any shares yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </div>

    </div>
  );
}
