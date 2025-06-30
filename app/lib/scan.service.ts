// #microsoft.docs.mcp: Power Platform API integration

import * as powerPlatform from '@/app/lib/powerPlatform.service';
import { prisma } from '@/app/lib/prisma';
import { getAuthenticatedClient } from '@/app/lib/graph.service';
import { fetchExchangeMailboxUsage } from '../../lib/graph.service';
import { paginatedScan } from '@/app/lib/paginatedScan';

/**
 * Handler for PowerApps scan (Power Platform Admin API)
 * #microsoft.docs.mcp
 */
export async function scanPowerApps(accessToken?: string) {
  if (!accessToken) throw new Error('Power Platform access token required');
  // Fetch all environments (should return an array)
  const environments = (await powerPlatform.fetchPowerPlatformEnvironments(accessToken) as unknown) as any[];
  if (!environments || !Array.isArray(environments)) return;
  await prisma.powerApp.deleteMany({});
  for (const env of environments) {
    // Fetch all PowerApps for this environment (should return an array)
    const apps = (await powerPlatform.fetchPowerAppsForEnvironment(env.id, accessToken) as unknown) as any[];
    if (!apps || !Array.isArray(apps)) continue;
    for (const app of apps) {
      await prisma.powerApp.upsert({
        where: { id: app.id },
        update: app,
        create: { ...app, environmentId: env.id },
      });
    }
  }
}

/**
 * Handler for PowerAutomate scan (Power Platform Admin API)
 * #microsoft.docs.mcp
 */
export async function scanPowerAutomate(accessToken?: string) {
  if (!accessToken) throw new Error('Power Platform access token required');
  // Fetch all environments (should return an array)
  const environments = (await powerPlatform.fetchPowerPlatformEnvironments(accessToken) as unknown) as any[];
  if (!environments || !Array.isArray(environments)) return;
  await prisma.powerAutomateFlow.deleteMany({});
  for (const env of environments) {
    // region may be needed for API endpoint
    const region = env.region || '';
    // Fetch all Flows for this environment (should return an array)
    const flows = (await powerPlatform.fetchFlowsForEnvironment(env.id, region, accessToken) as unknown) as any[];
    if (!flows || !Array.isArray(flows)) continue;
    for (const flow of flows) {
      await prisma.powerAutomateFlow.upsert({
        where: { id: flow.id },
        update: flow,
        create: { ...flow, environmentId: env.id },
      });
    }
  }
}
// Handler for Exchange Mailboxes scan
export async function scanExchangeMailboxes() {
  // Get authenticated Microsoft Graph client
  const client = await (await import('@/app/lib/graph.service')).getAuthenticatedClient();
  // Fetch mailbox usage data from Microsoft Graph
  const mailboxes = await fetchExchangeMailboxUsage(client);
  // Clear existing data
  await prisma.exchangeMailbox.deleteMany({});
  // Upsert each mailbox
  for (const mb of mailboxes) {
    if (!mb.id) continue;
    await prisma.exchangeMailbox.upsert({
      where: { id: mb.id },
      update: mb,
      create: { ...mb, id: mb.id },
    });
  }
}
async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}
// file: lib/scan.service.ts
// Modular scan logic for each asset type in M365 Planner
// Handler for Domains scan
export async function scanDomains() {
  const client = await getAuthenticatedClient();
  await prisma.domain.deleteMany({});
  await paginatedScan({
    client,
    dataType: 'domains',
    initialUrl: '/domains?$top=999',
    processPage: async (domains: any[]) => {
      if (!domains.length) return;
      await prisma.domain.createMany({
        data: domains.map((d) => ({
          id: d.id,
          status: d.isVerified ? 'Verified' : 'Unverified',
        })),

      });
    },
    logProgress: (page, total) => {
      console.log(`[scanDomains] Page ${page}, Total domains: ${total}`);
    },
  });
}

/**
 * Handler for Licenses scan
 */
