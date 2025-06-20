// file: app/api/test-auth/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const config = await prisma.configuration.findUnique({ where: { id: 1 } });

    if (!config) {
      return NextResponse.json({ error: 'Configuration not found. Please save credentials first.' }, { status: 404 });
    }

    const { tenantId, clientId, clientSecret } = config;
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    });

    const tokenData = await response.json();

    if (!response.ok) {
        return NextResponse.json({ error: `Failed to get token: ${tokenData.error_description}` }, { status: response.status });
    }

    // You can optionally try a simple Graph API call here, but for now, just getting the token is a great test.
    // For example, fetching the tenant organization details.
    
    return NextResponse.json({ message: `Successfully obtained access token! Expires in: ${tokenData.expires_in} seconds.` });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}