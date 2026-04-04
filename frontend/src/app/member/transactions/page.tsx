"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from '@/lib/api';
import './transactions.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

const kf = (v: number) => `KES ${Number(v).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const ks = (n: number): string => {
    if (n >= 1_000_000) return 'KES ' + (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return 'KES ' + (n / 1_000).toFixed(1) + 'K';
    return 'KES ' + n.toLocaleString();
};

const ICON_MAP: Record<string, string> = {
    deposit: 'bi-arrow-down-circle-fill',
    savings_deposit: 'bi-arrow-down-circle-fill',
    contribution: 'bi-calendar-check-fill',
    withdrawal: 'bi-arrow-up-circle-fill',
    withdrawal_initiate: 'bi-arrow-up-circle-fill',
    loan_repayment: 'bi-cash-stack',
    loan_disbursement: 'bi-bank2',
    welfare: 'bi-heart-pulse-fill',
    welfare_contribution: 'bi-heart-pulse-fill',
    welfare_payout: 'bi-heart-pulse-fill',
    revenue_inflow: 'bi-receipt',
    registration_fee: 'bi-receipt',
    share_purchase: 'bi-graph-up-arrow',
    dividend_payment: 'bi-stars',
};

export default function TransactionsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [type, setType] = useState('');
    const [date, setDate] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (date) params.append('date', date);
            if (from) params.append('from', from);
            if (to) params.append('to', to);

            const res = await apiFetch(`/api/member/transactions?${params.toString()}`);
            setData(res);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [type, date, from, to]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleClear = () => {
        setType(''); setDate(''); setFrom(''); setTo('');
    };

    const chartOptions = useMemo(() => {
        const dark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-bs-theme') === 'dark';
        const GRID = dark ? 'rgba(255,255,255,.05)' : 'rgba(11,36,25,.05)';
        const TICK = dark ? '#3a6050' : '#8fada0';
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: dark ? '#0d1d14' : '#0b2419',
                    titleColor: '#a3e635',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 10,
                    borderColor: 'rgba(163,230,53,.2)',
                    borderWidth: 1,
                    titleFont: { weight: 'bold' as const },
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: TICK } },
                y: { grid: { color: GRID }, ticks: { color: TICK } }
            }
        };
    }, []);

    const flowData = useMemo(() => {
        if (!data?.charts) return null;
        return {
            labels: data.charts.labels,
            datasets: [
                {
                    label: 'Inflows',
                    data: data.charts.inflows,
                    borderColor: '#16a34a',
                    backgroundColor: (ctx: any) => {
                        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
                        gradient.addColorStop(0, '#16a34a3a');
                        gradient.addColorStop(1, '#16a34a00');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Outflows',
                    data: data.charts.outflows,
                    borderColor: '#dc2626',
                    backgroundColor: (ctx: any) => {
                        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
                        gradient.addColorStop(0, '#dc26263a');
                        gradient.addColorStop(1, '#dc262600');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Net',
                    data: data.charts.net,
                    borderColor: '#2563eb',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                }
            ]
        };
    }, [data]);

    const donutData = useMemo(() => {
        if (!data?.breakdown) return null;
        const colors = ['#0b2419', '#a3e635', '#2563eb', '#dc2626', '#0d9488', '#d97706', '#7c4dff'];
        return {
            labels: data.breakdown.map((b: any) => b.label),
            datasets: [{
                data: data.breakdown.map((b: any) => b.value),
                backgroundColor: colors.map(c => c + 'cc'),
                borderWidth: 0,
                hoverOffset: 7
            }]
        };
    }, [data]);

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635]"></div>
            </div>
        );
    }

    const { transactions = [], stats = {} } = data || {};

    return (
        <div className="dash">
            {/* HERO */}
            <div className="hero">
                <div className="hero-mesh"></div>
                <div className="hero-dots"></div>
                <div className="hero-ring r1"></div>
                <div className="hero-ring r2"></div>
                <div className="hero-inner">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="flex-1">
                            <div className="hero-eyebrow"><span className="eyebrow-dot"></span> Personal Ledger</div>
                            <h1>Transaction History</h1>
                            <p className="hero-sub">Full financial activity for your account &nbsp;&middot;&nbsp; <strong>{stats.txn_count || 0} transactions</strong> on record</p>
                            <div className="hero-bubbles">
                                <div className="hbub"><div className="hbub-val">{ks(stats.net_savings || 0)}</div><div className="hbub-lbl">Net Savings</div></div>
                                <div className="hbub"><div className="hbub-val">{ks(stats.active_loans || 0)}</div><div className="hbub-lbl">Active Loans</div></div>
                                <div className="hbub"><div className="hbub-val">{ks(stats.total_repaid || 0)}</div><div className="hbub-lbl">Total Repaid</div></div>
                                <div className="hbub"><div className="hbub-val">{ks(stats.total_withdrawn || 0)}</div><div className="hbub-lbl">Withdrawn</div></div>
                            </div>
                            <div className="hero-ctas mt-4">
                                <div className="dropdown relative">
                                    <button className="btn-lime">
                                        <i className="bi bi-cloud-download-fill mr-2"></i> Export
                                    </button>
                                    <ul className="exp-dd">
                                        <li><a className="dd-item" href="#"><div className="dd-ic" style={{background:'rgba(220,38,38,.09)',color:'#dc2626'}}><i className="bi bi-file-pdf"></i></div> PDF Report</a></li>
                                        <li><a className="dd-item" href="#"><div className="dd-ic" style={{background:'rgba(5,150,105,.09)',color:'#059669'}}><i className="bi bi-file-earmark-excel"></i></div> Excel Sheet</a></li>
                                    </ul>
                                </div>
                                <button className="btn-ghost" onClick={() => document.getElementById('filterSection')?.scrollIntoView({behavior:'smooth'})}>
                                    <i className="bi bi-funnel mr-2"></i> Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="stats-float">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="sc sc-g">
                        <div className="sc-ico" style={{background:'var(--grn-bg)',color:'var(--grn)'}}><i className="bi bi-arrow-down-circle-fill"></i></div>
                        <div className="sc-lbl">Total Deposited</div>
                        <div className="sc-val">{ks(stats.total_deposited || 0)}</div>
                        <div className="sc-bar"><div className="sc-bar-fill" style={{background:'var(--grn)', width: '100%'}}></div></div>
                        <div className="sc-meta">All-time inflows</div>
                    </div>
                    <div className="sc sc-r">
                        <div className="sc-ico" style={{background:'var(--red-bg)',color:'var(--red)'}}><i className="bi bi-arrow-up-circle-fill"></i></div>
                        <div className="sc-lbl">Total Withdrawn</div>
                        <div className="sc-val">{ks(stats.total_withdrawn || 0)}</div>
                        <div className="sc-bar"><div className="sc-bar-fill" style={{background:'var(--red)', width: stats.total_deposited > 0 ? `${Math.min(100, (stats.total_withdrawn/stats.total_deposited)*100)}%` : '0%'}}></div></div>
                        <div className="sc-meta">Outflows from account</div>
                    </div>
                    <div className="sc sc-b">
                        <div className="sc-ico" style={{background:'var(--blu-bg)',color:'var(--blu)'}}><i className="bi bi-bank2"></i></div>
                        <div className="sc-lbl">Total Repaid</div>
                        <div className="sc-val">{ks(stats.total_repaid || 0)}</div>
                        <div className="sc-bar"><div className="sc-bar-fill" style={{background:'var(--blu)', width: '100%'}}></div></div>
                        <div className="sc-meta">Loan repayments</div>
                    </div>
                    <div className="sc sc-a">
                        <div className="sc-ico" style={{background:'var(--amb-bg)',color:'var(--amb)'}}><i className="bi bi-lightning-charge-fill"></i></div>
                        <div className="sc-lbl">Net Position</div>
                        <div className="sc-val">{ks(stats.net_savings || 0)}</div>
                        <div className="sc-bar"><div className="sc-bar-fill" style={{background:'var(--amb)', width: '70%'}}></div></div>
                        <div className="sc-meta">Actual available wealth</div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
                    <div className="lg:col-span-8">
                        <div className="chart-card">
                            <div className="cc-head">
                                <div>
                                    <div className="cc-title">12-Month Cash Flow</div>
                                    <div className="cc-sub">Monthly inflows vs outflows vs net position</div>
                                </div>
                            </div>
                            <div className="chart-box" style={{height: '280px'}}>
                                {flowData && <Line options={chartOptions} data={flowData} />}
                            </div>
                            <div className="leg">
                                <div className="leg-i"><span className="leg-dot" style={{background:'var(--grn)'}}></span> Inflows</div>
                                <div className="leg-i"><span className="leg-dot" style={{background:'var(--red)'}}></span> Outflows</div>
                                <div className="leg-i"><span className="leg-dot" style={{background:'var(--blu)'}}></span> Net</div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-4">
                        <div className="chart-card">
                            <div className="cc-head">
                                <div>
                                    <div className="cc-title">Transaction Mix</div>
                                    <div className="cc-sub">Volume by category (KES)</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div style={{position:'relative', width:'180px', height:'180px', margin: '20px 0'}}>
                                    {donutData && <Doughnut data={donutData} options={{cutout:'75%', plugins:{legend:{display:false}}}} />}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                                            {data?.breakdown?.length || 0}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories</div>
                                    </div>
                                </div>
                                <div className="w-full mt-4 space-y-2">
                                    {data?.breakdown?.slice(0, 4).map((b: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 dark:border-white/5">
                                            <span className="flex items-center gap-2 font-bold text-gray-500">
                                                <span className="w-2 h-2 rounded-full" style={{background: ['#0b2419', '#a3e635', '#2563eb', '#dc2626'][i]}}></span>
                                                {b.label}
                                            </span>
                                            <span className="font-extrabold text-gray-900 dark:text-white">{ks(b.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="filter-card" id="filterSection">
                    <div className="filter-card-head font-bold text-sm text-gray-800 dark:text-gray-200 uppercase tracking-widest mb-6">
                        <i className="bi bi-funnel-fill text-[#16a34a] mr-2"></i> Filter Ledger
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="group">
                            <label className="filter-lbl">Type</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="filter-ctrl">
                                <option value="">All Types</option>
                                <option value="deposit">Savings Deposit</option>
                                <option value="contribution">Contribution</option>
                                <option value="loan_disbursement">Loan Received</option>
                                <option value="loan_repayment">Loan Repayment</option>
                                <option value="withdrawal">Withdrawal</option>
                                <option value="welfare">Welfare</option>
                            </select>
                        </div>
                        <div>
                            <label className="filter-lbl">Specific Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="filter-ctrl" />
                        </div>
                        <div>
                            <label className="filter-lbl">From</label>
                            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="filter-ctrl" />
                        </div>
                        <div>
                            <label className="filter-lbl">To</label>
                            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="filter-ctrl" />
                        </div>
                        <div className="flex gap-2">
                            <button className="btn-apply w-full" onClick={loadData}>Apply</button>
                            <button className="btn-clear-filter" onClick={handleClear}><i className="bi bi-x-lg"></i></button>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="txn-card mt-6">
                    <div className="txn-card-head">
                        <div className="flex items-center gap-3">
                            <span className="txn-card-title">All Transactions</span>
                            <span className="txn-ct">{transactions.length} records</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="lt">
                            <thead>
                                <tr>
                                    <th className="pl-6">Date & Time</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Reference</th>
                                    <th>Channel</th>
                                    <th className="text-right pr-6">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? transactions.map((row: any, i: number) => {
                                    const t = (row.transaction_type || '').toLowerCase();
                                    const isIn = ['deposit','contribution','welfare','revenue_inflow','savings_deposit','share_purchase','dividend_payment','loan_disbursement'].includes(t);
                                    const isLoan = t === 'loan_disbursement';
                                    const dt = new Date(row.created_at);
                                    
                                    const amtCls = isLoan ? 'amt-loan' : (isIn ? 'amt-in' : 'amt-out');
                                    const sign = isLoan ? '+' : (isIn ? '+' : '−');
                                    const pillCls = `pill-${t}`;
                                    const icon = ICON_MAP[t] || 'bi-arrow-left-right';

                                    let icoWellCls = 'ico-out';
                                    if (t.includes('welfare') || t.includes('contribution')) icoWellCls = 'ico-welfare';
                                    else if (isLoan) icoWellCls = 'ico-loan';
                                    else if (isIn) icoWellCls = 'ico-in';

                                    return (
                                        <tr key={i}>
                                            <td className="pl-6">
                                                <div className="cell-date">{dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                <div className="cell-time">{dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td>
                                                <span className={`type-pill ${pillCls}`}>
                                                    <i className={`bi ${icon} mr-1`}></i> {t.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className={`txn-ico ${icoWellCls}`}><i className={`bi ${icon}`}></i></div>
                                                    <div>
                                                        <div className="text-[0.82rem] font-bold text-gray-900 dark:text-white capitalize">{t.replace(/_/g, ' ')}</div>
                                                        <div className="text-[0.65rem] text-gray-400 max-w-[150px] truncate">{row.notes || '—'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="ref-code">{row.reference_no || '—'}</span></td>
                                            <td><span className="chan-badge">{row.channel || 'SYS'}</span></td>
                                            <td className="text-right pr-6 whitespace-nowrap">
                                                <span className={amtCls}>{sign} KES {Number(row.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="empty-well">
                                                <div className="ew-ico"><i className="bi bi-inbox"></i></div>
                                                <div className="ew-title">No Transactions Found</div>
                                                <div className="ew-sub">Try adjusting your filters or checking back later.</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
