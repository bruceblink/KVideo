'use client';

import { useState } from 'react';
import { Check, Cloud, KeyRound, LoaderCircle, Trash2 } from 'lucide-react';
import { verifyKVideoSyncHubConnection } from '@/lib/synchub-connection';
import { clearSyncHubConfig, DEFAULT_SYNCHUB_ENDPOINT, getSyncHubConfig, saveSyncHubConfig } from '@/lib/store/synchub-sync-store';
import { SettingsSection } from './SettingsSection';

export function SyncHubSettings() {
  const [initialConfig] = useState(getSyncHubConfig);
  const [endpoint, setEndpoint] = useState(initialConfig.endpoint);
  const [apiKey, setApiKey] = useState(initialConfig.apiKey);
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const save = async () => {
    setChecking(true);
    setSaved(false);
    setStatus(null);
    const result = await verifyKVideoSyncHubConnection(endpoint, apiKey);
    setChecking(false);
    setStatus(result);
    if (!result.ok) return;
    saveSyncHubConfig({ endpoint, apiKey });
    setSaved(true);
  };

  const clear = () => {
    clearSyncHubConfig();
    setEndpoint(DEFAULT_SYNCHUB_ENDPOINT);
    setApiKey('');
    setSaved(false);
    setStatus(null);
  };

  return (
    <SettingsSection title="SyncHub 同步" description="同步观看历史和收藏到你的 SyncHub 账户。">
      <div className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-sm text-(--text-color-secondary)">服务地址</span>
          <div className="relative">
            <Cloud size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-color-secondary)" />
            <input value={endpoint} onChange={(event) => { setEndpoint(event.target.value); setSaved(false); setStatus(null); }} placeholder={DEFAULT_SYNCHUB_ENDPOINT} inputMode="url" className="w-full pl-9 pr-3 py-2 bg-(--glass-bg) border border-(--glass-border) rounded-lg text-sm text-(--text-color) focus:outline-none focus:border-(--accent-color)" />
          </div>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-(--text-color-secondary)">KVideo API Key</span>
          <div className="relative">
            <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-color-secondary)" />
            <input type="password" value={apiKey} onChange={(event) => { setApiKey(event.target.value); setSaved(false); setStatus(null); }} placeholder="shk_..." autoComplete="off" spellCheck={false} className="w-full pl-9 pr-3 py-2 bg-(--glass-bg) border border-(--glass-border) rounded-lg text-sm text-(--text-color) focus:outline-none focus:border-(--accent-color)" />
          </div>
        </label>
        <div className="flex items-center gap-2">
          <button onClick={() => void save()} disabled={checking} className="inline-flex items-center gap-2 px-3 py-2 bg-(--accent-color) text-white text-sm rounded-lg cursor-pointer disabled:cursor-wait disabled:opacity-60">
            {checking ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />} {checking ? '正在验证' : '验证并保存'}
          </button>
          {(endpoint !== DEFAULT_SYNCHUB_ENDPOINT || apiKey) && <button onClick={clear} className="p-2 border border-(--glass-border) rounded-lg text-(--text-color-secondary) hover:text-red-500 cursor-pointer" title="移除 SyncHub 配置"><Trash2 size={16} /></button>}
          {saved && <span className="text-xs text-emerald-500">已保存并开始同步</span>}
        </div>
        {status && <p role="status" className={`text-xs ${status.ok ? 'text-emerald-500' : 'text-red-500'}`}>{status.message}</p>}
      </div>
    </SettingsSection>
  );
}
