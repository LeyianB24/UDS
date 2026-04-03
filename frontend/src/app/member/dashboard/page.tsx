"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import Chart from 'chart.js/auto';
import './dashboard.css';

export default function MemberDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const chartStackedBar = useRef<HTMLCanvasElement>(null);
    const chartGrouped = useRef<HTMLCanvasElement>(null);
    const chartDonut = useRef<HTMLCanvasElement>(null);
    const chartGauge = useRef<HTMLCanvasElement>(null);
    const chartRadar = useRef<HTMLCanvasElement>(null);
    
    // Store chart instances to destroy them on resize/re-render
    const chartsRef = useRef<any>({});

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const res = await apiFetch('/api/v1/member_dashboard.php');
                setData(res.data);
            } catch (err: any) {
                setError(err.message || 'Error connecting to server');
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    useEffect(() => {
        if (!data || !chartStackedBar.current) return;

        // Cleanup old charts
        Object.values(chartsRef.current).forEach((c: any) => c.destroy());
        chartsRef.current = {};

        const { chartData, stats, balances } = data;
        
        // Theme configs (assuming nextjs tailwind app is handling dark mode via layout, we can just use dynamic root vars or hardcode for now)
        const dark = document.documentElement.classList.contains('dark');
        const GRID = dark ? 'rgba(255,255,255,.05)' : 'rgba(11,36,25,.05)';
        const TICK = dark ? '#3a6050' : '#8fada0';
        const SURF = dark ? '#0d1d14' : '#ffffff';
        const TT = {
            backgroundColor: dark ? '#0d1d14' : '#0b2419',
            titleColor: '#a3e635',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 10,
            borderColor: 'rgba(163,230,53,.2)',
            borderWidth: 1,
            titleFont: { family: "'Plus Jakarta Sans',sans-serif", weight: 'bold' as const, size: 12 },
            bodyFont: { family: "'Plus Jakarta Sans',sans-serif", size: 11 }
        };
        const XS = { grid: { display: false }, ticks: { color: TICK, font: { family: "'Plus Jakarta Sans',sans-serif", size: 10 } } };
        const YS = { grid: { color: GRID }, ticks: { color: TICK, font: { family: "'Plus Jakarta Sans',sans-serif", size: 10 } } };

        // 1. Stacked Bar
        chartsRef.current.stacked = new Chart(chartStackedBar.current, {
            type: 'bar',
            data: {
                labels: chartData.mo_labels,
                datasets: [
                    { label: 'Savings', data: chartData.sav_arr, backgroundColor: '#0b2419cc', borderRadius: 5, barPercentage: 0.75 },
                    { label: 'Contributions', data: chartData.ctb_arr, backgroundColor: '#a3e635cc', borderRadius: 5, barPercentage: 0.75 },
                    { label: 'Repayments', data: chartData.rep_arr, backgroundColor: '#2563ebcc', borderRadius: 5, barPercentage: 0.75 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { ...TT, callbacks: { label: (c) => ' ' + c.dataset.label + ': KES ' + (c.parsed.y ?? 0).toLocaleString() } }
                },
                scales: { x: { ...XS, stacked: true }, y: { ...YS, stacked: true } }
            }
        });

        // 2. Grouped Bar
        chartsRef.current.grouped = new Chart(chartGrouped.current!, {
            type: 'bar',
            data: {
                labels: chartData.inc_labels,
                datasets: [
                    { label: 'Income', data: chartData.inc_arr, backgroundColor: '#16a34acc', borderRadius: 8, barPercentage: 0.72 },
                    { label: 'Outflow', data: chartData.exp_arr, backgroundColor: '#dc2626cc', borderRadius: 8, barPercentage: 0.72 },
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { ...TT, callbacks: { label: (c) => ' ' + c.dataset.label + ': KES ' + (c.parsed.y ?? 0).toLocaleString() } }
                },
                scales: { x: XS, y: YS }
            }
        });

        // 3. Doughnut
        chartsRef.current.donut = new Chart(chartDonut.current!, {
            type: 'doughnut',
            data: {
                labels: ['Savings', 'Shares', 'Loans', 'Wallet'],
                datasets: [{
                    data: [balances.savings, balances.shares, balances.loans, balances.wallet],
                    backgroundColor: ['#0b2419', '#a3e635', '#dc2626', '#2563eb'],
                    borderWidth: 0,
                    hoverOffset: 7
                }]
            },
            options: {
                cutout: '72%', responsive: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { ...TT, callbacks: { label: (c) => ' KES ' + c.parsed.toLocaleString() } }
                }
            }
        });

        // 4. Gauge
        const HEALTH = stats.health;
        const hc = HEALTH >= 80 ? '#16a34a' : HEALTH >= 60 ? '#2563eb' : '#d97706';
        chartsRef.current.gauge = new Chart(chartGauge.current!, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [HEALTH, 100 - HEALTH],
                    backgroundColor: [hc, dark ? 'rgba(255,255,255,.07)' : 'rgba(11,36,25,.06)'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: false, cutout: '70%',
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });

        // 5. Radar
        chartsRef.current.radar = new Chart(chartRadar.current!, {
            type: 'radar',
            data: {
                labels: ['Savings', 'Shares', 'Loan Health', 'Contributions', 'Welfare', 'Wallet'],
                datasets: [{
                    label: 'Score',
                    data: chartData.radar,
                    borderColor: '#a3e635',
                    borderWidth: 2,
                    backgroundColor: 'rgba(163,230,53,.12)',
                    pointBackgroundColor: '#a3e635',
                    pointBorderColor: SURF,
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { ...TT, callbacks: { label: (c) => ' ' + Number(c.parsed.r).toFixed(0) + '%' } }
                },
                scales: {
                    r: {
                        grid: { color: GRID }, ticks: { display: false }, min: 0, max: 100,
                        pointLabels: { color: TICK, font: { family: "'Plus Jakarta Sans',sans-serif", size: 10, weight: 'bold' as const } }
                    }
                }
            }
        });

        // Progress bar animations
        setTimeout(() => {
            document.querySelectorAll<HTMLElement>('[data-w]').forEach(el => {
                el.style.width = el.dataset.w + '%';
            });
        }, 460);

    }, [data]);

    const ks = (n: number) => {
        if (n >= 1000000) return 'KES ' + (n / 1000000).toFixed(2) + 'M';
        if (n >= 1000) return 'KES ' + (n / 1000).toFixed(1) + 'K';
        return 'KES ' + n.toFixed(2);
    };

    if (loading) return <div className="dash"><div className="spinner-border text-emerald-600 m-5"></div></div>;
    if (error) return <div className="dash text-red-500 m-5">Error: {error}</div>;
    if (!data) return null;

    const { 
        member_name, first_name, reg_no, join_date, 
        balances, loan_pct, stats, recent_txn 
    } = data;
    const { wallet, savings, shares, loans, net_worth } = balances;

    return (
        <div className="dash relative z-10 w-full mb-10 overflow-visible mt-[-40px]">
            {/* HERO */}
            <div className="hero">
                <div className="hero-mesh"></div><div className="hero-dots"></div>
                <div className="hero-ring r1"></div><div className="hero-ring r2"></div>
                <div className="hero-inner">
                    <div className="flex flex-wrap items-end gap-6 justify-between">
                        <div className="w-full lg:w-2/3">
                            <div className="hero-eyebrow"><span className="eyebrow-dot"></span> Verified Member</div>
                            <h1>Good day, {first_name}! 👋</h1>
                            <p className="hero-sub">
                                Member <strong>{reg_no}</strong> &nbsp;&middot;&nbsp;
                                Since <strong>{join_date}</strong> &nbsp;&middot;&nbsp;
                                Health <strong style={{color: '#fff'}}>{stats.health}/100</strong>
                            </p>
                            <div className="hero-bubbles">
                                <div className="hbub"><div className="hbub-val">{ks(savings)}</div><div className="hbub-lbl">Savings</div></div>
                                <div className="hbub"><div className="hbub-val">{ks(shares)}</div><div className="hbub-lbl">Shares</div></div>
                                <div className="hbub"><div className="hbub-val" style={{color: loans > 0 ? '#fca5a5' : '#a3e635'}}>{ks(loans)}</div><div className="hbub-lbl">Loans</div></div>
                                <div className="hbub"><div className="hbub-val" style={{color: net_worth >= 0 ? '#a3e635' : '#fca5a5'}}>{ks(Math.abs(net_worth))}</div><div className="hbub-lbl">Net Worth</div></div>
                                <div className="hbub"><div className="hbub-val">{ks(wallet)}</div><div className="hbub-lbl">Wallet</div></div>
                            </div>
                            <div className="hero-ctas">
                                <Link href="/member/mpesa" className="btn-lime"><i className="bi bi-plus-circle-fill"></i> Deposit</Link>
                                {wallet > 0 && <Link href="/member/withdraw" className="btn-ghost"><i className="bi bi-arrow-up-right-circle"></i> Withdraw</Link>}
                                <Link href="/member/loans" className="btn-ghost"><i className="bi bi-bank2"></i> Apply Loan</Link>
                                <Link href="/member/transactions" className="btn-ghost"><i className="bi bi-list-ul"></i> Transactions</Link>
                            </div>
                        </div>
                        <div className="hidden lg:block w-72">
                            <div className="hero-grade">
                                <div className="grade-label">Credit Grade</div>
                                <div className="grade-big">{loan_pct < 30 ? 'AAA' : (loan_pct < 50 ? 'AA+' : (loan_pct < 70 ? 'A+' : 'B+'))}</div>
                                <div className="grade-sub">Based on loan utilization</div>
                                <div className="loan-bar-wrap text-right">
                                    <div className="loan-bar-label text-right">Loan Limit Used</div>
                                    <div className="loan-bar-track"><div className="loan-bar-fill" style={{width: `${loan_pct}%`}}></div></div>
                                    <div className="loan-bar-pct">{loan_pct.toFixed(1)}% of KES 500K</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="stats-float">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="sa1 h-[140px]">
                        <div className="sc sc-g dark:border-emerald-800">
                            <div className="sc-ico text-emerald-600 bg-emerald-600/10"><i className="bi bi-piggy-bank-fill"></i></div>
                            <div className="sc-lbl text-emerald-900/60 dark:text-emerald-400">Total Savings</div>
                            <div className="sc-val text-emerald-950 dark:text-white">{ks(savings)}</div>
                            <div className="sc-bar bg-emerald-900/5 dark:bg-emerald-900/30"><div className="sc-bar-fill bg-emerald-600" data-w="100"></div></div>
                            <div className="sc-meta text-emerald-900/50 dark:text-emerald-400/60">Active savings account</div>
                        </div>
                    </div>
                    <div className="sa2 h-[140px]">
                        <div className="sc sc-b dark:border-emerald-800">
                            <div className="sc-ico text-blue-600 bg-blue-600/10"><i className="bi bi-calendar-check-fill"></i></div>
                            <div className="sc-lbl text-emerald-900/60 dark:text-emerald-400">This Month</div>
                            <div className="sc-val text-emerald-950 dark:text-white">{ks(stats.month_contrib)}</div>
                            <div className="sc-bar bg-emerald-900/5 dark:bg-emerald-900/30"><div className="sc-bar-fill bg-blue-600" data-w={stats.month_contrib > 0 ? "75" : "0"}></div></div>
                            <div className="sc-meta text-emerald-900/50 dark:text-emerald-400/60">{stats.month_contrib > 0 ? 'Contribution made' : 'Not yet contributed'}</div>
                        </div>
                    </div>
                    <div className="sa3 h-[140px]">
                        <div className="sc sc-a dark:border-emerald-800">
                            <div className="sc-ico text-amber-600 bg-amber-600/10"><i className="bi bi-graph-up-arrow"></i></div>
                            <div className="sc-lbl text-emerald-900/60 dark:text-emerald-400">Total Deposits</div>
                            <div className="sc-val text-emerald-950 dark:text-white">{ks(stats.total_deposits)}</div>
                            <div className="sc-bar bg-emerald-900/5 dark:bg-emerald-900/30"><div className="sc-bar-fill bg-amber-500" data-w="100"></div></div>
                            <div className="sc-meta text-emerald-900/50 dark:text-emerald-400/60">All-time deposits</div>
                        </div>
                    </div>
                    <div className="sa4 h-[140px]">
                        <div className="sc sc-r dark:border-emerald-800">
                            <div className="sc-ico text-red-600 bg-red-600/10"><i className="bi bi-arrow-up-right-square-fill"></i></div>
                            <div className="sc-lbl text-emerald-900/60 dark:text-emerald-400">Total Withdrawn</div>
                            <div className="sc-val text-emerald-950 dark:text-white">{ks(stats.total_withdrawals)}</div>
                            {(() => {
                                const wPct = stats.total_deposits > 0 ? Math.min(100, (stats.total_withdrawals / stats.total_deposits) * 100) : 0;
                                return (
                                    <>
                                        <div className="sc-bar bg-emerald-900/5 dark:bg-emerald-900/30"><div className="sc-bar-fill bg-red-500" data-w={Math.round(wPct)}></div></div>
                                        <div className="sc-meta text-emerald-900/50 dark:text-emerald-400/60">{Math.round(wPct)}% of deposits</div>
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body">
                {/* Row 1 */}
                <div className="flex flex-col xl:flex-row gap-4 mb-4">
                    <div className="w-full xl:w-7/12">
                        <div className="chart-card dark:border-emerald-800" style={{animationDelay: '.72s'}}>
                            <div className="cc-head">
                                <div><div className="cc-title dark:text-white">12-Month Financial Activity</div><div className="cc-sub dark:text-emerald-400/60">Savings · Contributions · Repayments</div></div>
                                <div className="cc-stats hidden md:flex items-center">
                                    <div className="text-right"><div className="cc-stat-val dark:text-white">{ks(savings)}</div><div className="cc-stat-lbl dark:text-emerald-400/60">Net Savings</div></div>
                                    <div className="cc-stat-div mx-4 h-6 bg-emerald-900/10 dark:bg-emerald-800"></div>
                                    <div className="text-right"><div className="cc-stat-val dark:text-white">{ks(data.chartData.ctb_arr.reduce((a:any,b:any)=>a+b,0))}</div><div className="cc-stat-lbl dark:text-emerald-400/60">Total Contributions</div></div>
                                </div>
                            </div>
                            <div className="leg">
                                <div className="leg-i dark:text-emerald-400/80"><span className="leg-dot bg-[#0b2419]"></span>Savings</div>
                                <div className="leg-i dark:text-emerald-400/80"><span className="leg-dot bg-lime-400"></span>Contributions</div>
                                <div className="leg-i dark:text-emerald-400/80"><span className="leg-dot bg-blue-600"></span>Repayments</div>
                            </div>
                            <div className="chart-box h-[260px] mt-3">
                                <canvas ref={chartStackedBar}></canvas>
                            </div>
                        </div>
                    </div>
                    <div className="w-full xl:w-5/12">
                        <div className="chart-card dark:border-emerald-800" style={{animationDelay: '.78s'}}>
                            <div className="cc-head">
                                <div><div className="cc-title dark:text-white">Income vs Outflow</div><div className="cc-sub dark:text-emerald-400/60">6-month deposits vs withdrawals</div></div>
                            </div>
                            <div className="cc-stats flex items-center mb-[14px]">
                                <div><div className="cc-stat-val dark:text-white">{ks(data.chartData.inc_arr.reduce((a:any,b:any)=>a+b,0))}</div><div className="cc-stat-lbl dark:text-emerald-400/60">Total In</div></div>
                                <div className="cc-stat-div mx-3 h-6 bg-emerald-900/10 dark:bg-emerald-800"></div>
                                <div><div className="cc-stat-val dark:text-white">{ks(data.chartData.exp_arr.reduce((a:any,b:any)=>a+b,0))}</div><div className="cc-stat-lbl dark:text-emerald-400/60">Total Out</div></div>
                            </div>
                            <div className="leg">
                                <div className="leg-i dark:text-emerald-400/80"><span className="leg-dot bg-green-600"></span>Income</div>
                                <div className="leg-i dark:text-emerald-400/80"><span className="leg-dot bg-red-600"></span>Outflow</div>
                            </div>
                            <div className="chart-box h-[230px] mt-2">
                                <canvas ref={chartGrouped}></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="flex flex-col xl:flex-row gap-4 mb-4">
                    {/* Portfolio */}
                    <div className="w-full xl:w-1/3">
                        <div className="chart-card dark:border-emerald-800" style={{animationDelay: '.84s'}}>
                            <div className="cc-head"><div><div className="cc-title dark:text-white">Portfolio Composition</div><div className="cc-sub dark:text-emerald-400/60">Asset vs liability breakdown</div></div></div>
                            <div className="relative w-[160px] h-[160px] mx-auto my-4 shrink-0">
                                <canvas ref={chartDonut} width="160" height="160"></canvas>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                                    <div className="text-[0.88rem] font-extrabold text-emerald-950 dark:text-white leading-tight">{ks(savings + shares)}</div>
                                    <div className="text-[0.58rem] font-bold uppercase tracking-widest text-emerald-900/50 dark:text-emerald-400/60 mt-0.5">Total Assets</div>
                                </div>
                            </div>
                            {[
                                ['Savings', '#0b2419', savings],
                                ['Shares', '#a3e635', shares],
                                ['Loans', '#dc2626', loans],
                                ['Wallet', '#2563eb', wallet],
                            ].map((d, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-emerald-900/5 dark:border-emerald-800/50 text-[0.76rem] last:border-0">
                                    <span className="flex items-center gap-2 font-semibold text-emerald-900/70 dark:text-emerald-300">
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: d[1] as string}}></span>{d[0]}
                                    </span>
                                    <span className="font-extrabold text-emerald-950 dark:text-white">{ks(d[2] as number)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Health Gauge */}
                    <div className="w-full xl:w-1/3">
                        <div className="chart-card dark:border-emerald-800" style={{animationDelay: '.90s'}}>
                            <div className="cc-head"><div><div className="cc-title dark:text-white">Account Health</div><div className="cc-sub dark:text-emerald-400/60">Composite financial score</div></div></div>
                            <div className="gauge-half my-3">
                                <canvas ref={chartGauge} width="180" height="180" className="-mt-[45px]"></canvas>
                            </div>
                            <div className="text-center mb-4">
                                <div className="text-3xl font-extrabold text-emerald-950 dark:text-white tracking-tight leading-none">{stats.health}</div>
                                {(() => {
                                    const hbg = stats.health >= 80 ? 'bg-green-600/10 text-green-600' : (stats.health >= 60 ? 'bg-blue-600/10 text-blue-600' : 'bg-amber-600/10 text-amber-600');
                                    const lbl = stats.health >= 80 ? 'Excellent' : (stats.health >= 60 ? 'Good' : 'Fair');
                                    return <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.7rem] font-extrabold mt-2 ${hbg}`}>{lbl}</div>
                                })()}
                            </div>
                            <div className="mt-auto">
                                {[
                                    ['Loan Utilization', loan_pct < 50, 'bi-bank2', `${loan_pct.toFixed(0)}% used`],
                                    ['Monthly Contrib', stats.month_contrib > 0, 'bi-calendar-check-fill', ks(stats.month_contrib)],
                                    ['Savings Balance', savings >= 5000, 'bi-piggy-bank-fill', ks(savings)],
                                    ['Welfare Active', stats.welfare_total > 0, 'bi-heart-pulse-fill', ks(stats.welfare_total)],
                                ].map((hf, i) => (
                                    <div key={i} className="flex items-center gap-2.5 py-2 border-b border-emerald-900/5 dark:border-emerald-800/50 last:border-0">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[0.72rem] ${hf[1] ? 'bg-green-600/10 text-green-600' : 'bg-red-600/10 text-red-600'}`}>
                                            <i className={`bi ${hf[2]}`}></i>
                                        </div>
                                        <div className="text-[0.75rem] font-bold text-emerald-950 dark:text-white flex-1">{hf[0]}</div>
                                        <div className="text-[0.65rem] font-semibold text-emerald-900/50 dark:text-emerald-400/60">{hf[3]}</div>
                                        <i className={`bi ${hf[1] ? 'bi-check-circle-fill text-green-600' : 'bi-x-circle-fill text-red-600'} text-[0.8rem]`}></i>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feed */}
                    <div className="w-full xl:w-1/3">
                        <div className="chart-card dark:border-emerald-800" style={{animationDelay: '.96s'}}>
                            <div className="cc-head"><div><div className="cc-title dark:text-white">Recent Transactions</div><div className="cc-sub dark:text-emerald-400/60">Latest entries</div></div></div>
                            {(!recent_txn || recent_txn.length === 0) ? (
                                <div className="empty-well">
                                    <div className="ew-ico dark:bg-emerald-900/20 dark:border-emerald-800 text-emerald-900/20 dark:text-emerald-800"><i className="bi bi-inbox"></i></div>
                                    <div className="ew-title dark:text-white">No Transactions Yet</div>
                                    <div className="ew-sub dark:text-emerald-400/60">Your activity will appear here.</div>
                                </div>
                            ) : (
                                <ul className="txn-feed">
                                    {recent_txn.map((t: any, i: number) => {
                                        const isIn = ['deposit','income','contribution','revenue_inflow'].includes(t.transaction_type);
                                        const isLoan = String(t.transaction_type).includes('loan');
                                        const trCls = isLoan ? 'ti-loan' : (isIn ? 'ti-in' : 'ti-out');
                                        const icCls = isLoan ? 'ico-loan bg-amber-600/10 text-amber-600' : (isIn ? 'ico-in bg-green-600/10 text-green-600' : 'ico-out bg-red-600/10 text-red-600');
                                        const ib = isLoan ? 'bi-bank2' : (isIn ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill');
                                        return (
                                            <li key={i} className={`txn-row ${trCls} dark:border-emerald-800/50 hover:dark:bg-emerald-800/20`}>
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`txn-ico ${icCls}`}><i className={`bi ${ib}`}></i></div>
                                                    <div>
                                                        <div className="txn-name dark:text-white">{t.transaction_type.replace('_',' ')}</div>
                                                        <div className="txn-date dark:text-emerald-400/60">{new Date(t.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className={isIn ? 'txn-amt-in text-green-600' : 'txn-amt-out text-red-600'}>{isIn ? '+' : '−'} {Number(t.amount).toFixed(2)}</div>
                                                    <span className="txn-ref dark:bg-emerald-900/40 dark:text-emerald-400/60">{String(t.reference_no).toUpperCase()}</span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                            <Link href="/member/transactions" className="btn-view-all dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 hover:dark:border-emerald-700 hover:dark:bg-emerald-900/40 mt-auto">
                                <i className="bi bi-list-ul"></i> View All Transactions
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Row 3 */}
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="w-full xl:w-5/12">
                        <div className="chart-card dark:border-emerald-800" style={{animationDelay: '1.02s'}}>
                            <div className="cc-head"><div><div className="cc-title dark:text-white">Financial Radar</div><div className="cc-sub dark:text-emerald-400/60">Multi-dimension performance score</div></div></div>
                            <div className="chart-box h-[230px]">
                                <canvas ref={chartRadar}></canvas>
                            </div>
                        </div>
                    </div>
                    <div className="w-full xl:w-7/12">
                        <div className="chart-card dark:border-emerald-800" style={{animationDelay: '1.08s'}}>
                            <div className="cc-head"><div><div className="cc-title dark:text-white">Quick Actions</div><div className="cc-sub dark:text-emerald-400/60">Common financial operations</div></div></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                                {[
                                    ['bi-plus-circle-fill', 'bg-green-600/10', 'text-green-600', 'Add Funds', 'Deposit via M-Pesa', '/member/mpesa?type=savings'],
                                    ['bi-pie-chart-fill', 'bg-lime-400/10', 'text-[#6a9a1a] dark:text-lime-400', 'Buy Shares', 'Invest in equity', '/member/mpesa?type=shares'],
                                    ['bi-heart-fill', 'bg-red-600/10', 'text-red-600', 'Contribute', 'Welfare fund deposit', '/member/mpesa?type=welfare'],
                                    ['bi-bank2', 'bg-amber-600/10', 'text-amber-600', 'Apply Loan', 'Request financing', '/member/loans'],
                                    ['bi-wallet2', 'bg-blue-600/10', 'text-blue-600', 'Withdraw', 'Transfer to M-Pesa', '/member/withdraw'],
                                    ['bi-file-earmark-text', 'bg-emerald-900/5 dark:bg-emerald-800/30', 'text-emerald-900/60 dark:text-emerald-400', 'Statement', 'Download PDF report', '/member/savings'],
                                ].map((a, i) => (
                                    <Link key={i} href={a[5]} className="flex items-center gap-3 p-3 bg-[#f7fbf8] dark:bg-[#0a1810] border border-[#0b2419]/[0.07] dark:border-white/[0.07] rounded-xl no-underline transition-all duration-200 hover:border-[#0b2419]/[0.18] hover:dark:border-white/[0.18] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(11,36,25,.09)] hover:dark:shadow-[0_6px_20px_rgba(0,0,0,.4)] group">
                                        <div className={`w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center text-[1rem] ${a[1]} ${a[2]}`}>
                                            <i className={`bi ${a[0]}`}></i>
                                        </div>
                                        <div>
                                            <div className="text-[0.83rem] font-extrabold text-emerald-950 dark:text-white mb-0.5 group-hover:text-emerald-700 transition-colors">{a[3]}</div>
                                            <div className="text-[0.68rem] font-semibold text-emerald-900/50 dark:text-emerald-400/60">{a[4]}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
