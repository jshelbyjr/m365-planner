// file: lib/graphApiRequest.ts
// Utility for robust Microsoft Graph API requests with retry, backoff, and error handling
import { Client } from '@microsoft/microsoft-graph-client';

/**
 * Options for graphApiRequest
 */
export interface GraphApiRequestOptions {
  client: Client;
  url: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  maxRetries?: number;
  initialDelayMs?: number;
}

/**
 * Makes a Microsoft Graph API request with retry and exponential backoff for 429/throttling and transient errors.
 * @param options GraphApiRequestOptions
 * @returns API response
 */
export async function graphApiRequest<T = any>(options: GraphApiRequestOptions): Promise<T> {
  const {
    client,
    url,
    method = 'GET',
    body,
    headers = {},
    maxRetries = 5,
    initialDelayMs = 1000,
  } = options;
  let attempt = 0;
  let delay = initialDelayMs;
  while (attempt <= maxRetries) {
    try {
      let req = client.api(url);
      Object.entries(headers).forEach(([k, v]) => req = req.header(k, v));
      let res;
      switch (method) {
        case 'GET':
          res = await req.get();
          break;
        case 'POST':
          res = await req.post(body);
          break;
        case 'PATCH':
          res = await req.patch(body);
          break;
        case 'DELETE':
          res = await req.delete();
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      return res;
    } catch (err: any) {
      const status = err?.statusCode || err?.status;
      // Retry on 429 (throttling) or 5xx (transient) errors
      if ((status === 429 || (status >= 500 && status < 600)) && attempt < maxRetries) {
        const retryAfter = parseInt(err?.headers?.['retry-after'] || '0', 10);
        await new Promise(res => setTimeout(res, retryAfter ? retryAfter * 1000 : delay));
        delay *= 2; // Exponential backoff
        attempt++;
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Failed to complete Graph API request after ${maxRetries} retries: ${url}`);
}
