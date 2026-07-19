import test from 'node:test';
import assert from 'node:assert/strict';

test('SyncHub server config requires an endpoint and API key', async () => {
  const originalURL = process.env.SYNCHUB_URL;
  const originalKey = process.env.SYNCHUB_API_KEY;
  const { getSyncHubServerConfig, isSupportedSyncHubCollection } = await import('@/lib/server/synchub');

  try {
    delete process.env.SYNCHUB_URL;
    delete process.env.SYNCHUB_API_KEY;
    assert.equal(getSyncHubServerConfig(), null);

    process.env.SYNCHUB_API_KEY = 'shk_production';
    assert.deepEqual(getSyncHubServerConfig(), {
      endpoint: 'https://sync.likanug.app',
      apiKey: 'shk_production',
    });

    process.env.SYNCHUB_URL = 'https://sync.example.com/';
    process.env.SYNCHUB_API_KEY = 'shk_example';
    assert.deepEqual(getSyncHubServerConfig(), { endpoint: 'https://sync.example.com', apiKey: 'shk_example' });
    assert.equal(isSupportedSyncHubCollection('watch-history'), true);
    assert.equal(isSupportedSyncHubCollection('other'), false);
  } finally {
    if (originalURL === undefined) delete process.env.SYNCHUB_URL;
    else process.env.SYNCHUB_URL = originalURL;
    if (originalKey === undefined) delete process.env.SYNCHUB_API_KEY;
    else process.env.SYNCHUB_API_KEY = originalKey;
  }
});
