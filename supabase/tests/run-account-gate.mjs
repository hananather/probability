import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const fixture = process.env.PROBABILITY_AUTH_TEST_FILE;
if (!fixture || !existsSync(fixture)) {
  process.stderr.write('Set PROBABILITY_AUTH_TEST_FILE to a mode-0600 JSON file with local url, publishableKey, and separate fresh confirmed accountA/accountB {id,accessToken}. No records are deleted.\n');
  process.exit(1);
}
const result = spawnSync('npm', ['exec', '--', 'vitest', 'run', 'tests/auth/remote.integration.test.js'], { cwd: new URL('../../', import.meta.url), env: process.env, stdio: 'inherit' });
process.exit(result.status ?? 1);
