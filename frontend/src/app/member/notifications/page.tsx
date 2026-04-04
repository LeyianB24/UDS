"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import './notifications.css';

const getNotificationStyle = (title: string, msg: string) => {
    const t = (title + ' ' + msg).toLowerCase();
    if (t.includes('loan') || t.includes('credit') || t.includes('pay'))
        return { icon: 'bi-wallet2', bg: 'var(--grn-bg)', color: 'var(--grn)' };
    if (t.includes('approv') || t.includes('success'))
        return { icon: 'bi-check-circle-fill', bg: 'var(--grn-bg)', color: 'var(--grn)' };
    if (t.includes('reject') || t.includes('fail') || t.includes('error'))
        return { icon: 'bi-exclamation-triangle-fill', bg: 'var(--red-bg)', color: 'var(--red)' };
    if (t.includes('warn'))
        return { icon: 'bi-exclamation-circle-fill', bg: 'var(--amb-bg)', color: 'var(--amb)' };
    if (t.includes('welfare') || t.includes('heart'))
        return { icon: 'bi-heart-pulse-fill', bg: 'rgba(13,148,136,.08)', color: '#0d9488' };
    return { icon: 'bi-bell-fill', bg: 'rgba(11,36,25,.06)', color: 'var(--t2)' };
};

