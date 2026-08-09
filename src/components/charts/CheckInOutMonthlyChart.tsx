import React, { useState, useMemo } from 'react';
import { DailyCheckInOutData, getAllEmployeesMonthlyCheckInOutData, AllEmployeesDayCheckInOutData } from '../../services/monthlyAnalyticsService';
import { AttendanceLog, TeamMember } from '../../types';

interface CheckInOutMonthlyChartProps {
  data: DailyCheckInOutData[];
  selectedEmployee: string;
  monthName: string;
  year: number;
  isManager?: boolean;
  onSelectEmployee?: (empName: string) => void;
  attendanceLogs?: AttendanceLog[];
  team?: TeamMember[];
}

type SortOption = 'day_asc' | 'hours_desc' | 'overtime_desc' | 'late_first';
type FilterOption = 'all' | 'on_time' | 'overtime' | 'late' | 'active';

const EMPLOYEES_ROSTER = [
  { name: 'Amara Vance', role: 'Lead Hydro-Geologist', color: '#606C38' },
  { name: 'Tariq Al-Mansoor', role: 'Grid Architect', color: '#D4A373' },
  { name: 'Elena Rostova', role: 'Robotics Lead', color: '#2A9D8F' },
  { name: 'Kofi Mensah', role: 'Ecologist', color: '#E76F51' },
  { name: 'Maya Lin', role: 'SatCom Lead', color: '#3D3028' },
];

