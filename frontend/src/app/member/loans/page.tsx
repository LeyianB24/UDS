'use client';

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

    const { active_loan, limit, history } = data;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-5"
        >
            {/* HERO */}
            <div className="sv-hero">
                <div className="hero-mesh"></div>
                <div className="hero-dots"></div>
                <div className="hero-ring r1"></div>
                <div className="hero-ring r2"></div>

                <div className="hero-inner">
                    <div className="hero-nav">
                        <Link href="/member/dashboard" className="hero-back">
                            <i className="bi bi-arrow-left" style={{ fontSize: '.65rem' }}></i> Dashboard
                        </Link>
                        <span className="hero-brand-tag">UMOJA SACCO</span>
                    </div>

                    <div className="row align-items-center g-5">
                        <div className="col-md-6">
                            <div className="hero-eyebrow"><div className="ey-line"></div> Credit Portfolio</div>
                            <div className="hero-lbl">Maximum Borrowing Capacity</div>
                            <div className="hero-amount">
                                <span className="cur">KES</span>
                                <span>{limit.toLocaleString()}</span>
                            </div>
                            
                            <div className="hero-apr-pill" style={{ background: 'rgba(163,230,53,0.11)', border: '1px solid rgba(163,230,53,0.2)', color: '#bff060', padding: '5px 14px', borderRadius: '50px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                                <span className="apr-pulse"></span> 3x Savings Leverage
                            </div>
                            
                            <div className="mt-4 d-flex gap-2 flex-wrap">
                                {!active_loan ? (
                                    <Link href="/member/apply-loan" className="btn-lime">
                                        <i className="bi bi-pencil-square"></i> Apply New Loan
                                    </Link>
                                ) : (
                                    <Link href="/member/repay-loan" className="btn-lime">
                                        <i className="bi bi-cash-coin"></i> Quick Repay
                                    </Link>
                                )}
                                <Link href="/member/loan-calculator" className="btn-ghost" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <i className="bi bi-calculator"></i> Repayment Calculator
                                </Link>
                            </div>
                        </div>

                        {active_loan && (
                            <div className="col-md-6 d-none d-md-block">
                                <div className="text-center p-4 rounded-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div className="text-[10px] uppercase font-extrabold tracking-widest text-[#a3e635] mb-3">Active Loan Progress</div>
                                    <div className="relative w-32 h-32 mx-auto mb-3">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                                            <circle cx="64" cy="64" r="58" stroke="#a3e635" strokeWidth="12" fill="transparent" 
                                                strokeDasharray={364} 
                                                strokeDashoffset={364 - (364 * active_loan.progress_percent) / 100}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 d-flex flex-column align-items-center justify-content-center text-white">
                                            <div className="text-xl font-extrabold">{Math.round(active_loan.progress_percent)}%</div>
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-bold text-white opacity-40 uppercase tracking-wider">{active_loan.loan_type.replace(/_/g, ' ')}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="stats-float">
                <div className="row g-3">
                    <div className="col-md-3">
                        <div className="sc">
                            <div className="sc-ico ico-in">
                                <i className="bi bi-check2-circle"></i>
                            </div>
                            <div className="sc-lbl">Repayment Progress</div>
                            <div className="sc-val">{active_loan ? Math.round(active_loan.progress_percent) : 0}%</div>
                            <div className="sc-bar"><div className="sc-bar-fill bg-success" style={{ width: `${active_loan ? active_loan.progress_percent : 0}%` }}></div></div>
                            <div className="sc-meta">Amortization progress</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="sc">
                            <div className="sc-ico ico-out">
                                <i className="bi bi-wallet2"></i>
                            </div>
                            <div className="sc-lbl">Outstanding Balance</div>
                            <div className="sc-val">KES {active_loan ? active_loan.current_balance.toLocaleString() : '0.00'}</div>
                            <div className="sc-bar"><div className="sc-bar-fill bg-danger w-100"></div></div>
                            <div className="sc-meta">Principals & interest due</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="sc">
                            <div className="sc-ico ico-warn" style={{ background: 'rgba(217,119,6,0.08)', color: '#d97706' }}>
                                <i className="bi bi-calendar-event"></i>
                            </div>
                            <div className="sc-lbl">Next Repayment</div>
                            <div className="sc-val">{active_loan ? new Date(active_loan.next_repayment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'None'}</div>
                            <div className="sc-bar"><div className="sc-bar-fill bg-warning w-75"></div></div>
                            <div className="sc-meta">Scheduled ledger update</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="sc">
                            <div className="sc-ico ico-in" style={{ background: 'var(--lg)', color: 'var(--lt)' }}>
                                <i className="bi bi-shield-check"></i>
                            </div>
                            <div className="sc-lbl">Total Payable</div>
                            <div className="sc-val">KES {active_loan ? active_loan.total_payable.toLocaleString() : '0.00'}</div>
                            <div className="sc-bar"><div className="sc-bar-fill" style={{ background: 'var(--lime)', width: '60%' }}></div></div>
                            <div className="sc-meta">Total lifetime debt value</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body">
                <div className="filter-row">
                    <div className="sec-label">Loan Lifecycle History</div>
                </div>

                <div className="txn-card">
                    <div className="txn-card-head">
                        <span className="txn-card-title">My Loan History</span>
                        <span className="txn-card-ct">{history.length} records</span>
                    </div>
                    <div>
                        {history.map((loan, idx) => (
                            <div key={idx} className="txn-row">
                                <div className={`trn-dot ${loan.status === 'disbursed' || loan.status === 'active' ? 'ico-in' : 'ico-out'}`} 
                                     style={{ background: loan.status === 'completed' ? 'rgba(37,99,235,0.1)' : '', color: loan.status === 'completed' ? '#2563eb' : '' }}>
                                    <i className={`bi ${loan.status === 'completed' ? 'bi-check-all' : loan.status === 'pending' ? 'bi-clock-history' : 'bi-bank'}`}></i>
                                </div>
                                <div className="txn-body">
                                    <div className="txn-name">{loan.loan_type.replace(/_/g, ' ').toUpperCase()}</div>
                                    <div className="txn-note">
                                        Status: <span className="text-capitalize text-success fw-bold">{loan.status}</span> · Ref: #{loan.loan_id}
                                    </div>
                                </div>
                                <div className="txn-right">
                                    <div className="txn-amt text-dark">
                                        KES {loan.amount.toLocaleString()}
                                    </div>
                                    <div className="txn-ts opacity-50 font-bold">
                                        {loan.status === 'disbursed' ? `Bal: KES ${loan.current_balance.toLocaleString()}` : new Date(loan.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && (
                            <div className="p-5 text-center text-muted">
                                <i className="bi bi-inbox fs-1 opacity-25 d-block mb-2"></i>
                                No loan records found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
