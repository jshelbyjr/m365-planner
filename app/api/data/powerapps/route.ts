import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/data/powerapps
export async function GET(req: NextRequest) {
  try {
    const powerApps = await prisma.powerApp.findMany({
      include: {
        environment: true,
        owner: true,
      },
    });
    // Map to match PowerAppRow shape
    const result = powerApps.map((app: any) => ({
      id: app.id,
      name: app.name,
      type: app.type,
      environmentName: app.environment?.name,
      ownerName: app.owner?.displayName,
      lastAccessed: app.lastAccessed?.toISOString(),
      connection: app.connection,
    }));
    return NextResponse.json({ powerApps: result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Power Apps data' }, { status: 500 });
  }
}
