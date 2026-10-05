import React, { act, StrictMode } from 'next/dist/compiled/react';
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
import StatisticalInference from '@/components/05-estimation/5-1-StatisticalInference';
import ConfidenceIntervalKnownVariance from '@/components/05-estimation/5-2-1-ConfidenceIntervalKnownVariance';
import ConfidenceIntervalPractice from '@/components/05-estimation/5-2-2-ConfidenceIntervalPractice';
import SampleSizeCalculation from '@/components/05-estimation/5-3-SampleSizeCalculation';
import ConfidenceIntervalUnknownVariance from '@/components/05-estimation/5-4-ConfidenceIntervalUnknownVariance';
import ProportionConfidenceInterval from '@/components/05-estimation/5-5-ProportionConfidenceInterval';
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
// Isolate the six lessons from other owners' reference, quiz, and navigation
// widgets. Lesson controls, formulas, calculations, and D3 effects remain real.
vi.mock('@/components/reference-sheets/Chapter5ReferenceSheet', () => ({ Chapter5ReferenceSheet: () => null }));
vi.mock('@/components/ui/patterns/QuickReferenceCard', () => ({ ConfidenceIntervalReference: () => null }));
vi.mock('@/components/ui/SectionComplete', () => ({ default: () => null }));
vi.mock('@/components/ui/BackToHub', () => ({ default: () => null }));
vi.mock('@/components/mdx/QuizBreak', () => ({ QuizBreak: () => null }));
vi.mock('@/components/05-estimation/5-6-CIHypothesisTestingBridge', () => ({ CIHypothesisTestingBridge: () => null }));
vi.mock('@/components/05-estimation/5-7-CIInterpretationTrainer', () => ({ CIInterpretationTrainer: () => null }));

const lessons = [
  ['statistical inference', StatisticalInference],
  ['known variance', ConfidenceIntervalKnownVariance],
  ['confidence interval practice', ConfidenceIntervalPractice],
  ['sample size', SampleSizeCalculation],
  ['unknown variance', ConfidenceIntervalUnknownVariance],
  ['proportion interval', ProportionConfidenceInterval],
];
let root;
let container;
let startup;
let sourcePasses;
let originalActEnvironment;
let originalGetBBox;
let originalGetTotalLength;

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
  if (originalGetBBox === undefined) delete SVGElement.prototype.getBBox;
  else SVGElement.prototype.getBBox = originalGetBBox;
  if (originalGetTotalLength === undefined) delete SVGElement.prototype.getTotalLength;
  else SVGElement.prototype.getTotalLength = originalGetTotalLength;
});

