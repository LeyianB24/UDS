"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Download, 
  FileText, 
  Printer, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { cn, formatKES } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function AdminTrialBalancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<{name: string, data: any} | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('admin/balance');
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = (type: string) => {
      alert(\`Export \${type} triggered.\`);
  };

  const chartData = data ? [
      { name: 'Total Assets (Dr)', value: data.total_assets, fill: '#22c55e' },
      { name: 'Liabilities & Equity (Cr)', value: data.total_liabilities + data.total_equity, fill: data.is_balanced ? '#1a3a2a' : '#ef4444' }
  ] : [];

  if (loading && !data) {
      return <div className="p-10 text-center font-bold text-gray-400">Verifying Golden Ledger...</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[var(--brand-forest)] via-[#234d38] to-[#2e6347] text-white rounded-[32px] p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl">
         <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 90% -10%, rgba(168,224,99,.22) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at -5% 100%, rgba(168,224,99,.08) 0%, transparent 55%)' }}></div>
         
         <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-white/80 mb-6">
               <ShieldCheck size={14} /> Audit Protocol V10.5
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none mb-4">
               Trial Balance Proof.
            </h1>
            <p className="text-white/60 text-sm font-bold leading-relaxed mb-8">
               Mathematically verifying that Assets = Liabilities + Equity.
            </p>

            <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 min-w-[140px]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Total Assets</div>
                    <div className="text-lg font-black text-white">{formatKES(data?.total_assets || 0)}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 min-w-[140px]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Liab + Equity</div>
                    <div className="text-lg font-black text-white">{formatKES((data?.total_liabilities || 0) + (data?.total_equity || 0))}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 min-w-[140px]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Net Income</div>
                    <div className="text-lg font-black text-lime-400">{formatKES(data?.net_income || 0)}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 min-w-[140px]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Balance Status</div>
                    <div className={cn("text-lg font-black flex items-center gap-2", data?.is_balanced ? "text-lime-400" : "text-red-400")}>
                        {data?.is_balanced ? <><CheckCircle2 size={16} /> Balanced</> : <><AlertTriangle size={16} /> Imbalanced</>}
                    </div>
                </div>
            </div>
         </div>

         <div className="relative z-10 flex flex-col gap-3 shrink-0">
             <div className="relative group">
                 <button className="w-full px-6 py-4 bg-lime-400 text-[var(--brand-forest)] font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20">
                     <Download size={16} /> Export Analysis
                 </button>
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                     <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                         <FileText size={16} className="text-red-500" /> Export PDF
                     </button>
                     <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                         <FileText size={16} className="text-green-500" /> Export Excel
                     </button>
                     <button onClick={() => handleExport('print')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                         <Printer size={16} className="text-gray-500" /> Print Friendly
                     </button>
                 </div>
             </div>
         </div>
      </div>

      {/* KPI STRIP + CHART */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="w-12 h-12 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center mb-4"><Lock size={20} /></div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Assets</div>
                  <div className="text-2xl font-black text-gray-900 mb-2">{formatKES(data?.total_assets || 0)}</div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500"><TrendingUp size={14} /> Debit Balance</div>
                  <Lock size={120} className="absolute -right-6 -bottom-6 text-gray-50 opacity-50 pointer-events-none group-hover:rotate-12 transition-transform" />
              </div>

              <div className={cn("border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group", data?.is_balanced ? "bg-gradient-to-br from-[var(--brand-forest)] to-[#2e6347] border-[var(--brand-forest)] text-white" : "bg-red-50 border-red-200 text-red-900")}>
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", data?.is_balanced ? "bg-white/10 text-white" : "bg-red-100 text-red-700")}><Lock size={20} /></div>
                  <div className={cn("text-[10px] font-black uppercase tracking-widest mb-2", data?.is_balanced ? "text-white/60" : "text-red-500")}>Liabilities & Equity</div>
                  <div className="text-2xl font-black mb-2">{formatKES((data?.total_liabilities || 0) + (data?.total_equity || 0))}</div>
                  <div className={cn("flex items-center gap-1.5 text-xs font-bold mb-4", data?.is_balanced ? "text-white/60" : "text-red-600")}><ShieldCheck size={14} /> Credit Balance</div>
                  <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", data?.is_balanced ? "bg-white/10 text-lime-400 border-lime-400/30" : "bg-red-100 text-red-600 border-red-300")}>
                      {data?.is_balanced ? <><CheckCircle2 size={12} /> Balanced</> : <><AlertTriangle size={12} /> Imbalanced</>}
                  </div>
                  <Lock size={120} className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform" />
              </div>

              <div className="bg-lime-400 border border-lime-500/30 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="w-12 h-12 bg-green-900/10 text-green-900 rounded-2xl flex items-center justify-center mb-4"><TrendingUp size={20} /></div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-green-900/60 mb-2">Net Income (P&L)</div>
                  <div className="text-2xl font-black text-green-900 mb-2">{formatKES(data?.net_income || 0)}</div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-900/70"><Sparkles size={14} /> Recorded Surplus</div>
                  <TrendingUp size={120} className="absolute -right-6 -bottom-6 text-green-900 opacity-5 pointer-events-none group-hover:-rotate-12 transition-transform" />
              </div>

          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--brand-forest)]">
                      <PieChartIcon size={16} /> Equation Balance
                  </div>
                  <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", data?.is_balanced ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200")}>
                      {data?.is_balanced ? 'Balanced' : 'Imbalanced'}
                  </div>
              </div>
              <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                          >
                              {chartData.map((entry: any, index: number) => (
                                  <Cell key={\`cell-\${index}\`} fill={entry.fill} />
                              ))}
                          </Pie>
                          <RechartsTooltip formatter={(val: number) => formatKES(val)} />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* LEDGER PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ASSETS */}
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center shrink-0"><Lock size={18} /></div>
                  <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-[var(--brand-forest)]">Assets — Debit Balance</h3>
                      <p className="text-xs font-bold text-gray-500 mt-1">{Object.keys(data?.categories?.assets || {}).length} category groups</p>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                  {Object.entries(data?.categories?.assets || {}).map(([cat, info]: any) => (
                      <div key={cat} onClick={() => setSelectedCat({name: cat, data: info})} className="flex items-center justify-between p-5 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-gray-900 uppercase">{cat} GROUP</span>
                              <Layers size={14} className="text-gray-400" />
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-green-700 font-mono">{formatKES(info.total)}</span>
                              <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                          </div>
                      </div>
                  ))}
              </div>
              <div className="p-5 bg-gray-50 border-t-2 border-gray-200 flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Debit Entries</span>
                  <span className="text-xl font-black text-green-700 font-mono">{formatKES(data?.total_assets || 0)}</span>
              </div>
          </div>

          {/* LIAB & EQUITY */}
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div>
                  <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-[var(--brand-forest)]">Liabilities & Equity — Credit Balance</h3>
                      <p className="text-xs font-bold text-gray-500 mt-1">{Object.keys(data?.categories?.liabilities || {}).length + Object.keys(data?.categories?.equity || {}).length} category groups</p>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                  
                  {/* Liabilities */}
                  {Object.entries(data?.categories?.liabilities || {}).map(([cat, info]: any) => (
                      <div key={cat} onClick={() => setSelectedCat({name: cat, data: info})} className="flex items-center justify-between p-5 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-gray-900 uppercase">{cat} OBLIGATIONS</span>
                              <Layers size={14} className="text-gray-400" />
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-gray-900 font-mono">{formatKES(info.total)}</span>
                              <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                          </div>
                      </div>
                  ))}

                  {/* Equity */}
                  {Object.keys(data?.categories?.equity || {}).length > 0 && (
                      <div className="px-5 py-3 bg-gray-50 border-y border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Equity & Reserves
                      </div>
                  )}
                  {Object.entries(data?.categories?.equity || {}).map(([cat, info]: any) => (
                      <div key={cat} onClick={() => setSelectedCat({name: cat, data: info})} className="flex items-center justify-between p-5 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-gray-900 uppercase">{cat} PORTFOLIO</span>
                              <Layers size={14} className="text-gray-400" />
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-gray-900 font-mono">{formatKES(info.total)}</span>
                              <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                          </div>
                      </div>
                  ))}

                  {/* Net Income */}
                  <div className="flex items-center justify-between p-5 bg-lime-400/10 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm font-black text-[var(--brand-forest)]">
                          <Sparkles size={16} /> Net Income (Surplus/Deficit)
                      </div>
                      <span className={cn("text-base font-black font-mono", data?.net_income < 0 ? "text-red-600" : "text-green-700")}>
                          {formatKES(data?.net_income || 0)}
                      </span>
                  </div>

              </div>
              <div className="p-5 bg-gray-50 border-t-2 border-gray-200 flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Credit Entries</span>
                  <span className="text-xl font-black text-gray-900 font-mono">{formatKES((data?.total_liabilities || 0) + (data?.total_equity || 0))}</span>
              </div>
          </div>

      </div>

      {/* VERDICT BANNER */}
      <div className={cn("rounded-[32px] p-10 text-center border-2", data?.is_balanced ? "bg-gradient-to-br from-green-50 to-lime-50 border-lime-400/40" : "bg-gradient-to-br from-red-50 to-rose-50 border-red-300")}>
          <div className={cn("flex justify-center mb-4 text-5xl", data?.is_balanced ? "text-green-700" : "text-red-600")}>
              {data?.is_balanced ? <CheckCircle2 size={48} /> : <AlertTriangle size={48} />}
          </div>
          <h2 className={cn("text-2xl lg:text-3xl font-black tracking-tight mb-4", data?.is_balanced ? "text-[var(--brand-forest)]" : "text-red-700")}>
              {data?.is_balanced ? 'SYSTEM BALANCED' : 'IMBALANCE DETECTED'}
          </h2>
          <div className={cn("inline-flex items-center gap-3 px-6 py-3 rounded-full border text-sm font-bold font-mono", data?.is_balanced ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200")}>
              <span>Equation Difference:</span>
              <span className="text-lg font-black">{data?.balance_check?.toFixed(4)}</span>
          </div>
      </div>

      {/* AUDIT WARN */}
      {!data?.is_balanced && (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-5 flex items-start gap-4">
          <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
          <div>
              <h4 className="text-sm font-black text-red-900 mb-1">Audit Recommendation</h4>
              <p className="text-sm text-gray-800 leading-relaxed opacity-90">
                  A difference of more than <strong className="font-black">0.01</strong> suggests a database-level manual entry that bypassed the Double-Entry system. Please review recent manual SQL updates to the <code className="bg-white/50 px-2 py-0.5 rounded text-red-600 text-xs font-mono">ledger_accounts</code> or <code className="bg-white/50 px-2 py-0.5 rounded text-red-600 text-xs font-mono">transactions</code> tables.
              </p>
          </div>
      </div>
      )}

      {/* MODAL */}
      <Dialog open={!!selectedCat} onOpenChange={(open) => !open && setSelectedCat(null)}>
         <DialogContent className="max-w-md rounded-[32px] p-0 border-none shadow-2xl overflow-hidden">
            <div className="p-6 bg-white border-b border-gray-100">
               <div className="w-12 h-12 bg-lime-50 text-green-700 rounded-2xl flex items-center justify-center mb-4"><FileText size={20} /></div>
               <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Audit Detail</h3>
               <p className="text-xs font-bold text-gray-500">{selectedCat?.name || 'General'} group breakdown</p>
            </div>
            <div className="bg-white max-h-[50vh] overflow-y-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 sticky top-0">
                     <tr>
                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Account Name</th>
                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Balance (KES)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {selectedCat?.data?.items?.map((acc: any) => (
                          <tr key={acc.account_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-bold text-gray-900">{acc.account_name}</td>
                              <td className="px-6 py-4 text-sm font-black text-gray-900 font-mono text-right">{formatKES(acc.current_balance)}</td>
                          </tr>
                      ))}
                  </tbody>
               </table>
            </div>
            <div className="p-6 bg-[var(--brand-forest)] text-white flex justify-between items-center">
                <span className="text-sm font-bold">Group Total</span>
                <span className="text-lg font-black text-lime-400 font-mono">{formatKES(selectedCat?.data?.total || 0)}</span>
            </div>
         </DialogContent>
      </Dialog>

    </div>
  );
}
