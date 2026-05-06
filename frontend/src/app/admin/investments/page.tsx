"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  PieChart,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Layers,
  Sparkles
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

export default function InvestmentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    start_date: '',
    end_date: ''
  });
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const loadInvestments = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetchApi(`admin/investments?${query}`);
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to load investments:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  const calculateReturns = (investment: any) => {
    const currentValue = investment.current_value || investment.amount;
    if (!investment.amount) return 0;
    const returns = ((currentValue - investment.amount) / investment.amount) * 100;
    return returns;
  };

  const stats = [
    { label: 'AUM Portfolio', value: formatKES(data?.stats?.total_value ?? 0), icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Cumulative Yield', value: formatKES(data?.stats?.total_returns ?? 0), icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Positions', value: data?.stats?.active_count ?? 0, icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Alpha performance', value: `${(data?.stats?.avg_return ?? 0).toFixed(2)}%`, icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
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
              <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" /> Asset Management
            </div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none mb-4">
              Strategic <span className="text-[#a3e635]">Portfolio.</span>
            </h1>
            <p className="text-white/50 text-sm font-bold max-w-lg leading-relaxed uppercase tracking-wider">
              Monitor capital allocation, track real-time valuations, and optimize institutional yields.
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
             <button onClick={loadInvestments} className="h-14 px-8 bg-white/10 text-white border border-white/20 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3">
                <RefreshCw size={18} /> Sync
             </button>
             <button 
               onClick={() => setShowAddInvestment(true)}
               className="h-14 px-10 bg-[#a3e635] text-[#0b2419] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#bceb3b] transition-all flex items-center gap-3 shadow-lg shadow-[#a3e635]/20"
             >
                <Plus size={18} /> Deploy Capital
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
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Asset Classification</label>
            <div className="relative">
               <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <select
                 title="Asset Type Filter"
                 value={filters.type}
                 onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                 className="w-full h-12 pl-12 pr-6 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0b2419]/5 outline-none transition-all cursor-pointer"
               >
                 <option value="">All Investment Vehicles</option>
                 <option value="stocks">Equities / Stocks</option>
                 <option value="bonds">Fixed Income / Bonds</option>
                 <option value="real_estate">Real Estate</option>
                 <option value="fixed_deposit">Fixed Deposits</option>
                 <option value="mutual_fund">Mutual Funds</option>
               </select>
            </div>
          </div>

          <div className="flex-1 min-w-[200px] group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Portfolio Status</label>
            <div className="relative">
               <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <select
                 title="Status Filter"
                 value={filters.status}
                 onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                 className="w-full h-12 pl-12 pr-6 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0b2419]/5 outline-none transition-all cursor-pointer"
               >
                 <option value="">All Lifecycle Stages</option>
                 <option value="active">Active Positions</option>
                 <option value="matured">Matured / Exited</option>
                 <option value="pending">Awaiting Deployment</option>
               </select>
            </div>
          </div>

          <div className="flex-1 min-w-[200px] group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Inception Bound</label>
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

      {/* INVESTMENTS GRID */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-8 lg:p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-2">Institutional Holdings</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master ledger of capital deployments and yield projections.</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="relative group">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0b2419] transition-colors" />
                 <input type="text" placeholder="Search holdings..." className="h-12 pl-12 pr-6 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#0b2419]/5 outline-none transition-all w-full sm:w-64" />
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Asset Profile</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Quantum</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Mark-to-Market</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Yield (Alpha)</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Audit Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Temporal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-24 text-center text-xs font-black text-gray-400 uppercase tracking-[4px]">Syncing Capital Mesh...</td></tr>
              ) : !data?.investments?.length ? (
                <tr>
                   <td colSpan={6} className="py-32 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                         <Target size={32} />
                      </div>
                      <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Portfolio Vacant.</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zero active investment positions identified in the current mesh.</p>
                   </td>
                </tr>
              ) : data.investments.map((inv: any) => {
                const returns = calculateReturns(inv);
                return (
                  <tr key={inv.investment_id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                           <Globe size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-gray-900 leading-none mb-2">{inv.name}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{inv.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="text-sm font-black text-gray-900">{formatKES(inv.amount)}</div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="text-sm font-black text-gray-900">{formatKES(inv.current_value || inv.amount)}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-black",
                        returns >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      )}>
                        {returns >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {returns.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        inv.status === 'active' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : 
                        inv.status === 'matured' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : 
                        "bg-amber-100 text-amber-700"
                      )}>
                        {inv.status === 'active' ? <CheckCircle size={12} /> : 
                         inv.status === 'matured' ? <Target size={12} /> : 
                         <Clock size={12} />}
                        {inv.status}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="text-[11px] font-black text-gray-900 mb-1">{inv.maturity_date ? new Date(inv.maturity_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</div>
                       <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Maturity Limit</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ADD INVESTMENT MODAL */}
      <Dialog open={showAddInvestment} onOpenChange={setShowAddInvestment}>
         <DialogContent className="max-w-md rounded-[32px] p-8 border-none shadow-2xl">
            <div className="mb-8">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><Plus size={20} /></div>
               <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">Deploy Capital</h3>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Initiate a new institutional asset position.</p>
            </div>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Asset Name</label>
                  <input required type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" placeholder="e.g. Treasury Bond V.10" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Principal Amount (KES)</label>
                  <input required type="number" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" placeholder="0.00" />
               </div>
               <div className="pt-4">
                  <button onClick={() => { showToast('Capital deployed (Simulation)', true); setShowAddInvestment(false); }} className="w-full py-4 bg-[#0b2419] text-[#a3e635] rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-colors shadow-lg shadow-green-950/20">
                     Execute Deployment
                  </button>
               </div>
            </div>
         </DialogContent>
      </Dialog>

    </motion.div>
  );
}