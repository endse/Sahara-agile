import React, { useState } from 'react';
import { TeamMember, ScreenId, TransitionType } from '../types';

interface ProjectAssignMemberModalProps {
  isOpen: boolean;
  projectName: string;
  projectRegion?: string;
  assignedMemberIds: string[];
  team: TeamMember[];
  onClose: () => void;
  onToggleMember: (memberId: string) => void;
  onNavigate?: (screen: ScreenId, transition?: TransitionType) => void;
}

export const ProjectAssignMemberModal: React.FC<ProjectAssignMemberModalProps> = ({
  isOpen,
  projectName,
  projectRegion,
  assignedMemberIds,
  team,
  onClose,
  onToggleMember,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  if (!isOpen) return null;

  const roles = ['All', ...Array.from(new Set(team.map((m) => m.role)))];

  const filteredTeam = team.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D241E]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-[#E5D5C0] rounded-[32px] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-[#FDF8F3] border-b border-[#E5D5C0] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#606C38] uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Manager Command • Team Personnel Assignment</span>
            </div>
            <h2 className="font-headline text-2xl font-bold text-[#2D241E] mt-0.5">
              {projectName}
            </h2>
            {projectRegion && (
              <p className="text-xs text-[#8B5E3C] flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-sm text-[#D4A373]">location_on</span>
                <span>{projectRegion}</span>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E5D5C0] text-[#5C4D42] hover:bg-[#F3E9DC] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Search & Role Filter Bar */}
        <div className="p-4 bg-white border-b border-[#F3E9DC] flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-[#8B5E3C]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team member by name or role..."
              className="w-full pl-9 pr-4 py-2 bg-[#FDF8F3] border border-[#E5D5C0] rounded-xl text-xs font-medium text-[#3D3028] outline-none focus:border-[#D4A373]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-[#8B5E3C] shrink-0">Role:</span>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  roleFilter === r
                    ? 'bg-[#606C38] text-white'
                    : 'bg-[#FDF8F3] text-[#5C4D42] hover:bg-[#F3E9DC]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Team Member List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredTeam.length === 0 ? (
            <div className="text-center py-8 text-[#8B5E3C] text-xs">
              No matching team members found.
            </div>
          ) : (
            filteredTeam.map((member) => {
              const isAssigned =
                assignedMemberIds.includes(member.id) ||
                (member.location &&
                  member.location.toLowerCase().includes(projectName.toLowerCase().split(' ')[0]));

              return (
                <div
                  key={member.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isAssigned
                      ? 'bg-[#FEFAE0] border-[#E9EDC9] shadow-2xs'
                      : 'bg-[#FDF8F3]/70 border-[#F3E9DC] hover:bg-[#FDF8F3]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === 'active'
                            ? 'bg-emerald-500'
                            : member.status === 'in_field'
                            ? 'bg-amber-500'
                            : 'bg-stone-400'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2D241E]">{member.name}</span>
                        {isAssigned && (
                          <span className="text-[10px] font-bold bg-[#606C38] text-white px-2 py-0.5 rounded-full">
                            Assigned
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8B5E3C]">
                        {member.role} • {member.location || 'Base Station'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleMember(member.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isAssigned
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200'
                          : 'bg-[#606C38] text-white hover:bg-[#4d572d] shadow-2xs'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isAssigned ? 'person_remove' : 'person_add'}
                      </span>
                      <span>{isAssigned ? 'Remove' : 'Assign'}</span>
                    </button>

                    {onNavigate && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('NewTask', 'slide_up');
                        }}
                        className="p-1.5 rounded-xl bg-white border border-[#E5D5C0] text-[#8B5E3C] hover:bg-[#F3E9DC] text-xs font-medium"
                        title="Assign new task to this member"
                      >
                        <span className="material-symbols-outlined text-base">add_task</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FDF8F3] border-t border-[#E5D5C0] flex items-center justify-between text-xs text-[#8B5E3C]">
          <span>
            Currently <strong>{assignedMemberIds.length}</strong> personnel assigned to this project
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2D241E] hover:bg-black text-white font-bold rounded-xl text-xs shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
