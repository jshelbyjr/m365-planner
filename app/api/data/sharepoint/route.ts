import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * GET /api/data/sharepoint
 * Returns a list of SharePoint Sites from the database.
 */
export async function GET(req: NextRequest) {
  // Fetch all SharePoint sites with all fields for export
  const sites = await prisma.sharePointSite.findMany();
  return NextResponse.json(sites);
}

/**
 * POST /api/data/sharepoint
 * Adds a new SharePoint Site to the database.
 * Expects a JSON body matching the SharePointSite model.
 */
export async function POST(req: NextRequest) {
  const data = await req.json();
  // TODO: Add validation and sanitization here
  const site = await prisma.sharePointSite.create({ data });
  return NextResponse.json(site);
}
