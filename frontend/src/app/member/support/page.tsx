"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import './support.css';

const CATEGORIES = [
    { id: 'loans', label: 'Loans & Repayments', icon: 'bi-bank2', bg: 'var(--amb-bg)', col: 'var(--amb)' },
    { id: 'savings', label: 'Savings & Deposits', icon: 'bi-piggy-bank-fill', bg: 'var(--grn-bg)', col: 'var(--grn)' },
    { id: 'shares', label: 'Shares & Equity', icon: 'bi-pie-chart-fill', bg: 'var(--blu-bg)', col: 'var(--blu)' },
    { id: 'welfare', label: 'Welfare & Benefits', icon: 'bi-heart-pulse-fill', bg: 'var(--red-bg)', col: 'var(--red)' },
    { id: 'withdrawals', label: 'Withdrawals & M-Pesa', icon: 'bi-phone-vibrate-fill', bg: 'var(--grn-bg)', col: 'var(--grn)' },
    { id: 'technical', label: 'Technical Issue', icon: 'bi-tools', bg: 'rgba(124,77,255,.08)', col: '#7c4dff' },
    { id: 'profile', label: 'Account / Profile', icon: 'bi-person-badge-fill', bg: 'var(--blu-bg)', col: 'var(--blu)' },
    { id: 'investments', label: 'Investments', icon: 'bi-buildings-fill', bg: 'var(--amb-bg)', col: 'var(--amb)' },
    { id: 'general', label: 'General Inquiry', icon: 'bi-chat-dots-fill', bg: 'rgba(11,36,25,.07)', col: 'var(--t2)' },
];

const PRIORITIES = [
    { id: 'low', label: 'Low', dot: '#16a34a' },
    { id: 'normal', label: 'Normal', dot: '#2563eb' },
    { id: 'high', label: 'High', dot: '#d97706' },
    { id: 'urgent', label: 'Urgent', dot: '#dc2626' },
];

