"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  Banknote, 
  PieChart, 
  BarChart3,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

// Page Animation Variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function ReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`admin/reports?period=${selectedPeriod}`);
      if (res.status === 'success') {
        setReports(res.data);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    {
      title: 'Financial Statements',
      icon: Banknote,
      color: 'emerald',
      description: 'Core financial health indicators and balance sheets.',
      reports: [
        { name: 'Balance Sheet', description: 'Assets, liabilities, and equity statement', endpoint: 'balance-sheet' },
        { name: 'Income Statement', description: 'Revenue and expenses for the period', endpoint: 'income-statement' },
        { name: 'Cash Flow Statement', description: 'Cash inflows and outflows', endpoint: 'cash-flow' },
        { name: 'Trial Balance', description: 'Account balances verification', endpoint: 'trial-balance' },
      ]
    },
    {
      title: 'Member Insights',
      icon: Users,
      color: 'blue',
      description: 'Demographics and contribution summaries.',
      reports: [
        { name: 'Member List', description: 'Complete list of all members', endpoint: 'member-list' },
        { name: 'Active Members', description: 'Currently active members only', endpoint: 'active-members' },
        { name: 'New Members', description: 'Members registered in the period', endpoint: 'new-members' },
        { name: 'Member Contributions', description: 'Monthly contribution summary', endpoint: 'member-contributions' },
      ]
    },
    {
      title: 'Credit Portfolio',
      icon: TrendingUp,
      color: 'amber',
      description: 'Loan disbursement and recovery metrics.',
      reports: [
        { name: 'Loan Portfolio', description: 'All active loans summary', endpoint: 'loan-portfolio' },
        { name: 'Loan Disbursements', description: 'Loans disbursed in the period', endpoint: 'loan-disbursements' },
        { name: 'Loan Repayments', description: 'Loan repayment schedule and history', endpoint: 'loan-repayments' },
        { name: 'Loan Defaults', description: 'Loans with payment defaults', endpoint: 'loan-defaults' },
      ]
    },
    {
      title: 'System Operations',
      icon: PieChart,
      color: 'purple',
      description: 'Audit logs and platform performance.',
      reports: [
        { name: 'Transaction Summary', description: 'All transactions summary', endpoint: 'transaction-summary' },
        { name: 'Audit Log', description: 'System activity and changes', endpoint: 'audit-log' },
        { name: 'System Performance', description: 'Server and database performance', endpoint: 'system-performance' },
        { name: 'User Activity', description: 'User login and activity report', endpoint: 'user-activity' },
      ]
    }
  ];

  const generateReport = async (endpoint: string, format: 'pdf' | 'excel' = 'pdf') => {
    try {
      const res = await fetchApi(`admin/reports/${endpoint}?period=${selectedPeriod}&format=${format}`, 'GET', {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${endpoint}_${selectedPeriod}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to generate report');
    }
  };

  const stats = [
    { label: 'Total Reports', value: reports?.total_reports ?? 0, icon: ClipboardCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Generated Today', value: reports?.generated_today ?? 0, icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Popular Index', value: reports?.popular_report ?? 'Balance Sheet', icon: ArrowUpRight, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Cloud Footprint', value: reports?.data_size ?? '2.4MB', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-10 pb-20"
    >
      
      {/* HERO SECTION */}
      <motion.div variants={itemVariants}
        className="bg-gradient-to-br from-[#0b2419] to-[#1a5c42] text-white rounded-[40px] p-8 lg:p-12 relative overflow-hidden shadow-2xl shadow-emerald-950/20">
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(#a3e635 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/20 text-[10px] font-black uppercase tracking-widest text-[#a3e635] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" /> Intelligence Center
            </div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none mb-4">
              Data & <span className="text-[#a3e635]">Analytics.</span>
            </h1>
            <p className="text-white/50 text-sm font-bold max-w-lg leading-relaxed uppercase tracking-wider">
              Generate comprehensive operational audits and financial performance statements.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 shrink-0 bg-white/5 p-6 rounded-[32px] backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-3">
               <Calendar size={18} className="text-[#a3e635]" />
               <select
                 title="Select Period"
                 value={selectedPeriod}
                 onChange={(e) => setSelectedPeriod(e.target.value)}
                 className="h-12 px-6 bg-white/10 border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest text-white outline-none focus:bg-white/20 transition-all cursor-pointer"
               >
                 <option value="daily" className="text-gray-900">Daily</option>
                 <option value="weekly" className="text-gray-900">Weekly</option>
                 <option value="monthly" className="text-gray-900">Monthly</option>
                 <option value="quarterly" className="text-gray-900">Quarterly</option>
                 <option value="yearly" className="text-gray-900">Yearly</option>
               </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS TIERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="group bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500", stat.bg, stat.color)}>
               <stat.icon size={26} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] leading-none mb-3">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{loading ? '—' : stat.value}</h3>
            
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-gray-900 group-hover:scale-125 transition-transform duration-1000">
                <stat.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* REPORT CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {reportTypes.map((category, idx) => (
          <motion.div
            key={category.title}
            variants={itemVariants}
            className="bg-white rounded-[40px] border border-gray-100 p-8 lg:p-10 shadow-sm relative overflow-hidden group"
          >
            <div className="relative z-10">
               <div className="flex items-center gap-5 mb-8">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform", 
                    category.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                    category.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    category.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                    'bg-purple-50 text-purple-600'
                  )}>
                    <category.icon size={26} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-2">{category.title}</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{category.description}</p>
                  </div>
               </div>

               <div className="space-y-4">
                 {category.reports.map((report, rIdx) => (
                   <div key={rIdx} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-2xl transition-all group/item shadow-sm hover:shadow-md">
                     <div className="mb-4 sm:mb-0">
                       <h3 className="text-sm font-black text-gray-900 leading-none mb-2">{report.name}</h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{report.description}</p>
                     </div>
                     <div className="flex gap-2">
                       <button
                         onClick={() => generateReport(report.endpoint, 'pdf')}
                         className="h-10 px-4 bg-white border border-gray-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                       >
                         <FileText size={14} /> PDF
                       </button>
                       <button
                         onClick={() => generateReport(report.endpoint, 'excel')}
                         className="h-10 px-4 bg-white border border-gray-100 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                       >
                         <Layers size={14} /> Excel
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-gray-900 group-hover:scale-110 transition-transform duration-1000">
               <category.icon size={160} />
            </div>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}