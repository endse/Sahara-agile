import React, { useState, useRef, useEffect } from 'react';
import { ScreenId, TransitionType, Task, AppNotification } from '../types';
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
  notifications?: AppNotification[];
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
  notifications = [],
}) => {
  const { user, userProfile, activeRole, switchActiveRole, signOutUser } = useAuth();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const nearingItems = getNearingDeadlineTasks(tasks);
  const alertCount = nearingItems.length + notifications.length;

  const notificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'task_assigned': return 'person_add';
      case 'task_created': return 'add_task';
      case 'story_created': return 'auto_stories';
      case 'project_created': return 'account_tree';
      case 'status_changed': return 'sync';
      default: return 'notifications';
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F4]/90 backdrop-blur-md border-b border-[#E4DDD0] px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Page Title & Context */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-[#625C52] hover:bg-[#E4DDD0]/60 rounded-xl transition-colors"
            aria-label="Open Navigation"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}

        <div>
          <h2 className="font-bold text-xl lg:text-2xl text-[#171512] tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-[#625C52] hidden sm:block mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Header Action Controls */}
      <div className="flex items-center justify-end gap-2.5">
        {/* Deadline Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className={`p-2 rounded-xl transition-all relative flex items-center justify-center ${
              alertCount > 0
                ? 'bg-[#C49A5A]/15 text-[#A8793A] border border-[#C49A5A]/30 hover:bg-[#C49A5A]/25'
                : 'text-[#625C52] hover:bg-[#E4DDD0]/60'
            }`}
            title={`${alertCount} notifications`}
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C49A5A] text-[#0D0D0B] font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                {alertCount}
              </span>
            )}
          </button>

          {/* Alerts Popover */}
          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#171613] border border-[#302B24] text-[#F7F3EA] rounded-2xl shadow-xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-[#302B24] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#C49A5A] text-lg">notifications_active</span>
                  <h4 className="font-bold text-sm text-[#F7F3EA]">Deadline Notifications</h4>
                </div>
                <span className="bg-[#C49A5A]/20 text-[#D6B77A] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C49A5A]/30">
                  {nearingItems.length} Active
                </span>
              </div>

              {nearingItems.length === 0 ? (
                <p className="text-xs text-[#8A8378] py-4 text-center">
                  No task deadlines nearing in the next 7 days.
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
                      className="p-2.5 bg-[#24211C] hover:bg-[#302B24] rounded-xl border border-[#302B24] cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-[#D6B77A] font-bold bg-[#171613] px-1.5 py-0.5 rounded border border-[#302B24]">
                          {task.code}
                        </span>
                        <span className="text-[10px] bg-[#C49A5A]/20 text-[#D6B77A] font-bold px-2 py-0.5 rounded-full border border-[#C49A5A]/30">
                          {info.statusLabel}
                        </span>
                      </div>
                      <h5 className="font-semibold text-xs text-[#F7F3EA] truncate">{task.title}</h5>
                      <p className="text-[10px] text-[#8A8378]">Assigned to {task.assignee.name}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-[#302B24] flex items-center justify-between">
                <button
                  onClick={() => {
                    onNavigate('Dashboard', 'none');
                    setIsAlertsOpen(false);
                  }}
                  className="text-xs text-[#C49A5A] hover:text-[#D6B77A] font-bold flex items-center gap-1"
                >
                  <span>Go to Dashboard</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button
                  onClick={() => setIsAlertsOpen(false)}
                  className="text-xs text-[#8A8378] hover:text-[#F7F3EA]"
                >
                  Close
                </button>
              </div>

              {/* Recent Activity Feed (AppNotification events) */}
              <div className="pt-2 border-t border-[#302B24]">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#C49A5A] text-base">history</span>
                    <h4 className="font-bold text-sm text-[#F7F3EA]">Recent Activity</h4>
                  </div>
                  {notifications.length > 0 && (
                    <span className="bg-[#C49A5A]/20 text-[#D6B77A] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C49A5A]/30">
                      {notifications.length} Events
                    </span>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-[#8A8378] py-2 text-center">
                    No recent activity events yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (n.targetScreen) onNavigate(n.targetScreen, 'none');
                          setIsAlertsOpen(false);
                        }}
                        className="p-2.5 bg-[#24211C] hover:bg-[#302B24] rounded-xl border border-[#302B24] cursor-pointer transition-colors flex items-start gap-2.5"
                      >
                        <span className="material-symbols-outlined text-[#D6B77A] text-base mt-0.5">
                          {notificationIcon(n.type)}
                        </span>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-bold text-xs text-[#F7F3EA] truncate">{n.title}</h5>
                            <span className="text-[10px] text-[#8A8378] shrink-0">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8A8378] line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Global Search Button */}
        <button
          onClick={() => onNavigate('GlobalSearch', 'slide_up')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F7F3EA] text-[#625C52] text-xs font-medium transition-colors border border-[#E4DDD0]"
          title="Search workspace (⌘K)"
        >
          <span className="material-symbols-outlined text-base text-[#8A8378]">search</span>
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-[#FBF9F4] border border-[#E4DDD0] rounded text-[#8A8378]">⌘K</kbd>
        </button>

        {/* + New Task Primary CTA */}
        <button
          onClick={() => onNavigate('NewTask', 'slide_up')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] text-xs font-bold shadow-xs transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* Functional Header Sign In / Profile Dropdown Menu */}
        {user ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#E4DDD0]/50 transition-colors border border-transparent hover:border-[#E4DDD0]"
              title="Account Menu"
            >
              <img
                src={
                  userProfile?.photoURL ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt={userProfile?.displayName || 'User Avatar'}
                className="w-8 h-8 rounded-full object-cover border border-[#C49A5A]"
              />
              <span className="material-symbols-outlined text-[#625C52] text-base hidden sm:inline">
                expand_more
              </span>
            </button>

            {/* Authenticated Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#171613] border border-[#302B24] text-[#F7F3EA] rounded-2xl shadow-xl p-2 z-50 space-y-1">
                {/* User Card Header */}
                <div className="p-3 border-b border-[#302B24] bg-[#24211C] rounded-xl space-y-1">
                  <p className="text-xs font-bold text-[#F7F3EA] truncate">
                    {userProfile?.displayName || user.email || 'Authenticated User'}
                  </p>
                  <p className="text-[11px] text-[#8A8378] truncate">{user.email}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-[#D6B77A] bg-[#C49A5A]/20 px-2 py-0.5 rounded-full border border-[#C49A5A]/30">
                      Role: {activeRole}
                    </span>
                    <button
                      onClick={() => {
                        const newRole = activeRole === 'Manager' ? 'Employee' : 'Manager';
                        switchActiveRole(newRole);
                      }}
                      className="text-[#8A8378] hover:text-[#C49A5A] underline font-medium"
                    >
                      Switch to {activeRole === 'Manager' ? 'Employee' : 'Manager'}
                    </button>
                  </div>
                </div>

                {/* Profile Link */}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate('Profile', 'none');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#F7F3EA] hover:bg-[#24211C] transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-base text-[#C49A5A]">account_circle</span>
                  <span>View Profile</span>
                </button>

                {/* Guided Tour Trigger */}
                {onOpenWalkthrough && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenWalkthrough();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#F7F3EA] hover:bg-[#24211C] transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-base text-[#D6B77A]">route</span>
                    <span>Interactive Guided Tour</span>
                  </button>
                )}

                {/* Security & RBAC Policy Trigger */}
                {onOpenSecurityModal && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenSecurityModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#F7F3EA] hover:bg-[#24211C] transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-base text-[#C49A5A]">shield</span>
                    <span>Security & RBAC Policy</span>
                  </button>
                )}

                {/* Demo Hub Link */}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate('Demo', 'none');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#F7F3EA] hover:bg-[#24211C] transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-base text-[#D6B77A]">dataset</span>
                  <span>Demo Hub (/demo)</span>
                </button>

                <div className="border-t border-[#302B24] pt-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      signOutUser();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left font-medium"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => onNavigate('SignUp', 'slide_up')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171613] hover:bg-[#24211C] text-[#F7F3EA] text-xs font-bold transition-colors shadow-xs border border-[#302B24]"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Sign In</span>
          </button>
        )}

        {rightActions}
      </div>
    </header>
  );
};
