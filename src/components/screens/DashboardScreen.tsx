import React from 'react';
import { ScreenId, Task, Activity, TeamMember, SiteLocation, UserStory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DeadlineAlertSummary } from '../DeadlineAlertSummary';
import { getTaskDeadlineInfo } from '../../lib/deadlineUtils';

interface DashboardProps {
  tasks: Task[];
  activities: Activity[];
  team: TeamMember[];
  locations: SiteLocation[];
  stories?: UserStory[];
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
  onSelectTask?: (task: Task) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: Task['status']) => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({
  tasks,
  activities,
  team,
  locations,
  stories = [],
  onNavigate,
  onSelectTask,
  onUpdateTaskStatus
}) => {
  const { userProfile, user, activeRole } = useAuth();
  const rawName = userProfile?.displayName || user?.displayName || 'User';
  const displayName = rawName.split(' ')[0] || rawName;

  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const completedTasks = tasks.filter((t) => t.status === 'done');
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high' || t.priority === 'urgent');

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 lg:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                activeRole === 'Manager'
                  ? 'text-[#A8793A] bg-[#C49A5A]/15 border-[#C49A5A]/30'
                  : 'text-[#625C52] bg-[#FBF9F4] border-[#E4DDD0]'
              }`}
            >
              {activeRole === 'Manager' ? 'Manager Workspace' : 'Team Workspace'}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-[#171512] tracking-tight">
            Dashboard
          </h1>

          <p className="text-xs lg:text-sm text-[#625C52]">
            Overview of your projects and team progress. Welcome back, {displayName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeRole === 'Manager' ? (
            <button
              onClick={() => onNavigate('NewProject', 'slide_up')}
              className="px-4 py-2.5 bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>+ New Project</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('AttendanceLog', 'none')}
              className="px-4 py-2.5 bg-[#171613] hover:bg-[#24211C] text-[#F7F3EA] rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>Log Attendance</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('NewTask', 'slide_up')}
            className="px-4 py-2.5 bg-[#FBF9F4] hover:bg-[#F7F3EA] text-[#171512] border border-[#E4DDD0] rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-base text-[#A8793A]">add_task</span>
            <span>+ New Task</span>
          </button>

          <button
            onClick={() => onNavigate('TaskBoard', 'none')}
            className="px-4 py-2.5 bg-[#FBF9F4] hover:bg-[#F7F3EA] text-[#171512] border border-[#E4DDD0] rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-base text-[#171613]">view_kanban</span>
            <span>Task Board</span>
          </button>
        </div>
      </div>

      {/* Clean Empty State Banner if no tasks exist */}
      {tasks.length === 0 && (
        <div className="bg-white border border-[#E4DDD0] rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-[#C49A5A]/15 text-[#A8793A] rounded-xl flex items-center justify-center mx-auto border border-[#C49A5A]/30">
            <span className="material-symbols-outlined text-2xl">folder_open</span>
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-[#171512]">No Projects or Tasks Yet</h3>
            <p className="text-xs text-[#625C52]">
              Create your first project or task to get started, or visit <strong className="text-[#171512]">/demo</strong> for sample Agile data.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('NewTask', 'slide_up')}
              className="px-4 py-2 bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Create Task</span>
            </button>
            <button
              onClick={() => onNavigate('Demo', 'none')}
              className="px-4 py-2 bg-[#FBF9F4] hover:bg-[#F7F3EA] text-[#171512] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 border border-[#E4DDD0]"
            >
              <span className="material-symbols-outlined text-sm text-[#8A8378]">dataset</span>
              <span>Load Demo Data (/demo)</span>
            </button>
          </div>
        </div>
      )}

      {/* Restrained Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects Card */}
        <div
          onClick={() => onNavigate('Projects', 'none')}
          className="bg-white border border-[#E4DDD0] rounded-2xl p-5 shadow-xs space-y-2 hover:border-[#C49A5A] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#625C52]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8378]">Projects</span>
            <span className="material-symbols-outlined text-lg text-[#171613] group-hover:text-[#C49A5A] transition-colors">folder_open</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#171512] tracking-tight">{locations.length}</span>
            <span className="text-xs text-[#A8793A] font-semibold">Active</span>
          </div>
          <p className="text-xs text-[#625C52]">Tracked projects across workspace</p>
        </div>

        {/* User Stories Card */}
        <div
          onClick={() => onNavigate('UserStories', 'none')}
          className="bg-white border border-[#E4DDD0] rounded-2xl p-5 shadow-xs space-y-2 hover:border-[#C49A5A] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#625C52]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8378]">User Stories</span>
            <span className="material-symbols-outlined text-lg text-[#171613] group-hover:text-[#C49A5A] transition-colors">auto_stories</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#171512] tracking-tight">{stories.length}</span>
            <span className="text-xs text-[#A8793A] font-semibold">Backlog Items</span>
          </div>
          <p className="text-xs text-[#625C52]">Feature stories mapped to project goals</p>
        </div>

        {/* Active Tasks Card */}
        <div
          onClick={() => onNavigate('TaskBoard', 'none')}
          className="bg-white border border-[#E4DDD0] rounded-2xl p-5 shadow-xs space-y-2 hover:border-[#C49A5A] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#625C52]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8378]">Active Tasks</span>
            <span className="material-symbols-outlined text-lg text-[#171613] group-hover:text-[#C49A5A] transition-colors">assignment</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#171512] tracking-tight">{activeTasks.length}</span>
            <span className="text-xs text-[#A8793A] font-semibold">{highPriorityTasks.length} High Priority</span>
          </div>
          <p className="text-xs text-[#625C52]">Tasks currently in progress or review</p>
        </div>

        {/* Completed Tasks Card */}
        <div
          onClick={() => onNavigate('TaskBoard', 'none')}
          className="bg-white border border-[#E4DDD0] rounded-2xl p-5 shadow-xs space-y-2 hover:border-[#C49A5A] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#625C52]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8378]">Completed Tasks</span>
            <span className="material-symbols-outlined text-lg text-[#171613] group-hover:text-[#C49A5A] transition-colors">task_alt</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#171512] tracking-tight">{completedTasks.length}</span>
            <span className="text-xs text-[#A8793A] font-semibold">Done</span>
          </div>
          <p className="text-xs text-[#625C52]">Successfully delivered sprint work</p>
        </div>
      </div>

      {/* Deadline Alert Summary Panel */}
      <DeadlineAlertSummary
        tasks={tasks}
        onNavigate={onNavigate}
        onSelectTask={onSelectTask}
        onUpdateTaskStatus={onUpdateTaskStatus}
      />

      {/* Project Progress Section */}
      <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-[#171512]">Project Progress</h3>
            <p className="text-xs text-[#625C52]">Real-time status and delivery completion across active projects</p>
          </div>
          <button
            onClick={() => onNavigate('Projects', 'none')}
            className="text-xs font-semibold text-[#A8793A] hover:text-[#171512] flex items-center gap-1 transition-colors"
          >
            <span>View All Projects</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {locations.length === 0 ? (
          <p className="text-xs text-[#8A8378] italic py-4 text-center">No projects registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.slice(0, 3).map((proj) => {
              const projTasks = tasks.filter((t) => t.projectId === proj.id || t.region === proj.region);
              const doneCount = projTasks.filter((t) => t.status === 'done').length;
              const totalCount = projTasks.length || proj.taskCount || 1;
              const pct = Math.round((doneCount / totalCount) * 100) || (proj.status === 'completed' ? 100 : 50);

              return (
                <div
                  key={proj.id}
                  onClick={() => onNavigate('Projects', 'none')}
                  className="p-4 rounded-xl border border-[#E4DDD0] bg-[#FBF9F4] hover:bg-[#F7F3EA] transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#625C52] bg-white px-2 py-0.5 rounded border border-[#E4DDD0]">
                      {proj.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        proj.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : proj.status === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#C49A5A]/20 text-[#A8793A]'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#171512] truncate">{proj.name}</h4>
                    <p className="text-xs text-[#625C52]">Lead: {proj.lead}</p>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs font-semibold text-[#171512]">
                      <span>Completion</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-[#E4DDD0] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#C49A5A] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Priority Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Priority Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#171512]">Task Priority Overview</h3>
                <p className="text-xs text-[#625C52]">Active tasks requiring sprint focus</p>
              </div>
              <button
                onClick={() => onNavigate('TaskBoard', 'none')}
                className="text-xs font-semibold text-[#A8793A] hover:text-[#171512] flex items-center gap-1 transition-colors"
              >
                <span>View Task Board</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => {
                const info = getTaskDeadlineInfo(task);
                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      if (onSelectTask) onSelectTask(task);
                      onNavigate('TaskBoardActivity', 'push');
                    }}
                    className={`bg-[#FBF9F4] hover:bg-[#F7F3EA] border rounded-xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      info.isNearingDeadline ? 'border-[#C49A5A] bg-[#C49A5A]/10' : 'border-[#E4DDD0]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#171512] border border-[#E4DDD0]">
                          {task.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            task.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'high'
                              ? 'bg-[#C49A5A]/20 text-[#A8793A]'
                              : 'bg-[#E4DDD0] text-[#625C52]'
                          }`}
                        >
                          {task.priority}
                        </span>
                        {info.isNearingDeadline && (
                          <span className="text-[10px] bg-[#C49A5A]/20 text-[#A8793A] font-bold px-2 py-0.5 rounded-full border border-[#C49A5A]/30">
                            {info.statusLabel}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-[#171512]">{task.title}</h4>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="w-7 h-7 rounded-full object-cover border border-[#C49A5A]"
                        />
                        <span className="text-xs text-[#625C52] hidden md:inline">{task.assignee.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#171512]">{task.progress}%</div>
                        <div className="w-16 bg-[#E4DDD0] h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-[#C49A5A] h-full rounded-full transition-all duration-500"
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
        </div>

        {/* Right Column: Recent Activity Feed & Team Directory */}
        <div className="space-y-6">
          {/* Recent Activity Stream */}
          <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#171512]">Recent Activity</h3>
              <button
                onClick={() => onNavigate('TaskBoardActivity', 'push')}
                className="text-xs font-semibold text-[#A8793A] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs border-b border-[#E4DDD0] pb-3 last:border-0 last:pb-0">
                  <img src={act.avatar} alt={act.user} className="w-7 h-7 rounded-full object-cover mt-0.5 border border-[#C49A5A]" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-[#625C52] leading-tight">
                      <span className="font-bold text-[#171512]">{act.user}</span> {act.action}{' '}
                      <span className="font-semibold text-[#A8793A]">{act.target}</span>
                    </p>
                    {act.detail && <p className="text-[11px] text-[#8A8378] truncate">{act.detail}</p>}
                    <span className="text-[10px] text-[#8A8378] block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members List */}
          <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#171512]">Team Roster</h3>
              <button
                onClick={() => onNavigate('TeamSync', 'none')}
                className="text-xs font-semibold text-[#A8793A] hover:underline"
              >
                Team Directory
              </button>
            </div>

            <div className="space-y-3">
              {team.slice(0, 4).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2.5 bg-[#FBF9F4] rounded-xl border border-[#E4DDD0]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#C49A5A]" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#171512] truncate">{member.name}</p>
                      <p className="text-[11px] text-[#625C52] truncate">{member.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E4DDD0] text-[#171512] shrink-0">
                    {member.status}
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
