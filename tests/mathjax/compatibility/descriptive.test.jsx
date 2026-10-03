import React, { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { select, selection } from 'd3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CentralTendencyIntro from '@/components/04-descriptive-statistics-sampling/4-2-central-tendency/4-2-1-CentralTendencyIntro';
import { StatisticalAnalysis } from '@/components/04-descriptive-statistics-sampling/4-2-central-tendency/4-2-2-DescriptiveStatsJourney';
import DescriptiveStatisticsFoundations from '@/components/04-descriptive-statistics-sampling/4-2-central-tendency/4-2-3-DescriptiveStatisticsFoundations';
import MathematicalFoundations from '@/components/04-descriptive-statistics-sampling/4-2-central-tendency/4-2-4-MathematicalFoundations';
import FDistributionWorkedExample from '@/components/04-descriptive-statistics-sampling/4-7-advanced-distributions/4-7-4-FDistributionWorkedExample';
import SharedCoinFlipSimulation from '@/components/shared/CoinFlipSimulation';
import OverviewCoinFlipSimulation from '@/components/overview-components/CoinFlipSimulation';
import { MathJaxProvider } from '@/components/shared/MathJaxProvider';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { deferred, renderer, tick } from '../runtime/fixtures';

const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({ ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime }));

// Replace only authored formula leaves to exercise DOM ownership, not TeX parsing or layout.
function formulaLeaves(nodes) {
  for (const root of nodes) {
    for (const leaf of [root, ...root.querySelectorAll('span, div')]) {
      if (leaf.childElementCount || !/^\\[[(]/.test(leaf.textContent)) continue;
      const math = document.createElement('mjx-container');
      math.dataset.source = leaf.textContent;
      math.textContent = 'Rendered mathematics';
      leaf.replaceChildren(math);
    }
  }
  return Promise.resolve();
}
const sources = container => [...container.querySelectorAll('mjx-container')].map(node => node.dataset.source);
const flush = () => act(async () => { await tick(); });
const click = async element => { fireEvent.click(element); await flush(); };
const advance = milliseconds => act(async () => {
  if (vi.isFakeTimers()) await vi.advanceTimersByTimeAsync(milliseconds);
  else await new Promise(resolve => setTimeout(resolve, milliseconds));
  await tick();
});

describe('descriptive statistics and coin simulations use the canonical mathematics lane', () => {
  let mathJax;
  let startup;
  let transformDescriptor;
  let transitionMethods;
  beforeEach(() => {
    vi.useFakeTimers();
    startup = deferred();
    mathJax = renderer(startup.promise);
    mathJax.typesetPromise.mockImplementation(formulaLeaves);
    window.MathJax = mathJax;
    shared.runtime = createMathJaxRuntime();
    // D3 keeps a module-level clock across fake-timer cases. Keep its real data
    // joins and SVGs while settling decorative transitions immediately.
    vi.spyOn(selection.prototype, 'transition').mockImplementation(function () { return this; });
    transitionMethods = new Map(['duration', 'delay', 'ease'].map(name => [name, Object.getOwnPropertyDescriptor(selection.prototype, name)]));
    transitionMethods.forEach((_descriptor, name) => Object.defineProperty(selection.prototype, name, { configurable: true, value() { return this; } }));
    vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 800, height: 700, x: 0, y: 0, top: 0, left: 0, bottom: 700, right: 800 });
    transformDescriptor = Object.getOwnPropertyDescriptor(SVGElement.prototype, 'transform');
    Object.defineProperty(SVGElement.prototype, 'transform', { configurable: true, value: { baseVal: { consolidate: () => null } } });
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
  });
  afterEach(async () => {
    document.querySelectorAll('svg').forEach(svg => select(svg).selectAll('*').interrupt());
    cleanup(); shared.runtime.dispose(); await tick();
    delete window.MathJax;
    if (transformDescriptor) Object.defineProperty(SVGElement.prototype, 'transform', transformDescriptor);
    else delete SVGElement.prototype.transform;
    transitionMethods.forEach((descriptor, name) => {
      if (descriptor) Object.defineProperty(selection.prototype, name, descriptor);
      else delete selection.prototype[name];
    });
    vi.useRealTimers();
  });

  it('renders only the latest F example after delayed startup and rapid input changes under StrictMode', async () => {
    const { container, rerender, unmount } = render(<StrictMode><FDistributionWorkedExample /></StrictMode>);
    await flush();
    rerender(<StrictMode><FDistributionWorkedExample n1={11} s1_squared={3} s2_squared={2} alpha={0.1} /></StrictMode>); await flush();
    rerender(<StrictMode><FDistributionWorkedExample n1={21} s1_squared={4} s2_squared={2} alpha={0.02} /></StrictMode>); await flush();
    await advance(1000);
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { startup.resolve(); await tick(); });
    expect(sources(container)).toContain('\\[F = \\frac{s_1^2}{s_2^2} = \\frac{4}{2} = 2.000\\]');
    expect(container.textContent).toContain('ν₁ = n₁ - 1 = 21 - 1 = 20');
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    const target = mathJax.typesetPromise.mock.calls[0][0][0];
    await advance(1000);
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    unmount(); await flush();
    expect(mathJax.typesetClear).toHaveBeenCalledWith([target]);
  });

  it('reports F rendering failure through the shared provider and retries explicitly', async () => {
    mathJax.typesetPromise.mockRejectedValueOnce(new Error('render failed'));
    const { unmount } = render(<MathJaxProvider><FDistributionWorkedExample /></MathJaxProvider>);
    await act(async () => { startup.resolve(); await tick(); });
    expect(screen.getByRole('button', { name: 'Retry mathematics' })).toBeEnabled();
    await advance(1000);
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    await click(screen.getByRole('button', { name: 'Retry mathematics' }));
    expect(screen.queryByRole('status', { name: 'Mathematics rendering' })).toBeNull();
    expect(mathJax.typesetPromise).toHaveBeenCalledTimes(2);
    unmount(); await flush();
    expect(shared.runtime.getSnapshot().error).toBeNull();
  });

  it.each([
    ['shared', SharedCoinFlipSimulation], ['overview', OverviewCoinFlipSimulation],
  ])('renders current %s coin formulas after delayed startup and retains its actual D3 chart through updates', async (_name, Component) => {
    const { container, unmount } = render(<StrictMode><Component /></StrictMode>); await flush();
    const svg = container.querySelector('svg[style]');
    expect(svg.querySelectorAll('.observed .bar-group')).toHaveLength(2);
    await click(screen.getByRole('button', { name: 'Single Trial' }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '0.8' } }); await flush();
    await advance(600);
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { startup.resolve(); await tick(); });
    expect(sources(container)).toContain('\\(\\hat{p} = 1.000\\)');
    expect(sources(container)).toContain('\\(p = 0.8\\)');
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(container.querySelector('svg[style]')).toBe(svg);
    expect(svg.querySelector('.observed .count')).toHaveTextContent('n = 1');
    mathJax.typesetPromise.mockClear();
    await click(screen.getByRole('button', { name: 'Single Trial' }));
    await advance(600);
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(svg.querySelector('.observed .count')).toHaveTextContent('n = 2');
    expect(container.querySelector('svg[style]')).toBe(svg);
    const target = mathJax.typesetPromise.mock.calls[0][0][0];
    unmount(); await flush();
    expect(mathJax.typesetClear).toHaveBeenCalledWith([target]);
  });

  it('mounts statistical analysis after empty data and processes data, stage and fence changes', async () => {
    const data = [1, 2, 3, 4, 10];
    const { rerender } = render(<StatisticalAnalysis data={[]} activeStage={0} />); await flush();
    await act(async () => { startup.resolve(); await tick(); });
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    rerender(<StatisticalAnalysis data={data} activeStage={0} />); await flush();
    expect(screen.getByText('x̄ = Σxᵢ/n = 20.0/5 = 4.00')).toBeInTheDocument();
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    rerender(<StatisticalAnalysis data={data} activeStage={3} outlierMultiplier={1.5} />); await flush();
    expect(screen.getByRole('heading', { name: 'Outlier Detection (1.5×IQR Rule)' })).toBeInTheDocument();
    mathJax.typesetPromise.mockClear();
    rerender(<StatisticalAnalysis data={data} activeStage={3} outlierMultiplier={3} />); await flush();
    expect(screen.getByText('No values beyond these IQR fences')).toBeInTheDocument();
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(mathJax.typesetPromise.mock.calls[0][0][0]).toHaveTextContent('Outlier Detection (3×IQR Rule)');
    await advance(1000);
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it.each([
    ['central tendency', CentralTendencyIntro, /Arithmetic Mean.*Next/, 'Arithmetic Mean', '\\(\\bar{x}'],
    ['descriptive foundations', DescriptiveStatisticsFoundations, /Quartiles.*→/, 'Quartiles & Five-Number Summary', '\\(\\text{IQR}'],
  ])('renders the late-mounted %s section after its actual exit transition', async (_name, Component, nextName, heading, formulaPrefix) => {
    // Framer's actual RAF animation runs on real time; no motion component is mocked.
    vi.useRealTimers();
    const { container, unmount } = render(<Component />); await flush();
    const svg = container.querySelector('svg.w-full.h-full');
    await advance(30);
    await click(screen.getByRole('button', { name: nextName }));
    await advance(800);
    expect(screen.getByRole('heading', { name: heading, level: 3 })).toBeInTheDocument();
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { startup.resolve(); await tick(); });
    expect(sources(container).some(source => source.startsWith(formulaPrefix))).toBe(true);
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(container.querySelector('svg.w-full.h-full')).toBe(svg);
    expect(svg.children.length).toBeGreaterThan(0);
    const target = mathJax.typesetPromise.mock.calls[0][0][0];
    expect(target).toHaveTextContent(heading);
    await advance(1000);
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    unmount(); await flush();
    expect(mathJax.typesetClear).toHaveBeenCalledWith([target]);
  });

  it('keeps mathematical navigation and mean calculations while actual Focus controls swap math owners', async () => {
    const complete = vi.fn();
    const { container } = render(<MathematicalFoundations onComplete={complete} />);
    await act(async () => { startup.resolve(); await tick(); });
    expect(sources(container).some(source => source.includes('Central Tendency'))).toBe(true);
    await click(screen.getByRole('button', { name: /Arithmetic Mean.*Next/ }));
    const svg = container.querySelector('svg');
    expect(svg.querySelectorAll('.data-point')).toHaveLength(5);
    fireEvent.change(screen.getByRole('slider', { name: 'New Value:' }), { target: { value: '10' } }); await flush();
    await click(screen.getByRole('button', { name: 'Add Point' }));
    expect(svg.querySelectorAll('.data-point')).toHaveLength(6);
    expect(svg.textContent).toContain('μ = 7.50');
    expect(container.querySelector('svg')).toBe(svg);
    await click(screen.getByRole('button', { name: 'Enable Focus' }));
    expect(screen.getByRole('heading', { name: 'mean - Key Concepts' })).toBeInTheDocument();
    expect(sources(container)).toContain('\\(\\bar{x} = \\frac{\\sum x_i}{n}\\)');
    expect(screen.getByText('Section 2 of 8')).toBeInTheDocument();
    await click(screen.getByRole('button', { name: 'Exit Focus Mode' }));
    expect(screen.getByText('Section 2 of 8')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
    const completedPasses = mathJax.typesetPromise.mock.calls.length;
    await advance(1000);
    expect(mathJax.typesetPromise).toHaveBeenCalledTimes(completedPasses);
  });

  it('renders every mathematical section, preserves its data controls and records completion once', async () => {
    const complete = vi.fn();
    const { container } = render(<MathematicalFoundations onComplete={complete} />);
    await act(async () => { startup.resolve(); await tick(); });
    const sections = [
      ['Arithmetic Mean', '\\(\\bar{x}'], ['Median', '\\(P(X'],
      ['Mode', '\\(\\text{mode}'], ['Comparative Analysis', '\\(\\text{mean}'],
      ['Other Means', '\\(GM'], ['Minimization Properties', '\\(\\bar{x} = \\arg\\min'],
      ['Data Type Appropriateness', null],
    ];
    for (const [name, formulaPrefix] of sections) {
      await click(screen.getByRole('button', { name: new RegExp(`${name}.*Next`) }));
      if (formulaPrefix) expect(sources(container).some(source => source.startsWith(formulaPrefix))).toBe(true);
      const before = mathJax.typesetPromise.mock.calls.length;
      if (name === 'Median') await click(screen.getByRole('button', { name: 'Add Random Value' }));
      if (name === 'Mode') await click(screen.getByRole('button', { name: 'Add 2' }));
      if (name === 'Comparative Analysis') { fireEvent.change(screen.getByRole('slider', { name: 'Distribution Skewness:' }), { target: { value: '0.5' } }); await flush(); }
      if (name === 'Minimization Properties') { fireEvent.change(screen.getByRole('slider', { name: 'Test value (c):' }), { target: { value: '8' } }); await flush(); }
      if (['Median', 'Mode', 'Comparative Analysis', 'Minimization Properties'].includes(name)) expect(mathJax.typesetPromise.mock.calls.length).toBeGreaterThan(before);
      expect(shared.runtime.getSnapshot().error).toBeNull();
    }
    await click(screen.getByRole('button', { name: 'Complete Section' }));
    await click(screen.getByRole('button', { name: '✓ Completed' }));
    expect(complete).toHaveBeenCalledOnce();
    const completedPasses = mathJax.typesetPromise.mock.calls.length;
    await advance(1000);
    expect(mathJax.typesetPromise).toHaveBeenCalledTimes(completedPasses);
  });

  it.each([
    ['intuitive introduction', () => <CentralTendencyIntro />],
    ['statistical analysis', () => <StatisticalAnalysis data={[1, 2, 3]} activeStage={0} />],
    ['descriptive foundations', () => <DescriptiveStatisticsFoundations />],
    ['mathematical foundations', () => <MathematicalFoundations />],
    ['F example', () => <FDistributionWorkedExample />],
    ['shared coin simulation', () => <SharedCoinFlipSimulation />],
    ['overview coin simulation', () => <OverviewCoinFlipSimulation />],
  ])('cancels pending %s mathematics when the actual component unmounts before startup', async (_name, view) => {
    const { unmount } = render(<StrictMode>{view()}</StrictMode>); await flush();
    unmount(); await flush();
    await act(async () => { startup.resolve(); await tick(); });
    await advance(1000);
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    expect(shared.runtime.getSnapshot().error).toBeNull();
  });
});
