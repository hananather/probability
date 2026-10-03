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
import ConfidenceIntervalKnownVariance from '@/components/05-estimation/5-2-1-ConfidenceIntervalKnownVariance';
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
// Keep the known-variance controls and D3 effects real. Separate lessons and
// navigation widgets are outside this component's rendering boundary.
vi.mock('@/components/reference-sheets/Chapter5ReferenceSheet', () => ({ Chapter5ReferenceSheet: () => null }));
vi.mock('@/components/ui/SectionComplete', () => ({ default: () => null }));
vi.mock('@/components/ui/BackToHub', () => ({ default: () => null }));
vi.mock('@/components/05-estimation/5-6-CIHypothesisTestingBridge', () => ({ CIHypothesisTestingBridge: () => null }));
vi.mock('@/components/05-estimation/5-7-CIInterpretationTrainer', () => ({ CIInterpretationTrainer: () => null }));

let root;
let container;
let startup;
let sourcePasses;
let originalActEnvironment;
let originalGetBBox;
let originalGetTotalLength;
let transformDescriptor;

async function settle() {
  await act(async () => { for (let index = 0; index < 8; index++) await tick(); });
}

async function mount(strict = false) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const lesson = React.createElement(ConfidenceIntervalKnownVariance);
  await act(async () => root.render(React.createElement(MathJaxProvider, null,
    strict ? React.createElement(StrictMode, null, lesson) : lesson)));
  await settle();
}

async function click(name, scope = container) {
  await act(async () => fireEvent.click(getByRole(scope, 'button', { name })));
  await settle();
}

async function advance(milliseconds) {
  await act(async () => { await vi.advanceTimersByTimeAsync(milliseconds); });
  await settle();
}

function builder() {
  return getByRole(container, 'heading', { name: 'Interactive CI Builder' }).parentElement;
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
  transformDescriptor = Object.getOwnPropertyDescriptor(SVGElement.prototype, 'transform');
  // jsdom does not calculate SVG layout or implement SVG transform matrices.
  SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 100, height: 20 });
  SVGElement.prototype.getTotalLength = () => 100;
  Object.defineProperty(SVGElement.prototype, 'transform', {
    configurable: true, value: { baseVal: { consolidate: () => null } },
  });
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
  if (originalGetBBox === undefined) delete SVGElement.prototype.getBBox;
  else SVGElement.prototype.getBBox = originalGetBBox;
  if (originalGetTotalLength === undefined) delete SVGElement.prototype.getTotalLength;
  else SVGElement.prototype.getTotalLength = originalGetTotalLength;
  if (transformDescriptor === undefined) delete SVGElement.prototype.transform;
  else Object.defineProperty(SVGElement.prototype, 'transform', transformDescriptor);
});

