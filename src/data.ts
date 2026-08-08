import { Task, Activity, TeamMember, TimelineMilestone, SiteLocation } from './types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'TASK-101',
    code: 'SAH-801',
    title: 'Hydrological Flow Assessment & Aquifer Survey',
    status: 'in_progress',
    priority: 'high',
    assignee: {
      name: 'Amara Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'Lead Hydro-Geologist'
    },
    dueDate: 'Aug 10, 2026',
    progress: 75,
    tags: ['Hydrology', 'Survey', 'Zone A'],
    description: 'Calibrating subsurface water sensors across Northern Sector dunes to calculate seasonal recharge rates.',
    region: 'Sahara North - Sector 4',
    location: { lat: 24.80, lng: 12.10, label: 'Al-Kufra Wells' },
    updatedAt: '10 mins ago',
    timeSpent: '18h 40m'
  },
  {
    id: 'TASK-102',
    code: 'SAH-802',
    title: 'Solar Microgrid Inverter Optimization',
    status: 'review',
    priority: 'urgent',
    assignee: {
      name: 'Tariq Al-Mansoor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'Grid Architect'
    },
    dueDate: 'Aug 09, 2026',
    progress: 90,
    tags: ['Energy', 'Solar', 'Infra'],
    description: 'Updating firmware on Array-03 inverters to prevent thermal throttling during peak midday ambient heat (46°C).',
    region: 'Sahara East - Array 3',
    location: { lat: 23.45, lng: 14.80, label: 'Djanet Solar Farm' },
    updatedAt: '1 hour ago',
    timeSpent: '24h 10m'
  },
  {
    id: 'TASK-103',
    code: 'SAH-803',
    title: 'Autonomous Sand Shield Canopy Calibration',
    status: 'todo',
    priority: 'medium',
    assignee: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      role: 'Robotics Specialist'
    },
    dueDate: 'Aug 12, 2026',
    progress: 30,
    tags: ['Robotics', 'Maintenance'],
    description: 'Deploying optical sensor cleaning wipers on perimeter barrier units ahead of forecasted sandstorm.',
    region: 'Central Outpost',
    location: { lat: 22.10, lng: 11.30, label: 'Tibesti Base' },
    updatedAt: '3 hours ago',
    timeSpent: '6h 15m'
  },
  {
    id: 'TASK-104',
    code: 'SAH-804',
    title: 'Environmental Impact Assessment & Species Census',
    status: 'done',
    priority: 'low',
    assignee: {
      name: 'Kofi Mensah',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      role: 'Ecologist'
    },
    dueDate: 'Oct 18, 2026',
    progress: 100,
    tags: ['Ecology', 'Compliance'],
    description: 'Finalized wildlife camera audit around Oasis Station 2. Zero negative footprint observed.',
    region: 'Oasis Preserve',
    location: { lat: 25.10, lng: 10.20, label: 'Siwa Field Hub' },
    updatedAt: 'Yesterday',
    timeSpent: '32h 00m'
  },
  {
    id: 'TASK-105',
    code: 'SAH-805',
    title: 'Satellite Ground Station Microwave Relay Alignment',
    status: 'backlog',
    priority: 'medium',
    assignee: {
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      role: 'Telecom Engineer'
    },
    dueDate: 'Nov 12, 2026',
    progress: 0,
    tags: ['Telecom', 'SatCom'],
    description: 'Re-pointing secondary dish towards SaharaSat-2 to eliminate latency spikes during field transfers.',
    region: 'Communication Ridge',
    location: { lat: 24.15, lng: 13.40, label: 'Ghadames Mast' },
    updatedAt: '2 days ago',
    timeSpent: '0h'
  },
  {
    id: 'TASK-106',
    code: 'SAH-806',
    title: 'Desalination Filtration Unit Filter Replacement',
    status: 'in_progress',
    priority: 'high',
    assignee: {
      name: 'Amara Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'Lead Hydro-Geologist'
    },
    dueDate: 'Oct 28, 2026',
    progress: 50,
    tags: ['Hydrology', 'Infra'],
    description: 'Swapping graphene membranes in Stage 2 water purifier.',
    region: 'South Outpost',
    location: { lat: 21.80, lng: 12.90, label: 'Bilma Water Rig' },
    updatedAt: '4 hours ago',
    timeSpent: '12h 30m'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'ACT-1',
    user: 'Amara Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    action: 'uploaded telemetry log for',
    target: 'SAH-801 (Hydrological Assessment)',
    time: '12 minutes ago',
    type: 'file',
    detail: 'Aquifer_Pressure_Log_V4.csv (14.2 MB) attached to research folder.'
  },
  {
    id: 'ACT-2',
    user: 'Tariq Al-Mansoor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    action: 'changed status of',
    target: 'SAH-802 (Solar Grid Inverter)',
    time: '45 minutes ago',
    type: 'status',
    detail: 'Moved from "In Progress" to "Review & Testing"'
  },
  {
    id: 'ACT-3',
    user: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    action: 'commented on',
    target: 'SAH-803 (Sand Shield Canopy)',
    time: '2 hours ago',
    type: 'comment',
    detail: '"Wind vector prediction looks favorable for deployment tomorrow at 06:00 UTC."'
  },
  {
    id: 'ACT-4',
    user: 'System Bot',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    action: 'created geotag alert for',
    target: 'Sector 4 Base Camp',
    time: '3 hours ago',
    type: 'location',
    detail: 'Temperature threshold breached: 44.5°C outdoor sensor reading.'
  },
  {
    id: 'ACT-5',
    user: 'Kofi Mensah',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    action: 'marked as completed',
    target: 'SAH-804 (Species Census)',
    time: '5 hours ago',
    type: 'status',
    detail: 'All environmental permits signed off by local authority.'
  }
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'TM-1',
    name: 'Amara Vance',
    role: 'Lead Hydro-Geologist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    email: 'a.vance@sahara-agile.org',
    status: 'in_field',
    currentTask: 'SAH-801 Hydrological Survey',
    location: 'Al-Kufra Oasis Site',
    localTime: '11:42 AM (GMT+2)',
    tasksCount: 4,
    performance: 96
  },
  {
    id: 'TM-2',
    name: 'Tariq Al-Mansoor',
    role: 'Grid Architect & Energy Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    email: 't.mansoor@sahara-agile.org',
    status: 'active',
    currentTask: 'SAH-802 Inverter Optimization',
    location: 'Djanet Base Station',
    localTime: '11:42 AM (GMT+2)',
    tasksCount: 3,
    performance: 92
  },
  {
    id: 'TM-3',
    name: 'Elena Rostova',
    role: 'Robotics & Automation Lead',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    email: 'e.rostova@sahara-agile.org',
    status: 'active',
    currentTask: 'SAH-803 Shield Calibration',
    location: 'Tibesti Research Hub',
    localTime: '11:42 AM (GMT+2)',
    tasksCount: 5,
    performance: 88
  },
  {
    id: 'TM-4',
    name: 'Kofi Mensah',
    role: 'Ecology & Environmental Lead',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    email: 'k.mensah@sahara-agile.org',
    status: 'in_field',
    currentTask: 'Ecosystem Monitoring',
    location: 'Siwa Field Station',
    localTime: '11:42 AM (GMT+2)',
    tasksCount: 2,
    performance: 98
  },
  {
    id: 'TM-5',
    name: 'Maya Lin',
    role: 'SatCom & Fiber Network Lead',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    email: 'm.lin@sahara-agile.org',
    status: 'busy',
    currentTask: 'SAH-805 Microwave Relay',
    location: 'Ghadames Mast Tower',
    localTime: '11:42 AM (GMT+2)',
    tasksCount: 3,
    performance: 90
  }
];

