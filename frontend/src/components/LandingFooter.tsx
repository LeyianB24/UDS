"use client";

import React from 'react';
import Link from 'next/link';

export function LandingFooter() {
    return (
        <footer className="lp-footer" id="contact">
            <div className="container position-relative" style={{ zIndex: 2 }}>
                <div className="row gy-5">
                    {/* ── Brand Column ── */}
                    <div className="col-lg-4 col-md-6">
                        <div className="ft-logo-wrap">
                            <img src="/assets/images/people_logo.png" alt="Logo" className="ft-logo-img" />
                            <div>
                                <div className="ft-brand-name">Umoja Sacco</div>
                                <div className="ft-brand-sub">Drivers Sacco Ltd.</div>
                            </div>
                        </div>
                        <p className="ft-desc">
                            Empowering members through unity, reliable savings, transparent lending, and sustainable investment in the transport sector.
                        </p>
                        <div className="ft-pillars-label">Our Core Pillars</div>
                        <div className="ft-pillars">
                            <span className="ft-pill"><i className="bi bi-piggy-bank-fill"></i> Savings</span>
                            <span className="ft-pill"><i className="bi bi-cash-stack"></i> Loans</span>
                            <span className="ft-pill"><i className="bi bi-graph-up-arrow"></i> Investment</span>
                            <span className="ft-pill"><i className="bi bi-heart-pulse-fill"></i> Welfare</span>
                        </div>
                    </div>

                    {/* ── Quick Links ── */}
                    <div className="col-lg-2 col-md-6">
                        <div className="ft-col-heading">Quick Links</div>
                        <ul className="ft-links">
                            <li><Link href="/" className="ft-link"><i className="bi bi-chevron-right"></i> Home</Link></li>
                            <li><Link href="/#about" className="ft-link"><i className="bi bi-chevron-right"></i> About Us</Link></li>
                            <li><Link href="/#services" className="ft-link"><i className="bi bi-chevron-right"></i> Services</Link></li>
                            <li><Link href="/#portfolio" className="ft-link"><i className="bi bi-chevron-right"></i> Assets</Link></li>
                            <li><Link href="/login" className="ft-link"><i className="bi bi-chevron-right"></i> Member Login</Link></li>
                            <li><Link href="/register" className="ft-link"><i className="bi bi-chevron-right"></i> Join Umoja</Link></li>
                        </ul>
                    </div>

                    {/* ── Contact ── */}
                    <div className="col-lg-3 col-md-6">
                        <div className="ft-col-heading">Contact</div>
                        <ul className="ft-contact">
                            <li>
                                <span className="ft-contact-icon ft-contact-icon-loc"><i className="bi bi-geo-alt-fill"></i></span>
                                <span>CBD, Nairobi, Kenya</span>
                            </li>
                            <li>
                                <span className="ft-contact-icon ft-contact-icon-phone"><i className="bi bi-telephone-fill"></i></span>
                                <a href="tel:+254755758208">+254 755 758 208</a>
                            </li>
                            <li>
                                <span className="ft-contact-icon ft-contact-icon-mail"><i className="bi bi-envelope-fill"></i></span>
                                <a href="mailto:info@umojadrivers.co.ke">info@umojadrivers.co.ke</a>
                            </li>
                            <li>
                                <span className="ft-contact-icon ft-contact-icon-pay"><i className="bi bi-credit-card-2-front-fill"></i></span>
                                <span className="ft-paybill">Paybill: 247247</span>
                            </li>
                        </ul>
                    </div>

                    {/* ── Socials ── */}
                    <div className="col-lg-3 col-md-6">
                        <div className="ft-col-heading">Follow Us</div>
                        <div className="ft-social-label">Stay connected</div>
                        <div className="ft-socials">
                            <a href="https://wa.me/254755758208" className="ft-social-btn" target="_blank" rel="noreferrer" title="WhatsApp">
                                <i className="bi bi-whatsapp"></i>
                            </a>
                            <a href="https://facebook.com/umojadriverssacco" className="ft-social-btn" target="_blank" rel="noreferrer" title="Facebook"><i className="bi bi-facebook"></i></a>
                            <a href="https://twitter.com/umojadrivers" className="ft-social-btn" target="_blank" rel="noreferrer" title="Twitter/X"><i className="bi bi-twitter-x"></i></a>
                            <a href="https://instagram.com/umojadriverssacco" className="ft-social-btn" target="_blank" rel="noreferrer" title="Instagram"><i className="bi bi-instagram"></i></a>
                            <a href="https://youtube.com/umojadriverssacco" className="ft-social-btn" target="_blank" rel="noreferrer" title="YouTube"><i className="bi bi-youtube"></i></a>
                            <a href="https://tiktok.com/@umojadriverssacco" className="ft-social-btn" target="_blank" rel="noreferrer" title="TikTok"><i className="bi bi-tiktok"></i></a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="ft-bottom">
                    <div className="ft-bottom-copy">
                        &copy; {new Date().getFullYear()} Umoja Drivers Sacco. All rights reserved.
                    </div>
                    <div className="ft-bottom-powered">
                        Powered by <span>Bezalel Technologies LTD</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
