"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  ArrowUpRight, 
  Search,
  Filter,
  Plus,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardCard } from '@/components/DashboardCard';
import { fetchApi } from '@/lib/api';

interface DashboardStat {
  label: string;
  value: string | number;
  icon: any;
  trend: string;
  trendType: 'up' | 'down' | 'neutral';
  color: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const stats: DashboardStat[] = [
  { label: 'Total Members', value: '----', icon: Users, trend: '+12%', trendType: 'up', color: 'indigo' },
  { label: 'Total Savings', value: 'KES 0.00', icon: DollarSign, trend: '+8.4%', trendType: 'up', color: 'emerald' },
  { label: 'Active Loans', value: '0', icon: Briefcase, trend: 'stable', trendType: 'neutral', color: 'amber' },
  { label: 'System Health', value: 'Optimal', icon: ShieldCheck, trend: 'Online', trendType: 'up', color: 'rose' },
];

export default function Dashboard() {
  const [memberCount, setMemberCount] = useState<number | string>('...');

  useEffect(() => {
    // Initial fetch to test API
    fetchApi('search_members')
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setMemberCount(data.data.length);
        }
      })
      .catch(err => console.error("Dashboard Feed Error:", err));
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">System Overview</h2>
          <p className="text-slate-400 mt-1">Welcome back to USMS Sacco management dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <DashboardCard 
              {...stat} 
              value={stat.label === 'Total Members' ? memberCount : stat.value} 
            />
          </motion.div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Recent Members</h3>
            <Link href="/members" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="pb-4 font-semibold">Member Name</th>
                  <th className="pb-4 font-semibold">National ID</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[1,2,3,4,5].map((_, i) => (
                  <tr key={i} className="group hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 font-medium text-white">Member #00{i+1}</td>
                    <td className="py-4">32900000</td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">ACTIVE</span>
                    </td>
                    <td className="py-4 text-right font-mono text-indigo-400">KES 25,000.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-6">System Health</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Database Sync</span>
                <span className="text-xs font-bold text-emerald-400">100%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">API Connectivity</span>
                <span className="text-xs font-bold text-indigo-400">Optimal</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Auth & Security</span>
                <span className="text-xs font-bold text-amber-400">Locked</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Links</h4>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all text-xs font-medium flex items-center gap-2">
                <Search className="w-4 h-4" />
                Find User
              </button>
              <button className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all text-xs font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Config
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import Link from 'next/link';
