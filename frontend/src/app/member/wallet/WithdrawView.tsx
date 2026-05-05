"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WithdrawView() {
    const [balances, setBalances] = useState<{ wallet: number }>({ wallet: 0 });
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    useEffect(() => {
        apiFetch('/api/member/withdraw')
            .then(res => {
                if (res.status === 'success') {
                    setBalances(res.data.balances);
                    setPhone(res.data.phone || '');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFlash(null);
        try {
            const res = await apiFetch('/api/member/withdraw', {
                method: 'POST',
                body: JSON.stringify({ amount: parseFloat(amount), phone, type: 'wallet' })
            });
            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                setAmount('');
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (err: unknown) {
            setFlash({ type: 'err', msg: err instanceof Error ? err.message : 'An error occurred' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635]"></div>
        </div>
    );

    return (
        <div className="dash max-w-lg mx-auto py-10">
            <Link href="/member/wallet" className="inline-flex items-center gap-2 text-[#0b2419] font-bold text-sm mb-8 hover:opacity-70 transition-opacity">
                <ArrowLeft size={18} /> Back to Wallet
            </Link>

            <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                <div className="w-12 h-12 bg-[#0b2419] text-[#a3e635] rounded-2xl flex items-center justify-center mb-6">
                    <Send size={20} />
                </div>
                <h1 className="text-2xl font-black text-[#0b2419] tracking-tight mb-1">Withdraw Funds</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Transfer to M-Pesa</p>

                <div className="bg-[#0b2419]/5 rounded-2xl p-4 mb-8 flex justify-between items-center">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Available Balance</span>
                    <span className="text-lg font-black text-[#0b2419]">KES {balances.wallet?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                {flash && (
                    <div className={`flex items-center gap-3 p-4 rounded-2xl mb-6 text-sm font-bold ${flash.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {flash.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {flash.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Amount (KES)</label>
                        <input
                            type="number"
                            title="Withdrawal amount"
                            aria-label="Withdrawal amount in KES"
                            required
                            min={1}
                            step={0.01}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-5 text-lg font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/50 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">M-Pesa Phone Number</label>
                        <input
                            type="tel"
                            title="M-Pesa phone number"
                            aria-label="M-Pesa phone number"
                            required
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="e.g. 0712345678"
                            className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-5 text-sm font-bold text-[#0b2419] focus:bg-white focus:border-[#a3e635]/50 outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-14 bg-[#0b2419] text-[#a3e635] rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#154330] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {submitting ? <div className="w-5 h-5 border-2 border-[#a3e635] border-t-transparent rounded-full animate-spin" /> : <><Send size={18} /> Initiate Withdrawal</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
