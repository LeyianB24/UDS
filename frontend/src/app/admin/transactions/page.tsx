"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Search,
  Download,
  TrendingUp,
  DollarSign,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { cn, formatKES } from '@/lib/utils';

const floatUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

interface Transaction {
  transaction_id: number;
  member_id: number;
  full_name: string;
  transaction_type: string;
  amount: number;
  payment_channel: string;
  reference_no: string;
  status: string;
  notes: string;
  created_at: string;
}

interface TransactionData {
  transactions: Transaction[];
  stats: {
    total_volume: number;
    total_deposits: number;
    total_withdrawals: number;
    pending_count: number;
  };
}

const TYPE_LABELS: Record<string, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  savings_deposit: 'Savings',
  loan_disbursement: 'Loan Payout',
  loan_repayment: 'Loan Repay',
  share_capital: 'Share Capital',
  dividend: 'Dividend',
  welfare: 'Welfare',
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <CheckCircle size={12} /> },
  pending:   { label: 'Pending',   cls: 'bg-amber-50 text-amber-600 border-amber-200',     icon: <Clock size={12} /> },
  failed:    { label: 'Failed',    cls: 'bg-red-50 text-red-600 border-red-200',           icon: <XCircle size={12} /> },
};

export default function AdminTransactionsPage() {
  const [data, setData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', type: '', start: '', end: '', status: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.type) params.set('type', filters.type);
      if (filters.start) params.set('start', filters.start);
      if (filters.end) params.set('end', filters.end);
      if (filters.status) params.set('status', filters.status);
      const res = await fetchApi(`admin/transactions?${params.toString()}`);
      if (res.status === 'success') setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  const isInflow = (type: string) =>
    ['deposit', 'savings_deposit', 'loan_repayment', 'share_capital', 'welfare'].includes(type);

  const kpis = [
    {
      label: 'Total Volume',
      value: formatKES(data?.stats?.total_volume ?? 0),
      icon: TrendingUp,
      color: 'text-[var(--brand-lime)]',
      bg: 'bg-[var(--brand-forest)]',
      dark: true,
    },
    {
      label: 'Total Inflows',
      value: formatKES(data?.stats?.total_deposits ?? 0),
      icon: ArrowDownLeft,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      dark: false,
    },
    {
      label: 'Total Outflows',
      value: formatKES(data?.stats?.total_withdrawals ?? 0),
      icon: ArrowUpRight,
      color: 'text-red-500',
      bg: 'bg-red-50',
      dark: false,
    },
    {
      label: 'Pending',
      value: String(data?.stats?.pending_count ?? 0),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      dark: false,
    },
  ];

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-8 pb-20">

      {/* HERO */}
      <motion.div
        variants={floatUp}
        className="bg-gradient-to-br from-[#0b2419] to-[#1a5c42] text-white rounded-[32px] p-8 lg:p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage: 'radial-gradient(rgba(163,230,53,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a3e635]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/20 text-[10px] font-black uppercase tracking-widest text-[#a3e635] mb-6">
              <Zap size={12} /> Golden Ledger
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none mb-4">
              Transaction Monitor.
            </h1>
            <p className="text-white/50 text-sm font-bold leading-relaxed max-w-xl">
              Real-time ledger feed of all financial flows across savings, loans, shares, and wallet channels.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={loadData}
              title="Refresh transactions"
              className="h-12 px-6 bg-white/10 border border-white/20 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              title="Export transactions"
              className="h-12 px-6 bg-[#a3e635] text-[#0b2419] font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#bceb3b] transition-all flex items-center gap-2 shadow-lg shadow-[#a3e635]/20"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI GRID */}
      <motion.div variants={floatUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={cn(
              'rounded-[28px] p-7 flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform',
              kpi.dark ? kpi.bg : 'bg-white border border-gray-100 shadow-sm'
            )}
          >
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', kpi.dark ? 'bg-white/10' : kpi.bg, kpi.color)}>
              <kpi.icon size={22} />
            </div>
            <div>
              <div className={cn('text-[10px] font-black uppercase tracking-widest mb-1', kpi.dark ? 'text-white/40' : 'text-gray-400')}>{kpi.label}</div>
              <div className={cn('text-2xl font-black tracking-tight', kpi.dark ? 'text-white' : 'text-[#0b2419]')}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* FILTER BAR */}
      <motion.div variants={floatUp} className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            title="Search transactions"
            placeholder="Search by member name, reference..."
            className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#0b2419]/10 focus:border-[#0b2419]/30 outline-none"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
        </div>

        {/* Type */}
        <div className="flex items-center gap-3 px-5 h-12 bg-gray-50 border border-gray-200 rounded-2xl min-w-[180px]">
          <Filter size={16} className="text-gray-400 shrink-0" />
          <select
            title="Filter by transaction type"
            className="bg-transparent border-none outline-none text-xs font-bold text-gray-700 cursor-pointer w-full"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="loan_disbursement">Loan Payouts</option>
            <option value="loan_repayment">Loan Repayments</option>
            <option value="share_capital">Share Capital</option>
            <option value="dividend">Dividends</option>
          </select>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 px-5 h-12 bg-gray-50 border border-gray-200 rounded-2xl min-w-[160px]">
          <DollarSign size={16} className="text-gray-400 shrink-0" />
          <select
            title="Filter by status"
            className="bg-transparent border-none outline-none text-xs font-bold text-gray-700 cursor-pointer w-full"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Date Range */}
        <input
          type="date"
          title="Start date"
          placeholder="Start date"
          className="h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#0b2419]/10"
          value={filters.start}
          onChange={(e) => setFilters({ ...filters, start: e.target.value })}
        />
        <input
          type="date"
          title="End date"
          placeholder="End date"
          className="h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#0b2419]/10"
          value={filters.end}
          onChange={(e) => setFilters({ ...filters, end: e.target.value })}
        />

        <button
          title="Reset filters"
          onClick={() => setFilters({ q: '', type: '', start: '', end: '', status: '' })}
          className="h-12 px-6 bg-gray-100 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all shrink-0"
        >
          Reset
        </button>
      </motion.div>

      {/* TABLE */}
      <motion.div variants={floatUp} className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0b2419]">Transaction Feed</h3>
            <p className="text-xs font-bold text-gray-400 mt-0.5">{data?.transactions?.length ?? 0} records found</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                {['Date', 'Member', 'Type', 'Channel', 'Amount', 'Status', 'Reference'].map((h) => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr><td colSpan={7} className="p-16 text-center">
                    <div className="w-8 h-8 border-2 border-[#a3e635]/20 border-t-[#a3e635] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Syncing Ledger...</p>
                  </td></tr>
                ) : !data?.transactions?.length ? (
                  <tr><td colSpan={7} className="p-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <DollarSign size={28} className="text-gray-200" />
                    </div>
                    <p className="text-sm font-black text-gray-400">No transactions found</p>
                  </td></tr>
                ) : (
                  data.transactions.map((txn, idx) => {
                    const inflow = isInflow(txn.transaction_type);
                    const statusCfg = STATUS_CONFIG[txn.status] ?? STATUS_CONFIG.pending;
                    return (
                      <motion.tr
                        key={txn.transaction_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div className="text-xs font-black text-gray-800 font-mono">
                            {new Date(txn.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                            {new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-xs font-black text-gray-800">{txn.full_name}</div>
                          <div className="text-[10px] font-bold text-gray-400 mt-0.5">ID #{txn.member_id}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border',
                            inflow
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-red-50 text-red-500 border-red-100'
                          )}>
                            {inflow ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                            {TYPE_LABELS[txn.transaction_type] ?? txn.transaction_type}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-black uppercase tracking-widest">
                            {txn.payment_channel || 'System'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className={cn(
                            'text-sm font-black tracking-tight',
                            inflow ? 'text-emerald-600' : 'text-red-500'
                          )}>
                            {inflow ? '+' : '-'} {formatKES(txn.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border',
                            statusCfg.cls
                          )}>
                            {statusCfg.icon}
                            {statusCfg.label}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <code className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            {txn.reference_no || `TXN-${txn.transaction_id}`}
                          </code>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
