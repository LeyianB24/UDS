"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function RepayLoanPage() {
    const [phone, setPhone] = useState('0712345678');
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // MOCK DATA for user's active loan
    const loan = {
        loan_id: 849,
        loan_type: "emergency",
        interest_rate: 12,
        principal: 50000,
        balance: 24500.50
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // MOCK Process
        setTimeout(() => {
            setIsProcessing(false);
            alert('M-Pesa STK Push Sent successfully to ' + phone);
        }, 3000);
    };

    return (
        <div className="pb-5 relative z-10 w-full mb-10 mt-[-40px]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#0f2e25] to-[#1a4d3d] text-white py-12 px-4 rounded-b-[30px] mb-8 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(208,243,93,0.1)_0%,transparent_70%)] rounded-full z-0 pointer-events-none"></div>
                <div className="max-w-5xl mx-auto relative z-10">
                    <Link href="/member/loans" className="inline-flex items-center text-[#d0f35d] hover:text-white text-sm font-bold tracking-wide uppercase mb-3 transition-colors">
                        <i className="bi bi-arrow-left mr-2"></i> Back to Loans
                    </Link>
                    <h1 className="font-bold text-3xl mb-2">Loan Repayment</h1>
                    <p className="text-lg opacity-75 max-w-xl">Make a quick payment towards your active loan via M-Pesa STK push.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Loan Summary Card */}
                    <div className="w-full lg:w-[40%]">
                        <div className="bg-white/80 dark:bg-[#0d1d14]/80 backdrop-blur-md rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] h-full flex flex-col justify-center">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <i className="bi bi-file-earmark-text text-3xl text-gray-500 dark:text-gray-400"></i>
                                </div>
                                <h5 className="font-bold text-gray-900 dark:text-white text-xl mb-2">Loan Details</h5>
                                <span className="inline-flex bg-amber-100/50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/50 py-1.5 px-4 rounded-full text-xs font-bold tracking-wider">
                                    ID: #{loan.loan_id}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">Loan Type</span>
                                    <span className="font-bold uppercase text-gray-900 dark:text-white text-sm">{loan.loan_type}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">Interest Rate</span>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{loan.interest_rate}%</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">Principal Amount</span>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm">KES {loan.principal.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col pt-6 pb-2 border-0">
                                    <span className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">Outstanding Balance</span>
                                    <span className="text-3xl font-extrabold text-red-500 dark:text-red-400">KES {loan.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="w-full lg:w-[60%]">
                        <div className="bg-white/90 dark:bg-gradient-to-b dark:from-[#112419] dark:to-[#0d1d14] rounded-3xl p-8 md:p-10 border border-gray-100 dark:border-white/5 shadow-lg">
                            
                            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-white/5 pb-6">
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-md">
                                    <i className="bi bi-phone-fill text-2xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-xl">Make Repayment</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-0">Enter amount below to initiate M-Pesa push.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                        M-Pesa Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <i className="bi bi-telephone text-gray-400"></i>
                                        </div>
                                        <input 
                                            type="tel" 
                                            className="w-full bg-gray-50 dark:bg-[#0a150f] border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] outline-none transition-all"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="07XXXXXXXX"
                                            pattern="^0[0-9]{9}$"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                        Amount to Pay
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-[#16a34a] dark:text-[#a3e635] font-bold">KES</span>
                                        </div>
                                        <input 
                                            type="number" 
                                            className="w-full bg-gray-50 dark:bg-[#0a150f] border border-gray-200 dark:border-white/10 rounded-xl pl-16 pr-4 py-4 text-xl font-extrabold text-[#16a34a] dark:text-[#a3e635] focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            min="10"
                                            max={loan.balance}
                                            required
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between">
                                        <span>Min: KES 10</span>
                                        <span className="font-medium cursor-pointer text-[#16a34a] dark:text-[#a3e635]" onClick={() => setAmount(loan.balance.toString())}>
                                            Pay Full: KES {loan.balance.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        type="submit" 
                                        disabled={isProcessing || !amount}
                                        className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl py-4 font-bold shadow-[0_8px_20px_rgba(22,163,74,0.3)] hover:-translate-y-1 transition-transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none"
                                    >
                                        {isProcessing ? (
                                            <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing STK...</>
                                        ) : (
                                            <><i className="bi bi-send-check-fill text-lg"></i> Send STK Push</>
                                        )}
                                    </button>
                                    
                                    <Link href="/member/loans" className="w-full text-center text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-3 transition-colors">
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
