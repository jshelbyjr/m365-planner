/**
 * Utility functions for M365 metric calculations (totals, storage, etc.)
 * All functions are pure and well-typed for reuse and testability.
 */

// Types for input data
export type User = { id: string; displayName: string; userPrincipalName: string; accountEnabled: boolean };
export type OneDrive = { id: string; size?: number };
export type SharePointSite = { id: string; name?: string; storageUsed?: number };
export type License = { assignedUnits?: number };

/**
 * Returns the total number of items in an array.
 */
export function getTotal<T>(arr: T[]): number {
  return arr.length;
}

/**
 * Returns the count of users with accountEnabled true.
 */
export function getActiveUsers(users: User[]): number {
  return users.filter((u) => u.accountEnabled).length;
}

/**
 * Returns the count of users with accountEnabled false.
 */
export function getDisabledUsers(users: User[]): number {
  return users.length - getActiveUsers(users);
}

/**
 * Returns the total storage (in GB) for OneDrive or SharePointSite arrays.
 */
export function getTotalStorage<T extends { size?: number; storageUsed?: number }>(arr: T[], key: 'size' | 'storageUsed'): number {
  return arr.reduce((sum, item) => sum + (typeof item[key] === 'number' ? (item[key] as number) : 0), 0) / (1024 ** 3);
}

/**
 * Returns the sum of assigned license units.
 */
export function getTotalAssignedLicenses(licenses: License[]): number {
  return licenses.reduce((sum, l) => sum + (typeof l.assignedUnits === 'number' ? l.assignedUnits : 0), 0);
}

/**
 * Returns SharePoint storage for groups or teams by slicing the sites array.
 */
export function getSharePointStorageForEntities(sites: SharePointSite[], start: number, end: number): number {
  return sites.slice(start, end).reduce((sum, s) => sum + (typeof s.storageUsed === 'number' ? s.storageUsed : 0), 0) / (1024 ** 3);
}

/**
 * Returns standalone SharePoint storage (not associated with groups or teams).
 */
export function getStandaloneSharePointStorage(total: number, group: number, team: number): number {
  return total - group - team;
}
