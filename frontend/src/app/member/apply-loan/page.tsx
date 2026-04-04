"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const LOAN_TYPES = {
    emergency: { id: 'emergency', name: 'Emergency Loan', rate: 15, maxMo: 6, icon: 'bi-lightning-charge-fill', desc: 'Fast approval for urgent matters' },
    development: { id: 'development', name: 'Development Loan', rate: 12, maxMo: 36, icon: 'bi-building-fill-up', desc: 'Long-term investment capital' },
    school_fees: { id: 'school_fees', name: 'School Fees Loan', rate: 14, maxMo: 12, icon: 'bi-mortarboard-fill', desc: 'Invest in education seamlessly' },
};

export default function ApplyLoanPage() {
    const [loanType, setLoanType] = useState('emergency');
    const [amount, setAmount] = useState<number>(50000);
    const [duration, setDuration] = useState<number>(6);
    const [purpose, setPurpose] = useState('');
    const [guarantor1, setGuarantor1] = useState('');
    const [guarantor2, setGuarantor2] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const maxLimit = 500000;
    const config = LOAN_TYPES[loanType as keyof typeof LOAN_TYPES];

    useEffect(() => {
        if (duration > config.maxMo) setDuration(config.maxMo);
    }, [loanType, config.maxMo, duration]);

    const interestAmount = (amount * config.rate) / 100;
    const totalRepayment = amount + interestAmount;
    const monthlyRepayment = duration > 0 ? (totalRepayment / duration) : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSuccess(true);
        }, 2000);
    };

    if (success) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pb-5 relative z-10 w-full mb-10 mt-[-20px]">
                <div className="max-w-2xl mx-auto mt-10">
                    <div className="bg-white dark:bg-[#0d1d14] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d0f35d] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                            className="w-24 h-24 bg-gradient-to-br from-[#d0f35d] to-[#84ca12] text-[#0f2e25] rounded-full flex justify-center items-center mx-auto mb-8 shadow-lg shadow-[#d0f35d]/30"
                        >
                            <i className="bi bi-check2 text-5xl font-extrabold"></i>
                        </motion.div>
                        <h2 className="font-extrabold text-3xl mb-4 text-[#0f2e25] dark:text-white relative z-10">Application Submitted!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto text-lg relative z-10">
                            Your <span className="font-bold text-[#0f2e25] dark:text-[#d0f35d]">{config.name}</span> request for KES {amount.toLocaleString()} is now processing. Guarantors will be notified instantly.
                        </p>
                        <Link href="/member/loans" className="relative z-10 inline-flex items-center justify-center bg-[#0f2e25] dark:bg-[#d0f35d] text-white dark:text-[#0f2e25] font-extrabold px-10 py-4 rounded-full hover:scale-105 hover:shadow-xl transition-all">
                            <i className="bi bi-arrow-left mr-3"></i> Return to Loans
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="pb-10 relative z-10 w-full mb-10 mt-[-40px]">
             <div className="bg-[#0f2e25] text-white py-14 px-8 rounded-b-[40px] mb-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(208,243,93,0.15)_0%,transparent_60%)] rounded-full z-0 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_60%)] rounded-full z-0 pointer-events-none"></div>
                <div className="max-w-6xl mx-auto relative z-10 flex gap-6 flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <Link href="/member/loans" className="inline-flex items-center text-[#d0f35d] hover:text-white text-[11px] font-extrabold tracking-widest uppercase mb-4 transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10">
                            <i className="bi bi-arrow-left mr-2"></i> Back to Loans
                        </Link>
                        <h1 className="font-extrabold text-4xl mb-3 tracking-tight">Apply for Financing</h1>
                        <p className="text-lg opacity-80 max-w-xl font-medium line-clamp-2">Leverage your savings to access instant credit. Configure your loan terms below and select your guarantors.</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-right min-w-[240px] shadow-2xl">
                        <div className="text-[10px] uppercase tracking-widest font-extrabold text-[#d0f35d] mb-2 opacity-90"><i className="bi bi-shield-check mr-1"></i> Pre-Approved Limit</div>
                        <div className="text-4xl font-black flex items-center justify-end tracking-tight">
                            <span className="text-lg mr-2 opacity-60 font-bold">KES</span>
                            {maxLimit.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* LEFT COLUMN: FORM */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-8">
                        
                        {/* LOAN TYPE SELECTION */}
                        <div className="bg-white dark:bg-[#0d1d14] p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">1</div>
                                <h3 className="text-xl font-extrabold text-[#0f2e25] dark:text-white">Select Product</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.values(LOAN_TYPES).map(type => {
                                    const isSelected = loanType === type.id;
                                    return (
                                        <div 
                                            key={type.id}
                                            onClick={() => setLoanType(type.id)}
                                            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 relative ${
                                                isSelected 
                                                ? 'border-[#84ca12] bg-[#f9fcef] dark:bg-[#d0f35d]/10' 
                                                : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20'
                                            }`}
                                        >
                                            {isSelected && <div className="absolute top-3 right-3 text-[#84ca12]"><i className="bi bi-check-circle-fill text-xl"></i></div>}
                                            <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center text-xl shadow-inner ${
                                                isSelected ? 'bg-[#84ca12] text-white' : 'bg-white dark:bg-[#0f2e25] text-gray-400'
                                            }`}>
                                                <i className={`bi ${type.icon}`}></i>
                                            </div>
                                            <div className={`font-extrabold mb-1 ${isSelected ? 'text-[#0f2e25] dark:text-[#d0f35d]' : 'text-gray-700 dark:text-gray-300'}`}>{type.name}</div>
                                            <div className="text-[11px] text-gray-500 font-medium leading-relaxed">{type.desc}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CONFIGURATION */}
                        <div className="bg-white dark:bg-[#0d1d14] p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">2</div>
                                <h3 className="text-xl font-extrabold text-[#0f2e25] dark:text-white">Configure Amount</h3>
                            </div>

                            <div className="mb-10">
                                <div className="flex justify-between items-end mb-4">
                                    <label className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">Principal Amount</label>
                                    <div className="text-3xl font-black text-[#0f2e25] dark:text-[#a3e635]">
                                        <span className="text-sm opacity-50 mr-1">KES</span>
                                        {amount.toLocaleString()}
                                    </div>
                                </div>
                                <input 
                                    type="range" 
                                    className="w-full h-3 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#84ca12]"
                                    min="5000" max={maxLimit} step="1000"
                                    value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                                    title="Loan Amount"
                                />
                                <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-3 uppercase tracking-wider">
                                    <span>min: 5,000</span>
                                    <span>max: {maxLimit.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mb-10">
                                <div className="flex justify-between items-end mb-4">
                                    <label className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">Duration (Months)</label>
                                    <div className="text-2xl font-black text-[#0f2e25] dark:text-white">
                                        {duration} <span className="text-sm opacity-50 font-bold">Months</span>
                                    </div>
                                </div>
                                <input 
                                    type="range" 
                                    className="w-full h-3 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#84ca12]"
                                    min="1" max={config.maxMo} step="1"
                                    value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                                    title="Loan Duration"
                                />
                                <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-3 uppercase tracking-wider">
                                    <span>1 month</span>
                                    <span>max: {config.maxMo} months</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-extrabold text-gray-500 uppercase tracking-widest block mb-3">Loan Purpose (Optional)</label>
                                <textarea 
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#d0f35d]/30 focus:border-[#84ca12] outline-none transition-all dark:text-white resize-none"
                                    placeholder="Briefly describe what you'll use this loan for..."
                                    rows={3}
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* GUARANTORS */}
                        <div className="bg-white dark:bg-[#0d1d14] p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">3</div>
                                <h3 className="text-xl font-extrabold text-[#0f2e25] dark:text-white">Guarantors</h3>
                            </div>
                            
                            <div className="bg-[#f0f9ff] dark:bg-[#0e2a3a] border border-[#bae6fd] dark:border-[#1e4e6b] text-[#0369a1] dark:text-[#7dd3fc] p-5 rounded-2xl mb-8 text-sm flex gap-4 items-start">
                                <i className="bi bi-info-circle-fill text-xl mt-0.5"></i>
                                <span className="font-medium leading-relaxed">As per Umoja Sacco policies, loans above your savings balance require two active member guarantors. They will receive automated approval requests.</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-2">First Guarantor</label>
                                    <div className="relative">
                                        <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                        <select 
                                            className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-10 py-3.5 text-sm font-bold focus:ring-4 focus:ring-[#d0f35d]/30 focus:border-[#84ca12] outline-none cursor-pointer dark:text-white"
                                            value={guarantor1} onChange={(e) => setGuarantor1(e.target.value)}
                                            aria-label="Select First Guarantor"
                                            required
                                        >
                                            <option value="" disabled>Search members...</option>
                                            <option value="101">Leyian Ben (UDS-082)</option>
                                            <option value="102">Jane Smith (UDS-002)</option>
                                            <option value="103">Michael Johnson (UDS-003)</option>
                                        </select>
                                        <i className="bi bi-chevron-expand absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest block mb-2">Second Guarantor</label>
                                    <div className="relative">
                                        <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                        <select 
                                            className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-10 py-3.5 text-sm font-bold focus:ring-4 focus:ring-[#d0f35d]/30 focus:border-[#84ca12] outline-none cursor-pointer dark:text-white"
                                            value={guarantor2} onChange={(e) => setGuarantor2(e.target.value)}
                                            aria-label="Select Second Guarantor"
                                            required
                                        >
                                            <option value="" disabled>Search members...</option>
                                            <option value="101">Leyian Ben (UDS-082)</option>
                                            <option value="102">Jane Smith (UDS-002)</option>
                                            <option value="103">Michael Johnson (UDS-003)</option>
                                        </select>
                                        <i className="bi bi-chevron-expand absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: STICKY SUMMARY */}
                    <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
                        <div className="bg-gradient-to-b from-[#0f2e25] to-[#0a1e18] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d0f35d] opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            
                            <h4 className="font-extrabold text-xl mb-6 flex items-center gap-2 relative z-10"><i className="bi bi-receipt text-[#d0f35d]"></i> Loan Summary</h4>
                            
                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium tracking-wide">Principal Amount</span>
                                    <span className="font-bold">KES {amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium tracking-wide">Interest Rate</span>
                                    <span className="font-bold">{config.rate}% flat</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                                    <span className="text-gray-400 font-medium tracking-wide">Interest Value</span>
                                    <span className="font-bold text-[#d0f35d]">KES {interestAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Total Payable</span>
                                    <span className="font-black text-2xl text-white">KES {totalRepayment.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 mt-4">
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-[#d0f35d] tracking-widest mb-1">Monthly Cost</div>
                                        <div className="text-xs text-gray-400">For {duration} months</div>
                                    </div>
                                    <div className="font-black text-xl">KES {monthlyRepayment.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting || amount === 0 || duration === 0 || !guarantor1 || !guarantor2 || guarantor1 === guarantor2}
                                className="w-full relative py-4 px-6 rounded-full font-extrabold text-[#0f2e25] bg-[#d0f35d] hover:bg-[#bceb3b] shadow-[0_0_20px_rgba(208,243,93,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed z-10 overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isSubmitting ? <><i className="bi bi-arrow-repeat animate-spin"></i> Processing...</> : <><i className="bi bi-send-fill"></i> Submit Declaration</>}
                                </span>
                            </button>
                            {guarantor1 && guarantor1 === guarantor2 && (
                                <div className="text-red-400 text-xs font-bold text-center mt-4">Guarantors must be different members</div>
                            )}
                            <div className="text-[10px] text-center text-gray-500 mt-5 font-medium px-4">
                                By submitting, you agree to the Umoja Sacco credit terms and conditions.
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
