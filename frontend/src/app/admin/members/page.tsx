"use client";

import React, { useState, useEffect } from 'react';
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
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function MembersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadMembers = async () => {
    setLoading(true);
    const res = await fetchApi(`members?status=${statusFilter}&q=${searchQuery}`);
    if (res.status === 'success') {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMembers();
  };

  const updateStatus = async (memberId: number, action: string) => {
    const res = await fetchApi('members', 'POST', { member_id: memberId, action });
    if (res.status === 'success') {
      loadMembers();
    } else {
      alert(res.message);
    }
  };

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <div className="w-12 h-12 border-4 border-[#0F392B] border-t-[#D0F764] rounded-full animate-spin mb-4" />
       <p className="text-[#0F392B]/40 text-[11px] font-black uppercase tracking-[2px]">Accessing Registry...</p>
    </div>
  );

  const stats = [
    { label: 'Active Members', value: data?.stats?.active || 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Suspended', value: data?.stats?.suspended || 0, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Pending Review', value: data?.stats?.pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Volume', value: data?.stats?.total || 0, icon: Users, color: 'text-[#0F392B]', bg: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2 leading-none">
              <span className="text-[11px] font-black text-emerald-900/40 uppercase tracking-[2px]">Registry Control Engine</span>
              <div className="h-px w-8 bg-emerald-900/10" />
           </div>
           <h2 className="text-3xl font-black text-[#0F392B] tracking-tight">Member <span className="text-emerald-600">Directory</span></h2>
           <p className="text-sm font-medium text-slate-500 mt-2">Managing the core registry of verified USMS members.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="h-12 px-6 bg-white border border-emerald-900/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#0F392B] hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm">
              <Download size={16} /> Export CSV
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card group">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
               <stat.icon size={22} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
            <h3 className="text-2xl font-black text-[#0F392B] tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white border border-emerald-900/5 rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
        
        {/* Table Header / Filters */}
        <div className="p-6 border-b border-emerald-900/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, ID or email..." 
                className="w-full pl-12 pr-4 py-3 bg-[#f0f7f4]/50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0F392B]/10 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </form>
           
           <div className="flex items-center gap-4">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
              <select 
                className="bg-white border border-emerald-900/10 rounded-xl px-4 py-2.5 text-xs font-bold text-[#0F392B] focus:ring-0 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Members</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Pending Approval</option>
              </select>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f0f7f4]/30">
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Identity & Profile</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Contact Channels</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Registry Status</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Onboarding</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {data?.members?.map((member: any) => (
                <tr key={member.member_id} className="hover:bg-[#f0f7f4]/20 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-forest text-brand-lime flex items-center justify-center font-black text-xs shadow-lg shadow-brand-forest/10">
                        {member.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0F392B] leading-none mb-1">{member.full_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {member.national_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                        <Mail size={12} className="text-slate-300" /> {member.email}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                        <Phone size={12} className="text-slate-300" /> {member.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                      member.status === 'active' ? "bg-emerald-50 text-emerald-600" : 
                      member.status === 'suspended' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        member.status === 'active' ? "bg-emerald-600" : 
                        member.status === 'suspended' ? "bg-red-600" : "bg-amber-600"
                      )} />
                      {member.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F392B]">
                      <Calendar size={14} className="text-emerald-900/20" />
                      {new Date(member.join_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {member.status === 'inactive' && (
                        <button 
                          onClick={() => updateStatus(member.member_id, 'approve')}
                          className="h-9 px-4 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                      )}
                      {member.status === 'active' && (
                        <button 
                          onClick={() => updateStatus(member.member_id, 'suspend')}
                          className="h-9 px-4 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                        >
                          <UserX size={14} /> Suspend
                        </button>
                      )}
                      {member.status === 'suspended' && (
                        <button 
                          onClick={() => updateStatus(member.member_id, 'reactivate')}
                          className="h-9 px-4 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                        >
                          <RefreshCcw size={14} /> Reactivate
                        </button>
                      )}
                      <button className="h-9 w-9 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-[#0F392B] hover:text-white transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data?.members?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Users size={48} className="text-slate-100 mb-4" />
                      <p className="text-sm font-black text-[#0F392B] uppercase tracking-widest">No members found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
