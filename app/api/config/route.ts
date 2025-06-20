// file: app/api/config/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET endpoint to retrieve the current configuration
export async function GET() {
  try {
    const config = await prisma.configuration.findUnique({
      where: { id: 1 },
    });
    if (config) {
      // Return the config but omit the client secret for security
      const { clientSecret, ...safeConfig } = config;
      return NextResponse.json(safeConfig);
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

    // Using "upsert" is perfect here: it creates the record if it doesn't exist,
    // or updates it if it does. We only ever have one configuration record (id: 1).
    const savedConfig = await prisma.configuration.upsert({
      where: { id: 1 },
      update: { tenantId, clientId, clientSecret },
      create: { id: 1, tenantId, clientId, clientSecret },
    });

    return NextResponse.json({ message: 'Configuration saved successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save configuration.' }, { status: 500 });
  }
}