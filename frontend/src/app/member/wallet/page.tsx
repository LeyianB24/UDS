"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import './wallet.css';

import WithdrawView from './WithdrawView';
import DepositView from './DepositView';
import RegistrationPayView from './RegistrationPayView';

interface WalletData {
    balance: number;
    stats: {
        total_dividends: number;
        total_payouts: number;
        total_withdrawn: number;
    };
    history: {
        created_at: string;
        transaction_type: string;
        amount: number;
        notes: string;
        status: string;
        reference_no: string;
    }[];
}

function WalletContent() {
    const searchParams = useSearchParams();
    const action = searchParams.get('action');

    const [data, setData] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/member/wallet');
            if (res.status === 'success') {
                setData(res.data);
            } else {
                throw new Error(res.message);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!action) loadData();
    }, [loadData, action]);

    if (action === 'withdraw') return <WithdrawView />;
    if (action === 'deposit') return <DepositView />;
    if (action === 'pay-registration') return <RegistrationPayView />;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635]"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="dash py-12 text-center text-red-500">
                <i className="bi bi-exclamation-triangle text-5xl mb-4"></i>
                <h2 className="text-xl font-bold">Failed to load wallet</h2>
                <p>{error || 'An unknown error occurred'}</p>
                <button onClick={loadData} className="mt-4 px-6 py-2 bg-[#a3e635] text-[#0b2419] rounded-full font-bold">Try Again</button>
            </div>
        );
    }

    return (
        <div className="dash">
            {/* HERO */}
            <div className="hero">
                <div className="hero-mesh"></div>
                <div className="hero-inner">
                    <div className="hero-eyebrow">Digital Wallet</div>
                    <h1>Sacco Earnings Wallet</h1>
                    <p className="hero-sub">Manage your dividends, payouts, and available spending balance.</p>
                    <div className="hero-val">
                        <span className="cur">KES</span>
                        {data.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="mt-6 flex gap-3">
                        <Link href="/member/withdraw?source=wallet" className="btn-lime">
                            <i className="bi bi-send-fill mr-2"></i> Withdraw Funds
                        </Link>
                        <Link href="/member/transactions" className="btn-ghost">
                            <i className="bi bi-clock-history mr-2"></i> Full History
                        </Link>
                    </div>
                </div>
            </div>

            {/* STATS FLOAT */}
            <div className="stats-float">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="sc">
                        <div className="sc-ico text-green-600 bg-green-50">
                            <i className="bi bi-stars"></i>
                        </div>
                        <div className="sc-lbl">Total Dividends</div>
                        <div className="sc-val text-gray-900">KES {Number(data.stats.total_dividends).toLocaleString()}</div>
                    </div>
                    <div className="sc">
                        <div className="sc-ico text-blue-600 bg-blue-50">
                            <i className="bi bi-wallet2"></i>
                        </div>
                        <div className="sc-lbl">Direct Payouts</div>
                        <div className="sc-val text-gray-900">KES {Number(data.stats.total_payouts).toLocaleString()}</div>
                    </div>
                    <div className="sc">
                        <div className="sc-ico text-red-600 bg-red-50">
                            <i className="bi bi-arrow-up-right-circle"></i>
                        </div>
                        <div className="sc-lbl">Total Withdrawn</div>
                        <div className="sc-val text-gray-900">KES {Number(data.stats.total_withdrawn).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body">
                <div className="txn-card shadow-sm">
                    <div className="txn-head">
                        <h2 className="txn-title">Wallet Activity</h2>
                        <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            {data.history.length} Records
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="lt text-left">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Reference</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.history.length > 0 ? data.history.map((txn, idx) => {
                                    const isIn = ['dividend_payment', 'payout', 'deposit'].includes(txn.transaction_type);
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="text-gray-900 font-semibold">{new Date(txn.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                                                    {txn.transaction_type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="text-gray-600 text-sm">{txn.notes}</td>
                                            <td className="font-mono text-[10px] text-gray-400">{txn.reference_no}</td>
                                            <td className={`text-right ${isIn ? 'amt-in' : 'amt-out'}`}>
                                                {isIn ? '+' : '-'} {Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-gray-400">
                                            <i className="bi bi-inbox text-5xl mb-4 block"></i>
                                            No activity records found in your wallet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function WalletPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635]"></div></div>}>
            <WalletContent />
        </Suspense>
    );
}
