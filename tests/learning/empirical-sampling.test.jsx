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
});
