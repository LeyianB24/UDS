"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, Users, Banknote, PieChart, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = async () => {
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
      title: 'Financial Reports',
      icon: Banknote,
      color: 'green',
      reports: [
        { name: 'Balance Sheet', description: 'Assets, liabilities, and equity statement', endpoint: 'balance-sheet' },
        { name: 'Income Statement', description: 'Revenue and expenses for the period', endpoint: 'income-statement' },
        { name: 'Cash Flow Statement', description: 'Cash inflows and outflows', endpoint: 'cash-flow' },
        { name: 'Trial Balance', description: 'Account balances verification', endpoint: 'trial-balance' },
      ]
    },
    {
      title: 'Member Reports',
      icon: Users,
      color: 'blue',
      reports: [
        { name: 'Member List', description: 'Complete list of all members', endpoint: 'member-list' },
        { name: 'Active Members', description: 'Currently active members only', endpoint: 'active-members' },
        { name: 'New Members', description: 'Members registered in the period', endpoint: 'new-members' },
        { name: 'Member Contributions', description: 'Monthly contribution summary', endpoint: 'member-contributions' },
      ]
    },
    {
      title: 'Loan Reports',
      icon: TrendingUp,
      color: 'orange',
      reports: [
        { name: 'Loan Portfolio', description: 'All active loans summary', endpoint: 'loan-portfolio' },
        { name: 'Loan Disbursements', description: 'Loans disbursed in the period', endpoint: 'loan-disbursements' },
        { name: 'Loan Repayments', description: 'Loan repayment schedule and history', endpoint: 'loan-repayments' },
        { name: 'Loan Defaults', description: 'Loans with payment defaults', endpoint: 'loan-defaults' },
      ]
    },
    {
      title: 'Operational Reports',
      icon: PieChart,
      color: 'purple',
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

      // Create download link
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
    </div>
  );

  return (
    <div className="space-y-6" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive reports for your Sacco operations</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-gray-500" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportTypes.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 bg-${category.color}-100 rounded-xl flex items-center justify-center`}>
                <category.icon size={20} className={`text-${category.color}-600`} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{category.title}</h2>
            </div>

            <div className="space-y-4">
              {category.reports.map((report, reportIndex) => (
                <div key={reportIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateReport(report.endpoint, 'pdf')}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      <Download size={14} />
                      PDF
                    </button>
                    <button
                      onClick={() => generateReport(report.endpoint, 'excel')}
                      className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <Download size={14} />
                      Excel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-gray-200 p-6"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-6">Report Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-lime-50 rounded-xl">
            <div className="text-2xl font-black text-lime-700">{reports.total_reports || 0}</div>
            <div className="text-sm text-lime-600">Total Reports</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-black text-blue-700">{reports.generated_today || 0}</div>
            <div className="text-sm text-blue-600">Generated Today</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <div className="text-2xl font-black text-orange-700">{reports.popular_report || 'Balance Sheet'}</div>
            <div className="text-sm text-orange-600">Most Popular</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-black text-purple-700">{reports.data_size || '2.4MB'}</div>
            <div className="text-sm text-purple-600">Total Data Size</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}