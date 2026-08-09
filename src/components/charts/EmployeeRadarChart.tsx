import React, { useState } from 'react';
import { EmployeeRadarMetrics } from '../../services/monthlyAnalyticsService';

interface EmployeeRadarChartProps {
  data: EmployeeRadarMetrics[];
  selectedEmployee: string;
}

export const EmployeeRadarChart: React.FC<EmployeeRadarChartProps> = ({ data, selectedEmployee }) => {
  const [activeEmpName, setActiveEmpName] = useState<string>(
    selectedEmployee !== 'all' ? selectedEmployee : data[0]?.employeeName || 'Amara Vance'
  );

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-xs text-[#8B5E3C]">No radar metrics available.</div>;
  }

  const activeEmpTarget = selectedEmployee !== 'all' ? selectedEmployee : activeEmpName;
  const activeMetrics = data.find((d) => d.employeeName === activeEmpTarget) || data[0];

  // Canvas & Radar Dimensions
  const svgWidth = 350;
  const svgHeight = 310;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2 + 5;
  const radius = 88;

  const axes = [
    { key: 'taskVelocity', label: 'Task Velocity', align: 'middle', dx: 0, dy: -14 },
    { key: 'punctuality', label: 'Punctuality', align: 'start', dx: 12, dy: 4 },
    { key: 'hoursConsistency', label: 'Shift Hours', align: 'start', dx: 10, dy: 16 },
    { key: 'qualitySafety', label: 'Quality & Safety', align: 'end', dx: -10, dy: 16 },
    { key: 'collaboration', label: 'Collaboration', align: 'end', dx: -12, dy: 4 },
  ];

  const totalAxes = axes.length;

  const getCoordinates = (axisIndex: number, valueRatio: number) => {
    const angle = (Math.PI * 2 * axisIndex) / totalAxes - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Polygon Path
  const polyPoints = axes
    .map((axis, i) => {
      const val = (activeMetrics as any)[axis.key] || 0;
      const coords = getCoordinates(i, val / 100);
      return `${coords.x},${coords.y}`;
    })
    .join(' ');

  return (
    <div className="bg-white border border-[#E5D5C0] rounded-3xl p-6 shadow-sm space-y-4 overflow-hidden w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3E9DC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B5E3C] text-xl">radar</span>
            <h3 className="font-bold text-base text-[#3D3028]">Multi-Axis Employee Performance Matrix</h3>
          </div>
          <p className="text-xs text-[#8B5E3C] mt-0.5">
            5-point competency profile evaluating operational strengths and field consistency.
          </p>
        </div>

        {/* Employee Selector Pills */}
        {data.length > 1 && (
          <div className="flex flex-wrap items-center gap-1 bg-[#FDF8F3] p-1 rounded-xl border border-[#E5D5C0]">
            {data.map((emp) => (
              <button
                key={emp.employeeName}
                onClick={() => setActiveEmpName(emp.employeeName)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeEmpTarget === emp.employeeName ? 'bg-[#606C38] text-white shadow-2xs' : 'text-[#8B5E3C] hover:bg-white'
                }`}
              >
                {emp.employeeName.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 min-w-0">
        {/* SVG Radar Container with responsive scaling */}
        <div className="relative shrink-0 flex items-center justify-center max-w-full overflow-visible">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-w-[310px] sm:max-w-[340px] h-auto overflow-visible"
          >
            {/* Concentric Grid Polygons */}
            {[0.25, 0.5, 0.75, 1.0].map((rRatio) => (
              <polygon
                key={rRatio}
                points={axes
                  .map((_, i) => {
                    const coords = getCoordinates(i, rRatio);
                    return `${coords.x},${coords.y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke={rRatio === 1.0 ? '#D4A373' : '#E5D5C0'}
                strokeDasharray={rRatio === 1.0 ? 'none' : '3 3'}
                strokeWidth={rRatio === 1.0 ? '1.5' : '1'}
              />
            ))}

            {/* Radial Axis Lines & Outside Non-Overlapping Labels */}
            {axes.map((axis, i) => {
              const outer = getCoordinates(i, 1.0);
              const labelPos = getCoordinates(i, 1.0);
              const lx = labelPos.x + axis.dx;
              const ly = labelPos.y + axis.dy;

              return (
                <g key={axis.key}>
                  <line x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#E5D5C0" strokeWidth="1" />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor={axis.align as any}
                    className="text-[11px] font-bold fill-[#8B5E3C]"
                  >
                    {axis.label}
                  </text>
                </g>
              );
            })}

            {/* Filled Radar Polygon */}
            <polygon points={polyPoints} fill="#606C38" fillOpacity="0.35" stroke="#606C38" strokeWidth="2.5" />

            {/* Data Point Markers & Clean Badge Tags */}
            {axes.map((axis, i) => {
              const val = (activeMetrics as any)[axis.key] || 0;
              const coords = getCoordinates(i, val / 100);

              // Offset for percentage badge
              let badgeX = coords.x;
              let badgeY = coords.y;

              if (i === 0) badgeY -= 14;
              else if (i === 1) { badgeX -= 18; badgeY -= 10; }
              else if (i === 2) { badgeX -= 18; badgeY -= 10; }
              else if (i === 3) { badgeX += 18; badgeY -= 10; }
              else if (i === 4) { badgeX += 18; badgeY -= 10; }

              return (
                <g key={`pt-${axis.key}`}>
                  {/* Point Circle */}
                  <circle cx={coords.x} cy={coords.y} r={5} fill="#3D3028" stroke="#ffffff" strokeWidth="2" />

                  {/* Percentage Value Pill Badge */}
                  <g transform={`translate(${badgeX}, ${badgeY})`}>
                    <rect
                      x={-14}
                      y={-9}
                      width={28}
                      height={16}
                      rx={5}
                      fill="#3D3028"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-white font-mono"
                    >
                      {val}%
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Employee Summary Card - Strictly Contained with min-w-0 */}
        <div className="flex-1 bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl p-4 space-y-3 w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-[#E5D5C0] pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={activeMetrics.avatar}
                alt={activeMetrics.employeeName}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#D4A373] shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#3D3028] truncate">{activeMetrics.employeeName}</h4>
                <p className="text-[11px] text-[#8B5E3C] truncate">{activeMetrics.role}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] font-bold uppercase text-[#8B5E3C] block leading-tight">Overall Score</span>
              <span className="text-lg sm:text-xl font-headline font-bold text-[#606C38]">{activeMetrics.overallScore}%</span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-2 text-xs">
            {axes.map((axis) => {
              const val = (activeMetrics as any)[axis.key] || 0;
              return (
                <div key={axis.key} className="space-y-0.5">
                  <div className="flex justify-between font-medium text-[#3D3028] text-[11px]">
                    <span className="truncate">{axis.label}</span>
                    <span className="font-bold font-mono ml-2 shrink-0">{val}%</span>
                  </div>
                  <div className="w-full bg-[#E5D5C0] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#D4A373] h-full rounded-full transition-all duration-500" style={{ width: `${val}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
