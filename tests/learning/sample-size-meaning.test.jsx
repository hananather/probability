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
import SampleSizeCalculation, { VisualExploration } from '@/components/05-estimation/5-3-SampleSizeCalculation';
import SectionComplete from '@/components/ui/SectionComplete';
import { MathJaxProvider } from '@/components/shared/MathJaxProvider';
import { createMathJaxConfig } from '@/lib/mathjax/config';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { deferred, tick } from '../mathjax/runtime/fixtures';

vi.mock('react', () => import('next/dist/compiled/react'));
vi.mock('react/jsx-runtime', () => import('next/dist/compiled/react/jsx-runtime'));
vi.mock('react/jsx-dev-runtime', () => import('next/dist/compiled/react/jsx-dev-runtime'));
const shared = vi.hoisted(() => ({ runtime: null, reducedMotion: true }));
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => shared.reducedMotion }));
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

async function chooseRelationship(name) {
  expect(getByRole(container, 'button', { name })).not.toBeDisabled();
  await click(name);
}

function expectRendered(scope = container) {
  expect(scope.textContent).not.toMatch(/\\[([]/);
  expect(scope.querySelectorAll('mjx-merror')).toHaveLength(0);
}

// Independent numerical integration of the standard normal density. The
// lesson uses a critical-value table, not this coverage calculation.
function coverage(halfWidth, sampleSize, sigma) {
  const limit = halfWidth * Math.sqrt(sampleSize) / sigma;
  const panels = 4000;
  const step = limit / panels;
  const density = value => Math.exp(-value * value / 2) / Math.sqrt(2 * Math.PI);
  let sum = density(0) + density(limit);
  for (let index = 1; index < panels; index++) sum += (index % 2 === 0 ? 2 : 4) * density(index * step);
  return 2 * step * sum / 3;
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
  SVGElement.prototype.getBoundingClientRect = () => ({ width: 700, height: 500 });
  Object.defineProperty(SVGElement.prototype, 'clientWidth', { configurable: true, get: () => 700 });
  SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 100, height: 20 });
  SVGElement.prototype.getTotalLength = () => 100;
});

