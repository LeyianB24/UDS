"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  TrendingUp,
  Clock,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchApi('login', 'POST', { email, password });
      if (res.status === 'success') {
        if (res.data.portal === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/member/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-slate-950 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* ─── Left Panel: Hero ─── */}
      <div className="hidden md:flex flex-1 relative bg-[#0b1e16] p-12 lg:p-16 flex-col justify-between overflow-hidden">
        
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl opacity-30 shadow-[0_0_100px_rgba(16,185,129,0.2)]"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-lime-600/10 rounded-full blur-3xl opacity-20 shadow-[0_0_100px_rgba(163,230,53,0.1)]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-emerald-950/40 to-slate-950 opacity-90"></div>
        </div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl p-2.5">
             <img src="/logo.png" alt="USMS" className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-lg leading-tight tracking-tight">USMS SACCO</h1>
            <p className="text-emerald-500/50 text-[10px] font-bold uppercase tracking-[2px]">Unified Management System</p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-md">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6"
          >
             <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
             <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Enterprise Access</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white text-5xl lg:text-6xl font-black leading-[1.05] tracking-tighter mb-6"
          >
            Manage Sacco <br />
            with <span className="text-emerald-400">absolute</span> <br />
            precision.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm lg:text-base leading-relaxed font-medium mb-10"
          >
            A unified platform for members and managers tracking loans, savings, 
            and communication in real time. Experience financial clarity.
          </motion.p>

          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[100px] backdrop-blur-sm">
                <p className="text-emerald-400 font-black text-xl mb-1">100%</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Secure</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[100px] backdrop-blur-sm">
                <p className="text-emerald-400 font-black text-xl mb-1">Real-Time</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Audit</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-slate-600 text-[11px] font-bold tracking-widest uppercase opacity-40">
           &copy; 2026 Umoja Drivers Sacco. Financial Precision Assured.
        </div>
      </div>

      {/* ─── Right Panel: Form ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f8fafc] text-slate-900 border-l-4 border-emerald-600 shadow-[-10px_0_40px_rgba(0,0,0,0.1)] relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-20 pointer-events-none"></div>
        <div className="w-full max-w-sm relative z-10">
          
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-3xl font-black text-emerald-950 tracking-tight mb-2">Welcome Back.</h3>
            <p className="text-slate-500 font-medium text-sm">Sign in to your dashboard to manage your accounts.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold shadow-sm"
              >
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 leading-none">Email or Identifier</label>
              <div className={cn(
                "group flex items-center bg-white border-2 border-slate-200 rounded-2xl transition-all duration-300 px-1 focus-within:border-emerald-500 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)]",
                isLoading && "opacity-60 pointer-events-none"
              )}>
                <div className="p-3.5 bg-slate-50 rounded-xl border-r-2 border-slate-200 text-slate-300 group-focus-within:text-emerald-500 group-focus-within:bg-emerald-50">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                  placeholder="name@email.com or Member ID"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 leading-none">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">Password</label>
                 <a href="#" className="text-[10px] font-bold text-emerald-950 uppercase hover:underline">Forgot?</a>
              </div>
              <div className={cn(
                "group flex items-center bg-white border-2 border-slate-200 rounded-2xl transition-all duration-300 px-1 focus-within:border-emerald-500 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)]",
                isLoading && "opacity-60 pointer-events-none"
              )}>
                <div className="p-3.5 bg-slate-50 rounded-xl border-r-2 border-slate-200 text-slate-300 group-focus-within:text-emerald-500 group-focus-within:bg-emerald-50">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-3 text-slate-300 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={cn(
                "w-full bg-emerald-950 hover:bg-emerald-900 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_8px_25px_rgba(15,23,42,0.3)] flex items-center justify-center gap-3 active:scale-[0.98]",
                isLoading && "opacity-70 cursor-not-allowed transform-none"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span className="uppercase tracking-widest text-xs">Authenticating...</span>
                </>
              ) : (
                <>
                  <span className="uppercase tracking-widest text-xs">Access Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-400">
              Don't have an account yet? <br className="md:hidden" />
              <a href="#" className="text-emerald-950 hover:underline inline-block mt-1 md:mt-0 md:ml-1">Apply for Membership</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
