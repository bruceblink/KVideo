import 'server-only';

import { DEFAULT_SYNCHUB_ENDPOINT, KVIDEO_SYNCHUB_COLLECTIONS } from '@/lib/synchub-contract';

const SUPPORTED_COLLECTIONS = new Set<string>(KVIDEO_SYNCHUB_COLLECTIONS);

function normalizeEndpoint(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function getSyncHubServerConfig() {
  const endpoint = normalizeEndpoint(process.env.SYNCHUB_URL || DEFAULT_SYNCHUB_ENDPOINT);
  const apiKey = (process.env.SYNCHUB_API_KEY || '').trim();

  if (!/^https?:\/\//i.test(endpoint) || !apiKey.startsWith('shk_')) return null;
  return { endpoint, apiKey };
}

export function isSupportedSyncHubCollection(collection: string): boolean {
  return SUPPORTED_COLLECTIONS.has(collection);
}
