import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// POST /api/data/users/scan - Start a scan for users
export async function POST(request: Request) {
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
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    return NextResponse.json({ status: 'COMPLETED' });
  } catch (error) {
    await prisma.scanLog.update({
      where: { id: scanLog.id },
      data: { status: 'FAILED', completedAt: new Date(), error: String(error) },
    });
    return NextResponse.json({ status: 'FAILED', error: String(error) }, { status: 500 });
  }
}
