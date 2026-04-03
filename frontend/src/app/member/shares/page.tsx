"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import Chart from 'chart.js/auto';
import './shares.css';

export default function MemberShares() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchApi('member_shares', 'GET');
            if (res.status === 'success') {
                setData(res.data);
            } else {
                setError('Failed to load shares data');
            }
        } catch (err: any) {
            setError(err.message || 'Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!data || !chartRef.current) return;
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(11,36,25,0.05)';
        const tickColor = isDark ? '#3a6050' : '#8fada0';

        const gradient = ctx.createLinearGradient(0, 0, 0, 160);
        gradient.addColorStop(0, 'rgba(22, 163, 74, 0.25)');
        gradient.addColorStop(1, 'rgba(22, 163, 74, 0)');

        chartInstance.current = new Chart(chartRef.current, {
            type: 'line',
            data: {
                labels: data.chart.labels,
                datasets: [{
                    label: 'Portfolio Value (KES)',
                    data: data.chart.data,
                    borderColor: '#16a34a',
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#16a34a',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#0d1d14' : '#0b2419',
                        titleColor: '#a3e635',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 10,
                        borderColor: 'rgba(163,230,53,.2)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(c: any) {
                                return ' KES ' + Number(c.parsed.y).toLocaleString(undefined, {minimumFractionDigits: 2});
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: tickColor,
                            font: { family: "'Plus Jakarta Sans',sans-serif", size: 10, weight: '600' },
                            maxTicksLimit: 6
                        }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: tickColor,
                            font: { family: "'Plus Jakarta Sans',sans-serif", size: 10, weight: '600' },
                            callback: function(v: any) { return (v >= 1000) ? (v/1000) + 'k' : v; }
                        },
                        beginAtZero: true
                    }
                }
            }
        });

    }, [data]);

    const ks = (n: number) => {
        return 'KES ' + Number(n).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    };

    if (loading && !data) return <div className="pg-body"><div className="spinner-border text-emerald-600 m-5"></div></div>;
    if (error) return <div className="pg-body text-red-500 m-5">Error: {error}</div>;
    if (!data) return null;

    const { valuation, history, chart } = data;
    const gainPct = valuation.gain_pct;
    const gainSign = gainPct >= 0 ? '+' : '';
    const portfolioValue = valuation.portfolio_value;
    const ownershipPct = valuation.ownership_pct;
    const projectedDividend = valuation.projected_dividend;
    const dividendRateProjection = 12.5;

    // Sparkline data
    const maxC = Math.max(...(chart.data.length ? chart.data : [1]), 1);
    const SW = 380; const SH = 88; const PD = 10; const N = Math.max(chart.data.length, 1);
    const ptCoords: {x:number, y:number}[] = [];
    chart.data.forEach((v: number, i: number) => {
        const x = N > 1 ? PD + (i / (N - 1)) * (SW - PD * 2) : SW / 2;
        const y = SH - PD - ((v / maxC) * (SH - PD * 2 - 10));
        ptCoords.push({x, y});
    });
    const cpoly = ptCoords.map(p => `${p.x},${p.y}`).join(' ');
    const clastPt = ptCoords.length > 0 ? ptCoords[ptCoords.length - 1] : {x: 190, y: 44};
    const lastN = Math.min(6, chart.labels.length);
    const step = lastN > 1 ? Math.floor((chart.labels.length - 1) / (lastN - 1)) : 1;

    const handleExport = (action: string) => {
        const params = new URLSearchParams();
        params.append('action', action);
        window.open(`http://localhost/UDS/member/pages/shares.php?${params.toString()}`, '_blank');
    };

    return (
        <div className="relative z-10 w-full mb-10 mt-[-40px]">
            {/* HERO */}
            <div className="sv-hero rounded-[20px]">
                <div className="hero-mesh"></div>
                <div className="hero-dots"></div>
                <div className="hero-ring r1"></div>
                <div className="hero-ring r2"></div>

                <div className="hero-inner">
                    <div className="hero-nav">
                        <Link href="/member/dashboard" className="hero-back">
                            <i className="bi bi-arrow-left text-[0.65rem]"></i> Dashboard
                        </Link>
                        <span className="hero-brand-tag">UMOJA SACCO</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-end gap-12">
                        {/* Left */}
                        <div className="w-full md:w-1/2">
                            <div className="hero-eyebrow"><div className="ey-line"></div> Equity Portfolio</div>
                            <div className="hero-lbl dark:text-emerald-400/60">Current Portfolio Value</div>
                            <div className="hero-amount"><span className="cur">KES</span><span>{Number(portfolioValue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</span></div>
                            <div className={`hero-gain ${gainPct >= 0 ? 'positive' : 'negative'}`}>
                                <span className="gain-dot" style={{background: gainPct >= 0 ? 'var(--lime)' : '#ef4444'}}></span>
                                {gainSign}{Number(gainPct).toFixed(2)}% capital growth
                            </div>
                            <div className="hero-ctas">
                                <Link href="/member/mpesa?type=shares" className="btn-lime">
                                    <i className="bi bi-plus-circle-fill"></i> Buy Shares
                                </Link>
                                <Link href="/member/withdraw?type=wallet&source=shares" className="btn-ghost">
                                    <i className="bi bi-cash-stack"></i> Dividends
                                </Link>
                                <Link href="/member/withdraw?type=shares&source=shares" className="btn-danger-ghost">
                                    <i className="bi bi-door-open"></i> Quit SACCO
                                </Link>
                            </div>
                        </div>

                        {/* Right: sparkline */}
                        <div className="hidden md:block w-full md:w-1/2 pl-6">
                            <div className="hero-chart-wrap">
                                <div className="hero-chart-lbl">Portfolio Growth History</div>
                                <svg className="chart-svg" viewBox={`0 0 ${SW} ${SH}`} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#a3e635" stopOpacity=".22"/>
                                            <stop offset="100%" stopColor="#a3e635" stopOpacity="0"/>
                                        </linearGradient>
                                    </defs>
                                    {ptCoords.length > 1 && (
                                        <>
                                            <polygon
                                                points={`${ptCoords[0].x},${SH} ${cpoly} ${SW-PD},${SH} ${PD},${SH}`}
                                                fill="url(#cg)"
                                            />
                                            <polyline 
                                                points={cpoly}
                                                fill="none" stroke="#a3e635" strokeWidth="2"
                                                strokeLinecap="round" strokeLinejoin="round"
                                            />
                                            {ptCoords.map((pt, i) => (
                                                <circle key={i} cx={pt.x} cy={pt.y} r="2.5" fill="#0b2419" stroke="#a3e635" strokeWidth="1.5" />
                                            ))}
                                            <circle cx={clastPt.x} cy={clastPt.y} r="4.5" fill="#a3e635" opacity=".9" />
                                            <circle cx={clastPt.x} cy={clastPt.y} r="9" fill="#a3e635" opacity=".1" />
                                        </>
                                    )}
                                    {chart.labels.map((lbl: string, i: number) => {
                                        if (lastN > 1 && i % step !== 0 && i !== chart.labels.length - 1) return null;
                                        const lx = N > 1 ? PD + (i / (N - 1 || 1)) * (SW - PD * 2) : SW / 2;
                                        return (
                                            <text key={i} x={lx} y={SH - 1} textAnchor="middle" className="spark-txt">{lbl}</text>
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FLOATING STATS */}
            <div className="stats-float">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="sa1 h-[142px]">
                        <div className="sc sc-g dark:border-emerald-800">
                            <div className="sc-ico text-green-600 bg-green-600/10"><i className="bi bi-pie-chart-fill"></i></div>
                            <div className="sc-lbl dark:text-emerald-400/60">Ownership Units</div>
                            <div className="sc-val dark:text-white">{Number(valuation.total_units || 0).toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits:4})}</div>
                            <div className="sc-bar bg-emerald-900/5 dark:bg-emerald-800/50"><div className="sc-bar-fill bg-green-600" style={{width: '100%'}}></div></div>
                            <div className="sc-meta dark:text-emerald-400/60">{Number(ownershipPct).toFixed(4)}% of total SACCO equity</div>
                        </div>
                    </div>
                    <div className="sa2 h-[142px]">
                        <div className="sc sc-l dark:border-emerald-800">
                            <div className="sc-ico text-[#6a9a1a] dark:text-lime-400 bg-lime-400/20"><i className="bi bi-currency-exchange"></i></div>
                            <div className="sc-lbl dark:text-emerald-400/60">Share Price</div>
                            <div className="sc-val dark:text-white">{ks(valuation.share_price)}</div>
                            <div className="sc-bar bg-emerald-900/5 dark:bg-emerald-800/50"><div className="sc-bar-fill bg-lime-400" style={{width: '65%'}}></div></div>
                            <div className="sc-meta dark:text-emerald-400/60">Current corporate valuation</div>
                        </div>
                    </div>
                    <div className="sa3 h-[142px]">
                        <div className="sc sc-a dark:border-emerald-800">
                            <div className="sc-ico text-amber-600 bg-amber-600/10"><i className="bi bi-award-fill"></i></div>
                            <div className="sc-lbl dark:text-emerald-400/60">Projected Dividend</div>
                            <div className="sc-val dark:text-white">{ks(projectedDividend)}</div>
                            <div className="sc-bar bg-emerald-900/5 dark:bg-emerald-800/50"><div className="sc-bar-fill bg-amber-500" style={{width: `${Math.min(100, Math.round((dividendRateProjection/20)*100))}%`}}></div></div>
                            <div className="sc-meta dark:text-emerald-400/60">At {dividendRateProjection}% projected rate · Annual est.</div>
                        </div>
                    </div>
                    <div className="sa4 h-[142px]">
                        <div className="sc sc-b dark:border-emerald-800">
                            <div className="sc-ico text-blue-600 bg-blue-600/10"><i className="bi bi-graph-up-arrow"></i></div>
                            <div className="sc-lbl dark:text-emerald-400/60">Capital Gain</div>
                            <div className="sc-val" style={{color: gainPct >= 0 ? '#16a34a' : '#dc2626'}}>{gainSign}{Number(gainPct).toFixed(2)}%</div>
                            <div className="sc-bar bg-emerald-900/5 dark:bg-emerald-800/50"><div className="sc-bar-fill" style={{background: gainPct >= 0 ? '#16a34a' : '#dc2626', width: `${Math.min(100, Math.abs(Math.round(gainPct)))}%`}}></div></div>
                            <div className="sc-meta dark:text-emerald-400/60">vs. total amount paid</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body">
                {/* Growth Chart */}
                <div className="growth-card dark:border-emerald-800 dark:bg-[#0a1810]">
                    <div className="growth-head">
                        <span className="growth-title dark:text-white">Portfolio Value Over Time</span>
                        <span className="growth-badge dark:bg-emerald-900/30 dark:text-green-500"><i className="bi bi-graph-up-arrow text-[0.7rem]"></i> Active</span>
                    </div>
                    <div className="chart-wrap">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="txn-card dark:border-emerald-800 dark:bg-emerald-950/20">
                    <div className="txn-card-head dark:bg-emerald-900/10 dark:border-emerald-800/50">
                        <div className="flex items-center gap-3">
                            <span className="txn-card-title dark:text-white">Transaction History</span>
                            <span className="txn-card-ct dark:bg-emerald-950/40 dark:text-emerald-400/60 dark:border-emerald-800">{history.length} records</span>
                        </div>
                        <div className="txn-head-right">
                            <button onClick={loadData} className="btn-exp dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400 hover:dark:bg-emerald-900/40 mr-2">
                                <i className="bi bi-arrow-clockwise"></i> Refresh
                            </button>
                            <div className="relative group inline-block">
                                <button className="btn-exp dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400 hover:dark:bg-emerald-900/40">
                                    <i className="bi bi-cloud-download-fill"></i> Export
                                </button>
                                <ul className="absolute right-0 top-full mt-2 hidden group-hover:block w-48 bg-white dark:bg-emerald-950 border border-emerald-900/10 dark:border-emerald-800 rounded-xl shadow-xl z-20 p-1.5">
                                    <li>
                                        <button onClick={() => handleExport('export_pdf')} className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] font-semibold text-emerald-950 dark:text-emerald-100 hover:bg-emerald-50 hover:dark:bg-emerald-900/30 transition-colors">
                                            <div className="w-8 h-8 rounded-md bg-red-600/10 text-red-600 flex items-center justify-center shrink-0"><i className="bi bi-file-pdf"></i></div>
                                            PDF Document
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={() => handleExport('export_excel')} className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] font-semibold text-emerald-950 dark:text-emerald-100 hover:bg-emerald-50 hover:dark:bg-emerald-900/30 transition-colors">
                                            <div className="w-8 h-8 rounded-md bg-green-600/10 text-green-600 flex items-center justify-center shrink-0"><i className="bi bi-file-earmark-excel"></i></div>
                                            Excel Sheet
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="sh-table">
                            <thead>
                                <tr>
                                    <th className="dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400/60">Reference</th>
                                    <th className="dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400/60">Units Acquired</th>
                                    <th className="dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400/60 text-right">Unit Price</th>
                                    <th className="dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400/60 text-right">Total Invested</th>
                                    <th className="dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400/60 text-center">Status</th>
                                    <th className="dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400/60 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? history.map((row: any, i: number) => (
                                    <tr key={i} className="dark:border-emerald-800/50 hover:dark:bg-emerald-800/20">
                                        <td><span className="ref-chip dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400">{row.reference_no}</span></td>
                                        <td>
                                            <div className="unit-chip dark:text-white">
                                                <div className="unit-pip dark:bg-green-600/20 dark:text-green-400">+</div>
                                                {Number(row.share_units || (row.total_value/valuation.share_price)).toFixed(4)}
                                            </div>
                                        </td>
                                        <td className="text-right dark:text-emerald-300">KES {Number(row.unit_price || valuation.share_price).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                                        <td className="text-right cell-amt dark:text-emerald-400">KES {Number(row.total_value).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                                        <td className="text-center"><span className="status-chip dark:bg-green-600/20 dark:text-green-400">Confirmed</span></td>
                                        <td className="text-right">
                                            <div className="cell-date dark:text-white">{new Date(row.created_at).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}</div>
                                            <div className="cell-time dark:text-emerald-400/60">{new Date(row.created_at).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'})}</div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="empty-well">
                                                <div className="ew-ico dark:bg-emerald-900/20 dark:border-emerald-800 text-emerald-900/20 dark:text-emerald-800"><i className="bi bi-inbox"></i></div>
                                                <div className="ew-title dark:text-white">No Share Transactions Found</div>
                                                <div className="ew-sub dark:text-emerald-400/60">You haven't purchased any shares yet.</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Education Section */}
                <div className="edu-card dark:border-emerald-800 dark:bg-emerald-950/20">
                    <div className="edu-head dark:bg-emerald-900">
                        <i className="bi bi-lightbulb-fill text-amber-300"></i>
                        <div className="edu-title">Understanding Your SACCO Shares</div>
                    </div>
                    <div className="edu-body">
                        <div className="edu-grid">
                            <div className="edu-item">
                                <div className="edu-ico dark:bg-emerald-900/40 dark:text-emerald-400"><i className="bi bi-bank"></i></div>
                                <div>
                                    <div className="edu-h dark:text-emerald-100">Capital Ownership</div>
                                    <div className="edu-p dark:text-emerald-400/80">Every share you purchase represents a direct ownership stake in the SACCO. The value grows as the SACCO's net assets increase.</div>
                                </div>
                            </div>
                            <div className="edu-item">
                                <div className="edu-ico dark:bg-emerald-900/40 dark:text-emerald-400"><i className="bi bi-piggy-bank"></i></div>
                                <div>
                                    <div className="edu-h dark:text-emerald-100">Annual Dividends</div>
                                    <div className="edu-p dark:text-emerald-400/80">Shareholders are entitled to annual dividends declared at the AGM based on the SACCO's financial performance.</div>
                                </div>
                            </div>
                            <div className="edu-item">
                                <div className="edu-ico dark:bg-emerald-900/40 dark:text-emerald-400"><i className="bi bi-arrow-down-up"></i></div>
                                <div>
                                    <div className="edu-h dark:text-emerald-100">Non-Withdrawable</div>
                                    <div className="edu-p dark:text-emerald-400/80">Like any corporate equity, shares cannot be partially withdrawn. They can only be transferred, or liquidated if exiting the SACCO completely.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="edu-footer dark:bg-emerald-900/10 dark:border-emerald-800 dark:text-emerald-400/60">
                        You currently hold <strong className="dark:text-white inline">{Number(valuation.total_units || 0).toFixed(2)}</strong> units, giving you <strong className="dark:text-white inline">{Number(ownershipPct).toFixed(4)}%</strong> voting power at the General Meeting.
                    </div>
                </div>

            </div>
        </div>
    );
}
