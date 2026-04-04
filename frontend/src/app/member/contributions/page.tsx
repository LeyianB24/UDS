"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import './contributions.css';

/* ── helpers ─────────────────────────────────────── */
function ks(n: number): string {
    if (n >= 1_000_000) return 'KES ' + (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000)     return 'KES ' + (n / 1_000).toFixed(1) + 'K';
    return 'KES ' + n.toFixed(2);
}
function fmt(n: number) { return n.toLocaleString('en-KE', { minimumFractionDigits: 2 }); }

function groupByDate(records: any[]) {
    const groups: { dateKey: string; label: string; rows: any[] }[] = [];
    let current: string | null = null;
    const today = new Date().toISOString().slice(0, 10);
    const yest  = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    for (const r of records) {
        const dk = r.created_at.slice(0, 10);
        if (dk !== current) {
            current = dk;
            let label = dk === today ? 'Today' : dk === yest ? 'Yesterday'
                : new Date(dk).toLocaleDateString('en-KE', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
            groups.push({ dateKey: dk, label, rows: [] });
        }
        groups[groups.length - 1].rows.push(r);
    }
    return groups;
}

/* ── types ───────────────────────────────────────── */
interface ContribData {
    stats: {
        grandTotal: number; savingsVal: number; sharesVal: number; welfareVal: number;
        totalCount: number; cntSavings: number; cntShares: number; cntWelfare: number;
        ledgerSavings: number; activeDays: number;
    };
    trend: { labels: string[]; savings: number[]; shares: number[]; welfare: number[] };
    pagination: { page: number; totalRows: number; totalPages: number; perPage: number; offset: number };
    records: any[];
    filters: { type: string; from: string; to: string };
}

/* ── Chart (lazy-loaded after mount) ─────────────── */
function TrendChart({ data }: { data: ContribData['trend'] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef  = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current || !data) return;
        import('chart.js/auto').then(({ default: Chart }) => {
            if (chartRef.current) chartRef.current.destroy();
            chartRef.current = new Chart(canvasRef.current!, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [
                        { label: 'Savings',  data: data.savings,  backgroundColor: 'rgba(22,163,74,.75)',  borderRadius: 6 },
                        { label: 'Shares',   data: data.shares,   backgroundColor: 'rgba(37,99,235,.75)',  borderRadius: 6 },
                        { label: 'Welfare',  data: data.welfare,  backgroundColor: 'rgba(220,38,38,.75)',  borderRadius: 6 },
                    ],
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0b2419', titleColor: '#a3e635', bodyColor: '#fff', padding: 10, cornerRadius: 12, displayColors: true } },
                    scales: {
                        x: { display: true, grid: { display: false }, ticks: { color: '#8fada0', font: { size: 11 } } },
                        y: { display: false },
                    },
                }
            });
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [data]);

    return <canvas ref={canvasRef} />;
}

function RingChart({ savings, shares, welfare, total }: { savings: number; shares: number; welfare: number; total: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef  = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        import('chart.js/auto').then(({ default: Chart }) => {
            if (chartRef.current) chartRef.current.destroy();
            chartRef.current = new Chart(canvasRef.current!, {
                type: 'doughnut',
                data: {
                    labels: ['Savings', 'Shares', 'Welfare'],
                    datasets: [{
                        data: [savings || 0.001, shares || 0.001, welfare || 0.001],
                        backgroundColor: ['#16a34a', '#2563eb', '#dc2626'],
                        borderWidth: 0, hoverOffset: 6,
                    }],
                },
                options: {
                    responsive: false, cutout: '72%',
                    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0b2419', titleColor: '#a3e635', bodyColor: '#fff', padding: 10, cornerRadius: 12 } },
                }
            });
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [savings, shares, welfare]);

    return <canvas ref={canvasRef} width={160} height={160} />;
}

/* ── Progress bar (animates in) ──────────────────── */
function Bar({ pct, color }: { pct: number; color: string }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const t = setTimeout(() => { if (ref.current) ref.current.style.width = pct + '%'; }, 100);
        return () => clearTimeout(t);
    }, [pct]);
    return <div className="sc-bar"><div className="sc-bar-fill" ref={ref} style={{ background: color, width: 0, transition: 'width 1.4s cubic-bezier(.16,1,.3,1)' }}></div></div>;
}

