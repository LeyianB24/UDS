"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import './profile.css';

const KYC_STATUS: Record<string, { label: string; cls: string }> = {
    approved:      { label: 'Verified', cls: 'ks-green' },
    pending:       { label: 'Under Review', cls: 'ks-amber' },
    not_submitted: { label: 'Not Submitted', cls: 'ks-grey' },
    rejected:      { label: 'Rejected', cls: 'ks-red' },
};

export default function ProfilePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'kyc' | 'security'>('info');
    const [form, setForm] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        apiFetch('/api/v1/member_profile.php')
            .then(r => {
                setData(r);
                const p = r.profile || {};
                setForm({
                    email:         p.email || '',
                    phone:         p.phone || '',
                    address:       p.address || '',
                    occupation:    p.occupation || '',
                    dob:           p.dob || '',
                    nok_name:      p.next_of_kin_name || '',
                    nok_phone:     p.next_of_kin_phone || '',
                });
                setLoading(false);
            })
            .catch(e => { setError(e.message); setLoading(false); });
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setMsg(null);
        try {
            const payload: any = { action: 'update_profile', ...form };
            if (avatarPreview && avatarPreview.startsWith('data:')) {
                payload.profile_pic_base64 = avatarPreview.split(',')[1];
            }
            const res = await apiFetch('/api/v1/member_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            setMsg({ type: 'success', text: res.message || 'Profile updated!' });
        } catch (err: any) {
            setMsg({ type: 'error', text: err.message || 'Update failed.' });
        } finally { setSaving(false); }
    };

    if (loading) return (
        <div className="prof-loading"><div className="prof-spinner"></div><p>Loading profile…</p></div>
    );

    if (error) return (
        <div className="prof-error"><i className="bi bi-exclamation-triangle-fill"></i> {error}</div>
    );

    const p = data?.profile || {};
    const docs: any[] = data?.docs || [];
    const kycInfo = KYC_STATUS[p.kyc_status || 'not_submitted'] || KYC_STATUS['not_submitted'];
    const memberSince = p.created_at ? new Date(p.created_at).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }) : '—';
    const initials = (p.full_name || 'Member').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const avatarSrc = avatarPreview || (p.profile_pic ? `data:image/jpeg;base64,${p.profile_pic}` : null);

    return (
        <div className="prof-page">
            {/* Profile Header */}
            <div className="prof-hero">
                <div className="prof-hero-mesh"></div>
                <div className="prof-hero-inner">
                    <div className="prof-avatar-wrap">
                        <div className="prof-avatar" onClick={() => avatarInput.current?.click()}>
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="Profile" />
                            ) : (
                                <div className="prof-avatar-initials">{initials}</div>
                            )}
                            <div className="prof-avatar-overlay"><i className="bi bi-camera-fill"></i></div>
                        </div>
                        <input ref={avatarInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                        <div className="prof-hero-info">
                            <h2 className="prof-name">{p.full_name || 'Member'}</h2>
                            <div className="prof-meta-row">
                                <span className="prof-id-badge"><i className="bi bi-person-badge"></i> #{p.member_id}</span>
                                <span className={`prof-kyc-badge ${kycInfo.cls}`}><i className="bi bi-shield-check"></i> KYC {kycInfo.label}</span>
                                <span className="prof-since"><i className="bi bi-calendar3"></i> Member since {memberSince}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="prof-body">
                <div className="prof-tabs">
                    {(['info', 'kyc', 'security'] as const).map(tab => (
                        <button key={tab} className={`prof-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            <i className={`bi ${tab === 'info' ? 'bi-person-lines-fill' : tab === 'kyc' ? 'bi-shield-lock-fill' : 'bi-lock-fill'}`}></i>
                            {tab === 'info' ? 'Personal Info' : tab === 'kyc' ? 'KYC Documents' : 'Security'}
                        </button>
                    ))}
                </div>

                {/* ── Personal Info Tab ── */}
                {activeTab === 'info' && (
                    <div className="prof-card">
                        {msg && (
                            <div className={`prof-msg ${msg.type === 'success' ? 'msg-ok' : 'msg-err'}`}>
                                <i className={`bi ${msg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                                {msg.text}
                            </div>
                        )}
                        <form onSubmit={handleSave}>
                            <div className="prof-section-title">Contact Information</div>
                            <div className="prof-grid2">
                                <div className="prof-field">
                                    <label className="prof-label">Email Address</label>
                                    <input className="prof-input" type="email" value={form.email} onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))} />
                                </div>
                                <div className="prof-field">
                                    <label className="prof-label">Phone Number</label>
                                    <input className="prof-input" type="tel" value={form.phone} onChange={e => setForm((p: any) => ({ ...p, phone: e.target.value }))} />
                                </div>
                                <div className="prof-field prof-span2">
                                    <label className="prof-label">Residential Address</label>
                                    <input className="prof-input" value={form.address} onChange={e => setForm((p: any) => ({ ...p, address: e.target.value }))} />
                                </div>
                            </div>

                            <div className="prof-section-title">Additional Details</div>
                            <div className="prof-grid2">
                                <div className="prof-field">
                                    <label className="prof-label">Occupation</label>
                                    <input className="prof-input" value={form.occupation} onChange={e => setForm((p: any) => ({ ...p, occupation: e.target.value }))} />
                                </div>
                                <div className="prof-field">
                                    <label className="prof-label">Date of Birth</label>
                                    <input className="prof-input" type="date" value={form.dob} onChange={e => setForm((p: any) => ({ ...p, dob: e.target.value }))} />
                                </div>
                            </div>

                            <div className="prof-section-title">Next of Kin</div>
                            <div className="prof-grid2">
                                <div className="prof-field">
                                    <label className="prof-label">Full Name</label>
                                    <input className="prof-input" value={form.nok_name} onChange={e => setForm((p: any) => ({ ...p, nok_name: e.target.value }))} />
                                </div>
                                <div className="prof-field">
                                    <label className="prof-label">Phone Number</label>
                                    <input className="prof-input" type="tel" value={form.nok_phone} onChange={e => setForm((p: any) => ({ ...p, nok_phone: e.target.value }))} />
                                </div>
                            </div>

                            {/* Read-only fields */}
                            <div className="prof-section-title">Account Details</div>
                            <div className="prof-grid2">
                                <div className="prof-field">
                                    <label className="prof-label">National ID</label>
                                    <input className="prof-input prof-readonly" readOnly value={p.national_id || '—'} />
                                </div>
                                <div className="prof-field">
                                    <label className="prof-label">Member Status</label>
                                    <input className="prof-input prof-readonly" readOnly value={p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : '—'} />
                                </div>
                            </div>

                            <div className="prof-save-row">
                                <button type="submit" className="prof-save-btn" disabled={saving}>
                                    {saving ? <><i className="bi bi-arrow-repeat"></i> Saving…</> : <><i className="bi bi-check-lg"></i> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── KYC Documents Tab ── */}
                {activeTab === 'kyc' && (
                    <div className="prof-card">
                        <div className="prof-kyc-banner">
                            <div className={`kyc-status-ico ${kycInfo.cls}`}><i className="bi bi-shield-check"></i></div>
                            <div>
                                <div className="kyc-status-title">KYC Status: <span className={kycInfo.cls}>{kycInfo.label}</span></div>
                                <div className="kyc-status-sub">Upload your national ID (front + back) to complete verification.</div>
                            </div>
                        </div>

                        {docs.length === 0 ? (
                            <div className="prof-doc-empty">
                                <i className="bi bi-file-earmark-x"></i>
                                <div>No documents uploaded yet. Please upload your National ID to get verified.</div>
                            </div>
                        ) : (
                            <div className="prof-doc-list">
                                {docs.map((d: any, i: number) => (
                                    <div key={i} className="prof-doc-item">
                                        <div className="prof-doc-ico"><i className="bi bi-file-earmark-person-fill"></i></div>
                                        <div>
                                            <div className="prof-doc-name">{d.document_type?.replace(/_/g, ' ') || 'Document'}</div>
                                            <div className="prof-doc-date">Uploaded: {new Date(d.uploaded_at || d.created_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        </div>
                                        <span className={`prof-doc-status ${KYC_STATUS[d.status]?.cls || 'ks-grey'}`}>{d.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Security Tab ── */}
                {activeTab === 'security' && (
                    <div className="prof-card">
                        <div className="prof-security-items">
                            <div className="prof-sec-item">
                                <div className="prof-sec-ico"><i className="bi bi-lock-fill"></i></div>
                                <div>
                                    <div className="prof-sec-title">Password</div>
                                    <div className="prof-sec-sub">Last changed: not tracked</div>
                                </div>
                                <a href="#" className="prof-sec-btn">Change Password</a>
                            </div>
                            <div className="prof-sec-divider"></div>
                            <div className="prof-sec-item">
                                <div className="prof-sec-ico green"><i className="bi bi-phone-fill"></i></div>
                                <div>
                                    <div className="prof-sec-title">Phone Number</div>
                                    <div className="prof-sec-sub">{p.phone || 'Not set'}</div>
                                </div>
                                <button className="prof-sec-btn" onClick={() => setActiveTab('info')}>Update</button>
                            </div>
                            <div className="prof-sec-divider"></div>
                            <div className="prof-sec-item">
                                <div className={`prof-sec-ico ${p.kyc_status === 'approved' ? 'green' : 'amber'}`}><i className="bi bi-shield-lock-fill"></i></div>
                                <div>
                                    <div className="prof-sec-title">KYC Verification</div>
                                    <div className="prof-sec-sub">Status: {kycInfo.label}</div>
                                </div>
                                <button className="prof-sec-btn" onClick={() => setActiveTab('kyc')}>View Docs</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
