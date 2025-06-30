

import { getDelegatedPowerPlatformAccessToken } from './msalClient';

/**
 * Get a Power Platform API access token using delegated user authentication (MSAL).
 * Uses OAuth 2.0 Authorization Code Flow via MSAL.js to acquire a user-context access token.
 *
 * See: https://learn.microsoft.com/en-us/power-platform/admin/programmability-authentication-v2
 *
 * @returns Power Platform API access token (delegated, user context)
 */
export async function getPowerPlatformAccessToken(): Promise<string> {
  return getDelegatedPowerPlatformAccessToken();
}

/**
 * Fetch all Power Platform environments for the tenant.
 * @param accessToken Power Platform API access token
 */
export async function fetchPowerPlatformEnvironments(accessToken: string) {
  const url = 'https://api.bap.microsoft.com/providers/Microsoft.BusinessAppPlatform/scopes/admin/environments?api-version=2020-10-01&$expand=properties.capacity,properties.addons';
  console.log(`[PowerPlatform] GET ${url}`);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  console.log(`[PowerPlatform] Response: ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const text = await res.text();
    console.error(`[PowerPlatform] Error body: ${text}`);
    throw new Error(`Failed to fetch environments: ${res.status}`);
  }
  return (await res.json()).value;
}

/**
 * Fetch all PowerApps for a given environment.
 * @param environmentId Environment ID
 * @param accessToken Power Platform API access token
 */
export async function fetchPowerAppsForEnvironment(environmentId: string, accessToken: string) {
  const url = `https://${environmentId}.environment.api.powerplatform.com/powerapps/apps?api-version=1`;
  console.log(`[PowerPlatform] GET ${url}`);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  console.log(`[PowerPlatform] Response: ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const text = await res.text();
    console.error(`[PowerPlatform] Error body: ${text}`);
    throw new Error(`Failed to fetch PowerApps for environment ${environmentId}: ${res.status}`);
  }
  return (await res.json()).value;
}

/**
 * Fetch all Flows for a given environment.
 * @param environmentId Environment ID
 * @param region Region (e.g., "usgov", "us", etc.)
 * @param accessToken Power Platform API access token
 */
export async function fetchFlowsForEnvironment(environmentId: string, region: string, accessToken: string) {
  const url = `https://${region}.api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/${environmentId}/flows?api-version=2016-11-01`;
  console.log(`[PowerPlatform] GET ${url}`);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  console.log(`[PowerPlatform] Response: ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const text = await res.text();
    console.error(`[PowerPlatform] Error body: ${text}`);
    throw new Error(`Failed to fetch Flows for environment ${environmentId}: ${res.status}`);
  }
  return (await res.json()).value;
}

/**
 * Resolve a user ID to a display name using Microsoft Graph.
 * @param userId User ID
 * @param graphAccessToken Microsoft Graph API access token
 */
export async function resolveUserIdToDisplayName(userId: string, graphAccessToken: string) {
  // Placeholder for user resolution logic
  // GET https://graph.microsoft.com/v1.0/users/{userId}
  // ...
}
