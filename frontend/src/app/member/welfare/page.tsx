"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  HeartPulse, 
  History, 
  HelpCircle, 
  ShieldCheck, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronRight, 
  Info, 
  ArrowLeft,
  LifeBuoy,
  Stethoscope,
  Heart,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface WelfareTxn {
  transaction_id: number;
  transaction_type: string;
  amount: number;
  notes: string;
  created_at: string;
}

interface WelfareBenefit {
  situation_id: number;
  title: string;
  description: string;
  max_amount: number;
}

export default function WelfarePage() {
  const [data, setData] = useState<{ welfare_balance: number; history: WelfareTxn[]; benefits: WelfareBenefit[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchApi('member_welfare');
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
       <div className="w-12 h-12 border-4 border-[#0b2419] border-t-lime-400 rounded-full animate-spin mb-4" title="Loading Solidarity Fund" />
       <p className="text-[#0b2419]/40 text-[11px] font-black uppercase tracking-[2px]">Securing Social Fund...</p>
    </div>
  );

  const benefits = data!.benefits;
  const history = data!.history;

  return (
    <div className="pb-20">
      
      {/* Hero Header */}
      <div className="relative bg-[#0b2419] rounded-[40px] overflow-hidden p-12 md:p-16 pb-32 text-white shadow-2xl">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_105%_-5%,rgba(163,230,53,0.15)_0%,transparent_55%)]" />
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                  <LifeBuoy size={12} className="text-lime-400" /> Solidarity Hub
               </div>
               <h1 className="text-5xl font-black tracking-tighter mb-3 transition-transform hover:scale-[1.01] cursor-default">Welfare Fund</h1>
               <p className="text-white/40 text-sm font-medium max-w-lg">Your safety net for life&apos;s unexpected moments. We stand together in times of need.</p>
            </div>
            <Link href="/member/dashboard" className="h-12 px-6 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
               <ArrowLeft size={16} /> Dashboard
            </Link>
         </div>
      </div>

      {/* Stats Float */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-emerald-900/5 rounded-[40px] p-10 shadow-xl flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6">
                  <HeartPulse size={36} />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-300 mb-2">Fund Balance</p>
               <h2 className="text-4xl font-black tracking-tighter text-[#0b2419]">KES {data!.welfare_balance.toLocaleString()}</h2>
            </div>

            <div className="md:col-span-2 bg-white border border-emerald-900/5 rounded-[40px] p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
               <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400 opacity-5 rounded-bl-[100%] -mr-16 -mt-16" />
               <div className="shrink-0 text-center md:text-left">
                  <h3 className="text-xl font-black text-[#0b2419] tracking-tight mb-2">Need Assistance?</h3>
                  <p className="text-slate-400 text-sm font-medium mb-6 max-w-sm">If you are facing a welfare situation, request support from the committee.</p>
                  <Link href="/member/support" className="inline-flex items-center gap-2 h-12 px-8 bg-[#0b2419] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-2xl transition-all active:scale-95">
                     Request Support <PlusCircle size={16} />
                  </Link>
               </div>
               <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2">
                     <Users className="text-emerald-600" size={24} />
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Members</p>
                     <p className="text-xs font-black text-[#0b2419]">Verified</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2">
                     <ShieldCheck className="text-lime-500" size={24} />
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Claims Policy</p>
                     <p className="text-xs font-black text-[#0b2419]">Active</p>
                  </div>
               </div>
            </div>

         </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         {/* Left: History */}
         <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-sm font-black text-[#0b2419] uppercase tracking-widest flex items-center gap-2">
                  <History size={16} className="text-emerald-600" /> Fund Contributions
               </h3>
               <Link href="/member/transactions?type=welfare_ledger" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0b2419]">View All</Link>
            </div>
            
            <div className="bg-white border border-emerald-900/5 rounded-[40px] shadow-sm overflow-hidden">
               <div className="divide-y divide-slate-50">
                  {history.length > 0 ? history.map((t, idx) => (
                    <div key={idx} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-all">
                       <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", t.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                             {t.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-[#0b2419] tracking-tight">{t.transaction_type.replace(/_/g, ' ')}</h4>
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className={cn("text-sm font-black tracking-tighter", t.amount > 0 ? "text-emerald-500" : "text-red-500")}>
                          {t.amount > 0 ? '+' : ''} {t.amount.toLocaleString()}
                       </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center opacity-40">
                       <HelpCircle size={40} className="mx-auto mb-4" />
                       <p className="text-xs font-bold uppercase tracking-widest">No history found</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Right: Benefits */}
         <div className="space-y-8">
            <h3 className="text-sm font-black text-[#0b2419] uppercase tracking-widest px-2 flex items-center gap-2">
               <Heart size={16} className="text-red-500" /> Welfare Benefits
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
               {benefits.length > 0 ? benefits.map((b) => (
                 <div key={b.situation_id} className="bg-white border border-emerald-900/5 rounded-3xl p-6 shadow-sm hover:border-lime-400/30 transition-all group">
                    <div className="flex items-start justify-between gap-4 mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 text-[#0b2419] rounded-xl flex items-center justify-center group-hover:bg-lime-400 transition-all">
                             <Stethoscope size={18} />
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-[#0b2419] tracking-tight">{b.title}</h4>
                             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Max Benefit: KES {b.max_amount.toLocaleString()}</p>
                          </div>
                       </div>
                       <ChevronRight size={18} className="text-slate-200" />
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{b.description}</p>
                 </div>
               )) : (
                 <div className="bg-slate-50/50 border border-emerald-900/5 rounded-3xl p-10 text-center">
                    <Info size={32} className="mx-auto mb-4 text-slate-200" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Standard benefits policy active.</p>
                 </div>
               )}
            </div>

            {/* Info Block */}
            <div className="bg-emerald-900 rounded-[32px] p-10 text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[2px] mb-6">Engagement Policy</h4>
                  <p className="text-sm font-bold text-white/70 leading-relaxed mb-6">Members must have a consistent contribution history of at least 6 months to qualify for full welfare payouts.</p>
                  <div className="h-px bg-white/10 mb-6" />
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                     <Users size={14} /> Shared Responsibility
                  </div>
               </div>
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(163,230,53,0.1),transparent)]" />
            </div>
         </div>

      </div>

    </div>
  );
}
