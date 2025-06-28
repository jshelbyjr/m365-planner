// Centralized M365 Data Types
// Use this file to import shared types across the app

/**
 * Represents a Microsoft 365 Domain.
 */
export type Domain = {
  id: string;
  status?: string;
};

/**
 * Represents a Microsoft 365 Group.
 */
export type Group = {
  id: string;
  displayName: string;
  mailNickname?: string;
  memberCount?: number;
  visibility?: string;
};

/**
 * Represents a Microsoft Teams Team.
 */
export interface Team {
  id: string;
  displayName: string;
  description?: string;
  visibility?: string;
  memberCount?: number;
  totalChannelCount?: number;
}
