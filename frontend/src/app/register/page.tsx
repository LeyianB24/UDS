"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Users,
  Smartphone,
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: '',
    national_id: '',
    phone: '',
    email: '',
    gender: 'male',
    dob: '',
    occupation: '',
    address: '',
    nok_name: '',
    nok_phone: '',
    password: '',
    confirm_password: ''
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    passport_photo: null,
    national_id_front: null,
    national_id_back: null
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const nextStep = () => {
    if (step === 1) {
       if (!form.full_name || !form.national_id || !form.phone || !form.email) {
          setError('Please fill in all primary identity fields.');
          return;
       }
    }
    setError('');
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
       setError('Passwords do not match.');
       return;
    }
    
    setLoading(true);
    setError('');

    // Prepare Multipart Form Data
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    Object.entries(files).forEach(([k, v]) => {
       if (v) formData.append(k, v);
    });

    try {
      // Use standard fetch here since fetchApi might be tuned for JSON
      const response = await fetch('/api/v1/routes.php?endpoint=register', {
        method: 'POST',
        body: formData
      });
      const res = await response.json();

      if (res.status === 'success') {
         router.push('/member/pay-registration');
      } else {
         setError(res.message || 'Registration failed.');
      }
    } catch (err: unknown) {
      setError('Connection error. Please check your network.');
    }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0b2419] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.05),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.05),transparent_40%)]" />

      <div className="w-full max-w-5xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10">
         
         {/* Left Side: Steps Indicator */}
         <div className="w-full md:w-80 bg-[#0b2419] p-12 text-white relative flex flex-col">
            <div className="mb-12">
               <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center mb-6 text-[#0b2419]">
                  <ShieldCheck size={28} />
               </div>
               <h2 className="text-3xl font-black tracking-tighter mb-2">Join Sacco</h2>
               <p className="text-white/40 text-[11px] font-black uppercase tracking-[2px]">Membership Onboarding</p>
            </div>

            <div className="space-y-8 flex-1">
               {[
                 { step: 1, name: 'Identity', icon: User, sub: 'Personal records' },
                 { step: 2, name: 'Solidarity', icon: Users, sub: 'Next of kin' },
                 { step: 3, name: 'Security', icon: Lock, sub: 'Access control' },
                 { step: 4, name: 'KYC Vault', icon: Fingerprint, sub: 'Document verify' }
               ].map((s, idx) => (
                 <div key={idx} className={cn(
                   "flex items-center gap-4 transition-all duration-500",
                   step === s.step ? "opacity-100 translate-x-2" : "opacity-30"
                 )}>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all",
                      step >= s.step ? "bg-lime-400 border-lime-400 text-[#0b2419]" : "border-white/10 text-white"
                    )}>
                       {step > s.step ? <CheckCircle2 size={18} /> : <s.icon size={18} />}
                    </div>
                    <div>
                       <h4 className="text-xs font-black uppercase tracking-widest">{s.name}</h4>
                       <p className="text-[10px] font-bold text-white/40 tracking-tight">{s.sub}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="pt-12 mt-auto border-t border-white/10">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/20">&copy; 2026 Sacco Central</p>
            </div>
         </div>

         {/* Right Side: Form Area */}
         <div className="flex-1 p-10 md:p-16">
            <div className="max-w-xl mx-auto">
               
               {error && (
                 <motion.div 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
                 >
                    <AlertCircle size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{error}</span>
                 </motion.div>
               )}

               <form onSubmit={handleRegister}>
                  <AnimatePresence mode="wait">
                    
                    {/* Step 1: Identity */}
                    {step === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                         <div className="mb-10">
                            <h3 className="text-2xl font-black text-[#0b2419] tracking-tighter mb-1">Identity Verification</h3>
                            <p className="text-slate-400 text-xs font-medium">Please provide your official details as per National ID.</p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                               <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">Full Name</label>
                               <div className="relative group">
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                  <input 
                                    type="text" 
                                    title="Full Name"
                                    className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                    value={form.full_name}
                                    onChange={e => setForm({...form, full_name: e.target.value})}
                                    placeholder="Enter your full legal name"
                                  />
                               </div>
                            </div>
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">National ID</label>
                               <div className="relative group">
                                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                  <input 
                                    type="text" 
                                    title="ID Number"
                                    className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                    value={form.national_id}
                                    onChange={e => setForm({...form, national_id: e.target.value})}
                                    placeholder="ID Number"
                                  />
                               </div>
                            </div>
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">Mobile Phone</label>
                               <div className="relative group">
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                  <input 
                                    type="text" 
                                    title="Phone Number"
                                    className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                    value={form.phone}
                                    onChange={e => setForm({...form, phone: e.target.value})}
                                    placeholder="07xxxxxxxx"
                                  />
                               </div>
                            </div>
                            <div className="md:col-span-2">
                               <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">Email Address</label>
                               <div className="relative group">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                  <input 
                                    type="email" 
                                    title="Email Address"
                                    className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                    value={form.email}
                                    onChange={e => setForm({...form, email: e.target.value})}
                                    placeholder="your@email.com"
                                  />
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {/* Step 2: Next of Kin */}
                    {step === 2 && (
                       <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                       >
                         <div className="mb-10">
                            <h3 className="text-2xl font-black text-[#0b2419] tracking-tighter mb-1">Solidarity & Kinship</h3>
                            <p className="text-slate-400 text-xs font-medium">Designate your legal beneficiary for your cooperative interest.</p>
                         </div>
                         <div className="space-y-6">
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">Kin Full Name</label>
                               <div className="relative group">
                                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                  <input 
                                    type="text" 
                                    title="Next of Kin Name"
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    value={form.nok_name}
                                    onChange={e => setForm({...form, nok_name: e.target.value})}
                                    placeholder="Full name of next of kin"
                                  />
                               </div>
                            </div>
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">Kin Phone Number</label>
                               <div className="relative group">
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                  <input 
                                    type="text" 
                                    title="Next of Kin Phone"
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    value={form.nok_phone}
                                    onChange={e => setForm({...form, nok_phone: e.target.value})}
                                    placeholder="07xxxxxxxx"
                                  />
                               </div>
                            </div>
                         </div>
                       </motion.div>
                    )}

                    {/* Step 3: Security */}
                    {step === 3 && (
                       <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                       >
                         <div className="mb-10">
                            <h3 className="text-2xl font-black text-[#0b2419] tracking-tighter mb-1">Access Control</h3>
                            <p className="text-slate-400 text-xs font-medium">Protect your account with a high-entropy passphrase.</p>
                         </div>
                         <div className="space-y-6">
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">Account Password</label>
                               <div className="relative group">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                  <input 
                                    type="password" 
                                    title="Account Password"
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                    value={form.password}
                                    onChange={e => setForm({...form, password: e.target.value})}
                                    placeholder="Minimum 6 characters"
                                  />
                               </div>
                            </div>
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">Confirm Passphrase</label>
                               <div className="relative group">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                  <input 
                                    type="password" 
                                    title="Confirm Password"
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                    value={form.confirm_password}
                                    onChange={e => setForm({...form, confirm_password: e.target.value})}
                                    placeholder="Repeat passphrase"
                                  />
                               </div>
                            </div>
                         </div>
                       </motion.div>
                    )}

                    {/* Step 4: KYC Vault */}
                    {step === 4 && (
                       <motion.div 
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                       >
                         <div className="mb-10">
                            <h3 className="text-2xl font-black text-[#0b2419] tracking-tighter mb-1">Identity Assets</h3>
                            <p className="text-slate-400 text-xs font-medium">Upload required documents to satisfy regulatory KYC standards.</p>
                         </div>
                         <div className="grid grid-cols-1 gap-4">
                            {[
                              { key: 'passport_photo', name: 'Passport Photo', icon: Camera },
                              { key: 'national_id_front', name: 'National ID (Front)', icon: Smartphone },
                              { key: 'national_id_back', name: 'National ID (Back)', icon: Smartphone }
                            ].map((doc) => (
                               <div key={doc.key} className="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                                  <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                           <doc.icon size={20} />
                                        </div>
                                        <div>
                                           <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0b2419]">{doc.name}</h4>
                                           <p className="text-[9px] font-bold text-slate-400">{files[doc.key] ? files[doc.key]!.name : 'Maximum 5MB (JPG, PNG)'}</p>
                                        </div>
                                     </div>
                                     <label className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:bg-[#0b2419] hover:text-white transition-all">
                                        {files[doc.key] ? 'Replace' : 'Upload'} <Upload size={14} />
                                        <input type="file" title={doc.name} className="hidden" accept="image/*" onChange={e => handleFileChange(e, doc.key)} />
                                     </label>
                                  </div>
                               </div>
                            ))}
                         </div>
                       </motion.div>
                    )}

                  </AnimatePresence>

                  <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-50">
                     {step > 1 ? (
                       <button 
                         type="button" 
                         onClick={prevStep}
                         className="h-12 px-6 text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-[#0b2419] transition-all"
                       >
                          <ChevronLeft size={16} /> Back
                       </button>
                     ) : (
                       <Link href="/login" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0b2419]">Already a member?</Link>
                     )}

                     {step < 4 ? (
                       <button 
                         type="button" 
                         onClick={nextStep}
                         className="h-14 px-10 bg-[#0b2419] text-white rounded-2xl text-[11px] font-black uppercase tracking-[3px] flex items-center gap-2 hover:shadow-xl transition-all active:scale-95"
                       >
                          Proceed <ChevronRight size={18} className="text-lime-400" />
                       </button>
                     ) : (
                       <button 
                         type="submit" 
                         disabled={loading}
                         className="h-14 px-10 bg-lime-400 text-[#0b2419] rounded-2xl text-[11px] font-black uppercase tracking-[3px] flex items-center gap-2 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                       >
                          {loading ? 'Processing...' : (
                            <>Complete Application <ArrowRight size={18} /></>
                          )}
                       </button>
                     )}
                  </div>
               </form>
            </div>
         </div>
      </div>

    </div>
  );
}
