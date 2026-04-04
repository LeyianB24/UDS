"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MemberApi, LoanData } from '@/lib/api/member';
import { motion } from 'framer-motion';

export default function LoansPage() {
    const [data, setData] = useState<LoanData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        MemberApi.getLoans()
            .then(res => setData(res))
            .finally(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const { active_loan, pending_loan, limit, wallet_balance, total_savings, history } = data;

    // Check if overdue
    const is_overdue = active_loan ? (new Date(active_loan.next_repayment_date).getTime() < Date.now()) : false;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="pb-10"
        >
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4 px-4 lg:px-6">
                <div>
                    <h2 className="font-bold text-3xl mb-1 text-[#111827] dark:text-white">Loan Portfolio</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-0">Manage your finances and track repayment progress.</p>
                </div>
                
                <div className="flex gap-2">
                    {active_loan || pending_loan ? (
                        <>
                            {wallet_balance > 0 && (
                                <Link href="/member/withdraw?type=loans&source=loans" className="bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-bold px-6 py-3 rounded-2xl shadow-sm hover:scale-105 transition-transform flex items-center">
                                    <i className="bi bi-wallet2 mr-2"></i> Withdraw Funds
                                </Link>
                            )}
                            <button className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 font-bold px-6 py-3 rounded-2xl flex items-center opacity-80 cursor-not-allowed">
                                <i className="bi bi-lock-fill mr-2"></i> Limit Reached
                            </button>
                        </>
                    ) : (
                        <>
                            {wallet_balance > 0 && (
                                <Link href="/member/withdraw?type=loans&source=loans" className="bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-bold px-6 py-3 rounded-2xl shadow-sm hover:scale-105 transition-transform flex items-center">
                                    <i className="bi bi-wallet2 mr-2"></i> Withdraw Funds
                                </Link>
                            )}
                            <Link href="/member/apply-loan" className="bg-[#d0f35d] text-[#0F2E25] font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-[#bce04b] hover:-translate-y-1 transition-all flex items-center">
                                <i className="bi bi-plus-lg mr-2"></i> Apply for Loan
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-4 lg:px-6">
                
                {/* LEFT COLUMN */}
                <div className="xl:col-span-8 flex flex-col gap-6">
                    
                    {/* ALERTS */}
                    {pending_loan && (
                        <div className="bg-[#fffbeb] dark:bg-yellow-900/20 border border-[#fcd34d] dark:border-yellow-700/30 rounded-3xl flex items-center p-6 shadow-sm">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#fef3c7] dark:bg-yellow-900/50 text-[#92400e] dark:text-yellow-500 mr-5 text-xl shrink-0">
                                <i className="bi bi-hourglass-split"></i>
                            </div>
                            <div>
                                <h6 className="font-bold text-[#92400e] dark:text-yellow-500 mb-1">Application In Review</h6>
                                <span className="text-sm text-gray-700 dark:text-gray-300">Your request for <strong>KES {pending_loan.amount.toLocaleString()}</strong> is currently status: <strong className="capitalize">{pending_loan.status}</strong>.</span>
                            </div>
                        </div>
                    )}

                    {active_loan && is_overdue && (
                        <div className="bg-[#fef2f2] dark:bg-red-900/20 border border-[#fca5a5] dark:border-red-900/30 rounded-3xl flex items-center p-6 shadow-sm">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#fee2e2] dark:bg-red-900/50 text-[#991b1b] dark:text-red-400 mr-5 text-xl shrink-0">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                            </div>
                            <div>
                                <h6 className="font-bold text-[#991b1b] dark:text-red-400 mb-1">Overdue Repayment Detected</h6>
                                <p className="text-sm text-gray-700 dark:text-gray-300 m-0">Your loan repayment was due on <strong>{new Date(active_loan.next_repayment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</strong>. Please make a repayment to avoid further daily fines.</p>
                            </div>
                        </div>
                    )}

                    {/* MAIN ACTIVE LOAN CARD */}
                    {active_loan ? (
                        <div className="bg-[#0F2E25] rounded-[32px] p-8 lg:p-10 shadow-xl text-white relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, #2D6A4F 0%, #0F2E25 70%)' }}>
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <div className="inline-block bg-white/10 text-white border border-white/20 rounded-full px-4 py-2 mb-4 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                        Active Loan #{active_loan.loan_id}
                                    </div>
                                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-2 tracking-tight">KES {active_loan.current_balance.toLocaleString()}</h1>
                                    <span className="text-white/60 text-xs uppercase tracking-widest font-bold block">Outstanding Balance</span>
                                </div>
                                <div className="hidden sm:flex text-right gap-10">
                                    <div>
                                        <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold block mb-2">Installment / Mo</span>
                                        <span className="font-extrabold text-2xl">KES {Math.round(active_loan.total_payable / 12).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold block mb-2">Interest Rate</span>
                                        <span className="font-extrabold text-2xl">{active_loan.interest_rate}% <span className="text-sm opacity-50">p.a</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                                <div className="lg:col-span-7">
                                    <div className="flex justify-between text-white text-xs font-bold uppercase tracking-wider mb-3">
                                        <span>Repayment Progress</span>
                                        <span>{Math.round(active_loan.progress_percent)}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/20 overflow-hidden mb-4">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: \`\${active_loan.progress_percent}%\` }}></div>
                                    </div>
                                    <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-3">
                                        Guarantors: {active_loan.guarantors && active_loan.guarantors.length > 0 ? active_loan.guarantors.join(', ') : 'None / Admin Waived'}
                                    </div>
                                    <div className="text-white/80 text-sm font-medium mt-1">
                                        Paid: KES {(active_loan.total_payable - active_loan.current_balance).toLocaleString()} of KES {active_loan.total_payable.toLocaleString()}
                                    </div>
                                </div>
                                <div className="lg:col-span-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Link href={`/member/mpesa_request?type=loan_repayment&loan_id=${active_loan.loan_id}`} className="bg-[#D0F35D] text-[#0F2E25] flex justify-center items-center py-4 rounded-2xl font-bold hover:bg-[#bce04b] hover:scale-[1.02] transition-all shadow-md">
                                            <i className="bi bi-phone mr-2 text-xl"></i> M-Pesa
                                        </Link>
                                        <button className="bg-transparent border border-white/30 text-white flex justify-center items-center py-4 rounded-2xl font-bold hover:bg-white/10 transition-colors shadow-sm">
                                            <i className="bi bi-wallet2 mr-2 text-[#D0F35D] text-xl"></i> Wallet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : !pending_loan && (
                        <div className="bg-white dark:bg-[#0d1d14] rounded-[32px] border-2 border-dashed border-gray-200 dark:border-white/10 p-10 lg:p-14 text-center mb-6 flex flex-col items-center justify-center">
                            {total_savings > 0 ? (
                                <>
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#D0F35D]/20 text-[#0F2E25] dark:text-[#D0F35D] text-4xl mb-6">
                                        <i className="bi bi-shield-check"></i>
                                    </div>
                                    <h3 className="font-extrabold text-2xl mb-3 text-dark dark:text-white">You are Eligible!</h3>
                                    <p className="text-gray-500 mb-6 max-w-lg">You currently have no active debts. Based on your savings, you qualify for an instant loan up to the limit below.</p>
                                    <h2 className="text-green-600 dark:text-[#D0F35D] font-extrabold text-4xl">KES {limit.toLocaleString()}</h2>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-400 text-4xl mb-6">
                                        <i className="bi bi-clock-history"></i>
                                    </div>
                                    <h3 className="font-extrabold text-2xl mb-3 text-dark dark:text-white">Build Your Savings</h3>
                                    <p className="text-gray-500 mb-8 max-w-lg">To qualify for a loan, you need to have active savings. Start saving today to unlock borrowing power up to 3x your balance.</p>
                                    <Link href="/member/mpesa_request?type=savings" className="bg-[#111827] dark:bg-white text-white dark:text-[#111827] rounded-full px-10 py-4 font-bold hover:scale-105 transition-transform shadow-lg">Start Saving Now</Link>
                                </>
                            )}
                        </div>
                    )}

                    {/* RECENT HISTORY TABLE */}
                    <div className="bg-white dark:bg-[#0d1d14] border border-gray-100 dark:border-white/5 rounded-[32px] shadow-sm overflow-hidden">
                        <div className="p-6 lg:p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                            <h6 className="font-extrabold text-lg m-0 text-dark dark:text-white pb-0">Recent History</h6>
                            <button className="bg-white dark:bg-[#0d1d14] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold px-4 py-2 rounded-xl shadow-sm text-sm flex items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <i className="bi bi-download mr-2"></i> Export
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">Date</th>
                                        <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">Loan Type</th>
                                        <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">Amount</th>
                                        <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5 text-center">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-10 text-gray-500 font-medium">
                                                No loan history found.
                                            </td>
                                        </tr>
                                    ) : history.map((h, i) => {
                                        let badgeColor = '';
                                        switch (h.status) {
                                            case 'completed': badgeColor = 'bg-[#DCFCE7] text-[#166534] dark:bg-green-900/30 dark:text-green-400'; break;
                                            case 'disbursed': 
                                            case 'active': badgeColor = 'bg-[#DBEAFE] text-[#1E40AF] dark:bg-blue-900/30 dark:text-blue-400'; break;
                                            case 'pending': badgeColor = 'bg-[#FEF3C7] text-[#92400E] dark:bg-yellow-900/30 dark:text-yellow-500'; break;
                                            case 'approved': badgeColor = 'bg-[#E0E7FF] text-[#4338CA] dark:bg-indigo-900/30 dark:text-indigo-400'; break;
                                            case 'rejected': badgeColor = 'bg-[#FEE2E2] text-[#991B1B] dark:bg-red-900/30 dark:text-red-400'; break;
                                            default: badgeColor = 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white';
                                        }

                                        return (
                                            <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-5 border-b border-gray-50 dark:border-white/[0.02] font-bold text-dark dark:text-white whitespace-nowrap">
                                                    {new Date(h.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-5 border-b border-gray-50 dark:border-white/[0.02] text-gray-600 dark:text-gray-400 capitalize whitespace-nowrap">
                                                    {h.loan_type.replace(/_/g, ' ')}
                                                </td>
                                                <td className="px-6 py-5 border-b border-gray-50 dark:border-white/[0.02] font-extrabold text-dark dark:text-white whitespace-nowrap">
                                                    KES {h.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-5 border-b border-gray-50 dark:border-white/[0.02] text-center whitespace-nowrap">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeColor}`}>
                                                        {h.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 border-b border-gray-50 dark:border-white/[0.02] text-right whitespace-nowrap">
                                                    <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-[#d0f35d] hover:text-[#0F2E25] transition-colors inline-flex justify-center items-center shadow-sm">
                                                        <i className="bi bi-chevron-right"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    
                    {/* Wallet */}
                    <div className="bg-white dark:bg-[#0d1d14] rounded-[32px] border-2 border-[#D0F35D] p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D0F35D]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="flex items-center mb-6 relative z-10">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#D0F35D]/20 text-[#0F2E25] dark:text-[#D0F35D] mr-5 text-2xl shadow-inner">
                                <i className="bi bi-wallet2"></i>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Loan Wallet (Disbursed)</span>
                                <h5 className="font-extrabold text-2xl m-0 text-dark dark:text-white">KES {wallet_balance.toLocaleString()}</h5>
                            </div>
                        </div>
                        <Link href="/member/withdraw?type=loans&source=loans" className="block w-full text-center bg-[#D0F35D] text-[#0F2E25] font-extrabold py-4 rounded-2xl hover:bg-[#bce04b] hover:scale-[1.02] transition-all shadow-md relative z-10">
                            <i className="bi bi-cash-coin mr-2"></i> Withdraw to M-Pesa
                        </Link>
                    </div>

                    {/* Savings/Limit */}
                    <div className="bg-white dark:bg-[#0d1d14] rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                        <div className="flex items-center mb-5">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 mr-5 text-xl">
                                <i className="bi bi-safe"></i>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Total Savings</span>
                                <h5 className="font-extrabold text-xl m-0 text-dark dark:text-white">KES {total_savings.toLocaleString()}</h5>
                            </div>
                        </div>
                        <hr className="border-gray-100 dark:border-white/10 my-6" />
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#D0F35D]/20 text-[#0F2E25] dark:text-[#D0F35D] mr-5 text-xl">
                                <i className="bi bi-graph-up-arrow"></i>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Max Loan Limit (3x)</span>
                                <h5 className="font-extrabold text-xl m-0 text-green-600 dark:text-[#D0F35D]">KES {limit.toLocaleString()}</h5>
                            </div>
                        </div>
                    </div>

                    {/* Quick Terms */}
                    <div className="bg-[#0F2E25] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden mt-2">
                        <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                        <h5 className="font-extrabold mb-5 text-xl flex items-center relative z-10"><i className="bi bi-info-circle text-[#D0F35D] mr-3"></i>Quick Terms</h5>
                        <ul className="flex flex-col gap-4 text-sm opacity-80 pl-0 list-none m-0 relative z-10 font-medium">
                            <li className="flex items-start">
                                <i className="bi bi-check-circle-fill text-yellow-500 mr-4 mt-1"></i>
                                Interest rate is fixed at {active_loan ? active_loan.interest_rate : 12}% p.a on reducing balance.
                            </li>
                            <li className="flex items-start">
                                <i className="bi bi-check-circle-fill text-yellow-500 mr-4 mt-1"></i>
                                Loans require active guarantors.
                            </li>
                            <li className="flex items-start">
                                <i className="bi bi-check-circle-fill text-yellow-500 mr-4 mt-1"></i>
                                Processing takes 24-48 hours.
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
        </motion.div>
    );
}
