import React, { useState } from 'react';
import { ScreenId } from '../../types';

interface SettingsProps {
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
}

export const SettingsScreen: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'notifications' | 'security'>('workspace');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [autoSyncInterval, setAutoSyncInterval] = useState('15');
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 lg:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A8793A]">
            <span className="material-symbols-outlined text-base">settings</span>
            Workspace Settings
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#171512] mt-1">
            Settings
          </h1>
          <p className="text-xs lg:text-sm text-[#625C52]">
            Manage workspace configuration, notifications, team access, and security.
          </p>
        </div>

        <button
          onClick={() => onNavigate('Dashboard', 'none')}
          className="px-4 py-2.5 bg-[#FBF9F4] hover:bg-[#F7F3EA] text-[#171512] border border-[#E4DDD0] rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E4DDD0] pb-3">
        {[
          { id: 'workspace', label: 'Workspace Profile', icon: 'domain' },
          { id: 'notifications', label: 'Notifications', icon: 'notifications' },
          { id: 'security', label: 'Security & Access', icon: 'security' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#C49A5A] text-[#0D0D0B] shadow-xs font-bold'
                : 'bg-white border border-[#E4DDD0] text-[#625C52] hover:bg-[#FBF9F4]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Save Toast */}
      {savedNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>Settings saved successfully!</span>
          <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
        </div>
      )}

      {/* Tab Contents */}
      <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 lg:p-8 space-y-6 shadow-xs">
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#171512]">Workspace Profile</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="workspace-name-input" className="text-xs font-bold text-[#171512] uppercase">Workspace Name</label>
                <input
                  id="workspace-name-input"
                  type="text"
                  defaultValue="Sahara Agile Works"
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#171512] outline-none focus:border-[#C49A5A]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sync-frequency-select" className="text-xs font-bold text-[#171512] uppercase">Sync Frequency</label>
                <select
                  id="sync-frequency-select"
                  value={autoSyncInterval}
                  onChange={(e) => setAutoSyncInterval(e.target.value)}
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#171512] outline-none focus:border-[#C49A5A]"
                >
                  <option value="5">Real-time (Every 5 mins)</option>
                  <option value="15">Balanced (Every 15 mins)</option>
                  <option value="60">Hourly</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="workspace-desc-input" className="text-xs font-bold text-[#171512] uppercase">Workspace Overview</label>
                <textarea
                  id="workspace-desc-input"
                  rows={3}
                  defaultValue="Agile project management tool for coordinating projects, user stories, sprint tasks, and team deliverables."
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-3 text-xs font-medium text-[#171512] outline-none focus:border-[#C49A5A]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#171512]">Notification Preferences</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#FBF9F4] rounded-xl border border-[#E4DDD0]">
                <div>
                  <h4 className="text-xs font-bold text-[#171512]">Task Deadline Alerts</h4>
                  <p className="text-[11px] text-[#625C52]">Notify 7 days prior to task due date breaches.</p>
                </div>
                <input
                  type="checkbox"
                  checked={deadlineAlerts}
                  onChange={(e) => setDeadlineAlerts(e.target.checked)}
                  className="w-5 h-5 accent-[#C49A5A] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FBF9F4] rounded-xl border border-[#E4DDD0]">
                <div>
                  <h4 className="text-xs font-bold text-[#171512]">Email Digest Notifications</h4>
                  <p className="text-[11px] text-[#625C52]">Send daily sprint progress summaries.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 accent-[#C49A5A] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#171512]">Security & Authentication</h3>

            <div className="space-y-4">
              <div className="p-4 bg-[#FBF9F4] rounded-xl border border-[#E4DDD0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171512]">HttpOnly JWT Session Protection</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Active</span>
                </div>
                <p className="text-[11px] text-[#625C52]">
                  Authentication tokens are stored in secure HttpOnly cookies.
                </p>
              </div>

              <button
                onClick={() => onNavigate('SignUp', 'slide_up')}
                className="w-full bg-[#FBF9F4] hover:bg-[#F7F3EA] text-[#171512] border border-[#E4DDD0] p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#A8793A]">manage_accounts</span>
                <span>Manage Sign In Account & Roles</span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#E4DDD0] flex items-center justify-end gap-3">
          <button
            onClick={() => onNavigate('Dashboard', 'none')}
            className="px-4 py-2 rounded-xl bg-[#FBF9F4] text-[#625C52] text-xs font-semibold hover:bg-[#F7F3EA] border border-[#E4DDD0] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
