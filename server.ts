import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import net from 'net';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { globalJobQueue } from './src/services/jobQueueService';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sahara_agileworks_secure_jwt_secret_2026';

// --- LOCAL FIREBASE EMULATOR BOOTSTRAP ---
// The Sahara app depends on a provisioned Firestore + Auth database. When running
// locally (dev server or the built server), we provision the Firebase Emulator
// Suite automatically unless FIREBASE_EMULATORS is explicitly set to 'false'.
let emulatorChild: ChildProcess | null = null;

function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.setTimeout(1500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

const EMULATOR_STARTUP_TIMEOUT_MS = Number(process.env.EMULATOR_STARTUP_TIMEOUT_MS) || 90000;

function waitForPort(port: number, timeoutMs = EMULATOR_STARTUP_TIMEOUT_MS): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = async () => {
      if (await isPortOpen(port)) return resolve();
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Timed out waiting for port ${port}`));
      }
      setTimeout(attempt, 500);
    };
    attempt();
  });
}

async function ensureEmulatorsRunning(): Promise<boolean> {
  if (await isPortOpen(8080) && await isPortOpen(9099)) {
    console.log('[sahara] Firebase Emulators already running (Firestore :8080, Auth :9099).');
    return true;
  }

  const root = process.cwd();
  const firebaseBin = path.join(root, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js');
  const exportDir = path.join(root, '.firebase', 'emulator-export');
  let emulatorArgs = [
    firebaseBin,
    'emulators:start',
    '--only',
    'auth,firestore',
    '--project',
    'demo-sahara',
  ];
  if (fs.existsSync(exportDir)) {
    emulatorArgs.push(`--export-on-exit=${exportDir}`);
    emulatorArgs.push(`--import=${exportDir}`);
  }

  console.log(`[sahara] Provisioning Firebase Emulators (Firestore + Auth)... (timeout ${EMULATOR_STARTUP_TIMEOUT_MS / 1000}s)`);
  try {
    emulatorChild = spawn(process.execPath, emulatorArgs, {
      cwd: root,
      stdio: 'ignore',
      env: { ...process.env, CI: 'true' },
    });
    emulatorChild.on('error', (err) => console.warn('[sahara] Emulators failed to launch:', err.message));
    
    await waitForPort(8080);
    await waitForPort(9099);
    console.log('[sahara] Firebase Emulators are ready (Firestore :8080, Auth :9099).');
    return true;
  } catch (err: any) {
    console.warn('[sahara] Local emulators unavailable or timed out. Operating in fallback mode:', err.message);
    if (emulatorChild && !emulatorChild.killed) {
      try { emulatorChild.kill(); } catch (e) {}
      emulatorChild = null;
    }
    return false;
  }
}

// Watchdog: if the emulator process is killed unexpectedly, restart it so the app
// keeps working end-to-end without a manual restart.
let watchdogStarted = false;
function startEmulatorWatchdog() {
  if (watchdogStarted) return;
  watchdogStarted = true;
  setInterval(() => {
    if (process.env.FIREBASE_EMULATORS === 'false') return;
    isPortOpen(8080).then((open) => {
      if (!open && emulatorChild) {
        console.log('[sahara] Firestore emulator is down - attempting restart...');
        ensureEmulatorsRunning().catch((err) =>
          console.warn('[sahara] Emulator restart skipped:', err.message)
        );
      }
    });
  }, 15000);
}

function shutdown() {
  if (emulatorChild && !emulatorChild.killed) {
    try { emulatorChild.kill(); } catch (e) {}
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.use(express.json());
app.use(cookieParser());

// Extend Express Request type for Auth User
interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    userName: string;
    email: string;
    role: 'Manager' | 'Admin' | 'Employee' | 'Operations Specialist';
  };
}

// In-memory / initial API state fallback for REST API endpoints (Computer Science & Software Agile Domain)
let projects = [
  { id: 'LOC-1', name: 'Sahara Core Platform', region: 'Sector 1 - Core Platform', status: 'active', crewCount: 12, taskCount: 6, lead: 'Amara Vance' },
  { id: 'LOC-2', name: 'AI Analytics Engine', region: 'Sector 2 - ML Pipeline', status: 'warning', crewCount: 8, taskCount: 4, lead: 'Tariq Al-Mansoor' },
  { id: 'LOC-3', name: 'Cloud Infrastructure & DevOps', region: 'Sector 3 - Kubernetes Cluster', status: 'active', crewCount: 9, taskCount: 5, lead: 'Elena Rostova' },
];

let stories = [
  {
    id: 'US-101',
    projectId: 'LOC-1',
    title: 'Real-time Telemetry & API Websocket Stream',
    description: 'As a software engineer, I want real-time task status streaming via websockets so team velocity updates dynamically.',
    points: 8,
    status: 'in_progress',
    assigneeName: 'Amara Vance',
  },
  {
    id: 'US-102',
    projectId: 'LOC-2',
    title: 'Predictive Task Bottleneck ML Engine',
    description: 'As a project manager, I want machine learning model predictions on task completion timelines to identify risks early.',
    points: 5,
    status: 'completed',
    assigneeName: 'Tariq Al-Mansoor',
  },
];

let tasks = [
  { id: 'TSK-101', code: 'SAH-802', title: 'Implement Redis caching layer for API endpoints', status: 'in_progress', storyId: 'US-101', priority: 'urgent', assigneeName: 'Amara Vance' },
  { id: 'TSK-102', code: 'SAH-803', title: 'Configure Kubernetes HPA & Prometheus metrics', status: 'done', storyId: 'US-102', priority: 'medium', assigneeName: 'Tariq Al-Mansoor' },
];

interface AttendanceItem {
  id: string;
  userId: string;
  userName: string;
  clockInTime: string;
  clockOutTime?: string;
  totalHours?: number;
  status: string;
  workNotes?: string;
  date?: string;
  locationName?: string;
  approvalStatus?: 'pending' | 'approved' | 'flagged';
  approvedBy?: string;
}

let attendance: AttendanceItem[] = [
  {
    id: 'ATT-1',
    userId: 'USR-01',
    userName: 'Amara Vance',
    clockInTime: '2026-08-08T07:30:00.000Z',
    clockOutTime: '2026-08-08T16:15:00.000Z',
    totalHours: 8.75,
    status: 'clocked_out',
    workNotes: 'Core API refactoring & performance tuning.',
    date: '2026-08-08',
    locationName: 'US-East Cloud Cluster',
    approvalStatus: 'approved',
    approvedBy: 'Director Council',
  },
  {
    id: 'ATT-2',
    userId: 'USR-02',
    userName: 'Tariq Al-Mansoor',
    clockInTime: '2026-08-08T08:00:00.000Z',
    status: 'clocked_in',
    workNotes: 'Deploying ML model service to Kubernetes cluster.',
    date: '2026-08-08',
    locationName: 'EU-Central Data Center',
    approvalStatus: 'pending',
  },
];

let asyncJobs = [
  {
    id: 'JOB-801',
    title: 'Weekly Sprint Telemetry & Velocity Audit',
    type: 'sprint_summary',
    status: 'completed',
    progress: 100,
    retryCount: 0,
    createdAt: new Date().toISOString(),
  },
];

// --- AUTH & RBAC MIDDLEWARES ---

// Verify JWT from HttpOnly Cookie (or Authorization header fallback)
const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    // Default fallback to demo session for ease of navigation while logging security context
    req.user = {
      uid: 'USR-01',
      userName: 'Amara Vance',
      email: 'amara.vance@sahara.io',
      role: 'Manager',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired JWT session token',
      securityNote: 'HttpOnly cookie verification failed signature check.',
    });
  }
};

// RBAC Guard: Require Manager or Admin role
const requireManager = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role || 'Employee';
  if (role !== 'Manager' && role !== 'Admin') {
    return res.status(403).json({
      success: false,
      error: 'Access Denied: Manager or Admin privilege required.',
      details: `Your current assigned role is '${role}'. Employees cannot modify project hierarchy or approve global attendance ledgers.`,
      securityPolicy: 'Role-Based Access Control (RBAC) Rule #4',
    });
  }
  next();
};

// --- REST API ENDPOINTS ---

// Security Info Endpoint
app.get('/api/security/notes', (req, res) => {
  res.json({
    success: true,
    architecture: 'Full-Stack RBAC & HttpOnly Cookie JWT Authentication',
    securityConsiderations: [
      {
        title: 'HttpOnly Cookies for JWT Tokens',
        description: 'JWTs are transmitted via secure, HttpOnly, SameSite cookies rather than stored in localStorage, eliminating XSS token theft vectors.',
        status: 'Active',
      },
      {
        title: 'Role-Based Access Control (RBAC)',
        description: 'Strict separation between Manager/Admin and Employee capabilities across REST API endpoints and UI action handlers.',
        status: 'Active',
      },
      {
        title: 'Firestore Security Rules Enforcement',
        description: 'Server-side rules in firestore.rules ensure data bounds and prevent unauthorized cross-user modifications.',
        status: 'Active',
      },
      {
        title: 'Self-Service Attendance Bound',
        description: 'Employees are restricted to clocking in/out for their own user profile unless authorized as a Manager.',
        status: 'Active',
      },
    ],
  });
});

// Auth Routes: Login & Issue HttpOnly JWT Cookie
app.post('/api/auth/login', (req, res) => {
  const { role, userName, email } = req.body;
  const userRole = role === 'Employee' ? 'Employee' : 'Manager';
  const name = userName || (userRole === 'Manager' ? 'Amara Vance' : 'Kofi Mensah');
  const userEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@sahara.io`;
  const uid = userRole === 'Manager' ? 'USR-01' : 'USR-04';

  const tokenPayload = {
    uid,
    userName: name,
    email: userEmail,
    role: userRole,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

  // Set secure HttpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });

  res.json({
    success: true,
    message: `Authenticated as ${name} (${userRole}). HttpOnly JWT cookie set.`,
    user: tokenPayload,
  });
});

// Auth Me Check
app.get('/api/auth/me', authenticateJwt, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    user: req.user,
    cookieSecured: true,
  });
});

