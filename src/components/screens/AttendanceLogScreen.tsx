import React, { useState } from 'react';
import { AttendanceLog, TeamMember } from '../../types';
import { saveAttendanceLog } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

interface AttendanceLogScreenProps {
  attendanceLogs: AttendanceLog[];
  team: TeamMember[];
  onOpenMobileMenu: () => void;
  onNavigate: (screen: any) => void;
}

export const AttendanceLogScreen: React.FC<AttendanceLogScreenProps> = ({
  attendanceLogs,
  team,
  onOpenMobileMenu,
  onNavigate,
}) => {
  const { userProfile, user, activeRole } = useAuth();
  const currentUserName = userProfile?.displayName || 'Amara Vance';
  const currentUserAvatar =
    userProfile?.photoURL ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'manager_oversight' | 'reports'>('overview');

  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Station and Clock-in form state
  const [selectedStation, setSelectedStation] = useState<string>('Al-Kufra Hydro Site');
  const [workNotesInput, setWorkNotesInput] = useState('');
  const [selectedBreakMinutes, setSelectedBreakMinutes] = useState<number>(30);

  // Selected Log for Full Detail Modal & Manager Edit Modal
  const [inspectingLog, setInspectingLog] = useState<AttendanceLog | null>(null);
  const [editingLog, setEditingLog] = useState<AttendanceLog | null>(null);
  const [showManualAddModal, setShowManualAddModal] = useState<boolean>(false);

  // Manual Add Form State for Managers
  const [manualForm, setManualForm] = useState({
    userName: currentUserName,
    locationName: 'Al-Kufra Hydro Site',
    date: new Date().toISOString().split('T')[0],
    clockInTime: '08:00',
    clockOutTime: '17:00',
    breakMinutes: 60,
    workNotes: 'Manual override log created by manager.',
  });

  const activeLog = attendanceLogs.find(
    (log) => log.userName === currentUserName && log.status === 'clocked_in'
  );

  // Handle Clock-In
  const handleClockIn = async () => {
    const now = new Date();
    const newLog: AttendanceLog = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      userId: user?.uid || `USR-${Date.now().toString().slice(-4)}`,
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      clockInTime: now.toISOString(),
      status: 'clocked_in',
      date: now.toISOString().split('T')[0],
      locationName: selectedStation,
      breakMinutes: selectedBreakMinutes,
      approvalStatus: 'pending',
    };

    await saveAttendanceLog(newLog);
    alert(`Successfully Clocked In at ${selectedStation} (${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
  };

  // Handle Clock-Out
  const handleClockOut = async () => {
    if (!activeLog) return;

    const now = new Date();
    const startTime = new Date(activeLog.clockInTime).getTime();
    const rawHours = (now.getTime() - startTime) / (1000 * 60 * 60);
    const breakHours = (activeLog.breakMinutes || 0) / 60;
    const netHours = Math.max(0.1, Number((rawHours - breakHours).toFixed(2)));
    const overtime = netHours > 8 ? Number((netHours - 8).toFixed(2)) : 0;

    const updatedLog: AttendanceLog = {
      ...activeLog,
      clockOutTime: now.toISOString(),
      totalHours: netHours,
      overtimeHours: overtime,
      status: 'clocked_out',
      workNotes: workNotesInput.trim() || 'Completed daily field operational shift.',
      approvalStatus: 'pending',
    };

    await saveAttendanceLog(updatedLog);
    setWorkNotesInput('');
    alert(`Successfully Clocked Out! Total shift time: ${netHours} hours (Break: ${activeLog.breakMinutes || 0}m).`);
  };

  // Manager Approve Shift
  const handleApproveShift = async (log: AttendanceLog) => {
    if (activeRole !== 'Manager') {
      alert('Access Denied (RBAC): Manager role required to approve shifts. Please switch role to Manager in top header.');
      return;
    }
    const updated: AttendanceLog = {
      ...log,
      approvalStatus: 'approved',
      approvedBy: currentUserName,
    };
    await saveAttendanceLog(updated);
    if (inspectingLog?.id === log.id) setInspectingLog(updated);
  };

  // Manager Flag Discrepancy
  const handleFlagShift = async (log: AttendanceLog) => {
    if (activeRole !== 'Manager') {
      alert('Access Denied (RBAC): Manager role required to flag shifts. Please switch role to Manager in top header.');
      return;
    }
    const note = prompt('Enter reason for flagging this shift:', log.managerNotes || 'Shift time discrepancy detected.');
    if (note === null) return;

    const updated: AttendanceLog = {
      ...log,
      approvalStatus: 'flagged',
      approvedBy: currentUserName,
      managerNotes: note,
    };
    await saveAttendanceLog(updated);
    if (inspectingLog?.id === log.id) setInspectingLog(updated);
  };

  // Save Manager Edited Shift
  const handleSaveEditShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole !== 'Manager') {
      alert('Access Denied (RBAC): Manager role required to edit shift logs.');
      return;
    }
    if (!editingLog) return;

    await saveAttendanceLog(editingLog);
    alert(`Shift log ${editingLog.id} updated successfully.`);
    setEditingLog(null);
  };

  // Handle Manager Manual Creation of Shift
  const handleCreateManualShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole !== 'Manager') {
      alert('Access Denied (RBAC): Manager role required to add manual overrides.');
      return;
    }
    const inIso = new Date(`${manualForm.date}T${manualForm.clockInTime}:00`).toISOString();
    const outIso = new Date(`${manualForm.date}T${manualForm.clockOutTime}:00`).toISOString();
    
    const startMs = new Date(inIso).getTime();
    const endMs = new Date(outIso).getTime();
    const rawHours = (endMs - startMs) / (1000 * 60 * 60);
    const breakHours = manualForm.breakMinutes / 60;
    const netHours = Math.max(0.1, Number((rawHours - breakHours).toFixed(2)));
    const overtime = netHours > 8 ? Number((netHours - 8).toFixed(2)) : 0;

    const selectedUserObj = team.find((t) => t.name === manualForm.userName);

    const newLog: AttendanceLog = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      userId: selectedUserObj?.id || `USR-${Date.now().toString().slice(-4)}`,
      userName: manualForm.userName,
      userAvatar: selectedUserObj?.avatar || currentUserAvatar,
      clockInTime: inIso,
      clockOutTime: outIso,
      totalHours: netHours,
      overtimeHours: overtime,
      breakMinutes: manualForm.breakMinutes,
      locationName: manualForm.locationName,
      status: 'clocked_out',
      workNotes: manualForm.workNotes,
      date: manualForm.date,
      approvalStatus: 'approved',
      approvedBy: currentUserName,
      managerNotes: `Manually added by manager ${currentUserName}`,
    };

    await saveAttendanceLog(newLog);
    alert(`New shift record added for ${manualForm.userName}!`);
    setShowManualAddModal(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Log ID',
      'Employee',
      'Date',
      'Location',
      'Clock In',
      'Clock Out',
      'Total Hours',
      'Overtime Hours',
      'Break (Min)',
      'Status',
      'Approval',
      'Approved By',
      'Shift Notes',
      'Manager Notes'
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.userName}"`,
      l.date,
      `"${l.locationName || 'Unspecified'}"`,
      new Date(l.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      l.clockOutTime ? new Date(l.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active',
      l.totalHours || 0,
      l.overtimeHours || 0,
      l.breakMinutes || 0,
      l.status,
      l.approvalStatus || 'pending',
      `"${l.approvedBy || 'N/A'}"`,
      `"${(l.workNotes || '').replace(/"/g, '""')}"`,
      `"${(l.managerNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sahara_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Logs
  const userFilteredLogs = attendanceLogs.filter((log) => {
    // If employee role, STRICTLY constrain to own records only
    if (activeRole === 'Employee') {
      const isMine =
        log.userName.toLowerCase() === currentUserName.toLowerCase() ||
        log.userId === user?.uid ||
        log.userName === 'Amara Vance'; // Fallback sample user matching default
      if (!isMine) return false;
    }

    const matchesEmployee =
      activeRole === 'Employee' ? true : selectedEmployee === 'all' || log.userName === selectedEmployee;

    const matchesStatus =
      selectedStatus === 'all'
        ? true
        : selectedStatus === 'clocked_in'
        ? log.status === 'clocked_in'
        : selectedStatus === 'clocked_out'
        ? log.status === 'clocked_out'
        : selectedStatus === 'approved'
        ? log.approvalStatus === 'approved'
        : selectedStatus === 'flagged'
        ? log.approvalStatus === 'flagged'
        : true;

    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.locationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.workNotes || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesEmployee && matchesStatus && matchesSearch;
  });

  const filteredLogs = userFilteredLogs;

  // Personal Logs for Employee view
  const myLogs = attendanceLogs.filter(
    (l) => l.userName.toLowerCase() === currentUserName.toLowerCase() || l.userId === user?.uid || l.userName === 'Amara Vance'
  );
  const myShiftHours = myLogs.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
  const myOvertimeHours = myLogs.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
  const myApprovedShifts = myLogs.filter((l) => l.approvalStatus === 'approved').length;
  const myApprovalRate = myLogs.length > 0 ? Math.round((myApprovedShifts / myLogs.length) * 100) : 100;

  // KPI Calculations for Manager
  const activeClockedInCount = attendanceLogs.filter((l) => l.status === 'clocked_in').length;
  const totalShiftHours = attendanceLogs.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
  const totalOvertimeHours = attendanceLogs.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
  const totalApprovedShifts = attendanceLogs.filter((l) => l.approvalStatus === 'approved').length;
  const approvalRatePct = attendanceLogs.length > 0 ? Math.round((totalApprovedShifts / attendanceLogs.length) * 100) : 100;

  // Grouped Summary by Employee
  const employeeSummaries = React.useMemo(() => {
    const map: { [key: string]: { name: string; avatar: string; shifts: number; hours: number; overtime: number; active: boolean; approvedCount: number } } = {};
    attendanceLogs.forEach((l) => {
      if (!map[l.userName]) {
        map[l.userName] = {
          name: l.userName,
          avatar: l.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          shifts: 0,
          hours: 0,
          overtime: 0,
          active: false,
          approvedCount: 0,
        };
      }
      map[l.userName].shifts += 1;
      map[l.userName].hours += l.totalHours || 0;
      map[l.userName].overtime += l.overtimeHours || 0;
      if (l.status === 'clocked_in') map[l.userName].active = true;
      if (l.approvalStatus === 'approved') map[l.userName].approvedCount += 1;
    });
    return Object.values(map);
  }, [attendanceLogs]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FDF8F3] overflow-y-auto">
      <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B5E3C]">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>Workforce Attendance & Duty Ledger</span>
              {activeRole === 'Manager' ? (
                <span className="bg-[#606C38]/15 text-[#606C38] px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#606C38]/20 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified_user</span>
                  Manager Oversight Mode
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">badge</span>
                  Personal Shift Terminal (Employee)
                </span>
              )}
            </div>
            <h1 className="font-headline text-3xl lg:text-4xl font-light text-[#2D241E] mt-1">
              {activeRole === 'Manager' ? 'Field Attendance & Operations Control' : 'My Shift Clock & Attendance Log'}
            </h1>
            <p className="text-sm text-[#8B5E3C]">
              {activeRole === 'Manager'
                ? 'Live shift clocking, station site check-ins, workforce hours reports, and manager verification.'
                : 'Clock in/out for active station shifts, record shift notes, and view your personal attendance history.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {activeRole === 'Manager' && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="bg-[#2D241E] hover:bg-[#3D3028] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>Export CSV Report</span>
                </button>
                <button
                  onClick={() => setShowManualAddModal(true)}
                  className="bg-[#606C38] hover:bg-[#4d572d] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">add_time</span>
                  <span>Log Shift Override</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5D5C0] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#D4A373] text-[#2D241E] shadow-xs'
                : 'bg-white/60 text-[#8B5E3C] hover:bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-base">timer</span>
            <span>{activeRole === 'Manager' ? 'Shift Clock & Live Operations' : 'My Shift Terminal & History'}</span>
          </button>

          {activeRole === 'Manager' && (
            <>
              <button
                onClick={() => setActiveTab('manager_oversight')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'manager_oversight'
                    ? 'bg-[#D4A373] text-[#2D241E] shadow-xs'
                    : 'bg-white/60 text-[#8B5E3C] hover:bg-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">supervisor_account</span>
                <span>All Employees Oversight ({attendanceLogs.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'reports'
                    ? 'bg-[#D4A373] text-[#2D241E] shadow-xs'
                    : 'bg-white/60 text-[#8B5E3C] hover:bg-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">analytics</span>
                <span>Attendance Reports & Metrics</span>
              </button>
            </>
          )}
        </div>

        {/* KPI Metrics Dashboard Cards */}
        {activeRole === 'Manager' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#F3E9DC] p-5 rounded-2xl border border-[#E5D5C0] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#2A9D8F]/10 text-[#2A9D8F] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">person_pin_circle</span>
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] font-semibold">Active On-Duty</p>
                <p className="text-2xl font-bold text-[#3D3028]">{activeClockedInCount} Staff</p>
              </div>
            </div>

            <div className="bg-[#F3E9DC] p-5 rounded-2xl border border-[#E5D5C0] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4A373]/20 text-[#8B5E3C] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">more_time</span>
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] font-semibold">Total Logged Hours</p>
                <p className="text-2xl font-bold text-[#3D3028]">{totalShiftHours.toFixed(1)} hrs</p>
              </div>
            </div>

            <div className="bg-[#F3E9DC] p-5 rounded-2xl border border-[#E5D5C0] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">schedule</span>
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] font-semibold">Total Overtime</p>
                <p className="text-2xl font-bold text-[#3D3028]">{totalOvertimeHours.toFixed(1)} hrs</p>
              </div>
            </div>

            <div className="bg-[#F3E9DC] p-5 rounded-2xl border border-[#E5D5C0] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#606C38]/20 text-[#606C38] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">verified</span>
                </div>
              <div>
                <p className="text-xs text-[#8B5E3C] font-semibold">Manager Verified</p>
                <p className="text-2xl font-bold text-[#3D3028]">{approvalRatePct}%</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 flex items-center gap-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">timer</span>
              </div>
              <div>
                <p className="text-xs text-amber-900 font-semibold">My Current Duty Status</p>
                <p className="text-lg font-bold text-[#3D3028] flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${activeLog ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                  {activeLog ? 'Clocked In' : 'Off Duty'}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5D5C0] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4A373]/20 text-[#8B5E3C] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">history</span>
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] font-semibold">My Logged Shift Hours</p>
                <p className="text-2xl font-bold text-[#3D3028]">{myShiftHours.toFixed(1)} hrs</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5D5C0] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">schedule</span>
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] font-semibold">My Overtime Earned</p>
                <p className="text-2xl font-bold text-[#3D3028]">{myOvertimeHours.toFixed(1)} hrs</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5D5C0] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#606C38]/20 text-[#606C38] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] font-semibold">My Manager Approval</p>
                <p className="text-2xl font-bold text-[#3D3028]">{myApprovalRate}% Verified</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW & MY SHIFT CLOCK IN */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Live Clock-In / Clock-Out Control Card */}
            <div className="bg-white border-2 border-[#D4A373] p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={currentUserAvatar}
                    alt={currentUserName}
                    className="w-14 h-14 rounded-full border-2 border-[#D4A373] object-cover shrink-0 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#3D3028]">{currentUserName}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          activeLog
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${activeLog ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                        {activeLog ? 'Clocked In (Active Shift)' : 'Clocked Out (Off Duty)'}
                      </span>
                    </div>
                    <p className="text-xs text-[#8B5E3C] mt-0.5">
                      {activeLog
                        ? `Station: ${activeLog.locationName || 'Field Operational Station'} • Started at ${new Date(activeLog.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Select your target station and start your operational shift.'}
                    </p>
                  </div>
                </div>

                {activeLog ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <input
                      type="text"
                      placeholder="Shift accomplishment summary / notes..."
                      value={workNotesInput}
                      onChange={(e) => setWorkNotesInput(e.target.value)}
                      className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-xl px-3 py-2.5 text-xs text-[#3D3028] focus:outline-none focus:ring-2 focus:ring-[#D4A373] min-w-[280px]"
                    />
                    <button
                      onClick={handleClockOut}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>Clock Out Shift</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedStation}
                        onChange={(e) => setSelectedStation(e.target.value)}
                        className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-xl px-3 py-2 text-xs text-[#3D3028] font-medium outline-none focus:ring-2 focus:ring-[#D4A373]"
                      >
                        <option value="Al-Kufra Hydro Site">Al-Kufra Hydro Site</option>
                        <option value="Djanet Microgrid">Djanet Microgrid Station</option>
                        <option value="Chott el Djerid Hub">Chott el Djerid Tech Hub</option>
                        <option value="Sebha Solar Complex">Sebha Solar Complex</option>
                        <option value="Siwa Oasis Shelter">Siwa Oasis Field Shelter</option>
                      </select>

                      <select
                        value={selectedBreakMinutes}
                        onChange={(e) => setSelectedBreakMinutes(Number(e.target.value))}
                        className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-xl px-3 py-2 text-xs text-[#3D3028] font-medium outline-none focus:ring-2 focus:ring-[#D4A373]"
                      >
                        <option value={15}>15m Break</option>
                        <option value={30}>30m Break</option>
                        <option value={45}>45m Break</option>
                        <option value={60}>60m Break</option>
                      </select>
                    </div>

                    <button
                      onClick={handleClockIn}
                      className="bg-[#606C38] hover:bg-[#4d572d] text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-base">login</span>
                      <span>Clock In Shift</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Live Employee Roster Cards */}
            <div className="bg-white border border-[#E5D5C0] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#3D3028] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8B5E3C]">group</span>
                  <span>Currently On-Duty Field Personnel ({attendanceLogs.filter((l) => l.status === 'clocked_in').length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('manager_oversight')}
                  className="text-xs font-bold text-[#D4A373] hover:underline flex items-center gap-1"
                >
                  <span>View All Employee Logs</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {attendanceLogs
                  .filter((l) => l.status === 'clocked_in')
                  .map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setInspectingLog(log)}
                      className="bg-[#FDF8F3] border border-[#E5D5C0] hover:border-[#D4A373] rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={log.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={log.userName}
                          className="w-9 h-9 rounded-full object-cover border border-[#D4A373]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#3D3028] group-hover:text-[#D4A373] transition-colors">{log.userName}</p>
                          <p className="text-[10px] text-[#8B5E3C]">{log.locationName || 'Field Site'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full block">
                          On Duty
                        </span>
                        <span className="text-[10px] font-mono text-[#8B5E3C] mt-0.5 block">
                          In: {new Date(log.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}

                {attendanceLogs.filter((l) => l.status === 'clocked_in').length === 0 && (
                  <div className="col-span-full text-center py-6 text-xs text-[#8B5E3C]/70 bg-[#FDF8F3] rounded-xl border border-dashed border-[#E5D5C0]">
                    No employees currently clocked in.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGER OVERSIGHT - ALL EMPLOYEES ATTENDANCE LEDGER */}
        {(activeTab === 'overview' || activeTab === 'manager_oversight') && (
          <div className="bg-white border border-[#E5D5C0] rounded-2xl overflow-hidden shadow-sm space-y-4 p-4 lg:p-6">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5D5C0] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#3D3028] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8B5E3C]">badge</span>
                  All Employees Shift Ledger & Manager Verification
                </h3>
                <p className="text-xs text-[#8B5E3C]">
                  Review clock times, net shift hours, location data, and approve or flag attendance records.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Employee Filter */}
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="bg-[#FDF8F3] border border-[#E5D5C0] text-xs rounded-xl px-3 py-2 text-[#3D3028] font-semibold outline-none focus:ring-2 focus:ring-[#D4A373]"
                >
                  <option value="all">All Employees ({team.length + 1})</option>
                  {Array.from(new Set(attendanceLogs.map((l) => l.userName))).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#FDF8F3] border border-[#E5D5C0] text-xs rounded-xl px-3 py-2 text-[#3D3028] font-semibold outline-none focus:ring-2 focus:ring-[#D4A373]"
                >
                  <option value="all">All Statuses</option>
                  <option value="clocked_in">On Duty (Clocked In)</option>
                  <option value="clocked_out">Completed (Clocked Out)</option>
                  <option value="approved">Manager Approved</option>
                  <option value="flagged">Flagged Discrepancy</option>
                </select>

                {/* Search */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-base text-stone-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search employee / notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-2 bg-[#FDF8F3] border border-[#E5D5C0] rounded-xl text-xs text-[#3D3028] focus:outline-none focus:ring-2 focus:ring-[#D4A373] w-48"
                  />
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3E9DC] text-[#8B5E3C] uppercase text-[10px] tracking-wider border-b border-[#E5D5C0]">
                  <tr>
                    <th className="px-4 py-3 font-bold">Employee</th>
                    <th className="px-4 py-3 font-bold">Field Station</th>
                    <th className="px-4 py-3 font-bold">Date</th>
                    <th className="px-4 py-3 font-bold">Clock In</th>
                    <th className="px-4 py-3 font-bold">Clock Out</th>
                    <th className="px-4 py-3 font-bold">Total Hours</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Manager Verification</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D5C0]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FDF8F3] transition-colors group">
                      <td className="px-4 py-3 font-medium text-[#3D3028]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              log.userAvatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={log.userName}
                            className="w-7 h-7 rounded-full object-cover border border-[#D4A373]"
                          />
                          <div>
                            <span className="font-bold text-[#3D3028] block">{log.userName}</span>
                            <span className="text-[10px] font-mono text-stone-400">{log.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-[#5C4D42]">
                        <span className="bg-[#F3E9DC] text-[#8B5E3C] px-2 py-0.5 rounded-md text-[11px] font-medium border border-[#E5D5C0]">
                          {log.locationName || 'Al-Kufra Site'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-[#5C4D42] font-mono">{log.date}</td>

                      <td className="px-4 py-3 font-mono text-[#3D3028]">
                        {new Date(log.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="px-4 py-3 font-mono text-[#3D3028]">
                        {log.clockOutTime
                          ? new Date(log.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>

                      <td className="px-4 py-3 font-bold text-[#8B5E3C]">
                        {log.totalHours ? `${log.totalHours} hrs` : 'Active'}
                        {log.overtimeHours && log.overtimeHours > 0 ? (
                          <span className="text-[10px] font-normal text-amber-700 ml-1">(+{log.overtimeHours}h OT)</span>
                        ) : null}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            log.status === 'clocked_in'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {log.status === 'clocked_in' ? 'On Duty' : 'Completed'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {log.approvalStatus === 'approved' ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            Approved
                          </span>
                        ) : log.approvalStatus === 'flagged' ? (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-300 inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">warning</span>
                            Flagged
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300 inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">pending</span>
                            Pending Review
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setInspectingLog(log)}
                            className="p-1.5 text-[#8B5E3C] hover:text-[#D4A373] hover:bg-[#F3E9DC] rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                            title="Inspect Details"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                            <span className="hidden sm:inline">Details</span>
                          </button>

                          {activeRole === 'Manager' && (
                            <>
                              {log.approvalStatus !== 'approved' && (
                                <button
                                  onClick={() => handleApproveShift(log)}
                                  className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Approve Shift"
                                >
                                  <span className="material-symbols-outlined text-base">check</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleFlagShift(log)}
                                className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Flag Discrepancy"
                              >
                                <span className="material-symbols-outlined text-base">flag</span>
                              </button>

                              <button
                                onClick={() => setEditingLog(log)}
                                className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                                title="Edit Shift Log"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-stone-500 text-xs">
                        No attendance logs match the current search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REPORTS & CONSOLIDATED EMPLOYEE METRICS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E5D5C0] rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5D5C0] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#3D3028] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#8B5E3C]">analytics</span>
                    Employee Attendance & Total Work Hours Breakdown
                  </h3>
                  <p className="text-xs text-[#8B5E3C]">
                    Aggregated shift data, total hours logged per employee, and overtime ratios.
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="bg-[#606C38] hover:bg-[#4d572d] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>Export Report Data (CSV)</span>
                </button>
              </div>

              {/* Employee Summaries Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3E9DC] text-[#8B5E3C] uppercase text-[10px] tracking-wider border-b border-[#E5D5C0]">
                    <tr>
                      <th className="px-4 py-3 font-bold">Employee</th>
                      <th className="px-4 py-3 font-bold">Total Shifts</th>
                      <th className="px-4 py-3 font-bold">Total Hours</th>
                      <th className="px-4 py-3 font-bold">Overtime Hours</th>
                      <th className="px-4 py-3 font-bold">Avg Hours / Shift</th>
                      <th className="px-4 py-3 font-bold">Duty Status</th>
                      <th className="px-4 py-3 font-bold text-right">Approval Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5D5C0]">
                    {employeeSummaries.map((emp) => {
                      const avgShift = emp.shifts > 0 ? (emp.hours / emp.shifts).toFixed(1) : '0';
                      const empApprovalPct = emp.shifts > 0 ? Math.round((emp.approvedCount / emp.shifts) * 100) : 100;

                      return (
                        <tr key={emp.name} className="hover:bg-[#FDF8F3] transition-colors">
                          <td className="px-4 py-3 font-bold text-[#3D3028] flex items-center gap-2.5">
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#D4A373]"
                            />
                            <span>{emp.name}</span>
                          </td>
                          <td className="px-4 py-3 text-[#5C4D42] font-semibold">{emp.shifts} shifts</td>
                          <td className="px-4 py-3 font-bold text-[#8B5E3C] text-sm">{emp.hours.toFixed(1)} hrs</td>
                          <td className="px-4 py-3 font-mono text-amber-700">{emp.overtime.toFixed(1)} hrs</td>
                          <td className="px-4 py-3 font-mono text-[#5C4D42]">{avgShift} hrs/shift</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                emp.active
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {emp.active ? '🟢 On Duty Now' : '⚪ Off Duty'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700">
                            {empApprovalPct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: INSPECT FULL SHIFT DETAILS & TELEMETRY */}
        {inspectingLog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
              <button
                onClick={() => setInspectingLog(null)}
                className="absolute right-4 top-4 text-stone-400 hover:text-stone-700"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              <div className="flex items-center gap-3 border-b border-[#E5D5C0] pb-4">
                <img
                  src={inspectingLog.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={inspectingLog.userName}
                  className="w-12 h-12 rounded-full border-2 border-[#D4A373] object-cover"
                />
                <div>
                  <h3 className="font-bold text-base text-[#3D3028]">{inspectingLog.userName}</h3>
                  <p className="text-xs text-[#8B5E3C]">Log ID: {inspectingLog.id} • Date: {inspectingLog.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-[#E5D5C0]">
                  <span className="text-[10px] text-[#8B5E3C] uppercase font-bold block">Field Station</span>
                  <span className="font-semibold text-[#3D3028]">{inspectingLog.locationName || 'Al-Kufra Site'}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E5D5C0]">
                  <span className="text-[10px] text-[#8B5E3C] uppercase font-bold block">Status</span>
                  <span className="font-semibold text-[#3D3028] capitalize">{inspectingLog.status}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E5D5C0]">
                  <span className="text-[10px] text-[#8B5E3C] uppercase font-bold block">Clock In</span>
                  <span className="font-mono text-[#3D3028]">
                    {new Date(inspectingLog.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E5D5C0]">
                  <span className="text-[10px] text-[#8B5E3C] uppercase font-bold block">Clock Out</span>
                  <span className="font-mono text-[#3D3028]">
                    {inspectingLog.clockOutTime
                      ? new Date(inspectingLog.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Active'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E5D5C0]">
                  <span className="text-[10px] text-[#8B5E3C] uppercase font-bold block">Total Hours Logged</span>
                  <span className="font-bold text-[#8B5E3C]">{inspectingLog.totalHours || 0} hrs</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E5D5C0]">
                  <span className="text-[10px] text-[#8B5E3C] uppercase font-bold block">Break Deducted</span>
                  <span className="font-semibold text-[#3D3028]">{inspectingLog.breakMinutes || 0} mins</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#E5D5C0] space-y-1">
                <span className="text-[10px] text-[#8B5E3C] uppercase font-bold block">Employee Work Notes</span>
                <p className="text-xs text-[#3D3028] italic">{inspectingLog.workNotes || 'No notes entered.'}</p>
              </div>

              {inspectingLog.managerNotes && (
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <span className="font-bold text-[10px] uppercase block">Manager Note:</span>
                  <p>{inspectingLog.managerNotes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-[#E5D5C0] flex items-center justify-between">
                {activeRole === 'Manager' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveShift(inspectingLog)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      Approve Shift
                    </button>
                    <button
                      onClick={() => handleFlagShift(inspectingLog)}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      Flag Discrepancy
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-[#8B5E3C] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span>Shift Verification Status: <strong className="capitalize">{inspectingLog.approvalStatus || 'Pending'}</strong></span>
                  </div>
                )}

                <button
                  onClick={() => setInspectingLog(null)}
                  className="text-xs font-bold text-[#8B5E3C] hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: MANAGER EDIT SHIFT */}
        {editingLog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleSaveEditShift} className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
              <h3 className="font-bold text-base text-[#3D3028] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B5E3C]">edit</span>
                Edit Attendance Record ({editingLog.id})
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#8B5E3C] mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={editingLog.userName}
                    onChange={(e) => setEditingLog({ ...editingLog, userName: e.target.value })}
                    className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#8B5E3C] mb-1">Field Location</label>
                  <input
                    type="text"
                    value={editingLog.locationName || ''}
                    onChange={(e) => setEditingLog({ ...editingLog, locationName: e.target.value })}
                    className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#8B5E3C] mb-1">Total Net Hours</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingLog.totalHours || 0}
                      onChange={(e) => setEditingLog({ ...editingLog, totalHours: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#8B5E3C] mb-1">Overtime Hours</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingLog.overtimeHours || 0}
                      onChange={(e) => setEditingLog({ ...editingLog, overtimeHours: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#8B5E3C] mb-1">Manager Feedback Notes</label>
                  <textarea
                    rows={2}
                    value={editingLog.managerNotes || ''}
                    onChange={(e) => setEditingLog({ ...editingLog, managerNotes: e.target.value })}
                    className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5D5C0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 text-xs font-bold text-[#8B5E3C] hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#606C38] hover:bg-[#4d572d] text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Save Shift Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL 3: MANAGER MANUAL SHIFT OVERRIDE LOGGING */}
        {showManualAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleCreateManualShift} className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
              <h3 className="font-bold text-base text-[#3D3028] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B5E3C]">add_time</span>
                Log Manual Shift Override
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#8B5E3C] mb-1">Select Employee</label>
                  <select
                    value={manualForm.userName}
                    onChange={(e) => setManualForm({ ...manualForm, userName: e.target.value })}
                    className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5 font-medium"
                  >
                    {team.map((member) => (
                      <option key={member.id} value={member.name}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#8B5E3C] mb-1">Station Location</label>
                  <input
                    type="text"
                    value={manualForm.locationName}
                    onChange={(e) => setManualForm({ ...manualForm, locationName: e.target.value })}
                    className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#8B5E3C] mb-1">Date</label>
                    <input
                      type="date"
                      value={manualForm.date}
                      onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                      className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#8B5E3C] mb-1">Break (Minutes)</label>
                    <input
                      type="number"
                      value={manualForm.breakMinutes}
                      onChange={(e) => setManualForm({ ...manualForm, breakMinutes: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#8B5E3C] mb-1">Clock In Time</label>
                    <input
                      type="time"
                      value={manualForm.clockInTime}
                      onChange={(e) => setManualForm({ ...manualForm, clockInTime: e.target.value })}
                      className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#8B5E3C] mb-1">Clock Out Time</label>
                    <input
                      type="time"
                      value={manualForm.clockOutTime}
                      onChange={(e) => setManualForm({ ...manualForm, clockOutTime: e.target.value })}
                      className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#8B5E3C] mb-1">Shift Notes / Justification</label>
                  <textarea
                    rows={2}
                    value={manualForm.workNotes}
                    onChange={(e) => setManualForm({ ...manualForm, workNotes: e.target.value })}
                    className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5D5C0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#8B5E3C] hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#606C38] hover:bg-[#4d572d] text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Log Override Shift
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