const timeAgo = (datetime: string) => {
    const diff = Math.floor((Date.now() - new Date(datetime).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            await apiFetch('/api/member/notifications', {
                method: 'POST',
                body: JSON.stringify({ action: 'mark_all_read' })
            });
        } catch (e) {
            console.error(e);
            loadData(); // Revert on failure
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635]"></div>
            </div>
        );
    }

    return (
        <div className="dash">
            {/* HERO */}
            <div className="notif-hero">
                <div className="hero-mesh"></div>
                <div className="hero-dots"></div>
                <div className="hero-ring r1"></div>
                <div className="hero-inner">
                    <div>
                        <div className="hero-eyebrow"><i className="bi bi-bell-fill mr-1"></i> Activity Feed</div>
                        <h1>Notifications</h1>
                        <p className="hero-sub opacity-70">Recent alerts and updates for your account</p>
                    </div>
                    <Link href="/member/dashboard" className="btn-back-hero">
                        <i className="bi bi-arrow-left"></i> Dashboard
                    </Link>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="stats-float">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sc">
                        <div className="sc-ico" style={{background:'var(--grn-bg)',color:'var(--grn)'}}><i className="bi bi-bell-fill"></i></div>
                        <div className="sc-lbl">Total</div>
                        <div className="sc-val">{notifications.length}</div>
                        <div className="sc-meta">Notifications on record</div>
                    </div>
                    <div className="sc">
                        <div className="sc-ico" style={{background: unread.length > 0 ? 'var(--red-bg)' : 'var(--grn-bg)', color: unread.length > 0 ? 'var(--red)' : 'var(--grn)' }}>
                            <i className={`bi bi-bell-${unread.length > 0 ? 'exclamation-fill' : 'fill'}`}></i>
                        </div>
                        <div className="sc-lbl">Unread</div>
                        <div className="sc-val" style={{color: unread.length > 0 ? 'var(--red)' : 'var(--grn)'}}>{unread.length}</div>
                        <div className="sc-meta">{unread.length > 0 ? 'Awaiting your attention' : 'All caught up!'}</div>
                    </div>
                    <div className="sc">
                        <div className="sc-ico" style={{background:'var(--lg)',color:'var(--lt)'}}><i className="bi bi-wallet2"></i></div>
                        <div className="sc-lbl">Financial</div>
                        <div className="sc-val">{financeCount}</div>
                        <div className="sc-meta">Loan &amp; payment alerts</div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body">
                <div className="max-w-4xl mx-auto">
                    {notifications.length === 0 ? (
                        <div className="notif-shell">
                            <div className="empty-well">
                                <div className="ew-ico"><i className="bi bi-bell-slash"></i></div>
                                <div className="ew-title">No Notifications Yet</div>
                                <div className="ew-sub text-gray-500">You&apos;re all caught up! New alerts will appear here.</div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* UNREAD */}
                            {unread.length > 0 ? (
                                <>
                                    <div className="notif-section-label nsl-unread">
                                        <i className="bi bi-circle-fill text-[5px]"></i> Unread ({unread.length})
                                    </div>
                                    <div className="notif-shell shell-unread">
                                        <div className="ns-head">
                                            <span className="ns-title text-[#dc2626]">
                                                <i className="bi bi-bell-exclamation-fill"></i>
                                                New Notifications
                                                <span className="bg-[#dc2626]/10 text-[#dc2626] text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ml-2">{unread.length} new</span>
                                            </span>
                                            <button className="btn-mark-all" onClick={markAllRead}>
                                                <i className="bi bi-check2-all mr-1"></i> Mark all read
                                            </button>
                                        </div>
                                        {unread.map((n, idx) => {
                                            const s = getNotificationStyle(n.title, n.message);
                                            return (
                                                <div key={n.notification_id} className="notif-row unread">
                                                    <div className="n-ico" style={{background: s.bg, color: s.color}}>
                                                        <i className={`bi ${s.icon}`}></i>
                                                    </div>
                                                    <div className="n-body">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="n-title">{n.title}<span className="unread-dot"></span></div>
                                                            <div className="n-time"><i className="bi bi-clock"></i>{timeAgo(n.created_at)}</div>
                                                        </div>
                                                        <div className="n-msg" dangerouslySetInnerHTML={{ __html: n.message.replace(/\n/g, '<br/>') }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-3 bg-[#16a34a]/5 border border-[#16a34a]/20 rounded-xl p-4 mb-6 text-[#16a34a] text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-500">
                                    <i className="bi bi-check-circle-fill text-lg"></i>
                                    You&apos;re all caught up! No unread notifications.
                                </div>
                            )}

                            {/* READ */}
                            {read.length > 0 && (
                                <>
                                    <div className="notif-section-label nsl-read mt-8">
                                        <i className="bi bi-check2"></i> Previously Read ({read.length})
                                    </div>
                                    <div className="notif-shell">
                                        <div className="ns-head">
                                            <span className="ns-title text-gray-400">
                                                <i className="bi bi-bell-fill"></i>
                                                Read Notifications
                                                <span className="bg-gray-100 dark:bg-white/5 text-gray-500 text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ml-2">{read.length} items</span>
                                            </span>
                                            <button 
                                                className="bg-gray-100 dark:bg-white/5 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2"
                                                onClick={() => setShowAllRead(!showAllRead)}
                                            >
                                                <i className={`bi bi-chevron-${showAllRead ? 'up' : 'down'}`}></i>
                                                {showAllRead ? 'Show less' : 'Show all'}
                                            </button>
                                        </div>
                                        {(showAllRead ? read : read.slice(0, 3)).map((n, idx) => {
                                            const s = getNotificationStyle(n.title, n.message);
                                            return (
                                                <div key={n.notification_id} className="notif-row read opacity-60 hover:opacity-100 grayscale hover:grayscale-0">
                                                    <div className="n-ico" style={{background: s.bg, color: s.color}}>
                                                        <i className={`bi ${s.icon}`}></i>
                                                    </div>
                                                    <div className="n-body">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="n-title">{n.title}</div>
                                                            <div className="n-time"><i className="bi bi-clock"></i>{timeAgo(n.created_at)}</div>
                                                        </div>
                                                        <div className="n-msg" dangerouslySetInnerHTML={{ __html: n.message.replace(/\n/g, '<br/>') }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="text-center py-4 text-[10px] font-bold text-gray-300 tracking-widest uppercase border-t border-gray-50 dark:border-white/5">
                                            &mdash; End of Notifications &mdash;
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
