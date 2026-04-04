"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import './settings.css';

export default function SettingsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [saving, setSaving] = useState(false);
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    // Profile Form
    const [profileForm, setProfileForm] = useState({
        email: '',
        phone: '',
        gender: 'male',
        address: ''
    });

    // Security Form
    const [securityForm, setSecurityForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [strength, setStrength] = useState({ pct: '0%', bg: 'transparent', label: '' });

    const loadData = useCallback(async () => {
        try {
            const res = await apiFetch('/api/member/settings');
            if (res.status === 'success') {
                setData(res.data);
                setProfileForm({
                    email: res.data.member.email || '',
                    phone: res.data.member.phone || '',
                    gender: res.data.member.gender || 'male',
                    address: res.data.member.address || ''
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const checkStrength = (val: string) => {
        let score = 0;
        if (val.length >= 6) score++;
        if (val.length >= 10) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const map = [
            { pct: '0%', bg: 'transparent', label: '' },
            { pct: '25%', bg: '#dc2626', label: 'Weak' },
            { pct: '50%', bg: '#d97706', label: 'Fair' },
            { pct: '75%', bg: '#2563eb', label: 'Good' },
            { pct: '100%', bg: '#16a34a', label: 'Strong' },
        ];
        setStrength(map[Math.min(score, 4)]);
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFlash(null);
        try {
            const res = await apiFetch('/api/member/settings', {
                method: 'POST',
                body: JSON.stringify({ action: 'update_profile', ...profileForm })
            });
            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                loadData();
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        } finally {
            setSaving(false);
        }
    };

    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityForm.new_password !== securityForm.confirm_password) {
            setFlash({ type: 'err', msg: 'New passwords do not match' });
            return;
        }

        setSaving(true);
        setFlash(null);
        try {
            const res = await apiFetch('/api/member/settings', {
                method: 'POST',
                body: JSON.stringify({ action: 'change_password', ...securityForm })
            });
            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                setSecurityForm({ current_password: '', new_password: '', confirm_password: '' });
                setStrength({ pct: '0%', bg: 'transparent', label: '' });
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !data) return <div className="p-10 text-center">Loading Settings...</div>;

    const { member } = data;
    const initials = member.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <div className="dash">
            <div className="pg-head">
                <div>
                    <div className="pg-title">Account Settings</div>
                    <div className="pg-sub">Manage your profile and security preferences.</div>
                </div>
                <Link href="/member/dashboard" className="btn-back-link">
                    <i className="bi bi-arrow-left mr-1"></i> Dashboard
                </Link>
            </div>

            {flash && (
                <div className={`flash ${flash.type}`}>
                    <i className={`bi bi-${flash.type === 'ok' ? 'check-circle-fill' : 'exclamation-triangle-fill'}`}></i>
                    <div><strong>{flash.type === 'ok' ? 'Success' : 'Error'}</strong>{flash.msg}</div>
                    <button className="flash-close" onClick={() => setFlash(null)}>&times;</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Col: Profile Panel */}
                <div className="lg:col-span-4">
                    <div className="profile-panel">
                        <div className="profile-inner">
                            <div className="avatar">{initials}</div>
                            <div className="profile-name">{member.full_name}</div>
                            <div className="profile-email">{member.email}</div>

                            <div className="profile-badges">
                                <span className="pbadge"><i className="bi bi-person-badge-fill mr-1"></i> {member.member_reg_no}</span>
                                <span className="pbadge"><i className="bi bi-shield-check-fill mr-1"></i> Active Member</span>
                            </div>

                            <div className="space-y-3 mt-8">
                                <div className="profile-stat-row">
                                    <span className="pstat-lbl">Gender</span>
                                    <span className="pstat-val">{member.gender || '—'}</span>
                                </div>
                                <div className="profile-stat-row">
                                    <span className="pstat-lbl">Phone</span>
                                    <span className="pstat-val">{member.phone || '—'}</span>
                                </div>
                                <div className="profile-stat-row">
                                    <span className="pstat-lbl">Member Since</span>
                                    <span className="pstat-val">{new Date(member.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Settings Card */}
                <div className="lg:col-span-8">
                    <div className="settings-card">
                        <div className="p-6 p-xl-8">
                            {/* Tabs */}
                            <div className="stab-head">
                                <button className={`stab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                                    <i className="bi bi-person-fill"></i> Personal Details
                                </button>
                                <button className={`stab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                                    <i className="bi bi-shield-lock-fill"></i> Security
                                </button>
                            </div>

                            {activeTab === 'profile' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="sec-lbl">Edit Profile</div>
                                    <form onSubmit={handleProfileSubmit}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-full">
                                                <label className="field-lbl">Full Name <span className="opacity-50 text-[9px]">(Locked)</span></label>
                                                <input type="text" className="field-ctrl" value={member.full_name} readOnly />
                                            </div>
                                            <div>
                                                <label className="field-lbl">Email Address</label>
                                                <input type="email" className="field-ctrl" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required />
                                            </div>
                                            <div>
                                                <label className="field-lbl">Phone Number</label>
                                                <input type="tel" className="field-ctrl" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} required />
                                            </div>
                                            <div>
                                                <label className="field-lbl">Gender</label>
                                                <select className="field-ctrl" value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})}>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="field-lbl">Address</label>
                                                <input type="text" className="field-ctrl" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} placeholder="e.g. Nairobi, Kenya" />
                                            </div>
                                        </div>
                                        <div className="mt-8">
                                            <button type="submit" className="btn-save" disabled={saving}>
                                                {saving ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-f"></span> : <><i className="bi bi-check-circle-fill mr-1"></i> Save Changes</>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="sec-lbl">Change Password</div>
                                    <div className="info-card">
                                        <i className="bi bi-info-circle-fill"></i>
                                        <p>Use a strong password of at least 8 characters with a mix of letters, numbers, and symbols. Your session will remain active after changing.</p>
                                    </div>
                                    <form onSubmit={handleSecuritySubmit}>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="field-lbl">Current Password</label>
                                                <div className="pw-wrap">
                                                    <input 
                                                        type={showPasswords.current ? 'text' : 'password'} 
                                                        className="field-ctrl" required 
                                                        value={securityForm.current_password}
                                                        onChange={e => setSecurityForm({...securityForm, current_password: e.target.value})}
                                                    />
                                                    <button type="button" className="pw-toggle" onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}>
                                                        <i className={`bi bi-eye${showPasswords.current ? '-slash' : ''}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="field-lbl">New Password</label>
                                                    <div className="pw-wrap">
                                                        <input 
                                                            type={showPasswords.new ? 'text' : 'password'} 
                                                            className="field-ctrl" required 
                                                            value={securityForm.new_password}
                                                            onChange={e => {
                                                                setSecurityForm({...securityForm, new_password: e.target.value});
                                                                checkStrength(e.target.value);
                                                            }}
                                                        />
                                                        <button type="button" className="pw-toggle" onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}>
                                                            <i className={`bi bi-eye${showPasswords.new ? '-slash' : ''}`}></i>
                                                        </button>
                                                    </div>
                                                    <div className="str-bar"><div className="str-fill" style={{ width: strength.pct, background: strength.bg }}></div></div>
                                                    <div className="text-[10px] font-bold mt-1" style={{color: strength.bg}}>{strength.label}</div>
                                                </div>
                                                <div>
                                                    <label className="field-lbl">Confirm New Password</label>
                                                    <div className="pw-wrap">
                                                        <input 
                                                            type={showPasswords.confirm ? 'text' : 'password'} 
                                                            className="field-ctrl" required 
                                                            value={securityForm.confirm_password}
                                                            onChange={e => setSecurityForm({...securityForm, confirm_password: e.target.value})}
                                                        />
                                                        <button type="button" className="pw-toggle" onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}>
                                                            <i className={`bi bi-eye${showPasswords.confirm ? '-slash' : ''}`}></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8">
                                            <button type="submit" className="btn-save" disabled={saving}>
                                                {saving ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-f"></span> : <><i className="bi bi-lock-fill mr-1"></i> Update Password</>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
