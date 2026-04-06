"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { 
    ArrowLeft, 
    PlusCircle, 
    ArrowUpRight, 
    TrendingUp, 
    ArrowDownLeft, 
    ShieldCheck, 
    Inbox,
    Download,
    ArrowRight,
    Circle,
    Activity
} from 'lucide-react';
import { MemberApi, SavingsData } from '@/lib/api/member';
import { cn } from '@/lib/utils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// floatUp animation variant
const floatUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function SavingsPage() {
    const [data, setData] = useState<SavingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        MemberApi.getSavings()
            .then(res => setData(res))
            .finally(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-[#0b2419]/10 border-t-[#a3e635] rounded-full animate-spin"></div>
            </div>
        );
    }

    const chartData = {
        labels: data.trend.map(t => t.month),
        datasets: [
            {
                fill: true,
                data: data.trend.map(t => t.amount),
                borderColor: '#a3e635',
                backgroundColor: 'rgba(163, 230, 53, 0.05)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#0b2419',
                pointBorderColor: '#a3e635',
                pointBorderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0b2419',
                titleColor: 'rgba(255,255,255,0.5)',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 12,
                displayColors: false,
                titleFont: { size: 10, weight: 'bold' as const },
                bodyFont: { size: 12, weight: 'black' as const }
            }
        },
        scales: {
            x: { 
                display: true, 
                grid: { display: false }, 
                ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 9, weight: '800' as const } } 
            },
            y: { display: false }
        },
    };

    const filteredHistory = data.history.filter(txn => {
        if (filter === 'All') return true;
        if (filter === 'Deposits') return ['deposit', 'contribution', 'savings_deposit'].includes(txn.transaction_type);
        if (filter === 'Withdrawals') return ['withdrawal', 'withdrawal_initiate', 'withdrawal_finalize'].includes(txn.transaction_type);
        return true;
    });

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="pb-20"
        >
            {/* HERO SECTION */}
            <motion.div 
                variants={floatUp}
                className="bg-[#0b2419] rounded-b-[48px] relative overflow-hidden text-white"
            >
                {/* Visual Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_85%_at_108%_-5%,rgba(163,230,53,0.11)_0%,transparent_55%)] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_55%_at_-8%_105%,rgba(163,230,53,0.07)_0%,transparent_55%)] pointer-events-none"></div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[size:20px_20px] bg-[radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)]"></div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-20 relative z-10">
                    <div className="flex items-center justify-between mb-16">
                        <Link href="/member/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-[#a3e635] text-[10px] font-black uppercase tracking-widest transition-colors">
                            <ArrowLeft size={14} /> 
                            <span>Back to Briefing</span>
                        </Link>
                        <span className="text-[9px] font-black tracking-[0.3em] uppercase text-white/10">Umoja Digital Sacco</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                        <div className="flex flex-col items-start px-1">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#a3e635]/60 mb-6">
                                <div className="w-6 h-[1.5px] bg-[#a3e635]/40 rounded-full"></div>
                                Savings Portfolio
                            </div>
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-1">Net Withdrawable Balance</div>
                            <div className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                <span className="text-xl lg:text-3xl font-black opacity-30 mr-3 align-top leading-[2.5em]">KES</span>
                                {data.net_savings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#a3e635]/10 border border-[#a3e635]/20 rounded-full text-[11px] font-black text-[#a3e635] mb-8">
                                <div className="w-1.5 h-1.5 bg-[#a3e635] rounded-full animate-pulse"></div>
                                Interest-bearing · 2.4% APR
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                                <Link href="/member/contribute?type=savings" className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#a3e635] text-[#0b2419] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#bceb3b] shadow-xl shadow-[#a3e635]/20 hover:-translate-y-1 transition-all">
                                    <PlusCircle size={18} />
                                    Add Funds
                                </Link>
                                <Link href="/member/withdraw?type=savings" className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                                    <ArrowUpRight size={18} className="text-[#a3e635]" />
                                    Withdraw
                                </Link>
                            </div>
                        </div>

                        <div className="hidden md:flex flex-col gap-6">
                            <div className="h-[140px] relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 px-1">6-Month Deposit Velocity</div>
                                    <Activity size={14} className="text-[#a3e635]/30" />
                                </div>
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* FLOATING STATS GRID */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-12 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {/* Stat Card: Total Deposited */}
                    <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-2xl shadow-[#0b2419]/5 group hover:-translate-y-1 transition-all">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-emerald-100">
                            <TrendingUp size={24} />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Total Contributions</div>
                        <div className="text-2xl lg:text-3xl font-black text-[#0b2419] tracking-tight mb-4">
                            <span className="text-xs mr-1 opacity-20">KES</span>
                            {data.total_deposited.toLocaleString()}
                        </div>
                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-emerald-500 w-full rounded-full" />
                        </div>
                        <div className="text-[11px] font-bold text-slate-400">Cumulative historical deposits</div>
                    </motion.div>

                    {/* Stat Card: Total Withdrawn */}
                    <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-2xl shadow-[#0b2419]/5 group hover:-translate-y-1 transition-all">
                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-red-100">
                            <ArrowDownLeft size={24} />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Capital Withdrawn</div>
                        <div className="text-2xl lg:text-3xl font-black text-[#0b2419] tracking-tight mb-4">
                            <span className="text-xs mr-1 opacity-20">KES</span>
                            {data.total_withdrawn.toLocaleString()}
                        </div>
                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden mb-4">
                            <div 
                                className="h-full bg-red-500 rounded-full" 
                                style={{ width: `${Math.min((data.total_withdrawn / data.total_deposited) * 100, 100)}%` }}
                            />
                        </div>
                        <div className="text-[11px] font-bold text-slate-400">
                            <span className="text-red-500">{Math.round((data.total_withdrawn / (data.total_deposited || 1)) * 100)}%</span> of total pool extracted
                        </div>
                    </motion.div>

                    {/* Stat Card: Retention Rate */}
                    <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-2xl shadow-[#0b2419]/5 group hover:-translate-y-1 transition-all ring-2 ring-[#a3e635]/20">
                        <div className="w-14 h-14 bg-[#a3e635]/15 text-[#0b2419] rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-[#a3e635]/20">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Retention Integrity</div>
                        <div className="text-2xl lg:text-3xl font-black text-[#0b2419] tracking-tight mb-4">
                            {data.retention_rate.toFixed(1)}%
                        </div>
                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden mb-4">
                            <div 
                                className="h-full bg-[#a3e635] rounded-full" 
                                style={{ width: `${data.retention_rate}%` }}
                            />
                        </div>
                        <div className="text-[11px] font-bold text-slate-400">Net savings vs. total contributed</div>
                    </motion.div>
                </div>
            </div>

            {/* MAIN CONTENT Area */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 lg:mt-20">
                <motion.div variants={floatUp} className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Statement Archive</div>
                        <div className="h-[1.5px] w-12 bg-slate-100 hidden md:block"></div>
                    </div>
                    
                    <div className="flex gap-2 p-1 bg-slate-100/80 backdrop-blur rounded-2xl">
                        {['All', 'Deposits', 'Withdrawals'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setFilter(t)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filter === t 
                                        ? "bg-[#0b2419] text-white shadow-lg" 
                                        : "text-slate-400 hover:text-[#0b2419]"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
                    <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-md-center gap-4 bg-slate-50/30">
                        <div>
                            <h3 className="font-extrabold text-[#0b2419] text-lg tracking-tight">Recent Financial Activity</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Found {filteredHistory.length} transaction entries</p>
                        </div>
                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#0b2419] hover:border-[#0b2419] transition-all">
                            <Download size={14} className="text-[#a3e635]" />
                            Request Full Statement
                        </button>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {filteredHistory.map((txn, idx) => {
                            const isIn = ['deposit', 'contribution', 'savings_deposit'].includes(txn.transaction_type);
                            return (
                                <div key={txn.id || idx} className="px-10 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                            isIn ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                                        )}>
                                            {isIn ? <PlusCircle size={22} /> : <ArrowDownLeft size={22} />}
                                        </div>
                                        <div>
                                            <div className="text-[12px] font-black text-[#0b2419] uppercase tracking-tight mb-0.5">
                                                {txn.transaction_type.replace(/_/g, ' ')}
                                            </div>
                                            <div className="text-[11px] font-bold text-slate-400 capitalize">{txn.notes || 'Automated regular contribution'}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-12 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="text-right">
                                            <div className={cn(
                                                "text-xl font-black tracking-tight mb-0.5",
                                                isIn ? "text-emerald-600" : "text-red-500"
                                            )}>
                                                {isIn ? '+' : '-'} {txn.amount.toLocaleString()} 
                                                <span className="text-[10px] ml-1.5 font-bold text-slate-300">KES</span>
                                            </div>
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                {new Date(txn.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-[#0b2419] group-hover:text-[#a3e635] transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredHistory.length === 0 && (
                            <div className="px-10 py-32 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
                                    <Inbox size={40} />
                                </div>
                                <h4 className="text-lg font-bold text-[#0b2419] mb-2 tracking-tight">Empty Statement Pool</h4>
                                <p className="text-sm text-slate-400 font-medium max-w-[280px]">We couldn't find any transactions matching your selected filters.</p>
                                <button onClick={() => setFilter('All')} className="mt-8 text-[11px] font-black text-[#0b2419] uppercase tracking-widest hover:underline">Clear all filters</button>
                            </div>
                        )}
                    </div>
                </motion.div>
                
                {/* FOOTER CALL TO ACTION */}
                <motion.div variants={floatUp} className="mt-12 bg-[#f8fafc] border border-slate-200 rounded-[32px] p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex gap-6 items-center">
                        <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-[#0b2419] shadow-sm">
                            <PieChart size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-[#0b2419] tracking-tight">Financial Projections</h4>
                            <p className="text-xs font-bold text-slate-400">See how your interest compounds over the next 12 months.</p>
                        </div>
                    </div>
                    <Link href="/member/savings/forecast" className="group inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-[#0b2419] text-[#0b2419] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#0b2419] hover:text-[#a3e635] transition-all">
                        Analyze Lifecycle
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}
