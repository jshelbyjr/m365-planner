import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

import { getAllUsersOneDriveInfo } from '@/app/lib/graph.service';

/**
 * GET /api/data/onedrive
 * Returns a list of OneDrive entries from the database.
 */
export async function GET(req: NextRequest) {
  const drives = await prisma.oneDrive.findMany();
  return NextResponse.json(drives);
}

/**
 * POST /api/data/onedrive
 * Adds a new OneDrive entry to the database.
 * Expects a JSON body matching the OneDrive model.
 */
export async function POST(req: NextRequest) {
  const data = await req.json();
  // TODO: Add validation and sanitization here
  const drive = await prisma.oneDrive.create({ data });
  return NextResponse.json(drive);
}


/**
 * POST /api/data/onedrive/refresh
 * Fetches all OneDrive data from Microsoft Graph and upserts into the database.
 */
export async function PUT(req: NextRequest) {
  // Only allow refresh with a specific query param or header for safety (optional)
  // Fetch from Graph
  const drives = await getAllUsersOneDriveInfo();
  // Upsert all drives
  for (const drive of drives) {
    await prisma.oneDrive.upsert({
      where: { id: drive.id },
      update: drive,
      create: drive,
    });
  }
  return NextResponse.json({ count: drives.length });
}