export const INITIAL_TIMELINE: TimelineMilestone[] = [
  {
    id: 'PH-1',
    phase: 'Phase 1',
    title: 'Geological Grounding & Aquifer Mapping',
    startDate: 'Sep 01, 2026',
    endDate: 'Oct 15, 2026',
    status: 'completed',
    progress: 100,
    lead: 'Amara Vance',
    region: 'Northern Sahara'
  },
  {
    id: 'PH-2',
    phase: 'Phase 2',
    title: 'Solar Array 3 Energization & Grid Interconnect',
    startDate: 'Oct 10, 2026',
    endDate: 'Nov 15, 2026',
    status: 'in_progress',
    progress: 68,
    lead: 'Tariq Al-Mansoor',
    region: 'Djanet Basin'
  },
  {
    id: 'PH-3',
    phase: 'Phase 3',
    title: 'Sand Shield Robotics Field Testing',
    startDate: 'Nov 01, 2026',
    endDate: 'Dec 10, 2026',
    status: 'upcoming',
    progress: 15,
    lead: 'Elena Rostova',
    region: 'Tibesti Ridge'
  },
  {
    id: 'PH-4',
    phase: 'Phase 4',
    title: 'Full Oasis Eco-Habitat Stabilization',
    startDate: 'Dec 01, 2026',
    endDate: 'Jan 30, 2027',
    status: 'upcoming',
    progress: 0,
    lead: 'Kofi Mensah',
    region: 'Siwa Hub'
  }
];

