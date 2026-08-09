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
  clockInHourDecimal: number; // e.g. 8.25 for 08:15 AM
  clockOutHourDecimal: number; // e.g. 17.5 for 05:30 PM
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
  performanceScore: number; // 0..100
  tasksCompleted: number;
  tasksAssigned: number;
  qualityRating: number; // 1.0..5.0
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
  taskVelocity: number; // 0..100
  punctuality: number; // 0..100
  hoursConsistency: number; // 0..100
  qualitySafety: number; // 0..100
  collaboration: number; // 0..100
  overallScore: number;
}

const DEFAULT_EMPLOYEES = [
  { name: 'Amara Vance', role: 'Lead Hydro-Geologist', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  { name: 'Tariq Al-Mansoor', role: 'Grid Architect', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { name: 'Elena Rostova', role: 'Robotics Lead', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
  { name: 'Kofi Mensah', role: 'Ecologist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
  { name: 'Maya Lin', role: 'SatCom Lead', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' }
];

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

// Pseudo-random deterministic generator based on seed string
function seedRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
}

/**
 * Calculates 31 days of Check-In & Check-Out records for a given month and employee.
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

  const targetEmpObj = DEFAULT_EMPLOYEES.find((e) => e.name === employeeName) || DEFAULT_EMPLOYEES[0];

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
        locationName: mainLog.locationName || 'Al-Kufra Hydro Site',
        isWeekend,
      });
    } else {
      // Deterministic simulation for historical complete 31-day month view
      if (isWeekend) {
        const rndWeekend = seedRandom(`${employeeName}-${dateStr}-wknd`);
        if (rndWeekend > 0.75) { // Occasional weekend shift
          const clockInDec = 8.5 + rndWeekend * 0.5;
          const totalH = 6.0 + rndWeekend * 2;
          const clockOutDec = clockInDec + totalH;

          result.push({
            day,
            date: dateStr,
            dayName,
            employeeName: employeeName === 'all' ? targetEmpObj.name : employeeName,
            userAvatar: targetEmpObj.avatar,
            clockInFormatted: formatDecimalToTime(clockInDec),
            clockOutFormatted: formatDecimalToTime(clockOutDec),
            clockInHourDecimal: Number(clockInDec.toFixed(2)),
            clockOutHourDecimal: Number(clockOutDec.toFixed(2)),
            totalHours: Number(totalH.toFixed(2)),
            overtimeHours: Number(Math.max(0, totalH - 8).toFixed(2)),
            breakMinutes: 30,
            status: 'overtime',
            locationName: 'Djanet Microgrid Station',
            isWeekend: true,
          });
        } else {
          result.push({
            day,
            date: dateStr,
            dayName,
            employeeName: employeeName === 'all' ? targetEmpObj.name : employeeName,
            userAvatar: targetEmpObj.avatar,
            clockInFormatted: '—',
            clockOutFormatted: '—',
            clockInHourDecimal: 0,
            clockOutHourDecimal: 0,
            totalHours: 0,
            overtimeHours: 0,
            breakMinutes: 0,
            status: 'off_duty',
            locationName: 'Off Duty (Weekend)',
            isWeekend: true,
          });
        }
      } else {
        // Weekday shift
        const rnd = seedRandom(`${employeeName}-${dateStr}`);
        const clockInDec = 7.5 + rnd * 1.25; // 07:30 AM to 08:45 AM
        const shiftDuration = 8.0 + (rnd > 0.6 ? (rnd - 0.6) * 4 : 0); // 8.0 to 9.6 hrs
        const clockOutDec = clockInDec + shiftDuration;
        const otH = shiftDuration > 8.0 ? Number((shiftDuration - 8.0).toFixed(2)) : 0;
        const statusVal = otH > 0 ? 'overtime' : clockInDec > 8.5 ? 'late' : 'on_time';
        const stations = ['Al-Kufra Hydro Site', 'Djanet Microgrid', 'Tibesti Base', 'Siwa Oasis Shelter', 'Sebha Solar Complex'];
        const station = stations[Math.floor(rnd * stations.length)];

        result.push({
          day,
          date: dateStr,
          dayName,
          employeeName: employeeName === 'all' ? targetEmpObj.name : employeeName,
          userAvatar: targetEmpObj.avatar,
          clockInFormatted: formatDecimalToTime(clockInDec),
          clockOutFormatted: formatDecimalToTime(clockOutDec),
          clockInHourDecimal: Number(clockInDec.toFixed(2)),
          clockOutHourDecimal: Number(clockOutDec.toFixed(2)),
          totalHours: Number(shiftDuration.toFixed(2)),
          overtimeHours: otH,
          breakMinutes: rnd > 0.5 ? 45 : 30,
          status: statusVal,
          locationName: station,
          isWeekend: false,
        });
      }
    }
  }

  return result;
}

/**
 * Calculates 31 days of Check-In & Check-Out records aggregated for ALL 5 team members.
 */
export function getAllEmployeesMonthlyCheckInOutData(
  year: number,
  month: number,
  attendanceLogs: AttendanceLog[] = [],
  team: TeamMember[] = []
): AllEmployeesDayCheckInOutData[] {
  const daysCount = getDaysInMonth(year, month);
  const empList = team.length > 0 ? team : DEFAULT_EMPLOYEES;
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
  const targetEmpObj = DEFAULT_EMPLOYEES.find((e) => e.name === employeeName) || DEFAULT_EMPLOYEES[0];

  for (let day = 1; day <= daysCount; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const dateObj = new Date(year, month - 1, day);
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    const rnd = seedRandom(`perf-${employeeName}-${dateStr}`);
    
    // Performance score base (82 to 98 for weekday, 0 or light bonus on weekend)
    let score = isWeekend ? (rnd > 0.75 ? Math.round(75 + rnd * 20) : 0) : Math.round(82 + rnd * 17);
    let completed = isWeekend ? (rnd > 0.75 ? 1 : 0) : Math.floor(1 + rnd * 3);
    let assigned = isWeekend ? completed : completed + Math.floor(rnd * 2);
    let quality = isWeekend ? (score > 0 ? 4.2 : 0) : Number((4.0 + rnd * 0.95).toFixed(1));
    let efficiency = isWeekend ? (score > 0 ? 85 : 0) : Math.round(85 + rnd * 14);
    let hoursWorked = isWeekend ? (score > 0 ? 6.0 : 0) : Number((8.0 + rnd * 1.5).toFixed(1));

    result.push({
      day,
      date: dateStr,
      employeeName: employeeName === 'all' ? 'Team Average' : employeeName,
      userAvatar: targetEmpObj.avatar,
      performanceScore: score,
      tasksCompleted: completed,
      tasksAssigned: assigned,
      qualityRating: quality,
      efficiencyPct: efficiency,
      hoursWorked,
    });
  }

  return result;
}

/**
 * Generates 31-day Attendance Heatmap matrix across all team members.
 */
export function getMonthlyHeatmapMatrix(
  year: number,
  month: number,
  attendanceLogs: AttendanceLog[] = [],
  team: TeamMember[] = []
): EmployeeHeatmapRow[] {
  const daysCount = getDaysInMonth(year, month);
  const empList = team.length > 0 ? team : DEFAULT_EMPLOYEES;

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

    const punctuality = activeDaysCount > 0 ? Math.round((onTimeCount / activeDaysCount) * 100) : 100;

    return {
      employeeName: emp.name,
      avatar: emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
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
  const totalTasksCount = Math.max(25, tasks.length * 3);
  const result: TaskBurndownPoint[] = [];

  let cumCompleted = 0;
  let cumCreated = Math.floor(totalTasksCount * 0.4);

  for (let day = 1; day <= daysCount; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const dateObj = new Date(year, month - 1, day);
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    const rnd = seedRandom(`burndown-${dateStr}`);
    if (!isWeekend) {
      cumCompleted += Math.floor(1 + rnd * 2);
      if (day < 20) cumCreated += Math.floor(rnd * 1.5);
    }

    const idealRemaining = Math.max(0, Math.round(totalTasksCount * (1 - day / daysCount)));
    const actualRemaining = Math.max(0, cumCreated - cumCompleted);

    result.push({
      day,
      date: dateStr,
      targetRemaining: idealRemaining,
      actualRemaining,
      tasksCompletedCumulative: cumCompleted,
      tasksCreatedCumulative: cumCreated,
    });
  }

  return result;
}

/**
 * Calculates shift hours & overtime distribution across field station locations.
 */
export function getStationHoursDistribution(attendanceLogs: AttendanceLog[] = []): StationDistributionItem[] {
  const stationMap: { [key: string]: { reg: number; ot: number } } = {
    'Al-Kufra Hydro Site': { reg: 340, ot: 42 },
    'Djanet Microgrid': { reg: 280, ot: 38 },
    'Tibesti Base': { reg: 240, ot: 28 },
    'Siwa Oasis Shelter': { reg: 190, ot: 15 },
    'Sebha Solar Complex': { reg: 150, ot: 12 },
  };

  // Add real attendance logs if available
  attendanceLogs.forEach((log) => {
    const loc = log.locationName || 'Al-Kufra Hydro Site';
    if (!stationMap[loc]) stationMap[loc] = { reg: 0, ot: 0 };
    const reg = Math.min(8, log.totalHours || 0);
    const ot = log.overtimeHours || 0;
    stationMap[loc].reg += reg;
    stationMap[loc].ot += ot;
  });

  const colors = ['#606C38', '#D4A373', '#2A9D8F', '#E76F51', '#3D3028'];
  let totalAllHours = 0;
  Object.values(stationMap).forEach((v) => (totalAllHours += v.reg + v.ot));

  return Object.entries(stationMap).map(([name, data], idx) => {
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
  const empList = team.length > 0 ? team : DEFAULT_EMPLOYEES;

  return empList.map((emp) => {
    const rnd = seedRandom(`radar-${emp.name}`);
    const taskVelocity = Math.min(100, Math.round(85 + rnd * 14));
    const punctuality = Math.min(100, Math.round(88 + rnd * 11));
    const hoursConsistency = Math.min(100, Math.round(82 + rnd * 16));
    const qualitySafety = Math.min(100, Math.round(90 + rnd * 9));
    const collaboration = Math.min(100, Math.round(84 + rnd * 15));
    const overallScore = Math.round((taskVelocity + punctuality + hoursConsistency + qualitySafety + collaboration) / 5);

    return {
      employeeName: emp.name,
      avatar: emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
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
