import { Task, TeamMember, SiteLocation, UserStory, AttendanceLog, UserProfile } from '../types';

export function getUserTeamSector(userProfile: UserProfile | null): string {
  return userProfile?.teamSector || 'Full Stack Development';
}

/**
 * Filter tasks in production mode based on role & assigned team sector
 */
export function scopeTasksByTeam(
  tasks: Task[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee',
  managedSector: string = 'All Teams'
): Task[] {
  if (tasks.length === 0) return [];
  const userTeam = getUserTeamSector(userProfile);
  const userName = userProfile?.displayName?.toLowerCase() || '';

  if (activeRole === 'Employee') {
    return tasks.filter((t) => {
      const matchTeam = t.teamSector === userTeam;
      const matchAssignee = userName && t.assignee.name.toLowerCase().includes(userName);
      return matchTeam || matchAssignee;
    });
  }

  // Manager Role
  if (!managedSector || managedSector === 'All Teams') {
    return tasks;
  }
  return tasks.filter((t) => !t.teamSector || t.teamSector === managedSector);
}

/**
 * Filter team members in production mode
 */
export function scopeTeamBySector(
  team: TeamMember[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee',
  managedSector: string = 'All Teams'
): TeamMember[] {
  if (team.length === 0) return [];
  const userTeam = getUserTeamSector(userProfile);

  if (activeRole === 'Employee') {
    return team.filter((m) => !m.teamSector || m.teamSector === userTeam);
  }

  if (!managedSector || managedSector === 'All Teams') {
    return team;
  }
  return team.filter((m) => !m.teamSector || m.teamSector === managedSector);
}

/**
 * Filter site locations in production mode
 */
export function scopeLocationsByTeam(
  locations: SiteLocation[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee',
  managedSector: string = 'All Teams'
): SiteLocation[] {
  if (locations.length === 0) return [];
  const userTeam = getUserTeamSector(userProfile);

  if (activeRole === 'Employee') {
    return locations.filter((loc) => {
      if (userTeam === 'Full Stack Development') return loc.id === 'LOC-1' || loc.lead === 'Amara Vance';
      if (userTeam === 'AI / Machine Learning') return loc.id === 'LOC-2' || loc.lead === 'Tariq Al-Mansoor';
      if (userTeam === 'DevOps / Cloud') return loc.id === 'LOC-3' || loc.lead === 'Elena Rostova';
      if (userTeam === 'Cybersecurity') return loc.id === 'LOC-4' || loc.lead === 'Kofi Mensah';
      if (userTeam === 'Backend Development') return loc.id === 'LOC-5' || loc.lead === 'Maya Lin';
      return true;
    });
  }

  return locations;
}

/**
 * Filter User Stories in production mode
 */
export function scopeStoriesByTeam(
  stories: UserStory[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee',
  managedSector: string = 'All Teams'
): UserStory[] {
  if (stories.length === 0) return [];
  const userTeam = getUserTeamSector(userProfile);

  if (activeRole === 'Employee') {
    return stories.filter((s) => !s.teamSector || s.teamSector === userTeam);
  }

  if (!managedSector || managedSector === 'All Teams') {
    return stories;
  }
  return stories.filter((s) => !s.teamSector || s.teamSector === managedSector);
}

/**
 * Filter Attendance Logs in production mode
 */
export function scopeAttendanceByTeam(
  attendanceLogs: AttendanceLog[],
  userProfile: UserProfile | null,
  activeRole: 'Manager' | 'Employee',
  managedSector: string = 'All Teams'
): AttendanceLog[] {
  if (attendanceLogs.length === 0) return [];
  const userTeam = getUserTeamSector(userProfile);
  const userName = userProfile?.displayName?.toLowerCase() || '';

  if (activeRole === 'Employee') {
    return attendanceLogs.filter((log) => {
      const isUser = userName && log.userName.toLowerCase().includes(userName);
      const matchTeam = log.teamSector === userTeam;
      return isUser || matchTeam;
    });
  }

  if (!managedSector || managedSector === 'All Teams') {
    return attendanceLogs;
  }
  return attendanceLogs.filter((log) => !log.teamSector || log.teamSector === managedSector);
}
