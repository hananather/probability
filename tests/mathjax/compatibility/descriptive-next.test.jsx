import MathematicalFoundations from '@/components/04-descriptive-statistics-sampling/4-2-central-tendency/4-2-4-MathematicalFoundations';
import SharedCoinFlipSimulation from '@/components/shared/CoinFlipSimulation';
import OverviewCoinFlipSimulation from '@/components/overview-components/CoinFlipSimulation';
import React, { act, StrictMode } from 'next/dist/compiled/react';
import { createRoot } from 'next/dist/compiled/react-dom/client';
import { fireEvent, getByRole } from '@testing-library/dom';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { JsdomAdaptor } from 'mathjax-full/js/adaptors/jsdomAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { SafeHandler } from 'mathjax-full/js/ui/safe/SafeHandler.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MathJaxProvider } from '@/components/shared/MathJaxProvider';
import { createMathJaxConfig } from '@/lib/mathjax/config';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { deferred, tick } from '../runtime/fixtures';

// App Router's bundled React can replace rendered inner HTML during a parent
// render. Use that renderer, together with the real mathematics engine.
vi.mock('react', () => import('next/dist/compiled/react'));
vi.mock('react/jsx-runtime', () => import('next/dist/compiled/react/jsx-runtime'));
vi.mock('react/jsx-dev-runtime', () => import('next/dist/compiled/react/jsx-dev-runtime'));
const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({
  ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime,
}));
// Framer's external installed React differs from App Router's bundled React in
// jsdom. Isolate decorative motion here; the other descriptive fixture runs
// the actual transition library and delayed mount behavior.
vi.mock('framer-motion', async () => {
  const React = await import('next/dist/compiled/react');
  const motion = new Proxy({}, { get(_target, tag) {
    return React.forwardRef(function Motion({ children, initial, animate, exit, transition, whileHover, whileTap, layout, ...props }, ref) {
      void initial; void animate; void exit; void transition; void whileHover; void whileTap; void layout;
      return React.createElement(tag, { ...props, ref }, children);
    });
  } });
  return { motion, AnimatePresence: ({ children }) => children };
});
vi.mock('@/components/ui/BackToHub', () => ({ default: () => null }));

let root;
let container;
let startup;
let sourcePasses;
let originalActEnvironment;
let originalGetBBox;
let originalGetTotalLength;
let originalBounds;
let transformDescriptor;

async function settle() {
  await act(async () => { for (let index = 0; index < 8; index++) await tick(); });
}

async function mount(Component, strict = false) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const lesson = React.createElement(Component);
  await act(async () => root.render(React.createElement(MathJaxProvider, null,
    strict ? React.createElement(StrictMode, null, lesson) : lesson)));
  await settle();
}

async function click(name, scope = container) {
  await act(async () => fireEvent.click(getByRole(scope, 'button', { name })));
  await settle();
}

beforeAll(() => {
  originalActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  originalBounds = SVGElement.prototype.getBoundingClientRect;
  SVGElement.prototype.getBoundingClientRect = () => ({ width: 800, height: 700 });
  transformDescriptor = Object.getOwnPropertyDescriptor(SVGElement.prototype, 'transform');
  Object.defineProperty(SVGElement.prototype, 'transform', { configurable: true, value: { baseVal: { consolidate: () => null } } });
  originalGetBBox = SVGElement.prototype.getBBox;
  originalGetTotalLength = SVGElement.prototype.getTotalLength;
  // jsdom has no SVG layout. D3's untouched label-position effect needs bounds.
  SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 100, height: 20 });
  SVGElement.prototype.getTotalLength = () => 100;
});

beforeEach(() => {
  vi.useFakeTimers();
  startup = deferred();
  sourcePasses = [];
  const config = createMathJaxConfig();
  SafeHandler(RegisterHTMLHandler(new JsdomAdaptor(window)));
  const documentEngine = mathjax.document(document, {
    InputJax: new TeX({ ...config.tex, packages: AllPackages }),
    OutputJax: new CHTML(),
    safeOptions: config.options.safeOptions,
  });
  window.MathJax = {
    version: mathjax.version,
    startup: { promise: startup.promise, document: documentEngine },
    typesetClear: vi.fn(elements => documentEngine.clearMathItemsWithin(elements)),
    typesetPromise: vi.fn(async elements => {
      sourcePasses.push({ element: elements[0], text: elements[0].textContent });
      documentEngine.options.elements = elements;
      documentEngine.reset();
      documentEngine.render();
    }),
  };
  shared.runtime = createMathJaxRuntime();
});

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = null;
  shared.runtime.dispose();
  await tick();
  container?.remove();
  container = null;
  delete window.MathJax;
  vi.useRealTimers();
});

afterAll(() => {
  if (originalActEnvironment === undefined) delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  else globalThis.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
  SVGElement.prototype.getBoundingClientRect = originalBounds;
  if (transformDescriptor) Object.defineProperty(SVGElement.prototype, 'transform', transformDescriptor);
  else delete SVGElement.prototype.transform;
  if (originalGetBBox === undefined) delete SVGElement.prototype.getBBox;
  else SVGElement.prototype.getBBox = originalGetBBox;
  if (originalGetTotalLength === undefined) delete SVGElement.prototype.getTotalLength;
  else SVGElement.prototype.getTotalLength = originalGetTotalLength;
});

describe('descriptive formulas with App Router React and the real MathJax engine', () => {
  it.each([
    ['shared', SharedCoinFlipSimulation], ['overview', OverviewCoinFlipSimulation],
  ])('keeps %s simulator formulas rendered while editing and restoring batch size', async (_name, Component) => {
    startup.resolve();
    await mount(Component, true);
    expect(container.querySelectorAll('mjx-container').length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/\\[([]/);
    const input = getByRole(container, 'spinbutton');
    await act(async () => fireEvent.change(input, { target: { value: '20' } }));
    await settle();
    expect(getByRole(container, 'button', { name: 'Run 20 Trials' })).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\\[([]/);
    await act(async () => fireEvent.change(input, { target: { value: '' } }));
    await settle();
    expect(input.value).toBe('');
    expect(container.textContent).not.toMatch(/\\[([]/);
    await act(async () => fireEvent.focusOut(input));
    await settle();
    expect(input.value).toBe('20');
    expect(container.textContent).not.toMatch(/\\[([]/);
    const calls = window.MathJax.typesetPromise.mock.calls.length;
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    await settle();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
    expect(container.querySelector('[data-mjx-error]')).toBeNull();
  });

  it('keeps mean and median formulas rendered when only a pending control changes', async () => {
    startup.resolve();
    await mount(MathematicalFoundations);
    await click(/Arithmetic Mean.*Next/);
    expect(container.textContent).not.toMatch(/\\[([]/);
    await act(async () => fireEvent.change(getByRole(container, 'slider', { name: 'New Value:' }), { target: { value: '10' } }));
    await settle();
    expect(container.textContent).not.toMatch(/\\[([]/);
    await click(/Median.*Next/);
    expect(container.textContent).not.toMatch(/\\[([]/);
    await click('Sort & Find Median');
    expect(container.textContent).not.toMatch(/\\[([]/);
    await click('Show Original');
    expect(container.textContent).not.toMatch(/\\[([]/);
  });
});
