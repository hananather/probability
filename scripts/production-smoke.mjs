import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const origin = 'http://127.0.0.1:3100';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3100'], { stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
server.stdout.on('data', chunk => { output = (output + chunk).slice(-8000); });
server.stderr.on('data', chunk => { output = (output + chunk).slice(-8000); });
server.on('error', error => { output += error.message; });

try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (server.exitCode !== null) break;
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1000) });
      await response.arrayBuffer();
      if (response.ok) { ready = true; break; }
    } catch { /* The production server may still be starting. */ }
    await delay(250);
  }
  if (!ready) throw new Error(`Production server did not become ready.\n${output}`);
  const code = await new Promise((resolve, reject) => {
    const check = spawn(process.execPath, ['scripts/check-routes.mjs'], { stdio: 'inherit', env: { ...process.env, ROUTE_CHECK_ORIGIN: origin } });
    check.on('error', reject);
    check.on('exit', resolve);
  });
  if (code !== 0) throw new Error(`Route check failed with exit code ${code}.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
}
