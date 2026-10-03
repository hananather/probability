import { readFile } from 'node:fs/promises';

const origin = process.env.ROUTE_CHECK_ORIGIN ?? 'http://127.0.0.1:3000';
const manifest = JSON.parse(await readFile(new URL('../.next/prerender-manifest.json', import.meta.url), 'utf8'));
const appPaths = JSON.parse(await readFile(new URL('../.next/server/app-paths-manifest.json', import.meta.url), 'utf8'));
const literalPageRoutes = Object.keys(appPaths)
  .filter(path => path.endsWith('/page') && !/[\[\]()]/.test(path))
  .map(path => path.slice(0, -5) || '/');
const routes = [...new Set([...Object.keys(manifest.routes), ...literalPageRoutes, ...Array.from({ length: 7 }, (_, i) => `/chapter/${i + 1}/quiz`)])].filter(path => !path.startsWith('/_') && path !== '/favicon.ico').sort();
const failures = [];
let next = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (next < routes.length) {
    const path = routes[next++];
    try {
      const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(20_000) });
      const body = await response.text();
      if (!response.ok || !body.includes('<html')) failures.push({ path, status: response.status });
    } catch (error) {
      failures.push({ path, error: error.message });
    }
  }
}));
console.log(JSON.stringify({ origin, routesChecked: routes.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
