import React, { useState, useEffect } from 'react';
import { AsyncJob, Task, AttendanceLog } from '../../types';
import { saveAsyncJob } from '../../services/firestoreService';
import { globalJobQueue, QueueStats, QueueJob } from '../../services/jobQueueService';
import { generateMidnightProductivityReport, GeneratedReport } from '../../services/productivityReportService';
import { useAuth } from '../../context/AuthContext';

interface AsyncReportsScreenProps {
  asyncJobs: AsyncJob[];
  tasks?: Task[];
  attendanceLogs?: AttendanceLog[];
  onOpenMobileMenu: () => void;
  onNavigate: (screen: any) => void;
}

export const AsyncReportsScreen: React.FC<AsyncReportsScreenProps> = ({
  asyncJobs,
  tasks = [],
  attendanceLogs = [],
  onOpenMobileMenu,
  onNavigate,
}) => {
  const { userProfile } = useAuth();
  const [selectedJobType, setSelectedJobType] = useState<AsyncJob['type']>('sprint_summary');
  const [simulatingFailures, setSimulatingFailures] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Redis Job Queue State
  const [queueStats, setQueueStats] = useState<QueueStats>(globalJobQueue.getStats());
  const [dlqJobs, setDlqJobs] = useState<QueueJob[]>(globalJobQueue.getDlqJobs());
  const [latestReport, setLatestReport] = useState<GeneratedReport | null>(globalJobQueue.getLatestReport());
  const [activeQueueTab, setActiveQueueTab] = useState<'overview' | 'dlq' | 'report'>('overview');

  // Refresh Queue State periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueStats(globalJobQueue.getStats());
      setDlqJobs(globalJobQueue.getDlqJobs());
      setLatestReport(globalJobQueue.getLatestReport());
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // CSV Generator Helper
  const downloadCSV = (filename: string, headers: string[], rows: (string | number | undefined | null)[][]) => {
    const escapeCell = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    const csvContent = [
      headers.map(escapeCell).join(','),
      ...rows.map((row) => row.map(escapeCell).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(`Downloaded ${filename}`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handleDownloadTasksCSV = () => {
    const headers = [
      'Task ID',
      'Code',
      'Title',
      'Status',
      'Priority',
      'Assignee Name',
      'Assignee Role',
      'Progress (%)',
      'Region',
      'Due Date',
      'Updated At',
    ];
    const rows = tasks.map((t) => [
      t.id,
      t.code,
      t.title,
      t.status,
      t.priority,
      t.assignee?.name || '',
      t.assignee?.role || '',
      t.progress || 0,
      t.region || '',
      t.dueDate || '',
      t.updatedAt || '',
    ]);
    const filename = `sahara_tasks_report_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(filename, headers, rows);
  };

  const handleDownloadAttendanceCSV = () => {
    const headers = [
      'Log ID',
      'User ID',
      'User Name',
      'Status',
      'Clock In Time',
      'Clock Out Time',
      'Total Hours',
      'Shift Work Notes',
      'Date',
    ];
    const rows = attendanceLogs.map((a) => [
      a.id,
      a.userId,
      a.userName,
      a.status,
      a.clockInTime,
      a.clockOutTime || '',
      a.totalHours || 0,
      a.workNotes || '',
      a.date || '',
    ]);
    const filename = `sahara_attendance_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(filename, headers, rows);
  };

  const handleDownloadCombinedCSV = () => {
    const headers = ['Entity Type', 'ID / Code', 'Name / Title', 'Status', 'Date / Due', 'Hours / Progress', 'Detail / Notes'];
    const taskRows = tasks.map((t) => [
      'Task',
      t.code || t.id,
      t.title,
      t.status,
      t.dueDate || '',
      `${t.progress || 0}%`,
      `Assignee: ${t.assignee?.name || 'Unassigned'} | Region: ${t.region || 'N/A'}`,
    ]);
    const attendanceRows = attendanceLogs.map((a) => [
      'Attendance',
      a.id,
      a.userName,
      a.status,
      a.date || '',
      `${a.totalHours || 0} hrs`,
      `Shift Notes: ${a.workNotes || 'None'}`,
    ]);

    const filename = `sahara_combined_operations_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(filename, headers, [...taskRows, ...attendanceRows]);
  };

  // Dispatch Midnight Productivity & Sprint Velocity Job via Redis Queue Service
  const handleTriggerMidnightJob = () => {
    const job = globalJobQueue.triggerMidnightReportJob(simulatingFailures);
    setQueueStats(globalJobQueue.getStats());

    // Also record in Firestore for multi-tab sync
    saveAsyncJob({
      id: job.id,
      title: 'Midnight Productivity & Sprint Velocity Automated Report',
      type: 'sprint_summary',
      status: job.state === 'dlq' ? 'failed' : job.state === 'completed' ? 'completed' : 'processing',
      progress: job.progress,
      retryCount: job.retryCount,
      createdAt: job.createdAt,
      teamId: userProfile?.teamId || '',
    });
  };

  // Re-queue item from Dead Letter Queue
  const handleRetryDlq = (jobId: string) => {
    globalJobQueue.retryDlqJob(jobId);
    setQueueStats(globalJobQueue.getStats());
    setDlqJobs(globalJobQueue.getDlqJobs());
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FDF8F3] overflow-y-auto">
      <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5D5C0] pb-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-[#3D3028] flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#8B5E3C]">dataset</span>
              Async Jobs, Redis Queue & Productivity Reports
            </h1>
            <p className="text-xs text-[#8B5E3C]">
              Decoupled Redis background worker, midnight productivity metrics, exponential backoff retries & Dead Letter Queue (DLQ).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Redis Queue Engine: ACTIVE
            </span>
          </div>
        </div>

        {/* Toast Notice */}
        {downloadNotice && (
          <div className="bg-emerald-800 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{downloadNotice}</span>
            </div>
            <button
              onClick={() => setDownloadNotice(null)}
              className="text-emerald-200 hover:text-white text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Live Redis Queue Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-[#F3E9DC] p-3.5 rounded-2xl border border-[#E5D5C0] flex flex-col items-start justify-between">
            <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-wider">Waiting</span>
            <span className="text-2xl font-black text-[#3D3028] mt-1">{queueStats.waiting}</span>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 flex flex-col items-start justify-between">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Active Processing</span>
            <span className="text-2xl font-black text-amber-900 mt-1">{queueStats.active}</span>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex flex-col items-start justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Completed</span>
            <span className="text-2xl font-black text-emerald-900 mt-1">{queueStats.completed}</span>
          </div>
          <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 flex flex-col items-start justify-between">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Failed (Backoff)</span>
            <span className="text-2xl font-black text-rose-900 mt-1">{queueStats.failed}</span>
          </div>
          <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 flex flex-col items-start justify-between col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Dead Letter (DLQ)</span>
            <span className="text-2xl font-black text-purple-900 mt-1">{queueStats.dlq}</span>
          </div>
        </div>

        {/* Midnight Productivity & Sprint Velocity Job Controller */}
        <div className="bg-[#3D3028] text-white p-6 rounded-2xl border border-[#2A211B] space-y-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-700 pb-4">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D4A373]">schedule</span>
                Midnight Automated Job: Daily Productivity & Sprint Velocity Report
              </h3>
              <p className="text-xs text-stone-300">
                Calculates daily attendance hours, employee shift compliance, completed story points, and emails the compiled report to Project Manager.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5 cursor-pointer bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
                <input
                  type="checkbox"
                  checked={simulatingFailures}
                  onChange={(e) => setSimulatingFailures(e.target.checked)}
                  className="rounded border-stone-600 text-amber-500 focus:ring-amber-400"
                />
                <span>Simulate SatCom Network Failures (Test Retries & DLQ)</span>
              </label>

              <button
                onClick={handleTriggerMidnightJob}
                className="bg-[#D4A373] hover:bg-[#c29263] text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-base">rocket_launch</span>
                <span>Trigger Midnight Job</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700 space-y-1.5">
              <div className="font-bold text-[#D4A373] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">repeat</span>
                Exponential Backoff Policy
              </div>
              <p className="text-stone-300 leading-relaxed text-[11px]">
                Attempts: 3 retries max. Delay formula: <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300 font-mono">Delay = BaseMs * 2^(retryCount)</code> (1.0s, 2.0s, 4.0s).
              </p>
            </div>

            <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700 space-y-1.5">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">move_to_inbox</span>
                Dead Letter Queue (DLQ) Fallback
              </div>
              <p className="text-stone-300 leading-relaxed text-[11px]">
                Jobs exceeding 3 retries automatically route to DLQ for diagnostic inspection and manual re-queueing without data loss.
              </p>
            </div>
          </div>
        </div>

        {/* Queue Navigation Tabs */}
        <div className="flex border-b border-[#E5D5C0] gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveQueueTab('overview')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeQueueTab === 'overview'
                ? 'border-[#8B5E3C] text-[#3D3028]'
                : 'border-transparent text-[#8B5E3C] hover:text-[#3D3028]'
            }`}
          >
            <span className="material-symbols-outlined text-base">queue</span>
            Queue Overview ({queueStats.totalJobs})
          </button>

          <button
            onClick={() => setActiveQueueTab('dlq')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeQueueTab === 'dlq'
                ? 'border-purple-600 text-purple-900 font-extrabold'
                : 'border-transparent text-purple-700 hover:text-purple-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">inbox</span>
            Dead Letter Queue (DLQ) ({queueStats.dlq})
          </button>

          <button
            onClick={() => setActiveQueueTab('report')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeQueueTab === 'report'
                ? 'border-emerald-600 text-emerald-900 font-extrabold'
                : 'border-transparent text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">mark_email_read</span>
            Latest Generated Email Report
          </button>
        </div>

        {/* Tab 1: Queue Overview */}
        {activeQueueTab === 'overview' && (
          <div className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D3028] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8B5E3C]">view_list</span>
              Active & Processed Jobs List
            </h3>

            <div className="space-y-3">
              {globalJobQueue.getAllJobs().map((job) => (
                <div
                  key={job.id}
                  className="bg-[#F3E9DC]/50 border border-[#E5D5C0] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#8B5E3C] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {job.id}
                      </span>
                      <span className="text-xs font-bold text-[#3D3028]">{job.name}</span>
                    </div>
                    <p className="text-[11px] text-[#8B5E3C]">
                      Created: {new Date(job.createdAt).toLocaleTimeString()} | Retries: {job.retryCount}/{job.opts.attempts}
                    </p>
                    {job.failedReason && (
                      <p className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 max-w-xl">
                        {job.failedReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                        job.state === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : job.state === 'active'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          : job.state === 'failed'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-stone-100 text-stone-700 border-stone-300'
                      }`}
                    >
                      {job.state.toUpperCase()} ({job.progress}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Dead Letter Queue (DLQ) */}
        {activeQueueTab === 'dlq' && (
          <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-700">move_to_inbox</span>
                  Dead Letter Queue (DLQ) Monitoring & Manual Recovery
                </h3>
                <p className="text-xs text-purple-800">
                  Contains failed jobs that exhausted all exponential backoff retries. Operators can inspect root causes and re-queue jobs for execution.
                </p>
              </div>

              {dlqJobs.length > 0 && (
                <button
                  onClick={() => {
                    globalJobQueue.clearDlq();
                    setDlqJobs([]);
                    setQueueStats(globalJobQueue.getStats());
                  }}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 border border-rose-300 px-3 py-1.5 rounded-xl bg-white"
                >
                  Clear DLQ
                </button>
              )}
            </div>

            {dlqJobs.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-purple-200 space-y-2">
                <span className="material-symbols-outlined text-3xl text-purple-400">check_circle</span>
                <p className="text-xs font-bold text-purple-900">Dead Letter Queue is empty</p>
                <p className="text-[11px] text-purple-700">All background jobs processed cleanly without unrecoverable failures.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dlqJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white border border-purple-300 rounded-xl p-4 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-purple-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {job.id}
                          </span>
                          <span className="text-xs font-bold text-purple-950">{job.name}</span>
                        </div>
                        <p className="text-[11px] text-rose-700 font-semibold bg-rose-50 p-2 rounded border border-rose-200">
                          {job.failedReason}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRetryDlq(job.id)}
                        className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-base">refresh</span>
                        <span>Re-queue from DLQ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Latest Report Delivery Preview */}
        {activeQueueTab === 'report' && latestReport && (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700">mark_email_read</span>
                  Automated Midnight Productivity & Sprint Velocity Email Report
                </h3>
                <p className="text-xs text-emerald-800">
                  Sent to {latestReport.recipientName} ({latestReport.recipientEmail}) on {new Date(latestReport.generatedAt).toLocaleString()}
                </p>
              </div>

              <span className="bg-emerald-700 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Status: {latestReport.deliveryStatus}
              </span>
            </div>

            {/* Metrics Highlight Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800">Total Hours Logged</span>
                <p className="text-xl font-black text-emerald-950">{latestReport.productivity.totalHoursLogged} hrs</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800">Active Operators</span>
                <p className="text-xl font-black text-emerald-950">{latestReport.productivity.activeEmployeesCount} engineers</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800">Sprint Velocity</span>
                <p className="text-xl font-black text-emerald-950">{latestReport.velocity.velocityPercentage}%</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800">Completed Points</span>
                <p className="text-xl font-black text-emerald-950">{latestReport.velocity.completedStoryPoints} / {latestReport.velocity.totalStoryPoints} pts</p>
              </div>
            </div>

            {/* Email Markdown Preview */}
            <div className="bg-white p-4 rounded-xl border border-emerald-200 font-mono text-xs text-stone-800 whitespace-pre-wrap leading-relaxed">
              {latestReport.emailBodyMarkdown}
            </div>
          </div>
        )}

        {/* Direct CSV Data Export Card */}
        <div className="bg-[#EFE5D8] p-6 rounded-2xl border border-[#DECDB8] space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-[#3D3028] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B5E3C]">csv</span>
            Direct CSV Data Exports (Current Operations)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              onClick={handleDownloadTasksCSV}
              className="bg-[#3D3028] hover:bg-[#2A211B] text-white p-3 rounded-xl text-xs font-bold flex flex-col items-start gap-1 transition-all shadow-sm hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#D4A373]">task</span>
                  Tasks Data CSV
                </span>
                <span className="bg-[#5C4D42] text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {tasks.length} rows
                </span>
              </div>
            </button>

            <button
              onClick={handleDownloadAttendanceCSV}
              className="bg-[#8B5E3C] hover:bg-[#6f4a2f] text-white p-3 rounded-xl text-xs font-bold flex flex-col items-start gap-1 transition-all shadow-sm hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#F3E9DC]">badge</span>
                  Attendance Ledger CSV
                </span>
                <span className="bg-[#6f4a2f] text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {attendanceLogs.length} rows
                </span>
              </div>
            </button>

            <button
              onClick={handleDownloadCombinedCSV}
              className="bg-[#606C38] hover:bg-[#4d572d] text-white p-3 rounded-xl text-xs font-bold flex flex-col items-start gap-1 transition-all shadow-sm hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-200">dataset</span>
                  Full Combined CSV
                </span>
                <span className="bg-[#4d572d] text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {tasks.length + attendanceLogs.length} total
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
