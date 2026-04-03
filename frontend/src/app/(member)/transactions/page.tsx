"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  ChevronRight, 
  Wallet, 
  PiggyBank, 
  PieChart, 
  Landmark,
  ShieldCheck,
  Smartphone,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Transaction {
  transaction_id: number;
  transaction_type: string;
  amount: number;
  status: string;
  reference_no: string;
  related_table: string;
  notes: string;
  created_at: string;
}

interface CategoryTotal {
  category: string;
  count: number;
}

export default function TransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<CategoryTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchApi(`member_transactions?type=${filter}`);
    if (res.status === 'success') {
      setTxns(res.data.transactions);
      setTotals(res.data.totals);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTxns = txns.filter(t => 
    t.reference_no?.toLowerCase().includes(search.toLowerCase()) ||
    t.notes?.toLowerCase().includes(search.toLowerCase()) ||
    t.transaction_type?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && txns.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <div className="w-12 h-12 border-4 border-[#0b2419] border-t-lime-400 rounded-full animate-spin mb-4" title="Loading Ledger" />
       <p className="text-[#0b2419]/40 text-[11px] font-black uppercase tracking-[2px]">Tracing Ledger History...</p>
    </div>
  );

  const getIcon = (related: string) => {
    switch(related) {
      case 'savings_ledger': return PiggyBank;
      case 'shares_ledger': return PieChart;
      case 'loans': return Landmark;
      case 'mpesa_stk_requests': return Smartphone;
      default: return Wallet;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': case 'success': case 'paid': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'pending': case 'initiated': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'failed': case 'rejected': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="pb-20">
      
      {/* Premium Header */}
      <div className="relative bg-[#0b2419] rounded-[40px] overflow-hidden p-12 md:p-16 pb-28 text-white shadow-2xl">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_105%_-5%,rgba(168,224,99,0.15)_0%,transparent_55%)]" />
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                  <FileText size={12} className="text-lime-400" /> Financial Ledger
               </div>
               <h1 className="text-5xl font-black tracking-tighter mb-3">Transactions</h1>
               <p className="text-white/40 text-sm font-medium">Audit trail of all your account movements and activity.</p>
            </div>
            <div className="flex items-center gap-3">
               <button title="Export Ledger" className="h-12 w-12 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                  <Download size={18} />
               </button>
               <button title="Filter by Date" className="h-12 w-12 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                  <Calendar size={18} />
               </button>
            </div>
         </div>
      </div>

      {/* Action Bar */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
         <div className="bg-white border border-emerald-900/5 rounded-3xl shadow-xl p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0b2419] transition-all" size={18} />
               <input 
                 type="text" 
                 title="Search Transactions"
                 placeholder="Search by Reference, Note, or Type..." 
                 className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                 value={search}
                 onChange={e => setSearch(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
               <button 
                 onClick={() => setFilter('all')}
                 className={cn(
                   "px-6 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                   filter === 'all' ? "bg-[#0b2419] text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                 )}
               >
                  All Activity
               </button>
               {totals.map(t => (
                 <button 
                   key={t.category}
                   onClick={() => setFilter(t.category)}
                   className={cn(
                     "px-6 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                     filter === t.category ? "bg-[#0b2419] text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                   )}
                 >
                    {t.category.replace('_ledger', '').replace('_requests', '')} ({t.count})
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Transactions List */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
         <div className="bg-white border border-emerald-900/5 rounded-[40px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Transaction / Type</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Reference</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Amount (KES)</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Date</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     <AnimatePresence mode="popLayout">
                        {filteredTxns.map((t, idx) => {
                           const Icon = getIcon(t.related_table);
                           const isDebit = t.transaction_type.toLowerCase().includes('withdraw') || 
                                          t.transaction_type.toLowerCase().includes('debit') ||
                                          t.transaction_type.toLowerCase().includes('payment');
                           
                           return (
                             <motion.tr 
                               key={t.transaction_id}
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: idx * 0.03 }}
                               className="hover:bg-slate-50 group cursor-default"
                             >
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className={cn(
                                         "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                                         isDebit ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                      )}>
                                         {isDebit ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                      </div>
                                      <div>
                                         <h4 className="text-sm font-black text-[#0b2419] tracking-tight">{t.transaction_type.replace(/_/g, ' ')}</h4>
                                         <div className="flex items-center gap-2 mt-1">
                                            <Icon size={12} className="text-slate-300" />
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t.notes || 'No description'}</p>
                                         </div>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-2 bg-slate-50 text-slate-500 border border-slate-100 rounded-lg px-3 py-1.5 w-fit">
                                      <Clock size={12} />
                                      <span className="text-[10px] font-black tracking-widest">{t.reference_no}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <span className={cn(
                                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                      getStatusColor(t.status)
                                   )}>
                                      <div className="w-1 h-1 rounded-full bg-current" />
                                      {t.status}
                                   </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                   <div className={cn(
                                      "text-sm font-black tracking-tighter",
                                      isDebit ? "text-red-500" : "text-emerald-500"
                                   )}>
                                      {isDebit ? '-' : '+'} {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                   <div className="text-[10px] font-black text-[#0b2419] tracking-tighter shadow-inner px-2 py-1 rounded bg-slate-50 inline-block">
                                      {new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                   </div>
                                   <div className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-widest">
                                      {new Date(t.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                   </div>
                                </td>
                             </motion.tr>
                           );
                        })}
                     </AnimatePresence>
                  </tbody>
               </table>
               {filteredTxns.length === 0 && (
                 <div className="py-32 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-200">
                       <AlertCircle size={40} />
                    </div>
                    <h3 className="text-xl font-black text-[#0b2419] tracking-tight">No Transactions Found</h3>
                    <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto mt-2">We couldn't find any ledger records matching your current filter.</p>
                 </div>
               )}
            </div>
         </div>

         {/* Stats Panel */}
         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 group transition-all hover:shadow-lg hover:shadow-emerald-900/5">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/20">
                   <ShieldCheck size={20} />
                </div>
                <h4 className="text-[10px] font-black text-emerald-900/40 uppercase tracking-[2px] mb-2">Authenticated Ledger</h4>
                <p className="text-xs font-bold text-emerald-900/60 leading-relaxed">Every transaction is cryptographically linked to your member identity and triple-verified against our equity engine.</p>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 group transition-all hover:shadow-lg hover:shadow-amber-900/5">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-amber-900/20">
                   <Clock size={20} />
                </div>
                <h4 className="text-[10px] font-black text-amber-900/40 uppercase tracking-[2px] mb-2">Real-Time Auditing</h4>
                <p className="text-xs font-bold text-amber-900/60 leading-relaxed">Transactions are logged instantly as they occur on the blockchain-inspired centralized ledger environment.</p>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[2px] mb-6">Support & Assistance</h4>
                  <p className="text-sm font-bold text-white/60 mb-6 leading-relaxed">Discrepancy in your ledger? Our compliance team is available 24/7 to reconcile your account.</p>
                  <Link href="/member/support" className="inline-flex items-center gap-2 h-10 px-6 bg-lime-400 text-[#0b2419] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
                     Report Discrepancy <ChevronRight size={14} />
                  </Link>
               </div>
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(163,230,53,0.1),transparent)] transition-all group-hover:scale-110" />
            </div>
         </div>
      </div>

    </div>
  );
}
