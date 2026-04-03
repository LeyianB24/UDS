"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export function LandingNavbar() {
    const [user, setUser] = useState<{ authenticated: boolean; portal?: string } | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        fetchApi('auth_status').then(res => setUser(res));
        // Client-side theme init
        const storedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
        if (storedTheme !== 'light') {
            setTheme(storedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        document.documentElement.setAttribute('data-bs-theme', nextTheme);
    };

    return (
        <header className="site-header">
            <nav className="site-navbar navbar navbar-expand-lg">
                <div className="container">
                    <Link className="nb-brand navbar-brand" href="/">
                        <div className="nb-logo-wrap">
                            <img src="/assets/images/people_logo.png" alt="Logo" />
                        </div>
                        <div>
                            <div className="nb-brand-name">UMOJA Sacco</div>
                            <div className="nb-brand-tagline d-none d-sm-block">Drivers Sacco</div>
                        </div>
                    </Link>

                    <div className="d-flex align-items-center gap-2 d-lg-none">
                        <button className="nb-theme-btn" type="button" onClick={toggleTheme} title="Toggle Theme">
                            <i className={theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'}></i>
                        </button>
                        <button className="nb-mobile-toggle navbar-toggler" type="button"
                                data-bs-toggle="collapse" data-bs-target="#mainNav"
                                aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
                            <i className="bi bi-list"></i>
                        </button>
                    </div>

                    <div className="collapse navbar-collapse" id="mainNav">
                        <ul className="nb-nav ms-auto align-items-center mb-0">
                            <li><Link href="/" className="nb-nav-link active">Home</Link></li>
                            <li><Link href="/#about" className="nb-nav-link">About Us</Link></li>
                            <li><Link href="/#services" className="nb-nav-link">Services</Link></li>
                            <li><Link href="/#contact" className="nb-nav-link">Contact</Link></li>

                            <li className="d-none d-lg-block"><div className="nb-divider"></div></li>

                            {user?.authenticated ? (
                                <li className="dropdown">
                                    <a className="nb-account-trigger" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <span className="nb-avatar"><i className="bi bi-person-fill"></i></span>
                                        Account
                                        <i className="bi bi-chevron-down" style={{ fontSize: '0.6rem', opacity: 0.7, marginLeft: '6px' }}></i>
                                    </a>
                                    <ul className="dropdown-menu nb-dropdown dropdown-menu-end">
                                        <li>
                                            <Link className="nb-dropdown-item" href={user.portal === 'admin' ? '/admin/dashboard' : '/member/dashboard'}>
                                                <span className="nb-dropdown-icon"><i className="bi bi-grid-fill"></i></span> Dashboard
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="nb-dropdown-item" href="/member/profile">
                                                <span className="nb-dropdown-icon"><i className="bi bi-person-fill"></i></span> Profile
                                            </Link>
                                        </li>
                                        <li><div className="nb-dropdown-divider"></div></li>
                                        <li>
                                            <Link href="/logout" className="nb-dropdown-item danger">
                                                <span className="nb-dropdown-icon"><i className="bi bi-power"></i></span> Sign Out
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            ) : (
                                <>
                                    <li>
                                        <Link href="/login" className="btn-nb-login">
                                            <i className="bi bi-box-arrow-in-right"></i> Log In
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/register" className="btn-nb-register">
                                            <i className="bi bi-person-plus-fill"></i> Join Us
                                        </Link>
                                    </li>
                                </>
                            )}

                            <li>
                                <button className="nb-theme-btn ms-1 d-none d-lg-flex" type="button" onClick={toggleTheme} title="Toggle Theme">
                                    <i className={theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'}></i>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}
