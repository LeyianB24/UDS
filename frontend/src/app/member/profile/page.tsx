"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import './profile.css';

export default function ProfilePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
    
    // Form States
    const [form, setForm] = useState({
        email: '',
        phone: '',
        address: '',
        dob: '',
        occupation: '',
        nok_name: '',
        nok_phone: '',
        remove_pic: false
    });
    const [previewPic, setPreviewPic] = useState<string | null>(null);
    const profilePicInput = useRef<HTMLInputElement>(null);

    const loadData = useCallback(async () => {
        try {
            const res = await apiFetch('/api/member/profile');
            if (res.status === 'success') {
                setData(res.data);
                setForm({
                    email: res.data.member.email || '',
                    phone: res.data.member.phone || '',
                    address: res.data.member.address || '',
                    dob: res.data.member.dob ? res.data.member.dob.split('T')[0] : '',
                    occupation: res.data.member.occupation || '',
                    nok_name: res.data.member.next_of_kin_name || '',
                    nok_phone: res.data.member.next_of_kin_phone || '',
                    remove_pic: false
                });
                setPreviewPic(res.data.profile_pic);
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

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewPic(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFlash(null);

        try {
            const formData = new FormData();
            formData.append('action', 'update_profile');
            Object.entries(form).forEach(([key, val]) => formData.append(key, val.toString()));
            
            if (profilePicInput.current?.files?.[0]) {
                formData.append('profile_pic', profilePicInput.current.files[0]);
            }

            const res = await apiFetch('/api/member/profile', {
                method: 'POST',
                body: formData, // apiFetch might need adjustment for FormData, but fetch supports it
                headers: {} // Don't set Content-Type, browser does it for FormData
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

    const uploadKyc = async (e: React.FormEvent, docType: string) => {
        e.preventDefault();
        const formEl = e.currentTarget as HTMLFormElement;
        const fileInput = formEl.querySelector('input[type="file"]') as HTMLInputElement;
        if (!fileInput.files?.[0]) return;

        try {
            const formData = new FormData();
            formData.append('action', 'upload_kyc');
            formData.append('doc_type', docType);
            formData.append('kyc_doc', fileInput.files[0]);

            const res = await apiFetch('/api/member/profile', {
                method: 'POST',
                body: formData
            });

            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                loadData();
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        }
    };

    if (loading || !data) return <div className="p-10 text-center">Loading Profile...</div>;

    const member = data.member;
    const initials = member.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    let statusCls = 'red';
    let accountStatus = 'Incomplete';
    const regFeePaid = member.registration_fee_status === 'paid' || member.reg_fee_paid == 1;

    if (!regFeePaid) { accountStatus = 'Fee Unpaid'; statusCls = 'red'; }
    else if (member.kyc_status === 'not_submitted') { accountStatus = 'No KYC Uploaded'; statusCls = 'amb'; }
    else if (member.kyc_status === 'pending') { accountStatus = 'Under Review'; statusCls = 'blu'; }
    else if (member.kyc_status === 'approved' && regFeePaid) { accountStatus = 'Active'; statusCls = 'grn'; }
    else if (member.kyc_status === 'rejected') { accountStatus = 'KYC Rejected'; statusCls = 'red'; }

    return (
        <div className="dash">
            {/* HERO */}
            <div className="profile-hero">
                <div className="hero-mesh"></div>
                <div className="hero-dots"></div>
                <div className="hero-ring r1"></div>
                <div className="hero-ring r2"></div>
                <div className="hero-inner">
                    <div className="flex align-items-start justify-between gap-3 flex-wrap">
                        <div>
                            <div className="hero-eyebrow"><i className="bi bi-person-badge-fill mr-1"></i> Member Account</div>
                            <h1>{member.full_name}</h1>
                            <p className="hero-sub">
                                Reg No <strong>{member.member_reg_no}</strong>
                                &nbsp;&middot;&nbsp;
                                Joined <strong>{new Date(member.join_date || member.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</strong>
                            </p>
                        </div>
                        <Link href="/member/dashboard" className="btn-back-link">
                            <i className="bi bi-arrow-left mr-1"></i> Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            {/* AVATAR FLOAT */}
            <div className="avatar-float">
                <div className="av-card">
                    <div className="av-wrap">
                        {previewPic ? (
                            <img src={previewPic} alt="Profile" className="av-img" />
                        ) : (
                            <div className="av-initials">{initials}</div>
                        )}
                        <label htmlFor="profile_pic_input" className="av-upload-btn" title="Change Photo">
                            <i className="bi bi-camera-fill"></i>
                        </label>
                        <input 
                            type="file" id="profile_pic_input" accept="image/*" className="hidden" 
                            ref={profilePicInput} onChange={handlePicChange} 
                        />
                    </div>
                    <div className="av-info">
                        <div className="av-name">{member.full_name}</div>
                        <div className="av-sub">{member.email}</div>
                        <div className="av-badges">
                            <span className={`av-badge av-status-${statusCls}`}>
                                <i className={`bi bi-${statusCls === 'grn' ? 'shield-check-fill' : (statusCls === 'amb' ? 'clock-fill' : 'exclamation-circle-fill')}`}></i>
                                {accountStatus}
                            </span>
                            <span className="av-badge"><i className="bi bi-gender-ambiguous mr-1"></i> {member.gender || 'Unknown'}</span>
                            <span className="av-badge"><i className="bi bi-calendar-check-fill mr-1"></i> Member Since {new Date(member.created_at).getFullYear()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body">
                {/* Flash Messages */}
                {flash && (
                    <div className={`alert-banner ab-${flash.type}`}>
                        <i className={`ab-ico bi bi-${flash.type === 'ok' ? 'check-circle-fill' : 'exclamation-triangle-fill'}`}></i>
                        <div>{flash.msg}</div>
                        <button className="ab-close" onClick={() => setFlash(null)}>&times;</button>
                    </div>
                )}

                {member.kyc_status === 'not_submitted' && (
                    <div className="alert-banner ab-warn">
                        <i className="ab-ico bi bi-shield-exclamation"></i>
                        <div>
                            <div className="ab-title">KYC Documents Pending</div>
                            <div className="ab-sub">Upload your National ID and Passport photo below to complete verification.</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSave}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Col: Editable */}
                        <div className="space-y-6">
                            <div className="sec-card">
                                <div className="sec-card-head">
                                    <div className="sch-ico" style={{background:'var(--grn-bg)',color:'var(--grn)'}}><i className="bi bi-pencil-square"></i></div>
                                    <div><div className="sch-title">Contact Details</div><div className="sch-sub">Update your contact information</div></div>
                                </div>
                                <div className="sec-card-body">
                                    <div className="sec-lbl">Editable Fields</div>
                                    <div className="space-y-4">
                                        <div className="field-group">
                                            <label className="field-lbl">Email Address</label>
                                            <div className="input-icon-wrap">
                                                <i className="bi bi-envelope input-icon"></i>
                                                <input type="email" name="email" className="field-ctrl" value={form.email} onChange={handleTextChange} required />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label className="field-lbl">Phone Number</label>
                                            <div className="input-icon-wrap">
                                                <i className="bi bi-phone input-icon"></i>
                                                <input type="tel" name="phone" className="field-ctrl" value={form.phone} onChange={handleTextChange} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="field-group">
                                                <label className="field-lbl">Date of Birth</label>
                                                <input type="date" name="dob" className="field-ctrl" value={form.dob} onChange={handleTextChange} />
                                            </div>
                                            <div className="field-group">
                                                <label className="field-lbl">Occupation</label>
                                                <input type="text" name="occupation" className="field-ctrl" value={form.occupation} onChange={handleTextChange} placeholder="e.g. Teacher" />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label className="field-lbl">Home Address</label>
                                            <div className="input-icon-wrap">
                                                <i className="bi bi-geo-alt input-icon"></i>
                                                <input type="text" name="address" className="field-ctrl" value={form.address} onChange={handleTextChange} placeholder="e.g. Nairobi, Kenya" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => setForm(f => ({...f, remove_pic: !f.remove_pic}))}>
                                            <input type="checkbox" checked={form.remove_pic} onChange={() => {}} className="w-4 h-4 accent-red-600" />
                                            <span className="text-red-600 text-xs font-bold"><i className="bi bi-trash3-fill mr-1"></i> Remove profile picture</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sec-card">
                                <div className="sec-card-head">
                                    <div className="sch-ico" style={{background:'var(--amb-bg)',color:'var(--amb)'}}><i className="bi bi-people-fill"></i></div>
                                    <div><div className="sch-title">Next of Kin</div><div className="sch-sub">Emergency contact details</div></div>
                                </div>
                                <div className="sec-card-body">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="field-group">
                                            <label className="field-lbl">Full Name</label>
                                            <input type="text" name="nok_name" className="field-ctrl" value={form.nok_name} onChange={handleTextChange} placeholder="Next of kin name" />
                                        </div>
                                        <div className="field-group">
                                            <label className="field-lbl">Phone Number</label>
                                            <input type="text" name="nok_phone" className="field-ctrl" value={form.nok_phone} onChange={handleTextChange} placeholder="Phone number" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Read-only */}
                        <div className="space-y-6">
                            <div className="sec-card">
                                <div className="sec-card-head">
                                    <div className="sch-ico" style={{background:'rgba(11,36,25,.07)',color:'var(--t2)'}}><i className="bi bi-shield-lock-fill"></i></div>
                                    <div><div className="sch-title">Account Information</div><div className="sch-sub">Locked — contact admin to change</div></div>
                                </div>
                                <div className="sec-card-body">
                                    <div className="sec-lbl">Read-only Fields</div>
                                    <div className="space-y-4">
                                        <div className="field-group">
                                            <label className="field-lbl">Full Name</label>
                                            <div className="input-icon-wrap">
                                                <i className="bi bi-person input-icon"></i>
                                                <input type="text" className="field-ctrl" value={member.full_name} readOnly />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="field-group">
                                                <label className="field-lbl">Gender</label>
                                                <input type="text" className="field-ctrl" value={member.gender || 'Unknown'} readOnly />
                                            </div>
                                            <div className="field-group">
                                                <label className="field-lbl">Date Joined</label>
                                                <input type="text" className="field-ctrl" value={new Date(member.join_date || member.created_at).toLocaleDateString()} readOnly />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label className="field-lbl">National ID / Passport No.</label>
                                            <div className="input-icon-wrap">
                                                <i className="bi bi-card-heading input-icon"></i>
                                                <input type="text" className="field-ctrl" value={member.national_id || '—'} readOnly />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="fee-block mt-6">
                                        <div className="fee-lbl">Registration Fee</div>
                                        <div className="fee-status">
                                            <div>
                                                <div className={`fee-val ${regFeePaid ? 'text-green-600' : 'text-red-600'}`}>
                                                    {regFeePaid ? 'PAID' : 'PENDING (KES 1,000)'}
                                                </div>
                                                {data.fee_txn && (
                                                    <div className="fee-ref text-[10px] text-gray-400 mt-1">Ref: {data.fee_txn.reference_no} · {new Date(data.fee_txn.created_at).toLocaleDateString()}</div>
                                                )}
                                            </div>
                                            <i className={`bi bi-${regFeePaid ? 'patch-check-fill text-green-600' : 'exclamation-circle-fill text-red-600'} text-3xl`}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {data.documents.length > 0 && (
                                <div className="sec-card">
                                    <div className="sec-card-head">
                                        <div className="sch-ico" style={{background:'var(--blu-bg)',color:'var(--blu)'}}><i className="bi bi-file-earmark-text-fill"></i></div>
                                        <div><div className="sch-title">Uploaded Documents</div><div className="sch-sub">KYC submission history</div></div>
                                    </div>
                                    <div className="sec-card-body !py-3">
                                        {data.documents.map((doc: any) => (
                                            <div key={doc.document_id} className="kyc-item">
                                                <div>
                                                    <div className="ki-type">{doc.document_name || doc.document_type.replace(/_/g, ' ')}</div>
                                                    <div className="text-[10px] text-gray-400">Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                                                </div>
                                                <span className={`doc-chip chip-${doc.status}`}>
                                                    {doc.status.toUpperCase()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 mt-8 pt-6 pb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"><i className="bi bi-lock-fill mr-1"></i> Secure Profile Management</span>
                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-f"></span> : <><i className="bi bi-check-circle-fill mr-1"></i> Save Changes</>}
                        </button>
                    </div>
                </form>

                {/* KYC UPLOAD SECTION */}
                <div className="sec-card mt-4">
                    <div className="sec-card-head">
                        <div className="sch-ico" style={{background:'var(--lg)',color:'var(--lt)'}}><i className="bi bi-cloud-arrow-up-fill"></i></div>
                        <div><div className="sch-title">Complete Your KYC</div><div className="sch-sub">Upload required identity documents for verification</div></div>
                    </div>
                    <div className="sec-card-body">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'national_id_front', label: 'National ID (Front)' },
                                { id: 'national_id_back', label: 'National ID (Back)' },
                                { id: 'passport_photo', label: 'Passport Photo' }
                            ].map(req => {
                                const doc = data.documents.find((d: any) => d.document_type === req.id);
                                const isVerified = doc?.status === 'verified';
                                return (
                                    <div key={req.id} className="kyc-upload-card">
                                        <div className="kyc-uc-head">
                                            <div className="kyc-uc-title">{req.label}</div>
                                            <span className={`doc-chip ${doc ? `chip-${doc.status}` : 'chip-missing'}`}>
                                                {doc ? doc.status.toUpperCase() : 'MISSING'}
                                            </span>
                                        </div>
                                        {isVerified ? (
                                            <div className="kyc-verified text-center">
                                                <div className="kyc-verified-ico mx-auto"><i className="bi bi-shield-check-fill"></i></div>
                                                <div className="text-green-600 font-bold text-xs mt-2">Verified</div>
                                            </div>
                                        ) : (
                                            <form onSubmit={(e) => uploadKyc(e, req.id)}>
                                                <div className="mb-3">
                                                    <input type="file" required className="kyc-file" accept="image/*,application/pdf" />
                                                </div>
                                                <button type="submit" className={`btn-upload-doc ${doc ? 'btn-reupload' : ''}`}>
                                                    <i className={`bi bi-${doc ? 'arrow-repeat' : 'cloud-upload-fill'}`}></i>
                                                    {doc ? 'Re-upload' : 'Upload Document'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
