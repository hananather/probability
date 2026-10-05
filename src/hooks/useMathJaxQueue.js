import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { getMathJaxRuntime } from '@/lib/mathjax/runtime';

export function useMathJaxQueue() {
  const runtime = getMathJaxRuntime();
  const state = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getServerSnapshot);
  const elementRef = useRef(null);
  const requests = useRef(new Map());
  const ownedElements = useRef(new Set());
  useEffect(() => {
    runtime.ensureReady().catch(() => {});
    const owned = requests.current;
    const nodes = ownedElements.current;
    return () => {
      owned.forEach((request, element) => {
        request.cancel();
      });
      nodes.forEach(element => runtime.retire(element).catch(() => {}));
      nodes.clear();
      owned.clear();
    };
  }, [runtime]);
  const queueProcess = useCallback((element, contentHash) => {
    if (element) ownedElements.current.add(element);
    const request = runtime.enqueue(element, { key: contentHash });
    requests.current.set(element, request);
    return request.promise.finally(() => {
      if (requests.current.get(element) === request) requests.current.delete(element);
    });
  }, [runtime]);
  return { queueProcess, isReady: state.status === 'ready', elementRef, error: state.error, retry: runtime.retry };
}
