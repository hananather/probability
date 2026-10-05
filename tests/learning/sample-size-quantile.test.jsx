import React, { act, StrictMode } from 'next/dist/compiled/react';
import { createRoot } from 'next/dist/compiled/react-dom/client';
import { fireEvent, getByRole, getByText, queryByRole } from '@testing-library/dom';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { JsdomAdaptor } from 'mathjax-full/js/adaptors/jsdomAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { SafeHandler } from 'mathjax-full/js/ui/safe/SafeHandler.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { selection } from 'd3-selection';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import SampleSizeCalculation from '@/components/05-estimation/5-3-SampleSizeCalculation';
import { MathJaxProvider } from '@/components/shared/MathJaxProvider';
import { createMathJaxConfig } from '@/lib/mathjax/config';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { deferred, tick } from '../mathjax/runtime/fixtures';

vi.mock('react', () => import('next/dist/compiled/react'));
vi.mock('react/jsx-runtime', () => import('next/dist/compiled/react/jsx-runtime'));
vi.mock('react/jsx-dev-runtime', () => import('next/dist/compiled/react/jsx-dev-runtime'));
const shared = vi.hoisted(() => ({ runtime: null, reducedMotion: true, listeners: new Set() }));
vi.mock('@/hooks/useReducedMotion', async () => {
  const React = await import('next/dist/compiled/react');
  return { useReducedMotion: () => React.useSyncExternalStore(
    listener => { shared.listeners.add(listener); return () => shared.listeners.delete(listener); },
    () => shared.reducedMotion,
    () => shared.reducedMotion,
  ) };
});
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({
  ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime,
}));
// Separate reference/navigation widgets are isolated; the imported lesson,
// completion/navigation card, formulas, controls, and D3 effects remain real.
vi.mock('@/components/reference-sheets/Chapter5ReferenceSheet', () => ({ Chapter5ReferenceSheet: () => null }));
vi.mock('@/components/ui/BackToHub', () => ({ default: () => null }));
vi.mock('next/link', async () => {
  const React = await import('next/dist/compiled/react');
  return { default: React.forwardRef(function Link({ children, href, ...props }, ref) {
    return React.createElement('a', { ...props, href, ref }, children);
  }) };
});
// Decorative motion imports a separate React in the fixture. Keep native
// elements, refs, and content while isolating animation behavior.
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

let root;
let container;
let startup;
let sourcePasses;
let originalActEnvironment;
let originalGetBBox;
let originalGetTotalLength;
let originalBounds;
let originalClientWidth;
let chartWidth;

async function settle() {
  await act(async () => { for (let index = 0; index < 8; index++) await tick(); });
}

async function mount(Component = SampleSizeCalculation, props = {}, strict = false) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const lesson = React.createElement(Component, props);
  await act(async () => root.render(strict ? React.createElement(StrictMode, null, React.createElement(MathJaxProvider, null, lesson)) : React.createElement(MathJaxProvider, null, lesson)));
  await settle();
}

async function click(name, scope = container) {
  await act(async () => fireEvent.click(getByRole(scope, 'button', { name })));
  await settle();
}

function expectRendered(scope = container) {
  expect(scope.textContent).not.toMatch(/\\[([]/);
  expect(scope.querySelectorAll('mjx-merror')).toHaveLength(0);
}

beforeAll(() => {
  originalActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  originalGetBBox = SVGElement.prototype.getBBox;
  originalGetTotalLength = SVGElement.prototype.getTotalLength;
  originalBounds = SVGElement.prototype.getBoundingClientRect;
  originalClientWidth = Object.getOwnPropertyDescriptor(SVGElement.prototype, 'clientWidth');
  // jsdom does not lay out SVGs; supply a visible chart boundary while
  // keeping the real D3 data, scales, joins and controls under test.
  SVGElement.prototype.getBoundingClientRect = () => ({ width: chartWidth, height: 500, x:0, y:0, left:0, top:0, right:chartWidth, bottom:500 });
  Object.defineProperty(SVGElement.prototype, 'clientWidth', { configurable: true, get: () => chartWidth });
  SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 100, height: 20 });
  SVGElement.prototype.getTotalLength = () => 100;
});

