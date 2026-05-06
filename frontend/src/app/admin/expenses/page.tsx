"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  ClipboardList,
  Pocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn, formatKES } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Page Animation Variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function ExpensesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    start_date: '',
    end_date: ''
  });
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetchApi(`admin/expenses?${query}`);
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleApproveExpense = async (expenseId: number) => {
    try {
      const res = await fetchApi('admin/expenses', 'POST', {
        action: 'approve',
        expense_id: expenseId
      });
      showToast(res.message, res.status === 'success');
      if (res.status === 'success') {
        loadExpenses();
      }
    } catch (error) {
      showToast('Approval failed', false);
    }
  };

  const handleRejectExpense = async (expenseId: number, reason: string) => {
    try {
      const res = await fetchApi('admin/expenses', 'POST', {
        action: 'reject',
        expense_id: expenseId,
        reason: reason
      });
      showToast(res.message, res.status === 'success');
      if (res.status === 'success') {
        loadExpenses();
      }
    } catch (error) {
      showToast('Rejection failed', false);
    }
  };

  const stats = [
    { label: 'Total Expenditure', value: formatKES(data?.stats?.total_amount ?? 0), icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Approved Claims', value: data?.stats?.approved_count ?? 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Awaiting Review', value: data?.stats?.pending_count ?? 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Monthly velocity', value: formatKES(data?.expenses?.filter((e: any) => new Date(e.created_at).getMonth() === new Date().getMonth()).reduce((sum: number, e: any) => sum + e.amount, 0) ?? 0), icon: TrendingDown, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-10 pb-20"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={cn('fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl text-sm font-black flex items-center gap-3',
              toast.ok ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white')}>
            {toast.ok ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <motion.div variants={itemVariants}
        className="bg-gradient-to-br from-[#0b2419] to-[#1a5c42] text-white rounded-[40px] p-8 lg:p-12 relative overflow-hidden shadow-2xl shadow-emerald-950/20">
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(#a3e635 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/20 text-[10px] font-black uppercase tracking-widest text-[#a3e635] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" /> Treasury Operations
            </div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none mb-4">
              Expense <span className="text-[#a3e635]">Registry.</span>
            </h1>
            <p className="text-white/50 text-sm font-bold max-w-lg leading-relaxed uppercase tracking-wider">
              Audit organizational outflows, manage claims, and enforce budgetary compliance.
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
             <button onClick={loadExpenses} className="h-14 px-8 bg-white/10 text-white border border-white/20 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3">
                <RefreshCw size={18} /> Sync
             </button>
             <button 
               onClick={() => setShowAddExpense(true)}
               className="h-14 px-10 bg-[#a3e635] text-[#0b2419] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#bceb3b] transition-all flex items-center gap-3 shadow-lg shadow-[#a3e635]/20"
             >
                <Plus size={18} /> Record Outflow
             </button>
          </div>
        </div>
      </motion.div>

      {/* STATS TIERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="group bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500", stat.bg, stat.color)}>
               <stat.icon size={26} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] leading-none mb-3">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{loading ? '—' : stat.value}</h3>
            
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-gray-900 group-hover:scale-125 transition-transform duration-1000">
                <stat.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* FILTER MESH */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-[32px] p-6 lg:p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-[200px] group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Filter Category</label>
            <div className="relative">
               <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <select
                 title="Category Filter"
                 value={filters.category}
                 onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                 className="w-full h-12 pl-12 pr-6 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0b2419]/5 outline-none transition-all cursor-pointer"
               >
                 <option value="">All Operational Verticals</option>
                 {data?.summary?.map((cat: any) => (
                   <option key={cat.category} value={cat.category}>{cat.category}</option>
                 ))}
               </select>
            </div>
          </div>

          <div className="flex-1 min-w-[200px] group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Audit Status</label>
            <div className="relative">
               <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <select
                 title="Status Filter"
                 value={filters.status}
                 onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                 className="w-full h-12 pl-12 pr-6 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0b2419]/5 outline-none transition-all cursor-pointer"
               >
                 <option value="">All Workflow States</option>
                 <option value="pending">Awaiting Review</option>
                 <option value="approved">Authorized</option>
                 <option value="rejected">Declined</option>
               </select>
            </div>
          </div>

          <div className="flex-1 min-w-[200px] group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Temporal Bound (Start)</label>
            <div className="relative">
               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input
                 title="Start Date"
                 type="date"
                 value={filters.start_date}
                 onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                 className="w-full h-12 pl-12 pr-6 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0b2419]/5 outline-none transition-all"
               />
            </div>
          </div>
        </div>
      </motion.div>

      {/* EXPENSES GRID */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-8 lg:p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-2">Claim Registry</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chronological ledger of organizational expenditures.</p>
           </div>
           <button className="h-12 px-6 bg-gray-50 border border-gray-100 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2">
              <Download size={16} /> Export Audit
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Objective & Source</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Vertical</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Quantum</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Audit Status</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Timestamp</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-24 text-center text-xs font-black text-gray-400 uppercase tracking-[4px]">Syncing Outflow Registry...</td></tr>
              ) : !data?.expenses?.length ? (
                <tr>
                   <td colSpan={6} className="py-32 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                         <Pocket size={32} />
                      </div>
                      <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Treasury Silent.</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zero expenditure records identified in the current audit mesh.</p>
                   </td>
                </tr>
              ) : data.expenses.map((e: any) => (
                <tr key={e.expense_id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                         <DollarSign size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 leading-none mb-2">{e.description}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">By {e.created_by}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        {e.category}
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="text-sm font-black text-gray-900 tracking-tighter">{formatKES(e.amount)}</div>
                  </td>
                  <td className="px-10 py-8">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      e.status === 'approved' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                      e.status === 'rejected' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {e.status === 'approved' ? <CheckCircle size={12} /> : 
                       e.status === 'rejected' ? <XCircle size={12} /> : 
                       <Clock size={12} />}
                      {e.status}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-[11px] font-black text-gray-900">{new Date(e.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                       {e.status === 'pending' && (
                         <>
                           <button
                             onClick={() => handleApproveExpense(e.expense_id)}
                             className="h-10 px-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                           >
                             Authorize
                           </button>
                           <button
                             onClick={() => {
                               const reason = prompt('Rejection reason:');
                               if (reason) handleRejectExpense(e.expense_id, reason);
                             }}
                             className="h-10 px-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                           >
                             Decline
                           </button>
                         </>
                       )}
                       <button className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all">
                          <MoreVertical size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ADD EXPENSE MODAL */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
         <DialogContent className="max-w-md rounded-[32px] p-8 border-none shadow-2xl">
            <div className="mb-8">
               <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4"><Plus size={20} /></div>
               <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">Record Outflow</h3>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Document a new organizational expenditure.</p>
            </div>
            {/* Form simplified for brevity, in a real app this would have fields */}
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Description</label>
                  <input required type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 outline-none" placeholder="e.g. Office Stationery" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Amount (KES)</label>
                  <input required type="number" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 outline-none" placeholder="0.00" />
               </div>
               <div className="pt-4">
                  <button onClick={() => { showToast('Expense recorded (Simulation)', true); setShowAddExpense(false); }} className="w-full py-4 bg-[#0b2419] text-[#a3e635] rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-colors shadow-lg shadow-green-900/20">
                     Register Claim
                  </button>
               </div>
            </div>
         </DialogContent>
      </Dialog>

    </motion.div>
  );
}