"use client";

import React from 'react';
import Link from 'next/link';

export function MemberFooter() {
    return (
        <footer className="mf-footer" id="contact">
            {/* Dot grid overlay */}
            <div className="mf-bg-grid"></div>

            <div className="mf-upper">
                <div className="row gy-5">
                    {/* ── Brand ── */}
                    <div className="col-lg-4 col-md-6">
                        <Link href="/member/dashboard" className="mf-brand-row">
                            <div className="mf-brand-icon">
                                <img src="/logo.png" alt="Umoja Sacco" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />
                            </div>
                            <div>
                                <div className="mf-brand-name">Umoja Drivers Sacco</div>
                                <div className="mf-brand-tag">Trusted Financial Partner</div>
                            </div>
                        </Link>
                        <p className="mf-desc">
                            Empowering our members with financial stability through reliable savings and credit solutions.
                        </p>
                        <div className="mf-sec-label">Mobile App</div>
                        <div className="mf-app-row">
                            <a href="#" className="mf-app-btn">
                                <i className="bi bi-google-play"></i>
                                <div><span className="mf-app-sup">Get it on</span><span className="mf-app-name">Google Play</span></div>
                            </a>
                            <a href="#" className="mf-app-btn">
                                <i className="bi bi-apple"></i>
                                <div><span className="mf-app-sup">Download on</span><span className="mf-app-name">App Store</span></div>
                            </a>
                        </div>
                        <div className="mf-trust-row">
                            <span className="mf-trust-badge mf-tb-secure"><i className="bi bi-shield-lock-fill"></i> SSL Secured</span>
                            <span className="mf-trust-badge mf-tb-mpesa"><i className="bi bi-phone-fill"></i> M-Pesa Ready</span>
                            <span className="mf-trust-badge mf-tb-cbk"><i className="bi bi-bank2"></i> CBK Regulated</span>
                        </div>
                    </div>

                    {/* ── My Account ── */}
                    <div className="col-lg-2 col-md-3 col-6">
                        <div className="mf-col-head">My Account</div>
                        <ul className="mf-links">
                            {[
                                { lbl: 'Dashboard', href: '/member/dashboard' },
                                { lbl: 'Savings', href: '/member/savings' },
                                { lbl: 'Shares', href: '/member/shares' },
                                { lbl: 'My Loans', href: '/member/loans' },
                                { lbl: 'Contributions', href: '/member/contributions' },
                                { lbl: 'Transactions', href: '/member/transactions' },
                                { lbl: 'Welfare Hub', href: '/member/welfare' }
                            ].map((l, i) => (
                                <li key={i}><Link href={l.href} className="mf-link"><span className="mf-link-dot"></span>{l.lbl}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Help & Legal ── */}
                    <div className="col-lg-2 col-md-3 col-6">
                        <div className="mf-col-head">Help & Legal</div>
                        <ul className="mf-links">
                            {[
                                { lbl: 'Help Center', href: '/member/support' },
                                { lbl: 'Notifications', href: '/member/notifications' },
                                { lbl: 'My Profile', href: '/member/profile' },
                                { lbl: 'Settings', href: '/member/settings' },
                                { lbl: 'Terms of Service', href: '/member/terms' },
                                { lbl: 'Privacy Policy', href: '/member/privacy' },
                                { lbl: 'FAQs', href: '/member/faqs' }
                            ].map((l, i) => (
                                <li key={i}><Link href={l.href} className="mf-link"><span className="mf-link-dot"></span>{l.lbl}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Contact & Social ── */}
                    <div className="col-lg-4 col-md-12">
                        <div className="mf-col-head">Get in Touch</div>
                        <ul className="mf-contact">
                            <li>
                                <span className="mf-ci mf-ci-loc"><i className="bi bi-geo-alt-fill"></i></span>
                                <span>123 Umoja Plaza, Nairobi, Kenya</span>
                            </li>
                            <li>
                                <span className="mf-ci mf-ci-mail"><i className="bi bi-envelope-fill"></i></span>
                                <a href="mailto:support@umojasacco.co.ke">support@umojasacco.co.ke</a>
                            </li>
                            <li>
                                <span className="mf-ci mf-ci-phone"><i className="bi bi-telephone-fill"></i></span>
                                <a href="tel:+254700000000">+254 700 000 000</a>
                            </li>
                        </ul>
                        <div className="mf-sec-label">Office Hours</div>
                        <table className="mf-hours">
                            <tbody>
                                <tr><td className="hday">Mon – Fri</td><td className="htime">08:00 – 17:00</td></tr>
                                <tr><td className="hday">Saturday</td><td className="htime">09:00 – 13:00</td></tr>
                                <tr><td className="hday">Sunday</td><td className="htime closed text-red-500">Closed</td></tr>
                            </tbody>
                        </table>
                        <div className="mf-sec-label">Follow Us</div>
                        <div className="mf-socials">
                            {['facebook', 'twitter-x', 'instagram', 'youtube', 'whatsapp'].map(s => (
                                <a key={s} href="#" className="mf-social-btn" title={s}><i className={`bi bi-${s}`}></i></a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <hr className="mf-divider" />

            {/* Bottom bar */}
            <div className="mf-bottom">
                <div className="mf-copy">
                    &copy; {new Date().getFullYear()} <span className="mf-cdot"></span> <strong>Umoja Drivers Sacco</strong> <span className="mf-cdot"></span> All rights reserved.
                </div>
                <div className="mf-meta">
                    <span className="mf-ssl"><i className="bi bi-shield-lock-fill"></i> SSL Secured</span>
                    <span className="mf-msep"></span>
                    <Link href="/member/privacy" className="mf-mlink">Privacy</Link>
                    <span className="mf-msep"></span>
                    <Link href="/member/terms" className="mf-mlink">Terms</Link>
                    <span className="mf-msep"></span>
                    <span style={{fontSize: '.65rem', color: 'var(--t3)'}}>v1.2</span>
                </div>
            </div>
        </footer>
    );
}
