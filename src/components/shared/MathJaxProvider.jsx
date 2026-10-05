'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getMathJaxRuntime } from '@/lib/mathjax/runtime';

const MathJaxContext = createContext(null);

export function useMathJax() {
  const provided = useContext(MathJaxContext);
  const runtime = getMathJaxRuntime();
  const state = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getServerSnapshot);
  return provided || { ...state, ready: state.status === 'ready', retry: runtime.retry };
}

export function MathJaxProvider({ children }) {
  const runtime = getMathJaxRuntime();
  const state = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getServerSnapshot);
  useEffect(() => { runtime.ensureReady().catch(() => {}); }, [runtime]);

  return (
    <MathJaxContext.Provider value={{ ...state, ready: state.status === 'ready', retry: runtime.retry }}>
      {state.error && (
        <div role="status" aria-label="Mathematics rendering" className="border-b border-amber-700 bg-amber-950 px-4 py-3 text-sm text-amber-100">
          <p>{state.stalled ? 'Mathematics rendering is still running. Reload this page if it does not finish.' : 'Some mathematics could not be rendered. Retry mathematics to display it.'}</p>
          <button type="button" disabled={state.stalled} onClick={() => runtime.retry().catch(() => {})}
            className="mt-2 rounded border border-amber-300 px-3 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50">
            Retry mathematics
          </button>
        </div>
      )}
      {children}
    </MathJaxContext.Provider>
  );
}

export function useMathJaxProcessor() {
  const runtime = getMathJaxRuntime();
  const [isProcessing, setIsProcessing] = useState(false);
  const mounted = useRef(false);
  const requests = useRef(new Map());
  const ownedElements = useRef(new Set());
  useEffect(() => {
    mounted.current = true;
    const owned = requests.current;
    const nodes = ownedElements.current;
    return () => {
      mounted.current = false;
      owned.forEach((request, element) => {
        request.cancel();
      });
      nodes.forEach(element => runtime.retire(element).catch(() => {}));
      nodes.clear();
      owned.clear();
    };
  }, [runtime]);
  const processMathJax = useCallback(element => {
    if (element) ownedElements.current.add(element);
    const request = runtime.enqueue(element);
    requests.current.set(element, request);
    if (mounted.current) setIsProcessing(true);
    return request.promise.finally(() => {
      if (requests.current.get(element) === request) requests.current.delete(element);
      if (mounted.current) setIsProcessing(requests.current.size > 0);
    });
  }, [runtime]);
  return { processMathJax, isProcessing };
}
