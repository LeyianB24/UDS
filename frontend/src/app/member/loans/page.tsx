"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MemberApi, LoanData } from '@/lib/api/member';
import './loans.css';

export default function LoansPage() {
    const [data, setData] = useState<LoanData | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal state interactions
    const [modalAmount, setModalAmount] = useState<number>(0);
    const [modalMonths, setModalMonths] = useState<number>(12);

    useEffect(() => {
        MemberApi.getLoans()
            .then(res => setData(res))
            .finally(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100">
                <div className="spinner-border text-success" role="status"></div>
            </div>
        );
    }

    const { active_loan, pending_loan, limit, wallet_balance, total_savings, history } = data;
    const is_overdue = active_loan ? (new Date(active_loan.next_repayment_date).getTime() < Date.now()) : false;

    // Apply calculator
    const calcRate = 0.12;
    let modalPercent = (modalAmount / limit) * 100;
    if (modalPercent > 100) modalPercent = 100;
    const isExceeding = modalAmount > limit;
    const modalInterest = modalAmount * calcRate * (modalMonths / 12);
    const modalTotal = modalAmount + modalInterest;

    return (
        <div className="p-4 p-lg-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h2 className="fw-bold mb-1">Loan Portfolio</h2>
                    <p className="text-secondary mb-0">Manage your finances and track repayment progress.</p>
                </div>
                
                <div className="d-flex gap-2">
                    {active_loan || pending_loan ? (
                        <>
                            {wallet_balance > 0 && (
                                <Link href="/member/withdraw?type=loans&source=loans" className="btn btn-dark fw-bold px-4 py-3 rounded-4 shadow-sm">
                                    <i className="bi bi-wallet2 me-2"></i> Withdraw Funds
                                </Link>
                            )}
                            <button className="btn btn-light border text-secondary fw-bold px-4 py-3 rounded-4" style={{ opacity: 0.8, cursor: 'not-allowed' }}>
                                <i className="bi bi-lock-fill me-2"></i> Limit Reached
                            </button>
                        </>
                    ) : (
                        <>
                            {wallet_balance > 0 && (
                                <Link href="/member/withdraw?type=loans&source=loans" className="btn btn-dark fw-bold px-4 py-3 rounded-4 shadow-sm">
                                    <i className="bi bi-wallet2 me-2"></i> Withdraw Funds
                                </Link>
                            )}
                            <button className="btn btn-lime shadow-lg py-3 rounded-4" data-bs-toggle="modal" data-bs-target="#applyLoanModal">
                                <i className="bi bi-plus-lg me-2"></i> Apply for Loan
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="row g-4">
                <div className="col-xl-8">
                    {pending_loan && (
                        <div className="alert bg-warning bg-opacity-10 border-warning border-opacity-25 rounded-4 d-flex align-items-center p-4 mb-4">
                            <div className="icon-box bg-warning bg-opacity-25 text-warning-emphasis me-3">
                                <i className="bi bi-hourglass-split"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold text-warning-emphasis mb-1">Application In Review</h6>
                                <span className="small text-secondary">Your request for <strong>KES {pending_loan.amount.toLocaleString()}</strong> is currently status: <strong className="text-capitalize">{pending_loan.status}</strong>.</span>
                            </div>
                        </div>
                    )}

                    {active_loan && is_overdue && (
                        <div className="alert bg-danger bg-opacity-10 border-danger border-opacity-25 rounded-4 d-flex align-items-center p-4 mb-4">
                            <div className="icon-box bg-danger bg-opacity-25 text-danger me-3" style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold text-danger mb-1">Overdue Repayment Detected</h6>
                                <p className="small text-secondary mb-0">Your loan repayment was due on <strong>{new Date(active_loan.next_repayment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</strong>. Please make a repayment to avoid further daily fines.</p>
                            </div>
                        </div>
                    )}

                    {active_loan ? (
                        <div className="card-forest p-4 p-lg-5 mb-4 shadow-lg">
                            <div className="d-flex justify-content-between align-items-start mb-5">
                                <div>
                                    <div className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 rounded-pill px-3 py-2 mb-3 backdrop-blur" style={{ backdropFilter: 'blur(4px)' }}>
                                        Active Loan #{active_loan.loan_id}
                                    </div>
                                    <h1 className="display-4 fw-bold mb-0">KES {active_loan.current_balance.toLocaleString()}</h1>
                                    <span className="label-text">Outstanding Balance</span>
                                </div>
                                <div className="d-none d-sm-flex gap-4 text-end">
                                    <div>
                                        <span className="label-text d-block mb-1">Installment / Mo</span>
                                        <span className="fw-bold fs-5">KES {Math.round(active_loan.total_payable / 12).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="label-text d-block mb-1">Interest Rate</span>
                                        <span className="fw-bold fs-5">{active_loan.interest_rate}% p.a</span>
                                    </div>
                                </div>
                            </div>

                            <div className="row align-items-end">
                                <div className="col-lg-7 mb-4 mb-lg-0">
                                    <div className="d-flex justify-content-between text-white small fw-bold mb-2">
                                        <span>Repayment Progress</span>
                                        <span>{Math.round(active_loan.progress_percent)}%</span>
                                    </div>
                                    <div className="progress" style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 10 }}>
                                        <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${active_loan.progress_percent}%` }}></div>
                                    </div>
                                    <div className="mt-3 text-white opacity-75 small text-uppercase" style={{ letterSpacing: 1 }}>
                                        Guarantors: {active_loan.guarantors && active_loan.guarantors.length > 0 ? active_loan.guarantors.join(', ') : 'None'}
                                    </div>
                                    <div className="mt-2 text-white opacity-75 small">
                                        Paid: KES {(active_loan.total_payable - active_loan.current_balance).toLocaleString()} of KES {active_loan.total_payable.toLocaleString()}
                                    </div>
                                </div>
                                <div className="col-lg-5">
                                    <div className="row g-2 mt-2">
                                        <div className="col-sm-6">
                                            <Link href={`/member/mpesa_request?type=loan_repayment&loan_id=${active_loan.loan_id}`} className="btn btn-lime w-100 py-3 shadow-sm d-flex justify-content-center align-items-center">
                                                <i className="bi bi-phone me-2"></i> M-Pesa
                                            </Link>
                                        </div>
                                        <div className="col-sm-6">
                                            <button className="btn btn-outline-light w-100 py-3 shadow-sm text-white" data-bs-toggle="modal" data-bs-target="#repayWalletModal">
                                                <i className="bi bi-wallet2 me-2" style={{color: '#28a745'}}></i> Wallet
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : !pending_loan && (
                        <div className="card-clean p-5 text-center mb-4 h-100 d-flex flex-column justify-content-center align-items-center" style={{ borderStyle: 'dashed' }}>
                            {total_savings > 0 ? (
                                <>
                                    <div className="icon-box lime rounded-circle mb-3" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                                        <i className="bi bi-shield-check"></i>
                                    </div>
                                    <h3 className="fw-bold">You are Eligible!</h3>
                                    <p className="text-secondary mb-4 col-lg-8 mx-auto">You currently have no active debts. Based on your savings, you qualify for an instant loan up to the limit below.</p>
                                    <h2 className="text-success fw-bold">KES {limit.toLocaleString()}</h2>
                                </>
                            ) : (
                                <>
                                    <div className="icon-box bg-light text-muted rounded-circle mb-3" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                                        <i className="bi bi-clock-history"></i>
                                    </div>
                                    <h3 className="fw-bold">Build Your Savings</h3>
                                    <p className="text-secondary mb-4 col-lg-8 mx-auto">To qualify for a loan, you need to have active savings. Start saving today to unlock borrowing power up to 3x your balance.</p>
                                    <Link href="/member/mpesa_request?type=savings" className="btn btn-dark rounded-pill px-5 py-3">Start Saving Now</Link>
                                </>
                            )}
                        </div>
                    )}

                    <div className="card-clean mb-4">
                        <div className="p-4 border-bottom border-light d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0">Recent History</h6>
                            <div className="dropdown">
                                <button className="btn btn-sm btn-light border dropdown-toggle" data-bs-toggle="dropdown">
                                    <i className="bi bi-download me-1"></i> Export
                                </button>
                                <ul className="dropdown-menu shadow">
                                    <li><a className="dropdown-item" href="#"><i className="bi bi-file-pdf text-danger me-2"></i>Export PDF</a></li>
                                    <li><a className="dropdown-item" href="#"><i className="bi bi-file-excel text-success me-2"></i>Export Excel</a></li>
                                    <li><a className="dropdown-item" href="#"><i className="bi bi-printer text-primary me-2"></i>Print History</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table-premium mb-0">
                                <thead>
                                    <tr>
                                        <th className="ps-4">Date</th>
                                        <th>Loan Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th className="text-end pe-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-5 text-muted">No loan history found.</td></tr>
                                    ) : history.map((h, i) => {
                                        let statusClass = 'status-pending';
                                        switch (h.status) {
                                            case 'completed': statusClass = 'status-completed'; break;
                                            case 'disbursed': case 'active': statusClass = 'status-disbursed'; break;
                                            case 'approved': statusClass = 'status-approved'; break;
                                            case 'rejected': statusClass = 'status-rejected'; break;
                                        }

                                        return (
                                            <tr key={i}>
                                                <td className="ps-4 fw-bold">{new Date(h.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td className="text-capitalize text-secondary">{h.loan_type.replace(/_/g, ' ')}</td>
                                                <td className="fw-bold">KES {h.amount.toLocaleString()}</td>
                                                <td><span className={`badge-pill ${statusClass}`}>{h.status}</span></td>
                                                <td className="text-end pe-4">
                                                    <button className="btn btn-sm btn-light border rounded-circle" style={{ width: 32, height: 32 }}><i className="bi bi-chevron-right"></i></button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4">
                    <div className="d-flex flex-column gap-4">
                        <div className="card-clean p-4 border-lime" style={{ border: '2px solid var(--lime-accent)' }}>
                            <div className="d-flex align-items-center mb-3">
                                <div className="icon-box lime me-3">
                                    <i className="bi bi-wallet2"></i>
                                </div>
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase">Loan Wallet (Disbursed)</span>
                                    <h5 className="fw-bold mb-0">KES {wallet_balance.toLocaleString()}</h5>
                                </div>
                            </div>
                            <div className="d-grid mt-3">
                                <Link href="/member/withdraw?type=loans&source=loans" className="btn btn-lime py-2">
                                    <i className="bi bi-cash-coin me-2"></i> Withdraw to M-Pesa
                                </Link>
                            </div>
                        </div>

                        <div className="card-clean p-4">
                            <div className="d-flex align-items-center mb-3">
                                <div className="icon-box me-3">
                                    <i className="bi bi-safe"></i>
                                </div>
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase">Total Savings</span>
                                    <h5 className="fw-bold mb-0">KES {total_savings.toLocaleString()}</h5>
                                </div>
                            </div>
                            <hr className="border-light opacity-50 my-2" />
                            <div className="d-flex align-items-center mt-2">
                                <div className="icon-box lime me-3">
                                    <i className="bi bi-graph-up-arrow"></i>
                                </div>
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase">Max Loan Limit (3x)</span>
                                    <h5 className="fw-bold text-success mb-0">KES {limit.toLocaleString()}</h5>
                                </div>
                            </div>
                        </div>

                        <div className="card-clean text-white p-4" style={{ background: 'var(--forest-deep)' }}>
                            <h5 className="fw-bold mb-3"><i className="bi bi-info-circle me-2 text-warning"></i>Quick Terms</h5>
                            <ul className="list-unstyled mb-0 d-flex flex-column gap-3 small opacity-75">
                                <li className="d-flex align-items-start">
                                    <i className="bi bi-check-circle-fill text-warning me-2 mt-1"></i>
                                    Interest rate is fixed at {active_loan ? active_loan.interest_rate : 12}% p.a on reducing balance.
                                </li>
                                <li className="d-flex align-items-start">
                                    <i className="bi bi-check-circle-fill text-warning me-2 mt-1"></i>
                                    Loans require active guarantors.
                                </li>
                                <li className="d-flex align-items-start">
                                    <i className="bi bi-check-circle-fill text-warning me-2 mt-1"></i>
                                    Processing takes 24-48 hours.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Apply Loan */}
            <div className="modal fade" id="applyLoanModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content overflow-hidden">
                        <div className="modal-header border-0 px-4 pt-4 pb-0">
                            <div>
                                <h5 className="modal-title fw-bold">New Application</h5>
                                <p className="text-secondary small mb-0">Customize your loan details</p>
                            </div>
                            <button type="button" className="btn-close bg-light rounded-circle p-2" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase mb-3">
                                    <span className="badge bg-dark text-white rounded-circle me-1" style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>1</span>
                                    Loan Details
                                </label>
                                
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between small fw-bold mb-1">
                                        <span className="text-secondary">Limit Usage</span>
                                        <span>{Math.round(modalPercent)}%</span>
                                    </div>
                                    <div className="progress" style={{ height: 6 }}>
                                        <div className={`progress-bar ${isExceeding ? 'bg-danger' : 'bg-success'}`} style={{ width: `${modalPercent}%` }}></div>
                                    </div>
                                    <div className="text-end text-muted small mt-1">Max: KES {limit.toLocaleString()}</div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-uppercase text-secondary">Loan Category</label>
                                    <select name="loan_type" className="form-select form-control-lg-custom">
                                        <option value="emergency">Emergency Loan</option>
                                        <option value="development">Development Loan</option>
                                        <option value="education">Education / School Fees</option>
                                    </select>
                                </div>

                                <div className="row g-3">
                                    <div className="col-7">
                                        <label className="form-label small fw-bold text-uppercase text-secondary">Amount (KES)</label>
                                        <input type="number" value={modalAmount || ''} onChange={e => setModalAmount(parseFloat(e.target.value) || 0)} className={`form-control form-control-lg-custom ${isExceeding ? 'is-invalid' : ''}`} placeholder="0" />
                                        {isExceeding && <div className="invalid-feedback fw-bold d-block">Amount exceeds your limit!</div>}
                                    </div>
                                    <div className="col-5">
                                        <label className="form-label small fw-bold text-uppercase text-secondary">Duration</label>
                                        <select value={modalMonths} onChange={e => setModalMonths(parseInt(e.target.value))} className="form-select form-control-lg-custom">
                                            <option value="3">3 Months</option>
                                            <option value="6">6 Months</option>
                                            <option value="12">12 Months</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-light p-3 rounded-4 border" style={{ borderStyle: 'dashed' }}>
                                <div className="d-flex justify-content-between small text-secondary mb-1">
                                    <span>Interest Rating</span>
                                    <span className="fw-bold">KES {Math.ceil(modalInterest).toLocaleString()}</span>
                                </div>
                                <hr className="my-2 opacity-25" />
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">Est. Total Payable</span>
                                    <span className="fs-4 fw-bold text-success">KES {Math.ceil(modalTotal).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-0 px-4 pb-4 pt-0">
                            <button type="submit" disabled={isExceeding || modalAmount <= 0} className="btn btn-lime w-100 py-3 text-uppercase shadow-lg fw-bold" style={{ letterSpacing: 1 }} data-bs-dismiss="modal">
                                Confirm & Apply <i className="bi bi-send-fill ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Repay Wallet */}
            {active_loan && (
            <div className="modal fade" id="repayWalletModal" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content overflow-hidden">
                        <div className="modal-header border-0 p-4 pb-0">
                            <h5 className="fw-bold mb-0">Repay from Wallet</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="p-4 rounded-4 mb-4 text-center bg-light">
                                <small className="text-uppercase text-secondary fw-bold" style={{ letterSpacing: 1 }}>Available in Wallet</small>
                                <h2 className="fw-bold mt-1">KES {wallet_balance.toLocaleString()}</h2>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-uppercase text-secondary">Repayment Amount (KES)</label>
                                <input type="number" className="form-control form-control-lg-custom" defaultValue={active_loan.current_balance} />
                                <div className="mt-2 small text-muted">
                                    Min: KES 10 | Outstanding: KES {active_loan.current_balance.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-0 p-4 pt-0">
                            <button type="button" className="btn btn-success w-100 py-3 rounded-4 shadow-lg text-uppercase fw-bold" style={{ letterSpacing: 1 }} data-bs-dismiss="modal">
                                Confirm Repayment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
