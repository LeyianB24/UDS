"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Users,
  Calendar,
  Download,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Calculator,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Pocket,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn, formatKES } from '@/lib/utils';

// Page Animation Variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function PayrollPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const loadPayrollData = useCallback(async () => {
    setLoading(true);
    try {
      const [payrollRes, employeesRes] = await Promise.all([
        fetchApi(`admin/payroll`),
        fetchApi(`admin/payroll?action=employees`)
      ]);

      if (payrollRes.status === 'success') {
        setData(payrollRes.data);
      }

      if (employeesRes.status === 'success') {
        setEmployees(employeesRes.data.employees);
      }
    } catch (error) {
      console.error('Failed to load payroll data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayrollData();
  }, [loadPayrollData]);

  const generatePayrollTemplate = async () => {
    setProcessing(true);
    try {
      const res = await fetchApi(`admin/payroll?action=template&month=${selectedMonth}&year=${selectedYear}`);
      showToast(res.message, res.status === 'success');
      if (res.status === 'success') {
          loadPayrollData();
      }
    } catch (error) {
      showToast('Template generation failed', false);
    } finally {
      setProcessing(false);
    }
  };

  const processPayroll = async (payrollData: any[]) => {
    setProcessing(true);
    try {
      const res = await fetchApi('admin/payroll', 'POST', {
        action: 'process',
        payroll_data: JSON.stringify(payrollData),
        month: selectedMonth,
        year: selectedYear
      });

      showToast(res.message, res.status === 'success');
      if (res.status === 'success') {
        loadPayrollData();
      }
    } catch (error) {
        showToast('Processing failed', false);
    } finally {
      setProcessing(false);
    }
  };

  const stats = [
    { label: 'Total Payroll', value: formatKES(data?.stats?.total_payments ?? 0), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Personnel Paid', value: data?.stats?.processed_count ?? 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pending Cycle', value: data?.stats?.pending_count ?? 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Average Remittance', value: formatKES(data?.stats?.avg_payment ?? 0), icon: Calculator, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-10 pb-20"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={cn('fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl text-sm font-black flex items-center gap-3',
              toast.ok ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white')}>
            {toast.ok ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <motion.div variants={itemVariants}
        className="bg-gradient-to-br from-[#0b2419] to-[#1a5c42] text-white rounded-[40px] p-8 lg:p-12 relative overflow-hidden shadow-2xl shadow-emerald-950/20">
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(#a3e635 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/20 text-[10px] font-black uppercase tracking-widest text-[#a3e635] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" /> Financial Operations
            </div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none mb-4">
              Payroll <span className="text-[#a3e635]">Terminal.</span>
            </h1>
            <p className="text-white/50 text-sm font-bold max-w-lg leading-relaxed uppercase tracking-wider">
              Manage salary disbursements, statutory deductions, and personnel remittance cycles.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 shrink-0 bg-white/5 p-6 rounded-[32px] backdrop-blur-md border border-white/10">
            <div className="space-y-4 w-full sm:w-auto">
               <div className="flex gap-2">
                  <select
                    title="Select Month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="flex-1 h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest text-white outline-none focus:bg-white/20 transition-all cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1} className="text-gray-900">
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <select
                    title="Select Year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="flex-1 h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest text-white outline-none focus:bg-white/20 transition-all cursor-pointer"
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <option key={new Date().getFullYear() - 2 + i} value={new Date().getFullYear() - 2 + i} className="text-gray-900">
                        {new Date().getFullYear() - 2 + i}
                      </option>
                    ))}
                  </select>
               </div>
               <button
                 onClick={generatePayrollTemplate}
                 disabled={processing}
                 className="w-full h-14 px-8 bg-[#a3e635] text-[#0b2419] font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-[#bceb3b] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#a3e635]/20 disabled:opacity-50"
               >
                 {processing ? <RefreshCw size={16} className="animate-spin" /> : <Calculator size={18} />}
                 Initiate Cycle
               </button>
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

      {/* PAYROLL GRID */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-8 lg:p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Cycle Registry</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Personnel remittance logs for {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="relative group">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0b2419] transition-colors" />
                 <input type="text" placeholder="Search registry..." className="h-12 pl-12 pr-6 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#0b2419]/5 outline-none transition-all w-full sm:w-64" />
              </div>
              <button className="h-12 px-5 bg-gray-50 border border-gray-100 text-gray-400 rounded-xl hover:bg-gray-100 transition-all">
                 <Filter size={18} />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Personnel Identity</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Gross Earnings</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Deductions</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Net Remittance</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-24 text-center text-xs font-black text-gray-400 uppercase tracking-[4px]">Synchronizing Financial Mesh...</td></tr>
              ) : !data?.payrolls?.length ? (
                <tr>
                   <td colSpan={6} className="py-32 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                         <Calculator size={32} />
                      </div>
                      <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Cycle Silent.</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No financial records found for the selected temporal period.</p>
                   </td>
                </tr>
              ) : data.payrolls.map((p: any) => (
                <tr key={p.payroll_id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform">
                         <Users size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 leading-none mb-2">{p.employee_name}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="text-sm font-black text-gray-900 mb-1">{formatKES(p.basic_salary + (p.allowances ?? 0))}</div>
                     <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">+{formatKES(p.allowances ?? 0)} Allowances</div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="text-sm font-black text-red-600 mb-1">-{formatKES(p.deductions ?? 0)}</div>
                     <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statutory & Other</div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-black">
                       <CreditCard size={14} />
                       {formatKES(p.net_pay)}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      p.status === 'processed' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-amber-100 text-amber-700"
                    )}>
                      {p.status === 'processed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {p.status}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                       <button title="Download Payslip" className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#0b2419] hover:border-[#0b2419] transition-all shadow-sm">
                          <Download size={16} />
                       </button>
                       <button className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#0b2419] hover:border-[#0b2419] transition-all shadow-sm">
                          <MoreVertical size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}