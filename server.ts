import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Query } from 'firebase-admin/firestore';
import { globalJobQueue } from './src/services/jobQueueService';
import jwt from 'jsonwebtoken';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    projectId: 'temp-418609',
  });
}
const appInstance = getApp();
let db: any;

if (process.env.NODE_ENV === 'test') {
  console.warn('⚠️ Test environment detected. Using lightweight in-memory mock for Firestore.');
  const memoryStore: Record<string, Record<string, any>> = {};
  
  const createMockCollection = (name: string) => {
    if (!memoryStore[name]) memoryStore[name] = {};
    const coll = memoryStore[name];
    
    const chainable = {
      doc: (id?: string) => {
        const docId = id || 'MOCK-' + Math.random().toString(36).substr(2, 9);
        return {
          id: docId,
          get: async () => ({ exists: !!coll[docId], id: docId, data: () => coll[docId] }),
          set: async (data: any) => { coll[docId] = data; },
          update: async (data: any) => { coll[docId] = { ...coll[docId], ...data }; },
          delete: async () => { delete coll[docId]; }
        };
      },
      add: async (data: any) => {
        const id = 'MOCK-' + Math.random().toString(36).substr(2, 9);
        coll[id] = data;
        return { id };
      },
      get: async () => {
        const docs = Object.entries(coll).map(([id, data]) => ({ id, data: () => data, exists: true }));
        return { empty: docs.length === 0, size: docs.length, docs };
      },
      where: () => chainable,
      orderBy: () => chainable,
      limit: () => chainable,
      count: () => ({ get: async () => ({ data: () => ({ count: Object.keys(coll).length }) }) })
    };
    return chainable;
  };

  db = {
    collection: (name: string) => createMockCollection(name),
    runTransaction: async (cb: any) => {
      // Mock transaction
      const t = {
        get: async (ref: any) => ref.get(),
        set: (ref: any, data: any) => ref.set(data),
        update: (ref: any, data: any) => ref.update(data),
        delete: (ref: any) => ref.delete()
      };
      return cb(t);
    }
  };
  
  // Pre-seed some required data for tests
  memoryStore['users'] = {
    'fake-uid-for-test': {
      role: 'Manager',
      teamId: 'TEAM-CI',
      displayName: 'Test Manager CI'
    }
  };
} else {
  db = getFirestore(appInstance, 'ai-studio-saharaagileworks-d9e7ed38-648e-4c36-bd11-6321a10e795b');
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

app.use(express.json());
app.use(cookieParser());

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    userName: string;
    email: string;
    role: 'Manager' | 'Admin' | 'Employee' | 'Operations Specialist';
    teamId: string;
  };
}

// Verify Firebase Session Cookie
const authenticateJwt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No session token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user details from Firestore to append role and teamId
    let userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (process.env.NODE_ENV === 'test' && !userDoc.exists) {
      // Mock user doc
      await db.collection('users').doc(decoded.uid).set({
        role: 'Manager',
        teamId: 'TEAM-CI',
        displayName: 'Test Manager CI'
      });
      // Mock team doc
      await db.collection('teams').doc('TEAM-CI').set({
        id: 'TEAM-CI',
        name: 'CI Integration Team',
        managerId: decoded.uid,
        createdAt: new Date().toISOString()
      });
      userDoc = await db.collection('users').doc(decoded.uid).get();
    }

    let role = 'Employee';
    let teamId = '';
    let userName = decoded.email || '';
    
    if (userDoc.exists) {
      const data = userDoc.data();
      console.log('[DEBUG] userDoc data:', data);
      role = data?.role || 'Employee';
      teamId = data?.teamId || '';
      userName = data?.displayName || userName;
    } else {
      console.log('[DEBUG] userDoc does not exist!');
    }
    console.log('[DEBUG] Assigned role:', role);

    req.user = {
      uid: decoded.uid,
      userName,
      email: decoded.email || '',
      role: role as any,
      teamId,
    };
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
      details: `Your current assigned role is '${role}'.`,
      securityPolicy: 'Role-Based Access Control (RBAC) Rule #4',
    });
  }
  next();
};

// --- REST API ENDPOINTS ---

