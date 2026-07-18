import { useState, useCallback } from 'react';
import { useHistoryStore, usePremiumHistoryStore } from '@/lib/store/history-store';
import { useFavoritesStore, usePremiumFavoritesStore } from '@/lib/store/favorites-store';
import { getProfileId } from '@/lib/store/auth-store';
import { getSyncHubConfig, isSyncHubConfigured } from '@/lib/store/synchub-sync-store';

type SyncHubDocument<T> = {
  code: number;
  message: string;
  data?: {
    payload: T | null;
  };
};

async function syncHubRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  const config = getSyncHubConfig();
  if (!isSyncHubConfigured(config)) return null;

  const response = await fetch(`${config.endpoint}/api/v1/metadata/kvideo/${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
      ...init?.headers,
    },
  });
  const result = await response.json() as SyncHubDocument<T>;
  if (!response.ok || result.code !== 0) {
    throw new Error(result.message || 'SyncHub request failed');
  }
  return result.data?.payload ?? null;
}

async function serverSyncHubRequest<T>(path: string, init?: RequestInit): Promise<T | null | undefined> {
  const response = await fetch(`/api/synchub/metadata/${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (response.status === 404) return undefined;
  const result = await response.json() as SyncHubDocument<T>;
  if (!response.ok || result.code !== 0) throw new Error(result.message || 'SyncHub request failed');
  return result.data?.payload ?? null;
}

export function useCloudSync(isPremium = false) {
  const [isSyncing, setIsSyncing] = useState(false);

  const historyStore = isPremium ? usePremiumHistoryStore : useHistoryStore;
  const favoritesStore = isPremium ? usePremiumFavoritesStore : useFavoritesStore;

  const pullFromCloud = useCallback(async () => {
    const syncHubConfig = getSyncHubConfig();
    if (isSyncHubConfigured(syncHubConfig)) {
      setIsSyncing(true);
      try {
        const [history, favorites] = await Promise.all([
          syncHubRequest<unknown[]>('watch-history'),
          syncHubRequest<unknown[]>('favorites'),
        ]);
        if (Array.isArray(history)) historyStore.getState().importHistory(history as never[]);
        if (Array.isArray(favorites)) favoritesStore.getState().importFavorites(favorites as never[]);
      } finally {
        setIsSyncing(false);
      }
      return;
    }

    try {
      const [history, favorites] = await Promise.all([
        serverSyncHubRequest<unknown[]>('watch-history'),
        serverSyncHubRequest<unknown[]>('favorites'),
      ]);
      if (history !== undefined || favorites !== undefined) {
        if (Array.isArray(history)) historyStore.getState().importHistory(history as never[]);
        if (Array.isArray(favorites)) favoritesStore.getState().importFavorites(favorites as never[]);
        return;
      }
    } catch (error) {
      console.error('Failed to pull from SyncHub:', error);
      return;
    }

    const profileId = getProfileId();
    if (!profileId) return;

    setIsSyncing(true);
    try {
      const response = await fetch('/api/user/sync');
      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.history?.length > 0) {
          historyStore.getState().importHistory(result.data.history);
        }
        if (result.data.favorites?.length > 0) {
          favoritesStore.getState().importFavorites(result.data.favorites);
        }
      }
    } catch (error) {
      console.error('Failed to pull from cloud:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [historyStore, favoritesStore]);

  const pushToCloud = useCallback(async () => {
    const syncHubConfig = getSyncHubConfig();
    if (isSyncHubConfigured(syncHubConfig)) {
      setIsSyncing(true);
      try {
        await Promise.all([
          syncHubRequest('watch-history', {
            method: 'PUT',
            body: JSON.stringify({ payload: historyStore.getState().viewingHistory }),
          }),
          syncHubRequest('favorites', {
            method: 'PUT',
            body: JSON.stringify({ payload: favoritesStore.getState().favorites }),
          }),
        ]);
      } finally {
        setIsSyncing(false);
      }
      return;
    }

    try {
      const [history, favorites] = await Promise.all([
        serverSyncHubRequest('watch-history', { method: 'PUT', body: JSON.stringify({ payload: historyStore.getState().viewingHistory }) }),
        serverSyncHubRequest('favorites', { method: 'PUT', body: JSON.stringify({ payload: favoritesStore.getState().favorites }) }),
      ]);
      if (history !== undefined || favorites !== undefined) return;
    } catch (error) {
      console.error('Failed to push to SyncHub:', error);
      return;
    }

    const profileId = getProfileId();
    if (!profileId) return;

    setIsSyncing(true);
    try {
      const currentHistory = historyStore.getState().viewingHistory;
      const currentFavorites = favoritesStore.getState().favorites;

      await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          history: currentHistory,
          favorites: currentFavorites
        })
      });
    } catch (error) {
      console.error('Failed to push to cloud:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [historyStore, favoritesStore]);

  return { pushToCloud, pullFromCloud, isSyncing };
}
