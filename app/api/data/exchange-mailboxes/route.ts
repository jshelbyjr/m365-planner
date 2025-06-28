import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { fetchExchangeMailboxUsage } from '@/lib/graph.service';

/**
 * GET: List all Exchange Mailboxes
 */
export async function GET() {
  try {
    const mailboxes = await prisma.exchangeMailbox.findMany();
    // Safely serialize BigInt fields for JSON
    const safeMailboxes = mailboxes.map((mb) => {
      const safe: any = { ...mb };
      for (const key in safe) {
        if (typeof safe[key] === 'bigint') {
          safe[key] = safe[key].toString();
        }
      }
      return safe;
    });
    return NextResponse.json(safeMailboxes);
  } catch (error) {
    console.error('Failed to fetch mailboxes:', error);
    return NextResponse.json({ error: 'Failed to fetch mailboxes' }, { status: 500 });
  }
}
// ...existing code...

/**
 * POST: Add a new Exchange Mailbox (manual insert, not from Graph)
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // TODO: Add validation/sanitization here
    const mailbox = await prisma.exchangeMailbox.create({ data });
    return NextResponse.json(mailbox);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add mailbox' }, { status: 400 });
  }
}

/**
 * PUT: Refresh Exchange Mailboxes from Microsoft Graph (usage report)
 */
export async function PUT() {
  try {
    const { getAuthenticatedClient } = await import('@/app/lib/graph.service');
    const client = await getAuthenticatedClient();
    const mailboxes = await fetchExchangeMailboxUsage(client);
    // Upsert each mailbox
    for (const mb of mailboxes) {
      if (!mb.id) continue; // skip if no id
      const safeId = mb.id ? String(mb.id) : '';
      await prisma.exchangeMailbox.upsert({
        where: { id: safeId },
        update: mb,
        create: { ...mb, id: safeId },
      });
    }
    return NextResponse.json({ message: 'Mailboxes refreshed', count: mailboxes.length });
  } catch (error) {
    console.error('Failed to refresh mailboxes:', error);
    return NextResponse.json({ error: 'Failed to refresh mailboxes' }, { status: 500 });
  }
}
// ...existing code...
