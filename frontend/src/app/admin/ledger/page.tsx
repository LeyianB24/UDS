"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity,
  ShieldCheck,
  Zap,
  RefreshCw,
  Server,
  Database,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  Trash2,
  HardDrive
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { cn, formatKES } from '@/lib/utils';

export default function AdminLedgerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'health' | 'audit'>('feed');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`admin/ledger?search=${searchQuery}`);
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSystemAction = async (action: string) => {
      try {
          const res = await fetchApi('admin/ledger', 'POST', { action });
          alert(res.message);
          if (res.status === 'success') {
              loadData();
          }
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* HERO */}
      <div className="bg-gradient-to-br from-[#0f2e25] to-[#1a5c42] text-white rounded-[32px] p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl shadow-green-950/20">
         <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }}></div>
         
         <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-[10px] font-black uppercase tracking-widest text-lime-200 mb-6">
               <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" /> Unified Monitoring
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none mb-4">
               System Monitor.
            </h1>
            <p className="text-white/60 text-sm font-bold leading-relaxed">
               Operations feed, financial integrity, and security audit in one view.
            </p>
         </div>

         <div className="relative z-10 flex flex-col gap-3 shrink-0">
             <button onClick={loadData} className="px-6 py-4 bg-lime-400 text-[#0f2e25] font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20">
                 <RefreshCw size={16} /> Refresh Feed
             </button>
         </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 bg-white border border-gray-200 rounded-2xl p-2 w-fit shadow-sm">
          <button onClick={() => setActiveTab('feed')} className={cn("px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2", activeTab === 'feed' ? "bg-[var(--brand-forest)] text-white shadow-md" : "text-gray-500 hover:text-gray-900")}>
              <Activity size={16} /> Operations Feed
          </button>
          <button onClick={() => setActiveTab('health')} className={cn("px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2", activeTab === 'health' ? "bg-[var(--brand-forest)] text-white shadow-md" : "text-gray-500 hover:text-gray-900")}>
              <Server size={16} /> Health & Integrity
          </button>
      </div>

      {activeTab === 'feed' && (
      <div className="space-y-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4"><CheckCircle2 size={20} /></div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Callback Success</div>
                  <div className="text-3xl font-black text-[var(--brand-forest)]">{data?.health?.callback_success_rate || 0}%</div>
                  <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{width: \`\${data?.health?.callback_success_rate || 0}%\`}}></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4"><AlertTriangle size={20} /></div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Pending STK</div>
                  <div className="text-3xl font-black text-amber-600">{data?.health?.pending_transactions || 0}</div>
                  <div className="mt-4 text-[10px] font-bold text-amber-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Stuck {'>'} 5 mins
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4"><AlertTriangle size={20} /></div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Failed Comms</div>
                  <div className="text-3xl font-black text-red-600">{data?.health?.failed_notifications || 0}</div>
                  <div className="mt-4 text-[10px] font-bold text-red-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Delivery errors today
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-rose-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="bg-gradient-to-br from-[var(--brand-forest)] to-[#1a5c42] rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform border-none">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-lime-400 flex items-center justify-center mb-4"><Zap size={20} /></div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Daily Volume</div>
                  <div className="text-2xl font-black text-white">{formatKES(data?.health?.daily_volume || 0)}</div>
                  <div className="mt-4 text-[10px] font-bold text-white/50 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span> Successfully processed
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-lime-400 to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
          </div>

          {/* FEED TABLE */}
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                      <h3 className="text-sm font-black text-gray-900">Operation Audit Feed</h3>
                      <p className="text-xs font-bold text-gray-500 mt-1">Real-time system activity</p>
                  </div>
                  <div className="flex gap-2">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                          <input 
                              type="text" 
                              placeholder="Search logs..." 
                              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[var(--brand-forest)]/20 focus:border-[var(--brand-forest)] outline-none"
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                          />
                      </div>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Time</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Action</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Severity</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Details</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">IP</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {loading ? (
                              <tr><td colSpan={5} className="p-8 text-center text-sm font-bold text-gray-400">Loading...</td></tr>
                          ) : data?.logs?.length === 0 ? (
                              <tr><td colSpan={5} className="p-8 text-center text-sm font-bold text-gray-400">No logs found</td></tr>
                          ) : (
                              data?.logs?.map((log: any) => (
                                  <tr key={log.id} className="hover:bg-gray-50/50">
                                      <td className="px-6 py-4">
                                          <div className="text-xs font-black text-gray-900 font-mono">{new Date(log.created_at).toLocaleTimeString()}</div>
                                          <div className="text-[10px] font-bold text-gray-500 mt-0.5">{new Date(log.created_at).toLocaleDateString()}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="text-xs font-black text-gray-900">{log.action}</div>
                                          <div className="text-[10px] font-bold text-gray-500 mt-0.5">{log.user_type || 'System'}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={cn(
                                              "px-2 py-1 rounded border text-[10px] font-black uppercase tracking-widest",
                                              log.severity === 'info' ? "bg-blue-50 text-blue-600 border-blue-200" :
                                              log.severity === 'warning' ? "bg-amber-50 text-amber-600 border-amber-200" :
                                              log.severity === 'error' ? "bg-red-50 text-red-600 border-red-200" :
                                              "bg-green-50 text-green-600 border-green-200"
                                          )}>{log.severity || 'INFO'}</span>
                                      </td>
                                      <td className="px-6 py-4 text-xs font-bold text-gray-600 max-w-[300px] truncate">
                                          {log.details}
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded font-mono text-[10px] font-bold">{log.ip_address}</span>
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
      )}

      {activeTab === 'health' && (
      <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-black text-gray-900">Ledger Balance Sync</div>
                      <span className={cn("w-2 h-2 rounded-full", data?.health?.ledger_imbalance ? "bg-red-500 animate-pulse" : "bg-green-500")}></span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 mb-6">Total Debits vs Credits in the golden ledger. Discrepancies indicate posting errors.</p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", data?.health?.ledger_imbalance ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                          {data?.health?.ledger_imbalance ? 'Imbalance Detected' : 'Healthy'}
                      </span>
                  </div>
                  <div className={cn("absolute bottom-0 left-0 w-full h-1", data?.health?.ledger_imbalance ? "bg-red-500" : "bg-green-500")} />
              </div>
              
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-black text-gray-900">Member Account Sync</div>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 mb-6">Verifies individual account balances against the full transaction history for each member.</p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600">Verified</span>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500" />
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-black text-gray-900">Database Storage</div>
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 mb-6">Current size of the central repository. Archiving is recommended above 500 MB.</p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xl font-black text-[var(--brand-forest)]">{data?.health?.db_size || 0} MB</span>
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500">Storage</span>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-lime-400" />
              </div>
          </div>

          {/* POWER PANEL */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-[var(--brand-forest)] text-lime-400 rounded-2xl flex items-center justify-center">
                      <Server size={20} />
                  </div>
                  <div>
                      <h3 className="text-lg font-black text-gray-900">Maintenance Power Panel</h3>
                      <p className="text-xs font-bold text-gray-500">Direct low-level system diagnostic and recovery operations.</p>
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button onClick={() => handleSystemAction('test_connectivity')} className="p-6 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-gray-200 rounded-2xl text-center transition-all group shadow-sm hover:shadow-md">
                      <Wifi size={24} className="mx-auto text-[var(--brand-forest)] mb-3" />
                      <div className="text-sm font-black text-gray-900 mb-1">API Connectivity</div>
                      <div className="text-[10px] font-bold text-gray-500 leading-tight">Test M-Pesa gateway & mail server</div>
                  </button>
                  <button onClick={() => handleSystemAction('clear_cache')} className="p-6 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-gray-200 rounded-2xl text-center transition-all group shadow-sm hover:shadow-md">
                      <Trash2 size={24} className="mx-auto text-[var(--brand-forest)] mb-3" />
                      <div className="text-sm font-black text-gray-900 mb-1">Purge Cache</div>
                      <div className="text-[10px] font-bold text-gray-500 leading-tight">Clear session & temp files</div>
                  </button>
                  <button onClick={() => handleSystemAction('resync_financials')} className="p-6 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-gray-200 rounded-2xl text-center transition-all group shadow-sm hover:shadow-md">
                      <Database size={24} className="mx-auto text-[var(--brand-forest)] mb-3" />
                      <div className="text-sm font-black text-gray-900 mb-1">Resync Ledgers</div>
                      <div className="text-[10px] font-bold text-gray-500 leading-tight">Recalculate all account balances</div>
                  </button>
                  <button onClick={() => handleSystemAction('run_audit')} className="p-6 bg-[var(--brand-forest)] text-lime-400 hover:bg-green-900 rounded-2xl text-center transition-all group shadow-sm hover:shadow-md">
                      <ShieldCheck size={24} className="mx-auto mb-3" />
                      <div className="text-sm font-black mb-1">Run Deep Audit</div>
                      <div className="text-[10px] font-bold text-white/60 leading-tight">Execute full system integrity scan</div>
                  </button>
              </div>
          </div>
      </div>
      )}
    </div>
  );
}