import assert from 'node:assert/strict';
import test from 'node:test';

import { initializeSyncHubCollection } from '@/lib/synchub-initialization';

test('imports an existing SyncHub document without overwriting it', async () => {
  const imported: string[][] = [];
  const uploaded: string[][] = [];

  await initializeSyncHubCollection(
    ['remote'],
    ['local'],
    (value) => imported.push(value),
    async (value) => { uploaded.push(value); },
  );

  assert.deepEqual(imported, [['remote']]);
  assert.deepEqual(uploaded, []);
});

test('seeds an empty SyncHub document from local data', async () => {
  const imported: string[][] = [];
  const uploaded: string[][] = [];

  await initializeSyncHubCollection(
    null,
    ['local'],
    (value) => imported.push(value),
    async (value) => { uploaded.push(value); },
  );

  assert.deepEqual(imported, []);
  assert.deepEqual(uploaded, [['local']]);
});
