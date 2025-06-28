// file: app/api/scan/route.ts
// import type { M365Group, SecurityGroup } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { runScan, scanHandlers } from '@/app/lib/scan.service';


// GET handler to check the current scan status
export async function GET() {
  const scan = await prisma.scanLog.findUnique({ where: { id: 1 } }) ?? await prisma.scanLog.create({data: {id: 1, status: 'IDLE', dataType: 'groups'}});
  return NextResponse.json(scan);
}

// POST handler to start a new scan
export async function POST(request: Request) {
  const supportedTypes = Object.keys(scanHandlers);
  let dataType = 'groups';
  try {
    const body = await request.json();
    if (typeof body.dataType === 'string' && supportedTypes.includes(body.dataType)) {
      dataType = body.dataType;
    }
  } catch (e) {
    // fallback to default
  }
  if (!supportedTypes.includes(dataType)) {
    return NextResponse.json({ message: `Unsupported scan type: ${dataType}` }, { status: 400 });
  }
  const currentScan = await prisma.scanLog.findUnique({ where: { id: 1 } });
  if (currentScan?.status === 'IN_PROGRESS') {
    return NextResponse.json({ message: 'A scan is already in progress.' }, { status: 409 });
  }
  await prisma.scanLog.upsert({
    where: { id: 1 },
    update: { status: 'IN_PROGRESS', startedAt: new Date(), completedAt: null, error: null, dataType },
    create: { id: 1, status: 'IN_PROGRESS', startedAt: new Date(), dataType },
  });
  // Fire off the background scan process but don't wait for it to finish
  runScanInBackground(dataType);
  return NextResponse.json({ message: 'Scan started.' }, { status: 202 });
}




// Main scan runner, dispatches to the correct handler and updates scan log
async function runScanInBackground(dataType: string) {
  try {
    console.log("Starting scan for", dataType);
    await runScan(dataType);
    await prisma.scanLog.update({
      where: { id: 1 },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  } catch (e: any) {
    console.error("Scan failed:", e);
    await prisma.scanLog.update({
      where: { id: 1 },
      data: { status: 'FAILED', completedAt: new Date(), error: e.message },
    });
  }
}