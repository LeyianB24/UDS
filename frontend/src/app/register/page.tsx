"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import './register.css';

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Basic confirmation check before submittal
        const formEl = e.currentTarget;
        const pass = (formEl.elements.namedItem('password') as HTMLInputElement).value;
        const conf = (formEl.elements.namedItem('confirm_password') as HTMLInputElement).value;
        
        if (pass !== conf) {
            setErrors(["Passwords do not match."]);
            return;
        }

        setLoading(true);
        setErrors([]);

        const formData = new FormData(formEl);
        
        try {
            // using exact axios call without wrappers so multipart/form-data doesn't get coerced to json
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/UDS/api/v1/routes.php';
            const res = await axios.post(API_BASE_URL + '?action=register', formData);
            
            if (res.data.status === 'error') {
                if (Array.isArray(res.data.message)) {
                    setErrors(res.data.message);
                } else {
                    setErrors([res.data.message || 'Registration failed.']);
                }
            } else {
                router.push('/member/dashboard');
            }
        } catch (error: any) {
            setErrors([error?.response?.data?.message || 'Server error occurred during registration.']);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="register-layout">
            {/* Left Panel */}
            <div className="reg-left">
                <Link href="/" className="rl-brand">
                    <div className="rl-brand-logo">
                        <img src="/assets/images/people_logo.png" alt="UMOJA Sacco" />
                    </div>
                    <div>
                        <div className="rl-brand-name">UMOJA Sacco</div>
                        <div className="rl-brand-sub">Member Portal</div>
                    </div>
                </Link>

                <div className="rl-hero">
                    <div className="rl-eyebrow">
                        <span className="rl-eyebrow-dot"></span> New Member
                    </div>
                    <h1 className="rl-title">
                        Join the<br/><span>Sacco</span><br/>community.
                    </h1>
                    <p className="rl-desc">
                        Start your journey toward financial freedom. Simple registration, secure access, full control.
                    </p>
                    <div className="rl-steps">
                        <div className="rl-step">
                            <div className="rl-step-num">1</div>
                            <div>
                                <div className="rl-step-title">Personal Details</div>
                                <div className="rl-step-sub">ID, name, date of birth & contact</div>
                            </div>
                        </div>
                        <div className="rl-step">
                            <div className="rl-step-num">2</div>
                            <div>
                                <div className="rl-step-title">Account Security</div>
                                <div className="rl-step-sub">Email, password & next of kin</div>
                            </div>
                        </div>
                        <div className="rl-step">
                            <div className="rl-step-num">3</div>
                            <div>
                                <div className="rl-step-title">Portal Access</div>
                                <div className="rl-step-sub">Pay registration fee & go live</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rl-footer">
                    <p>&copy; {new Date().getFullYear()} <strong>UMOJA Sacco</strong>. All rights reserved.</p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="reg-right">
                <div className="rr-inner">
                    <div className="rr-top">
                        <div>
                            <h2>Create Account</h2>
                            <p>Fill in your details to get started</p>
                        </div>
                        <Link href="/login" className="rr-login-link">Sign In Instead</Link>
                    </div>

                    {errors.length > 0 && (
                        <div className="rr-errors">
                            <ul>
                                {errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={handleRegister} ref={formRef} noValidate>
                        {/* Personal Info */}
                        <div className="rr-section">
                            <div className="rr-section-icon rr-section-icon-a"><i className="bi bi-person-fill"></i></div>
                            <span className="rr-section-name">Personal Information</span>
                        </div>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="rr-label">Full Name <span style={{color:'#dc2626'}}>*</span></label>
                                <input type="text" name="full_name" className="rr-input" required placeholder="As per National ID" />
                            </div>
                            <div className="col-md-6">
                                <label className="rr-label">National ID <span style={{color:'#dc2626'}}>*</span></label>
                                <input type="text" name="national_id" className="rr-input" required placeholder="8-digit ID number" />
                            </div>
                            <div className="col-md-6">
                                <label className="rr-label">Phone Number <span style={{color:'#dc2626'}}>*</span></label>
                                <input type="text" name="phone" className="rr-input" required placeholder="07xxxxxxxx" />
                            </div>
                            <div className="col-md-4">
                                <label className="rr-label">Gender</label>
                                <select name="gender" className="rr-input" style={{cursor: 'pointer'}}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="rr-label">Date of Birth <span style={{color:'#dc2626'}}>*</span></label>
                                <input type="date" name="dob" className="rr-input" required />
                            </div>
                            <div className="col-md-4">
                                <label className="rr-label">Occupation</label>
                                <input type="text" name="occupation" className="rr-input" placeholder="e.g. Driver" />
                            </div>
                            <div className="col-12">
                                <label className="rr-label">Home Address <span style={{color:'#dc2626'}}>*</span></label>
                                <input type="text" name="address" className="rr-input" required placeholder="e.g. Ruiru, Kiambu County" />
                            </div>
                        </div>

                        {/* Next of Kin */}
                        <div className="rr-section">
                            <div className="rr-section-icon rr-section-icon-c"><i className="bi bi-people-fill"></i></div>
                            <span className="rr-section-name">Next of Kin</span>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="rr-label">Full Name <span style={{color:'#dc2626'}}>*</span></label>
                                <input type="text" name="nok_name" className="rr-input" required placeholder="Next of kin full name" />
                            </div>
                            <div className="col-md-6">
                                <label className="rr-label">Phone Number <span style={{color:'#dc2626'}}>*</span></label>
                                <input type="text" name="nok_phone" className="rr-input" required placeholder="07xxxxxxxx" />
                            </div>
                        </div>

                        {/* KYC Documents */}
                        <div className="rr-section">
                            <div className="rr-section-icon rr-section-icon-b" style={{background: '#FFFBEB', color: '#92400E'}}><i className="bi bi-file-earmark-medical-fill"></i></div>
                            <span className="rr-section-name">KYC Documents</span>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="rr-label">Passport Photo <span style={{color:'#dc2626'}}>*</span></label>
                                <input type="file" name="passport_photo" className="rr-input" required accept="image/*" />
                            </div>
                            <div className="col-md-4">
                                <label className="rr-label">National ID (Front) <span style={{color:'#dc2626'}}>*</span></label>
                                <input type="file" name="national_id_front" className="rr-input" required accept="image/*" />
                            </div>
                            <div className="col-md-4">
                                <label className="rr-label">National ID (Back) <span style={{color:'#dc2626'}}>*</span></label>
                                <input type="file" name="national_id_back" className="rr-input" required accept="image/*" />
                            </div>
                        </div>

                        {/* Account */}
                        <div className="rr-section">
                            <div className="rr-section-icon rr-section-icon-d"><i className="bi bi-shield-lock-fill"></i></div>
                            <span className="rr-section-name">Account Credentials</span>
                        </div>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="rr-label">Email Address <span style={{color:'#dc2626'}}>*</span></label>
                                <input type="email" name="email" className="rr-input" required placeholder="your@email.com" />
                            </div>
                            <div className="col-md-6">
                                <label className="rr-label">Password <span style={{color:'#dc2626'}}>*</span></label>
                                <div className="rr-input-wrap">
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        name="password" 
                                        className="rr-input border-0" 
                                        required 
                                        placeholder="Min. 6 characters" 
                                    />
                                    <button type="button" className="rr-toggle-btn border-0" onClick={() => setShowPassword(!showPassword)}>
                                        <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="rr-label">Confirm Password <span style={{color:'#dc2626'}}>*</span></label>
                                <div className="rr-input-wrap">
                                    <input 
                                        type={showConfirmPassword ? 'text' : 'password'} 
                                        name="confirm_password" 
                                        className="rr-input border-0" 
                                        required 
                                        placeholder="Repeat password" 
                                    />
                                    <button type="button" className="rr-toggle-btn border-0" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <i className={`bi ${showConfirmPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button type="submit" className="rr-submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border" role="status" aria-hidden="true"></span>
                                        <span>Setting up your account…</span>
                                    </>
                                ) : (
                                    <span><i className="bi bi-person-plus-fill me-1"></i> Create My Account</span>
                                )}
                            </button>
                        </div>

                        <p className="rr-terms">
                            By registering, you agree to our <Link href="#">Terms of Service</Link> and <Link href="#">Privacy Policy</Link>.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
