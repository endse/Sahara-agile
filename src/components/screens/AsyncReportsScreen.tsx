import React, { useState } from 'react';
import { AsyncJob, Task, AttendanceLog } from '../../types';
import { saveAsyncJob } from '../../services/firestoreService';

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
  const [selectedJobType, setSelectedJobType] = useState<AsyncJob['type']>('sprint_summary');
  const [simulatingFailures, setSimulatingFailures] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

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
    const filename = `sahara_attendance_report_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(filename, headers, rows);
  };

  const handleDownloadCombinedCSV = () => {
    const headers = [
      'Record Type',
      'ID / Code',
      'Entity Title / Employee Name',
      'Status / State',
      'Priority / User ID',
      'Progress / Total Hours',
      'Region / Work Notes',
      'Timestamp / Date',
    ];
    const taskRows = tasks.map((t) => [
      'TASK',
      t.code || t.id,
      t.title,
      t.status,
      t.priority,
      `${t.progress || 0}%`,
      t.region || t.assignee?.name || '',
      t.updatedAt || t.dueDate || '',
    ]);
    const attendanceRows = attendanceLogs.map((a) => [
      'ATTENDANCE',
      a.id,
      a.userName,
      a.status,
      a.userId,
      `${a.totalHours || 0} hrs`,
      a.workNotes || '',
      a.date || a.clockInTime || '',
    ]);
    const filename = `sahara_combined_operations_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(filename, headers, [...taskRows, ...attendanceRows]);
  };

  const handleDownloadJobCSV = (job: AsyncJob) => {
    if (job.type === 'attendance_audit') {
      handleDownloadAttendanceCSV();
    } else if (job.type === 'sprint_summary' || job.type === 'task_completion_export') {
      handleDownloadTasksCSV();
    } else {
      handleDownloadCombinedCSV();
    }
  };

  const handleTriggerJob = async () => {
    const jobId = `JOB-${Date.now().toString().slice(-4)}`;
    const titles = {
      sprint_summary: 'Weekly Sprint Telemetry & Progress Report',
      attendance_audit: 'Monthly Employee Attendance & Hours Audit',
      employee_worklog: 'Field Operator Task Completion Log Export',
      task_completion_export: 'Cross-Site Milestone Velocity Summary',
    };

    const newJob: AsyncJob = {
      id: jobId,
      title: titles[selectedJobType],
      type: selectedJobType,
      status: 'pending',
      progress: 0,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Step 1: Save Pending State
    await saveAsyncJob(newJob);

    // Step 2: Simulate Background Worker Processing with steps
    let currentProgress = 0;
    const interval = setInterval(async () => {
      currentProgress += 25;

      if (simulatingFailures && currentProgress === 50 && newJob.retryCount === 0) {
        clearInterval(interval);
        const failedJob: AsyncJob = {
          ...newJob,
          status: 'failed',
          progress: 50,
          errorReason: 'SatCom Link Timeout (504 Gateway Timeout) - Background queue queued for retry.',
        };
        await saveAsyncJob(failedJob);
        return;
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        const completedJob: AsyncJob = {
          ...newJob,
          status: 'completed',
          progress: 100,
          resultSummary: `Report successfully generated and compiled (${
            selectedJobType === 'attendance_audit' ? attendanceLogs.length + ' attendance' : tasks.length + ' task'
          } records compiled). CSV payload ready for export.`,
          completedAt: new Date().toISOString(),
        };
        await saveAsyncJob(completedJob);
      } else {
        const updatingJob: AsyncJob = {
          ...newJob,
          status: 'processing',
          progress: currentProgress,
        };
        await saveAsyncJob(updatingJob);
      }
    }, 1200);
  };

  const handleRetryJob = async (job: AsyncJob) => {
    const retriedJob: AsyncJob = {
      ...job,
      status: 'processing',
      progress: 10,
      retryCount: job.retryCount + 1,
      errorReason: undefined,
    };
    await saveAsyncJob(retriedJob);

    let currentProgress = 10;
    const interval = setInterval(async () => {
      currentProgress += 30;
      if (currentProgress >= 100) {
        clearInterval(interval);
        const completedJob: AsyncJob = {
          ...retriedJob,
          status: 'completed',
          progress: 100,
          resultSummary: `Retry #${retriedJob.retryCount} succeeded! CSV report generated at ${new Date().toLocaleTimeString()}.`,
          completedAt: new Date().toISOString(),
        };
        await saveAsyncJob(completedJob);
      } else {
        await saveAsyncJob({ ...retriedJob, progress: currentProgress });
      }
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FDF8F3] overflow-y-auto">
      <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Notification Toast */}
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

        {/* CSV Direct Data Export Card */}
        <div className="bg-[#EFE5D8] p-6 rounded-2xl border border-[#DECDB8] space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#3D3028] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B5E3C]">csv</span>
                Direct CSV Data Exports (Current Operations)
              </h3>
              <p className="text-xs text-[#8B5E3C]">
                Instantly export field operation datasets into structured CSV spreadsheets for audits and analysis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
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
              <span className="text-[10px] text-stone-300 font-normal">
                Export status, priority, assignees, & regions
              </span>
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
              <span className="text-[10px] text-amber-100 font-normal">
                Export shift logs, clock times, & hours worked
              </span>
            </button>

            <button
              onClick={handleDownloadCombinedCSV}
              className="bg-[#606C38] hover:bg-[#4d572d] text-white p-3 rounded-xl text-xs font-bold flex flex-col items-start gap-1 transition-all shadow-sm hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-200">
                    dataset
                  </span>
                  Full Combined Operations CSV
                </span>
                <span className="bg-[#4d572d] text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {tasks.length + attendanceLogs.length} total
                </span>
              </div>
              <span className="text-[10px] text-emerald-100 font-normal">
                Unified task & employee attendance summary
              </span>
            </button>
          </div>
        </div>

        {/* Trigger Controls Box */}
        <div className="bg-[#F3E9DC] p-6 rounded-2xl border border-[#E5D5C0] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#3D3028] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B5E3C]">play_circle</span>
                Dispatch Background Asynchronous Worker
              </h3>
              <p className="text-xs text-[#8B5E3C]">
                Generates heavy analytical reports and exports asynchronously without blocking UI interactions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-[#5C4D42] flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulatingFailures}
                  onChange={(e) => setSimulatingFailures(e.target.checked)}
                  className="rounded border-[#E5D5C0] text-[#8B5E3C] focus:ring-[#D4A373]"
                />
                <span>Simulate Network Retry/Failure</span>
              </label>

              <button
                onClick={handleTriggerJob}
                className="bg-[#606C38] hover:bg-[#4d572d] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-base">cloud_download</span>
                <span>Dispatch Job</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[#E5D5C0]/80">
            <label htmlFor="report-type-select" className="text-xs font-semibold text-[#5C4D42]">
              Job Workflow Type:
            </label>
            <select
              id="report-type-select"
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value as any)}
              className="bg-[#FDF8F3] border border-[#E5D5C0] text-xs font-medium text-[#3D3028] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
            >
              <option value="sprint_summary">Weekly Sprint Telemetry & Progress Report</option>
              <option value="attendance_audit">Monthly Employee Attendance & Hours Audit</option>
              <option value="employee_worklog">Field Operator Task Completion Log Export</option>
              <option value="task_completion_export">Cross-Site Milestone Velocity Summary</option>
            </select>
          </div>
        </div>

        {/* Architecture & Failure/Retry Explanation */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">engineering</span>
            Async Architecture & Failure Handling Design Notes
          </h4>
          <div className="text-xs text-amber-800 space-y-1 leading-relaxed">
            <p>
              • <strong>Decoupled Queue:</strong> UI writes initial job state (`pending`, `progress: 0`) to Firestore `async_jobs` collection.
            </p>
            <p>
              • <strong>State Transitions:</strong> `pending ➔ processing ➔ completed / failed`. Real-time listeners update UI instantly.
            </p>
            <p>
              • <strong>Failure & Retry Strategy:</strong> Intermittent connection or API timeouts transition status to `failed` with error reason. The user or background scheduler triggers `handleRetryJob` with incremented `retryCount`.
            </p>
          </div>
        </div>

        {/* Active & Historical Jobs List */}
        <div className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5D5C0] pb-3">
            <h3 className="text-sm font-bold text-[#3D3028] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8B5E3C]">queue</span>
              Background Jobs Queue ({asyncJobs.length})
            </h3>
            <span className="text-xs text-[#8B5E3C]">Real-time Firestore Subscriptions Active</span>
          </div>

          <div className="space-y-4">
            {asyncJobs.map((job) => (
              <div
                key={job.id}
                className="bg-[#F3E9DC]/40 border border-[#E5D5C0] rounded-xl p-4 space-y-3 hover:border-[#D4A373] transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#8B5E3C] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {job.id}
                      </span>
                      <span className="text-xs font-bold text-[#3D3028]">{job.title}</span>
                    </div>
                    <p className="text-[11px] text-[#8B5E3C]">
                      Created: {new Date(job.createdAt).toLocaleString()} | Type: {job.type}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                        job.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : job.status === 'processing'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          : job.status === 'failed'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {job.status.toUpperCase()} ({job.progress}%)
                    </span>

                    {job.status === 'failed' && (
                      <button
                        onClick={() => handleRetryJob(job)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        <span>Retry (Attempt #{job.retryCount + 1})</span>
                      </button>
                    )}

                    {job.status === 'completed' && (
                      <button
                        onClick={() => handleDownloadJobCSV(job)}
                        className="bg-[#606C38] hover:bg-[#4d572d] text-white text-xs px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span>Download CSV Result</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#E5D5C0] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      job.status === 'completed'
                        ? 'bg-emerald-600'
                        : job.status === 'failed'
                        ? 'bg-rose-600'
                        : 'bg-[#D4A373]'
                    }`}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>

                {/* Result or Error Banner */}
                {job.resultSummary && (
                  <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                    {job.resultSummary}
                  </p>
                )}
                {job.errorReason && (
                  <p className="text-xs text-rose-800 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                    🚨 <strong>Failure:</strong> {job.errorReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

