import React, { useState } from 'react';
import { EmployeeHeatmapRow, HeatmapCell } from '../../services/monthlyAnalyticsService';

interface AttendanceHeatmapMatrixProps {
  rows: EmployeeHeatmapRow[];
  monthName: string;
  year: number;
}

export const AttendanceHeatmapMatrix: React.FC<AttendanceHeatmapMatrixProps> = ({
  rows,
  monthName,
  year,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ empName: string; cell: HeatmapCell } | null>(null);

  if (!rows || rows.length === 0) {
    return <div className="text-center py-8 text-xs text-[#8B5E3C]">No heatmap data available.</div>;
  }

  const daysCount = rows[0]?.days.length || 31;
  const dayNumbers = Array.from({ length: daysCount }, (_, i) => i + 1);

  return (
    <div className="bg-white border border-[#E5D5C0] rounded-3xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3E9DC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B5E3C] text-xl">grid_on</span>
            <h3 className="font-bold text-base text-[#3D3028]">
              Workforce 31-Day Attendance & Shift Heatmap ({monthName} {year})
            </h3>
          </div>
          <p className="text-xs text-[#8B5E3C] mt-0.5">
            Visual month calendar matrix showing daily shift presence and duty status per employee.
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
          <span className="flex items-center gap-1.5 bg-[#606C38]/15 text-[#4d572d] px-2 py-0.5 rounded-md">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#606C38]" /> Full Shift (8h+)
          </span>
          <span className="flex items-center gap-1.5 bg-[#D4A373]/20 text-[#8B5E3C] px-2 py-0.5 rounded-md">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D4A373]" /> Overtime Shift
          </span>
          <span className="flex items-center gap-1.5 bg-[#E76F51]/20 text-[#C05621] px-2 py-0.5 rounded-md">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#E76F51]" /> Late Shift
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 animate-pulse" /> Active Duty
          </span>
          <span className="flex items-center gap-1.5 bg-[#F3E9DC] text-[#8B5E3C] px-2 py-0.5 rounded-md">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#E5D5C0]" /> Off Duty
          </span>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="relative overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 font-bold text-[#3D3028] min-w-[140px] sticky left-0 bg-white z-10 shadow-xs border-b border-[#E5D5C0]">
                Employee
              </th>
              {dayNumbers.map((d) => (
                <th key={d} className="p-1 text-center font-mono text-[10px] text-[#8B5E3C] border-b border-[#E5D5C0] min-w-[24px]">
                  {d}
                </th>
              ))}
              <th className="p-2 text-right font-bold text-[#3D3028] min-w-[80px] border-b border-[#E5D5C0]">
                Total Hrs
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.employeeName} className="hover:bg-[#FDF8F3] transition-colors">
                {/* Employee Row Label */}
                <td className="p-2 sticky left-0 bg-white z-10 shadow-xs border-b border-[#F3E9DC] flex items-center gap-2">
                  <img src={row.avatar} alt={row.employeeName} className="w-7 h-7 rounded-full object-cover border border-[#D4A373]" />
                  <div className="min-w-0">
                    <span className="font-bold text-[#3D3028] block truncate text-xs">{row.employeeName}</span>
                    <span className="text-[10px] text-[#8B5E3C] truncate block">{row.role}</span>
                  </div>
                </td>

                {/* Day Cells */}
                {row.days.map((cell) => {
                  let bgClass = 'bg-[#FDF8F3] border-[#F3E9DC]'; // Off duty
                  if (cell.status === 'active_now') bgClass = 'bg-emerald-500 border-emerald-600 text-white animate-pulse';
                  else if (cell.status === 'overtime_shift') bgClass = 'bg-[#D4A373] border-[#b88555] text-white';
                  else if (cell.status === 'late_shift') bgClass = 'bg-[#E76F51] border-[#c45236] text-white';
                  else if (cell.status === 'full_shift') bgClass = 'bg-[#606C38] border-[#4d572d] text-white';

                  const isHovered = hoveredCell?.empName === row.employeeName && hoveredCell?.cell.day === cell.day;

                  return (
                    <td key={cell.day} className="p-0.5 border-b border-[#F3E9DC]">
                      <div
                        onMouseEnter={() => setHoveredCell({ empName: row.employeeName, cell })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-[9px] font-bold border transition-all cursor-pointer ${bgClass} ${
                          isHovered ? 'scale-125 z-20 shadow-md ring-2 ring-[#3D3028]' : ''
                        }`}
                      >
                        {cell.totalHours > 0 ? Math.round(cell.totalHours) : ''}
                      </div>
                    </td>
                  );
                })}

                {/* Total Monthly Hours */}
                <td className="p-2 text-right font-bold text-[#3D3028] font-mono border-b border-[#F3E9DC]">
                  {row.monthlyTotalHours} hrs
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Hover Floating Tooltip */}
        {hoveredCell && (
          <div className="absolute top-2 right-4 bg-[#3D3028] text-white text-xs p-3 rounded-2xl shadow-xl z-30 border border-[#D4A373] space-y-1">
            <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-1">
              <span className="font-bold text-[#D4A373]">
                {hoveredCell.empName} — Day {hoveredCell.cell.day}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/20">
                {hoveredCell.cell.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px]">
              <span className="opacity-70">Location:</span> <strong>{hoveredCell.cell.location}</strong>
            </p>
            <p className="text-[11px]">
              <span className="opacity-70">Times:</span> In <strong>{hoveredCell.cell.clockIn}</strong> — Out{' '}
              <strong>{hoveredCell.cell.clockOut}</strong> ({hoveredCell.cell.totalHours} hrs)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