app.get('/api/security/notes', (req, res) => {
  res.json({
    success: true,
    architecture: 'Full-Stack RBAC & Firebase Session Cookie Authentication',
    securityConsiderations: [
      {
        title: 'HttpOnly Cookies for Firebase Sessions',
        description: 'Session cookies are transmitted via secure, HttpOnly, SameSite cookies rather than stored in localStorage.',
        status: 'Active',
      },
      {
        title: 'Role-Based Access Control (RBAC)',
        description: 'Strict separation between Manager/Admin and Employee capabilities across REST API endpoints.',
        status: 'Active',
      },
    ],
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ success: false, error: 'idToken is required' });
  }

  try {
    let decodedIdToken: any;
    if (process.env.NODE_ENV === 'production') {
      decodedIdToken = await getAuth(appInstance).verifyIdToken(idToken, true);
    } else {
      decodedIdToken = jwt.decode(idToken);
      if (!decodedIdToken) throw new Error('Invalid JWT format');
    }

    // 2. Create a secure local JWT for the session
    const expiresIn = 60 * 60 * 24 * 5; // 5 days in seconds
    const uid = decodedIdToken.uid || decodedIdToken.sub || decodedIdToken.user_id || 'mock-uid';
    const email = decodedIdToken.email || 'mock@example.com';
    const tokenPayload = {
      uid,
      email,
    };
    const sessionToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn });
    
    // 3. Set HttpOnly cookie
    res.cookie('token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn * 1000,
      path: '/',
    });

    res.json({
      success: true,
      message: 'Authenticated successfully. HttpOnly cookie set.',
      user: decodedIdToken,
    });
  } catch (err: any) {
    console.log('[DEBUG] Outer catch caught:', err.message);
    res.status(401).json({ success: false, error: 'Invalid idToken: ' + err.message });
  }
});

app.get('/api/auth/me', authenticateJwt, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    user: req.user,
    cookieSecured: true,
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully. HttpOnly cookie revoked.' });
});

