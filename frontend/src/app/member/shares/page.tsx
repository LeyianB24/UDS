"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { MemberApi, SharesData } from '@/lib/api/member';
import './shares.css';
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
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635]"></div>
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
        <div className="pb-5">
            {/* HERO */}
            <div className="sv-hero">
                <div className="hero-mesh"></div>
                <div className="hero-dots"></div>
                <div className="hero-ring r1"></div>
                <div className="hero-ring r2"></div>

                <div className="hero-inner">
                    <div className="hero-nav">
                        <Link href="/member/dashboard" className="hero-back">
                            <i className="bi bi-arrow-left"></i> Dashboard
                        </Link>
                        <span className="hero-brand-tag">UMOJA SACCO</span>
                    </div>

                    <div className="row align-items-end g-5">
                        <div className="col-lg-6">
                            <div className="hero-eyebrow"><div className="ey-line"></div> Equity Portfolio</div>
                            <div className="hero-lbl">Current Portfolio Value</div>
                            <div className="hero-amount">
                                <span className="cur">KES</span>
                                <span>{data.portfolio_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            
                            <div className="hero-gain positive">
                                <span className="gain-dot"></span>
                                {data.gain_pct >= 0 ? '+' : ''}{data.gain_pct.toFixed(2)}% capital growth
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

                        <div className="col-lg-6 d-none d-lg-block">
                            <div className="hero-chart-wrap">
                                <div className="hero-chart-lbl">Portfolio Growth History</div>
                                <div className="h-[120px] relative">
                                    <Line data={chartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="stats-float">
                <div className="row g-4">
                    <div className="col-md-3 sa1">
                        <div className="sc sc-g bg-white shadow-sm border border-gray-100">
                            <div className="sc-ico bg-green-50 text-green-600">
                                <i className="bi bi-pie-chart-fill"></i>
                            </div>
                            <div className="sc-lbl text-gray-400">Ownership Units</div>
                            <div className="sc-val text-gray-900">{data.units.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            <div className="sc-bar bg-gray-50"><div className="sc-bar-fill bg-green-500" style={{width: '100%'}}></div></div>
                            <div className="sc-meta text-gray-400">{data.ownership_pct.toFixed(4)}% of Sacco equity</div>
                        </div>
                    </div>
                    <div className="col-md-3 sa2">
                        <div className="sc sc-l bg-white shadow-sm border border-gray-100">
                            <div className="sc-ico bg-lime-50 text-lime-600">
                                <i className="bi bi-currency-exchange"></i>
                            </div>
                            <div className="sc-lbl text-gray-400">Share Price</div>
                            <div className="sc-val text-gray-900">KES {data.share_price.toLocaleString()}</div>
                            <div className="sc-bar bg-gray-50"><div className="sc-bar-fill bg-lime-500" style={{width: '100%'}}></div></div>
                            <div className="sc-meta text-gray-400">Current market valuation</div>
                        </div>
                    </div>
                    <div className="col-md-3 sa3">
                        <div className="sc sc-a bg-white shadow-sm border border-gray-100">
                            <div className="sc-ico bg-amber-50 text-amber-600">
                                <i className="bi bi-award-fill"></i>
                            </div>
                            <div className="sc-lbl text-gray-400">Projected Dividend</div>
                            <div className="sc-val text-gray-900">KES {Math.round(data.projected_dividend).toLocaleString()}</div>
                            <div className="sc-bar bg-gray-50"><div className="sc-bar-fill bg-amber-500" style={{width: '50%'}}></div></div>
                            <div className="sc-meta text-gray-400">Est. 12.5% annual return</div>
                        </div>
                    </div>
                    <div className="col-md-3 sa4">
                        <div className="sc sc-b bg-white shadow-sm border border-gray-100">
                            <div className={`sc-ico ${data.gain_pct >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                                <i className="bi bi-graph-up-arrow"></i>
                            </div>
                            <div className="sc-lbl text-gray-400">Capital Gain</div>
                            <div className={`sc-val ${data.gain_pct >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {data.gain_pct >= 0 ? '+' : ''}{data.gain_pct.toFixed(2)}%
                            </div>
                            <div className="sc-bar bg-gray-50">
                                <div 
                                    className={`sc-bar-fill ${data.gain_pct >= 0 ? 'bg-blue-500' : 'bg-red-500'}`} 
                                    style={{ width: `${Math.min(100, Math.abs(data.gain_pct)+20)}%` }}
                                ></div>
                            </div>
                            <div className="sc-meta text-gray-400">Cumulative value growth</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="pg-body">
                <div className="sec-label text-gray-400">
                    <i className="bi bi-stack text-[#a3e635]"></i> Share Transaction History
                </div>

                <div className="txn-card bg-white border border-gray-100 shadow-sm">
                    <div className="txn-card-head border-b border-gray-50">
                        <span className="txn-card-title text-gray-900">Recent Share Purchases</span>
                        <span className="txn-card-ct bg-gray-100 text-gray-600">{data.history.length} records</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="sh-table">
                            <thead>
                                <tr className="bg-gray-50 text-gray-400">
                                    <th className="px-6 py-4">Date</th>
                                    <th>Reference</th>
                                    <th>Units Purchase</th>
                                    <th>Unit Price</th>
                                    <th className="text-right px-6">Total Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.history.map((txn, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="cell-date text-gray-900">{new Date(txn.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            <div className="cell-time text-gray-400">{new Date(txn.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td>
                                            <span className="ref-chip bg-gray-100 text-gray-600 border border-gray-200">{txn.reference_no}</span>
                                        </td>
                                        <td>
                                            <div className="unit-chip text-gray-900">
                                                <div className="unit-pip"><i className="bi bi-layer-forward"></i></div>
                                                <span>{txn.units.toFixed(2)} Units</span>
                                            </div>
                                        </td>
                                        <td className="text-gray-500 text-sm">KES {txn.unit_price.toLocaleString()}</td>
                                        <td className="text-right px-6">
                                            <span className="cell-amt text-gray-900">KES {txn.total_value.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                                {data.history.length === 0 && (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="empty-well text-gray-300">
                                                <div className="ew-ico bg-gray-50"><i className="bi bi-inbox"></i></div>
                                                <div className="ew-title text-gray-400">No share records found</div>
                                                <div className="ew-sub">Your share history will appear here after your first purchase.</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* EDUCATION */}
                <div className="edu-card bg-white border border-gray-100 shadow-sm">
                    <div className="edu-head">
                        <i className="bi bi-info-circle-fill text-[#a3e635]"></i>
                        <span className="edu-title">About SACCO Shares</span>
                    </div>
                    <div className="edu-body text-gray-600">
                        <div className="edu-grid">
                            <div className="edu-item">
                                <div className="edu-ico bg-blue-50 text-blue-600"><i className="bi bi-award"></i></div>
                                <div>
                                    <div className="edu-h text-gray-900">Permanent Capital</div>
                                    <p className="edu-p">Shares represent your permanent ownership in Umoja Drivers Sacco. They are not withdrawable but transferable.</p>
                                </div>
                            </div>
                            <div className="edu-item">
                                <div className="edu-ico bg-green-50 text-green-600"><i className="bi bi-graph-up"></i></div>
                                <div>
                                    <div className="edu-h text-gray-900">Dividends</div>
                                    <p className="edu-p">Earn annual dividends based on Sacco profitability. In 2023, the board declared a 12.5% dividend on shares.</p>
                                </div>
                            </div>
                            <div className="edu-item">
                                <div className="edu-ico bg-amber-50 text-amber-600"><i className="bi bi-shield-check"></i></div>
                                <div>
                                    <div className="edu-h text-gray-900">Voting Rights</div>
                                    <p className="edu-p">Maintaining the minimum share capital grants you full voting rights during the Annual General Meeting (AGM).</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="edu-footer bg-gray-50 border-t border-gray-100 text-gray-400">
                        Minimum core capital required for active membership: <strong>KES 2,000.00</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
