import React, { useState } from 'react';
import { ScreenId, SiteLocation, Task } from '../../types';

interface ProjectMapProps {
  locations: SiteLocation[];
  tasks: Task[];
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
  onSelectTask?: (task: Task) => void;
}

export const ProjectMapScreen: React.FC<ProjectMapProps> = ({ locations, tasks, onNavigate, onSelectTask }) => {
  const [selectedLocation, setSelectedLocation] = useState<SiteLocation>(locations[0]);
  const [mapMode, setMapMode] = useState<'satellite' | 'topographic' | 'thermal'>('topographic');
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);

  const locTasks = tasks.filter(t => t.location?.label.toLowerCase().includes(selectedLocation.name.toLowerCase().split(' ')[0]));

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 lg:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A8793A]">
            <span className="material-symbols-outlined text-base">map</span>
            Geospatial Field Telemetry
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#171512] mt-1">
            Project Map
          </h1>
          <p className="text-xs lg:text-sm text-[#625C52]">
            Interactive GIS layout of project locations and site coordinates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#FBF9F4] border border-[#E4DDD0] p-1 rounded-xl flex items-center gap-1">
            {(['topographic', 'satellite', 'thermal'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setMapMode(mode)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  mapMode === mode ? 'bg-[#C49A5A] text-[#0D0D0B] shadow-2xs font-bold' : 'text-[#625C52] hover:bg-[#F7F3EA]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('NewProject', 'slide_up')}
            className="px-4 py-2.5 bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-base">add_location_alt</span>
            <span>+ New Project</span>
          </button>

          <button
            onClick={() => onNavigate('NewTask', 'slide_up')}
            className="px-4 py-2.5 bg-[#FBF9F4] hover:bg-[#F7F3EA] text-[#171512] border border-[#E4DDD0] rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-base text-[#A8793A]">add_task</span>
            <span>+ New Task</span>
          </button>
        </div>
      </div>

      {/* Main Map Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Map Canvas */}
        <div className="lg:col-span-2 bg-[#171613] border border-[#302B24] rounded-2xl p-4 lg:p-6 shadow-xs relative flex flex-col justify-between min-h-[460px] overflow-hidden">
          {/* Map Controls Top Bar */}
          <div className="flex items-center justify-between z-10 bg-[#0D0D0B]/80 backdrop-blur-xs p-3 rounded-xl border border-[#302B24]">
            <div className="flex items-center gap-2 text-xs text-[#F7F3EA]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C49A5A] animate-pulse" />
              <span className="font-mono font-bold text-[#D6B77A]">Cloud Infrastructure Cluster Mesh Active</span>
            </div>
            <span className="text-[10px] font-mono text-[#8A8378]">Mode: {mapMode.toUpperCase()}</span>
          </div>

          {/* Canvas Pins Grid */}
          <div className="relative my-12 h-72 w-full border border-[#302B24] rounded-xl bg-[#0D0D0B]/90 overflow-hidden flex items-center justify-center">
            {/* Grid Lines Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#302B24_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {locations.map((loc) => {
              const isSelected = selectedLocation.id === loc.id;
              const isHovered = hoveredLocationId === loc.id;

              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  onMouseEnter={() => setHoveredLocationId(loc.id)}
                  onMouseLeave={() => setHoveredLocationId(null)}
                  style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300 z-20`}
                >
                  <div className={`relative flex items-center justify-center p-2 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-[#C49A5A] text-[#0D0D0B] border-white scale-125 shadow-md ring-4 ring-[#C49A5A]/30'
                      : isHovered
                      ? 'bg-[#D6B77A] text-[#0D0D0B] border-[#C49A5A] scale-110'
                      : 'bg-[#24211C] text-[#F7F3EA] border-[#302B24]'
                  }`}>
                    <span className="material-symbols-outlined text-base">location_on</span>
                  </div>

                  {/* Hover Label Badge */}
                  <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0D0D0B] text-[#F7F3EA] border border-[#302B24] px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap pointer-events-none transition-opacity ${
                    isSelected || isHovered ? 'opacity-100' : 'opacity-0'
                  }`}>
                    {loc.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Coordinates Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 z-10 bg-[#0D0D0B]/80 backdrop-blur-xs p-3 rounded-xl border border-[#302B24] text-xs text-[#8A8378]">
            <span className="font-mono">Lat: {selectedLocation.coordinates.lat}° N</span>
            <span className="font-mono">Lng: {selectedLocation.coordinates.lng}° E</span>
            <span className="font-semibold text-[#D6B77A]">{selectedLocation.region}</span>
          </div>
        </div>

        {/* Right Column: Selected Location Details Card */}
        <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4DDD0] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8793A] bg-[#C49A5A]/20 px-2 py-0.5 rounded border border-[#C49A5A]/30">
              {selectedLocation.id}
            </span>
            <span className="text-xs font-semibold text-[#625C52]">{selectedLocation.status.toUpperCase()}</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#171512]">{selectedLocation.name}</h3>
            <p className="text-xs text-[#625C52]">Lead: {selectedLocation.lead}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-[#FBF9F4] p-3 rounded-xl border border-[#E4DDD0] text-xs">
            <div>
              <p className="text-[#8A8378]">Crew Count</p>
              <p className="font-bold text-[#171512]">{selectedLocation.crewCount} members</p>
            </div>
            <div>
              <p className="text-[#8A8378]">Task Count</p>
              <p className="font-bold text-[#171512]">{selectedLocation.taskCount} tasks</p>
            </div>
            <div>
              <p className="text-[#8A8378]">Temperature</p>
              <p className="font-bold text-[#171512]">{selectedLocation.temperature}</p>
            </div>
            <div>
              <p className="text-[#8A8378]">Condition</p>
              <p className="font-bold text-[#171512]">{selectedLocation.weatherCondition}</p>
            </div>
          </div>

          {/* Associated Location Tasks */}
          <div className="space-y-2 pt-2 border-t border-[#E4DDD0]">
            <h4 className="font-bold text-xs text-[#171512]">Associated Site Tasks ({locTasks.length})</h4>
            {locTasks.length === 0 ? (
              <p className="text-xs text-[#8A8378] italic">No active tasks pinned to this station.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {locTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (onSelectTask) onSelectTask(t);
                      onNavigate('TaskBoardActivity', 'push');
                    }}
                    className="p-2.5 bg-[#FBF9F4] hover:bg-[#F7F3EA] border border-[#E4DDD0] rounded-xl text-xs cursor-pointer space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#A8793A]">{t.code}</span>
                      <span className="text-[10px] uppercase font-semibold text-[#625C52]">{t.status}</span>
                    </div>
                    <p className="font-semibold text-[#171512] truncate">{t.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
