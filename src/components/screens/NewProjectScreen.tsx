import React, { useState, useEffect } from 'react';
import { ScreenId, TransitionType, TeamMember } from '../../types';

interface NewProjectScreenProps {
  team: TeamMember[];
  onAddProject: (projectData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    region: string;
    lead: string;
    status: 'planned' | 'active' | 'completed';
    assignedMemberIds?: string[];
  }) => void;
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
}

export const NewProjectScreen: React.FC<NewProjectScreenProps> = ({
  team,
  onAddProject,
  onNavigate,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }, []);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [region, setRegion] = useState('Sector 4 - East Oasis');
  const [lead, setLead] = useState(team[0]?.name || 'Amara Vance');
  const [status, setStatus] = useState<'planned' | 'active' | 'completed'>('active');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    team.slice(0, 2).map((m) => m.id)
  );

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formatDateStr = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    onAddProject({
      name: name.trim(),
      description: description.trim(),
      startDate: formatDateStr(startDate) || startDate,
      endDate: formatDateStr(endDate) || endDate,
      region,
      lead,
      status,
      assignedMemberIds: selectedMemberIds,
    });

    onNavigate('ProjectTimeline', 'none');
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E5D5C0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#606C38] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-2xl">add_location_alt</span>
          </div>
          <div>
            <h1 className="font-headline text-2xl lg:text-3xl font-light text-[#2D241E]">
              Create New Project - Sahara
            </h1>
            <p className="text-xs text-[#8B5E3C]">
              Register field site operations and assign team members & director
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('ProjectTimeline', 'none')}
          className="p-2.5 rounded-2xl bg-[#FDF8F3] hover:bg-white text-[#5C4D42] transition-colors border border-[#E5D5C0] flex items-center gap-2 text-xs font-medium"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          <span className="hidden sm:inline">Cancel</span>
        </button>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 lg:p-8 space-y-6 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Name */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Subsurface Aquifer Expansion & Solar Desalination Array"
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-5 py-3 text-sm font-semibold text-[#3D3028] outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Project Brief / Objectives
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of operational scope, milestones, and target outcomes..."
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-2xl p-4 text-xs font-medium text-[#3D3028] outline-none transition-colors"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none transition-colors"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Target Completion Date *
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none transition-colors"
            />
          </div>

          {/* Region / Sector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Geographic Region / Sector
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none transition-colors"
            >
              <option value="Sector 1 - Highland">Sector 1 - Highland (Tibesti Base)</option>
              <option value="Sector 2 - Central Basin">Sector 2 - Central Basin (Djanet)</option>
              <option value="Sector 3 - West Relay">Sector 3 - West Relay (Ghadames)</option>
              <option value="Sector 4 - East Oasis">Sector 4 - East Oasis (Al-Kufra)</option>
              <option value="Sector 5 - North Border">Sector 5 - North Border (Siwa)</option>
              <option value="Sector 6 - Southern Plateau">Sector 6 - Southern Plateau</option>
            </select>
          </div>

          {/* Project Lead */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Assigned Project Director
            </label>
            <select
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none transition-colors"
            >
              {team.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Initial Phase Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['planned', 'active', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`p-3 rounded-2xl border text-xs font-bold capitalize transition-all ${
                    status === st
                      ? 'bg-[#606C38] text-white border-[#606C38] shadow-2xs'
                      : 'bg-[#FDF8F3] text-[#5C4D42] border-[#E5D5C0] hover:bg-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Assign Initial Team Members */}
          <div className="md:col-span-2 space-y-2 pt-2 border-t border-[#F3E9DC]">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider block">
              Assign Initial Team Members ({selectedMemberIds.length} selected)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {team.map((member) => {
                const isSelected = selectedMemberIds.includes(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#FEFAE0] border-[#E9EDC9] text-[#606C38]'
                        : 'bg-[#FDF8F3] border-[#E5D5C0] text-[#5C4D42] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover border border-white"
                      />
                      <div>
                        <span className="font-bold text-xs block text-[#2D241E]">{member.name}</span>
                        <span className="text-[10px] text-[#8B5E3C]">{member.role}</span>
                      </div>
                    </div>

                    <span className="material-symbols-outlined text-lg">
                      {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-[#F3E9DC] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('ProjectTimeline', 'none')}
            className="px-6 py-3 rounded-full bg-[#FDF8F3] hover:bg-[#F3E9DC] text-[#5C4D42] text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-8 py-3 rounded-full bg-[#606C38] hover:bg-[#4d572d] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <span className="material-symbols-outlined text-base">rocket_launch</span>
            <span>Launch Project</span>
          </button>
        </div>
      </form>
    </div>
  );
};
