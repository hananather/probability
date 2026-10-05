import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import jStat from 'jstat';
import EmpiricalRule from '@/components/03-continuous-random-variables/3-3-normal-distribution/3-3-3-EmpiricalRule';

vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));
vi.mock('framer-motion', async () => {
  const { createElement, forwardRef } = await import('react');
  const components = new Map();
  const ignored = new Set(['initial', 'animate', 'exit', 'transition', 'layout', 'whileHover', 'whileTap']);
  return { AnimatePresence: ({ children }) => children, motion: new Proxy({}, { get: (_, tag) => {
    if (!components.has(tag)) components.set(tag, forwardRef((props, ref) => createElement(tag, { ...Object.fromEntries(Object.entries(props).filter(([key]) => !ignored.has(key))), ref })));
    return components.get(tag);
  } }) };
});
let sample;
let bounds;
beforeEach(() => {
  vi.useFakeTimers();
  bounds = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 900, height: 700, top: 0, left: 0, right: 900, bottom: 700 });
  // Deterministic draws let this test distinguish the generator's selected
  // parameters from sampling noise; D3's data joins remain real.
  sample = vi.spyOn(jStat.normal, 'sample').mockImplementation(mean => mean);
});
afterEach(() => { sample.mockRestore(); bounds.mockRestore(); vi.useRealTimers(); });
const advance = ms => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const total = () => screen.getByText(/Total Samples:/).textContent;

// Infer the displayed density from actual axis ticks and bar geometry, rather
// than reading the component's scale function or its chosen domain.
function displayedDensity(container, bar) {
  const axis = container.querySelector('svg > g > g[transform="translate(50,0)"]');
  const ticks = [...axis.querySelectorAll('.tick')].map(tick => ({
    value: Number(tick.querySelector('text').textContent),
    position: Number(/translate\(0,([^)]*)\)/.exec(tick.getAttribute('transform'))[1]),
  }));
  const low = ticks[0];
  const high = ticks.at(-1);
  // Axis tick transforms include D3's half-pixel stroke offset; bar geometry
  // does not. Anchor the zero tick to the plot baseline before interpolating.
  const baseline = Number(container.querySelector('.sample-layer').ownerSVGElement.getAttribute('height')) - 50;
  return (baseline - Number(bar.getAttribute('y'))) * (high.value - low.value) / (low.position - high.position);
}

function occupiedBars(container) {
  return [...container.querySelectorAll('.bar')].filter(bar => Number(bar.getAttribute('height')) > 0);
}

function displayedArea(container, bar, sigma = 15) {
  const pixelsPerUnit = (Number(container.querySelector('.sample-layer').ownerSVGElement.getAttribute('width')) - 80) / (8 * sigma);
  return displayedDensity(container, bar) * Number(bar.getAttribute('width')) / pixelsPerUnit;
}

