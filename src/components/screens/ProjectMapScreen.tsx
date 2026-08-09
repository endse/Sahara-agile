import React, { useState } from 'react';
import { ScreenId, SiteLocation, Task, TeamMember, TransitionType } from '../../types';
import { ProjectNavHeader } from '../ProjectNavHeader';
import { ProjectAssignMemberModal } from '../ProjectAssignMemberModal';

interface ProjectMapProps {
  locations: SiteLocation[];
  tasks: Task[];
  team?: TeamMember[];
  activeRole?: 'Manager' | 'Employee';
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  onSelectTask?: (task: Task) => void;
  onUpdateLocation?: (location: SiteLocation) => void;
  onAssignMemberToLocation?: (locationId: string, memberId: string) => void;
}

export const ProjectMapScreen: React.FC<ProjectMapProps> = ({
  locations,
  tasks,
  team = [],
  activeRole = 'Manager',
  onNavigate,
  onSelectTask,
  onUpdateLocation,
  onAssignMemberToLocation,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<SiteLocation>(locations[0] || null);
  const [mapMode, setMapMode] = useState<'topographic' | 'satellite' | 'thermal'>('topographic');
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
  const [assignModalLocation, setAssignModalLocation] = useState<SiteLocation | null>(null);

  // Get personnel working on selected site/location
  const getAssignedMembersForLocation = (loc: SiteLocation) => {
    if (!loc) return [];
    const assignedIds = loc.assignedMemberIds || [];
    return team.filter((m) => {
      const isDirectlyAssigned = assignedIds.includes(m.id);
      const isMatchingLocation =
        m.location && m.location.toLowerCase().includes(loc.name.toLowerCase().split(' ')[0]);
      const isLead = m.name.toLowerCase() === loc.lead?.toLowerCase();
      return isDirectlyAssigned || isMatchingLocation || isLead;
    });
  };

  // Get tasks located at selected site
  const locTasks = selectedLocation
    ? tasks.filter(
        (t) =>
          t.location?.label.toLowerCase().includes(selectedLocation.name.toLowerCase().split(' ')[0]) ||
          (t.region && t.region.toLowerCase().includes(selectedLocation.region.toLowerCase().split(' ')[0]))
      )
    : [];

  const handleToggleMemberInModal = (memberId: string) => {
    if (!assignModalLocation) return;
    if (onAssignMemberToLocation) {
      onAssignMemberToLocation(assignModalLocation.id, memberId);
    } else if (onUpdateLocation) {
      const currentAssigned = assignModalLocation.assignedMemberIds || [];
      const updatedIds = currentAssigned.includes(memberId)
        ? currentAssigned.filter((id) => id !== memberId)
        : [...currentAssigned, memberId];

      const updatedLoc = {
        ...assignModalLocation,
        assignedMemberIds: updatedIds,
        crewCount: updatedIds.length,
      };
      onUpdateLocation(updatedLoc);
      setAssignModalLocation(updatedLoc);
      if (selectedLocation?.id === assignModalLocation.id) {
        setSelectedLocation(updatedLoc);
      }
    }
  };

  const totalAssignedPersonnel = team.filter((m) => m.location && m.location !== 'Offline').length;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Shared Nav Header */}
      <ProjectNavHeader
        currentScreen="ProjectMap"
        totalProjects={locations.length}
        totalSites={locations.length}
        assignedPersonnelCount={totalAssignedPersonnel}
        activeRole={activeRole}
        onNavigate={onNavigate}
      />

      {/* Map Mode Toggle & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#F3E9DC] shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#8B5E3C]">GIS View Layer:</span>
          <div className="bg-[#FDF8F3] border border-[#E5D5C0] p-1 rounded-2xl flex items-center gap-1">
            {(['topographic', 'satellite', 'thermal'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setMapMode(mode)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  mapMode === mode ? 'bg-[#D4A373] text-white shadow-xs' : 'text-[#5C4D42] hover:bg-[#E5D5C0]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeRole === 'Manager' && (
            <button
              onClick={() => onNavigate('NewProject', 'slide_up')}
              className="px-4 py-2 bg-[#606C38] hover:bg-[#4d572d] text-white font-bold rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">add_location_alt</span>
              <span>+ Add Field Site</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('NewTask', 'slide_up')}
            className="px-3.5 py-2 bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] font-bold rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-[#D4A373]">add_task</span>
            <span>Geotag Task</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive GIS Map Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive GIS Simulated Canvas */}
        <div className="lg:col-span-2 relative bg-[#3a302a] rounded-[32px] overflow-hidden min-h-[480px] lg:min-h-[580px] border border-[#d8d0c8] shadow-md flex flex-col justify-between p-6">
          {/* Map Canvas Background */}
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
                'url("https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80")',
            }}
          />

          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#c2652a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

          {/* Telemetry Status Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-[#faf5ee]/95 backdrop-blur-md border border-[#e0d8cc] rounded-2xl px-4 py-2 text-xs font-bold text-[#3a302a] flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SatCom Telemetry Active — Sahara Field Grid</span>
            </div>

            <div className="bg-[#3a302a]/80 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-xl border border-white/10 font-mono">
              {selectedLocation?.coordinates.lat.toFixed(2)}° N, {selectedLocation?.coordinates.lng.toFixed(2)}° E
            </div>
          </div>

          {/* Interactive Geotag Pins */}
          <div className="relative z-10 w-full h-full my-auto py-12">
            {locations.map((loc) => {
              const isSelected = selectedLocation?.id === loc.id;
              const isHovered = hoveredLocationId === loc.id;

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

                  {/* Hover Quick Card */}
                  {isHovered && !isSelected && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-[#2D241E]/95 text-white p-2.5 rounded-xl text-[11px] shadow-xl border border-white/20 pointer-events-none z-50">
                      <span className="font-bold block">{loc.name}</span>
                      <span className="text-stone-300">Lead: {loc.lead}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Map Footer Bar */}
          <div className="relative z-10 flex items-center justify-between text-xs text-white/80 bg-[#2D241E]/80 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <span>Select pin on map to inspect location telemetry & assigned staff</span>
            <span className="font-mono text-[10px] text-amber-300">Total Sites: {locations.length}</span>
          </div>
        </div>

        {/* Selected Location Details Inspector */}
        <div className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 shadow-sm space-y-6">
          {selectedLocation ? (
            <>
              {/* Site Header */}
              <div className="border-b border-[#F3E9DC] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
                    {selectedLocation.region}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase px-3 py-0.5 rounded-full ${
                      selectedLocation.status === 'completed'
                        ? 'bg-[#FEFAE0] text-[#606C38] border border-[#E9EDC9]'
                        : selectedLocation.status === 'warning'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-[#FEFAE0] text-[#606C38]'
                    }`}
                  >
                    {selectedLocation.status}
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#3D3028]">
                  {selectedLocation.name}
                </h3>
              </div>

              {/* Environmental Telemetry */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#FDF8F3] p-3 rounded-2xl border border-[#F3E9DC]">
                  <span className="text-[10px] font-bold text-[#8B5E3C] uppercase block">Temperature</span>
                  <span className="font-bold text-sm text-[#3D3028]">{selectedLocation.temperature}</span>
                </div>
                <div className="bg-[#FDF8F3] p-3 rounded-2xl border border-[#F3E9DC]">
                  <span className="text-[10px] font-bold text-[#8B5E3C] uppercase block">Site Director</span>
                  <span className="font-bold text-xs text-[#3D3028] truncate block">{selectedLocation.lead}</span>
                </div>
              </div>

              {/* Assigned Staff & Crew */}
              <div className="space-y-3 pt-2 border-t border-[#F3E9DC]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#3D3028] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#606C38]">groups</span>
                    <span>Assigned Site Crew</span>
                  </h4>

                  {activeRole === 'Manager' && (
                    <button
                      onClick={() => setAssignModalLocation(selectedLocation)}
                      className="text-xs font-bold text-[#606C38] hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Assign</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {getAssignedMembersForLocation(selectedLocation).length === 0 ? (
                    <p className="text-xs text-stone-400 italic bg-[#FDF8F3] p-3 rounded-2xl border border-[#F3E9DC]">
                      No crew members currently assigned to this site location.
                    </p>
                  ) : (
                    getAssignedMembersForLocation(selectedLocation).map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 bg-[#FDF8F3] border border-[#F3E9DC] rounded-2xl flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-8 h-8 rounded-full object-cover border border-white"
                          />
                          <div>
                            <span className="font-bold text-[#2D241E] block">{m.name}</span>
                            <span className="text-[10px] text-[#8B5E3C]">{m.role}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            m.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Site Tasks */}
              <div className="space-y-2 pt-2 border-t border-[#F3E9DC]">
                <h4 className="text-xs font-bold text-[#3D3028] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#D4A373]">task</span>
                    <span>Site Tasks ({locTasks.length})</span>
                  </span>
                  <button
                    onClick={() => onNavigate('NewTask', 'slide_up')}
                    className="text-[10px] text-[#606C38] font-bold hover:underline"
                  >
                    + Add Task
                  </button>
                </h4>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {locTasks.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No geotagged tasks logged for this site.</p>
                  ) : (
                    locTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          if (onSelectTask) onSelectTask(t);
                          onNavigate('TaskBoard', 'none');
                        }}
                        className="p-2 bg-[#FEFAE0]/60 border border-[#E9EDC9] rounded-xl flex items-center justify-between text-xs hover:bg-[#FEFAE0] cursor-pointer"
                      >
                        <span className="font-bold text-[#2D241E] truncate max-w-[180px]">{t.title}</span>
                        <span className="text-[10px] font-bold text-[#606C38] uppercase">{t.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Inspector Actions */}
              <div className="pt-4 border-t border-[#F3E9DC] space-y-2.5">
                {activeRole === 'Manager' && (
                  <button
                    onClick={() => setAssignModalLocation(selectedLocation)}
                    className="w-full bg-[#606C38] hover:bg-[#4d572d] text-white py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <span className="material-symbols-outlined text-base">person_add</span>
                    <span>Assign / Manage Site Crew</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigate('ProjectTimeline', 'none')}
                    className="bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-base text-[#D4A373]">timeline</span>
                    <span>Timeline</span>
                  </button>

                  <button
                    onClick={() => onNavigate('TaskBoard', 'none')}
                    className="bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-base text-[#606C38]">view_kanban</span>
                    <span>Tasks</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#8B5E3C] text-xs">
              Select a field site on the map to inspect telemetry and assigned crew members.
            </div>
          )}
        </div>
      </div>

      {/* Assign Member Modal */}
      {assignModalLocation && (
        <ProjectAssignMemberModal
          isOpen={!!assignModalLocation}
          projectName={assignModalLocation.name}
          projectRegion={assignModalLocation.region}
          assignedMemberIds={assignModalLocation.assignedMemberIds || []}
          team={team}
          onClose={() => setAssignModalLocation(null)}
          onToggleMember={handleToggleMemberInModal}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
