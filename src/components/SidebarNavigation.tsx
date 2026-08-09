import React from 'react';
import { ScreenId } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarNavigation: React.FC<SidebarProps> = ({ currentScreen, onNavigate, isOpenMobile, onCloseMobile }) => {
  const { user, userProfile, activeRole, switchActiveRole, signOutUser } = useAuth();

  const navItems = [
    { id: 'Dashboard' as ScreenId, label: 'Dashboard', icon: 'dashboard', isManagerOnly: false },
    { id: 'PerformanceAnalytics' as ScreenId, label: 'Analytics & Graphs', icon: 'insights', isManagerOnly: false },
    { id: 'TaskBoard' as ScreenId, label: 'Task Board', icon: 'view_kanban', isManagerOnly: false },
    { id: 'UserStories' as ScreenId, label: 'User Stories', icon: 'auto_stories', isManagerOnly: true },
    { id: 'ProjectTimeline' as ScreenId, label: 'Project Timeline', icon: 'timeline', isManagerOnly: false },
    { id: 'ProjectMap' as ScreenId, label: 'Project Map', icon: 'map', isManagerOnly: false },
    { id: 'TeamSync' as ScreenId, label: 'Team Sync', icon: 'groups', isManagerOnly: false },
    { id: 'AttendanceLog' as ScreenId, label: 'Attendance & Clock', icon: 'schedule', isManagerOnly: false },
    { id: 'AsyncReports' as ScreenId, label: 'Async Reports', icon: 'memory', isManagerOnly: true },
  ];

  const handleNavClick = (screen: ScreenId) => {
    onNavigate(screen, 'none');
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#F3E9DC] border-r border-[#E5D5C0] flex flex-col justify-between transition-transform duration-300 ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Brand Header & Role Switcher Banner */}
        <div className="p-6 border-b border-[#E5D5C0] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5E3C] text-[#FDF8F3] flex items-center justify-center font-headline text-xl font-bold shadow-sm">
                S
              </div>
              <div>
                <h1 className="font-headline text-2xl font-semibold text-[#3D3028] leading-none tracking-tight">Sahara</h1>
                <span className="text-[10px] tracking-widest font-semibold uppercase text-[#8B5E3C]">Agile Workspace</span>
              </div>
            </div>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden text-[#5C4D42] hover:text-[#3D3028] p-1 rounded-lg hover:bg-[#E5D5C0]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {/* Active Role Indicator Card */}
          <div className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs ${
            activeRole === 'Manager'
              ? 'bg-[#606C38]/10 border-[#606C38]/30 text-[#4d572d]'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-900'
          }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                {activeRole === 'Manager' ? 'admin_panel_settings' : 'badge'}
              </span>
              <div>
                <span className="font-bold block leading-tight">
                  {activeRole === 'Manager' ? 'Manager Mode' : 'Employee View'}
                </span>
                <span className="text-[10px] opacity-80">
                  {activeRole === 'Manager' ? 'Full Control' : 'Restricted Role'}
                </span>
              </div>
            </div>
            <button
              onClick={() => switchActiveRole(activeRole === 'Manager' ? 'Employee' : 'Manager')}
              className="px-2 py-1 bg-white/80 hover:bg-white text-[10px] font-bold rounded-lg border shadow-2xs transition-all shrink-0"
              title="Toggle Active Role for Testing"
            >
              Switch
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => onNavigate('NewTask', 'slide_up')}
            className="w-full bg-[#606C38] hover:bg-[#4d572d] active:scale-[0.98] text-white font-medium py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
          >
            <span className="material-symbols-outlined text-lg">add_task</span>
            <span>New Task</span>
          </button>

          <button
            onClick={() => onNavigate('NewProject', 'slide_up')}
            className={`w-full font-medium py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm relative ${
              activeRole === 'Manager'
                ? 'bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0]'
                : 'bg-stone-200/60 text-stone-500 border border-stone-300 cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-[#D4A373]">
              {activeRole === 'Manager' ? 'add_location_alt' : 'lock'}
            </span>
            <span>New Project</span>
            {activeRole !== 'Manager' && (
              <span className="bg-amber-200 text-amber-900 font-bold text-[9px] px-1.5 py-0.5 rounded uppercase">
                Manager
              </span>
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav aria-label="Sidebar Navigation" className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id || (item.id === 'TaskBoard' && currentScreen === 'TaskBoardActivity');
            const isLockedForEmployee = activeRole === 'Employee' && item.isManagerOnly;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#D4A373] text-white shadow-sm font-medium'
                    : isLockedForEmployee
                    ? 'text-[#8B5E3C]/70 hover:bg-[#E5D5C0]/60'
                    : 'text-[#5C4D42] hover:bg-[#E5D5C0] hover:text-[#3D3028]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`material-symbols-outlined text-xl ${isActive ? 'fill' : ''}`}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.isManagerOnly && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : activeRole === 'Manager'
                      ? 'bg-[#606C38]/15 text-[#606C38]'
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {activeRole === 'Manager' ? 'Mgr' : '🔒 Mgr'}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Secondary Links & Profile */}
        <div className="p-4 border-t border-[#E5D5C0] space-y-1.5">
          <button
            onClick={() => onNavigate('Profile', 'none')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
              currentScreen === 'Profile'
                ? 'bg-[#D4A373] text-white font-medium'
                : 'text-[#5C4D42] hover:bg-[#E5D5C0] hover:text-[#3D3028]'
            }`}
          >
            <span className="material-symbols-outlined text-xl">account_circle</span>
            <span>Operator Profile</span>
          </button>

          <button
            onClick={() => onNavigate('GlobalSearch', 'slide_up')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors text-[#5C4D42] hover:bg-[#E5D5C0] hover:text-[#3D3028] ${
              currentScreen === 'GlobalSearch' ? 'bg-[#E5D5C0] text-[#3D3028]' : ''
            }`}
          >
            <span className="material-symbols-outlined text-xl">search</span>
            <span>Global Search</span>
          </button>

          <button
            onClick={() => onNavigate('Settings', 'none')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors text-[#5C4D42] hover:bg-[#E5D5C0] hover:text-[#3D3028] ${
              currentScreen === 'Settings' ? 'bg-[#D4A373] text-white font-medium' : ''
            }`}
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span>Settings</span>
          </button>

          {!user && (
            <button
              onClick={() => onNavigate('SignUp', 'slide_up')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-[#8B5E3C] hover:bg-[#E5D5C0] hover:text-[#3D3028] transition-colors"
            >
              <span className="material-symbols-outlined text-xl">login</span>
              <span>Account / Sign In</span>
            </button>
          )}
        </div>

        {/* Dynamic User Footer Profile */}
        <div className="p-4 bg-[#E5D5C0]/50 border-t border-[#E5D5C0] flex items-center justify-between">
          <button
            onClick={() => onNavigate('Profile', 'none')}
            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity flex-1 min-w-0"
            title="Open Dynamic Profile"
          >
            <img
              src={
                userProfile?.photoURL ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
              }
              alt={userProfile?.displayName || 'User Avatar'}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#D4A373] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#3D3028] leading-tight truncate">
                {userProfile?.displayName || user?.email || 'Guest Operator'}
              </p>
              <p className="text-[11px] text-[#8B5E3C] truncate">
                {userProfile?.role || 'Field Operations'}
              </p>
            </div>
          </button>

          {user ? (
            <button
              onClick={signOutUser}
              className="text-[#8B5E3C] hover:text-[#BC4749] p-1.5 transition-colors shrink-0"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('SignUp', 'slide_up')}
              className="text-[#D4A373] hover:text-[#3D3028] p-1.5 transition-colors shrink-0"
              title="Sign In"
            >
              <span className="material-symbols-outlined text-lg">login</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
