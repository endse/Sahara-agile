import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenWalkthrough?: () => void;
}

type GroupId = 'WORKSPACE' | 'INSIGHTS' | 'TEAM' | 'SYSTEM';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: string;
  isManagerOnly?: boolean;
}

interface NavGroup {
  id: GroupId;
  label: string;
  items: NavItem[];
}

export const SidebarNavigation: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { userProfile, activeRole } = useAuth();

  const navGroups: NavGroup[] = [
    {
      id: 'WORKSPACE',
      label: 'WORKSPACE',
      items: [
        { id: 'Dashboard', label: 'Dashboard', icon: 'dashboard', isManagerOnly: false },
        { id: 'Projects', label: 'Projects', icon: 'folder_open', isManagerOnly: false },
        { id: 'ProjectMap', label: 'Project Map', icon: 'map', isManagerOnly: false },
        { id: 'UserStories', label: 'User Stories', icon: 'auto_stories', isManagerOnly: true },
        { id: 'TaskBoardActivity', label: 'Tasks', icon: 'task', isManagerOnly: false },
        { id: 'TaskBoard', label: 'Task Board', icon: 'view_kanban', isManagerOnly: false },
      ],
    },
    {
      id: 'INSIGHTS',
      label: 'INSIGHTS',
      items: [
        { id: 'PerformanceAnalytics', label: 'Analytics', icon: 'insights', isManagerOnly: false },
        { id: 'ProjectTimeline', label: 'Timeline', icon: 'timeline', isManagerOnly: false },
        { id: 'AsyncReports', label: 'Async Reports', icon: 'memory', isManagerOnly: true },
      ],
    },
    {
      id: 'TEAM',
      label: 'TEAM',
      items: [
        { id: 'TeamSync', label: 'Team', icon: 'groups', isManagerOnly: false },
        { id: 'AttendanceLog', label: 'Attendance Log', icon: 'schedule', isManagerOnly: false },
      ],
    },
    {
      id: 'SYSTEM',
      label: 'SYSTEM',
      items: [
        { id: 'Settings', label: 'Settings', icon: 'settings', isManagerOnly: false },
      ],
    },
  ];

  // Helper to determine which group owns the given screen
  const getGroupForScreen = (screen: ScreenId): GroupId => {
    for (const group of navGroups) {
      if (group.items.some((item) => item.id === screen)) {
        return group.id;
      }
    }
    return 'WORKSPACE';
  };

  // State: Only 1 group open at a time
  const [openGroup, setOpenGroup] = useState<GroupId>(() => getGroupForScreen(currentScreen));

  // Automatically open group if currentScreen changes
  useEffect(() => {
    const parentGroup = getGroupForScreen(currentScreen);
    setOpenGroup(parentGroup);
  }, [currentScreen]);

  const toggleGroup = (groupId: GroupId) => {
    setOpenGroup((prev) => (prev === groupId ? groupId : groupId));
  };

  const handleNavClick = (screen: ScreenId) => {
    onNavigate(screen, 'none');
    if (onCloseMobile) onCloseMobile();
  };

  const handleBrandClick = () => {
    onNavigate('Dashboard', 'none');
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#171613] border-r border-[#302B24] flex flex-col justify-between transition-transform duration-300 ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Clickable Sahara Brand Header */}
        <div
          onClick={handleBrandClick}
          className="p-5 border-b border-[#302B24] flex items-center justify-between cursor-pointer hover:bg-[#24211C] transition-colors group select-none"
          title="Sahara Agile Works — Go to Dashboard"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C49A5A] text-[#0D0D0B] flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <h1 className="font-bold text-base text-[#F7F3EA] leading-tight tracking-tight group-hover:text-[#C49A5A] transition-colors">
                Sahara
              </h1>
              <span className="text-[10px] tracking-widest font-semibold uppercase text-[#C49A5A]">
                AGILE WORKSPACE
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseMobile();
              }}
              className="lg:hidden text-[#8A8378] hover:text-[#F7F3EA] p-1 rounded-lg hover:bg-[#24211C]"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>

        {/* Quick Action CTA */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => onNavigate('NewTask', 'slide_up')}
            className="w-full bg-[#C49A5A] hover:bg-[#A8793A] active:scale-[0.98] text-[#0D0D0B] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all text-xs"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>+ New Task</span>
          </button>
        </div>

        {/* Navigation Content Accordion */}
        <nav aria-label="Sidebar Navigation" className="flex-1 px-3 py-2 space-y-3 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => {
            const isExpanded = openGroup === group.id;
            const containsActive = group.items.some((item) => item.id === currentScreen);

            return (
              <div key={group.id} className="space-y-1">
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                    containsActive
                      ? 'text-[#C49A5A] bg-[#24211C]/40'
                      : 'text-[#8A8378] hover:text-[#F7F3EA] hover:bg-[#24211C]/60'
                  }`}
                >
                  <span className="truncate">{group.label}</span>
                  <span className="material-symbols-outlined text-sm transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    chevron_right
                  </span>
                </button>

                {/* Accordion Child Navigation Items */}
                {isExpanded && (
                  <div className="pl-1 space-y-1 transition-all">
                    {group.items.map((item) => {
                      const isActive = currentScreen === item.id;
                      const isLockedForEmployee = activeRole === 'Employee' && item.isManagerOnly;

                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item.id);
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-[#C49A5A]/15 text-[#C49A5A] font-bold border border-[#C49A5A]/30 shadow-2xs'
                              : isLockedForEmployee
                              ? 'text-[#8A8378]/60 hover:bg-[#24211C]'
                              : 'text-[#8A8378] hover:bg-[#24211C] hover:text-[#F7F3EA]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`material-symbols-outlined text-base ${
                                isActive ? 'text-[#C49A5A] fill' : 'text-[#8A8378]'
                              }`}
                            >
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.isManagerOnly && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                                isActive
                                  ? 'bg-[#C49A5A]/30 text-[#D6B77A]'
                                  : activeRole === 'Manager'
                                  ? 'bg-[#24211C] text-[#8A8378]'
                                  : 'bg-[#C49A5A]/20 text-[#D6B77A]'
                              }`}
                            >
                              {activeRole === 'Manager' ? 'Manager' : '🔒 Manager'}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Verified Role Footer Badge */}
        <div className="p-3 bg-[#24211C] border-t border-[#302B24] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${activeRole === 'Manager' ? 'bg-[#C49A5A]' : 'bg-[#D6B77A]'}`} />
            <span className="font-semibold text-[#F7F3EA] text-[11px]">
              {userProfile?.role || activeRole}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#C49A5A] uppercase tracking-wider">
            {activeRole}
          </span>
        </div>
      </div>
    </aside>
  );
};
