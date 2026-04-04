"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function MpesaCheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [amount, setAmount] = useState(searchParams.get('amount') || '');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState(searchParams.get('type') || 'savings');
    const [loanId, setLoanId] = useState(searchParams.get('loan_id') || '');
    const [caseId, setCaseId] = useState(searchParams.get('case_id') || '');

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('processing');

        try {
            const res = await apiFetch('/api/member/mpesa/stk', {
                method: 'POST',
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    phone,
                    contribution_type: type,
                    loan_id: loanId ? parseInt(loanId) : null,
                    case_id: caseId ? parseInt(caseId) : null
                })
            });

            if (res.status === 'success') {
                setStatus('success');
                setMessage(res.message);
                setTimeout(() => router.push('/member/dashboard'), 3000);
            } else {
                setStatus('error');
                setMessage(res.message);
            }
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dash py-12">
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-[#39B54A]/10 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#39B54A] to-[#2d8d3a] p-12 text-center text-white relative">
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <h1 className="text-5xl font-black tracking-tighter mb-1 select-none">M-PESA</h1>
                        <p className="text-[10px] font-black uppercase tracking-[4px] opacity-60">Secure Checkout Portal</p>
                    </div>

                    <div className="p-10 md:p-14 -mt-10 relative">
                        <div className="flex justify-center mb-10">
                            <div className="w-20 h-20 bg-white border-[6px] border-[#f0f7f4] rounded-3xl shadow-xl flex items-center justify-center text-[#39B54A] transform transition-transform hover:rotate-6">
                                <i className="bi bi-shield-lock-fill text-4xl"></i>
                            </div>
                        </div>

                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#39B54A]/10 text-[#39B54A] rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                <div className="w-2 h-2 rounded-full bg-[#39B54A] animate-pulse" />
                                Encrypted STK Transaction
                            </div>
                            <h2 className="text-2xl font-black text-[#0b2419] tracking-tight">Financial Deposit</h2>
                            <p className="text-gray-400 text-sm font-semibold mt-2">Enter your details to initiate an STK push.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            <div className="bg-bg border border-bdr rounded-[2rem] p-8 text-center transition-all focus-within:ring-4 focus-within:ring-[#39B54A]/10 focus-within:bg-white">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Amount to Deposit (KES)</label>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-2xl font-black text-[#39B54A]">KES</span>
                                    <input 
                                        type="number" min="10"
                                        className="bg-transparent border-none outline-none text-5xl font-black text-[#0b2419] w-full text-center placeholder:text-gray-100"
                                        placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required
                                    />
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="relative">
                                    <i className="bi bi-phone text-xl text-gray-300 absolute left-6 top-1/2 -translate-y-1/2"></i>
                                    <input 
                                        type="tel" placeholder="M-Pesa Phone (e.g. 0712...)"
                                        className="w-full pl-16 pr-8 py-5 bg-bg border border-bdr rounded-2xl font-black text-[#0b2419] focus:bg-white focus:border-[#39B54A] focus:shadow-md transition-all outline-none"
                                        value={phone} onChange={e => setPhone(e.target.value)} required
                                    />
                                </div>

                                <div className="relative">
                                    <i className="bi bi-tag text-xl text-gray-300 absolute left-6 top-1/2 -translate-y-1/2"></i>
                                    <select 
                                        className="w-full pl-16 pr-8 py-5 bg-bg border border-bdr rounded-2xl font-black text-[#0b2419] focus:bg-white focus:border-[#39B54A] focus:shadow-md transition-all outline-none appearance-none"
                                        value={type} onChange={e => setType(e.target.value)} required
                                    >
                                        <option value="savings">Savings Portfolio</option>
                                        <option value="shares">Ownership Shares</option>
                                        <option value="welfare">Community Welfare</option>
                                        <option value="loan_repayment">Loan Repayment</option>
                                    </select>
                                </div>

                                {type === 'loan_repayment' && (
                                    <div className="relative animate-in slide-in-from-top-2">
                                        <i className="bi bi-bank2 text-xl text-gray-300 absolute left-6 top-1/2 -translate-y-1/2"></i>
                                        <input 
                                            type="text" placeholder="Loan ID (Required for Repayment)"
                                            className="w-full pl-16 pr-8 py-5 bg-bg border border-bdr rounded-2xl font-black text-[#0b2419] focus:bg-white focus:border-[#39B54A] focus:shadow-md transition-all outline-none"
                                            value={loanId} onChange={e => setLoanId(e.target.value)} required
                                        />
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" disabled={loading}
                                className="w-full py-5 bg-[#39B54A] hover:bg-[#2d8d3a] text-white rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-[#39B54A]/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span> : (
                                    <>
                                        <i className="bi bi-send-check-fill"></i>
                                        <span>INITIATE STK PUSH</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 text-center pt-8 border-t border-gray-100">
                            <Link href="/member/dashboard" className="text-[10px] font-black text-gray-400 no-underline hover:text-[#0b2419] transition-all uppercase tracking-widest inline-flex items-center gap-2">
                                <i className="bi bi-arrow-left"></i> Back to Dashboard
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

            {/* Status Overlay */}
            {status !== 'idle' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-f/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="max-w-sm w-full text-center p-12">
                        {status === 'processing' && (
                            <div className="space-y-8">
                                <div className="relative w-28 h-28 mx-auto">
                                    <div className="absolute inset-0 border-8 border-white/5 rounded-full"></div>
                                    <div className="absolute inset-0 border-8 border-[#39B54A] border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-6 bg-[#39B54A]/10 rounded-full flex items-center justify-center text-[#39B54A]">
                                        <i className="bi bi-phone-vibrate-fill text-3xl animate-bounce"></i>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tighter mb-4">Confirm on Phone</h3>
                                    <p className="text-white/50 font-bold text-sm leading-relaxed">A secure request has been sent to your M-Pesa. Enter PIN to authorize KES {amount}.</p>
                                </div>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="space-y-8 animate-in zoom-in-90">
                                <div className="w-28 h-28 mx-auto bg-[#39B54A] rounded-full flex items-center justify-center text-white shadow-2xl shadow-[#39B54A]/50">
                                    <i className="bi bi-check-circle-fill text-6xl"></i>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tighter mb-4">Request Sent!</h3>
                                    <p className="text-white/50 font-bold text-sm">{message}</p>
                                </div>
                                <Link href="/member/dashboard" className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl no-underline font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                                    Continue <i className="bi bi-arrow-right"></i>
                                </Link>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-8 animate-in zoom-in-90">
                                <div className="w-28 h-28 mx-auto bg-red-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-500/50">
                                    <i className="bi bi-x-circle-fill text-6xl"></i>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tighter mb-4">Push Failed</h3>
                                    <p className="text-white/50 font-bold text-sm">{message}</p>
                                </div>
                                <button onClick={() => setStatus('idle')} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
