import { Task, Activity, TeamMember, TimelineMilestone, SiteLocation, UserStory, AttendanceLog, AsyncJob } from './types';

// ==========================================
// DEMO DATA (SOFTWARE / CS AGILE WORKSPACE)
// ==========================================

export const DEMO_LOCATIONS: SiteLocation[] = [
  {
    id: 'LOC-1',
    name: 'Sahara Agile Workspace',
    region: 'Sector 1 - Core Platform',
    coordinates: { x: 35, y: 30, lat: 24.80, lng: 12.10 },
    status: 'active',
    taskCount: 4,
    crewCount: 6,
    lead: 'Amara Vance',
    temperature: 'Optimal (22°C)',
    weatherCondition: 'Cloud Sync Operational',
    humidity: '45%',
    windSpeed: '10 Gbps',
    uvIndex: 'Low (2)'
  },
  {
    id: 'LOC-2',
    name: 'AI Analytics Platform',
    region: 'Sector 2 - ML Pipeline',
    coordinates: { x: 62, y: 52, lat: 23.45, lng: 14.80 },
    status: 'active',
    taskCount: 3,
    crewCount: 4,
    lead: 'Tariq Al-Mansoor',
    temperature: 'Nominal (24°C)',
    weatherCondition: 'Model Training Active',
    humidity: '40%',
    windSpeed: '25 Gbps',
    uvIndex: 'Low (1)'
  },
  {
    id: 'LOC-3',
    name: 'Cloud Infrastructure & DevOps',
    region: 'Sector 3 - Kubernetes Cluster',
    coordinates: { x: 28, y: 68, lat: 22.10, lng: 11.30 },
    status: 'active',
    taskCount: 3,
    crewCount: 5,
    lead: 'Elena Rostova',
    temperature: 'Cool (20°C)',
    weatherCondition: '99.99% Uptime',
    humidity: '38%',
    windSpeed: '50 Gbps',
    uvIndex: 'Low (1)'
  }
];

export const DEMO_STORIES: UserStory[] = [
  {
    id: 'US-101',
    projectId: 'LOC-1',
    projectName: 'Sahara Agile Workspace',
    title: 'Real-time Sprint Telemetry & API Stream',
    description: 'As a software engineer, I want real-time task status streaming via websockets/polling so that team velocity updates dynamically.',
    acceptanceCriteria: [
      'Stream task status changes in real-time across Kanban board',
      'Transmit data payloads via Express REST API',
      'Trigger automated notification when high priority tasks breach deadline'
    ],
    points: 8,
    status: 'in_progress',
    assigneeName: 'Amara Vance',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-09',
    teamSector: 'Full Stack Development'
  },
  {
    id: 'US-102',
    projectId: 'LOC-2',
    projectName: 'AI Analytics Platform',
    title: 'Predictive Task Bottleneck ML Engine',
    description: 'As a project manager, I want machine learning model predictions on task completion timelines to identify risks early.',
    acceptanceCriteria: [
      'Train lightweight regression model on historical task lead times',
      'Display confidence score badge on task inspector panel',
      'Route delayed jobs to background queue automatically'
    ],
    points: 13,
    status: 'in_progress',
    assigneeName: 'Tariq Al-Mansoor',
    createdAt: '2026-08-02',
    updatedAt: '2026-08-09',
    teamSector: 'AI / Machine Learning'
  },
  {
    id: 'US-103',
    projectId: 'LOC-1',
    projectName: 'Sahara Agile Workspace',
    title: 'OAuth & Role-Based Access Control Middleware',
    description: 'As a security engineer, I want JWT session verification and RBAC guards so that manager operations are strictly authorized.',
    acceptanceCriteria: [
      'Issue HttpOnly session cookies upon user login',
      'Block unauthorized employee requests with 403 Forbidden',
      'Provide instant UI role switcher for demo evaluation'
    ],
    points: 5,
    status: 'completed',
    assigneeName: 'Elena Rostova',
    createdAt: '2026-08-03',
    updatedAt: '2026-08-08',
    teamSector: 'Backend Development'
  }
];

