"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  Printer,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Hash,
  Clock,
  Calendar,
  Banknote,
  LayoutList,
  Inbox,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Tag
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { cn, formatKES } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  
  const [formData, setFormData] = useState({
      transaction_type: '',
      member_id: '',
      amount: '',
      reference_no: '',
      payment_method: 'cash',
      unified_asset_id: 'other_0',
      notes: '',
      txn_date: new Date().toISOString().split('T')[0]
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`admin/payments?search=${searchQuery}&type=${typeFilter}`);
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await fetchApi('admin/payments', 'POST', { action: 'record_txn', ...formData });
          if (res.status === 'success') {
              setShowAddModal(false);
              setFormData({
                  transaction_type: '',
                  member_id: '',
                  amount: '',
                  reference_no: '',
                  payment_method: 'cash',
                  unified_asset_id: 'other_0',
                  notes: '',
                  txn_date: new Date().toISOString().split('T')[0]
              });
              loadData();
          } else {
              alert(res.message);
          }
      } catch (e) {
          console.error(e);
      }
  };

  const handleExport = (type: string) => {
      // In a real app, this would trigger a download.
      // For this migration, we'll just show an alert or open a new window.
      alert(`Export ${type} triggered. Real implementation would generate file.`);
  };

  const isIncome = (type: string) => ['deposit', 'savings_deposit', 'loan_repayment', 'share_purchase', 'revenue_inflow', 'share_capital'].includes(type);

  const needsMember = ['deposit', 'withdrawal', 'loan_repayment', 'share_capital'].includes(formData.transaction_type);
  const needsAsset = ['expense', 'income'].includes(formData.transaction_type);

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="bg-[var(--brand-forest)] text-white rounded-[32px] p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl shadow-green-950/20">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
         
         <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none mb-4">
               Transactions Ledger.
            </h1>
            <p className="text-white/70 text-sm font-bold leading-relaxed mb-8">
               Monitor all financial inflows and outflows across the Sacco.
            </p>

            <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 min-w-[150px]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Total Inflow</div>
                    <div className="text-xl font-black text-lime-400">{formatKES(data?.stats?.total_in || 0)}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 min-w-[150px]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Total Outflow</div>
                    <div className="text-xl font-black text-pink-400">{formatKES(data?.stats?.total_out || 0)}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 min-w-[100px]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Transactions</div>
                    <div className="text-xl font-black text-white">{Number(data?.stats?.total_count || 0).toLocaleString()}</div>
                </div>
            </div>
         </div>

         <div className="relative z-10 flex flex-col gap-3 shrink-0">
             <button onClick={() => setShowAddModal(true)} className="px-6 py-4 bg-lime-400 text-green-950 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20">
                 <Plus size={16} /> New Transaction
             </button>
             <div className="relative group">
                 <button className="w-full px-6 py-4 bg-white/10 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-white/20 border border-white/20 transition-colors flex items-center justify-center gap-2">
                     <Download size={16} /> Export
                 </button>
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                     <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                         <FileText size={16} className="text-red-500" /> Export PDF
                     </button>
                     <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                         <LayoutList size={16} className="text-green-500" /> Export Excel
                     </button>
                     <button onClick={() => handleExport('print')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                         <Printer size={16} className="text-gray-500" /> Print Report
                     </button>
                 </div>
             </div>
         </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Search</label>
              <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                      type="text" 
                      placeholder="Reference, member name..." 
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                  />
              </div>
          </div>
          <div className="w-full lg:w-64">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Transaction Type</label>
              <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none appearance-none"
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
              >
                  <option value="">All Types</option>
                  <option value="deposit">Deposit (Savings)</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="loan_repayment">Loan Repayment</option>
                  <option value="share_capital">Share Capital</option>
                  <option value="revenue_inflow">Revenue Inflow</option>
                  <option value="expense">Expense</option>
              </select>
          </div>
          <button onClick={loadData} className="w-full lg:w-auto px-8 py-3 bg-[var(--brand-forest)] text-lime-400 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-green-900 transition-colors flex items-center justify-center gap-2 shrink-0 h-[46px]">
              <Filter size={16} /> Filter
          </button>
          {(searchQuery || typeFilter) && (
              <button onClick={() => { setSearchQuery(''); setTypeFilter(''); }} className="w-full lg:w-auto px-6 py-3 text-gray-500 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shrink-0 h-[46px]">
                  <XCircle size={16} /> Clear
              </button>
          )}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--brand-forest)]">
                  <ArrowRightLeft size={16} className="text-lime-500" /> Transaction Records
              </div>
              <div className="px-3 py-1 bg-lime-100 text-green-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-lime-200">
                  Showing Last 50
              </div>
          </div>

          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Member / Entity</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Reference & Date</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Amount</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Notes</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {loading ? (
                          <tr><td colSpan={6} className="p-8 text-center text-sm font-bold text-gray-400">Loading...</td></tr>
                      ) : data?.transactions?.length === 0 ? (
                          <tr><td colSpan={6} className="p-12 text-center">
                              <Inbox size={32} className="mx-auto text-gray-300 mb-3" />
                              <div className="text-sm font-black text-gray-900">No transactions found</div>
                          </td></tr>
                      ) : (
                          data?.transactions?.map((txn: any) => {
                              const isInc = isIncome(txn.transaction_type);
                              const name = txn.full_name || 'Office';
                              const initials = name.substring(0,2).toUpperCase();

                              return (
                                  <tr key={txn.transaction_id} className="hover:bg-gray-50/50 transition-colors group">
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                              <div className={cn(
                                                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border-2 border-transparent group-hover:border-current transition-colors",
                                                  isInc ? "bg-lime-50 text-green-700" : "bg-pink-50 text-pink-700"
                                              )}>
                                                  {initials}
                                              </div>
                                              <div>
                                                  <div className="text-sm font-black text-gray-900">
                                                      {txn.member_id ? (
                                                          <Link href={`/admin/members/${txn.member_id}`} className="hover:text-[var(--brand-forest)] transition-colors">{name}</Link>
                                                      ) : name}
                                                  </div>
                                                  {txn.national_id && <div className="text-[10px] font-bold text-gray-500 mt-0.5">ID: {txn.national_id}</div>}
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="text-sm font-bold text-gray-900 font-mono">{txn.reference_no}</div>
                                          <div className="text-[10px] font-bold text-gray-500 mt-0.5">{new Date(txn.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={cn(
                                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                              isInc ? "bg-lime-50 text-green-700 border-lime-200" : "bg-pink-50 text-pink-700 border-pink-200"
                                          )}>
                                              {txn.transaction_type.replace('_', ' ')}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <div className={cn("text-sm font-black", isInc ? "text-green-700" : "text-pink-600")}>
                                              {isInc ? '+' : '-'} {formatKES(txn.amount)}
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 max-w-[200px]">
                                          {txn.asset_title && (
                                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--brand-forest)] text-lime-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                                  <Tag size={10} /> {txn.asset_title}
                                              </div>
                                          )}
                                          <div className="text-xs font-bold text-gray-500 truncate">{txn.notes}</div>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <button onClick={() => alert('Download receipt feature mock')} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors ml-auto shadow-sm">
                                              <Download size={14} />
                                          </button>
                                      </td>
                                  </tr>
                              );
                          })
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* RECORD TRANSACTION MODAL */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
         <DialogContent className="max-w-md rounded-[32px] p-8 border-none shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="mb-6">
               <div className="w-12 h-12 bg-lime-50 text-green-600 rounded-2xl flex items-center justify-center mb-4"><Plus size={20} /></div>
               <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">Record Transaction</h3>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Log a new financial entry in the ledger.</p>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
               
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Transaction Type <span className="text-red-500">*</span></label>
                  <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none" value={formData.transaction_type} onChange={e => setFormData({...formData, transaction_type: e.target.value})}>
                     <option value="">Select type...</option>
                     <option value="deposit">Deposit (Savings)</option>
                     <option value="withdrawal">Withdrawal</option>
                     <option value="loan_repayment">Loan Repayment</option>
                     <option value="share_capital">Share Capital</option>
                     <option value="expense">Office Expense</option>
                     <option value="income">Revenue Inflow</option>
                  </select>
               </div>

               {needsMember && (
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Select Member <span className="text-red-500">*</span></label>
                  <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none" value={formData.member_id} onChange={e => setFormData({...formData, member_id: e.target.value})}>
                     <option value="">Select member...</option>
                     {data?.members?.map((m: any) => (
                         <option key={m.member_id} value={m.member_id}>{m.full_name} ({m.national_id})</option>
                     ))}
                  </select>
               </div>
               )}

               {needsAsset && (
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Related Entity</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none" value={formData.unified_asset_id} onChange={e => setFormData({...formData, unified_asset_id: e.target.value})}>
                     <option value="other_0">General / Office</option>
                     <optgroup label="Investments & Projects">
                         {data?.investments?.map((inv: any) => (
                             <option key={inv.investment_id} value={`inv_${inv.investment_id}`}>{inv.title}</option>
                         ))}
                     </optgroup>
                  </select>
               </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Amount (KES) <span className="text-red-500">*</span></label>
                      <input required type="number" step="0.01" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none text-green-700" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Date <span className="text-red-500">*</span></label>
                      <input required type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none" value={formData.txn_date} onChange={e => setFormData({...formData, txn_date: e.target.value})} />
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Reference No.</label>
                      <input type="text" placeholder="Auto-generated if blank" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none uppercase font-mono" value={formData.reference_no} onChange={e => setFormData({...formData, reference_no: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Method</label>
                      <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                         <option value="cash">Cash</option>
                         <option value="mpesa">M-Pesa</option>
                         <option value="bank">Bank Transfer</option>
                         <option value="cheque">Cheque</option>
                      </select>
                   </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Notes</label>
                  <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none resize-none h-20" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Optional description..." />
               </div>

               <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-4 text-gray-500 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors w-full sm:w-auto text-center">
                     Cancel
                  </button>
                  <button type="submit" className="px-6 py-4 bg-[var(--brand-forest)] text-lime-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-900 transition-colors w-full sm:w-auto text-center shadow-xl shadow-green-900/20">
                     Record Ledger Entry
                  </button>
               </div>
            </form>
         </DialogContent>
      </Dialog>

    </div>
  );
}