export async function scanLicenses() {
  const client = await getAuthenticatedClient();
  await prisma.license.deleteMany({});
  let licensesResponse = await client.api('/subscribedSkus').get();
  const licenses = licensesResponse.value || [];
  for (const license of licenses) {
    await prisma.license.create({
      data: {
        id: license.skuId,
        skuPartNumber: license.skuPartNumber,
        displayName: license.skuPartNumber,
        status: license.capabilityStatus,
        totalSeats: license.prepaidUnits?.enabled ?? null,
        consumedSeats: license.consumedUnits ?? null,
        availableSeats: license.prepaidUnits?.enabled && license.consumedUnits !== undefined ? license.prepaidUnits.enabled - license.consumedUnits : null,
        prepaidUnits: license.prepaidUnits?.enabled ?? null,
        warningUnits: license.prepaidUnits?.warning ?? null,
        suspendedUnits: license.prepaidUnits?.suspended ?? null,
        assignedUnits: license.prepaidUnits?.assigned ?? null,
      },
    });
  }
}

/**
 * Handler for OneDrive scan
 */
export async function scanOneDrive() {
  const { getAllUsersOneDriveInfo } = await import('@/app/lib/graph.service');
  const drives = await getAllUsersOneDriveInfo();
  await prisma.oneDrive.deleteMany({});
  for (const drive of drives) {
    await prisma.oneDrive.upsert({
      where: { id: drive.id },
      update: drive,
      create: drive,
    });
  }
}

/**
 * Handler for Teams scan
 */
export async function scanTeams() {
  const client = await getAuthenticatedClient();
  const { getGroupOwners, getGroupMembers } = await import('@/app/lib/graph.service');
  await prisma.team.deleteMany({});
  const allUsers: Record<string, any> = {};
  await paginatedScan({
    client,
    dataType: 'teams',
    initialUrl: "/groups?$top=999&$filter=resourceProvisioningOptions/Any(x:x eq 'Team')",
    select: 'id,displayName,description,visibility,resourceProvisioningOptions',
    processPage: async (groups: any[]) => {
      const teams: any[] = [];
      for (const group of groups) {
        const [owners, members] = await Promise.all([
          getGroupOwners(group.id!),
          getGroupMembers(group.id!),
        ]);
        const ownerIds = owners.map((u: any) => u.id).filter(Boolean);
        const memberIds = members.map((u: any) => u.id).filter(Boolean);
        for (const u of [...owners, ...members]) {
          if (u && u.id) allUsers[u.id] = u;
        }
        teams.push({
          id: group.id!,
          displayName: group.displayName ?? null,
          description: group.description ?? null,
          visibility: group.visibility ?? null,
          ownerIds,
          memberIds,
        });
      }
      // Upsert users in batch
      const userUpserts = Object.values(allUsers).map((u: any) =>
        prisma.user.upsert({
          where: { id: u.id },
          update: {},
          create: {
            id: u.id,
            displayName: u.displayName,
            userPrincipalName: u.userPrincipalName,
            accountEnabled: u.accountEnabled,
            department: u.department,
            jobTitle: u.jobTitle,
          },
        })
      );
      await Promise.all(userUpserts);
      // Create teams in batch
      for (const t of teams) {
        await prisma.team.create({
          data: {
            id: t.id,
            displayName: t.displayName,
            description: t.description,
            visibility: t.visibility,
            owners: { connect: t.ownerIds.map((id: string) => ({ id })) },
            members: { connect: t.memberIds.map((id: string) => ({ id })) },
          },
        });
      }
    },
    logProgress: (page, total) => {
      console.log(`[scanTeams] Page ${page}, Total teams: ${total}`);
    },
  });
}

/**
 * Handler for SharePoint scan
 */
