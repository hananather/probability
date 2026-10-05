import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getMathJaxRuntime } from '@/lib/mathjax/runtime';

const SKIPPED_TAGS = /^(?:script|noscript|style|textarea|pre|code|annotation|annotation-xml)$/i;
const RAW_START = /\\[([]/;

// Match the configured HTML text regions, excluding output owned by MathJax.
// The source signature excludes surrounding controls and counters.
function rawMathSource(element) {
  if (!element || !RAW_START.test(element.textContent || '')) return null;
  const sources = [];
  function collect(container, ignored = false) {
    const process = container.classList?.contains('mathjax_process');
    if (container.tagName?.toLowerCase() === 'mjx-container' || container.hasAttribute?.('data-MJX') ||
      (SKIPPED_TAGS.test(container.tagName || '') && !process)) return;
    const skipText = !process && (ignored || container.classList?.contains('mathjax_ignore'));
    let text = '';
    const flush = () => {
      const formulas = text.match(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g);
      if (formulas) sources.push(...formulas);
      else if (RAW_START.test(text)) sources.push(text.slice(text.search(RAW_START)));
      text = '';
    };
    for (const node of container.childNodes) {
      if (node.nodeType === 3 && !skipText) text += node.nodeValue;
      else if (node.nodeType === 1) {
        if (node.tagName === 'BR') { if (!skipText) text += '\n'; }
        else if (node.tagName !== 'WBR') { flush(); collect(node, skipText); }
      }
    }
    flush();
  }
  collect(element);
  return sources.length ? JSON.stringify(sources) : null;
}

function useRenderingEffect(containerRef, dependencies, onStart, onFinish, retainDetachedFailure = false) {
  const runtime = getMathJaxRuntime();
  const owner = useRef(null);
  const commitVersion = useRef(0);
  const getRetryVersion = useCallback(() => runtime.getSnapshot().retryVersion, [runtime]);
  const getServerRetryVersion = useCallback(() => runtime.getServerSnapshot().retryVersion, [runtime]);
  const retryVersion = useSyncExternalStore(runtime.subscribe, getRetryVersion, getServerRetryVersion);
  useLayoutEffect(() => {
    const current = {
      element: containerRef.current, request: null, mounted: true,
      pending: true, scheduled: false, failed: false, blockedSource: null,
      unresolvedSources: new Set(),
    };
    owner.current = current;
    onStart?.();
    // A loading-state caller may have replaced its container with an error
    // message. Allow the explicit retry's state reset to attach the new ref.
    queueMicrotask(() => {
      if (!current.mounted) return;
      current.pending = false;
      renderCurrent(current, true);
    });
    return () => {
      current.mounted = false;
      current.request?.cancel();
      runtime.retire(current.element).catch(() => {});
    };
    // Explicit content dependencies and Retry retain their forced request.
    // The separate commit check recovers eligible raw source restored by React.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime, containerRef, retryVersion, ...dependencies]);

  function scheduleRecovery(current, followUp = false) {
    if (current.scheduled || !current.mounted) return;
    current.scheduled = true;
    queueMicrotask(() => {
      current.scheduled = false;
      if (current.mounted) renderCurrent(current, false, followUp);
    });
  }

  function renderCurrent(current, forced, followUp = false) {
    if (!current.mounted || owner.current !== current) return;
    const element = containerRef.current;
    // A live WithState error branch intentionally removes the ref. Keep its
    // shared failure and Retry available until retry or true owner cleanup.
    if (!element && current.failed && retainDetachedFailure) return;
    if (current.element !== element) {
      current.request?.cancel();
      runtime.retire(current.element).catch(() => {});
      current.element = element;
      current.request = null;
      current.pending = false;
      current.failed = false;
      current.blockedSource = null;
      current.unresolvedSources.clear();
    }
    if (!element || current.pending || (!forced && current.failed)) return;
    const source = rawMathSource(element);
    if (!forced && (!source || (!followUp && current.blockedSource === source))) return;
    current.pending = true;
    const startedCommit = commitVersion.current;
    // React replaced old output with source. Clear its retained math items in
    // the lane before finding that source again; no DOM rewrite is needed here.
    const request = runtime.enqueue(element, forced ? undefined : { update() {} });
    current.request = request;
    const isCurrent = () => current.mounted && owner.current === current && current.request === request && current.element === element;
    request.promise.then(result => {
      if (!isCurrent()) return;
      current.pending = false;
      if (result.status === 'cancelled') return;
      const remainingSource = rawMathSource(element);
      current.blockedSource = remainingSource;
      if (!remainingSource) current.unresolvedSources.clear();
      // React may have restored authored HTML while the renderer was running.
      // Allow one follow-up per unresolved source, never a no-op retry loop.
      if (remainingSource && commitVersion.current > startedCommit && !current.unresolvedSources.has(remainingSource)) {
        current.unresolvedSources.add(remainingSource);
        scheduleRecovery(current, true);
      }
      if (forced) onFinish?.(null);
    }, error => {
      if (!isCurrent()) return;
      current.pending = false;
      current.failed = true;
      runtime.retire(element, undefined, { retainFailure: true }).catch(() => {}).finally(() => {
        if (isCurrent()) onFinish?.(error);
      });
    });
  }

  // Next's HTML reconciliation can restore raw TeX on an unrelated render.
  // Intact output requires no queue work, even when controls update frequently.
  useLayoutEffect(() => {
    commitVersion.current++;
    const current = owner.current;
    if (current) scheduleRecovery(current);
  });
  return runtime;
}

/** Accepts dependencies, or an existing object ref followed by dependencies. */
export function useMathJax(refOrDependencies = [], suppliedDependencies = []) {
  const ownRef = useRef(null);
  const hasSuppliedRef = !Array.isArray(refOrDependencies);
  if (hasSuppliedRef && (!refOrDependencies || typeof refOrDependencies !== 'object' || !('current' in refOrDependencies))) {
    throw new TypeError('useMathJax expects a dependency array or an object ref');
  }
  const containerRef = hasSuppliedRef ? refOrDependencies : ownRef;
  const dependencies = hasSuppliedRef ? suppliedDependencies : refOrDependencies;
  if (!Array.isArray(dependencies)) throw new TypeError('useMathJax dependencies must be an array');
  useRenderingEffect(containerRef, dependencies);
  return containerRef;
}

/** Loading/error result is retained; retries are now shared and explicit. */
export function useMathJaxWithState(dependencies = [], options = {}) {
  if (!Array.isArray(dependencies)) throw new TypeError('useMathJax dependencies must be an array');
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const runtime = useRenderingEffect(containerRef, dependencies,
    () => { setIsLoading(true); setError(null); },
    failure => { setIsLoading(false); setError(failure); },
    true,
  );
  // maxRetries is accepted for old callers. There are no automatic retry loops.
  void options;
  return { ref: containerRef, isLoading, error, retry: runtime.retry };
}

/** Encode text before supplying the legacy inner-HTML props. TeX is filtered by ui/safe. */
export function useLatexString(latex, inline = false) {
  const delimiter = inline ? '\\(' : '\\[';
  const endDelimiter = inline ? '\\)' : '\\]';
  const escaped = String(latex).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  return { dangerouslySetInnerHTML: { __html: `${delimiter}${escaped}${endDelimiter}` } };
}
