import React, { act, StrictMode, useEffect, useMemo, useRef, useState } from 'next/dist/compiled/react';
import { createRoot } from 'next/dist/compiled/react-dom/client';
import { fireEvent, getByRole, within } from '@testing-library/dom';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { JsdomAdaptor } from 'mathjax-full/js/adaptors/jsdomAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { SafeHandler } from 'mathjax-full/js/ui/safe/SafeHandler.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMathJax, useMathJaxWithState } from '@/hooks/useMathJax';
import { MathJaxProvider } from '@/components/shared/MathJaxProvider';
import { createMathJaxConfig } from '@/lib/mathjax/config';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { deferred, tick } from '../runtime/fixtures';

vi.mock('react', () => import('next/dist/compiled/react'));
vi.mock('react/jsx-runtime', () => import('next/dist/compiled/react/jsx-runtime'));
vi.mock('react/jsx-dev-runtime', () => import('next/dist/compiled/react/jsx-dev-runtime'));
const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({
  ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime,
}));

function RefOwner({ value = 'x', counter = 0, stable = false, visible = true, tag = 'span' }) {
  const ref = useRef(null);
  useMathJax(ref, []);
  const html = useMemo(() => ({ __html: `\\(${value}\\)` }), [value]);
  return <div><output>{counter}</output>{visible && React.createElement(tag, {
    ref, 'data-testid': 'formula', dangerouslySetInnerHTML: stable ? html : { ...html },
  })}</div>;
}
function DependencyOwner({ value }) {
  const ref = useMathJax([value]);
  return <span ref={ref} dangerouslySetInnerHTML={{ __html: `\\[${value}\\]` }} />;
}
function CounterOwner() {
  const [counter, setCounter] = useState(0);
  useEffect(() => { const timer = setInterval(() => setCounter(value => value + 1), 50); return () => clearInterval(timer); }, []);
  return <RefOwner counter={counter} stable />;
}
function StatefulOwner() {
  const { ref, error, isLoading } = useMathJaxWithState([]);
  const html = useMemo(() => ({ __html: '\\(x\\)' }), []);
  if (error) return <p>Formula failed</p>;
  return <span ref={ref} data-loading={isLoading} dangerouslySetInnerHTML={html} />;
}
function IgnoredOwner({ counter = 0, tag = 'code', className }) {
  const ref = useMathJax([]);
  return <div ref={ref}><output>{counter}</output>{React.createElement(tag, { className }, '\\(example\\)')}</div>;
}
function UnmatchedOwner({ counter = 0 }) {
  const ref = useMathJax([]);
  return <div ref={ref}><output>{counter}</output><span dangerouslySetInnerHTML={{ __html: '\\(unfinished' }} /></div>;
}
function EligibleRegionOwner({ counter = 0, processed = false }) {
  const ref = useMathJax([]);
  const html = { __html: '\\(x<wbr>+<!-- adjacent source -->y\\)' };
  return <div ref={ref}><output>{counter}</output>{processed ?
    <div className="mathjax_ignore"><code className="mathjax_process" dangerouslySetInnerHTML={html} /></div> :
    <span dangerouslySetInnerHTML={html} />}</div>;
}

let root;
let container;
let startup;
let engine;
let renderEngine;
let originalActEnvironment;
const settle = () => act(async () => { for (let index = 0; index < 8; index++) await tick(); });
async function show(children) {
  if (!root) {
    container = document.createElement('div'); document.body.appendChild(container);
    root = createRoot(container);
  }
  await act(async () => root.render(<MathJaxProvider>{children}</MathJaxProvider>));
  await settle();
}
const formulas = () => [...container.querySelectorAll('mjx-container')];
const renderedSources = () => Array.from(engine.math).map(item => item.math);
const ready = async () => { await act(async () => startup.resolve()); await settle(); };

