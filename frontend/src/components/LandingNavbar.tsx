"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export function LandingNavbar() {
    const [user, setUser] = useState<{ authenticated: boolean; portal?: string } | null>(null);

    useEffect(() => {
        fetchApi('auth_status').then(res => setUser(res));
    }, []);

    return (
        <header className="site-header">
            <nav className="site-navbar navbar flex justify-between px-[16px] lg:px-24">
                <div className="container d-flex align-items-center justify-content-between">
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
                        <button className="nb-theme-btn" id="themeToggleMobile" title="Toggle Theme">
                            <i className="bi bi-moon-stars-fill" id="themeIconMobile"></i>
                        </button>
                        <button className="nb-mobile-toggle navbar-toggler" type="button"
                                data-bs-toggle="collapse" data-bs-target="#mainNav"
                                aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
                            <i className="bi bi-list"></i>
                        </button>
                    </div>

                    <div className="collapse navbar-collapse flex-grow-0" id="mainNav">
                        <ul className="nb-nav ms-auto align-items-center mb-0">
                            <li><Link href="/" className="nb-nav-link active">Home</Link></li>
                            <li><Link href="/#about" className="nb-nav-link">About Us</Link></li>
                            <li><Link href="/#services" className="nb-nav-link">Services</Link></li>
                            <li><Link href="/#contact" className="nb-nav-link">Contact</Link></li>

                            <li className="d-none d-lg-block"><div className="nb-divider"></div></li>

                            {user?.authenticated ? (
                                <li className="dropdown">
                                    <Link className="nb-account-trigger" href={user.portal === 'admin' ? '/admin/dashboard' : '/member/dashboard'}>
                                        <span className="nb-avatar"><i className="bi bi-person-fill"></i></span>
                                        My Portal
                                    </Link>
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
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}
