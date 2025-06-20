// file: app/api/data/users/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // If path is /scan-status, return latest scan status for users
  if (request.url.endsWith('/scan-status')) {
    const latest = await prisma.scanLog.findFirst({
      where: { dataType: 'users' },
      orderBy: { startedAt: 'desc' },
    });
    return NextResponse.json(latest);
  }
  // Default: return users
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  // Start a scan for users and log status in ScanLog
  const scanType = 'users';
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
    // TODO: Replace with actual scan logic for users (e.g., fetch from Graph API)
    // Simulate scan delay
    // await new Promise((res) => setTimeout(res, 2000));
    // Example: await scanUsers();

    // Set scan status to COMPLETED
    await prisma.scanLog.update({
      where: { id: scanLog.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
    return NextResponse.json({ message: 'User scan completed.' }, { status: 200 });
  } catch (error: any) {
    await prisma.scanLog.update({
      where: { id: scanLog.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: error.message || 'Unknown error',
      },
    });
    return NextResponse.json({ message: 'User scan failed.', error: error.message }, { status: 500 });
  }
}