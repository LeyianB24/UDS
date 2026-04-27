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
  Banknote,
  Activity,
  PieChart,
  ClipboardList,
  Monitor,
  Database,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const adminLinks = [
  { group: "General", items: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Support Dispatch', href: '/admin/messages', icon: MessageSquare },
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
  ]},
  { group: "Operations", items: [
    { name: 'Loans Management', href: '/admin/loans', icon: Activity },
    { name: 'Transactions', href: '/admin/transactions', icon: BarChart3 },
    { name: 'Reports', href: '/admin/reports', icon: PieChart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
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
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        className={cn(
          "fixed top-5 z-[60] w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 transition-all duration-300 hover:bg-green-50 hover:text-green-700",
          isCollapsed ? "left-[58px]" : "left-[250px]"
        )}
        onClick={toggleCollapse}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <aside 
        className={cn(
          "fixed top-0 left-0 h-screen z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-[2px_0_30px_rgba(0,0,0,0.02)]",
          isCollapsed ? "w-20" : "w-[268px]"
        )}
      >
        {/* Brand */}
        <div className="h-[72px] flex items-center px-4 border-b border-gray-200 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-green-800 rounded-xl flex items-center justify-center p-2.5 shrink-0 shadow-xl shadow-emerald-950/20">
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain filter invert brightness-0 invert" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-[13px] font-extrabold text-gray-900 leading-none tracking-tight" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>UMOJA SACCO</span>
                <span className="text-[9px] font-bold text-lime-500 uppercase tracking-[1.5px] mt-1">Admin Portal</span>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {adminLinks.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {!isCollapsed && (
                <div className="px-4 mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                    {group.group}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item, itemIndex) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 group relative",
                        isCollapsed ? "justify-center" : "",
                        isActive
                          ? "bg-lime-50 text-green-800 border-r-2 border-lime-400"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}
                    >
                      <item.icon size={18} className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-lime-500" : "text-gray-400 group-hover:text-gray-600"
                      )} />
                      {!isCollapsed && (
                        <span className={cn(
                          "font-medium transition-colors",
                          isActive ? "text-green-800" : "text-gray-600 group-hover:text-gray-900"
                        )}>
                          {item.name}
                        </span>
                      )}
                      {isActive && !isCollapsed && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-lime-400 rounded-r"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors",
            isCollapsed ? "justify-center" : ""
          )}>
            <LogOut size={18} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
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
