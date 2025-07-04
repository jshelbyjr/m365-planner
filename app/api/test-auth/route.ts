// file: app/api/test-auth/route.ts

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { Status } from '../../lib/constants';
import { decrypt } from '../../lib/encryption';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const config = await prisma.configuration.findUnique({ where: { id: 1 } });

    if (!config) {
      return NextResponse.json({ error: 'Configuration not found. Please save credentials first.' }, { status: 404 });
    }


    const { tenantId, clientId, clientSecret } = config;
    if (!clientSecret) {
      return NextResponse.json({ error: 'Client secret not set.' }, { status: 400 });
    }
    const decryptedSecret = decrypt(clientSecret);
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: decryptedSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    });

    const tokenData = await response.json();

    if (!response.ok) {
        return NextResponse.json({ error: `Failed to get token: ${tokenData.error_description}` }, { status: response.status });
    }

    // Return a clear success message for the UI
    return NextResponse.json({ status: Status.SUCCESS, message: 'Successfully obtained access token from Microsoft.' });

  } catch (error: any) {
    return NextResponse.json({ status: Status.ERROR, error: error.message }, { status: 500 });
  }
}