export default function SupportPage() {
    const [activeTab, setActiveTab] = useState('new-ticket');
    const [tickets, setTickets] = useState<any[]>([]);
    const [counts, setCounts] = useState({ open: 0, resolved: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    const [selectedCat, setSelectedCat] = useState('general');
    const [priority, setPriority] = useState('normal');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [refNo, setRefNo] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    const loadData = useCallback(async () => {
        try {
            const res = await apiFetch('/api/member/support');
            if (res.status === 'success') {
                setTickets(res.data.tickets);
                setCounts(res.data.counts);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) return;

        setSubmitting(true);
        setFlash(null);

        try {
            const res = await apiFetch('/api/member/support', {
                method: 'POST',
                body: JSON.stringify({
                    category: selectedCat,
                    subject,
                    message,
                    priority,
                    reference_no: refNo
                })
            });

            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                setSubject('');
                setMessage('');
                setRefNo('');
                loadData();
                // Optionally switch to history tab
                setTimeout(() => setActiveTab('my-tickets'), 2000);
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="dash">
            {/* HERO */}
            <div className="support-hero">
                <div className="hero-mesh"></div>
                <div className="hero-dots"></div>
                <div className="hero-ring r1"></div>
                <div className="hero-ring r2"></div>
                <div className="hero-ring r3"></div>

                <Link href="/member/dashboard" className="btn-back">
                    <i className="bi bi-arrow-left"></i> Dashboard
                </Link>

                <div className="hero-inner">
                    <div className="hero-eyebrow">
                        <span className="eyebrow-dot"></span>
                        Member Support
                    </div>
                    <h1>How can we<br />help you today?</h1>
                    <p className="hero-sub">
                        Our specialized support team handles everything from
                        <strong> loan queries</strong> to <strong>technical issues</strong>.
                        Submit a ticket and we'll respond within 24 hours.
                    </p>
                    <div className="hero-pills">
                        <span className="hero-pill"><i className="bi bi-lightning-charge-fill mr-1"></i> &lt; 24hr response</span>
                        <span className="hero-pill"><i className="bi bi-shield-check-fill mr-1"></i> Secure &amp; confidential</span>
                        <span className="hero-pill"><i className="bi bi-headset mr-1"></i> 9 support desks</span>
                    </div>
                </div>

                <div className="hero-right">
                    <div className="hero-stat-block">
                        <div className="hstat">
                            <div className="hstat-val">{counts.open}</div>
                            <div className="hstat-lbl">Open Tickets</div>
                        </div>
                        <div className="hstat">
                            <div className="hstat-val">{counts.resolved}</div>
                            <div className="hstat-lbl">Resolved</div>
                        </div>
                        <div className="hstat">
                            <div className="hstat-val">{counts.total}</div>
                            <div className="hstat-lbl">Total Submitted</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FLOATING STATS */}
            <div className="stats-float">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="sc sc-g">
                        <div className="sc-ico" style={{background:'var(--grn-bg)',color:'var(--grn)'}}><i className="bi bi-lightning-charge-fill"></i></div>
                        <div className="sc-lbl">Avg Response</div>
                        <div className="sc-val">&lt; 24 hrs</div>
                        <div className="sc-meta">Business days</div>
                    </div>
                    <div className="sc sc-a">
                        <div className="sc-ico" style={{background:'var(--amb-bg)',color:'var(--amb)'}}><i className="bi bi-ticket-detailed-fill"></i></div>
                        <div className="sc-lbl">Open Tickets</div>
                        <div className="sc-val">{counts.open}</div>
                        <div className="sc-meta">{counts.open > 0 ? 'Awaiting response' : 'All clear!'}</div>
                    </div>
                    <div className="sc sc-b">
                        <div className="sc-ico" style={{background:'var(--blu-bg)',color:'var(--blu)'}}><i className="bi bi-check2-circle"></i></div>
                        <div className="sc-lbl">Resolved</div>
                        <div className="sc-val">{counts.resolved}</div>
                        <div className="sc-meta">Successfully closed</div>
                    </div>
                    <div className="sc sc-l">
                        <div className="sc-ico" style={{background:'var(--lg)',color:'var(--lt)'}}><i className="bi bi-clock-history"></i></div>
                        <div className="sc-lbl">Service Hours</div>
                        <div className="sc-val">Mon–Sat</div>
                        <div className="sc-meta">08:00 – 17:00 EAT</div>
                    </div>
                </div>
            </div>

            {/* FLASH MESSAGES */}
            <div className="px-[52px] pt-7">
                {flash && (
                    <div className={`flash ${flash.type}`}>
                        <div className="flash-ico">
                            <i className={`bi ${flash.type === 'ok' ? 'bi-check2-circle' : 'bi-exclamation-triangle-fill'}`}></i>
                        </div>
                        <div>
                            <div className="flash-title">{flash.type === 'ok' ? 'Ticket Submitted' : 'Submission Failed'}</div>
                            <div className="flash-sub">{flash.msg}</div>
                        </div>
                        <button className="flash-close" onClick={() => setFlash(null)}>&times;</button>
                    </div>
                )}
            </div>

            {/* BODY GRID */}
            <div className="pg-body">
                {/* Sidebar */}
                <div className="sidebar-col">
                    <div className="card">
                        <div className="card-head">
                            <div className="ch-ico" style={{background:'var(--lg)',color:'var(--lt)'}}><i className="bi bi-telephone-fill"></i></div>
                            <div>
                                <div className="ch-title">Direct Contact</div>
                                <div className="ch-sub">Reach us outside tickets</div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="contact-item">
                                <div className="ci-ico"><i className="bi bi-geo-alt-fill"></i></div>
                                <div>
                                    <div className="ci-label">Headquarters</div>
                                    <div className="ci-value">Mombasa, Kenya</div>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div className="ci-ico"><i className="bi bi-telephone-outbound-fill"></i></div>
                                <div>
                                    <div className="ci-label">Hotline</div>
                                    <div className="ci-value">+254 700 000000</div>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div className="ci-ico"><i className="bi bi-envelope-paper-fill"></i></div>
                                <div>
                                    <div className="ci-label">Official Email</div>
                                    <div className="ci-value">support@umoja.com</div>
                                </div>
                            </div>

                            <div className="hours-block">
                                <div className="hb-inner">
                                    <div className="hb-ico-wrap"><i className="bi bi-clock-history"></i></div>
                                    <div className="hb-title">Service Hours</div>
                                    <div className="hb-row">
                                        <span className="hb-day">Mon – Fri</span>
                                        <span className="hb-time">08:00 – 17:00</span>
                                    </div>
                                    <div className="hb-row">
                                        <span className="hb-day">Saturday</span>
                                        <span className="hb-time">09:00 – 13:00</span>
                                    </div>
                                    <div className="hb-row">
                                        <span className="hb-day">Sunday</span>
                                        <span className="hb-time opacity-30">Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-head">
                            <div className="ch-ico" style={{background:'var(--blu-bg)',color:'var(--blu)'}}><i className="bi bi-grid-fill"></i></div>
                            <div><div className="ch-title">Quick Access</div><div className="ch-sub">Jump to your accounts</div></div>
                        </div>
                        <div className="card-body !pb-3.5">
                            {[
                                { icon: 'bi-piggy-bank-fill', bg: 'var(--grn-bg)', col: 'var(--grn)', label: 'Savings Account', href: '/member/savings' },
                                { icon: 'bi-bank2', bg: 'var(--amb-bg)', col: 'var(--amb)', label: 'My Loans', href: '/member/loans' },
                                { icon: 'bi-heart-pulse-fill', bg: 'var(--red-bg)', col: 'var(--red)', label: 'Welfare Hub', href: '/member/welfare' },
                                { icon: 'bi-arrow-left-right', bg: 'var(--blu-bg)', col: 'var(--blu)', label: 'All Transactions', href: '/member/transactions' },
                            ].map((link, idx) => (
                                <Link key={idx} href={link.href} className="quick-link">
                                    <div className="ql-ico" style={{background: link.bg, color: link.col}}><i className={`bi ${link.icon}`}></i></div>
                                    {link.label}
                                    <i className="bi bi-arrow-right ql-arrow"></i>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main */}
                <div className="main-col">
                    <div className="tab-shell">
                        <div className="tab-shell-head">
                            <button 
                                className={`stab ${activeTab === 'new-ticket' ? 'active' : ''}`}
                                onClick={() => setActiveTab('new-ticket')}
                            >
                                <i className="bi bi-plus-circle-fill mr-1"></i> New Ticket
                            </button>
                            <button 
                                className={`stab ${activeTab === 'my-tickets' ? 'active' : ''}`}
                                onClick={() => setActiveTab('my-tickets')}
                            >
                                <i className="bi bi-ticket-detailed-fill mr-1"></i> My Tickets
                                {counts.open > 0 && <span className="stab-badge">{counts.open}</span>}
                            </button>
                        </div>

                        {activeTab === 'new-ticket' ? (
                            <div className="p-7 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="form-divider">Step 1 &mdash; Choose a Category</div>
                                <div className="cat-grid">
                                    {CATEGORIES.map((cat) => (
                                        <div 
                                            key={cat.id} 
                                            className={`cat-tile ${selectedCat === cat.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedCat(cat.id)}
                                        >
                                            <div className="cat-tile-check"><i className="bi bi-check"></i></div>
                                            <div className="cat-tile-ico" style={{background: cat.bg, color: cat.col}}>
                                                <i className={`bi ${cat.icon}`}></i>
                                            </div>
                                            <span className="cat-tile-lbl">{cat.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-divider">Step 2 &mdash; Ticket Details</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1 md:col-span-1.5 field-group">
                                            <label className="field-lbl">Subject</label>
                                            <div className="input-with-icon">
                                                <i className="bi bi-tag-fill"></i>
                                                <input 
                                                    type="text" 
                                                    className="field-ctrl" 
                                                    placeholder="Briefly describe the issue" 
                                                    value={subject}
                                                    onChange={e => setSubject(e.target.value)}
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label className="field-lbl">Ref / Transaction ID <span className="opt-badge ml-1">Optional</span></label>
                                            <div className="input-with-icon">
                                                <i className="bi bi-hash"></i>
                                                <input 
                                                    type="text" 
                                                    className="field-ctrl" 
                                                    placeholder="e.g. S9K1234567" 
                                                    value={refNo}
                                                    onChange={e => setRefNo(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label className="field-lbl">Detailed Description</label>
                                        <textarea 
                                            className="field-ctrl" 
                                            rows={6} 
                                            placeholder="Describe your issue clearly — include dates, amounts, and error messages..." 
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="field-group">
                                        <label className="field-lbl">Priority</label>
                                        <div className="priority-row">
                                            {PRIORITIES.map((pri) => (
                                                <label 
                                                    key={pri.id}
                                                    className={`pri-pill ${priority === pri.id ? `selected-${pri.id}` : ''}`}
                                                    onClick={() => setPriority(pri.id)}
                                                >
                                                    <span className="pri-dot" style={{background: pri.dot}}></span>
                                                    {pri.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-submit mt-6" disabled={submitting}>
                                        {submitting ? (
                                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                        ) : (
                                            <><i className="bi bi-send-fill mr-1"></i> Submit Ticket</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="overflow-x-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <table className="ticket-table">
                                    <thead>
                                        <tr>
                                            <th className="pl-6">ID</th>
                                            <th>Category</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th className="pr-6">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tickets.length > 0 ? tickets.map((t) => (
                                            <tr key={t.support_id}>
                                                <td className="pl-6"><span className="tid">#{t.support_id}</span></td>
                                                <td><span className="tcat">{t.category}</span></td>
                                                <td className="font-bold text-gray-800 dark:text-gray-200">{t.subject}</td>
                                                <td>
                                                    <span className={`tstatus ts-${t.status.toLowerCase()}`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                                <td className="pr-6 text-gray-500 text-xs">
                                                    {new Date(t.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5}>
                                                    <div className="empty-well">
                                                        <div className="ew-ico"><i className="bi bi-inbox"></i></div>
                                                        <div className="ew-title">No Tickets Found</div>
                                                        <div className="ew-sub">You haven't submitted any support requests yet.</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
