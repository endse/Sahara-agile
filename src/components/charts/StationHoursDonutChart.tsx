import React, { useState } from 'react';
import { StationDistributionItem } from '../../services/monthlyAnalyticsService';

interface StationHoursDonutChartProps {
  data: StationDistributionItem[];
  monthName: string;
  year: number;
}

export const StationHoursDonutChart: React.FC<StationHoursDonutChartProps> = ({
  data,
  monthName,
  year,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-xs text-[#8B5E3C]">No station data available.</div>;
  }

  const totalAllHours = data.reduce((a, b) => a + b.totalHours, 0);

  // Donut SVG Parameters
  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;

  return (
    <div className="bg-white border border-[#E5D5C0] rounded-3xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="border-b border-[#F3E9DC] pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#8B5E3C] text-xl">pie_chart</span>
          <h3 className="font-bold text-base text-[#3D3028]">Station Shift Hours Distribution</h3>
        </div>
        <p className="text-xs text-[#8B5E3C] mt-0.5">
          Proportion of monthly work hours & overtime logged across field stations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* SVG Donut */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              {data.map((item, idx) => {
                const strokeDasharray = `${(item.totalHours / (totalAllHours || 1)) * circumference} ${circumference}`;
                const strokeDashoffset = -cumulativeAngle;
                cumulativeAngle += (item.totalHours / (totalAllHours || 1)) * circumference;
                const isHovered = hoveredIndex === idx;

                return (
                  <circle
                    key={item.stationName}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all cursor-pointer hover:opacity-90"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </g>
          </svg>

          {/* Center Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-headline font-bold text-[#3D3028]">{totalAllHours.toFixed(0)}h</span>
            <span className="text-[10px] font-bold uppercase text-[#8B5E3C]">Total Hours</span>
          </div>
        </div>

        {/* Legend & Breakdown List */}
        <div className="flex-1 space-y-2.5 w-full">
          {data.map((item, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.stationName}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                  isHovered ? 'bg-[#FDF8F3] border-[#D4A373] shadow-xs' : 'bg-white border-[#F3E9DC]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-[#3D3028] truncate">{item.stationName}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-[#3D3028] font-mono">{item.totalHours} hrs</span>
                  <span className="text-[10px] text-[#8B5E3C] block font-mono">
                    {item.percentage}% ({item.overtimeHours}h OT)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
