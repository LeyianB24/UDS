"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Send, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  Inbox, 
  ArrowLeft,
  Paperclip,
  CheckCheck,
  User,
  Clock
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [body, setBody] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      const res = await apiFetch('/api/member/messages');
      if (res.status === 'success') {
        const msgs = res.data.messages;
        setMessages(msgs);
        if (msgs.length > 0 && !selectedId) {
          setSelectedId(msgs[0].message_id);
        }
      }
    } catch (e) {
      console.error('Failed to load messages:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    // Mark as read when selecting a message that is unread and addressed to me
    const msg = messages.find(m => m.message_id === selectedId);
    if (msg && !msg.is_read && msg.to_member_id) {
       markAsRead(msg.message_id);
    }
  }, [selectedId, messages]);

  const markAsRead = async (id: number) => {
    try {
      await apiFetch('/api/member/messages', {
        method: 'PATCH',
        body: JSON.stringify({ message_id: id })
      });
      // Update local state to reflect read status
      setMessages(prev => prev.map(m => m.message_id === id ? { ...m, is_read: 1 } : m));
    } catch (e) {
      console.error('Failed to mark message as read:', e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || sending) return;

    setSending(true);
    try {
      const res = await apiFetch('/api/member/messages', {
        method: 'POST',
        body: JSON.stringify({ body, subject: 'Follow-up' })
      });
      if (res.status === 'success') {
        setBody('');
        await loadMessages();
      }
    } catch (e) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const selectedMsg = messages.find(m => m.message_id === selectedId);
  const filteredMessages = messages.filter(m => 
    (m.subject?.toLowerCase().includes(search.toLowerCase()) || 
     m.body?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Secure Inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 h-[calc(100vh-140px)] flex flex-col py-6 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-8">
         <div className="space-y-1">
            <Link href="/member/dashboard" className="group flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#0b2419] transition-all">
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="opacity-50 group-hover:opacity-100 italic">Return to</span> Dashboard
            </Link>
            <h1 className="text-4xl font-black tracking-tighter text-[#0b2419] flex items-center gap-3">
               Digital Concierge
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mt-3"></span>
            </h1>
         </div>
         <div className="flex gap-3">
            <div className="hidden lg:flex flex-col items-end justify-center px-4 border-r border-slate-200">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Average Response</span>
                <span className="text-sm font-black text-emerald-600 tracking-tight">&lt; 12 Hours</span>
            </div>
            <Link 
              href="/member/support"
              className="bg-[#0b2419] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_10px_25px_rgba(11,36,25,0.2)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
            >
               <PlusIcon /> New Consultation
            </Link>
         </div>
      </div>

      {/* Main Glass Container */}
      <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(11,36,25,0.1)] overflow-hidden flex relative">
        
        {/* Sidebar */}
        <div className="w-full md:w-[380px] lg:w-[420px] bg-white/40 border-r border-slate-100 flex flex-col">
           <div className="p-8 pb-4">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search secure archives..." 
                   className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl pl-12 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all placeholder:text-slate-300"
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
              {filteredMessages.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Inbox size={24} className="text-slate-200" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 text-center max-w-[160px] mx-auto">Vault is currently empty</p>
                </div>
              ) : (
                filteredMessages.map((m) => {
                  const isUnread = !m.is_read && m.to_member_id;
                  const isActive = selectedId === m.message_id;
                  
                  return (
                    <button 
                      key={m.message_id}
                      onClick={() => setSelectedId(m.message_id)}
                      className={cn(
                          "w-full p-5 rounded-[24px] flex items-start gap-4 transition-all duration-300 text-left border relative",
                          isActive 
                            ? "bg-white border-emerald-900/5 shadow-[0_8px_20px_-4px_rgba(11,36,25,0.08)] z-10 scale-[1.02]" 
                            : "bg-transparent border-transparent hover:bg-slate-50/50"
                      )}
                    >
                      {isUnread && (
                        <div className="absolute top-6 right-6 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      )}
                      
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500",
                        isActive ? "bg-emerald-900 text-lime scale-110 rotate-3" : "bg-white border border-slate-100 text-slate-400"
                      )}>
                         <ShieldCheck size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-1.5">
                            <span className={cn(
                              "text-[11px] font-black uppercase tracking-tight truncate",
                              isActive ? "text-[#0b2419]" : "text-slate-500"
                            )}>{m.sender_name}</span>
                            <span className="text-[9px] font-bold text-slate-400">{new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                         </div>
                         <div className={cn(
                            "text-[11px] font-bold mb-1 truncate tracking-tight transition-colors",
                            isActive ? "text-emerald-700" : "text-slate-400"
                         )}>{m.subject || 'No Subject'}</div>
                         <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{m.body}</p>
                      </div>
                    </button>
                  );
                })
              )}
           </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-slate-50/20 relative">
          
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
             <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-emerald-500 rounded-full blur-[120px]"></div>
             <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-lime rounded-full blur-[120px]"></div>
          </div>

          {selectedMsg ? (
            <>
              {/* Chat Header */}
              <div className="p-8 bg-white/60 backdrop-blur-md border-b border-white flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-[#0b2419] text-lime flex items-center justify-center shadow-xl">
                            <ShieldCheck size={28} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full p-1 shadow-sm">
                            <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-[#0b2419] tracking-tighter uppercase">{selectedMsg.sender_name}</h3>
                       <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.25em] flex items-center gap-1.5">
                          Verified Support Desk
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="hidden lg:flex flex-col items-end mr-4">
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Case Reference</span>
                       <span className="text-[11px] font-black text-slate-500 tracking-tight">#{selectedMsg.message_id.toString().padStart(6, '0')}</span>
                    </div>
                    <button className="w-12 h-12 rounded-2xl hover:bg-white text-slate-300 hover:text-emerald-900 flex items-center justify-center transition-all border border-transparent hover:border-slate-100">
                       <MoreVertical size={20} />
                    </button>
                 </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar relative z-10">
                 <div className="flex flex-col items-center mb-6">
                    <div className="px-6 py-2 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] shadow-sm">
                       {new Date(selectedMsg.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                 </div>

                 {/* Message History Mocking - Logic for sender vs receiver positioning */}
                 <div className={cn(
                    "flex items-start gap-5 max-w-[85%] animate-in fade-in slide-in-from-bottom-4 duration-500",
                    selectedMsg.from_admin_id ? "" : "ml-auto flex-row-reverse"
                 )}>
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                        selectedMsg.from_admin_id ? "bg-[#0b2419] text-lime" : "bg-lime text-[#0b2419]"
                    )}>
                       {selectedMsg.from_admin_id ? <ShieldCheck size={18} /> : <User size={18} />}
                    </div>
                    
                    <div className={cn("space-y-3", selectedMsg.from_admin_id ? "" : "text-right items-end flex flex-col")}>
                       <div className={cn(
                         "p-7 rounded-[32px] shadow-sm text-[13px] font-bold leading-relaxed relative border",
                         selectedMsg.from_admin_id 
                            ? "bg-white border-slate-100 rounded-tl-none text-[#0b2419]" 
                            : "bg-[#0b2419] border-[#0b2419] rounded-tr-none text-white"
                       )}>
                          {selectedMsg.body}
                          
                          {/* Inner glass highlight for premium feel */}
                          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                       </div>
                       
                       <div className="flex items-center gap-3 px-1">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            selectedMsg.from_admin_id ? "text-slate-400" : "text-emerald-600/80"
                          )}>
                             {new Date(selectedMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!selectedMsg.from_admin_id && <CheckCheck size={14} className="text-emerald-500" />}
                       </div>
                    </div>
                 </div>
                 
                 {/* Empty state for single messages */}
                 <div className="py-20 flex flex-col items-center justify-center opacity-10 space-y-4">
                    <div className="h-px w-64 bg-slate-400"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">End of Transcript</span>
                    <div className="h-px w-64 bg-slate-400"></div>
                 </div>
              </div>

              {/* Chat Footer */}
              <div className="p-8 bg-white/60 backdrop-blur-md border-t border-white relative z-10">
                 <form onSubmit={handleSend} className="relative flex items-center gap-5">
                    <button type="button" className="w-14 h-14 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center justify-center shrink-0 shadow-sm">
                       <Paperclip size={24} />
                    </button>
                    <div className="flex-1 relative">
                        <input 
                          type="text" 
                          placeholder="Type your secure response..." 
                          className="w-full h-14 bg-white border border-slate-100 rounded-2xl px-8 text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all placeholder:text-slate-300 shadow-sm"
                          value={body}
                          onChange={e => setBody(e.target.value)}
                          disabled={sending}
                        />
                        {sending && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <span className="flex h-3 w-3 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                            </div>
                        )}
                    </div>
                    <button 
                      type="submit" 
                      disabled={!body.trim() || sending}
                      className="w-14 h-14 rounded-2xl bg-[#0b2419] text-lime hover:shadow-[0_12px_24px_-6px_rgba(11,36,25,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center shrink-0 active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                    >
                       <Send size={24} />
                    </button>
                 </form>
                 <div className="mt-4 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-1.5">
                       <ShieldCheck size={10} className="text-emerald-500" />
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">End-to-End Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Clock size={10} className="text-slate-300" />
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Archived Permanently</span>
                    </div>
                 </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 relative z-10 animate-in zoom-in-95 duration-1000">
               <div className="relative mb-12">
                   <div className="absolute inset-0 bg-emerald-500/10 blur-[64px] rounded-full"></div>
                   <div className="w-32 h-32 bg-white rounded-[40px] border border-slate-100 flex items-center justify-center relative shadow-2xl rotate-3">
                      <Inbox size={48} className="text-[#0b2419]" />
                   </div>
                   <div className="absolute -top-4 -right-4 w-12 h-12 bg-lime rounded-2xl flex items-center justify-center shadow-lg -rotate-6">
                       <ShieldCheck size={20} className="text-[#0b2419]" />
                   </div>
               </div>
               <h3 className="text-3xl font-black text-[#0b2419] tracking-tighter mb-4 uppercase">Select a Secure Vault</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] max-w-xs leading-relaxed">Choose a conversation from the sidebar to decrypt and read messages.</p>
            </div>
          )}
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(11, 36, 25, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(163, 230, 53, 0.2); }
      `}</style>
    </div>
  );
}

function PlusIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
}
