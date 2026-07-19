export async function initializeSyncHubCollection<T>(
  remoteValue: T | null,
  localValue: T,
  importRemote: (value: T) => void,
  uploadLocal: (value: T) => Promise<unknown>,
): Promise<void> {
  if (remoteValue !== null) {
    importRemote(remoteValue);
    return;
  }

  await uploadLocal(localValue);
}
