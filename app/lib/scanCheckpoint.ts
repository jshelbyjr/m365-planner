// file: lib/scanCheckpoint.ts
// Utility for persisting and resuming scan checkpoints (e.g., @odata.nextLink)
import { prisma } from '@/app/lib/prisma';

/**
 * Save a scan checkpoint for a given data type
 */
export async function saveScanCheckpoint(dataType: string, nextLink: string | null) {
  await prisma.scanLog.upsert({
    where: { dataType },
    update: { nextLink },
    create: { dataType, nextLink, status: 'in-progress' },
  });
}

/**
 * Load the last scan checkpoint for a given data type
 */
export async function loadScanCheckpoint(dataType: string): Promise<string | null> {
  const log = await prisma.scanLog.findUnique({ where: { dataType } });
  return log?.nextLink ?? null;
}

/**
 * Clear the scan checkpoint for a given data type (after successful scan)
 */
export async function clearScanCheckpoint(dataType: string) {
  await prisma.scanLog.deleteMany({ where: { dataType } });
}
