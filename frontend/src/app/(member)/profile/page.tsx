"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  ShieldCheck, 
  Camera, 
  Save, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MemberProfile {
  member_id: number;
  full_name: string;
  email: string;
  phone: string;
  national_id: string;
  member_reg_no: string;
  gender: string;
  dob: string;
  occupation: string;
  address: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  profile_pic: string | null;
  kyc_status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  kyc_notes: string | null;
  join_date: string;
  created_at: string;
}

interface KycDoc {
  id: number;
  document_type: string;
  status: string;
  uploaded_at: string;
}

export default function MemberProfilePage() {
  const [data, setData] = useState<{ profile: MemberProfile; docs: KycDoc[]; is_paid: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: '',
    phone: '',
    address: '',
    occupation: '',
    dob: '',
    nok_name: '',
    nok_phone: '',
    remove_pic: false,
    profile_pic_base64: null as string | null
  });

  const loadData = useCallback(async () => {
    const res = await fetchApi('member_profile');
    if (res.status === 'success') {
      setData(res.data);
      const p = res.data.profile;
      setForm({
        email: p.email || '',
        phone: p.phone || '',
        address: p.address || '',
        occupation: p.occupation || '',
        dob: p.dob || '',
        nok_name: p.next_of_kin_name || '',
        nok_phone: p.next_of_kin_phone || '',
        remove_pic: false,
        profile_pic_base64: null
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetchApi('member_profile', 'POST', {
      action: 'update_profile',
      ...form
    });
    if (res.status === 'success') {
      alert("Profile updated successfully!");
      loadData();
    } else {
      alert(res.message);
    }
    setSaving(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) return alert("File too large (Max 1MB)");
      const reader = new FileReader();
      reader.onload = () => {
        setForm(prev => ({ ...prev, profile_pic_base64: (reader.result as string).split(',')[1], remove_pic: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycUpload = async (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await fetchApi('member_profile', 'POST', {
        action: 'upload_kyc',
        doc_type: type,
        file_base64: base64,
        file_name: file.name
      });
      if (res.status === 'success') {
         alert(res.message);
         loadData();
      } else {
         alert(res.message);
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <div className="w-12 h-12 border-4 border-[#0b2419] border-t-lime-400 rounded-full animate-spin mb-4" />
       <p className="text-[#0b2419]/40 text-[11px] font-black uppercase tracking-[2px]">Securing Session...</p>
    </div>
  );

  const profile = data!.profile;
  const docs = data!.docs;
  const initials = profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const kycStatusConfig = {
    not_submitted: { label: 'KYC Missing', class: 'bg-red-50 text-red-600 border-red-100', icon: ShieldAlert },
    pending: { label: 'Under Review', class: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock },
    approved: { label: 'Verified Member', class: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: ShieldCheck },
    rejected: { label: 'KYC Rejected', class: 'bg-red-50 text-red-600 border-red-100', icon: AlertCircle },
  };

  const status = kycStatusConfig[profile.kyc_status] || kycStatusConfig.not_submitted;

  return (
    <div className="pb-20">
      
      {/* Hero Header */}
      <div className="relative bg-[#0b2419] rounded-[40px] overflow-hidden p-12 md:p-16 pb-28 text-white shadow-[0_20px_60px_rgba(11,36,25,0.2)]">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_105%_-5%,rgba(168,224,99,0.15)_0%,transparent_55%)]" />
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                  <User size={12} className="text-lime-400" /> Account Identity
               </div>
               <h1 className="text-5xl font-black tracking-tighter mb-3">{profile.full_name}</h1>
               <p className="text-white/40 text-sm font-medium">
                  Reg No <span className="text-white/70 font-black">{profile.member_reg_no}</span> 
                  &nbsp;&middot;&nbsp; 
                  Since {new Date(profile.join_date || profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
               </p>
            </div>
            <Link href="/member/dashboard" className="h-12 px-6 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
               <ArrowLeft size={16} /> Dashboard
            </Link>
         </div>
      </div>

      {/* Floating Card */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
         <div className="bg-white border border-emerald-900/5 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8 md:p-12 flex flex-col md:flex-row md:items-end gap-10">
            <div className="relative group flex-shrink-0">
               {form.profile_pic_base64 ? (
                 <img src={`data:image/jpeg;base64,${form.profile_pic_base64}`} alt="Preview" className="w-32 h-32 rounded-[32px] object-cover border-4 border-white shadow-xl" />
               ) : profile.profile_pic ? (
                 <img src={`data:image/jpeg;base64,${profile.profile_pic}`} alt="Profile" className="w-32 h-32 rounded-[32px] object-cover border-4 border-white shadow-xl" />
               ) : (
                 <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-[#0b2419] to-emerald-800 flex items-center justify-center text-white text-4xl font-black border-4 border-white shadow-xl">
                    {initials}
                 </div>
               )}
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0b2419] text-lime-400 rounded-2xl border-4 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg" title="Change Photo">
                     <Camera size={18} />
                     <input type="file" title="Profile Picture" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
            </div>

            <div className="flex-1">
               <h2 className="text-2xl font-black text-[#0b2419] leading-none mb-2">{profile.full_name}</h2>
               <p className="text-slate-400 text-sm font-medium mb-6 uppercase tracking-wider">{profile.email}</p>
               <div className="flex flex-wrap gap-3">
                  <span className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border", status.class)}>
                     <status.icon size={14} />
                     {status.label}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                     <User size={14} /> {profile.gender || 'Unknown'}
                  </span>
                  {!data.is_paid && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                       Fee Unpaid
                    </span>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Form Section */}
         <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSave} className="space-y-8">
               
               {/* Contact Block */}
               <div className="bg-white border border-emerald-900/5 rounded-[32px] p-8 md:p-10 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100%] -mr-16 -mt-16 -z-10" />
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Mail size={18} />
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-[#0b2419] uppercase tracking-widest">Contact Details</h3>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Manage your communication channels</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                           <input 
                             type="email" 
                             className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10"
                             value={form.email}
                             onChange={e => setForm({...form, email: e.target.value})}
                             required
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative group">
                           <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                           <input 
                             type="tel" 
                             className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10"
                             value={form.phone}
                             onChange={e => setForm({...form, phone: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Home Address</label>
                        <div className="relative group">
                           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                           <input 
                             type="text" 
                             className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10"
                             value={form.address}
                             onChange={e => setForm({...form, address: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Occupation</label>
                        <div className="relative group">
                           <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                           <input 
                             type="text" 
                             className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10"
                             value={form.occupation}
                             onChange={e => setForm({...form, occupation: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                        <div className="relative group">
                           <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                           <input 
                             type="date" 
                             className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10"
                             value={form.dob}
                             onChange={e => setForm({...form, dob: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Next of Kin */}
               <div className="bg-white border border-emerald-900/5 rounded-[32px] p-8 md:p-10 shadow-sm">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                        <User size={18} />
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-[#0b2419] uppercase tracking-widest">Next of Kin</h3>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Emergency contact information</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          type="text" 
                          className="w-full h-12 bg-slate-50 border-none rounded-2xl px-6 text-xs font-black focus:ring-2 focus:ring-amber-500/10"
                          value={form.nok_name}
                          onChange={e => setForm({...form, nok_name: e.target.value})}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <input 
                          type="tel" 
                          className="w-full h-12 bg-slate-50 border-none rounded-2xl px-6 text-xs font-black focus:ring-2 focus:ring-amber-500/10"
                          value={form.nok_phone}
                          onChange={e => setForm({...form, nok_phone: e.target.value})}
                        />
                     </div>
                  </div>
               </div>

               <button 
                 type="submit" 
                 disabled={saving}
                 className="w-full h-16 bg-[#0b2419] text-white rounded-3xl text-[11px] font-black uppercase tracking-[2px] hover:shadow-xl hover:shadow-emerald-900/20 transition-all flex items-center justify-center gap-3 active:scale-95"
               >
                  {saving ? "Deploying..." : "Save Account Changes"} <Save size={18} />
               </button>
            </form>
         </div>

         {/* Sidebar Stats & KYC */}
         <div className="space-y-8">
            
            {/* Account Status */}
            <div className="bg-white border border-emerald-900/5 rounded-[32px] p-8 shadow-sm">
               <h3 className="text-[11px] font-black text-[#0b2419] uppercase tracking-wider mb-8">Verification Summary</h3>
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Status</p>
                     <span className={cn("text-[10px] font-black uppercase tracking-widest", profile.kyc_status === 'approved' ? "text-emerald-600" : "text-amber-500")}>
                        {profile.kyc_status}
                     </span>
                  </div>
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Fee</p>
                     <span className={cn("text-[10px] font-black uppercase tracking-widest", data.is_paid ? "text-emerald-600" : "text-red-500")}>
                        {data.is_paid ? "Paid" : "Unpaid"}
                     </span>
                  </div>
                  <div className="h-px bg-slate-50" />
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">National ID</p>
                     <p className="text-xs font-black text-[#0b2419]">{profile.national_id}</p>
                  </div>
               </div>
            </div>

            {/* KYC Uploads */}
            <div className="space-y-4">
               <h3 className="text-[11px] font-black text-[#0b2419] uppercase tracking-wider px-2">Compliance Documents</h3>
               
               {[
                 { id: 'national_id_front', label: 'ID Front' },
                 { id: 'national_id_back', label: 'ID Back' },
                 { id: 'passport_photo', label: 'Passport Photo' }
               ].map((docType) => {
                  const doc = docs.find(d => d.document_type === docType.id);
                  const isVerified = doc?.status === 'verified';
                  
                  return (
                    <div key={docType.id} className="bg-white border border-emerald-900/5 rounded-3xl p-6 shadow-sm group hover:border-emerald-900/10 transition-all">
                       <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-black text-[#0b2419] uppercase tracking-widest">{docType.label}</p>
                          {doc ? (
                            <span className={cn(
                               "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                               isVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            )}>
                               {doc.status}
                            </span>
                          ) : (
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-50 text-slate-300">
                               Missing
                            </span>
                          )}
                       </div>
                       
                       {isVerified ? (
                         <div className="flex items-center gap-3 text-emerald-600">
                            <CheckCircle2 size={16} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Document Verified</p>
                         </div>
                       ) : (
                         <label className="w-full h-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-all text-slate-400 group-hover:text-[#0b2419]">
                            <Upload size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Upload File</span>
                            <input type="file" className="hidden" onChange={(e) => handleKycUpload(docType.id, e)} />
                         </label>
                       )}
                    </div>
                  );
               })}
            </div>

         </div>

      </div>

    </div>
  );
}