export const INITIAL_LOCATIONS: SiteLocation[] = [
  {
    id: 'LOC-1',
    name: 'Al-Kufra Hydro Research Hub',
    region: 'Sector 4 - East Oasis',
    coordinates: { x: 35, y: 30, lat: 24.80, lng: 12.10 },
    status: 'active',
    taskCount: 6,
    crewCount: 12,
    lead: 'Amara Vance',
    temperature: '38°C',
    weatherCondition: 'Clear & Arid',
    humidity: '14%',
    windSpeed: '18 km/h NE',
    uvIndex: 'High (8)'
  },
  {
    id: 'LOC-2',
    name: 'Djanet Solar Microgrid 03',
    region: 'Sector 2 - Central Basin',
    coordinates: { x: 62, y: 52, lat: 23.45, lng: 14.80 },
    status: 'warning',
    taskCount: 4,
    crewCount: 8,
    lead: 'Tariq Al-Mansoor',
    temperature: '45°C',
    weatherCondition: 'Extreme Heat & Dust Watch',
    humidity: '9%',
    windSpeed: '32 km/h E',
    uvIndex: 'Extreme (11+)'
  },
  {
    id: 'LOC-3',
    name: 'Tibesti Shield Robotics Base',
    region: 'Sector 1 - Highland',
    coordinates: { x: 28, y: 68, lat: 22.10, lng: 11.30 },
    status: 'active',
    taskCount: 5,
    crewCount: 9,
    lead: 'Elena Rostova',
    temperature: '32°C',
    weatherCondition: 'Mountain Gusts & Fair Sky',
    humidity: '22%',
    windSpeed: '28 km/h NW',
    uvIndex: 'Moderate (6)'
  },
  {
    id: 'LOC-4',
    name: 'Siwa Ecology Station',
    region: 'Sector 5 - North Border',
    coordinates: { x: 78, y: 22, lat: 25.10, lng: 10.20 },
    status: 'completed',
    taskCount: 2,
    crewCount: 5,
    lead: 'Kofi Mensah',
    temperature: '34°C',
    weatherCondition: 'Oasis Breeze & Sunny',
    humidity: '35%',
    windSpeed: '14 km/h S',
    uvIndex: 'Moderate (5)'
  },
  {
    id: 'LOC-5',
    name: 'Ghadames Telecom Mast',
    region: 'Sector 3 - West Relay',
    coordinates: { x: 50, y: 38, lat: 24.15, lng: 13.40 },
    status: 'planned',
    taskCount: 3,
    crewCount: 4,
    lead: 'Maya Lin',
    temperature: '41°C',
    weatherCondition: 'Dry Thermal Drafts',
    humidity: '12%',
    windSpeed: '22 km/h ESE',
    uvIndex: 'Very High (10)'
  }
];

export const INITIAL_STORIES: import('./types').UserStory[] = [
  {
    id: 'US-101',
    projectId: 'LOC-1',
    projectName: 'Al-Kufra Deep Well Site A',
    title: 'Automated Aquifer Telemetry & Pressure Sensing Integration',
    description: 'As a hydro-geologist, I want real-time aquifer pressure sensor streaming so that I can prevent over-extraction during peak heat cycles.',
    acceptanceCriteria: [
      'Calibrate pressure transducers at 200m depth',
      'Transmit data packets via SatCom relay every 15 minutes',
      'Trigger automated emergency cutoff if pressure drops below 2.4 bar'
    ],
    points: 8,
    status: 'in_progress',
    assigneeName: 'Amara Vance',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-07'
  },
  {
    id: 'US-102',
    projectId: 'LOC-2',
    projectName: 'Djanet Solar Microgrid 03',
    title: 'Photovoltaic Dust Ingress Monitoring & Auto-Cleaning',
    description: 'As a solar grid engineer, I want thermal dust sensors on panel arrays so that automated wiper drones deploy when efficiency drops > 12%.',
    acceptanceCriteria: [
      'Install optical dust opacity sensors on Sub-array B',
      'Integrate drone signal trigger with main inverter board',
      'Log daily efficiency metrics to Firestore telemetry'
    ],
    points: 5,
    status: 'completed',
    assigneeName: 'Tariq Al-Mansoor',
    createdAt: '2026-07-25',
    updatedAt: '2026-08-05'
  },
  {
    id: 'US-103',
    projectId: 'LOC-3',
    projectName: 'Tibesti Shield Robotics Base',
    title: 'Autonomous Sand Rover Navigation Mesh & Obstacle Avoidance',
    description: 'As a field robotics lead, I want 3D LiDAR point-cloud mapping on autonomous survey vehicles so they can navigate dune drifts safely.',
    acceptanceCriteria: [
      'Integrate Solid-State LiDAR payload with navigation stack',
      'Test night navigation under zero-visibility dust storm conditions',
      'Implement fail-safe return to base procedure'
    ],
    points: 13,
    status: 'backlog',
    assigneeName: 'Elena Rostova',
    createdAt: '2026-08-03',
    updatedAt: '2026-08-08'
  }
];