export const DEMO_TASKS: Task[] = [
  {
    id: 'TASK-101',
    code: 'SAH-801',
    title: 'Implement WebSocket Telemetry & Task Subscription Sync',
    status: 'in_progress',
    priority: 'high',
    teamSector: 'Full Stack Development',
    storyId: 'US-101',
    projectId: 'LOC-1',
    assignee: {
      name: 'Amara Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'Full Stack Developer'
    },
    dueDate: 'Aug 10, 2026',
    progress: 75,
    tags: ['FullStack', 'WebSockets', 'Agile'],
    description: 'Connecting task subscription hooks to real-time Firestore listeners for immediate Kanban card status updates.',
    region: 'Sector 1 - Core Platform',
    location: { lat: 24.80, lng: 12.10, label: 'Sahara Agile Workspace' },
    updatedAt: '10 mins ago',
    timeSpent: '18h 40m'
  },
  {
    id: 'TASK-102',
    code: 'SAH-802',
    title: 'Optimize Async Redis Queue & DLQ Retry Handler',
    status: 'review',
    priority: 'urgent',
    teamSector: 'AI / Machine Learning',
    storyId: 'US-102',
    projectId: 'LOC-2',
    assignee: {
      name: 'Tariq Al-Mansoor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'AI/ML Engineer'
    },
    dueDate: 'Aug 09, 2026',
    progress: 90,
    tags: ['AI/ML', 'Redis', 'Backend'],
    description: 'Configuring exponential backoff retries for failed background analytics reports before moving to Dead Letter Queue.',
    region: 'Sector 2 - ML Pipeline',
    location: { lat: 23.45, lng: 14.80, label: 'AI Analytics Platform' },
    updatedAt: '1 hour ago',
    timeSpent: '24h 10m'
  },
  {
    id: 'TASK-103',
    code: 'SAH-803',
    title: 'Configure CI/CD Automation & Docker Container Build',
    status: 'todo',
    priority: 'medium',
    teamSector: 'DevOps / Cloud',
    storyId: 'US-103',
    projectId: 'LOC-1',
    assignee: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      role: 'DevOps Engineer'
    },
    dueDate: 'Aug 12, 2026',
    progress: 30,
    tags: ['DevOps', 'Docker', 'CI/CD'],
    description: 'Setting up automated GitHub Action pipeline for linting, Vitest unit tests, and production esbuild bundler.',
    region: 'Sector 3 - Kubernetes Cluster',
    location: { lat: 22.10, lng: 11.30, label: 'Cloud Infrastructure & DevOps' },
    updatedAt: '3 hours ago',
    timeSpent: '6h 15m'
  },
  {
    id: 'TASK-104',
    code: 'SAH-804',
    title: 'Audit Security Headers & Express HttpOnly Cookie JWT',
    status: 'done',
    priority: 'low',
    teamSector: 'Cybersecurity',
    storyId: 'US-103',
    projectId: 'LOC-1',
    assignee: {
      name: 'Kofi Mensah',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      role: 'Cybersecurity Engineer'
    },
    dueDate: 'Oct 18, 2026',
    progress: 100,
    tags: ['Security', 'JWT', 'Audit'],
    description: 'Validated Express auth routes against OWASP security guidelines. Session cookie revocation verified.',
    region: 'Sector 1 - Core Platform',
    location: { lat: 25.10, lng: 10.20, label: 'Sahara Agile Workspace' },
    updatedAt: 'Yesterday',
    timeSpent: '32h 00m'
  },
  {
    id: 'TASK-105',
    code: 'SAH-805',
    title: 'Refactor REST API Endpoint Validation Schemas',
    status: 'backlog',
    priority: 'medium',
    teamSector: 'Backend Development',
    storyId: 'US-101',
    projectId: 'LOC-1',
    assignee: {
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      role: 'Backend Developer'
    },
    dueDate: 'Nov 12, 2026',
    progress: 0,
    tags: ['Backend', 'Express', 'API'],
    description: 'Enforcing strict Zod/TypeScript schema validation on POST /api/projects and POST /api/stories payloads.',
    region: 'Sector 1 - Core Platform',
    location: { lat: 24.15, lng: 13.40, label: 'Sahara Agile Workspace' },
    updatedAt: '2 days ago',
    timeSpent: '0h'
  }
];

export const DEMO_ACTIVITIES: Activity[] = [
  {
    id: 'ACT-1',
    user: 'Amara Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    action: 'created task',
    target: 'SAH-801 (WebSocket Telemetry & Task Sync)',
    time: '12 minutes ago',
    type: 'assignment',
    detail: 'Task assigned to Amara Vance for Sahara Agile Workspace project.'
  },
  {
    id: 'ACT-2',
    user: 'Tariq Al-Mansoor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    action: 'updated status of',
    target: 'SAH-802 (Redis Queue & DLQ Handler)',
    time: '45 minutes ago',
    type: 'status',
    detail: 'Moved from "In Progress" to "Review"'
  },
  {
    id: 'ACT-3',
    user: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    action: 'created user story',
    target: 'US-103 (OAuth & RBAC Middleware)',
    time: '2 hours ago',
    type: 'assignment',
    detail: 'Linked to project Sahara Agile Workspace with 5 story points.'
  }
];

