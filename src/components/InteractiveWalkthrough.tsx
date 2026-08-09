import React, { useState, useEffect } from 'react';
import { ScreenId, WalkthroughRole, WalkthroughStep } from '../types';

interface InteractiveWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: WalkthroughRole;
  onSwitchRole: (role: WalkthroughRole) => void;
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
  onSeedDemoData?: () => void;
}

export const MANAGER_STEPS: WalkthroughStep[] = [
  {
    title: 'Welcome, Operations Manager',
    subtitle: 'Executive command center overview for Sahara Agile operations',
    icon: 'admin_panel_settings',
    description: 'As an Operations Manager, you have full access to high-level sprint telemetry, infrastructure project registration, user story mapping, employee attendance verification, and enterprise async reports.',
    bullets: [
      'Full RBAC privileges across all administrative tools & screens',
      'Create and manage user story epics & acceptance criteria',
      'Approve employee timesheets & audit field overtime logs',
      'Run heavy async database queries and export enterprise reports'
    ],
    targetScreen: 'Dashboard',
    actionLabel: 'View Executive Dashboard'
  },
  {
    title: 'Dashboard & Regional Overview',
    subtitle: 'Monitor active sector metrics and team activity logs',
    icon: 'dashboard',
    description: 'The Dashboard aggregates real-time metrics across all field sectors including high-priority task counts, site locations, live activity feeds, and station hours.',
    bullets: [
      'Track live mission task status across Kanban columns',
      'Inspect real-time telemetry activity logs from field operators',
      'Review team roster active field statuses and station assignments'
    ],
    targetScreen: 'Dashboard',
    actionLabel: 'Inspect Dashboard Metrics'
  },
  {
    title: 'User Stories & Epic Hierarchy',
    subtitle: 'Map high-level project goals down to mission tasks',
    icon: 'auto_stories',
    description: 'Manage the complete agile hierarchy: Infrastructure Site ➔ User Story Epics ➔ Executable Kanban Tasks with story point estimation.',
    bullets: [
      'Create new user stories with detailed acceptance criteria',
      'Assign story points (1, 2, 3, 5, 8, 13) and priority statuses',
      'Track story completion percentage across project sites'
    ],
    targetScreen: 'UserStories',
    actionLabel: 'Open User Stories Manager'
  },
  {
    title: 'GIS Project Map & Infrastructure',
    subtitle: 'Initialize field sites and monitor geographical coordinates',
    icon: 'map',
    description: 'Register new infrastructure projects, set sector budgets, and track GPS coordinates across Sahara sectors.',
    bullets: [
      'Register new project sites via /new-project (Manager only)',
      'Monitor ambient weather conditions, humidity, and UV indexes',
      'Track site leads, crew count allocations, and active warnings'
    ],
    targetScreen: 'ProjectMap',
    actionLabel: 'View Interactive GIS Map'
  },
  {
    title: 'Attendance Ledger & Shift Approvals',
    subtitle: 'Audit clock-in timestamps, work notes, and overtime',
    icon: 'schedule',
    description: 'Review employee shift logs, verify work notes against sensor telemetry, and approve or flag overtime requests.',
    bullets: [
      'View complete shift histories across all operators',
      'Approve pending timesheets with 1-click verification',
      'Flag unverified absences or overtime discrepancies'
    ],
    targetScreen: 'AttendanceLog',
    actionLabel: 'Audit Timesheets & Attendance'
  },
  {
    title: 'Asynchronous Background Jobs',
    subtitle: 'Execute heavy database audits and automated reports',
    icon: 'memory',
    description: 'Queue asynchronous background jobs to compile weekly sprint summaries, monthly attendance audits, and CSV task exports without slowing down UI rendering.',
    bullets: [
      'Monitor background worker job queue in real time',
      'Retry failed export jobs with state machine resilience',
      'Download consolidated enterprise analytics reports'
    ],
    targetScreen: 'AsyncReports',
    actionLabel: 'Open Async Job Monitor'
  },
  {
    title: 'Role-Based Access Control & Security',
    subtitle: 'Enforce security policies and toggle operator testing roles',
    icon: 'security',
    description: 'Sahara-Agile enforces strict RBAC rules. You can switch between Manager and Employee views anytime to test access boundaries.',
    bullets: [
      'HttpOnly cookies for secure JWT authentication',
      'Manager privileges required for creating projects & accessing async jobs',
      'Self-service attendance bounds for field employees'
    ],
    targetScreen: 'Settings',
    actionLabel: 'Review Security Settings'
  },
  {
    title: 'Demo Data Hub (/demo)',
    subtitle: 'Explore preset team datasets or reset to clean state',
    icon: 'dataset',
    description: 'Access pre-loaded demo datasets for Hydro-Geology, Grid Architecture, Robotics, Ecology, and SatCom teams, or wipe data back to clean empty state.',
    bullets: [
      '1-Click Seed Demo Data into active application database',
      '1-Click Reset to clean empty workspace',
      'Filter sample team data across all desert sectors'
    ],
    targetScreen: 'Demo',
    actionLabel: 'Go to Demo Hub (/demo)'
  }
];

