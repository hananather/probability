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
import SampleSizeCalculation, { CostBenefitAnalysis, RealWorldScenarios, VisualExploration } from '@/components/05-estimation/5-3-SampleSizeCalculation';
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



function calculatorScope() { return getByRole(container, 'heading', { name: 'Sample Size Calculator' }).parentElement.parentElement; }
async function edit(scope, name, value) {
  await act(async () => fireEvent.change(getByRole(scope, 'spinbutton', { name }), { target: { value: String(value) } }));
  await settle();
}
function hover(svg, x) {
  const overlay = [...svg.querySelectorAll('rect')].find(node => node.__on?.some(entry => entry.type === 'mousemove'));
  return act(async () => fireEvent.mouseMove(overlay, { clientX: x, clientY: 200 }));
}

describe('sample-size domain, keyboard controls and explicit study signals', () => {
  it('names every calculator and practice input without changing the default calculation', async () => {
    startup.resolve(); await mount(); await click(/^Practice/);
    const calculator = calculatorScope();
    expect(getByRole(calculator, 'spinbutton', { name: 'Population SD (σ)' })).toHaveValue(15);
    expect(getByRole(calculator, 'spinbutton', { name: 'Margin of Error (E)' })).toHaveValue(2);
    expect(getByRole(calculator, 'combobox', { name: 'Confidence Level' })).toHaveValue('95');
    expect(getByRole(container, 'spinbutton', { name: 'Your Answer:' })).toBeVisible();
    expect(calculator.textContent).toContain('n = 217');
  });

  it.each(['Population SD (σ)', 'Margin of Error (E)'])('rejects blank, zero and negative %s without a stale calculation or invalid save', async name => {
    startup.resolve(); await mount(); await click(/^Practice/);
    const calculator = calculatorScope();
    await click('Show Calculation', calculator); await click('Save Result', calculator);
    const steps = () => queryByRole(calculator, 'region', { name: 'Sample size calculation steps' });
    expect(steps()).not.toBeNull();
    for (const value of ['', 0, -15]) {
      await edit(calculator, name, value);
      expect(getByRole(calculator, 'alert').textContent).toMatch(/positive, finite/);
      expect(calculator.querySelector('p.text-5xl')).toBeNull();
      expect(calculator.textContent).not.toMatch(/Infinity|NaN/);
      expect(steps()).toBeNull();
      const save = getByRole(calculator, 'button', { name: 'Save Result' });
      expect(save).toBeDisabled(); await act(async () => fireEvent.click(save));
      expect(calculator.querySelectorAll('h4 + div > div')).toHaveLength(1);
    }
    await edit(calculator, name, name.startsWith('Population') ? 15 : 2);
    expect(calculator.textContent).toContain('n = 217');
    expect(steps()).not.toBeNull();
    expect(getByRole(calculator, 'button', { name: 'Save Result' })).not.toBeDisabled();
    expect(calculator.textContent).toContain('σ=15, E=2, 95% → n=217');
    expectRendered(calculator);
  });

  it('blocks unrepresentable counts and recovers to the preserved large finite calculation', async () => {
    startup.resolve(); await mount(); await click(/^Practice/);
    const calculator = calculatorScope();
    for (const error of [1e-200, 1e-10]) {
      await edit(calculator, 'Margin of Error (E)', error);
      expect(getByRole(calculator, 'alert').textContent).toContain('represented safely');
      expect(calculator.querySelector('p.text-5xl')).toBeNull();
      expect(getByRole(calculator, 'button', { name: 'Save Result' })).toBeDisabled();
    }
    await edit(calculator, 'Population SD (σ)', 55);
    await edit(calculator, 'Margin of Error (E)', .1);
    expect(calculator.textContent).toContain('n = 1162084');
    await click('Save Result', calculator);
    await click(/^Applications/); await click(/^Practice/);
    expect(calculator.textContent).toContain('σ=55, E=0.1, 95% → n=1162084');
  });

  it('offers real named formula buttons with focus and the existing explanation toggles', async () => {
    startup.resolve(); await mount(); await click(/^Practice/);
    const region = getByRole(container, 'region', { name: 'Interactive sample size formula' });
    for (const name of ['Critical value z', 'Tail probability alpha over two', 'Population standard deviation sigma', 'Margin of error E', 'Why squared', 'Explain the squared expression']) {
      const button = getByRole(region, 'button', { name });
      expect(button.tagName).toBe('BUTTON');
      button.focus(); expect(button).toHaveFocus();
      await click(name, region); expect(button).toHaveFocus();
      expect(button).toHaveAttribute('aria-pressed', 'true');
      await click(name, region); expect(button).toHaveAttribute('aria-pressed', 'false');
    }
    expectRendered();
  });

  it('uses native preset buttons and preserves all four preset values', async () => {
    startup.resolve(); await mount(); await click(/^Practice/);
    const calculator = calculatorScope(); await click('Compare with Course Examples', calculator);
    for (const [name, sigma, error, confidence, count] of [
      [/Example 1: Standard case/, 15, 2, '95', 217],
      [/Example 2: Low variability/, 3, .5, '95', 139],
      [/Example 3: Lower confidence/, 15, 2, '90', 153],
      [/Example 4: High precision/, 15, 1, '95', 865],
    ]) {
      const button = getByRole(calculator, 'button', { name });
      expect(button.tagName).toBe('BUTTON'); button.focus(); await click(name, calculator);
      expect(button).toHaveFocus();
      expect(getByRole(calculator, 'spinbutton', { name: 'Population SD (σ)' })).toHaveValue(sigma);
      expect(getByRole(calculator, 'spinbutton', { name: 'Margin of Error (E)' })).toHaveValue(error);
      expect(getByRole(calculator, 'combobox', { name: 'Confidence Level' })).toHaveValue(confidence);
      expect(calculator.querySelector('p.text-5xl').textContent).toBe(`n = ${count}`);
    }
  });

  it('reports required ceil counts at E2 and sigma5 while preserving unrounded curve data', async () => {
    startup.resolve(); await mount(VisualExploration);
    const svg = getByRole(container, 'img', { name: 'Sample size relationship chart' });
    const point = [...svg.querySelectorAll('circle[cx]')].find(node => Math.abs(node.__data__.x - 2) < 1e-10);
    expect(point.__data__.y).toBeCloseTo(216.09, 10);
    await hover(svg, 220); await settle();
    expect(container.textContent).toContain('Required sample size n = 217 for E = 2.0');
    expect(svg.textContent).toContain('Required n = 217');
    await click('Population Variability'); await hover(svg, 100); await settle();
    expect(container.textContent).toContain('Required sample size n = 25 for σ = 5.0');
    expect(container.textContent).toContain('before rounding');
  });

  it('uses the exact continuous hovered confidence for the point and count', async () => {
    startup.resolve(); await mount(VisualExploration); await click('Confidence Level');
    const svg = getByRole(container, 'img', { name: 'Sample size relationship chart' });
    // Plot bounds100..580 and confidence90..99: midpoint is94.5%.
    await hover(svg, 340); await settle();
    expect(container.textContent).toContain('Required sample size n = 208 for 94.5% confidence');
    expect(svg.textContent).toContain('Confidence (%) = 94.5');
    // Independent NormalDist reference; the hover y must use207.1173, not216.0821.
    const focus = svg.querySelector('.hover-tooltip').parentElement;
    const [x, y] = focus.getAttribute('transform').match(/[-\d.]+/g).map(Number);
    expect(x).toBeCloseTo(340, 10);
    expect(y).toBeCloseTo(360 - 207.1173358990779 / 1000 * 300, 10);
  });

  it('preserves the clinical interval answer and explicitly supplies its estimation assumptions', async () => {
    startup.resolve(); await mount(); await click(/^Practice/); await click('Problem 2');
    const problem = getByRole(container, 'heading', { name: 'Clinical Trial Problem' }).parentElement;
    expect(problem.textContent).toContain('estimate mean blood pressure');
    expect(problem.textContent).toContain('margin of error of 2 mmHg at 99% confidence');
    expect(problem.textContent).toContain('independent normal observations with known σ = 8');
    expect(problem.textContent).not.toContain('detect');
    await edit(problem, 'Your Answer:', 107); await click('Check Answer', problem);
    expect(problem.textContent).toContain('Correct! Well done.');
  });

  it('requires exact integer sample counts while allowing a leading-zero representation', async () => {
    startup.resolve(); await mount(); await click(/^Practice/);
    const problem = getByRole(container, 'heading', { name: 'Quality Control Problem' }).parentElement;
    for (const answer of ['81.995', '82.005', '81', '-82', '9007199254740992']) {
      await edit(problem, 'Your Answer:', answer); await click('Check Answer', problem);
      expect(problem.textContent).not.toContain('Correct! Well done.');
    }
    await edit(problem, 'Your Answer:', '082'); await click('Check Answer', problem);
    expect(problem.textContent).toContain('Correct! Well done.');
  });

  it('retains the reverse half-width problem and its decimal tolerance', async () => {
    startup.resolve(); await mount(); await click(/^Practice/); await click('Problem 3');
    const problem = getByRole(container, 'heading', { name: 'Budget Constraint Problem' }).parentElement;
    for (const value of ['2.94', '2.941']) {
      await edit(problem, 'Your Answer:', value); await click('Check Answer', problem);
      expect(problem.textContent).toContain('Correct! Well done.');
    }
    await edit(problem, 'Your Answer:', 3); await click('Check Answer', problem);
    expect(problem.textContent).not.toContain('Correct! Well done.');
  });

  it('counts only three explicit distinct scenario choices once under root StrictMode', async () => {
    const onComplete = vi.fn(); startup.resolve(); await mount(RealWorldScenarios, { onComplete }, true);
    expect(onComplete).not.toHaveBeenCalled();
    await click('Quality Control Monitoring product dimensions');
    await click('Market Research Estimating customer satisfaction');
    expect(onComplete).not.toHaveBeenCalled();
    await click('Clinical Trial Estimating mean blood pressure after treatment');
    expect(onComplete).toHaveBeenCalledExactlyOnceWith('scenarios-explored');
    for (const name of ['Quality Control Monitoring product dimensions', 'Clinical Trial Estimating mean blood pressure after treatment', 'Market Research Estimating customer satisfaction']) await click(name);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not count hidden mounts or mode navigation as scenario study', async () => {
    startup.resolve(); await mount();
    await click(/^Applications/); await click(/^Foundations/); await click(/^Applications/);
    // The isolated activity above verifies callback count; this actual page
    // control ensures mounting/navigation does not certify completion or write facts.
    expect(container.textContent).not.toContain('Section Complete!');
    expect(window.localStorage.length).toBe(0);
    expect(getByRole(container, 'button', { name: 'Clinical Trial Estimating mean blood pressure after treatment' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps scenario callbacks optional and restarts their local explicit-selection state on remount', async () => {
    startup.resolve(); await mount(RealWorldScenarios);
    for (const name of ['Clinical Trial Estimating mean blood pressure after treatment', 'Quality Control Monitoring product dimensions', 'Market Research Estimating customer satisfaction']) await click(name);
    await act(async () => root.unmount()); root = null; container.remove();
    const onComplete = vi.fn(); await mount(RealWorldScenarios, { onComplete });
    expect(onComplete).not.toHaveBeenCalled();
    for (const name of ['Clinical Trial Estimating mean blood pressure after treatment', 'Quality Control Monitoring product dimensions', 'Market Research Estimating customer satisfaction']) await click(name);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('describes formula clicks as exploration and suggests a calculation next', async () => {
    startup.resolve(); await mount(); await click(/^Practice/);
    const formula = getByRole(container, 'region', { name: 'Interactive sample size formula' });
    expect(container.textContent).toContain('Formula parts explored');
    expect(container.textContent).not.toContain('You have explored all parts.');
    for (const name of ['Critical value z', 'Population standard deviation sigma', 'Margin of error E', 'Why squared']) {
      await click(name, formula);
    }
    expect(container.textContent).toContain('You have explored all parts. Try a calculation next.');
    expect(container.textContent).not.toContain('Your Understanding');
    expect(container.textContent).not.toContain('You understand all parts of the formula');
    expectRendered();
  });

  it('explains the standard-error factor and target interval half-width in the revealed formula parts', async () => {
    startup.resolve(); await mount(); await click(/^Practice/);
    await click('Critical value z'); await click('Margin of error E');
    const numerator = getByRole(container, 'heading', { name: 'Why z × σ?' }).parentElement;
    const precision = getByRole(container, 'heading', { name: 'Why divide by E?' }).parentElement;
    expect(numerator.textContent).toContain('Before rounding, zσ/E = √n');
    expect(numerator.querySelector('mjx-mfrac')).not.toBeNull();
    expect(numerator.querySelector('mjx-msqrt')).not.toBeNull();
    expect(precision.textContent).toContain('confidence interval for the population mean');
    expect(precision.textContent).toContain('a particular interval can miss the fixed mean');
    expect(precision.textContent).not.toContain('being ±1 unit off');
    expect(precision.textContent).not.toContain('how close we want to be to the true value');
    expectRendered();
  });

  it('draws correct intermediate confidence counts in calculator Explore while retaining the supported rounded values', async () => {
    startup.resolve(); await mount(); await click(/^Practice/);
    const calculator = calculatorScope();
    for (const [confidence, count] of [[90, 153], [95, 217], [98, 305], [99, 374]]) {
      await act(async () => fireEvent.change(getByRole(calculator, 'combobox', { name: 'Confidence Level' }), { target: { value: String(confidence) } }));
      await settle();
      expect(calculator.querySelector('p.text-5xl').textContent).toBe(`n = ${count}`);
    }
    await click('Explore', calculator); await click('Vary Confidence', calculator);
    const svg = getByRole(calculator, 'img', { name: 'Sample size calculator exploration chart' });
    const curve = [...svg.querySelectorAll('path')].find(node => Array.isArray(node.__data__));
    // Independent Python NormalDist references, rounded up to whole observations.
    expect(Object.fromEntries(curve.__data__.map(point => [point.x, point.y]))).toEqual({
      90: 153, 92: 173, 94: 199, 95: 217, 96: 238, 97: 265, 98: 305, 99: 374,
    });
    expectRendered();
  });

  it('teaches the clinical confidence level and rounding without rejecting a valid critical-value approximation', async () => {
    startup.resolve(); await mount(); await click(/^Practice/); await click('Problem 2');
    const problem = getByRole(container, 'heading', { name: 'Clinical Trial Problem' }).parentElement;
    await edit(problem, 'Your Answer:', 106); await click('Check Answer', problem);
    expect(problem.textContent).toContain('For 99% confidence, use z ≈ 2.576 (about 2.58)');
    expect(problem.textContent).toContain('1.96 corresponds to 95%');
    expect(problem.textContent).toContain('Round the sample size up.');
    expect(problem.textContent).not.toContain('not 2.58!');
    await edit(problem, 'Your Answer:', 107); await click('Check Answer', problem);
    expect(problem.textContent).toContain('Correct! Well done.');
  });

  it.each([
    ['Problem 1', 'Quality Control Problem', 82, 81],
    ['Problem 2', 'Clinical Trial Problem', 107, 106],
    ['Problem 3', 'Budget Constraint Problem', 2.94, 3],
  ])('clears outdated grading feedback when editing or clearing %s', async (selection, title, correct, incorrect) => {
    startup.resolve(); await mount(); await click(/^Practice/); await click(selection);
    const problem = getByRole(container, 'heading', { name: title }).parentElement;
    await edit(problem, 'Your Answer:', correct); await click('Check Answer', problem);
    expect(problem.textContent).toContain('Correct! Well done.');
    await edit(problem, 'Your Answer:', incorrect);
    expect(problem.textContent).not.toContain('Correct! Well done.');
    await click('Check Answer', problem);
    expect(problem.textContent).toContain('Not quite.');
    await edit(problem, 'Your Answer:', '');
    expect(problem.textContent).not.toContain('Not quite.');
    expect(getByRole(problem, 'button', { name: 'Check Answer' })).toBeDisabled();
    await edit(problem, 'Your Answer:', correct); await click('Check Answer', problem);
    expect(problem.textContent).toContain('Correct! Well done.');
  });
});
