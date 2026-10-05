import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePageVisibility, useReducedMotion } from '@/hooks/useReducedMotion';
import { installMotionEnvironment } from './environment';

describe('motion preferences', () => {
  let environment;
  beforeEach(() => { environment = installMotionEnvironment(); });
  afterEach(() => { environment.restore(); });

  it('responds to preference changes and removes its listener on unmount', () => {
    const { result, unmount } = renderHook(useReducedMotion);
    expect(result.current).toBe(false);
    expect(environment.listeners.size).toBe(1);
    act(() => environment.setReduced(true));
    expect(result.current).toBe(true);
    act(() => environment.setReduced(false));
    expect(result.current).toBe(false);
    unmount();
    expect(environment.listeners.size).toBe(0);
  });

  it('uses static content when the motion preference API is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(useReducedMotion);
    expect(result.current).toBe(true);
  });

  it('renders a static server snapshot before browser preferences hydrate', () => {
    function PreferenceProbe() {
      const reduced = useReducedMotion();
      const visible = usePageVisibility();
      return <span>{`${reduced}:${visible}`}</span>;
    }
    expect(renderToString(<PreferenceProbe />)).toContain('true:false');
  });

  it('tracks hidden tabs and cleans up its document listener', () => {
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const { result, unmount } = renderHook(usePageVisibility);
    expect(result.current).toBe(true);
    act(() => environment.setVisible(false));
    expect(result.current).toBe(false);
    act(() => environment.setVisible(true));
    expect(result.current).toBe(true);
    unmount();
    expect(removeListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
});