export async function scanSharePoint() {
  const client = await getAuthenticatedClient();
  await prisma.sharePointSite.deleteMany({});
  await paginatedScan({
    client,
    dataType: 'sharepoint',
    initialUrl: '/sites?search=*',
    processPage: async (sites: any[]) => {
      if (!sites.length) return;
      const siteData = await Promise.all(sites.map(async (site) => {
        let storageUsed = null;
        let storageLimit = null;
        let filesCount = null;
        let externalSharing = null;
        // Extract the correct GUID portion as the ID (everything after the first comma)
        let correctId = site.id;
        if (typeof site.id === 'string' && site.id.includes(',')) {
          const parts = site.id.split(',');
          // Remove the first part (domain), join the rest (handles both 2 and 3 part cases)
          correctId = parts.slice(1).join(',');
        }
        try {
          const storage = await client.api(`/sites/${site.id}/drive`).get();
          // Convert bytes to GB and format to 4 decimal places
          storageUsed = storage?.quota?.used ? Number((storage.quota.used / (1024 * 1024 * 1024)).toFixed(4)) : null;
          storageLimit = storage?.quota?.total ? Number((storage.quota.total / (1024 * 1024 * 1024)).toFixed(4)) : null;
        } catch {}
        try {
          const children = await client.api(`/sites/${site.id}/drive/root/children?$top=1&$count=true`).header('ConsistencyLevel', 'eventual').get();
          filesCount = children['@odata.count'] ?? null;
        } catch {}
        try {
          const siteDetails = await client.api(`/sites/${site.id}`).get();
          externalSharing = siteDetails.sharingCapability ?? siteDetails.sharingStatus ?? null;
        } catch {}
        return {
          id: correctId,
          name: site.displayName ?? site.name ?? null,
          url: site.webUrl ?? null,
          storageUsed,
          storageLimit,
          filesCount,
          externalSharing,
        };
      }));
      await prisma.sharePointSite.createMany({
        data: siteData,

      });
    },
    logProgress: (page, total) => {
      console.log(`[scanSharePoint] Page ${page}, Total sites: ${total}`);
    },
  });
}

/**
 * Handler for Users scan
 */

export async function scanUsers() {
  const client = await getAuthenticatedClient();
  await prisma.user.deleteMany({});
  await paginatedScan({
    client,
    dataType: 'users',
    initialUrl: '/users?$top=999',
    select: 'id,displayName,userPrincipalName,accountEnabled,department,jobTitle',
    processPage: async (users: any[]) => {
      if (!users.length) return;
      await prisma.user.createMany({
        data: users.map((u) => ({
          id: u.id!,
          displayName: u.displayName,
          userPrincipalName: u.userPrincipalName,
          accountEnabled: u.accountEnabled,
          department: u.department,
          jobTitle: u.jobTitle,
        })),

      });
    },
    logProgress: (page, total) => {
      // Optionally log progress
      console.log(`[scanUsers] Page ${page}, Total users: ${total}`);
    },
  });
}

/**
 * Handler for Groups scan
 */
export async function scanGroups() {
  const client = await getAuthenticatedClient();
  const { getGroupOwners, getGroupMembers } = await import('@/app/lib/graph.service');
  await prisma.m365Group.deleteMany({});
  await prisma.securityGroup.deleteMany({});
  const allUsers: Record<string, any> = {};
  await paginatedScan({
    client,
    dataType: 'groups',
    initialUrl: '/groups?$top=999',
    select: 'id,displayName,groupTypes,mailNickname,securityEnabled,visibility',
    headers: { 'ConsistencyLevel': 'eventual' },
    processPage: async (groups: any[]) => {
      const m365Groups: any[] = [];
      const securityGroups: any[] = [];
      for (const group of groups) {
        if (group.groupTypes?.includes('Unified')) {
          const [owners, members] = await Promise.all([
            getGroupOwners(group.id!),
            getGroupMembers(group.id!),
          ]);
          const ownerIds = owners.map((u: any) => u.id).filter(Boolean);
          const memberIds = members.map((u: any) => u.id).filter(Boolean);
          for (const u of [...owners, ...members]) {
            if (u && u.id) allUsers[u.id] = u;
          }
          m365Groups.push({
            id: group.id!,
            displayName: group.displayName ?? null,
            mailNickname: group.mailNickname ?? null,
            visibility: group.visibility ?? null,
            memberCount: memberIds.length,
            ownerIds,
            memberIds,
          });
        } else if (group.securityEnabled) {
          securityGroups.push({
            id: group.id!,
            displayName: group.displayName ?? null,
            isDistributionGroup: !group.securityEnabled,
            memberCount: null,
          });
        }
      }
      // Upsert users in batch
      const userUpserts = Object.values(allUsers).map((u: any) =>
        prisma.user.upsert({
          where: { id: u.id },
          update: {},
          create: {
            id: u.id,
            displayName: u.displayName,
            userPrincipalName: u.userPrincipalName,
            accountEnabled: u.accountEnabled,
            department: u.department,
            jobTitle: u.jobTitle,
          },
        })
      );
      await Promise.all(userUpserts);
      // Create M365 groups in batch
      for (const g of m365Groups) {
        await prisma.m365Group.create({
          data: {
            id: g.id,
            displayName: g.displayName,
            mailNickname: g.mailNickname,
            visibility: g.visibility,
            memberCount: g.memberCount,
            owners: { connect: g.ownerIds.map((id: string) => ({ id })) },
            members: { connect: g.memberIds.map((id: string) => ({ id })) },
          },
        });
      }
      // Create security groups in batch
      if (securityGroups.length) {
        await prisma.securityGroup.createMany({ data: securityGroups });
      }
    },
    logProgress: (page, total) => {
      console.log(`[scanGroups] Page ${page}, Total groups: ${total}`);
    },
  });
}