beforeAll(() => { originalActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT; globalThis.IS_REACT_ACT_ENVIRONMENT = true; });
beforeEach(() => {
  vi.useFakeTimers(); startup = deferred();
  const config = createMathJaxConfig();
  SafeHandler(RegisterHTMLHandler(new JsdomAdaptor(window)));
  engine = mathjax.document(document, {
    InputJax: new TeX({ ...config.tex, packages: AllPackages }),
    OutputJax: new CHTML(), safeOptions: config.options.safeOptions,
  });
  renderEngine = async elements => { engine.options.elements = elements; engine.reset(); engine.render(); };
  window.MathJax = {
    version: mathjax.version, startup: { promise: startup.promise, document: engine },
    typesetClear: vi.fn(elements => engine.clearMathItemsWithin(elements)),
    typesetPromise: vi.fn(elements => renderEngine(elements)),
  };
  shared.runtime = createMathJaxRuntime();
});
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = null; container?.remove(); container = null;
  shared.runtime.dispose(); await tick(); delete window.MathJax; vi.useRealTimers();
});
afterAll(() => {
  if (originalActEnvironment === undefined) delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  else globalThis.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
});

describe('scoped recovery of authored TeX restored by Next React', () => {
  it('recovers a static supplied-ref owner after unrelated parent commits and a changed raw formula', async () => {
    startup.resolve(); await show(<RefOwner />);
    expect(formulas()).toHaveLength(1);
    await show(<RefOwner counter={1} />);
    expect(formulas()).toHaveLength(1);
    expect(container.textContent).not.toMatch(/\\[([]/);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
    await show(<RefOwner value="y" counter={2} />);
    expect(formulas()).toHaveLength(1);
    expect(renderedSources()).toEqual(['y']);
    const formula = formulas()[0]; await settle();
    expect(formulas()[0]).toBe(formula);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(3);
    expect(Array.from(engine.math)).toHaveLength(1);
  });

  it('keeps explicit dependency requests and both delimiter forms', async () => {
    startup.resolve(); await show(<DependencyOwner value="x" />);
    await show(<DependencyOwner value="y" />);
    expect(formulas()).toHaveLength(1);
    expect(renderedSources()).toEqual(['y']);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
  });

  it('queues no additional work for intact mathematics across a 50ms counter', async () => {
    startup.resolve(); await show(<CounterOwner />);
    const formula = formulas()[0];
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); }); await settle();
    expect(container.querySelector('output')).toHaveTextContent('20');
    expect(formulas()[0]).toBe(formula);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('coalesces commits while startup is pending and renders current attached source once', async () => {
    await show(<RefOwner />);
    for (let index = 1; index <= 10; index++) await show(<RefOwner value={`x_${index}`} counter={index} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
    await ready();
    expect(formulas()).toHaveLength(1);
    expect(renderedSources()).toEqual(['x_10']);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('coalesces commits while an actual render is held before it reads the current DOM', async () => {
    const held = deferred();
    window.MathJax.typesetPromise.mockImplementationOnce(async elements => { await held.promise; await renderEngine(elements); });
    startup.resolve(); await show(<RefOwner />);
    for (let index = 1; index <= 5; index++) await show(<RefOwner value="y" counter={index} />);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
    await act(async () => { held.resolve(); }); await settle();
    expect(formulas()).toHaveLength(1); expect(renderedSources()).toEqual(['y']);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('recovers once if React restores source after output was written but before the render settles', async () => {
    const held = deferred();
    window.MathJax.typesetPromise.mockImplementationOnce(async elements => { await renderEngine(elements); await held.promise; });
    startup.resolve(); await show(<RefOwner />);
    expect(formulas()).toHaveLength(1);
    await show(<RefOwner value="y" counter={1} />);
    expect(formulas()).toHaveLength(0);
    await act(async () => { held.resolve(); }); await settle();
    expect(formulas()).toHaveLength(1); expect(renderedSources()).toEqual(['y']);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
    expect(Array.from(engine.math)).toHaveLength(1);
  });

  it('retains a live render failure across unrelated commits until explicit Retry', async () => {
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('failed render'));
    startup.resolve(); await show(<RefOwner />);
    for (let index = 1; index <= 5; index++) await show(<RefOwner counter={index} />);
    expect(getByRole(container, 'status', { name: 'Mathematics rendering' })).toBeInTheDocument();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
    await act(async () => fireEvent.click(getByRole(container, 'button', { name: 'Retry mathematics' }))); await settle();
    expect(formulas()).toHaveLength(1);
    expect(within(container).queryByRole('status', { name: 'Mathematics rendering' })).toBeNull();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
  });

  it('keeps WithState failure, detached-ref Retry, and settled loading semantics', async () => {
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('failed render'));
    startup.resolve(); await show(<StatefulOwner />);
    expect(container).toHaveTextContent('Formula failed');
    expect(getByRole(container, 'button', { name: 'Retry mathematics' })).toBeEnabled();
    await act(async () => fireEvent.click(getByRole(container, 'button', { name: 'Retry mathematics' }))); await settle();
    expect(formulas()).toHaveLength(1);
    expect(container.querySelector('[data-loading]')).toHaveAttribute('data-loading', 'false');
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
    await settle(); expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
  });

  it('forgets a stateless conditional-ref failure when its target disappears', async () => {
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('failed render'));
    startup.resolve(); await show(<RefOwner />);
    expect(getByRole(container, 'button', { name: 'Retry mathematics' })).toBeEnabled();
    await show(<RefOwner visible={false} counter={1} />);
    expect(within(container).queryByRole('status', { name: 'Mathematics rendering' })).toBeNull();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
    await show(<RefOwner counter={2} />);
    expect(formulas()).toHaveLength(1);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
  });

  it('retains another live failure while a stateless failed target disappears', async () => {
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('first failure')).mockRejectedValueOnce(new Error('second failure'));
    startup.resolve(); await show(<><RefOwner key="first" /><RefOwner key="second" value="z" /></>);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
    await show(<><RefOwner key="first" visible={false} /><RefOwner key="second" value="z" /></>);
    expect(getByRole(container, 'button', { name: 'Retry mathematics' })).toBeEnabled();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
    await show(<><RefOwner key="first" visible={false} /><RefOwner key="second" value="z" visible={false} /></>);
    expect(within(container).queryByRole('status', { name: 'Mathematics rendering' })).toBeNull();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
  });

  it('does not retry a successful no-op renderer on every UI commit', async () => {
    window.MathJax.typesetPromise.mockResolvedValue();
    startup.resolve(); await show(<RefOwner />);
    for (let index = 1; index <= 20; index++) await show(<RefOwner counter={index} />);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(shared.runtime.getSnapshot().error).toBeNull();
  });

  it('does not spin on an unmatched authored delimiter that the actual engine leaves unchanged', async () => {
    startup.resolve(); await show(<UnmatchedOwner />);
    for (let index = 1; index <= 10; index++) await show(<UnmatchedOwner counter={index} />);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it.each([['code', undefined], ['pre', undefined], ['span', 'mathjax_ignore']])('ignores raw delimiter examples inside %s/%s', async (tag, className) => {
    startup.resolve(); await show(<IgnoredOwner tag={tag} className={className} />);
    expect(formulas()).toHaveLength(0);
    for (let index = 1; index <= 5; index++) await show(<IgnoredOwner tag={tag} className={className} counter={index} />);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it.each([false, true])('recovers adjacent eligible text with the configured process-class override=%s', async processed => {
    startup.resolve(); await show(<EligibleRegionOwner processed={processed} />);
    expect(formulas()).toHaveLength(1);
    await show(<EligibleRegionOwner processed={processed} counter={1} />);
    expect(formulas()).toHaveLength(1);
    expect(renderedSources()).toEqual(['x+y']);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
    await settle(); expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
  });

  it('does not treat delimiter-looking text inside rendered output as authored source', async () => {
    startup.resolve(); await show(<RefOwner stable />);
    formulas()[0].appendChild(document.createTextNode('\\(literal\\)'));
    await show(<RefOwner stable counter={1} />);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('handles a ref attached after a UI commit without an explicit dependency change', async () => {
    startup.resolve(); await show(<RefOwner visible={false} />);
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
    await show(<RefOwner visible />);
    expect(formulas()).toHaveLength(1);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('renders a replacement ref and cancels the retired queued target under StrictMode', async () => {
    await show(<StrictMode><RefOwner /></StrictMode>);
    const old = container.querySelector('[data-testid="formula"]');
    await show(<StrictMode><RefOwner value="y" tag="div" /></StrictMode>);
    await ready();
    expect(old.isConnected).toBe(false);
    expect(formulas()).toHaveLength(1); expect(renderedSources()).toEqual(['y']);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(window.MathJax.typesetPromise.mock.calls[0][0][0].isConnected).toBe(true);
  });

  it('cancels all startup work when the owner unmounts', async () => {
    await show(<StrictMode><RefOwner /></StrictMode>);
    await act(async () => root.unmount()); root = null;
    await ready();
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('retires replaced and unmounted math items while preserving a sibling owner', async () => {
    startup.resolve();
    await show(<><RefOwner key="first" /><RefOwner key="second" value="z" stable /></>);
    expect(renderedSources().sort()).toEqual(['x', 'z']);
    await show(<><RefOwner key="first" value="y" /><RefOwner key="second" value="z" stable /></>);
    expect(renderedSources().sort()).toEqual(['y', 'z']);
    const sibling = formulas().find(node => Array.from(engine.math).some(item => item.math === 'z' && item.typesetRoot === node));
    await show(<><RefOwner key="second" value="z" stable /></>);
    expect(renderedSources()).toEqual(['z']);
    expect(formulas()[0]).toBe(sibling);
    await act(async () => root.unmount()); root = null; await settle();
    expect(Array.from(engine.math)).toHaveLength(0);
  });

  it('clears output inserted during a held render after that owner unmounts', async () => {
    const held = deferred();
    window.MathJax.typesetPromise.mockImplementationOnce(async elements => { await renderEngine(elements); await held.promise; });
    startup.resolve(); await show(<RefOwner />);
    const inserted = formulas()[0];
    expect(Array.from(engine.math)).toHaveLength(1);
    await act(async () => root.unmount()); root = null;
    await act(async () => { held.resolve(); }); await settle();
    expect(Array.from(engine.math)).toHaveLength(0);
    expect(inserted.isConnected).toBe(false);
    expect(window.MathJax.typesetClear.mock.calls.some(([roots]) => roots.includes(inserted))).toBe(true);
  });

  it('retains a partial-render failure until its owner retires without clearing a successful sibling', async () => {
    window.MathJax.typesetPromise.mockImplementationOnce(async elements => { await renderEngine(elements); throw new Error('partial render'); });
    startup.resolve();
    await show(<><RefOwner key="failed" /><RefOwner key="sibling" value="z" stable /></>);
    expect(getByRole(container, 'button', { name: 'Retry mathematics' })).toBeEnabled();
    expect(renderedSources()).toEqual(['z']);
    await show(<><RefOwner key="sibling" value="z" stable /></>);
    expect(within(container).queryByRole('status', { name: 'Mathematics rendering' })).toBeNull();
    expect(renderedSources()).toEqual(['z']);
  });

  it('reports a recovery clear failure and requires Retry before rendering again', async () => {
    startup.resolve(); await show(<RefOwner />);
    window.MathJax.typesetClear.mockImplementationOnce(() => { throw new Error('clear failed'); });
    await show(<RefOwner counter={1} />);
    expect(getByRole(container, 'button', { name: 'Retry mathematics' })).toBeEnabled();
    await show(<RefOwner counter={2} />);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledOnce();
    await act(async () => fireEvent.click(getByRole(container, 'button', { name: 'Retry mathematics' }))); await settle();
    expect(formulas()).toHaveLength(1);
    expect(Array.from(engine.math)).toHaveLength(1);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
  });
});
