import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMathJaxConfig, MATHJAX_SCRIPT_URL } from '@/lib/mathjax/config';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { attachedNode, deferred, renderer, tick } from './fixtures';

const runtimes = [];
function runtime(options = {}) {
  const instance = createMathJaxRuntime(options);
  runtimes.push(instance);
  return instance;
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(async () => {
  runtimes.splice(0).forEach(instance => instance.dispose());
  await tick();
  delete window.MathJax;
  document.body.replaceChildren();
  document.head.querySelectorAll('[data-probability-mathjax]').forEach(node => node.remove());
  vi.useRealTimers();
});

describe('shared v3 runtime readiness', () => {
  it('treats startup configuration as loading, shares one download, and awaits actual startup', async () => {
    window.MathJax = createMathJaxConfig();
    const download = deferred();
    const startup = deferred();
    const loadScript = vi.fn(() => ({ promise: download.promise, remove: vi.fn() }));
    const instance = runtime({ loadScript });
    const first = instance.ensureReady();
    expect(instance.ensureReady()).toBe(first);
    expect(instance.getSnapshot().status).toBe('loading');
    expect(loadScript).toHaveBeenCalledOnce();
    window.MathJax = renderer(startup.promise);
    download.resolve();
    await tick();
    expect(instance.getSnapshot().status).toBe('loading');
    startup.resolve();
    expect(await first).toBe(window.MathJax);
    expect(instance.getSnapshot().status).toBe('ready');
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['unsafe', 'wrong-version', 'missing-method'])('refuses an incompatible renderer (%s)', async kind => {
    window.MathJax = renderer();
    if (kind === 'unsafe') delete window.MathJax.startup.document.safe;
    if (kind === 'wrong-version') window.MathJax.version = '3.1.0';
    if (kind === 'missing-method') delete window.MathJax.typesetClear;
    const instance = runtime();
    await expect(instance.ensureReady()).rejects.toThrow();
    expect(instance.getSnapshot().status).toBe('failed');
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
  });

  it('makes a new pinned script request after a failed download and does not silently retry', async () => {
    window.MathJax = createMathJaxConfig();
    const instance = runtime();
    const pending = instance.ensureReady();
    const failure = expect(pending).rejects.toThrow('downloaded');
    const first = document.head.querySelector('[data-probability-mathjax]');
    expect(first.src).toBe(MATHJAX_SCRIPT_URL);
    first.dispatchEvent(new Event('error'));
    await failure;
    expect(first.isConnected).toBe(false);
    expect(instance.getSnapshot().status).toBe('failed');
    await expect(instance.ensureReady()).rejects.toThrow();
    expect(document.head.querySelector('[data-probability-mathjax]')).toBeNull();
    const retry = instance.retry();
    const second = document.head.querySelector('[data-probability-mathjax]');
    expect(second).not.toBe(first);
    expect(second.src).toBe(MATHJAX_SCRIPT_URL);
    expect(window.MathJax.loader.load).toContain('ui/safe');
    window.MathJax = renderer();
    second.dispatchEvent(new Event('load'));
    await retry;
    expect(instance.getSnapshot()).toMatchObject({ status: 'ready', error: null, retryVersion: 1 });
  });

  it('bounds startup waiting and ignores a late old startup after a retry', async () => {
    const old = deferred();
    window.MathJax = renderer(old.promise);
    const next = deferred();
    const instance = runtime({ startupTimeoutMs: 100, loadScript: () => ({ promise: next.promise, remove() {} }) });
    const failure = expect(instance.ensureReady()).rejects.toThrow('too long');
    await vi.advanceTimersByTimeAsync(100);
    await failure;
    const retry = instance.retry();
    window.MathJax = renderer();
    next.resolve();
    await retry;
    old.reject(new Error('old startup failure'));
    await tick();
    expect(instance.getSnapshot()).toMatchObject({ status: 'ready', error: null });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps a stable server snapshot without starting a browser loader', async () => {
    const loadScript = vi.fn();
    const instance = runtime({ getWindow: () => null, loadScript });
    expect(instance.getServerSnapshot()).toBe(instance.getServerSnapshot());
    await expect(instance.ensureReady()).rejects.toThrow('browser');
    expect(loadScript).not.toHaveBeenCalled();
    expect(instance.getSnapshot().status).toBe('idle');
  });
});

describe('participating rendering lane', () => {
  it('serializes different nodes after startup, including overlapping parent/child requests', async () => {
    const firstRender = deferred();
    window.MathJax = renderer();
    window.MathJax.typesetPromise.mockImplementationOnce(() => firstRender.promise);
    const instance = runtime();
    const parent = document.createElement('div');
    const child = attachedNode();
    parent.append(child);
    document.body.append(parent);
    const first = instance.enqueue(parent);
    const second = instance.enqueue(child);
    await tick();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(1);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledWith([parent]);
    firstRender.resolve();
    expect(await first.promise).toEqual({ status: 'rendered' });
    expect(await second.promise).toEqual({ status: 'rendered' });
    expect(window.MathJax.typesetPromise).toHaveBeenLastCalledWith([child]);
    // Initial nested passes do not discard the tracked math of their ancestor.
    expect(window.MathJax.typesetClear).not.toHaveBeenCalled();
  });

  it('cancels obsolete queued generations, renders current connected DOM, and clears retired math', async () => {
    const startup = deferred();
    window.MathJax = renderer(startup.promise);
    const instance = runtime();
    const node = attachedNode('first');
    const first = instance.enqueue(node, { key: 'first' });
    await tick();
    node.textContent = 'latest';
    const latest = instance.enqueue(node, { key: 'latest' });
    expect(await first.promise).toEqual({ status: 'cancelled' });
    startup.resolve();
    expect(await latest.promise).toEqual({ status: 'rendered' });
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(node.textContent).toBe('latest');
    await instance.retire(node, element => element.remove());
    expect(window.MathJax.typesetClear).toHaveBeenCalledWith([node]);
    expect(node.isConnected).toBe(false);
  });

  it('skips detached and unmounted queued nodes', async () => {
    window.MathJax = renderer();
    const instance = runtime();
    const detached = document.createElement('span');
    expect(await instance.enqueue(detached).promise).toEqual({ status: 'cancelled' });
    const node = attachedNode();
    const job = instance.enqueue(node);
    job.cancel();
    node.remove();
    expect(await job.promise).toEqual({ status: 'cancelled' });
    await tick();
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
  });

  it('deduplicates only successful matching content and can retry an identical failed key', async () => {
    window.MathJax = renderer();
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('render failed'));
    const instance = runtime();
    const node = attachedNode();
    await expect(instance.enqueue(node, { key: 'same' }).promise).rejects.toThrow('render failed');
    expect(instance.getSnapshot().error).toBeInstanceOf(Error);
    expect(await instance.enqueue(node, { key: 'same' }).promise).toEqual({ status: 'rendered' });
    expect(await instance.enqueue(node, { key: 'same' }).promise).toEqual({ status: 'unchanged' });
    node.textContent = 'changed despite reused key';
    expect(await instance.enqueue(node, { key: 'same' }).promise).toEqual({ status: 'rendered' });
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(3);
  });

  it('clears before an owned DOM replacement and before an owned removal, retaining the active lane', async () => {
    const active = deferred();
    window.MathJax = renderer();
    window.MathJax.typesetPromise.mockImplementationOnce(() => active.promise);
    const instance = runtime();
    const node = attachedNode('old');
    const order = [];
    window.MathJax.typesetClear.mockImplementation(() => order.push('clear'));
    const request = instance.enqueue(node);
    await tick();
    const retirement = instance.retire(node, element => { order.push('remove'); element.remove(); });
    expect(await request.promise).toEqual({ status: 'cancelled' });
    expect(order).toEqual([]);
    active.resolve();
    await retirement;
    expect(order.at(-2)).toBe('clear');
    expect(order.at(-1)).toBe('remove');
    const replacement = attachedNode();
    await instance.enqueue(replacement, { update: element => { order.push('replace'); element.textContent = 'new'; } }).promise;
    expect(order.slice(-2)).toEqual(['clear', 'replace']);
  });

  it('reports a stalled active render and rejects waiting work without starting a concurrent retry', async () => {
    const active = deferred();
    window.MathJax = renderer();
    window.MathJax.typesetPromise.mockImplementationOnce(() => active.promise);
    const instance = runtime({ renderTimeoutMs: 100 });
    const first = instance.enqueue(attachedNode('first'));
    const second = instance.enqueue(attachedNode('second'));
    const failedFirst = expect(first.promise).rejects.toThrow('too long');
    const failedSecond = expect(second.promise).rejects.toThrow('too long');
    await tick();
    await vi.advanceTimersByTimeAsync(100);
    await failedFirst;
    await failedSecond;
    expect(instance.getSnapshot().stalled).toBe(true);
    await expect(instance.retry()).rejects.toThrow('still running');
    await expect(instance.enqueue(attachedNode('third')).promise).rejects.toThrow('too long');
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
    active.resolve();
    await tick();
    expect(instance.getSnapshot().stalled).toBe(false);
    await instance.retry();
    expect(await instance.enqueue(attachedNode('fourth')).promise).toEqual({ status: 'rendered' });
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
  });

  it('does not retry or publish late failure for a cancelled in-flight node', async () => {
    const active = deferred();
    window.MathJax = renderer();
    window.MathJax.typesetPromise.mockImplementation(() => active.promise);
    const instance = runtime();
    const node = attachedNode();
    const request = instance.enqueue(node);
    await tick();
    request.cancel();
    const retirement = instance.retire(node);
    active.reject(new Error('late failure'));
    expect(await request.promise).toEqual({ status: 'cancelled' });
    await retirement;
    expect(instance.getSnapshot().error).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('forgets a retired formula failure so a healthy replacement page has no stale error', async () => {
    window.MathJax = renderer();
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('old page failed'));
    const instance = runtime();
    const old = attachedNode();
    await expect(instance.enqueue(old).promise).rejects.toThrow('old page failed');
    expect(instance.getSnapshot().phase).toBe('render');
    await instance.retire(old, element => element.remove());
    expect(instance.getSnapshot()).toMatchObject({ error: null, phase: null });
    expect(await instance.enqueue(attachedNode('new page')).promise).toEqual({ status: 'rendered' });
    expect(instance.getSnapshot().error).toBeNull();
  });

  it('retains other live failures and supports clearing bookkeeping without forgetting an error', async () => {
    window.MathJax = renderer();
    window.MathJax.typesetPromise.mockRejectedValue(new Error('formula failed'));
    const instance = runtime();
    const first = attachedNode('first');
    const second = attachedNode('second');
    await expect(instance.enqueue(first).promise).rejects.toThrow();
    await expect(instance.enqueue(second).promise).rejects.toThrow();
    await instance.retire(first);
    expect(instance.getSnapshot().phase).toBe('render');
    await instance.retire(second, undefined, { retainFailure: true });
    expect(instance.getSnapshot().phase).toBe('render');
    expect(window.MathJax.typesetClear).toHaveBeenCalledWith([second]);
    await instance.retire(second);
    expect(instance.getSnapshot()).toMatchObject({ error: null, phase: null });
  });

  it('does not clear a startup error by retiring an unrelated node', async () => {
    window.MathJax = renderer();
    delete window.MathJax.startup.document.safe;
    const instance = runtime();
    await expect(instance.ensureReady()).rejects.toThrow('safety filters');
    const error = instance.getSnapshot().error;
    await instance.retire(attachedNode());
    expect(instance.getSnapshot()).toMatchObject({ status: 'failed', phase: 'startup', error });
  });

  it('keeps a stalled lane error while retirement is waiting for the active render', async () => {
    const active = deferred();
    window.MathJax = renderer();
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('old formula failed'));
    const instance = runtime({ renderTimeoutMs: 100 });
    const old = attachedNode('old');
    await expect(instance.enqueue(old).promise).rejects.toThrow();
    window.MathJax.typesetPromise.mockImplementationOnce(() => active.promise);
    const request = instance.enqueue(attachedNode('active'));
    const failure = expect(request.promise).rejects.toThrow('too long');
    await tick();
    await vi.advanceTimersByTimeAsync(100);
    await failure;
    const error = instance.getSnapshot().error;
    const retirement = instance.retire(old);
    await tick();
    expect(instance.getSnapshot()).toMatchObject({ stalled: true, phase: 'render', error });
    await expect(instance.retry()).rejects.toThrow('still running');
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
    active.resolve();
    await retirement;
    expect(instance.getSnapshot()).toMatchObject({ stalled: false, error: null, phase: null });
  });
});