export const EMPLOYEE_STEPS: WalkthroughStep[] = [
  {
    title: 'Welcome, Field Specialist',
    subtitle: 'Daily workflow guide for Sahara Agile field operators',
    icon: 'badge',
    description: 'As a Field Operator or Specialist, your primary hub is designed for tracking assigned mission tasks, logging daily shift hours, monitoring site weather alerts, and coordinating with team members.',
    bullets: [
      'View tasks assigned directly to your profile',
      'Clock in/out at your field station with shift notes',
      'Inspect live site telemetry and environmental alerts',
      'Keep your operator profile and credentials up to date'
    ],
    targetScreen: 'TaskBoard',
    actionLabel: 'Go to Task Board'
  },
  {
    title: 'Mission Kanban Task Board',
    subtitle: 'Track assigned tasks from Backlog to Done',
    icon: 'view_kanban',
    description: 'Update task statuses using drag-and-drop or status buttons. Log hours spent and post activity updates.',
    bullets: [
      'Filter tasks by assignee, priority, or search query',
      'Move tasks through Backlog ➔ To Do ➔ In Progress ➔ Review ➔ Done',
      'Open Task Inspector to view detailed telemetry logs'
    ],
    targetScreen: 'TaskBoard',
    actionLabel: 'Open Task Board'
  },
  {
    title: 'Shift Clock-In & Attendance Tracker',
    subtitle: 'Record daily clock-in/out timestamps and notes',
    icon: 'timer',
    description: 'Clock in when starting your shift at your field station. Log work notes describing completed objectives before clocking out.',
    bullets: [
      'Self-service clock-in with automated timestamping',
      'Record break minutes and overtime hours',
      'View approval status from your Operations Manager'
    ],
    targetScreen: 'AttendanceLog',
    actionLabel: 'Clock In / View Logs'
  },
  {
    title: 'GIS Site Location & Weather Telemetry',
    subtitle: 'Inspect field base stations and ambient weather',
    icon: 'place',
    description: 'Check site coordinates, active crew size, station lead, and ambient environmental conditions (temperature, wind speed, UV index).',
    bullets: [
      'View weather alerts like Extreme Heat (45°C) or Dust Storm warnings',
      'Locate field hubs across Sector 1 to Sector 5',
      'Click any station to view associated mission tasks'
    ],
    targetScreen: 'ProjectMap',
    actionLabel: 'Open Project Map'
  },
  {
    title: 'Team Roster & Field Sync',
    subtitle: 'Connect with field specialists across desert stations',
    icon: 'groups',
    description: 'View team roster, active status indicators (In Field, Active, Busy), current assigned missions, and local GMT times.',
    bullets: [
      'Contact team members via email or station relay',
      'Check operator availability and performance scores',
      'Coordinate cross-disciplinary missions (Hydro, Solar, Robotics)'
    ],
    targetScreen: 'TeamSync',
    actionLabel: 'View Team Sync Roster'
  },
  {
    title: 'Operator Profile & Credentials',
    subtitle: 'Manage your profile, specialty tags, and assigned station',
    icon: 'account_circle',
    description: 'Customize your operator display name, phone number, field station assignment, bio, and review your personal work log history.',
    bullets: [
      'Update personal credentials & specialty tags',
      'Review individual shift totals & completion velocity',
      'Manage security authentication settings'
    ],
    targetScreen: 'Profile',
    actionLabel: 'Manage My Profile'
  },
  {
    title: 'Demo Hub (/demo)',
    subtitle: 'Explore preset datasets or populate sample data',
    icon: 'dataset',
    description: 'Want to test the app with full team data? Visit /demo to load demo tasks, user stories, and site maps.',
    bullets: [
      'Seed demo data to explore full interactive app features',
      'Switch between preset team datasets (Hydro, Solar, Robotics)',
      'Reset data anytime to start clean'
    ],
    targetScreen: 'Demo',
    actionLabel: 'Explore Demo Hub (/demo)'
  }
];

