"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import './withdraw.css';

export default function WithdrawPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('wallet');
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    const loadBalances = useCallback(async () => {
        try {
            const res = await apiFetch('/api/member/withdraw');
            if (res.status === 'success') {
                setData(res.data);
                setPhone(res.data.phone);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBalances();
    }, [loadBalances]);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFlash(null);

        try {
            const res = await apiFetch('/api/member/withdraw', {
                method: 'POST',
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    phone,
                    type: selectedType
                })
            });

            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                setAmount('');
                loadBalances();
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !data) return <div className="p-10 text-center">Loading balances...</div>;

    const sources = [
        { id: 'wallet', title: 'Wallet Balance', desc: 'Liquid funds available for transfer', icon: 'wallet2' },
        { id: 'savings', title: 'Savings Account', desc: 'Earned interest (Min. bal KES 500)', icon: 'piggy-bank' },
        { id: 'loans', title: 'Appoved Loan Funds', desc: 'Disbursed funds ready for payout', icon: 'cash-stack' },
        { id: 'shares', title: 'Share Capital', desc: 'SACCO Exit Request (Admin review)', icon: 'pie-chart' },
        { id: 'welfare', title: 'Welfare Benefit', desc: 'Approved welfare claims', icon: 'heart-pulse' }
    ];

    const currentBal = data.balances[selectedType] || 0;
    const maxWithdraw = selectedType === 'savings' ? Math.max(0, currentBal - 500) : currentBal;

    return (
        <div className="dash">
            {/* HERO */}
            <div className="withdraw-hero">
                <div className="hero-mesh"></div>
                <div className="flex align-items-center justify-between gap-3 flex-wrap">
                    <div>
                        <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Financial Portal</div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Withdraw Funds</h1>
                        <p className="text-white/40 text-sm mt-1">Select your source and transfer to M-Pesa immediately.</p>
                    </div>
                    <Link href="/member/dashboard" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold transition-all no-underline text-white">
                        <i className="bi bi-arrow-left mr-2"></i> Dashboard
                    </Link>
                </div>
            </div>

            {/* MESSAGE */}
            {flash && (
                <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${flash.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <i className={`bi bi-${flash.type === 'ok' ? 'check-circle-fill' : 'exclamation-triangle-fill'} text-xl`}></i>
                    <div className="text-sm font-bold">{flash.msg}</div>
                    <button className="ml-auto text-xl leading-none" onClick={() => setFlash(null)}>&times;</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Source Explorer */}
                <div className="lg:col-span-5 space-y-3">
                    <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-2 mb-2">Select Source Account</div>
                    {sources.map(src => (
                        <div key={src.id} className={`source-card ${selectedType === src.id ? 'active' : ''}`} onClick={() => setSelectedType(src.id)}>
                            <div className="sc-ico"><i className={`bi bi-${src.icon}`}></i></div>
                            <div className="sc-info">
                                <div className="sc-title">{src.title}</div>
                                <div className="text-[10px] text-gray-400 font-bold mb-1">{src.desc}</div>
                                <div className="sc-bal">KES {data.balances[src.id]?.toLocaleString() || '0.00'}</div>
                            </div>
                            {selectedType === src.id && <i className="bi bi-check-circle-fill text-lime text-xl"></i>}
                        </div>
                    ))}
                </div>

                {/* Right: Withdrawal Form */}
                <div className="lg:col-span-7">
                    <div className="withdraw-form">
                        <form onSubmit={handleWithdraw}>
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Amount to Withdraw</label>
                                    <span className="text-[10px] font-bold text-fs">Available: KES {maxWithdraw.toLocaleString()}</span>
                                </div>
                                <div className="input-group-lg">
                                    <span className="currency">KES</span>
                                    <input 
                                        type="number" className="amount-input" placeholder="0.00" 
                                        value={amount} onChange={e => setAmount(e.target.value)}
                                        max={maxWithdraw} step="0.01" required
                                    />
                                </div>
                                <div className="mt-2 flex justify-between">
                                    <button type="button" className="text-[10px] font-bold text-gray-400 hover:text-fs" onClick={() => setAmount((maxWithdraw/4).toString())}>25%</button>
                                    <button type="button" className="text-[10px] font-bold text-gray-400 hover:text-fs" onClick={() => setAmount((maxWithdraw/2).toString())}>50%</button>
                                    <button type="button" className="text-[10px] font-bold text-gray-400 hover:text-fs" onClick={() => setAmount((maxWithdraw*0.75).toString())}>75%</button>
                                    <button type="button" className="text-[10px] font-bold text-fs hover:underline" onClick={() => setAmount(maxWithdraw.toString())}>MAX</button>
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">M-Pesa Phone Number</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 px-4 py-3 bg-bg border border-bdr rounded-xl font-bold text-t1 flex items-center gap-3">
                                        <i className="bi bi-phone text-fs"></i>
                                        <input 
                                            type="tel" className="bg-transparent border-none outline-none w-full" 
                                            value={phone} onChange={e => setPhone(e.target.value)} required
                                        />
                                    </div>
                                    <div className="p-3 bg-fs/5 text-fs rounded-xl flex items-center">
                                        <i className="bi bi-shield-check-fill text-xl"></i>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold mt-2 italic px-1">Funds will be disbursed to this number immediately upon confirmation.</p>
                            </div>

                            {selectedType === 'shares' && (
                                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                                    <i className="bi bi-exclamation-triangle-fill text-red-600 text-xl"></i>
                                    <div>
                                        <div className="text-red-700 font-extrabold text-sm mb-1 uppercase tracking-tight">Warning: SACCO Exit</div>
                                        <div className="text-red-600/70 text-xs font-bold leading-relaxed">
                                            Withdrawing shares implies your intention to exit the SACCO. This request requires manual approval & legal clearance from the administration.
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className={`btn-withdraw ${selectedType === 'shares' ? 'bg-red-600 text-white hover:bg-red-700' : 'lime'}`} disabled={submitting}>
                                {submitting ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></span> : (
                                    <>
                                        <i className={`bi bi-${selectedType === 'shares' ? 'door-open-fill' : 'cash-coin'}`}></i>
                                        {selectedType === 'shares' ? 'Confirm Exit & Request Refund' : 'Withdraw to M-Pesa'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 flex items-center justify-between px-4">
                        <Link href="/member/transactions" className="text-[10px] font-bold text-fs no-underline hover:underline flex items-center gap-2">
                            <i className="bi bi-arrow-left-right"></i> View Transaction History
                        </Link>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest"><i className="bi bi-lock-fill mr-1"></i> AES-256 Encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
