// file: lib/graph.service.ts
import { PrismaClient } from '@prisma/client';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch'; // Required polyfill for the graph client

const prisma = new PrismaClient();

export async function getAuthenticatedClient() {
  const config = await prisma.configuration.findUnique({ where: { id: 1 } });
  if (!config) {
    throw new Error('Configuration not found. Please set credentials first.');
  }

  const { tenantId, clientId, clientSecret } = config;

  const credential = new ClientSecretCredential(
    tenantId,
    clientId,
    clientSecret
  );

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token.token;
      },
    },
  });

  return client;
}

/**
 * Fetch all members of a group from Microsoft Graph, handling paging.
 * @param groupId - The group (or team) ID
 */
export async function getGroupMembers(groupId: string) {
  const client = await getAuthenticatedClient();
  let members: any[] = [];
  let url = `/groups/${groupId}/members?$top=999`;
  while (url) {
    const response = await client.api(url).get();
    if (response.value) members = members.concat(response.value);
    url = response['@odata.nextLink'] ? response['@odata.nextLink'].replace('https://graph.microsoft.com/v1.0', '') : null;
  }
  return members;
}

/**
 * Fetch all owners of a group from Microsoft Graph, handling paging.
 * @param groupId - The group (or team) ID
 */
export async function getGroupOwners(groupId: string) {
  const client = await getAuthenticatedClient();
  let owners: any[] = [];
  let url = `/groups/${groupId}/owners?$top=999`;
  while (url) {
    const response = await client.api(url).get();
    if (response.value) owners = owners.concat(response.value);
    url = response['@odata.nextLink'] ? response['@odata.nextLink'].replace('https://graph.microsoft.com/v1.0', '') : null;
  }
  return owners;
}