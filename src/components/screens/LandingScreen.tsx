import React from 'react';
import { ScreenId } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LandingScreenProps {
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up' | 'slide_down') => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#3D3028] flex flex-col font-sans selection:bg-[#D4A373] selection:text-white">
      {/* LANDING NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/90 backdrop-blur-md border-b border-[#E5D5C0] px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#606C38] text-white flex items-center justify-center font-headline text-xl font-bold shadow-sm">
            S
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold text-[#2D241E] leading-tight">
              Sahara Agile Works
            </h1>
            <p className="text-[10px] text-[#8B5E3C] uppercase tracking-wider font-semibold">
              Field Operations & Infrastructure Platform
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              window.history.replaceState(null, '', '?mode=signin');
              onNavigate('SignUp', 'push');
            }}
            className="px-3.5 py-2 text-xs font-bold text-[#5C4D42] hover:text-[#2D241E] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              window.history.replaceState(null, '', '?mode=signup&type=manager_create_team');
              onNavigate('SignUp', 'push');
            }}
            className="px-4 py-2 bg-[#606C38] hover:bg-[#4d572d] text-white text-xs font-bold rounded-full shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">group_add</span>
            <span>Create Team</span>
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-4 lg:px-12 py-12 lg:py-20 max-w-7xl mx-auto w-full text-center space-y-8 overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D4A373]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FEFAE0] border border-[#E9EDC9] rounded-full text-xs font-bold text-[#606C38] shadow-2xs">
          <span className="material-symbols-outlined text-sm text-[#606C38]">verified</span>
          <span>Sahara Agile Workspace • Simple & Secure Field Operations</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-light text-[#2D241E] tracking-tight leading-[1.15]">
            Manage Tasks, Track Teams & <br className="hidden sm:inline" />
            <span className="font-bold text-[#606C38] italic">Streamline Operations</span>
          </h1>
          <p className="text-sm sm:text-base text-[#8B5E3C] max-w-2xl mx-auto leading-relaxed">
            Create your team as a Manager or join an existing team as a Member. Assign tasks, track attendance, approve project updates, and view live locations in one easy dashboard.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              window.history.replaceState(null, '', '?mode=signup&type=manager_create_team');
              onNavigate('SignUp', 'push');
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#606C38] hover:bg-[#4d572d] text-white font-bold rounded-full text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span className="material-symbols-outlined text-base">groups</span>
            <span>Create a Team (Become Manager)</span>
          </button>

          <button
            onClick={() => {
              window.history.replaceState(null, '', '?mode=signup&type=employee');
              onNavigate('SignUp', 'push');
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#E5D5C0] hover:bg-[#FAF5EE] text-[#3D3028] font-bold rounded-full text-xs shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base text-[#D4A373]">person_add</span>
            <span>Join Existing Team</span>
          </button>

          <button
            onClick={() => {
              window.history.replaceState(null, '', '?mode=signin');
              onNavigate('SignUp', 'push');
            }}
            className="w-full sm:w-auto px-5 py-3.5 text-[#5C4D42] hover:text-[#2D241E] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Sign In</span>
          </button>
        </div>

        {/* INTERACTIVE WORKSPACE MOCKUP PREVIEW */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="bg-white border border-[#E5D5C0] rounded-[32px] p-4 lg:p-6 shadow-xl space-y-4 text-left relative overflow-hidden">
            {/* Top Mockup Control Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F3E9DC]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#BC4749]/60" />
                <div className="w-3 h-3 rounded-full bg-[#D4A373]/60" />
                <div className="w-3 h-3 rounded-full bg-[#606C38]/60" />
                <span className="text-[11px] font-mono text-[#8B5E3C] ml-2">sahara-workspace.org/sector-04/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#606C38] bg-[#FEFAE0] px-2.5 py-1 rounded-full border border-[#E9EDC9]">
                <span className="w-2 h-2 rounded-full bg-[#606C38] animate-pulse" />
                <span>SatCom Telemetry Live</span>
              </div>
            </div>

            {/* Dashboard Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-[#8B5E3C]">Active Missions</span>
                <p className="font-headline text-2xl font-bold text-[#2D241E]">18 Active</p>
                <span className="text-[10px] text-[#606C38]">100% On Schedule</span>
              </div>
              <div className="p-3 bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-[#8B5E3C]">Team Roster</span>
                <p className="font-headline text-2xl font-bold text-[#2D241E]">24 Operators</p>
                <span className="text-[10px] text-[#606C38]">Multi-Tenant Isolated</span>
              </div>
              <div className="p-3 bg-[#FEFAE0] border border-[#E9EDC9] rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-[#606C38]">Status Approvals</span>
                <p className="font-headline text-2xl font-bold text-[#606C38]">3 Pending</p>
                <span className="text-[10px] text-[#606C38]">Manager Review Needed</span>
              </div>
              <div className="p-3 bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-[#8B5E3C]">Site Telemetry</span>
                <p className="font-headline text-2xl font-bold text-[#2D241E]">5 Stations</p>
                <span className="text-[10px] text-[#D4A373]">GIS Coordinates Live</span>
              </div>
            </div>

            {/* Mini Kanban Columns Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#FDF8F3] rounded-2xl border border-[#E5D5C0] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#3D3028]">
                  <span>📋 To Do</span>
                  <span className="px-2 py-0.5 bg-white border border-[#E5D5C0] rounded-full text-[10px]">4</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E5D5C0] shadow-2xs space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-[#8B5E3C]">
                    <span className="font-mono">TSK-104</span>
                    <span className="text-[#BC4749] font-bold">HIGH</span>
                  </div>
                  <p className="font-semibold text-[#3D3028]">Calibrate Well #4 Sensors</p>
                </div>
              </div>

              <div className="p-3 bg-[#FEFAE0] rounded-2xl border border-[#E9EDC9] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#606C38]">
                  <span>⚡ In Progress</span>
                  <span className="px-2 py-0.5 bg-white border border-[#E9EDC9] rounded-full text-[10px]">2</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E9EDC9] shadow-2xs space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-[#606C38]">
                    <span className="font-mono">TSK-102</span>
                    <span className="bg-[#FEFAE0] text-[#606C38] px-1.5 py-0.5 rounded font-bold">Awaiting Approval</span>
                  </div>
                  <p className="font-semibold text-[#3D3028]">Solar Panel Array Sync</p>
                  <p className="text-[10px] text-[#8B5E3C]">Requested status change to DONE</p>
                </div>
              </div>

              <div className="p-3 bg-[#FDF8F3] rounded-2xl border border-[#E5D5C0] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#3D3028]">
                  <span>✅ Completed</span>
                  <span className="px-2 py-0.5 bg-white border border-[#E5D5C0] rounded-full text-[10px]">12</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E5D5C0] shadow-2xs space-y-1 text-xs opacity-80">
                  <div className="flex items-center justify-between text-[10px] text-[#8B5E3C]">
                    <span className="font-mono">TSK-099</span>
                    <span className="text-[#606C38] font-bold">VERIFIED</span>
                  </div>
                  <p className="font-semibold text-[#3D3028]">SatCom Relay Test</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="px-4 lg:px-12 py-16 bg-white border-y border-[#E5D5C0]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#D4A373] uppercase tracking-wider">Engineered for Remote Teams</span>
            <h2 className="font-headline text-3xl lg:text-4xl font-light text-[#2D241E]">
              Complete Field Operations Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-[#8B5E3C]">
              Built with team isolation, manager approvals, attendance tracking, and real-time Firestore persistence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Capability 1 */}
            <div className="p-6 bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl space-y-3 hover:border-[#D4A373] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#606C38] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">rate_review</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-[#2D241E]">Task Approval Pipeline</h3>
              <p className="text-xs text-[#8B5E3C] leading-relaxed">
                Employees submit task status updates, which enter a pending state until an Operations Manager reviews and approves or declines them.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="p-6 bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl space-y-3 hover:border-[#D4A373] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A373] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-[#2D241E]">Team Registration & Invites</h3>
              <p className="text-xs text-[#8B5E3C] leading-relaxed">
                Managers register new organization teams, generate email invitations with custom access codes, and automatically link joining employees.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="p-6 bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl space-y-3 hover:border-[#D4A373] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#2D241E] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">shield_person</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-[#2D241E]">Strict Multi-Tenant Isolation</h3>
              <p className="text-xs text-[#8B5E3C] leading-relaxed">
                Complete data privacy between field teams. Organizations only view their designated tasks, team members, and site telemetry.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="p-6 bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl space-y-3 hover:border-[#D4A373] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#8B5E3C] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">schedule</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-[#2D241E]">Shift Attendance & Logs</h3>
              <p className="text-xs text-[#8B5E3C] leading-relaxed">
                Live clock-in and clock-out mechanisms, shift notes, total hours calculated automatically, and performance check-in records.
              </p>
            </div>

            {/* Capability 5 */}
            <div className="p-6 bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl space-y-3 hover:border-[#D4A373] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#606C38] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">map</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-[#2D241E]">GIS Spatial Telemetry</h3>
              <p className="text-xs text-[#8B5E3C] leading-relaxed">
                Interactive spatial station mapping, GPS site coordinates, station leads, and infrastructure health telemetry.
              </p>
            </div>

            {/* Capability 6 */}
            <div className="p-6 bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl space-y-3 hover:border-[#D4A373] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A373] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">analytics</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-[#2D241E]">Async Reports & Analytics</h3>
              <p className="text-xs text-[#8B5E3C] leading-relaxed">
                Monthly performance bar charts, attendance analytics, and background queue workers for heavy enterprise report exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="px-4 lg:px-12 py-16 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#606C38] uppercase tracking-wider">3-Step Onboarding</span>
          <h2 className="font-headline text-3xl font-light text-[#2D241E]">How Sahara Agile Works Operates</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#E5D5C0] rounded-3xl space-y-3 relative">
            <div className="text-2xl font-bold font-mono text-[#D4A373]">01</div>
            <h3 className="font-headline text-lg font-bold text-[#2D241E]">Register Organization</h3>
            <p className="text-xs text-[#8B5E3C]">
              First user registers as Operations Manager, creating a custom team space with administrative and approval privileges.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5D5C0] rounded-3xl space-y-3 relative">
            <div className="text-2xl font-bold font-mono text-[#D4A373]">02</div>
            <h3 className="font-headline text-lg font-bold text-[#2D241E]">Dispatch Employee Links</h3>
            <p className="text-xs text-[#8B5E3C]">
              Manager inputs operator emails in the Team Roster to send shareable invite links and log invitation records in Firestore.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5D5C0] rounded-3xl space-y-3 relative">
            <div className="text-2xl font-bold font-mono text-[#D4A373]">03</div>
            <h3 className="font-headline text-lg font-bold text-[#2D241E]">Coordinate & Approve</h3>
            <p className="text-xs text-[#8B5E3C]">
              Employees execute field missions and log attendance, while Managers review task status requests in real time.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-[#2D241E] text-white py-10 px-4 lg:px-12 border-t border-[#3D3028]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#A89F91]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#606C38] text-white flex items-center justify-center font-bold">
              S
            </div>
            <div>
              <span className="font-bold text-white block">Sahara Agile Works</span>
              <span className="text-[10px]">Encrypted SatCom Telemetry Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('SignUp', 'push')}
              className="hover:text-white font-semibold transition-colors"
            >
              Create Team
            </button>
            <button
              onClick={() => onNavigate('SignUp', 'push')}
              className="hover:text-white font-semibold transition-colors"
            >
              Operator Sign In
            </button>
          </div>

          <span>© 2026 Sahara Agile Works. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
