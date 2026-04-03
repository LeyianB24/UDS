"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  History, 
  TrendingUp, 
  ArrowUpRight, 
  PiggyBank, 
  History as HistoryIcon,
  ShieldCheck,
  ChevronRight,
  Info,
  ArrowLeft,
  PieChart,
  Calendar,
  Download,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Contribution {
  transaction_id: number;
  transaction_type: string;
  amount: number;
  related_table: string;
  notes: string;
  created_at: string;
}

interface Summary {
  related_table: string;
  total: number | string;
}

export default function ContributionsPage() {
  const [data, setData] = useState<{ contributions: Contribution[]; summary: Summary[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchApi('member_contributions');
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
       <div className="w-12 h-12 border-4 border-[#0b2419] border-t-lime-400 rounded-full animate-spin mb-4" title="Loading Contributions" />
       <p className="text-[#0b2419]/40 text-[11px] font-black uppercase tracking-[2px]">Aggregating Fund Data...</p>
    </div>
  );

  const contributions = data!.contributions;
  const summary = data!.summary;

  return (
    <div className="pb-20">
      
      {/* Header */}
      <div className="relative bg-[#0b2419] rounded-[40px] overflow-hidden p-12 md:p-16 pb-28 text-white shadow-2xl">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_105%_-5%,rgba(168,224,99,0.15)_0%,transparent_55%)]" />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                  <TrendingUp size={12} className="text-lime-400" /> Capital Growth
               </div>
               <h1 className="text-5xl font-black tracking-tighter mb-3">Contributions</h1>
               <p className="text-white/40 text-sm font-medium">History of your equity and savings deposits across all funds.</p>
            </div>
            <div className="flex items-center gap-3">
               <button title="Download History" className="h-12 w-12 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                  <Download size={18} />
               </button>
               <Link href="/member/dashboard" className="h-12 px-6 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                  <ArrowLeft size={16} /> Dashboard
               </Link>
            </div>
         </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {summary.map((s, idx) => {
               const name = s.related_table.replace('_ledger', '').toUpperCase();
               return (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-white border border-emerald-900/5 rounded-[32px] p-8 shadow-xl"
                 >
                    <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-300 mb-2">{name} TOTAL</p>
                    <h3 className="text-2xl font-black text-[#0b2419] tracking-tighter">KES {Number(s.total).toLocaleString()}</h3>
                    <div className="h-1 w-8 bg-lime-400 rounded-full mt-4" />
                 </motion.div>
               );
            })}
            {summary.length === 0 && (
               <div className="md:col-span-4 bg-white border border-dashed border-slate-200 rounded-[32px] p-8 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest">
                  No contribution history found.
               </div>
            )}
         </div>
      </div>

      {/* Main List */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <h3 className="text-sm font-black text-[#0b2419] uppercase tracking-widest px-2 flex items-center gap-2">
               <HistoryIcon size={16} className="text-emerald-600" /> Recent Deposits
            </h3>
            
            <div className="bg-white border border-emerald-900/5 rounded-[40px] shadow-sm overflow-hidden">
               <div className="divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">
                     {contributions.map((c, idx) => (
                       <motion.div 
                         key={c.transaction_id}
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: idx * 0.05 }}
                         className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-all"
                       >
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
                                <ArrowUpRight size={20} />
                             </div>
                             <div>
                                <h4 className="text-sm font-black text-[#0b2419] tracking-tight">{c.transaction_type.replace(/_/g, ' ')}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <Calendar size={12} className="text-slate-300" />
                                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                      {new Date(c.created_at).toLocaleDateString()} &bull; {c.notes || 'Automated Deposit'}
                                   </p>
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-sm font-black text-emerald-500 tracking-tighter shadow-inner px-3 py-1 rounded-lg bg-emerald-50 inline-block">
                                + KES {c.amount.toLocaleString()}
                             </div>
                          </div>
                       </motion.div>
                     ))}
                  </AnimatePresence>

                  {contributions.length === 0 && (
                    <div className="py-32 text-center opacity-40">
                       <AlertCircle size={40} className="mx-auto mb-4" />
                       <p className="text-xs font-bold uppercase tracking-widest">No contribution history recorded</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-8">
            <h3 className="text-sm font-black text-[#0b2419] uppercase tracking-widest px-2 flex items-center gap-2">
               <PieChart size={16} className="text-lime-500" /> Distribution
            </h3>
            
            <div className="bg-white border border-emerald-900/5 rounded-[40px] p-8 shadow-sm">
               <div className="space-y-6">
                  {summary.map((s, idx) => (
                    <div key={idx}>
                       <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#0b2419]">{s.related_table.replace('_ledger', '')}</span>
                          <span className="text-[10px] font-black text-slate-400">KES {Number(s.total).toLocaleString()}</span>
                       </div>
                       <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '65%' }} // Placeholder logic
                            className="h-full bg-emerald-500 rounded-full"
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-[#0b2419] rounded-[32px] p-10 text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <ShieldCheck size={32} className="text-lime-400 mb-6" />
                  <h4 className="text-sm font-black tracking-tight mb-2">Verified Equity</h4>
                  <p className="text-white/40 text-[10px] font-medium leading-relaxed">Your contributions are audited monthly and secured by the cooperative integrity engine.</p>
               </div>
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(163,230,53,0.1),transparent)]" />
            </div>
         </div>
      </div>

    </div>
  );
}
