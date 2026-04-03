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
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('timeout')), 3500)
            );
            const fetchReq = apiFetch('/api/v1/member_dashboard.php');
            
            const res: any = await Promise.race([fetchReq, timeout]);
            setData(res.data);
            setUsingMock(false);
        } catch (err: any) {
            console.warn("Backend unavailable, using mock data:", err.message);
            setData(MOCK_DATA);
            setUsingMock(true);
            if (err.message !== 'timeout' && !err.message.includes('Failed to fetch')) {
                setError(`Server Error: ${err.message}. Showing demo data instead.`);
            }
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
            titleColor: '#a3e635',
            bodyColor: '#fff',
            padding: 12, cornerRadius: 10,
            borderColor: 'rgba(163,230,53,.2)', borderWidth: 1,
            titleFont: { family: "'Plus Jakarta Sans',sans-serif", weight: 'bold' as const, size: 12 },
            bodyFont: { family: "'Plus Jakarta Sans',sans-serif", size: 11 }
        };

        if (chartStackedBar.current) {
            chartsRef.current.stacked = new Chart(chartStackedBar.current, {
                type: 'bar',
                data: {
                    labels: data.chartData.mo_labels,
                    datasets: [
                        { label: 'Savings', data: data.chartData.sav_arr, backgroundColor: '#0b2419cc', borderRadius: 5 },
                        { label: 'Contributions', data: data.chartData.ctb_arr, backgroundColor: '#a3e635cc', borderRadius: 5 },
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: TT },
                    scales: { x: { grid: { display: false }, stacked: true }, y: { grid: { color: GRID }, stacked: true } }
                }
            });
        }

        if (chartRadar.current) {
            chartsRef.current.radar = new Chart(chartRadar.current, {
                type: 'radar',
                data: {
                    labels: ['Savings', 'Shares', 'Health', 'Contrib', 'Welfare', 'Wallet'],
                    datasets: [{
                        label: 'Score',
                        data: data.chartData.radar,
                        borderColor: '#a3e635',
                        backgroundColor: 'rgba(163,230,53,.1)',
                        pointBackgroundColor: '#a3e635',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: TT },
                    scales: { r: { grid: { color: GRID }, pointLabels: { color: TICK }, ticks: { display: false } } }
                }
            });
        }

        setTimeout(() => {
            document.querySelectorAll<HTMLElement>('[data-w]').forEach(el => {
                el.style.width = el.dataset.w + '%';
            });
        }, 500);

    }, [data]);

    const ks = (n: number) => 'KES ' + Number(n).toLocaleString();

    if (loading) return <div className="dash-loading"><div className="loader"></div><p>Syncing Financial Data...</p></div>;

    return (
        <div className="dash relative z-10 w-full mb-10 overflow-visible mt-[-20px]">
            {usingMock && (
                <div className="mock-banner animate-pulse">
                    <i className="bi bi-info-circle-fill"></i>
                    Offline Mode: Showing demo data for visualization.
                    <button onClick={loadDashboard} className="ml-4 underline font-bold">Retry Sync</button>
                </div>
            )}

            {/* HERO */}
            <div className="hero-premium">
                <div className="hero-blur b1"></div><div className="hero-blur b2"></div>
                <div className="hero-content">
                    <div className="row items-center">
                        <div className="col-lg-8">
                            <div className="hero-tag">Verified Gold Member</div>
                            <h1 className="hero-title">Welcome back, {data.first_name}! 👋</h1>
                            <p className="hero-summary">
                                Member <span className="text-white">{data.reg_no}</span> &nbsp;&middot;&nbsp; 
                                Joined <span className="text-white">{data.join_date}</span>
                            </p>
                            
                            <div className="hero-stats-grid">
                                <div className="hstat">
                                    <div className="hstat-label">Net Worth</div>
                                    <div className="hstat-value">{ks(data.balances.net_worth)}</div>
                                </div>
                                <div className="hstat">
                                    <div className="hstat-label">Savings</div>
                                    <div className="hstat-value">{ks(data.balances.savings)}</div>
                                </div>
                                <div className="hstat">
                                    <div className="hstat-label">Shares</div>
                                    <div className="hstat-value">{ks(data.balances.shares)}</div>
                                </div>
                            </div>

                            <div className="hero-actions mt-4">
                                <Link href="/member/mpesa" className="ha-btn ha-btn-primary"><i className="bi bi-plus-lg"></i> Deposit Funds</Link>
                                <Link href="/member/withdraw" className="ha-btn ha-btn-ghost"><i className="bi bi-send"></i> Send Money</Link>
                                <Link href="/member/loans" className="ha-btn ha-btn-ghost"><i className="bi bi-bank"></i> Quick Loan</Link>
                            </div>
                        </div>
                        <div className="col-lg-4 hidden lg:block text-right">
                            <div className="health-card">
                                <div className="health-label">Member Score</div>
                                <div className="health-value">{data.stats.health}%</div>
                                <div className="health-bar-bg"><div className="health-bar-fill" data-w={data.stats.health}></div></div>
                                <p className="health-desc">Based on contribution consistency</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dash-body mt-4">
                <div className="row g-4">
                    {/* Charts */}
                    <div className="col-xl-8">
                        <div className="glass-card h-full min-h-[400px]">
                            <div className="card-header">
                                <div>
                                    <h3>Financial Performance</h3>
                                    <p>12-month savings vs contributions</p>
                                </div>
                                <div className="header-stats">
                                    <div className="h-s-i"><span>KES</span> {data.stats.month_contrib.toLocaleString()} <small>This Month</small></div>
                                </div>
                            </div>
                            <div className="chart-container h-[300px]">
                                <canvas ref={chartStackedBar}></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-xl-4">
                        <div className="glass-card h-full">
                            <div className="card-header">
                                <h3>Account Symmetry</h3>
                                <p>Multi-dimensional score</p>
                            </div>
                            <div className="chart-container h-[300px]">
                                <canvas ref={chartRadar}></canvas>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="col-12">
                        <div className="row g-4">
                            {[
                                { lbl: 'Total Savings', val: data.balances.savings, ico: 'bi-piggy-bank', clr: 'emerald' },
                                { lbl: 'Total Shares', val: data.balances.shares, ico: 'bi-pie-chart', clr: 'lime' },
                                { lbl: 'Loan Limit Used', val: data.loan_pct, ico: 'bi-bank', clr: 'amber', isPct: true },
                                { lbl: 'Welfare Fund', val: data.stats.welfare_total, ico: 'bi-heart-fill', clr: 'rose' }
                            ].map((s, i) => (
                                <div key={i} className="col-md-3">
                                    <div className={`mini-card mc-${s.clr}`}>
                                        <div className="mc-icon"><i className={`bi ${s.ico}`}></i></div>
                                        <div className="mc-content">
                                            <div className="mc-label">{s.lbl}</div>
                                            <div className="mc-value">{s.isPct ? `${s.val}%` : ks(s.val)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="col-lg-7">
                        <div className="glass-card">
                            <div className="card-header flex justify-between items-center">
                                <div>
                                    <h3>Recent Activity</h3>
                                    <p>Latest movements in your accounts</p>
                                </div>
                                <Link href="/member/transactions" className="view-all">See All <i className="bi bi-chevron-right"></i></Link>
                            </div>
                            <div className="txn-list mt-3">
                                {data.recent_txn.map((t: any, i: number) => (
                                    <div key={i} className="txn-item">
                                        <div className={`txn-icon t-icon-${t.transaction_type}`}><i className="bi bi-arrow-right-left"></i></div>
                                        <div className="txn-info">
                                            <div className="txn-name">{t.transaction_type.replace('_',' ')}</div>
                                            <div className="txn-date">{new Date(t.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className={`txn-amount ${t.transaction_type === 'withdrawal' ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {t.transaction_type === 'withdrawal' ? '-' : '+'} {Number(t.amount).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Support & Tips */}
                    <div className="col-lg-5">
                        <div className="glass-card bg-emerald-900/10 border-emerald-500/20">
                            <h3 className="text-emerald-600 dark:text-emerald-400 mb-2">Member Support</h3>
                            <p className="text-sm opacity-70 mb-4">Need help or a consultation from our agents?</p>
                            <div className="support-actions grid grid-cols-2 gap-3">
                                <Link href="/member/support" className="support-link"><i className="bi bi-headset"></i> Support Hub</Link>
                                <Link href="/member/messages" className="support-link"><i className="bi bi-chat-dots"></i> My Messages</Link>
                            </div>
                            <div className="tip-box mt-4">
                                <div className="tip-icon"><i className="bi bi-lightbulb"></i></div>
                                <div className="tip-content">
                                    <strong>Pro Tip:</strong> Consistent monthly contributions increase your loan eligibility up to 3x your savings.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
