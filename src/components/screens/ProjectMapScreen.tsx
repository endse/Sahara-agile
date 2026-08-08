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
      <div className="bg-[#F3E9DC] border border-[#E5D5C0] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B5E3C]">
            <span className="material-symbols-outlined text-base">map</span>
            Geospatial Field Telemetry
          </div>
          <h1 className="font-headline text-3xl lg:text-4xl font-light text-[#2D241E] mt-1">
            Project Map - Sahara
          </h1>
          <p className="text-sm text-[#8B5E3C]">
            Interactive GIS layout of field stations, microgrid arrays, and aquifer sampling points.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-1 rounded-full flex items-center gap-1">
            {(['topographic', 'satellite', 'thermal'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setMapMode(mode)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                  mapMode === mode ? 'bg-[#D4A373] text-white shadow-xs' : 'text-[#5C4D42] hover:bg-[#E5D5C0]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('NewProject', 'slide_up')}
            className="px-4 py-2.5 bg-[#606C38] hover:bg-[#4d572d] text-white rounded-2xl text-xs font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-base">add_location_alt</span>
            <span>New Project</span>
          </button>

          <button
            onClick={() => onNavigate('NewTask', 'slide_up')}
            className="px-4 py-2.5 bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] rounded-2xl text-xs font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-base text-[#D4A373]">add_task</span>
            <span>Geotag Task</span>
          </button>
        </div>
      </div>

      {/* Main Map Container & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Simulated Canvas Map */}
        <div className="lg:col-span-2 relative bg-[#3a302a] rounded-3xl overflow-hidden min-h-[480px] lg:min-h-[560px] border border-[#d8d0c8] shadow-md flex flex-col justify-between p-6">
          {/* Map Canvas Background Simulation */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
              mapMode === 'satellite'
                ? 'opacity-85 mix-blend-normal'
                : mapMode === 'thermal'
                ? 'opacity-90 contrast-125 sepia-100 hue-rotate-180'
                : 'opacity-70 mix-blend-luminosity'
            }`}
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80")'
            }}
          />

          {/* Map Overlay Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#c2652a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

          {/* Top Info Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-[#faf5ee]/90 backdrop-blur-md border border-[#e0d8cc] rounded-xl px-4 py-2 text-xs font-semibold text-[#3a302a] flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live SatCom Link Active — Sahara Sector 04</span>
            </div>

            <div className="bg-[#3a302a]/80 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-xl border border-white/10 font-mono">
              24.80° N, 12.10° E • Elev: 420m
            </div>
          </div>

          {/* Geotagged Pin Markers */}
          <div className="relative z-10 w-full h-full my-auto py-12">
            {locations.map((loc) => {
              const isSelected = selectedLocation.id === loc.id;
              const isHovered = hoveredLocationId === loc.id;
              
              // Smart tooltip placement based on coordinates to prevent clipping
              const positionVertical = loc.coordinates.y < 42 ? 'top-full mt-3' : 'bottom-full mb-3';
              const positionHorizontal = loc.coordinates.x > 70 
                ? 'right-0' 
                : loc.coordinates.x < 30 
                ? 'left-0' 
                : 'left-1/2 -translate-x-1/2';

              return (
                <div
                  key={loc.id}
                  style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group ${
                    isSelected ? 'z-40' : 'z-20 hover:z-30'
                  }`}
                  onMouseEnter={() => setHoveredLocationId(loc.id)}
                  onMouseLeave={() => setHoveredLocationId(null)}
                >
                  <button
                    onClick={() => setSelectedLocation(loc)}
                    className={`relative transition-all duration-300 focus:outline-none ${
                      isSelected ? 'scale-125' : 'hover:scale-110'
                    }`}
                  >
                    <div className="relative flex flex-col items-center">
                      {/* Ripple effect for active pin */}
                      {isSelected && (
                        <span className="absolute -inset-2 rounded-full bg-[#c2652a]/40 animate-ping pointer-events-none" />
                      )}

                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-all border-2 border-white ${
                          loc.status === 'warning'
                            ? 'bg-rose-600 text-white ring-2 ring-rose-400/50'
                            : loc.status === 'completed'
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
                            : 'bg-[#c2652a] text-white ring-2 ring-[#c2652a]/50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">pin_drop</span>
                      </div>

                      <div className="mt-1 bg-[#3a302a]/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow border border-white/20 whitespace-nowrap">
                        {loc.name.split(' ')[0]} ({loc.temperature})
                      </div>
                    </div>
                  </button>

                  {/* Interactive Floating Card Tooltip on Marker Hover */}
                  <div
                    className={`absolute ${positionVertical} ${positionHorizontal} w-72 bg-[#2D241E]/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto ${
                      isHovered
                        ? 'opacity-100 scale-100 translate-y-0 visible z-50'
                        : 'opacity-0 scale-95 translate-y-2 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:visible group-hover:z-50'
                    }`}
                  >
                    {/* Header: Project Name & Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5 mb-2.5">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#D4A373] tracking-wider block">
                          {loc.region}
                        </span>
                        <h4 className="font-headline font-semibold text-sm text-white leading-snug">
                          {loc.name}
                        </h4>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          loc.status === 'warning'
                            ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                            : loc.status === 'completed'
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                            : 'bg-[#D4A373]/30 text-[#F5E6D3] border border-[#D4A373]/40'
                        }`}
                      >
                        {loc.status}
                      </span>
                    </div>

                    {/* Current Site Director / Lead */}
                    <div className="flex items-center gap-2 mb-3 bg-white/5 rounded-xl p-2 border border-white/5">
                      <div className="w-7 h-7 rounded-full bg-[#D4A373] text-[#2D241E] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {loc.lead.charAt(0)}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[10px] text-stone-400 font-medium leading-tight">Current Lead</p>
                        <p className="text-xs font-bold text-white truncate">{loc.lead}</p>
                      </div>
                    </div>

                    {/* Weather Data Telemetry */}
                    <div className="bg-[#1A1411]/80 rounded-xl p-3 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-amber-400 text-lg">wb_sunny</span>
                          <span className="text-xs font-bold text-amber-300">
                            {loc.weatherCondition || 'Clear & Arid'}
                          </span>
                        </div>
                        <span className="font-headline text-xl font-bold text-white">
                          {loc.temperature}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/10 text-[10px] text-stone-300">
                        <div className="flex items-center gap-1" title="Humidity">
                          <span className="material-symbols-outlined text-[13px] text-sky-400">water_drop</span>
                          <span>{loc.humidity || '14%'}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Wind Velocity">
                          <span className="material-symbols-outlined text-[13px] text-teal-400">air</span>
                          <span>{loc.windSpeed || '18 km/h'}</span>
                        </div>
                        <div className="flex items-center gap-1" title="UV Index">
                          <span className="material-symbols-outlined text-[13px] text-orange-400">light_mode</span>
                          <span>UV {loc.uvIndex?.split(' ')[0] || 'High'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Missions & Onsite Crew */}
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-stone-300 px-1 pt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-[#D4A373]">task</span>
                        {loc.taskCount} Active Tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-emerald-400">group</span>
                        {loc.crewCount} Onsite Crew
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar Legend */}
          <div className="relative z-10 bg-[#FDF8F3]/90 backdrop-blur-md border border-[#E5D5C0] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#3D3028]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4A373]" /> Operational Hub
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BC4749]" /> High Ambient Alert
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#606C38]" /> Completed Site
              </span>
            </div>

            <button
              onClick={() => onNavigate('TaskBoard', 'none')}
              className="text-xs font-bold text-[#D4A373] hover:underline flex items-center gap-1"
            >
              <span>View Tasks for Pin</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Selected Pin Inspector Panel */}
        <div className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#F3E9DC] pb-4 space-y-1">
            <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">{selectedLocation.region}</span>
            <h3 className="font-headline text-2xl font-semibold text-[#3D3028]">{selectedLocation.name}</h3>
            <p className="text-xs text-[#8B5E3C]">Site Director: <strong className="text-[#3D3028]">{selectedLocation.lead}</strong></p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FDF8F3] p-3.5 rounded-2xl border border-[#F3E9DC] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#8B5E3C]">Ambient Heat</span>
              <p className="font-headline text-2xl font-semibold text-[#3D3028]">{selectedLocation.temperature}</p>
            </div>

            <div className="bg-[#FDF8F3] p-3.5 rounded-2xl border border-[#F3E9DC] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#8B5E3C]">Field Crew</span>
              <p className="font-headline text-2xl font-semibold text-[#3D3028]">{selectedLocation.crewCount} Onsite</p>
            </div>

            <div className="bg-[#FDF8F3] p-3.5 rounded-2xl border border-[#F3E9DC] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#8B5E3C]">Active Tasks</span>
              <p className="font-headline text-2xl font-semibold text-[#D4A373]">{selectedLocation.taskCount}</p>
            </div>

            <div className="bg-[#FDF8F3] p-3.5 rounded-2xl border border-[#F3E9DC] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#8B5E3C]">Status</span>
              <p className="font-headline text-lg font-semibold capitalize text-[#606C38]">{selectedLocation.status}</p>
            </div>
          </div>

          {/* Location Tasks */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-[#8B5E3C] uppercase tracking-wider">Associated Missions</h4>
            <div className="space-y-2">
              {tasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    if (onSelectTask) onSelectTask(t);
                    onNavigate('TaskBoardActivity', 'push');
                  }}
                  className="bg-[#FDF8F3] p-3 rounded-2xl border border-[#F3E9DC] hover:border-[#D4A373] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#D4A373]">{t.code}</span>
                    <p className="text-xs font-semibold text-[#3D3028]">{t.title}</p>
                  </div>
                  <span className="material-symbols-outlined text-lg text-[#8B5E3C]">chevron_right</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#F3E9DC] space-y-3">
            <button
              onClick={() => onNavigate('TeamSync', 'none')}
              className="w-full bg-[#606C38] hover:bg-[#4d572d] text-white py-3 px-4 rounded-2xl text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base">groups</span>
              <span>Contact Station Director</span>
            </button>
            <button
              onClick={() => onNavigate('NewTask', 'slide_up')}
              className="w-full bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] py-2.5 px-4 rounded-2xl text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base text-[#D4A373]">add_task</span>
              <span>Assign Task to {selectedLocation.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
