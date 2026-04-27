"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Download, Plus, ArrowUpDown, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/api';

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadLedgerData();
  }, [selectedAccount, dateRange]);

  const loadLedgerData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, accountsRes] = await Promise.all([
        fetchApi(`admin/ledger/transactions?account=${selectedAccount}&days=${dateRange}&q=${searchQuery}`),
        fetchApi('admin/ledger/accounts')
      ]);

      if (transactionsRes.status === 'success') {
        setTransactions(transactionsRes.data);
      }
      if (accountsRes.status === 'success') {
        setAccounts(accountsRes.data);
      }
    } catch (error) {
      console.error('Failed to load ledger data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountName = (accountId: number) => {
    const account = accounts.find(a => a.account_id === accountId);
    return account ? account.account_name : 'Unknown Account';
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'debit': return 'text-red-600 bg-red-50';
      case 'credit': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = Math.abs(amount).toLocaleString();
    return type === 'debit' ? `-${formatted}` : `+${formatted}`;
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
          <h1 className="text-2xl font-black text-gray-900">Live Ledger</h1>
          <p className="text-gray-600 mt-1">Real-time view of all financial transactions and account balances</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            <Download size={18} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-white rounded-xl hover:bg-lime-600 transition-colors">
            <Plus size={18} />
            New Entry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
          >
            <option value="all">All Accounts</option>
            {accounts.map(account => (
              <option key={account.account_id} value={account.account_id}>
                {account.account_name}
              </option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>

          <button
            onClick={loadLedgerData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Filter size={18} />
            Apply
          </button>
        </div>
      </div>

      {/* Account Balances Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {accounts.slice(0, 4).map((account, index) => (
          <motion.div
            key={account.account_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">{account.account_name}</div>
                <div className="text-2xl font-black text-gray-900">
                  KES {account.current_balance?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center">
                <BookOpen size={24} className="text-lime-600" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.transaction_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getAccountName(transaction.account_id)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                    transaction.transaction_type === 'debit' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatAmount(transaction.amount, transaction.transaction_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transaction.reference_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <button className="text-lime-600 hover:text-lime-800 transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}