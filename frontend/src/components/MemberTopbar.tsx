"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export function MemberTopbar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState('light');
    const [scrolled, setScrolled] = useState(false);

    const [showUsr, setShowUsr] = useState(false);
    const [showMsg, setShowMsg] = useState(false);
    const [showNot, setShowNot] = useState(false);

    useEffect(() => {
        setMounted(true);
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
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', closeAll);
        };
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-bs-theme', next);
        if (next === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
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

    const toggleMobileMenu = () => {
        document.getElementById('sidebar')?.classList.toggle('mobile-open');
    };

    const getPageTitle = () => {
        const segments = pathname.split('/').filter(Boolean);
        const last = segments[segments.length - 1] || 'Dashboard';
        return last.charAt(0).toUpperCase() + last.slice(1).replace('_', ' ');
    };

    if (!mounted) return <nav className="top-navbar"></nav>;

    return (
        <nav className={`top-navbar ${scrolled ? 'scrolled' : ''}`}>
            {/* ── Left: title ── */}
            <div className="flex items-center gap-4">
                <button className="tb-mobile-btn lg:hidden" onClick={toggleMobileMenu} title="Menu">
                    <i className="bi bi-list"></i>
                </button>
                <div className="flex flex-col">
                    <div className="tb-page-title">{getPageTitle()}</div>
                    <div className="tb-welcome hidden md:flex items-center gap-1.5 text-[0.7rem] font-semibold text-emerald-600/70 dark:text-emerald-400/50">
                        <span className="tb-online-dot"></span>
                        Welcome back, Member
                    </div>
                </div>
            </div>

            {/* ── Right: actions ── */}
            <div className="flex items-center gap-2 md:gap-3">
                
                {/* Theme Toggle */}
                <button className="tb-btn" onClick={toggleTheme} title="Toggle Theme">
                    <i className={theme === 'dark' ? "bi bi-sun" : "bi bi-moon-stars"}></i>
                </button>

                {/* Messages Dropdown */}
                <div className="relative tb-btn-wrap">
                    <button className={`tb-btn ${showMsg ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setShowMsg(!showMsg); setShowNot(false); setShowUsr(false); }} title="Messages">
                        <i className="bi bi-chat-dots-fill"></i>
                        <span className="tb-dot"></span>
                    </button>
                    {showMsg && (
                        <div className="tb-dropdown p-2 animate-in fade-in slide-in-from-top-2">
                            <div className="tb-dd-head">
                                <span className="tb-dd-title">Messages <span className="tb-dd-count opacity-50">(3 new)</span></span>
                                <Link href="/member/messages" className="tb-dd-link">View All</Link>
                            </div>
                            <div className="max-h-[320px] overflow-y-auto">
                                {[1,2,3].map(i => (
                                    <Link key={i} href="/member/messages" className="tb-msg-row unread">
                                        <div className="tb-msg-av">U</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="tb-msg-sender">System Support</span>
                                                <span className="tb-msg-time">{i} hr ago</span>
                                            </div>
                                            <div className="tb-msg-body">Your recent deposit of KES 5,000 has been confirmed.</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Notifications Dropdown */}
                <div className="relative tb-btn-wrap">
                    <button className={`tb-btn ${showNot ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setShowNot(!showNot); setShowMsg(false); setShowUsr(false); }} title="Notifications">
                        <i className="bi bi-bell-fill"></i>
                        <span className="tb-dot"></span>
                    </button>
                    {showNot && (
                        <div className="tb-dropdown p-2 animate-in fade-in slide-in-from-top-2">
                            <div className="tb-dd-head">
                                <span className="tb-dd-title">Notifications <span className="tb-dd-count opacity-50">(2 unread)</span></span>
                                <Link href="/member/notifications" className="tb-dd-link">Mark All Read</Link>
                            </div>
                            <div className="max-h-[320px] overflow-y-auto">
                                <div className="tb-notif-row unread">
                                    <div className="tb-notif-ico nico-grn"><i className="bi bi-check-circle-fill"></i></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="tb-notif-msg">Your loan application for KES 50,000 was approved!</div>
                                        <div className="tb-notif-time"><i className="bi bi-clock"></i> 2 hrs ago</div>
                                    </div>
                                </div>
                                <div className="tb-notif-row">
                                    <div className="tb-notif-ico nico-amb"><i className="bi bi-exclamation-triangle-fill"></i></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="tb-notif-msg">Annual General Meeting is scheduled for next month.</div>
                                        <div className="tb-notif-time"><i className="bi bi-clock"></i> 1 day ago</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="tb-sep hidden md:block"></div>

                {/* User Dropdown */}
                <div className="relative tb-user-pill-container" onClick={(e) => { e.stopPropagation(); setShowUsr(!showUsr); setShowMsg(false); setShowNot(false); }} tabIndex={0}>
                    <div className="tb-user-pill">
                        <div className="hidden md:flex flex-col items-end gap-0">
                            <span className="tb-user-name">Member Name</span>
                            <span className="tb-user-role-chip">MEMBER</span>
                        </div>
                        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Avatar" className="tb-avatar" />
                    </div>
                    {showUsr && (
                        <div className="tb-dropdown p-2 w-[210px] animate-in fade-in slide-in-from-top-2">
                            <div className="tb-profile-header mb-2 p-2">
                                <div className="tb-profile-name">Member Name</div>
                                <div className="tb-profile-role">Active Member</div>
                            </div>
                            {[
                                { lbl: 'My Profile', href: '/member/profile', ico: 'bi-person-fill', clr: 'tb-bg2' },
                                { lbl: 'Settings', href: '/member/settings', ico: 'bi-gear-wide-connected', clr: 'tb-bg2' },
                            ].map((m, i) => (
                                <Link key={i} href={m.href} className="tb-menu-item">
                                    <span className="tb-menu-ico"><i className={`bi ${m.ico}`}></i></span> {m.lbl}
                                </Link>
                            ))}
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
