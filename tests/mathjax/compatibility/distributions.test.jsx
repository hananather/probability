import React, { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as espree from 'espree';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import ExpectationVarianceWorkedExample from '@/components/02-discrete-random-variables/2-2-2-ExpectationVarianceWorkedExample';
import FunctionTransformations from '@/components/02-discrete-random-variables/2-3-2-FunctionTransformations';
import BinomialDistribution from '@/components/02-discrete-random-variables/2-3-3-BinomialDistribution';
import GeometricDistribution from '@/components/02-discrete-random-variables/2-4-1-GeometricDistribution';
import NegativeBinomialDistribution from '@/components/02-discrete-random-variables/2-5-1-NegativeBinomialDistribution';
import PoissonDistribution from '@/components/02-discrete-random-variables/2-6-1-PoissonDistribution';
import DistributionStories from '@/components/02-discrete-random-variables/2-7-1-DistributionStories';
import EmpiricalRule from '@/components/03-continuous-random-variables/3-3-normal-distribution/3-3-3-EmpiricalRule';
import ExponentialDistribution from '@/components/03-continuous-random-variables/3-4-exponential-distribution/3-4-1-ExponentialDistribution';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { deferred, renderer, tick } from '../runtime/fixtures';

const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({ ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime }));
vi.mock('framer-motion', async () => {
  const { createElement, forwardRef } = await import('react');
  const components = new Map();
  const animationProps = new Set(['initial', 'animate', 'exit', 'transition', 'layout', 'whileHover', 'whileTap']);
  return {
    AnimatePresence: ({ children }) => children,
    motion: new Proxy({}, { get: (_, tag) => {
      if (!components.has(tag)) components.set(tag, forwardRef((props, ref) => createElement(tag, { ...Object.fromEntries(Object.entries(props).filter(([key]) => !animationProps.has(key))), ref })));
      return components.get(tag);
    } }),
  };
});

const files = [
  '02-discrete-random-variables/2-2-2-ExpectationVarianceWorkedExample.jsx',
  '02-discrete-random-variables/2-3-2-FunctionTransformations.jsx',
  '02-discrete-random-variables/2-3-3-BinomialDistribution.jsx',
  '02-discrete-random-variables/2-4-1-GeometricDistribution.jsx',
  '02-discrete-random-variables/2-5-1-NegativeBinomialDistribution.jsx',
  '02-discrete-random-variables/2-6-1-PoissonDistribution.jsx',
  '02-discrete-random-variables/2-7-1-DistributionStories.jsx',
  '03-continuous-random-variables/3-3-normal-distribution/3-3-3-EmpiricalRule.jsx',
  '03-continuous-random-variables/3-4-exponential-distribution/3-4-1-ExponentialDistribution.jsx',
];
const conceptPages = [
  ['Binomial', BinomialDistribution, '\\(E[X] = np\\)'],
  ['Geometric', GeometricDistribution, '\\(E[X] = \\frac{1}{p}\\)'],
  ['Negative Binomial', NegativeBinomialDistribution, '\\(E[X] = \\frac{r}{p}\\)'],
  ['Poisson', PoissonDistribution, '\\(E[X] = \\lambda\\)'],
];
const rendered = (container, source) => [...container.querySelectorAll('mjx-container')].find(node => node.dataset.source === source);
const flush = async () => { await act(async () => { for (let i = 0; i < 10; i++) await tick(); }); };
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const renderActualTeX = tex => {
  const mathDocument = mathjax.document('', { InputJax: new TeX(), OutputJax: new CHTML() });
  const container = document.createElement('div');
  container.innerHTML = adaptor.outerHTML(mathDocument.convert(tex, { display: false }));
  return container;
};

