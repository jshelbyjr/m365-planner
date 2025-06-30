import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const environments = await prisma.powerPlatformEnvironment.findMany({
      include: { powerApps: true, flows: true },
    });
    return NextResponse.json(environments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const environment = await prisma.powerPlatformEnvironment.create({ data });
    return NextResponse.json(environment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
