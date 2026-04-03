"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import './loans.css';

const ks = (v: number) => `KES ${v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v.toFixed(0)}`;
const kf = (v: number) => `KES ${v.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function LoansPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Loan application form state
    const [applyForm, setApplyForm] = useState({
        loan_type: 'emergency',
        amount: '',
        duration_months: '12',
        guarantor_1: '',
        guarantor_2: '',
        notes: ''
    });
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyMsg, setApplyMsg] = useState<{ type: string; text: string } | null>(null);

    // Wallet repay form state
    const [repayAmount, setRepayAmount] = useState('');
    const [repayLoading, setRepayLoading] = useState(false);
    const [repayMsg, setRepayMsg] = useState<{ type: string; text: string } | null>(null);

    useEffect(() => {
        apiFetch('/api/v1/member_loans.php')
            .then(r => { setData(r); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, []);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setApplyLoading(true); setApplyMsg(null);
        try {
            const fd = new FormData();
            Object.entries(applyForm).forEach(([k, v]) => fd.append(k, v));
            const res = await apiFetch('/api/v1/apply_loan.php', { method: 'POST', body: fd });
            setApplyMsg({ type: 'success', text: res.message || 'Application submitted!' });
            setTimeout(() => window.location.reload(), 1800);
        } catch (err: any) {
            setApplyMsg({ type: 'error', text: err.message || 'Failed to apply.' });
        } finally { setApplyLoading(false); }
    };

    const handleRepay = async (e: React.FormEvent) => {
        e.preventDefault();
        setRepayLoading(true); setRepayMsg(null);
        try {
            const fd = new FormData();
            fd.append('action', 'repay_wallet');
            fd.append('amount', repayAmount);
            const res = await apiFetch('/api/v1/member_loans.php', { method: 'POST', body: fd });
            setRepayMsg({ type: 'success', text: res.message || 'Repayment successful!' });
            setTimeout(() => window.location.reload(), 1800);
        } catch (err: any) {
            setRepayMsg({ type: 'error', text: err.message || 'Repayment failed.' });
        } finally { setRepayLoading(false); }
    };

    if (loading) {
        return (
            <div className="loans-page">
                <div className="loans-loading">
                    <div className="loans-spinner"></div>
                    <p>Loading loan portfolio...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="loans-page">
                <div className="loans-error-banner">
                    <i className="bi bi-exclamation-triangle-fill"></i> {error}
                </div>
            </div>
        );
    }

    const { balances, active_loan, pending_loan, history, available_guarantors } = data || {};
    const { total_savings = 0, wallet_balance = 0, max_loan_limit = 0, is_eligible = false } = balances || {};
    const hasActiveLoan = !!active_loan;
    const hasPendingLoan = !!pending_loan;
    const estimatedInterest = parseFloat(applyForm.amount || '0') * 0.12;
    const estimatedTotal = parseFloat(applyForm.amount || '0') + estimatedInterest;

    const STATUS_COLORS: Record<string, string> = {
        completed: 'status-completed',
        disbursed: 'status-disbursed',
        active: 'status-active',
        pending: 'status-pending',
        approved: 'status-approved',
        rejected: 'status-rejected',
        settled: 'status-completed',
    };

    return (
        <div className="loans-page">
            {/* PAGE HEADER */}
            <div className="loans-header">
                <div>
                    <h2 className="loans-h2">Loan Portfolio</h2>
                    <p className="loans-sub">Manage your finances and track repayment progress.</p>
                </div>
                <div className="loans-hdr-btns">
                    {wallet_balance > 0 && (
                        <Link href="/member/withdraw?type=loans" className="btn-ghost-loans">
                            <i className="bi bi-wallet2"></i> Withdraw Funds
                        </Link>
                    )}
                    {(hasActiveLoan || hasPendingLoan) ? (
                        <button className="btn-disabled-loans" disabled>
                            <i className="bi bi-lock-fill"></i> Limit Reached
                        </button>
                    ) : (
                        <button
                            className="btn-lime-loans"
                            onClick={() => (document.getElementById('applyModal') as HTMLDialogElement)?.showModal()}
                        >
                            <i className="bi bi-plus-lg"></i> Apply for Loan
                        </button>
                    )}
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="loans-grid">
                {/* LEFT: Active Loan + History */}
                <div className="loans-main">
                    {/* Pending Alert */}
                    {hasPendingLoan && (
                        <div className="loans-alert loans-alert-warn">
                            <div className="la-ico warn"><i className="bi bi-hourglass-split"></i></div>
                            <div>
                                <div className="la-title">Application In Review</div>
                                <div className="la-sub">Your request for <strong>{kf(pending_loan.amount)}</strong> is currently: <strong style={{ textTransform: 'capitalize' }}>{pending_loan.status}</strong>.</div>
                            </div>
                        </div>
                    )}

                    {/* Overdue Alert */}
                    {hasActiveLoan && active_loan.is_overdue && (
                        <div className="loans-alert loans-alert-danger">
                            <div className="la-ico danger"><i className="bi bi-exclamation-triangle-fill"></i></div>
                            <div>
                                <div className="la-title" style={{ color: '#dc2626' }}>Overdue Repayment Detected</div>
                                <div className="la-sub">Your repayment was due on <strong>{new Date(active_loan.next_repayment_date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>. Please repay to avoid daily fines.</div>
                            </div>
                        </div>
                    )}

                    {/* Active Loan Card */}
                    {hasActiveLoan ? (
                        <div className="active-loan-card">
                            <div className="alc-top">
                                <div>
                                    <div className="alc-badge">Active Loan #{active_loan.loan_id}</div>
                                    <div className="alc-balance">{kf(active_loan.outstanding_balance ?? active_loan.current_balance)}</div>
                                    <div className="alc-label">Outstanding Balance</div>
                                </div>
                                <div className="alc-meta">
                                    <div>
                                        <div className="alc-meta-label">Installment / Mo</div>
                                        <div className="alc-meta-val">{kf((active_loan.total_payable || active_loan.amount) / (active_loan.duration_months || 12))}</div>
                                    </div>
                                    {(active_loan.total_fines ?? 0) > 0 && (
                                        <div>
                                            <div className="alc-meta-label" style={{ color: '#fbbf24' }}>Late Fines</div>
                                            <div className="alc-meta-val" style={{ color: '#fbbf24' }}>+{kf(active_loan.total_fines)}</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="alc-meta-label">Interest Rate</div>
                                        <div className="alc-meta-val">{active_loan.interest_rate}% p.a</div>
                                    </div>
                                </div>
                            </div>
                            <div className="alc-progress-section">
                                <div className="alc-progress-header">
                                    <span>Repayment Progress</span>
                                    <span>{(active_loan.progress_percent ?? 0).toFixed(0)}%</span>
                                </div>
                                <div className="alc-progress-track">
                                    <div className="alc-progress-fill" style={{ width: `${active_loan.progress_percent ?? 0}%` }}></div>
                                </div>
                                {active_loan.guarantors?.length > 0 && (
                                    <div className="alc-guarantors">Guarantors: {active_loan.guarantors.join(', ')}</div>
                                )}
                                <div className="alc-paid-info">
                                    Paid: {kf(active_loan.repaid_amount ?? 0)} of {kf(active_loan.total_payable ?? active_loan.amount)}
                                </div>
                            </div>
                            <div className="alc-actions">
                                <Link href={`/member/mpesa?type=loan_repayment&loan_id=${active_loan.loan_id}`} className="btn-lime-loans w-full">
                                    <i className="bi bi-phone"></i> M-Pesa
                                </Link>
                                <button
                                    className="btn-outline-loans w-full"
                                    onClick={() => (document.getElementById('walletRepayModal') as HTMLDialogElement)?.showModal()}
                                >
                                    <i className="bi bi-wallet2"></i> Wallet ({kf(wallet_balance)})
                                </button>
                            </div>
                        </div>
                    ) : !hasPendingLoan ? (
                        <div className="eligibility-card">
                            {is_eligible ? (
                                <>
                                    <div className="ec-ico lime"><i className="bi bi-shield-check"></i></div>
                                    <h3 className="ec-title">You are Eligible!</h3>
                                    <p className="ec-sub">No active debts. Based on your savings, you qualify for a loan up to:</p>
                                    <div className="ec-limit">{kf(max_loan_limit)}</div>
                                </>
                            ) : (
                                <>
                                    <div className="ec-ico"><i className="bi bi-clock-history"></i></div>
                                    <h3 className="ec-title">Build Your Savings</h3>
                                    <p className="ec-sub">To qualify for a loan, you need active savings. Start saving to unlock up to 3× borrowing power.</p>
                                    <Link href="/member/mpesa?type=savings" className="btn-lime-loans">Start Saving Now</Link>
                                </>
                            )}
                        </div>
                    ) : null}

                    {/* Loan History Table */}
                    <div className="loans-history-card">
                        <div className="lh-header">
                            <h6 className="lh-title">Loan History</h6>
                        </div>
                        <div className="lh-table-wrap">
                            <table className="lh-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!history || history.length === 0) ? (
                                        <tr><td colSpan={5} className="lh-empty">No loan history found.</td></tr>
                                    ) : history.map((h: any, i: number) => (
                                        <tr key={i}>
                                            <td className="lh-date">{new Date(h.created_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="lh-type">{h.loan_type?.replace(/_/g, ' ')}</td>
                                            <td className="lh-amount">{kf(h.amount)}</td>
                                            <td><span className={`lh-badge ${STATUS_COLORS[h.status] ?? 'status-pending'}`}>{h.status}</span></td>
                                            <td className="lh-balance">{kf(h.current_balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="loans-sidebar">
                    {/* Wallet Card */}
                    <div className="loans-side-card loans-side-card-lime">
                        <div className="lsc-ico lime"><i className="bi bi-wallet2"></i></div>
                        <div>
                            <div className="lsc-label">Loan Wallet (Disbursed)</div>
                            <div className="lsc-val">{kf(wallet_balance)}</div>
                        </div>
                        <Link href="/member/withdraw?type=loans&source=loans" className="btn-lime-loans w-full mt-3">
                            <i className="bi bi-cash-coin"></i> Withdraw to M-Pesa
                        </Link>
                    </div>

                    {/* Savings / Limit */}
                    <div className="loans-side-card">
                        <div className="lsc-row">
                            <div className="lsc-ico"><i className="bi bi-safe"></i></div>
                            <div>
                                <div className="lsc-label">Total Savings</div>
                                <div className="lsc-val">{kf(total_savings)}</div>
                            </div>
                        </div>
                        <hr className="lsc-hr" />
                        <div className="lsc-row">
                            <div className="lsc-ico lime"><i className="bi bi-graph-up-arrow"></i></div>
                            <div>
                                <div className="lsc-label">Max Loan Limit (3×)</div>
                                <div className="lsc-val lsc-green">{kf(max_loan_limit)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Terms */}
                    <div className="loans-side-card loans-side-card-dark">
                        <h5 className="lsc-dark-title"><i className="bi bi-info-circle"></i> Quick Terms</h5>
                        <ul className="lsc-terms">
                            <li><i className="bi bi-check-circle-fill"></i> Interest rate 12% p.a. on reducing balance.</li>
                            <li><i className="bi bi-check-circle-fill"></i> Loans require 2 active guarantors.</li>
                            <li><i className="bi bi-check-circle-fill"></i> Processing takes 24-48 hours.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* APPLY LOAN MODAL */}
            <dialog id="applyModal" className="loans-modal">
                <div className="lm-inner">
                    <div className="lm-header">
                        <div>
                            <div className="lm-title">New Loan Application</div>
                            <div className="lm-sub">Customize your loan details</div>
                        </div>
                        <button className="lm-close" onClick={() => (document.getElementById('applyModal') as HTMLDialogElement)?.close()}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                    {applyMsg && (
                        <div className={`lm-msg ${applyMsg.type === 'success' ? 'lm-msg-ok' : 'lm-msg-err'}`}>
                            <i className={`bi ${applyMsg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                            {applyMsg.text}
                        </div>
                    )}
                    <form onSubmit={handleApply} className="lm-body">
                        <div className="lm-section">
                            <div className="lm-step-label"><span className="lm-step-no">1</span> Loan Details</div>

                            <div className="lm-limit-bar-wrap">
                                <div className="lm-limit-row">
                                    <span className="lm-limit-label">Limit Usage</span>
                                    <span className="lm-limit-pct">
                                        {max_loan_limit > 0 ? ((parseFloat(applyForm.amount || '0') / max_loan_limit) * 100).toFixed(0) : 0}%
                                    </span>
                                </div>
                                <div className="lm-limit-track">
                                    <div className="lm-limit-fill" style={{ width: `${Math.min(100, (parseFloat(applyForm.amount || '0') / (max_loan_limit || 1)) * 100)}%` }}></div>
                                </div>
                                <div className="lm-limit-max">Max: {kf(max_loan_limit)}</div>
                            </div>

                            <div className="lm-field">
                                <label className="lm-label">Loan Category</label>
                                <select className="lm-select" value={applyForm.loan_type} onChange={e => setApplyForm(p => ({ ...p, loan_type: e.target.value }))}>
                                    <option value="emergency">Emergency Loan</option>
                                    <option value="development">Development Loan</option>
                                    <option value="business">Business Expansion</option>
                                    <option value="education">Education / School Fees</option>
                                </select>
                            </div>
                            <div className="lm-row2">
                                <div className="lm-field">
                                    <label className="lm-label">Amount (KES)</label>
                                    <input
                                        type="number" className="lm-input" placeholder="0" required
                                        value={applyForm.amount}
                                        onChange={e => setApplyForm(p => ({ ...p, amount: e.target.value }))}
                                    />
                                </div>
                                <div className="lm-field">
                                    <label className="lm-label">Duration</label>
                                    <select className="lm-select" value={applyForm.duration_months} onChange={e => setApplyForm(p => ({ ...p, duration_months: e.target.value }))}>
                                        <option value="3">3 Months</option>
                                        <option value="6">6 Months</option>
                                        <option value="12">12 Months</option>
                                        <option value="18">18 Months</option>
                                        <option value="24">24 Months</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="lm-section">
                            <div className="lm-step-label"><span className="lm-step-no">2</span> Guarantors</div>
                            <div className="lm-field">
                                <label className="lm-label">First Guarantor</label>
                                <select className="lm-select" required value={applyForm.guarantor_1} onChange={e => setApplyForm(p => ({ ...p, guarantor_1: e.target.value }))}>
                                    <option value="">Select a member...</option>
                                    {available_guarantors?.map((m: any) => (
                                        <option key={m.member_id} value={m.member_id}>{m.full_name} ({m.national_id})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="lm-field">
                                <label className="lm-label">Second Guarantor</label>
                                <select className="lm-select" required value={applyForm.guarantor_2} onChange={e => setApplyForm(p => ({ ...p, guarantor_2: e.target.value }))}>
                                    <option value="">Select a member...</option>
                                    {available_guarantors?.filter((m: any) => String(m.member_id) !== applyForm.guarantor_1).map((m: any) => (
                                        <option key={m.member_id} value={m.member_id}>{m.full_name} ({m.national_id})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="lm-section">
                            <div className="lm-step-label"><span className="lm-step-no">3</span> Purpose</div>
                            <textarea className="lm-textarea" rows={2} placeholder="Briefly describe why you need this loan..." required
                                value={applyForm.notes} onChange={e => setApplyForm(p => ({ ...p, notes: e.target.value }))}></textarea>
                        </div>

                        <div className="lm-summary">
                            <div className="lm-sum-row"><span>Estimated Interest (12%)</span><span className="lm-sum-val">KES {estimatedInterest.toLocaleString()}</span></div>
                            <hr className="lm-sum-hr" />
                            <div className="lm-sum-row"><span className="lm-sum-main">Est. Total Payable</span><span className="lm-sum-big">KES {estimatedTotal.toLocaleString()}</span></div>
                        </div>

                        <button type="submit" className="btn-lime-loans w-full" disabled={applyLoading}>
                            {applyLoading ? <><i className="bi bi-arrow-repeat"></i> Processing...</> : <>Confirm &amp; Apply <i className="bi bi-send-fill"></i></>}
                        </button>
                    </form>
                </div>
            </dialog>

            {/* WALLET REPAY MODAL */}
            {hasActiveLoan && (
                <dialog id="walletRepayModal" className="loans-modal">
                    <div className="lm-inner">
                        <div className="lm-header">
                            <div>
                                <div className="lm-title">Repay via Wallet</div>
                                <div className="lm-sub">Available: {kf(wallet_balance)}</div>
                            </div>
                            <button className="lm-close" onClick={() => (document.getElementById('walletRepayModal') as HTMLDialogElement)?.close()}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        {repayMsg && (
                            <div className={`lm-msg ${repayMsg.type === 'success' ? 'lm-msg-ok' : 'lm-msg-err'}`}>
                                <i className={`bi ${repayMsg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                                {repayMsg.text}
                            </div>
                        )}
                        <form onSubmit={handleRepay} className="lm-body">
                            <div className="lm-field">
                                <label className="lm-label">Amount to Repay (KES)</label>
                                <input
                                    type="number" className="lm-input" placeholder="0" required
                                    min={1} max={Math.min(wallet_balance, active_loan?.current_balance || 0)}
                                    value={repayAmount}
                                    onChange={e => setRepayAmount(e.target.value)}
                                />
                                <div className="lm-hint">Outstanding: {kf(active_loan?.outstanding_balance ?? 0)}</div>
                            </div>
                            <button type="submit" className="btn-lime-loans w-full" disabled={repayLoading}>
                                {repayLoading ? 'Processing...' : 'Confirm Repayment'}
                            </button>
                        </form>
                    </div>
                </dialog>
            )}
        </div>
    );
}
