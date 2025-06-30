// file: lib/graph.service.ts

import { PrismaClient } from '@prisma/client';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { decrypt } from './encryption';
import 'isomorphic-fetch'; // Required polyfill for the graph client

const prisma = new PrismaClient();

/**
 * Fetch OneDrive info for all users in the tenant.
 * Returns: [{ id, ownerId, ownerName, siteName, siteUrl, size }]
 */
export async function getAllUsersOneDriveInfo() {
  const client = await getAuthenticatedClient();
  // Get all users (could be paged)
  let users: any[] = [];
  let url = '/users?$select=id,displayName,userPrincipalName&$top=999';
  while (url) {
    const response = await client.api(url).get();
    if (response.value) users = users.concat(response.value);
    url = response['@odata.nextLink'] ? response['@odata.nextLink'].replace('https://graph.microsoft.com/v1.0', '') : null;
  }

  const drives: any[] = [];
  for (const user of users) {
    try {
      // Get the user's drive
      const drive = await client.api(`/users/${user.id}/drive`).get();
      drives.push({
        id: drive.id,
        ownerId: user.id,
        ownerName: user.displayName || user.userPrincipalName,
        siteName: drive.name,
        siteUrl: drive.webUrl,
        size: drive.quota?.used || 0,
      });
    } catch (err) {
      // User may not have a drive provisioned; skip
      continue;
    }
  }
  return drives;
}

export async function getAuthenticatedClient() {
  const config = await prisma.configuration.findUnique({ where: { id: 1 } });
  if (!config) {
    throw new Error('Configuration not found. Please set credentials first.');
  }

  const { tenantId, clientId, clientSecret } = config;
  if (!clientSecret) {
    throw new Error('Client secret is not set.');
  }
  // Decrypt the client secret before use
  const decryptedSecret = decrypt(clientSecret);

  const credential = new ClientSecretCredential(
    tenantId,
    clientId,
    decryptedSecret
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