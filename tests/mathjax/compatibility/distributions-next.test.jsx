import ExpectationVarianceWorkedExample from '@/components/02-discrete-random-variables/2-2-2-ExpectationVarianceWorkedExample';
import FunctionTransformations from '@/components/02-discrete-random-variables/2-3-2-FunctionTransformations';
import BinomialDistribution from '@/components/02-discrete-random-variables/2-3-3-BinomialDistribution';
import GeometricDistribution from '@/components/02-discrete-random-variables/2-4-1-GeometricDistribution';
import NegativeBinomialDistribution from '@/components/02-discrete-random-variables/2-5-1-NegativeBinomialDistribution';
import PoissonDistribution from '@/components/02-discrete-random-variables/2-6-1-PoissonDistribution';
import DistributionStories from '@/components/02-discrete-random-variables/2-7-1-DistributionStories';
import EmpiricalRule from '@/components/03-continuous-random-variables/3-3-normal-distribution/3-3-3-EmpiricalRule';
import ExponentialDistribution from '@/components/03-continuous-random-variables/3-4-exponential-distribution/3-4-1-ExponentialDistribution';
import React, { act } from 'next/dist/compiled/react';
import { createRoot } from 'next/dist/compiled/react-dom/client';
import { fireEvent, getByRole, getAllByRole } from '@testing-library/dom';
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
// Decorative motion uses a separately installed React in this test environment.
// Keep these wrappers simple while the lesson controls and D3 effects run.
vi.mock('framer-motion', async () => {
  const React = await import('next/dist/compiled/react');
  const components = new Map();
  const motion = new Proxy({}, { get(_target, tag) {
    if (!components.has(tag)) components.set(tag, React.forwardRef(function Motion({ children, initial, animate, exit, transition, whileHover, whileTap, layout, ...props }, ref) {
      void initial; void animate; void exit; void transition; void whileHover; void whileTap; void layout;
      return React.createElement(tag, { ...props, ref }, children);
    }));
    return components.get(tag);
  } });
  return { motion, AnimatePresence: ({ children }) => children };
});
vi.mock('@/components/reference-sheets/Chapter3ReferenceSheet', () => ({ Chapter3ReferenceSheet: () => null }));
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

async function mount(Component) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const lesson = React.createElement(Component);
  await act(async () => root.render(React.createElement(MathJaxProvider, null, lesson)));
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


