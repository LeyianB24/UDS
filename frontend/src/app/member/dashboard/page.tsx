"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import Chart from 'chart.js/auto';
import './dashboard.css';

export default function MemberDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [usingMock, setUsingMock] = useState(false);

    const chartStackedBar = useRef<HTMLCanvasElement>(null);
    const chartGrouped = useRef<HTMLCanvasElement>(null);
    const chartDonut = useRef<HTMLCanvasElement>(null);
    const chartGauge = useRef<HTMLCanvasElement>(null);
    const chartRadar = useRef<HTMLCanvasElement>(null);
    const chartsRef = useRef<any>({});

    const MOCK_DATA = {
        member_name: "Demo Member",
        first_name: "Demo",
        reg_no: "UDS-0000-MOCK",
        join_date: "Jan 2024",
        balances: {
            wallet: 12500.50,
            savings: 45000.00,
            shares: 15000.00,
            loans: 0.00,
            net_worth: 60000.50
        },
        loan_pct: 0,
        stats: {
            month_contrib: 2500,
            total_deposits: 52000,
            total_withdrawals: 12000,
            welfare_total: 1000,
            pending_loans: 0,
            health: 95
        },
        chartData: {
            mo_labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            sav_arr: [5000, 10000, 15000, 20000, 25000, 30000, 35000, 38000, 40000, 42000, 44000, 45000],
            ctb_arr: [2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500],
            rep_arr: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            inc_labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            inc_arr: [5000, 4500, 6000, 5500, 7000, 6500],
            exp_arr: [1200, 800, 1500, 1000, 2000, 1800],
            radar: [90, 70, 100, 85, 60, 75]
        },
        recent_txn: [
            { transaction_type: 'deposit', amount: 5000, created_at: new Date().toISOString(), reference_no: 'TRX-MOCK-1' },
            { transaction_type: 'contribution', amount: 2500, created_at: new Date(Date.now() - 86400000).toISOString(), reference_no: 'TRX-MOCK-2' },
            { transaction_type: 'withdrawal', amount: 1200, created_at: new Date(Date.now() - 172800000).toISOString(), reference_no: 'TRX-MOCK-3' }
        ]
    };

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Using the updated axios-based apiFetch
            const res = await apiFetch('/api/member/dashboard');
            if (res && res.data) {
                setData(res.data);
                setUsingMock(false);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err: any) {
            setData(MOCK_DATA);
            setUsingMock(true);
            const msg = err.message || "Unknown API error";
            console.warn(`[Dashboard] Backend unreachable, falling back to mock:`, msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        if (!data) return;
        Object.values(chartsRef.current).forEach((c: any) => c.destroy());
        chartsRef.current = {};

        const dark = document.documentElement.classList.contains('dark');
        const GRID = dark ? 'rgba(255,255,255,.05)' : 'rgba(11,36,25,.05)';
        const TICK = dark ? '#3a6050' : '#8fada0';
        const SURF = dark ? '#0d1d14' : '#ffffff';
        const TT = {
            backgroundColor: dark ? '#0d1d14' : '#0b2419',
            titleColor: '#a3e635', bodyColor: '#fff', padding: 12, cornerRadius: 10,
            borderColor: 'rgba(163,230,53,.2)', borderWidth: 1,
            titleFont: { family: "'Plus Jakarta Sans',sans-serif", weight: 'bold' as const, size: 12 },
            bodyFont: { family: "'Plus Jakarta Sans',sans-serif", size: 11 }
        };
        const XS = { grid: { display: false }, ticks: { color: TICK, font: { family: "'Plus Jakarta Sans',sans-serif", size: 10 } } };
        const YS = { grid: { color: GRID }, ticks: { color: TICK, font: { family: "'Plus Jakarta Sans',sans-serif", size: 10 } } };

        if (chartStackedBar.current) {
            chartsRef.current.stacked = new Chart(chartStackedBar.current, {
                type: 'bar',
                data: {
                    labels: data.chartData.mo_labels,
                    datasets: [
                        { label: 'Savings', data: data.chartData.sav_arr, backgroundColor: '#0b2419cc', borderRadius: 5, barPercentage: 0.75 },
                        { label: 'Contributions', data: data.chartData.ctb_arr, backgroundColor: '#a3e635cc', borderRadius: 5, barPercentage: 0.75 },
                        { label: 'Repayments', data: data.chartData.rep_arr, backgroundColor: '#2563ebcc', borderRadius: 5, barPercentage: 0.75 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: TT },
                    scales: { x: { ...XS, stacked: true }, y: { ...YS, stacked: true } }
                }
            });
        }

        if (chartGrouped.current) {
            chartsRef.current.grouped = new Chart(chartGrouped.current, {
                type: 'bar',
                data: {
                    labels: data.chartData.inc_labels,
                    datasets: [
                        { label: 'Income', data: data.chartData.inc_arr, backgroundColor: '#16a34acc', borderRadius: 8, barPercentage: 0.72 },
                        { label: 'Outflow', data: data.chartData.exp_arr, backgroundColor: '#dc2626cc', borderRadius: 8, barPercentage: 0.72 },
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: TT },
                    scales: { x: XS, y: YS }
                }
            });
        }

        if (chartDonut.current) {
            chartsRef.current.donut = new Chart(chartDonut.current, {
                type: 'doughnut',
                data: {
                    labels: ['Savings', 'Shares', 'Loans', 'Wallet'],
                    datasets: [{
                        data: [data.balances.savings, data.balances.shares, data.balances.loans, data.balances.wallet],
                        backgroundColor: ['#0b2419', '#a3e635', '#dc2626', '#2563eb'],
                        borderWidth: 0, hoverOffset: 7
                    }]
                },
                options: {
                    cutout: '72%', responsive: false,
                    plugins: { legend: { display: false }, tooltip: TT }
                }
            });
        }

        if (chartGauge.current) {
            const h = data.stats.health;
            const hc = h >= 80 ? '#16a34a' : h >= 60 ? '#2563eb' : '#d97706';
            chartsRef.current.gauge = new Chart(chartGauge.current, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [h, 100 - h],
                        backgroundColor: [hc, dark ? 'rgba(255,255,255,.07)' : 'rgba(11,36,25,.06)'],
                        borderWidth: 0, circumference: 180, rotation: 270
                    }]
                },
                options: {
                    responsive: false, cutout: '70%',
                    plugins: { legend: { display: false }, tooltip: { enabled: false } }
                }
            });
        }

        if (chartRadar.current) {
            chartsRef.current.radar = new Chart(chartRadar.current, {
                type: 'radar',
                data: {
                    labels: ['Savings', 'Shares', 'Loan Health', 'Contributions', 'Welfare', 'Wallet'],
                    datasets: [{
                        label: 'Score', data: data.chartData.radar,
                        borderColor: '#a3e635', borderWidth: 2,
                        backgroundColor: 'rgba(163,230,53,.12)',
                        pointBackgroundColor: '#a3e635', pointBorderColor: SURF, pointBorderWidth: 2, pointRadius: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: TT },
                    scales: { r: { grid: { color: GRID }, ticks: { display: false }, min: 0, max: 100, pointLabels: { color: TICK, font: { family: "'Plus Jakarta Sans',sans-serif", size: 10, weight: 'bold' as const } } } }
                }
            });
        }

        setTimeout(() => {
            document.querySelectorAll<HTMLElement>('[data-w]').forEach(el => {
                el.style.width = el.dataset.w + '%';
            });
        }, 500);

    }, [data]);

    const ks = (n: number) => {
        if (n >= 1000000) return 'KES ' + (n / 1000000).toFixed(2) + 'M';
        if (n >= 1000) return 'KES ' + (n / 1000).toFixed(1) + 'K';
        return 'KES ' + Number(n).toFixed(2);
    };

    if (loading) return <div className="dash-loading"><div className="loader"></div><p>Syncing Financial Data...</p></div>;
    if (!data) return null;

    const { balances, loan_pct, stats, recent_txn } = data;

    return (
        <div className="dash relative z-10 w-full mb-10 mt-[-40px]">
            {/* HERO */}
            <div className="hero">
                <div className="hero-mesh"></div><div className="hero-dots"></div>
                <div className="hero-ring r1"></div><div className="hero-ring r2"></div>
                <div className="hero-inner">
                    <div className="flex flex-wrap items-end gap-6 justify-between">
                        <div className="w-full lg:w-2/3">
                            <div className="hero-eyebrow"><span className="eyebrow-dot"></span> Verified Member</div>
                            <h1>Good day, {data.first_name}! 👋</h1>
                            <p className="hero-sub">
                                Member <strong>{data.reg_no}</strong> &nbsp;&middot;&nbsp; 
                                Since <strong>{data.join_date}</strong> &nbsp;&middot;&nbsp;
                                Health <strong style={{color: '#fff'}}>{stats.health}/100</strong>
                            </p>
                            <div className="hero-bubbles">
                                <div className="hbub"><div className="hbub-val">{ks(balances.savings)}</div><div className="hbub-lbl">Savings</div></div>
                                <div className="hbub"><div className="hbub-val">{ks(balances.shares)}</div><div className="hbub-lbl">Shares</div></div>
                                <div className="hbub"><div className="hbub-val" style={{color: balances.loans > 0 ? '#fca5a5' : '#a3e635'}}>{ks(balances.loans)}</div><div className="hbub-lbl">Loans</div></div>
                                <div className="hbub"><div className="hbub-val" style={{color: balances.net_worth >= 0 ? '#a3e635' : '#fca5a5'}}>{ks(Math.abs(balances.net_worth))}</div><div className="hbub-lbl">Net Worth</div></div>
                                <div className="hbub"><div className="hbub-val">{ks(balances.wallet)}</div><div className="hbub-lbl">Wallet</div></div>
                            </div>
                            <div className="hero-ctas">
                                <Link href="/member/wallet?action=deposit" className="btn-lime"><i className="bi bi-plus-circle-fill"></i> Deposit</Link>
                                {balances.wallet > 0 && <Link href="/member/wallet?action=withdraw" className="btn-ghost"><i className="bi bi-arrow-up-right-circle"></i> Withdraw</Link>}
                                <Link href="/member/loans" className="btn-ghost"><i className="bi bi-bank2"></i> Apply Loan</Link>
                                <Link href="/member/transactions" className="btn-ghost"><i className="bi bi-list-ul"></i> Transactions</Link>
                            </div>
                        </div>
                        <div className="hidden lg:block w-72">
                            <div className="hero-grade text-right">
                                <div className="grade-label">Credit Grade</div>
                                <div className="grade-big">{loan_pct < 30 ? 'AAA' : (loan_pct < 50 ? 'AA+' : (loan_pct < 70 ? 'A+' : 'B+'))}</div>
                                <div className="grade-sub">Based on loan utilization</div>
                                <div className="loan-bar-wrap w-full text-left">
                                    <div className="loan-bar-label">Loan Limit Used</div>
                                    <div className="loan-bar-track"><div className="loan-bar-fill" style={{width: `${loan_pct}%`}}></div></div>
                                    <div className="loan-bar-pct">{loan_pct.toFixed(1)}% of KES 500K</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FLOATING STAT CARDS */}
            <div className="stats-float">
                <div className="row g-4">
                    <div className="col-md-3">
                        <div className="sc sc-g">
                            <div className="sc-ico"><i className="bi bi-piggy-bank-fill"></i></div>
                            <div className="sc-lbl">Total Savings</div>
                            <div className="sc-val">{ks(balances.savings)}</div>
                            <div className="sc-bar"><div className="sc-bar-fill bg-green-500" data-w="100"></div></div>
                            <div className="sc-meta">Active savings account</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="sc sc-b">
                            <div className="sc-ico"><i className="bi bi-calendar-check-fill"></i></div>
                            <div className="sc-lbl">This Month</div>
                            <div className="sc-val">{ks(stats.month_contrib)}</div>
                            <div className="sc-bar"><div className="sc-bar-fill bg-blue-500" data-w={stats.month_contrib > 0 ? "75" : "0"}></div></div>
                            <div className="sc-meta">{stats.month_contrib > 0 ? 'Contribution made' : 'Not yet contributed'}</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="sc sc-a">
                            <div className="sc-ico"><i className="bi bi-graph-up-arrow"></i></div>
                            <div className="sc-lbl">Total Deposits</div>
                            <div className="sc-val">{ks(stats.total_deposits)}</div>
                            <div className="sc-bar"><div className="sc-bar-fill bg-amber-500" data-w="100"></div></div>
                            <div className="sc-meta">All-time deposits</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="sc sc-r">
                            <div className="sc-ico"><i className="bi bi-arrow-up-right-square-fill"></i></div>
                            <div className="sc-lbl">Total Withdrawn</div>
                            <div className="sc-val">{ks(stats.total_withdrawals)}</div>
                            {(() => {
                                const wPct = stats.total_deposits > 0 ? Math.min(100, (stats.total_withdrawals / stats.total_deposits) * 100) : 0;
                                return (
                                    <>
                                        <div className="sc-bar"><div className="sc-bar-fill bg-red-500" data-w={Math.round(wPct)}></div></div>
                                        <div className="sc-meta">{Math.round(wPct)}% of deposits</div>
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body mt-4">
                {/* Row 1 */}
                <div className="row g-4 mb-4">
                    <div className="col-xl-7">
                        <div className="chart-card">
                            <div className="cc-head">
                                <div><div className="cc-title">12-Month Financial Activity</div><div className="cc-sub">Savings · Contributions · Repayments</div></div>
                                <div className="cc-stats hidden md:flex items-center">
                                    <div className="text-right"><div className="cc-stat-val">{ks(balances.savings)}</div><div className="cc-stat-lbl">Net Savings</div></div>
                                    <div className="cc-stat-div mx-4"></div>
                                    <div className="text-right"><div className="cc-stat-val">{ks(data.chartData.ctb_arr.reduce((a:any,b:any)=>a+b,0))}</div><div className="cc-stat-lbl">Total Contributions</div></div>
                                </div>
                            </div>
                            <div className="leg">
                                <div className="leg-i"><span className="leg-dot bg-[#0b2419]"></span>Savings</div>
                                <div className="leg-i"><span className="leg-dot bg-[#a3e635]"></span>Contributions</div>
                                <div className="leg-i"><span className="leg-dot bg-[#2563eb]"></span>Repayments</div>
                            </div>
                            <div className="chart-box h-[260px] mt-3">
                                <canvas ref={chartStackedBar}></canvas>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-5">
                        <div className="chart-card">
                            <div className="cc-head"><div><div className="cc-title">Income vs Outflow</div><div className="cc-sub">6-month deposits vs withdrawals</div></div></div>
                            <div className="cc-stats flex items-center mb-[14px]">
                                <div><div className="cc-stat-val">{ks(data.chartData.inc_arr.reduce((a:any,b:any)=>a+b,0))}</div><div className="cc-stat-lbl">Total In</div></div>
                                <div className="cc-stat-div mx-3"></div>
                                <div><div className="cc-stat-val">{ks(data.chartData.exp_arr.reduce((a:any,b:any)=>a+b,0))}</div><div className="cc-stat-lbl">Total Out</div></div>
                            </div>
                            <div className="leg">
                                <div className="leg-i"><span className="leg-dot bg-green-600"></span>Income</div>
                                <div className="leg-i"><span className="leg-dot bg-red-600"></span>Outflow</div>
                            </div>
                            <div className="chart-box h-[230px] mt-2">
                                <canvas ref={chartGrouped}></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="row g-4 mb-4">
                    <div className="col-xl-4">
                        <div className="chart-card">
                            <div className="cc-head"><div><div className="cc-title">Portfolio Composition</div><div className="cc-sub">Asset vs liability breakdown</div></div></div>
                            <div className="relative w-[160px] h-[160px] mx-auto my-4 shrink-0">
                                <canvas ref={chartDonut} width="160" height="160"></canvas>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                                    <div className="text-[0.88rem] font-extrabold">{ks(balances.savings + balances.shares)}</div>
                                    <div className="text-[0.58rem] font-bold uppercase mt-0.5">Total Assets</div>
                                </div>
                            </div>
                            {[
                                ['Savings', '#0b2419', balances.savings],
                                ['Shares', '#a3e635', balances.shares],
                                ['Loans', '#dc2626', balances.loans],
                                ['Wallet', '#2563eb', balances.wallet],
                            ].map((d, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-[0.76rem]">
                                    <span className="flex items-center gap-2 font-semibold"><span className="w-2 h-2 rounded-full" style={{backgroundColor: d[1] as string}}></span>{d[0]}</span>
                                    <span className="font-extrabold">{ks(d[2] as number)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-xl-4">
                        <div className="chart-card">
                            <div className="cc-head"><div><div className="cc-title">Account Health</div><div className="cc-sub">Composite financial score</div></div></div>
                            <div className="gauge-half my-3 relative h-[90px] overflow-hidden">
                                <canvas ref={chartGauge} width="180" height="180" className="absolute top-[-45px] left-1/2 -translate-x-1/2"></canvas>
                            </div>
                            <div className="text-center mb-4">
                                <div className="text-3xl font-extrabold">{stats.health}</div>
                                <div className="inline-flex rounded-full px-3 py-1 text-[0.7rem] font-extrabold bg-green-50 text-green-600 mt-2">
                                    {stats.health >= 80 ? 'Excellent' : 'Good'}
                                </div>
                            </div>
                            <div className="mt-auto">
                                {[
                                    ['Loan Utilization', loan_pct < 50, 'bi-bank2', `${loan_pct.toFixed(0)}% used`],
                                    ['Monthly Contrib', stats.month_contrib > 0, 'bi-calendar-check-fill', ks(stats.month_contrib)],
                                    ['Savings Balance', balances.savings >= 5000, 'bi-piggy-bank-fill', ks(balances.savings)],
                                    ['Welfare Active', stats.welfare_total > 0, 'bi-heart-pulse-fill', ks(stats.welfare_total)],
                                ].map((hf, i) => (
                                    <div key={i} className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[0.72rem] ${hf[1] ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            <i className={`bi ${hf[2]}`}></i>
                                        </div>
                                        <div className="text-[0.75rem] font-bold flex-1">{hf[0]}</div>
                                        <div className="text-[0.65rem] font-semibold">{hf[3]}</div>
                                        <i className={`bi ${hf[1] ? 'bi-check-circle-fill text-green-600' : 'bi-x-circle-fill text-red-600'}`}></i>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4">
                        <div className="chart-card">
                            <div className="cc-head"><div><div className="cc-title">Recent Transactions</div><div className="cc-sub">Latest entries</div></div></div>
                            <div className="txn-feed">
                                {recent_txn.map((t: any, i: number) => {
                                    const isIn = ['deposit','income','contribution'].includes(t.transaction_type);
                                    return (
                                        <div key={i} className="txn-row flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`txn-ico w-8 h-8 rounded-lg flex items-center justify-center ${isIn ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    <i className={`bi ${isIn ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}></i>
                                                </div>
                                                <div>
                                                    <div className="text-[0.8rem] font-bold capitalize">{t.transaction_type}</div>
                                                    <div className="text-[0.65rem] text-gray-400">{new Date(t.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-[0.8rem] font-extrabold ${isIn ? 'text-green-600' : 'text-red-500'}`}>{isIn ? '+' : '-'}{Number(t.amount).toLocaleString()}</div>
                                                <div className="text-[0.55rem] uppercase text-gray-400">{t.reference_no}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <Link href="/member/transactions" className="btn-view-all mt-auto text-center py-2 bg-gray-50 rounded-xl text-[0.7rem] font-bold">View All Transactions</Link>
                        </div>
                    </div>
                </div>

                {/* Row 3 */}
                <div className="row g-4">
                    <div className="col-xl-5">
                        <div className="chart-card">
                            <div className="cc-head"><div><div className="cc-title">Financial Radar</div><div className="cc-sub">Multi-dimension performance score</div></div></div>
                            <div className="chart-box h-[230px]">
                                <canvas ref={chartRadar}></canvas>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-7">
                        <div className="chart-card">
                            <div className="cc-head"><div><div className="cc-title">Quick Actions</div><div className="cc-sub">Common financial operations</div></div></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                                {[
                                    ['bi-plus-circle-fill', 'bg-green-50', 'text-green-600', 'Add Funds', '/member/wallet?action=deposit&type=savings'],
                                    ['bi-pie-chart-fill', 'bg-lime-50', 'text-lime-600', 'Buy Shares', '/member/wallet?action=deposit&type=shares'],
                                    ['bi-heart-fill', 'bg-rose-50', 'text-rose-600', 'Contribute', '/member/wallet?action=deposit&type=welfare'],
                                    ['bi-bank2', 'bg-amber-50', 'text-amber-600', 'Apply Loan', '/member/loans'],
                                    ['bi-wallet2', 'bg-blue-50', 'text-blue-600', 'Withdraw', '/member/wallet?action=withdraw'],
                                    ['bi-file-earmark-text', 'bg-gray-50', 'text-gray-600', 'Statement', '/member/savings'],
                                ].map((a, i) => (
                                    <Link key={i} href={a[4]} className="flex items-center gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-sm">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a[1]} ${a[2]}`}><i className={`bi ${a[0]}`}></i></div>
                                        <div className="text-[0.8rem] font-bold">{a[3]}</div>
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
