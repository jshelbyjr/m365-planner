import { PrismaClient } from '@prisma/client';
import { ClientSecretCredential } from '@azure/identity';
import { decrypt } from './encryption';

const prisma = new PrismaClient();

/**
 * Get a Power Platform API access token using the same credentials as Graph.
 * Reuses the Graph token if it has the right scope, otherwise requests a new one.
 * #microsoft.docs.mcp
 */
export async function getPowerPlatformAccessToken(): Promise<string> {
  // Try to get credentials from config (same as graph.service.ts)
  const config = await prisma.configuration.findUnique({ where: { id: 1 } });
  if (!config) throw new Error('Configuration not found. Please set credentials first.');
  const { tenantId, clientId, clientSecret } = config;
  if (!clientSecret) throw new Error('Client secret is not set.');
  const decryptedSecret = decrypt(clientSecret);
  const credential = new ClientSecretCredential(tenantId, clientId, decryptedSecret);
  // Power Platform Admin API scope
  const scope = 'https://api.bap.microsoft.com/.default';
  const token = await credential.getToken(scope);
  if (!token || !token.token) throw new Error('Failed to obtain Power Platform API token');
  return token.token;
}
// Power Platform Admin API integration service
// Fetches environments, apps, and flows from Power Platform Admin APIs
// import { prisma } from '@/app/lib/prisma';

// TODO: Implement authentication for Power Platform Admin API (use Entra ID app registration)
// TODO: Add functions to fetch environments, apps, and flows
// TODO: Add function to resolve userId to displayName via Microsoft Graph

export async function fetchPowerPlatformEnvironments(accessToken: string) {
  // Example endpoint:
  // GET https://api.bap.microsoft.com/providers/Microsoft.BusinessAppPlatform/scopes/admin/environments?api-version=2020-10-01&$expand=properties.capacity,properties.addons
  // ...
}

export async function fetchPowerAppsForEnvironment(environmentId: string, accessToken: string) {
  // Example endpoint:
  // GET https://{environmentId}.environment.api.powerplatform.com/powerapps/apps?api-version=1
  // ...
}

export async function fetchFlowsForEnvironment(environmentId: string, region: string, accessToken: string) {
  // Example endpoint:
  // GET https://{region}.api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/{environmentId}/flows?api-version=2016-11-01
  // ...
}

export async function resolveUserIdToDisplayName(userId: string, graphAccessToken: string) {
  // GET https://graph.microsoft.com/v1.0/users/{userId}
  // ...
}
