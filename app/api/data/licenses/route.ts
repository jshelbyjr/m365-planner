import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

/**
 * GET /api/data/licenses
 * Returns all licenses in the database.
 */
export async function GET() {
  try {
    const licenses = await prisma.license.findMany();
    return NextResponse.json(licenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch licenses.' }, { status: 500 });
  }
}

/**
 * POST /api/data/licenses
 * Adds a new license to the database.
 * Expects JSON body matching License model.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Basic validation (expand as needed)
    if (!data.id || !data.skuPartNumber) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    const license = await prisma.license.create({ data });
    return NextResponse.json(license, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add license.' }, { status: 500 });
  }
}
