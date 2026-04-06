"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

interface Message {
  message_id: number;
  from_member_id?: number;
  from_admin_id?: number;
  to_member_id?: number;
  to_admin_id?: number;
  body: string;
  created_at: string;
  is_read: number;
}

interface Thread {
    member_id: number;
    full_name: string;
    member_reg_no: string;
    last_msg: string;
    last_date: string;
    unread_count: number;
}

interface MessagingContextType {
  messages: Message[];
  threads: Thread[];
  activeThreadId: number | null;
  loading: boolean;
  sendMessage: (body: string, toId?: number) => Promise<boolean>;
  setActiveThread: (id: number | null) => void;
  refresh: () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children, isAdmin = false }: { children: React.ReactNode, isAdmin?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        if (activeThreadId) {
          const res = await apiFetch(`/api/v1/messages.php?action=thread&member_id=${activeThreadId}`);
          if (res.status === 'success') setMessages(res.data);
        } else {
            const res = await apiFetch('/api/v1/messages.php?action=list');
            if (res.status === 'success') setThreads(res.data);
        }
      } else {
        const res = await apiFetch('/api/v1/messages.php');
        if (res.status === 'success') setMessages(res.data);
      }
    } catch (e) {
      console.error("Messaging sync failed:", e);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, activeThreadId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [refresh]);

  const sendMessage = async (body: string, toId?: number) => {
    try {
      const payload: any = { body };
      if (isAdmin && toId) payload.to_member_id = toId;
      
      const res = await apiFetch('/api/v1/messages.php', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.status === 'success') {
        refresh();
        return true;
      }
    } catch (e) {
      console.error("Send failed:", e);
    }
    return false;
  };

  const setActiveThread = (id: number | null) => {
      setActiveThreadId(id);
      setMessages([]); // Reset messages while loading new thread
  };

  return (
    <MessagingContext.Provider value={{ 
        messages, 
        threads, 
        activeThreadId, 
        loading, 
        sendMessage, 
        setActiveThread,
        refresh 
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) throw new Error("useMessaging must be used within MessagingProvider");
  return context;
};
