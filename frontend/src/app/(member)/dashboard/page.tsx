"use client";

import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  PieChart, 
  CircleDollarSign,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar } from "@/components/Sidebar"; // This is actually the Admin sidebar, wait I'll use the layout instead
import { fetchApi } from '@/lib/api';

const stats = [
  { name: 'Savings Balance', value: 'KES 120,500', change: '+2.5%', type: 'up', icon: PiggyBank, color: 'emerald' },
  { name: 'Total Shares', value: '550 Shares', change: '+12%', type: 'up', icon: PieChart, color: 'lime' },
  { name: 'Active Loan', value: 'KES 45,000', change: '-5.2%', type: 'down', icon: CircleDollarSign, color: 'amber' },
  { name: 'Welfare Fund', value: 'KES 1,200', change: '0%', type: 'up', icon: Wallet, color: 'indigo' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function MemberDashboard() {
  return (
    <div className="space-y-10">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] font-black text-emerald-600/60 dark:text-emerald-400/40 uppercase tracking-[2px]">Welcome Back</span>
              <div className="h-px w-8 bg-emerald-900/10 dark:bg-emerald-800/20" />
           </div>
           <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">John <span className="text-emerald-500">Mbugua</span></h2>
           <p className="text-sm font-medium text-slate-500 mt-1">Reg No: UDS/2024/0488 • Driver Portal</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Last Logged In</p>
              <p className="text-xs font-bold text-emerald-950 dark:text-white">Today, 09:42 AM</p>
           </div>
           <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 border border-emerald-900/5">
              <Clock size={20} />
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            variants={item}
            className="group bg-white dark:bg-emerald-950/20 border border-emerald-900/5 dark:border-emerald-800/10 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
          >
            <div className={`w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-5 transition-colors group-hover:bg-emerald-900 group-hover:text-white`}>
              <stat.icon size={22} className="text-emerald-600 group-hover:text-lime-400 transition-colors" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.name}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">{stat.value}</h3>
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-lg flex items-center",
                stat.type === 'up' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
              )}>
                {stat.type === 'up' ? <TrendingUp size={10} className="mr-1" /> : <ArrowDownRight size={10} className="mr-1" />}
                {stat.change}
              </span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Recent Transactions */}
         <div className="bg-white dark:bg-emerald-950/20 border border-emerald-900/5 dark:border-emerald-800/10 rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
            <div className="p-6 border-b border-emerald-900/5 dark:border-emerald-800/10 flex items-center justify-between">
               <h4 className="font-black text-sm text-emerald-950 dark:text-white uppercase tracking-widest">Recent Activity</h4>
               <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center">View All <ChevronRight size={12} /></button>
            </div>
            <div className="p-2">
               {[
                 { title: 'Monthly Contribution', sub: 'M-Pesa • #TX8922', amount: 'KES 2,000', type: 'in', date: 'Yesterday' },
                 { title: 'Savings Withdrawal', sub: 'Wallet • #TX8901', amount: 'KES 5,000', type: 'out', date: '2 days ago' },
                 { title: 'Dividend Payout', sub: 'Equity • #TX8872', amount: 'KES 840', type: 'in', date: 'Mar 28' },
               ].map((tx, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-2xl transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                         tx.type === 'in' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" : "bg-red-50 text-red-600 dark:bg-red-900/30"
                       )}>
                          {tx.type === 'in' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                       </div>
                       <div>
                          <p className="text-sm font-black text-emerald-950 dark:text-white leading-tight">{tx.title}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{tx.sub}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={cn("text-sm font-black", tx.type === 'in' ? "text-emerald-600" : "text-red-500")}>{tx.type === 'in' ? '+' : '-'}{tx.amount}</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-1">{tx.date}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Mini Action Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-emerald-950 text-white p-8 rounded-3xl relative overflow-hidden group border border-emerald-800">
               <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-lime-400 text-emerald-950 flex items-center justify-center mb-6 shadow-[0_5px_15px_rgba(163,230,53,0.3)]">
                     <ArrowUpRight size={24} />
                  </div>
                  <h4 className="text-xl font-black mb-2">Apply for a Loan</h4>
                  <p className="text-emerald-400/50 text-xs font-medium leading-relaxed mb-6">Instant approval for qualified members up to 3x your savings.</p>
                  <button className="text-[10px] font-black uppercase tracking-[2px] text-lime-400 flex items-center gap-2 hover:gap-3 transition-all">Start Application <ChevronRight size={14} /></button>
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-lime-400/5 rounded-full blur-3xl" />
            </div>
            
            <div className="bg-white dark:bg-emerald-950/20 border-2 border-dashed border-emerald-900/10 dark:border-emerald-800/20 p-8 rounded-3xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-emerald-500/50 transition-all">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
               </div>
               <h4 className="text-sm font-black text-emerald-950 dark:text-white uppercase tracking-widest mb-2">Wealth Reports</h4>
               <p className="text-slate-500 text-[10px] leading-relaxed max-w-[140px]">Coming soon: Comprehensive growth analytics.</p>
            </div>
         </div>

      </div>

    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
