import CorrelationCoefficient from '@/components/07-linear-regression/7-1-CorrelationCoefficient';
import SimpleLinearRegression from '@/components/07-linear-regression/7-2-SimpleLinearRegression';
import HypothesisTestingRegression from '@/components/07-linear-regression/7-3-HypothesisTestingRegression';
import ConfidencePredictionIntervals from '@/components/07-linear-regression/7-4-ConfidencePredictionIntervals';
import AnalysisOfVariance from '@/components/07-linear-regression/7-5-AnalysisOfVariance';
import CoefficientOfDetermination from '@/components/07-linear-regression/7-6-CoefficientOfDetermination';
import { Chapter7Showcase } from '@/components/learn/Chapter7Showcase';
import { CORRELATION_EXAMPLE_DATA, CORRELATION_EXAMPLE_STATISTICS, calculateCorrelationStatistics } from '@/lib/statistics/correlationExample';
import React, { act, StrictMode } from 'next/dist/compiled/react';
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
vi.mock('@/components/reference-sheets/Chapter7ReferenceSheet', () => ({ Chapter7ReferenceSheet: () => null }));
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
  await act(async () => root.render(React.createElement(MathJaxProvider, null, strict ? React.createElement(StrictMode, null, lesson) : lesson)));
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

const pages = [
  ['correlation', CorrelationCoefficient], ['simple regression', SimpleLinearRegression],
  ['regression hypothesis test', HypothesisTestingRegression],
  ['confidence and prediction intervals', ConfidencePredictionIntervals],
  ['ANOVA', AnalysisOfVariance], ['coefficient of determination', CoefficientOfDetermination],
  ['showcase', Chapter7Showcase],
];