export const DEMO_TEAM: TeamMember[] = [
  {
    id: 'TM-1',
    name: 'Amara Vance',
    role: 'Full Stack Developer',
    teamSector: 'Full Stack Development',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    email: 'a.vance@sahara-agile.org',
    status: 'active',
    currentTask: 'SAH-801 WebSocket Telemetry',
    location: 'Sahara Agile Workspace',
    localTime: '11:42 AM (GMT+2)',
    tasksCount: 4,
    performance: 96
  },
  {
    id: 'TM-2',
    name: 'Tariq Al-Mansoor',
    role: 'AI/ML Engineer',
    teamSector: 'AI / Machine Learning',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    email: 't.mansoor@sahara-agile.org',
    status: 'active',
    currentTask: 'SAH-802 Inverter Optimization',
    location: 'AI Analytics Platform',
    localTime: '11:42 AM (GMT+2)',
    tasksCount: 3,
    performance: 92
  },
  {
    id: 'TM-3',
    name: 'Elena Rostova',
    role: 'DevOps Engineer',
    teamSector: 'DevOps / Cloud',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    email: 'e.rostova@sahara-agile.org',
    status: 'active',
    currentTask: 'SAH-803 CI/CD Automation',
    location: 'Cloud Infrastructure',
    localTime: '11:42 AM (GMT+2)',
    tasksCount: 5,
    performance: 88
  },
  {
    id: 'TM-4',
    name: 'Kofi Mensah',
    role: 'Cybersecurity Engineer',
    teamSector: 'Cybersecurity',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    email: 'k.mensah@sahara-agile.org',
    status: 'active',
    currentTask: 'SAH-804 Security Audit',
    location: 'Sahara Agile Workspace',
    localTime: '11:42 AM (GMT+2)',
    tasksCount: 2,
    performance: 98
  },
  {
    id: 'TM-5',
    name: 'Maya Lin',
    role: 'Backend Developer',
    teamSector: 'Backend Development',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    email: 'm.lin@sahara-agile.org',
    status: 'busy',
    currentTask: 'SAH-805 REST API Schema Audit',
    location: 'Sahara Agile Workspace',
    localTime: '11:42 AM (GMT+2)',
    tasksCount: 3,
    performance: 90
  }
];

export const DEMO_TIMELINE: TimelineMilestone[] = [
  {
    id: 'PH-1',
    phase: 'Phase 1',
    title: 'Core Platform Architecture & Setup',
    startDate: 'Sep 01, 2026',
    endDate: 'Oct 15, 2026',
    status: 'completed',
    progress: 100,
    lead: 'Amara Vance',
    region: 'Sector 1 - Core Platform'
  },
  {
    id: 'PH-2',
    phase: 'Phase 2',
    title: 'AI Predictive Engine & Redis Queue Integration',
    startDate: 'Oct 10, 2026',
    endDate: 'Nov 15, 2026',
    status: 'in_progress',
    progress: 68,
    lead: 'Tariq Al-Mansoor',
    region: 'Sector 2 - ML Pipeline'
  },
  {
    id: 'PH-3',
    phase: 'Phase 3',
    title: 'Kubernetes Cluster & Automated CI/CD Deployment',
    startDate: 'Nov 01, 2026',
    endDate: 'Dec 10, 2026',
    status: 'upcoming',
    progress: 15,
    lead: 'Elena Rostova',
    region: 'Sector 3 - Kubernetes Cluster'
  }
];

