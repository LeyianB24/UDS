"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Briefcase, 
    ShieldCheck, 
    Camera, 
    Trash2, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    FileText, 
    UploadCloud, 
    ArrowLeft,
    ChevronRight,
    Lock,
    Users,
    IdCard,
    Zap,
    X
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

export default function ProfilePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
    
    // Form States
    const [form, setForm] = useState({
        email: '',
        phone: '',
        address: '',
        dob: '',
        occupation: '',
        nok_name: '',
        nok_phone: '',
        remove_pic: false
    });
    const [previewPic, setPreviewPic] = useState<string | null>(null);
    const profilePicInput = useRef<HTMLInputElement>(null);

    const loadData = useCallback(async () => {
        try {
            const res = await apiFetch('/api/member/profile');
            if (res.status === 'success') {
                setData(res.data);
                setForm({
                    email: res.data.member.email || '',
                    phone: res.data.member.phone || '',
                    address: res.data.member.address || '',
                    dob: res.data.member.dob ? res.data.member.dob.split('T')[0] : '',
                    occupation: res.data.member.occupation || '',
                    nok_name: res.data.member.next_of_kin_name || '',
                    nok_phone: res.data.member.next_of_kin_phone || '',
                    remove_pic: false
                });
                setPreviewPic(res.data.profile_pic);
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

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewPic(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFlash(null);

        try {
            const formData = new FormData();
            formData.append('action', 'update_profile');
            Object.entries(form).forEach(([key, val]) => formData.append(key, val.toString()));
            
            if (profilePicInput.current?.files?.[0]) {
                formData.append('profile_pic', profilePicInput.current.files[0]);
            }

            const res = await apiFetch('/api/member/profile', {
                method: 'POST',
                body: formData,
                headers: {} 
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

    const uploadKyc = async (e: React.FormEvent, docType: string) => {
        e.preventDefault();
        const formEl = e.currentTarget as HTMLFormElement;
        const fileInput = formEl.querySelector('input[type="file"]') as HTMLInputElement;
        if (!fileInput.files?.[0]) return;

        try {
            const formData = new FormData();
            formData.append('action', 'upload_kyc');
            formData.append('doc_type', docType);
            formData.append('kyc_doc', fileInput.files[0]);

            const res = await apiFetch('/api/member/profile', {
                method: 'POST',
                body: formData
            });

            if (res.status === 'success') {
                setFlash({ type: 'ok', msg: res.message });
                loadData();
            } else {
                setFlash({ type: 'err', msg: res.message });
            }
        } catch (e: any) {
            setFlash({ type: 'err', msg: e.message });
        }
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-[#0b2419]/10 border-t-[#a3e635] rounded-full animate-spin"></div>
            </div>
        );
    }

    const member = data.member;
    const initials = member.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    let statusTheme = 'destructive';
    let accountStatus = 'Incomplete';
    const regFeePaid = member.registration_fee_status === 'paid' || member.reg_fee_paid == 1;

    if (!regFeePaid) { accountStatus = 'Fee Unpaid'; statusTheme = 'red'; }
    else if (member.kyc_status === 'not_submitted') { accountStatus = 'KYC Missing'; statusTheme = 'amber'; }
    else if (member.kyc_status === 'pending') { accountStatus = 'Reviewing'; statusTheme = 'blue'; }
    else if (member.kyc_status === 'approved' && regFeePaid) { accountStatus = 'Verified'; statusTheme = 'emerald'; }
    else if (member.kyc_status === 'rejected') { accountStatus = 'Rejected'; statusTheme = 'red'; }

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="pb-20"
        >
            {/* HERO SECTION */}
            <motion.div variants={floatUp} className="bg-[#0b2419] rounded-b-[48px] relative overflow-hidden text-white mb-20 shadow-2xl">
                {/* Graphics */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_85%_at_108%_-5%,rgba(163,230,53,0.11)_0%,transparent_55%)] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_55%_at_-8%_105%,rgba(163,230,53,0.07)_0%,transparent_55%)] pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-20 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div>
                        <Link href="/member/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-[#a3e635] text-[10px] font-black uppercase tracking-widest transition-colors mb-8">
                            <ArrowLeft size={14} /> Back to Briefing
                        </Link>
                        
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#a3e635]/60 mb-6">
                            <div className="w-6 h-[1.5px] bg-[#a3e635]/40 rounded-full"></div>
                            Secure Member Identity
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4">{member.full_name}</h1>
                        <p className="text-white/40 font-bold tracking-widest text-[11px] uppercase flex items-center gap-2">
                            <span>Reg #{member.member_reg_no}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                            <span>Member Since {new Date(member.join_date || member.created_at).getFullYear()}</span>
                        </p>
                    </div>

                    {/* AVATAR FLOAT IN HERO */}
                    <div className="flex items-center gap-6 bg-white/5 backdrop-blur-xl border border-white/10 p-4 lg:p-6 rounded-[32px] w-full md:w-auto shadow-2xl">
                        <div className="relative group shrink-0">
                            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[28px] overflow-hidden bg-[#a3e635]/10 border-2 border-white/10 shadow-xl flex items-center justify-center">
                                {previewPic ? (
                                    <img src={previewPic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-4xl font-black text-[#a3e635]">{initials}</div>
                                )}
                            </div>
                            <label htmlFor="hero_pic_input" className="absolute -bottom-2 -right-2 bg-[#a3e635] text-[#0b2419] p-2.5 rounded-2xl cursor-pointer shadow-xl hover:scale-110 transition-all border-4 border-[#0b2419]">
                                <Camera size={18} />
                            </label>
                            <input 
                                type="file" id="hero_pic_input" accept="image/*" className="hidden" 
                                ref={profilePicInput} onChange={handlePicChange} 
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                statusTheme === 'emerald' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                statusTheme === 'amber' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                statusTheme === 'blue' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                                <ShieldCheck size={14} />
                                {accountStatus}
                            </div>
                            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/50">
                                {member.gender || 'Unknown'} · {member.occupation || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COL: FORMS */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    {flash && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                                "flex items-center justify-between p-6 rounded-[24px] border",
                                flash.type === 'ok' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                {flash.type === 'ok' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                <div className="text-sm font-bold">{flash.msg}</div>
                            </div>
                            <button onClick={() => setFlash(null)} className="opacity-40 hover:opacity-100">
                                <X size={20} />
                            </button>
                        </motion.div>
                    )}

                    {member.kyc_status === 'not_submitted' && (
                        <motion.div variants={floatUp} className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 flex gap-6 items-center shadow-sm">
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                                <IdCard size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-amber-900 tracking-tight mb-1">Account Restriction Active</h3>
                                <p className="text-sm text-amber-700 font-medium leading-relaxed">
                                    Your account is partially locked. Upload your National ID and Passport photo to verify your identity and unlock full Sacco benefits.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <form onSubmit={handleSave} className="space-y-8">
                        {/* Section: Contact */}
                        <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-10 shadow-sm relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
                                <Zap size={140} />
                            </div>
                            
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-[#a3e635]/15 text-[#0b2419] rounded-2xl flex items-center justify-center border border-[#a3e635]/30">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-[#0b2419] tracking-tight uppercase text-xs">Reach Information</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Updates impact system communication</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Global Email</label>
                                    <div className="relative group">
                                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#a3e635] transition-colors" />
                                        <input 
                                            type="email" name="email" 
                                            className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl pl-14 pr-6 text-sm font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/50 outline-none transition-all"
                                            value={form.email} onChange={handleTextChange} required 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Mobile Interface</label>
                                    <div className="relative group">
                                        <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#a3e635] transition-colors" />
                                        <input 
                                            type="tel" name="phone" 
                                            className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl pl-14 pr-6 text-sm font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/50 outline-none transition-all"
                                            value={form.phone} onChange={handleTextChange} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Birth Declaration</label>
                                    <div className="relative group">
                                        <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                        <input 
                                            type="date" name="dob" 
                                            className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl pl-14 pr-6 text-sm font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/50 outline-none transition-all"
                                            value={form.dob} onChange={handleTextChange} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Primary Occupation</label>
                                    <div className="relative group">
                                        <Briefcase size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#a3e635] transition-colors" />
                                        <input 
                                            type="text" name="occupation" 
                                            className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl pl-14 pr-6 text-sm font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/50 outline-none transition-all"
                                            value={form.occupation} onChange={handleTextChange} placeholder="e.g. Structural Engineer"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Physical Location / Address</label>
                                    <div className="relative group">
                                        <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#a3e635] transition-colors" />
                                        <input 
                                            type="text" name="address" 
                                            className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl pl-14 pr-6 text-sm font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/50 outline-none transition-all"
                                            value={form.address} onChange={handleTextChange} placeholder="Nairobi, Kenya · Upper Hill area"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-10 flex items-center gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setForm(f => ({...f, remove_pic: !f.remove_pic}))}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        form.remove_pic ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    )}
                                >
                                    <Trash2 size={14} />
                                    <span>{form.remove_pic ? "Rollback Removal" : "Remove Avatar"}</span>
                                </button>
                            </div>
                        </motion.div>

                        {/* Section: Next of Kin */}
                        <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-10 shadow-sm">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-[#0b2419] tracking-tight uppercase text-xs">Guardian / Next of Kin</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Emergency contact for legal validation</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Kin Legal Name</label>
                                    <input 
                                        type="text" name="nok_name" 
                                        className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl px-6 text-sm font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/50 outline-none transition-all"
                                        value={form.nok_name} onChange={handleTextChange} placeholder="Enter full name"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Kin Mobile Link</label>
                                    <input 
                                        type="tel" name="nok_phone" 
                                        className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl px-6 text-sm font-black text-[#0b2419] focus:bg-white focus:border-[#a3e635]/50 outline-none transition-all"
                                        value={form.nok_phone} onChange={handleTextChange} placeholder="2547..."
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={floatUp} className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                            <div className="flex items-center gap-3 text-slate-300">
                                <Lock size={14} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">AES-256 Encrypted Sync</span>
                            </div>
                            <button 
                                type="submit" 
                                disabled={saving}
                                className={cn(
                                    "w-full sm:w-auto px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all",
                                    saving ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-[#0b2419] text-[#a3e635] hover:bg-[#154330] hover:scale-105 shadow-2xl shadow-[#0b2419]/20"
                                )}
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Zap size={18} />
                                        Update Manifest
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </form>

                    {/* SECTION: DOCS */}
                    <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[40px] p-8 lg:p-10 shadow-sm mt-12">
                        <div className="flex items-center gap-4 mb-10 text-[#0b2419]">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-black tracking-tight uppercase text-xs">Verification Archives</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Historically submitted documents</p>
                            </div>
                        </div>

                        {data.documents.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                                <FileText size={48} className="mb-4 opacity-50" />
                                <span className="text-[10px] font-black uppercase tracking-widest">No documents identified</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.documents.map((doc: any) => (
                                    <div key={doc.document_id} className="p-5 border border-slate-50 bg-slate-50/30 rounded-2xl flex items-center justify-between group hover:border-[#a3e635]/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#0b2419] transition-colors">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black text-[#0b2419] uppercase tracking-tight truncate max-w-[120px]">
                                                    {doc.document_name || doc.document_type.replace(/_/g, ' ')}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                                                    Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "inline-flex items-center px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                            doc.status === 'verified' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                            doc.status === 'pending' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                            "bg-red-50 text-red-600 border border-red-100"
                                        )}>
                                            {doc.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* RIGHT COL: SIDEBAR INFOS */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* ACC INFO BOX */}
                    <motion.div variants={floatUp} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-[#0b2419] uppercase tracking-wider">Immutable Core</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Managed by Administration</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="group">
                                <label className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-2 px-1">Legal Nomenclature</label>
                                <div className="p-4 bg-slate-100/50 text-[#0b2419]/40 text-xs font-bold rounded-2xl border border-transparent select-none">
                                    {member.full_name}
                                </div>
                            </div>
                            <div className="group">
                                <label className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-2 px-1">ID / Passport Manifest</label>
                                <div className="p-4 bg-slate-100/50 text-[#0b2419]/40 text-xs font-bold rounded-2xl border border-transparent select-none tracking-widest">
                                    {member.national_id || 'NOT LINKED'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-2 px-1">Gender</label>
                                    <div className="p-4 bg-slate-100/50 text-[#0b2419]/40 text-xs font-bold rounded-2xl border border-transparent select-none capitalize">
                                        {member.gender || '—'}
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-2 px-1">Onboarding</label>
                                    <div className="p-4 bg-slate-100/50 text-[#0b2419]/40 text-xs font-bold rounded-2xl border border-transparent select-none">
                                        {new Date(member.join_date || member.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission Fee</span>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    regFeePaid ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                                )}>
                                    {regFeePaid ? 'Cleared' : 'Lapsed'}
                                </div>
                            </div>
                            <div className="text-2xl font-black text-[#0b2419] mb-1">
                                <span className="text-xs mr-1 text-slate-300">KES</span>
                                {regFeePaid ? '1,000.00' : '0.00'}
                            </div>
                            {data.fee_txn && (
                                <div className="text-[9px] font-bold text-slate-400 mt-2 flex items-center gap-2">
                                    <CheckCircle2 size={10} className="text-emerald-500" />
                                    Ref: {data.fee_txn.reference_no}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* KYC UPLOAD PANEL */}
                    <motion.div variants={floatUp} className="bg-[#0b2419] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 -translate-y-4 translate-x-4 pointer-events-none">
                            <UploadCloud size={140} />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-[#a3e635]/10 text-[#a3e635] rounded-2xl flex items-center justify-center ring-1 ring-[#a3e635]/30">
                                <UploadCloud size={20} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider">KYC Terminal</h3>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Live Document submission</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {[
                                { id: 'national_id_front', label: 'ID Manifest (Front)' },
                                { id: 'national_id_back', label: 'ID Manifest (Back)' },
                                { id: 'passport_photo', label: 'Biometric Face Photo' }
                            ].map(req => {
                                const doc = data.documents.find((d: any) => d.document_type === req.id);
                                const isVerified = doc?.status === 'verified';
                                return (
                                    <div key={req.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl group transition-all">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[#a3e635]/70">{req.label}</div>
                                            {isVerified ? (
                                                <div className="text-[#a3e635] bg-[#a3e635]/10 p-1 rounded-lg">
                                                    <ShieldCheck size={14} />
                                                </div>
                                            ) : (
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                                    doc ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/30"
                                                )}>
                                                    {doc ? doc.status : 'Missing'}
                                                </span>
                                            )}
                                        </div>

                                        {isVerified ? (
                                            <div className="text-[10px] font-bold text-white/40 italic">Document verified & archived</div>
                                        ) : (
                                            <form onSubmit={(e) => uploadKyc(e, req.id)} className="flex gap-2">
                                                <div className="relative flex-1 group/file">
                                                    <input 
                                                        type="file" required 
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                        accept="image/*,application/pdf" 
                                                    />
                                                    <div className="w-full py-2 px-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white/40 uppercase tracking-tighter truncate group-hover/file:bg-white/10 transition-all">
                                                        Select File...
                                                    </div>
                                                </div>
                                                <button type="submit" className="w-10 h-10 bg-[#a3e635] text-[#0b2419] rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all outline-none">
                                                    <ArrowRight size={18} />
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
