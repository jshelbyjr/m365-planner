// file: app/api/scan/route.ts
// import type { M365Group, SecurityGroup } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/lib/graph.service';
import type { Group, User } from '@microsoft/microsoft-graph-types';


// GET handler to check the current scan status
export async function GET() {
  const scan = await prisma.scanLog.findUnique({ where: { id: 1 } }) ?? await prisma.scanLog.create({data: {id: 1, status: 'IDLE', dataType: 'groups'}});
  return NextResponse.json(scan);
}

// POST handler to start a new scan

export async function POST(request: Request) {
  // Supported scan types
  const scanHandlers = getScanHandlers();
  const supportedTypes = Object.keys(scanHandlers);

  // Parse dataType from request body (default to 'groups' for backward compatibility)
  let dataType = 'groups';
  try {
    const body = await request.json();
    if (typeof body.dataType === 'string' && supportedTypes.includes(body.dataType)) {
      dataType = body.dataType;
    }
  } catch (e) {
    // If no body or invalid JSON, fallback to default
  }

  if (!supportedTypes.includes(dataType)) {
    return NextResponse.json({ message: `Unsupported scan type: ${dataType}` }, { status: 400 });
  }

  // Check if a scan is already in progress
  const currentScan = await prisma.scanLog.findUnique({ where: { id: 1 } });
  if (currentScan?.status === 'IN_PROGRESS') {
    return NextResponse.json({ message: 'A scan is already in progress.' }, { status: 409 });
  }

  // Immediately update the scan status and return a response
  await prisma.scanLog.upsert({
    where: { id: 1 },
    update: { status: 'IN_PROGRESS', startedAt: new Date(), completedAt: null, error: null, dataType },
    create: { id: 1, status: 'IN_PROGRESS', startedAt: new Date(), dataType },
  });

  // Fire off the background scan process but don't wait for it to finish
  runScanInBackground(dataType, scanHandlers);

  return NextResponse.json({ message: 'Scan started.' }, { status: 202 });
}



// Handler mapping for scan types
function getScanHandlers() {
  return {
    users: handleUsersScan,
    groups: handleGroupsScan,
    teams: handleTeamsScan,
    // Add more types here as needed
  };
// Handler for teams scan
async function handleTeamsScan() {
  const client = await getAuthenticatedClient();
  const { getGroupOwners, getGroupMembers } = await import('@/app/lib/graph.service');
  // Clear old teams
  await prisma.team.deleteMany({});
  // Fetch Teams (filter groups with resourceProvisioningOptions/Any(x:x eq 'Team'))
  let teamsResponse = await client.api('/groups')
    .filter("resourceProvisioningOptions/Any(x:x eq 'Team')")
    .select('id,displayName,description,visibility,resourceProvisioningOptions')
    .get();
  const allUsers: Record<string, any> = {};
  const teams: any[] = [];
  const processTeams = async (groups: Group[]) => {
    for (const group of groups) {
      // Fetch all owners and members for this team using utility functions
      const [owners, members] = await Promise.all([
        getGroupOwners(group.id!),
        getGroupMembers(group.id!)
      ]);
      const ownerIds = owners.map((u: any) => u.id).filter(Boolean);
      const memberIds = members.map((u: any) => u.id).filter(Boolean);
      // Track all users for later upsert
      for (const u of [...owners, ...members]) {
        if (u && u.id) allUsers[u.id] = u;
      }
      teams.push({
        id: group.id!,
        displayName: group.displayName ?? null,
        description: group.description ?? null,
        visibility: group.visibility ?? null,
        ownerIds,
        memberIds
      });
    }
  };
  await processTeams(teamsResponse.value);
  while(teamsResponse['@odata.nextLink']) {
    teamsResponse = await client.api(teamsResponse['@odata.nextLink']).get();
    await processTeams(teamsResponse.value);
  }
  // Upsert all users found as owners/members
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
      }
    })
  );
  await Promise.all(userUpserts);
  // Create Teams and connect owners/members
  for (const t of teams) {
    await prisma.team.create({
      data: {
        id: t.id,
        displayName: t.displayName,
        description: t.description,
        visibility: t.visibility,
        owners: { connect: t.ownerIds.map((id: string) => ({ id })) },
        members: { connect: t.memberIds.map((id: string) => ({ id })) },
      }
    });
  }
}
}