export const DEMO_ATTENDANCE: AttendanceLog[] = [
  {
    id: 'ATT-1',
    userId: 'TM-1',
    userName: 'Amara Vance',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    clockInTime: '2026-08-09T08:00:00.000Z',
    clockOutTime: '2026-08-09T17:00:00.000Z',
    totalHours: 8.5,
    status: 'clocked_out',
    workNotes: 'Developed WebSocket telemetry handler and sprint board listeners.',
    date: '2026-08-09',
    locationName: 'Sahara Agile Workspace',
    breakMinutes: 30,
    approvalStatus: 'approved',
    approvedBy: 'System Manager',
    teamSector: 'Full Stack Development'
  },
  {
    id: 'ATT-2',
    userId: 'TM-2',
    userName: 'Tariq Al-Mansoor',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    clockInTime: '2026-08-09T08:30:00.000Z',
    clockOutTime: '2026-08-09T17:30:00.000Z',
    totalHours: 8.0,
    status: 'clocked_out',
    workNotes: 'Tuned ML bottleneck prediction model on historical lead times.',
    date: '2026-08-09',
    locationName: 'AI Analytics Platform',
    breakMinutes: 30,
    approvalStatus: 'approved',
    approvedBy: 'System Manager',
    teamSector: 'AI / Machine Learning'
  },
  {
    id: 'ATT-3',
    userId: 'TM-3',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    clockInTime: '2026-08-08T07:45:00.000Z',
    clockOutTime: '2026-08-08T17:15:00.000Z',
    totalHours: 9.0,
    status: 'clocked_out',
    workNotes: 'Automated GitHub Actions pipeline for linting and Vitest coverage.',
    date: '2026-08-08',
    locationName: 'Cloud Infrastructure & DevOps',
    breakMinutes: 30,
    approvalStatus: 'approved',
    approvedBy: 'System Manager',
    teamSector: 'DevOps / Cloud'
  },
  {
    id: 'ATT-4',
    userId: 'TM-4',
    userName: 'Kofi Mensah',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    clockInTime: '2026-08-08T08:15:00.000Z',
    clockOutTime: '2026-08-08T18:15:00.000Z',
    totalHours: 10.0,
    status: 'clocked_out',
    workNotes: 'Hardened Express auth routes against OWASP security guidelines.',
    date: '2026-08-08',
    locationName: 'Sahara Agile Workspace',
    breakMinutes: 45,
    overtimeHours: 2.0,
    approvalStatus: 'approved',
    approvedBy: 'System Manager',
    teamSector: 'Cybersecurity'
  },
  {
    id: 'ATT-5',
    userId: 'TM-5',
    userName: 'Maya Lin',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    clockInTime: '2026-08-08T08:30:00.000Z',
    clockOutTime: '2026-08-08T16:30:00.000Z',
    totalHours: 8.0,
    status: 'clocked_out',
    workNotes: 'Drafted Zod validation schemas for project and story endpoints.',
    date: '2026-08-08',
    locationName: 'Sahara Agile Workspace',
    breakMinutes: 30,
    approvalStatus: 'approved',
    approvedBy: 'System Manager',
    teamSector: 'Backend Development'
  }
];

export const DEMO_ASYNC_JOBS: AsyncJob[] = [
  {
    id: 'JOB-101',
    title: 'Monthly Sprint Summary & Velocity Report',
    type: 'sprint_summary',
    status: 'completed',
    progress: 100,
    resultSummary: 'Report compiled successfully. 5 tasks audited across 3 project sectors. Overall velocity: +14% relative to baseline.',
    retryCount: 0,
    createdAt: '2026-08-09T00:00:00Z',
    completedAt: '2026-08-09T00:02:15Z'
  },
  {
    id: 'JOB-102',
    title: 'Employee Worklog & Attendance Audit',
    type: 'attendance_audit',
    status: 'processing',
    progress: 45,
    resultSummary: 'Consolidating shift logs across all five specialist teams.',
    retryCount: 1,
    createdAt: '2026-08-09T00:00:00Z'
  }
];

// ==========================================
// INITIAL CLEAN EMPTY STATE (PRODUCTION MODE)
// ==========================================

export const INITIAL_TASKS: Task[] = [];
export const INITIAL_ACTIVITIES: Activity[] = [];
export const INITIAL_TEAM: TeamMember[] = [];
export const INITIAL_TIMELINE: TimelineMilestone[] = [];
export const INITIAL_LOCATIONS: SiteLocation[] = [];
export const INITIAL_STORIES: UserStory[] = [];
export const INITIAL_ATTENDANCE: AttendanceLog[] = [];
export const INITIAL_ASYNC_JOBS: AsyncJob[] = [];

export function getAllDemoData() {
  return {
    tasks: DEMO_TASKS,
    activities: DEMO_ACTIVITIES,
    team: DEMO_TEAM,
    timeline: DEMO_TIMELINE,
    locations: DEMO_LOCATIONS,
    stories: DEMO_STORIES,
    attendance: DEMO_ATTENDANCE,
    jobs: DEMO_ASYNC_JOBS,
  };
}

export function getDemoTeams() {
  return [
    { id: 'all', name: 'All Teams & Sectors', count: DEMO_TEAM.length },
    { id: 'fullstack', name: 'Full Stack Development', sector: 'Full Stack Development', lead: 'Amara Vance' },
    { id: 'ai-ml', name: 'AI / Machine Learning', sector: 'AI / Machine Learning', lead: 'Tariq Al-Mansoor' },
    { id: 'devops', name: 'DevOps & Cloud', sector: 'DevOps / Cloud', lead: 'Elena Rostova' },
    { id: 'security', name: 'Cybersecurity', sector: 'Cybersecurity', lead: 'Kofi Mensah' },
    { id: 'backend', name: 'Backend Development', sector: 'Backend Development', lead: 'Maya Lin' },
  ];
}
