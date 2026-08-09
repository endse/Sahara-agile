import { AttendanceLog, Task, TeamMember } from '../types';

export interface DailyCheckInOutData {
  day: number;
  date: string;
  dayName: string;
  employeeName: string;
  userAvatar?: string;
  clockInIso?: string;
  clockOutIso?: string;
  clockInFormatted: string;
  clockOutFormatted: string;
  clockInHourDecimal: number;
  clockOutHourDecimal: number;
  totalHours: number;
  overtimeHours: number;
  breakMinutes: number;
  status: 'on_time' | 'late' | 'early_checkout' | 'overtime' | 'off_duty' | 'clocked_in_now';
  locationName: string;
  isWeekend: boolean;
}

export interface DailyPerformanceData {
  day: number;
  date: string;
  employeeName: string;
  userAvatar?: string;
  performanceScore: number;
  tasksCompleted: number;
  tasksAssigned: number;
  qualityRating: number;
  efficiencyPct: number;
  hoursWorked: number;
}

export interface HeatmapCell {
  day: number;
  date: string;
  status: 'full_shift' | 'overtime_shift' | 'late_shift' | 'active_now' | 'flagged' | 'off_duty';
  totalHours: number;
  clockIn: string;
  clockOut: string;
  location: string;
}

export interface EmployeeHeatmapRow {
  employeeName: string;
  avatar: string;
  role: string;
  days: HeatmapCell[];
  monthlyTotalHours: number;
  monthlyPunctualityPct: number;
}

export interface TaskBurndownPoint {
  day: number;
  date: string;
  targetRemaining: number;
  actualRemaining: number;
  tasksCompletedCumulative: number;
  tasksCreatedCumulative: number;
}

export interface StationDistributionItem {
  stationName: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  percentage: number;
  color: string;
}

export interface EmployeeRadarMetrics {
  employeeName: string;
  avatar: string;
  role: string;
  taskVelocity: number;
  punctuality: number;
  hoursConsistency: number;
  qualitySafety: number;
  collaboration: number;
  overallScore: number;
}

