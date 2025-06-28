// file: lib/scan.service.ts
// Modular scan logic for each asset type in M365 Planner
import { prisma } from '@/app/lib/prisma';
import { getAuthenticatedClient } from '@/app/lib/graph.service';


/**
 * Handler for Domains scan
 */
export async function scanDomains() {
  const client = await getAuthenticatedClient();
  await prisma.domain.deleteMany({});
  let url = '/domains?$top=999';
  let domains: any[] = [];
  while (url) {
    const response = await client.api(url).get();
    if (response.value) domains = domains.concat(response.value);
    url = response['@odata.nextLink'] ? response['@odata.nextLink'].replace('https://graph.microsoft.com/v1.0', '') : null;
  }
  for (const d of domains) {
    await prisma.domain.create({
      data: {
        id: d.id,
        status: d.isVerified ? 'Verified' : 'Unverified',
      },
    });
  }
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
  let teamsResponse = await client.api('/groups')
    .filter("resourceProvisioningOptions/Any(x:x eq 'Team')")
    .select('id,displayName,description,visibility,resourceProvisioningOptions')
    .get();
  const allUsers: Record<string, any> = {};
  const teams: any[] = [];
  const processTeams = async (groups: any[]) => {
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
  };
  await processTeams(teamsResponse.value);
  while (teamsResponse['@odata.nextLink']) {
    teamsResponse = await client.api(teamsResponse['@odata.nextLink']).get();
    await processTeams(teamsResponse.value);
  }
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
}

/**
 * Handler for SharePoint scan
 */
export async function scanSharePoint() {
  const client = await getAuthenticatedClient();
  await prisma.sharePointSite.deleteMany({});
  let sitesResponse = await client.api('/sites?search=*').get();
  const allSites = sitesResponse.value || [];
  for (const site of allSites) {
    let storageUsed = null;
    let storageLimit = null;
    let filesCount = null;
    let externalSharing = null;
    try {
      const storage = await client.api(`/sites/${site.id}/drive`).get();
      storageUsed = storage?.quota?.used ? storage.quota.used / (1024 * 1024) : null;
      storageLimit = storage?.quota?.total ? storage.quota.total / (1024 * 1024) : null;
    } catch {}
    try {
      const children = await client.api(`/sites/${site.id}/drive/root/children?$top=1&$count=true`).header('ConsistencyLevel', 'eventual').get();
      filesCount = children['@odata.count'] ?? null;
    } catch {}
    try {
      const siteDetails = await client.api(`/sites/${site.id}`).get();
      externalSharing = siteDetails.sharingCapability ?? siteDetails.sharingStatus ?? null;
    } catch {}
    await prisma.sharePointSite.create({
      data: {
        id: site.id,
        name: site.displayName ?? site.name ?? null,
        url: site.webUrl ?? null,
        storageUsed,
        storageLimit,
        filesCount,
        externalSharing,
      },
    });
  }
}

/**
 * Handler for Users scan
 */
export async function scanUsers() {
  const client = await getAuthenticatedClient();
  await prisma.user.deleteMany({});
  const users: any[] = [];
  let usersResponse = await client.api('/users').select('id,displayName,userPrincipalName,accountEnabled,department,jobTitle').get();
  users.push(...usersResponse.value);
  while (usersResponse['@odata.nextLink']) {
    usersResponse = await client.api(usersResponse['@odata.nextLink']).get();
    users.push(...usersResponse.value);
  }
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
}

/**
 * Handler for Groups scan
 */
export async function scanGroups() {
  const client = await getAuthenticatedClient();
  const { getGroupOwners, getGroupMembers } = await import('@/app/lib/graph.service');
  await prisma.m365Group.deleteMany({});
  await prisma.securityGroup.deleteMany({});
  let groupsResponse = await client.api('/groups')
    .filter("groupTypes/any(c:c eq 'Unified') and not(resourceProvisioningOptions/Any(x:x eq 'Team'))")
    .header('ConsistencyLevel', 'eventual')
    .select('id,displayName,groupTypes,mailNickname,securityEnabled,visibility')
    .get();
  const m365Groups: any[] = [];
  const securityGroups: any[] = [];
  const allUsers: Record<string, any> = {};
  const processGroups = async (groups: any[]) => {
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
  };
  await processGroups(groupsResponse.value);
  while (groupsResponse['@odata.nextLink']) {
    groupsResponse = await client.api(groupsResponse['@odata.nextLink']).get();
    await processGroups(groupsResponse.value);
  }
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
  await prisma.securityGroup.createMany({ data: securityGroups });
}



/**
 * Map of scan handlers by type
 */
export const scanHandlers: { [key: string]: () => Promise<void> } = {
  users: scanUsers,
  groups: scanGroups,
  teams: scanTeams,
  sharepoint: scanSharePoint,
  onedrive: scanOneDrive,
  licenses: scanLicenses,
  domains: scanDomains,
};

/**
 * Main scan runner, dispatches to the correct handler
 */
export async function runScan(dataType: string) {
  const handler = scanHandlers[dataType];
  if (!handler) throw new Error(`No handler for scan type: ${dataType}`);
  await handler();
}
