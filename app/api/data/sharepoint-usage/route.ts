import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * GET /api/data/sharepoint-usage
 * Returns a list of SharePoint Site Usage Details from the database.
 */
export async function GET(req: NextRequest) {
  const usageDetails = await prisma.sharePointSiteUsageDetail.findMany();
  // Convert BigInt fields to strings for JSON serialization
  const safeDetails = usageDetails.map((item) => ({
    ...item,
    storageUsedBytes: item.storageUsedBytes !== null && item.storageUsedBytes !== undefined ? item.storageUsedBytes.toString() : null,
    storageAllocatedBytes: item.storageAllocatedBytes !== null && item.storageAllocatedBytes !== undefined ? item.storageAllocatedBytes.toString() : null,
  }));
  return NextResponse.json(safeDetails);
}
