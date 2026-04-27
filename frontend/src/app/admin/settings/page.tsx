"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Shield, Database, Mail, Bell, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
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
      if (res.status === 'success') {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw size={32} className="animate-spin text-lime-500" />
    </div>
  );

  const settingSections = [
    {
      title: 'System Configuration',
      icon: Settings,
      items: [
        { key: 'site_name', label: 'Site Name', type: 'text', value: settings.site_name || 'Umoja Sacco' },
        { key: 'site_url', label: 'Site URL', type: 'text', value: settings.site_url || 'https://umoja-sacco.com' },
        { key: 'timezone', label: 'Timezone', type: 'select', value: settings.timezone || 'Africa/Nairobi', options: ['Africa/Nairobi', 'UTC', 'Africa/Kampala'] },
      ]
    },
    {
      title: 'Financial Settings',
      icon: Database,
      items: [
        { key: 'default_currency', label: 'Default Currency', type: 'text', value: settings.default_currency || 'KES' },
        { key: 'loan_interest_rate', label: 'Default Loan Interest Rate (%)', type: 'number', value: settings.loan_interest_rate || 12 },
        { key: 'share_value', label: 'Share Value (KES)', type: 'number', value: settings.share_value || 1000 },
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { key: 'email_notifications', label: 'Email Notifications', type: 'checkbox', value: settings.email_notifications || true },
        { key: 'sms_notifications', label: 'SMS Notifications', type: 'checkbox', value: settings.sms_notifications || false },
        { key: 'admin_email', label: 'Admin Email', type: 'email', value: settings.admin_email || 'admin@umoja-sacco.com' },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { key: 'session_timeout', label: 'Session Timeout (minutes)', type: 'number', value: settings.session_timeout || 60 },
        { key: 'password_min_length', label: 'Minimum Password Length', type: 'number', value: settings.password_min_length || 8 },
        { key: 'two_factor_auth', label: 'Two-Factor Authentication', type: 'checkbox', value: settings.two_factor_auth || false },
      ]
    }
  ];

  return (
    <div className="space-y-6" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure your Sacco's system preferences and settings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadSettings}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-lime-500 text-white rounded-xl hover:bg-lime-600 transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-lime-100 rounded-xl flex items-center justify-center">
                <section.icon size={20} className="text-lime-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
            </div>

            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex-1">
                    {item.label}
                  </label>
                  <div className="flex-1 max-w-xs">
                    {item.type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={item.value}
                        onChange={(e) => setSettings({...settings, [item.key]: e.target.checked})}
                        className="w-4 h-4 text-lime-600 bg-gray-100 border-gray-300 rounded focus:ring-lime-500"
                      />
                    ) : item.type === 'select' ? (
                      <select
                        value={item.value}
                        onChange={(e) => setSettings({...settings, [item.key]: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      >
                        {item.options?.map((option: string) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={item.type}
                        value={item.value}
                        onChange={(e) => setSettings({...settings, [item.key]: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">System Health</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-black text-gray-900">{settings.health || 95}%</div>
            <div className="text-sm text-gray-600">System Health</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-black text-gray-900">{settings.db_size || 'N/A'}</div>
            <div className="text-sm text-gray-600">Database Size</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-black text-gray-900">{settings.uptime || '24h'}</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}