export interface AllEmployeesDayCheckInOutData {
  day: number;
  date: string;
  dayName: string;
  isWeekend: boolean;
  employeeShifts: DailyCheckInOutData[];
  earliestClockIn: number;
  latestClockOut: number;
  totalTeamHours: number;
  totalTeamOvertime: number;
  onTimeCount: number;
  lateCount: number;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function formatDecimalToTime(decimalHour: number): string {
  if (decimalHour <= 0 || isNaN(decimalHour)) return '—';
  const hours = Math.floor(decimalHour);
  const mins = Math.round((decimalHour - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = mins < 10 ? `0${mins}` : `${mins}`;
  return `${displayHours}:${displayMins} ${period}`;
}

/**
 * Calculates 31 days of Check-In & Check-Out records for a given month and employee.
 * Strictly uses real attendance logs.
 */
export function getMonthlyCheckInOutData(
  year: number,
  month: number,
  employeeName: string = 'all',
  attendanceLogs: AttendanceLog[] = [],
  team: TeamMember[] = []
): DailyCheckInOutData[] {
  const daysCount = getDaysInMonth(year, month);
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const result: DailyCheckInOutData[] = [];

  const targetEmpObj = team.find((e) => e.name === employeeName) || { name: employeeName, avatar: '' };

  for (let day = 1; day <= daysCount; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeekNum = dateObj.getDay();
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6;

    // Check if there is an explicit real attendance log for this date & employee
    const matchedLogs = attendanceLogs.filter((l) => {
      const matchEmp = employeeName === 'all' ? true : l.userName.toLowerCase() === employeeName.toLowerCase();
      const matchDate = l.date === dateStr;
      return matchEmp && matchDate;
    });

    if (matchedLogs.length > 0) {
      const mainLog = matchedLogs[0];
      const inDate = new Date(mainLog.clockInTime);
      const clockInDecimal = inDate.getHours() + inDate.getMinutes() / 60;
      let clockOutDecimal = 0;
      let clockOutFormatted = 'Active';

      if (mainLog.clockOutTime) {
        const outDate = new Date(mainLog.clockOutTime);
        clockOutDecimal = outDate.getHours() + outDate.getMinutes() / 60;
        clockOutFormatted = formatDecimalToTime(clockOutDecimal);
      }

      const totalH = mainLog.totalHours || (clockOutDecimal > 0 ? Number((clockOutDecimal - clockInDecimal).toFixed(2)) : 8.0);
      const otH = mainLog.overtimeHours || (totalH > 8 ? Number((totalH - 8).toFixed(2)) : 0);

      result.push({
        day,
        date: dateStr,
        dayName,
        employeeName: mainLog.userName,
        userAvatar: mainLog.userAvatar || targetEmpObj.avatar,
        clockInIso: mainLog.clockInTime,
        clockOutIso: mainLog.clockOutTime,
        clockInFormatted: formatDecimalToTime(clockInDecimal),
        clockOutFormatted,
        clockInHourDecimal: Number(clockInDecimal.toFixed(2)),
        clockOutHourDecimal: Number(clockOutDecimal.toFixed(2)),
        totalHours: totalH,
        overtimeHours: otH,
        breakMinutes: mainLog.breakMinutes || 30,
        status: mainLog.status === 'clocked_in' ? 'clocked_in_now' : otH > 0 ? 'overtime' : clockInDecimal > 8.5 ? 'late' : 'on_time',
        locationName: mainLog.locationName || 'Field Station',
        isWeekend,
      });
    } else {
      result.push({
        day,
        date: dateStr,
        dayName,
        employeeName: employeeName === 'all' ? targetEmpObj.name || 'Team' : employeeName,
        userAvatar: targetEmpObj.avatar,
        clockInFormatted: '—',
        clockOutFormatted: '—',
        clockInHourDecimal: 0,
        clockOutHourDecimal: 0,
        totalHours: 0,
        overtimeHours: 0,
        breakMinutes: 0,
        status: 'off_duty',
        locationName: isWeekend ? 'Off Duty (Weekend)' : 'No Shift Logged',
        isWeekend,
      });
    }
  }

  return result;
}

/**
 * Calculates 31 days of Check-In & Check-Out records aggregated for ALL team members.
 */
export function getAllEmployeesMonthlyCheckInOutData(
  year: number,
  month: number,
  attendanceLogs: AttendanceLog[] = [],
  team: TeamMember[] = []
): AllEmployeesDayCheckInOutData[] {
  const daysCount = getDaysInMonth(year, month);
  const empList = team;
  if (empList.length === 0) return [];

  const result: AllEmployeesDayCheckInOutData[] = [];

  const employeeLogMaps = empList.map((emp) =>
    getMonthlyCheckInOutData(year, month, emp.name, attendanceLogs, team)
  );

  for (let day = 1; day <= daysCount; day++) {
    const shiftsForDay: DailyCheckInOutData[] = employeeLogMaps.map((logs) => logs[day - 1]);
    const firstShift = shiftsForDay[0];

    const activeShifts = shiftsForDay.filter((s) => s.totalHours > 0);
    const earliestClockIn = activeShifts.length > 0 ? Math.min(...activeShifts.map((s) => s.clockInHourDecimal)) : 0;
    const latestClockOut = activeShifts.length > 0 ? Math.max(...activeShifts.map((s) => s.clockOutHourDecimal)) : 0;
    const totalTeamHours = Number(shiftsForDay.reduce((a, b) => a + b.totalHours, 0).toFixed(1));
    const totalTeamOvertime = Number(shiftsForDay.reduce((a, b) => a + b.overtimeHours, 0).toFixed(1));
    const onTimeCount = shiftsForDay.filter((s) => s.status === 'on_time').length;
    const lateCount = shiftsForDay.filter((s) => s.status === 'late').length;

    result.push({
      day,
      date: firstShift.date,
      dayName: firstShift.dayName,
      isWeekend: firstShift.isWeekend,
      employeeShifts: shiftsForDay,
      earliestClockIn,
      latestClockOut,
      totalTeamHours,
      totalTeamOvertime,
      onTimeCount,
      lateCount,
    });
  }

  return result;
}

/**
 * Calculates 31 days of Employee Performance metrics for a given month and employee.
 */
export function getMonthlyPerformanceData(
  year: number,
  month: number,
  employeeName: string = 'all',
  tasks: Task[] = [],
  team: TeamMember[] = []
): DailyPerformanceData[] {
  const daysCount = getDaysInMonth(year, month);
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const result: DailyPerformanceData[] = [];
  const targetEmpObj = team.find((e) => e.name === employeeName) || { name: employeeName, avatar: '' };

  for (let day = 1; day <= daysCount; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const dayTasks = tasks.filter((t) => {
      const matchEmp = employeeName === 'all' ? true : t.assignee.name.toLowerCase().includes(employeeName.toLowerCase());
      const taskDate = t.updatedAt ? t.updatedAt.slice(0, 10) : t.dueDate ? t.dueDate.slice(0, 10) : '';
      return matchEmp && taskDate === dateStr;
    });

    const tasksCompleted = dayTasks.filter((t) => t.status === 'done').length;
    const tasksAssigned = dayTasks.length;

    let performanceScore = 0;
    let qualityRating = 0;
    let efficiencyPct = 0;

    if (tasksAssigned > 0) {
      performanceScore = Math.round((tasksCompleted / tasksAssigned) * 100);
      qualityRating = Number((3.5 + (tasksCompleted / tasksAssigned) * 1.5).toFixed(1));
      efficiencyPct = Math.min(100, Math.round(70 + (tasksCompleted / tasksAssigned) * 30));
    }

    result.push({
      day,
      date: dateStr,
      employeeName: employeeName === 'all' ? 'Team Average' : employeeName,
      userAvatar: targetEmpObj.avatar,
      performanceScore,
      tasksCompleted,
      tasksAssigned,
      qualityRating,
      efficiencyPct,
      hoursWorked: 0,
    });
  }

  return result;
}

/**
 * Generates 31-day Attendance Heatmap matrix across team members.
 */
export function getMonthlyHeatmapMatrix(
  year: number,
  month: number,
  attendanceLogs: AttendanceLog[] = [],
  team: TeamMember[] = []
): EmployeeHeatmapRow[] {
  const empList = team;

  if (empList.length === 0) {
    return [];
  }

  return empList.map((emp) => {
    const dailyLogs = getMonthlyCheckInOutData(year, month, emp.name, attendanceLogs, team);
    let totalH = 0;
    let onTimeCount = 0;
    let activeDaysCount = 0;

    const cells: HeatmapCell[] = dailyLogs.map((d) => {
      totalH += d.totalHours;
      if (d.totalHours > 0) activeDaysCount++;
      if (d.status === 'on_time') onTimeCount++;

      let cellStatus: HeatmapCell['status'] = 'off_duty';
      if (d.status === 'clocked_in_now') cellStatus = 'active_now';
      else if (d.overtimeHours > 0) cellStatus = 'overtime_shift';
      else if (d.status === 'late') cellStatus = 'late_shift';
      else if (d.totalHours > 0) cellStatus = 'full_shift';

      return {
        day: d.day,
        date: d.date,
        status: cellStatus,
        totalHours: d.totalHours,
        clockIn: d.clockInFormatted,
        clockOut: d.clockOutFormatted,
        location: d.locationName,
      };
    });

    const punctuality = activeDaysCount > 0 ? Math.round((onTimeCount / activeDaysCount) * 100) : 0;

    return {
      employeeName: emp.name,
      avatar: emp.avatar || '',
      role: emp.role || 'Field Operator',
      days: cells,
      monthlyTotalHours: Number(totalH.toFixed(1)),
      monthlyPunctualityPct: punctuality,
    };
  });
}

/**
 * Calculates 31-day Task Burndown & Cumulative Velocity Data.
 */
export function getMonthlyTaskBurndown(
  year: number,
  month: number,
  tasks: Task[] = []
): TaskBurndownPoint[] {
  const daysCount = getDaysInMonth(year, month);
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const totalTasksCount = tasks.length;
  const result: TaskBurndownPoint[] = [];

  for (let day = 1; day <= daysCount; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const createdTillNow = tasks.filter((t) => {
      const createdDate = t.updatedAt ? t.updatedAt.slice(0, 10) : t.dueDate ? t.dueDate.slice(0, 10) : dateStr;
      return createdDate <= dateStr;
    }).length;

    const completedTillNow = tasks.filter((t) => {
      if (t.status !== 'done') return false;
      const completedDate = t.updatedAt ? t.updatedAt.slice(0, 10) : dateStr;
      return completedDate <= dateStr;
    }).length;

    const idealRemaining = totalTasksCount > 0 ? Math.max(0, Math.round(totalTasksCount * (1 - day / daysCount))) : 0;
    const actualRemaining = Math.max(0, createdTillNow - completedTillNow);

    result.push({
      day,
      date: dateStr,
      targetRemaining: idealRemaining,
      actualRemaining,
      tasksCompletedCumulative: completedTillNow,
      tasksCreatedCumulative: createdTillNow,
    });
  }

  return result;
}

/**
 * Calculates shift hours & overtime distribution across field station locations.
 */
export function getStationHoursDistribution(attendanceLogs: AttendanceLog[] = []): StationDistributionItem[] {
  const stationMap: { [key: string]: { reg: number; ot: number } } = {};

  attendanceLogs.forEach((log) => {
    const loc = log.locationName || 'Main Station';
    if (!stationMap[loc]) stationMap[loc] = { reg: 0, ot: 0 };
    const reg = Math.min(8, log.totalHours || 0);
    const ot = log.overtimeHours || 0;
    stationMap[loc].reg += reg;
    stationMap[loc].ot += ot;
  });

  const entries = Object.entries(stationMap);
  if (entries.length === 0) {
    return [];
  }

  const colors = ['#606C38', '#D4A373', '#2A9D8F', '#E76F51', '#3D3028'];
  let totalAllHours = 0;
  entries.forEach(([, v]) => (totalAllHours += v.reg + v.ot));

  return entries.map(([name, data], idx) => {
    const tot = data.reg + data.ot;
    const pct = totalAllHours > 0 ? Math.round((tot / totalAllHours) * 100) : 0;
    return {
      stationName: name,
      regularHours: Number(data.reg.toFixed(1)),
      overtimeHours: Number(data.ot.toFixed(1)),
      totalHours: Number(tot.toFixed(1)),
      percentage: pct,
      color: colors[idx % colors.length],
    };
  });
}

/**
 * Calculates 5-axis Radar Competency Metrics for Team Members.
 */
export function getEmployeeRadarMetrics(
  team: TeamMember[] = [],
  tasks: Task[] = [],
  attendanceLogs: AttendanceLog[] = []
): EmployeeRadarMetrics[] {
  const empList = team;

  if (empList.length === 0) {
    return [];
  }

  return empList.map((emp) => {
    const empTasks = tasks.filter((t) => t.assignee.name.toLowerCase().includes(emp.name.toLowerCase()));
    const completedTasks = empTasks.filter((t) => t.status === 'done').length;
    const taskVelocity = empTasks.length > 0 ? Math.round((completedTasks / empTasks.length) * 100) : 0;

    const empLogs = attendanceLogs.filter((l) => l.userName.toLowerCase() === emp.name.toLowerCase());
    const onTimeLogs = empLogs.filter((l) => l.status === 'clocked_in' || l.status === 'clocked_out');
    const punctuality = empLogs.length > 0 ? Math.round((onTimeLogs.length / empLogs.length) * 100) : 0;

    const totalHours = empLogs.reduce((a, b) => a + (b.totalHours || 0), 0);
    const hoursConsistency = empLogs.length > 0 ? Math.min(100, Math.round((totalHours / (empLogs.length * 8)) * 100)) : 0;

    const qualitySafety = empTasks.length > 0 ? (emp.performance || 90) : 0;
    const collaboration = empTasks.length > 0 ? Math.min(100, empTasks.length * 20) : 0;
    const overallScore = Math.round((taskVelocity + punctuality + hoursConsistency + qualitySafety + collaboration) / 5);

    return {
      employeeName: emp.name,
      avatar: emp.avatar || '',
      role: emp.role || 'Field Lead',
      taskVelocity,
      punctuality,
      hoursConsistency,
      qualitySafety,
      collaboration,
      overallScore,
    };
  });
}
