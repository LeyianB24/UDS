"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import './login.css';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '', remember: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await fetchApi('login', 'POST', {
            email: form.email,
            password: form.password
        });
        
        if (res.status === 'success') {
            if (res.data.portal === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/member/dashboard');
            }
        } else {
            setError(res.message || 'Invalid login credentials. Please double-check your details.');
        }
        setLoading(false);
    };

    if (!mounted) return null;

    return (
        <div className="login-layout bg-white">
            {/* Left Panel */}
            <div className="login-left">
                <Link href="/" className="ll-brand text-decoration-none">
                    <div className="ll-brand-logo">
                        <img src="/assets/images/people_logo.png" alt="UMOJA Sacco" />
                    </div>
                    <div>
                        <div className="ll-brand-name">UMOJA Sacco</div>
                        <div className="ll-brand-sub">Unified Management System</div>
                    </div>
                </Link>

                <div className="ll-hero">
                    <div className="ll-eyebrow">
                        <span className="ll-eyebrow-dot"></span> Secure Portal
                    </div>
                    <h1 className="ll-title">
                        Manage your<br/>Sacco with<br/><span>precision.</span>
                    </h1>
                    <p className="ll-desc">
                        A unified platform for members, admins, and managers — tracking loans, savings, and communication in real time.
                    </p>
                    <div className="ll-stats">
                        <div className="ll-stat">
                            <div className="ll-stat-num">100%</div>
                            <div className="ll-stat-label">Secure</div>
                        </div>
                        <div className="ll-stat">
                            <div className="ll-stat-num">24/7</div>
                            <div className="ll-stat-label">Access</div>
                        </div>
                        <div className="ll-stat">
                            <div className="ll-stat-num">Real‑Time</div>
                            <div className="ll-stat-label">Data</div>
                        </div>
                    </div>
                </div>

                <div className="ll-footer">
                    &copy; {new Date().getFullYear()} UMOJA Sacco. All rights reserved.
                </div>
            </div>

            {/* Right Panel */}
            <div className="login-right">
                <div className="lr-form-wrap">

                    <div className="lr-heading">
                        <h2>Welcome back.</h2>
                        <p>Sign in to access your portal and manage your account.</p>
                    </div>

                    {error && (
                        <div className="lr-flash lr-flash-error">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} noValidate>
                        <div className="mb-1">
                            <label className="lr-label">Email or Username</label>
                            <div className="lr-input-wrap">
                                <span className="lr-input-pfx"><i className="bi bi-person-fill"></i></span>
                                <input 
                                    type="text" 
                                    name="email" 
                                    className="lr-input border-0" 
                                    required
                                    placeholder="your@email.com or member ID"
                                    value={form.email}
                                    onChange={e => setForm({...form, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="mb-1">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <label className="lr-label m-0">Password</label>
                                <Link href="/forgot-password" className="lr-forgot">Forgot password?</Link>
                            </div>
                            <div className="lr-input-wrap">
                                <span className="lr-input-pfx"><i className="bi bi-lock-fill"></i></span>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password" 
                                    className="lr-input border-0" 
                                    required 
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({...form, password: e.target.value})}
                                />
                                <button type="button" className="lr-toggle-btn border-0" onClick={() => setShowPassword(!showPassword)}>
                                    <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                                </button>
                            </div>
                        </div>

                        <div className="lr-meta-row">
                            <label className="lr-check-wrap">
                                <input 
                                    type="checkbox" 
                                    name="remember" 
                                    checked={form.remember}
                                    onChange={e => setForm({...form, remember: e.target.checked})}
                                />
                                <span className="lr-check-label">Keep me logged in</span>
                            </label>
                        </div>

                        <button type="submit" className="lr-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border" role="status" aria-hidden="true"></span>
                                    <span>Verifying…</span>
                                </>
                            ) : (
                                <span>Access Portal</span>
                            )}
                        </button>
                    </form>

                    <div className="lr-register">
                        Don&apos;t have an account? <Link href="/register">Create Account</Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
