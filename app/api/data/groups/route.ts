// file: app/api/data/groups/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const m365Groups = await prisma.m365Group.findMany();
  const securityGroups = await prisma.securityGroup.findMany();
  return NextResponse.json({ m365Groups, securityGroups });
}