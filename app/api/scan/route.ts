// file: app/api/scan/route.ts
import type { M365Group, SecurityGroup } from '@prisma/client';
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
  // Parse dataType from request body (default to 'groups' for backward compatibility)
  let dataType = 'groups';
  try {
    const body = await request.json();
    if (body.dataType === 'users' || body.dataType === 'groups') {
      dataType = body.dataType;
    }
  } catch (e) {
    // If no body or invalid JSON, fallback to default
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
  runScanInBackground(dataType as 'users' | 'groups');

  return NextResponse.json({ message: 'Scan started.' }, { status: 202 });
}



// This function runs the data collection process for the requested type.
async function runScanInBackground(dataType: 'users' | 'groups') {
  try {
    const client = await getAuthenticatedClient();

    if (dataType === 'users') {
      // Clear old users
      await prisma.user.deleteMany({});
      // Fetch Users
      const users: User[] = [];
      let usersResponse = await client.api('/users').select('id,displayName,userPrincipalName,accountEnabled,department,jobTitle').get();
      users.push(...usersResponse.value);
      while(usersResponse['@odata.nextLink']) {
        usersResponse = await client.api(usersResponse['@odata.nextLink']).get();
        users.push(...usersResponse.value);
      }
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
    } else if (dataType === 'groups') {
      // Clear old groups
      await prisma.m365Group.deleteMany({});
      await prisma.securityGroup.deleteMany({});
      // Fetch Groups
      const m365Groups: M365Group[] = [];
      const securityGroups: SecurityGroup[] = [];
      let groupsResponse = await client.api('/groups').select('id,displayName,groupTypes,mailNickname,securityEnabled,visibility').get();
      const processGroups = (groups: Group[]) => {
        for (const group of groups) {
          if (group.groupTypes?.includes('Unified')) {
            m365Groups.push({
              id: group.id!,
              displayName: group.displayName ?? null,
              mailNickname: group.mailNickname ?? null,
              visibility: group.visibility ?? null,
              memberCount: null
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
      processGroups(groupsResponse.value);
      while(groupsResponse['@odata.nextLink']) {
        groupsResponse = await client.api(groupsResponse['@odata.nextLink']).get();
        processGroups(groupsResponse.value);
      }
      await prisma.m365Group.createMany({ data: m365Groups });
      await prisma.securityGroup.createMany({ data: securityGroups });
    }

    // Mark scan as completed
    await prisma.scanLog.update({
      where: { id: 1 },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

  } catch (e: any) {
    // Mark scan as failed
    await prisma.scanLog.update({
      where: { id: 1 },
      data: { status: 'FAILED', completedAt: new Date(), error: e.message },
    });
    console.error("Scan failed:", e);
  }
}