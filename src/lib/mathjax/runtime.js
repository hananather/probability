import { createMathJaxConfig, MATHJAX_SCRIPT_URL, MATHJAX_VERSION } from './config';
import { hardenMathJaxSafeUrls } from './safety';

const IDLE = Object.freeze({ status: 'idle', error: null, phase: null, retryVersion: 0, stalled: false });
const browserRuntimes = new WeakMap();
const cancelled = () => ({ status: 'cancelled' });

function runtimeError(message, phase) {
  return Object.assign(new Error(message), { phase });
}

function verifyRuntime(mathJax) {
  const safe = mathJax?.startup?.document?.safe;
  if (mathJax?.version !== MATHJAX_VERSION || typeof mathJax.typesetPromise !== 'function' || typeof mathJax.typesetClear !== 'function') {
    throw runtimeError('The mathematics renderer did not finish starting.', 'startup');
  }
  if (typeof safe?.sanitize !== 'function' || typeof safe?.filterMethods?.filterURL !== 'function' || ['URLs', 'classes', 'cssIDs', 'styles'].some(key => safe.allow?.[key] !== 'safe') ||
    ['file', 'javascript', 'data'].some(key => safe.options?.safeProtocols?.[key] !== false)) {
    throw runtimeError('The mathematics safety filters are unavailable.', 'startup');
  }
  return mathJax;
}

// Each retry creates a real script element; Next Script's load cache is not a retry.
export function loadMathJaxScript(targetWindow) {
  targetWindow.MathJax = createMathJaxConfig();
  const script = targetWindow.document.createElement('script');
  script.src = MATHJAX_SCRIPT_URL;
  script.async = true;
  script.dataset.probabilityMathjax = 'true';
  let rejectLoad;
  const promise = new Promise((resolve, reject) => {
    rejectLoad = reject;
    script.onload = () => resolve();
    script.onerror = () => reject(runtimeError('The mathematics renderer could not be downloaded.', 'download'));
    targetWindow.document.head.appendChild(script);
  });
  return {
    promise,
    remove() {
      script.onload = null;
      script.onerror = null;
      script.remove();
      rejectLoad(runtimeError('The mathematics download was retired.', 'download'));
    },
  };
}

