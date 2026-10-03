import { vi } from 'vitest';
import { createMathJaxConfig } from '@/lib/mathjax/config';

export function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

export function renderer(startupPromise = Promise.resolve()) {
  const config = createMathJaxConfig();
  return {
    version: '3.2.2',
    startup: { promise: startupPromise, document: { safe: { sanitize() {}, filterMethods: { filterURL: (safe, url) => url }, allow: config.options.safeOptions.allow, options: config.options.safeOptions } } },
    typesetPromise: vi.fn(() => Promise.resolve()),
    typesetClear: vi.fn(),
  };
}

export function attachedNode(text = '\\(x\\)') {
  const node = document.createElement('span');
  node.textContent = text;
  document.body.appendChild(node);
  return node;
}

export async function tick() {
  for (let index = 0; index < 20; index++) await Promise.resolve();
}