describe('empirical-rule sampling and chart continuity', () => {
  it('uses current parameters during generation and starts a new sample set on a change', async () => {
    render(<EmpiricalRule />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true }));
    await advance(100);
    expect(sample).toHaveBeenLastCalledWith(100, 15);
    expect(total()).toContain('2');
    fireEvent.change(screen.getByRole('slider', { name: 'Mean', exact: true }), { target: { value: '150' } });
    fireEvent.change(screen.getByRole('slider', { name: 'Standard deviation', exact: true }), { target: { value: '5' } });
    expect(total()).toContain('0');
    await advance(100);
    expect(sample).toHaveBeenLastCalledWith(150, 5);
    expect(total()).toContain('2');
    expect(screen.getByRole('button', { name: 'Pause', exact: true })).toBeInTheDocument();
  });

  it('clears a paused old sample set without silently restarting the generator', async () => {
    render(<EmpiricalRule />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true })); await advance(100);
    fireEvent.click(screen.getByRole('button', { name: 'Pause', exact: true }));
    fireEvent.change(screen.getByRole('slider', { name: 'Mean', exact: true }), { target: { value: '120' } });
    expect(total()).toContain('0');
    sample.mockClear(); await advance(1000);
    expect(sample).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Generate', exact: true })).toBeInTheDocument();
  });

  it('preserves curve and axis DOM while sample points update', async () => {
    const { container } = render(<EmpiricalRule />);
    const curve = container.querySelector('svg > g > path');
    const tick = container.querySelector('svg .tick');
    expect(curve).not.toBeNull(); expect(tick).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true })); await advance(250);
    expect(container.querySelector('svg > g > path')).toBe(curve);
    expect(container.querySelector('svg .tick')).toBe(tick);
    expect(container.querySelectorAll('.sample-point')).toHaveLength(5);
    fireEvent.click(screen.getByRole('button', { name: 'Show Histogram', exact: true })); await advance(100);
    expect(container.querySelector('svg > g > path')).toBe(curve);
    expect(container.querySelectorAll('.sample-point')).toHaveLength(0);
    expect(container.querySelectorAll('.bar').length).toBeGreaterThan(0);
  });

  it('stops pending draws on reset and on unmount', async () => {
    const view = render(<EmpiricalRule />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true })); await advance(100);
    fireEvent.click(screen.getByRole('button', { name: 'Reset', exact: true })); sample.mockClear(); await advance(100);
    expect(sample).not.toHaveBeenCalled(); expect(total()).toContain('0');
    fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true })); await advance(100);
    view.unmount(); sample.mockClear(); await advance(100);
    expect(sample).not.toHaveBeenCalled();
  });

  it('puts a one-bin sample on the same density axis as the curve, with area one', async () => {
    const { container } = render(<EmpiricalRule />);
    const curve = container.querySelector('svg > g > path');
    const axis = container.querySelector('svg > g > g[transform="translate(50,0)"]');
    fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true })); await advance(200);
    fireEvent.click(screen.getByRole('button', { name: 'Pause', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Show Histogram', exact: true }));
    const bars = occupiedBars(container);
    expect(bars).toHaveLength(1);
    // Four samples in a width-five bin: 4 / (4 * 5) = 0.2.
    expect(displayedDensity(container, bars[0])).toBeCloseTo(0.2, 10);
    expect(displayedArea(container, bars[0])).toBeCloseTo(1, 10);
    expect(Number(bars[0].getAttribute('y'))).toBeGreaterThanOrEqual(30);
    expect(container.querySelector('svg > g > path')).toBe(curve);
    expect(container.querySelector('svg > g > g[transform="translate(50,0)"]')).toBe(axis);
    expect(container.querySelector('.sample-layer').ownerSVGElement.textContent).toContain('Probability density');
    fireEvent.click(screen.getByRole('button', { name: 'Hide Histogram', exact: true }));
    expect(axis.textContent).toContain('0.025');
  });

  it('keeps density unchanged when each observation is duplicated', async () => {
    let next = 0;
    sample.mockImplementation(() => [100, 105][next++ % 2]);
    const { container } = render(<EmpiricalRule />);
    fireEvent.click(screen.getByRole('button', { name: 'Show Histogram', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true })); await advance(100);
    const first = occupiedBars(container).map(bar => displayedDensity(container, bar));
    expect(first).toEqual([expect.closeTo(0.1, 10), expect.closeTo(0.1, 10)]);
    await advance(100);
    const second = occupiedBars(container).map(bar => displayedDensity(container, bar));
    expect(second).toEqual(first);
    expect(occupiedBars(container).reduce((sum, bar) => sum + displayedArea(container, bar), 0)).toBeCloseTo(1, 10);
  });

  it('includes out-of-view samples in the total without renormalizing the visible window', async () => {
    let next = 0;
    sample.mockImplementation(() => [100, 200, 100, -30][next++ % 4]);
    const { container } = render(<EmpiricalRule />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true })); await advance(200);
    fireEvent.click(screen.getByRole('button', { name: 'Pause', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Show Histogram', exact: true }));
    expect(total()).toContain('4');
    const bars = occupiedBars(container);
    expect(bars).toHaveLength(1);
    expect(displayedDensity(container, bars[0])).toBeCloseTo(0.1, 10);
    expect(displayedArea(container, bars[0])).toBeCloseTo(0.5, 10);
  });

  it.each([[5, 0.5], [30, 0.1]])('keeps density finite and visible at standard deviation %s', async (sigma, density) => {
    const { container } = render(<EmpiricalRule />);
    fireEvent.change(screen.getByRole('slider', { name: 'Standard deviation', exact: true }), { target: { value: String(sigma) } });
    fireEvent.click(screen.getByRole('button', { name: 'Show Histogram', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true })); await advance(50);
    fireEvent.click(screen.getByRole('button', { name: 'Pause', exact: true }));
    const bars = occupiedBars(container);
    expect(bars).toHaveLength(1);
    expect(displayedDensity(container, bars[0])).toBeCloseTo(density, 10);
    expect(displayedArea(container, bars[0], sigma)).toBeCloseTo(1, 10);
    expect(Number(bars[0].getAttribute('y'))).toBeGreaterThanOrEqual(30);
    expect(Number.isFinite(Number(bars[0].getAttribute('height')))).toBe(true);
  });

  it.each([40, 100, 160])('keeps every bin finite and retains the full mass of sample %s', async draw => {
    sample.mockReturnValue(draw);
    const { container } = render(<EmpiricalRule />);
    fireEvent.click(screen.getByRole('button', { name: 'Show Histogram', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true })); await advance(50);
    fireEvent.click(screen.getByRole('button', { name: 'Pause', exact: true }));
    const allBars = [...container.querySelectorAll('.bar')];
    expect(allBars.length).toBeGreaterThan(0);
    for (const bar of allBars) {
      for (const attribute of ['x', 'y', 'width', 'height']) expect(Number.isFinite(Number(bar.getAttribute(attribute)))).toBe(true);
      expect(Number(bar.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(bar.getAttribute('height'))).toBeGreaterThanOrEqual(0);
    }
    const bars = occupiedBars(container);
    expect(bars).toHaveLength(1);
    expect(bars.reduce((sum, bar) => sum + displayedArea(container, bar), 0)).toBeCloseTo(1, 10);
  });
});
