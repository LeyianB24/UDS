"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegistrationPayView() {
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFlash(null);
        try {
            const res = await apiFetch('/api/member/mpesa/stk', {
                method: 'POST',
                body: JSON.stringify({ amount: 1000, phone, type: 'registration_fee' })
            });
            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message || 'STK push sent. Approve on your phone to pay KES 1,000 registration fee.' });
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (err: unknown) {
            setFlash({ type: 'err', msg: err instanceof Error ? err.message : 'Failed to initiate payment' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="dash max-w-lg mx-auto py-10">
            <Link href="/member/wallet" className="inline-flex items-center gap-2 text-[#0b2419] font-bold text-sm mb-8 hover:opacity-70 transition-opacity">
                <ArrowLeft size={18} /> Back to Wallet
            </Link>

            <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mb-6">
                    <Receipt size={20} />
                </div>
                <h1 className="text-2xl font-black text-[#0b2419] tracking-tight mb-1">Registration Fee</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">One-time enrollment payment</p>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8">
                    <div className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Amount Due</div>
                    <div className="text-3xl font-black text-amber-900">KES 1,000</div>
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">Mandatory SACCO membership enrollment fee</div>
                </div>

                {flash && (
                    <div className={`flex items-center gap-3 p-4 rounded-2xl mb-6 text-sm font-bold ${flash.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {flash.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {flash.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        {submitting
                            ? <div className="w-5 h-5 border-2 border-[#a3e635] border-t-transparent rounded-full animate-spin" />
                            : <><Receipt size={18} /> Pay KES 1,000 via M-Pesa</>
                        }
                    </button>
                </form>
            </div>
        </div>
    );
}