// Main scan runner, dispatches to the correct handler
async function runScanInBackground(dataType: string, scanHandlers: Record<string, () => Promise<void>>) {
  try {
    console.log("Starting scan for", dataType);
    const handler = scanHandlers[dataType];
    if (!handler) throw new Error(`No handler for scan type: ${dataType}`);
    await handler();
    // Mark scan as completed
    await prisma.scanLog.update({
      where: { id: 1 },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  } catch (e: any) {
    // Mark scan as failed
    console.error("Scan failed:", e);
    await prisma.scanLog.update({
      where: { id: 1 },
      data: { status: 'FAILED', completedAt: new Date(), error: e.message },
    });
    console.error("Scan failed:", e);
  }
}

// Handler for users scan
async function handleUsersScan() {
  const client = await getAuthenticatedClient();
  // Clear old users
  await prisma.user.deleteMany({});
  console.log("Deleted old users");
  // Fetch Users
  const users: User[] = [];
  let usersResponse = await client.api('/users').select('id,displayName,userPrincipalName,accountEnabled,department,jobTitle').get();
  console.log("First usersResponse", usersResponse);
  users.push(...usersResponse.value);
  while(usersResponse['@odata.nextLink']) {
    usersResponse = await client.api(usersResponse['@odata.nextLink']).get();
    users.push(...usersResponse.value);
  }
  console.log("Total users fetched:", users.length);
  await prisma.user.createMany({
    data: users.map(u => ({
      id: u.id!,
      displayName: u.displayName,
      userPrincipalName: u.userPrincipalName,
      accountEnabled: u.accountEnabled,
      department: u.department,
      jobTitle: u.jobTitle,
    })),
  });
  console.log("Inserted users into DB");
}

// Handler for groups scan
async function handleGroupsScan() {
  const client = await getAuthenticatedClient();
  const { getGroupOwners, getGroupMembers } = await import('@/app/lib/graph.service');
  // Clear old groups
  await prisma.m365Group.deleteMany({});
  await prisma.securityGroup.deleteMany({});
  // Fetch Groups (Unified, but NOT Teams)
  let groupsResponse = await client.api('/groups')
    .filter("groupTypes/any(c:c eq 'Unified') and not(resourceProvisioningOptions/Any(x:x eq 'Team'))")
    .header('ConsistencyLevel', 'eventual')
    .select('id,displayName,groupTypes,mailNickname,securityEnabled,visibility')
    .get();
  const m365Groups: any[] = [];
  const securityGroups: any[] = [];
  const allUsers: Record<string, any> = {};
  const processGroups = async (groups: Group[]) => {
    for (const group of groups) {
      if (group.groupTypes?.includes('Unified')) {
        // Fetch all owners and members for this group using utility functions
        const [owners, members] = await Promise.all([
          getGroupOwners(group.id!),
          getGroupMembers(group.id!)
        ]);
        const ownerIds = owners.map((u: any) => u.id).filter(Boolean);
        const memberIds = members.map((u: any) => u.id).filter(Boolean);
        // Track all users for later upsert
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
          memberIds
        });
      } else if (group.securityEnabled) {
        securityGroups.push({
          id: group.id!,
          displayName: group.displayName ?? null,
          isDistributionGroup: !group.securityEnabled,
          memberCount: null
        });
      }
    }
  };
  await processGroups(groupsResponse.value);
  while(groupsResponse['@odata.nextLink']) {
    groupsResponse = await client.api(groupsResponse['@odata.nextLink']).get();
    await processGroups(groupsResponse.value);
  }
  // Upsert all users found as owners/members
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
      }
    })
  );
  await Promise.all(userUpserts);
  // Create M365 groups and connect owners/members
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
      }
    });
  }
  await prisma.securityGroup.createMany({ data: securityGroups });
}