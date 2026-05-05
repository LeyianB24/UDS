"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, 
    BellOff, 
    BellRing, 
    CheckCircle2, 
    AlertTriangle, 
    AlertCircle, 
    Wallet, 
    HeartPulse, 
    Clock, 
    ArrowLeft,
    CheckCheck,
    ChevronDown,
    ChevronUp,
    Zap,
    Inbox
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import './notifications.css';

const getNotificationStyle = (title: string, msg: string) => {
    const t = (title + ' ' + msg).toLowerCase();
    if (t.includes('loan') || t.includes('credit') || t.includes('pay'))
        return { icon: Wallet, bg: 'rgba(163, 230, 53, 0.1)', color: '#a3e635' };
    if (t.includes('approv') || t.includes('success'))
        return { icon: CheckCircle2, bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
    if (t.includes('reject') || t.includes('fail') || t.includes('error'))
        return { icon: AlertTriangle, bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    if (t.includes('warn'))
        return { icon: AlertCircle, bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
    if (t.includes('welfare') || t.includes('heart'))
        return { icon: HeartPulse, bg: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' };
    return { icon: Bell, bg: 'rgba(11, 36, 25, 0.06)', color: '#0b2419' };
};

const timeAgo = (datetime: string) => {
    const diff = Math.floor((Date.now() - new Date(datetime).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

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

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllRead, setShowAllRead] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await apiFetch('/api/member/notifications');
            if (res.status === 'success') {
                setNotifications(res.data.notifications);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const markAllRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            await apiFetch('/api/member/notifications', {
                method: 'POST',
                body: JSON.stringify({ action: 'mark_all_read' })
            });
        } catch (e) {
            console.error(e);
            loadData();
        }
    };

    const unread = useMemo(() => notifications.filter(n => Number(n.is_read) === 0), [notifications]);
    const read = useMemo(() => notifications.filter(n => Number(n.is_read) === 1), [notifications]);
    const financeCount = useMemo(() => 
        notifications.filter(n => (n.title + n.message).toLowerCase().match(/loan|pay|credit/i)).length
    , [notifications]);

    if (loading && notifications.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-[#0b2419]/10 border-t-[#a3e635] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="pb-20"
        >
            {/* HERO SECTION */}
            <motion.div variants={floatUp} className="bg-[#0b2419] rounded-b-[48px] relative overflow-hidden text-white mb-20 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_85%_at_108%_-5%,rgba(163,230,53,0.11)_0%,transparent_55%)] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_55%_at_-8%_105%,rgba(163,230,53,0.07)_0%,transparent_55%)] pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-20 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div>
                        <Link href="/member/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-[#a3e635] text-[10px] font-black uppercase tracking-widest transition-colors mb-8">
                            <ArrowLeft size={14} /> Back to Briefing
                        </Link>
                        
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#a3e635]/60 mb-6">
                            <div className="w-6 h-[1.5px] bg-[#a3e635]/40 rounded-full"></div>
                            Activity Feed
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4">Notifications</h1>
                        <p className="text-white/40 font-bold tracking-widest text-[11px] uppercase flex items-center gap-2">
                            <span>{unread.length} Pending Actions</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                            <span>{notifications.length} Historical Records</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {unread.length > 0 && (
                            <button 
                                onClick={markAllRead}
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#a3e635] text-[#0b2419] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#bceb3b] shadow-xl shadow-[#a3e635]/20 transition-all active:scale-95"
                            >
                                <CheckCheck size={18} />
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* STATS AREA */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-12 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Alerts', val: notifications.length, icon: Bell, color: 'emerald' },
                        { label: 'Unread Status', val: unread.length, icon: unread.length > 0 ? BellRing : BellOff, color: unread.length > 0 ? 'red' : 'emerald' },
                        { label: 'Finance Focused', val: financeCount, icon: Wallet, color: 'blue' }
                    ].map((s, i) => (
                        <motion.div key={i} variants={floatUp} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                                s.color === 'red' ? 'bg-red-50 text-red-500' : 
                                s.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                            )}>
                                <s.icon size={20} />
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</div>
                            <div className="text-3xl font-black text-[#0b2419]">{s.val}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* NOTIFICATION FEED */}
            <div className="max-w-4xl mx-auto px-6 lg:px-12 mt-20">
                {notifications.length === 0 ? (
                    <motion.div variants={floatUp} className="py-32 flex flex-col items-center justify-center text-center opacity-40">
                        <Inbox size={64} className="mb-6" />
                        <h3 className="text-xl font-black text-[#0b2419] uppercase tracking-tighter">Pure Silence</h3>
                        <p className="text-sm font-bold text-slate-400 mt-2">New system alerts will manifest here.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-12">
                        {/* UNREAD SECTION */}
                        {unread.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 px-2">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Urgent Manifest</div>
                                    <div className="flex-1 h-px bg-red-100"></div>
                                </div>
                                <div className="space-y-4">
                                    {unread.map((n) => {
                                        const s = getNotificationStyle(n.title, n.message);
                                        return (
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={n.notification_id} 
                                                className="bg-white border border-slate-100 rounded-[32px] p-6 lg:p-8 flex gap-6 group hover:shadow-xl hover:shadow-[#0b2419]/5 transition-all"
                                            >
                                                <div className="shrink-0">
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: s.bg, color: s.color }}>
                                                        <s.icon size={24} />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-sm font-black text-[#0b2419] uppercase tracking-tight">{n.title}</h3>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                                                            <Clock size={12} />
                                                            {timeAgo(n.created_at)}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-slate-500 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: n.message.replace(/\n/g, '<br/>') }}></div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* READ SECTION */}
                        {read.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Archive Feed</div>
                                        <div className="flex-1 h-px bg-slate-100"></div>
                                    </div>
                                    <button 
                                        onClick={() => setShowAllRead(!showAllRead)}
                                        className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0b2419] flex items-center gap-2"
                                    >
                                        {showAllRead ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        {showAllRead ? 'Collapse' : `View ${read.length} more`}
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {(showAllRead ? read : read.slice(0, 3)).map((n) => {
                                        const s = getNotificationStyle(n.title, n.message);
                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 0.6 }}
                                                whileHover={{ opacity: 1 }}
                                                key={n.notification_id} 
                                                className="bg-slate-50/50 border border-transparent rounded-[32px] p-6 flex gap-6 transition-all grayscale hover:grayscale-0"
                                            >
                                                <div className="shrink-0">
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-slate-100 text-slate-300">
                                                        <s.icon size={20} />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-tight">{n.title}</h3>
                                                        <div className="text-[9px] font-bold text-slate-300 uppercase">{timeAgo(n.created_at)}</div>
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: n.message.replace(/\n/g, '<br/>') }}></div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