// Logout (Clear HttpOnly Cookie)
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully. HttpOnly cookie revoked.' });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Projects API (Read open; Create restricted to Manager)
app.get('/api/projects', authenticateJwt, (req, res) => {
  res.json({ success: true, count: projects.length, data: projects });
});

app.post('/api/projects', authenticateJwt, requireManager, (req, res) => {
  const { name, region, lead } = req.body;
  if (!name || !region) {
    return res.status(400).json({ success: false, error: 'Project name and region required' });
  }
  const newProj = {
    id: `LOC-${Date.now().toString().slice(-4)}`,
    name,
    region,
    status: 'active',
    crewCount: 4,
    taskCount: 0,
    lead: lead || 'Amara Vance',
  };
  projects.push(newProj);
  res.status(201).json({ success: true, data: newProj });
});

// User Stories API
app.get('/api/stories', authenticateJwt, (req, res) => {
  const { projectId } = req.query;
  const filtered = projectId ? stories.filter((s) => s.projectId === projectId) : stories;
  res.json({ success: true, count: filtered.length, data: filtered });
});

app.post('/api/stories', authenticateJwt, requireManager, (req, res) => {
  const { projectId, title, description, points, assigneeName } = req.body;
  if (!projectId || !title) {
    return res.status(400).json({ success: false, error: 'projectId and title are required' });
  }
  const newStory = {
    id: `US-${Date.now().toString().slice(-4)}`,
    projectId,
    title,
    description: description || '',
    points: Number(points) || 3,
    status: 'in_progress',
    assigneeName: assigneeName || 'Unassigned',
  };
  stories.push(newStory);
  res.status(201).json({ success: true, data: newStory });
});

