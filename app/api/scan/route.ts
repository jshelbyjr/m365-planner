
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { runScan, scanHandlers } from '@/app/lib/scan.service';
import { Status } from '../../lib/constants';

// GET handler to check the current scan status for a data type
export async function GET(request: Request) {
  const url = new URL(request.url);
  const dataType = url.searchParams.get('dataType') || 'groups';
  let scan = await prisma.scanLog.findUnique({ where: { dataType } });
  if (!scan) {
    scan = await prisma.scanLog.create({ data: { dataType, status: Status.IDLE } });
  }
  return NextResponse.json(scan);
}

// POST handler to start a new scan for a data type
export async function POST(request: Request) {
  const supportedTypes = Object.keys(scanHandlers);
  let dataType = 'groups';
  let accessToken: string | undefined;
  try {
    const body = await request.json();
    if (typeof body.dataType === 'string' && supportedTypes.includes(body.dataType)) {
      dataType = body.dataType;
    }
    if (typeof body.accessToken === 'string') {
      accessToken = body.accessToken;
    }
  } catch (e) {
    // fallback to default
  }
  if (!supportedTypes.includes(dataType)) {
    return NextResponse.json({ status: Status.ERROR, message: `Unsupported scan type: ${dataType}` }, { status: 400 });
  }
  const currentScan = await prisma.scanLog.findUnique({ where: { dataType } });
  if (currentScan?.status === Status.TESTING) {
    return NextResponse.json({ status: Status.ERROR, message: 'A scan is already in progress.' }, { status: 409 });
  }
  await prisma.scanLog.upsert({
    where: { dataType },
    update: { status: Status.TESTING, startedAt: new Date(), completedAt: null, error: null },
    create: { dataType, status: Status.TESTING, startedAt: new Date() },
  });
  // Fire off the background scan process but don't wait for it to finish
  runScanInBackground(dataType, accessToken);
  return NextResponse.json({ status: Status.SUCCESS, message: 'Scan started.' }, { status: 202 });
}

// Main scan runner, dispatches to the correct handler and updates scan log
async function runScanInBackground(dataType: string, accessToken?: string) {
  try {
    console.log("Starting scan for", dataType);
    // Ensure scanLog exists before updating
    await prisma.scanLog.upsert({
      where: { dataType },
      update: {},
      create: { dataType, status: Status.TESTING, startedAt: new Date() },
    });
    await runScan(dataType, accessToken);
    await prisma.scanLog.upsert({
      where: { dataType },
      update: { status: Status.SUCCESS, completedAt: new Date() },
      create: { dataType, status: Status.SUCCESS, completedAt: new Date() },
    });
  } catch (e: any) {
    console.error("Scan failed:", e);
    // Ensure scanLog exists before updating error
    await prisma.scanLog.upsert({
      where: { dataType },
      update: { status: Status.ERROR, completedAt: new Date(), error: e.message },
      create: { dataType, status: Status.ERROR, startedAt: new Date(), completedAt: new Date(), error: e.message },
    });
  }
}