"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Banknote, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Download, 
  MoreVertical, 
  Zap,
  ArrowRight,
  ShieldCheck,
  Filter,
  DollarSign,
  AlertCircle,
  FileText,
  User,
  Send
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

export default function LoansConsolePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`admin/loans?status=${statusFilter}&q=${searchQuery}`);
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (e) {
      console.error("Loan sync failed:", e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const handleAction = async (loanId: number, action: string, extraData: any = {}) => {
    setProcessingId(loanId);
    try {
      const res = await fetchApi('admin/loans', 'POST', { loan_id: loanId, action, ...extraData });
      if (res.status === 'success') {
        loadLoans();
      }
    } catch (e) {
      console.error("Action failed:", e);
    } finally {
      setProcessingId(null);
    }
  };

  const stats = [
    { label: 'Pending Review', value: data?.stats?.pending_count || 0, val: data?.stats?.pending_val, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Capital Ready', value: data?.stats?.approved_count || 0, val: data?.stats?.approved_val, icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Portfolio', value: data?.stats?.active_count || 0, val: data?.stats?.active_portfolio, icon: Banknote, color: 'text-[var(--brand-lime)]', bg: 'bg-[var(--brand-forest)]/10' },
    { label: 'At Risk (Overdue)', value: data?.stats?.overdue_count || 0, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
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
              <span className="text-[11px] font-black text-[var(--brand-lime)] bg-[var(--brand-forest)] px-3 py-1 rounded-full uppercase tracking-[2px]">Capital Controller</span>
              <div className="h-px w-8 bg-[var(--border-color)] opacity-20" />
           </div>
           <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-main)] tracking-tighter leading-tight">
              Disbursement <span className="text-[var(--brand-forest)] underline decoration-[var(--brand-lime)] decoration-8 underline-offset-4">Console.</span>
           </h2>
           <p className="text-sm font-bold text-[var(--text-muted)] mt-6 max-w-xl leading-relaxed uppercase tracking-wider opacity-60">
              Surveillance of credit facilities and capital allocation. Enforcing high-fidelity financial standards across the lending lifecycle.
           </p>
        </div>
        <div className="flex items-center gap-4">
           <button className="h-14 px-8 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] hover:bg-[var(--bg-primary)] transition-all flex items-center gap-3 shadow-sm active:scale-95">
              <FileText size={18} /> Credit Policy
           </button>
           <button className="h-14 px-8 bg-[var(--brand-forest)] text-[var(--brand-lime)] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--text-main)] transition-all flex items-center gap-3 shadow-2xl shadow-emerald-950/20 active:scale-95">
              <ShieldCheck size={18} /> Global Audit
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
            <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tighter leading-none mb-2">{stat.value}</h3>
            {stat.val && (
               <p className="text-[11px] font-black text-[var(--brand-forest)] opacity-60 uppercase tracking-widest">KES {Number(stat.val).toLocaleString()}</p>
            )}
            
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[var(--text-main)] group-hover:scale-125 transition-transform duration-1000">
                <stat.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* LOAN TABLE SECTION */}
      <motion.div variants={itemVariants} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[48px] overflow-hidden shadow-sm">
        
        {/* Advanced Filters */}
        <div className="p-8 lg:p-10 border-b border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="relative flex-1 max-w-2xl group">
              <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-lime)] transition-colors" />
              <input 
                type="text" 
                placeholder="Query Registry (Name, Reg No, Reference)..." 
                className="w-full h-16 pl-16 pr-8 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-[24px] text-sm font-black uppercase tracking-widest text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 focus:ring-4 focus:ring-[var(--brand-lime)]/10 focus:border-[var(--brand-lime)]/50 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 px-6 py-4 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-[24px]">
                <Filter size={18} className="text-[var(--text-muted)]" />
                <select 
                  className="bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Full Lifecycle</option>
                  <option value="pending">Review Pending</option>
                  <option value="approved">Capital Ready</option>
                  <option value="disbursed">Operational (Active)</option>
                  <option value="overdue">High Risk (Overdue)</option>
                  <option value="rejected">Vetoed Records</option>
                </select>
              </div>
           </div>
        </div>

        {/* Console Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg-primary)]/30 border-b border-[var(--border-color)]">
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Member & Reference</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Capital Allocation</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Operational Status</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Timeline</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Terminal Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              <AnimatePresence mode='popLayout'>
                {data?.loans?.map((loan: any, idx: number) => {
                  const isProcessing = processingId === loan.loan_id;
                  return (
                    <motion.tr 
                      key={loan.loan_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-[var(--bg-primary)]/30 transition-all cursor-default"
                    >
                      {/* Identity */}
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-[var(--brand-forest)] text-[var(--brand-lime)] flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-950/20 group-hover:scale-110 transition-transform duration-500">
                             <User size={24} />
                          </div>
                          <div>
                            <p className="text-base font-black text-[var(--text-main)] leading-none mb-2 tracking-tight">{loan.full_name}</p>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60 flex items-center gap-2">
                               <ShieldCheck size={10} className="text-[var(--brand-lime)]" /> {loan.reference_no || `L-${loan.loan_id}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Amount */}
                      <td className="px-10 py-8">
                        <div className="space-y-1">
                          <p className="text-lg font-black text-[var(--text-main)] tracking-tighter leading-none">KES {Number(loan.amount).toLocaleString()}</p>
                          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[2px] opacity-40">{loan.loan_type}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-10 py-8">
                        <div className={cn(
                          "inline-flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                          loan.status === 'disbursed' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" : 
                          loan.status === 'approved' ? "bg-blue-500/5 text-blue-500 border-blue-500/10" : 
                          loan.status === 'pending' ? "bg-amber-500/5 text-amber-500 border-amber-500/10" : 
                          "bg-rose-500/5 text-rose-500 border-rose-500/10"
                        )}>
                          <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]", 
                            loan.status === 'disbursed' ? "bg-emerald-500" : 
                            loan.status === 'approved' ? "bg-blue-500" : 
                            loan.status === 'pending' ? "bg-amber-500" : "bg-rose-500"
                          )} />
                          {loan.status}
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-1.5">
                           <div className="flex items-center gap-2 text-[11px] font-black text-[var(--text-main)] tracking-tight">
                             <Clock size={14} className="text-[var(--text-muted)]" />
                             {new Date(loan.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                           </div>
                           {loan.disbursement_date && (
                              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 tracking-tight">
                                <Zap size={12} />
                                Active Payout
                              </div>
                           )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          {loan.status === 'pending' && (
                             <>
                                <button 
                                  onClick={() => handleAction(loan.loan_id, 'approve')}
                                  disabled={isProcessing}
                                  className="h-11 px-5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                                >
                                  <ShieldCheck size={14} /> Vouch
                                </button>
                                <button 
                                  onClick={() => handleAction(loan.loan_id, 'reject')}
                                  disabled={isProcessing}
                                  className="h-11 px-5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                >
                                  Veto
                                </button>
                             </>
                          )}
                          {loan.status === 'approved' && (
                             <button 
                               onClick={() => handleAction(loan.loan_id, 'disburse')}
                               disabled={isProcessing}
                               className="h-11 px-6 bg-[var(--brand-forest)] text-[var(--brand-lime)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--text-main)] transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/20"
                             >
                               <Send size={14} /> Disburse Funds
                             </button>
                          )}
                          <button className="h-11 w-11 bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)] rounded-xl flex items-center justify-center hover:bg-[var(--text-main)] hover:text-white transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {loading && !data && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                        <div className="w-10 h-10 border-2 border-[var(--brand-lime)]/20 border-t-[var(--brand-lime)] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[4px]">Synchronizing Ledgers...</p>
                    </td>
                  </tr>
              )}

              {data?.loans?.length === 0 && !loading && (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-[var(--bg-primary)] rounded-[40px] flex items-center justify-center text-[var(--text-muted)] opacity-20 mb-8 border border-[var(--border-color)]">
                        <DollarSign size={48} />
                      </div>
                      <h4 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-2">No Credit Records</h4>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">The registry identifies zero matches for current filter grid.</p>
                      <button 
                        onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
                        className="mt-10 text-[10px] font-black text-[var(--brand-lime)] bg-[var(--brand-forest)] px-8 py-4 rounded-2xl uppercase tracking-[3px] hover:scale-105 transition-all shadow-xl shadow-emerald-950/20 active:scale-95"
                      >
                         Reset SURVEILLANCE
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
