import React, { StrictMode, useEffect, useRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { processMathJax, useMathJax as useLegacyMathJax } from '@/utils/latex';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { deferred, renderer, tick } from '../runtime/fixtures';

const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({ ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime }));
vi.mock('next/navigation', () => ({ usePathname: () => '/test-sections' }));
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

const sections = [1, 2].map(value => ({
  id: `section-${value}`, title: `Step ${value}`,
  content: <span>{`\\[x=${value}\\]`}</span>,
}));
const flush = async () => { await act(async () => { await tick(); }); };

function formulaLeaves(nodes) {
  for (const root of nodes) {
    for (const leaf of [root, ...root.querySelectorAll('span')]) {
      if (leaf.childElementCount || !/^\\[[(]/.test(leaf.textContent)) continue;
      const math = document.createElement('mjx-container');
      math.dataset.source = leaf.textContent;
      leaf.replaceChildren(math);
    }
  }
  return Promise.resolve();
}

describe('section navigation and legacy mathematics adapters', () => {
  let mathJax;
  let startup;
  beforeEach(() => {
    vi.useFakeTimers();
    startup = deferred();
    mathJax = renderer(startup.promise);
    mathJax.typesetPromise.mockImplementation(formulaLeaves);
    window.MathJax = mathJax;
    shared.runtime = createMathJaxRuntime();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });
  afterEach(async () => {
    cleanup();
    shared.runtime.dispose();
    await tick();
    delete window.MathJax;
    vi.useRealTimers();
  });

  it('renders the live section after startup exceeds the old retry delay', async () => {
    const { container, unmount } = render(<StrictMode><SectionBasedContent title="Examples" sections={sections} showBackToHub={false} /></StrictMode>);
    await flush();
    fireEvent.click(screen.getByRole('button', { name: /Step 2/ }));
    await flush();
    expect(screen.getByRole('heading', { name: 'Section 2: Step 2' })).toHaveFocus();
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { startup.resolve(); await tick(); });
    expect(container.querySelector('mjx-container')).toHaveAttribute('data-source', '\\[x=2\\]');
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(mathJax.typesetPromise.mock.calls[0][0][0].isConnected).toBe(true);
    unmount(); await flush();
    // Framer Motion may leave its final frame callback after unmount.
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps completion and return navigation working without delayed duplicate renders', async () => {
    const completed = vi.fn();
    startup.resolve();
    const { container } = render(<SectionBasedContent title="Examples" sections={sections} onComplete={completed} showBackToHub={false} />);
    await flush();
    fireEvent.click(screen.getByRole('button', { name: /Step 2/ })); await flush();
    fireEvent.click(screen.getByRole('button', { name: 'Complete Section' })); await flush();
    expect(completed).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: '✓ Completed' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Step 1/ })); await flush();
    expect(container.querySelector('mjx-container')).toHaveAttribute('data-source', '\\[x=1\\]');
    const calls = mathJax.typesetPromise.mock.calls.length;
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(mathJax.typesetPromise).toHaveBeenCalledTimes(calls);
    expect(completed).toHaveBeenCalledOnce();
  });

  it('keeps the legacy ref hook compatible with effect-created formulas and cancels unmounted work', async () => {
    function LegacyLeaf({ value }) {
      const ref = useRef(null);
      useLegacyMathJax(ref, [value], 100);
      useEffect(() => { ref.current.textContent = `\\(x=${value}\\)`; }, [value]);
      return <div ref={ref} />;
    }
    const { container, rerender, unmount } = render(<StrictMode><LegacyLeaf value={1} /></StrictMode>);
    await flush();
    rerender(<StrictMode><LegacyLeaf value={2} /></StrictMode>); await flush();
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { startup.resolve(); await tick(); });
    expect(container.querySelector('mjx-container')).toHaveAttribute('data-source', '\\(x=2\\)');
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    unmount(); await flush();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('waits for readiness in the imperative compatibility promise and reports a renderer failure', async () => {
    const element = document.createElement('span');
    element.textContent = '\\(x=3\\)'; document.body.appendChild(element);
    const settled = vi.fn();
    const work = processMathJax(element, 100).then(settled);
    await tick(); await vi.advanceTimersByTimeAsync(500);
    expect(settled).not.toHaveBeenCalled();
    startup.resolve(); await work;
    expect(element.querySelector('mjx-container')).toHaveAttribute('data-source', '\\(x=3\\)');
    mathJax.typesetPromise.mockRejectedValueOnce(new Error('render failed'));
    await expect(processMathJax(element)).rejects.toThrow('render failed');
    await shared.runtime.retire(element); element.remove();
    expect(shared.runtime.getSnapshot().error).toBeNull();
  });

  it('cancels an imperative leaf removed before startup instead of rendering detached content', async () => {
    const element = document.createElement('span'); document.body.appendChild(element);
    const work = processMathJax(element); await tick();
    element.remove(); startup.resolve();
    await expect(work).resolves.toEqual({ status: 'cancelled' });
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
  });
});
