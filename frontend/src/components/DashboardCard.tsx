"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color?: string;
}

export function DashboardCard({ label, value, icon: Icon, trend, trendType = 'neutral', color = 'indigo' }: DashboardCardProps) {
  const colorMap: { [key: string]: string } = {
    indigo: "bg-indigo-600/10 text-indigo-400 border-indigo-600/20",
    emerald: "bg-emerald-600/10 text-emerald-400 border-emerald-600/20",
    amber: "bg-amber-600/10 text-amber-400 border-amber-600/20",
    rose: "bg-rose-600/10 text-rose-400 border-rose-600/20",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl border", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            trendType === 'up' ? "bg-emerald-500/10 text-emerald-400" : 
            trendType === 'down' ? "bg-rose-500/10 text-rose-400" : 
            "bg-slate-500/10 text-slate-400"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-slate-400 text-sm font-medium mb-1">{label}</span>
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
      </div>
    </div>
  );
}
