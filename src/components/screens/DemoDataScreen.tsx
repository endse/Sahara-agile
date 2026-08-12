import React, { useState } from 'react';
import { ScreenId, TransitionType } from '../../types';
import {
  DEMO_TASKS,
  DEMO_ACTIVITIES,
  DEMO_TEAM,
  DEMO_TIMELINE,
  DEMO_LOCATIONS,
  DEMO_STORIES,
  DEMO_ATTENDANCE,
  DEMO_ASYNC_JOBS,
  getDemoTeams,
} from '../../data';

interface DemoDataScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  onSeedDemoData: () => Promise<void> | void;
  onClearAllData: () => Promise<void> | void;
  onStartWalkthrough: (role: 'Manager' | 'Employee') => void;
  tasksCount: number;
  teamCount: number;
  activeRole?: 'Manager' | 'Employee';
  onSwitchRole?: (role: 'Manager' | 'Employee') => void;
}

export const DemoDataScreen: React.FC<DemoDataScreenProps> = ({
  onNavigate,
  onSeedDemoData,
  onClearAllData,
  onStartWalkthrough,
  tasksCount,
  teamCount,
  activeRole = 'Manager',
  onSwitchRole,
}) => {
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'team' | 'tasks' | 'locations' | 'stories' | 'attendance' | 'jobs'>('team');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const demoTeams = getDemoTeams();

  // Filter team members based on selected team tab
  const filteredTeam = selectedTeamFilter === 'all'
    ? DEMO_TEAM
    : DEMO_TEAM.filter((m) => {
        const team = demoTeams.find((t) => t.id === selectedTeamFilter);
        return m.teamSector === team?.sector;
      });

  const [lastStampedAt, setLastStampedAt] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsProcessing(true);
    await onSeedDemoData();
    setIsProcessing(false);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastStampedAt(timeStr);
    setNotification('🏷️ STAMP DEMO COMPLETE: Fresh stamped demo data loaded into Firestore & active workspace!');
    setTimeout(() => setNotification(null), 6000);
  };

  const handleClear = async () => {
    setIsProcessing(true);
    await onClearAllData();
    setIsProcessing(false);
    setLastStampedAt(null);
    setNotification('🧹 FIRESTORE CLEARED: Removed all existing Firebase Firestore documents.');
    setTimeout(() => setNotification(null), 6000);
  };

  const isPopulated = tasksCount > 0 || teamCount > 0;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Banner & Title with Stamp Demo Status */}
      <div className="bg-[#1A1411] text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-amber-500/30 space-y-6 relative overflow-hidden">
        {/* Decorative Stamp Watermark Background */}
        <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-10 flex items-center justify-center">
          <div className="border-8 border-amber-500 rounded-full p-8 rotate-12 text-amber-500 font-mono font-black text-6xl tracking-widest uppercase">
            STAMP DEMO
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                /demo Page & Stamp Demo Control
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                isPopulated
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-stone-700 text-stone-300 border-stone-600'
              }`}>
                {isPopulated ? `Active Workspace: ${tasksCount} tasks, ${teamCount} members` : 'Active Workspace: Empty Firestore State'}
              </span>
              {lastStampedAt && (
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[11px] font-bold px-2.5 py-1 rounded-full font-mono flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">approval</span>
                  STAMPED AT {lastStampedAt}
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-4xl font-headline font-bold text-white tracking-tight">
              Sahara Agile Stamp Demo & Firestore Control
            </h1>
            <p className="text-stone-300 text-sm max-w-3xl leading-relaxed">
              Remove existing Firestore data and stamp fresh demo datasets directly into your workspace. Designed for instant live testing across all engineering sectors (Full Stack Development, AI / Machine Learning, DevOps & Cloud, Cybersecurity).
            </p>
          </div>

          {/* Quick Stamp & Clear Actions Bar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleSeed}
              disabled={isProcessing}
              className="px-5 py-3 bg-[#8B5E3C] hover:bg-[#6f492e] text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 ring-2 ring-amber-400/30"
            >
              <span className="material-symbols-outlined text-xl">approval</span>
              <span>Stamp Demo Data</span>
            </button>

            <button
              onClick={handleClear}
              disabled={isProcessing}
              className="px-4 py-3 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg text-red-400">delete_forever</span>
              <span>Remove All Firestore Data</span>
            </button>
          </div>
        </div>

        {/* Guided Walkthrough Launchers & Sandbox Role Switcher */}
        <div className="pt-6 border-t border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-lg">admin_panel_settings</span>
              <span className="text-xs font-bold text-stone-200">Sandbox RBAC Role Simulator:</span>
            </div>
            <p className="text-[11px] text-stone-400 max-w-xl">
              🔒 <strong>Security Boundary:</strong> Role switching is restricted exclusively to this <code className="text-amber-400">/demo</code> sandbox for interface testing. Main production app relies on authenticated credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSwitchRole && onSwitchRole('Manager')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border ${
                activeRole === 'Manager'
                  ? 'bg-[#606C38] text-white border-[#8B9B56] shadow-sm ring-2 ring-[#606C38]/40'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              <span>Manager Sandbox Mode</span>
            </button>

            <button
              onClick={() => onSwitchRole && onSwitchRole('Employee')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border ${
                activeRole === 'Employee'
                  ? 'bg-[#C49A5A] text-[#0D0D0B] font-bold border-[#C49A5A] shadow-xs'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              <span className="material-symbols-outlined text-sm">badge</span>
              <span>Employee Sandbox Mode</span>
            </button>

            <div className="h-6 w-px bg-stone-700 hidden sm:block"></div>

            <button
              onClick={() => onStartWalkthrough('Manager')}
              className="px-3.5 py-2 bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/40 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">route</span>
              <span>Launch Guided Tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/40 text-amber-900 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in shadow-xs">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-amber-700 hover:text-amber-950">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Team / Sector Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3D3028] font-headline flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B5E3C]">groups</span>
            <span>Filter Demo Datasets by Sector Team</span>
          </h3>
          <span className="text-xs text-[#8B5E3C] font-semibold">5 Specialist Teams Loaded</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
          {demoTeams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeamFilter(team.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                selectedTeamFilter === team.id
                  ? 'bg-[#D4A373] text-white border-[#D4A373] shadow-xs'
                  : 'bg-[#F3E9DC] text-[#5C4D42] border-[#E5D5C0] hover:bg-[#E5D5C0] hover:text-[#3D3028]'
              }`}
            >
              <span>{team.name}</span>
              {team.lead && (
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                  {team.lead.split(' ')[0]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Data Type Tabs */}
      <div className="bg-[#F3E9DC] p-1.5 rounded-2xl border border-[#E5D5C0] flex items-center gap-1 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'team' ? 'bg-[#FDF8F3] text-[#3D3028] shadow-xs' : 'text-[#8B5E3C] hover:text-[#3D3028]'
          }`}
        >
          <span className="material-symbols-outlined text-base">badge</span>
          <span>Team Roster ({filteredTeam.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tasks' ? 'bg-[#FDF8F3] text-[#3D3028] shadow-xs' : 'text-[#8B5E3C] hover:text-[#3D3028]'
          }`}
        >
          <span className="material-symbols-outlined text-base">task</span>
          <span>Mission Tasks ({DEMO_TASKS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'locations' ? 'bg-[#FDF8F3] text-[#3D3028] shadow-xs' : 'text-[#8B5E3C] hover:text-[#3D3028]'
          }`}
        >
          <span className="material-symbols-outlined text-base">map</span>
          <span>GIS Sites ({DEMO_LOCATIONS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stories')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'stories' ? 'bg-[#FDF8F3] text-[#3D3028] shadow-xs' : 'text-[#8B5E3C] hover:text-[#3D3028]'
          }`}
        >
          <span className="material-symbols-outlined text-base">auto_stories</span>
          <span>User Stories ({DEMO_STORIES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'attendance' ? 'bg-[#FDF8F3] text-[#3D3028] shadow-xs' : 'text-[#8B5E3C] hover:text-[#3D3028]'
          }`}
        >
          <span className="material-symbols-outlined text-base">schedule</span>
          <span>Attendance ({DEMO_ATTENDANCE.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'jobs' ? 'bg-[#FDF8F3] text-[#3D3028] shadow-xs' : 'text-[#8B5E3C] hover:text-[#3D3028]'
          }`}
        >
          <span className="material-symbols-outlined text-base">memory</span>
          <span>Async Jobs ({DEMO_ASYNC_JOBS.length})</span>
        </button>
      </div>

      {/* Tab Content Display */}

      {/* TAB: TEAM ROSTER */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#D4A373] shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-base text-[#3D3028] truncate">{member.name}</h4>
                  <p className="text-xs text-[#8B5E3C] font-medium truncate">{member.role}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      member.status === 'in_field'
                        ? 'bg-amber-500/15 text-amber-800'
                        : member.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {member.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">{member.localTime}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F3E9DC] p-3 rounded-2xl text-xs space-y-1.5 text-[#5C4D42]">
                <div className="flex justify-between">
                  <span className="text-stone-500">Location:</span>
                  <span className="font-semibold text-[#3D3028] truncate">{member.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Current Task:</span>
                  <span className="font-semibold text-[#8B5E3C] truncate">{member.currentTask}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#E5D5C0]">
                  <span className="text-stone-500">Performance Index:</span>
                  <span className="font-bold text-emerald-700 font-mono">{member.performance}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: MISSION TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F3E9DC] text-[#3D3028] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Code / Task Title</th>
                  <th className="p-4">Assignee</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Region / Site</th>
                  <th className="p-4">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D5C0]">
                {DEMO_TASKS.map((task) => (
                  <tr key={task.id} className="hover:bg-[#F3E9DC]/40 transition-colors">
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-[#E5D5C0] text-[#3D3028] font-bold px-1.5 py-0.5 rounded">
                          {task.code}
                        </span>
                        <span className="font-semibold text-[#3D3028] text-xs">{task.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img src={task.assignee.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-[#3D3028] font-medium">{task.assignee.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B5E3C]/10 text-[#8B5E3C] uppercase">
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        task.priority === 'urgent' ? 'bg-red-500/20 text-red-900' : 'bg-amber-500/20 text-amber-900'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600">{task.region}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#E5D5C0] rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#606C38] h-full" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="font-mono font-bold text-[10px]">{task.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: GIS LOCATIONS */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_LOCATIONS.map((loc) => (
            <div key={loc.id} className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-[#3D3028]">{loc.name}</h4>
                  <p className="text-xs text-[#8B5E3C]">{loc.region}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  loc.status === 'warning' ? 'bg-amber-500/20 text-amber-900' : 'bg-emerald-500/20 text-emerald-900'
                }`}>
                  {loc.status}
                </span>
              </div>

              <div className="bg-[#F3E9DC] p-3 rounded-2xl text-xs space-y-1.5 text-[#5C4D42]">
                <div className="flex justify-between">
                  <span>GPS Coords:</span>
                  <span className="font-mono font-bold text-[#3D3028]">{loc.coordinates.lat}°N, {loc.coordinates.lng}°E</span>
                </div>
                <div className="flex justify-between">
                  <span>Site Lead:</span>
                  <span className="font-semibold text-[#8B5E3C]">{loc.lead}</span>
                </div>
                <div className="flex justify-between">
                  <span>Crew Size:</span>
                  <span className="font-bold">{loc.crewCount} operators</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E5D5C0]">
                  <span>Ambient Temp / Weather:</span>
                  <span className="font-bold text-amber-800">{loc.temperature} ({loc.weatherCondition})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: USER STORIES */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          {DEMO_STORIES.map((story) => (
            <div key={story.id} className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#8B5E3C] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    {story.id}
                  </span>
                  <h4 className="font-bold text-sm text-[#3D3028]">{story.title}</h4>
                </div>
                <span className="bg-amber-500/15 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                  {story.points} Points
                </span>
              </div>

              <p className="text-xs text-[#5C4D42] italic">"{story.description}"</p>

              <div className="bg-[#F3E9DC] p-3 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-[#3D3028] text-[11px] uppercase tracking-wide">Acceptance Criteria:</p>
                <ul className="list-disc list-inside space-y-0.5 text-stone-600">
                  {story.acceptanceCriteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: ATTENDANCE LOGS */}
      {activeTab === 'attendance' && (
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F3E9DC] text-[#3D3028] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Operator Name</th>
                  <th className="p-4">Date / Shift</th>
                  <th className="p-4">Clock In / Out</th>
                  <th className="p-4">Total Hours</th>
                  <th className="p-4">Approval Status</th>
                  <th className="p-4">Work Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D5C0]">
                {DEMO_ATTENDANCE.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F3E9DC]/40 transition-colors">
                    <td className="p-4 font-bold text-[#3D3028]">{log.userName}</td>
                    <td className="p-4 font-mono text-stone-600">{log.date}</td>
                    <td className="p-4 font-mono text-[11px]">
                      {new Date(log.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {log.clockOutTime ? ` - ${new Date(log.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' (Active)'}
                    </td>
                    <td className="p-4 font-bold text-[#8B5E3C]">{log.totalHours || '--'} hrs</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.approvalStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-900' : 'bg-amber-500/20 text-amber-900'
                      }`}>
                        {log.approvalStatus || log.status}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600 italic max-w-xs truncate">{log.workNotes || 'No notes'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ASYNC JOBS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {DEMO_ASYNC_JOBS.map((job) => (
            <div key={job.id} className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-stone-200 text-stone-800 font-bold px-2 py-0.5 rounded">
                    {job.id}
                  </span>
                  <h4 className="font-bold text-sm text-[#3D3028]">{job.title}</h4>
                </div>
                <span className="bg-emerald-500/20 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full uppercase">
                  {job.status}
                </span>
              </div>
              <p className="text-xs text-[#5C4D42]">{job.resultSummary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