describe('actual Next regression pages with scoped real MathJax', () => {
  it.each(pages)('waits for late startup and renders %s formulas under StrictMode', async (_name, Page) => {
    await mount(Page, true);
    await act(async () => { await vi.advanceTimersByTimeAsync(1100); }); await settle();
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
    startup.resolve(); await settle();
    expect(mathNodes(container).length).toBeGreaterThan(0);
    expect(raw(container)).toEqual([]);
    expect(container.querySelector('mjx-merror')).toBeNull();
    expect(window.MathJax.typesetPromise.mock.calls.every(([elements]) =>
      elements.length === 1 && container.contains(elements[0]))).toBe(true);
  });

  it.each(pages)('cancels pending %s owners when the lesson unmounts before startup', async (_name, Page) => {
    await mount(Page);
    await act(async () => root.unmount()); root = null;
    startup.resolve(); await settle();
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
  });

  it('renders correlation scenarios, all formula tabs, and the worked example', async () => {
    startup.resolve(); await mount(CorrelationCoefficient);
    const causationExamples = [...container.querySelectorAll('li')];
    expect(causationExamples.find(node => node.textContent.includes('Ice cream sales'))?.textContent)
      .toBe('• Ice cream sales ↔ Drowning incidents');
    expect(causationExamples.find(node => node.textContent.includes('Number of firefighters'))?.textContent)
      .toBe('• Number of firefighters ↔ Fire damage');
    const scenarioControls = getByRole(container, 'heading', { name: 'Explore Different Scenarios' }).parentElement;
    await click('Strong Negative', scenarioControls);
    expect(raw(container)).toEqual([]);
    expect(sourcePasses.some(pass => pass.text.includes('t = \\frac{-'))).toBe(true);
    expect(container.querySelector('svg circle')).not.toBeNull();
    const connection = getByRole(container, 'heading', { name: 'Connection to Linear Regression' }).parentElement;
    expect(mathNodes(connection)).toHaveLength(8);
    for (const formula of ['Computational Formula', 'Z-Score Formula', 'Covariance Form', 'Definition Formula']) {
      await click(formula); expect(raw(container)).toEqual([]);
    }
    await click('Linear Only'); expect(raw(container)).toEqual([]);
    expect(container.textContent).toContain('the symmetric, equally weighted x values -2, -1, 0, 1, 2');
    expect(container.textContent).toContain('uniformly distributed on [0, 2π]');
    expect(sourcePasses.some(pass => pass.text.includes('\\rho = -\\sqrt{6}/\\pi \\approx -0.780'))).toBe(true);
    await click('Scale Invariant'); expect(raw(container)).toEqual([]);
    expect(container.textContent).toContain('One negative scale factor reverses the sign; two preserve it.');
    expect(sourcePasses.some(pass => pass.text.includes('r(aX+b, cY+d) = \\text{sign}(ac)'))).toBe(true);
    await click('Show Worked Example: Fuel Quality Analysis');
    expect(getByRole(container, 'heading', { name: 'Step-by-Step Calculation: Fuel Quality Example' })).toBeVisible();
    expect(raw(container)).toEqual([]);
    expect(sourcePasses.some(pass => pass.text.includes('10.1774') && pass.text.includes('0.9367'))).toBe(true);
    expect(container.querySelector('mjx-merror')).toBeNull();
  });

  it('keeps correlation formulas intact when only deviation visibility changes', async () => {
    startup.resolve(); await mount(CorrelationCoefficient);
    const nodes = mathNodes(container); const calls = countCalls();
    await act(async () => fireEvent.click(getByRole(container, 'checkbox', { name: 'Show deviations from means' }))); await settle();
    expect(container.querySelector('svg .deviation-rect')).not.toBeNull();
    expectPreservedMath(container, nodes, calls);
  });

  it('squares the entire signed correlation in the displayed negative-scenario denominator', async () => {
    startup.resolve(); await mount(CorrelationCoefficient);
    const controls = getByRole(container, 'heading', { name: 'Explore Different Scenarios' }).parentElement;
    await click('Strong Negative', controls);
    const source = sourcePasses.findLast(pass => /t = \\frac\{-[\d.]+\\sqrt/.test(pass.text))?.text;
    expect(source).toBeDefined();
    const signedR = /t = \\frac\{(-[\d.]+)\\sqrt/.exec(source)[1];
    expect(source).toContain(`\\sqrt{1-\\left(${signedR}\\right)^2}`);
    const denominator = /\\times [\d.]+\}\{([\d.]+)\} = -[\d.]+/.exec(source)[1];
    expect(Number(denominator)).toBeCloseTo(Math.sqrt(1 - Number(signedR) ** 2), 3);
    const calculation = getByRole(container, 'region', { name: 'Correlation test statistic calculation' });
    expect(calculation.querySelector('mjx-container')).not.toBeNull();
    expect(calculation.querySelector('mjx-merror')).toBeNull();
    expect(raw(calculation)).toEqual([]);
  });

  it('reveals simple regression calculations and preserves them across line and residual changes', async () => {
    startup.resolve(); await mount(SimpleLinearRegression);
    await click('Show Comparison'); await click('Show Calculations');
    expect(getByRole(container, 'heading', { name: 'Step 1: Calculate Slope (b₁)' })).toBeVisible();
    expect(raw(container)).toEqual([]);
    const nodes = mathNodes(container); const calls = countCalls();
    await click('Too Flat'); await click('Hide Residuals'); await click('Too Steep');
    expectPreservedMath(container, nodes, calls);
    expect(container.querySelector('svg circle')).not.toBeNull();
    expect(container.querySelector('mjx-merror')).toBeNull();
  });

  it('renders new regression test data and preserves formulas while the line visibility changes', async () => {
    startup.resolve(); await mount(HypothesisTestingRegression);
    await click('Show Worked Example'); expect(raw(container)).toEqual([]);
    const example = getByRole(container, 'heading', { name: 'Step-by-Step Hypothesis Test Computation' }).parentElement;
    const before = sourcePasses.filter(pass => example.contains(pass.element)).at(-1).text;
    await click('Generate Data (No Relationship)'); expect(raw(container)).toEqual([]);
    const after = sourcePasses.filter(pass => example.contains(pass.element)).at(-1).text;
    expect(after).not.toBe(before);
    expect(after).toContain('95% Confidence Interval for Slope');
    const nodes = mathNodes(container); const calls = countCalls();
    await click('Show Regression Line'); expectPreservedMath(container, nodes, calls);
    expect(container.querySelector('mjx-merror')).toBeNull();
  });

  it('updates confidence and prediction formulas for x and confidence level, retaining them for visibility controls', async () => {
    startup.resolve(); await mount(ConfidencePredictionIntervals);
    await act(async () => fireEvent.change(getByRole(container, 'slider'), { target: { value: '1.8' } })); await settle();
    expect(raw(container)).toEqual([]);
    expect(sourcePasses.some(pass => pass.text.includes('\\times 1.80'))).toBe(true);
    await click('99%'); expect(raw(container)).toEqual([]);
    expect(sourcePasses.some(pass => pass.text.includes('t_{0.005,18}'))).toBe(true);
    const nodes = mathNodes(container); const calls = countCalls();
    await click('Show Confidence Interval'); await click('Show Prediction Interval'); await click('Show Extrapolation Warning');
    expectPreservedMath(container, nodes, calls);
    expect(container.querySelector('svg').textContent).toContain('extrapolation');
    expect(container.querySelector('mjx-merror')).toBeNull();
  });

  it('keeps ANOVA formulas and numerical table while the actual D3 decomposition changes', async () => {
    startup.resolve(); await mount(AnalysisOfVariance);
    const nodes = mathNodes(container); const calls = countCalls();
    const tableScope = getByRole(container, 'heading', { name: 'ANOVA Table' }).parentElement;
    const table = getByRole(tableScope, 'table').textContent;
    const proof = getByRole(container, 'heading', { name: 'Why SST = SSR + SSE?' }).parentElement;
    expect(proof.textContent).toContain('ordinary least squares with an intercept');
    expect(proof.textContent).toContain('n-dimensional vectors are orthogonal');
    expect(sourcePasses.some(pass => proof === pass.element && pass.text.includes('\\sum_{i=1}^{n}'))).toBe(true);
    await click('Show Decomposition'); await click('Regression (SSR)'); await click('Error (SSE)');
    expect(container.querySelector('svg circle')).not.toBeNull();
    expect(getByRole(tableScope, 'table').textContent).toBe(table);
    expectPreservedMath(container, nodes, calls);
  });

  it('renders all determination methods without requesting math for chart modes or its animation state', async () => {
    startup.resolve(); await mount(CoefficientOfDetermination);
    for (const method of ['Method 2: 1 - SSE/SST', 'Method 3: r²', 'Method 1: SSR/SST']) {
      await click(method); expect(raw(container)).toEqual([]);
    }
    const nodes = mathNodes(container); const calls = countCalls();
    await click('Bar Chart'); await click('Area Chart'); await click('Pie Chart');
    await act(async () => { await vi.advanceTimersByTimeAsync(200); }); await settle();
    expect(container.querySelector('svg path')).not.toBeNull();
    expectPreservedMath(container, nodes, calls);
    expect(container.querySelector('mjx-merror')).toBeNull();
  });

  it('renders the corrected showcase derivation and all revealed formulas', async () => {
    startup.resolve(); await mount(Chapter7Showcase);
    expect(sourcePasses.some(pass => pass.text.includes('10.1774') && pass.text.includes('0.6809') &&
      pass.text.includes('173.3769') && pass.text.includes('10.8650') && pass.text.includes('0.9367'))).toBe(true);
    expect(getByRole(container, 'link', { name: 'See the 20-sample fuel quality worked example' }))
      .toHaveAttribute('href', '/chapter7/correlation-coefficient');
    await click('Show Details'); expect(raw(container)).toEqual([]);
    expect(mathNodes(container)).toHaveLength(3);
    await click('Hide Details'); await click('Show Details');
    expect(raw(container)).toEqual([]);
    expect(mathNodes(container)).toHaveLength(3);
    expect(container.querySelector('mjx-merror')).toBeNull();
  });

  it('retains a scoped renderer failure and recovers through the shared explicit retry', async () => {
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('renderer unavailable'));
    startup.resolve(); await mount(SimpleLinearRegression);
    expect(raw(container).length).toBeGreaterThan(0);
    expect(shared.runtime.getSnapshot().error).toBeInstanceOf(Error);
    expect(shared.runtime.getSnapshot().phase).toBe('render');
    await act(async () => shared.runtime.retry()); await settle();
    expect(raw(container)).toEqual([]);
    expect(shared.runtime.getSnapshot().status).toBe('ready');
    expect(shared.runtime.getSnapshot().error).toBeNull();
    expect(container.querySelector('mjx-merror')).toBeNull();
  });
});

