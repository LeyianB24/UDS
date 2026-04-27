"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  PieChart as PieChartIcon,
  Banknote,
  History,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Line, Bar } from 'react-chartjs-2';

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-green-800/10 border-t-lime-400 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-green-800">UDS</div>
        </div>
        <p className="mt-6 text-gray-500 text-[10px] font-black uppercase tracking-[4px] animate-pulse" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>Syncing USMS Ledger...</p>
    </div>
  );

  const displayStats = [
    {
      title: 'Registered Members',
      value: stats?.total_members || 0,
      subtitle: `${stats?.active_members || 0} active`,
      icon: Users,
      color: 'emerald',
      link: '/admin/members'
    },
    {
      title: 'Loan Exposure',
      value: `KES ${(stats?.total_exposure || 0).toLocaleString()}`,
      subtitle: `${stats?.pending_loans || 0} pending`,
      icon: Activity,
      color: 'blue',
      link: '/admin/loans'
    },
    {
      title: 'Cash Position',
      value: `KES ${(stats?.cash_position || 0).toLocaleString()}`,
      subtitle: 'Available funds',
      icon: Banknote,
      color: 'green',
      link: '/admin/payments'
    },
    {
      title: 'System Health',
      value: `${stats?.health || 95}%`,
      subtitle: 'Operational status',
      icon: ShieldCheck,
      color: 'lime',
      link: '/admin/settings'
    },
  ];

  return (
    <div className="space-y-6" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hp-hero relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f2e25 0%, #1d6044 100%)',
          borderRadius: '28px',
          padding: '52px 56px',
          color: 'white',
          boxShadow: '0 24px 60px rgba(15, 46, 37, 0.20)',
          animation: 'heroSlideIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both'
        }}
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 bottom-0 w-1/2 opacity-5"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
               `,
               backgroundSize: '32px 32px'
             }}>
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex-1">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-white/12 border border-white/15 backdrop-blur-xl rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(163,230,53,0.4)]"></div>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/90">System Online</span>
            </div>

            <h1 className="text-5xl font-black mb-4 leading-tight" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
              Command Dashboard
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-lg">
              Monitor your Sacco's performance, manage operations, and ensure financial integrity across all systems.
            </p>
          </div>

          {/* Integrity Card */}
          <div className="bg-white/8 border border-white/12 backdrop-blur-xl rounded-2xl p-6 ml-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/55 mb-1">Database Integrity</div>
            <div className="text-2xl font-black text-lime-400" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>{stats?.db_size || 'N/A'}</div>
            <div className="text-xs text-white/40 mt-1">Size on disk</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <motion.a
            key={stat.title}
            href={stat.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card group"
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '26px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid rgba(0,0,0,0.055)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
              animation: `cardFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both`,
              animationDelay: `${index * 0.07}s`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="stat-icon"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, var(--${stat.color}-500) 0%, var(--${stat.color}-600) 100%)`,
                  color: 'white'
                }}
              >
                <stat.icon size={24} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">{stat.title}</div>
                <div className="text-2xl font-black text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.subtitle}</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          </motion.a>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>Revenue Trend</h3>
              <p className="text-sm text-gray-600">Last 7 days performance</p>
            </div>
            <TrendingUp size={20} className="text-lime-500" />
          </div>
          <div className="h-64">
            <Line
              data={{
                labels: stats?.chart_labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                  label: 'Revenue',
                  data: stats?.chart_data || [0, 0, 0, 0, 0, 0, 0],
                  borderColor: '#a3e635',
                  backgroundColor: 'rgba(163, 230, 53, 0.1)',
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </motion.div>

        {/* Recent Support Tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>Support Tickets</h3>
              <p className="text-sm text-gray-600">{stats?.open_tickets || 0} open tickets</p>
            </div>
            <AlertTriangle size={20} className="text-orange-500" />
          </div>
          <div className="space-y-4">
            {stats?.tickets?.slice(0, 5).map((ticket: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{ticket.title || 'Support Request'}</div>
                    <div className="text-xs text-gray-600">by {ticket.sender}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle size={48} className="mx-auto mb-4 text-lime-500" />
                <p className="text-sm">All tickets resolved!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
        backgroundColor: 'rgba(208, 247, 100, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 3,
      },
      {
        label: 'Disbursements',
        data: [280, 480, 400, 190, 860, 270, 900],
        borderColor: '#0F392B',
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
        backgroundColor: '#0F392B',
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
                <span className="text-[11px] font-black text-[var(--brand-lime)] bg-[var(--brand-forest)] px-3 py-1 rounded-full uppercase tracking-[2px]">Admin Node 01</span>
                <div className="h-px w-12 bg-[var(--border-color)] opacity-20" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-[var(--text-main)] tracking-tighter leading-tight">
                Operational <span className="text-[var(--brand-forest)] underline decoration-[var(--brand-lime)] decoration-8 underline-offset-4">Command.</span>
            </h1>
            <p className="text-sm font-bold text-[var(--text-muted)] mt-6 max-w-xl leading-relaxed uppercase tracking-wider opacity-60">
                Unified surveillance of Kenya's premier transport SACCO. Monitoring equity, liquidity, and member engagement metrics in real-time.
            </p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-[var(--bg-surface)] bg-slate-200 flex items-center justify-center text-[10px] font-black">ST</div>
                ))}
                <div className="w-10 h-10 rounded-full border-4 border-[var(--bg-surface)] bg-[var(--brand-lime)] text-[var(--brand-forest)] flex items-center justify-center text-[10px] font-black shadow-lg">+12</div>
            </div>
            <button className="h-14 px-8 bg-[var(--brand-forest)] text-[var(--brand-lime)] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--text-main)] transition-all flex items-center gap-3 shadow-2xl shadow-emerald-950/20 active:scale-95 group">
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
            className="group relative bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[40px] p-8 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700">
                <stat.icon size={120} />
            </div>

            <div className="flex items-center justify-between mb-10">
               <div className="w-14 h-14 rounded-2xl bg-[var(--brand-forest)] flex items-center justify-center text-[var(--brand-lime)] shadow-lg shadow-emerald-950/20 group-hover:bg-[var(--brand-lime)] group-hover:text-[var(--brand-forest)] transition-colors duration-300">
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
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px] opacity-40">{stat.title}</p>
                <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tighter leading-none group-hover:text-[var(--brand-forest)] transition-colors">{stat.value}</h3>
            </div>

            <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-[var(--brand-lime)] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                VIEW METRICS <ArrowRight size={12} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ANALYTICAL TIER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Main Chart Section */}
         <motion.div variants={floatUp} className="lg:col-span-8 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[48px] p-10 lg:p-12 shadow-sm overflow-hidden relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative z-10">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-lime)] shadow-[0_0_8px_var(--brand-lime)]" />
                    <h4 className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-[4px] leading-none">Inflow Velocity</h4>
                  </div>
                  <p className="text-sm font-bold text-[var(--text-muted)] opacity-60">Comparative ledger flows for current fiscal cycle.</p>
               </div>
               <div className="flex items-center gap-6">
                  <div className="text-right">
                     <p className="text-3xl font-black text-[var(--text-main)] leading-none mb-1 tracking-tighter">KES 1.2M</p>
                     <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1"><Zap size={10} /> Peak Velocity</p>
                  </div>
                  <div className="w-px h-12 bg-[var(--border-color)]" />
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--brand-lime)]" />
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Revenue</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border-2 border-[var(--brand-forest)]" />
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Payouts</span>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="h-[340px] relative z-10 px-2 group">
               <Line data={chartData} options={chartOptions} />
            </div>

            {/* Visual Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_105%_-5%,rgba(208,247,100,0.04)_0%,transparent_50%)] pointer-events-none" />
         </motion.div>

         {/* Secondary Feature Tier */}
         <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Live Ledger Activity */}
            <motion.div variants={floatUp} className="flex-1 bg-[var(--brand-forest)] text-white rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--brand-lime)]">
                                <History size={22} />
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-[3px]">Audit Feed</h4>
                        </div>
                        
                        <div className="space-y-8">
                            {[
                                { user: 'Admin Main', action: 'Approved Loan #L-2394', time: '2m ago' },
                                { user: 'Systm Node', action: 'Processed share dividend', time: '14m ago' },
                                { user: 'Cashier 02', action: 'Manual entry: M-Pesa KES 4,500', time: '1h ago' }
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 group/log cursor-pointer">
                                    <div className="w-1 h-8 bg-[var(--brand-lime)]/20 rounded-full group-hover/log:bg-[var(--brand-lime)] transition-colors" />
                                    <div>
                                        <p className="text-[11px] font-black uppercase leading-tight group-hover/log:text-[var(--brand-lime)] transition-colors">{log.action}</p>
                                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">{log.user} &bull; {log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl mt-12 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[3px] hover:bg-white/10 transition-all group/btn">
                        View Complete Logs <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-lime)]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--brand-lime)]/10 rounded-full blur-[60px] -ml-16 -mb-16" />
            </motion.div>

            {/* Quick Summary Card */}
            <motion.div variants={floatUp} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] p-8 lg:p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center mb-6">
                    <Banknote size={28} />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-[var(--text-main)] mb-2">Authorized Capital</h4>
                <p className="text-xl font-black text-[var(--text-main)] tracking-tighter mb-4">KES 42.5M</p>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        className="h-full bg-blue-500"
                    />
                </div>
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-4">65% of Annual Projection</p>
            </motion.div>

         </div>

      </div>

    </motion.div>
  );
}
