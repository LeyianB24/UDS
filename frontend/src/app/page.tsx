"use client";

import React, { useEffect } from 'react';
import { LandingNavbar } from '@/components/LandingNavbar';
import { LandingFooter } from '@/components/LandingFooter';
import Link from 'next/link';
import './landing.css';

export default function LandingPage() {
    useEffect(() => {
        // Poker Slideshow Logic
        const cards = document.querySelectorAll('.poker-card') as NodeListOf<HTMLElement>;
        let currentIndex = 0;

        function updateSlideshow() {
            cards.forEach((card, index) => {
                card.removeAttribute('data-active');
                card.removeAttribute('data-side');
                card.setAttribute('data-hidden', 'true');
                if (index === currentIndex) {
                    card.removeAttribute('data-hidden');
                    card.setAttribute('data-active', 'true');
                } else if (index === (currentIndex - 1 + cards.length) % cards.length) {
                    card.removeAttribute('data-hidden');
                    card.setAttribute('data-side', 'left');
                } else if (index === (currentIndex + 1) % cards.length) {
                    card.removeAttribute('data-hidden');
                    card.setAttribute('data-side', 'right');
                }
            });
        }

        const nextBtn = document.getElementById('slideshow-next');
        const prevBtn = document.getElementById('slideshow-prev');

        const nextFn = () => { currentIndex = (currentIndex + 1) % cards.length; updateSlideshow(); };
        const prevFn = () => { currentIndex = (currentIndex - 1 + cards.length) % cards.length; updateSlideshow(); };

        nextBtn?.addEventListener('click', nextFn);
        prevBtn?.addEventListener('click', prevFn);

        let slideshowInterval: NodeJS.Timeout;
        if (cards.length > 0) {
            slideshowInterval = setInterval(() => { currentIndex = (currentIndex + 1) % cards.length; updateSlideshow(); }, 4000);
            updateSlideshow();
        }

        // Scroll Reveal Logic
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('visible'), i * 60);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        reveals.forEach(el => observer.observe(el));

        return () => {
            nextBtn?.removeEventListener('click', nextFn);
            prevBtn?.removeEventListener('click', prevFn);
            clearInterval(slideshowInterval);
            observer.disconnect();
        };
    }, []);

    const slideshowImages = Array.from({ length: 19 }, (_, i) => i + 1);

    return (
        <div className="font-sans text-[#0F392B] bg-[#F7FBF9]">
            <LandingNavbar />

            {/* ══ HERO ══ */}
            <section className="lp-hero">
                <div className="lp-hero-bg"></div>
                <div className="lp-hero-overlay"></div>
                <div className="lp-hero-glow-a"></div>
                <div className="lp-hero-glow-b"></div>

                <div className="lp-hero-content">
                    <div className="container">
                        <div className="row align-items-center g-5">
                            {/* Text Column */}
                            <div className="col-lg-6">
                                <div className="hero-kicker">
                                    <span className="hero-kicker-dot"></span>
                                    Est. Umoja Drivers Sacco Ltd.
                                </div>
                                <h1 className="hero-title">
                                    Financial<br />Freedom<br /><span className="accent">Starts Here.</span>
                                </h1>
                                <p className="hero-tagline">
                                    Umoja Sacco is the financial backbone for the transport community — owning <strong>fleets, real estate, and agribusiness</strong> and delivering generational wealth to every member.
                                </p>
                                <div className="hero-btns">
                                    <Link href="/login" className="btn-lp-primary">
                                        <i className="bi bi-box-arrow-in-right"></i> Member Login
                                    </Link>
                                    <Link href="/register" className="btn-lp-outline">
                                        <i className="bi bi-person-plus"></i> Join Today
                                    </Link>
                                </div>
                                <div className="hero-trust">
                                    <div className="hero-trust-stat">
                                        <div className="val">12%</div>
                                        <div className="lbl">Avg. Dividend</div>
                                    </div>
                                    <div className="hero-trust-divider"></div>
                                    <div className="hero-trust-stat">
                                        <div className="val">48hr</div>
                                        <div className="lbl">Loan Approval</div>
                                    </div>
                                    <div className="hero-trust-divider"></div>
                                    <div className="hero-trust-stat">
                                        <div className="val">100%</div>
                                        <div className="lbl">Secure</div>
                                    </div>
                                    <div className="hero-trust-divider"></div>
                                    <div className="hero-trust-stat">
                                        <div className="val">Ksh 500M</div>
                                        <div className="lbl">Asset Target</div>
                                    </div>
                                </div>
                            </div>

                            {/* Slideshow Column */}
                            <div className="col-lg-6 d-none d-lg-flex justify-content-center">
                                <div className="poker-slideshow w-100">
                                    {slideshowImages.map((i) => (
                                        <div key={i} className="poker-card" data-offset={i}>
                                            <img src={`/assets/images/sacco${i}.jpg`} alt={`Sacco Asset ${i}`} />
                                        </div>
                                    ))}
                                    <div className="slideshow-controls">
                                        <button id="slideshow-prev" className="ctrl-btn"><i className="bi bi-chevron-left"></i></button>
                                        <button id="slideshow-next" className="ctrl-btn"><i className="bi bi-chevron-right"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ STATS RIBBON ══ */}
            <div className="lp-stats-ribbon">
                <div className="container">
                    <div className="row justify-content-center">
                        {[
                            ['12%', 'Avg. Dividend Rate'],
                            ['Ksh 500M', 'Asset Base Goal'],
                            ['48 hrs', 'Loan Processing'],
                            ['24/7', 'Member Access'],
                        ].map((s, i) => (
                            <div key={i} className="col-6 col-md-3">
                                <div className="stat-chip">
                                    <div className="val">{s[0]}</div>
                                    <div className="lbl">{s[1]}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══ BLUEPRINT ══ */}
            <section className="lp-section" id="wealth-model">
                <div className="container">
                    <div className="lp-section-head reveal">
                        <div className="lp-eyebrow"><span className="lp-eyebrow-dot"></span> The Umoja Blueprint</div>
                        <h2>How Your Money Grows With Us</h2>
                        <p>A proven four-step investment cycle that turns monthly contributions into lasting wealth.</p>
                    </div>
                    <div className="row g-4 reveal">
                        {[
                            ["bi-wallet2", "Mobilization", "Members contribute monthly deposits and share capital, forming a strong fund base."],
                            ["bi-buildings", "Investment", "Funds are invested in high-yield assets: fleets, real estate, and agribusiness."],
                            ["bi-graph-up-arrow", "Returns", "Assets generate revenue daily through fares, rent, farm income, and loan interest."],
                            ["bi-pie-chart-fill", "Dividends", "Profits are returned to members yearly as dividends and interest on savings."],
                        ].map((step, index) => (
                            <div key={index} className="col-lg-3 col-md-6">
                                <div className={`blueprint-card ${index === 3 ? 'featured' : ''}`}>
                                    <div className="bp-num">{index + 1}</div>
                                    <i className={`bi ${step[0]} bp-icon`}></i>
                                    <h5>{step[1]}</h5>
                                    <p>{step[2]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ SERVICES ══ */}
            <section className="lp-section lp-section-alt" id="services">
                <div className="container">
                    <div className="lp-section-head reveal">
                        <div className="lp-eyebrow"><span className="lp-eyebrow-dot"></span> Core Services</div>
                        <h2>Financial Products Built for Members</h2>
                        <p>Tailored savings, credit, and welfare products designed around the transport community.</p>
                    </div>
                    <div className="row g-4 reveal">
                        {[
                            ["bi-piggy-bank-fill", "Voluntary Savings", "Save regularly to build your financial foundation and earn competitive interest on every deposit."],
                            ["bi-cash-coin", "Affordable Credit", "Get loans at extremely friendly member rates for business growth or personal emergencies."],
                            ["bi-wallet2", "Share Capital", "Become a co-owner with full voting rights and receive annual dividends from profits."],
                            ["bi-heart-pulse-fill", "Welfare & Benevolence", "Structured financial support for members and their families during difficult times."],
                            ["bi-book-half", "Financial Literacy", "Ongoing workshops teaching wealth management, investment basics, and retirement planning."],
                        ].map((srv, index) => (
                            <div key={index} className="col-lg-4 col-md-6">
                                <div className="service-card">
                                    <div className="service-icon"><i className={`bi ${srv[0]}`}></i></div>
                                    <h5>{srv[1]}</h5>
                                    <p>{srv[2]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ PORTFOLIO ══ */}
            <section className="lp-section" id="portfolio">
                <div className="container">
                    <div className="lp-section-head reveal">
                        <div className="lp-eyebrow"><span className="lp-eyebrow-dot"></span> Diversified Assets</div>
                        <h2>Collective Investments That Deliver</h2>
                        <p>Every shilling you contribute is deployed into real assets generating steady income streams.</p>
                    </div>
                    <div className="row g-4 reveal">
                        {[
                            ["bi-house-door-fill", "Real Estate", "Modern rental units and commercial plots generating passive monthly income."],
                            ["bi-bus-front-fill", "Matatu Fleet", "A modern, profitable fleet operating on the region's highest-demand routes."],
                            ["bi-flower1", "Agribusiness", "Strategic investments in crop farming and agricultural value chains."],
                            ["bi-fuel-pump-fill", "Fuel Stations", "High-traffic fueling points providing reliable daily revenue."],
                        ].map((item, index) => (
                            <div key={index} className="col-lg-3 col-md-6">
                                <div className="asset-card">
                                    <div className="asset-icon"><i className={`bi ${item[0]}`}></i></div>
                                    <h5>{item[1]}</h5>
                                    <p>{item[2]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ CTA ══ */}
            <section className="lp-cta" id="contact">
                <div className="container position-relative" style={{ zIndex: 2 }}>
                    <div className="reveal">
                        <div className="lp-eyebrow d-inline-flex mb-4"><span className="lp-eyebrow-dot"></span> Join Today</div>
                        <h2>Stop Waiting.<br /><span>Start Owning.</span></h2>
                        <p>It takes less than 5 minutes to begin. Secure your future with stable dividends, fast credit, and real ownership.</p>
                        <div className="cta-badges">
                            <span className="cta-badge"><i className="bi bi-award-fill"></i> Guaranteed Dividends</span>
                            <span className="cta-badge"><i className="bi bi-lightning-fill"></i> Quick Loans</span>
                            <span className="cta-badge"><i className="bi bi-safe-fill"></i> Fully Secure</span>
                            <span className="cta-badge"><i className="bi bi-people-fill"></i> Community Owned</span>
                        </div>
                        <div className="cta-buttons">
                            <Link href="/register" className="btn-lp-cta-primary">
                                <i className="bi bi-person-circle"></i> Join Our Community
                            </Link>
                            <Link href="/#contact" className="btn-lp-cta-outline">
                                <i className="bi bi-headset"></i> Talk to an Agent
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
}
