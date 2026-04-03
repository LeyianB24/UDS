'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MemberApi, SavingsData } from '@/lib/api/member';
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

export default function SavingsPage() {
    const [data, setData] = useState<SavingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        MemberApi.getSavings()
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
        labels: data.trend.map(t => t.month),
        datasets: [
            {
                fill: true,
                label: 'Deposits',
                data: data.trend.map(t => t.amount),
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

    const filteredHistory = data.history.filter(txn => {
        if (filter === 'All') return true;
        if (filter === 'Deposits') return ['deposit', 'contribution', 'savings_deposit'].includes(txn.transaction_type);
        if (filter === 'Withdrawals') return ['withdrawal', 'withdrawal_initiate', 'withdrawal_finalize'].includes(txn.transaction_type);
        return true;
    });

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
                            <div className="hero-eyebrow"><div className="ey-line"></div> Savings Portfolio</div>
                            <div className="hero-lbl">Net Withdrawable Balance</div>
                            <div className="hero-amount">
                                <span className="cur">KES</span>
                                <span>{data.net_savings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="hero-apr-pill"><span className="apr-pulse"></span> Interest-bearing · 2.4% APR</div>
                            
                            <div className="mt-4 d-flex gap-2 flex-wrap">
                                <Link href="/member/contribute?type=savings" className="btn-lime">
                                    <i className="bi bi-plus-circle-fill"></i> Add Funds
                                </Link>
                                <Link href="/member/withdraw?type=savings" className="btn-ghost" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <i className="bi bi-arrow-up-right-circle"></i> Withdraw
                                </Link>
                            </div>
                        </div>

                        <div className="col-md-6 d-none d-md-block">
                            <div className="h-[120px] relative">
                                <div className="text-[9px] font-extrabold uppercase tracking-widest text-[#ffffff38] mb-3">6-Month Deposit Trend</div>
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="stats-float">
                <div className="row g-3">
                    <div className="col-md-4">
                        <div className="sc">
                            <div className="sc-ico ico-in">
                                <i className="bi bi-graph-up-arrow"></i>
                            </div>
                            <div className="sc-lbl">Total Deposited</div>
                            <div className="sc-val">KES {data.total_deposited.toLocaleString()}</div>
                            <div className="sc-bar"><div className="sc-bar-fill bg-success w-100"></div></div>
                            <div className="sc-meta">Cumulative deposits & contributions</div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="sc">
                            <div className="sc-ico ico-out">
                                <i className="bi bi-arrow-up-right-square-fill"></i>
                            </div>
                            <div className="sc-lbl">Total Withdrawn</div>
                            <div className="sc-val">KES {data.total_withdrawn.toLocaleString()}</div>
                            <div className="sc-bar">
                                <div 
                                    className="sc-bar-fill bg-danger" 
                                    style={{ width: `${(data.total_withdrawn / data.total_deposited) * 100}%` }}
                                ></div>
                            </div>
                            <div className="sc-meta">{Math.round((data.total_withdrawn / data.total_deposited) * 100)}% of deposits withdrawn</div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="sc">
                            <div className="sc-ico ico-in" style={{ background: 'var(--lg)', color: 'var(--lt)' }}>
                                <i className="bi bi-shield-fill-check"></i>
                            </div>
                            <div className="sc-lbl">Retention Rate</div>
                            <div className="sc-val">{data.retention_rate.toFixed(1)}%</div>
                            <div className="sc-bar">
                                <div 
                                    className="sc-bar-fill" 
                                    style={{ background: 'var(--lime)', width: `${data.retention_rate}%` }}
                                ></div>
                            </div>
                            <div className="sc-meta">Net savings vs. total contributed</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body">
                <div className="filter-row">
                    <div className="sec-label">Transaction History</div>
                    <div className="type-pills">
                        {['All', 'Deposits', 'Withdrawals'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`tpill ${filter === t ? 'active' : ''}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="txn-card">
                    <div className="txn-card-head">
                        <span className="txn-card-title">Recent Activity</span>
                        <span className="txn-card-ct">{filteredHistory.length} records</span>
                    </div>
                    <div>
                        {filteredHistory.map(txn => {
                            const isIn = ['deposit', 'contribution', 'savings_deposit'].includes(txn.transaction_type);
                            return (
                                <div key={txn.id} className="txn-row">
                                    <div className={`trn-dot ${isIn ? 'ico-in' : 'ico-out'}`}>
                                        <i className={`bi ${isIn ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill'}`}></i>
                                    </div>
                                    <div className="txn-body">
                                        <div className="txn-name">{txn.transaction_type.replace(/_/g, ' ').toUpperCase()}</div>
                                        <div className="txn-note">{txn.notes || 'No description'}</div>
                                    </div>
                                    <div className="txn-right">
                                        <div className={`txn-amt ${isIn ? 'amt-in' : 'amt-out'}`}>
                                            {isIn ? '+' : '-'} {txn.amount.toLocaleString()} <span className="opacity-40 text-[0.6em]">KES</span>
                                        </div>
                                        <div className="txn-ts">{new Date(txn.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredHistory.length === 0 && (
                            <div className="p-5 text-center text-muted">
                                <i className="bi bi-inbox fs-1 opacity-25 d-block mb-2"></i>
                                No transactions found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
