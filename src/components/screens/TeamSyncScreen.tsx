import React, { useState } from 'react';
import { ScreenId, TeamMember } from '../../types';

interface TeamSyncProps {
  team: TeamMember[];
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
}

export const TeamSyncScreen: React.FC<TeamSyncProps> = ({ team, onNavigate }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchMember, setSearchMember] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(team[0]);

  const filteredTeam = team.filter((member) => {
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    const matchesQuery =
      member.name.toLowerCase().includes(searchMember.toLowerCase()) ||
      member.role.toLowerCase().includes(searchMember.toLowerCase()) ||
      member.location?.toLowerCase().includes(searchMember.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#f2ece4] border border-[#e0d8cc] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c2652a]">
            <span className="material-symbols-outlined text-base">groups</span>
            Field Ops Coordination
          </div>
          <h1 className="font-headline text-3xl lg:text-4xl font-bold text-[#3a302a] mt-1">
            Team Sync - Sahara
          </h1>
          <p className="text-sm text-[#605850]">
            Monitor field team locations, current mission assignments, and SatCom connectivity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('NewTask', 'slide_up')}
            className="px-4 py-2.5 bg-[#c2652a] hover:bg-[#a8541f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">add_task</span>
            <span>Assign Field Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f2ece4] p-4 rounded-2xl border border-[#e0d8cc]">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#9a9088]">
            search
          </span>
          <input
            type="text"
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            placeholder="Search by name, role, or station..."
            className="w-full bg-[#faf5ee] border border-[#d8d0c8] focus:border-[#c2652a] rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-[#3a302a] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-[#78706a] shrink-0">Status:</span>
          {['all', 'in_field', 'active', 'busy'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all shrink-0 ${
                filterStatus === st
                  ? 'bg-[#c2652a] text-white'
                  : 'bg-[#faf5ee] text-[#605850] hover:bg-[#e6e0d6]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Team Roster Grid + Selected Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roster Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTeam.map((member) => {
            const isSelected = selectedMember?.id === member.id;
            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`bg-[#f2ece4] hover:bg-[#faf5ee] border transition-all rounded-2xl p-5 cursor-pointer space-y-4 ${
                  isSelected
                    ? 'border-[#c2652a] ring-2 ring-[#c2652a]/20 bg-[#faf5ee] shadow-md'
                    : 'border-[#e0d8cc] hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#c2652a]"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          member.status === 'in_field'
                            ? 'bg-amber-500'
                            : member.status === 'active'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#3a302a]">{member.name}</h3>
                      <p className="text-xs text-[#78706a]">{member.role}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      member.status === 'in_field'
                        ? 'bg-amber-100 text-amber-800'
                        : member.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {member.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#605850] border-t border-[#e0d8cc] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#78706a]">Location:</span>
                    <span className="font-semibold text-[#3a302a]">{member.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#78706a]">Active Mission:</span>
                    <span className="font-semibold text-[#c2652a] truncate max-w-[140px]">{member.currentTask}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Member Inspector Sidepanel */}
        <div className="bg-[#f2ece4] border border-[#e0d8cc] rounded-3xl p-6 shadow-sm space-y-6">
          {selectedMember ? (
            <>
              <div className="text-center space-y-3 border-b border-[#e0d8cc] pb-6">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-[#c2652a] shadow-sm"
                />
                <div>
                  <h3 className="font-headline text-2xl font-bold text-[#3a302a]">{selectedMember.name}</h3>
                  <p className="text-xs text-[#78706a]">{selectedMember.role}</p>
                  <p className="text-xs font-semibold text-[#c2652a] mt-1">{selectedMember.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#605850]">
                <div className="p-3 bg-[#faf5ee] rounded-xl border border-[#e6e0d6] space-y-1">
                  <span className="text-[10px] font-bold text-[#78706a] uppercase">Stationed Location</span>
                  <p className="text-sm font-bold text-[#3a302a]">{selectedMember.location}</p>
                </div>

                <div className="p-3 bg-[#faf5ee] rounded-xl border border-[#e6e0d6] space-y-1">
                  <span className="text-[10px] font-bold text-[#78706a] uppercase">Current Local Time</span>
                  <p className="text-sm font-bold text-[#3a302a]">{selectedMember.localTime}</p>
                </div>

                <div className="p-3 bg-[#faf5ee] rounded-xl border border-[#e6e0d6] space-y-1">
                  <span className="text-[10px] font-bold text-[#78706a] uppercase">Efficiency Rating</span>
                  <p className="text-sm font-bold text-emerald-700">{selectedMember.performance}% Reliability Index</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e0d8cc] space-y-3">
                <button
                  onClick={() => onNavigate('TaskBoard', 'none')}
                  className="w-full bg-[#c2652a] hover:bg-[#a8541f] text-white py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-base">view_kanban</span>
                  <span>Inspect Tasks Assigned</span>
                </button>
                <button
                  onClick={() => onNavigate('NewTask', 'slide_up')}
                  className="w-full bg-[#faf5ee] hover:bg-[#ffffff] text-[#3a302a] border border-[#e0d8cc] py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  <span>Assign New Task to {selectedMember.name.split(' ')[0]}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#78706a]">Select a team member to view full field record.</div>
          )}
        </div>
      </div>
    </div>
  );
};
