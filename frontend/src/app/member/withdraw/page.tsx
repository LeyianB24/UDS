"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  PiggyBank, 
  Banknote, 
  PieChart, 
  HeartPulse, 
  ArrowLeft, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  ArrowRightLeft,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface WithdrawalSource {
  title: string;
  balance: number;
  min: number;
  note?: string;
  is_exit?: boolean;
}

export default function WithdrawalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const type = searchParams.get('type') || 'wallet';
  const sourcePage = searchParams.get('source') || 'dashboard';

  const [data, setData] = useState<{ source: WithdrawalSource; phone: string; type: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch(`/api/v1/withdraw.php?type=${type}`);
    if (res.status === 'success') {
      setData(res.data);
      setPhone(res.data.phone);
    }
    setLoading(false);
  }, [type]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('phone', phone);
    formData.append('type', type);
    
    const res = await apiFetch('/api/v1/withdraw.php', { 
      method: 'POST', 
      body: formData 
    });

    if (res.status === 'success') {
      setStatus('success');
      setMessage(res.message);
      setTimeout(() => {
        router.push(`/member/${sourcePage}`);
      }, 3000);
    } else {
      setStatus('error');
      setMessage(res.message);
    }
    setProcessing(false);
  };

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <div className="w-12 h-12 border-4 border-[#0b2419] border-t-lime-400 rounded-full animate-spin mb-4" />
       <p className="text-[#0b2419]/40 text-[11px] font-black uppercase tracking-[2px]">Calculating Liquidity...</p>
    </div>
  );

  const source = data!.source;
  const isExit = source.is_exit || type === 'shares';

  const icons: Record<string, any> = {
    wallet: Wallet,
    savings: PiggyBank,
    loans: Banknote,
    shares: PieChart,
    welfare: HeartPulse
  };

  const Icon = icons[type] || Wallet;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 -mt-10">
      
      <div className="w-full max-w-xl">
        <Link href={`/member/${sourcePage}`} className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0b2419] transition-all mb-8">
           <ArrowLeft size={12} /> Back to {sourcePage}
        </Link>

        {/* Brand Header */}
        <div className={cn(
          "bg-[#0b2419] rounded-[40px] overflow-hidden p-10 text-white shadow-2xl relative mb-8",
          isExit ? "bg-red-950" : "bg-[#0b2419]"
        )}>
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_-10%,rgba(168,224,99,0.1)_0%,transparent_55%)]" />
           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", isExit ? "bg-white/10 text-red-400" : "bg-lime-400/10 text-lime-400")}>
                    <Icon size={32} />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black tracking-tight leading-none mb-1">{isExit ? "SACCO Exit" : "Quick Withdrawal"}</h1>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">{source.title}</p>
                 </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center group transition-all hover:bg-white/10">
                 <p className="text-[10px] font-black uppercase tracking-[2px] text-white/30 mb-2">Available Balance</p>
                 <h2 className="text-5xl font-black tracking-tighter">KES {source.balance.toLocaleString()}</h2>
                 {source.note && (
                   <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase">
                      <HelpCircle size={12} /> {source.note}
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-emerald-900/5 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
           {status === 'idle' ? (
             <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Withdrawal Amount (KES)</label>
                   <div className="relative group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300">KES</span>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full h-16 bg-slate-50 border-none rounded-[24px] pl-16 pr-6 text-xl font-black focus:ring-2 focus:ring-[#0b2419]/5 transition-all text-[#0b2419]"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        max={source.balance}
                        min={source.min}
                        required
                      />
                   </div>
                   <div className="flex justify-between px-4 text-[9px] font-black uppercase tracking-widest text-slate-300">
                      <span>Min: KES {source.min}</span>
                      <span>Max: KES {source.balance.toLocaleString()}</span>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">M-Pesa Recipient Number</label>
                   <div className="relative group">
                      <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0b2419] transition-all" size={20} />
                      <input 
                        type="tel" 
                        placeholder="2547..."
                        className="w-full h-16 bg-slate-50 border-none rounded-[24px] pl-16 pr-6 text-sm font-black focus:ring-2 focus:ring-[#0b2419]/5 transition-all text-[#0b2419]"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                      />
                   </div>
                   <p className="px-4 text-[9px] font-black uppercase tracking-widest text-slate-300">Funds will be sent to this number instantly</p>
                </div>

                {isExit && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex gap-4">
                     <AlertCircle className="text-red-500 shrink-0" size={20} />
                     <p className="text-[10px] font-bold text-red-900/60 leading-relaxed uppercase tracking-wider">
                        <strong>EXIT PROTOCOL:</strong> Withdrawing from your Share Capital initiated a Sacco Exit. This requires manual administrative review and will close your active membership.
                     </p>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={processing || !amount}
                  className={cn(
                    "w-full h-16 rounded-[24px] text-[11px] font-black uppercase tracking-[2px] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:grayscale disabled:opacity-50",
                    isExit ? "bg-red-600 text-white shadow-red-900/10 hover:bg-black" : "bg-lime-400 text-[#0b2419] shadow-lime-400/20 hover:bg-white hover:border-2 hover:border-[#0b2419]"
                  )}
                >
                   {processing ? "Securing Funds..." : isExit ? "Confirm SACCO Exit & Refund" : "Withdraw to M-Pesa"} 
                   {isExit ? <TrendingDown size={18} /> : <ArrowRightLeft size={18} />}
                </button>
             </form>
           ) : status === 'success' ? (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                   <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-black text-[#0b2419] mb-4">Transaction Queued</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-10">
                  {message}. Redirecting you to your dashboard in a few seconds...
                </p>
                <Link href={`/member/${sourcePage}`} className="h-12 px-8 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-[#0b2419] transition-all">
                   Go Back Now
                </Link>
             </motion.div>
           ) : (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                   <AlertCircle size={48} />
                </div>
                <h3 className="text-2xl font-black text-red-600 mb-4">Request Failed</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-10">
                  {message}
                </p>
                <button onClick={() => setStatus('idle')} className="h-12 px-8 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                   Try Again
                </button>
             </motion.div>
           )}
        </div>

        {/* Security Footer */}
        <div className="mt-12 flex items-center justify-center gap-8 opacity-30 grayscale">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
               <ShieldCheck size={14} /> PCI Compliant
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
               <Smartphone size={14} /> 2FA Secured
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600">
               <CheckCircle size={14} /> Real-Time Updates
            </div>
        </div>
      </div>

    </div>
  );
}