/**
 * Handler for SharePoint Site Usage scan
 */
export async function scanSharePointUsage() {
  const client = await getAuthenticatedClient();
  await prisma.sharePointSiteUsageDetail.deleteMany({});
  try {
    // Microsoft Graph API: /reports/getSharePointSiteUsageDetail(period='D180')
    const responseStream = await client.api("/reports/getSharePointSiteUsageDetail(period='D180')").getStream();
    const csv = await streamToString(responseStream);
    const parse = (await import('csv-parse/sync')).parse;
    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    if (!records.length) {
      console.warn('[SharePointUsage] No data lines found in CSV');
      return;
    }
    const headers = Object.keys(records[0]);
    console.log('[SharePointUsage] CSV Headers:', headers);
    console.log('[SharePointUsage] First data row:', records[0]);
    console.log(`[SharePointUsage] Parsed ${records.length} records`);
    // Map and insert records
    for (const rec of records) {
      try {
        // Helper to get value by possible header variants
        const get = (...keys: string[]) => {
          for (const k of keys) {
            const norm = k.toLowerCase().replace(/\s+/g, '');
            for (const h of headers) {
              if (h.toLowerCase().replace(/\s+/g, '') === norm) {
                return rec[h];
              }
            }
          }
          return null;
        };
        const idVal = get('Site Id') || '';
        const siteIdVal = get('Site Id') || null;
        const siteUrlVal = get('Site URL') || null;
        const ownerDisplayNameVal = get('Owner Display Name') || null;
        const isDeletedVal = get('Is Deleted');
        const lastActivityDateVal = get('Last Activity Date');
        const fileCountVal = get('File Count');
        const activeFileCountVal = get('Active File Count');
        const pageViewCountVal = get('Page View Count');
        const visitedPageCountVal = get('Visited Page Count');
        const storageUsedBytesVal = get('Storage Used (Byte)');
        const storageAllocatedBytesVal = get('Storage Allocated (Byte)');
        const rootWebTemplateVal = get('Root Web Template');
        const ownerPrincipalNameVal = get('Owner Principal Name');
        const reportPeriodVal = get('Report Period') || null;
        const reportRefreshDateVal = get('Report Refresh Date');
        const siteNameVal = get('Site Name') || null;
        await prisma.sharePointSiteUsageDetail.create({
          data: {
            id: idVal,
            siteId: siteIdVal,
            siteUrl: siteUrlVal, // Will be updated in denormalization step
            ownerDisplayName: ownerDisplayNameVal,
            isDeleted: typeof isDeletedVal === 'string' ? isDeletedVal.toLowerCase() === 'true' : null,
            lastActivityDate: typeof lastActivityDateVal === 'string' && lastActivityDateVal ? new Date(lastActivityDateVal) : null,
            fileCount: typeof fileCountVal === 'string' && fileCountVal ? parseInt(fileCountVal, 10) : null,
            activeFileCount: typeof activeFileCountVal === 'string' && activeFileCountVal ? parseInt(activeFileCountVal, 10) : null,
            pageViewCount: typeof pageViewCountVal === 'string' && pageViewCountVal ? parseInt(pageViewCountVal, 10) : null,
            visitedPageCount: typeof visitedPageCountVal === 'string' && visitedPageCountVal ? parseInt(visitedPageCountVal, 10) : null,
            storageUsedBytes: typeof storageUsedBytesVal === 'string' && storageUsedBytesVal ? BigInt(storageUsedBytesVal) : null,
            storageAllocatedBytes: typeof storageAllocatedBytesVal === 'string' && storageAllocatedBytesVal ? BigInt(storageAllocatedBytesVal) : null,
            rootWebTemplate: rootWebTemplateVal,
            ownerPrincipalName: ownerPrincipalNameVal,
            reportPeriod: reportPeriodVal,
            reportRefreshDate: typeof reportRefreshDateVal === 'string' && reportRefreshDateVal ? new Date(reportRefreshDateVal) : null,
            siteName: siteNameVal,
          },
        });
      } catch (err) {
        console.error('[SharePointUsage] Error inserting record:', err, rec);
      }
    }
  } catch (err) {
    console.error('[SharePointUsage] Error in scanSharePointUsage:', err);
  }
}