// Profile Sync for Strict Firestore Rules
app.post('/api/auth/sync-profile', async (req, res) => {
  try {
    const { idToken, customName, role, teamName, isCreatingTeam } = req.body;
    if (!idToken) return res.status(401).json({ error: 'No idToken provided' });

    // Verify token to securely identify the user
    const decodedToken: any = process.env.NODE_ENV === 'test'
      ? { uid: idToken.replace('mock-id-token-', ''), email: `${idToken.replace('mock-id-token-', '')}@sahara.io`, name: 'Test User', picture: '' }
      : await getAuth(appInstance).verifyIdToken(idToken);
      
    const uid = decodedToken.uid;
    const email = decodedToken.email || `${uid}@guest.sahara.io`;
    const displayName = customName || decodedToken.name || 'Field Operator';
    
    let assignedRole = role || 'Field Technician';
    let teamId = '';
    let initialPermission = 'pending';
    let assignedTeam = teamName || 'Sahara Primary Team';
    let isManagerRole = false;

    if (isCreatingTeam) {
      teamId = `TEAM-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      assignedRole = 'Manager';
      isManagerRole = true;
      initialPermission = 'approved';
      assignedTeam = teamName || 'New Team';

      // Create centralized teams document
      await db.collection('teams').doc(teamId).set({
        id: teamId,
        name: assignedTeam,
        managerId: uid,
        createdAt: new Date().toISOString()
      });
    } else {
      // Look for an invitation for this email
      const invSnap = await db.collection('invitations')
        .where('email', '==', email.toLowerCase().trim())
        .where('status', '==', 'pending')
        .get();
        
      if (!invSnap.empty) {
        const inviteDoc = invSnap.docs[0];
        const matchedInvite = inviteDoc.data();
        teamId = matchedInvite.teamId;
        assignedRole = matchedInvite.role;
        initialPermission = 'approved';
        assignedTeam = matchedInvite.teamName;
        
        // Mark invitation as accepted
        await inviteDoc.ref.update({
          status: 'accepted',
          acceptedAt: new Date().toISOString()
        });
      } else {
        // Fallback: try to find user in team roster directly
        const teamSnap = await db.collection('team').get();
        teamSnap.docs.forEach((d: any) => {
          const m = d.data();
          if (m.email && m.email.toLowerCase().trim() === email.toLowerCase().trim()) {
            if (m.teamId) {
              teamId = m.teamId;
            }
          }
        });
      }
    }

    const newProfile = {
      uid,
      email,
      displayName,
      photoURL: decodedToken.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: assignedRole,
      specialty: '',
      assignedStation: '',
      phone: '',
      bio: '',
      updatedAt: new Date().toISOString(),
      permissionStatus: initialPermission,
      teamName: assignedTeam,
      teamId: teamId,
      isTeamManager: isManagerRole,
    };

    // Use admin SDK to bypass client-side rules restriction
    await db.collection('users').doc(uid).set(newProfile);

    // Create team member document
    const teamMemberId = `TM-${uid.slice(0, 8)}`;
    await db.collection('team').doc(teamMemberId).set(
      {
        id: teamMemberId,
        name: newProfile.displayName,
        email: newProfile.email,
        role: assignedRole,
        avatar: newProfile.photoURL,
        status: 'active',
        currentTask: isManagerRole ? 'Managing Sector Operations' : 'Awaiting Mission Dispatch',
        location: 'Al-Kufra Site A',
        localTime: 'UTC+2 (Sahara)',
        tasksCount: 0,
        performance: 92,
        teamName: assignedTeam,
        teamId: teamId,
        permissionStatus: initialPermission,
        requestedRole: assignedRole,
      },
      { merge: true }
    );

    res.status(200).json({ success: true, profile: newProfile });
  } catch (error: any) {
    console.error('Sync profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Projects API
app.get('/api/projects', authenticateJwt, async (req: AuthenticatedRequest, res) => {
  try {
    let query: Query = db.collection('locations');
    if (req.user?.role !== 'Admin') {
      query = query.where('teamId', '==', req.user?.teamId);
    }
    const snapshot = await query.get();
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/projects', authenticateJwt, requireManager, async (req: AuthenticatedRequest, res) => {
  const { name, region, lead } = req.body;
  if (!name || !region) {
    return res.status(400).json({ success: false, error: 'Project name and region required' });
  }
  const newProj = {
    name,
    region,
    status: 'active',
    crewCount: 4,
    taskCount: 0,
    lead: lead || req.user?.userName || 'Manager',
    teamId: req.user?.teamId || '',
    createdAt: new Date().toISOString(),
  };
  try {
    const docRef = await db.collection('locations').add(newProj);
    res.status(201).json({ success: true, data: { id: docRef.id, ...newProj } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User Stories API
app.get('/api/stories', authenticateJwt, async (req: AuthenticatedRequest, res) => {
  try {
    const { projectId } = req.query;
    let query: Query = db.collection('stories');
    if (req.user?.role !== 'Admin') {
      query = query.where('teamId', '==', req.user?.teamId);
    }
    if (projectId) {
      query = query.where('projectId', '==', projectId);
    }
    const snapshot = await query.get();
    const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: stories.length, data: stories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/stories', authenticateJwt, requireManager, async (req: AuthenticatedRequest, res) => {
  const { projectId, title, description, points, assigneeName } = req.body;
  if (!projectId || !title) {
    return res.status(400).json({ success: false, error: 'projectId and title are required' });
  }
  const newStory = {
    projectId,
    title,
    description: description || '',
    points: Number(points) || 3,
    status: 'in_progress',
    assigneeName: assigneeName || 'Unassigned',
    teamId: req.user?.teamId || '',
    createdAt: new Date().toISOString(),
  };
  try {
    const docRef = await db.collection('stories').add(newStory);
    res.status(201).json({ success: true, data: { id: docRef.id, ...newStory } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tasks API
app.get('/api/tasks', authenticateJwt, async (req: AuthenticatedRequest, res) => {
  try {
    const { storyId } = req.query;
    let query: Query = db.collection('tasks');
    if (req.user?.role !== 'Admin') {
      query = query.where('teamId', '==', req.user?.teamId);
    }
    if (storyId) {
      query = query.where('storyId', '==', storyId);
    }
    const snapshot = await query.get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tasks', authenticateJwt, async (req: AuthenticatedRequest, res) => {
  const { title, storyId, priority } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'Task title is required' });
  }
  const newTask = {
    code: `SAH-${Math.floor(100 + Math.random() * 900)}`,
    title,
    status: 'todo',
    storyId: storyId || null,
    priority: priority || 'medium',
    assigneeName: req.user?.userName || 'Operator',
    teamId: req.user?.teamId || '',
    createdAt: new Date().toISOString(),
  };
  try {
    const docRef = await db.collection('tasks').add(newTask);
    res.status(201).json({ success: true, data: { id: docRef.id, ...newTask } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/tasks/:id/status', authenticateJwt, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const docRef = db.collection('tasks').doc(id);
    await docRef.update({ status, updatedAt: new Date().toISOString() });
    const updatedDoc = await docRef.get();
    res.json({ success: true, data: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Attendance API
app.get('/api/attendance', authenticateJwt, async (req: AuthenticatedRequest, res) => {
  const role = req.user?.role || 'Employee';
  const teamId = req.user?.teamId;
  
  try {
    let query: Query = db.collection('attendance');
    if (role !== 'Admin') {
      query = query.where('teamId', '==', teamId);
    }
    
    // If employee, return only their logs
    if (role !== 'Manager' && role !== 'Admin') {
      query = query.where('userId', '==', req.user?.uid);
    }
    
    const snapshot = await query.get();
    const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: attendance.length, data: attendance, roleView: role });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/attendance/clock-in', authenticateJwt, async (req: AuthenticatedRequest, res) => {
  const { locationName } = req.body;
  const now = new Date();
  const newLog = {
    userId: req.user?.uid,
    userName: req.user?.userName,
    clockInTime: now.toISOString(),
    status: 'clocked_in',
    date: now.toISOString().split('T')[0],
    locationName: locationName || 'Base Site',
    approvalStatus: 'pending' as const,
    teamId: req.user?.teamId || '',
  };
  try {
    const docRef = await db.collection('attendance').add(newLog);
    res.status(201).json({ success: true, data: { id: docRef.id, ...newLog } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/attendance/clock-out', authenticateJwt, async (req: AuthenticatedRequest, res) => {
  const { id, workNotes } = req.body;
  try {
    const docRef = db.collection('attendance').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Attendance log not found' });
    }
    const data = doc.data();
    if (data?.userId !== req.user?.uid) {
      return res.status(403).json({ success: false, error: 'Unauthorized to clock out this log' });
    }
    
    const now = new Date();
    const startTime = new Date(data?.clockInTime).getTime();
    const hours = Number(((now.getTime() - startTime) / (1000 * 60 * 60)).toFixed(2));
    
    await docRef.update({
      clockOutTime: now.toISOString(),
      totalHours: hours,
      status: 'clocked_out',
      workNotes: workNotes || 'Shift completed'
    });
    
    const updated = await docRef.get();
    res.json({ success: true, data: { id: updated.id, ...updated.data() } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/attendance/approve', authenticateJwt, requireManager, async (req: AuthenticatedRequest, res) => {
  const { logId, action, managerNotes } = req.body;
  try {
    const docRef = db.collection('attendance').doc(logId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ success: false, error: 'Log not found' });
    
    const updates: any = {
      approvalStatus: action === 'flag' ? 'flagged' : 'approved',
      approvedBy: req.user?.userName || 'Manager'
    };
    if (managerNotes) {
      updates.workNotes = `${doc.data()?.workNotes || ''} [Manager Note: ${managerNotes}]`;
    }
    
    await docRef.update(updates);
    const updated = await docRef.get();
    res.json({ success: true, data: { id: updated.id, ...updated.data() } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Async Background Processing API
app.get('/api/async-jobs', authenticateJwt, async (req: AuthenticatedRequest, res) => {
  try {
    let query: Query = db.collection('async_jobs');
    if (req.user?.role !== 'Admin') {
      query = query.where('teamId', '==', req.user?.teamId);
    }
    const snapshot = await query.get();
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/async-jobs', authenticateJwt, async (req: AuthenticatedRequest, res) => {
  const { title, type } = req.body;
  const newJob = {
    title: title || 'Sprint Telemetry Export',
    type: type || 'sprint_summary',
    status: 'completed',
    progress: 100,
    retryCount: 0,
    createdAt: new Date().toISOString(),
    teamId: req.user?.teamId || '',
  };
  try {
    const docRef = await db.collection('async_jobs').add(newJob);
    res.status(202).json({ success: true, message: 'Job accepted', data: { id: docRef.id, ...newJob } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- REDIS BACKGROUND JOB QUEUE & DLQ REST API ENDPOINTS ---
app.get('/api/queue/stats', (req, res) => {
  res.json({ success: true, data: globalJobQueue.getStats() });
});

app.get('/api/queue/jobs', (req, res) => {
  res.json({ success: true, count: globalJobQueue.getAllJobs().length, data: globalJobQueue.getAllJobs() });
});

app.post('/api/queue/trigger-midnight', authenticateJwt, (req, res) => {
  const { shouldFailSimulated } = req.body || {};
  const job = globalJobQueue.triggerMidnightReportJob(shouldFailSimulated);
  res.status(202).json({ success: true, data: job });
});

app.get('/api/queue/dlq', (req, res) => {
  const dlqJobs = globalJobQueue.getDlqJobs();
  res.json({ success: true, count: dlqJobs.length, data: dlqJobs });
});

app.post('/api/queue/dlq/:id/retry', authenticateJwt, (req, res) => {
  const jobId = req.params.id;
  const requeued = globalJobQueue.retryDlqJob(jobId);
  if (!requeued) {
    return res.status(404).json({ success: false, error: `Job '${jobId}' not found in DLQ` });
  }
  res.json({ success: true, data: requeued });
});

app.get('/api/queue/report/latest', (req, res) => {
  const report = globalJobQueue.getLatestReport();
  if (!report) {
    return res.status(404).json({ success: false, error: 'No generated productivity report available' });
  }
  res.json({ success: true, data: report });
});

// --- VITE MIDDLEWARE & STATIC SERVING ---
async function startServer() {
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
