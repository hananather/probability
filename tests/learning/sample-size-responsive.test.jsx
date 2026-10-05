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
import { readFileSync } from 'node:fs';
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
const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({
  ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime,
}));
// Separate reference/navigation widgets are isolated; the imported lesson,
// completion/navigation card, formulas, controls, and D3 effects remain real.
vi.mock('@/components/reference-sheets/Chapter5ReferenceSheet', () => ({ Chapter5ReferenceSheet: () => <aside aria-label="Chapter 5 reference sheet" /> }));
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
let originalBounds, originalClientWidth, width, observers;

function measuredWidth(element) {
  for (let node = element; node; node = node.parentElement) {
    if (node.style?.display === 'none') return 0;
  }
  return width;
}

class ChartResizeObserver {
  constructor(callback) { this.callback = callback; this.active = true; this.disconnect = vi.fn(() => { this.active = false; }); observers.push(this); }
  observe(element) { this.element = element; }
}

async function resize(nextWidth, viewport) {
  width = nextWidth;
  if (viewport) window.innerWidth = viewport;
  await act(async () => {
    for (const observer of observers.filter(item => item.active)) observer.callback([{ target: observer.element }]);
  });
  await settle();
}

function chart(name) { return getByRole(container, 'img', { name }); }
function calculatorData(svg) { return svg.querySelector('path[stroke="#14b8a6"]').__data__; }
function expectGeometry(svg, expectedWidth, height) {
  expect(svg.getAttribute('viewBox')).toBe(`0 0 ${expectedWidth} ${height}`);
  const overlay = svg.querySelector('rect[fill="transparent"]');
  const clip = svg.querySelector('clipPath rect');
  if (overlay) {
    expect(Number(overlay.getAttribute('width'))).toBeGreaterThanOrEqual(60);
    expect(Number(overlay.getAttribute('x'))).toBeGreaterThanOrEqual(0);
    expect(Number(overlay.getAttribute('x')) + Number(overlay.getAttribute('width'))).toBeLessThanOrEqual(expectedWidth);
  }
  if (clip) {
    expect(Number(clip.getAttribute('width'))).toBeGreaterThanOrEqual(60);
    expect(Number(clip.getAttribute('x')) + Number(clip.getAttribute('width'))).toBeLessThanOrEqual(expectedWidth);
  }
  const points = [...svg.querySelectorAll('circle[cx]')];
  for (const point of points) {
    const x = Number(point.getAttribute('cx')), y = Number(point.getAttribute('cy')), radius = Number(point.getAttribute('r'));
    expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
    expect(x - radius).toBeGreaterThanOrEqual(0); expect(x + radius).toBeLessThanOrEqual(expectedWidth);
    expect(y - radius).toBeGreaterThanOrEqual(0); expect(y + radius).toBeLessThanOrEqual(height);
  }
  const dataPoints = points.filter(point => point.__data__ && typeof point.__data__.x === 'number');
  for (let index = 1; index < dataPoints.length; index++) expect(Number(dataPoints[index].getAttribute('cx'))).toBeGreaterThan(Number(dataPoints[index - 1].getAttribute('cx')));
  return dataPoints.map(point => point.__data__);
}

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
  SVGElement.prototype.getBoundingClientRect = function () { return { x: 0, y: 0, left: 0, top: 0, width: measuredWidth(this), height: 500, right: measuredWidth(this), bottom: 500 }; };
  Object.defineProperty(SVGElement.prototype, 'clientWidth', { configurable: true, get() { return measuredWidth(this); } });
  SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 100, height: 20 });
  SVGElement.prototype.getTotalLength = () => 100;
});

