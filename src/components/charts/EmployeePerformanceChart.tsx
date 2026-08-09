import React, { useState } from 'react';
import { DailyPerformanceData } from '../../services/monthlyAnalyticsService';

interface EmployeePerformanceChartProps {
  data: DailyPerformanceData[];
  selectedEmployee: string;
  monthName: string;
  year: number;
}

export const EmployeePerformanceChart: React.FC<EmployeePerformanceChartProps> = ({
  data,
  selectedEmployee,
  monthName,
  year,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DailyPerformanceData | null>(null);
  const [activeMetric, setActiveMetric] = useState<'score' | 'tasks' | 'efficiency'>('score');

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-xs text-[#8B5E3C]">No performance data available.</div>;
  }

  // Dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const totalDays = data.length;
  const getX = (index: number) => paddingLeft + (index / (totalDays - 1 || 1)) * chartWidth;

  // Metric Range
  let minVal = 60;
  let maxVal = 100;
  if (activeMetric === 'tasks') {
    minVal = 0;
    maxVal = Math.max(5, ...data.map((d) => d.tasksAssigned));
  } else if (activeMetric === 'efficiency') {
    minVal = 50;
    maxVal = 100;
  }

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    const ratio = (clamped - minVal) / (maxVal - minVal || 1);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  // Generate SVG Path for Line and Area
  const points = data.map((d, i) => {
    const val = activeMetric === 'score' ? d.performanceScore : activeMetric === 'tasks' ? d.tasksCompleted : d.efficiencyPct;
    return `${getX(i)},${getY(val)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(totalDays - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  // Calculate Averages
  const avgScore = Math.round(data.reduce((a, b) => a + b.performanceScore, 0) / (data.length || 1));
  const totalCompleted = data.reduce((a, b) => a + b.tasksCompleted, 0);
  const avgQuality = (data.reduce((a, b) => a + b.qualityRating, 0) / (data.length || 1)).toFixed(1);

  return (
    <div className="bg-white border border-[#E5D5C0] rounded-3xl p-6 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3E9DC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B5E3C] text-xl">trending_up</span>
            <h3 className="font-bold text-base text-[#3D3028]">
              Monthly Employee Performance Trajectory ({monthName} {year})
            </h3>
          </div>
          <p className="text-xs text-[#8B5E3C] mt-0.5">
            Full 31-day operational score, task throughput, and quality ratings for{' '}
            <strong className="text-[#3D3028]">{selectedEmployee === 'all' ? 'All Team Personnel (Average)' : selectedEmployee}</strong>.
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-[#FDF8F3] p-1 rounded-xl border border-[#E5D5C0] self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('score')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'score' ? 'bg-[#D4A373] text-white shadow-2xs' : 'text-[#8B5E3C] hover:bg-white'
            }`}
          >
            Performance Score (%)
          </button>
          <button
            onClick={() => setActiveMetric('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'tasks' ? 'bg-[#D4A373] text-white shadow-2xs' : 'text-[#8B5E3C] hover:bg-white'
            }`}
          >
            Tasks Completed
          </button>
          <button
            onClick={() => setActiveMetric('efficiency')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'efficiency' ? 'bg-[#D4A373] text-white shadow-2xs' : 'text-[#8B5E3C] hover:bg-white'
            }`}
          >
            Efficiency Index
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Monthly Avg Score</span>
          <span className="text-xl font-headline font-bold text-[#3D3028]">{avgScore}%</span>
        </div>
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Total Tasks Finished</span>
          <span className="text-xl font-headline font-bold text-[#606C38]">{totalCompleted} tasks</span>
        </div>
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">Avg Quality Rating</span>
          <span className="text-xl font-headline font-bold text-[#D4A373]">{avgQuality} / 5.0</span>
        </div>
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#8B5E3C] block">31-Day Target Status</span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
            Target Exceeded (+14%)
          </span>
        </div>
      </div>

      {/* Chart SVG */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-[320px]">
          <defs>
            <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4A373" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#D4A373" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
            const yPos = paddingTop + chartHeight * r;
            const gridVal = Math.round(maxVal - r * (maxVal - minVal));
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={svgWidth - paddingRight}
                  y2={yPos}
                  stroke="#E5D5C0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] fill-[#8B5E3C] font-mono font-medium"
                >
                  {gridVal}
                  {activeMetric === 'tasks' ? '' : '%'}
                </text>
              </g>
            );
          })}

          {/* Target Benchmark Line (85%) */}
          {activeMetric === 'score' && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(85)}
                x2={svgWidth - paddingRight}
                y2={getY(85)}
                stroke="#606C38"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text x={svgWidth - paddingRight - 10} y={getY(85) - 4} textAnchor="end" className="text-[9px] fill-[#606C38] font-bold">
                Target (85%)
              </text>
            </g>
          )}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#perfGrad)" />

          {/* Line Path */}
          <path d={linePath} fill="none" stroke="#D4A373" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Task Bars underlay if activeMetric is tasks */}
          {activeMetric === 'tasks' &&
            data.map((d, i) => {
              const x = getX(i);
              const yAssigned = getY(d.tasksAssigned);
              const yCompleted = getY(d.tasksCompleted);
              const barH = paddingTop + chartHeight - yCompleted;
              return (
                <g key={`bar-${i}`}>
                  <rect
                    x={x - 6}
                    y={yCompleted}
                    width={12}
                    height={barH}
                    fill="#606C38"
                    rx={3}
                    className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  />
                </g>
              );
            })}

          {/* Day Data Points */}
          {data.map((d, i) => {
            const val = activeMetric === 'score' ? d.performanceScore : activeMetric === 'tasks' ? d.tasksCompleted : d.efficiencyPct;
            const cx = getX(i);
            const cy = getY(val);
            const isHovered = hoveredPoint?.day === d.day;

            return (
              <g key={d.day}>
                {/* Day X-Axis Label */}
                {(i % 2 === 0 || i === data.length - 1) && (
                  <text
                    x={cx}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className={`text-[9px] font-mono ${isHovered ? 'fill-[#3D3028] font-bold' : 'fill-[#8B5E3C]'}`}
                  >
                    D{d.day}
                  </text>
                )}

                {/* Interactive Circle Marker */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? '#3D3028' : '#D4A373'}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2 : 1.5}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(d)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-[#3D3028] text-white text-xs p-3 rounded-2xl shadow-xl z-20 space-y-1.5 border border-[#D4A373]">
            <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-1">
              <span className="font-bold text-[#D4A373]">
                {hoveredPoint.date} (Day {hoveredPoint.day})
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                Score: {hoveredPoint.performanceScore}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div>
                <span className="opacity-70">Tasks Completed:</span> <strong>{hoveredPoint.tasksCompleted}</strong>
              </div>
              <div>
                <span className="opacity-70">Quality Rating:</span> <strong>{hoveredPoint.qualityRating} / 5.0</strong>
              </div>
              <div>
                <span className="opacity-70">Efficiency:</span> <strong>{hoveredPoint.efficiencyPct}%</strong>
              </div>
              <div>
                <span className="opacity-70">Hours Logged:</span> <strong>{hoveredPoint.hoursWorked} hrs</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
