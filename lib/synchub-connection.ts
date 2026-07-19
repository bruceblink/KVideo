import { DEFAULT_SYNCHUB_ENDPOINT } from '@/lib/synchub-contract';

type SyncHubResponse = {
  code?: number | string;
  message?: string;
};

export type SyncHubConnectionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function normalizeEndpoint(endpoint: string): string {
  return endpoint.trim().replace(/\/+$/, '') || DEFAULT_SYNCHUB_ENDPOINT;
}

export async function verifyKVideoSyncHubConnection(
  endpoint: string,
  apiKey: string,
  fetcher: typeof fetch = fetch,
): Promise<SyncHubConnectionResult> {
  const normalizedKey = apiKey.trim();
  if (!normalizedKey.startsWith('shk_')) {
    return { ok: false, message: '请输入有效的 KVideo API Key' };
  }

  try {
    const response = await fetcher(
      `${normalizeEndpoint(endpoint)}/api/v1/metadata/kvideo/favorites`,
      {
        headers: { 'X-API-Key': normalizedKey },
        cache: 'no-store',
      },
    );
    const result = await response.json() as SyncHubResponse;

    if (response.ok || (response.status === 404 && result.code === 'NOT_FOUND')) {
      return { ok: true, message: '连接成功，API Key 可用于 KVideo 同步' };
    }

    return { ok: false, message: result.message || `连接失败（HTTP ${response.status}）` };
  } catch {
    return { ok: false, message: '无法连接 SyncHub，请检查服务地址和网络' };
  }
}
