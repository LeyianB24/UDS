"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Download, 
  MoreVertical, 
  Mail, 
  User, 
  Lock, 
  Key, 
  Trash2, 
  Edit3, 
  CheckCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

// Page Animation Variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function AdminUsersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('admin/users');
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (e) {
      console.error("Staff sync failure:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (adminId: number) => {
    if (!confirm("Are you sure you want to purge this staff record? This action is immutable.")) return;
    setProcessingId(adminId);
    try {
      const res = await fetchApi('admin/users', 'POST', { action: 'delete', admin_id: adminId });
      if (res.status === 'success') {
        loadUsers();
      }
    } catch (e) {
      console.error("Purge failure:", e);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = data?.users?.filter((u: any) => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const stats = [
    { label: 'Personnel Count', value: data?.users?.length || 0, icon: Users, color: 'text-[var(--brand-lime)]', bg: 'bg-[var(--brand-forest)]/10' },
    { label: 'Roles Active', value: data?.roles?.length || 0, icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Supervisors', value: data?.users?.filter((u: any) => u.role_id === 1).length || 0, icon: Key, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'System Access', value: 'Authorized', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-12 pb-20"
    >
      
      {/* HEADER TIER */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2 leading-none">
              <span className="text-[11px] font-black text-[var(--brand-lime)] bg-[var(--brand-forest)] px-3 py-1 rounded-full uppercase tracking-[2px]">Staff Management Mesh</span>
              <div className="h-px w-8 bg-[var(--border-color)] opacity-20" />
           </div>
           <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-main)] tracking-tighter leading-tight">
              Administrative <span className="text-[var(--brand-forest)] underline decoration-[var(--brand-lime)] decoration-8 underline-offset-4">Personnel.</span>
           </h2>
           <p className="text-sm font-bold text-[var(--text-muted)] mt-6 max-w-xl leading-relaxed uppercase tracking-wider opacity-60">
              Provisioning accounts and assigning cryptographic roles. Enforcing strict security standards across the administrative personnel grid.
           </p>
        </div>
        <div className="flex items-center gap-4">
           <button className="h-14 px-8 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] hover:bg-[var(--bg-primary)] transition-all flex items-center gap-3 shadow-sm active:scale-95">
              <Download size={18} /> Export Registry
           </button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="h-14 px-8 bg-[var(--brand-forest)] text-[var(--brand-lime)] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--text-main)] transition-all flex items-center gap-3 shadow-2xl shadow-emerald-950/20 active:scale-95"
           >
              <UserPlus size={18} /> Onboard Staff
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
            
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[var(--text-main)] group-hover:scale-125 transition-transform duration-1000">
                <stat.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* STAFF TABLE SECTION */}
      <motion.div variants={itemVariants} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[48px] overflow-hidden shadow-sm">
        
        {/* Advanced Filter Mesh */}
        <div className="p-8 lg:p-10 border-b border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="relative flex-1 max-w-2xl group">
              <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-lime)] transition-colors" />
              <input 
                type="text" 
                placeholder="Synchronize Query (Name, Handle, Email)..." 
                className="w-full h-16 pl-16 pr-8 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-[24px] text-sm font-black uppercase tracking-widest text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 focus:ring-4 focus:ring-[var(--brand-lime)]/10 focus:border-[var(--brand-lime)]/50 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {/* High Fidelity Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg-primary)]/30 border-b border-[var(--border-color)]">
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Staff Identity</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Assigned Protocol (Role)</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Contact Matrix</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Onboarding</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px]">Terminal Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              <AnimatePresence mode='popLayout'>
                {filteredUsers.map((user: any, idx: number) => {
                  const isMe = user.admin_id === data?.current_admin_id;
                  return (
                    <motion.tr 
                      key={user.admin_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-[var(--bg-primary)]/30 transition-all cursor-default"
                    >
                      {/* Identity */}
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-[var(--brand-forest)] text-[var(--brand-lime)] flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-950/20 group-hover:scale-110 transition-transform duration-500 relative">
                             <User size={24} />
                             {isMe && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--bg-surface)] shadow-lg" />
                             )}
                          </div>
                          <div>
                            <p className="text-base font-black text-[var(--text-main)] leading-none mb-2 tracking-tight">
                               {user.full_name}
                               {isMe && <span className="ml-3 text-[9px] font-black text-[var(--brand-lime)] bg-[var(--brand-forest)] px-2 py-0.5 rounded uppercase tracking-widest">Self</span>}
                            </p>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Role */}
                      <td className="px-10 py-8">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-[2px] text-[var(--text-main)]">
                           <ShieldCheck size={12} className="text-[var(--brand-lime)]" />
                           {user.role_name || 'System Admin'}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--text-main)] tracking-tight">
                           <Mail size={14} className="text-[var(--text-muted)] opacity-60" />
                           {user.email}
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="px-10 py-8">
                         <p className="text-[11px] font-black text-[var(--text-main)] tracking-tight">
                            {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                         </p>
                      </td>

                      {/* Actions */}
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button className="h-11 px-5 bg-[var(--bg-primary)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--text-main)] hover:text-white transition-all flex items-center gap-2">
                            <Edit3 size={14} /> Update
                          </button>
                          {!isMe && (
                             <button 
                               onClick={() => handleDelete(user.admin_id)}
                               className="h-11 w-11 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                             >
                               <Trash2 size={18} />
                             </button>
                          )}
                          <button className="h-11 w-11 bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)] rounded-xl flex items-center justify-center hover:bg-[var(--text-main)] hover:text-white transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {loading && !filteredUsers.length && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                        <div className="w-10 h-10 border-2 border-[var(--brand-lime)]/20 border-t-[var(--brand-lime)] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[4px]">Syncing Personnel Registry...</p>
                    </td>
                  </tr>
              )}

              {filteredUsers.length === 0 && !loading && (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-[var(--bg-primary)] rounded-[40px] flex items-center justify-center text-[var(--text-muted)] opacity-20 mb-8 border border-[var(--border-color)]">
                        <Users size={48} />
                      </div>
                      <h4 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-2">Personnel Silent</h4>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">Zero administrative matches identified in the query mesh.</p>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-10 text-[10px] font-black text-[var(--brand-lime)] bg-[var(--brand-forest)] px-8 py-4 rounded-2xl uppercase tracking-[3px] hover:scale-105 transition-all shadow-xl shadow-emerald-950/20 active:scale-95"
                      >
                         Recalibrate Registry
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