describe('estimation lessons on the shared mathematics runtime', () => {
  it.each(lessons)('renders %s after startup exceeds the former retry window and then stays idle', async (name, Component) => {
    await mount(Component);
    if (Component === ConfidenceIntervalPractice) await click('Quick Reference');
    expect(container.textContent).toMatch(/\\[([]/);
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { startup.resolve(); });
    await settle();
    expect(container.querySelectorAll('mjx-container').length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/\\[([]/);
    expect(sourcePasses.every(pass => pass.element.isConnected)).toBe(true);
    expect(shared.runtime.getSnapshot()).toMatchObject({ status: 'ready', error: null, stalled: false });
    const formula = container.querySelector('mjx-container');
    const calls = window.MathJax.typesetPromise.mock.calls.length;
    await settle();
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    await settle();
    expect(container.querySelector('mjx-container')).toBe(formula);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
  });

  it('renders a newly activated known-variance builder and its changed numerical example', async () => {
    startup.resolve();
    await mount(ConfidenceIntervalKnownVariance);
    await click(/Formal/);
    const heading = getByRole(container, 'heading', { name: 'Interactive CI Builder' });
    const builder = heading.parentElement;
    expect(builder.querySelectorAll('mjx-container')).toHaveLength(4);
    await click('Example 2: n=9, σ=5, x̄=19.93', builder);
    expect(builder.textContent).toContain('[16.66, 23.20]');
    expect(builder.querySelectorAll('mjx-container')).toHaveLength(4);
    expect(builder.textContent).not.toMatch(/\\[([]/);
    expect(sourcePasses.some(pass => pass.text.includes('\\frac{5}{\\sqrt{9}} = 1.6667'))).toBe(true);
    const formula = builder.querySelector('mjx-container');
    const calls = window.MathJax.typesetPromise.mock.calls.length;
    await settle();
    expect(builder.querySelector('mjx-container')).toBe(formula);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
  });

  it('cancels the retired practice tab and renders the latest reference selection after delayed startup', async () => {
    await mount(ConfidenceIntervalPractice, true);
    await click('Worked Examples');
    await click('Quick Reference');
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { startup.resolve(); });
    await settle();
    expect(sourcePasses).toHaveLength(1);
    expect(sourcePasses[0].element.isConnected).toBe(true);
    expect(container.querySelectorAll('mjx-container').length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/\\[([]/);
  });

  it('uses the latest calculation when multiple example changes precede readiness', async () => {
    await mount(ConfidenceIntervalKnownVariance);
    const builder = getByRole(container, 'heading', { name: 'Interactive CI Builder' }).parentElement;
    await click('Example 2: n=9, σ=5, x̄=19.93', builder);
    await click('Example 3: n=25, σ=5, x̄=19.93', builder);
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { startup.resolve(); });
    await settle();
    expect(builder.textContent).toContain('[17.97, 21.89]');
    expect(builder.querySelectorAll('mjx-container')).toHaveLength(4);
    expect(builder.textContent).not.toMatch(/\\[([]/);
    const formulaPasses = sourcePasses.filter(pass => pass.text.includes('\\frac{5}{\\sqrt{'));
    expect(formulaPasses.length).toBeGreaterThan(0);
    expect(formulaPasses.every(pass => pass.text.includes('\\sqrt{25}'))).toBe(true);
    expect(formulaPasses.every(pass => !pass.text.includes('\\sqrt{9}'))).toBe(true);
  });

  it('renders the unknown-variance explanation and both revealed mathematical steps', async () => {
    startup.resolve();
    await mount(ConfidenceIntervalUnknownVariance);
    expect(container.textContent).not.toMatch(/\\[([]/);
    await click('Explore the Naive Approach');
    expect(container.textContent).not.toMatch(/\\[([]/);
    expect(sourcePasses.some(pass => pass.text.includes('\\bar{x} \\pm z_{0.025} \\times \\frac{s}{\\sqrt{n}}'))).toBe(true);
    await click('See why this fails →');
    expect(container.textContent).not.toMatch(/\\[([]/);
    expect(getByRole(container, 'heading', { name: 'Why the Naive Approach Fails' })).toBeInTheDocument();
    await click(/^Practice/);
    expect(container.textContent).not.toMatch(/\\[([]/);
    await click(/^Foundations/);
    expect(container.textContent).not.toMatch(/\\[([]/);
    const calls = window.MathJax.typesetPromise.mock.calls.length;
    await settle();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
  });

  it('retains proportion calculation steps when the input representation changes', async () => {
    startup.resolve();
    await mount(ProportionConfidenceInterval);
    await click(/^Practice/);
    await click('Show Calculation Steps');
    expect(container.textContent).not.toMatch(/\\[([]/);
    const formulas = container.querySelectorAll('mjx-container').length;
    await click('Proportion Input');
    expect(container.textContent).not.toMatch(/\\[([]/);
    expect(container.querySelectorAll('mjx-container')).toHaveLength(formulas);
    await click('Count Input');
    expect(container.textContent).not.toMatch(/\\[([]/);
    expect(container.querySelectorAll('mjx-container')).toHaveLength(formulas);
  });

  it('renders newly revealed sample-size calculations and preserves them when saving a result', async () => {
    startup.resolve();
    await mount(SampleSizeCalculation);
    await click(/^Practice/);
    expect(container.textContent).not.toMatch(/\\[([]/);
    await click('Show Calculation');
    const calculation = within(container).getByText('Step-by-step calculation:').parentElement;
    expect(calculation.querySelectorAll('mjx-container')).toHaveLength(4);
    expect(container.textContent).not.toMatch(/\\[([]/);
    expect(container.textContent).toContain('n = 217 (rounded up)');
    await click('Save Result');
    expect(container.textContent).not.toMatch(/\\[([]/);
    expect(calculation.querySelectorAll('mjx-container')).toHaveLength(4);
  });

  it('retains the CLT formula while its distribution and sample-size controls change', async () => {
    startup.resolve();
    await mount(StatisticalInference);
    await click(/^Exploration/);
    const clt = getByRole(container, 'heading', { name: 'Central Limit Theorem Demonstration' }).parentElement;
    expect(clt.querySelectorAll('mjx-container')).toHaveLength(1);
    await click('Exponential Distribution', clt);
    expect(clt.textContent).not.toMatch(/\\[([]/);
    expect(clt.querySelectorAll('mjx-container')).toHaveLength(1);
    await act(async () => fireEvent.change(getByRole(clt, 'slider'), { target: { value: '20' } }));
    await settle();
    expect(clt.textContent).toContain('Sample Size: 20');
    expect(clt.textContent).not.toMatch(/\\[([]/);
    expect(clt.querySelectorAll('mjx-container')).toHaveLength(1);
  });

  it('retires estimation work unmounted before the engine becomes ready', async () => {
    await mount(ConfidenceIntervalPractice, true);
    await act(async () => root.unmount());
    root = null;
    startup.resolve();
    await settle();
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
  });

  it('shows a rendering failure and retries explicitly without silently repeating failed work', async () => {
    await mount(ConfidenceIntervalPractice);
    await click('Quick Reference');
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('renderer failed'));
    await act(async () => { startup.resolve(); });
    await settle();
    expect(getByRole(container, 'status', { name: 'Mathematics rendering' })).toHaveTextContent('Some mathematics could not be rendered');
    const calls = window.MathJax.typesetPromise.mock.calls.length;
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
    await click('Retry mathematics');
    expect(container.querySelector('mjx-container')).toBeInTheDocument();
    expect(within(container).queryByRole('status', { name: 'Mathematics rendering' })).toBeNull();
    expect(shared.runtime.getSnapshot().error).toBeNull();
  });
});
