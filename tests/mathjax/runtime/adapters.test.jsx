import { StrictMode, useEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { MathJaxProvider, useMathJax as useReadiness, useMathJaxProcessor } from '@/components/shared/MathJaxProvider';
import { useMathJax, useMathJaxWithState, useLatexString } from '@/hooks/useMathJax';
import { useMathJaxQueue } from '@/hooks/useMathJaxQueue';
import { deferred, renderer, tick } from './fixtures';

const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({ ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime }));

function Formula({ formula = '\\(x\\)' }) {
  const ref = useMathJax([formula]);
  return <span data-testid="formula" ref={ref}>{formula}</span>;
}
function Readiness() {
  const { ready } = useReadiness();
  return <output data-testid="readiness">{String(ready)}</output>;
}
function ConditionalStateFormula() {
  const { ref, isLoading, error } = useMathJaxWithState([]);
  if (error) return <p data-testid="formula-error">Formula error</p>;
  return <span ref={ref} data-testid="formula" data-loading={isLoading}>\\(x\\)</span>;
}

beforeEach(() => {
  vi.useFakeTimers();
  window.MathJax = renderer();
  shared.runtime = createMathJaxRuntime();
});
afterEach(async () => {
  cleanup();
  shared.runtime.dispose();
  await tick();
  delete window.MathJax;
  document.head.querySelectorAll('[data-probability-mathjax]').forEach(node => node.remove());
  vi.useRealTimers();
});

