// lib/constants.ts
// Centralized constants and enums for API endpoints and status strings

/**
 * API endpoint paths used throughout the app.
 */
export const API_ENDPOINTS = {
  CONFIG: '/api/config',
  TEST_AUTH: '/api/test-auth',
  SCAN: '/api/scan',
  DATA: {
    USERS: '/api/data/users',
    GROUPS: '/api/data/groups',
    TEAMS: '/api/data/teams',
    LICENSES: '/api/data/licenses',
    SHAREPOINT: '/api/data/sharepoint',
    ONEDRIVE: '/api/data/onedrive',
    DOMAINS: '/api/data/domains',
  },
};

/**
 * Common status strings for async operations and data states.
 */
export enum Status {
  IDLE = 'idle',
  TESTING = 'testing',
  SUCCESS = 'success',
  ERROR = 'error',
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}

/**
 * Example: Domain verification status (expand as needed)
 */
export enum DomainStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
}
