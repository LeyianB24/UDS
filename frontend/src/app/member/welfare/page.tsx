"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import './welfare.css';

export default function WelfarePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contributions');
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newCase, setNewCase] = useState({ title: '', description: '', requested_amount: '' });
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    const loadWelfareData = useCallback(async () => {
        try {
            const res = await apiFetch('/api/member/welfare');
            if (res.status === 'success') {
                setData(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadWelfareData();
    }, [loadWelfareData]);

    const handleReportCase = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFlash(null);

        try {
            const res = await apiFetch('/api/member/welfare', {
                method: 'POST',
                body: JSON.stringify({ ...newCase, requested_amount: parseFloat(newCase.requested_amount) })
            });

            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                setShowModal(false);
                setNewCase({ title: '', description: '', requested_amount: '' });
                loadWelfareData();
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !data) return <div className="p-10 text-center">Loading Welfare Hub...</div>;

    const netImpact = data.totalGiven - data.totalReceived;
    const standing = netImpact >= 0 ? 'Contributor' : 'Beneficiary';

    return (
        <div className="dash">
            {/* HERO */}
            <div className="welfare-hero">
                <div className="hero-mesh"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <i className="bi bi-heart-pulse-fill text-lime text-3xl animate-pulse"></i>
                            <div className="text-[10px] font-black text-lime uppercase tracking-widest px-3 py-1 bg-lime/10 border border-lime/20 rounded-full">Solidarity Fund</div>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">Global Welfare Pool</h1>
                        <p className="text-white/40 text-sm font-semibold max-w-md">Community-driven support system for bereavement, health emergencies, and shared prosperity.</p>
                        
                        <div className="hero-stats">
                            <div className="hero-stat-item">
                                <div className="hs-lbl">Current Pool Balance</div>
                                <div className="hs-val">KES {parseFloat(data.poolBalance).toLocaleString()}</div>
                            </div>
                            <div className="hero-stat-item border-lime/20">
                                <div className="hs-lbl">Your Net Standing</div>
                                <div className={`hs-val ${netImpact >= 0 ? 'text-lime' : 'text-red-400'}`}>
                                    {netImpact >= 0 ? '+' : ''}KES {netImpact.toLocaleString()}
                                </div>
                                <div className="text-[10px] font-bold text-white/30 uppercase mt-1 tracking-widest">{standing} Status</div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <Link href="/member/mpesa_request?type=welfare" className="px-8 py-3 bg-lime text-f rounded-full font-black text-sm no-underline transition-all hover:scale-105 hover:shadow-xl hover:shadow-lime/20">
                                <i className="bi bi-heart-fill mr-2"></i> Contribute
                            </Link>
                            <button onClick={() => setShowModal(true)} className="px-8 py-3 bg-white/10 text-white border border-white/10 rounded-full font-black text-sm transition-all hover:bg-white/20">
                                <i className="bi bi-plus-circle mr-2"></i> Report Situation
                            </button>
                        </div>
                    </div>

                    {data.withdrawableBenefit > 0 && (
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md animate-in fade-in slide-in-from-right-4">
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Available Benefit</div>
                            <div className="text-3xl font-black text-lime mb-6">KES {data.withdrawableBenefit.toLocaleString()}</div>
                            <Link href="/member/withdraw?type=welfare" className="w-full py-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-2xl font-black text-xs no-underline flex items-center justify-center border border-red-500/30 transition-all">
                                <i className="bi bi-wallet2 mr-2"></i> Withdraw Benefit
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* FLASH */}
            {flash && (
                <div className={`mb-8 p-4 rounded-2xl flex items-start gap-4 ${flash.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} border border-current/10 animate-in fade-in slide-in-from-top-2`}>
                    <i className={`bi bi-${flash.type === 'ok' ? 'check-circle-fill' : 'exclamation-triangle-fill'} text-xl`}></i>
                    <div className="text-sm font-bold">{flash.msg}</div>
                    <button className="ml-auto text-xl leading-none" onClick={() => setFlash(null)}>&times;</button>
                </div>
            )}

            {/* CONTENT TABS */}
            <div className="tab-pills mx-auto mb-10">
                <button className={`tab-pill ${activeTab === 'contributions' ? 'active' : ''}`} onClick={() => setActiveTab('contributions')}>Contributions</button>
                <button className={`tab-pill ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}>Community Cases</button>
                <button className={`tab-pill ${activeTab === 'received' ? 'active' : ''}`} onClick={() => setActiveTab('received')}>Support History</button>
                <button className={`tab-pill ${activeTab === 'mycases' ? 'active' : ''}`} onClick={() => setActiveTab('mycases')}>My Submissions</button>
            </div>

            <div className="welfare-card p-1">
                {activeTab === 'contributions' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-bg text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-bdr">
                                <tr>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">Reference</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.allContribs.map((row: any, i: number) => (
                                    <tr key={i} className="border-b border-bdr2 hover:bg-surf2 transition-colors">
                                        <td className="px-8 py-5 font-bold text-sm text-t1">{new Date(row.created_at).toLocaleDateString()}</td>
                                        <td className="px-8 py-5"><span className="text-[10px] font-bold bg-bg border border-bdr px-2 py-1 rounded-md text-fs font-mono">{row.reference_no}</span></td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${row.status === 'completed' || row.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-fs">KES {parseFloat(row.amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {data.allContribs.length === 0 && (
                                    <tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-gray-400 italic">No welfare contributions recorded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'community' && (
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.communityCases.map((crow: any) => {
                            const pct = (parseFloat(crow.total_raised) / parseFloat(crow.requested_amount)) * 100;
                            return (
                                <div key={crow.case_id} className="case-card flex flex-col h-full animate-in zoom-in-95">
                                    <div className="case-card-header mb-4">
                                        <div>
                                            <div className="case-id">Case #{crow.case_id}</div>
                                            <h3 className="case-title">{crow.title}</h3>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${crow.status === 'funded' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-lime text-f border-lime'}`}>
                                            {crow.status}
                                        </span>
                                    </div>
                                    <p className="case-desc flex-1">{crow.description}</p>
                                    <div className="mt-6">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                            <span className="text-fs">KES {parseFloat(crow.total_raised).toLocaleString()} raised</span>
                                            <span className="text-gray-400">Target: {parseFloat(crow.requested_amount).toLocaleString()}</span>
                                        </div>
                                        <div className="case-progress mb-6">
                                            <div className="case-progress-bar shadow-[0_0_12px_rgba(163,230,53,0.5)]" style={{ width: `${Math.min(100, pct)}%` }}></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <i className="bi bi-people-fill text-fs text-sm"></i>
                                                {crow.donor_count} Supporters
                                            </div>
                                            <Link href={`/member/mpesa_request?type=welfare_case&case_id=${crow.case_id}`} className="px-5 py-2.5 bg-lime text-f rounded-full font-black text-[10px] no-underline transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                                                <i className="bi bi-heart-fill mr-1"></i> Support
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {data.communityCases.length === 0 && (
                            <div className="col-span-full py-20 text-center font-bold text-gray-400 italic">No community situations requiring active support.</div>
                        )}
                    </div>
                )}

                {activeTab === 'received' && (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-bg text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-bdr">
                                <tr>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">Situation Reason</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Benefit Received</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.supportHistory.map((row: any, i: number) => (
                                    <tr key={i} className="border-b border-bdr2 hover:bg-surf2 transition-colors">
                                        <td className="px-8 py-5 font-bold text-sm text-t1">{new Date(row.date_granted).toLocaleDateString()}</td>
                                        <td className="px-8 py-5 font-bold text-sm text-t1">{row.reason}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${row.status === 'disbursed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-red-500">− KES {parseFloat(row.amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {data.supportHistory.length === 0 && (
                                    <tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-gray-400 italic">No welfare support has been disbursed to you yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'mycases' && (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-bg text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-bdr">
                                <tr>
                                    <th className="px-8 py-5">Submitted</th>
                                    <th className="px-8 py-5">Title</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Requested</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.myCases.map((row: any, i: number) => (
                                    <tr key={i} className="border-b border-bdr2 hover:bg-surf2 transition-colors">
                                        <td className="px-8 py-5 font-bold text-sm text-t1">{new Date(row.created_at).toLocaleDateString()}</td>
                                        <td className="px-8 py-5 font-bold text-sm text-t1">{row.title}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${row.status === 'approved' || row.status === 'funded' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-t1">KES {parseFloat(row.requested_amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {data.myCases.length === 0 && (
                                    <tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-gray-400 italic">You have not submitted any welfare cases.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-f/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-t1 tracking-tighter">Report Situation</h3>
                                    <p className="text-sm font-semibold text-gray-400">Request welfare support for a specific occurrence.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-bg text-t3 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                                    <i className="bi bi-x-lg text-sm"></i>
                                </button>
                            </div>

                            <form onSubmit={handleReportCase} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Title of Case</label>
                                    <div className="px-5 py-4 bg-bg border border-bdr rounded-2xl flex items-center gap-4 transition-all focus-within:border-fs focus-within:bg-white focus-within:shadow-md">
                                        <i className="bi bi-tag text-t3"></i>
                                        <input 
                                            type="text" className="bg-transparent border-none outline-none font-bold text-t1 w-full" 
                                            placeholder="e.g. Bereavement Support" value={newCase.title} onChange={e => setNewCase({...newCase, title: e.target.value})} required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Detailed Description</label>
                                    <textarea 
                                        className="w-full px-5 py-4 bg-bg border border-bdr rounded-2xl font-bold text-t1 focus:bg-white focus:border-fs focus:shadow-md transition-all outline-none min-h-[100px]"
                                        placeholder="Explain the situation in details..." value={newCase.description} onChange={e => setNewCase({...newCase, description: e.target.value})} required
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Target Amount (KES)</label>
                                    <p className="text-[9px] font-bold text-gray-400 italic mb-2">Amount you are requesting from the community fund pool.</p>
                                    <div className="px-5 py-4 bg-bg border border-bdr rounded-2xl flex items-center gap-4 transition-all focus-within:border-fs focus-within:bg-white focus-within:shadow-md">
                                        <span className="font-black text-fs">KES</span>
                                        <input 
                                            type="number" className="bg-transparent border-none outline-none font-black text-t1 w-full text-xl" 
                                            placeholder="0.00" value={newCase.requested_amount} onChange={e => setNewCase({...newCase, requested_amount: e.target.value})} required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-5 bg-f text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-f/30 flex items-center justify-center gap-3 disabled:opacity-50" disabled={submitting}>
                                    {submitting ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span> : (
                                        <>
                                            <i className="bi bi-send-fill text-lime"></i>
                                            <span>SUBMIT REQUEST</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
