"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function ApplyLoanPage() {
    const [loanType, setLoanType] = useState('emergency');
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('');
    const [purpose, setPurpose] = useState('');
    const [guarantor1, setGuarantor1] = useState('');
    const [guarantor2, setGuarantor2] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // MOCK DATA for user's loan limit
    const maxLimit = 150000;
    const interestRate = loanType === 'development' ? 12 : 15;

    const calculateRepayment = () => {
        if (!amount || !duration) return 0;
        const p = parseFloat(amount);
        const r = parseFloat(interestRate.toString()) / 100;
        // Simple Interest logic as per original backend
        const interestAmount = p * r; 
        return p + interestAmount;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (parseFloat(amount) > maxLimit) {
            setError(`Loan limit exceeded. Your maximum limit is KES ${maxLimit.toLocaleString()}`);
            return;
        }

        if (guarantor1 === guarantor2 && guarantor1 !== '') {
            setError('Please select two different guarantors.');
            return;
        }

        setIsSubmitting(true);

        // MOCK Submit
        setTimeout(() => {
            setIsSubmitting(false);
            setSuccess(true);
        }, 1500);
    };

    if (success) {
        return (
            <div className="pb-5 relative z-10 w-full mb-10 mt-[-40px]">
                <div className="max-w-2xl mx-auto mt-10">
                    <div className="bg-white dark:bg-[#0d1d14] rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 p-10 text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex justify-center items-center mx-auto mb-6">
                            <i className="bi bi-check-lg text-4xl"></i>
                        </div>
                        <h2 className="font-bold text-2xl mb-4 text-[#0f2e25] dark:text-white">Application Submitted!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            Your loan application for KES {parseFloat(amount).toLocaleString()} has been received and is now pending guarantor and admin review.
                        </p>
                        <Link href="/member/loans" className="inline-flex items-center justify-center bg-[#d0f35d] text-[#0f2e25] font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
                            <i className="bi bi-arrow-left mr-2"></i> Back to Loans
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-5 relative z-10 w-full mb-10 mt-[-40px]">
             <div className="bg-gradient-to-br from-[#0f2e25] to-[#1a4d3d] text-white py-12 px-4 rounded-b-[30px] mb-8 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(208,243,93,0.1)_0%,transparent_70%)] rounded-full z-0 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto relative z-10 flex gap-4 flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <Link href="/member/loans" className="inline-flex items-center text-[#d0f35d] hover:text-white text-sm font-bold tracking-wide uppercase mb-3 transition-colors">
                            <i className="bi bi-arrow-left mr-2"></i> Back to Loans
                        </Link>
                        <h1 className="font-bold text-3xl mb-2">Apply for a Loan</h1>
                        <p className="text-lg opacity-75 max-w-xl">Complete the application below. Ensure you have the required guarantors for your requested amount.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center min-w-[200px]">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-[#d0f35d] mb-1">Max Borrowing Limit</div>
                        <div className="text-2xl font-extrabold flex items-center justify-center">
                            <span className="text-sm mr-1 opacity-70 font-normal">KES</span>
                            {maxLimit.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex items-start border border-red-100 dark:border-red-900/50">
                        <i className="bi bi-exclamation-triangle-fill mr-3 mt-0.5 text-lg"></i>
                        <p className="mb-0 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0d1d14] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="p-8">
                        <h5 className="font-bold text-[#0f2e25] dark:text-[#a3e635] text-lg mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
                            1. Loan Configuration
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Loan Type</label>
                                <select 
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#d0f35d] focus:border-[#d0f35d] outline-none transition-all dark:text-white"
                                    value={loanType}
                                    onChange={(e) => setLoanType(e.target.value)}
                                    required
                                >
                                    <option value="emergency">Emergency Loan (Max 6 Months, 15% Interest)</option>
                                    <option value="development">Development Loan (Max 36 Months, 12% Interest)</option>
                                    <option value="school_fees">School Fees Loan (Max 12 Months, 14% Interest)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Principal Amount</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm font-bold">KES</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-14 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#d0f35d] focus:border-[#d0f35d] outline-none transition-all dark:text-white placeholder:font-normal placeholder:text-gray-400"
                                        placeholder="Enter amount"
                                        min="500"
                                        max={maxLimit}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1.5 flex justify-between">
                                    <span>Min: KES 500</span>
                                    <span className={parseFloat(amount) > maxLimit ? 'text-red-500 font-bold' : ''}>Available: KES {maxLimit.toLocaleString()}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration (Months)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#d0f35d] focus:border-[#d0f35d] outline-none transition-all dark:text-white"
                                    placeholder="e.g. 6"
                                    min="1"
                                    max="36"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Purpose</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#d0f35d] focus:border-[#d0f35d] outline-none transition-all dark:text-white"
                                    placeholder="Brief note on purpose"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <h5 className="font-bold text-[#0f2e25] dark:text-[#a3e635] text-lg mb-6 border-b border-gray-100 dark:border-white/5 pb-4 mt-8">
                            2. Guarantors
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 bg-[#d0f35d]/10 p-4 rounded-xl border-l-4 border-[#d0f35d]">
                            <i className="bi bi-info-circle mr-2"></i>
                            Select two active Sacco members to guarantee your loan. They will receive a notification to approve your request.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Guarantor 1</label>
                                <select 
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#d0f35d] focus:border-[#d0f35d] outline-none transition-all dark:text-white"
                                    value={guarantor1}
                                    onChange={(e) => setGuarantor1(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Member --</option>
                                    <option value="101">John Doe (UDS-001)</option>
                                    <option value="102">Jane Smith (UDS-002)</option>
                                    <option value="103">Michael Johnson (UDS-003)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Guarantor 2</label>
                                <select 
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#d0f35d] focus:border-[#d0f35d] outline-none transition-all dark:text-white"
                                    value={guarantor2}
                                    onChange={(e) => setGuarantor2(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Member --</option>
                                    <option value="101">John Doe (UDS-001)</option>
                                    <option value="102">Jane Smith (UDS-002)</option>
                                    <option value="103">Michael Johnson (UDS-003)</option>
                                </select>
                            </div>
                        </div>

                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 p-8 border-t border-gray-100 dark:border-white/5">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="w-full md:w-auto text-center md:text-left">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Payable (Principal + Interest)</div>
                                <div className="text-3xl font-extrabold text-[#0f2e25] dark:text-[#a3e635]">
                                    KES {calculateRepayment().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSubmitting || !amount || !duration || !guarantor1 || !guarantor2}
                                className="w-full md:w-auto bg-gradient-to-r from-[#0f2e25] to-[#1a4d3d] dark:from-[#a3e635] dark:to-[#84ca12] text-white dark:text-[#0f2e25] py-4 px-8 rounded-full font-bold shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span><i className="bi bi-arrow-repeat animate-spin mr-2"></i> Submitting...</span>
                                ) : (
                                    <span><i className="bi bi-send-fill mr-2"></i> Submit Application</span>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
