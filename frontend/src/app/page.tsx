"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
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

export default function Dashboard() {
  const [statsData, setStatsData] = useState({
    members: 0,
    savings: 0,
    loans: 0,
    health: 'Optimal'
  });

  const [recentMembers, setRecentMembers] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch Stats
    fetchApi('get_stats')
      .then(res => {
        if (res.status === 'success') {
          setStatsData(res.data);
        }
      })
      .catch(err => console.error("Stats Fetch Error:", err));

    // 2. Fetch Recent Members
    fetchApi('search_members', 'GET', { q: 'a' }) // Getting all/some members
      .then(res => {
        if (res.status === 'success' && Array.isArray(res.data)) {
          setRecentMembers(res.data.slice(0, 5));
        }
      })
      .catch(err => console.error("Members Fetch Error:", err));
  }, []);

  const dashboardStats: DashboardStat[] = [
    { label: 'Total Members', value: statsData.members, icon: Users, trend: '+12%', trendType: 'up', color: 'indigo' },
    { label: 'Total Savings', value: `KES ${statsData.savings.toLocaleString()}`, icon: DollarSign, trend: '+8.4%', trendType: 'up', color: 'emerald' },
    { label: 'Active Loans', value: statsData.loans, icon: Briefcase, trend: 'stable', trendType: 'neutral', color: 'amber' },
    { label: 'System Health', value: statsData.health, icon: ShieldCheck, trend: 'Online', trendType: 'up', color: 'rose' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">System Overview</h2>
          <p className="text-slate-400 mt-1">Welcome to the USMS Sacco management dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all text-white">
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <DashboardCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <th className="pb-4 font-semibold">Phone</th>
                  <th className="pb-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {recentMembers.map((member, i) => (
                  <tr key={member.member_id || i} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 text-white">{member.full_name}</td>
                    <td className="py-4 font-mono">{member.national_id}</td>
                    <td className="py-4">{member.phone}</td>
                    <td className="py-4 text-right">
                      <button className="text-xs text-indigo-400 hover:underline uppercase font-bold tracking-tighter">View Profile</button>
                    </td>
                  </tr>
                ))}
                {recentMembers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500 italic">No members found in system database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col"
        >
          <h3 className="text-lg font-bold text-white mb-6">System Health</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Database Engine</span>
                <span className="text-xs font-bold text-emerald-400">Online</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">API Gateway</span>
                <span className="text-xs font-bold text-indigo-400">Active</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Storage</span>
                <span className="text-xs font-bold text-amber-400">4.2 GB Used</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
             <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                <div className="p-2 bg-indigo-600/10 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                   <p className="text-xs font-bold text-white uppercase tracking-tight">Security Audit</p>
                   <p className="text-[10px] text-slate-400">Last check: 5 mins ago</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all text-xs font-medium flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all text-xs font-medium flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