export const CheckInOutMonthlyChart: React.FC<CheckInOutMonthlyChartProps> = ({
  data,
  selectedEmployee,
  monthName,
  year,
  isManager = true,
  onSelectEmployee,
  attendanceLogs = [],
  team = [],
}) => {
  const [hoveredDayData, setHoveredDayData] = useState<DailyCheckInOutData | null>(null);
  const [hoveredTeamDayData, setHoveredTeamDayData] = useState<AllEmployeesDayCheckInOutData | null>(null);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<SortOption>('day_asc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const isAllMode = selectedEmployee === 'all';

  // Compute 5-employee combined team data for August/selected month
  const teamMonthlyData = useMemo(() => {
    return getAllEmployeesMonthlyCheckInOutData(year, 8, attendanceLogs, team);
  }, [year, attendanceLogs, team]);

  // Single-employee data sorting and filtering
  const processedSingleData = useMemo(() => {
    let list = [...data];

    // Filter
    if (filterBy === 'on_time') list = list.filter((d) => d.status === 'on_time');
    else if (filterBy === 'overtime') list = list.filter((d) => d.overtimeHours > 0);
    else if (filterBy === 'late') list = list.filter((d) => d.status === 'late');
    else if (filterBy === 'active') list = list.filter((d) => d.status === 'clocked_in_now' || d.totalHours > 0);

    // Sort
    if (sortBy === 'hours_desc') list.sort((a, b) => b.totalHours - a.totalHours);
    else if (sortBy === 'overtime_desc') list.sort((a, b) => b.overtimeHours - a.overtimeHours);
    else if (sortBy === 'late_first') {
      list.sort((a, b) => (b.status === 'late' ? 1 : 0) - (a.status === 'late' ? 1 : 0));
    } else {
      list.sort((a, b) => a.day - b.day);
    }

    return list;
  }, [data, sortBy, filterBy]);

  // Multi-employee data sorting and filtering
  const processedTeamData = useMemo(() => {
    let list = [...teamMonthlyData];

    if (filterBy === 'on_time') list = list.filter((d) => d.onTimeCount > 0);
    else if (filterBy === 'overtime') list = list.filter((d) => d.totalTeamOvertime > 0);
    else if (filterBy === 'late') list = list.filter((d) => d.lateCount > 0);
    else if (filterBy === 'active') list = list.filter((d) => d.totalTeamHours > 0);

    if (sortBy === 'hours_desc') list.sort((a, b) => b.totalTeamHours - a.totalTeamHours);
    else if (sortBy === 'overtime_desc') list.sort((a, b) => b.totalTeamOvertime - a.totalTeamOvertime);
    else if (sortBy === 'late_first') list.sort((a, b) => b.lateCount - a.lateCount);
    else list.sort((a, b) => a.day - b.day);

    return list;
  }, [teamMonthlyData, sortBy, filterBy]);

  // Canvas Dimensions
  const svgWidth = 880;
  const svgHeight = 340;
  const paddingLeft = 65;
  const paddingRight = 25;
  const paddingTop = 32;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const minHour = 6;
  const maxHour = 20;

  const getYForHour = (hourDec: number) => {
    const clamped = Math.max(minHour, Math.min(maxHour, hourDec));
    const ratio = (clamped - minHour) / (maxHour - minHour);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const currentListLength = isAllMode ? processedTeamData.length : processedSingleData.length;
  const dayWidth = chartWidth / (currentListLength || 1);

  // Aggregations
  const totalLoggedHours = isAllMode
    ? processedTeamData.reduce((a, b) => a + b.totalTeamHours, 0)
    : processedSingleData.reduce((a, b) => a + b.totalHours, 0);

  const totalOvertime = isAllMode
    ? processedTeamData.reduce((a, b) => a + b.totalTeamOvertime, 0)
    : processedSingleData.reduce((a, b) => a + b.overtimeHours, 0);

  return (
    <div className="bg-white border border-[#E5D5C0] rounded-3xl p-6 shadow-sm space-y-4">
      {/* Title Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#F3E9DC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B5E3C] text-xl">schedule</span>
            <h3 className="font-bold text-base text-[#3D3028]">
              Monthly Check-In & Check-Out Shift Graph ({monthName} {year})
            </h3>
          </div>
          <p className="text-xs text-[#8B5E3C] mt-0.5">
            {isAllMode
              ? 'Multi-employee combined 31-day shift clock view for all 5 team personnel.'
              : `31-day arrival clock-in & departure clock-out times for ${selectedEmployee}.`}
          </p>
        </div>

        {/* Manager Controls: Sort & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Employee Filter Selection (Manager Access) */}
          {isManager && onSelectEmployee && (
            <select
              value={selectedEmployee}
              onChange={(e) => onSelectEmployee(e.target.value)}
              className="bg-[#FDF8F3] border border-[#E5D5C0] text-xs font-bold rounded-xl px-3 py-2 text-[#3D3028] outline-none focus:ring-2 focus:ring-[#D4A373]"
            >
              <option value="all">👥 All 5 Field Personnel (Combined View)</option>
              {EMPLOYEES_ROSTER.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  👤 {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          )}

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-[#FDF8F3] border border-[#E5D5C0] text-xs font-semibold rounded-xl px-3 py-2 text-[#3D3028] outline-none focus:ring-2 focus:ring-[#D4A373]"
          >
            <option value="day_asc">Sort: Day 1 → 31</option>
            <option value="hours_desc">Sort: Shift Hours (High → Low)</option>
            <option value="overtime_desc">Sort: Overtime (High → Low)</option>
            <option value="late_first">Sort: Late Arrivals First</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            className="bg-[#FDF8F3] border border-[#E5D5C0] text-xs font-semibold rounded-xl px-3 py-2 text-[#3D3028] outline-none focus:ring-2 focus:ring-[#D4A373]"
          >
            <option value="all">Filter: All Shift Days</option>
            <option value="on_time">Filter: On-Time Only</option>
            <option value="overtime">Filter: Overtime Shifts Only</option>
            <option value="late">Filter: Late Arrivals Only</option>
            <option value="active">Filter: Active Duty Only</option>
          </select>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Total Logged Shift Hours</span>
          <span className="text-xl font-headline font-bold text-[#3D3028]">{totalLoggedHours.toFixed(1)} hrs</span>
        </div>
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Total Overtime Earned</span>
          <span className="text-xl font-headline font-bold text-amber-700">{totalOvertime.toFixed(1)} hrs</span>
        </div>
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Active Shift Days</span>
          <span className="text-xl font-headline font-bold text-[#606C38]">{currentListLength} days</span>
        </div>
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">View Scope</span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
            {isAllMode ? '👥 5 Personnel Combined' : `👤 ${selectedEmployee}`}
          </span>
        </div>
      </div>

      {/* Employee Roster Legend in Combined Mode */}
      {isAllMode && (
        <div className="flex flex-wrap items-center gap-3 bg-[#FDF8F3] p-2.5 rounded-2xl border border-[#E5D5C0] text-[10px] font-bold text-[#3D3028]">
          <span className="uppercase text-[#8B5E3C]">Field Personnel Roster:</span>
          {EMPLOYEES_ROSTER.map((emp) => (
            <button
              key={emp.name}
              onClick={() => onSelectEmployee && onSelectEmployee(emp.name)}
              className="flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: emp.color }} />
              <span>{emp.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chart Canvas SVG */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[360px]"
          onMouseLeave={() => {
            setHoveredDayData(null);
            setHoveredTeamDayData(null);
          }}
        >
          {/* Target Shift Window Box (08:00 AM to 17:00 PM) */}
          <rect
            x={paddingLeft}
            y={getYForHour(17)}
            width={chartWidth}
            height={getYForHour(8) - getYForHour(17)}
            fill="#F3E9DC"
            fillOpacity="0.35"
            stroke="#E5D5C0"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Y-Axis Time Lines */}
          {[6, 8, 10, 12, 14, 16, 18, 20].map((hour) => {
            const yPos = getYForHour(hour);
            const label = hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;

            return (
              <g key={hour}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={svgWidth - paddingRight}
                  y2={yPos}
                  stroke="#E5D5C0"
                  strokeWidth="1"
                  strokeDasharray={hour === 8 || hour === 17 ? 'none' : '2 2'}
                />
                <text
                  x={paddingLeft - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  className={`text-[10px] font-mono ${hour === 8 || hour === 17 ? 'fill-[#3D3028] font-bold' : 'fill-[#8B5E3C]'}`}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* COMBINED 5-EMPLOYEE MODE GRAPH RENDER */}
          {isAllMode ? (
            processedTeamData.map((td, i) => {
              const xGroup = paddingLeft + i * dayWidth + dayWidth * 0.1;
              const groupWidth = Math.max(12, dayWidth * 0.8);
              const subBarW = Math.max(2, groupWidth / 5 - 1);
              const isHovered = hoveredTeamDayData?.day === td.day;

              return (
                <g
                  key={td.day}
                  onMouseEnter={() => setHoveredTeamDayData(td)}
                  onMouseLeave={() => setHoveredTeamDayData(null)}
                  className="cursor-pointer"
                >
                  {/* Day X-Axis Label */}
                  <text
                    x={xGroup + groupWidth / 2}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className={`text-[9px] font-mono ${isHovered ? 'fill-[#3D3028] font-bold' : td.isWeekend ? 'fill-amber-800 font-bold' : 'fill-[#8B5E3C]'}`}
                  >
                    D{td.day}
                  </text>

                  {/* 5 Sub-Bars for each Employee */}
                  {td.employeeShifts.map((empShift, empIdx) => {
                    if (empShift.totalHours === 0) return null;
                    const subX = xGroup + empIdx * (subBarW + 1);
                    const yIn = getYForHour(empShift.clockInHourDecimal);
                    const yOut = getYForHour(empShift.clockOutHourDecimal > 0 ? empShift.clockOutHourDecimal : empShift.clockInHourDecimal + 8);
                    const barHeight = Math.max(10, yIn - yOut);
                    const empColor = EMPLOYEES_ROSTER[empIdx % EMPLOYEES_ROSTER.length].color;

                    return (
                      <g key={empShift.employeeName}>
                        <rect
                          x={subX}
                          y={yOut}
                          width={subBarW}
                          height={barHeight}
                          fill={empColor}
                          rx={2}
                          className="transition-all hover:opacity-90"
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })
          ) : (
            /* SINGLE-EMPLOYEE MODE GRAPH RENDER */
            processedSingleData.map((d, i) => {
              const x = paddingLeft + i * dayWidth + dayWidth * 0.15;
              const barWidth = Math.max(8, dayWidth * 0.7);

              if (d.totalHours === 0) {
                return (
                  <g key={d.day}>
                    <text
                      x={x + barWidth / 2}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-[#8B5E3C]/50"
                    >
                      D{d.day}
                    </text>
                  </g>
                );
              }

              const yIn = getYForHour(d.clockInHourDecimal);
              const yOut = getYForHour(d.clockOutHourDecimal > 0 ? d.clockOutHourDecimal : d.clockInHourDecimal + 8);
              const barHeight = Math.max(12, yIn - yOut);

              let barColor = '#606C38';
              if (d.status === 'clocked_in_now') barColor = '#2A9D8F';
              else if (d.overtimeHours > 0) barColor = '#D4A373';
              else if (d.status === 'late') barColor = '#E76F51';

              const isHovered = hoveredDayData?.day === d.day;

              return (
                <g
                  key={d.day}
                  onMouseEnter={() => setHoveredDayData(d)}
                  onMouseLeave={() => setHoveredDayData(null)}
                  className="cursor-pointer"
                >
                  <text
                    x={x + barWidth / 2}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className={`text-[9px] font-mono ${isHovered ? 'fill-[#3D3028] font-bold' : d.isWeekend ? 'fill-amber-800 font-bold' : 'fill-[#8B5E3C]'}`}
                  >
                    D{d.day}
                  </text>

                  <rect
                    x={x}
                    y={yOut}
                    width={barWidth}
                    height={barHeight}
                    fill={barColor}
                    rx={4}
                    stroke={isHovered ? '#3D3028' : 'none'}
                    strokeWidth={isHovered ? 2.5 : 0}
                    className="transition-all hover:opacity-90 shadow-2xs"
                  />

                  <circle cx={x + barWidth / 2} cy={yIn} r={3.5} fill="#ffffff" stroke={barColor} strokeWidth={1.5} />
                  <circle cx={x + barWidth / 2} cy={yOut} r={3.5} fill="#3D3028" stroke="#ffffff" strokeWidth={1.5} />
                </g>
              );
            })
          )}

          {/* Clean Non-Overlapping Target Badges */}
          <g transform={`translate(${paddingLeft + 10}, ${getYForHour(8) - 18})`}>
            <rect x="0" y="0" width="105" height="16" rx="4" fill="#FEFAE0" stroke="#606C38" strokeWidth="1" />
            <text x="6" y="11" className="text-[9px] fill-[#606C38] font-bold">
              Target In: 08:00 AM
            </text>
          </g>

          <g transform={`translate(${paddingLeft + 10}, ${getYForHour(17) - 18})`}>
            <rect x="0" y="0" width="112" height="16" rx="4" fill="#FDF8F3" stroke="#D4A373" strokeWidth="1" />
            <text x="6" y="11" className="text-[9px] fill-[#8B5E3C] font-bold">
              Target Out: 05:00 PM
            </text>
          </g>
        </svg>

        {/* SINGLE-EMPLOYEE HOVER TOOLTIP */}
        {hoveredDayData && !isAllMode && (
          <div
            className={`absolute top-2 bg-[#3D3028] text-white text-xs p-3 rounded-2xl shadow-xl z-30 space-y-1 border border-[#D4A373] pointer-events-none transition-all ${
              hoveredDayData.day > 16 ? 'left-4' : 'right-4'
            }`}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-1">
              <span className="font-bold text-[#D4A373]">
                {hoveredDayData.date} ({hoveredDayData.dayName})
              </span>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/20">
                {hoveredDayData.status.replace('_', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div><span className="opacity-70">Employee:</span> <strong>{hoveredDayData.employeeName}</strong></div>
              <div><span className="opacity-70">Station:</span> <strong>{hoveredDayData.locationName}</strong></div>
              <div><span className="opacity-70">Clock In:</span> <strong className="text-emerald-300">{hoveredDayData.clockInFormatted}</strong></div>
              <div><span className="opacity-70">Clock Out:</span> <strong className="text-amber-300">{hoveredDayData.clockOutFormatted}</strong></div>
              <div><span className="opacity-70">Total Hours:</span> <strong>{hoveredDayData.totalHours} hrs</strong></div>
              <div><span className="opacity-70">Overtime:</span> <strong>{hoveredDayData.overtimeHours} hrs</strong></div>
            </div>
          </div>
        )}

        {/* COMBINED 5-EMPLOYEE HOVER TOOLTIP */}
        {hoveredTeamDayData && isAllMode && (
          <div
            className={`absolute top-2 bg-[#3D3028] text-white text-xs p-3.5 rounded-2xl shadow-2xl z-30 space-y-2 border border-[#D4A373] pointer-events-none transition-all min-w-[320px] ${
              hoveredTeamDayData.day > 16 ? 'left-4' : 'right-4'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
              <span className="font-bold text-[#D4A373] text-sm">
                Day {hoveredTeamDayData.day} — {hoveredTeamDayData.date} ({hoveredTeamDayData.dayName})
              </span>
              <span className="text-[10px] font-bold bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full">
                5 Staff Audited
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {hoveredTeamDayData.employeeShifts.map((s, idx) => (
                <div key={s.employeeName} className="flex items-center justify-between bg-white/10 p-1.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EMPLOYEES_ROSTER[idx % 5].color }} />
                    <span className="font-bold">{s.employeeName.split(' ')[0]}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-emerald-300">{s.clockInFormatted}</span> → <span className="text-amber-300">{s.clockOutFormatted}</span> ({s.totalHours}h)
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1.5 border-t border-white/20 flex justify-between text-[10px] text-stone-300 font-mono">
              <span>Team Hours: <strong>{hoveredTeamDayData.totalTeamHours}h</strong></span>
              <span>Team OT: <strong>{hoveredTeamDayData.totalTeamOvertime}h</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