beforeEach(() => {
  shared.reducedMotion = true;
  chartWidth = 700;
  vi.useFakeTimers();
  // D3 retains its module-level animation clock across fake-timer cases.
  // Settle decorative drawing transitions; retain real joins, SVG geometry,
  // and end callbacks so the actual relationship controls become available.
  vi.spyOn(selection.prototype, 'transition').mockImplementation(function () {
    const selected = this;
    const transition = {
      duration() { return transition; },
      delay() { return transition; },
      ease() { return transition; },
      attr(...args) { selected.attr(...args); return transition; },
      style(...args) { selected.style(...args); return transition; },
      on(name, callback) {
        if (name === 'end') queueMicrotask(() => callback.call(selected.node()));
        else selected.on(name, callback);
        return transition;
      },
    };
    return transition;
  });
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
      sourcePasses.push({ element: elements[0], text: elements[0].textContent, connected: elements[0].isConnected });
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
  SVGElement.prototype.getBoundingClientRect = originalBounds;
  if (originalClientWidth) Object.defineProperty(SVGElement.prototype, 'clientWidth', originalClientWidth);
  else delete SVGElement.prototype.clientWidth;
  if (originalActEnvironment === undefined) delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  else globalThis.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
  if (originalGetBBox === undefined) delete SVGElement.prototype.getBBox;
  else SVGElement.prototype.getBBox = originalGetBBox;
  if (originalGetTotalLength === undefined) delete SVGElement.prototype.getTotalLength;
  else SVGElement.prototype.getTotalLength = originalGetTotalLength;
});





// Independent Python NormalDist references, calculated before integer rounding.
const boundaries = [
  { confidence: 98, sigma: 1.7, E: .1, z: 2.3263478740408408, unrounded: 1564.0374905747037, n: 1565 },
  { confidence: 90, sigma: 1.7, E: .1, z: 1.6448536269514715, unrounded: 781.9020582335734, n: 782 },
  { confidence: 95, sigma: 2.5, E: .7, z: 1.9599639845400534, unrounded: 48.99819924354749, n: 49 },
  { confidence: 99, sigma: 1.5, E: .1, z: 2.5758293035489, unrounded: 1492.851735229772, n: 1493 },
];
function calculator() {
  return getByRole(container, 'heading', { name: 'Sample Size Calculator' }).parentElement.parentElement;
}
async function edit(scope, name, value) {
  await act(async () => fireEvent.change(getByRole(scope, 'spinbutton', { name }), { target: { value: String(value) } }));
  await settle();
}
async function selectConfidence(scope, confidence) {
  await act(async () => fireEvent.change(getByRole(scope, 'combobox', { name: 'Confidence Level' }), { target: { value: String(confidence) } }));
  await settle();
}
function formulaSources(scope) {
  return Array.from(window.MathJax.startup.document.math)
    .filter(item => scope.contains(item.typesetRoot)).map(item => item.math);
}
function expectSteps(scope) {
  const steps = getByRole(scope, 'region', { name: 'Sample size calculation steps' });
  expect(steps.querySelectorAll('mjx-container')).toHaveLength(4);
  expect(steps.querySelector('mjx-mfrac')).not.toBeNull();
  expect(steps.querySelector('mjx-msup')).not.toBeNull();
  expect(formulaSources(steps)[0]).toContain('z_{\\alpha/2} \\approx');
  expect(formulaSources(steps)[1]).toContain('n^* =');
  expect(formulaSources(steps)[2]).toContain('n^* \\approx');
  expect(formulaSources(steps)[3]).toContain('\\lceil n^*');
  expect(scope.textContent).toContain('full computed critical value and unrounded arithmetic');
  expectRendered();
  return steps;
}

it.each(boundaries)('uses the full quantile for the displayed, worked and saved $confidence percent boundary', async sample => {
  startup.resolve(); await mount(); await click(/^Practice/); const scope = calculator();
  await edit(scope, 'Population SD (σ)', sample.sigma);
  await edit(scope, 'Margin of Error (E)', sample.E);
  await selectConfidence(scope, sample.confidence);
  expect(scope.querySelector('p.text-5xl').textContent).toBe(`n = ${sample.n}`);
  await click('Show Calculation', scope);
  const steps = expectSteps(scope);
  expect(formulaSources(steps)[0]).toContain(sample.z.toFixed(6));
  expect(getByText(steps, `n* ≈ ${sample.unrounded.toFixed(2)}`)).toBeVisible();
  expect(getByText(steps, `n = ${sample.n} (rounded up)`)).toBeVisible();
  expect(sample.z * sample.sigma / Math.sqrt(sample.n)).toBeLessThanOrEqual(sample.E);
  expect(sample.z * sample.sigma / Math.sqrt(sample.n - 1)).toBeGreaterThan(sample.E);
  await click('Save Result', scope);
  expect(getByText(scope, `σ=${sample.sigma}, E=${sample.E}, ${sample.confidence}% → n=${sample.n}`)).toBeVisible();
  expectRendered();
});

