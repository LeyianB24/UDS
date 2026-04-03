"use client";

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Search, 
  MoreVertical, 
  User, 
  ShieldCheck, 
  Clock, 
  Inbox, 
  ArrowLeft,
  Paperclip,
  Check,
  CheckCheck
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

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await apiFetch('/api/v1/member_messages.php');
      setMessages(res.data.messages);
      if (res.data.messages.length > 0 && !selectedId) {
        setSelectedId(res.data.messages[0].message_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      await apiFetch('/api/v1/member_messages.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', body, subject: 'Inquiry' })
      });
      setBody('');
      loadMessages();
    } catch (e) {
      alert('Failed to send message');
    }
  };

  const selectedMsg = messages.find(m => m.message_id === selectedId);

  if (loading) return <div className="p-10 text-center"><div className="spinner-border text-emerald-600"></div></div>;

  return (
    <div className="max-w-[1400px] mx-auto px-6 h-[calc(100vh-120px)] mt-4">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
         <div>
            <Link href="/member/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0b2419] transition-all mb-2">
                <ArrowLeft size={12} /> Dashboard
            </Link>
            <h1 className="text-3xl font-black tracking-tighter text-[#0b2419]">Service Messages</h1>
         </div>
         <button className="bg-[#0b2419] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl transition-all active:scale-95">
            New Consultation
         </button>
      </div>

      <div className="bg-white border border-emerald-900/5 rounded-[40px] shadow-2xl h-full overflow-hidden flex">
        
        {/* Sidebar */}
        <div className="w-full md:w-[380px] border-r border-emerald-900/5 flex flex-col">
           <div className="p-6 border-b border-emerald-900/5">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search conversations..." 
                   className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 text-xs font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all"
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar">
              {messages.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                    <Inbox size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No messages yet</p>
                </div>
              ) : (
                messages.filter(m => m.subject.toLowerCase().includes(search.toLowerCase()) || m.body.toLowerCase().includes(search.toLowerCase())).map((m) => (
                  <button 
                    key={m.message_id}
                    onClick={() => setSelectedId(m.message_id)}
                    className={cn(
                        "w-full p-5 flex items-start gap-4 border-b border-emerald-900/[0.03] transition-all hover:bg-emerald-50/50 text-left",
                        selectedId === m.message_id ? "bg-emerald-50 border-r-4 border-r-emerald-500" : ""
                    )}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-900/5 flex items-center justify-center shrink-0 shadow-sm">
                       <ShieldCheck className="text-emerald-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-black text-[#0b2419] uppercase tracking-tight truncate">{m.sender_name}</span>
                          <span className="text-[9px] font-bold text-slate-400">{new Date(m.created_at).toLocaleDateString()}</span>
                       </div>
                       <div className="text-[10px] font-black text-slate-500 mb-1 truncate uppercase tracking-widest">{m.subject}</div>
                       <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{m.body}</p>
                    </div>
                  </button>
                ))
              )}
           </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-slate-50/30">
          {selectedMsg ? (
            <>
              {/* Chat Header */}
              <div className="p-6 bg-white border-b border-emerald-900/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-[#0b2419] tracking-tight">{selectedMsg.sender_name}</h3>
                       <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Official Support
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 flex items-center justify-center transition-all">
                       <MoreVertical size={18} />
                    </button>
                 </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                 <div className="flex flex-col items-center mb-10">
                    <div className="px-4 py-1.5 bg-white border border-emerald-900/5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                       {new Date(selectedMsg.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                 </div>

                 {/* Message Bubble - Inbound (Mocking since we fetch list) */}
                 <div className="flex items-start gap-4 max-w-[80%]">
                    <div className="w-8 h-8 rounded-lg bg-[#0b2419] text-white flex items-center justify-center shrink-0">
                       <ShieldCheck size={14} />
                    </div>
                    <div className="space-y-2">
                       <div className="bg-white border border-emerald-900/5 p-5 rounded-[24px] rounded-tl-none shadow-sm text-xs font-semibold text-emerald-950 leading-relaxed">
                          {selectedMsg.body}
                       </div>
                       <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                          {new Date(selectedMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <CheckCheck size={12} className="text-emerald-500" />
                       </div>
                    </div>
                 </div>

                 {/* If there were replies, they would go here */}
              </div>

              {/* Chat Footer / Input */}
              <div className="p-6 bg-white border-t border-emerald-900/5">
                 <form onSubmit={handleSend} className="relative flex items-center gap-4">
                    <button type="button" className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all flex items-center justify-center shrink-0">
                       <Paperclip size={20} />
                    </button>
                    <input 
                      type="text" 
                      placeholder="Write your message..." 
                      className="flex-1 h-12 bg-slate-50 border-none rounded-2xl px-6 text-xs font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all"
                      value={body}
                      onChange={e => setBody(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      disabled={!body.trim()}
                      className="w-12 h-12 rounded-2xl bg-[#0b2419] text-white hover:shadow-xl transition-all flex items-center justify-center shrink-0 active:scale-95 disabled:opacity-50"
                    >
                       <Send size={20} />
                    </button>
                 </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-40">
               <div className="w-24 h-24 bg-white rounded-[32px] border border-emerald-900/10 flex items-center justify-center mb-8 shadow-xl">
                  <Inbox size={40} className="text-[#0b2419]" />
               </div>
               <h3 className="text-xl font-black text-[#0b2419] tracking-tight mb-2 uppercase">Select a Conversation</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pick a message from the list to start chatting.</p>
            </div>
          )}
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(11, 36, 25, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(11, 36, 25, 0.1); }
      `}</style>
    </div>
  );
}
