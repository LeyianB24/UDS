"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Chart from 'chart.js/auto';
import './contributions.css';

export default function MemberContributions() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filters
    const typeFilter = searchParams.get('type') || 'all';
    const fromFilter = searchParams.get('from') || '';
    const toFilter = searchParams.get('to') || '';
    const currentPage = parseInt(searchParams.get('page') || '1');

    const trendChartRef = useRef<HTMLCanvasElement>(null);
    const ringChartRef = useRef<HTMLCanvasElement>(null);
    const trendInstance = useRef<any>(null);
    const ringInstance = useRef<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (fromFilter) params.append('from', fromFilter);
            if (toFilter) params.append('to', toFilter);
            params.append('page', currentPage.toString());
            
            const res = await fetchApi(`member_contributions?${params.toString()}`, 'GET');
            if (res.status === 'success') {
                setData(res.data);
            } else {
                setError('Failed to load contributions data');
            }
        } catch (err: any) {
            setError(err.message || 'Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [typeFilter, fromFilter, toFilter, currentPage]);

    useEffect(() => {
        if (!data || !trendChartRef.current || !ringChartRef.current) return;
        
        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(11,36,25,0.05)';
        const tickColor = isDark ? '#3a6050' : '#8fada0';

        // Trend Chart
        if (trendInstance.current) trendInstance.current.destroy();
        const tCtx = trendChartRef.current.getContext('2d');
        if (tCtx) {
            trendInstance.current = new Chart(tCtx, {
                type: 'bar',
                data: {
                    labels: data.trend.labels,
                    datasets: [
                        { label: 'Savings', data: data.trend.savings, backgroundColor: '#16a34a', borderRadius: 4, barThickness: 12 },
                        { label: 'Shares', data: data.trend.shares, backgroundColor: '#2563eb', borderRadius: 4, barThickness: 12 },
                        { label: 'Welfare', data: data.trend.welfare, backgroundColor: '#dc2626', borderRadius: 4, barThickness: 12 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { stacked: true, grid: { display: false }, ticks: { color: tickColor, font: {family:"'Plus Jakarta Sans',sans-serif", size:10} } },
                        y: { stacked: true, grid: { color: gridColor }, ticks: { color: tickColor, callback: (v: any) => v >= 1000 ? v/1000+'k' : v, font: {family:"'Plus Jakarta Sans',sans-serif", size:10} }, border: { display: false } }
                    }
                }
            });
        }

        // Ring Chart
        if (ringInstance.current) ringInstance.current.destroy();
        const rCtx = ringChartRef.current.getContext('2d');
        if (rCtx) {
            ringInstance.current = new Chart(rCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Savings', 'Shares', 'Welfare'],
                    datasets: [{
                        data: [data.stats.total_savings, data.stats.total_shares, data.stats.total_welfare],
                        backgroundColor: ['#16a34a', '#2563eb', '#dc2626'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: { legend: { display: false }, tooltip: { padding: 10, boxPadding: 6 } }
                }
            });
        }
    }, [data]);

    const ks = (n: number) => {
        if (n >= 1000000) return 'KES ' + (n/1000000).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) + 'M';
        if (n >= 1000) return 'KES ' + (n/1000).toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:1}) + 'K';
        return 'KES ' + Number(n).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    };

    const handleFilterChange = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const params = new URLSearchParams();
        if (typeFilter !== 'all') params.append('type', typeFilter);
        if (formData.get('from')) params.append('from', formData.get('from') as string);
        if (formData.get('to')) params.append('to', formData.get('to') as string);
        params.append('page', '1');
        router.push(`/member/contributions?${params.toString()}`);
    };

    const handleClearFilters = () => {
        router.push(`/member/contributions`);
    };

    const handleExport = (action: string) => {
        const params = new URLSearchParams();
        params.append('action', action);
        if (typeFilter !== 'all') params.append('type', typeFilter);
        if (fromFilter) params.append('from', fromFilter);
        if (toFilter) params.append('to', toFilter);
        window.open(`http://localhost/UDS/member/pages/contributions.php?${params.toString()}`, '_blank');
    };

    if (loading && !data) return <div className="pg-body"><div className="spinner-border text-emerald-600 m-5"></div></div>;
    if (error) return <div className="pg-body text-red-500 m-5">Error: {error}</div>;
    if (!data) return null;

    const { stats, history, pagination } = data;
    const safeGt = stats.grand_total || 1;

    let prevDate = '';

    return (
        <div className="relative z-10 w-full mb-10 mt-[-40px]">
            {/* HERO */}
            <div className="hero rounded-[20px] mx-[52px]">
                <div className="hero-mesh"></div>
                <div className="hero-dots"></div>
                <div className="hero-ring r1"></div>
                <div className="hero-ring r2"></div>

                <div className="hero-top">
                    <div>
                        <div className="hero-eyebrow"><span className="eyebrow-dot"></span> Financial Record</div>
                        <h1>My Contributions</h1>
                        <p className="hero-sub">Complete history of your savings, shares &amp; welfare deposits</p>
                    </div>
                    <div className="hero-ctas">
                        <div className="relative group inline-block">
                            <button className="btn-ghost">
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
                        <Link href="/member/mpesa" className="btn-lime">
                            <i className="bi bi-plus-circle-fill"></i> New Deposit
                        </Link>
                    </div>
                </div>

                <div className="hero-band">
                    <div className="hb-cell">
                        <div className="hbc-eyebrow">
                            <div className="hbc-ico" style={{background:'rgba(163,230,53,.15)',color:'#a3e635'}}><i className="bi bi-layers-fill"></i></div>
                            Portfolio Total
                        </div>
                        <div className="hbc-val">{ks(stats.grand_total)}</div>
                        <div className="hbc-meta">{stats.total_count} transactions <span className="hbc-pill">All time</span></div>
                    </div>
                    <div className="hb-cell">
                        <div className="hbc-eyebrow">
                            <div className="hbc-ico" style={{background:'rgba(163,230,53,.15)',color:'#a3e635'}}><i className="bi bi-piggy-bank-fill"></i></div>
                            Savings
                        </div>
                        <div className="hbc-val">{ks(stats.total_savings)}</div>
                        <div className="hbc-meta">{stats.count_savings} deposits <span className="hbc-pill">{Math.round((stats.total_savings/safeGt)*100)}%</span></div>
                    </div>
                    <div className="hb-cell">
                        <div className="hbc-eyebrow">
                            <div className="hbc-ico" style={{background:'rgba(163,230,53,.15)',color:'#a3e635'}}><i className="bi bi-pie-chart-fill"></i></div>
                            Shares Capital
                        </div>
                        <div className="hbc-val">{ks(stats.total_shares)}</div>
                        <div className="hbc-meta">{stats.count_shares} deposits <span className="hbc-pill">{Math.round((stats.total_shares/safeGt)*100)}%</span></div>
                    </div>
                    <div className="hb-cell">
                        <div className="hbc-eyebrow">
                            <div className="hbc-ico" style={{background:'rgba(163,230,53,.15)',color:'#a3e635'}}><i className="bi bi-heart-pulse-fill"></i></div>
                            Welfare Fund
                        </div>
                        <div className="hbc-val">{ks(stats.total_welfare)}</div>
                        <div className="hbc-meta">{stats.active_days} active days <span className="hbc-pill">30d</span></div>
                    </div>
                </div>
            </div>

            {/* FLOATING STATS */}
            <div className="stats-float">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="sa1 h-[142px]">
                        <div className="sc sc-g dark:border-emerald-800 dark:bg-[#0a1810]">
                            <div className="sc-ico text-green-600 bg-green-600/10"><i className="bi bi-piggy-bank-fill"></i></div>
                            <div className="sc-lbl dark:text-emerald-400/60">Savings Balance</div>
                            <div className="sc-val dark:text-white">{ks(stats.ledger_savings)}</div>
                            <div className="sc-bar dark:bg-emerald-800/50"><div className="sc-bar-fill bg-green-600" style={{width: '100%'}}></div></div>
                            <div className="sc-meta dark:text-emerald-400/60">{stats.count_savings} deposits &middot; Ledger balance</div>
                        </div>
                    </div>
                    <div className="sa2 h-[142px]">
                        <div className="sc sc-b dark:border-emerald-800 dark:bg-[#0a1810]">
                            <div className="sc-ico text-blue-600 bg-blue-600/10"><i className="bi bi-pie-chart-fill"></i></div>
                            <div className="sc-lbl dark:text-emerald-400/60">Shares Capital</div>
                            <div className="sc-val dark:text-white">{ks(stats.total_shares)}</div>
                            <div className="sc-bar dark:bg-emerald-800/50"><div className="sc-bar-fill bg-blue-600" style={{width: `${Math.round((stats.total_shares/safeGt)*100)}%`}}></div></div>
                            <div className="sc-meta dark:text-emerald-400/60">{Math.round((stats.total_shares/safeGt)*100)}% of total portfolio</div>
                        </div>
                    </div>
                    <div className="sa3 h-[142px]">
                        <div className="sc sc-r dark:border-emerald-800 dark:bg-[#0a1810]">
                            <div className="sc-ico text-red-600 bg-red-600/10"><i className="bi bi-heart-pulse-fill"></i></div>
                            <div className="sc-lbl dark:text-emerald-400/60">Welfare Fund</div>
                            <div className="sc-val dark:text-white">{ks(stats.total_welfare)}</div>
                            <div className="sc-bar dark:bg-emerald-800/50"><div className="sc-bar-fill bg-red-600" style={{width: `${Math.round((stats.total_welfare/safeGt)*100)}%`}}></div></div>
                            <div className="sc-meta dark:text-emerald-400/60">{Math.round((stats.total_welfare/safeGt)*100)}% of total portfolio</div>
                        </div>
                    </div>
                    <div className="sa4 h-[142px]">
                        <div className="sc sc-l dark:border-emerald-800 dark:bg-[#0a1810]">
                            <div className="sc-ico text-[#6a9a1a] dark:text-lime-400 bg-lime-400/20"><i className="bi bi-calendar-check-fill"></i></div>
                            <div className="sc-lbl dark:text-emerald-400/60">Active Days</div>
                            <div className="sc-val dark:text-white">{stats.active_days}</div>
                            <div className="sc-bar dark:bg-emerald-800/50"><div className="sc-bar-fill bg-lime-400" style={{width: `${Math.min(100, (stats.active_days/30)*100)}%`}}></div></div>
                            <div className="sc-meta dark:text-emerald-400/60">In the last 30 days</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pg-body">
                {/* DUAL PANEL */}
                <div className="dual-panel">
                    <div className="chart-card dark:border-emerald-800 dark:bg-[#0a1810]">
                        <div className="cc-head">
                            <div>
                                <div className="cc-title dark:text-white">Contribution Trend</div>
                                <div className="cc-sub dark:text-emerald-400/60">Monthly breakdown — last 7 months</div>
                            </div>
                        </div>
                        <div className="leg">
                            <div className="leg-i dark:text-emerald-400/80"><span className="leg-dot bg-green-600"></span>Savings</div>
                            <div className="leg-i dark:text-emerald-400/80"><span className="leg-dot bg-blue-600"></span>Shares</div>
                            <div className="leg-i dark:text-emerald-400/80"><span className="leg-dot bg-red-600"></span>Welfare</div>
                        </div>
                        <div className="chart-box mt-3">
                            <canvas ref={trendChartRef}></canvas>
                        </div>
                    </div>

                    <div className="ring-card dark:border-emerald-800 dark:bg-[#0a1810]">
                        <div className="cc-head">
                            <div>
                                <div className="cc-title dark:text-white">Portfolio Mix</div>
                                <div className="cc-sub dark:text-emerald-400/60">Contribution breakdown</div>
                            </div>
                        </div>
                        <div className="ring-box">
                            <canvas ref={ringChartRef}></canvas>
                            <div className="ring-center">
                                <div className="ring-center-val dark:text-white">{ks(stats.grand_total)}</div>
                                <div className="ring-center-sub dark:text-emerald-400/50">Total</div>
                            </div>
                        </div>
                        <div className="rb-list">
                            {[
                                ['Savings', stats.total_savings, 'bi-piggy-bank-fill', 'dark:bg-green-600/10 bg-green-500/10', 'text-green-600', 'linear-gradient(90deg,#15803d,#4ade80)'],
                                ['Shares', stats.total_shares, 'bi-pie-chart-fill', 'dark:bg-blue-600/10 bg-blue-500/10', 'text-blue-600', 'linear-gradient(90deg,#1d4ed8,#93c5fd)'],
                                ['Welfare', stats.total_welfare, 'bi-heart-pulse-fill', 'dark:bg-red-600/10 bg-red-500/10', 'text-red-600', 'linear-gradient(90deg,#b91c1c,#fca5a5)']
                            ].map(([name, val, ico, bg, col, grad], i) => {
                                const v = val as number;
                                const pct = safeGt > 0 ? Math.round((v/safeGt)*100) : 0;
                                return (
                                    <div key={i}>
                                        <div className="rb-row">
                                            <div className="rb-left">
                                                <div className={`rb-ico ${bg} ${col}`}><i className={`bi ${ico}`}></i></div>
                                                <span className="rb-name dark:text-emerald-100">{name as string}</span>
                                            </div>
                                            <span className="rb-val dark:text-white">{ks(v)}</span>
                                        </div>
                                        <div className="rb-bar-wrap dark:bg-emerald-900/50">
                                            <div className="rb-bar-fill" style={{background: grad as string, width: `${pct}%`}}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* FILTER ROW */}
                <div className="filter-row">
                    <div className="type-tabs">
                        {[
                            { val: 'all', lbl: 'All', cls: 'tt-all', cnt: stats.total_count },
                            { val: 'savings', lbl: 'Savings', cls: 'tt-savings', cnt: stats.count_savings },
                            { val: 'shares', lbl: 'Shares', cls: 'tt-shares', cnt: stats.count_shares },
                            { val: 'welfare', lbl: 'Welfare', cls: 'tt-welfare', cnt: stats.count_welfare }
                        ].map((t) => {
                            const qp = new URLSearchParams(searchParams.toString());
                            qp.set('type', t.val);
                            qp.set('page', '1');
                            const isAct = typeFilter === t.val;
                            return (
                                <div key={t.val} className={t.cls}>
                                    <Link href={`/member/contributions?${qp.toString()}`} className={`type-tab dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-800 ${isAct ? 'act' : ''}`}>
                                        {t.lbl} <span className="tc-badge dark:bg-emerald-900/40 dark:text-emerald-400/60 ">{Number(t.cnt).toLocaleString()}</span>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    <form onSubmit={handleFilterChange} className="date-form">
                        <div className="df-grp">
                            <label className="df-lbl dark:text-emerald-500/70">From</label>
                            <input type="date" name="from" defaultValue={fromFilter} className="df-ctrl dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-white" />
                        </div>
                        <div className="df-grp">
                            <label className="df-lbl dark:text-emerald-500/70">To</label>
                            <input type="date" name="to" defaultValue={toFilter} className="df-ctrl dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-white" />
                        </div>
                        <button type="submit" className="btn-filter dark:border-emerald-700">
                            <i className="bi bi-funnel"></i> Apply
                        </button>
                        {fromFilter && (
                            <button type="button" onClick={handleClearFilters} className="btn-clear dark:border-emerald-800 dark:text-emerald-400" title="Clear dates">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        )}
                    </form>
                </div>

                {(fromFilter || toFilter || typeFilter !== 'all') && (
                    <div className="active-filter-pills">
                        <span className="afp-lbl dark:text-emerald-500/70">Filtering:</span>
                        {typeFilter !== 'all' && <span className="afp-pill dark:bg-emerald-900/30 dark:border-emerald-800/50"><span>Type:</span> <span className="capitalize">{typeFilter}</span></span>}
                        {fromFilter && <span className="afp-pill dark:bg-emerald-900/30 dark:border-emerald-800/50"><span>Date:</span> {fromFilter} {toFilter ? '→ ' + toFilter : ''}</span>}
                        <button onClick={handleClearFilters} className="afp-clear dark:hover:text-red-400">✕ Clear all</button>
                    </div>
                )}

                {/* LEDGER CARD */}
                <div className="ledger-card dark:border-emerald-800/60 dark:bg-emerald-950/20">
                    <div className="lc-head dark:bg-emerald-900/10 dark:border-emerald-800/60">
                        <div className="lc-title dark:text-white">Transaction History</div>
                        <div className="lc-meta">
                            <span className="lc-badge dark:bg-emerald-900/30 dark:border-emerald-800/50"><i className="bi bi-list-ul"></i> {pagination.total_rows.toLocaleString()} records</span>
                            <span className="lc-pg dark:text-emerald-400/60">Page {pagination.page} / {Math.max(1, pagination.total_pages)}</span>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="ct w-full min-w-[700px]">
                            <thead>
                                <tr>
                                    <th className="dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400/60 text-left pl-6" style={{width:'34%'}}>Contribution</th>
                                    <th className="dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400/60 text-left" style={{width:'14%'}}>Date &amp; Time</th>
                                    <th className="dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400/60 text-left" style={{width:'20%'}}>Reference</th>
                                    <th className="dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400/60 text-left" style={{width:'12%'}}>Status</th>
                                    <th className="dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400/60 text-right pr-6" style={{width:'20%'}}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? (
                                    history.map((row: any, i: number) => {
                                        const type = row.contribution_type;
                                        const status = (row.status || 'completed').toLowerCase();
                                        const dt = new Date(row.created_at);
                                        const dk = dt.toISOString().split('T')[0];
                                        
                                        const today = new Date().toISOString().split('T')[0];
                                        const yestDt = new Date();
                                        yestDt.setDate(yestDt.getDate() - 1);
                                        const yest = yestDt.toISOString().split('T')[0];

                                        let showDateSep = false;
                                        let isToday = false;
                                        let grpLabel = '';

                                        if (dk !== prevDate) {
                                            showDateSep = true;
                                            prevDate = dk;
                                            isToday = (dk === today);
                                            grpLabel = (dk === today) ? 'Today' : (dk === yest) ? 'Yesterday' : dt.toLocaleDateString('en-GB', {weekday:'long', day:'2-digit', month:'short', year:'numeric'});
                                        }

                                        const tcls = type === 'savings' ? 't-sav' : type === 'shares' ? 't-sha' : type === 'welfare' ? 't-wel' : '';
                                        const icls = type === 'savings' ? 'ico-sav dark:bg-green-600/10' : type === 'shares' ? 'ico-sha dark:bg-blue-600/10' : type === 'welfare' ? 'ico-wel dark:bg-red-600/10' : 'ico-def dark:bg-emerald-900/20';
                                        const iname = type === 'savings' ? 'bi-piggy-bank-fill' : type === 'shares' ? 'bi-pie-chart-fill' : type === 'welfare' ? 'bi-heart-pulse-fill' : 'bi-cash-stack';
                                        const stcls = ['completed','active'].includes(status) ? 'chip-ok dark:bg-green-600/10 dark:text-green-400' : status === 'pending' ? 'chip-pnd dark:bg-amber-600/10 dark:text-amber-400' : 'chip-err dark:bg-red-600/10 dark:text-red-400';

                                        return (
                                            <React.Fragment key={i}>
                                                {showDateSep && (
                                                    <tr className={`ct-sep ${isToday ? 'ct-sep-today' : ''}`}>
                                                        <td colSpan={5} className="dark:bg-emerald-950/40 dark:border-emerald-800">
                                                            <div className={`ct-sep-inner ${isToday ? 'text-green-600 dark:text-green-400' : 'dark:text-emerald-400/60'}`}>
                                                                {grpLabel}
                                                                {isToday && <span className="ct-today-badge dark:bg-green-500/10">{dt.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}</span>}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                <tr className={`ct-row ${tcls} dark:border-emerald-800/50 hover:dark:bg-emerald-800/10`}>
                                                    <td className="pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`ct-ico ${icls}`}><i className={`bi ${iname}`}></i></div>
                                                            <div>
                                                                <div className="ct-name dark:text-white">{type.replace('_',' ')}</div>
                                                                <div className="ct-method dark:text-emerald-400/60">
                                                                    <span className="ct-method-dot dark:bg-emerald-400/40"></span>
                                                                    {row.payment_method || 'M-Pesa'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ct-date dark:text-emerald-100">{dt.toLocaleDateString('en-GB', {month:'short', day:'2-digit', year:'numeric'})}</div>
                                                        <div className="ct-time dark:text-emerald-400/60">{dt.toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit', hour12:true})}</div>
                                                    </td>
                                                    <td><span className="ct-ref dark:bg-emerald-900/30 dark:border-emerald-800/60 dark:text-emerald-400">{row.reference_no || '—'}</span></td>
                                                    <td><span className={`sc-chip ${stcls} capitalize`}>{status}</span></td>
                                                    <td className="text-right pr-6">
                                                        <div className="ct-amount">+ KES {Number(row.amount).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                                                        <div className="ct-amount-sub capitalize dark:text-emerald-400/60">{type}</div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="empty-well">
                                                <div className="ew-ico dark:bg-emerald-900/20 dark:border-emerald-800 text-emerald-900/20 dark:text-emerald-800"><i className="bi bi-receipt-cutoff"></i></div>
                                                <div className="ew-title dark:text-white">No Contributions Found</div>
                                                <div className="ew-sub dark:text-emerald-400/60 text-[0.78rem]">{(typeFilter !== 'all' || fromFilter) ? 'Try adjusting your filters.' : 'Make your first deposit to get started.'}</div>
                                                {(typeFilter !== 'all' || fromFilter) ? (
                                                    <button onClick={handleClearFilters} className="btn-deposit dark:border-emerald-700">
                                                        <i className="bi bi-x-circle-fill"></i> Clear Filters
                                                    </button>
                                                ) : (
                                                    <Link href="/member/mpesa" className="btn-deposit dark:border-emerald-700">
                                                        <i className="bi bi-plus-circle-fill"></i> Make a Deposit
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.total_pages > 1 && (
                        <div className="lc-footer dark:border-emerald-800/50">
                            <span className="pag-info dark:text-emerald-500/70">
                                Showing {(currentPage-1)*pagination.limit + 1}–{Math.min(currentPage*pagination.limit, pagination.total_rows)} of {pagination.total_rows.toLocaleString()}
                            </span>
                            <div className="pag-btns">
                                <Link 
                                    href={`/member/contributions?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), page: String(currentPage - 1)}).toString()}`}
                                    className={`pag-btn dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 ${currentPage <= 1 ? 'pag-dis' : ''}`}
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </Link>
                                {Array.from({length: Math.min(pagination.total_pages, 5)}, (_, i) => {
                                    let p = currentPage;
                                    if (currentPage < 3) p = 1 + i;
                                    else if (currentPage > pagination.total_pages - 2) p = pagination.total_pages - 4 + i;
                                    else p = currentPage - 2 + i;
                                    p = Math.max(1, Math.min(p, pagination.total_pages));
                                    
                                    // prevent duplicates if < 5 pages
                                    if (i > 0 && p <= (Math.max(1, currentPage - 2) + i - 1)) return null;

                                    return (
                                        <Link 
                                            key={p}
                                            href={`/member/contributions?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), page: String(p)}).toString()}`}
                                            className={`pag-btn dark:border-emerald-800 dark:text-emerald-400 ${currentPage === p ? 'pag-active' : 'dark:bg-emerald-900/20'}`}
                                        >
                                            {p}
                                        </Link>
                                    );
                                })}
                                <Link 
                                    href={`/member/contributions?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), page: String(currentPage + 1)}).toString()}`}
                                    className={`pag-btn dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 ${currentPage >= pagination.total_pages ? 'pag-dis' : ''}`}
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
