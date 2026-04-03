"use client";

import React from 'react';
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
  Users,
  Wallet2,
  Building2,
  ArrowUpRight,
  PiggyBank,
  HeartPulse,
  BookOpen,
  Fuel,
  Flower2,
  Bus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/LandingNavbar';
import { PokerSlideshow } from '@/components/PokerSlideshow';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7FBF9] text-[#0F392B] selection:bg-lime-400 selection:text-[#0F392B] overflow-x-hidden font-sans">
      
      <LandingNavbar />

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-32 px-6 md:px-12 lg:px-24 overflow-hidden">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
           <img 
             src="/assets/images/hero-bg.jpg" 
             alt="Sacco Hero" 
             className="w-full h-full object-cover" 
             onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'}
           />
           <div className="absolute inset-0 bg-gradient-to-tr from-[#0b1e17]/95 via-[#0F392B]/85 to-[#0a1812]/95" />
        </div>

        {/* Dynamic Glows */}
        <div className="absolute -top-[120px] -right-[80px] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-[100px] -left-[60px] w-[360px] h-[360px] bg-lime-400/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Text Content */}
            <div className="flex-1 space-y-8 text-center lg:text-left">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 className="inline-flex items-center gap-2 px-4 py-1.5 bg-lime-400/10 border border-lime-400/20 rounded-full text-[10px] font-black uppercase tracking-[3px] text-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.1)]"
               >
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
                  Est. Umoja Drivers Sacco Ltd.
               </motion.div>
               
               <motion.h1 
                 {...fadeInUp}
                 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] text-white"
               >
                  Financial <br /> Freedom <br />
                  <span className="text-lime-400">Starts Here.</span>
               </motion.h1>

               <motion.p 
                 {...fadeInUp}
                 transition={{ delay: 0.1 }}
                 className="text-white/60 text-lg md:text-xl font-medium max-w-xl leading-relaxed"
               >
                  Umoja Sacco is the financial backbone for the transport community — owning <span className="text-white font-bold">fleets, real estate, and agribusiness</span> and delivering generational wealth to every member.
               </motion.p>

               <motion.div 
                 {...fadeInUp}
                 transition={{ delay: 0.2 }}
                 className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
               >
                  <Link href="/login" title="Member Login" className="h-16 px-12 bg-lime-400 text-[#0F392B] rounded-2xl text-[12px] font-black uppercase tracking-[3px] flex items-center gap-3 hover:shadow-[0_20px_40px_rgba(163,230,53,0.3)] hover:scale-[1.02] transition-all">
                     Member Login
                  </Link>
                  <Link href="/register" title="Join Today" className="h-16 px-12 bg-transparent border border-white/20 text-white rounded-2xl text-[12px] font-black uppercase tracking-[3px] flex items-center gap-3 hover:bg-white/5 transition-all">
                     Join Today
                  </Link>
               </motion.div>

               {/* Trust Statistics */}
               <motion.div 
                 {...fadeInUp}
                 transition={{ delay: 0.3 }}
                 className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-8"
               >
                  {[
                    { val: '12%', lbl: 'Avg. Dividend' },
                    { val: '48hr', lbl: 'Loan Approval' },
                    { val: '100%', lbl: 'Secure' },
                    { val: 'Ksh 500M', lbl: 'Asset Target' }
                  ].map((stat, i) => (
                    <React.Fragment key={i}>
                      <div className="text-center md:text-left">
                        <div className="text-2xl font-black text-lime-400 tracking-tighter">{stat.val}</div>
                        <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{stat.lbl}</div>
                      </div>
                      {i < 3 && <div className="hidden md:block w-px h-8 bg-white/10" />}
                    </React.Fragment>
                  ))}
               </motion.div>
            </div>

            {/* Slideshow Column */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
               <PokerSlideshow />
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS RIBBON ─── */}
      <div className="bg-gradient-to-r from-[#0F392B] to-[#1a5c43] py-12 border-y border-white/5">
        <div className="container mx-auto px-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { val: '12%', lbl: 'Avg. Dividend Rate' },
                { val: 'Ksh 500M', lbl: 'Asset Base Goal' },
                { val: '48 hrs', lbl: 'Loan Processing' },
                { val: '24/7', lbl: 'Member Access' }
              ].map((stat, i) => (
                <div key={i} className="text-center border-r border-white/10 last:border-0">
                   <div className="text-3xl font-black text-lime-400 tracking-tighter mb-1">{stat.val}</div>
                   <div className="text-[10px] font-bold text-white/40 uppercase tracking-[2px]">{stat.lbl}</div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* ─── BLUEPRINT SECTION ─── */}
      <section id="wealth-model" className="py-32 bg-white">
        <div className="container mx-auto px-6">
           <motion.div 
             {...fadeInUp}
             className="text-center mb-20 space-y-4"
           >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0F392B]/5 border border-[#0F392B]/10 rounded-full text-[10px] font-black uppercase tracking-[3px] text-[#0F392B]">
                 <div className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse" />
                 The Umoja Blueprint
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-[#0F392B]">How Your Money Grows With Us</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">A proven four-step investment cycle that turns monthly contributions into lasting wealth.</p>
           </motion.div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { n: 1, icon: Wallet2, title: 'Mobilization', desc: 'Members contribute monthly deposits and share capital, forming a strong fund base.' },
                { n: 2, icon: Building2, title: 'Investment', desc: 'Funds are invested in high-yield assets: fleets, real estate, and agribusiness.' },
                { n: 3, icon: ArrowUpRight, title: 'Returns', desc: 'Assets generate revenue daily through fares, rent, farm income, and loan interest.' },
                { n: 4, icon: PieChart, title: 'Dividends', desc: 'Profits are returned to members yearly as dividends and interest on savings.', featured: true }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  {...fadeInUp}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "relative p-10 bg-white border border-[#E8F0ED] rounded-[32px] transition-all group overflow-hidden",
                    step.featured ? "border-amber-400 bg-amber-50 shadow-[0_20px_40px_rgba(245,200,66,0.1)]" : "hover:border-lime-400 hover:shadow-2xl hover:-translate-y-2"
                  )}
                >
                   <div className="w-10 h-10 bg-[#0F392B] rounded-xl flex items-center justify-center text-lime-400 font-black mb-6 shadow-xl">
                      {step.n}
                   </div>
                   <step.icon size={48} className="text-[#0F392B] mb-6 group-hover:scale-110 transition-transform" />
                   <h5 className="text-lg font-black tracking-tight mb-3 text-[#0F392B]">{step.title}</h5>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* ─── SERVICES SECTION ─── */}
      <section id="services" className="py-32 bg-[#F7FBF9]">
        <div className="container mx-auto px-6">
           <motion.div {...fadeInUp} className="text-center mb-20 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-lime-400/20 border border-lime-400/30 rounded-full text-[10px] font-black uppercase tracking-[3px] text-emerald-800">
                 Core Services
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-[#0F392B]">Financial Products Built for Members</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">Tailored savings, credit, and welfare products designed around the transport community.</p>
           </motion.div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {[
                { icon: PiggyBank, title: 'Voluntary Savings', desc: 'Save regularly to build your financial foundation and earn competitive interest on every deposit.' },
                { icon: Target, title: 'Affordable Credit', desc: 'Get loans at extremely friendly member rates for business growth or personal emergencies.' },
                { icon: Wallet2, title: 'Share Capital', desc: 'Become a co-owner with full voting rights and receive annual dividends from profits.' },
                { icon: HeartPulse, title: 'Welfare & Benevolence', desc: 'Structured financial support for members and their families during difficult times.' },
                { icon: BookOpen, title: 'Financial Literacy', desc: 'Ongoing workshops teaching wealth management, investment basics, and retirement planning.' }
              ].map((srv, i) => (
                <motion.div 
                  key={i}
                  {...fadeInUp}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-[#E8F0ED] rounded-[32px] p-10 hover:shadow-2xl hover:border-lime-400 transition-all flex flex-col items-start gap-6 group"
                >
                   <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 transition-all group-hover:bg-lime-400 group-hover:text-[#0F392B] group-hover:scale-110">
                      <srv.icon size={28} />
                   </div>
                   <div>
                      <h5 className="text-lg font-black tracking-tight mb-2 text-[#0F392B]">{srv.title}</h5>
                      <p className="text-sm text-slate-500 leading-relaxed font-bold">{srv.desc}</p>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* ─── PORTFOLIO SECTION ─── */}
      <section id="portfolio" className="py-32 bg-white">
        <div className="container mx-auto px-6 text-center">
           <motion.div {...fadeInUp} className="mb-20 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0F392B]/5 border border-[#0F392B]/10 rounded-full text-[10px] font-black uppercase tracking-[3px] text-[#0F392B]">
                 Diversified Assets
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-[#0F392B]">Collective Investments That Deliver</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">Every shilling you contribute is deployed into real assets generating steady income streams.</p>
           </motion.div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Building2, title: 'Real Estate', desc: 'Modern rental units and commercial plots generating passive monthly income.' },
                { icon: Bus, title: 'Matatu Fleet', desc: 'A modern, profitable fleet operating on the region\'s highest-demand routes.' },
                { icon: Flower2, title: 'Agribusiness', desc: 'Strategic investments in crop farming and agricultural value chains.' },
                { icon: Fuel, title: 'Fuel Stations', desc: 'High-traffic fueling points providing reliable daily revenue.' }
              ].map((item, i) => (
                <motion.div 
                   key={i}
                   whileHover={{ y: -10 }}
                   className="bg-white border border-[#E8F0ED] rounded-[32px] p-10 shadow-sm transition-all hover:shadow-2xl hover:border-lime-400"
                >
                   <div className="w-16 h-16 bg-gradient-to-br from-[#0F392B] to-[#1a5c43] rounded-2xl flex items-center justify-center text-lime-400 mx-auto mb-6 shadow-xl">
                      <item.icon size={28} />
                   </div>
                   <h5 className="text-lg font-black tracking-tight mb-2 text-[#0F392B]">{item.title}</h5>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section id="contact" className="py-32 relative overflow-hidden bg-gradient-to-br from-[#0F392B] via-[#1a5c43] to-[#0d2e22]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.1),transparent_50%)]" />
        <div className="container mx-auto px-6 relative z-10 text-center space-y-12">
           <motion.div {...fadeInUp}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[3px] text-lime-400 mb-6">
                 Join Today
              </div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none">Stop Waiting.<br /><span className="text-lime-400">Start Owning.</span></h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto font-medium mt-6">It takes less than 5 minutes to begin. Secure your future with stable dividends, fast credit, and real ownership.</p>
           </motion.div>

           <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: ShieldCheck, text: 'Guaranteed Dividends' },
                { icon: Target, text: 'Quick Loans' },
                { icon: Lock, text: 'Fully Secure' },
                { icon: Users, text: 'Community Owned' }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] font-black uppercase tracking-widest text-white/80 backdrop-blur-sm">
                   <badge.icon size={14} className="text-lime-400" /> {badge.text}
                </div>
              ))}
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Link href="/register" className="h-16 px-12 bg-lime-400 text-[#0F392B] rounded-2xl text-sm font-black uppercase tracking-[3px] flex items-center gap-3 hover:shadow-[0_20px_40px_rgba(163,230,53,0.4)] hover:scale-105 transition-all">
                 Join Our Community
              </Link>
              <Link href="#contact" className="h-16 px-10 bg-transparent border border-white/20 text-white rounded-2xl text-sm font-black uppercase tracking-[3px] hover:bg-white/5 transition-all">
                 Talk to an Agent
              </Link>
           </div>
        </div>
      </section>

    </div>
  );
}