/**
 * Denormalize SharePoint Usage table by copying siteUrl from SharePoint table
 */

/**
 * Batch fetch missing SharePoint site details by ID and update usage records
 */
export async function denormalizeSharePointUsageUrls() {
  const client = await getAuthenticatedClient();
  // Find all usage records missing either siteUrl or siteName
  const missingRecords = await prisma.sharePointSiteUsageDetail.findMany({
    where: {
      OR: [
        { siteUrl: null },
        { siteName: null },
        { siteUrl: '' },
        { siteName: '' },
      ],
      siteId: { not: null },
    },
    select: { id: true, siteId: true },
  });
  if (!missingRecords.length) {
    console.log('[denormalizeSharePointUsageUrls] No missing siteUrl or siteName to update.');
    return;
  }
  // Batch in groups of 20
  const batchSize = 20;
  let updatedCount = 0;
  for (let i = 0; i < missingRecords.length; i += batchSize) {
    const batch = missingRecords.slice(i, i + batchSize);
    const batchRequests = batch.map((rec, idx) => ({
      id: rec.id,
      method: 'GET',
      url: `/sites/${rec.siteId}`,
    }));
    try {
      const response = await client.api('/$batch').post({ requests: batchRequests });
      const responses = response.responses || [];
      for (const res of responses) {
        if (res.status === 200 && res.body) {
          const { id, webUrl, displayName, name } = res.body;
          // Find the corresponding usage record
          const usageId = res.id;
          await prisma.sharePointSiteUsageDetail.update({
            where: { id: usageId },
            data: {
              siteUrl: webUrl ?? null,
              siteName: displayName ?? name ?? null,
            },
          });
          updatedCount++;
          console.log(`[denormalizeSharePointUsageUrls] Updated usage id=${usageId} to url=${webUrl}, name=${displayName ?? name}`);
        } else {
          console.warn(`[denormalizeSharePointUsageUrls] Batch response error for id=${res.id}: status=${res.status}`);
        }
      }
    } catch (err) {
      console.error('[denormalizeSharePointUsageUrls] Batch request error:', err);
    }
  }
  console.log(`[denormalizeSharePointUsageUrls] Updated ${updatedCount} records with missing siteUrl or siteName.`);
}



/**
 * Map of scan handlers by type
 */
export const scanHandlers: { [key: string]: (accessToken?: string) => Promise<void> } = {
  users: () => scanUsers(),
  groups: () => scanGroups(),
  teams: () => scanTeams(),
  sharepoint: () => scanSharePoint(),
  onedrive: () => scanOneDrive(),
  licenses: () => scanLicenses(),
  domains: () => scanDomains(),
  sharepointUsage: async () => {
    await scanSharePoint();
    await scanSharePointUsage();
    await denormalizeSharePointUsageUrls();
  },
  exchangeMailboxes: () => scanExchangeMailboxes(),
  powerapps: (accessToken?: string) => scanPowerApps(accessToken),
  powerautomate: (accessToken?: string) => scanPowerAutomate(accessToken),
};

/**
 * Main scan runner, dispatches to the correct handler
 */
export async function runScan(dataType: string, accessToken?: string) {
  const handler = scanHandlers[dataType];
  if (!handler) throw new Error(`No handler for scan type: ${dataType}`);
  // For Power Platform types, pass accessToken
  if (['powerapps', 'powerautomate'].includes(dataType)) {
    await handler(accessToken);
  } else {
    await handler();
  }
}

