import { describe, it, expect } from 'vitest';
import { UserProfile } from '../../src/types';

// Role determination logic mirroring AuthContext
export function determineUserRole(
  profile: Partial<UserProfile>,
  isCreatingTeam: boolean = false,
  customRole?: string
): { isManager: boolean; activeRole: 'Manager' | 'Employee' } {
  const isManagerRequested =
    isCreatingTeam ||
    customRole === 'Operations Manager' ||
    (customRole &&
      (customRole.toLowerCase().includes('manager') || customRole.toLowerCase().includes('director')));

  const isManager = Boolean(
    isManagerRequested ||
      profile.isTeamManager ||
      profile.role?.toLowerCase().includes('manager') ||
      profile.role?.toLowerCase().includes('director') ||
      profile.permissionStatus === 'elevated'
  );

  return {
    isManager,
    activeRole: isManager ? 'Manager' : 'Employee',
  };
}

describe('Auth Role Assignment & Team Manager Promotion', () => {
  it('assigns Manager activeRole when creating a new team', () => {
    const result = determineUserRole({}, true, 'Operations Manager');
    expect(result.isManager).toBe(true);
    expect(result.activeRole).toBe('Manager');
  });

  it('assigns Employee activeRole for default field technician signup', () => {
    const result = determineUserRole({}, false, 'Hydro-Geologist');
    expect(result.isManager).toBe(false);
    expect(result.activeRole).toBe('Employee');
  });

  it('preserves Manager role for existing team manager profiles during login', () => {
    const managerProfile: Partial<UserProfile> = {
      isTeamManager: true,
      role: 'Operations Manager',
      permissionStatus: 'approved',
    };
    const result = determineUserRole(managerProfile);
    expect(result.isManager).toBe(true);
    expect(result.activeRole).toBe('Manager');
  });

  it('preserves Employee role for standard field operator profiles during login', () => {
    const employeeProfile: Partial<UserProfile> = {
      isTeamManager: false,
      role: 'Field Technician',
      permissionStatus: 'pending_review',
    };
    const result = determineUserRole(employeeProfile);
    expect(result.isManager).toBe(false);
    expect(result.activeRole).toBe('Employee');
  });

  it('elevates user to Manager when customRole contains Manager or Director', () => {
    const directorResult = determineUserRole({}, false, 'Regional Director');
    expect(directorResult.isManager).toBe(true);
    expect(directorResult.activeRole).toBe('Manager');
  });
});
