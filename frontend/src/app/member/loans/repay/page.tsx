"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

function RepayContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const loanId = searchParams.get('loan_id');
    const [loan, setLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    const loadLoanDetails = useCallback(async () => {
        if (!loanId) {
            router.push('/member/loans');
            return;
        }
        try {
            const res = await apiFetch(`/api/member/loans/repay?loan_id=${loanId}`);
            if (res.status === 'success') {
                setLoan(res.data);
                setPhone(res.data.phone);
                setAmount(res.data.current_balance || res.data.total_payable);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [loanId, router]);

    useEffect(() => {
        loadLoanDetails();
    }, [loadLoanDetails]);

    const handleRepay = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFlash(null);

        try {
            const res = await apiFetch('/api/member/loans/repay', {
                method: 'POST',
                body: JSON.stringify({
                    loan_id: loanId,
                    amount: parseFloat(amount),
                    phone
                })
            });

            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                // We could wait for polling here, but for parity with PHP we just show msg
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !loan) return <div className="p-10 text-center">Loading loan details...</div>;

    const balance = parseFloat(loan.current_balance || loan.total_payable);

    return (
        <div className="dash">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Left: Summary Card */}
                <div className="w-full lg:w-1/2 space-y-6">
                    <div className="p-8 rounded-3xl bg-[#0b2419] text-white shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-left-4">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <i className="bi bi-wallet2 text-[120px]"></i>
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-[10px] font-bold text-lime uppercase tracking-widest mb-1">Active Loan #{loan.loan_id}</div>
                                    <h2 className="text-2xl font-black">{loan.loan_type} Loan</h2>
                                </div>
                                <span className="bg-lime/20 text-lime px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-lime/30">DISBURSED</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-white/10 pb-3">
                                    <span className="text-sm font-medium text-white/50">Principal Amount</span>
                                    <span className="font-bold">KES {parseFloat(loan.amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-3">
                                    <span className="text-sm font-medium text-white/50">Interest Rate</span>
                                    <span className="font-bold text-lime">{loan.interest_rate}%</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-sm font-black text-lime uppercase tracking-tighter self-center">Outstanding Balance</span>
                                    <span className="text-3xl font-black">KES {balance.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/member/loans" className="flex-1 p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-3 no-underline group shadow-sm hover:shadow-md transition-all">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-fs group-hover:bg-lime/10 transition-colors">
                                <i className="bi bi-arrow-left"></i>
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Back</div>
                                <div className="text-sm font-extrabold text-t1">Loan List</div>
                            </div>
                        </Link>
                        <div className="flex-1 p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-3 shadow-sm">
                            <div className="w-10 h-10 bg-fs/5 rounded-xl flex items-center justify-center text-fs">
                                <i className="bi bi-calendar-event"></i>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next Due</div>
                                <div className="text-sm font-extrabold text-t1">{loan.next_repayment_date ? new Date(loan.next_repayment_date).toLocaleDateString() : '—'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Payment Card */}
                <div className="w-full lg:w-1/2">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 mb-8">
                            <img src="/assets/images/mpesa_logo.png" alt="M-Pesa" className="h-10 w-auto" />
                            <h3 className="text-xl font-black text-fs tracking-tight">Make Repayment</h3>
                        </div>

                        {flash && (
                            <div className={`mb-8 p-4 rounded-xl flex items-start gap-3 ${flash.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <i className={`bi bi-${flash.type === 'ok' ? 'check-circle-fill' : 'exclamation-triangle-fill'} text-xl`}></i>
                                <div className="text-sm font-bold">{flash.msg}</div>
                            </div>
                        )}

                        <form onSubmit={handleRepay} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">M-Pesa Number</label>
                                <div className="px-5 py-4 bg-bg border border-bdr rounded-2xl flex items-center gap-4 transition-all focus-within:border-fs focus-within:bg-white focus-within:shadow-md">
                                    <i className="bi bi-phone text-t3 text-xl"></i>
                                    <input 
                                        type="tel" className="bg-transparent border-none outline-none font-black text-t1 w-full" 
                                        placeholder="07XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} required
                                    />
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 mt-2 italic px-1">Ensure this is the M-Pesa line currently in your phone.</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Repayment Amount (KES)</label>
                                <div className="px-5 py-4 bg-bg border border-bdr rounded-2xl flex items-center gap-4 transition-all focus-within:border-fs focus-within:bg-white focus-within:shadow-md">
                                    <span className="font-black text-fs">KES</span>
                                    <input 
                                        type="number" className="bg-transparent border-none outline-none font-black text-t1 w-full text-2xl" 
                                        placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required
                                        max={balance} min="10"
                                    />
                                </div>
                                <div className="flex justify-between mt-2 px-1">
                                    <span className="text-[10px] font-bold text-gray-400">Min: KES 10.00</span>
                                    <button type="button" className="text-[10px] font-black text-fs hover:underline" onClick={() => setAmount(balance.toString())}>PAY FULL BALANCE</button>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-[#39B54A] hover:bg-[#1d7c2a] text-white rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-[#39B54A]/30 flex items-center justify-center gap-3 disabled:opacity-50" disabled={submitting}>
                                {submitting ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span> : (
                                    <>
                                        <i className="bi bi-send-check-fill"></i>
                                        <span>SEND STK PUSH</span>
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                                <i className="bi bi-shield-check-fill text-fs/40 mr-1"></i> Secure End-to-End Encryption
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RepayLoanPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading page...</div>}>
            <RepayContent />
        </Suspense>
    );
}