describe('known-variance mode controls with App Router React and real MathJax', () => {
  it('keeps the critical-values controls usable after their delayed optional completion callback', async () => {
    startup.resolve();
    await mount();
    await click(/^Formal/);
    const explorer = getByRole(container, 'heading', { name: 'Critical Values Explorer' }).parentElement;
    const formulas = [...container.querySelectorAll('mjx-container')];
    const calls = window.MathJax.typesetPromise.mock.calls.length;
    await click('90%', explorer);
    await advance(2100);
    expect(explorer.textContent).toContain('Critical Value: ±1.645');
    const svg = explorer.querySelector('svg');
    expect(svg.querySelector('path[stroke="#8b5cf6"]')?.getAttribute('d')).toMatch(/^M/);
    expect(svg.querySelectorAll('path[fill="#ef4444"]')).toHaveLength(2);
    expect(svg.querySelectorAll('path[fill="#10b981"]')).toHaveLength(1);
    const criticalLabels = [...svg.querySelectorAll('text[fill="#ef4444"][font-weight="bold"]')];
    expect(criticalLabels.map(label => label.textContent)).toEqual(['-1.645', '+1.645']);
    expect(Number(criticalLabels[0].getAttribute('x'))).toBeLessThan(310);
    expect(Number(criticalLabels[1].getAttribute('x'))).toBeGreaterThan(310);
    await act(async () => fireEvent.click(getByRole(explorer, 'checkbox', { name: 'Show Areas' })));
    await advance(200);
    expect(svg.querySelectorAll('path[fill="#ef4444"]')).toHaveLength(0);
    expect(svg.querySelectorAll('path[fill="#10b981"]')).toHaveLength(0);
    expect(svg.querySelector('path[stroke="#8b5cf6"]')?.getAttribute('d')).toMatch(/^M/);
    await act(async () => fireEvent.change(getByRole(explorer, 'slider'), { target: { value: '99.9' } }));
    await advance(2100);
    expect(explorer.textContent).toContain('Critical Value: ±3.291');
    expect([...svg.querySelectorAll('text[fill="#ef4444"][font-weight="bold"]')].map(label => label.textContent)).toEqual(['-3.291', '+3.291']);
    expectRendered();
    expect([...container.querySelectorAll('mjx-container')]).toEqual(formulas);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
  });

  it('changes confidence and area overlays while startup is pending, then renders only connected math owners', async () => {
    await mount(true);
    await click(/^Formal/);
    const explorer = getByRole(container, 'heading', { name: 'Critical Values Explorer' }).parentElement;
    await click('99%', explorer);
    await act(async () => fireEvent.click(getByRole(explorer, 'checkbox', { name: 'Show Areas' })));
    await advance(2100);
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
    expect(explorer.textContent).toContain('Critical Value: ±2.576');
    expect(explorer.querySelector('svg path[stroke="#8b5cf6"]')).not.toBeNull();
    await act(async () => { startup.resolve(); });
    await settle();
    expectRendered();
    expect(sourcePasses.length).toBeGreaterThan(0);
    expect(sourcePasses.every(pass => pass.element.isConnected)).toBe(true);
    const calls = window.MathJax.typesetPromise.mock.calls.length;
    await advance(300);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
  });

  it('compares parameter effects without rewriting unrelated formulas or requesting more typesetting', async () => {
    startup.resolve();
    await mount();
    await click(/^Exploration/);
    const explorer = getByRole(container, 'heading', { name: 'Parameter Effects Explorer' }).parentElement;
    const formulas = [...container.querySelectorAll('mjx-container')];
    const calls = window.MathJax.typesetPromise.mock.calls.length;
    await click('Compare Std Dev', explorer);
    expect(explorer.textContent).toContain('σ = 5');
    expect(explorer.textContent).toContain('σ = 20');
    expect(explorer.textContent).toContain('Doubling σ doubles the interval width');
    const intervals = [...explorer.querySelectorAll('svg g line')].map(line =>
      Number(line.getAttribute('x2')) - Number(line.getAttribute('x1')));
    expect(intervals).toHaveLength(4);
    expect(intervals[3] / intervals[0]).toBeCloseTo(4, 12);
    await click('Compare Confidence', explorer);
    expect(explorer.textContent).toContain('99.9%');
    expect(explorer.textContent).toContain('Trade-off: precision vs. confidence');
    const confidenceWidths = [...explorer.querySelectorAll('svg g line')].map(line =>
      Number(line.getAttribute('x2')) - Number(line.getAttribute('x1')));
    expect(confidenceWidths.every((width, index) => index === 0 || width > confidenceWidths[index - 1])).toBe(true);
    await click('Compare Sample Size', explorer);
    const sampleWidths = [...explorer.querySelectorAll('svg g line')].map(line =>
      Number(line.getAttribute('x2')) - Number(line.getAttribute('x1')));
    expect(sampleWidths[0] / sampleWidths[3]).toBeCloseTo(Math.sqrt(10), 12);
    expectRendered();
    expect([...container.querySelectorAll('mjx-container')]).toEqual(formulas);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
  });

  it('updates all four live builder parameters and retains each mode’s existing calculation on return', async () => {
    startup.resolve();
    await mount();
    await click('Example 2: n=9, σ=5, x̄=19.93', builder());
    expect(builder().textContent).toContain('[16.66, 23.20]');
    await click(/^Formal/);
    const controls = getAllByRole(builder(), 'slider');
    for (const [index, value] of [[0, '390'], [1, '40'], [2, '100'], [3, '99']]) {
      await act(async () => fireEvent.change(controls[index], { target: { value } }));
      await settle();
      expectRendered();
    }
    expect(builder().textContent).toContain('[379.70, 400.30]');
    expect(sourcePasses.some(pass => pass.text.includes('\\frac{40}{\\sqrt{100}} = 4.0000'))).toBe(true);
    expect(sourcePasses.some(pass => pass.text.includes('390 \\pm 10.3033'))).toBe(true);
    await click(/^Exploration/);
    expect(builder().textContent).toContain('[357.56, 392.84]');
    await click(/^Intuitive/);
    expect(builder().textContent).toContain('[16.66, 23.20]');
    expectRendered();
    await click(/^Formal/);
    expect(builder().textContent).toContain('[379.70, 400.30]');
    expectRendered();
    const calls = window.MathJax.typesetPromise.mock.calls.length;
    await settle();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
  });
});
