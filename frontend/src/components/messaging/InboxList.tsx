"use client";

import React from 'react';
import { useMessaging } from './MessagingProvider';
import { cn } from '@/lib/utils';
import { Search, User, CheckCheck, Clock, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export function InboxList({ isAdmin = false }: { isAdmin?: boolean }) {
  const { threads, activeThreadId, setActiveThread, loading } = useMessaging();

  if (!isAdmin) {
    return (
      <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-surface)] rounded-t-[32px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--brand-forest)] text-[var(--brand-lime)] rounded-xl flex items-center justify-center shadow-lg">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-tight">Direct Support</h3>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Secure Encryption Active</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] border-r border-[var(--border-color)]">
      <div className="p-8 border-b border-[var(--border-color)]">
        <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tighter mb-6">Inbound Manifest</h3>
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--brand-lime)]" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full h-12 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-12 pr-4 text-[11px] font-black tracking-widest text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-lime)]/20 transition-all uppercase placeholder:text-[var(--text-muted)]/40"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
        {threads.map((t, idx) => (
          <motion.button
            key={t.member_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setActiveThread(t.member_id)}
            className={cn(
              "w-full p-4 rounded-2xl flex items-center gap-4 transition-all group",
              activeThreadId === t.member_id 
                ? "bg-[var(--brand-forest)] shadow-xl shadow-emerald-950/20" 
                : "hover:bg-[var(--bg-primary)]"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-[var(--border-color)]",
              activeThreadId === t.member_id ? "bg-[var(--brand-lime)] text-[var(--brand-forest)] border-none" : "bg-[var(--bg-surface)] text-[var(--text-muted)]"
            )}>
              <User size={22} />
            </div>
            
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "text-[12px] font-black uppercase tracking-tight truncate",
                  activeThreadId === t.member_id ? "text-white" : "text-[var(--text-main)]"
                )}>
                  {t.full_name}
                </span>
                <span className={cn(
                  "text-[9px] font-bold whitespace-nowrap",
                  activeThreadId === t.member_id ? "text-[var(--brand-lime)]/60" : "text-[var(--text-muted)]"
                )}>
                  {new Date(t.last_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={cn(
                "text-[10px] font-medium truncate leading-none",
                activeThreadId === t.member_id ? "text-emerald-100/60" : "text-[var(--text-muted)]"
              )}>
                {t.last_msg || "No messages yet"}
              </p>
            </div>

            {t.unread_count > 0 && (
              <div className="w-5 h-5 bg-[var(--brand-lime)] text-[var(--brand-forest)] rounded-full flex items-center justify-center text-[9px] font-black shadow-lg">
                {t.unread_count}
              </div>
            )}
          </motion.button>
        ))}
        {threads.length === 0 && !loading && (
          <div className="py-10 text-center">
            <Clock size={32} className="mx-auto text-[var(--text-muted)] opacity-20 mb-3" />
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-relaxed">No conversations synchronized.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
      `}</style>
    </div>
  );
}
