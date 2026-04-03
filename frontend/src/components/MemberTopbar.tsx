"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export function MemberTopbar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState('light');

    const [showUsr, setShowUsr] = useState(false);
    const [showMsg, setShowMsg] = useState(false);
    const [showNot, setShowNot] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) {
                setTheme(saved);
                document.documentElement.setAttribute('data-bs-theme', saved);
                if (saved === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
            }
        }

        // Close dropdowns on outside click
        const closeAll = (e: MouseEvent) => {
            if (!(e.target as Element).closest('.relative.group')) {
                setShowUsr(false); setShowMsg(false); setShowNot(false);
            }
        };
        window.addEventListener('click', closeAll);
        return () => window.removeEventListener('click', closeAll);
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
        const path = pathname.split('/').pop() || '';
        if (path === 'dashboard') return 'Dashboard';
        if (path === 'savings') return 'Savings';
        if (path === 'shares') return 'Shares Portfolio';
        if (path === 'loans') return 'My Loans';
        if (path === 'contributions') return 'Contributions';
        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    if (!mounted) return <nav className="top-navbar hd-layout"></nav>;

    return (
        <nav className="top-navbar hd-layout">
            <div className="flex items-center gap-3">
                <button className="tb-mobile-btn lg:hidden" onClick={toggleMobileMenu} title="Menu">
                    <i className="bi bi-list"></i>
                </button>
                <div>
                    <div className="tb-page-title">{getPageTitle()}</div>
                    <div className="tb-welcome hidden md:flex">
                        <span className="tb-online-dot"></span>
                        Welcome back, Member
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="tb-btn" onClick={toggleTheme} title="Toggle Theme">
                    <i className={theme === 'dark' ? "bi bi-sun" : "bi bi-moon-stars"}></i>
                </button>

                <div className="relative group">
                    <button className="tb-btn" onClick={(e) => { e.stopPropagation(); setShowMsg(!showMsg); setShowNot(false); setShowUsr(false); }} title="Messages">
                        <i className="bi bi-chat-dots-fill"></i>
                        <span className="tb-dot"></span>
                    </button>
                    {showMsg && (
                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0b2419] border border-emerald-900/10 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-emerald-900/5 dark:border-white/5 flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-widest dark:text-white">Messages</span>
                                <Link href="/member/messages" className="text-[10px] font-bold text-emerald-600 hover:underline">View All</Link>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <div className="p-8 text-center text-slate-400">
                                    <i className="bi bi-chat-left-dots text-2xl mb-2 block"></i>
                                    <div className="text-[10px] font-bold uppercase tracking-widest">No new messages</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <button className="tb-btn" onClick={(e) => { e.stopPropagation(); setShowNot(!showNot); setShowMsg(false); setShowUsr(false); }} title="Notifications">
                        <i className="bi bi-bell-fill"></i>
                        <span className="tb-dot"></span>
                    </button>
                    {showNot && (
                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0b2419] border border-emerald-900/10 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-emerald-900/5 dark:border-white/5 flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-widest dark:text-white">Notifications</span>
                                <Link href="/member/notifications" className="text-[10px] font-bold text-emerald-600 hover:underline">View All</Link>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <div className="p-8 text-center text-slate-400">
                                    <i className="bi bi-lightning-charge text-2xl mb-2 block"></i>
                                    <div className="text-[10px] font-bold uppercase tracking-widest">No new alerts</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="tb-sep hidden md:block mx-1"></div>

                <div className="relative group tb-user-pill-container" onClick={(e) => { e.stopPropagation(); setShowUsr(!showUsr); setShowMsg(false); setShowNot(false); }} tabIndex={0}>
                    <div className="tb-user-pill">
                        <div className="hidden md:flex flex-col items-end gap-0.5">
                            <span className="tb-user-name">Active Member</span>
                            <span className="tb-user-role-chip">MEMBER</span>
                        </div>
                        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Avatar" className="tb-avatar bg-white" />
                    </div>
                    {showUsr && (
                        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0b2419] border border-emerald-900/10 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                            <Link href="/member/profile" className="flex items-center gap-3 p-3 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-xl transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                    <i className="bi bi-person-circle"></i>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest dark:text-white">My Profile</span>
                            </Link>
                            <Link href="/member/settings" className="flex items-center gap-3 p-3 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-xl transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                    <i className="bi bi-gear-fill"></i>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest dark:text-white">Settings</span>
                            </Link>
                            <Link href="/member/support" className="flex items-center gap-3 p-3 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-xl transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                                    <i className="bi bi-question-circle-fill"></i>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest dark:text-white">Support</span>
                            </Link>
                            <hr className="my-2 border-emerald-900/5 dark:border-white/5" />
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all group text-red-600">
                                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <i className="bi bi-power"></i>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
