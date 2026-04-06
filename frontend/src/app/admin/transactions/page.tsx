"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Download, 
  Filter, 
  Calendar, 
  User, 
  FileText,
  CreditCard,
  ShieldCheck,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

// Page Animation Variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function GoldenLedgerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: '',
    type: '',
    start: '',
    end: ''
  });

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetchApi(`admin/transactions?${query}`);
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (e) {
      console.error("Ledger sync failure:", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const stats = [
    { label: 'Capital Inflow', val: data?.stats?.total_in || 0, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Capital Outflow', val: data?.stats?.total_out || 0, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Ledger Depth', val: data?.stats?.count || 0, icon: Database, color: 'text-[var(--brand-lime)]', bg: 'bg-[var(--brand-forest)]/10', isCount: true },
    { label: 'Net Liquidity', val: (data?.stats?.total_in || 0) - (data?.stats?.total_out || 0), icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-12 pb-20"
    >
      
      {/* HEADER TIER */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2 leading-none">
              <span className="text-[11px] font-black text-[var(--brand-lime)] bg-[var(--brand-forest)] px-3 py-1 rounded-full uppercase tracking-[2px]">Treasury Monitor</span>
              <div className="h-px w-8 bg-[var(--border-color)] opacity-20" />
           </div>
           <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-main)] tracking-tighter leading-tight">
              The Golden <span className="text-[var(--brand-forest)] underline decoration-[var(--brand-lime)] decoration-8 underline-offset-4">Ledger.</span>
           </h2>
           <p className="text-sm font-bold text-[var(--text-muted)] mt-6 max-w-xl leading-relaxed uppercase tracking-wider opacity-60">
              High-fidelity surveillance of all system capital flows. Absolute transparency enforced through the immutable Golden Ledger vault.
           </p>
        </div>
        <div className="flex items-center gap-4">
           <button className="h-14 px-8 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] hover:bg-[var(--bg-primary)] transition-all flex items-center gap-3 shadow-sm active:scale-95">
              <Download size={18} /> Export Protocol
           </button>
           <button className="h-14 px-8 bg-[var(--brand-forest)] text-[var(--brand-lime)] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--text-main)] transition-all flex items-center gap-3 shadow-2xl shadow-emerald-950/20 active:scale-95">
              <ShieldCheck size={18} /> Audit Verification
           </button>
        </div>
      </motion.div>

      {/* STATS TIERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="group bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[40px] p-8 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 relative overflow-hidden"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500", stat.bg, stat.color)}>
               <stat.icon size={26} />
            </div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px] opacity-40 leading-none mb-3">{stat.label}</p>
            <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tighter leading-none mb-2">
               {stat.isCount ? stat.val : `KES ${Number(stat.val).toLocaleString()}`}
            </h3>
            
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[var(--text-main)] group-hover:scale-125 transition-transform duration-1000">
                <stat.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* FILTER & TABLE SECTION */}
      <motion.div variants={itemVariants} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[48px] overflow-hidden shadow-sm">
        
        {/* Advanced Filter Mesh */}
        <div className="p-8 lg:p-10 border-b border-[var(--border-color)] space-y-8">
           <div className="flex flex-col lg:flex-row gap-6">
              <div className="relative flex-1 group">
                 <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-lime)] transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Query Registry (Reference, Notes, Entity)..." 
                   className="w-full h-16 pl-16 pr-8 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-[24px] text-sm font-black uppercase tracking-widest text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 focus:ring-4 focus:ring-[var(--brand-lime)]/10 focus:border-[var(--brand-lime)]/50 transition-all outline-none"
                   value={filters.q}
                   onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                 />
              </div>
              <div className="flex items-center gap-4 px-6 py-4 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-[24px] min-w-[240px]">
                 <Filter size={18} className="text-[var(--text-muted)]" />
                 <select 
                   className="bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] cursor-pointer w-full"
                   value={filters.type}
                   onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                 >
                   <option value="">Full Streams</option>
                   <option value="deposit">Deposits</option>
                   <option value="withdrawal">Withdrawals</option>
                   <option value="loan_disbursement">Loan Payouts</option>
                   <option value="loan_repayment">Loan Repayments</option>
                   <option value="share_capital">Share Equity</option>
                 </select>
              </div>
           </div>

           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-[24px]">
                 <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">From:</span>
                 <input 
                   type="date" 
                   className="bg-transparent border-none outline-none text-xs font-black text-[var(--text-main)] w-full"
                   value={filters.start}
                   onChange={(e) => setFilters({ ...filters, start: e.target.value })}
                 />
              </div>
              <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-[24px]">
                 <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">To:</span>
                 <input 
                   type="date" 
                   className="bg-transparent border-none outline-none text-xs font-black text-[var(--text-main)] w-full"
                   value={filters.end}
                   onChange={(e) => setFilters({ ...filters, end: e.target.value })}
                 />
              </div>
              <button 
                onClick={() => setFilters({ q: '', type: '', start: '', end: '' })}
                className="h-14 px-8 bg-[var(--bg-primary)] text-[var(--text-muted)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--text-main)] hover:text-white transition-all active:scale-95"
              >
                 Reset Mesh
              </button>
           </div>
        </div>

        {/* Ledger Terminal */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg-primary)]/30 border-b border-[var(--border-color)]">
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Reference & Chronology</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Entity / Party</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Classification</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Narration</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Net Value (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              <AnimatePresence mode='popLayout'>
                {data?.transactions?.map((tx: any, idx: number) => {
                  const isIn = ['deposit','income','revenue_inflow','loan_repayment','share_capital'].includes(tx.transaction_type);
                  return (
                    <motion.tr 
                      key={tx.transaction_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-[var(--bg-primary)]/30 transition-all cursor-default"
                    >
                      {/* Ref */}
                      <td className="px-10 py-8">
                        <div className="space-y-1.5">
                           <div className="flex items-center gap-2 text-sm font-black text-[var(--text-main)] tracking-tight">
                              <ShieldCheck size={14} className="text-[var(--brand-lime)]" />
                              {tx.reference_no}
                           </div>
                           <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                              {new Date(tx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </div>
                      </td>

                      {/* Party */}
                      <td className="px-10 py-8">
                        {tx.member_id ? (
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[var(--brand-forest)] text-[var(--brand-lime)] flex items-center justify-center font-black text-xs">
                                 {tx.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-[var(--text-main)] leading-none mb-1 tracking-tight">{tx.full_name}</p>
                                 <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-40">MEMBER_ID: {tx.member_id}</p>
                              </div>
                           </div>
                        ) : (
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] text-[var(--text-muted)] flex items-center justify-center font-black text-xs">
                                 <Database size={16} />
                              </div>
                              <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">System Treasury</span>
                           </div>
                        )}
                      </td>

                      {/* Class */}
                      <td className="px-10 py-8">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                          isIn ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" : "bg-rose-500/5 text-rose-500 border-rose-500/10"
                        )}>
                           {isIn ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                           {tx.transaction_type.replace(/_/g, ' ')}
                        </div>
                      </td>

                      {/* Narration */}
                      <td className="px-10 py-8">
                        <p className="text-[11px] font-medium text-[var(--text-muted)] max-w-xs leading-relaxed italic cursor-help" title={tx.notes}>
                           {tx.notes || 'No terminal narration.'}
                        </p>
                      </td>

                      {/* Value */}
                      <td className="px-10 py-8 text-right">
                         <p className={cn(
                           "text-base font-black tracking-tighter leading-none mb-1",
                           isIn ? "text-emerald-500" : "text-rose-500"
                         )}>
                           {isIn ? '+' : '-' } KES {Number(tx.amount).toLocaleString()}
                         </p>
                         <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">Balance Verified</p>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {loading && !data && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                        <div className="w-10 h-10 border-2 border-[var(--brand-lime)]/20 border-t-[var(--brand-lime)] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[4px]">Accessing Golden Ledger...</p>
                    </td>
                  </tr>
              )}

              {data?.transactions?.length === 0 && !loading && (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-[var(--bg-primary)] rounded-[40px] flex items-center justify-center text-[var(--text-muted)] opacity-20 mb-8 border border-[var(--border-color)]">
                        <History size={48} />
                      </div>
                      <h4 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-2">Vault Empty</h4>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">No immutable records matched the query mesh.</p>
                      <button 
                        onClick={() => setFilters({ q: '', type: '', start: '', end: '' })}
                        className="mt-10 text-[10px] font-black text-[var(--brand-lime)] bg-[var(--brand-forest)] px-8 py-4 rounded-2xl uppercase tracking-[3px] hover:scale-105 transition-all shadow-xl shadow-emerald-950/20 active:scale-95"
                      >
                         Recalibrate Mesh
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 1px; height: 1px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-color); }
      `}</style>
    </motion.div>
  );
}
