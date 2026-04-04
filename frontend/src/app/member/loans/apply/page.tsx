"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function ApplyLoanPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        loan_type: 'Personal',
        amount: '',
        duration_months: '12',
        notes: '',
        guarantor_1: '',
        guarantor_2: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    const loadData = useCallback(async () => {
        try {
            const res = await apiFetch('/api/member/loans/apply');
            if (res.status === 'success') {
                setData(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFlash(null);

        try {
            const res = await apiFetch('/api/member/loans/apply', {
                method: 'POST',
                body: JSON.stringify({ ...form, amount: parseFloat(form.amount) })
            });

            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                setTimeout(() => router.push('/member/loans'), 2000);
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !data) return <div className="p-10 text-center">Loading application form...</div>;

    const { eligibility, balances, guarantors, settings } = data;
    const maxLimit = balances.savings * settings.max_multiplier;
    const amount = parseFloat(form.amount) || 0;
    const interest = amount * (settings.interest_rate / 100);
    const total = amount + interest;
    const monthly = total / parseInt(form.duration_months);

    const isEligible = eligibility.active && eligibility.kyc && eligibility.regFee && eligibility.noActiveLoan;

    return (
        <div className="dash">
            <div className="flex items-center justify-between gap-3 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-t1 tracking-tight">Apply for Loan</h1>
                    <p className="text-sm font-semibold text-gray-400">Complete the form below to request a new loan.</p>
                </div>
                <Link href="/member/loans" className="px-6 py-2.5 bg-white border border-gray-100 rounded-full text-sm font-black transition-all no-underline text-t2 hover:shadow-md">
                    <i className="bi bi-arrow-left mr-2"></i> Back
                </Link>
            </div>

            {flash && (
                <div className={`mb-8 p-4 rounded-2xl flex items-start gap-4 ${flash.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} border border-current/10 animate-in fade-in slide-in-from-top-2`}>
                    <i className={`bi bi-${flash.type === 'ok' ? 'check-circle-fill' : 'exclamation-triangle-fill'} text-xl`}></i>
                    <div className="text-sm font-bold">{flash.msg}</div>
                </div>
            )}

            {!isEligible && (
                <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3 mb-4 text-red-700">
                        <i className="bi bi-shield-lock-fill text-2xl"></i>
                        <h3 className="text-lg font-black tracking-tight">Ineligibility Notice</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Active Membership', ok: eligibility.active, msg: 'Account restricted' },
                            { label: 'KYC Verified', ok: eligibility.kyc, msg: 'Documents needed' },
                            { label: 'Reg. Fee Paid', ok: eligibility.regFee, msg: 'KES 1,000 outstanding' },
                            { label: 'No Active Loan', ok: eligibility.noActiveLoan, msg: 'Already have a loan' }
                        ].map((req, i) => (
                            <div key={i} className={`p-4 rounded-2xl border transition-all ${req.ok ? 'bg-white border-green-200 text-green-600' : 'bg-white/50 border-red-200 text-red-600'}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{req.label}</span>
                                    <i className={`bi bi-${req.ok ? 'check-circle-fill' : 'x-circle-fill'}`}></i>
                                </div>
                                <div className="text-xs font-bold">{req.ok ? 'Verified' : req.msg}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Col */}
                <form onSubmit={handleSubmit} className={`lg:col-span-8 space-y-8 ${!isEligible ? 'opacity-50 pointer-events-none' : ''}`}>
                    
                    {/* Section: Basic Details */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-fs/5 text-fs rounded-xl flex items-center justify-center font-black">1</div>
                            <h3 className="text-xl font-black text-t1 tracking-tight">Loan Configuration</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Loan Category</label>
                                <select 
                                    className="w-full px-5 py-4 bg-bg border border-bdr rounded-2xl font-black text-t1 focus:bg-white focus:border-fs focus:shadow-md transition-all outline-none"
                                    value={form.loan_type} onChange={e => setForm({...form, loan_type: e.target.value})}
                                >
                                    <option value="Personal">Personal Loan</option>
                                    <option value="Emergency">Emergency Loan</option>
                                    <option value="Welfare">Welfare Loan</option>
                                    <option value="Investment">Investment Loan</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Requested Amount (KES)</label>
                                <div className="px-5 py-4 bg-bg border border-bdr rounded-2xl flex items-center gap-4 focus-within:bg-white focus-within:border-fs focus-within:shadow-md transition-all">
                                    <span className="font-black text-fs">KES</span>
                                    <input 
                                        type="number" className="bg-transparent border-none outline-none font-black text-t1 w-full text-xl"
                                        placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                                        required min="500" max={maxLimit}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 px-1">
                                    <span className="text-[10px] font-bold text-gray-400">Max Limit: KES {maxLimit.toLocaleString()} (3x Savings)</span>
                                    <button type="button" className="text-[10px] font-black text-fs hover:underline" onClick={() => setForm({...form, amount: maxLimit.toString()})}>APPLY MAX</button>
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Repayment Period (Months)</label>
                                <input 
                                    type="range" min="1" max="24" step="1" className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-fs mb-2"
                                    value={form.duration_months} onChange={e => setForm({...form, duration_months: e.target.value})}
                                />
                                <div className="flex justify-between font-black text-fs text-sm italic">
                                    <span>1 Month</span>
                                    <span>{form.duration_months} Months</span>
                                    <span>24 Months</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Guarantors */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-fs/5 text-fs rounded-xl flex items-center justify-center font-black">2</div>
                            <h3 className="text-xl font-black text-t1 tracking-tight">Security & Guarantors</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Primary Guarantor</label>
                                <select 
                                    className="w-full px-5 py-4 bg-bg border border-bdr rounded-2xl font-black text-t1 focus:bg-white focus:border-fs focus:shadow-md transition-all outline-none"
                                    value={form.guarantor_1} onChange={e => setForm({...form, guarantor_1: e.target.value})} required
                                >
                                    <option value="">-- Select Member --</option>
                                    {guarantors.map((g: any) => (
                                        <option key={g.member_id} value={g.member_id}>{g.full_name} ({g.member_reg_no})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Secondary Guarantor</label>
                                <select 
                                    className="w-full px-5 py-4 bg-bg border border-bdr rounded-2xl font-black text-t1 focus:bg-white focus:border-fs focus:shadow-md transition-all outline-none"
                                    value={form.guarantor_2} onChange={e => setForm({...form, guarantor_2: e.target.value})} required
                                >
                                    <option value="">-- Select Member --</option>
                                    {guarantors.map((g: any) => (
                                        <option key={g.member_id} value={g.member_id}>{g.full_name} ({g.member_reg_no})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-full">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Loan Purpose / Notes (Optional)</label>
                                <textarea 
                                    className="w-full px-5 py-4 bg-bg border border-bdr rounded-2xl font-bold text-t1 focus:bg-white focus:border-fs focus:shadow-md transition-all outline-none min-h-[100px]"
                                    placeholder="Briefly state why you need this loan..."
                                    value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-5 bg-lime hover:bg-lime/90 text-f rounded-3xl font-black text-lg transition-all shadow-xl hover:shadow-lime/30 flex items-center justify-center gap-3 disabled:opacity-50" disabled={submitting}>
                        {submitting ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-f"></span> : (
                            <>
                                <i className="bi bi-send-check-fill"></i>
                                <span>SUBMIT LOAN APPLICATION</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Calculation Summary Col */}
                <div className="lg:col-span-4 sticky top-8 space-y-6">
                    <div className="bg-[#0b2419] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                            <i className="bi bi-calculator text-9xl"></i>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black text-lime uppercase tracking-widest mb-6">Financial Preview</h4>
                            
                            <div className="space-y-6">
                                <div className="border-b border-white/10 pb-4">
                                    <div className="text-[10px] font-bold text-white/40 uppercase mb-1">Total Loan Principal</div>
                                    <div className="text-2xl font-black">KES {amount.toLocaleString()}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-white/40 uppercase mb-1">Interest ({settings.interest_rate}%)</div>
                                        <div className="text-sm font-black text-lime">+ KES {interest.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-white/40 uppercase mb-1">Total Repayable</div>
                                        <div className="text-sm font-black">KES {total.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-white/40 uppercase mb-1">Est. Monthly Installment</div>
                                    <div className="text-3xl font-black text-lime">KES {monthly.toLocaleString()}</div>
                                    <div className="text-[10px] font-bold text-white/20 mt-1 uppercase italic tracking-tighter">* Calculated over {form.duration_months} months</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm text-center">
                        <i className="bi bi-patch-check-fill text-fs text-3xl mb-3"></i>
                        <h5 className="font-black text-t1 mb-2">Smart Validation</h5>
                        <p className="text-xs font-semibold text-gray-400 leading-relaxed">
                            Your savings of <span className="text-fs font-black">KES {balances.savings.toLocaleString()}</span> allows you a borrowing capacity of <span className="text-fs font-black">KES {maxLimit.toLocaleString()}</span>. 
                            Ensure your guarantors are also active members.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
