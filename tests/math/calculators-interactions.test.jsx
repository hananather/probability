import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import JointProbabilityCalculator from '@/components/03-continuous-random-variables/3-6-joint-distributions/3-6-3-JointProbabilityCalculator';
import DoubleIntegralCalculator from '@/components/03-continuous-random-variables/3-6-joint-distributions/3-6-6-DoubleIntegralCalculator';

// The mathematics and drag interactions are real; the external renderer is inert.
beforeEach(() => {
  window.MathJax = { typesetPromise: vi.fn().mockResolvedValue(), typesetClear: vi.fn() };
});
afterEach(() => {
  delete window.MathJax;
  vi.useRealTimers();
});

function gridEstimate() {
  const formula = screen.getByLabelText('Grid estimate').textContent;
  return Number(formula.match(/=\s*([\d.]+)/)[1]);
}

function setBounds({ x1 = 0, x2 = 1, y1 = 0, y2 = 1 } = {}) {
  for (const [label, value] of [['x₁:', x1], ['x₂:', x2], ['y₁:', y1], ['y₂:', y2]]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value: String(value) } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Calculate', exact: true }));
}

async function dragRegion(svg, start, end) {
  const overlay = svg.querySelector('rect[fill="transparent"]');
  const view = svg.ownerDocument.defaultView;
  // In jsdom the plotting group's bounding box begins at (0,0).
  const dispatch = (target, type, point) => {
    const event = new MouseEvent(type, { bubbles: true, clientX: point[0], clientY: point[1], buttons: type === 'mouseup' ? 0 : 1 });
    // jsdom 30 rejects Vitest's Window wrapper in the constructor's view field.
    Object.defineProperty(event, 'view', { value: view });
    fireEvent(target, event);
  };
  dispatch(overlay, 'mousedown', start);
  dispatch(view, 'mousemove', end);
  dispatch(view, 'mouseup', end);
  // D3 suppresses the click immediately following a drag until the next task.
  await act(() => new Promise(resolve => setTimeout(resolve, 0)));
}