// Mutate only TeX leaves, leaving React controls and D3-owned SVGs intact.
// This tests queue/DOM ownership, not MathJax's parser or native layout.
function formulaLeaves(nodes) {
  for (const root of nodes) {
    for (const leaf of [root, ...root.querySelectorAll('span, div')]) {
      if (leaf.childElementCount || !/^\\[[(]/.test(leaf.textContent)) continue;
      const math = document.createElement('mjx-container');
      math.dataset.source = leaf.textContent;
      math.textContent = leaf.textContent;
      leaf.replaceChildren(math);
    }
  }
  return Promise.resolve();
}

describe('distribution mathematics through the shared runtime', () => {
  let mathJax;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width: 900, height: 500, top: 0, left: 0, right: 900, bottom: 500, x: 0, y: 0, toJSON() {} });
    mathJax = renderer(); mathJax.typesetPromise.mockImplementation(formulaLeaves);
    window.MathJax = mathJax;
    shared.runtime = createMathJaxRuntime();
  });
  afterEach(async () => {
    cleanup(); shared.runtime.dispose(); await tick();
    delete window.MathJax; vi.clearAllTimers(); vi.useRealTimers();
  });

  it.each(conceptPages)('renders the actual %s concept card without processing its D3 chart', async (name, Page, source) => {
    const { container } = render(<Page />); await flush();
    const formula = rendered(container, source);
    expect(formula).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: `${name} Distribution Concepts` })).toBeInTheDocument();
    expect(container.querySelectorAll('svg rect').length).toBeGreaterThan(0);
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(mathJax.typesetPromise.mock.calls.every(([nodes]) => nodes.length === 1 && !nodes[0].querySelector('svg'))).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(150); });
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(rendered(container, source)).toBe(formula);
  });

  it('keeps a geometric PMF updating while the static formulas retain their DOM', async () => {
    const { container } = render(<GeometricDistribution />); await flush();
    const formula = rendered(container, '\\(E[X] = \\frac{1}{p}\\)');
    const svg = container.querySelector('svg:has(rect.pmf-bar)');
    expect(svg.querySelector('rect.pmf-bar').__data__.prob).toBeCloseTo(0.3);
    mathJax.typesetPromise.mockClear();
    fireEvent.change(screen.getByRole('slider', { name: /Success probability/ }), { target: { value: '0.6' } }); await flush();
    expect(container.querySelector('svg:has(rect.pmf-bar)')).toBe(svg);
    expect(svg.querySelector('rect.pmf-bar').__data__.prob).toBeCloseTo(0.6);
    expect(rendered(container, '\\(E[X] = \\frac{1}{p}\\)')).toBe(formula);
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
  });

  it('renders changed worked-example probabilities and derived calculations', async () => {
    const { container, rerender } = render(<ExpectationVarianceWorkedExample probs={[1, 0, 0, 0, 0, 0]} />); await flush();
    expect(rendered(container, '\\[E[X] = 1.0000\\]')).toBeInTheDocument();
    mathJax.typesetPromise.mockClear();
    rerender(<ExpectationVarianceWorkedExample probs={[0, 0, 0, 0, 0, 1]} />); await flush();
    expect(rendered(container, '\\[E[X] = 6.0000\\]')).toBeInTheDocument();
    expect(rendered(container, '\\[E[X^2] = 36.0000\\]')).toBeInTheDocument();
    expect(rendered(container, '\\[\\text{Var}(X) = 0.0000\\]')).toBeInTheDocument();
    expect(rendered(container, '\\[E[X] = 1.0000\\]')).toBeUndefined();
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('updates transformation mathematics alongside actual D3 bars and selected functions', async () => {
    const { container } = render(<FunctionTransformations />); await flush();
    const source = [...container.querySelectorAll('mjx-container')].find(node => node.dataset.source.startsWith('\\(g(E[X])')).dataset.source;
    expect(rendered(container, source)).toBeInTheDocument();
    const chart = container.querySelector('svg:has(.transformed-bar)');
    expect(chart.querySelectorAll('.transformed-bar').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('radio', { name: /Cube:/ })); await flush();
    expect(rendered(container, source)).toBeUndefined();
    expect(container.querySelector('svg:has(.transformed-bar)')).toBe(chart);
    expect(chart.textContent).toContain('Y');
    fireEvent.click(screen.getByRole('radio', { name: /Custom Polynomial:/ })); await flush();
    const coefficients = screen.getAllByRole('slider');
    fireEvent.change(coefficients[0], { target: { value: '2' } }); await flush();
    expect(container.textContent).toContain('E[g(X)] = 6.800');
    fireEvent.click(screen.getByRole('radio', { name: /Square:/ })); await flush();
    expect(rendered(container, source)).toBeInTheDocument();
    expect(mathJax.typesetPromise.mock.calls.every(([nodes]) => nodes.length === 1 && !nodes[0].querySelector('svg'))).toBe(true);
  });

  it('preserves empirical formula leaves through selections, parameters, samples, and histogram DOM updates', async () => {
    const { container } = render(<EmpiricalRule />); await flush();
    const symbolSource = '\\(\\mu\\)';
    const symbol = rendered(container, symbolSource);
    const statistic = rendered(container, '\\(\\pm 1\\sigma\\)');
    expect(symbol).toBeInTheDocument(); expect(statistic).toBeInTheDocument();
    const chart = container.querySelector('svg.w-full[width]');
    expect(chart.textContent).toContain('μ = 100, σ = 15');
    fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '110' } }); await flush();
    expect(chart.textContent).toContain('μ = 110, σ = 15');
    const sigmaButton = rendered(container, '\\(\\pm2\\sigma\\)').closest('button');
    fireEvent.click(sigmaButton); await flush();
    expect(rendered(container, '\\(\\pm2\\sigma\\)')).toBeInTheDocument();
    expect(rendered(container, '\\((\\pm 2\\sigma)\\)')).toBeInTheDocument();
    mathJax.typesetPromise.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Generate' })); await flush();
    await act(async () => { await vi.advanceTimersByTimeAsync(200); }); await flush();
    expect(container.textContent).toContain('Total Samples: 4');
    expect(rendered(container, symbolSource)).toBe(symbol);
    expect(rendered(container, '\\(\\pm 1\\sigma\\)')).toBe(statistic);
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show Histogram' })); await flush();
    expect(container.querySelector('svg.w-full[width]')).toBe(chart);
    expect(chart.querySelectorAll('rect').length).toBeGreaterThan(0);
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    expect(rendered(container, '\\(\\pm 1\\sigma\\)')).toBe(statistic);
  });

  it('passes single-slash Empirical Rule parameter symbols to the real pinned TeX parser', async () => {
    const { container } = render(<EmpiricalRule />); await flush();
    for (const [command, glyph] of [['mu', '1D707'], ['sigma', '1D70E']]) {
      const captured = rendered(container, `\\(\\${command}\\)`);
      expect(captured).toBeInTheDocument();
      const actual = renderActualTeX(captured.dataset.source.slice(2, -2));
      expect(actual.querySelector('mjx-merror')).toBeNull();
      expect(actual.querySelectorAll('mjx-mi')).toHaveLength(1);
      expect(actual.querySelector(`.mjx-c${glyph}`)).not.toBeNull();
      const extraSlashControl = renderActualTeX(`\\\\${command}`);
      expect(extraSlashControl.querySelector(`.mjx-c${glyph}`)).toBeNull();
      expect(extraSlashControl.querySelectorAll('mjx-mi').length).toBeGreaterThan(1);
    }
  });

  it('renders exponential time and memoryless updates without changing its D3 SVG identity', async () => {
    const { container } = render(<ExponentialDistribution />); await flush();
    const chart = container.querySelector('svg[style]');
    fireEvent.click(screen.getByRole('button', { name: 'Next' })); await flush();
    expect(rendered(container, '\\(P(T \\leq 1.0)\\)')).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('slider')[1], { target: { value: '2' } }); await flush();
    expect(rendered(container, '\\(P(T \\leq 2.0)\\)')).toBeInTheDocument();
    expect(rendered(container, '\\(P(T \\leq 1.0)\\)')).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Next' })); await flush();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show Memoryless Property' })); await flush();
    expect(rendered(container, '\\(P(T > 3.0 | T > 1.0)\\)')).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('slider')[3], { target: { value: '3' } }); await flush();
    expect(rendered(container, '\\(P(T > 4.0 | T > 1.0)\\)')).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '2' } }); await flush();
    expect(container.textContent).toContain('0.0025');
    expect(container.querySelector('svg[style]')).toBe(chart);
    expect(chart.querySelector('path')).toBeInTheDocument();
    expect(mathJax.typesetPromise.mock.calls.every(([nodes]) => nodes.length === 1 && !nodes[0].querySelector('svg'))).toBe(true);
  });

  it('waits beyond old retry timers for startup and only renders the current StrictMode calculation', async () => {
    const startup = deferred(); mathJax.startup.promise = startup.promise;
    const { container, rerender } = render(<StrictMode><ExpectationVarianceWorkedExample probs={[1, 0, 0, 0, 0, 0]} /></StrictMode>); await flush();
    rerender(<StrictMode><ExpectationVarianceWorkedExample probs={[0, 0, 0, 0, 0, 1]} /></StrictMode>); await flush();
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    startup.resolve(); await flush();
    expect(rendered(container, '\\[E[X] = 6.0000\\]')).toBeInTheDocument();
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('cancels a distribution leaf removed before startup', async () => {
    const startup = deferred(); mathJax.startup.promise = startup.promise;
    const { unmount } = render(<ExpectationVarianceWorkedExample />); await flush();
    unmount(); startup.resolve(); await flush();
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
  });

  it('surfaces a render failure through the runtime and retries the live distribution region', async () => {
    mathJax.typesetPromise.mockRejectedValueOnce(new Error('renderer failed'));
    const { container } = render(<ExpectationVarianceWorkedExample probs={[1, 0, 0, 0, 0, 0]} />); await flush();
    expect(shared.runtime.getSnapshot()).toMatchObject({ phase: 'render' });
    expect(shared.runtime.getSnapshot().error).toBeInstanceOf(Error);
    expect(rendered(container, '\\[E[X] = 1.0000\\]')).toBeUndefined();
    await act(async () => { await shared.runtime.retry(); }); await flush();
    expect(rendered(container, '\\[E[X] = 1.0000\\]')).toBeInTheDocument();
    expect(shared.runtime.getSnapshot().error).toBeNull();
    expect(mathJax.typesetPromise).toHaveBeenCalledTimes(2);
  });

  it('keeps story D3 stages drawing without making any unnecessary mathematics request', async () => {
    const { container } = render(<DistributionStories />); await flush();
    expect(container.querySelectorAll('svg rect').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Go to Random Events in Time' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(600); }); await flush();
    expect(screen.getByRole('heading', { name: 'Random Events in Time' })).toBeInTheDocument();
    expect(container.querySelector('svg').textContent).toContain('visitors');
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    expect(mathJax.typesetClear).not.toHaveBeenCalled();
  });

  it('has no direct rendering call remaining in the nine migrated JSX modules', () => {
    const found = [];
    const visit = (value, file) => {
      if (!value || typeof value !== 'object') return;
      if (value.type === 'CallExpression' && value.callee.type === 'MemberExpression') {
        const property = value.callee.computed ? value.callee.property.value : value.callee.property.name;
        if (['typeset', 'typesetPromise', 'typesetClear'].includes(property)) found.push({ file, line: value.loc.start.line, property });
      }
      for (const child of Object.values(value)) if (Array.isArray(child)) child.forEach(item => visit(item, file)); else if (child?.type) visit(child, file);
    };
    for (const file of files) visit(espree.parse(readFileSync(resolve('src/components', file), 'utf8'), { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true }, loc: true }), file);
    expect(found).toEqual([]);
  });
});
