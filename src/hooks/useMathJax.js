import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getMathJaxRuntime } from '@/lib/mathjax/runtime';

function useRenderingEffect(containerRef, dependencies, onStart, onFinish) {
  const runtime = getMathJaxRuntime();
  const { retryVersion } = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getServerSnapshot);
  useLayoutEffect(() => {
    let element = containerRef.current;
    let request;
    let mounted = true;
    onStart?.();
    // A loading-state caller may have replaced its container with an error
    // message. Allow the explicit retry's state reset to attach the new ref.
    queueMicrotask(() => {
      if (!mounted) return;
      element = containerRef.current;
      if (!element) return;
      request = runtime.enqueue(element);
      request.promise.then(
        result => { if (mounted && result.status !== 'cancelled') onFinish?.(null); },
        error => {
          runtime.retire(element, undefined, { retainFailure: true }).catch(() => {}).finally(() => { if (mounted) onFinish?.(error); });
        },
      );
    });
    return () => {
      mounted = false;
      request?.cancel();
      runtime.retire(element).catch(() => {});
    };
    // Explicit dependencies control existing lesson call sites; changing a ref's
    // contents alone does not request new typesetting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime, containerRef, retryVersion, ...dependencies]);
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
