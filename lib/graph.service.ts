/**
 * Fetches Microsoft 365 domains from Microsoft Graph API.
 * @param accessToken OAuth access token for Graph API
 * @returns Array of domain info objects
 */
export async function getDomainsFromGraph(accessToken?: string): Promise<any[]> {
  // If accessToken is not provided, you should implement your own logic to retrieve it
  // For now, throw if not provided
  if (!accessToken) {
    throw new Error('Access token is required to fetch domains from Microsoft Graph');
  }
  const response = await fetch('https://graph.microsoft.com/v1.0/domains', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch domains from Microsoft Graph');
  }
  const data = await response.json();
  return data.value || [];
}
import { License } from '@prisma/client';

/**
 * Fetches Microsoft 365 licenses (subscribed SKUs) from Microsoft Graph API.
 * @param accessToken OAuth access token for Graph API
 * @returns Array of license info objects
 */
export async function fetchLicensesFromGraph(accessToken: string): Promise<Partial<License>[]> {
  const response = await fetch('https://graph.microsoft.com/v1.0/subscribedSkus', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch licenses from Microsoft Graph');
  }
  const data = await response.json();
  return (data.value || []).map((sku: any) => ({
    id: sku.skuId,
    skuPartNumber: sku.skuPartNumber,
    displayName: sku.skuPartNumber, // You may want to map to a friendlier name
    status: sku.capabilityStatus,
    totalSeats: sku.prepaidUnits?.enabled,
    consumedSeats: sku.consumedUnits,
    availableSeats: sku.prepaidUnits?.enabled - sku.consumedUnits,
    prepaidUnits: sku.prepaidUnits?.enabled,
    warningUnits: sku.prepaidUnits?.warning,
    suspendedUnits: sku.prepaidUnits?.suspended,
    assignedUnits: sku.consumedUnits,
  }));
}
