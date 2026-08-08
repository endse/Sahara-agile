import React, { useState } from 'react';
import { ScreenId } from '../../types';

interface SettingsProps {
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
}

export const SettingsScreen: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'notifications' | 'telemetry' | 'security'>('workspace');
  const [satcomAlerts, setSatcomAlerts] = useState(true);
  const [thermalBreachAlert, setThermalBreachAlert] = useState(true);
  const [autoSyncInterval, setAutoSyncInterval] = useState('15');
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-[#f2ece4] border border-[#e0d8cc] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c2652a]">
            <span className="material-symbols-outlined text-base">settings</span>
            Workspace Configuration
          </div>
          <h1 className="font-headline text-3xl lg:text-4xl font-bold text-[#3a302a] mt-1">
            Settings - Sahara
          </h1>
          <p className="text-sm text-[#605850]">
            Manage telemetry sync frequencies, regional alerts, team roles, and SatCom encryption.
          </p>
        </div>

        <button
          onClick={() => onNavigate('Dashboard', 'none')}
          className="px-4 py-2.5 bg-[#faf5ee] hover:bg-[#ffffff] text-[#3a302a] border border-[#e0d8cc] rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#e0d8cc] pb-3">
        {[
          { id: 'workspace', label: 'Workspace Profile', icon: 'domain' },
          { id: 'notifications', label: 'Field Notifications', icon: 'notifications' },
          { id: 'telemetry', label: 'Telemetry & SatCom', icon: 'satellite_alt' },
          { id: 'security', label: 'Security & Access', icon: 'security' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#c2652a] text-white shadow-xs'
                : 'bg-[#f2ece4] text-[#605850] hover:bg-[#e6e0d6]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Save Toast */}
      {savedNotification && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>Settings saved successfully! Telemetry parameters updated.</span>
          <span className="material-symbols-outlined text-base">check_circle</span>
        </div>
      )}

      {/* Tab Contents */}
      <div className="bg-[#f2ece4] border border-[#e0d8cc] rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm">
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            <h3 className="font-headline text-xl font-bold text-[#3a302a]">Workspace Parameters</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3a302a] uppercase">Workspace Name</label>
                <input
                  type="text"
                  defaultValue="Sahara Agile Hydro-Solar Initiative"
                  className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-xl px-4 py-2.5 text-xs font-medium text-[#3a302a] outline-none focus:border-[#c2652a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3a302a] uppercase">Primary Field Sector</label>
                <select className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-xl px-4 py-2.5 text-xs font-medium text-[#3a302a] outline-none focus:border-[#c2652a]">
                  <option>Sector 04 — Al-Kufra Hydro Hub</option>
                  <option>Sector 02 — Djanet Solar Basin</option>
                  <option>Sector 01 — Tibesti Highland Base</option>
                  <option>Sector 05 — Siwa Oasis Preserve</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#3a302a] uppercase">Project Objective Summary</label>
                <textarea
                  rows={3}
                  defaultValue="Deploying sustainable hydro-geological water harvesting, autonomous sand shield protection, and solar microgrid infrastructure across Northern Sahara sectors."
                  className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-xl p-4 text-xs font-medium text-[#3a302a] outline-none focus:border-[#c2652a]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="font-headline text-xl font-bold text-[#3a302a]">Alert Preferences</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#faf5ee] rounded-2xl border border-[#e6e0d6]">
                <div>
                  <h4 className="text-xs font-bold text-[#3a302a]">SatCom Emergency Alerts</h4>
                  <p className="text-[11px] text-[#78706a]">Notify immediately when solar flare or transmission loss threatens satellite relay.</p>
                </div>
                <input
                  type="checkbox"
                  checked={satcomAlerts}
                  onChange={(e) => setSatcomAlerts(e.target.checked)}
                  className="w-5 h-5 accent-[#c2652a] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#faf5ee] rounded-2xl border border-[#e6e0d6]">
                <div>
                  <h4 className="text-xs font-bold text-[#3a302a]">Thermal Threshold Warnings (&gt;45°C)</h4>
                  <p className="text-[11px] text-[#78706a]">Trigger visual amber banners on Dashboard when array temperature exceeds limits.</p>
                </div>
                <input
                  type="checkbox"
                  checked={thermalBreachAlert}
                  onChange={(e) => setThermalBreachAlert(e.target.checked)}
                  className="w-5 h-5 accent-[#c2652a] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <h3 className="font-headline text-xl font-bold text-[#3a302a]">SatCom Telemetry Sync</h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3a302a] uppercase">Auto-Sync Pulse Frequency</label>
                <select
                  value={autoSyncInterval}
                  onChange={(e) => setAutoSyncInterval(e.target.value)}
                  className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-xl px-4 py-2.5 text-xs font-medium text-[#3a302a] outline-none"
                >
                  <option value="5">Every 5 minutes (High bandwidth)</option>
                  <option value="15">Every 15 minutes (Balanced - Recommended)</option>
                  <option value="60">Every 60 minutes (Low bandwidth)</option>
                </select>
              </div>

              <div className="p-4 bg-[#faf5ee] rounded-2xl border border-[#e6e0d6] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#3a302a]">SaharaSat-2 Satellite Link</span>
                  <p className="text-[11px] text-emerald-700 font-semibold">Latency: 18ms • Signal Strength: 98%</p>
                </div>
                <span className="material-symbols-outlined text-2xl text-emerald-600">satellite_alt</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="font-headline text-xl font-bold text-[#3a302a]">Security & Access Credentials</h3>

            <div className="space-y-4">
              <div className="p-4 bg-[#faf5ee] rounded-2xl border border-[#e6e0d6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3a302a]">Authentication & Token Vault</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Active & Secure</span>
                </div>
                <p className="text-[11px] text-[#78706a]">
                  Managed securely via server-side session authentication tokens.
                </p>
              </div>

              <button
                onClick={() => onNavigate('SignUp', 'slide_up')}
                className="w-full bg-[#faf5ee] hover:bg-[#ffffff] text-[#3a302a] border border-[#d8d0c8] p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">manage_accounts</span>
                <span>Manage Sign Up Credentials & Access Tokens</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Save Action */}
        <div className="pt-4 border-t border-[#e0d8cc] flex items-center justify-end gap-3">
          <button
            onClick={() => onNavigate('Dashboard', 'none')}
            className="px-5 py-2.5 rounded-xl bg-[#faf5ee] hover:bg-[#ffffff] text-[#605850] text-xs font-bold border border-[#e0d8cc]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#c2652a] hover:bg-[#a8541f] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
