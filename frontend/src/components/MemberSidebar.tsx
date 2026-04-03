"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MemberSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sb_collapsed');
            if (saved === '1') {
                setIsCollapsed(true);
                document.body.classList.add('sb-collapsed');
            }
        }
    }, []);

    const toggleCollapse = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        document.body.classList.toggle('sb-collapsed', next);
        localStorage.setItem('sb_collapsed', next ? '1' : '0');
    };

    if (!mounted) return <aside className="hd-sidebar"></aside>;

    const isActive = (paths: string[]) => {
        for(let p of paths) { 
            if (pathname.includes(p)) return 'active'; 
        }
        return '';
    };

    return (
        <aside className="hd-sidebar hd-layout" id="sidebar" role="navigation" aria-label="Main Navigation">
            <Link href="/member/dashboard" className="hd-brand">
                <div className="hd-brand-inner">
                    <div className="hd-logo-wrap">
                        <img src="/logo.png" alt="Logo" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />
                    </div>
                    <div className="hd-brand-text">
                        <div className="hd-brand-name">Umoja Drivers Sacco</div>
                        <div className="hd-brand-role">Member Portal</div>
                    </div>
                </div>
            </Link>

            <div className="hd-scroll-wrapper">
                <div className="hd-scroll-area">
                    <Link href="/member/dashboard" className={`hd-nav-link ${isActive(['/member/dashboard'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-grid-fill"></i></span><span className="hd-nav-text">Dashboard</span>
                    </Link>

                    <span className="hd-section-label">Personal Finances</span>
                    <Link href="/member/savings" className={`hd-nav-link ${isActive(['/member/savings'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-piggy-bank-fill"></i></span><span className="hd-nav-text">Savings</span>
                    </Link>
                    <Link href="/member/shares" className={`hd-nav-link ${isActive(['/member/shares'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-pie-chart-fill"></i></span><span className="hd-nav-text">Shares Portfolio</span>
                    </Link>
                    <Link href="/member/loans" className={`hd-nav-link ${isActive(['/member/loans'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-cash-stack"></i></span><span className="hd-nav-text">My Loans</span>
                    </Link>
                    <Link href="/member/contributions" className={`hd-nav-link ${isActive(['/member/contributions'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-calendar-check-fill"></i></span><span className="hd-nav-text">Contributions</span>
                    </Link>

                    <span className="hd-section-label">Welfare &amp; Solidarity</span>
                    <Link href="/member/welfare" className={`hd-nav-link ${isActive(['/member/welfare'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-heart-pulse-fill"></i></span><span className="hd-nav-text">Welfare Hub</span>
                    </Link>

                    <span className="hd-section-label">Utilities</span>
                    <Link href="/member/mpesa" className={`hd-nav-link ${isActive(['/member/mpesa'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-phone-vibrate-fill"></i></span><span className="hd-nav-text">Pay Via M-Pesa</span>
                    </Link>
                    <Link href="/member/withdraw" className={`hd-nav-link ${isActive(['/member/withdraw'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-wallet2"></i></span><span className="hd-nav-text">Withdraw Funds</span>
                    </Link>
                    <Link href="/member/transactions" className={`hd-nav-link ${isActive(['/member/transactions'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-arrow-left-right"></i></span><span className="hd-nav-text">All Transactions</span>
                    </Link>
                    <Link href="/member/notifications" className={`hd-nav-link ${isActive(['/member/notifications'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-bell-fill"></i></span><span className="hd-nav-text">Notifications</span>
                    </Link>
                    <Link href="/member/messages" className={`hd-nav-link ${isActive(['/member/messages'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-chat-dots-fill"></i></span><span className="hd-nav-text">Messages</span>
                    </Link>

                    <span className="hd-section-label">Account</span>
                    <Link href="/member/profile" className={`hd-nav-link ${isActive(['/member/profile'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-person-circle"></i></span><span className="hd-nav-text">My Profile</span>
                    </Link>
                    <Link href="/member/settings" className={`hd-nav-link ${isActive(['/member/settings'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-gear-fill"></i></span><span className="hd-nav-text">Account Settings</span>
                    </Link>
                    <Link href="/member/support" className={`hd-nav-link ${isActive(['/member/support'])}`}>
                        <span className="hd-nav-icon"><i className="bi bi-question-circle-fill"></i></span><span className="hd-nav-text">Support Hub</span>
                    </Link>
                </div>
            </div>
            
            <button className="hd-toggle-btn hidden lg:flex" onClick={toggleCollapse} title="Toggle sidebar">
                <i className="bi bi-layout-sidebar-reverse"></i>
            </button>
        </aside>
    );
}
