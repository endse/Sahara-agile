import React, { useState } from 'react';
import { ScreenId, TransitionType, Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { getNearingDeadlineTasks } from '../lib/deadlineUtils';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  onOpenMobileMenu?: () => void;
  onOpenSecurityModal?: () => void;
  onOpenWalkthrough?: () => void;
  tasks?: Task[];
  onSelectTask?: (task: Task) => void;
  rightActions?: React.ReactNode;
  managedSector?: string;
  onSelectManagedSector?: (sector: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  onNavigate,
  onOpenMobileMenu,
  onOpenSecurityModal,
  onOpenWalkthrough,
  tasks = [],
  onSelectTask,
  rightActions,
  managedSector = 'All Teams',
  onSelectManagedSector
}) => {
  const { user, userProfile, activeRole, switchActiveRole, signOutUser } = useAuth();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const nearingItems = getNearingDeadlineTasks(tasks);

  return (
    <header className="sticky top-0 z-30 bg-[#FDF8F3]/90 backdrop-blur-md border-b border-[#E5D5C0] px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
      {/* Title & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-[#5C4D42] hover:bg-[#E5D5C0] rounded-2xl transition-colors"
            aria-label="Open Navigation"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}

        <div>
          <h2 className="font-headline text-2xl lg:text-3xl font-light text-[#2D241E] tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-[#8B5E3C] hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Deadline Alerts Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className={`p-2 rounded-full transition-all relative flex items-center justify-center ${
              nearingItems.length > 0
                ? 'bg-amber-500/20 text-amber-900 border border-amber-500/40 hover:bg-amber-500/30'
                : 'text-[#5C4D42] hover:bg-[#F3E9DC]'
            }`}
            title={`${nearingItems.length} tasks nearing deadline`}
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {nearingItems.length > 0 && (
              <>
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-stone-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-yellow-600 shadow-xs">
                  {nearingItems.length}
                </span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75" />
              </>
            )}
          </button>

          {/* Alerts Popover Menu */}
          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1A1411] text-white border border-amber-500/30 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-lg">notifications_active</span>
                  <h4 className="font-bold text-sm text-white">Deadline Alerts Summary</h4>
                </div>
                <span className="bg-amber-400 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {nearingItems.length} Alerts
                </span>
              </div>

              {nearingItems.length === 0 ? (
                <p className="text-xs text-stone-400 py-3 text-center">
                  ✨ No task deadlines nearing in the next 7 days.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {nearingItems.map(({ task, info }) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        if (onSelectTask) onSelectTask(task);
                        onNavigate('Dashboard', 'none');
                        setIsAlertsOpen(false);
                      }}
                      className="p-2.5 bg-[#251D18] hover:bg-[#322721] rounded-xl border border-amber-500/20 cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                          {task.code}
                        </span>
                        <span className="text-[10px] bg-yellow-400 text-stone-950 font-bold px-2 py-0.5 rounded-full">
                          {info.statusLabel}
                        </span>
                      </div>
                      <h5 className="font-semibold text-xs text-stone-200 truncate">{task.title}</h5>
                      <p className="text-[10px] text-stone-400">Assigned to {task.assignee.name}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    onNavigate('Dashboard', 'none');
                    setIsAlertsOpen(false);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <span>View Dashboard Alerts</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button
                  onClick={() => setIsAlertsOpen(false)}
                  className="text-xs text-stone-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Walkthrough Tour Trigger */}
        {onOpenWalkthrough && (
          <button
            onClick={onOpenWalkthrough}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B5E3C] hover:bg-[#6f492e] text-white text-xs font-bold transition-all shadow-2xs"
            title="Launch Interactive Guided Walkthrough"
          >
            <span className="material-symbols-outlined text-base text-amber-300">route</span>
            <span className="hidden sm:inline">Guided Tour</span>
          </button>
        )}

        {/* /demo Hub Button */}
        <button
          onClick={() => onNavigate('Demo', 'none')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-2xs"
          title="Open Demo Data & Team Showcase Hub (/demo)"
        >
          <span className="material-symbols-outlined text-base">dataset</span>
          <span>/demo</span>
        </button>

        {/* Security Policy & RBAC Notes Modal Trigger */}
        <button
          onClick={onOpenSecurityModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-500/30 text-xs font-bold transition-all shadow-2xs"
          title="Notes on Security Considerations & RBAC Policy"
        >
          <span className="material-symbols-outlined text-base text-amber-600">verified_user</span>
          <span className="hidden md:inline">Security & RBAC Policy</span>
        </button>

        {/* Production Team Scope Selector */}
        {activeRole === 'Manager' ? (
          <div className="hidden sm:flex items-center gap-1 bg-[#F3E9DC] border border-[#E5D5C0] px-2.5 py-1 rounded-full text-xs font-bold text-[#3D3028]">
            <span className="material-symbols-outlined text-sm text-[#8B5E3C]">groups</span>
            <span className="text-[11px] text-[#8B5E3C]">Managing:</span>
            <select
              value={managedSector}
              onChange={(e) => onSelectManagedSector && onSelectManagedSector(e.target.value)}
              className="bg-transparent font-bold text-xs text-[#3D3028] focus:outline-none cursor-pointer pr-1"
            >
              <option value="All Teams">All Sector Teams</option>
              <option value="Hydro-Geology">Hydro-Geology</option>
              <option value="Grid Architecture">Grid Architecture</option>
              <option value="Field Robotics">Field Robotics</option>
              <option value="Ecology & Environment">Ecology & Environment</option>
              <option value="SatCom Telecom">SatCom Telecom</option>
            </select>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold text-amber-900">
            <span className="material-symbols-outlined text-sm text-amber-700">badge</span>
            <span>Team: {userProfile?.teamSector || 'Hydro-Geology'}</span>
          </div>
        )}

        {/* RBAC Active Role Badge & Quick Switcher */}
        <button
          onClick={() => switchActiveRole(activeRole === 'Manager' ? 'Employee' : 'Manager')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-2xs ${
            activeRole === 'Manager'
              ? 'bg-[#606C38]/15 text-[#606C38] border-[#606C38]/30 hover:bg-[#606C38]/25'
              : 'bg-blue-500/15 text-blue-800 border-blue-500/30 hover:bg-blue-500/25'
          }`}
          title={`Click to switch RBAC Role. Current: ${activeRole}`}
        >
          <span className="material-symbols-outlined text-base">
            {activeRole === 'Manager' ? 'admin_panel_settings' : 'badge'}
          </span>
          <span>Role: {activeRole}</span>
          <span className="text-[10px] opacity-75 hidden xl:inline">(Switch)</span>
        </button>

        {/* Search Trigger Button */}
        <button
          onClick={() => onNavigate('GlobalSearch', 'slide_up')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F3E9DC] hover:bg-[#E5D5C0] text-[#5C4D42] text-xs font-medium border-none transition-colors"
          title="Search project workspace"
        >
          <span className="material-symbols-outlined text-base text-[#D4A373]">search</span>
          <span className="hidden lg:inline">Global Search...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-[#FDF8F3] border border-[#E5D5C0] rounded text-[#8B5E3C]">⌘K</kbd>
        </button>

        {/* New Task Button */}
        <button
          onClick={() => onNavigate('NewTask', 'slide_up')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#606C38] hover:bg-[#4d572d] text-white text-xs font-medium shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => onNavigate('Settings', 'none')}
          className="p-2 text-[#5C4D42] hover:bg-[#F3E9DC] rounded-full transition-colors"
          title="Settings"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>

        {/* Sign Up / Account Profile Trigger */}
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('Profile', 'none')}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#D4A373] hover:ring-2 hover:ring-[#D4A373]/40 transition-all bg-[#E5D5C0]"
              title={`${userProfile?.displayName || user.email} (Manage Profile)`}
            >
              <img
                src={userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={userProfile?.displayName || 'User'}
                className="w-full h-full object-cover"
              />
            </button>
            <button
              onClick={signOutUser}
              className="p-1.5 rounded-full text-[#8B5E3C] hover:bg-[#F3E9DC] transition-colors text-xs flex items-center"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('SignUp', 'slide_up')}
            className="px-3 py-1.5 rounded-full bg-[#D4A373] hover:bg-[#b88657] text-white text-xs font-medium transition-colors"
          >
            Sign In
          </button>
        )}

        {rightActions}
      </div>
    </header>
  );
};