describe('shared provider and compatibility adapters', () => {
  it('renders raw formula text and stable false readiness during server rendering without loading scripts', () => {
    const ensure = vi.spyOn(shared.runtime, 'ensureReady');
    const html = renderToString(<MathJaxProvider><Readiness /><Formula /></MathJaxProvider>);
    expect(html).toContain('\\(x\\)');
    expect(html).toContain('false');
    expect(ensure).not.toHaveBeenCalled();
    expect(document.head.querySelector('[data-probability-mathjax]')).toBeNull();
  });

  it('deduplicates StrictMode startup and cancelled initial effect passes', async () => {
    const startup = deferred();
    window.MathJax = renderer(startup.promise);
    render(<StrictMode><MathJaxProvider><Readiness /><Formula /></MathJaxProvider></StrictMode>);
    await act(async () => { await tick(); });
    expect(screen.getByTestId('readiness')).toHaveTextContent('false');
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { startup.resolve(); await tick(); });
    expect(screen.getByTestId('readiness')).toHaveTextContent('true');
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledWith([screen.getByTestId('formula')]);
  });

  it('shows a failed download, retains raw content, and a visible retry makes a real new request', async () => {
    delete window.MathJax;
    render(<MathJaxProvider><Readiness /><Formula /></MathJaxProvider>);
    await act(async () => { await tick(); });
    const old = document.head.querySelector('[data-probability-mathjax]');
    await act(async () => { old.dispatchEvent(new Event('error')); await tick(); });
    expect(screen.getByRole('status', { name: 'Mathematics rendering' })).toHaveTextContent('could not be rendered');
    expect(screen.getByTestId('formula')).toHaveTextContent('\\(x\\)');
    expect(screen.getByTestId('readiness')).toHaveTextContent('false');
    fireEvent.click(screen.getByRole('button', { name: 'Retry mathematics' }));
    const next = document.head.querySelector('[data-probability-mathjax]');
    expect(next).not.toBe(old);
    window.MathJax = renderer();
    await act(async () => { next.dispatchEvent(new Event('load')); await tick(); });
    expect(screen.queryByRole('status', { name: 'Mathematics rendering' })).toBeNull();
    expect(screen.getByTestId('readiness')).toHaveTextContent('true');
    expect(window.MathJax.typesetPromise).toHaveBeenCalledWith([screen.getByTestId('formula')]);
  });

  it('retries a loading-state caller whose error branch temporarily detached its ref', async () => {
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('failure'));
    render(<MathJaxProvider><ConditionalStateFormula /></MathJaxProvider>);
    await act(async () => { await tick(); });
    expect(screen.getByTestId('formula-error')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Mathematics rendering' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry mathematics' }));
    await act(async () => { await tick(); });
    expect(screen.queryByTestId('formula-error')).toBeNull();
    expect(screen.getByTestId('formula')).toHaveAttribute('data-loading', 'false');
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
    expect(window.MathJax.typesetPromise).toHaveBeenLastCalledWith([screen.getByTestId('formula')]);
  });

  it('keeps retry for a live stateful error and clears it when that formula unmounts', async () => {
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('failure'));
    const { rerender } = render(<MathJaxProvider><ConditionalStateFormula /></MathJaxProvider>);
    await act(async () => { await tick(); });
    expect(screen.getByTestId('formula-error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry mathematics' })).toBeEnabled();
    rerender(<MathJaxProvider><Formula formula="\\(y\\)" /></MathJaxProvider>);
    await act(async () => { await tick(); });
    expect(screen.queryByRole('status', { name: 'Mathematics rendering' })).toBeNull();
    expect(screen.queryByTestId('formula-error')).toBeNull();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
    expect(window.MathJax.typesetPromise).toHaveBeenLastCalledWith([screen.getByTestId('formula')]);
  });

  it('uses latest DOM after rapid dependency updates with no 100ms duplicate pass', async () => {
    const startup = deferred();
    window.MathJax = renderer(startup.promise);
    const { rerender } = render(<Formula formula="first" />);
    await act(async () => { await tick(); });
    rerender(<Formula formula="second" />);
    rerender(<Formula formula="third" />);
    await act(async () => { startup.resolve(); await tick(); });
    expect(screen.getByTestId('formula')).toHaveTextContent('third');
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('serializes the processor and old queue adapters and clears their completed targets at unmount', async () => {
    const active = deferred();
    window.MathJax.typesetPromise.mockImplementationOnce(() => active.promise);
    let queueProcess;
    let processMathJax;
    function Adapters() {
      const first = useRef(null);
      const { processMathJax: processor, isProcessing } = useMathJaxProcessor();
      const { queueProcess: queued, elementRef } = useMathJaxQueue();
      useEffect(() => {
        processMathJax = () => processor(first.current);
        queueProcess = () => queued(elementRef.current, 'same');
      }, [processor, queued, elementRef]);
      return <><span data-testid="first" ref={first}>first</span><span data-testid="second" ref={elementRef}>second</span><output data-testid="processing">{String(isProcessing)}</output></>;
    }
    const { unmount } = render(<Adapters />);
    let first;
    let second;
    await act(async () => { first = processMathJax(); second = queueProcess(); await tick(); });
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(screen.getByTestId('processing')).toHaveTextContent('true');
    await act(async () => { active.resolve(); await first; await second; await tick(); });
    expect(screen.getByTestId('processing')).toHaveTextContent('false');
    const firstNode = screen.getByTestId('first');
    const secondNode = screen.getByTestId('second');
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
    unmount();
    await act(async () => { await tick(); });
    expect(window.MathJax.typesetClear).toHaveBeenCalledWith([firstNode]);
    expect(window.MathJax.typesetClear).toHaveBeenCalledWith([secondNode]);
  });

  it('reports invalid TeX output as a failure even when the MathJax promise resolves', async () => {
    window.MathJax.typesetPromise.mockImplementationOnce(([element]) => {
      element.append(document.createElement('mjx-merror'));
      return Promise.resolve();
    });
    render(<MathJaxProvider><Formula /></MathJaxProvider>);
    await act(async () => { await tick(); });
    expect(screen.getByRole('status', { name: 'Mathematics rendering' })).toHaveTextContent('could not be rendered');
    expect(shared.runtime.getSnapshot().error).toBeInstanceOf(Error);
  });

  it('escapes HTML in legacy LaTeX props while preserving formula text', () => {
    function Text() { return <div data-testid="escaped" {...useLatexString('<img src=x onerror=alert(1)> & x', true)} />; }
    render(<Text />);
    expect(screen.getByTestId('escaped').querySelector('img')).toBeNull();
    expect(screen.getByTestId('escaped')).toHaveTextContent('\\(<img src=x onerror=alert(1)> & x\\)');
  });
});
