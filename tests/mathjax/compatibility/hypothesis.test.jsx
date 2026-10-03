import TypesOfHypotheses from '@/components/06-hypothesis-testing/6-2-2-TypesOfHypotheses-Interactive';
import TestForMeanKnownVariance from '@/components/06-hypothesis-testing/6-4-1-TestForMeanKnownVariance';
import TestForProportion from '@/components/06-hypothesis-testing/6-6-1-TestForProportion';
import PairedTwoSampleTest from '@/components/06-hypothesis-testing/6-7-1-PairedTwoSampleTest';
import UnpairedTwoSampleTest from '@/components/06-hypothesis-testing/6-8-1-UnpairedTwoSampleTest';
import DifferenceOfTwoProportions from '@/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as espree from 'espree';
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
// Framer's external installed React differs from App Router's bundled React in
// jsdom. Isolate decorative motion here while retaining owned conditional
// mounts, timers, controls, calculations and D3 effects.
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
vi.mock('@/components/reference-sheets/Chapter6ReferenceSheet', () => ({ Chapter6ReferenceSheet: () => null }));
vi.mock('@/components/ui/MathematicalDiscoveries', () => ({ MathematicalDiscoveries: () => null }));
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

async function change(element, value) {
  await act(async () => fireEvent.change(element, { target: { value } }));
  await settle();
}

async function ready() {
  startup.resolve();
  await settle();
}

