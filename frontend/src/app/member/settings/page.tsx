"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    User, 
    Lock, 
    Mail, 
    Phone, 
    MapPin, 
    Eye, 
    EyeOff, 
    CheckCircle2, 
    AlertTriangle, 
    ArrowLeft,
    ChevronRight,
    Zap,
    X,
    Fingerprint,
    Key,
    IdCard
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

// floatUp animation variant
const floatUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.08
        }
    }
};

export default function SettingsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [saving, setSaving] = useState(false);
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    // Profile Form
    const [profileForm, setProfileForm] = useState({
        email: '',
        phone: '',
        gender: 'male',
        address: ''
    });

    // Security Form
    const [securityForm, setSecurityForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [strength, setStrength] = useState({ pct: '0%', bg: '#e5e7eb', label: '', theme: 'slate' });

    const loadData = useCallback(async () => {
        try {
            const res = await apiFetch('/api/member/settings');
            if (res.status === 'success') {
                setData(res.data);
                setProfileForm({
                    email: res.data.member.email || '',
                    phone: res.data.member.phone || '',
                    gender: res.data.member.gender || 'male',
                    address: res.data.member.address || ''
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const checkStrength = (val: string) => {
        let score = 0;
        if (val.length >= 6) score++;
        if (val.length >= 10) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const map = [
            { pct: '0%', bg: '#e5e7eb', label: 'Start typing...', theme: 'slate' },
            { pct: '25%', bg: '#dc2626', label: 'Weak Protocol', theme: 'red' },
            { pct: '50%', bg: '#d97706', label: 'Developing Strength', theme: 'amber' },
            { pct: '75%', bg: '#2563eb', label: 'Secure Framework', theme: 'blue' },
            { pct: '100%', bg: '#a3e635', label: 'Maximum Encryption', theme: 'emerald' },
        ];
        setStrength(map[Math.min(score, 4)]);
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFlash(null);
        try {
            const res = await apiFetch('/api/member/settings', {
                method: 'POST',
                body: JSON.stringify({ action: 'update_profile', ...profileForm })
            });
            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                loadData();
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        } finally {
            setSaving(false);
        }
    };

    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityForm.new_password !== securityForm.confirm_password) {
            setFlash({ type: 'err', msg: 'New passwords do not match' });
            return;
        }

        setSaving(true);
        setFlash(null);
        try {
            const res = await apiFetch('/api/member/settings', {
                method: 'POST',
                body: JSON.stringify({ action: 'change_password', ...securityForm })
            });
            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                setSecurityForm({ current_password: '', new_password: '', confirm_password: '' });
                setStrength({ pct: '0%', bg: '#e5e7eb', label: '', theme: 'slate' });
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-[#0b2419]/10 border-t-[#a3e635] rounded-full animate-spin"></div>
            </div>
        );
    }

    const { member } = data;
    const initials = member.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="p-6 lg:p-10 max-w-7xl mx-auto"
        >
            {/* Header */}
            <motion.div variants={floatUp} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0b2419] tracking-tight mb-2">Vault & Settings</h1>
                    <p className="text-slate-500 font-medium">Manage your security architecture and personal credentials.</p>
                </div>
                <Link 
                    href="/member/dashboard" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-400 border border-slate-200 rounded-2xl font-bold hover:bg-[#0b2419] hover:text-[#a3e635] transition-all group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Dashboard Brief</span>
                </Link>
            </motion.div>

            {flash && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "flex items-center justify-between p-6 rounded-[24px] border mb-8",
                        flash.type === 'ok' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                    )}
                >
                    <div className="flex items-center gap-4">
                        {flash.type === 'ok' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                        <div className="text-sm font-bold tracking-tight">
                            <span className="font-black uppercase tracking-widest text-[10px] block opacity-40 mb-1">{flash.type === 'ok' ? 'Successful Action' : 'Critical Failure'}</span>
                            {flash.msg}
                        </div>
                    </div>
                    <button onClick={() => setFlash(null)} className="opacity-40 hover:opacity-100 p-2">
                        <X size={20} />
                    </button>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Col: Profile Panel Card */}
                <motion.div variants={floatUp} className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                    <div className="bg-[#0b2419] rounded-[40px] p-8 lg:p-10 relative overflow-hidden text-white shadow-2xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#a3e635] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-28 h-28 bg-[#a3e635]/10 border-2 border-white/10 rounded-[32px] flex items-center justify-center text-4xl font-black text-[#a3e635] shadow-xl mb-6">
                                {initials}
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">{member.full_name}</h2>
                            <p className="text-white/40 font-bold tracking-widest text-[10px] uppercase mt-2 mb-8">{member.email}</p>
                            
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#a3e635]/10 border border-[#a3e635]/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#a3e635]">
                                    <ShieldCheck size={12} />
                                    {member.member_reg_no}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/50">
                                    Verified Member
                                </span>
                            </div>

                            <div className="w-full h-px bg-white/10 my-10" />

                            <div className="w-full space-y-6">
                                <div className="flex justify-between items-center group">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Binary Class</span>
                                    <span className="text-xs font-bold capitalize select-none">{member.gender || 'Not Defined'}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Mobile Link</span>
                                    <span className="text-xs font-bold select-all tracking-wider">{member.phone || '--'}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Registry Since</span>
                                    <span className="text-xs font-bold">{new Date(member.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <Link 
                        href="/member/profile" 
                        className="mt-6 w-full inline-flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[30px] group shadow-sm hover:border-[#a3e635]/30 transition-all active:scale-95"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#a3e635]/15 text-[#0b2419] rounded-xl flex items-center justify-center">
                                <IdCard size={18} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0b2419]">Legal Profile</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Manage KYC & Details</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-200 group-hover:text-[#a3e635] group-hover:translate-x-1 transition-all" />
                    </Link>
                </motion.div>

                {/* Right Col: Settings Interface */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                        
                        {/* Tab Switcher */}
                        <div className="flex p-4 lg:p-6 bg-slate-50/50 border-b border-slate-50 gap-2">
                            <button 
                                onClick={() => setActiveTab('profile')}
                                className={cn(
                                    "flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                                    activeTab === 'profile' ? "bg-[#0b2419] text-[#a3e635] shadow-xl" : "text-slate-400 hover:text-[#0b2419]"
                                )}
                            >
                                <User size={16} />
                                <span>General Protocol</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('security')}
                                className={cn(
                                    "flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                                    activeTab === 'security' ? "bg-[#0b2419] text-[#a3e635] shadow-xl" : "text-slate-400 hover:text-[#0b2419]"
                                )}
                            >
                                <Lock size={16} />
                                <span>Security Core</span>
                            </button>
                        </div>

                        <div className="p-8 lg:p-12 flex-1">
                            <AnimatePresence mode="wait">
                                {activeTab === 'profile' ? (
                                    <motion.div 
                                        key="profile"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-10"
                                    >
                                        <div className="flex items-center gap-4 text-[#0b2419]">
                                            <Fingerprint size={24} className="text-[#a3e635]" />
                                            <div>
                                                <h3 className="text-xl font-black tracking-tight">Identity Revision</h3>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">General system-wide preferences</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleProfileSubmit} className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="md:col-span-2 space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 italic">Registry Designation (Locked)</label>
                                                    <div className="relative group">
                                                        <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-200" />
                                                        <input 
                                                            type="text" 
                                                            className="w-full h-14 bg-slate-50 border border-transparent rounded-[20px] pl-14 pr-6 text-sm font-black text-slate-300 select-none cursor-not-allowed" 
                                                            value={member.full_name} 
                                                            readOnly 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Primary Email</label>
                                                    <div className="relative group">
                                                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#a3e635] transition-colors" />
                                                        <input 
                                                            type="email" 
                                                            className="w-full h-14 bg-slate-50 border border-transparent rounded-[20px] pl-14 pr-6 text-sm font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/30 outline-none transition-all shadow-inner" 
                                                            value={profileForm.email} 
                                                            onChange={e => setProfileForm({...profileForm, email: e.target.value})} 
                                                            required 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Handset Contact</label>
                                                    <div className="relative group">
                                                        <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#a3e635] transition-colors" />
                                                        <input 
                                                            type="tel" 
                                                            className="w-full h-14 bg-slate-50 border border-transparent rounded-[20px] pl-14 pr-6 text-sm font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/30 outline-none transition-all shadow-inner" 
                                                            value={profileForm.phone} 
                                                            onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
                                                            required 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Gender Class</label>
                                                    <select 
                                                        className="w-full h-14 bg-slate-50 border border-transparent rounded-[20px] px-6 text-sm font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/30 outline-none transition-all shadow-inner" 
                                                        value={profileForm.gender} 
                                                        onChange={e => setProfileForm({...profileForm, gender: e.target.value})}
                                                    >
                                                        <option value="male">Male Alpha</option>
                                                        <option value="female">Female Beta</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Primary Residence</label>
                                                    <div className="relative group">
                                                        <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#a3e635] transition-colors" />
                                                        <input 
                                                            type="text" 
                                                            className="w-full h-14 bg-slate-50 border border-transparent rounded-[20px] pl-14 pr-6 text-sm font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/30 outline-none transition-all shadow-inner" 
                                                            value={profileForm.address} 
                                                            onChange={e => setProfileForm({...profileForm, address: e.target.value})} 
                                                            placeholder="Nairobi, Kenya" 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-6">
                                                <button 
                                                    type="submit" 
                                                    disabled={saving}
                                                    className={cn(
                                                        "w-full sm:w-auto px-12 py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all",
                                                        saving ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-[#0b2419] text-[#a3e635] hover:bg-[#154330] hover:scale-105 shadow-2xl shadow-[#0b2419]/20"
                                                    )}
                                                >
                                                    {saving ? (
                                                        <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <>
                                                            <Zap size={18} />
                                                            Apply Manifest
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="security"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-10"
                                    >
                                        <div className="flex items-center gap-4 text-[#0b2419]">
                                            <Key size={24} className="text-[#a3e635]" />
                                            <div>
                                                <h3 className="text-xl font-black tracking-tight">Encryption Keys</h3>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Management of credential architecture</p>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-blue-50 border border-blue-100 rounded-[28px] flex items-start gap-4">
                                            <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-1" />
                                            <p className="text-xs font-medium text-blue-900 leading-relaxed">
                                                Strong passwords utilize a minimum of 10 alphanumeric characters including mixed-case letters and binary symbols. Ensure your session is handled over a secure ISP interface.
                                            </p>
                                        </div>

                                        <form onSubmit={handleSecuritySubmit} className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Active Credentials</label>
                                                <div className="relative group">
                                                    <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    <input 
                                                        type={showPasswords.current ? 'text' : 'password'} 
                                                        className="w-full h-16 bg-slate-50 border border-transparent rounded-[24px] pl-14 pr-16 text-lg font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/30 outline-none transition-all shadow-inner tracking-widest" 
                                                        required 
                                                        value={securityForm.current_password}
                                                        onChange={e => setSecurityForm({...securityForm, current_password: e.target.value})}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#0b2419] transition-colors" 
                                                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                                    >
                                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">New Protocol Key</label>
                                                    <div className="relative group">
                                                        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                        <input 
                                                            type={showPasswords.new ? 'text' : 'password'} 
                                                            className="w-full h-16 bg-slate-50 border border-transparent rounded-[24px] pl-14 pr-16 text-lg font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/30 outline-none transition-all shadow-inner tracking-widest" 
                                                            required 
                                                            value={securityForm.new_password}
                                                            onChange={e => {
                                                                setSecurityForm({...securityForm, new_password: e.target.value});
                                                                checkStrength(e.target.value);
                                                            }}
                                                        />
                                                        <button 
                                                            type="button" 
                                                            className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#0b2419] transition-colors" 
                                                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                                                        >
                                                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Strength Meter */}
                                                    <div className="px-1 pt-2">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Key Integrity</span>
                                                            <span className={cn("text-[9px] font-black uppercase tracking-widest", `text-${strength.theme}-600`)}>{strength.label}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: strength.pct }}
                                                                className={cn("h-full transition-all duration-500", `bg-${strength.theme}-500`)}
                                                                style={{ backgroundColor: strength.bg }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Validate Revision</label>
                                                    <div className="relative group">
                                                        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                        <input 
                                                            type={showPasswords.confirm ? 'text' : 'password'} 
                                                            className="w-full h-16 bg-slate-50 border border-transparent rounded-[24px] pl-14 pr-16 text-lg font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/30 outline-none transition-all shadow-inner tracking-widest" 
                                                            required 
                                                            value={securityForm.confirm_password}
                                                            onChange={e => setSecurityForm({...securityForm, confirm_password: e.target.value})}
                                                        />
                                                        <button 
                                                            type="button" 
                                                            className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#0b2419] transition-colors" 
                                                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                                                        >
                                                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-10">
                                                <button 
                                                    type="submit" 
                                                    disabled={saving}
                                                    className={cn(
                                                        "w-full px-12 py-6 rounded-[28px] font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl",
                                                        saving ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-[#0b2419] text-[#a3e635] shadow-[#0b2419]/30 hover:scale-[1.02] active:scale-[0.98]"
                                                    )}
                                                >
                                                    {saving ? (
                                                        <div className="w-6 h-6 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck size={20} />
                                                            Re-Encrypt Vault
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