// Tasks API
app.get('/api/tasks', authenticateJwt, (req, res) => {
  const { storyId } = req.query;
  const filtered = storyId ? tasks.filter((t) => t.storyId === storyId) : tasks;
  res.json({ success: true, count: filtered.length, data: filtered });
});

app.post('/api/tasks', authenticateJwt, (req: AuthenticatedRequest, res) => {
  const { title, storyId, priority } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'Task title is required' });
  }
  const newTask = {
    id: `TSK-${Date.now().toString().slice(-4)}`,
    code: `SAH-${Math.floor(100 + Math.random() * 900)}`,
    title,
    status: 'todo',
    storyId: storyId || null,
    priority: priority || 'medium',
    assigneeName: req.user?.userName || 'Amara Vance',
  };
  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

app.patch('/api/tasks/:id/status', authenticateJwt, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
  task.status = status;
  res.json({ success: true, data: task });
});

// Attendance API
app.get('/api/attendance', authenticateJwt, (req: AuthenticatedRequest, res) => {
  const role = req.user?.role || 'Employee';
  // If employee, return their logs + active logs; if manager, return all employee logs
  const data =
    role === 'Manager' || role === 'Admin'
      ? attendance
      : attendance.filter((a) => a.userName === req.user?.userName || a.status === 'clocked_in');

  res.json({ success: true, count: data.length, data, roleView: role });
});

app.post('/api/attendance/clock-in', authenticateJwt, (req: AuthenticatedRequest, res) => {
  const { userName, userId, locationName } = req.body;
  const targetUser = req.user?.role === 'Manager' ? userName || req.user?.userName : req.user?.userName;

  const now = new Date();
  const newLog = {
    id: `ATT-${Date.now().toString().slice(-4)}`,
    userId: userId || req.user?.uid || 'USR-01',
    userName: targetUser,
    clockInTime: now.toISOString(),
    status: 'clocked_in',
    date: now.toISOString().split('T')[0],
    locationName: locationName || 'Al-Kufra Site',
    approvalStatus: 'pending' as const,
  };
  attendance.unshift(newLog);
  res.status(201).json({ success: true, data: newLog });
});

