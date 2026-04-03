"use client";

import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  Smartphone, 
  Target,
  ChevronRight,
  Globe,
  Lock,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('auth_status')
      .then(res => {
        if (res.authenticated) {
          if (res.portal === 'admin') router.push('/admin/dashboard');
          else router.push('/member/dashboard');
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0b2419] flex flex-col items-center justify-center p-6">
       <div className="w-12 h-12 border-4 border-white/20 border-t-lime-400 rounded-full animate-spin mb-4" />
       <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Initializing Sacco Engine...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b2419] text-white selection:bg-lime-400 selection:text-[#0b2419] overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="h-24 px-8 md:px-16 flex items-center justify-between relative z-20">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-400 rounded-xl flex items-center justify-center text-[#0b2419]">
               <ShieldCheck size={24} />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase tracking-[1px]">Sacco Central</span>
         </div>
         <div className="flex items-center gap-8">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest hover:text-lime-400 transition-colors">Sign In</Link>
            <Link href="/register" className="h-12 px-8 bg-white text-[#0b2419] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-lime-400 transition-all flex items-center gap-2">
               Open Account <ArrowRight size={14} />
            </Link>
         </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-8 md:px-16 overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.1),transparent_50%)]" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.1),transparent_50%)]" />
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8 text-center md:text-left relative z-10">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[3px]">
                  <Globe size={12} className="text-lime-400" /> Financial Intelligence Platform
               </motion.div>
               
               <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] max-w-2xl">
                  Banking for the <span className="text-lime-400">Bold.</span>
               </motion.h1>

               <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/40 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                  Join a cooperative built on trust, transparency, and technology. Empowering your financial future through inclusive credit and shared growth.
               </motion.p>

               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center gap-4">
                  <Link href="/register" className="h-16 px-12 bg-lime-400 text-[#0b2419] rounded-[24px] text-[12px] font-black uppercase tracking-[3px] flex items-center gap-3 hover:shadow-[0_20px_40px_rgba(163,230,53,0.3)] hover:scale-[1.02] transition-all">
                     Start Saving Today
                  </Link>
                  <Link href="/login" className="h-16 px-12 bg-white/5 border border-white/10 text-white rounded-[24px] text-[12px] font-black uppercase tracking-[3px] flex items-center gap-3 hover:bg-white/10 transition-all">
                     Portal Access <ChevronRight size={18} />
                  </Link>
               </motion.div>
            </div>

            <div className="flex-1 relative">
               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full aspect-square bg-[#0b2419] rounded-[80px] border border-white/10 p-12 overflow-hidden shadow-2xl flex flex-col justify-between">
                  <div className="absolute inset-0 bg-gradient-to-br from-lime-400/20 via-transparent to-emerald-950/20" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                     <Lock className="text-lime-400" size={32} />
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Current Dividend</p>
                        <p className="text-3xl font-black tracking-tighter">12.4% <span className="text-xs text-lime-400 font-bold uppercase tracking-widest">Growth</span></p>
                     </div>
                  </div>

                  <div className="relative z-10">
                     <p className="text-[12px] font-black uppercase tracking-[4px] text-white/40 mb-2">Portfolio Analytics</p>
                     <div className="grid grid-cols-3 gap-2">
                        {[40, 70, 50, 90, 60, 80].map((h, i) => (
                           <div key={i} className="h-20 bg-white/5 rounded-lg flex flex-col justify-end overflow-hidden p-1">
                              <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 1 }} className="w-full bg-lime-400/20 rounded-md border-t-2 border-lime-400" />
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-4 pt-8 border-t border-white/5">
                     <div className="flex -space-x-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0b2419] overflow-hidden bg-slate-800">
                             <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                          </div>
                        ))}
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[2px] text-white/30">Trusted by <span className="text-white">12,000+</span> Members</p>
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* Trust Blocks */}
      <section className="py-20 px-8 md:px-16 bg-white/5 border-y border-white/5">
         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div>
               <Users className="text-lime-400 mx-auto mb-6" size={32} />
               <h4 className="text-[11px] font-black uppercase tracking-[2px] mb-2">Member Owned</h4>
               <p className="text-white/40 text-xs font-medium">Democratically controlled financial inclusion.</p>
            </div>
            <div>
               <ShieldCheck className="text-emerald-400 mx-auto mb-6" size={32} />
               <h4 className="text-[11px] font-black uppercase tracking-[2px] mb-2">KDIC Assured</h4>
               <p className="text-white/40 text-xs font-medium">Your deposits are secured and prioritized.</p>
            </div>
            <div>
               <Smartphone className="text-lime-400 mx-auto mb-6" size={32} />
               <h4 className="text-[11px] font-black uppercase tracking-[2px] mb-2">Mobile Enabled</h4>
               <p className="text-white/40 text-xs font-medium">M-Pesa integration for instant liquidity.</p>
            </div>
            <div>
               <Target className="text-emerald-400 mx-auto mb-6" size={32} />
               <h4 className="text-[11px] font-black uppercase tracking-[2px] mb-2">Growth Centric</h4>
               <p className="text-white/40 text-xs font-medium">Maximum dividends on your share capital.</p>
            </div>
         </div>
      </section>

      {/* Redirect Footer CTA */}
      <section className="py-32 px-8 overflow-hidden relative">
         <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Ready to take <br /> <span className="text-lime-400">Total Control?</span></h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto font-medium tracking-tight italic">
               "Joining was the best financial decision I made in 2024. The mobile portal is seamless."
            </p>
            <div className="flex items-center justify-center gap-6">
               <Link href="/login" className="text-[11px] font-black uppercase tracking-[4px] hover:text-lime-400 transition-colors">Go to Portal Access</Link>
               <div className="w-1 h-1 bg-white/20 rounded-full" />
               <Link href="/register" className="text-[11px] font-black uppercase tracking-[4px] hover:text-lime-400 transition-colors">Join Community</Link>
            </div>
         </div>
      </section>

    </div>
  );
}
