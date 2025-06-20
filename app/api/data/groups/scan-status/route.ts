import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/data/groups/scan-status - Get latest scan status for groups
export async function GET() {
  try {
    const latestScan = await prisma.scanLog.findFirst({
      where: { dataType: 'groups' },
      orderBy: { startedAt: 'desc' },
    });
    if (!latestScan) {
      return NextResponse.json({ status: 'NOT_STARTED' });
    }
    return NextResponse.json({
      status: latestScan.status,
      startedAt: latestScan.startedAt,
      completedAt: latestScan.completedAt,
      error: latestScan.error,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'FAILED', 
      error: String(error), 
      stack: error?.stack,
      prisma: error?.meta,
    }, { status: 500 });
  }
}
