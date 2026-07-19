'use client';

import { DEFAULT_SYNCHUB_ENDPOINT } from '@/lib/synchub-contract';

export { DEFAULT_SYNCHUB_ENDPOINT } from '@/lib/synchub-contract';

export interface SyncHubConfig {
  endpoint: string;
  apiKey: string;
}

const STORAGE_KEY = 'kvideo-synchub-sync';
const CHANGE_EVENT = 'kvideo-synchub-sync-changed';

function normalizeEndpoint(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function getSyncHubConfig(): SyncHubConfig {
  if (typeof window === 'undefined') return { endpoint: DEFAULT_SYNCHUB_ENDPOINT, apiKey: '' };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { endpoint: DEFAULT_SYNCHUB_ENDPOINT, apiKey: '' };
    const parsed = JSON.parse(raw) as Partial<SyncHubConfig>;
    return {
      endpoint: typeof parsed.endpoint === 'string' && parsed.endpoint.trim()
        ? normalizeEndpoint(parsed.endpoint)
        : DEFAULT_SYNCHUB_ENDPOINT,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey.trim() : '',
    };
  } catch {
    return { endpoint: DEFAULT_SYNCHUB_ENDPOINT, apiKey: '' };
  }
}

export function saveSyncHubConfig(config: SyncHubConfig): void {
  if (typeof window === 'undefined') return;
  const normalized = {
    endpoint: normalizeEndpoint(config.endpoint) || DEFAULT_SYNCHUB_ENDPOINT,
    apiKey: config.apiKey.trim(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearSyncHubConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function isSyncHubConfigured(config = getSyncHubConfig()): boolean {
  return /^https?:\/\//i.test(config.endpoint) && config.apiKey.startsWith('shk_');
}

export function subscribeToSyncHubConfig(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}
