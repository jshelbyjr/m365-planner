import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/data/powerautomate
export async function GET(req: NextRequest) {
  try {
    const flows = await prisma.powerAutomateFlow.findMany({
      include: {
        environment: true,
        owner: true,
      },
    });
    // Map to match FlowRow shape
    const result = flows.map((flow: any) => ({
      id: flow.id,
      name: flow.name,
      environmentName: flow.environment?.name,
      ownerName: flow.owner?.displayName,
      lastRunTime: flow.lastRunTime?.toISOString(),
      connection: flow.connection,
    }));
    return NextResponse.json({ flows: result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Power Automate Flows data' }, { status: 500 });
  }
}