const raw = scope => [...scope.querySelectorAll('span, div')]
  .filter(node => !node.childElementCount && /\\[([]/.test(node.textContent))
  .map(node => node.textContent);
const mathNodes = scope => [...scope.querySelectorAll('mjx-container')];
const countCalls = () => window.MathJax.typesetPromise.mock.calls.length;
function expectPreservedMath(scope, nodes, calls) {
  expect(raw(scope)).toEqual([]);
  expect(mathNodes(scope)).toEqual(nodes);
  expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
}

describe('actual Next distribution formulas and unchanged-math rendering budgets', () => {
  it.each([
    ['binomial', BinomialDistribution], ['geometric', GeometricDistribution],
    ['negative binomial', NegativeBinomialDistribution], ['poisson', PoissonDistribution],
  ])('retains static %s math after a parameter change', async (_name, Page) => {
    startup.resolve(); await mount(Page);
    const card = getByRole(container, 'heading', { name: /Distribution Concepts/ }).parentElement;
    const nodes = mathNodes(card); const calls = countCalls();
    expect(nodes.length).toBeGreaterThan(0); expect(raw(card)).toEqual([]);
    const slider = getAllByRole(container, 'slider')[0];
    await act(async () => fireEvent.change(slider, { target: { value: String(Number(slider.value) + Number(slider.step || 1)) } }));
    await settle();
    expectPreservedMath(card, nodes, calls);
    expect(container.querySelector('mjx-merror')).toBeNull();
  });

  it('keeps statistics formulas when mapping visibility changes without another math request', async () => {
    startup.resolve(); await mount(FunctionTransformations);
    const stats = getByRole(container, 'heading', { name: 'Statistical Properties' }).parentElement;
    const nodes = mathNodes(stats); const calls = countCalls();
    expect(nodes.length).toBeGreaterThan(0); expect(raw(stats)).toEqual([]);
    const checkbox = getByRole(container, 'checkbox', { name: 'Show function mapping visualization' });
    await act(async () => fireEvent.click(checkbox)); await settle();
    expect(checkbox.checked).toBe(false); expectPreservedMath(stats, nodes, calls);
    await act(async () => fireEvent.click(checkbox)); await settle();
    expect(checkbox.checked).toBe(true); expectPreservedMath(stats, nodes, calls);
  });

  it('keeps statistics formulas through actual table highlighting without another math request', async () => {
    startup.resolve(); await mount(FunctionTransformations);
    const stats = getByRole(container, 'heading', { name: 'Statistical Properties' }).parentElement;
    const nodes = mathNodes(stats); const calls = countCalls();
    expect(raw(stats)).toEqual([]);
    const row = container.querySelector('tbody tr');
    await act(async () => fireEvent.mouseOver(row)); await settle();
    expect(row.className).toContain('bg-amber-900/20'); expectPreservedMath(stats, nodes, calls);
    await act(async () => fireEvent.mouseOut(row)); await settle();
    expect(row.className).not.toContain('bg-amber-900/20'); expectPreservedMath(stats, nodes, calls);
  });

  it('updates empirical ranges while keeping all unchanged formulas after parameter changes', async () => {
    startup.resolve(); await mount(EmpiricalRule);
    expect(raw(container)).toEqual([]);
    const nodes = mathNodes(container); const calls = countCalls();
    expect(nodes).toHaveLength(11);
    expect(container.querySelector('.mjx-c1D707')).not.toBeNull();
    expect(container.querySelector('.mjx-c1D70E')).not.toBeNull();
    await act(async () => fireEvent.change(getAllByRole(container, 'slider')[0], { target: { value: '110' } })); await settle();
    expect(container.textContent).toContain('[95.0, 125.0]');
    expectPreservedMath(container, nodes, calls);
    await act(async () => fireEvent.change(getAllByRole(container, 'slider')[1], { target: { value: '20' } })); await settle();
    expect(container.textContent).toContain('[90.0, 130.0]');
    expectPreservedMath(container, nodes, calls);
  });

  it('updates sample counts, histogram, and reset while issuing no math work for the 50 ms counter', async () => {
    startup.resolve(); await mount(EmpiricalRule);
    expect(raw(container)).toEqual([]);
    const nodes = mathNodes(container); const calls = countCalls();
    await click('Generate');
    await act(async () => { await vi.advanceTimersByTimeAsync(200); }); await settle();
    expect(container.textContent).toContain('Total Samples: 4');
    expectPreservedMath(container, nodes, calls);
    await click('Pause'); await click('Show Histogram');
    expect(container.querySelector('svg.w-full rect')).not.toBeNull();
    expectPreservedMath(container, nodes, calls);
    await click('Reset');
    expect(container.textContent).toContain('Total Samples: 0');
    expectPreservedMath(container, nodes, calls);
  });

  it('changes the empirical selected sigma and chart region while retaining the formula nodes', async () => {
    startup.resolve(); await mount(EmpiricalRule);
    const nodes = mathNodes(container); const calls = countCalls();
    const buttons = [...container.querySelectorAll('button')].filter(button => button.querySelector('mjx-container'));
    expect(buttons).toHaveLength(3);
    expect(container.querySelector('.region-2').style.opacity).toBe('0.3');
    await act(async () => fireEvent.click(buttons[1])); await settle();
    expect(buttons[1].className).toContain('bg-primary');
    expect(container.querySelector('.region-2').style.opacity).toBe('1');
    expect(container.querySelector('.region-3').style.opacity).toBe('0.3');
    expectPreservedMath(container, nodes, calls);
  });

  it('renders changed exponential stage, time, and memoryless calculations', async () => {
    startup.resolve(); await mount(ExponentialDistribution);
    expect(raw(container)).toEqual([]);
    await click('Next'); expect(raw(container)).toEqual([]);
    await act(async () => fireEvent.change(getAllByRole(container, 'slider')[1], { target: { value: '2' } })); await settle();
    expect(raw(container)).toEqual([]);
    expect(sourcePasses.some(pass => pass.text.includes('P(T \\leq 2.0)'))).toBe(true);
    await click('Next');
    await act(async () => fireEvent.click(getByRole(container, 'checkbox', { name: 'Show Memoryless Property' }))); await settle();
    expect(raw(container)).toEqual([]);
    expect(container.querySelector('mjx-merror')).toBeNull();
  });

  it('renders changed expectation props and keeps story stages drawing without requests', async () => {
    startup.resolve(); await mount(ExpectationVarianceWorkedExample);
    expect(raw(container)).toEqual([]);
    await act(async () => root.render(React.createElement(ExpectationVarianceWorkedExample, { probs: [0, 0, 0, 0, 0, 1] }))); await settle();
    expect(raw(container)).toEqual([]);
    expect(sourcePasses.at(-1).text).toContain('E[X] = 6.0000');
    await act(async () => root.unmount()); root = null; container.remove();
    sourcePasses = []; await mount(DistributionStories);
    await click('Go to Random Events in Time');
    await act(async () => { await vi.advanceTimersByTimeAsync(600); }); await settle();
    expect(container.querySelector('svg').textContent).toContain('visitors');
    expect(sourcePasses).toHaveLength(0);
  });
});
