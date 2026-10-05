import { expect, it, vi } from 'vitest';
import { PROGRESS_BACKUP_LIMITS, readProgressBackupFile } from '@/lib/progress/backups';
import { A, deferred } from './helpers';

const account = `account:${A}`;
const file = source => ({ size: new TextEncoder().encode(source).byteLength, arrayBuffer: async () => new TextEncoder().encode(source).buffer });

it('retains the guest 10 MiB gate while allowing a separately bounded account recovery file', async () => {
  const source = JSON.stringify({ original: 'x'.repeat(PROGRESS_BACKUP_LIMITS.guestBytes) });
  const input = file(source);
  await expect(readProgressBackupFile(input, { ownerScope: 'guest:device' })).rejects.toThrow('10 MiB');
  expect((await readProgressBackupFile(input, { ownerScope: account })).original.length).toBe(PROGRESS_BACKUP_LIMITS.guestBytes);
});

it('rejects oversized account files before reading or parsing their contents', async () => {
  const arrayBuffer = vi.fn();
  await expect(readProgressBackupFile({ size: PROGRESS_BACKUP_LIMITS.accountBytes + 1, arrayBuffer }, { ownerScope: account })).rejects.toThrow('32 MiB');
  expect(arrayBuffer).not.toHaveBeenCalled();
});

it('uses actual UTF-8 bytes when an inaccurate file size would bypass the cap', async () => {
  const oversized = file(JSON.stringify('雪'.repeat(Math.ceil(PROGRESS_BACKUP_LIMITS.accountBytes / 3))));
  oversized.size = 1;
  await expect(readProgressBackupFile(oversized, { ownerScope: account })).rejects.toThrow('32 MiB');
  await expect(readProgressBackupFile({ size: 1, text: async () => '雪'.repeat(Math.ceil(PROGRESS_BACKUP_LIMITS.guestBytes / 3)) }, { ownerScope: 'guest:device' })).rejects.toThrow('10 MiB');
});

it('rejects malformed UTF-8 and malformed JSON before handing data to the store', async () => {
  await expect(readProgressBackupFile({ size: 2, arrayBuffer: async () => Uint8Array.from([0xc3, 0x28]).buffer }, { ownerScope: account })).rejects.toThrow('not valid UTF-8 JSON');
  await expect(readProgressBackupFile(file('{broken'), { ownerScope: account })).rejects.toThrow();
});

it('bounds account node counts and nesting even when the file fits the byte limit', async () => {
  await expect(readProgressBackupFile(file(JSON.stringify(Array(PROGRESS_BACKUP_LIMITS.accountNodes).fill(null))), { ownerScope: account })).rejects.toThrow('unsupported structure');
  let deep = null;
  for (let depth = 0; depth < 102; depth++) deep = { child: deep };
  await expect(readProgressBackupFile(file(JSON.stringify(deep)), { ownerScope: account })).rejects.toThrow('unsupported structure');
});

it('abandons a held file read when the captured destination changes', async () => {
  const gate = deferred(); let current = true;
  const reading = readProgressBackupFile({ size: 8, arrayBuffer: () => gate.promise }, { ownerScope: account, isCurrent: () => current });
  current = false; gate.resolve(new TextEncoder().encode('{bad').buffer);
  await expect(reading).resolves.toBeNull();
});
