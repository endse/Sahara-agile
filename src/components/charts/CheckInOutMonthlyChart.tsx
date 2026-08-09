import React, { useState } from 'react';
import { DailyCheckInOutData } from '../../services/monthlyAnalyticsService';

interface CheckInOutMonthlyChartProps {
  data: DailyCheckInOutData[];
  selectedEmployee: string;
  monthName: string;
  year: number;
}

export const CheckInOutMonthlyChart: React.FC<CheckInOutMonthlyChartProps> = ({
  data,
  selectedEmployee,
  monthName,
  year,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DailyCheckInOutData | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-xs text-[#8B5E3C]">No attendance check-in/out records found.</div>;
  }

  // Canvas Dimensions
  const svgWidth = 860;
  const svgHeight = 330;
  const paddingLeft = 65;
  const paddingRight = 25;
  const paddingTop = 32;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Time Axis scale: 06:00 AM (6.0) to 20:00 PM (20.0)
  const minHour = 6;
  const maxHour = 20;

  const getYForHour = (hourDec: number) => {
    const clamped = Math.max(minHour, Math.min(maxHour, hourDec));
    const ratio = (clamped - minHour) / (maxHour - minHour);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const dayWidth = chartWidth / (data.length || 1);

  // Aggregations
  const activeDays = data.filter((d) => d.totalHours > 0);
  const totalMonthHours = data.reduce((a, b) => a + b.totalHours, 0);
  const totalOvertime = data.reduce((a, b) => a + b.overtimeHours, 0);
  const onTimeCount = data.filter((d) => d.status === 'on_time').length;
  const punctualityPct = activeDays.length > 0 ? Math.round((onTimeCount / activeDays.length) * 100) : 100;

  return (
    <div className="bg-white border border-[#E5D5C0] rounded-3xl p-6 shadow-sm space-y-4">
      {/* Title Bar & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3E9DC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B5E3C] text-xl">schedule</span>
            <h3 className="font-bold text-base text-[#3D3028]">
              Monthly Check-In & Check-Out Shift Graph ({monthName} {year})
            </h3>
          </div>
          <p className="text-xs text-[#8B5E3C] mt-0.5">
            Full 31-day shift range visualization (Arrival clock-in vs Departure clock-out times) for{' '}
            <strong className="text-[#3D3028]">{selectedEmployee === 'all' ? 'All Team Members' : selectedEmployee}</strong>.
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#606C38]" /> On-Time Shift (08:00 AM)
          </span>
          <span className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D4A373]" /> Overtime Shift
          </span>
          <span className="flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Late Arrival (&gt;08:30 AM)
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Total Logged Hours</span>
          <span className="text-xl font-headline font-bold text-[#3D3028]">{totalMonthHours.toFixed(1)} hrs</span>
        </div>
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Total Overtime Earned</span>
          <span className="text-xl font-headline font-bold text-amber-700">{totalOvertime.toFixed(1)} hrs</span>
        </div>
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Punctuality Score</span>
          <span className="text-xl font-headline font-bold text-[#606C38]">{punctualityPct}%</span>
        </div>
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Active Shift Days</span>
          <span className="text-xl font-headline font-bold text-[#3D3028]">{activeDays.length} / 31 days</span>
        </div>
      </div>

      {/* Chart Canvas SVG */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[360px]"
          onMouseLeave={() => setHoveredDay(null)}
        >
          {/* Standard Target Shift Window Box (08:00 AM to 17:00 PM) */}
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

          {/* Time Y-Axis Lines & Labels */}
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

          {/* 31-Day Range Bars */}
          {data.map((d, i) => {
            const x = paddingLeft + i * dayWidth + dayWidth * 0.15;
            const barWidth = Math.max(8, dayWidth * 0.7);

            if (d.totalHours === 0) {
              // Off Duty / Weekend Marker
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

            // Determine bar fill color
            let barColor = '#606C38'; // Default on-time green
            if (d.status === 'clocked_in_now') barColor = '#2A9D8F';
            else if (d.overtimeHours > 0) barColor = '#D4A373';
            else if (d.status === 'late') barColor = '#E76F51';

            const isHovered = hoveredDay?.day === d.day;

            return (
              <g
                key={d.day}
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
                className="cursor-pointer"
              >
                {/* Day X-Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  className={`text-[9px] font-mono ${isHovered ? 'fill-[#3D3028] font-bold' : d.isWeekend ? 'fill-amber-800 font-bold' : 'fill-[#8B5E3C]'}`}
                >
                  D{d.day}
                </text>

                {/* Floating Shift Range Bar */}
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

                {/* Clock-In Circle Marker */}
                <circle cx={x + barWidth / 2} cy={yIn} r={3.5} fill="#ffffff" stroke={barColor} strokeWidth={1.5} />

                {/* Clock-Out Circle Marker */}
                <circle cx={x + barWidth / 2} cy={yOut} r={3.5} fill="#3D3028" stroke="#ffffff" strokeWidth={1.5} />
              </g>
            );
          })}

          {/* Clean Target In/Out Badges Positioned Non-Overlapping Above All Bars */}
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

        {/* Hover Tooltip Details — ONLY SHOWN WHEN HOVERING OVER A SPECIFIC BAR */}
        {hoveredDay && (
          <div
            className={`absolute top-2 bg-[#3D3028] text-white text-xs p-3 rounded-2xl shadow-xl z-30 space-y-1 border border-[#D4A373] pointer-events-none transition-all ${
              hoveredDay.day > 16 ? 'left-4' : 'right-4'
            }`}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-1">
              <span className="font-bold text-[#D4A373]">
                {hoveredDay.date} ({hoveredDay.dayName})
              </span>
              <span
                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  hoveredDay.status === 'clocked_in_now'
                    ? 'bg-emerald-400 text-emerald-950'
                    : hoveredDay.overtimeHours > 0
                    ? 'bg-amber-400 text-amber-950'
                    : 'bg-white/20 text-white'
                }`}
              >
                {hoveredDay.status.replace('_', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div>
                <span className="opacity-70">Employee:</span> <strong>{hoveredDay.employeeName}</strong>
              </div>
              <div>
                <span className="opacity-70">Station:</span> <strong>{hoveredDay.locationName}</strong>
              </div>
              <div>
                <span className="opacity-70">Clock In:</span> <strong className="text-emerald-300">{hoveredDay.clockInFormatted}</strong>
              </div>
              <div>
                <span className="opacity-70">Clock Out:</span> <strong className="text-amber-300">{hoveredDay.clockOutFormatted}</strong>
              </div>
              <div>
                <span className="opacity-70">Total Hours:</span> <strong>{hoveredDay.totalHours} hrs</strong>
              </div>
              <div>
                <span className="opacity-70">Overtime:</span> <strong>{hoveredDay.overtimeHours} hrs</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
