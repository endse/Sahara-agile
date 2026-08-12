import React, { useState, useMemo } from 'react';
import { Task, AttendanceLog, TeamMember } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  getMonthlyCheckInOutData,
  getMonthlyPerformanceData,
  getMonthlyHeatmapMatrix,
  getMonthlyTaskBurndown,
  getStationHoursDistribution,
  getEmployeeRadarMetrics,
} from '../../services/monthlyAnalyticsService';

import { EmployeePerformanceChart } from '../charts/EmployeePerformanceChart';
import { CheckInOutMonthlyChart } from '../charts/CheckInOutMonthlyChart';
import { AttendanceHeatmapMatrix } from '../charts/AttendanceHeatmapMatrix';
import { TaskVelocityBurndownChart } from '../charts/TaskVelocityBurndownChart';
import { StationHoursDonutChart } from '../charts/StationHoursDonutChart';
import { EmployeeRadarChart } from '../charts/EmployeeRadarChart';

interface PerformanceAnalyticsScreenProps {
  tasks?: Task[];
  attendanceLogs?: AttendanceLog[];
  team?: TeamMember[];
  onOpenMobileMenu?: () => void;
  onNavigate: (screen: any) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PerformanceAnalyticsScreen: React.FC<PerformanceAnalyticsScreenProps> = ({
  tasks = [],
  attendanceLogs = [],
  team = [],
  onOpenMobileMenu,
  onNavigate,
}) => {
  const { activeRole, userProfile, user } = useAuth();
  const isManager = activeRole === 'Manager';
  const currentUserName = userProfile?.displayName || user?.displayName || 'Current User';

  // Date & Filter States
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-indexed month
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'performance' | 'checkin_checkout' | 'heatmap' | 'burndown' | 'station_radar'>('all');

  const monthName = MONTH_NAMES[selectedMonth - 1];

  // RBAC Effective Employee Target (Employees can strictly only view their own data)
  const effectiveEmployee = isManager ? selectedEmployee : currentUserName;

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Filter logs for employee if not manager
  const userLogs = useMemo(() => {
    if (isManager) return attendanceLogs;
    return attendanceLogs.filter(
      (l) => l.userName.toLowerCase() === currentUserName.toLowerCase() || l.userId === user?.uid
    );
  }, [attendanceLogs, isManager, currentUserName, user?.uid]);

  const userTasks = useMemo(() => {
    if (isManager) return tasks;
    return tasks.filter((t) => t.assignee.name.toLowerCase().includes(currentUserName.toLowerCase()));
  }, [tasks, isManager, currentUserName]);

  // Compute 31-day data models strictly using RBAC effectiveEmployee
  const performanceData = useMemo(
    () => getMonthlyPerformanceData(selectedYear, selectedMonth, effectiveEmployee, userTasks, team),
    [selectedYear, selectedMonth, effectiveEmployee, userTasks, team]
  );

  const checkInOutData = useMemo(
    () => getMonthlyCheckInOutData(selectedYear, selectedMonth, effectiveEmployee, userLogs, team),
    [selectedYear, selectedMonth, effectiveEmployee, userLogs, team]
  );

  const heatmapRowsAll = useMemo(
    () => getMonthlyHeatmapMatrix(selectedYear, selectedMonth, userLogs, team),
    [selectedYear, selectedMonth, userLogs, team]
  );

  // Isolate Heatmap Rows for non-managers
  const heatmapRows = useMemo(() => {
    if (isManager) return heatmapRowsAll;
    return heatmapRowsAll.filter((r) => r.employeeName.toLowerCase() === currentUserName.toLowerCase());
  }, [heatmapRowsAll, isManager, currentUserName]);

  const burndownData = useMemo(
    () => getMonthlyTaskBurndown(selectedYear, selectedMonth, userTasks),
    [selectedYear, selectedMonth, userTasks]
  );

  const stationDistribution = useMemo(
    () => getStationHoursDistribution(userLogs),
    [userLogs]
  );

  const radarMetricsAll = useMemo(
    () => getEmployeeRadarMetrics(team, userTasks, userLogs),
    [team, userTasks, userLogs]
  );

  // Isolate Radar Metrics for non-managers
  const radarMetrics = useMemo(() => {
    if (isManager) return radarMetricsAll;
    return radarMetricsAll.filter((r) => r.employeeName.toLowerCase() === currentUserName.toLowerCase());
  }, [radarMetricsAll, isManager, currentUserName]);

  // Overall Aggregations
  const avgPerfScore = Math.round(performanceData.reduce((a, b) => a + b.performanceScore, 0) / (performanceData.length || 1));
  const totalMonthHours = checkInOutData.reduce((a, b) => a + b.totalHours, 0);
  const totalMonthOvertime = checkInOutData.reduce((a, b) => a + b.overtimeHours, 0);
  const activeShiftDays = checkInOutData.filter((d) => d.totalHours > 0).length;
  const onTimeCount = checkInOutData.filter((d) => d.status === 'on_time').length;
  const punctualityPct = activeShiftDays > 0 ? Math.round((onTimeCount / activeShiftDays) * 100) : 100;

  // CSV Export for Monthly Analytics
  const handleExportCSV = () => {
    const headers = [
      'Day',
      'Date',
      'Employee',
      'Clock In',
      'Clock Out',
      'Shift Hours',
      'Overtime Hours',
      'Shift Status',
      'Performance Score (%)',
      'Tasks Completed',
      'Quality Rating'
    ];

    const rows = checkInOutData.map((c, idx) => {
      const perf = performanceData[idx] || { performanceScore: 0, tasksCompleted: 0, qualityRating: 0 };
      return [
        c.day,
        c.date,
        `"${c.employeeName}"`,
        c.clockInFormatted,
        c.clockOutFormatted,
        c.totalHours,
        c.overtimeHours,
        c.status,
        perf.performanceScore,
        perf.tasksCompleted,
        perf.qualityRating
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sahara_Monthly_Analytics_${monthName}_${selectedYear}_${effectiveEmployee}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FDF8F3] overflow-y-auto">
      <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Role Banner / RBAC Notice */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
          isManager
            ? 'bg-[#606C38]/10 border-[#606C38]/30 text-[#4d572d]'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              {isManager ? 'supervisor_account' : 'lock'}
            </span>
            <div>
              <span className="font-bold block leading-tight">
                {isManager ? 'Manager Role: Whole-Team Analytics Enabled' : `Employee Role: Personal View Scope (${currentUserName})`}
              </span>
              <span className="text-[11px] opacity-90">
                {isManager
                  ? 'You are authorized to view performance, check-in/out records, and heatmaps for all team personnel.'
                  : 'Restricted view mode: You can only view your own shift logs, performance metrics, and personal analytics.'}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border bg-white/80 shrink-0">
            {isManager ? 'Full Team Scope' : '🔒 Personal Scope'}
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5D5C0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B5E3C]">
              <span className="material-symbols-outlined text-base">insights</span>
              <span>Workforce Analytics & Performance Intelligence</span>
            </div>
            <h1 className="font-headline text-3xl lg:text-4xl font-light text-[#2D241E] mt-1">
              {isManager ? 'Team & Employee Monthly Visualizations' : `My Monthly Performance & Shift Analytics`}
            </h1>
            <p className="text-sm text-[#8B5E3C]">
              {isManager
                ? 'Comprehensive 31-day shift clock graphs, employee performance metrics, attendance heatmaps, and station distribution.'
                : 'Your personal 31-day shift clock trajectory, performance score, attendance heatmap, and task burndown analytics.'}
            </p>
          </div>

          {/* Top Controls: Month Selector & Export */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Month & Year Navigator */}
            <div className="flex items-center bg-white border border-[#E5D5C0] rounded-2xl p-1 shadow-xs">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-[#8B5E3C] hover:text-[#3D3028] hover:bg-[#F3E9DC] rounded-xl transition-colors"
                title="Previous Month"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <span className="px-3 text-xs font-bold text-[#3D3028] font-mono min-w-[130px] text-center">
                {monthName} {selectedYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-[#8B5E3C] hover:text-[#3D3028] hover:bg-[#F3E9DC] rounded-xl transition-colors"
                title="Next Month"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>

            {/* Employee Filter - STRICT RBAC ISOLATION */}
            {isManager ? (
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="bg-white border border-[#E5D5C0] rounded-2xl px-4 py-2 text-xs text-[#3D3028] font-bold outline-none focus:ring-2 focus:ring-[#D4A373] shadow-xs"
              >
                <option value="all">All Team Members ({team.length})</option>
                {team.map((m) => (
                  <option key={m.id || m.name} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-amber-100/80 border border-amber-300 rounded-2xl px-4 py-2 text-xs text-amber-900 font-bold flex items-center gap-1.5 shadow-xs">
                <span className="material-symbols-outlined text-sm text-amber-800">lock</span>
                <span>{currentUserName} (Personal Analytics Only)</span>
              </div>
            )}

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="bg-[#606C38] hover:bg-[#4d572d] text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export Monthly CSV</span>
            </button>
          </div>
        </div>

        {/* Global Summary KPI Header Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F3E9DC] p-5 rounded-3xl border border-[#E5D5C0] flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#606C38]/20 text-[#606C38] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">trending_up</span>
            </div>
            <div>
              <p className="text-xs text-[#8B5E3C] font-semibold">
                {isManager && selectedEmployee === 'all' ? 'Team Avg Performance' : 'My Avg Performance'}
              </p>
              <p className="text-2xl font-bold text-[#3D3028]">{avgPerfScore}% Score</p>
            </div>
          </div>

          <div className="bg-[#F3E9DC] p-5 rounded-3xl border border-[#E5D5C0] flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
            <div>
              <p className="text-xs text-[#8B5E3C] font-semibold">Check-In Punctuality</p>
              <p className="text-2xl font-bold text-[#3D3028]">{punctualityPct}% On-Time</p>
            </div>
          </div>

          <div className="bg-[#F3E9DC] p-5 rounded-3xl border border-[#E5D5C0] flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#D4A373]/25 text-[#8B5E3C] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">more_time</span>
            </div>
            <div>
              <p className="text-xs text-[#8B5E3C] font-semibold">Logged Shift Hours</p>
              <p className="text-2xl font-bold text-[#3D3028]">{totalMonthHours.toFixed(1)} hrs</p>
              <p className="text-[10px] text-amber-800 font-bold">{totalMonthOvertime.toFixed(1)} hrs overtime</p>
            </div>
          </div>

          <div className="bg-[#F3E9DC] p-5 rounded-3xl border border-[#E5D5C0] flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#2A9D8F]/15 text-[#2A9D8F] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">task_alt</span>
            </div>
            <div>
              <p className="text-xs text-[#8B5E3C] font-semibold">Active Shift Days</p>
              <p className="text-2xl font-bold text-[#3D3028]">{activeShiftDays} / 31 Days</p>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5D5C0] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'all' ? 'bg-[#D4A373] text-white shadow-xs' : 'bg-white/60 text-[#8B5E3C] hover:bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            <span>All Dashboard Charts</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'performance' ? 'bg-[#D4A373] text-white shadow-xs' : 'bg-white/60 text-[#8B5E3C] hover:bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-base">trending_up</span>
            <span>1. Monthly Performance Graph</span>
          </button>

          <button
            onClick={() => setActiveTab('checkin_checkout')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'checkin_checkout' ? 'bg-[#D4A373] text-white shadow-xs' : 'bg-white/60 text-[#8B5E3C] hover:bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-base">schedule</span>
            <span>2. Monthly Check-In / Check-Out Graph (31 Days)</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'heatmap' ? 'bg-[#D4A373] text-white shadow-xs' : 'bg-white/60 text-[#8B5E3C] hover:bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-base">grid_on</span>
            <span>3. Attendance Heatmap Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('burndown')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'burndown' ? 'bg-[#D4A373] text-white shadow-xs' : 'bg-white/60 text-[#8B5E3C] hover:bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-base">stacked_line_chart</span>
            <span>4. Task Burndown & Velocity</span>
          </button>

          <button
            onClick={() => setActiveTab('station_radar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'station_radar' ? 'bg-[#D4A373] text-white shadow-xs' : 'bg-white/60 text-[#8B5E3C] hover:bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-base">radar</span>
            <span>5. Station Hours & Radar Matrix</span>
          </button>
        </div>

        {/* GRAPH 1: MONTHLY EMPLOYEE PERFORMANCE GRAPH */}
        {(activeTab === 'all' || activeTab === 'performance') && (
          <EmployeePerformanceChart
            data={performanceData}
            selectedEmployee={effectiveEmployee}
            monthName={monthName}
            year={selectedYear}
          />
        )}

        {/* GRAPH 2: MONTHLY CHECK-IN & CHECK-OUT GRAPH (COMPLETE MONTH) */}
        {(activeTab === 'all' || activeTab === 'checkin_checkout') && (
          <CheckInOutMonthlyChart
            data={checkInOutData}
            selectedEmployee={effectiveEmployee}
            monthName={monthName}
            year={selectedYear}
            isManager={isManager}
            onSelectEmployee={setSelectedEmployee}
            attendanceLogs={attendanceLogs}
            team={team}
          />
        )}

        {/* GRAPH 3: WORKFORCE 31-DAY ATTENDANCE HEATMAP MATRIX */}
        {(activeTab === 'all' || activeTab === 'heatmap') && (
          <AttendanceHeatmapMatrix
            rows={heatmapRows}
            monthName={monthName}
            year={selectedYear}
          />
        )}

        {/* GRAPH 4: TASK COMPLETION VELOCITY & SPRINT BURNDOWN */}
        {(activeTab === 'all' || activeTab === 'burndown') && (
          <TaskVelocityBurndownChart
            data={burndownData}
            monthName={monthName}
            year={selectedYear}
          />
        )}

        {/* GRAPH 5: STATION HOURS DISTRIBUTION & MULTI-AXIS RADAR */}
        {(activeTab === 'all' || activeTab === 'station_radar') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StationHoursDonutChart
              data={stationDistribution}
              monthName={monthName}
              year={selectedYear}
            />

            <EmployeeRadarChart
              data={radarMetrics}
              selectedEmployee={effectiveEmployee}
            />
          </div>
        )}
      </div>
    </div>
  );
};
