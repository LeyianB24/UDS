"use client";

import React from 'react';
import { MessagingProvider } from '@/components/messaging/MessagingProvider';
import { InboxList } from '@/components/messaging/InboxList';
import { ChatWindow } from '@/components/messaging/ChatWindow';

export default function AdminMessagesPage() {
  return (
    <MessagingProvider isAdmin={true}>
      <div className="h-[calc(100vh-160px)] flex flex-col">
        
        {/* Admin Header Context - Already provided by AdminLayout but specific context here */}
        <div className="flex items-end justify-between mb-8">
           <div>
              <div className="flex items-center gap-3 mb-2 leading-none">
                 <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[2px]">Communication Terminal</span>
                 <div className="h-px w-8 bg-[var(--border-color)] opacity-20" />
              </div>
              <h2 className="text-3xl font-black text-[var(--text-main)] underline decoration-[var(--brand-lime)] underline-offset-8 decoration-4 tracking-tight">Support Dispatch</h2>
           </div>
        </div>

        {/* Messaging Interface Container */}
        <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[40px] shadow-2xl overflow-hidden flex">
           {/* Inbound Manifest - List of member threads */}
           <div className="w-[380px] lg:w-[420px] hidden md:block">
              <InboxList isAdmin={true} />
           </div>
           
           {/* Dispatch Terminal - Active chat thread */}
           <div className="flex-1 flex flex-col min-w-0">
              <ChatWindow isAdmin={true} />
           </div>
        </div>

      </div>
    </MessagingProvider>
  );
}
