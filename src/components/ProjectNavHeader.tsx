import React from 'react';
import { ScreenId, TransitionType } from '../types';

interface ProjectNavHeaderProps {
  currentScreen: ScreenId;
  totalProjects: number;
  totalSites: number;
  assignedPersonnelCount: number;
  activeRole: 'Manager' | 'Employee';
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
}

export const ProjectNavHeader: React.FC<ProjectNavHeaderProps> = ({
  currentScreen,
  totalProjects,
  totalSites,
  assignedPersonnelCount,
  activeRole,
  onNavigate,
}) => {
  return (
    <div className="bg-[#F3E9DC] border border-[#E5D5C0] rounded-3xl p-5 lg:p-7 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Description */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B5E3C]">
            <span className="material-symbols-outlined text-base text-[#D4A373]">travel_explore</span>
            <span>Sahara Project Hub & Command Center</span>
            {activeRole === 'Manager' ? (
              <span className="bg-[#FEFAE0] text-[#606C38] border border-[#E9EDC9] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#606C38] animate-pulse" />
                Manager Controls Active
              </span>
            ) : (
              <span className="bg-[#FDF8F3] text-[#5C4D42] border border-[#E5D5C0] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-2">
                Field View
              </span>
            )}
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-light text-[#2D241E] mt-1">
            Projects & Field Locations
          </h1>
          <p className="text-xs lg:text-sm text-[#8B5E3C] max-w-2xl">
            Track active infrastructure projects, inspect site coordinates, assign team members, and manage field workloads in real time.
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
          <div className="bg-white/80 border border-[#E5D5C0] rounded-2xl p-2.5 sm:p-3 text-center shadow-2xs">
            <span className="text-[10px] font-bold text-[#8B5E3C] uppercase block">Projects</span>
            <span className="font-headline text-lg sm:text-xl font-bold text-[#2D241E]">{totalProjects}</span>
          </div>
          <div className="bg-white/80 border border-[#E5D5C0] rounded-2xl p-2.5 sm:p-3 text-center shadow-2xs">
            <span className="text-[10px] font-bold text-[#8B5E3C] uppercase block">GIS Sites</span>
            <span className="font-headline text-lg sm:text-xl font-bold text-[#606C38]">{totalSites}</span>
          </div>
          <div className="bg-white/80 border border-[#E5D5C0] rounded-2xl p-2.5 sm:p-3 text-center shadow-2xs">
            <span className="text-[10px] font-bold text-[#8B5E3C] uppercase block">Assigned Staff</span>
            <span className="font-headline text-lg sm:text-xl font-bold text-[#D4A373]">{assignedPersonnelCount}</span>
          </div>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5D5C0]">
        <div className="flex items-center gap-1.5 bg-[#FDF8F3] border border-[#E5D5C0] p-1 rounded-2xl">
          <button
            onClick={() => onNavigate('ProjectTimeline', 'none')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentScreen === 'ProjectTimeline'
                ? 'bg-[#606C38] text-white shadow-xs'
                : 'text-[#5C4D42] hover:text-[#2D241E] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">timeline</span>
            <span>Timeline Roadmap</span>
          </button>

          <button
            onClick={() => onNavigate('ProjectMap', 'none')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentScreen === 'ProjectMap'
                ? 'bg-[#606C38] text-white shadow-xs'
                : 'text-[#5C4D42] hover:text-[#2D241E] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">map</span>
            <span>Locations Map</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeRole === 'Manager' ? (
            <button
              onClick={() => onNavigate('NewProject', 'slide_up')}
              className="px-4 py-2 bg-[#D4A373] hover:bg-[#b88555] active:scale-95 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">add_location_alt</span>
              <span>+ Create Project</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('NewTask', 'slide_up')}
              className="px-4 py-2 bg-[#606C38] hover:bg-[#4d572d] text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">add_task</span>
              <span>+ Log Task</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('TaskBoard', 'none')}
            className="px-3 py-2 bg-white border border-[#E5D5C0] hover:bg-[#FAF5EE] text-[#3D3028] font-bold rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-[#D4A373]">view_kanban</span>
            <span className="hidden sm:inline">Tasks Board</span>
          </button>
        </div>
      </div>
    </div>
  );
};
