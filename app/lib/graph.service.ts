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