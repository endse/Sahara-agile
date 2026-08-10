import { Task, TeamMember, SiteLocation, UserStory, AttendanceLog, UserProfile, Activity, TimelineMilestone, AsyncJob } from '../types';

/**
 * Filter tasks in production mode based on assigned teamId
 */
export function scopeTasksByTeam(
  tasks: Task[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee'
): Task[] {
  if (tasks.length === 0 || !userProfile?.teamId) return [];
  const teamId = userProfile.teamId;

  if (activeRole === 'Employee') {
    const userName = (userProfile?.displayName || '').toLowerCase().trim();
    const userEmail = (userProfile?.email || '').toLowerCase().trim();

    return tasks.filter((t) => {
      // Must belong to the same team
      if (t.teamId !== teamId) return false;

      const assigneeName = (t.assignee?.name || '').toLowerCase().trim();
      const statusRequestedBy = (t.statusRequestedBy || '').toLowerCase().trim();

      const nameMatch = userName && (assigneeName === userName || assigneeName.includes(userName) || userName.includes(assigneeName));
      const emailMatch = userEmail && (assigneeName === userEmail || userEmail.startsWith(assigneeName));
      const requestedByMatch = (userName || userEmail) && statusRequestedBy && (
        statusRequestedBy === userName ||
        statusRequestedBy === userEmail ||
        (userName && statusRequestedBy.includes(userName))
      );

      return nameMatch || emailMatch || requestedByMatch;
    });
  }

  // Manager Role: Manager can see ALL tasks in their team
  return tasks.filter((t) => t.teamId === teamId);
}

/**
 * Filter team members in production mode
 */
export function scopeTeamBySector(
  team: TeamMember[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee'
): TeamMember[] {
  if (team.length === 0 || !userProfile?.teamId) return [];
  return team.filter((m) => m.teamId === userProfile.teamId);
}

/**
 * Filter site locations in production mode
 */
export function scopeLocationsByTeam(
  locations: SiteLocation[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee'
): SiteLocation[] {
  if (locations.length === 0 || !userProfile?.teamId) return [];
  return locations.filter((loc) => loc.teamId === userProfile.teamId);
}

/**
 * Filter User Stories in production mode
 */
export function scopeStoriesByTeam(
  stories: UserStory[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee'
): UserStory[] {
  if (stories.length === 0 || !userProfile?.teamId) return [];
  return stories.filter((s) => s.teamId === userProfile.teamId);
}

/**
 * Filter Attendance Logs in production mode
 */
export function scopeAttendanceByTeam(
  attendanceLogs: AttendanceLog[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee'
): AttendanceLog[] {
  if (attendanceLogs.length === 0 || !userProfile?.teamId) return [];
  const teamId = userProfile.teamId;

  if (activeRole === 'Employee') {
    const userName = userProfile?.displayName?.toLowerCase() || '';
    return attendanceLogs.filter((log) => log.teamId === teamId && userName && log.userName.toLowerCase().includes(userName));
  }

  return attendanceLogs.filter((log) => log.teamId === teamId);
}

/**
 * Filter Activities in production mode
 */
export function scopeActivitiesByTeam(
  activities: Activity[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee'
): Activity[] {
  if (activities.length === 0 || !userProfile?.teamId) return [];
  const teamId = userProfile.teamId;

  if (activeRole === 'Employee') {
    // Both Manager and Employee see activities related to their team.
    return activities.filter((a) => a.teamId === teamId);
  }

  // Manager Role
  return activities.filter((a) => a.teamId === teamId);
}

/**
 * Filter Timeline Milestones in production mode
 */
export function scopeTimelineByTeam(
  timeline: TimelineMilestone[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee'
): TimelineMilestone[] {
  if (timeline.length === 0 || !userProfile?.teamId) return [];
  return timeline.filter((m) => m.teamId === userProfile.teamId);
}

/**
 * Filter Async Jobs in production mode
 */
export function scopeAsyncJobsByTeam(
  asyncJobs: AsyncJob[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee'
): AsyncJob[] {
  if (asyncJobs.length === 0 || !userProfile?.teamId) return [];
  return asyncJobs.filter((job) => job.teamId === userProfile.teamId);
}
