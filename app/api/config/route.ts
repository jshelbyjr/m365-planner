// file: app/api/config/route.ts

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { Status } from '../../lib/constants';
import { encrypt, decrypt } from '../../lib/encryption';

const prisma = new PrismaClient();

// GET endpoint to retrieve the current configuration
export async function GET() {
  try {
    const config = await prisma.configuration.findUnique({
      where: { id: 1 },
    });
    if (config) {
      // Decrypt clientSecret if present, but do not return it in the response
      const { clientSecret, ...safeConfig } = config;
      // Optionally, you could return a flag indicating if a secret is set
      return NextResponse.json({ status: Status.SUCCESS, config: { ...safeConfig, hasClientSecret: !!clientSecret } });
    }
    return NextResponse.json(null);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch configuration.' }, { status: 500 });
  }
}

// POST endpoint to save the configuration
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, clientId, clientSecret } = body;

    if (!tenantId || !clientId || !clientSecret) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Encrypt the clientSecret before saving
    const encryptedSecret = encrypt(clientSecret);

    // Using "upsert" is perfect here: it creates the record if it doesn't exist,
    // or updates it if it does. We only ever have one configuration record (id: 1).
    await prisma.configuration.upsert({
      where: { id: 1 },
      update: { tenantId, clientId, clientSecret: encryptedSecret },
      create: { id: 1, tenantId, clientId, clientSecret: encryptedSecret },
    });

    return NextResponse.json({ message: 'Configuration saved successfully.' });
  } catch (error) {
    return NextResponse.json({ status: Status.ERROR, error: (error as Error).message }, { status: 500 });
  }
}