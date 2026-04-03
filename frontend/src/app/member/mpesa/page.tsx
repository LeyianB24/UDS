"use client";

import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Smartphone, 
  ShieldCheck, 
  ArrowLeft, 
  Zap, 
  Wallet, 
  TrendingUp, 
  Heart, 
  Landmark, 
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';

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

  useEffect(() => {
    // Pre-fill phone from profile if possible (could add an API call here)
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('processing');
    
    const res = await apiFetch('/api/v1/mpesa_stk.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      // Optional: Wait and redirect
      setTimeout(() => {
        router.push('/member/dashboard');
      }, 3000);
    } else {
      setStatus('error');
      setMessage(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 -mt-10">
      
      <div className="w-full max-w-lg relative">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[#39B54A]/5 rounded-[48px] blur-3xl -z-10" />
        
        <div className="bg-white border border-emerald-900/5 rounded-[40px] overflow-hidden shadow-[0_30px_80px_rgba(57,181,74,0.12)]">
          
          {/* M-PESA Header */}
          <div className="bg-gradient-to-br from-[#39B54A] to-[#2d8d3a] p-10 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-12 -mb-12 blur-xl" />
             
             <h1 className="text-4xl font-black text-white tracking-tighter mb-1">M-PESA</h1>
             <p className="text-[10px] font-black text-white/50 uppercase tracking-[3px]">Secure Checkout</p>
          </div>

          <div className="p-8 md:p-12 relative">
             <div className="flex justify-center -mt-16 mb-8">
                <div className="w-16 h-16 bg-white border-4 border-[#f0f7f4] rounded-2xl shadow-xl flex items-center justify-center text-[#39B54A]">
                   <ShieldCheck size={32} />
                </div>
             </div>

             <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#39B54A]/10 text-[#39B54A] rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#39B54A] animate-pulse" />
                   E2E Encrypted Transaction
                </div>
                <h2 className="text-xl font-black text-[#0b2419]">Secure Payment</h2>
                <p className="text-slate-400 text-xs font-medium mt-1">Complete your transaction via STK Push</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Amount Field */}
                <div className="bg-slate-50 border border-emerald-900/5 rounded-3xl p-6 text-center focus-within:ring-2 focus-within:ring-[#39B54A]/20 transition-all">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amount to Deposit (KES)</label>
                   <input 
                     type="number" 
                     className="w-full bg-transparent border-none text-4xl font-black text-[#0b2419] text-center focus:ring-0 placeholder:text-slate-200"
                     placeholder="0.00"
                     value={amount}
                     onChange={e => setAmount(e.target.value)}
                     required
                   />
                </div>

                <div className="space-y-4">
                   <div className="relative group">
                      <PhoneCall className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#39B54A] transition-colors" size={18} />
                      <input 
                        type="tel" 
                        placeholder="M-Pesa Number (e.g. 0712...)"
                        className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-14 pr-6 text-sm font-black focus:ring-2 focus:ring-[#39B54A]/20 transition-all"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                      />
                   </div>

                   <div className="relative group">
                      <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#39B54A] transition-colors" size={18} />
                      <select 
                        className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-14 pr-6 text-sm font-black focus:ring-2 focus:ring-[#39B54A]/20 transition-all appearance-none"
                        value={type}
                        onChange={e => setType(e.target.value)}
                        required
                      >
                         <option value="savings">Savings Deposit</option>
                         <option value="shares">Buy Shares</option>
                         <option value="welfare">General Welfare</option>
                         <option value="loan_repayment">Loan Repayment</option>
                      </select>
                   </div>

                   {type === 'loan_repayment' && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative group overflow-hidden">
                        <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#39B54A] transition-colors" size={18} />
                        <input 
                          type="number" 
                          placeholder="Loan Reference ID"
                          className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-14 pr-6 text-sm font-black focus:ring-2 focus:ring-[#39B54A]/20 transition-all"
                          value={loanId}
                          onChange={e => setLoanId(e.target.value)}
                          required
                        />
                     </motion.div>
                   )}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full h-16 bg-[#39B54A] text-white rounded-2xl text-[11px] font-black uppercase tracking-[2px] shadow-xl shadow-[#39B54A]/20 transition-all flex items-center justify-center gap-3",
                    loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1d7c2a] hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                   {loading ? "Waking Toolkit..." : "Initiate Payment"} <Smartphone size={18} />
                </button>
             </form>

             <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                <Link href="/member/dashboard" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0b2419] transition-colors flex items-center justify-center gap-2">
                   <ArrowLeft size={12} /> Return to Dashboard
                </Link>
             </div>
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {status !== 'idle' && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0b2419]/95 backdrop-blur-md"
           >
              <div className="w-full max-w-sm text-center">
                 {status === 'processing' && (
                   <div className="space-y-8">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-[#39B54A]/10 rounded-full" />
                        <div className="absolute inset-0 border-4 border-[#39B54A] border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-4 bg-[#39B54A]/20 rounded-full flex items-center justify-center text-[#39B54A]">
                           <Smartphone size={32} />
                        </div>
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white mb-2">Check Your Phone</h3>
                         <p className="text-white/40 text-xs font-medium leading-relaxed">
                           A secure pop-up has been sent to <strong>{phone}</strong>. Enter your M-Pesa pin to complete the KES {amount} deposit.
                         </p>
                      </div>
                   </div>
                 )}

                 {status === 'success' && (
                   <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-8">
                      <div className="w-24 h-24 mx-auto bg-[#39B54A] rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(57,181,74,0.5)]">
                         <CheckCircle2 size={48} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white mb-2">Request Successful</h3>
                         <p className="text-white/40 text-xs font-medium leading-relaxed">{message}</p>
                      </div>
                      <button onClick={() => router.push('/member/dashboard')} className="h-12 px-8 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20">
                         Proceed to Dashboard
                      </button>
                   </motion.div>
                 )}

                 {status === 'error' && (
                   <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-8">
                      <div className="w-24 h-24 mx-auto bg-red-500 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                         <AlertCircle size={48} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white mb-2">Push Failed</h3>
                         <p className="text-white/40 text-xs font-medium leading-relaxed">{message}</p>
                      </div>
                      <button onClick={() => setStatus('idle')} className="h-12 px-8 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20">
                         Try Again
                      </button>
                   </motion.div>
                 )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
