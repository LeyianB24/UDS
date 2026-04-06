"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, 
    Download, 
    Calendar, 
    Filter, 
    Search, 
    ArrowLeft, 
    ChevronRight, 
    Printer, 
    FileJson, 
    FileSpreadsheet, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Activity,
    Info,
    ArrowUpRight,
    TrendingUp,
    Zap,
    X
} from 'lucide-react';
import { MemberApi, TransactionData } from '@/lib/api/member';
import { cn } from '@/lib/utils';

// floatUp animation variant
const floatUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.08
        }
    }
};

export default function StatementsPage() {
    const [data, setData] = useState<TransactionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [filterType, setFilterType] = useState('all');
    
    // Date Filters
    const [dateRange, setDateRange] = useState('30days');
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [showCustomDates, setShowCustomDates] = useState(false);

    // Notification State
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const res = await MemberApi.getTransactions(filterType, 100);
            setData(res);
        } catch (e) {
            console.error(e);
            setFlash({ type: 'err', msg: 'Failed to synchronize ledger records.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [filterType]);

    const handleDownload = async (format: 'pdf' | 'excel' | 'csv') => {
        setDownloading(true);
        setFlash(null);
        try {
            const blob = await MemberApi.downloadStatement({
                start_date: startDate,
                end_date: endDate,
                report_type: filterType,
                format
            });
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Statement_${filterType}_${startDate}_to_${endDate}.${format === 'excel' ? 'xlsx' : format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            setFlash({ type: 'ok', msg: `Protocol ${format.toUpperCase()} generated successfully.` });
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message || 'Statement decryption failed.' });
        } finally {
            setDownloading(false);
        }
    };

    const handleDateRangeChange = (range: string) => {
        setDateRange(range);
        const end = new Date();
        let start = new Date();
        
        switch(range) {
            case '30days': start.setDate(end.getDate() - 30); break;
            case '90days': start.setDate(end.getDate() - 90); break;
            case 'year': start.setFullYear(end.getFullYear(), 0, 1); break;
            case 'custom': setShowCustomDates(true); return;
            default: start.setDate(end.getDate() - 30);
        }
        
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
        setShowCustomDates(false);
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-[#0b2419]/10 border-t-[#a3e635] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="pb-24"
        >
            {/* HERO SECTION */}
            <motion.div variants={floatUp} className="bg-[#0b2419] rounded-b-[48px] relative overflow-hidden text-white mb-20 shadow-2xl">
                {/* Visual Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_85%_at_108%_-5%,rgba(163,230,53,0.12)_0%,transparent_55%)] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_55%_at_-8%_105%,rgba(163,230,53,0.08)_0%,transparent_55%)] pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-20 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                        <div>
                            <Link href="/member/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-[#a3e635] text-[10px] font-black uppercase tracking-widest transition-colors mb-8">
                                <ArrowLeft size={14} /> Back to Briefing
                            </Link>
                            
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#a3e635]/60 mb-6">
                                <div className="w-6 h-[1.5px] bg-[#a3e635]/40 rounded-full"></div>
                                Financial Archives
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4">Official Statements</h1>
                            <p className="text-white/40 font-bold tracking-widest text-[11px] uppercase max-w-lg leading-relaxed">
                                Audited ledger reports for tax, legal, and financial planning. All reports are verified by the USMS Golden Ledger system.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <button 
                                onClick={() => handleDownload('pdf')}
                                disabled={downloading}
                                className="group flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#a3e635] text-[#0b2419] rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#bceb3b] shadow-xl shadow-[#a3e635]/20 hover:-translate-y-1 transition-all active:scale-95"
                            >
                                <FileText size={18} />
                                <span>Export PDF</span>
                            </button>
                            <button 
                                onClick={() => handleDownload('excel')}
                                disabled={downloading}
                                className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-white/5 border border-white/10 text-white rounded-[24px] font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 group"
                            >
                                <FileSpreadsheet size={18} className="text-[#a3e635]/60 group-hover:text-[#a3e635]" />
                                <span>Excel (XLSX)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* MAIN INTERFACE */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                
                {/* FLASH MESSAGES */}
                <AnimatePresence>
                    {flash && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={cn(
                                "flex items-center justify-between p-6 rounded-[28px] border mb-12 shadow-inner",
                                flash.type === 'ok' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                {flash.type === 'ok' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                <p className="text-sm font-bold tracking-tight">{flash.msg}</p>
                            </div>
                            <button onClick={() => setFlash(null)} className="opacity-40 hover:opacity-100 p-2">
                                <X size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT: FILTERS & TOOLS */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* Export Protocol Configuration */}
                        <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[36px] p-8 lg:p-10 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
                                <Zap size={140} />
                            </div>
                            
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-[#a3e635]/15 text-[#0b2419] rounded-2xl flex items-center justify-center border border-[#a3e635]/30">
                                    <Filter size={20} />
                                </div>
                                <h3 className="text-xs font-black text-[#0b2419] uppercase tracking-widest">Protocol Filters</h3>
                            </div>

                            <div className="space-y-8">
                                {/* Report Scope */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Report Narrative Scope</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'all', label: 'Consolidated' },
                                            { id: 'savings', label: 'Savings Pool' },
                                            { id: 'loans', label: 'Loan Ledger' },
                                            { id: 'wallet', label: 'Digital Wallet' }
                                        ].map(t => (
                                            <button 
                                                key={t.id}
                                                onClick={() => setFilterType(t.id)}
                                                className={cn(
                                                    "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center",
                                                    filterType === t.id 
                                                        ? "bg-[#0b2419] text-[#a3e635] shadow-lg shadow-[#0b2419]/20" 
                                                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                                )}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Temporal Selection */}
                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Temporal Range Specification</label>
                                    <div className="space-y-2">
                                        {[
                                            { id: '30days', label: 'Recent 30 Continuous Days' },
                                            { id: '90days', label: 'Recent 90 Continuous Days' },
                                            { id: 'year', label: 'Current Fiscal Period' },
                                            { id: 'custom', label: 'Custom Range Specification' }
                                        ].map(r => (
                                            <button 
                                                key={r.id}
                                                onClick={() => handleDateRangeChange(r.id)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-5 py-4 rounded-2xl text-xs font-bold transition-all group",
                                                    dateRange === r.id 
                                                        ? "bg-[#0b2419] text-white" 
                                                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                                )}
                                            >
                                                <span>{r.label}</span>
                                                {dateRange === r.id && <CheckCircle2 size={16} className="text-[#a3e635]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {showCustomDates && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400/60 uppercase px-1">START_DATE</label>
                                                <input 
                                                    type="date" 
                                                    value={startDate} 
                                                    onChange={e => setStartDate(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-black text-[#0b2419] outline-none focus:border-[#a3e635]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400/60 uppercase px-1">END_DATE</label>
                                                <input 
                                                    type="date" 
                                                    value={endDate} 
                                                    onChange={e => setEndDate(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-black text-[#0b2419] outline-none focus:border-[#a3e635]"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Auditing Integrity Card */}
                        <motion.div variants={floatUp} className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 flex flex-col items-center text-center">
                            <ShieldCheck size={40} className="text-[#1d6044] mb-4 opacity-40" />
                            <h4 className="text-[10px] font-black uppercase text-[#0b2419] tracking-[0.2em] mb-2">Immutable Validation</h4>
                            <p className="text-[11px] font-bold text-slate-400 leading-relaxed max-w-[200px]">
                                Each transaction is cryptographically linked to the ledger pool for absolute transparency.
                            </p>
                        </motion.div>
                    </div>

                    {/* RIGHT: TRANSACTION PREVIEW */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                            <div className="p-8 lg:p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-md-center gap-6 bg-slate-50/[0.3]">
                                <div>
                                    <h3 className="font-extrabold text-[#0b2419] text-xl tracking-tight">Ledger Introspection</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse"></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing last {data?.transactions.length || 0} manifest entries</p>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#a3e635] transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="SEARCH REF_NO / NOTES..." 
                                        className="h-14 bg-white border border-slate-200 rounded-2xl pl-14 pr-6 text-[10px] font-black tracking-widest text-[#0b2419] focus:ring-4 focus:ring-[#a3e635]/10 focus:border-[#a3e635]/50 transition-all outline-none md:w-[240px]"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto flex-1">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-[#0b2419]/10 border-t-[#a3e635] rounded-full animate-spin"></div>
                                        <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Decrypting Entries...</div>
                                    </div>
                                ) : data && data.transactions.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/30">
                                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date</th>
                                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Details & Narrative</th>
                                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Magnitude</th>
                                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.transactions.map((txn, idx) => {
                                                const isIn = ['deposit', 'repayment', 'contribution', 'savings_deposit'].some(k => txn.transaction_type.toLowerCase().includes(k));
                                                return (
                                                    <tr key={txn.transaction_id || idx} className="group hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-10 py-6">
                                                            <div className="text-[12px] font-black text-[#0b2419] tracking-tight mb-1">
                                                                {new Date(txn.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                                                {new Date(txn.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                                                    isIn ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                                                                )}>
                                                                    {isIn ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-[11px] font-black text-[#0b2419] uppercase tracking-tight truncate max-w-[200px]">
                                                                        {txn.notes || txn.transaction_type.replace(/_/g, ' ')}
                                                                    </div>
                                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{txn.reference_no}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6 text-right">
                                                            <div className={cn(
                                                                "text-sm font-black tracking-tighter",
                                                                isIn ? "text-emerald-600" : "text-red-500"
                                                            )}>
                                                                {isIn ? '+' : '-'} {txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6 text-right">
                                                            <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-[#0b2419] group-hover:text-[#a3e635] transition-all cursor-pointer shadow-sm">
                                                                <ChevronRight size={14} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="py-32 flex flex-col items-center justify-center text-center px-10">
                                        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[32px] flex items-center justify-center mb-8">
                                            <FileText size={48} />
                                        </div>
                                        <h4 className="text-xl font-black text-[#0b2419] tracking-tight mb-3">No Manifest Entries Detected</h4>
                                        <p className="text-sm text-slate-400 font-bold leading-relaxed max-w-sm mb-10">
                                            The USMS Golden Ledger identified zero transaction records for the current protocol parameters.
                                        </p>
                                        <button 
                                            onClick={() => setFilterType('all')}
                                            className="px-8 py-3 bg-[#0b2419] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#0b2419]/20"
                                        >
                                            Reset Broad Spectrum Search
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-8 border-t border-slate-50 bg-slate-50/[0.2] flex justify-between items-center">
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic flex items-center gap-2">
                                    <Info size={14} /> Formal statement downloads contain extended audit trails.
                                </p>
                                <div className="flex gap-2">
                                    <button className="w-10 h-10 border border-slate-100 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0b2419] transition-all">
                                        <ChevronRight size={16} className="rotate-180" />
                                    </button>
                                    <button className="w-10 h-10 border border-slate-100 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0b2419] transition-all">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
