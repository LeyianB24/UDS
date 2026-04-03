"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  CreditCard, 
  Landmark, 
  FileText, 
  Settings, 
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Members', href: '/members' },
  { icon: Wallet, label: 'Savings', href: '/savings' },
  { icon: CreditCard, label: 'Loans', href: '/loans' },
  { icon: Landmark, label: 'Investments', href: '/investments' },
  { icon: FileText, label: 'Statements', href: '/statements' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 border-r border-slate-800 shadow-xl z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl">
          U
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight">USMS Sacco</span>
          <span className="text-xs text-slate-400">Premium Management</span>
        </div>
      </div>

      <nav className="mt-6 flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "group-hover:text-white")} />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="p-6">
        <div className="bg-indigo-600/5 rounded-2xl p-4 border border-indigo-600/10">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-white">Support</span>
          </div>
          <p className="text-[10px] text-slate-400 mb-3">Need help with the system?</p>
          <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/20">
            Get Help
          </button>
        </div>
      </div>
    </div>
  );
}
