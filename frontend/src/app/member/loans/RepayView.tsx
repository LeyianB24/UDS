"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Wallet2, Send, Phone, CreditCard, Calendar, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

interface RepayViewProps {
    loanId: string | null;
    onBack: () => void;
}

export default function RepayView({ loanId, onBack }: RepayViewProps) {
    const [loan, setLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    const loadLoanDetails = useCallback(async () => {
        if (!loanId) {
            onBack();
            return;
        }
        try {
            const res = await apiFetch(`/api/member/loans/repay?loan_id=${loanId}`);
            if (res.status === 'success') {
                setLoan(res.data);
                setPhone(res.data.phone || '');
                const bal = parseFloat(res.data.current_balance || res.data.total_payable || "0");
                setAmount(bal.toString());
            }
        } catch (e) {
            console.error('Failed to load loan details:', e);
        } finally {
            setLoading(false);
        }
    }, [loanId, onBack]);

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
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !loan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-[#0b2419]/10 border-t-[#a3e635] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Securely loading loan briefcase...</p>
            </div>
        );
    }

    const balance = parseFloat(loan.current_balance || loan.total_payable || "0");

    return (
        <div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="relative overflow-hidden bg-[#0b2419] rounded-b-[48px] pt-12 pb-24 px-6 md:px-12 text-white -mt-6">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Wallet2 size={320} className="md:translate-x-32 md:-translate-y-32" />
                </div>
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <button onClick={onBack} className="group inline-flex items-center gap-2 text-[#a3e635] text-[10px] font-black uppercase tracking-[0.2em] mb-8 hover:text-white transition-all">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                               <span className="px-3 py-1 bg-[#a3e635]/10 border border-[#a3e635]/20 rounded-full text-[9px] font-black text-[#a3e635] uppercase tracking-widest">Loan ID #{loan.loan_id}</span>
                               <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Secure Repayment Channel
                               </span>
                           </div>
                           <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Finalize your<br />Repayment</h1>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] font-black text-[#a3e635]/50 uppercase tracking-[0.3em] mb-2">Outstanding Balance</div>
                           <div className="text-4xl md:text-6xl font-black tracking-tighter">
                               <span className="text-xl md:text-2xl text-[#a3e635] mr-2 font-bold uppercase">KES</span>
                               {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[40px] p-8 shadow-[0_32px_64px_-16px_rgba(11,36,25,0.08)]">
                            <h3 className="text-xs font-black text-[#0b2419] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <CreditCard size={14} className="text-[#a3e635]" /> Loan Integrity
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Loan Product</span>
                                    <span className="text-sm font-black text-[#0b2419] uppercase tracking-tight">{loan.loan_type}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Interest Rate</span>
                                    <span className="text-sm font-black text-[#a3e635] uppercase tracking-tight">{loan.interest_rate}% Annually</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Original Principal</span>
                                    <span className="text-sm font-black text-[#0b2419] tracking-tight">KES {parseFloat(loan.amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-300" />
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Next Due Date</span>
                                    </div>
                                    <span className="text-sm font-black text-red-500 uppercase tracking-tight">
                                        {loan.next_repayment_date ? new Date(loan.next_repayment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-[#0b2419] rounded-3xl relative overflow-hidden group hover:shadow-xl transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ShieldCheck size={80} />
                                </div>
                                <p className="text-[10px] font-bold text-[#a3e635]/70 leading-relaxed relative z-10">
                                    Repaying your loan on time improves your credit score and increases your future borrowing limit by up to 25%.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[40px] p-8 md:p-12 shadow-[0_32px_96px_-24px_rgba(11,36,25,0.12)]">
                            
                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                                <div className="w-16 h-16 bg-[#39B54A] rounded-2xl flex items-center justify-center text-white shadow-[0_12px_24px_-4px_rgba(57,181,74,0.3)]">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#0b2419] tracking-tighter">M-Pesa Direct Link</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automatic STK-Push Integration</p>
                                </div>
                            </div>

                            {flash && (
                                <div className={cn(
                                    "mb-8 p-5 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-2 duration-300",
                                    flash.type === 'ok' ? "bg-emerald-50 border border-emerald-100 text-emerald-800" : "bg-red-50 border border-red-100 text-red-800"
                                )}>
                                    {flash.type === 'ok' ? <CheckCircle2 size={24} className="text-emerald-500 shrink-0" /> : <AlertCircle size={24} className="text-red-500 shrink-0" />}
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-tight">{flash.type === 'ok' ? 'Action Successful' : 'Repayment Failed'}</h4>
                                        <p className="text-xs font-bold opacity-70 mt-0.5">{flash.msg}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleRepay} className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">Verification Number</label>
                                    <div className="relative group">
                                        <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#39B54A] transition-colors" />
                                        <input 
                                            type="tel" 
                                            className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-3xl pl-16 pr-6 text-sm font-black text-[#0b2419] focus:bg-white focus:ring-8 focus:ring-[#39B54A]/5 focus:border-[#39B54A]/30 transition-all outline-none"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="07XXXXXXXX"
                                            required
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-300 mt-2 italic px-1">Linked to your member profile primary contact.</p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Repayment Contribution</label>
                                        <button 
                                            type="button" 
                                            className="text-[10px] font-black text-[#39B54A] hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest"
                                            onClick={() => setAmount(balance.toString())}
                                        >
                                            Settle Balance
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-xl text-slate-300 group-focus-within:text-[#39B54A] transition-colors">KES</span>
                                        <input 
                                            type="number" 
                                            className="w-full h-20 bg-slate-50/50 border border-slate-100 rounded-3xl pl-20 pr-6 text-3xl font-black text-[#0b2419] focus:bg-white focus:ring-8 focus:ring-[#39B54A]/5 focus:border-[#39B54A]/30 transition-all outline-none tracking-tighter"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            max={balance}
                                            min="10"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={submitting || !amount}
                                    className="w-full h-20 bg-[#0b2419] text-[#a3e635] rounded-[28px] font-black text-lg uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:shadow-[0_20px_40px_-8px_rgba(11,36,25,0.3)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                                >
                                    {submitting ? (
                                        <span className="w-6 h-6 border-4 border-[#a3e635]/20 border-t-[#a3e635] rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <Send size={24} />
                                            <span>Authorize Push</span>
                                        </>
                                    )}
                                </button>
                                
                                <div className="text-center">
                                   <button type="button" onClick={onBack} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0b2419] transition-colors">
                                      Cancel and Audit Balance
                                   </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
