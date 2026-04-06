"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Download, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  RefreshCcw,
  Mail,
  Phone,
  Calendar,
  Filter,
  ArrowRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

// Shared Page Variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function MembersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`admin/members?status=${statusFilter}&q=${searchQuery}`);
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (e) {
      console.error("Registry fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const updateStatus = async (memberId: number, action: string) => {
    try {
      const res = await fetchApi('admin/members', 'POST', { member_id: memberId, action });
      if (res.status === 'success') {
        loadMembers();
      }
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const stats = [
    { label: 'Active Personnel', value: data?.stats?.active || 0, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Suspended Unit', value: data?.stats?.suspended || 0, icon: UserX, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Awaiting Vetting', value: data?.stats?.pending || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Total Registrants', value: data?.stats?.total || 0, icon: Users, color: 'text-[var(--brand-lime)]', bg: 'bg-[var(--brand-forest)]/10' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-12 pb-20"
    >
      
      {/* HEADER SECTION */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2 leading-none">
              <span className="text-[11px] font-black text-[var(--brand-lime)] bg-[var(--brand-forest)] px-3 py-1 rounded-full uppercase tracking-[2px]">Registry Node</span>
              <div className="h-px w-8 bg-[var(--border-color)] opacity-20" />
           </div>
           <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-main)] tracking-tighter leading-tight">
              Member <span className="text-[var(--brand-forest)] underline decoration-[var(--brand-lime)] decoration-8 underline-offset-4">Registry.</span>
           </h2>
           <p className="text-sm font-bold text-[var(--text-muted)] mt-6 max-w-xl leading-relaxed uppercase tracking-wider opacity-60">
              Managing the core directory of validated USMS members. Enforcing membership standards through authorized registry control.
           </p>
        </div>
        <div className="flex items-center gap-4">
           <button className="h-14 px-8 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] hover:bg-[var(--bg-primary)] transition-all flex items-center gap-3 shadow-sm active:scale-95">
              <Download size={18} /> Export List
           </button>
           <button className="h-14 px-8 bg-[var(--brand-forest)] text-[var(--brand-lime)] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--text-main)] transition-all flex items-center gap-3 shadow-2xl shadow-emerald-950/20 active:scale-95">
              <UserPlus size={18} /> Onboard Member
           </button>
        </div>
      </motion.div>

      {/* STATS TIERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="group bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[40px] p-8 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 relative overflow-hidden"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500", stat.bg, stat.color)}>
               <stat.icon size={26} />
            </div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px] opacity-40 leading-none mb-3">{stat.label}</p>
            <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tighter leading-none">{stat.value}</h3>
            
            {/* Visual Flare */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[var(--text-main)] group-hover:scale-125 transition-transform duration-1000">
                <stat.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* REGISTRY FILTER & TABLE */}
      <motion.div variants={itemVariants} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[48px] overflow-hidden shadow-sm">
        
        {/* Advanced Filters */}
        <div className="p-8 lg:p-10 border-b border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="relative flex-1 max-w-2xl group">
              <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-lime)] transition-colors" />
              <input 
                type="text" 
                placeholder="Synchronize searches (Name, ID, Email, Phone)..." 
                className="w-full h-16 pl-16 pr-8 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-[24px] text-sm font-black uppercase tracking-widest text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 focus:ring-4 focus:ring-[var(--brand-lime)]/10 focus:border-[var(--brand-lime)]/50 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 px-6 py-4 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-[24px]">
                <Filter size={18} className="text-[var(--text-muted)]" />
                <select 
                  className="bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Full Registry</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Awaiting Vetting</option>
                </select>
              </div>
           </div>
        </div>

        {/* High Fidelity Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg-primary)]/30 border-b border-[var(--border-color)]">
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Identity & Manifest</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Contact Matrix</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Operational Status</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Vetting Date</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Action Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              <AnimatePresence mode='popLayout'>
                {data?.members?.map((member: any, idx: number) => (
                  <motion.tr 
                    key={member.member_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-[var(--bg-primary)]/30 transition-all cursor-default"
                  >
                    {/* Identity */}
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--brand-forest)] text-[var(--brand-lime)] flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-950/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                          {member.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-base font-black text-[var(--text-main)] leading-none mb-2 tracking-tight">{member.full_name}</p>
                          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">REG_NO: {member.member_reg_no || member.national_id}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Contact */}
                    <td className="px-10 py-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--text-main)] tracking-tight">
                          <div className="w-6 h-6 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-muted)]">
                            <Mail size={12} />
                          </div>
                          {member.email}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--text-main)] tracking-tight">
                          <div className="w-6 h-6 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-muted)]">
                            <Phone size={12} />
                          </div>
                          {member.phone}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-10 py-8">
                      <div className={cn(
                        "inline-flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                        member.status === 'active' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" : 
                        member.status === 'suspended' ? "bg-rose-500/5 text-rose-500 border-rose-500/10" : 
                        "bg-amber-500/5 text-amber-500 border-amber-500/10"
                      )}>
                        <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]", 
                          member.status === 'active' ? "bg-emerald-500" : 
                          member.status === 'suspended' ? "bg-rose-500" : "bg-amber-500"
                        )} />
                        {member.status}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3 text-sm font-black text-[var(--text-main)] tracking-tight">
                        <Calendar size={16} className="text-[var(--brand-lime)] opacity-60" />
                        {new Date(member.join_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {member.status !== 'active' && (
                          <button 
                            onClick={() => updateStatus(member.member_id, member.status === 'suspended' ? 'reactivate' : 'approve')}
                            className="h-11 px-5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                          >
                            <CheckCircle size={14} /> {member.status === 'suspended' ? 'Reactivate' : 'Approve'}
                          </button>
                        )}
                        {member.status === 'active' && (
                          <button 
                            onClick={() => updateStatus(member.member_id, 'suspend')}
                            className="h-11 px-5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
                          >
                            <UserX size={14} /> Suspend
                          </button>
                        )}
                        <button className="h-11 w-11 bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)] rounded-xl flex items-center justify-center hover:bg-[var(--brand-forest)] hover:text-white transition-all active:scale-95">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {loading && !data && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                        <div className="w-10 h-10 border-2 border-[var(--brand-lime)]/20 border-t-[var(--brand-lime)] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[4px]">Syncing Members...</p>
                    </td>
                  </tr>
              )}

              {data?.members?.length === 0 && !loading && (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-[var(--bg-primary)] rounded-[40px] flex items-center justify-center text-[var(--text-muted)] opacity-20 mb-8 border border-[var(--border-color)]">
                        <Users size={48} />
                      </div>
                      <h4 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-2">Registry Silent</h4>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">No personnel data matched the current query.</p>
                      <button 
                        onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
                        className="mt-10 text-[10px] font-black text-[var(--brand-lime)] bg-[var(--brand-forest)] px-8 py-4 rounded-2xl uppercase tracking-[3px] hover:scale-105 transition-all shadow-xl shadow-emerald-950/20 active:scale-95"
                      >
                         Clear Filter Grid
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 1px; height: 1px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-color); }
      `}</style>
    </motion.div>
  );
}
