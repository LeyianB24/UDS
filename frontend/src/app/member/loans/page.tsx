"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, 
    Plus, 
    ArrowRight, 
    Info, 
    PieChart, 
    ShieldCheck, 
    Clock, 
    Download, 
    ChevronRight,
    Search,
    X,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    Smartphone,
    CreditCard
} from 'lucide-react';
import { MemberApi, LoanData } from '@/lib/api/member';
import { cn } from '@/lib/utils';

import ApplyView from './ApplyView';
import RepayView from './RepayView';

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

export default function LoansPage() {
    const [data, setData] = useState<LoanData | null>(null);
    const [loading, setLoading] = useState(true);

    const [currentView, setCurrentView] = useState<'list' | 'apply' | 'repay'>('list');
    const [repayLoanId, setRepayLoanId] = useState<string | null>(null);

    // Modal state for quick apply (matching original functionality)
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [modalAmount, setModalAmount] = useState<number>(0);
    const [modalMonths, setModalMonths] = useState<number>(12);
    const [loanType, setLoanType] = useState('emergency');

    // Modal state for wallet repayment
    const [showRepayModal, setShowRepayModal] = useState(false);
    const [repayAmount, setRepayAmount] = useState<number>(0);

    useEffect(() => {
        MemberApi.getLoans()
            .then(res => {
                setData(res);
                if (res.active_loan) {
                    setRepayAmount(res.active_loan.current_balance);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-[#0b2419]/10 border-t-[#a3e635] rounded-full animate-spin"></div>
            </div>
        );
    }

    const { active_loan, pending_loan, limit, wallet_balance, total_savings, history } = data;
    const is_overdue = active_loan ? (new Date(active_loan.next_repayment_date).getTime() < Date.now()) : false;

    // Apply calculator logic
    const calcRate = 0.12;
    let modalPercent = (modalAmount / limit) * 100;
    if (modalPercent > 100) modalPercent = 100;
    const isExceeding = modalAmount > limit;
    const modalInterest = modalAmount * calcRate * (modalMonths / 12);
    const modalTotal = modalAmount + modalInterest;

    if (currentView === 'apply') {
        return <ApplyView onBack={() => setCurrentView('list')} initialType={loanType} initialAmount={modalAmount} initialMonths={modalMonths} />;
    }

    if (currentView === 'repay') {
        return <RepayView loanId={repayLoanId} onBack={() => setCurrentView('list')} />;
    }

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="p-6 lg:p-10 max-w-7xl mx-auto"
        >
            {/* Header */}
            <motion.div variants={floatUp} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0b2419] tracking-tight mb-2">Loan Portfolio</h1>
                    <p className="text-slate-500 font-medium">Manage your debts and leverage your borrowing power.</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {wallet_balance > 0 && (
                        <Link 
                            href="/member/withdraw?type=loans&source=loans" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b2419] text-white rounded-2xl font-bold hover:bg-[#154330] transition-all shadow-lg hover:shadow-[#0b2419]/20"
                        >
                            <Wallet size={18} />
                            <span>Withdraw Funds</span>
                        </Link>
                    )}
                    
                    {active_loan || pending_loan ? (
                        <button 
                            disabled
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-400 border border-slate-200 rounded-2xl font-bold cursor-not-allowed"
                        >
                            <Plus size={18} />
                            <span>Limit Reached</span>
                        </button>
                    ) : (
                        <button 
                            onClick={() => setShowApplyModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#a3e635] text-[#0b2419] rounded-2xl font-bold hover:bg-[#bceb3b] transition-all shadow-lg shadow-[#a3e635]/30 hover:scale-[1.02]"
                        >
                            <Plus size={18} />
                            <span>Apply for Loan</span>
                        </button>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    {/* Status Alerts */}
                    <AnimatePresence>
                        {pending_loan && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-amber-50 border border-amber-100 rounded-[24px] p-6 flex gap-4 items-start"
                            >
                                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-900 mb-1">Application In Review</h4>
                                    <p className="text-sm text-amber-700/80 leading-relaxed">
                                        Your request for <span className="font-extrabold text-amber-900">KES {pending_loan.amount.toLocaleString()}</span> is currently <span className="capitalize font-bold">{pending_loan.status}</span>. We'll notify you once processed.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {active_loan && is_overdue && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 border border-red-100 rounded-[24px] p-6 flex gap-4 items-start"
                            >
                                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-900 mb-1">Overdue Repayment Detected</h4>
                                    <p className="text-sm text-red-700/80 leading-relaxed">
                                        Payment was due on <span className="font-bold">{new Date(active_loan.next_repayment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>. Please settle to avoid penalties.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Hero: Active Loan or Eligibility */}
                    <motion.div variants={floatUp}>
                        {active_loan ? (
                            <div className="bg-[#0b2419] rounded-[40px] p-8 lg:p-12 relative overflow-hidden text-white shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#a3e635] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-[0.03] rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                                
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 relative z-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-[#a3e635] mb-4">
                                            Active Loan #{active_loan.loan_id}
                                        </div>
                                        <div className="text-5xl lg:text-6xl font-black tracking-tighter mb-1">
                                            <span className="text-xl mr-2 text-[#a3e635]/60">KES</span>
                                            {active_loan.current_balance.toLocaleString()}
                                        </div>
                                        <div className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Outstanding Balance</div>
                                    </div>
                                    <div className="hidden sm:grid grid-cols-2 gap-6 text-right">
                                        <div>
                                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1">Monthly Installment</div>
                                            <div className="text-lg font-bold">KES {Math.round(active_loan.total_payable / 12).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1">Interest Rate</div>
                                            <div className="text-lg font-bold text-[#a3e635]">{active_loan.interest_rate}% p.a</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end relative z-10">
                                    <div className="lg:col-span-7">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Repayment Progress</span>
                                            <span className="text-sm font-black text-[#a3e635]">{Math.round(active_loan.progress_percent)}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${active_loan.progress_percent}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-[#a3e635] shadow-[0_0_10px_rgba(163,230,53,0.5)]"
                                            />
                                        </div>
                                        <div className="mt-4 flex flex-col gap-1.5">
                                            <div className="text-[10px] font-bold text-white/20 uppercase tracking-wider">
                                                Guarantors: <span className="text-white/60">{active_loan.guarantors && active_loan.guarantors.length > 0 ? active_loan.guarantors.join(' & ') : 'None Linked'}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-white/20 uppercase tracking-wider">
                                                Total Paid: <span className="text-[#a3e635]/80">KES {(active_loan.total_payable - active_loan.current_balance).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3">
                                        <button 
                                            onClick={() => {
                                                setRepayLoanId(active_loan.loan_id.toString());
                                                setCurrentView('repay');
                                            }}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#a3e635] text-[#0b2419] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#bceb3b] transition-all hover:-translate-y-1 shadow-xl shadow-[#a3e635]/20"
                                        >
                                            <Smartphone size={16} />
                                            <span>M-Pesa PAY</span>
                                        </button>
                                        <button 
                                            onClick={() => setShowRepayModal(true)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            <Wallet size={16} className="text-[#a3e635]" />
                                            <span>From Wallet</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-100 rounded-[40px] p-10 lg:p-16 text-center shadow-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-[#a3e635]/[0.02] pointer-events-none"></div>
                                <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
                                    {total_savings > 0 ? (
                                        <>
                                            <div className="w-20 h-20 bg-[#a3e635] text-[#0b2419] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-[#a3e635]/20">
                                                <ShieldCheck size={40} />
                                            </div>
                                            <h2 className="text-3xl font-black text-[#0b2419] tracking-tight mb-4">Elite Eligibility Unlocked</h2>
                                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                                You currently have no active debts. Based on your savings pattern, you qualify for an instant disbursement up to your triple-multiplier limit.
                                            </p>
                                            <div className="px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8 w-full">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Instant Access Limit</div>
                                                <div className="text-4xl font-black text-[#0b2419]">KES {limit.toLocaleString()}</div>
                                            </div>
                                            <button 
                                                onClick={() => setShowApplyModal(true)}
                                                className="group inline-flex items-center gap-3 px-10 py-5 bg-[#0b2419] text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-[#154330] transition-all hover:scale-105 shadow-2xl"
                                            >
                                                <span>Initialize Application</span>
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mb-6">
                                                <TrendingUp size={40} />
                                            </div>
                                            <h2 className="text-3xl font-black text-[#0b2419] tracking-tight mb-4">Foundation Growth Required</h2>
                                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                                To unlock borrowing capabilities, you need an active savings pool. Start saving today and multiply your capital access by up to 3x.
                                            </p>
                                            <Link 
                                                href="/member/savings"
                                                className="inline-flex items-center gap-3 px-10 py-5 bg-[#0b2419] text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-[#154330] transition-all hover:scale-105 shadow-2xl"
                                            >
                                                <span>Open Savings Account</span>
                                                <ArrowUpRight size={18} />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Transaction History Section */}
                    <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-[#0b2419]">Loan History</h3>
                            <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0b2419] hover:text-[#1d6044] transition-colors">
                                <Download size={14} />
                                <span>Export (PDF/CSV)</span>
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/30">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Type</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Outcome</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Reference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">No loan history records identified.</td>
                                        </tr>
                                    ) : history.map((h, i) => (
                                        <tr key={i} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0 cursor-pointer">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-[#0b2419] block mb-1">
                                                    {new Date(h.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{h.loan_type.replace(/_/g, ' ')}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-black text-[#0b2419] text-base">KES {h.amount.toLocaleString()}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                    h.status === 'completed' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    (h.status === 'disbursed' || h.status === 'active') ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                    h.status === 'approved' ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                                                    h.status === 'rejected' ? "bg-red-50 text-red-600 border border-red-100" : 
                                                    "bg-amber-50 text-amber-600 border border-amber-100"
                                                )}>
                                                    <div className={cn(
                                                        "w-1 h-1 rounded-full mr-1.5",
                                                        h.status === 'completed' ? "bg-emerald-600" :
                                                        (h.status === 'disbursed' || h.status === 'active') ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" :
                                                        h.status === 'approved' ? "bg-indigo-600" :
                                                        h.status === 'rejected' ? "bg-red-600" : "bg-amber-600"
                                                    )} />
                                                    {h.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 inline-flex items-center justify-center group-hover:bg-[#0b2419] group-hover:text-[#a3e635] transition-all">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Stats Area */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Disbursed Wallet Card */}
                    <motion.div variants={floatUp} className="bg-white border-2 border-[#a3e635] rounded-[32px] p-8 shadow-xl shadow-[#a3e635]/5 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#a3e635]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-[#a3e635]/20 text-[#0b2419] rounded-2xl flex items-center justify-center shadow-inner">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Disbursed Wallet</span>
                                <h3 className="text-2xl font-black text-[#0b2419]">KES {wallet_balance.toLocaleString()}</h3>
                            </div>
                        </div>
                        <Link 
                            href="/member/withdraw?type=loans&source=loans"
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#0b2419] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#154330] transition-all shadow-lg overflow-hidden group/btn"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <ArrowUpRight size={16} className="text-[#a3e635]" />
                                <span>Move to M-Pesa</span>
                            </span>
                            <div className="absolute inset-0 bg-[#1d6044] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                        </Link>
                    </motion.div>

                    {/* Limit Insight Card */}
                    <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-slate-50 text-[#0b2419] rounded-2xl flex items-center justify-center border border-slate-100">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Borrowing Capacity</span>
                                <h3 className="text-xl font-black text-[#0b2419]">KES {limit.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center text-xs font-bold border-b border-slate-50 pb-3">
                                <span className="text-slate-400 uppercase tracking-wider">Total Savings Pool</span>
                                <span className="text-[#0b2419]">KES {total_savings.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold border-b border-slate-50 pb-3">
                                <span className="text-slate-400 uppercase tracking-wider">Multiplier Factor</span>
                                <span className="text-[#a3e635] font-black">3.0x Fixed</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-slate-400 uppercase tracking-wider">Utilization Rate</span>
                                <span className="text-[#0b2419]">{active_loan ? Math.round((active_loan.amount / limit) * 100) : 0}%</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Rules / Info Card */}
                    <motion.div variants={floatUp} className="bg-[#0b2419] rounded-[32px] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 pointer-events-none">
                            <Info size={120} />
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-widest text-[#a3e635] mb-6 flex items-center gap-2">
                            <ShieldCheck size={14} />
                            Sacco Guard Rules
                        </h4>
                        <ul className="space-y-4">
                            {[
                                `Standard interest is fixed at ${active_loan ? active_loan.interest_rate : 12}% per annum.`,
                                "Defaulting impacts your guarantors' borrowing capacity.",
                                "Repayment via M-Pesa is reconciled in &lt; 60 seconds.",
                                "A processing fee of 1% applies to emergency disbursements."
                            ].map((rule, idx) => (
                                <li key={idx} className="flex gap-3 items-start text-[11px] font-bold text-white/50 leading-relaxed group">
                                    <div className="w-1.5 h-1.5 bg-[#a3e635] rounded-full mt-1.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* QUICK APPLY MODAL OVERLAY */}
            <AnimatePresence>
                {showApplyModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowApplyModal(false)}
                            className="absolute inset-0 bg-[#0b2419]/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-xl p-8 lg:p-12 shadow-[0_32px_128px_rgba(11,36,25,0.4)] relative z-10 overflow-hidden"
                        >
                            <button 
                                onClick={() => setShowApplyModal(false)}
                                className="absolute top-8 right-8 w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <h2 className="text-3xl font-black text-[#0b2419] tracking-tight mb-2">Loan Calculator</h2>
                            <p className="text-slate-500 font-medium mb-10">Select your preferences to see instant estimates.</p>
                            
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Principal Amount (KES)</label>
                                        <div className={cn("text-2xl font-black", isExceeding ? 'text-red-500' : 'text-[#0b2419]')}>
                                            {modalAmount.toLocaleString()}
                                        </div>
                                    </div>
                                    <input 
                                        type="range" min="1000" max={limit * 1.2} step="1000"
                                        value={modalAmount} onChange={e => setModalAmount(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#a3e635]"
                                    />
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-wider">
                                        <span>MIN: KES 1,000</span>
                                        <span className={isExceeding ? 'text-red-500 font-black' : ''}>LIMIT: KES {limit.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Product</label>
                                        <select 
                                            value={loanType} onChange={e => setLoanType(e.target.value)}
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-black text-[#0b2419] transition-all outline-none"
                                        >
                                            <option value="emergency">Emergency</option>
                                            <option value="development">Development</option>
                                            <option value="education">Education</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Duration</label>
                                        <select 
                                            value={modalMonths} onChange={e => setModalMonths(Number(e.target.value))}
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-black text-[#0b2419] transition-all outline-none"
                                        >
                                            <option value="3">3 Months</option>
                                            <option value="6">6 Months</option>
                                            <option value="12">12 Months</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-6 bg-[#0b2419] rounded-[24px] text-white">
                                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Est. Interest ({calcRate*100}%)</span>
                                        <span className="font-black text-base text-[#a3e635]">+ KES {Math.ceil(modalInterest).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Repayable</span>
                                        <span className="text-3xl font-black tracking-tighter">KES {Math.ceil(modalTotal).toLocaleString()}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        setShowApplyModal(false);
                                        setCurrentView('apply');
                                    }}
                                    disabled={isExceeding || modalAmount <= 0}
                                    className={cn(
                                        "w-full h-16 rounded-[22px] font-black text-sm uppercase tracking-widest flex items-center justify-center transition-all shadow-xl",
                                        isExceeding || modalAmount <= 0 
                                            ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none" 
                                            : "bg-[#a3e635] text-[#0b2419] hover:bg-[#bceb3b] hover:scale-[1.02] active:scale-[0.98] shadow-[#a3e635]/20"
                                    )}
                                >
                                    Proceed to Application
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* REPAY FROM WALLET MODAL */}
                {showRepayModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRepayModal(false)}
                            className="absolute inset-0 bg-[#0b2419]/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-lg p-8 lg:p-12 shadow-[0_32px_128px_rgba(11,36,25,0.4)] relative z-10"
                        >
                            <button 
                                onClick={() => setShowRepayModal(false)}
                                className="absolute top-8 right-8 w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <h2 className="text-3xl font-black text-[#0b2419] tracking-tight mb-2">Wallet Settlement</h2>
                            <p className="text-slate-500 font-medium mb-10">Clear your balance using disbursed funds.</p>
                            
                            <div className="space-y-8">
                                <div className="p-8 bg-slate-50 rounded-[28px] border border-slate-100 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Available in Wallet</span>
                                    <h3 className="text-4xl font-black text-[#0b2419]">KES {wallet_balance.toLocaleString()}</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Repayment Amount</label>
                                        <button 
                                            onClick={() => active_loan && setRepayAmount(active_loan.current_balance)}
                                            className="text-[10px] font-black text-[#0b2419] hover:text-[#1d6044] transition-colors bg-[#a3e635]/20 px-3 py-1 rounded-full uppercase tracking-widest"
                                        >
                                            Full Settle
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-xl text-slate-300">KES</span>
                                        <input 
                                            type="number" 
                                            className="w-full h-20 bg-slate-50/50 border border-slate-100 rounded-3xl pl-20 pr-6 text-3xl font-black text-[#0b2419] focus:bg-white focus:ring-8 focus:ring-[#a3e635]/10 focus:border-[#a3e635]/30 transition-all outline-none tracking-tighter"
                                            value={repayAmount}
                                            onChange={e => setRepayAmount(Number(e.target.value))}
                                            max={wallet_balance}
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-300 italic px-2">
                                        Outstanding balance is KES {active_loan?.current_balance.toLocaleString()}.
                                    </p>
                                </div>

                                <button 
                                    disabled={repayAmount <= 0 || repayAmount > wallet_balance}
                                    className={cn(
                                        "w-full h-20 rounded-[28px] font-black text-lg uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl",
                                        repayAmount <= 0 || repayAmount > wallet_balance
                                            ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                                            : "bg-[#0b2419] text-[#a3e635] shadow-[#0b2419]/20 hover:scale-[1.02] active:scale-[0.95]"
                                    )}
                                >
                                    <Smartphone size={24} />
                                    <span>Execute Settlement</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
