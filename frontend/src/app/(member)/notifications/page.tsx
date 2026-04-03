"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  ArrowLeft,
  Search,
  MoreVertical,
  Trash2,
  BellOff,
  ChevronRight,
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Notification {
  notification_id: number;
  type: string;
  message: string;
  is_read: boolean | number;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchApi('member_notifications');
    if (res.status === 'success') {
      setNotifs(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const markRead = async (id: number | 'all') => {
    const res = await fetchApi('member_notifications', 'POST', {
      id: id === 'all' ? 0 : id,
      all: id === 'all'
    });
    if (res.status === 'success') {
      loadData();
    }
  };

  const getIcon = (type: string): LucideIcon => {
    switch(type.toLowerCase()) {
      case 'loan_approved': case 'payment_success': return CheckCircle2;
      case 'loan_rejected': case 'payment_failed': return AlertCircle;
      case 'withdrawal_request': return Clock;
      default: return Info;
    }
  };

  const filtered = notifs.filter(n => 
    n.message.toLowerCase().includes(search.toLowerCase()) ||
    n.type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && notifs.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <div className="w-12 h-12 border-4 border-[#0b2419] border-t-lime-400 rounded-full animate-spin mb-4" title="Loading Alerts" />
       <p className="text-[#0b2419]/40 text-[11px] font-black uppercase tracking-[2px]">Syncing Alerts...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-8">
         <div>
            <Link href="/member/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0b2419] transition-all mb-4">
               <ArrowLeft size={12} /> Dashboard
            </Link>
            <h1 className="text-4xl font-black tracking-tighter text-[#0b2419] flex items-center gap-4">
               Notifications
               {unreadCount > 0 && (
                 <span className="h-8 px-4 bg-lime-400 text-[#0b2419] rounded-full text-[11px] font-black flex items-center justify-center animate-bounce">
                    {unreadCount} NEW
                 </span>
               )}
            </h1>
         </div>
         <div className="flex items-center gap-3">
            <div className="relative group flex-1 md:w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0b2419] transition-all" size={16} />
               <input 
                 type="text" 
                 title="Search Notifications"
                 placeholder="Search alerts..." 
                 className="w-full h-12 bg-white border border-emerald-900/5 rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-lime-400/20 transition-all"
                 value={search}
                 onChange={e => setSearch(e.target.value)}
               />
            </div>
            <button 
              onClick={() => markRead('all')}
              title="Mark All as Read"
              className="h-12 px-6 bg-[#0b2419] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
              disabled={unreadCount === 0}
            >
               <CheckCheck size={16} /> Clear All
            </button>
         </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
         <AnimatePresence mode="popLayout">
            {filtered.map((n, idx) => {
               const Icon = getIcon(n.type);
               const isRead = n.is_read == 1 || n.is_read === true;
               
               return (
                 <motion.div 
                   key={n.notification_id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   onClick={() => !isRead && markRead(n.notification_id)}
                   className={cn(
                     "bg-white border rounded-[32px] p-6 flex items-start gap-6 transition-all group cursor-pointer relative overflow-hidden",
                     isRead ? "border-emerald-900/5 opacity-60" : "border-lime-400/30 shadow-lg shadow-lime-900/5 scale-[1.02] z-10"
                   )}
                 >
                    {!isRead && (
                       <div className="absolute top-0 left-0 w-1.5 h-full bg-lime-400" />
                    )}
                    
                    <div className={cn(
                       "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                       isRead ? "bg-slate-50 text-slate-300" : "bg-lime-400 text-[#0b2419]"
                    )}>
                       <Icon size={28} />
                    </div>

                    <div className="flex-1">
                       <div className="flex items-center justify-between gap-4 mb-2">
                          <h4 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">
                             {n.type.replace(/_/g, ' ')}
                          </h4>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                             <Clock size={10} /> {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       <p className={cn(
                          "text-sm font-bold leading-relaxed",
                          isRead ? "text-slate-500" : "text-[#0b2419]"
                       )}>
                          {n.message}
                       </p>
                    </div>

                    <div className="self-center">
                       {isRead ? (
                          <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-200">
                             <ChevronRight size={14} />
                          </div>
                       ) : (
                          <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
                       )}
                    </div>
                 </motion.div>
               );
            })}
         </AnimatePresence>

         {filtered.length === 0 && (
            <div className="py-32 text-center">
               <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-inner">
                  <BellOff size={48} />
               </div>
               <h3 className="text-2xl font-black text-[#0b2419] tracking-tight">Zero Noise.</h3>
               <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto mt-2 tracking-tight">
                  You're all caught up! No active notifications found matching your search.
               </p>
               <button 
                 onClick={() => setSearch('')}
                 className="mt-8 h-12 px-8 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0b2419] hover:text-white transition-all"
               >
                  Refresh Feed
               </button>
            </div>
         )}
      </div>

      {/* Engagement Stats */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-40 hover:opacity-100 transition-opacity">
         <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-3xl p-8">
            <h5 className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest mb-4">Smart Delivery</h5>
            <p className="text-xs font-bold text-emerald-900/60 leading-relaxed uppercase tracking-wider italic">
               "Notifications are prioritized by urgency and financial impact."
            </p>
         </div>
         <div className="bg-[#0b2419] rounded-3xl p-8 text-white/40">
            <h5 className="text-[10px] font-black uppercase tracking-widest mb-4">Security Notice</h5>
            <p className="text-xs font-bold leading-relaxed">
               We will never ask for your password via notifications. Stay alert and report suspicious activity.
            </p>
         </div>
      </div>

    </div>
  );
}
