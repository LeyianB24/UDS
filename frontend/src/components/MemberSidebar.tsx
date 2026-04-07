"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export function MemberSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sb_collapsed');
            if (saved === '1') {
                setIsCollapsed(true);
                document.body.classList.add('sb-collapsed');
            }
        }

        // Close on window resize if switching to desktop
        const handleResize = () => {
            if (window.innerWidth >= 992) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleCollapse = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        document.body.classList.toggle('sb-collapsed', next);
        localStorage.setItem('sb_collapsed', next ? '1' : '0');
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

    const isActive = (path: string) => {
        return pathname === path ? 'active' : '';
    };

    if (!mounted) return <aside className="hd-sidebar"></aside>;

    return (
        <>
            {/* Backdrop for mobile */}
            <div className={`sidebar-backdrop ${isMobileOpen ? 'show' : ''}`} onClick={() => setIsMobileOpen(false)}></div>

            {/* Toggle Button for desktop */}
            <button className="hd-toggle-btn hidden lg:flex" onClick={toggleCollapse} title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                <i className={isCollapsed ? "bi bi-layout-sidebar" : "bi bi-layout-sidebar-reverse"}></i>
            </button>

            <aside className={`hd-sidebar ${isMobileOpen ? 'mobile-open' : ''}`} id="sidebar">
                
                {/* Brand */}
                <Link href="/member/dashboard" className="hd-brand">
                    <div className="hd-brand-inner">
                        <div className="hd-logo-wrap">
                            <img src="/logo.png" alt="Logo" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />
                        </div>
                        <div className="hd-brand-text">
                            <div className="hd-brand-name">UMOJA SACCO</div>
                            <div className="hd-brand-role">Member Portal</div>
                        </div>
                    </div>
                </Link>

                {/* Main Nav Scrollable */}
                <div className="hd-scroll-wrapper">
                    <div className="hd-scroll-area">
                        
                        <Link href="/member/dashboard" className={`hd-nav-link ${isActive('/member/dashboard')}`}>
                            <span className="hd-nav-icon"><i className="bi bi-grid-fill"></i></span>
                            <span className="hd-nav-text">Dashboard</span>
                        </Link>

                        <span className="hd-section-label">Personal Finances</span>
                        {[
                            { lbl: 'Savings', href: '/member/savings', ico: 'bi-piggy-bank-fill' },
                            { lbl: 'Shares Portfolio', href: '/member/shares', ico: 'bi-pie-chart-fill' },
                            { lbl: 'My Loans', href: '/member/loans', ico: 'bi-cash-stack' },
                            { lbl: 'Digital Wallet', href: '/member/wallet', ico: 'bi-wallet2' },
                            { lbl: 'Contributions', href: '/member/contributions', ico: 'bi-calendar-check-fill' },
                        ].map((m, i) => (
                            <Link key={i} href={m.href} className={`hd-nav-link ${isActive(m.href)}`}>
                                <span className="hd-nav-icon"><i className={`bi ${m.ico}`}></i></span>
                                <span className="hd-nav-text">{m.lbl}</span>
                            </Link>
                        ))}

                        <span className="hd-section-label">Welfare & Solidarity</span>
                        <Link href="/member/welfare" className={`hd-nav-link ${isActive('/member/welfare')}`}>
                            <span className="hd-nav-icon"><i className="bi bi-heart-pulse-fill"></i></span>
                            <span className="hd-nav-text">Welfare Hub</span>
                        </Link>

                        <span className="hd-section-label">Utilities</span>
                        {[
                            { lbl: 'Pay Via M-Pesa', href: '/member/wallet?action=deposit', ico: 'bi-phone-vibrate-fill' },
                            { lbl: 'Withdraw Funds', href: '/member/wallet?action=withdraw', ico: 'bi-wallet2' },
                            { lbl: 'Messages', href: '/member/messages', ico: 'bi-chat-right-dots-fill' },
                            { lbl: 'All Transactions', href: '/member/transactions', ico: 'bi-arrow-left-right' },
                            { lbl: 'Notifications', href: '/member/notifications', ico: 'bi-bell-fill' },
                        ].map((m, i) => (
                            <Link key={i} href={m.href} className={`hd-nav-link ${isActive(m.href)}`}>
                                <span className="hd-nav-icon"><i className={`bi ${m.ico}`}></i></span>
                                <span className="hd-nav-text">{m.lbl}</span>
                            </Link>
                        ))}

                        <span className="hd-section-label">Account</span>
                        {[
                            { lbl: 'My Profile', href: '/member/profile', ico: 'bi-person-circle' },
                            { lbl: 'Settings', href: '/member/settings', ico: 'bi-gear-wide-connected' },
                        ].map((m, i) => (
                            <Link key={i} href={m.href} className={`hd-nav-link ${isActive(m.href)}`}>
                                <span className="hd-nav-icon"><i className={`bi ${m.ico}`}></i></span>
                                <span className="hd-nav-text">{m.lbl}</span>
                            </Link>
                        ))}

                        {/* Support Widget - Refined for Messaging Integration */}
                        {!isCollapsed && (
                            <div className="hd-support-widget">
                                <div className="sw-dots"></div>
                                <h6>Need Help?</h6>
                                <p>Talk to our concierge for instant assistance.</p>
                                <Link href="/member/messages" className="hd-support-btn">
                                    <i className="bi bi-headset"></i> Instant Chat
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Footer */}
                <div className="hd-footer">
                    <button onClick={handleLogout} className="hd-logout-btn">
                        <span className="hd-logout-icon"><i className="bi bi-box-arrow-right"></i></span>
                        <span className="hd-logout-label">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
