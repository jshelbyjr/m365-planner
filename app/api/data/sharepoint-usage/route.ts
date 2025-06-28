import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * GET /api/data/sharepoint-usage
 * Returns a list of SharePoint Site Usage Details from the database.
 */
export async function GET(req: NextRequest) {
  const usageDetails = await prisma.sharePointSiteUsageDetail.findMany();
  return NextResponse.json(usageDetails);
}
