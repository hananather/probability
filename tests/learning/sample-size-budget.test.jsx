import React, { act, StrictMode } from 'next/dist/compiled/react';
import { createRoot } from 'next/dist/compiled/react-dom/client';
import { fireEvent, getByRole, getAllByRole, getByText, queryByRole } from '@testing-library/dom';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { JsdomAdaptor } from 'mathjax-full/js/adaptors/jsdomAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { SafeHandler } from 'mathjax-full/js/ui/safe/SafeHandler.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { selection } from 'd3-selection';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import SampleSizeCalculation, { CostBenefitAnalysis, RealWorldScenarios } from '@/components/05-estimation/5-3-SampleSizeCalculation';
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
  await act(async () => root.render(React.createElement(MathJaxProvider, null,
    strict ? React.createElement(StrictMode, null, lesson) : lesson)));
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
  SVGElement.prototype.getBoundingClientRect = () => ({ width: chartWidth, height: 500 });
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



async function changeBudget(values) {
  for (const [name, value] of Object.entries(values)) {
    await act(async () => fireEvent.change(getByRole(container, 'slider', { name }), { target: { value: String(value) } }));
  }
  await settle();
}
async function changeMotion(value) {
  await act(async () => { shared.reducedMotion = value; for (const listener of shared.listeners) listener(); });
  await settle();
}
function mathSource(scope) { return Array.from(window.MathJax.startup.document.math).find(item => scope.contains(item.typesetRoot))?.math; }
function optimalCard() { return queryByRole(container, 'heading', { name: 'Optimal Solution' })?.parentElement; }
function budgetChart() { return getByRole(container, 'img', { name: 'Sample size budget chart' }); }
function markerIsInsidePlot(svg) {
  const marker = svg.querySelector('circle[cx]');
  const clip = svg.querySelector('clipPath rect');
  const x = Number(marker.getAttribute('cx')), y = Number(marker.getAttribute('cy'));
  const radius = Number(marker.getAttribute('r')) + Number(marker.getAttribute('stroke-width')) / 2;
  const left = Number(clip.getAttribute('x')), top = Number(clip.getAttribute('y'));
  expect(x - radius).toBeGreaterThanOrEqual(left);
  expect(x + radius).toBeLessThanOrEqual(left + Number(clip.getAttribute('width')));
  expect(y - radius).toBeGreaterThanOrEqual(top);
  expect(y + radius).toBeLessThanOrEqual(top + Number(clip.getAttribute('height')));
  for (const node of svg.querySelectorAll('*')) for (const attribute of node.attributes) expect(attribute.value).not.toMatch(/NaN|Infinity/);
  expect([...svg.querySelectorAll('.x-axis .tick')].every(node => node.__data__ > 0)).toBe(true);
}

