import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getAuthenticatedClient } from '@/app/lib/graph.service';

/**
 * GET /api/data/teams
 * Returns a list of Microsoft Teams from the database.
 */
async function fetchChannelsForTeam(teamId: string, graphClient: any) {
  // Standard channels
  const standardChannels = await graphClient.api(`/teams/${teamId}/channels`).get();
  // Shared channels
  const sharedChannels = await graphClient.api(`/teams/${teamId}/channels?$filter=membershipType eq 'shared'`).get();
  // Public channels
  const publicChannels = await graphClient.api(`/teams/${teamId}/channels?$filter=membershipType eq 'standard' and isFavoriteByDefault eq true`).get();
  // Combine and deduplicate channels by id
  const allChannels = [
    ...(standardChannels.value || []),
    ...(sharedChannels.value || []),
    ...(publicChannels.value || []),
  ];
  const uniqueChannels = Array.from(new Map(allChannels.map(ch => [ch.id, ch])).values());
  return uniqueChannels;
}

export async function GET(req: NextRequest) {
  // Fetch teams from the database
  const teams = await prisma.team.findMany({
    include: {
      owners: true,
      members: true,
    },
  });

  // Get Graph client
  const graphClient = await getAuthenticatedClient();

  // For each team, fetch channels and add totalChannelCount
  const teamsWithChannels = await Promise.all(
    teams.map(async (team: any) => {
      let totalChannelCount = 0;
      try {
        const channels = await fetchChannelsForTeam(team.id, graphClient);
        totalChannelCount = channels.length;
      } catch (err) {
        totalChannelCount = 0;
      }
      return {
        ...team,
        totalChannelCount,
        memberCount: team.members ? team.members.length : 0,
      };
    })
  );

  return NextResponse.json(teamsWithChannels);
}
