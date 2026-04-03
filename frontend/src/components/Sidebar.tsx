"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  BadgeCheck,
  CreditCard,
  History,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Banknote,
  HeartPulse,
  PieChart,
  ClipboardList,
  Display,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const adminLinks = [
  { group: "General", items: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ]},
  { group: "Member Management", items: [
    { name: 'Member Onboarding', href: '/admin/onboarding', icon: UserPlus },
    { name: 'Members List', href: '/admin/members', icon: Users },
  ]},
  { group: "People & Access", items: [
    { name: 'Employees', href: '/admin/employees', icon: BadgeCheck },
    { name: 'System Users', href: '/admin/users', icon: ShieldCheck },
    { name: 'Access Control', href: '/admin/roles', icon: ClipboardList },
  ]},
  { group: "Financials", items: [
    { name: 'Cashier / Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Live Ledger', href: '/admin/ledger', icon: History },
    { name: 'Trial Balance', href: '/admin/balance', icon: Banknote },
  ]}
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sb_collapsed');
    if (saved === '1') setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sb_collapsed', next ? '1' : '0');
  };

  if (!mounted) return <div className="w-64 h-screen bg-white" />;

  return (
    <>
      <button 
        onClick={toggleCollapse}
        className={cn(
          "fixed top-5 z-[60] w-8 h-8 rounded-lg bg-white border border-emerald-900/10 shadow-lg flex items-center justify-center text-emerald-900 transition-all duration-300 hover:bg-emerald-50",
          isCollapsed ? "left-[58px]" : "left-[250px]"
        )}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <aside 
        className={cn(
          "fixed top-0 left-0 h-screen z-50 bg-white border-r border-emerald-900/5 flex flex-col transition-all duration-300 shadow-[2px_0_30px_rgba(0,0,0,0.02)]",
          isCollapsed ? "w-20" : "w-[268px]"
        )}
      >
        {/* Brand */}
        <div className="h-[72px] flex items-center px-4 border-b border-emerald-900/5 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-[#0b2419] rounded-xl flex items-center justify-center p-2.5 shrink-0 shadow-xl shadow-emerald-950/20">
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain filter invert brightness-0 invert" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-[13px] font-extrabold text-[#0b2419] leading-none tracking-tight">UMOJA SACCO</span>
                <span className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-[1.5px] mt-1">Admin Portal</span>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          {adminLinks.map((group, gIdx) => (
            <div key={gIdx} className="mb-6">
              {!isCollapsed && (
                <div className="flex items-center gap-3 px-3 mb-3">
                  <span className="text-[10px] font-black text-emerald-900/20 uppercase tracking-[2px] whitespace-nowrap">{group.group}</span>
                  <div className="h-px bg-emerald-900/5 flex-1" />
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item, iIdx) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-emerald-50 text-[#0b2419] font-bold" 
                          : "text-emerald-900/40 hover:bg-slate-50 hover:text-[#0b2419]"
                      )}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="active-nav"
                          className="absolute left-0 top-2 bottom-2 w-1 bg-[#0b2419] rounded-full"
                        />
                      )}
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                        isActive ? "bg-[#0b2419] text-lime-400" : "bg-transparent text-inherit"
                      )}>
                        <item.icon size={18} />
                      </div>
                      {!isCollapsed && (
                        <span className="text-sm tracking-tight">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-emerald-900/5">
          <button className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 font-bold hover:bg-red-50 transition-all duration-200",
            isCollapsed && "justify-center"
          )}>
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
               <LogOut size={18} />
            </div>
            {!isCollapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
      `}</style>
    </>
  );
}