it('keeps the large finite full-quantile count consistent with its saved and worked result', async () => {
  startup.resolve(); await mount(); await click(/^Practice/); const scope = calculator();
  await edit(scope, 'Population SD (σ)', 55); await edit(scope, 'Margin of Error (E)', .1);
  expect(scope.querySelector('p.text-5xl').textContent).toBe('n = 1162042');
  await click('Show Calculation', scope); const steps = expectSteps(scope);
  expect(getByText(steps, 'n* ≈ 1162041.29')).toBeVisible();
  await click('Save Result', scope);
  expect(getByText(scope, 'σ=55, E=0.1, 95% → n=1162042')).toBeVisible();
});

it.each([
  { name: 'equal largest finite inputs', sigma: Number.MAX_VALUE, E: Number.MAX_VALUE, n: 4, text: 'n* ≈ 3.84' },
  { name: 'positive underflowing display', sigma: Number.MIN_VALUE, E: Number.MAX_VALUE, n: 1, text: 'n* > 0 (too small for the numeric display)' },
  { name: 'positive scientific display', sigma: 1e-150, E: 1, n: 1, text: 'n* ≈ 3.841e-300' },
])('handles $name without invalid formulas or numeric placeholders', async sample => {
  startup.resolve(); await mount(); await click(/^Practice/); const scope = calculator();
  await edit(scope, 'Population SD (σ)', sample.sigma); await edit(scope, 'Margin of Error (E)', sample.E);
  expect(queryByRole(scope, 'alert')).toBeNull();
  expect(scope.querySelector('p.text-5xl').textContent).toBe(`n = ${sample.n}`);
  await click('Show Calculation', scope); const steps = expectSteps(scope);
  expect(getByText(steps, sample.text)).toBeVisible();
  expect(scope.textContent).not.toMatch(/Infinity|NaN/);
  expect(formulaSources(steps).join(' ')).not.toMatch(/Infinity|NaN/);
  await click('Save Result', scope);
  expect(getByText(scope, `σ=${sample.sigma}, E=${sample.E}, 95% → n=${sample.n}`)).toBeVisible();
});

it('retains the standard saved calculation while invalid or unsafe inputs cannot save or display stale steps', async () => {
  startup.resolve(); await mount(SampleSizeCalculation, {}, true); await click(/^Practice/); const scope = calculator();
  expect(scope.querySelector('p.text-5xl').textContent).toBe('n = 217');
  await click('Show Calculation', scope); expectSteps(scope); await click('Save Result', scope);
  for (const [name, value] of [
    ['Population SD (σ)', ''], ['Population SD (σ)', 0], ['Population SD (σ)', -1],
    ['Margin of Error (E)', ''], ['Margin of Error (E)', 0], ['Margin of Error (E)', -1],
    ['Margin of Error (E)', 1e-200],
  ]) {
    await edit(scope, 'Population SD (σ)', 15); await edit(scope, 'Margin of Error (E)', 2);
    await edit(scope, name, value);
    expect(getByRole(scope, 'alert')).toBeVisible();
    expect(getByRole(scope, 'button', { name: 'Save Result' })).toBeDisabled();
    expect(getByRole(scope, 'button', { name: 'Hide Calculation' })).toBeDisabled();
    expect(queryByRole(scope, 'region', { name: 'Sample size calculation steps' })).toBeNull();
    await click('Save Result', scope);
    expect(scope.textContent).not.toMatch(/Infinity|NaN/);
    expect(getByRole(scope, 'heading', { name: 'Saved Calculations' }).nextElementSibling.children).toHaveLength(1);
  }
  await edit(scope, 'Population SD (σ)', 15); await edit(scope, 'Margin of Error (E)', 2);
  expect(scope.querySelector('p.text-5xl').textContent).toBe('n = 217'); expectSteps(scope);
  expect(getByText(scope, 'σ=15, E=2, 95% → n=217')).toBeVisible();
});
