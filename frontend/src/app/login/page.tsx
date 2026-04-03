"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Smartphone,
  PieChart,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetchApi('login', 'POST', form);
    
    if (res.status === 'success') {
      // Redirect based on role
      if (res.data.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/member/dashboard');
      }
    } else {
      setError(res.message || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0b2419] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.05),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.05),transparent_40%)]" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative z-10 border border-white/5">
         
         {/* Left Side: Branding & Stats */}
         <div className="hidden lg:flex flex-1 bg-[#0b2419] p-16 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1554469384-e58fac16e23a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center grayscale" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b2419] via-[#0b2419]/90 to-transparent" />
            
            <div className="relative z-10">
               <div className="h-16 w-16 bg-lime-400 rounded-2xl flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(163,230,53,0.3)]">
                  <ShieldCheck size={32} className="text-[#0b2419]" />
               </div>
               <h2 className="text-5xl font-black tracking-tighter text-white mb-6 leading-tight">
                  Secure Access to your <span className="text-lime-400">Financial Future.</span>
               </h2>
               <p className="text-white/40 text-lg font-medium max-w-md leading-relaxed">
                  Join thousands of members growing their wealth through our blockchain-secured cooperative system.
               </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-8 pt-12 border-t border-white/10">
               <div>
                  <h4 className="text-white text-3xl font-black mb-1">12.4k+</h4>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Active Members</p>
               </div>
               <div>
                  <h4 className="text-lime-400 text-3xl font-black mb-1">KES 4.2B</h4>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Growth Assets</p>
               </div>
            </div>
         </div>

         {/* Right Side: Login Form */}
         <div className="flex-1 p-12 md:p-20 bg-white">
            <div className="max-w-md mx-auto">
               <div className="mb-12">
                  <h3 className="text-3xl font-black text-[#0b2419] tracking-tighter mb-2">Welcome Back</h3>
                  <p className="text-slate-400 text-sm font-medium">Please enter your credentials to access your portal.</p>
               </div>

               <form onSubmit={handleLogin} className="space-y-6">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
                    >
                       <AlertCircle size={18} />
                       <span className="text-xs font-black uppercase tracking-widest leading-tight">{error}</span>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">Identification</label>
                        <div className="relative group">
                           <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                           <input 
                             type="text" 
                             title="Username / Email"
                             placeholder="e.g. member001 or admin" 
                             className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                             value={form.username}
                             onChange={e => setForm({...form, username: e.target.value})}
                             required
                           />
                        </div>
                     </div>

                     <div>
                        <div className="flex items-center justify-between mb-3 px-2">
                           <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Passphrase</label>
                           <Link href="/forgot-password" title="Recover Password" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-[#0b2419]">Forgot Password?</Link>
                        </div>
                        <div className="relative group">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                           <input 
                             type="password" 
                             title="Account Password"
                             placeholder="••••••••••••" 
                             className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                             value={form.password}
                             onChange={e => setForm({...form, password: e.target.value})}
                             required
                           />
                        </div>
                     </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-14 bg-[#0b2419] text-white rounded-2xl text-[11px] font-black uppercase tracking-[3px] flex items-center justify-center gap-3 hover:shadow-[0_20px_40px_rgba(11,36,25,0.2)] transition-all active:scale-95 disabled:opacity-50"
                  >
                     {loading ? 'Authenticating...' : (
                       <>Secure Entry <ArrowRight size={18} className="text-lime-400" /></>
                     )}
                  </button>

                  <div className="pt-8 flex items-center justify-center gap-2">
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-center">Don&apos;t have an account?</p>
                     <Link href="/register" title="Apply for Membership" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-[#0b2419]">Join the Sacco</Link>
                  </div>
               </form>

               {/* Security Badges */}
               <div className="mt-16 grid grid-cols-3 gap-4 border-t border-slate-50 pt-10">
                  <div className="flex flex-col items-center text-center gap-2 grayscale brightness-150">
                     <PieChart size={18} className="text-slate-400" />
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Growth</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2 grayscale brightness-150">
                     <Target size={18} className="text-slate-400" />
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Focused</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2 grayscale brightness-150">
                     <Smartphone size={18} className="text-slate-400" />
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mobile</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
