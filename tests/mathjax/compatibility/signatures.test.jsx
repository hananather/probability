import { useRef } from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMathJax, useMathJaxWithState } from '@/hooks/useMathJax';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { deferred, renderer, tick } from '../runtime/fixtures';
import { JointDistributionWorkedExamples } from '@/components/ui/patterns/JointDistributionExamples';

const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({ ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime }));

function DependencyFormula({ formula }) {
  const ref = useMathJax([formula]);
  return <span ref={ref} data-testid="formula">{formula}</span>;
}

// The NormalZScoreExplorer LatexContent wrapper uses this existing-ref form.
function ExistingRefFormula({ children }) {
  const contentRef = useRef(null);
  const returnedRef = useMathJax(contentRef, [children]);
  return <span ref={contentRef} data-testid="formula" data-same-ref={returnedRef === contentRef}>{children}</span>;
}

function StaticRefFormula({ formula }) {
  const ref = useRef(null);
  useMathJax(ref);
  return <span ref={ref}>{formula}</span>;
}

describe('MathJax existing call signatures', () => {
  let typesetPromise;
  let typesetClear;
  let download;
  beforeEach(() => {
    vi.useFakeTimers();
    typesetPromise = vi.fn(() => Promise.resolve());
    typesetClear = vi.fn();
    window.MathJax = { ...renderer(), typesetPromise, typesetClear };
    download = deferred();
    shared.runtime = createMathJaxRuntime({ loadScript: () => ({ promise: download.promise, remove() { download.reject(new Error('retired')); } }) });
  });
  afterEach(async () => {
    shared.runtime.dispose();
    await tick();
    delete window.MathJax;
    vi.useRealTimers();
  });

  it.each([DependencyFormula, ExistingRefFormula])('typesets the attached current DOM for both supported forms (%#)', async Formula => {
    const { rerender, unmount } = render(<Formula formula={'\\(x\\)'}>{'\\(x\\)'}</Formula>);
    const node = screen.getByTestId('formula');
    await act(async () => { await tick(); });
    expect(typesetPromise).toHaveBeenCalledWith([node]);
    if (Formula === ExistingRefFormula) expect(node).toHaveAttribute('data-same-ref', 'true');
    await act(async () => {});
    typesetPromise.mockClear();
    rerender(<Formula formula={'\\(y\\)'}>{'\\(y\\)'}</Formula>);
    await act(async () => { await tick(); });
    expect(typesetClear).toHaveBeenCalledWith([node]);
    expect(typesetPromise).toHaveBeenCalledTimes(1);
    expect(typesetPromise).toHaveBeenLastCalledWith([node]);
    expect(node).toHaveTextContent('\\(y\\)');
    unmount();
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(typesetPromise).toHaveBeenCalledTimes(1);
  });

  it('recovers raw TeX with static ref dependencies while plain ref changes do not queue', async () => {
    const { rerender } = render(<StaticRefFormula formula="\\(x\\)" />);
    await act(async () => {});
    typesetPromise.mockClear();
    rerender(<StaticRefFormula formula="\\(y\\)" />);
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(typesetPromise).toHaveBeenCalledOnce();
    typesetPromise.mockClear();
    rerender(<StaticRefFormula formula="plain label" />);
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(typesetPromise).not.toHaveBeenCalled();
  });

  it('uses a replacement supplied ref and cancels the old ref retry', async () => {
    delete window.MathJax;
    const oldNode = document.createElement('span');
    const newNode = document.createElement('span');
    document.body.append(oldNode, newNode);
    const firstRef = { current: oldNode };
    const secondRef = { current: newNode };
    const { rerender, unmount } = renderHook(({ ref }) => useMathJax(ref, []), { initialProps: { ref: firstRef } });
    rerender({ ref: secondRef });
    await act(async () => { await tick(); });
    window.MathJax = { ...renderer(), typesetPromise, typesetClear };
    download.resolve();
    await act(async () => { await tick(); });
    expect(typesetPromise).toHaveBeenCalledTimes(1);
    expect(typesetPromise).toHaveBeenLastCalledWith([newNode]);
    unmount();
    oldNode.remove();
    newNode.remove();
  });

  it('does not schedule retries when an in-flight render rejects after unmount', async () => {
    let reject;
    typesetPromise.mockImplementation(() => new Promise((resolve, rejectPromise) => { reject = rejectPromise; }));
    const { unmount } = render(<ExistingRefFormula>\\(x\\)</ExistingRefFormula>);
    await act(async () => { await tick(); });
    unmount();
    await act(async () => { reject(new Error('late failure')); });
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(typesetPromise).toHaveBeenCalledTimes(1);
  });

  it('mounts the actual mixed-signature worked example and renders changed examples', async () => {
    const { container, unmount } = render(<JointDistributionWorkedExamples />);
    const parent = container.firstElementChild;
    await act(async () => { await tick(); });
    expect(typesetPromise.mock.calls.some(([nodes]) => nodes[0] === parent)).toBe(true);
    await act(async () => {});
    typesetPromise.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Example 2' }));
    await act(async () => { await tick(); });
    expect(screen.getByText('Example 2: Checking Independence')).toBeInTheDocument();
    expect(typesetPromise.mock.calls.some(([nodes]) => nodes[0] === parent)).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Show Solution' }));
    expect(screen.getByText('✓ Yes, X and Y are independent!')).toBeInTheDocument();
    unmount();
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('retains the loading-state hook result and dependency-array contract', async () => {
    function WithState({ formula }) {
      const { ref, isLoading, error } = useMathJaxWithState([formula]);
      return <span ref={ref} data-testid="state" data-loading={isLoading} data-error={String(error)}>{formula}</span>;
    }
    const { rerender } = render(<WithState formula="\\(x\\)" />);
    await act(async () => {});
    expect(screen.getByTestId('state')).toHaveAttribute('data-loading', 'false');
    expect(screen.getByTestId('state')).toHaveAttribute('data-error', 'null');
    typesetPromise.mockClear();
    rerender(<WithState formula="\\(y\\)" />);
    await act(async () => {});
    expect(typesetPromise).toHaveBeenCalledWith([screen.getByTestId('state')]);
    expect(screen.getByTestId('state')).toHaveAttribute('data-loading', 'false');
  });

  it('cancels loading-state retries when a pending render fails after unmount', async () => {
    let reject;
    typesetPromise.mockImplementation(() => new Promise((resolve, rejectPromise) => { reject = rejectPromise; }));
    function PendingFormula() {
      const { ref } = useMathJaxWithState([]);
      return <span ref={ref}>\\(x\\)</span>;
    }
    const { unmount } = render(<PendingFormula />);
    await act(async () => { await tick(); });
    unmount();
    await act(async () => { reject(new Error('late loading-state failure')); });
    expect(vi.getTimerCount()).toBe(0);
    expect(typesetPromise).toHaveBeenCalledOnce();
  });
});
