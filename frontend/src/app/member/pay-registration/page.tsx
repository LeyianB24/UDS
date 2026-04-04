"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function PayRegistration() {
    const [paymentMethod, setPaymentMethod] = useState('mpesa');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const amount = 1000;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Mock processing
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-transparent flex items-center justify-center py-10 px-4 mt-[-60px]">
            <div className="w-full max-w-lg">
                <div className="bg-white/90 dark:bg-[#0d1d14]/90 backdrop-blur-md rounded-3xl shadow-[0_20px_60px_rgba(15,46,37,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] dark:border dark:border-white/5 overflow-hidden animate-[slideUp_0.6s_ease-out]">
                    
                    <div className="bg-gradient-to-br from-[#16a34a] to-[#0a2e1f] text-white p-10 text-center relative overflow-hidden">
                        <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] rounded-full animate-[pulse_3s_ease-in-out_infinite]"></div>
                        <div className="absolute bottom-[-24px] left-0 right-0 h-12 bg-white dark:bg-[#0d1d14] rounded-t-[50%]"></div>
                        
                        <div className="relative z-10">
                            <div className="inline-block bg-white/20 text-[#a3e635] px-4 py-2 rounded-full font-bold text-xs tracking-wider uppercase mb-4 animate-[glow_2s_ease-in-out_infinite]">
                                Action Required
                            </div>
                            <h2 className="font-bold text-2xl mb-1">Welcome aboard!</h2>
                            <p className="text-white/70 mb-0 text-sm">Complete your registration to access the vault.</p>
                        </div>
                    </div>
                    
                    <div className="p-8 pt-6">
                        <div className="text-center mb-10">
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Processing Fee</p>
                            <div className="text-[3rem] font-extrabold text-[#16a34a] dark:text-[#a3e635] tracking-tight animate-[countUp_1s_ease-out]">
                                KES {amount.toLocaleString()}
                            </div>
                        </div>

                        {isSuccess ? (
                            <div className="bg-green-50 dark:bg-green-900/20 text-center py-10 rounded-2xl animate-[slideIn_0.5s_ease-out]">
                                <div className="text-6xl text-green-500 mb-4">
                                    <i className="bi bi-check-circle-fill"></i>
                                </div>
                                <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">Access Granted!</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 px-4">Your payment has been verified. Welcome to the Umoja Sacco Digital Platform.</p>
                                <div className="px-6">
                                    <Link href="/member/dashboard" className="block w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full py-3 font-bold shadow-md hover:scale-105 transition-transform">
                                        Enter Dashboard <i className="bi bi-arrow-right ml-2"></i>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Select Payment Method</label>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <label className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center transition-all ${paymentMethod === 'mpesa' ? 'border-[#16a34a] bg-[#16a34a]/5 text-[#16a34a] dark:border-[#a3e635] dark:bg-[#a3e635]/10 dark:text-[#a3e635] scale-105' : 'border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                        <input type="radio" value="mpesa" checked={paymentMethod === 'mpesa'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                                        <i className="bi bi-phone text-3xl mb-2"></i>
                                        <span className="font-bold text-sm">M-Pesa</span>
                                    </label>
                                    
                                    <label className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center transition-all ${paymentMethod === 'cash' ? 'border-[#16a34a] bg-[#16a34a]/5 text-[#16a34a] dark:border-[#a3e635] dark:bg-[#a3e635]/10 dark:text-[#a3e635] scale-105' : 'border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                        <input type="radio" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                                        <i className="bi bi-cash-stack text-3xl mb-2"></i>
                                        <span className="font-bold text-sm">Cash / Office</span>
                                    </label>
                                </div>

                                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl mb-8 flex items-start">
                                    <i className="bi bi-shield-lock-fill text-xl text-gray-400 mr-3 mt-0.5"></i>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        <strong className="text-gray-900 dark:text-gray-200 block mb-1">Secure Transaction</strong>
                                        Your payment is processed securely. For M-Pesa, check your phone for the STK push prompt.
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isProcessing}
                                    className="w-full bg-gradient-to-r from-[#16a34a] to-[#0a2e1f] text-white rounded-full py-4 font-bold shadow-lg hover:-translate-y-1 transition-transform disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {isProcessing ? (
                                        <span><i className="bi bi-arrow-repeat animate-spin inline-block mr-2"></i> Processing...</span>
                                    ) : (
                                        "Process Payment & Unlock"
                                    )}
                                </button>
                                
                                <div className="mt-6 text-center">
                                    <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                        <i className="bi bi-box-arrow-left mr-1"></i> Sign Out
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 0.3; }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 10px rgba(163,230,53,0.3); }
                    50% { box-shadow: 0 0 20px rgba(163,230,53,0.6); }
                }
                @keyframes countUp {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
