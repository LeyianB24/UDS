"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Key,
  ShieldAlert,
  Server,
  Zap,
  CheckCircle,
  AlertCircle,
  Globe,
  Clock,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

// Page Animation Variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('admin/settings');
      if (res.status === 'success') {
        setSettings(res.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetchApi('admin/settings', 'POST', settings);
      showToast(res.message, res.status === 'success');
    } catch (error) {
      showToast('Failed to save settings', false);
    } finally {
      setSaving(false);
    }
  };

  const settingSections = [
    {
      title: 'Platform Identity',
      icon: Globe,
      description: 'Configure public-facing site information and regional settings.',
      items: [
        { key: 'site_name', label: 'Organization Name', type: 'text', icon: Settings },
        { key: 'site_url', label: 'Primary URL', type: 'text', icon: Globe },
        { key: 'timezone', label: 'System Timezone', type: 'select', options: ['Africa/Nairobi', 'UTC', 'Africa/Kampala'], icon: Clock },
      ]
    },
    {
      title: 'Financial Parameters',
      icon: Database,
      description: 'Define core financial constants for the SACCO ledger.',
      items: [
        { key: 'default_currency', label: 'Default Currency', type: 'text', icon: Database },
        { key: 'loan_interest_rate', label: 'Standard Loan Rate (%)', type: 'number', icon: Zap },
        { key: 'share_value', label: 'Base Share Value (KES)', type: 'number', icon: Key },
      ]
    },
    {
      title: 'Communication Hub',
      icon: Bell,
      description: 'Manage automated notifications and administrative contacts.',
      items: [
        { key: 'email_notifications', label: 'Enable SMTP Alerts', type: 'checkbox', icon: Mail },
        { key: 'sms_notifications', label: 'Enable SMS Gateway', type: 'checkbox', icon: Bell },
        { key: 'admin_email', label: 'Operational Email', type: 'email', icon: Mail },
      ]
    },
    {
      title: 'Security Protocols',
      icon: Lock,
      description: 'Configure access controls and session persistence.',
      items: [
        { key: 'session_timeout', label: 'Session TTL (mins)', type: 'number', icon: Clock },
        { key: 'password_min_length', label: 'Minimum Entropy (length)', type: 'number', icon: Key },
        { key: 'two_factor_auth', label: 'Enforce MFA', type: 'checkbox', icon: Shield },
      ]
    }
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <RefreshCw size={32} className="animate-spin text-[#a3e635]" />
    </div>
  );

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
              <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" /> Configuration Core
            </div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none mb-4">
              System <span className="text-[#a3e635]">Preferences.</span>
            </h1>
            <p className="text-white/50 text-sm font-bold max-w-lg leading-relaxed uppercase tracking-wider">
              Control organizational behavior, security thresholds, and global financial constants.
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
             <button onClick={loadSettings} className="h-14 px-8 bg-white/10 text-white border border-white/20 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3">
                <RefreshCw size={18} /> Sync
             </button>
             <button 
               onClick={saveSettings} 
               disabled={saving}
               className="h-14 px-10 bg-[#a3e635] text-[#0b2419] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#bceb3b] transition-all flex items-center gap-3 shadow-lg shadow-[#a3e635]/20 disabled:opacity-50"
             >
                {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                Deploy Changes
             </button>
          </div>
        </div>
      </motion.div>

      {/* SETTINGS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {settingSections.map((section, idx) => (
          <motion.div
            key={section.title}
            variants={itemVariants}
            className="bg-white rounded-[40px] border border-gray-100 p-8 lg:p-10 shadow-sm relative overflow-hidden group"
          >
            <div className="relative z-10">
               <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                    <section.icon size={26} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-2">{section.title}</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{section.description}</p>
                  </div>
               </div>

               <div className="space-y-6">
                 {section.items.map((item) => (
                   <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all group/item">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover/item:text-emerald-600 transition-colors">
                           <item.icon size={18} />
                        </div>
                        <label className="text-sm font-black text-gray-900">{item.label}</label>
                     </div>
                     <div className="w-full sm:w-auto sm:min-w-[200px]">
                        {item.type === 'checkbox' ? (
                          <div className="flex justify-end">
                            <button 
                              onClick={() => setSettings({...settings, [item.key]: !settings[item.key]})}
                              className={cn(
                                "w-14 h-8 rounded-full p-1 transition-colors duration-300 relative",
                                settings[item.key] ? "bg-emerald-600" : "bg-gray-300"
                              )}
                            >
                              <div className={cn(
                                "w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-sm",
                                settings[item.key] ? "translate-x-6" : "translate-x-0"
                              )} />
                            </button>
                          </div>
                        ) : item.type === 'select' ? (
                          <select
                            title={item.label}
                            value={settings[item.key] || ''}
                            onChange={(e) => setSettings({...settings, [item.key]: e.target.value})}
                            className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                          >
                            {item.options?.map((option: string) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            title={item.label}
                            type={item.type}
                            value={settings[item.key] || ''}
                            onChange={(e) => setSettings({...settings, [item.key]: e.target.value})}
                            className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        )}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-gray-900 group-hover:scale-110 transition-transform duration-1000">
               <section.icon size={160} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* SYSTEM HEALTH TRACKER */}
      <motion.div variants={itemVariants}
        className="bg-white rounded-[48px] border border-gray-100 p-8 lg:p-12 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center gap-5 mb-12">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Server size={26} />
          </div>
          <div>
             <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">Platform Health Matrix</h2>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time resource utilization and uptime metrics.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Uptime Reliability', value: settings.health || 99, unit: '%', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Database Storage', value: settings.db_size || '14', unit: 'MB', icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Session Velocity', value: settings.uptime || '168', unit: 'Hrs', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat, sIdx) => (
            <div key={sIdx} className="bg-gray-50/50 border border-gray-100 rounded-[32px] p-8 flex flex-col gap-6 group hover:bg-white hover:shadow-xl transition-all">
               <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                  <stat.icon size={20} />
               </div>
               <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2">{stat.label}</div>
                  <div className="text-4xl font-black text-gray-900 tracking-tighter">
                     {stat.value}<span className="text-sm font-bold text-gray-400 ml-1">{stat.unit}</span>
                  </div>
               </div>
               <div className="mt-auto h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", stat.color.replace('text', 'bg'))} style={{ width: sIdx === 0 ? '99%' : sIdx === 1 ? '14%' : '100%' }} />
               </div>
            </div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}