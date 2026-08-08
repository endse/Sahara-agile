import React, { useState } from 'react';
import { ScreenId, TimelineMilestone } from '../../types';

interface ProjectTimelineProps {
  timeline: TimelineMilestone[];
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
}

export const ProjectTimelineScreen: React.FC<ProjectTimelineProps> = ({ timeline, onNavigate }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'upcoming'>('all');
  const [selectedPhase, setSelectedPhase] = useState<TimelineMilestone | null>(timeline[1] || timeline[0]);

  const filteredTimeline = timeline.filter(
    m => statusFilter === 'all' || m.status === statusFilter
  );

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#F3E9DC] border border-[#E5D5C0] rounded-3xl p-6 lg:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B5E3C]">
              <span className="material-symbols-outlined text-base">timeline</span>
              Master Schedule 2026-2027
            </div>
            <h1 className="font-headline text-3xl lg:text-4xl font-light text-[#2D241E] mt-1">
              Project Timeline - Sahara
            </h1>
            <p className="text-sm text-[#8B5E3C]">
              Strategic roadmap tracking regional water deployment, renewable microgrids, and robotic field shelters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('NewTask', 'slide_up')}
              className="px-4 py-2.5 bg-[#606C38] hover:bg-[#4d572d] text-white rounded-2xl text-xs font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Add Phase Task</span>
            </button>
            <button
              onClick={() => onNavigate('TaskBoard', 'none')}
              className="px-4 py-2.5 bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] rounded-2xl text-xs font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base text-[#D4A373]">view_kanban</span>
              <span>View Task Board</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5D5C0]">
          <span className="text-xs font-bold text-[#8B5E3C] mr-2">Filter Status:</span>
          {(['all', 'completed', 'in_progress', 'upcoming'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#D4A373] text-white shadow-xs'
                  : 'bg-[#FDF8F3] text-[#5C4D42] hover:bg-[#E5D5C0]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Visual Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Gantt Representation */}
        <div className="lg:col-span-2 space-y-4 bg-white border border-[#F3E9DC] rounded-[32px] p-6 shadow-sm">
          <h3 className="font-headline text-2xl font-semibold text-[#3D3028]">Operational Phase Progression</h3>

          <div className="space-y-4 pt-2">
            {filteredTimeline.map((item) => {
              const isSelected = selectedPhase?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPhase(item)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FDF8F3] border-[#D4A373] ring-2 ring-[#D4A373]/20 shadow-sm'
                      : 'bg-[#FDF8F3]/60 border-[#F3E9DC] hover:bg-[#FDF8F3]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] bg-[#F3E9DC] px-2.5 py-1 rounded-full">
                        {item.phase}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
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
                    <span className="text-xs text-[#8B5E3C] font-medium">
                      {item.startDate} — {item.endDate}
                    </span>
                  </div>

                  <h4 className="font-headline text-xl font-semibold text-[#3D3028] mb-2">{item.title}</h4>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-[#5C4D42]">
                      <span>Completion Progress</span>
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

                  <div className="mt-4 pt-3 border-t border-[#F3E9DC] flex items-center justify-between text-xs text-[#8B5E3C]">
                    <span>Lead: <strong className="text-[#3D3028]">{item.lead}</strong></span>
                    <span>Region: <strong className="text-[#3D3028]">{item.region}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Phase Detail Sidepanel */}
        <div className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 shadow-sm space-y-6">
          {selectedPhase ? (
            <>
              <div className="border-b border-[#F3E9DC] pb-4">
                <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">{selectedPhase.phase}</span>
                <h3 className="font-headline text-2xl font-semibold text-[#3D3028] mt-1">{selectedPhase.title}</h3>
                <span
                  className={`inline-block mt-2 text-xs font-bold uppercase px-3 py-1 rounded-full ${
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

              <div className="space-y-4 text-xs text-[#5C4D42]">
                <div className="space-y-1">
                  <span className="font-bold text-[#3D3028] uppercase text-[10px]">Timeline Window</span>
                  <p className="bg-[#FDF8F3] p-3 rounded-2xl border border-[#F3E9DC] text-sm font-semibold text-[#3D3028]">
                    {selectedPhase.startDate} to {selectedPhase.endDate}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[#3D3028] uppercase text-[10px]">Assigned Phase Director</span>
                  <p className="bg-[#FDF8F3] p-3 rounded-2xl border border-[#F3E9DC] text-sm font-semibold text-[#3D3028] flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#D4A373]">person</span>
                    {selectedPhase.lead}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[#3D3028] uppercase text-[10px]">Geographic Sector</span>
                  <p className="bg-[#FDF8F3] p-3 rounded-2xl border border-[#F3E9DC] text-sm font-semibold text-[#3D3028] flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#D4A373]">pin_drop</span>
                    {selectedPhase.region}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F3E9DC] space-y-3">
                <button
                  onClick={() => onNavigate('TaskBoard', 'none')}
                  className="w-full bg-[#606C38] hover:bg-[#4d572d] text-white py-3 px-4 rounded-2xl text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-base">view_kanban</span>
                  <span>Inspect Phase Tasks on Board</span>
                </button>
                <button
                  onClick={() => onNavigate('ProjectMap', 'none')}
                  className="w-full bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] py-2.5 px-4 rounded-2xl text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#D4A373]">map</span>
                  <span>View Sector Map</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#8B5E3C]">Select a phase to view detailed metrics.</div>
          )}
        </div>
      </div>
    </div>
  );
};