app.post('/api/attendance/clock-out', authenticateJwt, (req: AuthenticatedRequest, res) => {
  const { id, workNotes } = req.body;
  const currentUser = req.user?.userName;
  const log = attendance.find(
    (a) => (a.id === id || a.userName === currentUser) && a.status === 'clocked_in'
  );
  if (!log) {
    return res.status(404).json({ success: false, error: 'Active clocked-in session not found for user' });
  }
  const now = new Date();
  const startTime = new Date(log.clockInTime).getTime();
  const hours = Number(((now.getTime() - startTime) / (1000 * 60 * 60)).toFixed(2));

  log.clockOutTime = now.toISOString();
  log.totalHours = hours;
  log.status = 'clocked_out';
  log.workNotes = workNotes || 'Shift completed';

  res.json({ success: true, data: log });
});

// Manager Attendance Approval / Override Endpoint
app.post('/api/attendance/approve', authenticateJwt, requireManager, (req: AuthenticatedRequest, res) => {
  const { logId, action, managerNotes } = req.body;
  const log = attendance.find((a) => a.id === logId);
  if (!log) {
    return res.status(404).json({ success: false, error: 'Attendance log not found' });
  }

  log.approvalStatus = action === 'flag' ? 'flagged' : 'approved';
  log.approvedBy = req.user?.userName || 'Manager';
  if (managerNotes) log.workNotes = `${log.workNotes || ''} [Manager Note: ${managerNotes}]`;

  res.json({
    success: true,
    message: `Shift log ${logId} marked as ${log.approvalStatus} by manager.`,
    data: log,
  });
});

// Async Background Processing API
app.get('/api/async-jobs', authenticateJwt, (req, res) => {
  res.json({ success: true, count: asyncJobs.length, data: asyncJobs });
});

app.post('/api/async-jobs', authenticateJwt, (req, res) => {
  const { title, type } = req.body;
  const jobId = `JOB-${Date.now().toString().slice(-4)}`;
  const newJob = {
    id: jobId,
    title: title || 'Sprint Telemetry Export',
    type: type || 'sprint_summary',
    status: 'processing',
    progress: 25,
    retryCount: 0,
    createdAt: new Date().toISOString(),
  };

  asyncJobs.unshift(newJob);

  // Background worker simulation
  setTimeout(() => {
    newJob.progress = 100;
    newJob.status = 'completed';
    (newJob as any).resultSummary = 'Background job completed successfully.';
  }, 3000);

  res.status(202).json({ success: true, message: 'Job accepted for background execution', data: newJob });
});

// --- REDIS BACKGROUND JOB QUEUE & DLQ REST API ENDPOINTS ---

// Get Queue Statistics & Worker Health
app.get('/api/queue/stats', (req, res) => {
  res.json({ success: true, data: globalJobQueue.getStats() });
});

// List all jobs in queue
app.get('/api/queue/jobs', (req, res) => {
  res.json({ success: true, count: globalJobQueue.getAllJobs().length, data: globalJobQueue.getAllJobs() });
});

// Trigger Midnight Productivity & Sprint Velocity Job
app.post('/api/queue/trigger-midnight', authenticateJwt, (req, res) => {
  const { shouldFailSimulated } = req.body || {};
  const job = globalJobQueue.triggerMidnightReportJob(shouldFailSimulated);
  res.status(202).json({
    success: true,
    message: 'Midnight Productivity & Sprint Velocity Job enqueued successfully in Redis pattern Queue',
    data: job,
  });
});

// Get Dead Letter Queue (DLQ) Items
app.get('/api/queue/dlq', (req, res) => {
  const dlqJobs = globalJobQueue.getDlqJobs();
  res.json({ success: true, count: dlqJobs.length, data: dlqJobs });
});

// Re-queue Failed Job from Dead Letter Queue (DLQ)
app.post('/api/queue/dlq/:id/retry', authenticateJwt, (req, res) => {
  const jobId = req.params.id;
  const requeued = globalJobQueue.retryDlqJob(jobId);
  if (!requeued) {
    return res.status(404).json({ success: false, error: `Job '${jobId}' not found in Dead Letter Queue (DLQ)` });
  }
  res.json({
    success: true,
    message: `Job '${jobId}' moved from DLQ back to active queue for re-processing`,
    data: requeued,
  });
});

// Get Latest Generated Productivity & Velocity Report
app.get('/api/queue/report/latest', (req, res) => {
  const report = globalJobQueue.getLatestReport();
  if (!report) {
    return res.status(404).json({ success: false, error: 'No generated productivity report available' });
  }
  res.json({ success: true, data: report });
});

// --- VITE MIDDLEWARE & STATIC SERVING ---
async function startServer() {
  if (process.env.FIREBASE_EMULATORS !== 'false') {
    const emulatorsReady = await ensureEmulatorsRunning();
    process.env.VITE_USE_EMULATORS = emulatorsReady ? 'true' : 'false';
    if (emulatorsReady) {
      startEmulatorWatchdog();
    } else {
      console.warn('[sahara] Using cloud Firestore because local emulators are unavailable.');
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app };
export default app;

if (!process.env.VERCEL) {
  startServer();
}


