import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import pg from 'pg';
import { globalJobQueue } from './src/services/jobQueueService';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9OV6ndtMuxsj@ep-summer-frost-azhn3clc-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// Initialize PostgreSQL database tables
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        email TEXT,
        display_name TEXT,
        photo_url TEXT,
        role TEXT,
        specialty TEXT,
        assigned_station TEXT,
        phone TEXT,
        bio TEXT,
        updated_at TEXT,
        permission_status TEXT,
        team_id TEXT,
        team_name TEXT,
        is_team_manager BOOLEAN,
        password_hash TEXT
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT,
        code TEXT,
        status TEXT,
        priority TEXT,
        assignee JSONB,
        due_date TEXT,
        progress INT,
        tags JSONB,
        description TEXT,
        region TEXT,
        team_id TEXT,
        location JSONB,
        updated_at TEXT,
        time_spent TEXT,
        story_id TEXT,
        project_id TEXT,
        approval_status TEXT,
        pending_status TEXT,
        status_requested_by TEXT,
        status_requested_at TEXT,
        attachments JSONB
      );

      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT,
        region TEXT,
        coordinates JSONB,
        status TEXT,
        task_count INT,
        crew_count INT,
        lead TEXT,
        temperature TEXT,
        weather_condition TEXT,
        humidity TEXT,
        wind_speed TEXT,
        uv_index TEXT,
        assigned_member_ids JSONB,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        user_name TEXT,
        avatar TEXT,
        action TEXT,
        target TEXT,
        time TEXT,
        type TEXT,
        detail TEXT,
        task_id TEXT,
        requires_manager_approval BOOLEAN,
        approval_status TEXT,
        pending_status TEXT,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS team (
        id TEXT PRIMARY KEY,
        name TEXT,
        role TEXT,
        avatar TEXT,
        email TEXT,
        status TEXT,
        current_task TEXT,
        location TEXT,
        local_time TEXT,
        tasks_count INT,
        performance INT,
        team_id TEXT,
        team_name TEXT,
        permission_status TEXT,
        requested_role TEXT,
        requested_permissions JSONB,
        reviewed_by TEXT,
        reviewed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS timeline (
        id TEXT PRIMARY KEY,
        phase TEXT,
        title TEXT,
        start_date TEXT,
        end_date TEXT,
        status TEXT,
        progress INT,
        lead TEXT,
        region TEXT,
        assigned_member_ids JSONB,
        description TEXT,
        budget TEXT,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS stories (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        project_name TEXT,
        title TEXT,
        description TEXT,
        acceptance_criteria JSONB,
        points INT,
        status TEXT,
        assignee_name TEXT,
        created_at TEXT,
        updated_at TEXT,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        user_avatar TEXT,
        clock_in_time TEXT,
        clock_out_time TEXT,
        total_hours NUMERIC,
        status TEXT,
        work_notes TEXT,
        date TEXT,
        location_name TEXT,
        break_minutes INT,
        overtime_hours NUMERIC,
        approval_status TEXT,
        approved_by TEXT,
        manager_notes TEXT,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS async_jobs (
        id TEXT PRIMARY KEY,
        title TEXT,
        type TEXT,
        status TEXT,
        progress INT,
        result_summary TEXT,
        retry_count INT,
        error_reason TEXT,
        created_at TEXT,
        completed_at TEXT,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS invitations (
        id TEXT PRIMARY KEY,
        email TEXT,
        full_name TEXT,
        role TEXT,
        is_manager_invite BOOLEAN,
        team_name TEXT,
        team_id TEXT,
        invited_by TEXT,
        invited_by_email TEXT,
        created_at TEXT,
        status TEXT,
        invite_code TEXT
      );
    `);
    console.log('[neon-db] PostgreSQL tables verified/created successfully.');
  } catch (err) {
    console.error('[neon-db] Failed to initialize tables:', err);
  } finally {
    client.release();
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sahara_agileworks_secure_jwt_secret_2026';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

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
    const uid = decoded.uid;

    let role = decoded.role || 'Employee';
    let teamId = decoded.teamId || uid;
    let userName = decoded.displayName || decoded.email || 'User';

    try {
      const result = await pool.query('SELECT * FROM users WHERE uid = $1', [uid]);
      if (result.rows.length > 0) {
        const u = result.rows[0];
        role = u.role || role;
        teamId = u.team_id || teamId;
        userName = u.display_name || userName;
      }
    } catch (e) {
      console.warn('[db] Error fetching user profile during auth:', e);
    }

    req.user = {
      uid,
      userName,
      email: decoded.email || '',
      role: role as any,
      teamId: teamId || uid,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired JWT session token',
    });
  }
};

const requireManager = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role || 'Employee';
  if (role !== 'Manager' && role !== 'Admin') {
    return res.status(403).json({
      success: false,
      error: 'Access Denied: Manager or Admin privilege required.',
    });
  }
  next();
};

// --- AUTH ENDPOINTS ---

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { idToken, email, uid: reqUid } = req.body;
  const uid = reqUid || (idToken ? (jwt.decode(idToken) as any)?.uid : null) || `usr-${Date.now()}`;
  const userEmail = email || `${uid}@guest.sahara.io`;

  const tokenPayload = {
    uid,
    email: userEmail,
    teamId: uid,
  };
  const expiresIn = 60 * 60 * 24 * 5;
  const sessionToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn });

  res.cookie('token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: expiresIn * 1000,
    path: '/',
  });

  res.json({
    success: true,
    message: 'Authenticated successfully with Neon PostgreSQL.',
    user: { uid, email: userEmail },
    token: sessionToken,
  });
});

app.get('/api/auth/me', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/auth/sync-profile', async (req: Request, res: Response) => {
  try {
    const { uid: bodyUid, email: bodyEmail, displayName, role, teamName, isCreatingTeam, teamId: reqTeamId } = req.body;
    const uid = bodyUid || `usr-${Date.now()}`;
    const email = bodyEmail || `${uid}@guest.sahara.io`;
    const name = displayName || 'Field Operator';
    
    let assignedRole = role || 'Field Technician';
    let teamId = reqTeamId || uid;
    let initialPermission = 'pending';
    let assignedTeam = teamName || 'Sahara Primary Team';
    let isManagerRole = false;

    if (isCreatingTeam) {
      teamId = `TEAM-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      assignedRole = 'Manager';
      isManagerRole = true;
      initialPermission = 'approved';
      assignedTeam = teamName || 'New Team';
    }

    const photoURL = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

    await pool.query(
      `INSERT INTO users (uid, email, display_name, photo_url, role, permission_status, team_name, team_id, is_team_manager, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (uid) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         role = EXCLUDED.role,
         team_name = EXCLUDED.team_name,
         team_id = EXCLUDED.team_id,
         is_team_manager = EXCLUDED.is_team_manager,
         updated_at = NOW()`,
      [uid, email, name, photoURL, assignedRole, initialPermission, assignedTeam, teamId, isManagerRole]
    );

    const teamMemberId = `TM-${uid.slice(0, 8)}`;
    await pool.query(
      `INSERT INTO team (id, name, email, role, avatar, status, current_task, location, local_time, tasks_count, performance, team_name, team_id, permission_status, requested_role)
       VALUES ($1, $2, $3, $4, $5, 'active', $6, 'Al-Kufra Site A', 'UTC+2 (Sahara)', 0, 92, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         team_name = EXCLUDED.team_name,
         team_id = EXCLUDED.team_id`,
      [
        teamMemberId,
        name,
        email,
        assignedRole,
        photoURL,
        isManagerRole ? 'Managing Sector Operations' : 'Awaiting Mission Dispatch',
        assignedTeam,
        teamId,
        initialPermission,
        assignedRole
      ]
    );

    const profile = {
      uid,
      email,
      displayName: name,
      photoURL,
      role: assignedRole,
      permissionStatus: initialPermission,
      teamName: assignedTeam,
      teamId,
      isTeamManager: isManagerRole,
    };

    res.status(200).json({ success: true, profile });
  } catch (err: any) {
    console.error('[auth/sync-profile] Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- LOCATIONS (PROJECTS) API ---

app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const teamId = (req.query.teamId as string) || '';
    let result;
    if (teamId) {
      result = await pool.query('SELECT * FROM locations WHERE team_id = $1', [teamId]);
    } else {
      result = await pool.query('SELECT * FROM locations');
    }
    const projects = result.rows.map(r => ({
      id: r.id,
      name: r.name,
      region: r.region,
      coordinates: r.coordinates,
      status: r.status,
      taskCount: r.task_count,
      crewCount: r.crew_count,
      lead: r.lead,
      temperature: r.temperature,
      weatherCondition: r.weather_condition,
      humidity: r.humidity,
      windSpeed: r.wind_speed,
      uvIndex: r.uv_index,
      assignedMemberIds: r.assigned_member_ids,
      teamId: r.team_id,
    }));
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const p = req.body;
    if (!p || !p.name) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }
    const id = p.id || `LOC-${Date.now()}`;
    await pool.query(
      `INSERT INTO locations (id, name, region, coordinates, status, task_count, crew_count, lead, temperature, weather_condition, humidity, wind_speed, uv_index, assigned_member_ids, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         region = EXCLUDED.region,
         coordinates = EXCLUDED.coordinates,
         status = EXCLUDED.status,
         task_count = EXCLUDED.task_count,
         crew_count = EXCLUDED.crew_count,
         lead = EXCLUDED.lead,
         temperature = EXCLUDED.temperature,
         team_id = EXCLUDED.team_id`,
      [
        id,
        p.name,
        p.region,
        JSON.stringify(p.coordinates || { x: 50, y: 50, lat: 23.5, lng: 12.5 }),
        p.status || 'planned',
        p.taskCount || 0,
        p.crewCount || 4,
        p.lead || 'Lead',
        p.temperature || '35°C',
        p.weatherCondition || 'Sunny',
        p.humidity || '15%',
        p.windSpeed || '12 km/h',
        p.uvIndex || 'High',
        JSON.stringify(p.assignedMemberIds || []),
        p.teamId || ''
      ]
    );
    res.status(201).json({ success: true, data: { ...p, id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- TASKS API ---

app.get('/api/tasks', async (req: Request, res: Response) => {
  try {
    const teamId = (req.query.teamId as string) || '';
    let result;
    if (teamId) {
      result = await pool.query('SELECT * FROM tasks WHERE team_id = $1', [teamId]);
    } else {
      result = await pool.query('SELECT * FROM tasks');
    }
    const tasks = result.rows.map(r => ({
      id: r.id,
      title: r.title,
      code: r.code,
      status: r.status,
      priority: r.priority,
      assignee: r.assignee,
      dueDate: r.due_date,
      progress: r.progress,
      tags: r.tags,
      description: r.description,
      region: r.region,
      teamId: r.team_id,
      location: r.location,
      updatedAt: r.updated_at,
      timeSpent: r.time_spent,
      storyId: r.story_id,
      projectId: r.project_id,
      approvalStatus: r.approval_status,
      pendingStatus: r.pending_status,
      statusRequestedBy: r.status_requested_by,
      statusRequestedAt: r.status_requested_at,
      attachments: r.attachments
    }));
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tasks', async (req: Request, res: Response) => {
  try {
    const t = req.body;
    if (!t || !t.title) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }
    const id = t.id || `TASK-${Date.now()}`;
    await pool.query(
      `INSERT INTO tasks (id, title, code, status, priority, assignee, due_date, progress, tags, description, region, team_id, location, updated_at, time_spent, story_id, project_id, approval_status, pending_status, status_requested_by, status_requested_at, attachments)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
       ON CONFLICT (id) DO UPDATE SET
         title = COALESCE(EXCLUDED.title, tasks.title),
         status = COALESCE(EXCLUDED.status, tasks.status),
         priority = COALESCE(EXCLUDED.priority, tasks.priority),
         assignee = COALESCE(EXCLUDED.assignee, tasks.assignee),
         due_date = COALESCE(EXCLUDED.due_date, tasks.due_date),
         progress = COALESCE(EXCLUDED.progress, tasks.progress),
         tags = COALESCE(EXCLUDED.tags, tasks.tags),
         description = COALESCE(EXCLUDED.description, tasks.description),
         region = COALESCE(EXCLUDED.region, tasks.region),
         team_id = COALESCE(EXCLUDED.team_id, tasks.team_id),
         location = COALESCE(EXCLUDED.location, tasks.location),
         updated_at = COALESCE(EXCLUDED.updated_at, tasks.updated_at),
         attachments = COALESCE(EXCLUDED.attachments, tasks.attachments)`,
      [
        id,
        t.title,
        t.code || `SAH-${Math.floor(100 + Math.random() * 900)}`,
        t.status || 'todo',
        t.priority || 'medium',
        JSON.stringify(t.assignee || { name: 'Unassigned', avatar: '', role: '' }),
        t.dueDate || '2026-12-31',
        t.progress || 0,
        JSON.stringify(t.tags || []),
        t.description || '',
        t.region || '',
        t.teamId || '',
        JSON.stringify(t.location || { lat: 0, lng: 0, label: '' }),
        t.updatedAt || new Date().toISOString(),
        t.timeSpent || '0h',
        t.storyId || null,
        t.projectId || null,
        t.approvalStatus || null,
        t.pendingStatus || null,
        t.statusRequestedBy || null,
        t.statusRequestedAt || null,
        JSON.stringify(t.attachments || [])
      ]
    );
    res.status(201).json({ success: true, data: { ...t, id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/tasks/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
    res.json({ success: true, data: { id, status } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- ACTIVITIES API ---

app.get('/api/activities', async (req: Request, res: Response) => {
  try {
    const teamId = (req.query.teamId as string) || '';
    let result;
    if (teamId) {
      result = await pool.query('SELECT * FROM activities WHERE team_id = $1 ORDER BY id DESC', [teamId]);
    } else {
      result = await pool.query('SELECT * FROM activities ORDER BY id DESC');
    }
    const activities = result.rows.map(r => ({
      id: r.id,
      user: r.user_name,
      avatar: r.avatar,
      action: r.action,
      target: r.target,
      time: r.time,
      type: r.type,
      detail: r.detail,
      taskId: r.task_id,
      requiresManagerApproval: r.requires_manager_approval,
      approvalStatus: r.approval_status,
      pendingStatus: r.pending_status,
      teamId: r.team_id,
    }));
    res.json({ success: true, count: activities.length, data: activities });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/activities', async (req: Request, res: Response) => {
  try {
    const a = req.body;
    const id = a.id || `ACT-${Date.now()}`;
    await pool.query(
      `INSERT INTO activities (id, user_name, avatar, action, target, time, type, detail, task_id, requires_manager_approval, approval_status, pending_status, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         action = EXCLUDED.action,
         target = EXCLUDED.target,
         detail = EXCLUDED.detail`,
      [
        id,
        a.user || 'User',
        a.avatar || '',
        a.action || '',
        a.target || '',
        a.time || 'Just now',
        a.type || 'status',
        a.detail || '',
        a.taskId || null,
        a.requiresManagerApproval || false,
        a.approvalStatus || null,
        a.pendingStatus || null,
        a.teamId || ''
      ]
    );
    res.status(201).json({ success: true, data: { ...a, id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- TEAM API ---

app.get('/api/team', async (req: Request, res: Response) => {
  try {
    const teamId = (req.query.teamId as string) || '';
    let result;
    if (teamId) {
      result = await pool.query('SELECT * FROM team WHERE team_id = $1', [teamId]);
    } else {
      result = await pool.query('SELECT * FROM team');
    }
    const team = result.rows.map(r => ({
      id: r.id,
      name: r.name,
      role: r.role,
      avatar: r.avatar,
      email: r.email,
      status: r.status,
      currentTask: r.current_task,
      location: r.location,
      localTime: r.local_time,
      tasksCount: r.tasks_count,
      performance: r.performance,
      teamId: r.team_id,
      teamName: r.team_name,
      permissionStatus: r.permission_status,
      requestedRole: r.requested_role,
      requestedPermissions: r.requested_permissions,
      reviewedBy: r.reviewed_by,
      reviewedAt: r.reviewed_at,
    }));
    res.json({ success: true, count: team.length, data: team });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/team', async (req: Request, res: Response) => {
  try {
    const m = req.body;
    const id = m.id || `TM-${Date.now()}`;
    await pool.query(
      `INSERT INTO team (id, name, role, avatar, email, status, current_task, location, local_time, tasks_count, performance, team_id, team_name, permission_status, requested_role, requested_permissions, reviewed_by, reviewed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         avatar = EXCLUDED.avatar,
         email = EXCLUDED.email,
         status = EXCLUDED.status,
         current_task = EXCLUDED.current_task,
         location = EXCLUDED.location,
         tasks_count = EXCLUDED.tasks_count,
         performance = EXCLUDED.performance,
         team_id = EXCLUDED.team_id,
         team_name = EXCLUDED.team_name,
         permission_status = EXCLUDED.permission_status`,
      [
        id,
        m.name,
        m.role || 'Field Technician',
        m.avatar || '',
        m.email || '',
        m.status || 'active',
        m.currentTask || 'Awaiting Mission Dispatch',
        m.location || 'Al-Kufra Site A',
        m.localTime || 'UTC+2 (Sahara)',
        m.tasksCount || 0,
        m.performance || 90,
        m.teamId || '',
        m.teamName || 'Sahara Team',
        m.permissionStatus || 'approved',
        m.requestedRole || null,
        JSON.stringify(m.requestedPermissions || []),
        m.reviewedBy || null,
        m.reviewedAt || null,
      ]
    );
    res.status(201).json({ success: true, data: { ...m, id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- TIMELINE API ---

app.get('/api/timeline', async (req: Request, res: Response) => {
  try {
    const teamId = (req.query.teamId as string) || '';
    let result;
    if (teamId) {
      result = await pool.query('SELECT * FROM timeline WHERE team_id = $1', [teamId]);
    } else {
      result = await pool.query('SELECT * FROM timeline');
    }
    const timeline = result.rows.map(r => ({
      id: r.id,
      phase: r.phase,
      title: r.title,
      startDate: r.start_date,
      endDate: r.end_date,
      status: r.status,
      progress: r.progress,
      lead: r.lead,
      region: r.region,
      assignedMemberIds: r.assigned_member_ids,
      description: r.description,
      budget: r.budget,
      teamId: r.team_id,
    }));
    res.json({ success: true, count: timeline.length, data: timeline });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/timeline', async (req: Request, res: Response) => {
  try {
    const tm = req.body;
    const id = tm.id || `PH-${Date.now()}`;
    await pool.query(
      `INSERT INTO timeline (id, phase, title, start_date, end_date, status, progress, lead, region, assigned_member_ids, description, budget, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         phase = EXCLUDED.phase,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         status = EXCLUDED.status,
         progress = EXCLUDED.progress,
         lead = EXCLUDED.lead,
         region = EXCLUDED.region,
         team_id = EXCLUDED.team_id`,
      [
        id,
        tm.phase || 'Phase 1',
        tm.title || 'Milestone',
        tm.startDate || '2026-01-01',
        tm.endDate || '2026-12-31',
        tm.status || 'upcoming',
        tm.progress || 0,
        tm.lead || 'Lead',
        tm.region || 'Region',
        JSON.stringify(tm.assignedMemberIds || []),
        tm.description || '',
        tm.budget || '$0',
        tm.teamId || '',
      ]
    );
    res.status(201).json({ success: true, data: { ...tm, id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- STORIES API ---

app.get('/api/stories', async (req: Request, res: Response) => {
  try {
    const teamId = (req.query.teamId as string) || '';
    let result;
    if (teamId) {
      result = await pool.query('SELECT * FROM stories WHERE team_id = $1', [teamId]);
    } else {
      result = await pool.query('SELECT * FROM stories');
    }
    const stories = result.rows.map(r => ({
      id: r.id,
      projectId: r.project_id,
      projectName: r.project_name,
      title: r.title,
      description: r.description,
      acceptanceCriteria: r.acceptance_criteria,
      points: r.points,
      status: r.status,
      assigneeName: r.assignee_name,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      teamId: r.team_id,
    }));
    res.json({ success: true, count: stories.length, data: stories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/stories', async (req: Request, res: Response) => {
  try {
    const s = req.body;
    const id = s.id || `US-${Date.now()}`;
    await pool.query(
      `INSERT INTO stories (id, project_id, project_name, title, description, acceptance_criteria, points, status, assignee_name, created_at, updated_at, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         points = EXCLUDED.points,
         status = EXCLUDED.status,
         assignee_name = EXCLUDED.assignee_name,
         updated_at = EXCLUDED.updated_at,
         team_id = EXCLUDED.team_id`,
      [
        id,
        s.projectId || '',
        s.projectName || '',
        s.title || '',
        s.description || '',
        JSON.stringify(s.acceptanceCriteria || []),
        s.points || 3,
        s.status || 'in_progress',
        s.assigneeName || 'Unassigned',
        s.createdAt || new Date().toISOString(),
        s.updatedAt || new Date().toISOString(),
        s.teamId || '',
      ]
    );
    res.status(201).json({ success: true, data: { ...s, id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- ATTENDANCE API ---

app.get('/api/attendance', async (req: Request, res: Response) => {
  try {
    const teamId = (req.query.teamId as string) || '';
    let result;
    if (teamId) {
      result = await pool.query('SELECT * FROM attendance WHERE team_id = $1', [teamId]);
    } else {
      result = await pool.query('SELECT * FROM attendance');
    }
    const attendance = result.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userAvatar: r.user_avatar,
      clockInTime: r.clock_in_time,
      clockOutTime: r.clock_out_time,
      totalHours: r.total_hours ? parseFloat(r.total_hours) : undefined,
      status: r.status,
      workNotes: r.work_notes,
      date: r.date,
      locationName: r.location_name,
      breakMinutes: r.break_minutes,
      overtimeHours: r.overtime_hours ? parseFloat(r.overtime_hours) : undefined,
      approvalStatus: r.approval_status,
      approvedBy: r.approved_by,
      managerNotes: r.manager_notes,
      teamId: r.team_id,
    }));
    res.json({ success: true, count: attendance.length, data: attendance });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/attendance', async (req: Request, res: Response) => {
  try {
    const a = req.body;
    const id = a.id || `ATT-${Date.now()}`;
    await pool.query(
      `INSERT INTO attendance (id, user_id, user_name, user_avatar, clock_in_time, clock_out_time, total_hours, status, work_notes, date, location_name, break_minutes, overtime_hours, approval_status, approved_by, manager_notes, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO UPDATE SET
         clock_out_time = EXCLUDED.clock_out_time,
         total_hours = EXCLUDED.total_hours,
         status = EXCLUDED.status,
         work_notes = EXCLUDED.work_notes,
         overtime_hours = EXCLUDED.overtime_hours,
         approval_status = EXCLUDED.approval_status,
         approved_by = EXCLUDED.approved_by,
         manager_notes = EXCLUDED.manager_notes`,
      [
        id,
        a.userId || '',
        a.userName || '',
        a.userAvatar || '',
        a.clockInTime || new Date().toISOString(),
        a.clockOutTime || null,
        a.totalHours || null,
        a.status || 'clocked_in',
        a.workNotes || '',
        a.date || new Date().toISOString().split('T')[0],
        a.locationName || 'Sahara Site',
        a.breakMinutes || 0,
        a.overtimeHours || 0,
        a.approvalStatus || 'pending',
        a.approvedBy || null,
        a.managerNotes || null,
        a.teamId || '',
      ]
    );
    res.status(201).json({ success: true, data: { ...a, id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- ASYNC JOBS API ---

app.get('/api/async-jobs', async (req: Request, res: Response) => {
  try {
    const teamId = (req.query.teamId as string) || '';
    let result;
    if (teamId) {
      result = await pool.query('SELECT * FROM async_jobs WHERE team_id = $1', [teamId]);
    } else {
      result = await pool.query('SELECT * FROM async_jobs');
    }
    const jobs = result.rows.map(r => ({
      id: r.id,
      title: r.title,
      type: r.type,
      status: r.status,
      progress: r.progress,
      resultSummary: r.result_summary,
      retryCount: r.retry_count,
      errorReason: r.error_reason,
      createdAt: r.created_at,
      completedAt: r.completed_at,
      teamId: r.team_id,
    }));
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/async-jobs', async (req: Request, res: Response) => {
  try {
    const j = req.body;
    const id = j.id || `JOB-${Date.now()}`;
    await pool.query(
      `INSERT INTO async_jobs (id, title, type, status, progress, result_summary, retry_count, error_reason, created_at, completed_at, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         progress = EXCLUDED.progress,
         result_summary = EXCLUDED.result_summary,
         completed_at = EXCLUDED.completed_at`,
      [
        id,
        j.title || 'Export Job',
        j.type || 'sprint_summary',
        j.status || 'completed',
        j.progress || 100,
        j.resultSummary || 'Successfully generated',
        j.retryCount || 0,
        j.errorReason || null,
        j.createdAt || new Date().toISOString(),
        j.completedAt || new Date().toISOString(),
        j.teamId || '',
      ]
    );
    res.status(201).json({ success: true, data: { ...j, id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- INVITATIONS API ---

app.get('/api/invitations', async (req: Request, res: Response) => {
  try {
    const teamId = (req.query.teamId as string) || '';
    let result;
    if (teamId) {
      result = await pool.query('SELECT * FROM invitations WHERE team_id = $1', [teamId]);
    } else {
      result = await pool.query('SELECT * FROM invitations');
    }
    const invites = result.rows.map(r => ({
      id: r.id,
      email: r.email,
      fullName: r.full_name,
      role: r.role,
      isManagerInvite: r.is_manager_invite,
      teamName: r.team_name,
      teamId: r.team_id,
      invitedBy: r.invited_by,
      invitedByEmail: r.invited_by_email,
      createdAt: r.created_at,
      status: r.status,
      inviteCode: r.invite_code,
    }));
    res.json({ success: true, count: invites.length, data: invites });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/invitations', async (req: Request, res: Response) => {
  try {
    const inv = req.body;
    const id = inv.id || `INV-${Date.now()}`;
    await pool.query(
      `INSERT INTO invitations (id, email, full_name, role, is_manager_invite, team_name, team_id, invited_by, invited_by_email, created_at, status, invite_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status`,
      [
        id,
        inv.email || '',
        inv.fullName || '',
        inv.role || 'Field Technician',
        inv.isManagerInvite || false,
        inv.teamName || 'Sahara Team',
        inv.teamId || '',
        inv.invitedBy || 'Manager',
        inv.invitedByEmail || '',
        inv.createdAt || new Date().toISOString(),
        inv.status || 'pending',
        inv.inviteCode || `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      ]
    );
    res.status(201).json({ success: true, data: { ...inv, id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- REDIS / BACKGROUND QUEUE API ---

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'Neon PostgreSQL', timestamp: new Date().toISOString() });
});

// --- VITE MIDDLEWARE & SERVER STARTUP ---

async function startServer() {
  await initDb();

  if (process.env.NODE_ENV !== 'production') {
    const viteModule = 'vite';
    const { createServer: createViteServer } = await import(viteModule);
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
    console.log(`[sahara] Server running with Neon PostgreSQL on http://localhost:${PORT}`);
  });
}

export { app };
export default app;

if (!process.env.VERCEL) {
  startServer();
}