describe('the shared 20-sample correlation example', () => {
  it('matches an independent Python statistics.correlation and math.fsum reference', () => {
    expect(CORRELATION_EXAMPLE_DATA).toHaveLength(20);
    for (const [key, value] of Object.entries({ meanX: 1.196, meanY: 92.1605, Sxx: 0.68088,
      Syy: 173.376895, Sxy: 10.17744, r: 0.9367153810905184 })) {
      expect(CORRELATION_EXAMPLE_STATISTICS[key]).toBeCloseTo(value, 10);
    }
    const { Sxx, Syy, Sxy, SxxAlt, SyyAlt, SxyAlt, r } = CORRELATION_EXAMPLE_STATISTICS;
    expect(Math.sqrt(Sxx * Syy)).toBeCloseTo(10.865029234548798, 10);
    expect(SxxAlt).toBeCloseTo(Sxx, 10); expect(SyyAlt).toBeCloseTo(Syy, 8);
    expect(SxyAlt).toBeCloseTo(Sxy, 10);
    expect(r).toBeGreaterThanOrEqual(-1); expect(r).toBeLessThanOrEqual(1);
  });

  it('preserves correlation under pair permutation, variable exchange, and centering', () => {
    const { meanX, meanY, r, Sxx, Syy } = CORRELATION_EXAMPLE_STATISTICS;
    const original = CORRELATION_EXAMPLE_DATA.map(point => ({ ...point }));
    const reversed = calculateCorrelationStatistics([...original].reverse());
    const swapped = calculateCorrelationStatistics(original.map(({ x, y }) => ({ x: y, y: x })));
    const centered = calculateCorrelationStatistics(original.map(({ x, y }) => ({ x: x - meanX, y: y - meanY })));
    expect(reversed.r).toBeCloseTo(r, 12); expect(swapped.r).toBeCloseTo(r, 12);
    expect(swapped.Sxx).toBeCloseTo(Syy, 10); expect(swapped.Syy).toBeCloseTo(Sxx, 12);
    expect(centered.r).toBeCloseTo(r, 12);
    expect(centered.meanX).toBeCloseTo(0, 12); expect(centered.meanY).toBeCloseTo(0, 12);
    expect(CORRELATION_EXAMPLE_DATA).toEqual(original);
  });

  it('preserves magnitude for unequal affine scales and reverses direction for exactly one negative scale', () => {
    const r = CORRELATION_EXAMPLE_STATISTICS.r;
    const transform = (a, c) => calculateCorrelationStatistics(CORRELATION_EXAMPLE_DATA
      .map(({ x, y }) => ({ x: a * x + 11, y: c * y - 23 }))).r;
    expect(transform(2, 0.5)).toBeCloseTo(r, 12);
    expect(transform(-2, 0.5)).toBeCloseTo(-r, 12);
    expect(transform(2, -0.5)).toBeCloseTo(-r, 12);
    expect(transform(-2, -0.5)).toBeCloseTo(r, 12);
  });

  it('has zero vector cross-product for the intercept fit while individual cross-products remain nonzero', () => {
    const { meanX, meanY, Sxx, Sxy } = CORRELATION_EXAMPLE_STATISTICS;
    const slope = Sxy / Sxx;
    const intercept = meanY - slope * meanX;
    const fittedDeviations = CORRELATION_EXAMPLE_DATA.map(({ x }) => intercept + slope * x - meanY);
    const residuals = CORRELATION_EXAMPLE_DATA.map(({ x, y }) => y - (intercept + slope * x));
    const crossProducts = residuals.map((residual, index) => residual * fittedDeviations[index]);
    expect(crossProducts.some(product => Math.abs(product) > 0.1)).toBe(true);
    expect(crossProducts.reduce((sum, product) => sum + product, 0)).toBeCloseTo(0, 10);
    expect(residuals.reduce((sum, residual) => sum + residual, 0)).toBeCloseTo(0, 10);
    const ssr = fittedDeviations.reduce((sum, value) => sum + value * value, 0);
    const sse = residuals.reduce((sum, value) => sum + value * value, 0);
    expect(ssr + sse).toBeCloseTo(CORRELATION_EXAMPLE_STATISTICS.Syy, 10);
    // A fixed line that omits the fitted intercept fails this centered identity.
    const wrongProducts = CORRELATION_EXAMPLE_DATA.map(({ x, y }) => (slope * x - meanY) * (y - slope * x));
    expect(Math.abs(wrongProducts.reduce((sum, value) => sum + value, 0))).toBeGreaterThan(1);
  });
});