export const INITIAL_ATTENDANCE: import('./types').AttendanceLog[] = [
  {
    id: 'ATT-1',
    userId: 'USR-01',
    userName: 'Amara Vance',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    clockInTime: '2026-08-08T07:30:00.000Z',
    clockOutTime: '2026-08-08T16:15:00.000Z',
    totalHours: 8.75,
    status: 'clocked_out',
    workNotes: 'Completed pressure log audit at Subsurface Well Site A. All telemetry green.',
    date: '2026-08-08',
    locationName: 'Al-Kufra Hydro Site',
    breakMinutes: 45,
    overtimeHours: 0.75,
    approvalStatus: 'approved',
    approvedBy: 'Director Council',
    managerNotes: 'Verified with pressure sensor telemetry log.'
  },
  {
    id: 'ATT-2',
    userId: 'USR-02',
    userName: 'Tariq Al-Mansoor',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    clockInTime: '2026-08-08T08:00:00.000Z',
    status: 'clocked_in',
    workNotes: 'Inspecting Sub-array B thermal inverters at Djanet Station.',
    date: '2026-08-08',
    locationName: 'Djanet Microgrid',
    breakMinutes: 30,
    approvalStatus: 'pending'
  },
  {
    id: 'ATT-3',
    userId: 'USR-03',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    clockInTime: '2026-08-08T08:15:00.000Z',
    status: 'clocked_in',
    workNotes: 'Testing autonomous rover LiDAR sensor harness.',
    date: '2026-08-08',
    locationName: 'Chott el Djerid Hub',
    breakMinutes: 15,
    approvalStatus: 'pending'
  },
  {
    id: 'ATT-4',
    userId: 'USR-04',
    userName: 'Kofi Mensah',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    clockInTime: '2026-08-07T07:00:00.000Z',
    clockOutTime: '2026-08-07T17:30:00.000Z',
    totalHours: 10.5,
    status: 'clocked_out',
    workNotes: 'Emergency pipeline repair during sandstorm high winds.',
    date: '2026-08-07',
    locationName: 'Siwa Oasis Shelter',
    breakMinutes: 30,
    overtimeHours: 2.5,
    approvalStatus: 'approved',
    approvedBy: 'Amara Vance',
    managerNotes: 'Commended for emergency response during gale alert.'
  },
  {
    id: 'ATT-5',
    userId: 'USR-05',
    userName: 'Maya Lin',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    clockInTime: '2026-08-07T08:30:00.000Z',
    clockOutTime: '2026-08-07T16:30:00.000Z',
    totalHours: 8.0,
    status: 'clocked_out',
    workNotes: 'Routine drone survey and solar panel dust index mapping.',
    date: '2026-08-07',
    locationName: 'Sebha Solar Complex',
    breakMinutes: 45,
    overtimeHours: 0,
    approvalStatus: 'approved',
    approvedBy: 'Amara Vance',
    managerNotes: 'All clear.'
  },
  {
    id: 'ATT-6',
    userId: 'USR-01',
    userName: 'Amara Vance',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    clockInTime: '2026-08-06T07:45:00.000Z',
    clockOutTime: '2026-08-06T16:45:00.000Z',
    totalHours: 9.0,
    status: 'clocked_out',
    workNotes: 'Water table baseline sensor calibration.',
    date: '2026-08-06',
    locationName: 'Al-Kufra Hydro Site',
    breakMinutes: 45,
    overtimeHours: 1.0,
    approvalStatus: 'approved',
    approvedBy: 'Director Council'
  }
];

export const INITIAL_ASYNC_JOBS: import('./types').AsyncJob[] = [
  {
    id: 'JOB-801',
    title: 'Weekly Field Sprint Telemetry & Progress Audit',
    type: 'sprint_summary',
    status: 'completed',
    progress: 100,
    resultSummary: 'Report compiled successfully. 18 tasks audited across 5 regional stations. Overall velocity: +14% relative to baseline.',
    retryCount: 0,
    createdAt: '2026-08-07T18:00:00.000Z',
    completedAt: '2026-08-07T18:02:15.000Z'
  },
  {
    id: 'JOB-802',
    title: 'Monthly Employee Work Hours & Attendance Consolidation',
    type: 'attendance_audit',
    status: 'completed',
    progress: 100,
    resultSummary: 'Consolidated 142 shift logs for 10 field operators. Total logged hours: 1,180.0 hrs. Zero unverified absences.',
    retryCount: 0,
    createdAt: '2026-08-01T00:00:00.000Z',
    completedAt: '2026-08-01T00:01:40.000Z'
  }
];
