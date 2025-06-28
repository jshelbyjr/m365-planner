import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * GET /api/data/teams
 * Returns a list of Microsoft Teams from the database.
 */
export async function GET(req: NextRequest) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: true
      }
    });
    // Add memberCount to each team
    const teamsWithCount = teams.map((team: any) => ({
      ...team,
      memberCount: team.members.length
    }));
    return NextResponse.json({ teams: teamsWithCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teams.' }, { status: 500 });
  }
}
