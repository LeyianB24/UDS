"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, TrendingUp, Users, DollarSign, AlertTriangle,
  RefreshCw, CheckCircle, XCircle, Zap, ArrowUpRight, ShieldCheck,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { cn, formatKES } from '@/lib/utils';

const up = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

interface Valuation { equity: number; total_assets: number; liabilities: number; total_units: number; price: number; shareholders: number; }
interface Holder { full_name: string; units_owned: number; total_amount_paid: number; ownership_pct: number; }
interface ExitReq { withdrawal_id: number; member_id: number; full_name: string; amount: number; ref_no: string; phone_number: string; created_at: string; }
interface ShareTxn { transaction_id: number; created_at: string; reference_no: string; units: number; unit_price: number; total_value: number; transaction_type: string; full_name: string; }
interface ShareData { valuation: Valuation; top_holders: Holder[]; pending_exits: ExitReq[]; transactions: ShareTxn[]; }

export default function AdminSharesPage() {
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Dividend modal state
  const [divModal, setDivModal] = useState(false);
  const [divPool, setDivPool] = useState('');
  const [divYear, setDivYear] = useState(String(new Date().getFullYear()));

  // Exit review modal state
  const [exitModal, setExitModal] = useState<ExitReq | null>(null);
  const [exitStatus, setExitStatus] = useState('');
  const [exitNotes, setExitNotes] = useState('');
  const [exitPayout, setExitPayout] = useState('bank');

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('admin/shares');
      if (res.status === 'success') setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const distributeDividend = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await fetchApi('admin/shares', 'POST', { action: 'distribute_dividend', dividend_pool: parseFloat(divPool), fiscal_year: divYear });
      showToast(res.message, res.status === 'success');
      if (res.status === 'success') { setDivModal(false); setDivPool(''); loadData(); }
    } catch (e) { showToast('Distribution failed', false); console.error(e); }
    finally { setProcessing(false); }
  };

  const processExit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitModal) return;
    setProcessing(true);
    try {
      const res = await fetchApi('admin/shares', 'POST', { action: 'process_exit', request_id: exitModal.withdrawal_id, status: exitStatus, admin_notes: exitNotes, payout_method: exitPayout });
      showToast(res.message, res.status === 'success');
      if (res.status === 'success') { setExitModal(null); loadData(); }
    } catch (e) { showToast('Processing failed', false); console.error(e); }
    finally { setProcessing(false); }
  };

  const v = data?.valuation;

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-8 pb-20">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={cn('fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl text-sm font-black flex items-center gap-3',
              toast.ok ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white')}>
            {toast.ok ? <CheckCircle size={18} /> : <XCircle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <motion.div variants={up}
        className="bg-gradient-to-br from-[#0b2419] to-[#1a5c42] text-white rounded-[32px] p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(#a3e635 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/20 text-[10px] font-black uppercase tracking-widest text-[#a3e635] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" /> Corporate Equity
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none mb-4">Shares &amp; Equity.</h1>
            <p className="text-white/50 text-sm font-bold max-w-lg leading-relaxed">
              NAV valuation, dividend distribution, and SACCO exit management in one view.
            </p>
          </div>
          <div className="flex gap-3 shrink-0 flex-wrap">
            <button onClick={loadData} title="Refresh data"
              className="h-12 px-6 bg-white/10 border border-white/20 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
              <RefreshCw size={15} /> Refresh
            </button>
            <button onClick={() => setDivModal(true)} title="Distribute dividend"
              className="h-12 px-6 bg-[#a3e635] text-[#0b2419] font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#bceb3b] transition-all flex items-center gap-2 shadow-lg shadow-[#a3e635]/20">
              <DollarSign size={15} /> Distribute Dividend
            </button>
          </div>
        </div>
      </motion.div>

      {/* Pending Exits Banner */}
      {!!data?.pending_exits?.length && (
        <motion.div variants={up}
          className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-400 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-black text-amber-800">
                {data.pending_exits.length} Pending SACCO Exit Request{data.pending_exits.length > 1 ? 's' : ''}
              </div>
              <div className="text-xs font-bold text-amber-600 mt-0.5">Requires admin review and payout decision</div>
            </div>
          </div>
          <button onClick={() => setExitModal(data.pending_exits[0])} title="Review exit request"
            className="px-5 py-2 bg-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shrink-0">
            Review
          </button>
        </motion.div>
      )}

      {/* KPI CARDS */}
      <motion.div variants={up} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Net Asset Value', value: formatKES(v?.equity ?? 0), icon: TrendingUp, dark: true },
          { label: 'Unit Price (NAV/Unit)', value: formatKES(v?.price ?? 0), icon: ArrowUpRight, dark: false },
          { label: 'Total Units Issued', value: (v?.total_units ?? 0).toLocaleString('en-KE', { maximumFractionDigits: 2 }), icon: PieChart, dark: false },
          { label: 'Shareholders', value: String(v?.shareholders ?? 0), icon: Users, dark: false },
        ].map((k) => (
          <div key={k.label}
            className={cn('rounded-[28px] p-7 flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform',
              k.dark ? 'bg-[#0b2419]' : 'bg-white border border-gray-100 shadow-sm')}>
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', k.dark ? 'bg-[#a3e635]/10 text-[#a3e635]' : 'bg-gray-50 text-[#0b2419]')}>
              <k.icon size={22} />
            </div>
            <div>
              <div className={cn('text-[10px] font-black uppercase tracking-widest mb-1', k.dark ? 'text-white/40' : 'text-gray-400')}>{k.label}</div>
              <div className={cn('text-xl font-black tracking-tight', k.dark ? 'text-white' : 'text-[#0b2419]')}>{loading ? '—' : k.value}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Assets / Liabilities Detail */}
      <motion.div variants={up} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Assets</div>
          <div className="text-2xl font-black text-emerald-600">{formatKES(v?.total_assets ?? 0)}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Liabilities</div>
          <div className="text-2xl font-black text-red-500">{formatKES(v?.liabilities ?? 0)}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Par Value (Floor)</div>
          <div className="text-2xl font-black text-[#0b2419]">KES 10.00</div>
        </div>
      </motion.div>

      {/* Transactions + Top Holders */}
      <motion.div variants={up} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[28px] overflow-hidden shadow-sm">
          <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#0b2419]">Share Transaction History</h3>
              <p className="text-xs font-bold text-gray-400 mt-0.5">{data?.transactions?.length ?? 0} records</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {['Date', 'Member', 'Type', 'Units', 'Total Value', 'Reference'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="p-12 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Loading...</td></tr>
                ) : !data?.transactions?.length ? (
                  <tr><td colSpan={6} className="p-12 text-center text-xs font-black text-gray-400 uppercase tracking-widest">No transactions found</td></tr>
                ) : data.transactions.map(t => (
                  <tr key={t.transaction_id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-xs font-black text-gray-800">{new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-black text-[#0b2419]">{t.full_name || 'System'}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-black uppercase tracking-widest">
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-black text-gray-700">{Number(t.units ?? 0).toFixed(4)}</td>
                    <td className="px-5 py-4 text-xs font-black text-[#0b2419]">{formatKES(t.total_value)}</td>
                    <td className="px-5 py-4">
                      <code className="text-[10px] font-bold bg-gray-50 border border-gray-100 px-2 py-1 rounded text-gray-500">{t.reference_no}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Shareholders */}
        <div className="bg-white border border-gray-100 rounded-[28px] overflow-hidden shadow-sm">
          <div className="px-7 py-5 border-b border-gray-50">
            <h3 className="text-sm font-black text-[#0b2419]">Top Shareholders</h3>
            <p className="text-xs font-bold text-gray-400 mt-0.5">By equity ownership</p>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Loading...</div>
            ) : data?.top_holders?.map((h, idx) => (
              <div key={h.full_name} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black',
                    idx === 0 ? 'bg-[#a3e635]/20 text-[#0b2419]' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500')}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#0b2419]">{h.full_name}</div>
                    <div className="text-[10px] font-bold text-gray-400">{Number(h.units_owned).toFixed(2)} units</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-[#0b2419]">{formatKES(Number(h.units_owned) * (v?.price ?? 0))}</div>
                  <div className="text-[10px] font-bold text-emerald-600">{Number(h.ownership_pct).toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* DIVIDEND MODAL */}
      <AnimatePresence>
        {divModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] overflow-hidden shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-br from-[#0b2419] to-[#1a5c42] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                      <DollarSign size={18} className="text-[#a3e635]" />
                    </div>
                    <h2 className="text-base font-black text-white">Distribute Dividend</h2>
                  </div>
                  <button onClick={() => setDivModal(false)} title="Close" className="text-white/60 hover:text-white transition-colors text-xl leading-none">&times;</button>
                </div>
              </div>
              <form onSubmit={distributeDividend} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Fiscal Year</label>
                  <select title="Select fiscal year" value={divYear} onChange={e => setDivYear(e.target.value)}
                    className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#0b2419]/10">
                    {[0, 1, 2].map(n => <option key={n} value={String(new Date().getFullYear() - n)}>{new Date().getFullYear() - n}{n === 0 ? ' (Current)' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Total Dividend Pool (KES)</label>
                  <input type="number" min="1" step="0.01" required title="Dividend pool amount" placeholder="e.g. 500000"
                    value={divPool} onChange={e => setDivPool(e.target.value)}
                    className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#0b2419]/10" />
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs font-bold text-blue-700">
                  Amount distributed pro-rata to all unit holders. 5% WHT deducted before crediting.
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setDivModal(false)} className="flex-1 h-11 border border-gray-200 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                  <button type="submit" disabled={processing} className="flex-1 h-11 bg-[#a3e635] text-[#0b2419] font-black rounded-xl text-sm uppercase tracking-widest hover:bg-[#bceb3b] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {processing ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    Distribute
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXIT REVIEW MODAL */}
      <AnimatePresence>
        {exitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] overflow-hidden shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-br from-amber-700 to-amber-500 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                      <AlertTriangle size={18} className="text-white" />
                    </div>
                    <h2 className="text-base font-black text-white">Review Exit Request</h2>
                  </div>
                  <button onClick={() => setExitModal(null)} title="Close" className="text-white/60 hover:text-white transition-colors text-xl leading-none">&times;</button>
                </div>
              </div>
              <form onSubmit={processExit} className="p-6 space-y-4">
                <div className="space-y-2">
                  {[['Member', exitModal.full_name], ['Refund Amount', formatKES(exitModal.amount)], ['Reference', exitModal.ref_no]].map(([l, v2]) => (
                    <div key={l} className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{l}</span>
                      <span className="text-sm font-black text-[#0b2419]">{v2}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Action</label>
                  <select title="Select action" required value={exitStatus} onChange={e => setExitStatus(e.target.value)}
                    className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-400/30">
                    <option value="">— Choose Action —</option>
                    <option value="approved">✅ Approve &amp; Pay (Complete Exit)</option>
                    <option value="rejected">❌ Reject &amp; Reinstate Shares</option>
                  </select>
                </div>
                {exitStatus === 'approved' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Payout Channel</label>
                    <select title="Select payout channel" value={exitPayout} onChange={e => setExitPayout(e.target.value)}
                      className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#0b2419]/10">
                      <option value="bank">🏦 SACCO Bank Account</option>
                      <option value="cash">💵 Cash at Hand</option>
                      <option value="mpesa">📱 M-Pesa</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Admin Notes <span className="text-red-500">*</span></label>
                  <textarea required title="Admin notes" placeholder="Reason for approval or rejection..."
                    value={exitNotes} onChange={e => setExitNotes(e.target.value)} rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-400/30 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setExitModal(null)} className="flex-1 h-11 border border-gray-200 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                  <button type="submit" disabled={processing || !exitStatus}
                    className="flex-1 h-11 bg-amber-500 text-white font-black rounded-xl text-sm uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {processing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