describe('double-integral calculator results follow active inputs', () => {
  it('updates selected-region mass when either uniform support parameter changes', () => {
    render(<DoubleIntegralCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Uniform', exact: true }));
    setBounds();
    expect(screen.getByLabelText('Closed-form probability')).toHaveTextContent('0.500000');
    expect(gridEstimate()).toBe(0.5);
    fireEvent.change(screen.getByLabelText('a:'), { target: { value: '2' } });
    expect(screen.getByLabelText('Closed-form probability')).toHaveTextContent('0.250000');
    expect(gridEstimate()).toBe(0.25);
    fireEvent.change(screen.getByLabelText('b:'), { target: { value: '4' } });
    expect(screen.getByLabelText('Closed-form probability')).toHaveTextContent('0.125000');
    expect(gridEstimate()).toBe(0.125);
  });

  it('updates the sum after rate, method and subdivision changes without resubmitting bounds', () => {
    render(<DoubleIntegralCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Exponential', exact: true }));
    setBounds({ y2: 2 });
    const midpoint = gridEstimate();
    fireEvent.change(screen.getByLabelText('λ₁:'), { target: { value: '2' } });
    expect(gridEstimate()).toBeGreaterThan(midpoint);
    const changedRate = gridEstimate();
    fireEvent.change(screen.getByLabelText('Method:'), { target: { value: 'left' } });
    expect(gridEstimate()).toBeGreaterThan(changedRate);
    const leftFine = gridEstimate();
    fireEvent.change(screen.getByLabelText('Subdivisions:'), { target: { value: '5' } });
    expect(gridEstimate()).toBeGreaterThan(leftFine);
    expect(screen.getByText('25', { exact: true })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('λ₂:'), { target: { value: '2' } });
    expect(gridEstimate()).not.toBe(leftFine);
    expect(screen.getByLabelText('Closed-form probability')).toHaveTextContent('0.848828');
  });

  it('updates the normal estimate when correlation changes', () => {
    render(<DoubleIntegralCalculator />);
    setBounds({ x1: -1, x2: 1, y1: -1, y2: 1 });
    const correlated = gridEstimate();
    fireEvent.change(screen.getByLabelText('Correlation (ρ):'), { target: { value: '0' } });
    expect(gridEstimate()).toBeLessThan(correlated);
    expect(gridEstimate()).toBeCloseTo(0.4660649427, 3);
  });

  it.each([
    [{ x1: 2, x2: 1 }, /Lower bounds/],
    [{ y1: 2, y2: 1 }, /Lower bounds/],
    [{ x1: '' }, /finite number/],
  ])('rejects invalid manual bounds and removes the old result: %o', (bounds, message) => {
    render(<DoubleIntegralCalculator />);
    setBounds();
    expect(screen.getByLabelText('Grid estimate')).toBeInTheDocument();
    setBounds(bounds);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByLabelText('Grid estimate')).not.toBeInTheDocument();
    setBounds();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('returns zero for equal bounds and disables an empty animation', () => {
    render(<DoubleIntegralCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Exponential', exact: true }));
    setBounds({ x1: 1, x2: 1 });
    expect(gridEstimate()).toBe(0);
    expect(screen.getByLabelText('Closed-form probability')).toHaveTextContent('0.000000');
    expect(screen.getByRole('button', { name: 'Animate', exact: true })).toBeDisabled();
    expect(screen.queryByText(/Step 1 of/)).not.toBeInTheDocument();
  });

  it('shows a refinement warning when a coarse sum exceeds one', () => {
    render(<DoubleIntegralCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Exponential', exact: true }));
    fireEvent.change(screen.getByLabelText('λ₁:'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('λ₂:'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Method:'), { target: { value: 'left' } });
    fireEvent.change(screen.getByLabelText('Subdivisions:'), { target: { value: '5' } });
    setBounds({ x2: 4, y2: 4 });
    expect(gridEstimate()).toBeGreaterThan(1);
    expect(screen.getByText(/This coarse sum exceeds 1/)).toBeInTheDocument();
    expect(screen.getByLabelText('Closed-form probability')).toHaveTextContent('0.999988');
  });

  it('clears obsolete partial sums and stops animation when the method changes', () => {
    vi.useFakeTimers();
    render(<DoubleIntegralCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Exponential', exact: true }));
    setBounds();
    fireEvent.click(screen.getByRole('button', { name: 'Animate', exact: true }));
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText(/Step 4 of 225/)).toBeInTheDocument();
    expect(screen.getByText(/Running Sum:/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Method:'), { target: { value: 'right' } });
    expect(screen.getByRole('button', { name: 'Animate', exact: true })).toBeInTheDocument();
    expect(screen.queryByText(/Running Sum:/)).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByText(/Running Sum:/)).not.toBeInTheDocument();
  });

  it('retains contours and grid nodes and skips static typesetting across animation ticks', async () => {
    vi.useFakeTimers();
    render(<DoubleIntegralCalculator />);
    setBounds();
    await act(async () => vi.advanceTimersByTime(150));
    const svg = screen.getByLabelText('Select a rectangular integration region');
    const contour = svg.querySelector('.density-contours path');
    const firstCell = svg.querySelector('.integration-rect');
    const renderCalls = window.MathJax.typesetPromise.mock.calls.length;
    expect(contour).not.toBeNull();
    expect(svg.querySelectorAll('.integration-rect')).toHaveLength(225);
    fireEvent.click(screen.getByRole('button', { name: 'Animate', exact: true }));
    expect(svg.querySelectorAll('.integration-rect')).toHaveLength(1);
    await act(async () => vi.advanceTimersByTime(300));
    expect(svg.querySelectorAll('.integration-rect')).toHaveLength(4);
    expect(svg.querySelector('.density-contours path')).toBe(contour);
    expect(svg.querySelector('.integration-rect')).toBe(firstCell);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(renderCalls);
    fireEvent.change(screen.getByLabelText('Method:'), { target: { value: 'right' } });
    expect(svg.querySelector('.density-contours path')).toBe(contour);
    fireEvent.change(screen.getByLabelText('Correlation (ρ):'), { target: { value: '0' } });
    expect(svg.querySelector('.density-contours path')).not.toBe(contour);
  });

  it('calculates a dragged rectangle and updates its normal model without another drag', async () => {
    render(<DoubleIntegralCalculator />);
    // Plot dimensions 580 × 600, normal domain [-3,3] in each coordinate.
    await dragRegion(screen.getByLabelText('Select a rectangular integration region'), [580 / 3, 200], [580 * 2 / 3, 400]);
    expect(screen.getByLabelText('x₁:')).toHaveValue(-1);
    expect(screen.getByLabelText('y₂:')).toHaveValue(1);
    const first = gridEstimate();
    fireEvent.change(screen.getByLabelText('Correlation (ρ):'), { target: { value: '0' } });
    expect(gridEstimate()).toBeLessThan(first);
  });
});

describe('joint probability calculator results follow active inputs', () => {
  it('recomputes the dragged rectangle after rates, subdivisions, and model changes', async () => {
    render(<JointProbabilityCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Exponential', exact: true }));
    // Plot dimensions 500 × 500 with domain [0,4]; select [0,1]².
    await dragRegion(screen.getByLabelText('Select a rectangular probability region'), [0, 375], [125, 500]);
    expect(screen.getByLabelText('Closed-form probability')).toHaveTextContent('0.4911');
    const initial = gridEstimate();
    fireEvent.change(screen.getByLabelText('λ₁:'), { target: { value: '2' } });
    expect(gridEstimate()).toBeGreaterThan(initial);
    const rate1 = gridEstimate();
    fireEvent.change(screen.getByLabelText('λ₂:'), { target: { value: '2' } });
    expect(gridEstimate()).toBeGreaterThan(rate1);
    const coarse = gridEstimate();
    fireEvent.change(screen.getByLabelText('Integration Steps:'), { target: { value: '50' } });
    expect(gridEstimate()).toBeGreaterThan(coarse);
    fireEvent.click(screen.getByRole('button', { name: 'Uniform', exact: true }));
    expect(screen.getByLabelText('Closed-form probability')).toHaveTextContent('0.2500');
    expect(gridEstimate()).toBe(0.25);
  });

  it('updates an already selected normal rectangle when correlation changes', async () => {
    render(<JointProbabilityCalculator />);
    await dragRegion(screen.getByLabelText('Select a rectangular probability region'), [500 / 3, 500 / 3], [500 * 2 / 3, 500 * 2 / 3]);
    const correlated = gridEstimate();
    fireEvent.change(screen.getByLabelText('Correlation (ρ):'), { target: { value: '0' } });
    expect(gridEstimate()).toBeLessThan(correlated);
    expect(gridEstimate()).toBeCloseTo(0.4660649427, 3);
  });
});

it('keeps narrow nonzero input bounds visible in the instructional interval', () => {
  render(<DoubleIntegralCalculator />);
  fireEvent.click(screen.getByRole('button', { name: 'Exponential', exact: true }));
  setBounds({ x1: 0.001, x2: 0.002, y1: 0, y2: 1 });
  expect(screen.getByText(/where R is the rectangular region/)).toHaveTextContent('[0.001, 0.002] × [0, 1]');
  expect(screen.getByLabelText('Grid estimate')).toHaveTextContent('0.000930');
  expect(screen.getByLabelText('Closed-form probability')).toHaveTextContent('0.000931');
});
