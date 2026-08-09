import React, { useState } from 'react';
import { TaskBurndownPoint } from '../../services/monthlyAnalyticsService';

interface TaskVelocityBurndownChartProps {
  data: TaskBurndownPoint[];
  monthName: string;
  year: number;
}

export const TaskVelocityBurndownChart: React.FC<TaskVelocityBurndownChartProps> = ({
  data,
  monthName,
  year,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TaskBurndownPoint | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-xs text-[#8B5E3C]">No task burndown data available.</div>;
  }

  const svgWidth = 800;
  const svgHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(30, ...data.map((d) => Math.max(d.actualRemaining, d.targetRemaining, d.tasksCompletedCumulative)));
  const minVal = 0;

  const getX = (i: number) => paddingLeft + (i / (data.length - 1 || 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (val / maxVal) * chartHeight;

  // Paths
  const targetPoints = data.map((d, i) => `${getX(i)},${getY(d.targetRemaining)}`).join(' L ');
  const actualPoints = data.map((d, i) => `${getX(i)},${getY(d.actualRemaining)}`).join(' L ');
  const completedPoints = data.map((d, i) => `${getX(i)},${getY(d.tasksCompletedCumulative)}`).join(' L ');

  const areaCompleted = `${completedPoints} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  const totalTasksDone = data[data.length - 1]?.tasksCompletedCumulative || 0;
  const remainingBacklog = data[data.length - 1]?.actualRemaining || 0;

  return (
    <div className="bg-white border border-[#E5D5C0] rounded-3xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3E9DC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B5E3C] text-xl">stacked_line_chart</span>
            <h3 className="font-bold text-base text-[#3D3028]">
              Monthly Task Completion Velocity & Sprint Burndown ({monthName} {year})
            </h3>
          </div>
          <p className="text-xs text-[#8B5E3C] mt-0.5">
            Cumulative task resolution velocity vs target burndown trajectory across 31 days.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1 text-[#606C38]">
            <span className="w-3 h-1 bg-[#606C38] rounded-full" /> Tasks Completed (Velocity)
          </span>
          <span className="flex items-center gap-1 text-[#E76F51]">
            <span className="w-3 h-1 bg-[#E76F51] rounded-full" /> Backlog Remaining
          </span>
          <span className="flex items-center gap-1 text-stone-400">
            <span className="w-3 h-0.5 bg-stone-400 stroke-dasharray" /> Ideal Target Line
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Tasks Completed This Month</span>
          <span className="text-xl font-headline font-bold text-[#606C38]">{totalTasksDone} tasks</span>
        </div>
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Remaining Backlog</span>
          <span className="text-xl font-headline font-bold text-[#E76F51]">{remainingBacklog} items</span>
        </div>
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Burn Rate Status</span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mt-1">
            Ahead of Schedule (+18%)
          </span>
        </div>
      </div>

      {/* SVG */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-[300px]">
          <defs>
            <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#606C38" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#606C38" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((r, idx) => {
            const y = paddingTop + chartHeight * r;
            const val = Math.round(maxVal - r * maxVal);
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#E5D5C0" strokeDasharray="4 4" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-[#8B5E3C] font-mono">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Completed Area */}
          <path d={areaCompleted} fill="url(#compGrad)" />

          {/* Target Burndown Line */}
          <path d={`M ${targetPoints}`} fill="none" stroke="#A8A29E" strokeWidth="2" strokeDasharray="6 4" />

          {/* Actual Remaining Backlog Line */}
          <path d={`M ${actualPoints}`} fill="none" stroke="#E76F51" strokeWidth="2.5" />

          {/* Tasks Completed Line */}
          <path d={`M ${completedPoints}`} fill="none" stroke="#606C38" strokeWidth="3" />

          {/* Points */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.tasksCompletedCumulative);
            const isHovered = hoveredPoint?.day === d.day;

            return (
              <g key={d.day}>
                {(i % 2 === 0 || i === data.length - 1) && (
                  <text x={cx} y={svgHeight - 12} textAnchor="middle" className="text-[9px] fill-[#8B5E3C] font-mono">
                    D{d.day}
                  </text>
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 3}
                  fill={isHovered ? '#3D3028' : '#606C38'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(d)}
                />
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-[#3D3028] text-white text-xs p-3 rounded-2xl shadow-xl z-20 border border-[#D4A373] space-y-1">
            <div className="font-bold text-[#D4A373] border-b border-white/20 pb-1">
              Day {hoveredPoint.day} ({hoveredPoint.date})
            </div>
            <p>Completed Cumulative: <strong>{hoveredPoint.tasksCompletedCumulative} tasks</strong></p>
            <p>Backlog Remaining: <strong>{hoveredPoint.actualRemaining} tasks</strong></p>
            <p>Target Target: <strong>{hoveredPoint.targetRemaining} tasks</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};
