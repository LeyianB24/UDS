"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useMessaging } from './MessagingProvider';
import { cn } from '@/lib/utils';
import { Send, Smile, Paperclip, MoreHorizontal, ShieldCheck, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatWindow({ isAdmin = false }: { isAdmin?: boolean }) {
  const { messages, sendMessage, activeThreadId, loading } = useMessaging();
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(inputMessage, isAdmin ? activeThreadId || undefined : undefined);
    if (success) setInputMessage('');
    setSending(false);
  };

  if (isAdmin && !activeThreadId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[var(--bg-primary)]/30">
        <div className="w-20 h-20 bg-[var(--bg-surface)] text-[var(--text-muted)] opacity-20 rounded-[40px] flex items-center justify-center mb-8 border border-[var(--border-color)]">
          <Send size={40} />
        </div>
        <h4 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-2">No Active Thread Selected</h4>
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest max-w-[240px] text-center leading-relaxed">
          The USMS Messaging Vault identifies zero active introspections for current dispatcher.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-surface)] overflow-hidden">
      {/* Header */}
      <div className="p-6 lg:px-10 border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-1.5 bg-[#D0F764] rounded-full animate-pulse shadow-[0_0_8px_rgba(208,247,100,0.6)]" />
          <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-tight">Active Terminal Control</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Encrypted Thread</span>
          </div>
          <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-2">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 custom-scrollbar bg-[var(--bg-primary)]/30"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isMe = isAdmin ? !!msg.from_admin_id : !!msg.from_member_id;
            return (
              <motion.div
                key={msg.message_id || idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex flex-col max-w-[80%] lg:max-w-[70%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-6 py-4 rounded-[32px] text-sm relative transition-all group",
                  isMe 
                    ? "bg-[var(--brand-forest)] text-white rounded-tr-sm shadow-xl shadow-emerald-950/20" 
                    : "bg-[var(--bg-surface)] text-[var(--text-main)] rounded-tl-sm border border-[var(--border-color)] shadow-sm"
                )}>
                  <p className="font-medium leading-relaxed leading-[1.6]">
                    {msg.body}
                  </p>
                  
                  {/* Micro Metadata */}
                  <div className={cn(
                    "flex items-center gap-2 mt-3 opacity-40 group-hover:opacity-100 transition-opacity",
                    isMe ? "justify-end text-emerald-200" : "justify-start text-[var(--text-muted)]"
                  )}>
                    <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck size={12} className={cn(msg.is_read ? "text-[var(--brand-lime)]" : "text-emerald-100/40")} />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {loading && (
          <div className="flex items-center gap-2 px-10 py-4 opacity-50">
            <div className="w-1.5 h-1.5 bg-[var(--brand-lime)] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-[var(--brand-lime)] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-[var(--brand-lime)] rounded-full animate-bounce" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 lg:p-10 border-t border-[var(--border-color)] bg-[var(--bg-surface)]">
        <form 
          onSubmit={handleSend}
          className="relative flex items-center gap-4 bg-[var(--bg-primary)] p-2 rounded-[32px] border border-[var(--border-color)] focus-within:border-[var(--brand-lime)]/50 focus-within:ring-4 focus-within:ring-[var(--brand-lime)]/10 transition-all"
        >
          <div className="flex items-center gap-2 pl-4 shrink-0">
             <button type="button" className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
               <Smile size={20} />
             </button>
             <button type="button" className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
               <Paperclip size={20} />
             </button>
          </div>
          
          <input 
            type="text" 
            placeholder={isAdmin ? "Type instruction..." : "Type inquiry..."} 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none py-4 text-sm font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40"
          />

          <button 
            type="submit"
            disabled={!inputMessage.trim() || sending}
            className="w-12 h-12 bg-[var(--brand-forest)] text-[var(--brand-lime)] rounded-full flex items-center justify-center shadow-lg shadow-emerald-950/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-[10px] font-black text-center text-[var(--text-muted)]/30 uppercase tracking-[2px] mt-6">
          Transmission Terminal Protocol v4.2 &middot; USMS Golden Ledger Verified
        </p>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
      `}</style>
    </div>
  );
}
