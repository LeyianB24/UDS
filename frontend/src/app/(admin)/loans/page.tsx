"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XSquare, 
  History, 
  User, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronRight,
  UserCheck,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AdminLoansPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchApi(`loan_reviews?status=${statusFilter}&q=${search}`);
    if (res.status === 'success') {
      setData(res.data);
    }
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async (action: 'approve' | 'reject') => {
    setProcessing(true);
    const res = await fetchApi('loan_reviews', 'POST', {
      loan_id: selectedLoan.loan_id,
      action,
      notes: rejectionReason
    });

    if (res.status === 'success') {
      alert(res.message);
      setShowReviewModal(false);
      setShowRejectModal(false);
      setSelectedLoan(null);
      setRejectionReason('');
      loadData();
    } else {
      alert(res.message);
    }
    setProcessing(false);
  };

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <div className="w-12 h-12 border-4 border-[#0b2419] border-t-lime-400 rounded-full animate-spin mb-4" />
       <p className="text-[#0b2419]/40 text-[11px] font-black uppercase tracking-[2px]">Loading Portfolio...</p>
    </div>
  );

  const stats = data?.stats || { pending: 0, approved: 0, active: 0 };

  return (
    <div className="space-y-8">
      
      {/* Hero Section */}
      <div className="relative bg-[#0b2419] rounded-[32px] overflow-hidden p-10 md:p-12 text-white shadow-[0_20px_50px_rgba(11,36,25,0.3)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_-10%,rgba(168,224,99,0.15)_0%,transparent_60%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                 <History size={12} className="text-lime-400" /> Operations · Loans
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Loan Portfolio</h1>
              <p className="text-white/40 text-sm font-medium">Review applications, enforce guarantor checks, and monitor disbursements.</p>
              
              <div className="flex flex-wrap gap-4 mt-8">
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[120px]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Pending Review</p>
                    <p className="text-2xl font-black text-amber-400">{stats.pending}</p>
                 </div>
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[120px]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Approved</p>
                    <p className="text-2xl font-black text-lime-400">{stats.approved}</p>
                 </div>
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[120px]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Active Loans</p>
                    <p className="text-2xl font-black">{stats.active}</p>
                 </div>
              </div>
           </div>
           
           <div className="flex gap-3">
              <button className="h-12 px-6 bg-lime-400 text-[#0b2419] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2">
                 <Download size={16} /> Export Data
              </button>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-emerald-900/5 p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
         <div className="flex bg-slate-50 p-1 rounded-2xl overflow-x-auto">
            {['pending', 'approved', 'disbursed', 'all'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={cn(
                   "h-10 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                   statusFilter === tab ? "bg-white text-[#0b2419] shadow-sm" : "text-slate-400 hover:text-[#0b2419]"
                )}
              >
                {tab} 
                {stats[tab] !== undefined && (
                   <span className={cn("text-[9px] px-1.5 py-0.5 rounded-md", statusFilter === tab ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500 text-xs")}>
                      {stats[tab]}
                   </span>
                )}
              </button>
            ))}
         </div>

         <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="Search name, ID or loan..."
              className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 placeholder:text-slate-300"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
         </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-emerald-900/5 rounded-[32px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-opacity duration-300">
         <div className="px-8 py-5 border-b border-emerald-900/5 flex items-center justify-between">
            <span className="text-[11px] font-black text-[#0b2419] uppercase tracking-widest">Master Loan List</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data?.loans?.length || 0} Records Found</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="bg-slate-50/50">
                     <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant</th>
                     <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Loan Request</th>
                     <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Terms</th>
                     <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                     <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-emerald-900/5">
                  {data?.loans?.map((loan: any) => (
                    <tr key={loan.loan_id} className="hover:bg-emerald-50/20 transition-all group">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             {loan.profile_pic ? (
                               <img src={`data:image/jpeg;base64,${loan.profile_pic}`} className="w-10 h-10 rounded-xl object-cover border-2 border-slate-100" />
                             ) : (
                               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0b2419] to-emerald-600 flex items-center justify-center text-white text-xs font-black">
                                  {loan.initials}
                               </div>
                             )}
                             <div>
                                <p className="text-sm font-black text-[#0b2419] mb-0.5">{loan.full_name}</p>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">{loan.national_id}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <p className="text-sm font-black text-[#0b2419] mb-0.5">KES {Number(loan.amount).toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{loan.loan_type}</p>
                       </td>
                       <td className="px-8 py-5">
                          <p className="text-sm font-black text-[#0b2419] mb-0.5">{loan.duration_months} Months</p>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{loan.interest_rate}% Interest</p>
                       </td>
                       <td className="px-8 py-5">
                          <p className="text-sm font-black text-[#0b2419] mb-0.5">{new Date(loan.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(loan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                       </td>
                       <td className="px-8 py-5">
                          <span className={cn(
                             "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase",
                             loan.status === 'pending' ? "bg-amber-50 text-amber-600 border border-amber-100" : 
                             loan.status === 'approved' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                             loan.status === 'disbursed' || loan.status === 'active' ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-slate-100 text-slate-400"
                          )}>
                             <div className={cn("w-1 h-1 rounded-full", 
                               loan.status === 'pending' ? "bg-amber-600" : 
                               loan.status === 'approved' ? "bg-emerald-600" : "bg-blue-600"
                             )} />
                             {loan.status}
                          </span>
                       </td>
                       <td className="px-8 py-5 text-right">
                          {loan.status === 'pending' ? (
                            <button 
                              onClick={() => { setSelectedLoan(loan); setShowReviewModal(true); }}
                              className="h-10 px-5 bg-[#0b2419] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-900/10"
                            >
                               <Eye size={14} /> Review
                            </button>
                          ) : (
                            <div className="h-10 px-5 border border-slate-100 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 float-right">
                               <ShieldCheck size={14} /> Closed
                            </div>
                          )}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedLoan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0b2419]/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[40px] overflow-hidden relative shadow-2xl">
               <div className="bg-gradient-to-br from-[#0b2419] to-emerald-800 p-10 text-white relative">
                  <button onClick={() => setShowReviewModal(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white">
                     <Ban size={20} />
                  </button>
                  <div className="w-14 h-14 bg-lime-400/20 text-lime-400 rounded-2xl flex items-center justify-center mb-6">
                     <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mb-1">Review Application</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">Loan #{selectedLoan.loan_id} · {selectedLoan.full_name}</p>
               </div>

               <div className="p-10">
                  <div className="text-center pb-8 border-b border-slate-100 mb-8">
                     <h2 className="text-4xl font-black text-emerald-600 tracking-tighter">KES {Number(selectedLoan.amount).toLocaleString()}</h2>
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Requested Principal</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-8">
                     <div className="bg-slate-50 p-4 rounded-2xl text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                        <p className="text-sm font-black">{selectedLoan.duration_months} mo</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Interest</p>
                        <p className="text-sm font-black">{selectedLoan.interest_rate}%</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                        <p className="text-[10px] font-black text-emerald-600 uppercase flex items-center justify-center h-full">{selectedLoan.loan_type}</p>
                     </div>
                  </div>

                  <div className="space-y-4 mb-10">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guarantors Verify</p>
                     <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                        {selectedLoan.guarantors?.length > 0 ? selectedLoan.guarantors.map((g: any, i: number) => (
                           <div key={i} className="px-6 py-4 flex items-center justify-between border-b border-slate-100 last:border-0">
                              <p className="text-[11px] font-black text-[#0b2419] truncate mr-4">{g.full_name}</p>
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full whitespace-nowrap">KES {Number(g.amount_locked).toLocaleString()}</span>
                           </div>
                        )) : (
                           <div className="p-6 text-center text-amber-600 flex flex-col items-center gap-2">
                              <AlertTriangle size={24} />
                              <p className="text-[10px] font-black uppercase tracking-widest">No assigned guarantors</p>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <button 
                       onClick={() => { setShowRejectModal(true); setShowReviewModal(false); }}
                       className="flex-1 h-14 border-2 border-red-100 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                     >
                        <XSquare size={16} /> Reject
                     </button>
                     <button 
                       onClick={() => handleAction('approve')}
                       disabled={processing}
                       className="flex-[1.5] h-14 bg-[#0b2419] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-emerald-900/40 transition-all flex items-center justify-center gap-2"
                     >
                        {processing ? "Processing..." : "Approve Loan"} <CheckCircle size={16} />
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}

        {showRejectModal && selectedLoan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-950/95 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[40px] overflow-hidden relative shadow-2xl">
               <div className="bg-gradient-to-br from-red-900 to-red-600 p-10 text-white relative text-center">
                  <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 mx-auto">
                     <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mb-1">Reject Request</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">Action will notify {selectedLoan.full_name}</p>
               </div>

               <div className="p-10">
                  <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                     <p className="text-xs font-medium text-slate-500 leading-relaxed">
                       Rejecting loan of <strong>KES {Number(selectedLoan.amount).toLocaleString()}</strong>. Please provide a clear professional reason.
                     </p>
                  </div>

                  <div className="space-y-4 mb-10">
                     <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">Rejection Reason *</label>
                     <textarea 
                        className="w-full bg-slate-50 border-none rounded-3xl p-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 text-red-900 placeholder:text-slate-200"
                        rows={4}
                        placeholder="e.g. Insufficient guarantor coverage, outstanding defaults..."
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        required
                     />
                  </div>

                  <div className="flex gap-4">
                     <button 
                       onClick={() => { setShowRejectModal(false); setShowReviewModal(true); }}
                       className="flex-1 h-14 bg-slate-100 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                     >
                        <ChevronRight size={16} className="rotate-180" /> Back
                     </button>
                     <button 
                       onClick={() => handleAction('reject')}
                       disabled={processing || !rejectionReason}
                       className="flex-[2] h-14 bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-red-600/40 transition-all flex items-center justify-center gap-2"
                     >
                        {processing ? "Sending..." : "Confirm Rejection"} <Ban size={16} />
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
