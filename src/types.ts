export type ScreenId =
  | 'Landing'
  | 'Dashboard'
  | 'GlobalSearch'
  | 'ProjectTimeline'
  | 'TaskBoard'
  | 'ProjectMap'
  | 'Settings'
  | 'TeamSync'
  | 'NewTask'
  | 'NewProject'
  | 'UserStories'
  | 'AttendanceLog'
  | 'AsyncReports'
  | 'TaskBoardActivity'
  | 'Profile'
  | 'SignUp'
  | 'PerformanceAnalytics'
  | 'Demo';

export type WalkthroughRole = 'Manager' | 'Employee';

export interface WalkthroughStep {
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  targetScreen?: ScreenId;
  actionLabel?: string;
  icon: string;
}


export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: string;
  teamSector?: string;
  specialty?: string;
  phone?: string;
  assignedStation?: string;
  bio?: string;
  updatedAt?: string;
  permissionStatus?: 'pending_review' | 'approved' | 'rejected' | 'elevated';
  teamName?: string;
  isTeamManager?: boolean;
}

export type TransitionType = 'none' | 'push' | 'push_back' | 'slide_up' | 'slide_down';

export interface NavigationState {
  currentScreen: ScreenId;
  previousScreen?: ScreenId;
  transition: TransitionType;
}

export interface Task {
  id: string;
  title: string;
  code: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: {
    name: string;
    avatar: string;
    role: string;
  };
  dueDate: string;
  progress: number;
  tags: string[];
  description?: string;
  region?: string;
  teamSector?: string;
  location?: { lat: number; lng: number; label: string };
  updatedAt: string;
  timeSpent?: string;
  storyId?: string;
  projectId?: string;
  approvalStatus?: 'approved' | 'pending_approval' | 'rejected';
  pendingStatus?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  statusRequestedBy?: string;
  statusRequestedAt?: string;
}

export interface UserStory {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  points: number;
  status: 'backlog' | 'in_progress' | 'testing' | 'completed';
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
  teamSector?: string;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  clockInTime: string;
  clockOutTime?: string;
  totalHours?: number;
  status: 'clocked_in' | 'clocked_out';
  workNotes?: string;
  date: string;
  locationName?: string;
  breakMinutes?: number;
  overtimeHours?: number;
  approvalStatus?: 'pending' | 'approved' | 'flagged';
  approvedBy?: string;
  managerNotes?: string;
  teamSector?: string;
}

export interface AsyncJob {
  id: string;
  title: string;
  type: 'sprint_summary' | 'attendance_audit' | 'employee_worklog' | 'task_completion_export';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultSummary?: string;
  retryCount: number;
  errorReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Activity {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
  type: 'comment' | 'status' | 'file' | 'assignment' | 'location' | 'approval_request';
  detail?: string;
  taskId?: string;
  requiresManagerApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  pendingStatus?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  status: 'active' | 'in_field' | 'offline' | 'busy';
  currentTask?: string;
  location?: string;
  localTime?: string;
  tasksCount: number;
  performance: number;
  teamSector?: string;
  permissionStatus?: 'pending_review' | 'approved' | 'rejected' | 'elevated';
  requestedRole?: string;
  requestedPermissions?: string[];
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TimelineMilestone {
  id: string;
  phase: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  progress: number;
  lead: string;
  region: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isManagerInvite: boolean;
  teamName: string;
  invitedBy: string;
  invitedByEmail: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
  inviteCode: string;
}

export interface SiteLocation {
  id: string;
  name: string;
  region: string;
  coordinates: { x: number; y: number; lat: number; lng: number };
  status: 'active' | 'warning' | 'completed' | 'planned';
  taskCount: number;
  crewCount: number;
  lead: string;
  temperature: string;
  weatherCondition?: string;
  humidity?: string;
  windSpeed?: string;
  uvIndex?: string;
}
