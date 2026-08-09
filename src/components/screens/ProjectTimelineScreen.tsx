import React, { useState } from 'react';
import { ScreenId, TimelineMilestone, Task, TeamMember, SiteLocation, TransitionType } from '../../types';
import { ProjectNavHeader } from '../ProjectNavHeader';
import { ProjectAssignMemberModal } from '../ProjectAssignMemberModal';

interface ProjectTimelineProps {
  timeline: TimelineMilestone[];
  tasks?: Task[];
  team?: TeamMember[];
  locations?: SiteLocation[];
  activeRole?: 'Manager' | 'Employee';
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  onUpdateTimelineMilestone?: (item: TimelineMilestone) => void;
  onAssignMemberToProject?: (projectId: string, memberId: string) => void;
}

export const ProjectTimelineScreen: React.FC<ProjectTimelineProps> = ({
  timeline,
  tasks = [],
  team = [],
  locations = [],
  activeRole = 'Manager',
  onNavigate,
  onUpdateTimelineMilestone,
  onAssignMemberToProject,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'upcoming'>('all');
  const [selectedPhase, setSelectedPhase] = useState<TimelineMilestone | null>(timeline[1] || timeline[0] || null);
  const [assignModalProject, setAssignModalProject] = useState<TimelineMilestone | null>(null);

  const filteredTimeline = timeline.filter(
    (m) => statusFilter === 'all' || m.status === statusFilter
  );

  // Get personnel assigned to selected phase or matching phase name/lead
  const getAssignedMembersForPhase = (phase: TimelineMilestone) => {
    const assignedIds = phase.assignedMemberIds || [];
    return team.filter((m) => {
      const isDirectlyAssigned = assignedIds.includes(m.id);
      const isMatchingLocation =
        m.location &&
        (m.location.toLowerCase().includes(phase.title.toLowerCase().split(' ')[0]) ||
          m.location.toLowerCase().includes(phase.region.toLowerCase().split(' ')[0]));
      const isLead = m.name.toLowerCase() === phase.lead.toLowerCase();
      return isDirectlyAssigned || isMatchingLocation || isLead;
    });
  };

  // Get tasks associated with selected phase
  const getTasksForPhase = (phase: TimelineMilestone) => {
    return tasks.filter((t) => {
      const matchProjectId = t.projectId === phase.id;
      const matchRegion = t.region && t.region.toLowerCase().includes(phase.region.toLowerCase().split(' ')[0]);
      const matchLocation = t.location?.label && t.location.label.toLowerCase().includes(phase.title.toLowerCase().split(' ')[0]);
      return matchProjectId || matchRegion || matchLocation;
    });
  };

  const handleToggleMemberInModal = (memberId: string) => {
    if (!assignModalProject) return;
    if (onAssignMemberToProject) {
      onAssignMemberToProject(assignModalProject.id, memberId);
    } else if (onUpdateTimelineMilestone) {
      const currentAssigned = assignModalProject.assignedMemberIds || [];
      const updatedIds = currentAssigned.includes(memberId)
        ? currentAssigned.filter((id) => id !== memberId)
        : [...currentAssigned, memberId];

      const updatedMilestone = {
        ...assignModalProject,
        assignedMemberIds: updatedIds,
      };
      onUpdateTimelineMilestone(updatedMilestone);
      setAssignModalProject(updatedMilestone);
      if (selectedPhase?.id === assignModalProject.id) {
        setSelectedPhase(updatedMilestone);
      }
    }
  };

  const totalAssignedPersonnel = team.filter((m) => m.location && m.location !== 'Offline').length;

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Shared Nav Header */}
      <ProjectNavHeader
        currentScreen="ProjectTimeline"
        totalProjects={timeline.length}
        totalSites={locations.length}
        assignedPersonnelCount={totalAssignedPersonnel}
        activeRole={activeRole}
        onNavigate={onNavigate}
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#F3E9DC] shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#8B5E3C]">Status Filter:</span>
          {(['all', 'completed', 'in_progress', 'upcoming'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-[#D4A373] text-white shadow-xs'
                  : 'bg-[#FDF8F3] text-[#5C4D42] hover:bg-[#E5D5C0]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#8B5E3C]">
          Showing <strong>{filteredTimeline.length}</strong> of {timeline.length} roadmap phases
        </div>
      </div>

      {/* Main Grid: Gantt Timeline & Selected Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Phase List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-2xl font-bold text-[#3D3028]">
              Operational Roadmap & Project Phases
            </h2>
            <span className="text-xs text-[#8B5E3C] font-medium">Click phase card to inspect details</span>
          </div>

          <div className="space-y-4">
            {filteredTimeline.map((item) => {
              const isSelected = selectedPhase?.id === item.id;
              const phaseMembers = getAssignedMembersForPhase(item);
              const phaseTasks = getTasksForPhase(item);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPhase(item)}
                  className={`p-6 rounded-[28px] border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#D4A373] ring-2 ring-[#D4A373]/30 shadow-md'
                      : 'bg-white/80 border-[#F3E9DC] hover:bg-white shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] bg-[#F3E9DC] px-3 py-1 rounded-full">
                        {item.phase}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-3 py-0.5 rounded-full ${
                          item.status === 'completed'
                            ? 'bg-[#FEFAE0] text-[#606C38] border border-[#E9EDC9]'
                            : item.status === 'in_progress'
                            ? 'bg-[#D4A373]/20 text-[#8B5E3C]'
                            : 'bg-[#F3E9DC] text-[#5C4D42]'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#8B5E3C]">
                      <span className="material-symbols-outlined text-sm text-[#D4A373]">calendar_today</span>
                      <span>{item.startDate} — {item.endDate}</span>
                    </div>
                  </div>

                  <h3 className="font-headline text-xl font-bold text-[#3D3028] mb-2">{item.title}</h3>

                  {/* Completion Progress Bar */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex justify-between text-xs text-[#5C4D42]">
                      <span className="font-semibold">Completion Progress</span>
                      <span className="font-bold text-[#3D3028]">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-[#E5D5C0] h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.status === 'completed' ? 'bg-[#606C38]' : 'bg-[#D4A373]'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Assigned Team Members Section */}
                  <div className="pt-3 border-t border-[#F3E9DC] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8B5E3C]">Assigned Staff:</span>
                      <div className="flex -space-x-2">
                        {phaseMembers.slice(0, 5).map((m) => (
                          <img
                            key={m.id}
                            src={m.avatar}
                            alt={m.name}
                            title={`${m.name} (${m.role})`}
                            className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-2xs"
                          />
                        ))}
                        {phaseMembers.length > 5 && (
                          <div className="w-7 h-7 rounded-full bg-[#F3E9DC] text-[#3D3028] border-2 border-white text-[10px] font-bold flex items-center justify-center">
                            +{phaseMembers.length - 5}
                          </div>
                        )}
                        {phaseMembers.length === 0 && (
                          <span className="text-xs text-stone-400 italic">No assigned staff yet</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8B5E3C]">
                        Director: <strong className="text-[#3D3028]">{item.lead}</strong>
                      </span>

                      {activeRole === 'Manager' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignModalProject(item);
                          }}
                          className="px-3 py-1 bg-[#FEFAE0] border border-[#E9EDC9] hover:bg-[#606C38] hover:text-white text-[#606C38] rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-sm">person_add</span>
                          <span>Assign Staff</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Phase Detail Drawer / Inspection Panel */}
        <div className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 shadow-sm space-y-6 h-fit sticky top-6">
          {selectedPhase ? (
            <>
              <div className="border-b border-[#F3E9DC] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
                    {selectedPhase.phase}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase px-3 py-0.5 rounded-full ${
                      selectedPhase.status === 'completed'
                        ? 'bg-[#FEFAE0] text-[#606C38] border border-[#E9EDC9]'
                        : selectedPhase.status === 'in_progress'
                        ? 'bg-[#D4A373]/20 text-[#8B5E3C]'
                        : 'bg-[#F3E9DC] text-[#5C4D42]'
                    }`}
                  >
                    {selectedPhase.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#3D3028]">
                  {selectedPhase.title}
                </h3>
              </div>

              {/* Personnel List in Selected Project */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#3D3028] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#606C38]">groups</span>
                    <span>Assigned Team & Staff</span>
                  </h4>

                  {activeRole === 'Manager' && (
                    <button
                      onClick={() => setAssignModalProject(selectedPhase)}
                      className="text-xs font-bold text-[#606C38] hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Manage</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {getAssignedMembersForPhase(selectedPhase).length === 0 ? (
                    <p className="text-xs text-stone-400 italic bg-[#FDF8F3] p-3 rounded-2xl border border-[#F3E9DC]">
                      No team members currently assigned to this project phase.
                    </p>
                  ) : (
                    getAssignedMembersForPhase(selectedPhase).map((m) => (
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

              {/* Tasks Linked to this Phase */}
              <div className="space-y-2 pt-2 border-t border-[#F3E9DC]">
                <h4 className="text-xs font-bold text-[#3D3028] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#D4A373]">task</span>
                    <span>Project Tasks ({getTasksForPhase(selectedPhase).length})</span>
                  </span>
                  <button
                    onClick={() => onNavigate('NewTask', 'slide_up')}
                    className="text-[10px] text-[#606C38] font-bold hover:underline"
                  >
                    + Add Task
                  </button>
                </h4>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {getTasksForPhase(selectedPhase).length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No tasks created yet for this phase.</p>
                  ) : (
                    getTasksForPhase(selectedPhase).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onNavigate('TaskBoard', 'none')}
                        className="p-2 bg-[#FEFAE0]/60 border border-[#E9EDC9] rounded-xl flex items-center justify-between text-xs hover:bg-[#FEFAE0] cursor-pointer"
                      >
                        <span className="font-bold text-[#2D241E] truncate max-w-[180px]">{t.title}</span>
                        <span className="text-[10px] font-bold text-[#606C38] uppercase">{t.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#F3E9DC] space-y-2.5">
                {activeRole === 'Manager' && (
                  <button
                    onClick={() => setAssignModalProject(selectedPhase)}
                    className="w-full bg-[#606C38] hover:bg-[#4d572d] text-white py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <span className="material-symbols-outlined text-base">person_add</span>
                    <span>Assign / Manage Team Members</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigate('ProjectMap', 'none')}
                    className="bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-base text-[#D4A373]">map</span>
                    <span>View Map</span>
                  </button>

                  <button
                    onClick={() => onNavigate('TaskBoard', 'none')}
                    className="bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-base text-[#606C38]">view_kanban</span>
                    <span>Task Board</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#8B5E3C] text-xs">
              Select a project phase from the timeline to view details and assigned personnel.
            </div>
          )}
        </div>
      </div>

      {/* Assign Member Modal */}
      {assignModalProject && (
        <ProjectAssignMemberModal
          isOpen={!!assignModalProject}
          projectName={assignModalProject.title}
          projectRegion={assignModalProject.region}
          assignedMemberIds={assignModalProject.assignedMemberIds || []}
          team={team}
          onClose={() => setAssignModalProject(null)}
          onToggleMember={handleToggleMemberInModal}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
