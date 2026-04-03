'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MemberApi, SharesData } from '@/lib/api/member';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function SharesPage() {
    const [data, setData] = useState<SharesData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        MemberApi.getShares()
            .then(res => setData(res))
            .finally(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const chartData = {
        labels: data.chart_data.map(d => d.label),
        datasets: [
            {
                fill: true,
                label: 'Portfolio Value',
                data: data.chart_data.map(d => d.value),
                borderColor: '#a3e635',
                backgroundColor: 'rgba(163, 230, 53, 0.1)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#0b2419',
                pointBorderColor: '#a3e635',
                pointBorderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0b2419',
                titleColor: 'rgba(255,255,255,0.5)',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 10,
                displayColors: false
            }
        },
        scales: {
            x: { display: true, grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10, weight: '700' as const } } },
            y: { display: false }
        },
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-5"
        >
            {/* HERO */}
            <div className="sv-hero">
                <div className="hero-mesh"></div>
                <div className="hero-dots"></div>
                <div className="hero-ring r1"></div>
                <div className="hero-ring r2"></div>

                <div className="hero-inner">
                    <div className="hero-nav">
                        <Link href="/member/dashboard" className="hero-back">
                            <i className="bi bi-arrow-left" style={{ fontSize: '.65rem' }}></i> Dashboard
                        </Link>
                        <span className="hero-brand-tag">UMOJA SACCO</span>
                    </div>

                    <div className="row align-items-end g-5">
                        <div className="col-md-6">
                            <div className="hero-eyebrow"><div className="ey-line"></div> Equity Portfolio</div>
                            <div className="hero-lbl">Current Portfolio Value</div>
                            <div className="hero-amount">
                                <span className="cur">KES</span>
                                <span>{data.portfolio_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            
                            <div className={`hero-gain ${data.gain_pct >= 0 ? 'positive' : 'negative'}`} 
                                 style={{ 
                                     background: data.gain_pct >= 0 ? 'rgba(163,230,53,0.11)' : 'rgba(220,38,38,0.11)',
                                     border: data.gain_pct >= 0 ? '1px solid rgba(163,230,53,0.2)' : '1px solid rgba(220,38,38,0.2)',
                                     color: data.gain_pct >= 0 ? '#bff060' : '#fca5a5',
                                     padding: '5px 14px', borderRadius: '50px', fontSize: '11px', fontWeight: '700',
                                     display: 'inline-flex', alignItems: 'center', gap: '7px'
                                 }}>
                                <span className="apr-pulse" style={{ background: data.gain_pct >= 0 ? 'var(--lime)' : '#ef4444' }}></span>
                                {data.gain_pct >= 0 ? '+' : ''}{data.gain_pct.toFixed(2)}% capital growth
                            </div>
                            
                            <div className="mt-4 d-flex gap-2 flex-wrap">
                                <Link href="/member/contribute?type=shares" className="btn-lime">
                                    <i className="bi bi-plus-circle-fill"></i> Buy Shares
                                </Link>
                                <Link href="/member/withdraw?type=wallet&source=shares" className="btn-ghost" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <i className="bi bi-cash-stack"></i> Dividends
                                </Link>
                                <Link href="/member/withdraw?type=shares&source=shares" className="btn-ghost" 
                                      style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#fca5a5' }}>
                                    <i className="bi bi-door-open"></i> Quit SACCO
                                </Link>
                            </div>
                        </div>

                        <div className="col-md-6 d-none d-md-block">
                            <div className="h-[120px] relative">
                                <div className="text-[9px] font-extrabold uppercase tracking-widest text-[#ffffff38] mb-3">Portfolio Growth History</div>
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="stats-float">
                <div className="row g-3">
                    <div className="col-md-3">
                        <div className="sc">
                            <div className="sc-ico ico-in">
                                <i className="bi bi-pie-chart-fill"></i>
                            </div>
                            <div className="sc-lbl">Ownership Units</div>
                            <div className="sc-val">{data.units.toLocaleString(undefined, { minimumFractionDigits: 4 })}</div>
                            <div className="sc-bar"><div className="sc-bar-fill bg-success w-100"></div></div>
                            <div className="sc-meta">{data.ownership_pct.toFixed(4)}% of total SACCO equity</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="sc">
                            <div className="sc-ico ico-in" style={{ background: 'var(--lg)', color: 'var(--lt)' }}>
                                <i className="bi bi-currency-exchange"></i>
                            </div>
                            <div className="sc-lbl">Share Price</div>
                            <div className="sc-val">KES {data.share_price.toLocaleString()}</div>
                            <div className="sc-bar"><div className="sc-bar-fill bg-info w-75"></div></div>
                            <div className="sc-meta">Current corporate valuation</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="sc">
                            <div className="sc-ico ico-warn" style={{ background: 'rgba(217,119,6,0.08)', color: '#d97706' }}>
                                <i className="bi bi-award-fill"></i>
                            </div>
                            <div className="sc-lbl">Projected Dividend</div>
                            <div className="sc-val">KES {Math.round(data.projected_dividend).toLocaleString()}</div>
                            <div className="sc-bar"><div className="sc-bar-fill bg-warning w-50"></div></div>
                            <div className="sc-meta">At 12.5% projected rate · Annual est.</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="sc">
                            <div className={`sc-ico ${data.gain_pct >= 0 ? 'ico-in' : 'ico-out'}`}>
                                <i className="bi bi-graph-up-arrow"></i>
                            </div>
                            <div className="sc-lbl">Capital Gain</div>
                            <div className={`sc-val ${data.gain_pct >= 0 ? 'amt-in' : 'amt-out'}`}>
                                {data.gain_pct >= 0 ? '+' : ''}{data.gain_pct.toFixed(2)}%
                            </div>
                            <div className="sc-bar">
                                <div 
                                    className={`sc-bar-fill ${data.gain_pct >= 0 ? 'bg-success' : 'bg-danger'}`} 
                                    style={{ width: `${Math.min(100, Math.abs(data.gain_pct))}%` }}
                                ></div>
                            </div>
                            <div className="sc-meta">vs. total amount paid</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body">
                <div className="filter-row">
                    <div className="sec-label">Share Purchase History</div>
                </div>

                <div className="txn-card">
                    <div className="txn-card-head">
                        <span className="txn-card-title">Transaction History</span>
                        <span className="txn-card-ct">{data.history.length} records</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table border-0 mb-0">
                            <thead>
                                <tr className="bg-light opacity-75">
                                    <th className="px-4 py-3 text-[10px] uppercase font-bold tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-[10px] uppercase font-bold tracking-wider">Reference</th>
                                    <th className="px-4 py-3 text-[10px] uppercase font-bold tracking-wider">Units</th>
                                    <th className="px-4 py-3 text-[10px] uppercase font-bold tracking-wider">Unit Price</th>
                                    <th className="px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-end">Total Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.history.map((txn, idx) => (
                                    <tr key={idx} className="border-bottom border-light">
                                        <td className="px-4 py-3">
                                            <div className="text-[0.85rem] font-bold text-dark">{new Date(txn.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            <div className="text-[0.65rem] text-muted">{new Date(txn.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-light px-2 py-1 rounded text-[10px] font-mono border">{txn.reference_no}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="ico-in rounded text-[10px] w-6 h-6 d-flex align-items-center justify-content-center">
                                                    <i className="bi bi-stack"></i>
                                                </div>
                                                <span className="text-[0.85rem] font-bold">{txn.units.toFixed(4)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[0.85rem] text-muted">KES {txn.unit_price.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-[0.88rem] font-extrabold text-end">KES {txn.total_value.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {data.history.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-5 text-center text-muted">
                                            <i className="bi bi-inbox fs-1 opacity-25 d-block mb-2"></i>
                                            No share transactions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
