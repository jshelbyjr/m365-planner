// file: app/api/data/groups/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // If path is /scan-status, return latest scan status for groups
  // Removed scan-status logic
  // Default: return groups
  const m365Groups = await prisma.m365Group.findMany();
  const securityGroups = await prisma.securityGroup.findMany();
  return NextResponse.json({ m365Groups, securityGroups });
}

export async function POST(request: Request) {
  // Start a scan for groups and log status in ScanLog
  const scanType = 'groups';
  const startedAt = new Date();
  // Set scan status to IN_PROGRESS
  const scanLog = await prisma.scanLog.create({
    data: {
      dataType: scanType,
      status: 'IN_PROGRESS',
      startedAt,
    },
  });

  try {
    // TODO: Replace with actual scan logic for groups (e.g., fetch from Graph API)
    // Simulate scan delay
    // await new Promise((res) => setTimeout(res, 2000));
    // Example: await scanGroups();

    // Set scan status to COMPLETED
    await prisma.scanLog.update({
      where: { id: scanLog.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
    return NextResponse.json({ message: 'Groups scan completed.' }, { status: 200 });
  } catch (error: any) {
    await prisma.scanLog.update({
      where: { id: scanLog.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: error.message || 'Unknown error',
      },
    });
    return NextResponse.json({ message: 'Groups scan failed.', error: error.message }, { status: 500 });
  }
}