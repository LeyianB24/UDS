"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  Banknote,
  History,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database,
  Inbox
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Animation variants
const floatUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.08
        }
    }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('admin/dashboard')
      .then(res => {
        if (res.status === 'success') setStats(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="relative">
              <div className="w-16 h-16 border-4 border-[#0b2419]/10 border-t-[#a3e635] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-[#0b2419]">UDS</div>
          </div>
          <p className="mt-6 text-gray-500 text-[10px] font-black uppercase tracking-[4px] animate-pulse">Syncing USMS Ledger...</p>
      </div>
    );
  }

  const displayStats = [
    {
      title: 'Registered Members',
      value: stats?.total_members || 0,
      change: '+12%',
      type: 'up',
      icon: Users,
      link: '/admin/members'
    },
    {
      title: 'Loan Exposure',
      value: `KES ${(stats?.total_exposure || 0).toLocaleString()}`,
      change: '+5.4%',
      type: 'up',
      icon: Activity,
      link: '/admin/loans'
    },
    {
      title: 'Cash Position',
      value: `KES ${(stats?.cash_position || 0).toLocaleString()}`,
      change: '-2.1%',
      type: 'down',
      icon: Banknote,
      link: '/admin/payments'
    },
    {
      title: 'System Health',
      value: `${stats?.health || 95}%`,
      change: 'Stable',
      type: 'up',
      icon: ShieldCheck,
      link: '/admin/settings'
    },
  ];

  const chartData = {
    labels: stats?.chart_labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Inflow Velocity',
        data: stats?.chart_data || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#a3e635',
        backgroundColor: 'rgba(163, 230, 53, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 3,
      },
      {
        label: 'Disbursements',
        data: [280, 480, 400, 190, 860, 270, 900], // Example data if not provided
        borderColor: '#0b2419',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0b2419',
        titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' as 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans' },
        padding: 12,
        cornerRadius: 12,
        displayColors: false
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' as 'bold' }, color: '#9CA3AF' } },
      y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10, weight: 'bold' as 'bold' }, color: '#9CA3AF' } }
    }
  };

  return (
    <motion.div 
        initial="initial"
        animate="animate"
        variants={stagger}
        className="space-y-12 pb-20"
    >
      
      {/* HEADER TIER */}
      <motion.div variants={floatUp} className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div>
            <div className="flex items-center gap-3 mb-4 leading-none">
                <span className="text-[11px] font-black text-[#a3e635] bg-[#0b2419] px-3 py-1 rounded-full uppercase tracking-[2px]">Admin Node 01</span>
                <div className="h-px w-12 bg-gray-200" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-[#0b2419] tracking-tighter leading-tight">
                Operational <span className="text-[#0b2419] underline decoration-[#a3e635] decoration-8 underline-offset-4">Command.</span>
            </h1>
            <p className="text-sm font-bold text-gray-500 mt-6 max-w-xl leading-relaxed uppercase tracking-wider opacity-60">
                Unified surveillance of Kenya's premier transport SACCO. Monitoring equity, liquidity, and member engagement metrics in real-time.
            </p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black">ST</div>
                ))}
                <div className="w-10 h-10 rounded-full border-4 border-white bg-[#a3e635] text-[#0b2419] flex items-center justify-center text-[10px] font-black shadow-lg">+12</div>
            </div>
            <button className="h-14 px-8 bg-[#0b2419] text-[#a3e635] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-2xl shadow-emerald-950/20 active:scale-95 group">
                <ShieldCheck size={18} className="group-hover:rotate-12 transition-transform" /> System Audit
            </button>
        </div>
      </motion.div>

      {/* STATS TIER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {displayStats.map((stat, idx) => (
          <motion.div 
            key={idx}
            variants={floatUp}
            className="group relative bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700">
                <stat.icon size={120} />
            </div>

            <div className="flex items-center justify-between mb-10">
               <div className="w-14 h-14 rounded-2xl bg-[#0b2419] flex items-center justify-center text-[#a3e635] shadow-lg shadow-emerald-950/20 group-hover:bg-[#a3e635] group-hover:text-[#0b2419] transition-colors duration-300">
                  <stat.icon size={24} />
               </div>
               <div className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-sm",
                  stat.type === 'up' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
               )}>
                  {stat.type === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.change}
               </div>
            </div>
            
            <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] opacity-40">{stat.title}</p>
                <h3 className="text-3xl font-black text-[#0b2419] tracking-tighter leading-none group-hover:text-[#0b2419] transition-colors">{stat.value}</h3>
            </div>

            <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-[#a3e635] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                VIEW METRICS <ArrowRight size={12} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ANALYTICAL TIER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Main Chart Section */}
         <motion.div variants={floatUp} className="lg:col-span-8 bg-white border border-gray-100 rounded-[48px] p-10 lg:p-12 shadow-sm overflow-hidden relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative z-10">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635]" />
                    <h4 className="text-[11px] font-black text-[#0b2419] uppercase tracking-[4px] leading-none">Inflow Velocity</h4>
                  </div>
                  <p className="text-sm font-bold text-gray-500 opacity-60">Comparative ledger flows for current fiscal cycle.</p>
               </div>
               <div className="flex items-center gap-6">
                  <div className="text-right">
                     <p className="text-3xl font-black text-[#0b2419] leading-none mb-1 tracking-tighter">KES {(stats?.total_exposure / 1000000 || 0).toFixed(1)}M</p>
                     <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1"><Zap size={10} /> Peak Velocity</p>
                  </div>
                  <div className="w-px h-12 bg-gray-100" />
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#a3e635]" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Revenue</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border-2 border-[#0b2419]" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Payouts</span>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="h-[340px] relative z-10 px-2 group">
               <Line data={chartData} options={chartOptions} />
            </div>

            {/* Visual Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_105%_-5%,rgba(163,230,53,0.04)_0%,transparent_50%)] pointer-events-none" />
         </motion.div>

         {/* Secondary Feature Tier */}
         <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Live Ledger Activity */}
            <motion.div variants={floatUp} className="flex-1 bg-[#0b2419] text-white rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#a3e635]">
                                <History size={22} />
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-[3px]">Audit Feed</h4>
                        </div>
                        
                        <div className="space-y-8">
                            {stats?.tickets?.length > 0 ? (
                                stats.tickets.slice(0, 3).map((log: any, i: number) => (
                                    <div key={i} className="flex gap-4 group/log cursor-pointer">
                                        <div className="w-1 h-8 bg-[#a3e635]/20 rounded-full group-hover/log:bg-[#a3e635] transition-colors" />
                                        <div>
                                            <p className="text-[11px] font-black uppercase leading-tight group-hover/log:text-[#a3e635] transition-colors">{log.title || 'Support Request'}</p>
                                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">{log.sender} &bull; {new Date(log.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-30">
                                    <Inbox size={40} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No recent logs</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl mt-12 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[3px] hover:bg-white/10 transition-all group/btn">
                        View Complete Logs <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#a3e635]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#a3e635]/10 rounded-full blur-[60px] -ml-16 -mb-16" />
            </motion.div>

            {/* Quick Summary Card */}
            <motion.div variants={floatUp} className="bg-white border border-gray-100 rounded-[32px] p-8 lg:p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center mb-6">
                    <Banknote size={28} />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-[#0b2419] mb-2">Authorized Capital</h4>
                <p className="text-xl font-black text-[#0b2419] tracking-tighter mb-4">KES 42.5M</p>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        className="h-full bg-blue-500"
                    />
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-4">65% of Annual Projection</p>
            </motion.div>

         </div>

      </div>

    </motion.div>
  );
}
