"use client";

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Search, 
  Plus, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  LifeBuoy,
  FileText,
  Phone,
  Mail
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'general', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const res = await apiFetch('/api/v1/member_support.php');
      setTickets(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await apiFetch('/api/v1/member_support.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setMsg({ type: 'success', text: res.message });
      setForm({ subject: '', category: 'general', message: '' });
      setTimeout(() => {
          setShowModal(false);
          loadTickets();
      }, 1500);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><div className="spinner-border text-emerald-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 mt-8">
      
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <Link href="/member/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0b2419] transition-all mb-4">
                <ArrowLeft size={12} /> Dashboard
            </Link>
            <h1 className="text-4xl font-black tracking-tighter text-[#0b2419] flex items-center gap-4">
                Support Center
            </h1>
         </div>
         <button 
           onClick={() => setShowModal(true)}
           className="bg-[#0b2419] text-white h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:shadow-2xl transition-all active:scale-95 shadow-lg shadow-emerald-950/20"
         >
            New Help Request <Plus size={18} className="text-lime-400" />
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         
         {/* Sidebar Stats & Info */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-emerald-900/5 rounded-[32px] p-8 shadow-sm">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Quick Contacts</h4>
               <div className="space-y-4">
                  <div className="flex items-center gap-4 group cursor-pointer">
                     <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Phone size={18} />
                     </div>
                     <div>
                        <div className="text-[10px] font-black text-[#0b2419] uppercase tracking-tight">Call Us</div>
                        <div className="text-[11px] font-bold text-slate-400">+254 700 000 000</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 group cursor-pointer">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Mail size={18} />
                     </div>
                     <div>
                        <div className="text-[10px] font-black text-[#0b2419] uppercase tracking-tight">Email Support</div>
                        <div className="text-[11px] font-bold text-slate-400">help@umojasacco.co.ke</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-[#0b2419] rounded-[32px] p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                   <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-lime-400">
                      <LifeBuoy size={24} />
                   </div>
                   <h4 className="text-sm font-black mb-2 tracking-tight">24/7 Assistance</h4>
                   <p className="text-white/40 text-[10px] font-medium leading-relaxed mb-6">Our dedicated team is always ready to help you navigate your finances.</p>
                   <Link href="/member/messages" className="text-[10px] font-black text-lime-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                       Personal Chat <ChevronRight size={14} />
                   </Link>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 blur-[60px] rounded-full" />
            </div>
         </div>

         {/* Ticket List */}
         <div className="lg:col-span-3">
            <div className="bg-white border border-emerald-900/5 rounded-[40px] shadow-sm overflow-hidden mb-8">
               <div className="p-8 border-b border-emerald-900/5 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-sm font-black text-[#0b2419] uppercase tracking-widest">Your Support History</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-tight">
                     {tickets.length} Active Tickets
                  </div>
               </div>

               {tickets.length === 0 ? (
                  <div className="p-20 text-center text-slate-400">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText size={32} />
                    </div>
                    <h5 className="text-sm font-black text-[#0b2419] mb-1">No Active Tickets</h5>
                    <p className="text-xs font-medium">Any help requests you submit will appear here.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="border-b border-emerald-900/5">
                              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Created</th>
                           </tr>
                        </thead>
                        <tbody>
                           {tickets.map((t, i) => (
                              <tr key={i} className="group hover:bg-slate-50 transition-colors border-b border-emerald-900/[0.03] last:border-0">
                                 <td className="p-8">
                                    <span className="text-[11px] font-black text-[#0b2419] bg-emerald-50 px-2 py-1 rounded-md">{t.ref_no}</span>
                                 </td>
                                 <td className="p-8 min-w-[200px]">
                                    <div className="text-[11px] font-black text-[#0b2419] mb-1">{t.subject}</div>
                                    <div className="text-[10px] font-medium text-slate-400 truncate max-w-[200px]">{t.message}</div>
                                 </td>
                                 <td className="p-8">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.category}</span>
                                 </td>
                                 <td className="p-8">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight",
                                        t.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                    )}>
                                       {t.status === 'open' ? <Clock size={12} /> : <CheckCircle size={12} />}
                                       {t.status}
                                    </div>
                                 </td>
                                 <td className="p-8 text-right">
                                    <div className="text-[10px] font-bold text-slate-400">{new Date(t.created_at).toLocaleDateString()}</div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0b2419]/60 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden relative border border-white/20">
              <div className="p-10 border-b border-emerald-900/5 bg-slate-50 flex items-center justify-between">
                 <div>
                    <h2 className="text-2xl font-black text-[#0b2419] tracking-tighter">Submit Help Desk Ticket</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Expected response within 24 hours.</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-white text-slate-400 flex items-center justify-center transition-all shadow-sm">
                    <Plus size={20} className="rotate-45" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6 bg-white">
                 {msg.text && (
                    <div className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 border",
                        msg.type === 'success' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                    )}>
                       {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                       <span className="text-[11px] font-black uppercase tracking-widest">{msg.text}</span>
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block pl-2">Category</label>
                       <select 
                         title="Category"
                         className="w-full h-14 bg-slate-50 border-none rounded-2xl px-4 text-xs font-black focus:ring-2 focus:ring-emerald-500/10"
                         value={form.category}
                         onChange={e => setForm({...form, category: e.target.value})}
                       >
                          <option value="general">General Inquiry</option>
                          <option value="technical">Technical Issue</option>
                          <option value="billing">Billing/Withdrawal</option>
                          <option value="loans">Loan Issues</option>
                       </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block pl-2">Subject</label>
                        <input 
                          type="text" 
                          className="w-full h-14 bg-slate-50 border-none rounded-2xl px-4 text-xs font-black placeholder:text-slate-200"
                          placeholder="e.g. Loan Withdrawal Delay"
                          required
                          value={form.subject}
                          onChange={e => setForm({...form, subject: e.target.value})}
                        />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block pl-2">Detailed Message</label>
                    <textarea 
                      className="w-full h-40 bg-slate-50 border-none rounded-3xl p-6 text-xs font-black placeholder:text-slate-200 resize-none"
                      placeholder="Please explain your issue in detail..."
                      required
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                    />
                 </div>

                 <div className="pt-4 flex items-center gap-4">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 h-14 bg-[#0b2419] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                       {submitting ? 'Submitting...' : 'Submit Request Ticket'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
