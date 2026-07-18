import { NextRequest, NextResponse } from 'next/server';
import { getSyncHubServerConfig, isSupportedSyncHubCollection } from '@/lib/server/synchub';

export const runtime = 'nodejs';

async function requestSyncHub(request: NextRequest, collection: string) {
  const config = getSyncHubServerConfig();
  if (!config) {
    return NextResponse.json({ configured: false }, { status: 404 });
  }

  const response = await fetch(`${config.endpoint}/api/v1/metadata/kvideo/${collection}`, {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
    },
    body: request.method === 'PUT' ? await request.text() : undefined,
    cache: 'no-store',
  });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}

function validateCollection(collection: string) {
  if (isSupportedSyncHubCollection(collection)) return undefined;
  return NextResponse.json({ error: 'Unsupported metadata collection' }, { status: 404 });
}

export async function GET(request: NextRequest, context: { params: Promise<{ collection: string }> }) {
  const { collection } = await context.params;
  return validateCollection(collection) || requestSyncHub(request, collection);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ collection: string }> }) {
  const { collection } = await context.params;
  return validateCollection(collection) || requestSyncHub(request, collection);
}
