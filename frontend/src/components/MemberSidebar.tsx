"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  PiggyBank, 
  PieChart, 
  History, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Menu,
  Smartphone,
  Landmark,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { group: "General", items: [
    { name: 'Dashboard', href: '/member/dashboard', icon: LayoutDashboard },
  ]},
  { group: "Personal Finances", items: [
    { name: 'Savings', href: '/member/savings', icon: PiggyBank },
    { name: 'Shares Portfolio', href: '/member/shares', icon: PieChart },
    { name: 'My Loans', href: '/member/loans', icon: Landmark },
    { name: 'Contributions', href: '/member/contributions', icon: Wallet },
  ]},
  { group: "Welfare & Solidarity", items: [
    { name: 'Welfare Hub', href: '/member/welfare', icon: History },
  ]},
  { group: "Utilities", items: [
    { name: 'Pay Via M-Pesa', href: '/member/mpesa', icon: Smartphone },
    { name: 'Withdraw Funds', href: '/member/withdraw', icon: Wallet },
    { name: 'Transactions', href: '/member/transactions', icon: ArrowRightLeft },
  ]},
  { group: "Account", items: [
    { name: 'My Profile', href: '/member/profile', icon: User },
  ]}
];

export function MemberSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('member_sb_collapsed');
    if (saved === '1') setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('member_sb_collapsed', next ? '1' : '0');
  };

  const handleLogout = () => {
    // Add logout logic here
  };

  if (!mounted) return <div className="w-68 h-screen bg-[#0b2419]" />;

  return (
    <>
      <button 
        onClick={toggleCollapse}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        className={cn(
          "fixed top-6 z-[60] w-8 h-8 rounded-lg bg-white border border-emerald-900/10 shadow-lg flex items-center justify-center text-emerald-900 transition-all duration-300 hover:bg-emerald-50",
          isCollapsed ? "left-[58px]" : "left-[254px]"
        )}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <aside 
        className={cn(
          "fixed top-0 left-0 h-screen z-50 bg-[#0b2419] border-r border-emerald-800/30 flex flex-col transition-all duration-300 shadow-[2px_0_30px_rgba(0,0,0,0.3)]",
          isCollapsed ? "w-20" : "w-[272px]"
        )}
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-950 via-lime-400 to-emerald-950 z-10" />

        {/* Brand */}
        <div className="h-[72px] flex items-center px-4 border-b border-emerald-800/20 shrink-0">
          <Link href="/member/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center p-2 shrink-0 shadow-lg">
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-[13px] font-extrabold text-white leading-none tracking-tight">UMOJA SACCO</span>
                <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-[1.5px] mt-1 flex items-center gap-1.5">
                   <div className="w-1 h-1 bg-lime-400 rounded-full animate-pulse" />
                   Member Portal
                </span>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          {sidebarLinks.map((group, gIdx) => (
            <div key={gIdx} className="mb-6">
              {!isCollapsed && (
                <div className="flex items-center gap-3 px-3 mb-3">
                  <span className="text-[10px] font-black text-emerald-400/30 uppercase tracking-[2px] whitespace-nowrap">{group.group}</span>
                  <div className="h-px bg-emerald-800/20 flex-1" />
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item, iIdx) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      title={item.name}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-emerald-950 text-white font-bold shadow-[0_4px_15px_rgba(0,0,0,0.2)]" 
                          : "text-emerald-400/60 hover:bg-emerald-900/30 hover:text-emerald-50"
                      )}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="active-nav-member"
                          className="absolute left-0 top-2 bottom-2 w-1 bg-lime-400 rounded-full"
                        />
                      )}
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                        isActive ? "bg-emerald-900 text-lime-400" : "bg-transparent text-inherit"
                      )}>
                        <item.icon size={18} />
                      </div>
                      {!isCollapsed && (
                        <span className="text-sm tracking-tight">{item.name}</span>
                      )}
                      {isActive && !isCollapsed && (
                        <div className="ml-auto w-1 h-1 bg-lime-400 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-emerald-800/20">
          <button 
            onClick={handleLogout}
            title="Sign Out"
            className={cn(
               "w-full h-12 rounded-xl flex items-center gap-3 transition-all text-red-400/60 hover:bg-red-500/10 hover:text-red-400 mt-auto",
               isCollapsed ? "justify-center px-0" : "px-4"
            )}
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>}
          </button>
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(163,230,53,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(163,230,53,0.2); }
      `}</style>
    </>
  );
}
