"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import './transactions.css';

const kf = (v: number) => `KES ${Number(v).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TYPE_LABELS: Record<string, string> = {
    all: 'All', savings: 'Savings', loans: 'Loans', shares: 'Shares',
    contributions: 'Contributions', welfare_ledger: 'Welfare', wallet: 'Wallet',
};

const AMOUNT_TYPES_IN = ['savings_deposit', 'share_purchase', 'loan_disbursement', 'welfare_contribution'];

function getTxDir(tx: any): 'in' | 'out' | 'neutral' {
    const t = (tx.action_type || tx.transaction_type || '').toLowerCase();
    if (t.includes('deposit') || t.includes('purchase') || t.includes('contribution') || t.includes('disbursement')) return 'in';
    if (t.includes('repayment') || t.includes('withdrawal') || t.includes('debit')) return 'out';
    return 'neutral';
}

export default function TransactionsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const load = useCallback(() => {
        setLoading(true);
        const qs = filter !== 'all' ? `?type=${filter}` : '';
        apiFetch(`/api/v1/member_transactions.php${qs}`)
            .then(r => { setData(r); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    const txns: any[] = data?.transactions ?? [];
    const totals: any[] = data?.totals ?? [];

    const filtered = txns.filter(tx => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (tx.reference_no || '').toLowerCase().includes(s)
            || (tx.notes || tx.description || '').toLowerCase().includes(s)
            || (tx.action_type || '').toLowerCase().includes(s);
    });

    return (
        <div className="txn-page">
            {/* Header */}
            <div className="txn-header">
                <div>
                    <h2 className="txn-h2">Transaction History</h2>
                    <p className="txn-sub">Full ledger of all financial activity on your account.</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="txn-filters">
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <button
                        key={key}
                        className={`txn-filter-pill ${filter === key ? 'active' : ''}`}
                        onClick={() => setFilter(key)}
                    >
                        {label}
                        {key !== 'all' && (
                            <span className="txn-filter-count">
                                {totals.find(t => t.category === key)?.count ?? 0}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search + Table Card */}
            <div className="txn-card">
                <div className="txn-card-head">
                    <div className="txn-search">
                        <i className="bi bi-search"></i>
                        <input
                            type="text" placeholder="Search by reference or description…"
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="txn-count">
                        {loading ? '—' : `${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}`}
                    </div>
                </div>

                {loading ? (
                    <div className="txn-loading">
                        <div className="txn-spinner"></div>
                        <span>Loading transactions…</span>
                    </div>
                ) : error ? (
                    <div className="txn-error">{error}</div>
                ) : filtered.length === 0 ? (
                    <div className="txn-empty">
                        <div className="txn-empty-ico"><i className="bi bi-receipt"></i></div>
                        <div className="txn-empty-title">No Transactions Found</div>
                        <div className="txn-empty-sub">
                            {search ? 'No results matched your search.' : 'No activity recorded for this category yet.'}
                        </div>
                    </div>
                ) : (
                    <div className="txn-table-wrap">
                        <table className="txn-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Reference</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Method</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((tx, i) => {
                                    const dir = getTxDir(tx);
                                    const label = (tx.action_type || tx.transaction_type || '').replace(/_/g, ' ');
                                    return (
                                        <tr key={i}>
                                            <td>
                                                <div className="txn-date">{new Date(tx.created_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                <div className="txn-time">{new Date(tx.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td>
                                                <div className="txn-ref">{tx.reference_no || '—'}</div>
                                            </td>
                                            <td>
                                                <div className="txn-notes">{tx.notes || tx.description || '—'}</div>
                                            </td>
                                            <td>
                                                <span className="txn-type-badge">{label}</span>
                                            </td>
                                            <td>
                                                <span className={`txn-method-badge method-${(tx.method || 'system').toLowerCase()}`}>
                                                    {tx.method || 'system'}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <span className={`txn-amount ${dir === 'in' ? 'amt-credit' : dir === 'out' ? 'amt-debit' : 'amt-neutral'}`}>
                                                    {dir === 'in' ? '+' : dir === 'out' ? '−' : ''} {kf(Math.abs(tx.amount))}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
