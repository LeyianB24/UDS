"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft,
  Wallet,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  ArrowUpRight,
  Hourglass,
  CheckCircle, 
  XSquare, 
  ChevronRight, 
  Info, 
  Send, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function MemberLoansPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    loan_type: 'emergency',
    amount: '',
    duration_months: '12',
    notes: '',
    guarantor_1: '',
    guarantor_2: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchApi('member_loans');
    if (res.status === 'success') {
      setData(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchApi('apply_loan', 'POST', formData);
    if (res.status === 'success') {
      alert(res.message);
      setShowApplyModal(false);
      loadData();
    } else {
      alert(res.message);
    }
  };

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <div className="w-12 h-12 border-4 border-[#0b2419] border-t-[#D0F35D] rounded-full animate-spin mb-4" />
       <p className="text-[#0b2419]/40 text-[11px] font-black uppercase tracking-[2px]">Calculating Eligibility...</p>
    </div>
  );

  const activeLoan = data?.active_loan;
  const pendingLoan = data?.pending_loan;
  const limitPercent = Math.min(100, (Number(formData.amount) / data?.balances?.max_loan_limit) * 100) || 0;

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2 leading-none">
              <span className="text-[11px] font-black text-[#0b2419]/40 uppercase tracking-[2px]">Loan Portfolio & Repayments</span>
              <div className="h-px w-8 bg-emerald-900/10" />
           </div>
           <h2 className="text-3xl font-black text-[#0b2419] tracking-tight">Financial <span className="text-emerald-600">Freedom</span></h2>
           <p className="text-sm font-medium text-slate-500 mt-2">Manage your credit facilities and track repayment progress.</p>
        </div>
        <div className="flex items-center gap-3">
           {activeLoan || pendingLoan ? (
             <button className="h-12 px-6 bg-slate-100 border border-emerald-900/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#0b2419]/30 cursor-not-allowed flex items-center gap-2">
                Limit Reached
             </button>
           ) : (
             <button 
               onClick={() => setShowApplyModal(true)}
               className="h-12 px-8 bg-[#D0F35D] text-[#0b2419] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#0b2419] hover:text-white transition-all flex items-center gap-3 shadow-xl shadow-[#D0F35D]/20"
             >
                <PlusCircle size={18} /> Apply for Loan
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Active Loan or Eligibility */}
        <div className="lg:col-span-2 space-y-6">
          
          <AnimatePresence>
            {pendingLoan && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-amber-50 border border-amber-200 rounded-3xl flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Hourglass size={24} />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase">Application In Review</h4>
                    <p className="text-xs font-bold text-amber-900/60 mt-1">
                      Your request for <strong>KES {Number(pendingLoan.amount).toLocaleString()}</strong> is status: <span className="underline">{pendingLoan.status}</span>.
                    </p>
                 </div>
              </motion.div>
            )}

            {activeLoan && activeLoan.is_overdue && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-red-50 border border-red-200 rounded-3xl flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle size={24} />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-red-900 uppercase">Overdue Repayment Detected</h4>
                    <p className="text-xs font-bold text-red-900/60 mt-1">
                      Loan repayment was due on <strong>{new Date(activeLoan.next_repayment_date).toLocaleDateString()}</strong>. Fines may apply.
                    </p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeLoan ? (
            /* The Forest Card */
            <div className="relative bg-[#0b2419] rounded-[40px] overflow-hidden p-10 md:p-12 text-white shadow-[0_30px_70px_rgba(11,36,25,0.4)]">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
               
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                     <div>
                        <span className="inline-flex px-4 py-2 bg-white/10 border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
                           Active Loan #{activeLoan.loan_id}
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter mt-2">
                           <span className="text-[20px] font-bold opacity-30 mr-2">KES</span>
                           {Number(activeLoan.outstanding_balance).toLocaleString()}
                        </h2>
                        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-2 block">Outstanding Balance</span>
                     </div>
                     <div className="hidden md:flex flex-col text-right gap-4">
                        <div>
                           <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Duration / Rate</p>
                           <p className="text-sm font-black">{activeLoan.duration_months} MOS · {activeLoan.interest_rate}% p.a</p>
                        </div>
                        {activeLoan.total_fines > 0 && (
                          <div>
                             <p className="text-red-400 text-[9px] font-black uppercase tracking-widest mb-1">Late Fines</p>
                             <p className="text-sm font-black text-red-400">+ KES {Number(activeLoan.total_fines).toLocaleString()}</p>
                          </div>
                        )}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                     <div>
                        <div className="flex justify-between items-end mb-3">
                           <span className="text-xs font-black uppercase tracking-widest opacity-60">Repayment Progress</span>
                           <span className="text-2xl font-black text-[#D0F35D] tracking-tight">{activeLoan.progress_percent.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${activeLoan.progress_percent}%` }} className="h-full bg-[#D0F35D] rounded-full" />
                        </div>
                        <p className="text-[10px] font-bold opacity-30 mt-4 uppercase tracking-[1px] leading-tight max-w-sm">
                          Guarantors: {activeLoan.guarantors.join(', ') || 'None'}
                        </p>
                     </div>
                     <div className="flex gap-4">
                        <Link href="/member/mpesa" className="flex-1 h-12 bg-[#D0F35D] text-[#0b2419] rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#D0F35D]/10">
                           <CheckCircle size={16} className="mr-2" /> M-Pesa Repay
                        </Link>
                        <button className="flex-1 h-12 bg-white/10 border border-white/10 text-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                           <Wallet size={16} className="mr-2" /> Wallet
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          ) : !pendingLoan ? (
            /* Eligibility State */
            <div className="bg-white border-2 border-dashed border-emerald-900/10 rounded-[40px] p-12 text-center flex flex-col items-center">
               <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6", data?.balances?.is_eligible ? "bg-[#D0F35D]/20 text-[#0b2419]" : "bg-slate-50 text-slate-300")}>
                  {data?.balances?.is_eligible ? <ShieldCheck size={40} /> : <Hourglass size={40} />}
               </div>
               <h3 className="text-2xl font-black text-[#0b2419] mb-3">
                 {data?.balances?.is_eligible ? "You are Eligible!" : "Build Your Savings"}
               </h3>
               <p className="text-slate-400 text-sm font-medium max-w-md mb-8">
                 {data?.balances?.is_eligible 
                   ? `You currently have no active debts. Based on your savings, you qualify for an instant loan up to the limit below.`
                   : `To qualify for a loan, you need to have active savings. Start saving today to unlock borrowing power up to 3x your balance.`}
               </p>
               {data?.balances?.is_eligible ? (
                 <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Borrowing Power</span>
                    <h4 className="text-4xl font-black text-emerald-600 tracking-tighter">KES {Number(data?.balances?.max_loan_limit).toLocaleString()}</h4>
                 </div>
               ) : (
                 <Link href="/member/mpesa" className="h-12 px-10 bg-[#0b2419] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                    Start Saving Now <ArrowRight size={16} />
                 </Link>
               )}
            </div>
          ) : null}

          {/* History */}
          <div className="bg-white border border-emerald-900/5 rounded-[32px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
             <div className="px-8 py-5 border-b border-emerald-900/5 flex items-center justify-between">
                <span className="text-[11px] font-black text-[#0b2419] uppercase tracking-widest">Recent Activity</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data?.history?.length || 0} Records</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/5">
                     {data?.history?.map((loan: any) => (
                       <tr key={loan.loan_id} className="hover:bg-slate-50/50 transition-all group">
                          <td className="px-8 py-5">
                             <p className="text-sm font-black text-[#0b2419] mb-1">{new Date(loan.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                             <p className="text-[9px] font-bold text-slate-300 uppercase">{new Date(loan.created_at).getFullYear()}</p>
                          </td>
                          <td className="px-8 py-5">
                             <p className="text-[10px] font-black text-[#0b2419] uppercase tracking-widest">{loan.loan_type}</p>
                          </td>
                          <td className="px-8 py-5">
                             <p className="text-sm font-black text-[#0b2419]">KES {Number(loan.amount).toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-5">
                             <span className={cn(
                               "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase",
                               loan.status === 'completed' ? "bg-emerald-50 text-emerald-600" : 
                               loan.status === 'pending' ? "bg-amber-50 text-amber-600" : 
                               loan.status === 'rejected' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                             )}>
                                <div className={cn("w-1 h-1 rounded-full", loan.status === 'completed' ? "bg-emerald-600" : loan.status === 'pending' ? "bg-amber-600" : "bg-blue-600")} />
                                {loan.status}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 float-right opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight size={14} />
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Right Sidebar Stats */}
        <div className="space-y-6">
           <div className="bg-white border-2 border-[#D0F35D] p-8 rounded-[32px] shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-[#D0F35D]/20 text-[#0b2419] flex items-center justify-center">
                    <Wallet size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Loan Wallet</p>
                    <h5 className="text-2xl font-black text-[#0b2419]">KES {Number(data?.balances?.wallet_balance).toLocaleString()}</h5>
                 </div>
              </div>
              <Link href="/member/withdraw" className="h-12 w-full bg-[#D0F35D] text-[#0b2419] rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                 <ArrowUpRight size={16} className="mr-2" /> Withdraw to M-Pesa
              </Link>
           </div>

           <div className="bg-white border border-emerald-900/5 p-8 rounded-[32px] shadow-sm">
              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-emerald-900/20 flex items-center justify-center">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Savings</p>
                       <h5 className="text-xl font-black text-[#0b2419]">KES {Number(data?.balances?.total_savings).toLocaleString()}</h5>
                    </div>
                 </div>
                 <div className="pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <TrendingUp size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Borrowing Limit</p>
                          <h5 className="text-xl font-black text-emerald-600">KES {Number(data?.balances?.max_loan_limit).toLocaleString()}</h5>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-[#0b2419] p-8 rounded-[32px] text-white overflow-hidden relative">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              <h5 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Info size={16} className="text-[#D0F35D]" /> Quick Terms
              </h5>
              <ul className="space-y-5">
                 {[
                   "Interest rate fixed at 12% p.a.",
                   "Loans require active guarantors.",
                   "Processing takes 24-48 hours.",
                   "Maximum limit is 3x Savings."
                 ].map((term, i) => (
                   <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D0F35D] mt-1.5" />
                      <p className="text-[11px] font-bold text-white/50 leading-relaxed">{term}</p>
                   </li>
                 ))}
              </ul>
           </div>
        </div>

      </div>

      {/* Apply Loan Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApplyModal(false)} className="absolute inset-0 bg-[#0b2419]/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden relative shadow-2xl"
            >
               <div className="p-8 md:p-10">
                  <div className="flex justify-between items-start mb-8">
                     <div>
                        <h3 className="text-2xl font-black text-[#0b2419] tracking-tight">Loan Request</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Submit your credit application</p>
                     </div>
                     <button onClick={() => setShowApplyModal(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <XSquare size={20} className="text-slate-400" />
                     </button>
                  </div>

                  <form onSubmit={handleApply} className="space-y-8">
                     
                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded-full bg-[#0b2419] text-[#D0F35D] flex items-center justify-center text-[10px] font-black">1</div>
                           <span className="text-[11px] font-black uppercase tracking-[2px] text-slate-400">Application Details</span>
                        </div>
                        
                        <div className="space-y-3">
                           <div className="flex justify-between items-end mb-1">
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Limit Usage</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{limitPercent.toFixed(0)}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full transition-all duration-500", limitPercent > 90 ? "bg-red-500" : "bg-emerald-500")} style={{ width: `${limitPercent}%` }} />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Loan Category</label>
                              <select 
                                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black focus:ring-2 focus:ring-emerald-500/20"
                                value={formData.loan_type}
                                onChange={e => setFormData({...formData, loan_type: e.target.value})}
                              >
                                 <option value="emergency">Emergency Loan</option>
                                 <option value="development">Development Loan</option>
                                 <option value="business">Business Expansion</option>
                                 <option value="education">Education</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Duration</label>
                              <select 
                                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black focus:ring-2 focus:ring-emerald-500/20"
                                value={formData.duration_months}
                                onChange={e => setFormData({...formData, duration_months: e.target.value})}
                              >
                                 <option value="3">3 Months</option>
                                 <option value="6">6 Months</option>
                                 <option value="12">12 Months</option>
                                 <option value="24">24 Months</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Requested Amount (KES)</label>
                           <input 
                             type="number" 
                             className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black focus:ring-2 focus:ring-emerald-500/20"
                             placeholder="Enter amount..."
                             value={formData.amount}
                             onChange={e => setFormData({...formData, amount: e.target.value})}
                             required
                           />
                        </div>
                     </div>

                     <div className="space-y-6 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded-full bg-[#0b2419] text-[#D0F35D] flex items-center justify-center text-[10px] font-black">2</div>
                           <span className="text-[11px] font-black uppercase tracking-[2px] text-slate-400">Guarantors Info</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">First Guarantor</label>
                              <select 
                                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black focus:ring-2 focus:ring-emerald-500/20"
                                value={formData.guarantor_1}
                                onChange={e => setFormData({...formData, guarantor_1: e.target.value})}
                                required
                              >
                                 <option value="">Select guarantor...</option>
                                 {data?.available_guarantors?.map((m: any) => (
                                   <option key={m.member_id} value={m.member_id}>{m.full_name}</option>
                                 ))}
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Second Guarantor</label>
                              <select 
                                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black focus:ring-2 focus:ring-emerald-500/20"
                                value={formData.guarantor_2}
                                onChange={e => setFormData({...formData, guarantor_2: e.target.value})}
                                required
                              >
                                 <option value="">Select guarantor...</option>
                                 {data?.available_guarantors?.map((m: any) => (
                                   <option key={m.member_id} value={m.member_id}>{m.full_name}</option>
                                 ))}
                              </select>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded-full bg-[#0b2419] text-[#D0F35D] flex items-center justify-center text-[10px] font-black">3</div>
                           <span className="text-[11px] font-black uppercase tracking-[2px] text-slate-400">Purpose</span>
                        </div>
                        <textarea 
                          className="w-full bg-slate-50 border-none rounded-3xl p-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20"
                          rows={3}
                          placeholder="Briefly describe why you need this loan..."
                          value={formData.notes}
                          onChange={e => setFormData({...formData, notes: e.target.value})}
                          required
                        />
                     </div>

                     <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <span>Estimated Interest</span>
                           <span className="text-[#0b2419]">KES {Number(Number(formData.amount) * 0.12).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                           <span className="text-xs font-black text-[#0b2419] uppercase tracking-widest">Est. Total Payable</span>
                           <span className="text-xl font-black text-emerald-600 tracking-tight">KES {Number(Number(formData.amount) * 1.12).toLocaleString()}</span>
                        </div>
                     </div>

                     <button 
                       type="submit"
                       className="w-full h-14 bg-[#D0F35D] text-[#0b2419] rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                     >
                        Confirm & Apply <Send size={16} />
                     </button>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