export function createMathJaxRuntime({
  getWindow = () => typeof window === 'undefined' ? null : window,
  loadScript = loadMathJaxScript,
  startupTimeoutMs = 15000,
  renderTimeoutMs = 15000,
} = {}) {
  let snapshot = IDLE;
  let readyPromise = null;
  let renderer = null;
  let scriptAttempt = null;
  let startupGeneration = 0;
  let lane = Promise.resolve();
  let pendingLaneTasks = 0;
  let disposed = false;
  const listeners = new Set();
  const elements = new WeakMap();
  const jobs = new Set();
  const failedElements = new Set();

  const publish = patch => {
    if (disposed) return;
    snapshot = Object.freeze({ ...snapshot, ...patch });
    listeners.forEach(listener => listener());
  };
  const showError = (error, phase, stalled = false) => publish({ error, phase, stalled });
  const serial = task => {
    pendingLaneTasks++;
    const result = lane.then(task);
    lane = result.catch(() => {}).finally(() => { pendingLaneTasks--; });
    return result;
  };

  function ensureReady() {
    if (disposed) return Promise.reject(runtimeError('The mathematics renderer was retired.', 'startup'));
    if (readyPromise) return readyPromise;
    const targetWindow = getWindow();
    if (!targetWindow) return Promise.reject(runtimeError('The mathematics renderer needs a browser.', 'startup'));
    const generation = ++startupGeneration;
    let timer;
    const startup = (async () => {
      if (!targetWindow.MathJax?.startup?.promise) {
        scriptAttempt = loadScript(targetWindow);
        await scriptAttempt.promise;
      }
      const mathJax = targetWindow.MathJax;
      if (!mathJax?.startup?.promise || typeof mathJax.startup.promise.then !== 'function') {
        throw runtimeError('The mathematics renderer has no startup promise.', 'startup');
      }
      await mathJax.startup.promise;
      verifyRuntime(mathJax);
      hardenMathJaxSafeUrls(mathJax, targetWindow.document.baseURI);
      return mathJax;
    })();
    const timeout = new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(runtimeError('The mathematics renderer took too long to start.', 'startup')), startupTimeoutMs);
    });
    readyPromise = Promise.race([startup, timeout]).then(mathJax => {
      if (generation !== startupGeneration || disposed) throw runtimeError('The mathematics startup was retired.', 'startup');
      renderer = mathJax;
      publish({ status: 'ready', error: null, phase: null, stalled: false });
      return mathJax;
    }).catch(error => {
      if (generation === startupGeneration && !disposed) {
        renderer = null;
        scriptAttempt?.remove();
        scriptAttempt = null;
        publish({ status: 'failed', error, phase: error.phase || 'startup', stalled: false });
      }
      throw error;
    }).finally(() => clearTimeout(timer));
    publish({ status: 'loading', error: null, phase: null, stalled: false });
    return readyPromise;
  }

  function retry() {
    if (snapshot.stalled) return Promise.reject(runtimeError('The previous mathematics render is still running. Reload the page if it does not finish.', 'render'));
    if (snapshot.status === 'loading') return ensureReady();
    failedElements.clear();
    publish({ error: null, phase: null, retryVersion: snapshot.retryVersion + 1 });
    if (renderer) return Promise.resolve(renderer);
    startupGeneration++;
    scriptAttempt?.remove();
    scriptAttempt = null;
    readyPromise = null;
    // A failed startup object is not reusable. Configure the next script anew.
    const targetWindow = getWindow();
    if (targetWindow) targetWindow.MathJax = createMathJaxConfig();
    return ensureReady();
  }

  function enqueue(element, { key, update } = {}) {
    if (snapshot.stalled) return { promise: Promise.reject(snapshot.error), cancel() {} };
    if (!element || element.nodeType !== 1) {
      return { promise: Promise.reject(new TypeError('A mathematics render requires an element.')), cancel() {} };
    }
    let entry = elements.get(element);
    if (!entry) {
      entry = { current: null, successfulKey: undefined, markup: null };
      elements.set(element, entry);
    }
    entry.current?.cancel();
    let resolveJob;
    let rejectJob;
    const promise = new Promise((resolve, reject) => { resolveJob = resolve; rejectJob = reject; });
    const job = {
      cancelled: false,
      settled: false,
      settle(value, error = false) {
        if (job.settled) return;
        job.settled = true;
        jobs.delete(job);
        if (error) rejectJob(value); else resolveJob(value);
      },
      cancel() { job.cancelled = true; job.settle(cancelled()); },
    };
    entry.current = job;
    jobs.add(job);
    serial(async () => {
      if (job.cancelled || disposed || !element.isConnected) return job.cancel();
      let mathJax;
      try {
        mathJax = await ensureReady();
        if (job.cancelled || entry.current !== job || !element.isConnected) return job.cancel();
        if (key !== undefined && entry.successfulKey === key && entry.markup === element.innerHTML) {
          return job.settle({ status: 'unchanged' });
        }
        if (update) {
          mathJax.typesetClear([element]);
          update(element);
        }
        let timeout;
        try {
          // A v3 render cannot be aborted. Report a stall, but retain its lane
          // until the real promise settles so retry never overlaps that work.
          timeout = setTimeout(() => {
            const error = runtimeError('Rendering mathematics took too long. Reload the page if it does not finish.', 'render');
            showError(error, 'render', true);
            job.settle(error, true);
            jobs.forEach(waiting => {
              waiting.cancelled = true;
              waiting.settle(error, true);
            });
          }, renderTimeoutMs);
          await mathJax.typesetPromise([element]);
          if (element.querySelector('mjx-merror, [data-mjx-error]')) {
            throw runtimeError('A formula contains unsupported or invalid TeX.', 'render');
          }
        } finally {
          clearTimeout(timeout);
          if (snapshot.stalled) publish({ stalled: false });
        }
        if (job.cancelled || disposed || entry.current !== job || !element.isConnected) {
          mathJax.typesetClear([element]);
          return job.cancel();
        }
        entry.successfulKey = key;
        entry.markup = element.innerHTML;
        failedElements.delete(element);
        if (!job.settled && !failedElements.size) publish({ error: null, phase: null, stalled: false });
        job.settle({ status: 'rendered' });
      } catch (error) {
        if (job.cancelled || disposed) return;
        if (mathJax) {
          failedElements.add(element);
          showError(runtimeError('This mathematics could not be rendered. You can retry.', 'render'), 'render');
        }
        job.settle(error, true);
      }
    }).catch(error => job.settle(error, true));
    return { promise, cancel: job.cancel };
  }

  // For renderer-owned leaves, remove/replace runs only after tracked old math
  // is cleared. A live error UI can retain its failure until retry or unmount.
  function retire(element, remove, { retainFailure = false } = {}) {
    if (!element) return Promise.resolve(cancelled());
    const entry = elements.get(element);
    entry?.current?.cancel();
    if (entry) { entry.successfulKey = undefined; entry.markup = null; }
    const clear = () => {
      renderer?.typesetClear([element]);
      remove?.(element);
      if (!retainFailure) {
        failedElements.delete(element);
        if (!failedElements.size && snapshot.phase === 'render' && !snapshot.stalled) {
          publish({ error: null, phase: null });
        }
      }
      return { status: 'cleared' };
    };
    if (!pendingLaneTasks) {
      try { return Promise.resolve(clear()); } catch (error) { return Promise.reject(error); }
    }
    return serial(clear);
  }

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => IDLE,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    ensureReady,
    retry,
    enqueue,
    retire,
    dispose() {
      disposed = true;
      startupGeneration++;
      scriptAttempt?.remove();
      jobs.forEach(job => job.cancel());
      listeners.clear();
    },
  };
}

const serverRuntime = createMathJaxRuntime({ getWindow: () => null });
export function getMathJaxRuntime() {
  if (typeof window === 'undefined') return serverRuntime;
  if (!browserRuntimes.has(window)) browserRuntimes.set(window, createMathJaxRuntime());
  return browserRuntimes.get(window);
}
