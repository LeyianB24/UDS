"use client";

import React, { useState, useRef } from 'react';
import { 
  UserPlus, 
  User, 
  CreditCard, 
  Briefcase, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  PhoneCall, 
  Lock, 
  Banknote, 
  FileCheck,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminOnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isPaid, setIsPaid] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const formRef = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
      passport_photo: null,
      national_id_front: null,
      national_id_back: null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
      if (e.target.files && e.target.files[0]) {
          setFiles(prev => ({ ...prev, [fieldName]: e.target.files![0] }));
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(formRef.current!);
    formData.append('is_paid', isPaid.toString());
    formData.append('payment_method', paymentMethod);

    try {
      const response = await fetch('/api/admin/onboarding', {
          method: 'POST',
          body: formData
      });
      const data = await response.json();
      
      if (data.status === 'success') {
          setSuccess(data.message);
          formRef.current?.reset();
          setFiles({ passport_photo: null, national_id_front: null, national_id_back: null });
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          setError(data.message || 'Registration failed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-4">
        <div>
           <div className="flex items-center gap-3 mb-2 leading-none">
              <span className="text-[11px] font-black text-[var(--brand-lime)] bg-[var(--brand-forest)] px-3 py-1 rounded-full uppercase tracking-[2px]">Member Onboarding</span>
              <div className="h-px w-8 bg-[var(--border-color)] opacity-20" />
           </div>
           <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-main)] tracking-tighter leading-tight">
              Register <span className="text-[var(--brand-forest)] underline decoration-[var(--brand-lime)] decoration-8 underline-offset-4">Member.</span>
           </h2>
           <p className="text-sm font-bold text-[var(--text-muted)] mt-4 leading-relaxed uppercase tracking-wider opacity-60">
              Fill in the member's details and collect the mandatory registration fee to activate their account.
           </p>
           <div className="mt-4 inline-flex items-center gap-2 bg-[var(--brand-forest)]/5 text-[var(--brand-forest)] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-[var(--brand-forest)]/10">
              <ShieldCheckIcon /> KES 1,000 Registration Fee Required
           </div>
        </div>
      </div>

      {/* ALERTS */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-start gap-3">
             <CheckCircle className="mt-0.5 shrink-0" size={18} />
             <div className="text-sm font-bold" dangerouslySetInnerHTML={{ __html: success }}></div>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-3">
             <AlertCircle className="mt-0.5 shrink-0" size={18} />
             <div className="text-sm font-bold">{error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEPS INDICATOR */}
      <div className="flex gap-2">
         {['Personal Info', 'Contact & NOK', 'Registration Fee', 'KYC Documents'].map((step, i) => (
             <div key={i} className="flex-1 bg-gray-100/50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-500">{i + 1}</div>
                <span className="text-xs font-black text-gray-600 uppercase tracking-widest hidden sm:block">{step}</span>
             </div>
         ))}
      </div>

      {/* FORM */}
      <form ref={formRef} onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm">
         
         {/* Section 1: Personal */}
         <div className="p-8 lg:p-10 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center shrink-0">
                  <User size={20} />
               </div>
               <div>
                  <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">Personal Information</h4>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Basic identity and demographic details</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input required type="text" name="full_name" placeholder="e.g. Jane Wanjiru Kamau" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all" />
                  </div>
               </div>
               <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">National ID <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input required type="text" name="national_id" placeholder="e.g. 12345678" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all" />
                  </div>
               </div>
               <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Gender</label>
                  <div className="relative">
                     <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <select name="gender" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                     </select>
                  </div>
               </div>
               <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Date of Birth</label>
                  <input type="date" name="dob" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all" />
               </div>
               <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Occupation</label>
                  <div className="relative">
                     <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input type="text" name="occupation" placeholder="e.g. Teacher" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all" />
                  </div>
               </div>
               <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Physical Address</label>
                  <div className="relative">
                     <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input type="text" name="address" placeholder="e.g. Nairobi, Westlands" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all" />
                  </div>
               </div>
            </div>
         </div>

         {/* Section 2: Contact */}
         <div className="p-8 lg:p-10 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center shrink-0">
                  <Phone size={20} />
               </div>
               <div>
                  <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">Contact & Next of Kin</h4>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Communication details and emergency contact</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input required type="tel" name="phone" placeholder="e.g. 0712345678" className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all" />
                  </div>
               </div>
               <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input required type="email" name="email" placeholder="e.g. jane@email.com" className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all" />
                  </div>
               </div>
               <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Next of Kin Name</label>
                  <div className="relative">
                     <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input type="text" name="nok_name" placeholder="Full name" className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all" />
                  </div>
               </div>
               <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Next of Kin Phone</label>
                  <div className="relative">
                     <PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input type="tel" name="nok_phone" placeholder="e.g. 0798765432" className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all" />
                  </div>
               </div>
               <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Temporary Password <span className="opacity-50 font-normal lowercase">(leave blank for default: password123)</span></label>
                  <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input type="password" name="password" placeholder="Leave blank for default" className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all" />
                  </div>
               </div>
            </div>
         </div>

         {/* Section 3: Payment */}
         <div className="p-8 lg:p-10 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
                  <Banknote size={20} />
               </div>
               <div>
                  <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">Registration Fee</h4>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mandatory KES 1,000 enrollment payment</p>
               </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6 flex justify-between items-center">
               <div>
                  <h5 className="text-sm font-black text-gray-900 mb-1">Enrollment Fee Paid</h5>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Toggle off if member will pay later</p>
               </div>
               <div 
                  onClick={() => setIsPaid(!isPaid)}
                  className={cn(
                     "w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 relative",
                     isPaid ? "bg-green-800" : "bg-gray-300"
                  )}
               >
                  <div className={cn(
                     "w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-sm",
                     isPaid ? "translate-x-6" : "translate-x-0"
                  )} />
               </div>
            </div>

            {isPaid && (
               <div className="animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">Payment Method</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                     <label className={cn(
                        "flex-1 flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all",
                        paymentMethod === 'cash' ? "border-green-800 bg-green-50/50" : "border-gray-200 hover:border-gray-300"
                     )}>
                        <input type="radio" name="payment_method" value="cash" className="hidden" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", paymentMethod === 'cash' ? "border-green-800" : "border-gray-300")}>
                           {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 bg-green-800 rounded-full" />}
                        </div>
                        <div>
                           <div className="text-sm font-black text-gray-900">Cash Payment</div>
                           <div className="text-xs font-bold text-gray-500">Collected at office</div>
                        </div>
                     </label>
                     <label className={cn(
                        "flex-1 flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all",
                        paymentMethod === 'mpesa' ? "border-green-800 bg-green-50/50" : "border-gray-200 hover:border-gray-300"
                     )}>
                        <input type="radio" name="payment_method" value="mpesa" className="hidden" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", paymentMethod === 'mpesa' ? "border-green-800" : "border-gray-300")}>
                           {paymentMethod === 'mpesa' && <div className="w-2.5 h-2.5 bg-green-800 rounded-full" />}
                        </div>
                        <div>
                           <div className="text-sm font-black text-gray-900">M-Pesa</div>
                           <div className="text-xs font-bold text-gray-500">Paybill transfer</div>
                        </div>
                     </label>
                  </div>
               </div>
            )}
         </div>

         {/* Section 4: KYC */}
         <div className="p-8 lg:p-10 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center shrink-0">
                  <FileCheck size={20} />
               </div>
               <div>
                  <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">KYC Documents</h4>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Upload identity verification documents (optional)</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                  { id: 'passport_photo', label: 'Passport Photo' },
                  { id: 'national_id_front', label: 'National ID Front' },
                  { id: 'national_id_back', label: 'National ID Back' }
               ].map(field => {
                  const file = files[field.id];
                  return (
                     <div key={field.id} className="relative group">
                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">{field.label}</label>
                        <label className={cn(
                           "flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-colors relative overflow-hidden",
                           file ? "border-green-500 bg-green-50/30" : "border-gray-300 bg-white hover:border-gray-400"
                        )}>
                           <input type="file" name={field.id} className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, field.id)} />
                           {file ? (
                              <div className="text-center p-4">
                                 <CheckCircle className="mx-auto mb-2 text-green-500" size={24} />
                                 <div className="text-xs font-black text-gray-900 truncate max-w-[150px] mx-auto">{file.name}</div>
                                 <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">{(file.size / 1024).toFixed(0)} KB</div>
                              </div>
                           ) : (
                              <div className="text-center p-4">
                                 <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <ImageIcon size={18} />
                                 </div>
                                 <div className="text-xs font-bold text-gray-900">Click to upload</div>
                                 <div className="text-[10px] text-gray-500 mt-1">JPG, PNG up to 5MB</div>
                              </div>
                           )}
                        </label>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Form Actions */}
         <div className="p-8 lg:p-10 bg-gray-50 flex justify-end">
            <button 
               type="submit" 
               disabled={loading}
               className="px-8 py-4 bg-[var(--brand-forest)] text-[var(--brand-lime)] rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-green-900 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/20"
            >
               {loading ? (
                  <><div className="w-4 h-4 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" /> Processing...</>
               ) : (
                  <><UserPlus size={18} /> Register & Finalize Member</>
               )}
            </button>
         </div>

      </form>
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6.5 2a1 1 0 0 1 1 1z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
  );
}
