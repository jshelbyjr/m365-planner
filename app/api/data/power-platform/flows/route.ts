import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const flows = await prisma.powerAutomateFlow.findMany({
      include: { environment: true, owner: true },
    });
    return NextResponse.json(flows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const flow = await prisma.powerAutomateFlow.create({ data });
    return NextResponse.json(flow);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
