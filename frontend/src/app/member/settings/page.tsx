"use client";

import React, { useState } from 'react';
import { 
  Settings, 
  Lock, 
  Bell, 
  Shield, 
  Smartphone, 
  ChevronRight, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SettingsPage() {
  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await apiFetch('/api/v1/member_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          old_password: form.old_password,
          new_password: form.new_password
        })
      });
      setMsg({ type: 'success', text: res.message });
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-20 mt-8">
      
      {/* Header Area */}
      <div className="mb-12">
         <Link href="/member/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0b2419] transition-all mb-4">
            <ArrowLeft size={12} /> Dashboard
         </Link>
         <h1 className="text-4xl font-black tracking-tighter text-[#0b2419] flex items-center gap-4">
            Account Settings
         </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Left Side: Layout Navigation/Info */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-emerald-900/5 rounded-[32px] p-8 shadow-sm">
               <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-4 bg-emerald-50 text-emerald-900 rounded-2xl group transition-all">
                     <div className="flex items-center gap-3">
                        <Lock size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Security</span>
                     </div>
                     <ChevronRight size={14} className="opacity-40" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-slate-400 rounded-2xl group transition-all">
                     <div className="flex items-center gap-3">
                        <Bell size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Notifs</span>
                     </div>
                     <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-slate-400 rounded-2xl group transition-all">
                     <div className="flex items-center gap-3">
                        <Shield size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Privacy</span>
                     </div>
                     <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                  </button>
               </div>
            </div>

            <div className="bg-[#0b2419] rounded-[32px] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10 text-center">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-lime-400 group-hover:scale-110 transition-all">
                      <ShieldCheck size={32} />
                   </div>
                   <h4 className="text-sm font-black tracking-tight mb-2">Vault Protection</h4>
                   <p className="text-white/40 text-[10px] font-medium leading-relaxed mb-6">Your security is our priority. We use military-grade encryption to protect your data.</p>
                   <Link href="/member/support" className="inline-flex items-center gap-2 text-xs font-black text-lime-400 hover:text-white transition-colors">
                      Learn More <ChevronRight size={14} />
                   </Link>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(163,230,53,0.1),transparent)]" />
            </div>
         </div>

         {/* Right Side: Security Forms */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Password Change Section */}
            <div className="bg-white border border-emerald-900/5 rounded-[40px] p-10 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-950 opacity-[0.02] rounded-bl-full" />
               
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-[#0b2419] text-white rounded-2xl flex items-center justify-center">
                     <Lock size={20} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-[#0b2419] tracking-tight">Security Credentials</h3>
                     <p className="text-slate-400 text-xs font-medium">Reset your account access passphrase.</p>
                  </div>
               </div>

               <form onSubmit={handlePasswordChange} className="space-y-6">
                  {msg.text && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 border",
                        msg.type === 'success' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                      )}
                    >
                       {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                       <span className="text-xs font-black uppercase tracking-widest">{msg.text}</span>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">Current Password</label>
                        <div className="relative group">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                           <input 
                             type={showOld ? 'text' : 'password'} 
                             title="Current Password"
                             className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-12 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                             value={form.old_password}
                             onChange={e => setForm({...form, old_password: e.target.value})}
                             placeholder="••••••••••••"
                             required
                           />
                           <button 
                             type="button" 
                             onClick={() => setShowOld(!showOld)}
                             title="Toggle Visibility"
                             className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0b2419] transition-colors"
                           >
                             {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                           </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div>
                           <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">New Password</label>
                           <div className="relative group">
                              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                              <input 
                                type={showNew ? 'text' : 'password'} 
                                title="New Password"
                                className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-12 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                value={form.new_password}
                                onChange={e => setForm({...form, new_password: e.target.value})}
                                placeholder="••••••••••••"
                                required
                              />
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-3 block pl-2">Confirm New</label>
                           <div className="relative group">
                              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                              <input 
                                type={showNew ? 'text' : 'password'} 
                                title="Confirm Password"
                                className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                value={form.confirm_password}
                                onChange={e => setForm({...form, confirm_password: e.target.value})}
                                placeholder="••••••••••••"
                                required
                              />
                              <button 
                                type="button" 
                                onClick={() => setShowNew(!showNew)}
                                title="Toggle Visibility"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0b2419] transition-colors"
                              >
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-6">
                     <button 
                       type="submit" 
                       disabled={loading}
                       className="w-full h-14 bg-[#0b2419] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                     >
                        {loading ? 'Updating Credentials...' : (
                          <>Update Credentials <Save size={18} className="text-lime-400" /></>
                        )}
                     </button>
                  </div>
               </form>
            </div>

            {/* Notification Prefs Section */}
            <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-10">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-white text-[#0b2419] border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                     <Bell size={20} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-[#0b2419] tracking-tight">Notification Channels</h3>
                     <p className="text-slate-400 text-xs font-medium">Control how we communicate with you.</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                           <Mail size={18} />
                        </div>
                        <div>
                           <h5 className="text-[11px] font-black text-[#0b2419] uppercase tracking-widest">Email Alerts</h5>
                           <p className="text-[10px] font-medium text-slate-400 mt-0.5 tracking-tight">Monthly statements and security alerts.</p>
                        </div>
                     </div>
                     <div className="w-12 h-6 bg-lime-400 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-[#0b2419] rounded-full shadow-sm" />
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between opacity-50 cursor-not-allowed">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                           <Smartphone size={18} />
                        </div>
                        <div>
                           <h5 className="text-[11px] font-black text-[#0b2419] uppercase tracking-widest">SMS Gateway</h5>
                           <p className="text-[10px] font-medium text-slate-400 mt-0.5 tracking-tight">Real-time credit/debit notifications.</p>
                        </div>
                     </div>
                     <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>

    </div>
  );
}
