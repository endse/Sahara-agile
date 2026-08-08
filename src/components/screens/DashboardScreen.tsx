import React from 'react';
import { ScreenId, Task, Activity, TeamMember, SiteLocation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DeadlineAlertSummary } from '../DeadlineAlertSummary';
import { getTaskDeadlineInfo } from '../../lib/deadlineUtils';

interface DashboardProps {
  tasks: Task[];
  activities: Activity[];
  team: TeamMember[];
  locations: SiteLocation[];
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
  onSelectTask?: (task: Task) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: Task['status']) => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({
  tasks,
  activities,
  team,
  locations,
  onNavigate,
  onSelectTask,
  onUpdateTaskStatus
}) => {
  const { userProfile, user, activeRole, switchActiveRole } = useAuth();
  const rawName = userProfile?.displayName || user?.displayName || 'Operator';
  const displayName = rawName.split(' ')[0] || rawName;

  const activeTasks = tasks.filter(t => t.status !== 'done');
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent');

  // Filter tasks assigned to current employee or field tasks
  const myEmployeeTasks = tasks.filter(
    (t) =>
      t.assignee.name.toLowerCase().includes(displayName.toLowerCase()) ||
      t.assignee.name === 'Amara Vance' ||
      t.status === 'in_progress'
  );

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Role-Specific Welcome Banner */}
      <div className={`border rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-sm transition-all ${
        activeRole === 'Manager'
          ? 'bg-[#F3E9DC] border-[#E5D5C0]'
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
      }`}>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#D4A373]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${
                activeRole === 'Manager'
                  ? 'text-[#606C38] bg-[#FEFAE0] border-[#E9EDC9]'
                  : 'text-amber-900 bg-amber-100 border-amber-300'
              }`}>
                {activeRole === 'Manager' ? 'Manager Control Mode' : 'Employee Field Workspace'}
              </span>

              <button
                onClick={() => switchActiveRole(activeRole === 'Manager' ? 'Employee' : 'Manager')}
                className="text-[10px] font-bold underline text-[#8B5E3C] hover:text-[#3D3028]"
              >
                (Switch Role)
              </button>
            </div>

            <h1 className="font-headline text-3xl lg:text-4xl font-light text-[#2D241E]">
              {activeRole === 'Manager'
                ? `Good morning, ${displayName}. Field metrics are nominal.`
                : `Welcome back, ${displayName}. Field shift ready.`}
            </h1>

            <p className="text-sm text-[#8B5E3C]">
              {activeRole === 'Manager'
                ? '6 active regional missions in progress across 5 sector hubs. Full oversight enabled.'
                : 'Your daily field objectives, shift attendance tracker, and assigned mission tasks.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeRole === 'Manager' ? (
              <button
                onClick={() => onNavigate('NewProject', 'slide_up')}
                className="px-4 py-2.5 bg-[#606C38] hover:bg-[#4d572d] text-white rounded-2xl text-xs font-medium flex items-center gap-2 shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-base">add_location_alt</span>
                <span>New Project</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('AttendanceLog', 'none')}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-base">schedule</span>
                <span>Log Shift / Clock In</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('TaskBoard', 'none')}
              className="px-4 py-2.5 bg-[#3D3028] hover:bg-[#2D241E] text-white rounded-2xl text-xs font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base">view_kanban</span>
              <span>My Task Board</span>
            </button>

            <button
              onClick={() => onNavigate('ProjectMap', 'none')}
              className="px-4 py-2.5 bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] rounded-2xl text-xs font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base text-[#D4A373]">map</span>
              <span>Site Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deadline Alert Summary Panel */}
      <DeadlineAlertSummary
        tasks={tasks}
        onNavigate={onNavigate}
        onSelectTask={onSelectTask}
        onUpdateTaskStatus={onUpdateTaskStatus}
      />

      {/* Role-tailored Metrics Row */}
      {activeRole === 'Manager' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#F3E9DC] rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8B5E3C]">
              <span className="text-xs font-bold tracking-wider uppercase">Active Missions</span>
              <span className="material-symbols-outlined text-lg text-[#D4A373]">assignment</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-[#3D3028]">{activeTasks.length}</span>
              <span className="text-xs text-[#D4A373] font-semibold">+2 this week</span>
            </div>
            <p className="text-xs text-[#8B5E3C]">{highPriorityTasks.length} high priority items requiring attention</p>
          </div>

          <div className="bg-white border border-[#F3E9DC] rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8B5E3C]">
              <span className="text-xs font-bold tracking-wider uppercase">Site Locations</span>
              <span className="material-symbols-outlined text-lg text-[#D4A373]">pin_drop</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-[#3D3028]">{locations.length}</span>
              <span className="text-xs text-[#606C38] font-semibold">100% online</span>
            </div>
            <p className="text-xs text-[#8B5E3C]">5 active operational hubs across Sector 1 to 5</p>
          </div>

          <div className="bg-white border border-[#F3E9DC] rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8B5E3C]">
              <span className="text-xs font-bold tracking-wider uppercase">Solar Microgrid Output</span>
              <span className="material-symbols-outlined text-lg text-[#D4A373]">solar_power</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-[#3D3028]">4.2 MW</span>
              <span className="text-xs text-[#606C38] font-semibold">94% efficiency</span>
            </div>
            <p className="text-xs text-[#8B5E3C]">Array 03 inverter recalibration in review</p>
          </div>

          <div className="bg-white border border-[#F3E9DC] rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8B5E3C]">
              <span className="text-xs font-bold tracking-wider uppercase">Team Sync Status</span>
              <span className="material-symbols-outlined text-lg text-[#D4A373]">group</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-[#3D3028]">{team.length}</span>
              <span className="text-xs text-[#D4A373] font-semibold">2 in field</span>
            </div>
            <p className="text-xs text-[#8B5E3C]">All telemetry channels active via SatCom</p>
          </div>
        </div>
      ) : (
        /* Employee View Specific Metrics */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-amber-900">
              <span className="text-xs font-bold tracking-wider uppercase">My Assigned Tasks</span>
              <span className="material-symbols-outlined text-lg text-amber-600">task_alt</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-[#3D3028]">
                {myEmployeeTasks.length}
              </span>
              <span className="text-xs text-amber-700 font-semibold">In Progress</span>
            </div>
            <p className="text-xs text-[#8B5E3C]">Tasks directly assigned for field completion</p>
          </div>

          <div className="bg-white border border-[#F3E9DC] rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8B5E3C]">
              <span className="text-xs font-bold tracking-wider uppercase">My Today's Shift</span>
              <span className="material-symbols-outlined text-lg text-emerald-600">schedule</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-2xl font-bold text-emerald-800">8h 15m</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Clocked In
              </span>
            </div>
            <p className="text-xs text-[#8B5E3C]">Station: Al-Kufra Hydro Site</p>
          </div>

          <div className="bg-white border border-[#F3E9DC] rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8B5E3C]">
              <span className="text-xs font-bold tracking-wider uppercase">Task Completion</span>
              <span className="material-symbols-outlined text-lg text-blue-600">analytics</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-[#3D3028]">88%</span>
              <span className="text-xs text-emerald-700 font-semibold">On Target</span>
            </div>
            <p className="text-xs text-[#8B5E3C]">7 of 8 sprint deliverables completed</p>
          </div>

          <div className="bg-white border border-[#F3E9DC] rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8B5E3C]">
              <span className="text-xs font-bold tracking-wider uppercase">Field Safety Status</span>
              <span className="material-symbols-outlined text-lg text-emerald-600">verified_user</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-[#3D3028]">100%</span>
              <span className="text-xs text-emerald-700 font-semibold">Nominal</span>
            </div>
            <p className="text-xs text-[#8B5E3C]">Zero safety incidents flagged</p>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Priority Tasks & Map Preview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Priority Task Focus */}
          <div className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 lg:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-2xl font-semibold text-[#3D3028]">Active Task Priority Overview</h3>
                <p className="text-xs text-[#8B5E3C]">Key field objectives prioritized by geographical urgency</p>
              </div>
              <button
                onClick={() => onNavigate('TaskBoard', 'none')}
                className="text-xs font-semibold text-[#D4A373] hover:text-[#8B5E3C] flex items-center gap-1 transition-colors"
              >
                <span>View All Tasks</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 4).map((task) => {
                const info = getTaskDeadlineInfo(task);
                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      if (onSelectTask) onSelectTask(task);
                      onNavigate('TaskBoardActivity', 'push');
                    }}
                    className={`bg-[#FDF8F3] hover:bg-[#F3E9DC]/60 border rounded-2xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      info.isNearingDeadline ? 'border-amber-400/80 bg-amber-500/5 shadow-2xs' : 'border-[#F3E9DC]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3E9DC] text-[#5C4D42]">
                          {task.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            task.priority === 'urgent'
                              ? 'bg-[#BC4749]/15 text-[#BC4749]'
                              : task.priority === 'high'
                              ? 'bg-[#D4A373]/20 text-[#8B5E3C]'
                              : 'bg-[#FEFAE0] text-[#606C38] border border-[#E9EDC9]'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Yellow Status Indicator for Nearing Deadline */}
                        {info.isNearingDeadline && (
                          <span className={`text-[10px] ${info.badgeClasses} px-2 py-0.5 rounded-full flex items-center gap-1`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>{info.statusLabel}</span>
                          </span>
                        )}

                        <span className="text-xs text-[#8B5E3C]">{task.region}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-[#3D3028]">{task.title}</h4>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="w-7 h-7 rounded-full object-cover border-2 border-[#D4A373]"
                        />
                        <span className="text-xs text-[#5C4D42] hidden md:inline">{task.assignee.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#3D3028]">{task.progress}%</div>
                        <div className="w-16 bg-[#E5D5C0] h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-[#D4A373] h-full rounded-full transition-all duration-500"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Map & Timeline Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Map Snippet */}
            <div className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-headline text-xl font-semibold text-[#3D3028]">Project Map</h4>
                <button
                  onClick={() => onNavigate('ProjectMap', 'none')}
                  className="text-xs font-semibold text-[#D4A373] hover:underline"
                >
                  Full Map
                </button>
              </div>
              <div
                onClick={() => onNavigate('ProjectMap', 'none')}
                className="relative h-40 bg-[#F3E9DC] rounded-2xl overflow-hidden cursor-pointer group border border-[#E5D5C0]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-500"
                  style={{
                    backgroundImage:
                      'url("https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80")'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3D3028]/80 via-transparent to-transparent flex items-end p-3">
                  <div className="text-white text-xs font-medium flex items-center justify-between w-full">
                    <span>5 Field Hubs Geotagged</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Snippet */}
            <div className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-headline text-xl font-semibold text-[#3D3028]">Milestone Tracker</h4>
                <button
                  onClick={() => onNavigate('ProjectTimeline', 'none')}
                  className="text-xs font-semibold text-[#D4A373] hover:underline"
                >
                  Timeline
                </button>
              </div>
              <div className="space-y-2.5">
                <div className="p-3 bg-[#FDF8F3] rounded-2xl border border-[#F3E9DC]">
                  <div className="flex justify-between text-xs font-bold text-[#3D3028]">
                    <span>Phase 2: Solar Array 3</span>
                    <span className="text-[#D4A373]">68%</span>
                  </div>
                  <p className="text-[11px] text-[#8B5E3C]">Ends Nov 15, 2026</p>
                </div>
                <div className="p-3 bg-[#FDF8F3] rounded-2xl border border-[#F3E9DC]">
                  <div className="flex justify-between text-xs font-bold text-[#3D3028]">
                    <span>Phase 3: Sand Shield Testing</span>
                    <span className="text-[#8B5E3C]">15%</span>
                  </div>
                  <p className="text-[11px] text-[#8B5E3C]">Starts Nov 01, 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed & Team Sync */}
        <div className="space-y-8">
          {/* Live Activity Stream */}
          <div className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-xl font-semibold text-[#3D3028]">Live Field Activity</h3>
              <button
                onClick={() => onNavigate('TaskBoardActivity', 'push')}
                className="text-xs font-semibold text-[#D4A373] hover:underline"
              >
                Activity Feed
              </button>
            </div>

            <div className="space-y-4">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs border-b border-[#F3E9DC] pb-3 last:border-0 last:pb-0">
                  <img src={act.avatar} alt={act.user} className="w-8 h-8 rounded-full object-cover mt-0.5 border border-[#D4A373]" />
                  <div className="space-y-1 flex-1">
                    <p className="text-[#3D3028] leading-tight">
                      <span className="font-semibold">{act.user}</span> {act.action}{' '}
                      <span className="font-medium text-[#D4A373]">{act.target}</span>
                    </p>
                    {act.detail && <p className="text-[11px] text-[#8B5E3C] italic">{act.detail}</p>}
                    <span className="text-[10px] text-[#8B5E3C]/80">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Sync Summary Card - matching Team Sync block from design */}
          <div className="bg-[#8B5E3C] rounded-[32px] p-6 text-white shadow-sm space-y-4">
            <h3 className="font-headline text-xl font-normal">Team Sync Room</h3>
            <p className="text-xs opacity-90 leading-relaxed">Daily Sector 04 standup meeting scheduled for today at 2:00 PM (PT)</p>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => onNavigate('TeamSync', 'none')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium transition-colors"
              >
                Join Room
              </button>
              <span className="text-xs opacity-75 italic">4 members ready</span>
            </div>
          </div>

          {/* Field Team List */}
          <div className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-xl font-semibold text-[#3D3028]">Field Team</h3>
              <button
                onClick={() => onNavigate('TeamSync', 'none')}
                className="text-xs font-semibold text-[#D4A373] hover:underline"
              >
                Team Sync
              </button>
            </div>

            <div className="space-y-3">
              {team.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-[#FDF8F3] rounded-2xl border border-[#F3E9DC]">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          member.status === 'active'
                            ? 'bg-[#606C38]'
                            : member.status === 'in_field'
                            ? 'bg-[#D4A373]'
                            : 'bg-stone-400'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#3D3028]">{member.name}</p>
                      <p className="text-[11px] text-[#8B5E3C]">{member.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#F3E9DC] text-[#5C4D42]">
                    {member.status === 'in_field' ? 'In Field' : member.status === 'active' ? 'Online' : 'Busy'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
