import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyKVideoSyncHubConnection } from '@/lib/synchub-connection';

test('accepts an application-bound KVideo API key', async () => {
  const fetcher = async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(input, 'https://sync.likanug.app/api/v1/metadata/kvideo/favorites');
    assert.equal((init?.headers as Record<string, string>)['X-API-Key'], 'shk_valid');
    return new Response(JSON.stringify({ code: 0, message: 'ok', data: { payload: [] } }), { status: 200 });
  };

  assert.deepEqual(await verifyKVideoSyncHubConnection('', ' shk_valid ', fetcher), {
    ok: true,
    message: '连接成功，API Key 可用于 KVideo 同步',
  });
});

test('accepts an empty collection response after authentication', async () => {
  const fetcher = async () => new Response(
    JSON.stringify({ code: 'NOT_FOUND', message: 'metadata document not found' }),
    { status: 404 },
  );

  assert.equal((await verifyKVideoSyncHubConnection('https://sync.example/', 'shk_valid', fetcher)).ok, true);
});

test('reports rejected and malformed API keys', async () => {
  let requested = false;
  const fetcher = async () => {
    requested = true;
    return new Response(JSON.stringify({ code: 'UNAUTHENTICATED', message: 'invalid api key' }), { status: 401 });
  };

  assert.deepEqual(await verifyKVideoSyncHubConnection('', 'invalid', fetcher), {
    ok: false,
    message: '请输入有效的 KVideo API Key',
  });
  assert.equal(requested, false);
  assert.deepEqual(await verifyKVideoSyncHubConnection('', 'shk_rejected', fetcher), {
    ok: false,
    message: 'invalid api key',
  });
});