describe('integer budget solution and expected-retention teaching', () => {
  it('uses the same exact affordable integer in the live formula, marker and result card', async () => {
    startup.resolve(); await mount(CostBenefitAnalysis);
    expect(getByText(optimalCard(), 'n = 500')).toBeVisible();
    expect(getByText(optimalCard(), '$55,000')).toBeVisible();
    expect(getByText(optimalCard(), 'E = 1.31 response units')).toBeVisible();
    const formula = getByRole(container, 'region', { name: 'Affordable sample size calculation' });
    expect(mathSource(formula)).toBe(String.raw`n_{max} = \left\lfloor\frac{50,000}{100}\right\rfloor = 500`);
    expect(formula.querySelector('.mjx-c230A')).not.toBeNull();
    const svg = budgetChart();
    const marker = svg.querySelector('circle[cx]');
    // Independent linear-axis interpolation with the unchanged default domains.
    expect(Number(marker.getAttribute('cx'))).toBeCloseTo(120 + (1.3148079707698763 - .5) / 2.5 * 440, 10);
    expect(Number(marker.getAttribute('cy'))).toBeCloseTo(400 - 55000 / 60500 * 340, 10);
    expect(svg.textContent).toContain('Optimal: E=1.31, n=500');
    expect(svg.textContent).not.toContain('E=$');
    expect(getByText(container, '$110.00 per subject (including fixed costs)')).toBeVisible();
    expect(container.textContent).not.toContain('per unit precision');
    expectRendered();
  });

  it('floors a noninteger affordability ratio without wasting an additional grid interval', async () => {
    startup.resolve(); await mount(CostBenefitAnalysis);
    await changeBudget({ 'Cost per Subject': 70 });
    expect(getByText(optimalCard(), 'n = 714')).toBeVisible();
    expect(getByText(optimalCard(), '$54,980')).toBeVisible();
    expect(getByText(optimalCard(), 'E = 1.10 response units')).toBeVisible();
    expect(mathSource(getByRole(container, 'region', { name: 'Affordable sample size calculation' }))).toBe(String.raw`n_{max} = \left\lfloor\frac{50,000}{70}\right\rfloor = 714`);
    markerIsInsidePlot(budgetChart()); expectRendered();
  });

  it('clears a prior solution for zero or negative available funds and recovers after a feasible change', async () => {
    startup.resolve(); await mount(CostBenefitAnalysis);
    for (const budget of [20000, 10000]) {
      await changeBudget({ 'Fixed Costs': 20000, 'Budget Limit': budget });
      expect(optimalCard()).toBeUndefined();
      expect(budgetChart().querySelector('circle[cx]')).toBeNull();
      expect(budgetChart().querySelector('.optimal-annotation')).toBeNull();
      expect(getByRole(container, 'status')).toHaveTextContent('The budget does not cover one observation');
      expect(container.textContent).not.toMatch(/Infinity|n = -/);
      expectRendered();
    }
    await changeBudget({ 'Fixed Costs': 5000, 'Budget Limit': 55000 });
    expect(getByText(optimalCard(), 'n = 500')).toBeVisible();
    markerIsInsidePlot(budgetChart()); expectRendered();
  });

  it('shows validation without geometry or numeric placeholders for an invalid subject cost', async () => {
    startup.resolve(); await mount(CostBenefitAnalysis);
    const input = getByRole(container, 'slider', { name: 'Cost per Subject' });
    // Exercise the validation boundary even though the ordinary slider starts at $10.
    input.min = '0';
    await changeBudget({ 'Cost per Subject': 0 });
    expect(optimalCard()).toBeUndefined();
    expect(getByRole(container, 'status')).toHaveTextContent('finite positive subject cost');
    expect(budgetChart().querySelector('circle')).toBeNull();
    expect(budgetChart().textContent).toContain('Enter valid planning inputs');
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
    await changeBudget({ 'Cost per Subject': 100 });
    expect(getByText(optimalCard(), 'n = 500')).toBeVisible();
    markerIsInsidePlot(budgetChart()); expectRendered();
  });

  it.each([[320, 136], [390, 206], [1440, 1100]])('contains exact out-of-sweep markers at a measured SVG corresponding to viewport %i', async (_viewport, width) => {
    chartWidth = width; startup.resolve(); await mount(CostBenefitAnalysis);
    const svg = budgetChart();
    for (const [values, n, error] of [
      [{ 'Cost per Subject': 500, 'Fixed Costs': 5000, 'Budget Limit': 10000, 'Population SD (σ)': 30 }, 10, '18.59'],
      [{ 'Cost per Subject': 10, 'Fixed Costs': 0, 'Budget Limit': 200000, 'Population SD (σ)': 5 }, 20000, '0.07'],
      [{ 'Cost per Subject': 100, 'Fixed Costs': 0, 'Budget Limit': 35000, 'Population SD (σ)': 5 }, 350, '0.52'],
    ]) {
      await changeBudget(values);
      expect(getByText(optimalCard(), `n = ${n}`)).toBeVisible();
      expect(getByText(optimalCard(), `E = ${error} response units`)).toBeVisible();
      expect(svg.getAttribute('viewBox')).toBe(`0 0 ${width} 500`);
      markerIsInsidePlot(svg); expectRendered();
    }
    chartWidth = 286;
    await act(async () => window.dispatchEvent(new Event('resize'))); await settle();
    expect(svg.getAttribute('viewBox')).toBe('0 0 286 500'); markerIsInsidePlot(svg);
  });

  it('reports only the first explicit changed budget input across StrictMode, repeats, motion changes and remount', async () => {
    startup.resolve(); const onComplete = vi.fn(); await mount(CostBenefitAnalysis, { onComplete }, true);
    expect(onComplete).not.toHaveBeenCalled();
    await changeBudget({ 'Cost per Subject': 100 });
    await changeMotion(false); await changeMotion(true);
    expect(onComplete).not.toHaveBeenCalled();
    await changeBudget({ 'Cost per Subject': 110 });
    expect(onComplete).toHaveBeenCalledExactlyOnceWith('cost-benefit-explored');
    const slider = getByRole(container, 'slider', { name: 'Budget Limit' }); slider.focus();
    await changeBudget({ 'Budget Limit': 60000 }); expect(slider).toHaveFocus();
    await changeBudget({ 'Cost per Subject': 110 }); expect(onComplete).toHaveBeenCalledTimes(1);
    const oldMarker = budgetChart().querySelector('circle[cx]');
    await act(async () => root.unmount()); root = null; container.remove();
    expect(oldMarker.isConnected).toBe(false); expect(shared.listeners.size).toBe(0);
    await mount(CostBenefitAnalysis, { onComplete }); expect(onComplete).toHaveBeenCalledTimes(1);
    await changeBudget({ 'Cost per Subject': 120 }); expect(onComplete).toHaveBeenCalledTimes(2);
    expect(window.localStorage.length).toBe(0);
  });

  it('keeps budget callbacks optional and formulas intact while hidden panels mount and navigation changes', async () => {
    startup.resolve(); await mount(); await click(/^Applications/);
    expect(getByText(optimalCard(), 'n = 500')).toBeVisible();
    expect(getByRole(container, 'heading', { name: 'Continue learning' })).toBeVisible();
    expectRendered(); expect(sourcePasses.every(pass => pass.connected)).toBe(true);
    await click(/^Practice/);
    expect(getByText(container, /a pilot estimate gives a provisional plan/)).toBeVisible();
    expect(getByText(container, /^n = 217$/, { selector: 'p.text-5xl' })).toBeVisible();
    expectRendered(); expect(window.localStorage.length).toBe(0);
  });

  it('reuses one rounded enrollment count for expected retention and cost without asserting clinical efficacy', async () => {
    startup.resolve(); await mount(RealWorldScenarios);
    expect(getByText(container, /Plan for n = 164 to retain 139 observations in expectation with 15% loss/)).toBeVisible();
    expect(getByText(container, 'Estimated cost: $82,000 + fixed costs')).toBeVisible();
    expect(getByText(container, /does not guarantee enough usable observations.*or remove bias from missing data/)).toBeVisible();
    expect(getByText(container, /Illustrative estimation of a mean: 95% confidence and ±2 mmHg precision/)).toBeVisible();
    expect(container.textContent).not.toMatch(/FDA requires|clinically meaningful|new drug.s effect/);
    for (const [name, target, enrolled] of [
      [/^Quality Control/, 166, 196], [/^Market Research/, 390, 459], [/^Clinical Trial/, 139, 164],
    ]) {
      await click(name);
      expect(getByText(container, `n = ${target}`)).toBeVisible();
      expect(getByText(container, new RegExp(`Plan for n = ${enrolled} to retain ${target} observations in expectation`))).toBeVisible();
    }
    expectRendered();
  });
});
