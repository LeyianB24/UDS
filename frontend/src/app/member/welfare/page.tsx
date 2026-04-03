"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Chart, registerables } from 'chart.js';
import './welfare.css';

Chart.register(...registerables);

const kf = (v: number) => `KES ${Number(v).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const CHIP: Record<string, string> = {
    completed: 'chip-grn', active: 'chip-grn', approved: 'chip-grn', funded: 'chip-grn',
    pending: 'chip-amb', disbursed: 'chip-grn', rejected: 'chip-red', closed: 'chip-grey',
};

export default function WelfarePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'contributions' | 'community' | 'received' | 'cases'>('contributions');
    const [caseForm, setCaseForm] = useState({ title: '', description: '', requested_amount: '' });
    const [caseLoading, setCaseLoading] = useState(false);
    const [caseMsg, setCaseMsg] = useState<{ type: string; text: string } | null>(null);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        apiFetch('/api/v1/member_welfare.php')
            .then(r => { setData(r); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, []);

    useEffect(() => {
        if (!data || !chartRef.current) return;
        if (chartInstance.current) chartInstance.current.destroy();
        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        chartInstance.current = new Chart(chartRef.current, {
            type: 'bar',
            data: {
                labels: data.chart_labels ?? [],
                datasets: [{
                    label: 'Welfare Contributions',
                    data: data.chart_values ?? [],
                    backgroundColor: 'rgba(163,230,53,0.25)',
                    borderColor: '#a3e635',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#0d1d14' : '#fff',
                        titleColor: isDark ? '#d8eee2' : '#0b2419',
                        bodyColor: isDark ? '#4d7a60' : '#456859',
                        borderColor: 'rgba(11,36,25,.08)', borderWidth: 1, padding: 12,
                        callbacks: { label: (c) => `KES ${(c.parsed.y ?? 0).toLocaleString()}` }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#6b8a7a', font: { size: 11 } } },
                    y: { grid: { color: 'rgba(11,36,25,.05)' }, ticks: { color: '#6b8a7a', font: { size: 11 }, callback: (v) => `KES ${Number(v).toLocaleString()}` } }
                }
            }
        });
    }, [data]);

    const handleCaseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCaseLoading(true); setCaseMsg(null);
        try {
            const res = await apiFetch('/api/v1/member_welfare.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(caseForm)
            });
            setCaseMsg({ type: 'success', text: res.message || 'Case submitted!' });
            setCaseForm({ title: '', description: '', requested_amount: '' });
            setTimeout(() => window.location.reload(), 1800);
        } catch (err: any) {
            setCaseMsg({ type: 'error', text: err.message || 'Failed to submit.' });
        } finally { setCaseLoading(false); }
    };

    if (loading) return (
        <div className="wf-loading">
            <div className="wf-spinner"></div>
            <p>Loading welfare data...</p>
        </div>
    );

    if (error) return (
        <div className="wf-error-banner">
            <i className="bi bi-exclamation-triangle-fill"></i> {error}
        </div>
    );

    const { welfare_pool = 0, total_given = 0, total_received = 0, net_standing = 0,
        withdrawable = 0, contributions = [], support_received = [], member_cases = [], community_cases = [] } = data || {};

    const isContributor = net_standing >= 0;

    return (
        <div className="wf-page">
            {/* ── HERO ── */}
            <div className="wf-hero">
                <div className="wf-hero-mesh"></div>
                <div className="wf-hero-dots"></div>
                <div className="wf-hero-ring r1"></div>
                <div className="wf-hero-ring r2"></div>
                <div className="wf-hero-inner">
                    <div className="wf-hero-nav">
                        <Link href="/member/dashboard" className="wf-back">
                            <i className="bi bi-arrow-left"></i> Dashboard
                        </Link>
                        <span className="wf-brand-tag">UMOJA SACCO</span>
                    </div>

                    <div className="wf-hero-grid">
                        <div>
                            <div className="wf-eyebrow"><div className="wf-ey-line"></div>Welfare Fund</div>
                            <div className="wf-hero-lbl">Global Solidarity Pool</div>
                            <div className="wf-hero-amount">
                                <span className="wf-cur">KES</span>
                                {Number(welfare_pool).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                            </div>
                            <div className={`wf-pill ${isContributor ? 'green' : 'rose'}`}>
                                <span className="wf-pill-dot" style={{ background: isContributor ? '#a3e635' : '#f43f5e' }}></span>
                                Community {isContributor ? 'Contributor' : 'Beneficiary'} · {net_standing >= 0 ? '+' : ''}{kf(net_standing)} net
                            </div>
                            <div className="wf-hero-ctas">
                                <Link href="/member/mpesa?type=welfare" className="wf-btn-lime">
                                    <i className="bi bi-heart-fill"></i> Contribute
                                </Link>
                                <button className="wf-btn-ghost" onClick={() => (document.getElementById('caseModal') as HTMLDialogElement)?.showModal()}>
                                    <i className="bi bi-plus-circle"></i> Report Case
                                </button>
                                {withdrawable > 0 && (
                                    <Link href="/member/withdraw?type=welfare" className="wf-btn-ghost-red">
                                        <i className="bi bi-wallet2"></i> Withdraw Benefit
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="wf-pool-block">
                            <div className="wf-pool-lbl">Your Standing</div>
                            <div className="wf-pool-rows">
                                <div className="wf-pool-item">
                                    <div className="wf-pool-ico green"><i className="bi bi-heart-fill"></i></div>
                                    <div>
                                        <div className="wf-pool-val">{kf(total_given)}</div>
                                        <div className="wf-pool-sub">Total Contributed</div>
                                    </div>
                                </div>
                                <div className="wf-pool-item">
                                    <div className="wf-pool-ico red"><i className="bi bi-arrow-down-left-circle-fill"></i></div>
                                    <div>
                                        <div className="wf-pool-val">{kf(total_received)}</div>
                                        <div className="wf-pool-sub">Support Received</div>
                                    </div>
                                </div>
                                {withdrawable > 0 && (
                                    <div className="wf-pool-item">
                                        <div className="wf-pool-ico amber"><i className="bi bi-wallet2"></i></div>
                                        <div>
                                            <div className="wf-pool-val">{kf(withdrawable)}</div>
                                            <div className="wf-pool-sub">Withdrawable Benefit</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FLOATING STAT CARDS ── */}
            <div className="wf-stats-float">
                <div className="wf-stats-grid">
                    <div className="wsc sc-g">
                        <div className="wsc-ico" style={{ background: 'rgba(22,163,74,.08)', color: '#16a34a' }}><i className="bi bi-heart-fill"></i></div>
                        <div className="wsc-lbl">My Contributions</div>
                        <div className="wsc-val">{kf(total_given)}</div>
                        <div className="wsc-bar"><div className="wsc-fill" style={{ background: '#16a34a', width: '100%' }}></div></div>
                        <div className="wsc-meta">Lifetime welfare contributions</div>
                    </div>
                    <div className="wsc sc-r">
                        <div className="wsc-ico" style={{ background: 'rgba(220,38,38,.08)', color: '#dc2626' }}><i className="bi bi-arrow-down-left-square-fill"></i></div>
                        <div className="wsc-lbl">Support Received</div>
                        <div className="wsc-val">{kf(total_received)}</div>
                        <div className="wsc-bar"><div className="wsc-fill" style={{ background: '#dc2626', width: `${total_given > 0 ? Math.min(100, (total_received / total_given) * 100) : 0}%` }}></div></div>
                        <div className="wsc-meta">Total support disbursed to you</div>
                    </div>
                    <div className={`wsc ${isContributor ? 'sc-l' : 'sc-r'}`}>
                        <div className="wsc-ico" style={{ background: isContributor ? 'rgba(163,230,53,.14)' : 'rgba(220,38,38,.08)', color: isContributor ? '#5a8a1a' : '#dc2626' }}>
                            <i className="bi bi-scale"></i>
                        </div>
                        <div className="wsc-lbl">Net Impact</div>
                        <div className="wsc-val" style={{ color: isContributor ? '#16a34a' : '#dc2626' }}>
                            {net_standing >= 0 ? '+' : ''}{kf(net_standing)}
                        </div>
                        <div className="wsc-bar"><div className="wsc-fill" style={{ background: isContributor ? '#a3e635' : '#dc2626', width: `${Math.min(100, Math.abs(net_standing / (total_given || 1)) * 100)}%` }}></div></div>
                        <div className="wsc-meta">Community {isContributor ? 'Contributor' : 'Beneficiary'} status</div>
                    </div>
                    <div className="wsc sc-a">
                        <div className="wsc-ico" style={{ background: 'rgba(217,119,6,.08)', color: '#d97706' }}><i className="bi bi-wallet2"></i></div>
                        <div className="wsc-lbl">Withdrawable</div>
                        <div className="wsc-val">{kf(withdrawable)}</div>
                        <div className="wsc-bar"><div className="wsc-fill" style={{ background: '#d97706', width: withdrawable > 0 ? '80%' : '0%' }}></div></div>
                        <div className="wsc-meta">Available for withdrawal now</div>
                    </div>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="wf-body">
                {/* Chart + Policy */}
                <div className="wf-chart-row">
                    <div className="wf-chart-card">
                        <div className="wf-cc-head">
                            <span className="wf-cc-title">Contribution Trend</span>
                            <span className="wf-cc-badge"><i className="bi bi-activity"></i> Lifetime</span>
                        </div>
                        <div className="wf-chart-wrap">
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>
                    <div className="wf-policy-card">
                        <div className="wf-policy-inner">
                            <div className="wf-policy-title">Welfare Policy</div>
                            <p className="wf-policy-desc">Contributions assist members during bereavement and hospitalization. Active membership status is required to be eligible for support.</p>
                            <div className="wf-policy-items">
                                {['Bereavement Support', 'Medical Emergency', 'Community Fundraisers'].map(item => (
                                    <div key={item} className="wf-policy-item">
                                        <div className="wf-policy-check"><i className="bi bi-check-lg"></i></div>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Card */}
                <div className="wf-tab-card">
                    <div className="wf-tab-head">
                        <div className="wf-tab-pills">
                            {(['contributions', 'community', 'received', 'cases'] as const).map(tab => (
                                <button key={tab} className={`wf-tpill ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                                    {{ contributions: 'Contributions', community: 'Community', received: 'Support Received', cases: 'My Cases' }[tab]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Contributions Tab ── */}
                    {activeTab === 'contributions' && (
                        <div className="wf-table-wrap">
                            {contributions.length === 0 ? (
                                <div className="wf-empty"><div className="wf-empty-ico"><i className="bi bi-heart"></i></div><div className="wf-empty-title">No Contributions Yet</div><div className="wf-empty-sub">Your welfare contributions will appear here.</div></div>
                            ) : (
                                <table className="wf-table">
                                    <thead><tr><th>Date</th><th>Reference</th><th>Type</th><th>Status</th><th className="text-right">Amount</th></tr></thead>
                                    <tbody>
                                        {contributions.map((c: any, i: number) => (
                                            <tr key={i}>
                                                <td>
                                                    <div className="wf-cell-date">{new Date(c.created_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                    <div className="wf-cell-time">{new Date(c.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td><span className="wf-ref">{c.reference_no || 'N/A'}</span></td>
                                                <td className="wf-cell-type">Welfare Contribution</td>
                                                <td><span className={`wf-chip ${CHIP[c.status?.toLowerCase()] || 'chip-grey'}`}>{c.status}</span></td>
                                                <td className="text-right"><span className="wf-amt-in">+ {kf(c.amount)}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ── Community Tab ── */}
                    {activeTab === 'community' && (
                        <div className="wf-community-grid">
                            {community_cases.length === 0 ? (
                                <div className="wf-empty"><div className="wf-empty-ico"><i className="bi bi-emoji-smile"></i></div><div className="wf-empty-title">All Clear</div><div className="wf-empty-sub">No active community situations. The SACCO is doing well!</div></div>
                            ) : community_cases.map((c: any, i: number) => {
                                const target = parseFloat(c.target_amount || c.requested_amount || 0);
                                const raised = parseFloat(c.total_raised || 0);
                                const pct = target > 0 ? Math.min(100, (raised / target) * 100) : 0;
                                const stKey = c.status?.toLowerCase();
                                return (
                                    <div key={i} className="wf-case-card">
                                        <div className="wf-case-top">
                                            <div className="wf-case-meta">
                                                <span className="wf-case-id">Case #{c.case_id}</span>
                                                <span className={`wf-case-chip cs-${stKey}`}>{c.status}</span>
                                            </div>
                                            <div className="wf-case-title">{c.title}</div>
                                        </div>
                                        <div className="wf-case-body">
                                            <p className="wf-case-desc">{c.description}</p>
                                            <div className="wf-case-prog-row">
                                                <span className="wf-case-raised">{kf(raised)}</span>
                                                <span className="wf-case-target">Target: {kf(target)}</span>
                                            </div>
                                            <div className="wf-case-prog-track"><div className="wf-case-prog-fill" style={{ width: `${pct}%` }}></div></div>
                                            <div className="wf-case-footer">
                                                <span className="wf-donors"><i className="bi bi-people"></i> {c.donor_count ?? 0} donors</span>
                                                <Link href={`/member/mpesa?type=welfare_case&case_id=${c.case_id}`} className="wf-btn-support">
                                                    <i className="bi bi-heart-fill"></i> Support
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Support Received Tab ── */}
                    {activeTab === 'received' && (
                        <div className="wf-table-wrap">
                            {support_received.length === 0 ? (
                                <div className="wf-empty"><div className="wf-empty-ico"><i className="bi bi-inbox"></i></div><div className="wf-empty-title">No Support Records</div><div className="wf-empty-sub">No welfare support has been disbursed to your account yet.</div></div>
                            ) : (
                                <table className="wf-table">
                                    <thead><tr><th>Date</th><th>Reason</th><th>Approved By</th><th>Status</th><th className="text-right">Amount</th></tr></thead>
                                    <tbody>
                                        {support_received.map((s: any, i: number) => (
                                            <tr key={i}>
                                                <td><div className="wf-cell-date">{new Date(s.date_granted).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</div></td>
                                                <td><div className="wf-cell-title">{s.reason || 'Welfare Support'}</div></td>
                                                <td className="wf-cell-by">SACCO Admin</td>
                                                <td><span className={`wf-chip ${CHIP[s.status?.toLowerCase()] || 'chip-grey'}`}>{s.status}</span></td>
                                                <td className="text-right"><span className="wf-amt-out">− {kf(s.amount)}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ── My Cases Tab ── */}
                    {activeTab === 'cases' && (
                        <div className="wf-table-wrap">
                            {member_cases.length === 0 ? (
                                <div className="wf-empty"><div className="wf-empty-ico"><i className="bi bi-folder2-open"></i></div><div className="wf-empty-title">No Cases Found</div><div className="wf-empty-sub">No welfare cases are associated with your account.</div></div>
                            ) : (
                                <table className="wf-table">
                                    <thead><tr><th>Date</th><th>Title</th><th>Description</th><th>Status</th><th className="text-right">Approved Amount</th></tr></thead>
                                    <tbody>
                                        {member_cases.map((c: any, i: number) => (
                                            <tr key={i}>
                                                <td><div className="wf-cell-date">{new Date(c.created_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</div></td>
                                                <td><div className="wf-cell-title">{c.title}</div></td>
                                                <td><div className="wf-cell-desc">{c.description}</div></td>
                                                <td><span className={`wf-chip ${CHIP[c.status?.toLowerCase()] || 'chip-grey'}`}>{c.status}</span></td>
                                                <td className="text-right"><span className="wf-amt-neu">{kf(c.approved_amount || 0)}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── REPORT CASE MODAL ── */}
            <dialog id="caseModal" className="wf-modal">
                <div className="wf-modal-inner">
                    <div className="wf-modal-head">
                        <div>
                            <div className="wf-modal-title"><i className="bi bi-plus-circle-fill" style={{ color: '#16a34a' }}></i> Report Welfare Situation</div>
                            <div className="wf-modal-sub">Describe the situation to request community support.</div>
                        </div>
                        <button className="wf-modal-close" onClick={() => (document.getElementById('caseModal') as HTMLDialogElement)?.close()}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                    {caseMsg && (
                        <div className={`wf-modal-msg ${caseMsg.type === 'success' ? 'msg-ok' : 'msg-err'}`}>
                            <i className={`bi ${caseMsg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                            {caseMsg.text}
                        </div>
                    )}
                    <form onSubmit={handleCaseSubmit} className="wf-modal-body">
                        <div className="wf-mf">
                            <label className="wf-ml">Case Title</label>
                            <input className="wf-mi" required placeholder="e.g. Bereavement — John Doe" value={caseForm.title} onChange={e => setCaseForm(p => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div className="wf-mf">
                            <label className="wf-ml">Description</label>
                            <textarea className="wf-mt" rows={3} placeholder="Briefly describe the welfare situation..." value={caseForm.description} onChange={e => setCaseForm(p => ({ ...p, description: e.target.value }))}></textarea>
                        </div>
                        <div className="wf-mf">
                            <label className="wf-ml">Requested Amount (KES)</label>
                            <input type="number" className="wf-mi" required min={100} placeholder="0" value={caseForm.requested_amount} onChange={e => setCaseForm(p => ({ ...p, requested_amount: e.target.value }))} />
                        </div>
                        <div className="wf-modal-actions">
                            <button type="button" className="wf-btn-cancel" onClick={() => (document.getElementById('caseModal') as HTMLDialogElement)?.close()}>Cancel</button>
                            <button type="submit" className="wf-btn-submit" disabled={caseLoading}>
                                {caseLoading ? 'Submitting...' : <><i className="bi bi-send-fill"></i> Submit Case</>}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
}
