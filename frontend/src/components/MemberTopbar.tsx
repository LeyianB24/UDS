"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MemberTopbar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState('light');

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
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-bs-theme', next);
        if (next === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', next);
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
                    <button className="tb-btn" title="Messages">
                        <i className="bi bi-chat-dots-fill"></i>
                        <span className="tb-dot"></span>
                    </button>
                    {/* Placeholder dropdown content would go here */}
                </div>

                <div className="relative group">
                    <button className="tb-btn" title="Notifications">
                        <i className="bi bi-bell-fill"></i>
                        <span className="tb-dot"></span>
                    </button>
                </div>

                <div className="tb-sep hidden md:block mx-1"></div>

                <div className="relative group tb-user-pill-container" tabIndex={0}>
                    <div className="tb-user-pill">
                        <div className="hidden md:flex flex-col items-end gap-0.5">
                            <span className="tb-user-name">Active Member</span>
                            <span className="tb-user-role-chip">MEMBER</span>
                        </div>
                        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Avatar" className="tb-avatar bg-white" />
                    </div>
                    {/* Placeholder for Profile Dropdown */}
                </div>
            </div>
        </nav>
    );
}