function RbBar({ pct, grad }: { pct: number; grad: string }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const t = setTimeout(() => { if (ref.current) ref.current.style.width = pct + '%'; }, 200);
        return () => clearTimeout(t);
    }, [pct]);
    return <div className="rb-bar-wrap"><div className="rb-bar-fill" ref={ref} style={{ background: grad, width: 0, transition: 'width 1.4s cubic-bezier(.16,1,.3,1)' }}></div></div>;
}

/* ── Main page ───────────────────────────────────── */
export default function ContributionsPage() {
    const router       = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState<ContribData | null>(null);
    const [loading, setLoading] = useState(true);

    // filter state
    const [filterType, setFilterType] = useState(searchParams.get('type') || '');
    const [filterFrom, setFilterFrom] = useState(searchParams.get('from') || '');
    const [filterTo,   setFilterTo]   = useState(searchParams.get('to')   || '');
    const [page, setPage]             = useState(parseInt(searchParams.get('page') || '1'));

    const load = useCallback(async () => {
        setLoading(true);
        const qs = new URLSearchParams({ type: filterType, from: filterFrom, to: filterTo, page: String(page) }).toString();
        try {
            const res  = await fetch(`/api/member/contributions?${qs}`);
            const json = await res.json();
            if (json.status === 'success') setData(json.data);
        } finally {
            setLoading(false);
        }
    }, [filterType, filterFrom, filterTo, page]);

    useEffect(() => { load(); }, [load]);

    const applyFilter = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };
    const clearFilter = () => { setFilterType(''); setFilterFrom(''); setFilterTo(''); setPage(1); };

    if (loading || !data) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-success" role="status"><span className="visually-hidden">Loading...</span></div>
            </div>
        );
    }

    const { stats, trend, pagination, records, filters } = data;
    const safeGT  = stats.grandTotal || 1;
    const sPct    = stats.grandTotal > 0 ? Math.round((stats.sharesVal / safeGT) * 100) : 0;
    const wPct    = stats.grandTotal > 0 ? Math.round((stats.welfareVal / safeGT) * 100) : 0;
    const savPct  = stats.grandTotal > 0 ? Math.round((stats.savingsVal / safeGT) * 100) : 0;
    const groups  = groupByDate(records);

    const tabs = [
        { val: '',        lbl: 'All',     cls: 'all',     cnt: stats.totalCount },
        { val: 'savings', lbl: 'Savings', cls: 'savings', cnt: stats.cntSavings },
        { val: 'shares',  lbl: 'Shares',  cls: 'shares',  cnt: stats.cntShares  },
        { val: 'welfare', lbl: 'Welfare', cls: 'welfare', cnt: stats.cntWelfare },
    ];

    return (
        <div className="dash">

            {/* ══ HERO ══ */}
            <div className="hero">
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
                    <div className="hero-ctas no-print">
                        <div className="dropdown">
                            <button className="btn-ghost dropdown-toggle" data-bs-toggle="dropdown">
                                <i className="bi bi-cloud-download-fill"></i> Export
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end exp-dd mt-2">
                                <li><a className="dd-item" href="#"><div className="dd-ic" style={{ background: 'rgba(220,38,38,.09)', color: '#dc2626' }}><i className="bi bi-file-pdf-fill"></i></div> Export PDF</a></li>
                                <li><a className="dd-item" href="#"><div className="dd-ic" style={{ background: 'rgba(5,150,105,.09)', color: '#059669' }}><i className="bi bi-file-earmark-spreadsheet-fill"></i></div> Export Excel</a></li>
                                <li><a className="dd-item" href="#" target="_blank"><div className="dd-ic" style={{ background: 'rgba(99,102,241,.09)', color: '#6366f1' }}><i className="bi bi-printer-fill"></i></div> Print Statement</a></li>
                            </ul>
                        </div>
                        <Link href="/member/mpesa_request" className="btn-lime">
                            <i className="bi bi-plus-circle-fill"></i> New Deposit
                        </Link>
                    </div>
                </div>

                {/* Stat band */}
                <div className="hero-band">
                    <div className="hb-cell">
                        <div className="hbc-eyebrow">
                            <div className="hbc-ico" style={{ background: 'rgba(163,230,53,.15)', color: '#a3e635' }}><i className="bi bi-layers-fill"></i></div>
                            Portfolio Total
                        </div>
                        <div className="hbc-val">{ks(stats.grandTotal)}</div>
                        <div className="hbc-meta">{stats.totalCount.toLocaleString()} transactions <span className="hbc-pill">All time</span></div>
                    </div>
                    <div className="hb-cell">
                        <div className="hbc-eyebrow">
                            <div className="hbc-ico" style={{ background: 'rgba(163,230,53,.15)', color: '#a3e635' }}><i className="bi bi-piggy-bank-fill"></i></div>
                            Savings
                        </div>
                        <div className="hbc-val">{ks(stats.savingsVal)}</div>
                        <div className="hbc-meta">{stats.cntSavings} deposits <span className="hbc-pill">{savPct}%</span></div>
                    </div>
                    <div className="hb-cell">
                        <div className="hbc-eyebrow">
                            <div className="hbc-ico" style={{ background: 'rgba(163,230,53,.15)', color: '#a3e635' }}><i className="bi bi-pie-chart-fill"></i></div>
                            Shares Capital
                        </div>
                        <div className="hbc-val">{ks(stats.sharesVal)}</div>
                        <div className="hbc-meta">{stats.cntShares} deposits <span className="hbc-pill">{sPct}%</span></div>
                    </div>
                    <div className="hb-cell">
                        <div className="hbc-eyebrow">
                            <div className="hbc-ico" style={{ background: 'rgba(163,230,53,.15)', color: '#a3e635' }}><i className="bi bi-heart-pulse-fill"></i></div>
                            Welfare Fund
                        </div>
                        <div className="hbc-val">{ks(stats.welfareVal)}</div>
                        <div className="hbc-meta">{stats.activeDays} active days <span className="hbc-pill">30d</span></div>
                    </div>
                </div>
            </div>

            {/* ══ FLOATING STAT CARDS ══ */}
            <div className="stats-float">
                <div className="row g-3">
                    <div className="col-md-3 sa1">
                        <div className="sc sc-g">
                            <div className="sc-ico" style={{ background: 'rgba(22,163,74,.08)', color: '#16a34a' }}><i className="bi bi-piggy-bank-fill"></i></div>
                            <div className="sc-lbl">Savings Balance</div>
                            <div className="sc-val">{ks(stats.ledgerSavings)}</div>
                            <Bar pct={100} color="var(--grn, #16a34a)" />
                            <div className="sc-meta">{stats.cntSavings} deposits · Ledger balance</div>
                        </div>
                    </div>
                    <div className="col-md-3 sa2">
                        <div className="sc sc-b">
                            <div className="sc-ico" style={{ background: 'rgba(37,99,235,.08)', color: '#2563eb' }}><i className="bi bi-pie-chart-fill"></i></div>
                            <div className="sc-lbl">Shares Capital</div>
                            <div className="sc-val">{ks(stats.sharesVal)}</div>
                            <Bar pct={sPct} color="#2563eb" />
                            <div className="sc-meta">{sPct}% of total portfolio</div>
                        </div>
                    </div>
                    <div className="col-md-3 sa3">
                        <div className="sc sc-r">
                            <div className="sc-ico" style={{ background: 'rgba(220,38,38,.08)', color: '#dc2626' }}><i className="bi bi-heart-pulse-fill"></i></div>
                            <div className="sc-lbl">Welfare Fund</div>
                            <div className="sc-val">{ks(stats.welfareVal)}</div>
                            <Bar pct={wPct} color="#dc2626" />
                            <div className="sc-meta">{wPct}% of total portfolio</div>
                        </div>
                    </div>
                    <div className="col-md-3 sa4">
                        <div className="sc sc-l">
                            <div className="sc-ico" style={{ background: 'rgba(163,230,53,.14)', color: '#6a9a1a' }}><i className="bi bi-calendar-check-fill"></i></div>
                            <div className="sc-lbl">Active Days</div>
                            <div className="sc-val">{stats.activeDays}</div>
                            <Bar pct={Math.min(100, (stats.activeDays / 30) * 100)} color="#a3e635" />
                            <div className="sc-meta">In the last 30 days</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ BODY ══ */}
            <div className="pg-body">

                {/* Dual panel */}
                <div className="dual-panel">
                    {/* Trend chart */}
                    <div className="chart-card">
                        <div className="cc-head">
                            <div>
                                <div className="cc-title">Contribution Trend</div>
                                <div className="cc-sub">Monthly breakdown — last 7 months</div>
                            </div>
                        </div>
                        <div className="leg">
                            <div className="leg-i"><span className="leg-dot" style={{ background: '#16a34a' }}></span>Savings</div>
                            <div className="leg-i"><span className="leg-dot" style={{ background: '#2563eb' }}></span>Shares</div>
                            <div className="leg-i"><span className="leg-dot" style={{ background: '#dc2626' }}></span>Welfare</div>
                        </div>
                        <div className="chart-box" style={{ marginTop: 12 }}>
                            <TrendChart data={trend} />
                        </div>
                    </div>

                    {/* Ring card */}
                    <div className="ring-card">
                        <div className="cc-head">
                            <div>
                                <div className="cc-title">Portfolio Mix</div>
                                <div className="cc-sub">Contribution breakdown</div>
                            </div>
                        </div>
                        <div className="ring-box">
                            <RingChart savings={stats.savingsVal} shares={stats.sharesVal} welfare={stats.welfareVal} total={stats.grandTotal} />
                            <div className="ring-center">
                                <div className="ring-center-val">{ks(stats.grandTotal)}</div>
                                <div className="ring-center-sub">Total</div>
                            </div>
                        </div>
                        <div className="rb-list">
                            {[
                                { name: 'Savings', val: stats.savingsVal, ico: 'bi-piggy-bank-fill', bg: 'rgba(22,163,74,.08)',  col: '#16a34a', grad: 'linear-gradient(90deg,#15803d,#4ade80)',  pct: savPct },
                                { name: 'Shares',  val: stats.sharesVal,  ico: 'bi-pie-chart-fill',  bg: 'rgba(37,99,235,.08)',  col: '#2563eb', grad: 'linear-gradient(90deg,#1d4ed8,#93c5fd)',  pct: sPct },
                                { name: 'Welfare', val: stats.welfareVal, ico: 'bi-heart-pulse-fill', bg: 'rgba(220,38,38,.08)', col: '#dc2626', grad: 'linear-gradient(90deg,#b91c1c,#fca5a5)', pct: wPct },
                            ].map((item) => (
                                <div key={item.name}>
                                    <div className="rb-row">
                                        <div className="rb-left">
                                            <div className="rb-ico" style={{ background: item.bg, color: item.col }}><i className={`bi ${item.ico}`}></i></div>
                                            <span className="rb-name">{item.name}</span>
                                        </div>
                                        <span className="rb-val">{ks(item.val)}</span>
                                    </div>
                                    <RbBar pct={item.pct} grad={item.grad} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Filter Row ── */}
                <div className="filter-row no-print">
                    <div className="type-tabs">
                        {tabs.map((t) => (
                            <div key={t.val} className={`tt-${t.cls}`}>
                                <button
                                    className={`type-tab ${filterType === t.val ? 'act' : ''}`}
                                    onClick={() => { setFilterType(t.val); setPage(1); }}
                                >
                                    {t.lbl} <span className="tc-badge">{t.cnt.toLocaleString()}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <form className="date-form" onSubmit={applyFilter}>
                        <div className="df-grp">
                            <label className="df-lbl">From</label>
                            <input type="date" className="df-ctrl" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
                        </div>
                        <div className="df-grp">
                            <label className="df-lbl">To</label>
                            <input type="date" className="df-ctrl" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
                        </div>
                        <button type="submit" className="btn-filter"><i className="bi bi-funnel"></i> Apply</button>
                        {filterFrom && (
                            <button type="button" className="btn-clear" title="Clear dates" onClick={clearFilter}><i className="bi bi-x-lg"></i></button>
                        )}
                    </form>
                </div>

                {/* Active filter pills */}
                {(filterType || filterFrom) && (
                    <div className="active-filter-pills no-print">
                        <span className="afp-lbl">Filtering:</span>
                        {filterType && <span className="afp-pill"><span>Type:</span> {filterType.charAt(0).toUpperCase() + filterType.slice(1)}</span>}
                        {filterFrom && filterTo && <span className="afp-pill"><span>Date:</span> {filterFrom} → {filterTo}</span>}
                        <button className="afp-clear" onClick={clearFilter}>✕ Clear all</button>
                    </div>
                )}

                {/* ── Ledger Table ── */}
                <div className="ledger-card">
                    <div className="lc-head">
                        <div className="lc-title">Transaction History</div>
                        <div className="lc-meta">
                            <span className="lc-badge"><i className="bi bi-list-ul"></i> {pagination.totalRows.toLocaleString()} records</span>
                            <span className="lc-pg">Page {pagination.page} / {Math.max(1, pagination.totalPages)}</span>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="ct">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: 26, width: '34%' }}>Contribution</th>
                                    <th style={{ width: '14%' }}>Date &amp; Time</th>
                                    <th style={{ width: '20%' }}>Reference</th>
                                    <th style={{ width: '12%' }}>Status</th>
                                    <th style={{ textAlign: 'right', paddingRight: 26, width: '20%' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr><td colSpan={5}>
                                        <div className="empty-well">
                                            <div className="ew-ico"><i className="bi bi-receipt-cutoff"></i></div>
                                            <div className="ew-title">No Contributions Found</div>
                                            <div className="ew-sub">{filterType || filterFrom ? 'Try adjusting your filters.' : 'Make your first deposit to get started.'}</div>
                                            {filterType || filterFrom
                                                ? <button className="btn-deposit" onClick={clearFilter}><i className="bi bi-x-circle-fill"></i> Clear Filters</button>
                                                : <Link href="/member/mpesa_request" className="btn-deposit"><i className="bi bi-plus-circle-fill"></i> Make a Deposit</Link>
                                            }
                                        </div>
                                    </td></tr>
                                ) : groups.map((group) => (
                                    <React.Fragment key={group.dateKey}>
                                        <tr className={`ct-sep ${group.dateKey === new Date().toISOString().slice(0,10) ? 'ct-sep-today' : ''}`}>
                                            <td colSpan={5}>
                                                <div className="ct-sep-inner">
                                                    {group.label}
                                                    {group.dateKey === new Date().toISOString().slice(0, 10) && (
                                                        <span className="ct-today-badge">{new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {group.rows.map((row, ri) => {
                                            const type   = row.contribution_type;
                                            const status = (row.status || 'completed').toLowerCase();
                                            const tcls   = type === 'savings' ? 't-sav' : type === 'shares' ? 't-sha' : type === 'welfare' ? 't-wel' : '';
                                            const icls   = type === 'savings' ? 'ico-sav' : type === 'shares' ? 'ico-sha' : type === 'welfare' ? 'ico-wel' : 'ico-def';
                                            const iname  = type === 'savings' ? 'bi-piggy-bank-fill' : type === 'shares' ? 'bi-pie-chart-fill' : type === 'welfare' ? 'bi-heart-pulse-fill' : 'bi-cash-stack';
                                            const stcls  = ['completed', 'active'].includes(status) ? 'chip-ok' : status === 'pending' ? 'chip-pnd' : 'chip-err';
                                            const dt     = new Date(row.created_at);

                                            return (
                                                <tr key={row.contribution_id ?? ri} className={`ct-row ${tcls}`}>
                                                    <td style={{ paddingLeft: 26 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <div className={`ct-ico ${icls}`}><i className={`bi ${iname}`}></i></div>
                                                            <div>
                                                                <div className="ct-name">{type.replace(/_/g, ' ')}</div>
                                                                <div className="ct-method">
                                                                    <span className="ct-method-dot"></span>
                                                                    {row.payment_method || 'M-Pesa'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ct-date">{dt.toLocaleDateString('en-KE', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                                                        <div className="ct-time">{dt.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </td>
                                                    <td><span className="ct-ref">{row.reference_no || '—'}</span></td>
                                                    <td><span className={`sc-chip ${stcls}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                                                    <td style={{ textAlign: 'right', paddingRight: 26 }}>
                                                        <div className="ct-amount">+ KES {fmt(parseFloat(row.amount))}</div>
                                                        <div className="ct-amount-sub">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="lc-footer no-print">
                            <span className="pag-info">
                                Showing {pagination.offset + 1}–{Math.min(pagination.offset + pagination.perPage, pagination.totalRows)} of {pagination.totalRows.toLocaleString()}
                            </span>
                            <div className="pag-btns">
                                <button className={`pag-btn ${page <= 1 ? 'pag-dis' : ''}`} onClick={() => setPage(p => Math.max(1, p - 1))}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const start = Math.max(1, page - 2);
                                    const p = start + i;
                                    if (p > pagination.totalPages) return null;
                                    return (
                                        <button key={p} className={`pag-btn ${page === p ? 'pag-active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                                    );
                                })}
                                <button className={`pag-btn ${page >= pagination.totalPages ? 'pag-dis' : ''}`} onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>{/* /pg-body */}
        </div>
    );
}
