"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import './savings.css';

export default function MemberSavings() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [typeFilter, setTypeFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        loadData();
    }, [typeFilter, startDate, endDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            let params = new URLSearchParams();
            if (typeFilter) params.append('type', typeFilter);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            
            const res = await fetchApi(`member_savings?${params.toString()}`, 'GET');
            if (res.status === 'success') {
                setData(res.data);
            } else {
                setError('Failed to load savings data');
            }
        } catch (err: any) {
            setError(err.message || 'Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadData();
    };

    const handleExport = (action: string) => {
        // Implement logic or link to API endpoint that generates the export
        const params = new URLSearchParams();
        params.append('action', action);
        if (typeFilter) params.append('type', typeFilter);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        window.open(`http://localhost/UDS/member/pages/savings.php?${params.toString()}`, '_blank');
    };

    const ks = (n: number) => {
        return 'KES ' + Number(n).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    };

    if (loading && !data) return <div className="pg-body"><div className="spinner-border text-emerald-600 m-5"></div></div>;
    if (error) return <div className="pg-body text-red-500 m-5">Error: {error}</div>;
    if (!data) return null;

    const { balances, history, trend } = data;
    const { net_savings, total_deposited, total_withdrawn } = balances;
    
    const retainPct = total_deposited > 0 ? Math.min(100, (net_savings / total_deposited) * 100) : 0;
    const withdrawPct = total_deposited > 0 ? Math.min(100, (total_withdrawn / total_deposited) * 100) : 0;

    // Render Sparkline SVG logic equivalent to PHP
    const SW = 380;
    const SH = 88;
    const PD = 10;
    const N = trend.data.length || 1;
    const maxT = Math.max(...(trend.data.length ? trend.data : [1]), 1);
    
    const pts: string[] = [];
    const ptCoords: {x:number, y:number}[] = [];
    trend.data.forEach((v: number, i: number) => {
        const x = PD + (i / (N - 1 || 1)) * (SW - PD * 2);
        const y = SH - PD - ((v / maxT) * (SH - PD * 2 - 10));
        pts.push(`${x},${y}`);
        ptCoords.push({x, y});
    });
    
    const poly = pts.join(' ');
    const lastPt = ptCoords.length > 0 ? ptCoords[ptCoords.length - 1] : {x: SW, y: SH};

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
                            <div className="hero-eyebrow"><div className="ey-line"></div> Savings Portfolio</div>
                            <div className="hero-lbl">Net Withdrawable Balance</div>
                            <div className="hero-amount"><span className="cur">KES</span><span>{Number(net_savings).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</span></div>
                            <div className="hero-apr-pill"><span className="apr-pulse"></span> Interest-bearing · 2.4% APR</div>
                            <div className="hero-ctas">
                                <Link href="/member/mpesa?type=savings" className="btn-lime">
                                    <i className="bi bi-plus-circle-fill"></i> Add Funds
                                </Link>
                                <Link href="/member/withdraw?type=savings&source=savings" className="btn-ghost">
                                    <i className="bi bi-arrow-up-right-circle"></i> Withdraw
                                </Link>
                            </div>
                        </div>

                        {/* Right: sparkline */}
                        <div className="hidden md:block w-full md:w-1/2 pl-6">
                            <div className="hero-spark">
                                <div className="spark-lbl">6-Month Deposit Trend</div>
                                <svg className="spark-svg" viewBox={`0 0 ${SW} ${SH}`} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#a3e635" stopOpacity=".22"/>
                                            <stop offset="100%" stopColor="#a3e635" stopOpacity="0"/>
                                        </linearGradient>
                                    </defs>
                                    {pts.length > 0 && (
                                        <>
                                            <polygon
                                                points={`${ptCoords[0].x},${SH} ${poly} ${SW - PD},${SH} ${PD},${SH}`}
                                                fill="url(#sg)"
                                            />
                                            <polyline 
                                                points={poly}
                                                fill="none" stroke="#a3e635" strokeWidth="2"
                                                strokeLinecap="round" strokeLinejoin="round"
                                            />
                                            {ptCoords.map((pt, i) => (
                                                <circle key={i} cx={pt.x} cy={pt.y} r="2.5" fill="#0b2419" stroke="#a3e635" strokeWidth="1.5" />
                                            ))}
                                            <circle cx={lastPt.x} cy={lastPt.y} r="4.5" fill="#a3e635" opacity=".9" />
                                            <circle cx={lastPt.x} cy={lastPt.y} r="9" fill="#a3e635" opacity=".1" />
                                        </>
                                    )}
                                    {trend.labels && trend.labels.map((lbl: string, i: number) => {
                                        const mx = PD + (i / (N - 1 || 1)) * (SW - PD * 2);
                                        return (
                                            <text key={i} x={mx} y={SH - 1} textAnchor="middle" className="spark-month-txt">{lbl}</text>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="sa1 h-[142px]">
                        <div className="sc sc-g dark:border-emerald-800">
                            <div className="sc-ico text-green-600 bg-green-600/10"><i className="bi bi-graph-up-arrow"></i></div>
                            <div className="sc-lbl dark:text-emerald-400">Total Deposited</div>
                            <div className="sc-val dark:text-white">{ks(total_deposited)}</div>
                            <div className="sc-bar bg-emerald-900/5 dark:bg-emerald-800/50"><div className="sc-bar-fill bg-green-600" style={{width: '100%'}}></div></div>
                            <div className="sc-meta dark:text-emerald-400/60">Cumulative deposits &amp; contributions</div>
                        </div>
                    </div>
                    <div className="sa2 h-[142px]">
                        <div className="sc sc-r dark:border-emerald-800">
                            <div className="sc-ico text-red-600 bg-red-600/10"><i className="bi bi-arrow-up-right-square-fill"></i></div>
                            <div className="sc-lbl dark:text-emerald-400">Total Withdrawn</div>
                            <div className="sc-val dark:text-white">{ks(total_withdrawn)}</div>
                            <div className="sc-bar bg-emerald-900/5 dark:bg-emerald-800/50"><div className="sc-bar-fill bg-red-600" style={{width: `${Math.round(withdrawPct)}%`}}></div></div>
                            <div className="sc-meta dark:text-emerald-400/60">{Math.round(withdrawPct)}% of deposits withdrawn</div>
                        </div>
                    </div>
                    <div className="sa3 h-[142px]">
                        <div className="sc sc-l dark:border-emerald-800">
                            <div className="sc-ico text-[#6a9a1a] dark:text-lime-400 bg-lime-400/20"><i className="bi bi-shield-fill-check"></i></div>
                            <div className="sc-lbl dark:text-emerald-400">Retention Rate</div>
                            <div className="sc-val dark:text-white">{retainPct.toFixed(1)}%</div>
                            <div className="sc-bar bg-emerald-900/5 dark:bg-emerald-800/50"><div className="sc-bar-fill bg-lime-400" style={{width: `${Math.round(retainPct)}%`}}></div></div>
                            <div className="sc-meta dark:text-emerald-400/60">Net savings vs. total contributed</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body">
                {/* Filter row */}
                <div className="filter-row">
                    <div className="sec-label dark:text-emerald-400/60 after:dark:bg-emerald-800">Transaction History</div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="type-pills dark:bg-emerald-950/40 dark:border-emerald-800">
                            <button onClick={() => setTypeFilter('')} className={`tpill ${typeFilter==='' ? 'bg-[#0b2419] dark:bg-emerald-900 text-white shadow-md' : 'dark:text-emerald-400/60 hover:dark:text-emerald-300'}`}>All</button>
                            <button onClick={() => setTypeFilter('deposit')} className={`tpill ${typeFilter==='deposit' ? 'bg-[#0b2419] dark:bg-emerald-900 text-white shadow-md' : 'dark:text-emerald-400/60 hover:dark:text-emerald-300'}`}>
                                <i className="bi bi-arrow-down-circle text-[0.72rem]"></i> Deposits
                            </button>
                            <button onClick={() => setTypeFilter('withdrawal')} className={`tpill ${typeFilter==='withdrawal' ? 'bg-[#0b2419] dark:bg-emerald-900 text-white shadow-md' : 'dark:text-emerald-400/60 hover:dark:text-emerald-300'}`}>
                                <i className="bi bi-arrow-up-circle text-[0.72rem]"></i> Withdrawals
                            </button>
                        </div>
                        <form onSubmit={handleFilterSubmit}>
                            <div className="date-strip dark:bg-emerald-950/40 dark:border-emerald-800">
                                <i className="bi bi-calendar3 dark:text-emerald-400/60"></i>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="dark:text-emerald-300 dark:[color-scheme:dark]" />
                                <div className="date-div dark:bg-emerald-800"></div>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="dark:text-emerald-300 dark:[color-scheme:dark]" />
                                <button type="submit" className="btn-go"><i className="bi bi-arrow-right"></i></button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Transaction card */}
                <div className="txn-card dark:border-emerald-800 h-auto min-h-[300px]">
                    <div className="txn-card-head dark:bg-emerald-900/10 dark:border-emerald-800/50">
                        <div className="flex items-center gap-3">
                            <span className="txn-card-title dark:text-white">Recent Activity</span>
                            <span className="txn-card-ct dark:bg-emerald-950/40 dark:text-emerald-400/60 dark:border-emerald-800">{history.length} records</span>
                        </div>
                        <div className="relative group">
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
                                <li><hr className="my-1 border-t border-emerald-900/10 dark:border-emerald-800/50 mx-2" /></li>
                                <li>
                                    <button onClick={() => handleExport('print_report')} className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] font-semibold text-emerald-950 dark:text-emerald-100 hover:bg-emerald-50 hover:dark:bg-emerald-900/30 transition-colors">
                                        <div className="w-8 h-8 rounded-md bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0"><i className="bi bi-printer"></i></div>
                                        Print Layout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="txn-list dark:bg-emerald-950/20">
                        {loading ? (
                            <div className="p-8 text-center"><div className="spinner-border text-emerald-600"></div></div>
                        ) : history.length > 0 ? (
                            history.map((row: any, i: number) => {
                                const isIn = ['deposit','contribution','income','savings_deposit'].includes(row.transaction_type.toLowerCase());
                                const icon = isIn ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill';
                                const label = row.transaction_type.replace(/_/g, ' ').replace(/\b\w/g, (l:string) => l.toUpperCase());
                                const note = row.notes || 'Completed Transaction';
                                const sign = isIn ? '+' : '−';
                                const trCls = isIn ? 'tr-in hover:dark:bg-emerald-800/10' : 'tr-out hover:dark:bg-emerald-800/10';
                                const icoCls = isIn ? 'bg-green-600/10 text-green-600' : 'bg-red-600/10 text-red-600';
                                const amtCls = isIn ? 'text-green-600' : 'text-red-600';

                                return (
                                    <div key={i} className={`txn-row ${trCls} dark:border-emerald-800/50`}>
                                        <div className={`txn-ico ${icoCls}`}><i className={`bi ${icon}`}></i></div>
                                        <div className="txn-body">
                                            <div className="txn-name dark:text-white">{label}</div>
                                            <div className="txn-note dark:text-emerald-400/60">{note}</div>
                                        </div>
                                        <div className="txn-chip bg-green-600/10 text-green-600"><div className="chip-dot bg-green-600"></div> Done</div>
                                        <div className="txn-right">
                                            <div className={`txn-amt ${amtCls}`}>{sign} {Number(row.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})} <span className="text-[0.54em] font-bold opacity-40">KES</span></div>
                                            <div className="txn-ts dark:text-emerald-400/60">{new Date(row.created_at).toLocaleString('en-GB', {weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-well">
                                <div className="ew-ico dark:bg-emerald-900/20 dark:border-emerald-800 text-emerald-900/20 dark:text-emerald-800"><i className="bi bi-inbox"></i></div>
                                <div className="ew-title dark:text-white">No Transactions Found</div>
                                <div className="ew-sub dark:text-emerald-400/60">No activity matches your current filter. Try adjusting the date range.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
