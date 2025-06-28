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

import { ExchangeMailbox } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { Client } from '@microsoft/microsoft-graph-client';

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

/**
 * Fetches Exchange Mailbox usage details from Microsoft Graph Reports API and parses CSV.
 * @param client Authenticated Microsoft Graph client
 * @returns Array of ExchangeMailbox objects
 */
export async function fetchExchangeMailboxUsage(client: Client): Promise<Partial<ExchangeMailbox>[]> {
  // The period can be D7, D30, D90, D180
  const period = 'D180';
  const responseStream = await client.api(`/reports/getMailboxUsageDetail(period='${period}')`).getStream();
  // Convert stream to string
  const chunks: Buffer[] = [];
  for await (const chunk of responseStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const csv = Buffer.concat(chunks).toString('utf8');

  // Parse CSV
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  });

  // Helper to get value by possible header variants
  const get = (row: any, ...keys: string[]) => {
    for (const k of keys) {
      const norm = k.toLowerCase().replace(/\s+/g, '');
      for (const h in row) {
        if (h.toLowerCase().replace(/\s+/g, '') === norm) {
          return row[h];
        }
      }
    }
    return undefined;
  };

  return records.map((row: any) => ({
    id: get(row, 'MailboxGuid', 'Id', 'Display Name'),
    displayName: get(row, 'Display Name'),
    isDeleted: get(row, 'Is Deleted') === 'True',
    deletedDate: get(row, 'Deleted Date') ? new Date(get(row, 'Deleted Date')) : undefined,
    createdDate: get(row, 'Created Date') ? new Date(get(row, 'Created Date')) : undefined,
    lastActivityDate: get(row, 'Last Activity Date') ? new Date(get(row, 'Last Activity Date')) : undefined,
    itemCount: get(row, 'Item Count') ? Number(get(row, 'Item Count')) : undefined,
    storageUsedBytes: get(row, 'Storage Used (Byte)') ? BigInt(get(row, 'Storage Used (Byte)')) : undefined,
    issueWarningQuotaBytes: get(row, 'Issue Warning Quota (Byte)') ? BigInt(get(row, 'Issue Warning Quota (Byte)')) : undefined,
    prohibitSendQuotaBytes: get(row, 'Prohibit Send Quota (Byte)') ? BigInt(get(row, 'Prohibit Send Quota (Byte)')) : undefined,
    prohibitSendReceiveQuotaBytes: get(row, 'Prohibit Send/Receive Quota (Byte)') ? BigInt(get(row, 'Prohibit Send/Receive Quota (Byte)')) : undefined,
    deletedItemCount: get(row, 'Deleted Item Count') ? Number(get(row, 'Deleted Item Count')) : undefined,
    deletedItemSizeBytes: get(row, 'Deleted Item Size (Byte)') ? BigInt(get(row, 'Deleted Item Size (Byte)')) : undefined,
    deletedItemQuotaBytes: get(row, 'Deleted Item Quota (Byte)') ? BigInt(get(row, 'Deleted Item Quota (Byte)')) : undefined,
    hasArchive: get(row, 'Has Archive') === 'True',
    recipientType: get(row, 'Recipient Type', 'RecipientType', 'Type'),
    reportPeriod: get(row, 'Report Period'),
    reportRefreshDate: get(row, 'Report Refresh Date') ? new Date(get(row, 'Report Refresh Date')) : undefined,
  }));
}
