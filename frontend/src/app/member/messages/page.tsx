"use client";

import React from 'react';
import { MessagingProvider } from '@/components/messaging/MessagingProvider';
import { InboxList } from '@/components/messaging/InboxList';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MemberMessagesPage() {
  return (
    <MessagingProvider isAdmin={false}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[calc(100vh-140px)] flex flex-col py-6">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between mb-8"
        >
           <div className="space-y-1">
              <Link href="/member/dashboard" className="group flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[var(--brand-forest)] transition-all">
                  <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
                  <span className="opacity-50 group-hover:opacity-100 italic">Return to</span> Dashboard
              </Link>
              <h1 className="text-4xl font-black tracking-tighter text-[var(--text-main)] flex items-center gap-3">
                 Digital Concierge
                 <span className="w-2 h-2 bg-[var(--brand-lime)] rounded-full animate-pulse mt-3"></span>
              </h1>
           </div>
           <div className="flex gap-3">
              <div className="hidden lg:flex flex-col items-end justify-center px-4 border-r border-[var(--border-color)]">
                  <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Average Response</span>
                  <span className="text-sm font-black text-emerald-500 tracking-tight">&lt; 12 Hours</span>
              </div>
              <button 
                className="bg-[var(--brand-forest)] text-[var(--brand-lime)] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
              >
                 <Plus size={14} /> New Consultation
              </button>
           </div>
        </motion.div>

        {/* Messaging Interface Container */}
        <div className="flex-1 bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-color)] rounded-[40px] shadow-2xl overflow-hidden flex relative">
           {/* In the member view, we might not need the sidebar list if it's just one thread with support, 
               but we'll keep the unified component structure for future expansion (e.g. multiple departments) */}
           <div className="w-full md:w-[320px] lg:w-[380px] hidden md:block">
              <InboxList isAdmin={false} />
           </div>
           
           <div className="flex-1 flex flex-col min-w-0">
              <ChatWindow isAdmin={false} />
           </div>
        </div>

      </div>
    </MessagingProvider>
  );
}
