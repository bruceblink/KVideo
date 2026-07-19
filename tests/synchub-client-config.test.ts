import test from 'node:test';
import assert from 'node:assert/strict';

test('SyncHub client config defaults to the production service', async () => {
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;
  const values = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };

  Object.defineProperty(globalThis, 'window', { configurable: true, value: { dispatchEvent() {} } });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: localStorage });

  try {
    const sync = await import('@/lib/store/synchub-sync-store');
    assert.deepEqual(sync.getSyncHubConfig(), {
      endpoint: 'https://sync.likanug.app',
      apiKey: '',
    });

    sync.saveSyncHubConfig({ endpoint: '', apiKey: ' shk_example ' });
    assert.deepEqual(sync.getSyncHubConfig(), {
      endpoint: 'https://sync.likanug.app',
      apiKey: 'shk_example',
    });
  } finally {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalLocalStorage });
  }
});
