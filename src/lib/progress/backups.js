export const PROGRESS_BACKUP_LIMITS = Object.freeze({ guestBytes: 10 * 1024 * 1024, accountBytes: 32 * 1024 * 1024, accountNodes: 500000, depth: 100 });

export const isAccountBackupDestination = ownerScope => typeof ownerScope === 'string' && /^account:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(ownerScope);
export const getProgressBackupLimit = ownerScope => isAccountBackupDestination(ownerScope) ? PROGRESS_BACKUP_LIMITS.accountBytes : PROGRESS_BACKUP_LIMITS.guestBytes;
export function backupLimitMessage(ownerScope) {
  return isAccountBackupDestination(ownerScope)
    ? 'Account recovery imports support files up to 32 MiB. Keep your original backup; no records were changed.'
    : 'Choose a progress backup no larger than 10 MiB. Your existing records were not changed.';
}

function boundedAccountStructure(value) {
  let nodes = 0;
  function visit(item, depth) {
    if (++nodes > PROGRESS_BACKUP_LIMITS.accountNodes || depth > PROGRESS_BACKUP_LIMITS.depth) return false;
    return !item || typeof item !== 'object' || Object.values(item).every(child => visit(child, depth + 1));
  }
  return visit(value, 0);
}

/** File contents remain recovery input; the store validates owner and original mutations. */
export async function readProgressBackupFile(file, { ownerScope, isCurrent = () => true } = {}) {
  const limit = getProgressBackupLimit(ownerScope);
  if (!file || (Number.isFinite(file.size) && file.size > limit)) throw new Error(backupLimitMessage(ownerScope));
  let source;
  if (typeof file.arrayBuffer === 'function') {
    const buffer = await file.arrayBuffer();
    if (!isCurrent()) return null;
    if (buffer.byteLength > limit) throw new Error(backupLimitMessage(ownerScope));
    try { source = new TextDecoder('utf-8', { fatal: true }).decode(buffer); }
    catch { throw new Error('This backup is not valid UTF-8 JSON. Your existing records were not changed.'); }
  } else {
    source = await file.text();
    if (!isCurrent()) return null;
    if (typeof source !== 'string' || new TextEncoder().encode(source).byteLength > limit) throw new Error(backupLimitMessage(ownerScope));
  }
  const input = JSON.parse(source);
  if (isAccountBackupDestination(ownerScope) && !boundedAccountStructure(input)) throw new Error('This account backup has an unsupported structure. Keep the original file; your existing records were not changed.');
  return isCurrent() ? input : null;
}