beforeEach(() => {
  shared.reducedMotion = true;
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

describe('sample-size planning meaning and learner-driven local exploration', () => {
  it('shows every point immediately without decorative transitions when motion is reduced', async () => {
    startup.resolve();
    const length = vi.spyOn(SVGElement.prototype, 'getTotalLength');
    await mount(VisualExploration);
    expect(selection.prototype.transition).not.toHaveBeenCalled();
    expect(length).not.toHaveBeenCalled();
    const points = [...container.querySelectorAll('circle[cx]')];
    expect(points).toHaveLength(41);
    for (const point of points) expect(point.getAttribute('opacity')).toBe('0.8');
    await chooseRelationship('Confidence Level');
    expect(selection.prototype.transition).not.toHaveBeenCalled();
    expect([...container.querySelectorAll('circle[cx]')]).toHaveLength(8);
  });

  it('keeps keyboard focus and all relationship controls usable while motion is running', async () => {
    shared.reducedMotion = false;
    startup.resolve();
    // Keep drawing pending: selector access must not depend on an animation's end.
    selection.prototype.transition.mockImplementation(function () {
      const pending = {
        duration() { return pending; },
        attr() { return pending; },
        on() { return pending; },
      };
      return pending;
    });
    const onComplete = vi.fn();
    await mount(VisualExploration, { onComplete });
    for (const name of ['Population Variability', 'Confidence Level', 'Margin of Error']) {
      const button = getByRole(container, 'button', { name });
      button.focus();
      await chooseRelationship(name);
      expect(button).toHaveFocus();
      expect(button).toHaveAttribute('aria-pressed', 'true');
      for (const control of getAllByRole(container, 'button')) expect(control).not.toBeDisabled();
    }
    expect(selection.prototype.transition).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
    await chooseRelationship('Confidence Level');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows the budget marker and annotation immediately with reduced motion', async () => {
    startup.resolve();
    await mount();
    await click('Applications Real-world scenarios');
    const svg = getByRole(container, 'img', { name: 'Sample size budget chart' });
    expect(svg.querySelector('circle[cx]').getAttribute('r')).toBe('8');
    expect(svg.querySelector('.optimal-annotation').getAttribute('opacity')).toBe('1');
    expect(selection.prototype.transition).not.toHaveBeenCalled();
  });

  it('uses the requested confidence for every plotted point and quantifies the fixed-precision comparison', async () => {
    startup.resolve();
    await mount(VisualExploration);
    await chooseRelationship('Confidence Level');
    const data = [...container.querySelectorAll('circle[cx]')].map(point => point.__data__);
    expect(data.map(point => point.x)).toEqual([90, 92, 94, 95, 96, 97, 98, 99]);
    for (let index = 0; index < data.length; index++) {
      const point = data[index];
      // Integrate the normal density independently of the lesson's inverse CDF.
      expect(coverage(2, point.y, 15)).toBeCloseTo(point.x / 100, 4);
      if (index) expect(point.y).toBeGreaterThan(data[index - 1].y);
    }
    const sampleSize = confidence => data.find(point => point.x === confidence).y;
    // Reference values independently computed with Python's NormalDist.inv_cdf.
    expect((sampleSize(95) / sampleSize(90) - 1) * 100).toBeCloseTo(41.984739327666844, 10);
    expect((sampleSize(99) / sampleSize(95) - 1) * 100).toBeCloseTo(72.71814981534372, 10);
    expect(getByText(container, '90% → 95% confidence: n increases by about 42%')).toBeVisible();
    expect(getByText(container, '95% → 99% confidence: n increases by about 73%')).toBeVisible();
    expect(getByText(container, 'These comparisons hold σ and E fixed, before rounding n up.')).toBeVisible();
  });

  it('explains half-width and repeated coverage while preserving the complete rendered derivation', async () => {
    startup.resolve();
    await mount();
    expect(getByText(container, /planned half-width/)).toBeVisible();
    expect(getByText(container, /^This formula plans an interval.*independent observations from the same population/)).toBeVisible();
    expect(getByText(container, /For a normal population,/)).toBeVisible();
    expect(getByText(container, /finite variance.*normal approximation as n grows/)).toBeVisible();
    expect(getByText(container, /known population standard deviation/)).toBeVisible();
    expect(getByText(container, /about 95% of those intervals/)).toBeVisible();
    expect(getByText(container, /A particular interval can miss/)).toBeVisible();
    expect(container.textContent).not.toContain("We're 95% sure");
    expectRendered();
    await click('Show Step-by-Step Derivation');
    const foundation = getByRole(container, 'heading', { name: 'Why Does the Formula Work?' }).parentElement;
    expect(getByRole(foundation, 'heading', { name: 'Start with the confidence interval formula' })).toBeVisible();
    expectRendered();
    await click('Next', foundation);
    expect(getByText(foundation, 'Choose the interval half-width before sampling')).toBeVisible();
    expectRendered();
    await click('Next', foundation);
    await click('Next', foundation);
    expect(getByRole(foundation, 'heading', { name: 'Square both sides to get n' })).toBeVisible();
    expect(sourcePasses.some(pass => pass.text.includes('\\left(\\frac{z_{\\alpha/2} \\times \\sigma}{E}\\right)^2'))).toBe(true);
    expectRendered();
  });

  it('offers chapter navigation before and after mode visits without asserting lesson completion or writing study facts', async () => {
    startup.resolve();
    await mount();
    expect(getByRole(container, 'heading', { name: 'Continue learning' })).toBeVisible();
    expect(queryByRole(container, 'heading', { name: 'Section Complete!' })).toBeNull();
    expect(getByRole(container, 'link', { name: 'Back to Chapter 5' })).toHaveAttribute('href', '/chapter5');
    expect(window.localStorage.length).toBe(0);
    await click(/^Practice/);
    await click(/^Applications/);
    await click(/^Foundations/);
    expect(queryByRole(container, 'heading', { name: 'Section Complete!' })).toBeNull();
    expect(window.localStorage.length).toBe(0);
    expectRendered();
  });

  it('keeps the existing completion-card default while neutral navigation is opt-in', async () => {
    startup.resolve();
    await mount(SectionComplete, { chapter: 3 });
    expect(getByRole(container, 'heading', { name: 'Section Complete!' })).toBeVisible();
    expect(getByRole(container, 'link', { name: 'Back to Chapter 3' })).toHaveAttribute('href', '/chapter3');
    await act(async () => root.render(React.createElement(SectionComplete, { chapter: 3, status: 'navigation' })));
    expect(getByRole(container, 'heading', { name: 'Continue learning' })).toBeVisible();
    expect(getByRole(container, 'link', { name: 'Back to Chapter 3' })).toHaveAttribute('href', '/chapter3');
    expect(queryByRole(container, 'heading', { name: 'Section Complete!' })).toBeNull();
    expect(window.localStorage.length).toBe(0);
  });

  it.each([
    ['Margin of Error', 'Population Variability', 'Confidence Level'],
    ['Margin of Error', 'Confidence Level', 'Population Variability'],
    ['Confidence Level', 'Margin of Error', 'Population Variability'],
    ['Confidence Level', 'Population Variability', 'Margin of Error'],
    ['Population Variability', 'Confidence Level', 'Margin of Error'],
    ['Population Variability', 'Margin of Error', 'Confidence Level'],
  ])('records three explicit distinct relationships once in the order %s → %s → %s', async (...order) => {
    const onComplete = vi.fn();
    startup.resolve();
    await mount(VisualExploration, { onComplete }, true);
    expect(onComplete).not.toHaveBeenCalled();
    const svg = container.querySelector('svg');
    await act(async () => fireEvent.mouseOut(svg.querySelector('rect[fill="transparent"]')));
    await settle();
    expect(onComplete).not.toHaveBeenCalled();
    await chooseRelationship(order[0]);
    await chooseRelationship(order[0]);
    await chooseRelationship(order[1]);
    expect(onComplete).not.toHaveBeenCalled();
    await chooseRelationship(order[2]);
    expect(onComplete).toHaveBeenCalledExactlyOnceWith('visual-exploration');
    await chooseRelationship(order[0]);
    await chooseRelationship(order[2]);
    await chooseRelationship(order[1]);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(svg.querySelector('path')?.getAttribute('d')).toMatch(/^M/);
    expect(window.localStorage.length).toBe(0);
  });

  it('does not count the initially displayed relationship or duplicate concurrent button activations', async () => {
    const onComplete = vi.fn();
    startup.resolve();
    await mount(VisualExploration, { onComplete });
    await chooseRelationship('Population Variability');
    await chooseRelationship('Confidence Level');
    expect(onComplete).not.toHaveBeenCalled();
    expect(getByRole(container, 'button', { name: 'Margin of Error' })).not.toBeDisabled();
    await act(async () => {
      fireEvent.click(getByRole(container, 'button', { name: 'Margin of Error' }));
      fireEvent.click(getByRole(container, 'button', { name: 'Margin of Error' }));
      fireEvent.click(getByRole(container, 'button', { name: 'Confidence Level' }));
    });
    await settle();
    expect(onComplete).toHaveBeenCalledExactlyOnceWith('visual-exploration');
  });

  it('keeps exploration feedback local and leaves unrelated mathematics untouched after all three explicit choices', async () => {
    startup.resolve();
    await mount();
    const formulas = [...container.querySelectorAll('mjx-container')];
    const calls = window.MathJax.typesetPromise.mock.calls.length;
    await chooseRelationship('Margin of Error');
    await chooseRelationship('Population Variability');
    await chooseRelationship('Confidence Level');
    expect(queryByRole(container, 'heading', { name: 'Section Complete!' })).toBeNull();
    expect(getByRole(container, 'heading', { name: 'Continue learning' })).toBeVisible();
    expect(getByRole(container, 'button', { name: 'Confidence Level' })).toHaveAttribute('aria-pressed', 'true');
    expect(getByRole(container, 'button', { name: 'Margin of Error' })).toHaveAttribute('aria-pressed', 'false');
    expect([...container.querySelectorAll('mjx-container')]).toEqual(formulas);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
    expect(window.localStorage.length).toBe(0);
    expectRendered();
  });

  it('uses rounded-up calculator values and a normal-model coverage reference instead of guaranteeing each realized interval', async () => {
    startup.resolve();
    await mount();
    await click(/^Practice/);
    const calculator = getByRole(container, 'heading', { name: 'Sample Size Calculator' }).parentElement.parentElement;
    const required = () => Number(getByText(calculator, /^n = \d+$/, { selector: 'p.text-5xl' }).textContent.split('=')[1]);
    expect(required()).toBe(217);
    expect(coverage(2, required(), 15)).toBeCloseTo(0.9504841296855204, 10);
    expect(coverage(2, required(), 15)).toBeGreaterThan(0.95);
    expect(coverage(2, required() - 1, 15)).toBeLessThan(0.95);
    const fixedMean = 100;
    const standardError = 15 / Math.sqrt(required());
    const actualHalfWidth = 1.96 * standardError;
    expect(coverage(actualHalfWidth, required(), 15)).toBeCloseTo(0.9500042097035591, 12);
    const realizedMean = fixedMean + 3 * standardError;
    const intervalLower = realizedMean - actualHalfWidth;
    expect(intervalLower).toBeGreaterThan(fixedMean);
    expect(actualHalfWidth).toBeLessThanOrEqual(2);
    await click('Show Calculation', calculator);
    expect(getByText(calculator, 'n = 217 (rounded up)')).toBeVisible();
    expectRendered();
    const [sigmaInput, errorInput] = getAllByRole(calculator, 'spinbutton');
    for (const [sigma, error, confidence, expected] of [[3, 0.5, 95, 139], [15, 2, 90, 153], [15, 1, 95, 865]]) {
      await act(async () => {
        fireEvent.change(sigmaInput, { target: { value: String(sigma) } });
        fireEvent.change(errorInput, { target: { value: String(error) } });
        fireEvent.change(getByRole(calculator, 'combobox'), { target: { value: String(confidence) } });
      });
      await settle();
      expect(required()).toBe(expected);
      expect(getByText(calculator, `n = ${expected} (rounded up)`)).toBeVisible();
      expectRendered();
    }
    expect(sourcePasses.every(pass => pass.connected)).toBe(true);
  });
});