export const InteractiveWalkthrough: React.FC<InteractiveWalkthroughProps> = ({
  isOpen,
  onClose,
  activeRole,
  onSwitchRole,
  onNavigate,
  onSeedDemoData,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = activeRole === 'Manager' ? MANAGER_STEPS : EMPLOYEE_STEPS;
  const currentStep = steps[currentStepIndex] || steps[0];
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  useEffect(() => {
    // Reset step index when role switches
    setCurrentStepIndex(0);
  }, [activeRole]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (steps[nextIndex].targetScreen) {
        onNavigate(steps[nextIndex].targetScreen!, 'none');
      }
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      if (steps[prevIndex].targetScreen) {
        onNavigate(steps[prevIndex].targetScreen!, 'none');
      }
    }
  };

  const handleJumpToScreen = () => {
    if (currentStep.targetScreen) {
      onNavigate(currentStep.targetScreen, 'push');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Walkthrough Header & Role Toggle */}
        <div className="bg-[#1A1411] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">{currentStep.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-widest font-bold text-amber-400">
                  Interactive Guided Tour
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeRole === 'Manager'
                    ? 'bg-[#606C38] text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {activeRole} Account
                </span>
              </div>
              <h3 className="text-xl font-bold font-headline text-white leading-tight">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSwitchRole(activeRole === 'Manager' ? 'Employee' : 'Manager')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5"
              title="Switch between Manager and Employee Walkthrough"
            >
              <span className="material-symbols-outlined text-sm">swap_horiz</span>
              <span>Switch to {activeRole === 'Manager' ? 'Employee' : 'Manager'} Tour</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Walkthrough"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#E5D5C0]/40 h-1.5 w-full">
          <div
            className="bg-[#D4A373] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Walkthrough Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          <div>
            <p className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wide">
              Step {currentStepIndex + 1} of {steps.length} — {currentStep.subtitle}
            </p>
            <p className="text-sm text-[#3D3028] mt-2 leading-relaxed font-normal">
              {currentStep.description}
            </p>
          </div>

          {/* Key Bullet Points */}
          <div className="bg-[#F3E9DC]/70 border border-[#E5D5C0] rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-[#3D3028] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#8B5E3C]">check_circle</span>
              <span>Key Capabilities & Actions</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#5C4D42]">
              {currentStep.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] mt-1.5 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Screen Shortcut Button */}
          {currentStep.targetScreen && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-800 text-xl">open_in_new</span>
                <div>
                  <p className="text-xs font-bold text-amber-950">Interactive Navigation Shortcut</p>
                  <p className="text-[11px] text-amber-900">Jump directly to the relevant screen in the app</p>
                </div>
              </div>
              <button
                onClick={handleJumpToScreen}
                className="px-4 py-2 bg-[#8B5E3C] hover:bg-[#6f492e] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>{currentStep.actionLabel || 'Try It Now'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Special Demo Data Seed Button on the last step */}
          {currentStep.targetScreen === 'Demo' && onSeedDemoData && (
            <div className="bg-[#606C38]/10 border border-[#606C38]/30 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#4d572d]">Populate App with Preset Demo Data</p>
                <p className="text-[11px] text-[#606C38]">Seed sample tasks, team members, and site locations for testing</p>
              </div>
              <button
                onClick={() => {
                  onSeedDemoData();
                  onNavigate('Demo', 'none');
                }}
                className="px-4 py-2 bg-[#606C38] hover:bg-[#4d572d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Load Demo Data</span>
              </button>
            </div>
          )}
        </div>

        {/* Walkthrough Footer Controls */}
        <div className="bg-[#F3E9DC] border-t border-[#E5D5C0] p-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#8B5E3C] hover:text-[#3D3028] px-3 py-2 rounded-xl hover:bg-[#E5D5C0] transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                currentStepIndex === 0
                  ? 'opacity-40 cursor-not-allowed text-[#8B5E3C]'
                  : 'bg-[#FDF8F3] text-[#3D3028] border border-[#E5D5C0] hover:bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-[#8B5E3C] hover:bg-[#6f492e] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>{currentStepIndex === steps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <span className="material-symbols-outlined text-sm">
                {currentStepIndex === steps.length - 1 ? 'check' : 'arrow_forward'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
