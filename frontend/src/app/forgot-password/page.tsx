"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import './forgot-password.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [msgType, setMsgType] = useState<'success' | 'error' | 'warning' | ''>('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setMsgType('');

        try {
            const res = await fetchApi('forgot_password', 'POST', { email });
            setMessage(res.message);
            setMsgType('success');
        } catch (error: any) {
            setMessage(error.message || 'An error occurred while resetting the password.');
            setMsgType('error');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="fp-layout">
            {/* Left Panel */}
            <div className="fp-left">
                <Link href="/" className="fl-brand">
                    <div className="fl-brand-logo">
                        <img src="/assets/images/people_logo.png" alt="UMOJA Sacco" />
                    </div>
                    <div>
                        <div className="fl-brand-name">UMOJA Sacco</div>
                        <div className="fl-brand-sub">Unified Management System</div>
                    </div>
                </Link>

                <div className="fl-hero">
                    <div className="fl-icon-wrap">
                        <i className="bi bi-key-fill"></i>
                    </div>
                    <h1 className="fl-title">
                        Reset your<br/><span>password</span><br/>securely.
                    </h1>
                    <p className="fl-desc">
                        Enter the email linked to your account and we&apos;ll send a temporary password to get you back in.
                    </p>
                    <div className="fl-steps">
                        <div className="fl-step">
                            <div className="fl-step-icon"><i className="bi bi-envelope-fill"></i></div>
                            <div>
                                <div className="fl-step-title">Enter your email</div>
                                <div className="fl-step-sub">The address registered to your account</div>
                            </div>
                        </div>
                        <div className="fl-step">
                            <div className="fl-step-icon"><i className="bi bi-inbox-fill"></i></div>
                            <div>
                                <div className="fl-step-title">Check your inbox</div>
                                <div className="fl-step-sub">A temporary password will be emailed to you</div>
                            </div>
                        </div>
                        <div className="fl-step">
                            <div className="fl-step-icon"><i className="bi bi-shield-check-fill"></i></div>
                            <div>
                                <div className="fl-step-title">Login &amp; update</div>
                                <div className="fl-step-sub">Sign in and change your password immediately</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fl-footer">
                    &copy; {new Date().getFullYear()} UMOJA Sacco. All rights reserved.
                </div>
            </div>

            {/* Right Panel */}
            <div className="fp-right">
                <div className="fr-wrap">
                    {msgType === 'success' ? (
                        /* Success State */
                        <div className="fr-success-state">
                            <div className="fr-success-icon">
                                <i className="bi bi-envelope-check-fill"></i>
                            </div>
                            <h4>Check your inbox</h4>
                            <p>{message}</p>
                            <Link href="/login" className="fr-submit">
                                <i className="bi bi-arrow-left"></i> Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="fr-heading">
                                <h2>Forgot password?</h2>
                                <p>Enter your email and we&apos;ll send you a temporary password.</p>
                            </div>

                            {message && msgType && (
                                <div className={`fr-flash fr-flash-${msgType}`}>
                                    <i className={`bi ${msgType === 'warning' ? 'bi-exclamation-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                                    {message}
                                </div>
                            )}

                            <div className="fr-note">
                                <i className="bi bi-shield-lock-fill"></i>
                                For security, we won&apos;t confirm if an email is registered. Check your inbox regardless.
                            </div>

                            <form onSubmit={handleForgot} noValidate>
                                <label className="fr-label">Email Address</label>
                                <div className="fr-input-wrap">
                                    <span className="fr-input-pfx"><i className="bi bi-envelope-fill"></i></span>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        className="fr-input border-0"
                                        placeholder="your@email.com" 
                                        required 
                                        autoFocus
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className="fr-submit" disabled={loading}>
                                    {loading ? (
                                        <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
                                    ) : (
                                        <><i className="bi bi-send-fill me-1"></i> Send Reset Email</>
                                    )}
                                </button>

                                <Link href="/login" className="fr-back">
                                    <i className="bi bi-arrow-left"></i> Back to Login
                                </Link>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
