"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export function MemberTopbar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState('light');
    const [scrolled, setScrolled] = useState(false);
    const [data, setData] = useState<any>(null);

    const [showUsr, setShowUsr] = useState(false);
    const [showMsg, setShowMsg] = useState(false);
    const [showNot, setShowNot] = useState(false);
    const [imgErr, setImgErr] = useState(false);

    const loadTopbarData = useCallback(async () => {
        try {
            const res = await apiFetch('/api/member/topbar');
            if (res && res.data) setData(res.data);
        } catch (e) {
            console.warn("[Topbar] API unavailable, using placeholders.");
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        loadTopbarData();
        
        // Polling for updates every 60s
        const interval = setInterval(loadTopbarData, 60000);

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme') || 'light';
            setTheme(saved);
            document.documentElement.setAttribute('data-bs-theme', saved);
            if (saved === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        }

        const closeAll = (e: MouseEvent) => {
            if (!(e.target as Element).closest('.tb-btn-wrap') && !(e.target as Element).closest('.tb-user-pill-container')) {
                setShowUsr(false); setShowMsg(false); setShowNot(false);
            }
        };
        window.addEventListener('click', closeAll);
        return () => {
            clearInterval(interval);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', closeAll);
        };
    }, [loadTopbarData]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-bs-theme', next);
        if (next === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', next);
    };

    const handleLogout = async () => {
        if (!confirm('Are you sure you want to sign out?')) return;
        try {
            await apiFetch('/api/v1/logout.php');
            window.location.href = '/login';
        } catch (e) {
            window.location.href = '/login';
        }
    };

    const getPageTitle = () => {
        const segments = pathname.split('/').filter(Boolean);
        const last = segments[segments.length - 1] || 'Dashboard';
        return last.charAt(0).toUpperCase() + last.slice(1).replace('_', ' ');
    };

    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff/3600)} hr ago`;
        return `${Math.floor(diff/86400)} day${Math.floor(diff/86400)>1?'s':''} ago`;
    };

    if (!mounted) return <nav className="top-navbar"></nav>;

    const memberName = data?.profile?.name || 'Member';
    const firstName  = memberName.split(' ')[0];
    const unreadMsgs = data?.unread?.messages || 0;
    const unreadNots = data?.unread?.notifications || 0;

    // Profile picture: API now returns a full data URI string
    const picSrc = data?.profile?.pic
        ?? `/assets/uploads/${data?.profile?.gender === 'female' ? 'female.jpg' : 'male.jpg'}`;

    // Avatar initials (2 chars) for text fallback
    const parts = memberName.split(' ');
    const initials = parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : memberName.slice(0, 2).toUpperCase();

    return (
        <nav className={`top-navbar ${scrolled ? 'scrolled' : ''}`}>
            {/* ── Left ── */}
            <div className="flex items-center gap-4">
                <button className="tb-mobile-btn lg:hidden" onClick={() => document.getElementById('sidebar')?.classList.toggle('mobile-open')} title="Menu">
                    <i className="bi bi-list"></i>
                </button>
                <div className="flex flex-col">
                    <div className="tb-page-title">{getPageTitle()}</div>
                    <div className="tb-welcome hidden md:flex items-center gap-1.5">
                        <span className="tb-online-dot"></span>
                        Welcome back, {firstName}
                    </div>
                </div>
            </div>

            {/* ── Right ── */}
            <div className="flex items-center gap-2 md:gap-3">
                <button className="tb-btn" onClick={toggleTheme} title="Toggle Theme">
                    <i className={theme === 'dark' ? "bi bi-sun" : "bi bi-moon-stars"}></i>
                </button>

                {/* Messages Dropdown */}
                <div className="relative tb-btn-wrap">
                    <button className={`tb-btn ${showMsg ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setShowMsg(!showMsg); setShowNot(false); setShowUsr(false); }} title="Messages">
                        <i className="bi bi-chat-dots-fill"></i>
                        {unreadMsgs > 0 && <span className="tb-dot"></span>}
                    </button>
                    {showMsg && (
                        <div className="tb-dropdown w-[360px] animate-in fade-in slide-in-from-top-2">
                            <div className="tb-dd-head">
                                <span className="tb-dd-title">Messages<span className="tb-dd-count">{unreadMsgs > 0 ? ` (${unreadMsgs} new)` : ''}</span></span>
                                <Link href="/member/messages" className="tb-dd-link">View All</Link>
                            </div>
                            <div className="tb-dd-scroll">
                                {data?.recent?.messages?.length > 0 ? data.recent.messages.map((m: any) => {
                                    const parts = m.sender_name.split(' ');
                                    const initial = parts.length > 1 ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase() : m.sender_name[0].toUpperCase();
                                    return (
                                        <Link key={m.message_id} href="/member/messages" className={`tb-msg-row ${m.is_read == 0 ? 'unread' : ''}`}>
                                            <div className="tb-msg-av">{initial}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className="tb-msg-sender">{m.sender_name}</span>
                                                    <span className="tb-msg-time">{timeAgo(m.sent_at)}</span>
                                                </div>
                                                <div className="tb-msg-body">{m.subject || m.body}</div>
                                            </div>
                                        </Link>
                                    );
                                }) : (
                                    <div className="tb-empty"><i className="bi bi-chat-square-dots"></i><p>No recent messages</p></div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Notifications Dropdown */}
                <div className="relative tb-btn-wrap">
                    <button className={`tb-btn ${showNot ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setShowNot(!showNot); setShowMsg(false); setShowUsr(false); }} title="Notifications">
                        <i className="bi bi-bell-fill"></i>
                        {unreadNots > 0 && <span className="tb-dot"></span>}
                    </button>
                    {showNot && (
                        <div className="tb-dropdown w-[360px] animate-in fade-in slide-in-from-top-2">
                            <div className="tb-dd-head">
                                <span className="tb-dd-title">Notifications<span className="tb-dd-count">{unreadNots > 0 ? ` (${unreadNots} unread)` : ''}</span></span>
                                <Link href="/member/notifications" className="tb-dd-link">Mark All Read</Link>
                            </div>
                            <div className="tb-dd-scroll">
                                {data?.recent?.notifications?.length > 0 ? data.recent.notifications.map((n: any) => {
                                    const msgLc = n.message.toLowerCase();
                                    let ico = 'bi-bell-fill', cls = 'nico-def';
                                    if (msgLc.includes('approved')) { ico = 'bi-check-circle-fill'; cls = 'nico-grn'; }
                                    if (msgLc.includes('rejected') || msgLc.includes('alert')) { ico = 'bi-exclamation-circle-fill'; cls = 'nico-red'; }
                                    if (msgLc.includes('warn')) { ico = 'bi-exclamation-triangle-fill'; cls = 'nico-amb'; }
                                    return (
                                        <Link key={n.notification_id} href="/member/notifications" className={`tb-notif-row ${n.status === 'unread' ? 'unread' : ''}`}>
                                            <div className={`tb-notif-ico ${cls}`}><i className={`bi ${ico}`}></i></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="tb-notif-msg">{n.message}</div>
                                                <div className="tb-notif-time"><i className="bi bi-clock"></i> {timeAgo(n.created_at)}</div>
                                            </div>
                                        </Link>
                                    );
                                }) : (
                                    <div className="tb-empty"><i className="bi bi-bell-slash"></i><p>No notifications</p></div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="tb-sep hidden md:block"></div>

                {/* User Dropdown */}
                <div className="relative tb-user-pill-container" onClick={(e) => { e.stopPropagation(); setShowUsr(!showUsr); setShowMsg(false); setShowNot(false); }} tabIndex={0}>
                    <div className="tb-user-pill">
                        <div className="hidden md:flex flex-col items-end gap-0">
                            <span className="tb-user-name">{memberName}</span>
                            <span className="tb-user-role-chip">MEMBER</span>
                        </div>
                        {imgErr ? (
                            <div className="tb-avatar flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg,#0b2419,#1d6044)', color: '#a3e635', border: '2px solid rgba(11,36,25,0.1)' }}>
                                {initials}
                            </div>
                        ) : (
                            <img
                                src={picSrc}
                                alt="Avatar"
                                className="tb-avatar"
                                onError={() => setImgErr(true)}
                            />
                        )}
                    </div>
                    {showUsr && (
                        <div className="tb-dropdown w-[210px] animate-in fade-in slide-in-from-top-2">
                            <div className="tb-profile-header">
                                <div className="tb-profile-name">{memberName}</div>
                                <div className="tb-profile-role">MEMBER</div>
                            </div>
                            <Link href="/member/profile" className="tb-menu-item">
                                <span className="tb-menu-ico"><i className="bi bi-person-fill"></i></span> My Profile
                            </Link>
                            <Link href="/member/settings" className="tb-menu-item">
                                <span className="tb-menu-ico"><i className="bi bi-gear-wide-connected"></i></span> Settings
                            </Link>
                            <div className="tb-menu-divider"></div>
                            <button onClick={handleLogout} className="tb-menu-item logout w-full text-left">
                                <span className="tb-menu-ico"><i className="bi bi-box-arrow-right"></i></span> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
