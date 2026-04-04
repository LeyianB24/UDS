"use client";

import React from 'react';
import Link from 'next/link';
import './terms.css';

export default function TermsPage() {
    return (
        <div className="dash pb-20">
            {/* HERO */}
            <div className="legal-hero">
                <div className="hero-pattern"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                            <i className="bi bi-shield-check-fill text-lime text-2xl"></i>
                            <div className="text-[10px] font-black text-lime uppercase tracking-widest px-3 py-1 bg-lime/10 border border-lime/20 rounded-full">Legal Portal</div>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter mb-2">Terms of Service</h1>
                        <p className="text-white/40 text-lg font-semibold max-w-md">The mutual agreement between Umoja Drivers Sacco and its valued members.</p>
                    </div>
                    <Link href="/member/dashboard" className="px-8 py-3 bg-white text-f rounded-full font-black text-sm no-underline transform transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-white/10">
                        <i className="bi bi-arrow-left mr-2"></i> Dashboard
                    </Link>
                </div>
            </div>

            {/* CONTENT */}
            <div className="legal-card lg:p-20">
                <div className="flex items-center gap-3 mb-10 pb-6 border-b border-bdr">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <i className="bi bi-calendar-event text-xl"></i>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Effective Date</div>
                        <div className="text-sm font-black text-t1">February 1, 2026</div>
                    </div>
                </div>

                <div className="legal-content">
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By registering as a member of Umoja Drivers Sacco ("the Sacco"), you agree to be bound by these Terms of Service, 
                        all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                    </p>
                    
                    <div className="highlight-note">
                        <strong><i className="bi bi-info-circle-fill mr-2"></i>Important:</strong> 
                        If you do not agree with any of these terms, you are prohibited from using or accessing this platform and 
                        participating in Sacco activities.
                    </div>
                    
                    <h2>2. Membership Eligibility</h2>
                    <p>To become a member of Umoja Drivers Sacco, you must:</p>
                    <ul>
                        <li>Be at least 18 years of age</li>
                        <li>Be a professional driver or involved in the transport industry</li>
                        <li>Provide valid identification documents (National ID or Passport)</li>
                        <li>Pay the mandatory registration fee of KES 1,000</li>
                        <li>Maintain active membership through regular contributions</li>
                    </ul>
                    
                    <h2>3. Member Contributions</h2>
                    <h3>3.1 Savings Contributions</h3>
                    <p>
                        Members are required to make regular savings contributions as determined by the Sacco's bylaws. 
                        A minimum balance of KES 500 must be maintained in your savings account at all times.
                    </p>
                    
                    <h3>3.2 Share Capital</h3>
                    <p>
                        Share capital contributions represent your ownership stake in the Sacco. The current share price is KES 100 per unit. 
                        Share capital is non-withdrawable except upon membership exit or as determined by the Annual General Meeting (AGM).
                    </p>
                    
                    <h3>3.3 Welfare Fund</h3>
                    <p>
                        Welfare contributions are pooled to provide financial support to members during emergencies, illness, or bereavement. 
                        Welfare funds are only accessible through approved support cases.
                    </p>
                    
                    <h2>4. Loan Services</h2>
                    <h3>4.1 Loan Eligibility</h3>
                    <p>Members may apply for loans subject to the following conditions:</p>
                    <ul>
                        <li>Minimum 6 months of active membership</li>
                        <li>Loan limit is 3 times your total savings balance</li>
                        <li>All previous loans must be fully repaid</li>
                        <li>Provision of acceptable guarantors as required</li>
                    </ul>
                    
                    <h3>4.2 Loan Repayment</h3>
                    <p>
                        Loans must be repaid according to the agreed schedule. Failure to repay may result in suspension of borrowing privileges or recovery action.
                    </p>
                    
                    <h2>5. Account Security</h2>
                    <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to:</p>
                    <ul>
                        <li>Keep your password secure and not share it with others</li>
                        <li>Notify the Sacco immediately of any unauthorized access</li>
                        <li>Accept responsibility for all activities under your account</li>
                    </ul>

                    <h2>6. Platform Usage</h2>
                    <p>
                        The Sacco integrates with M-Pesa and other mobile money platforms for convenience. All transactions are subject to verification and service provider terms.
                    </p>

                    <div className="legal-footer">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Umoja Drivers Sacco · Solidarity & Prosperity</p>
                        <div className="flex justify-center gap-6">
                            <span className="text-[10px] font-bold text-gray-400 no-underline hover:text-fs">Privacy Policy</span>
                            <span className="text-[10px] font-bold text-gray-400 no-underline hover:text-fs">Cookie Settings</span>
                            <span className="text-[10px] font-bold text-gray-400 no-underline hover:text-fs">Support Helpdesk</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
