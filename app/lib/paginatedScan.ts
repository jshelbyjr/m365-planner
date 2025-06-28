// file: lib/paginatedScan.ts
// DRY abstraction for paginated Microsoft Graph scans with checkpointing and error handling
import { graphApiRequest } from '@/app/lib/graphApiRequest';
import { saveScanCheckpoint, loadScanCheckpoint, clearScanCheckpoint } from '@/app/lib/scanCheckpoint';
import { Client } from '@microsoft/microsoft-graph-client';

/**
 * Options for paginatedScan
 */
export interface PaginatedScanOptions<T> {
  client: Client;
  dataType: string;
  initialUrl: string;
  processPage: (items: any[]) => Promise<void>;
  select?: string;
  headers?: Record<string, string>;
  pageSize?: number;
  logProgress?: (page: number, total: number) => void;
}

/**
 * DRY paginated scan with checkpointing and error handling
 */
export async function paginatedScan<T = any>(options: PaginatedScanOptions<T>) {
  const {
    client,
    dataType,
    initialUrl,
    processPage,
    select,
    headers = {},
    pageSize = 999,
    logProgress,
  } = options;
  let url = await loadScanCheckpoint(dataType) || initialUrl;
  let page = 0;
  let total = 0;
  try {
    while (url) {
      const apiUrl = select && !url.includes('$select') ? `${url}${url.includes('?') ? '&' : '?'}$select=${select}` : url;
      const response = await graphApiRequest({ client, url: apiUrl, headers });
      const items = response.value || [];
      await processPage(items);
      total += items.length;
      page++;
      if (logProgress) logProgress(page, total);
      url = response['@odata.nextLink'] ? response['@odata.nextLink'].replace('https://graph.microsoft.com/v1.0', '') : null;
      await saveScanCheckpoint(dataType, url);
    }
    await clearScanCheckpoint(dataType);
  } catch (err) {
    // Leave checkpoint for resume
    throw err;
  }
}