async function enterInvestigation() {
  await click('Walk Through Each Type');
  await click(/^Investigator A/);
  await act(async () => { await vi.advanceTimersByTimeAsync(300); });
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
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    clearRect() {}, beginPath() {}, arc() {}, fill() {}, fillStyle: '',
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
  vi.unstubAllGlobals();
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

const files = [
  '6-2-2-TypesOfHypotheses-Interactive.jsx', '6-4-1-TestForMeanKnownVariance.jsx',
  '6-6-1-TestForProportion.jsx', '6-7-1-PairedTwoSampleTest.jsx',
  '6-8-1-UnpairedTwoSampleTest.jsx', '6-9-1-DifferenceOfTwoProportions.jsx',
];
const pages = [
  ['hypothesis types', TypesOfHypotheses], ['known variance', TestForMeanKnownVariance],
  ['proportion test', TestForProportion], ['paired test', PairedTwoSampleTest],
  ['unpaired test', UnpairedTwoSampleTest], ['two proportions', DifferenceOfTwoProportions],
];
const raw = scope => [...scope.querySelectorAll('span, div, p')].filter(node => !node.childElementCount && /\\[([]/.test(node.textContent)).map(node => node.textContent);

function expectRendered(scope = container) {
  expect(raw(scope)).toEqual([]);
  expect(scope.querySelectorAll('mjx-container').length).toBeGreaterThan(0);
  expect(scope.querySelector('mjx-merror')).toBeNull();
}

// Shared reference/discovery widgets are outside this migration. Owned lesson
// controls, formula content, calculations and chart effects are exercised.
describe('hypothesis lessons through the canonical mathematics runtime', () => {
  it.each(pages)('renders %s after startup exceeds the former retry window and then stays idle', async (_name, Page) => {
    await mount(Page, true);
    if (Page === TypesOfHypotheses) await enterInvestigation();
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
    await ready();
    expectRendered();
    expect(sourcePasses.every(pass => pass.element.isConnected)).toBe(true);
    const calls=window.MathJax.typesetPromise.mock.calls.length;
    await act(async () => { await vi.advanceTimersByTimeAsync(500); }); await settle();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(calls);
  });

  it('owns the hypothesis details only while expanded and preserves math through the particle updates', async () => {
    await mount(TypesOfHypotheses);
    await enterInvestigation();
    await click('Mathematical Details');
    await click('Mathematical Details');
    await ready();
    expectRendered();
    expect(sourcePasses.every(pass => pass.element.isConnected)).toBe(true);
    await click('Mathematical Details');
    expectRendered();
    const count = window.MathJax.typesetPromise.mock.calls.length;
    const detailMath = [...container.querySelectorAll('mjx-container')].at(-1);
    await act(async () => { await vi.advanceTimersByTimeAsync(500); }); await settle();
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(count);
    expect(detailMath.isConnected).toBe(true);
    await click('Analyze Results');
    expectRendered();
    for (let step = 0; step < 3; step++) {
      await click('Next');
      expect(raw(container)).toEqual([]);
    }
    for (let step = 0; step < 3; step++) await click('Previous');
    expectRendered();
  });

  it('keeps the known-variance worked solution rendered after tail, alpha and display controls', async () => {
    await mount(TestForMeanKnownVariance); await ready();
    for (const name of [/μ > 40/, /α = 0.01/, 'Critical Values', 'P-Value Area', /μ < 40/, /α = 0.1/, /μ ≠ 40/]) {
      await click(name);
      expectRendered();
    }
    expect(sourcePasses.some(pass => pass.text.includes('\\alpha = 0.01'))).toBe(true);
    expect(sourcePasses.some(pass => pass.text.includes('H_1: \\mu <'))).toBe(true);
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('renders every proportion section and its current values, including the approximation and decision labels', async () => {
    await mount(TestForProportion); await ready();
    const condition = [...container.querySelectorAll('span')].find(node => node.textContent.startsWith('Works well when both'));
    expect(condition.querySelectorAll('mjx-container')).toHaveLength(2);
    await change(getAllByRole(container, 'slider')[0], '120');
    await change(getAllByRole(container, 'slider')[1], '0.65');
    await change(getAllByRole(container, 'slider')[2], '72');
    expectRendered();
    expect(sourcePasses.some(pass => pass.text.includes('120 \\times 0.65 = 78.0'))).toBe(true);
    await click(/Continuity Correction/);
    await click(/Show Continuity Correction/);
    expectRendered();
    await click(/Hide Continuity Correction/);
    expectRendered();
    await click(/Large Counts Condition/);
    expectRendered();
    await click(/Sample Size Effects/);
    await change(getByRole(container, 'slider'), '200');
    for (const name of ['Greater than', 'Less than', 'Two-sided']) {
      await click(name); expectRendered();
    }
    const decision = [...container.querySelectorAll('p')].find(node => node.textContent.startsWith('Decision at'));
    expect(decision.querySelectorAll('mjx-container')).toHaveLength(2);
    expect(sourcePasses.some(pass => pass.text.includes('\\alpha = 0.05'))).toBe(true);
  });

  it('renders the paired transformation and final revealed hypotheses in their mounted step', async () => {
    await mount(PairedTwoSampleTest); await ready();
    for (let step = 0; step < 3; step++) await click('Next');
    await click('Start Transformation');
    await act(async () => { await vi.advanceTimersByTimeAsync(1800); }); await settle();
    expectRendered();
    expect(container.textContent).toContain('Transformation Complete!');
    await click('See the Final Results');
    await click('Reveal the Results');
    expectRendered();
    expect(container.textContent).toContain('Two-Sided Test of Mean Change');
    expect(sourcePasses.some(pass => pass.text.includes('\\mu_{\\text{difference}}'))).toBe(true);
    await click('Previous');
    expectRendered();
  });

  it('keeps the unpaired calculator and pooled-SD callout current after alpha, calculator and dataset edits', async () => {
    await mount(UnpairedTwoSampleTest); await ready();
    const calculator = getByRole(container, 'heading', { name: 'Interactive Two-Sample Test Calculator' }).parentElement;
    const selects = getAllByRole(calculator, 'combobox');
    await change(selects[1], '0.01');
    expectRendered();
    expect(calculator.textContent).toContain('α = 0.01');
    await change(selects[0], 'welch');
    await change(getAllByRole(calculator, 'slider')[0], '25');
    await change(getAllByRole(calculator, 'slider')[1], '60');
    expectRendered();
    expect(sourcePasses.some(pass => pass.text.includes('t = \\frac{60 -'))).toBe(true);
    await click('Fertilizer Effectiveness');
    expectRendered();
    expect(container.textContent).toContain('New Fertilizer');
    expect(sourcePasses.some(pass => pass.text.includes('12.31 - 14.52'))).toBe(true);
    await click('Income Comparison');
    expectRendered();
  });

  it('keeps two-proportion labels and worked formulas rendered through all ordinary chart controls', async () => {
    await mount(DifferenceOfTwoProportions); await ready();
    await change(getByRole(container, 'slider', { name: 'Sample size multiplier slider' }), '0.5');
    await click('Set significance level to 1 percent');
    await change(getByRole(container, 'combobox', { name: 'Select alternative hypothesis type' }), 'left');
    expectRendered();
    await click('Show Sampling Distribution');
    expectRendered();
    expect(getByRole(container, 'img', { name: 'Sampling distribution curve under null hypothesis' }).querySelectorAll('path').length).toBeGreaterThan(0);
    await change(getByRole(container, 'combobox', { name: 'Select alternative hypothesis type' }), 'right');
    await click('Hide Sampling Distribution');
    await click('Set significance level to 10 percent');
    expectRendered();
    expect(sourcePasses.some(pass => pass.text.includes('\\alpha = 0.01'))).toBe(true);
  });

  it('recovers a mounted lesson through the shared retry after a render failure', async () => {
    window.MathJax.typesetPromise.mockRejectedValueOnce(new Error('temporary render failure'));
    await mount(PairedTwoSampleTest); await ready();
    expect(getByRole(container, 'button', { name: 'Retry mathematics' })).toBeEnabled();
    expect(raw(container).length).toBeGreaterThan(0);
    await click('Retry mathematics');
    expectRendered();
    expect(container.querySelector('[aria-label="Mathematics rendering"]')).toBeNull();
  });

  it('does not process a departed lesson when startup resolves after its unmount', async () => {
    await mount(TestForMeanKnownVariance);
    await act(async () => root.render(React.createElement(MathJaxProvider)));
    await ready();
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
    expect(sourcePasses).toEqual([]);
    expect(container.querySelectorAll('mjx-container')).toHaveLength(0);
  });

  it('has no live direct MathJax rendering call in the six owned modules', () => {
    const found=[];
    function visit(node,file){
      if(!node||typeof node!=='object')return;
      if(node.type==='CallExpression' && node.callee.type==='MemberExpression'){
        const property=node.callee.computed?node.callee.property.value:node.callee.property.name;
        if(['typeset','typesetPromise','typesetClear'].includes(property))found.push({file,line:node.loc.start.line});
      }
      for(const [key,child]of Object.entries(node)){
        if(key==='loc')continue;
        if(Array.isArray(child))child.forEach(value=>visit(value,file));else if(child?.type)visit(child,file);
      }
    }
    for(const file of files)visit(espree.parse(readFileSync(resolve('src/components/06-hypothesis-testing',file),'utf8'),{ecmaVersion:'latest',sourceType:'module',ecmaFeatures:{jsx:true},loc:true}),file);
    expect(found).toEqual([]);
  });
});