beforeEach(() => {
  width = 1100; observers = []; window.innerWidth = 1440;
  vi.stubGlobal('ResizeObserver', ChartResizeObserver);
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
  vi.unstubAllGlobals();
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


describe('sample-size responsive chart geometry and equation access', () => {
  it.each([[320, 136], [390, 206], [1440, 1100]])('draws every relationship inside an actual measured SVG at viewport %i', async (viewport, svgWidth) => {
    width = svgWidth; window.innerWidth = viewport; startup.resolve(); await mount(VisualExploration);
    const svg = chart('Sample size relationship chart');
    for (const relationship of ['Margin of Error', 'Population Variability', 'Confidence Level']) {
      await chooseRelationship(relationship);
      const data = expectGeometry(svg, svgWidth, 450); expect(data.length).toBeGreaterThan(0);
      const labels = [...svg.querySelectorAll('text')].map(node => node.textContent);
      expect(labels).toContain('Sample Size (n)');
      if (relationship === 'Confidence Level') expect(data.map(point => point.x)).toEqual([90, 92, 94, 95, 96, 97, 98, 99]);
    }
  });

  it('remeasures on mobile/desktop resize, preserves data and completion, and cleans StrictMode observers', async () => {
    startup.resolve(); const onComplete = vi.fn(); await mount(VisualExploration, { onComplete }, true);
    const svg = chart('Sample size relationship chart'); const before = expectGeometry(svg, 1100, 450);
    const desktopTicks = svg.querySelector('.x-axis').querySelectorAll('.tick').length;
    await resize(136, 320); expect(expectGeometry(svg, 136, 450)).toEqual(before);
    expect(svg.querySelector('.x-axis').querySelectorAll('.tick').length).toBeLessThan(desktopTicks);
    const owner = svg.querySelector('.relationship-plot'); await resize(136); expect(svg.querySelector('.relationship-plot')).toBe(owner);
    await chooseRelationship('Margin of Error'); await chooseRelationship('Population Variability'); await chooseRelationship('Confidence Level');
    expect(onComplete).toHaveBeenCalledExactlyOnceWith('visual-exploration');
    const confidenceData = expectGeometry(svg, 136, 450);
    await resize(1100, 1440); await resize(206, 390); expect(expectGeometry(svg, 206, 450)).toEqual(confidenceData);
    expect(onComplete).toHaveBeenCalledTimes(1);
    await act(async () => root.unmount()); root = null;
    expect(observers.filter(observer => observer.active)).toHaveLength(0);
    expect(observers.every(observer => observer.disconnect.mock.calls.length === 1)).toBe(true);
  });

  it('defers zero-width charts, mounts calculator/budget geometry only when visible, and retains scenario controls', async () => {
    width = 0; startup.resolve(); await mount(undefined, {}, true);
    const relationship = chart('Sample size relationship chart'); expect(relationship.querySelector('defs')).toBeNull();
    await resize(136, 320); expectGeometry(relationship, 136, 450);
    // The Applications subtree stays mounted but hidden; width-zero charts are not assessed as visible.
    const budget = container.querySelector('svg[aria-label="Sample size budget chart"]'); expect(budget.querySelector('defs')).toBeNull();
    await click(/Practice/); await click('Explore'); await resize(136, 320);
    const calculator = chart('Sample size calculator exploration chart'); expectGeometry(calculator, 136, 300);
    const original = calculatorData(calculator).map(point => ({ ...point }));
    await resize(1100, 1440); expectGeometry(calculator, 1100, 300); expect(calculatorData(calculator)).toEqual(original);
    await click('Vary Confidence'); expectGeometry(calculator, 1100, 300);
    expect(calculatorData(calculator).map(point => point.x)).toEqual([90, 92, 94, 95, 96, 97, 98, 99]);
    await click(/Applications/); await resize(136, 320);
    expect(chart('Sample size budget chart')).toBe(budget); expectGeometry(budget, 136, 500);
    const scenario = getByRole(container, 'heading', { name: 'Scenario Parameters' }).parentElement;
    const sliders = getAllByRole(scenario, 'slider');
    await act(async () => fireEvent.change(sliders[0], { target: { value: '200' } })); await settle();
    expectGeometry(budget, 136, 500); expect(getByText(scenario, '$200')).toBeVisible();
    const annotation = budget.querySelector('.optimal-annotation'); expect(annotation).not.toBeNull();
    const text = annotation.querySelector('text'); expect(text.querySelectorAll('tspan')).toHaveLength(2);
    expectRendered();
  });

  it('keeps SVG pointer inversion aligned with the visible plot after resizing', async () => {
    width = 136; startup.resolve(); await mount(VisualExploration);
    const svg = chart('Sample size relationship chart'), overlay = svg.querySelector('rect[fill="transparent"]');
    const middle = Number(overlay.getAttribute('x')) + Number(overlay.getAttribute('width')) / 2;
    await act(async () => fireEvent.mouseMove(overlay, { clientX: middle, clientY: 200 })); await settle();
    expect(getByText(container, /Required sample size n = 97 for E = 3.0/)).toBeVisible();
    const tooltip = svg.querySelector('.hover-tooltip'); const translated = Number(tooltip.getAttribute('transform').match(/translate\(([^,]+)/)[1]);
    expect(middle + translated - 50).toBeGreaterThanOrEqual(0); expect(middle + translated + 50).toBeLessThanOrEqual(136);
    await resize(1100, 1440);
    const newOverlay = svg.querySelector('rect[fill="transparent"]'), newMiddle = Number(newOverlay.getAttribute('x')) + Number(newOverlay.getAttribute('width')) / 2;
    await act(async () => fireEvent.mouseMove(newOverlay, { clientX: newMiddle, clientY: 200 })); await settle();
    expect(getByText(container, /Required sample size n = 97 for E = 3.0/)).toBeVisible();
  });

  it('keeps permitted small-error and large-SD current markers visible without changing calculator results or sweep data', async () => {
    width = 136; startup.resolve(); await mount(); await click(/Practice/);
    const calculatorSection = getByRole(container, 'heading', { name: 'Sample Size Calculator' }).parentElement.parentElement;
    const inputs = getAllByRole(calculatorSection, 'spinbutton');
    await act(async () => fireEvent.change(inputs[1], { target: { value: '0.1' } })); await settle();
    expect(getByText(calculatorSection, 'n = 86433')).toBeVisible();
    await click('Explore', calculatorSection);
    let svg = chart('Sample size calculator exploration chart'); expectGeometry(svg, 136, 300);
    expect(calculatorData(svg)).toHaveLength(46);
    await click('Calculate', calculatorSection);
    await act(async () => fireEvent.change(getAllByRole(calculatorSection, 'spinbutton')[0], { target: { value: '55' } })); await settle();
    expect(getByText(calculatorSection, 'n = 1162042')).toBeVisible();
    await click('Explore', calculatorSection); await click('Vary Std Dev', calculatorSection);
    expectGeometry(svg = chart('Sample size calculator exploration chart'), 136, 300);
    expect(calculatorData(svg).map(point => point.x)).toEqual(Array.from({ length: 51 }, (_, index) => 5 + index / 2));
    for (const value of ['0', '1e-200']) {
      await click('Calculate', calculatorSection);
      await act(async () => fireEvent.change(getAllByRole(calculatorSection, 'spinbutton')[1], { target: { value } })); await settle();
      await click('Explore', calculatorSection);
      const invalid = chart('Sample size calculator exploration chart');
      expect(invalid.querySelector('circle')).toBeNull();
      expect(invalid.textContent).toContain('Enter positive finite inputs');
      expect(invalid.outerHTML).not.toMatch(/NaN|Infinity/);
    }
  });

  it('retains complete rendered long equations in named keyboard-focusable regions and a single route reference owner', async () => {
    width = 136; startup.resolve(); await mount();
    await click('Show Step-by-Step Derivation');
    const derivation = getByRole(container, 'region', { name: 'Sample size derivation equation' }); derivation.focus(); expect(document.activeElement).toBe(derivation);
    expect(derivation.querySelector('mjx-container')).not.toBeNull();
    await click(/Practice/);
    const builder = getByRole(container, 'region', { name: 'Interactive sample size formula' }); builder.focus(); expect(document.activeElement).toBe(builder);
    await act(async () => fireEvent.click(getByText(builder, ')²'))); await settle();
    const squared = getByRole(container, 'region', { name: 'Solving for sample size' }); squared.focus(); expect(document.activeElement).toBe(squared);
    expect(squared.querySelectorAll('mjx-container')).toHaveLength(1);
    await click('Show Calculation');
    const calculation = getByRole(container, 'region', { name: 'Sample size calculation steps' }); calculation.focus(); expect(document.activeElement).toBe(calculation);
    expect(calculation.querySelectorAll('mjx-container')).toHaveLength(4); expectRendered();
    expect(container.querySelectorAll('aside[aria-label="Chapter 5 reference sheet"]')).toHaveLength(0);
    const route = readFileSync('src/app/chapter5/sample-size/page.js', 'utf8');
    expect(route.match(/<Chapter5ReferenceSheet\b/g)).toHaveLength(1);
  });

  it('provides the window-resize fallback and removes all owned listeners on unmount', async () => {
    vi.stubGlobal('ResizeObserver', undefined); startup.resolve();
    const add = vi.spyOn(window, 'addEventListener'), remove = vi.spyOn(window, 'removeEventListener');
    await mount(); await click(/Applications/); width = 136;
    await act(async () => window.dispatchEvent(new Event('resize'))); await settle();
    expectGeometry(chart('Sample size budget chart'), 136, 500);
    const callbacks = add.mock.calls.filter(([event]) => event === 'resize').map(([, callback]) => callback); expect(callbacks).toHaveLength(2);
    await act(async () => root.unmount()); root = null;
    for (const callback of callbacks) expect(remove).toHaveBeenCalledWith('resize', callback);
  });
});
