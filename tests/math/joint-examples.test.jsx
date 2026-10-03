import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JointDistributionWorkedExamples } from '@/components/ui/patterns/JointDistributionExamples';

beforeEach(() => {
  window.MathJax = { typesetPromise: vi.fn().mockResolvedValue(), typesetClear: vi.fn() };
});
afterEach(() => { delete window.MathJax; });

// Read the actual lesson formulas. The external typesetter is inert; numerical
// integration below is independent of the arithmetic displayed in the lesson.
function formula(container, prefix) {
  const matches = Array.from(container.querySelectorAll('span, div')).filter(node =>
    node.childElementCount === 0 && node.textContent.trim().startsWith(prefix)
  );
  expect(matches).toHaveLength(1);
  return matches[0].textContent.trim();
}

function integrate(f, lower, upper, subdivisions = 64) {
  const step = (upper - lower) / subdivisions;
  let sum = f(lower) + f(upper);
  for (let index = 1; index < subdivisions; index++) {
    sum += (index % 2 === 0 ? 2 : 4) * f(lower + index * step);
  }
  return step * sum / 3;
}

function triangleMass(coefficient) {
  return integrate(x => integrate(y => coefficient * x * y, 0, 1 - x), 0, 1);
}

describe('joint-distribution worked examples', () => {
  it('presents a normalized triangular density and consistent normalized marginals', () => {
    const { container } = render(<JointDistributionWorkedExamples />);
    const density = formula(container, '\\[f_{X,Y}(x,y) =');
    const coefficient = Number(density.match(/(\d+)xy\s*&/)[1]);
    expect(density).toContain('0 \\leq x \\leq 1, 0 \\leq y \\leq 1-x');
    expect(triangleMass(coefficient)).toBeCloseTo(1, 12);
    fireEvent.click(screen.getByRole('button', { name: 'Show Solution' }));

    const marginalX = Number(formula(container, '\\[f_X(x) =').match(/= (\d+)x\(1-x\)\^2/)[1]);
    const marginalY = Number(formula(container, '\\[f_Y(y) =').match(/= (\d+)y\(1-y\)\^2/)[1]);
    expect(integrate(x => marginalX * x * (1 - x) ** 2, 0, 1)).toBeCloseTo(1, 12);
    expect(integrate(y => marginalY * y * (1 - y) ** 2, 0, 1)).toBeCloseTo(1, 12);
    for (const value of [0, 0.05, 0.3, 0.7, 0.95, 1]) {
      expect(marginalX * value * (1 - value) ** 2)
        .toBeCloseTo(integrate(y => coefficient * value * y, 0, 1 - value), 12);
      expect(marginalY * value * (1 - value) ** 2)
        .toBeCloseTo(integrate(x => coefficient * x * value, 0, 1 - value), 12);
    }
    expect(screen.getByText(/Both marginal densities are zero outside \[0, 1\]/)).toBeInTheDocument();
  });

  it('preserves the normalized square example and its independence factorization', () => {
    const { container } = render(<JointDistributionWorkedExamples />);
    fireEvent.click(screen.getByRole('button', { name: 'Example 2' }));
    const density = formula(container, '\\[f_{X,Y}(x,y) =');
    const coefficient = Number(density.match(/(\d+)xy\s*&/)[1]);
    expect(density).toContain('0 \\leq x \\leq 1, 0 \\leq y \\leq 1 ');
    expect(integrate(x => integrate(y => coefficient * x * y, 0, 1), 0, 1)).toBeCloseTo(1, 12);
    fireEvent.click(screen.getByRole('button', { name: 'Show Solution' }));
    const marginalX = Number(formula(container, '\\[f_X(x) =').match(/= (\d+)x/)[1]);
    const marginalY = Number(formula(container, '\\[f_Y(y) =').match(/= (\d+)y/)[1]);
    for (const [x, y] of [[0, 0.7], [0.2, 0.8], [0.7, 0.3], [1, 1]]) {
      expect(marginalX * x * marginalY * y).toBeCloseTo(coefficient * x * y, 12);
    }
    expect(screen.getByText(/product equals the joint density on the whole plane/)).toBeInTheDocument();
    expect(screen.getByText('✓ Yes, X and Y are independent!')).toBeInTheDocument();
  });

  it('uses the corrected marginal and normalized conditional density with an exact answer and rounded approximation', () => {
    const { container } = render(<JointDistributionWorkedExamples />);
    fireEvent.click(screen.getByRole('button', { name: 'Example 3' }));
    const density = formula(container, '\\[f_{X,Y}(x,y) =');
    const coefficient = Number(density.match(/= (\d+)xy/)[1]);
    expect(triangleMass(coefficient)).toBeCloseTo(1, 12);
    expect(density).toContain('0 \\text{ otherwise}');
    fireEvent.click(screen.getByRole('button', { name: 'Show Solution' }));

    const marginal = Number(formula(container, '\\(f_X(0.3) =').match(/= ([\d.]+)\\\)/)[1]);
    expect(marginal).toBeCloseTo(1.764, 12);
    expect(marginal).toBeCloseTo(integrate(y => coefficient * 0.3 * y, 0, 0.7), 12);
    const conditional = formula(container, '\\[f_{Y|X}(y|0.3) =');
    const ratio = conditional.match(/\\frac\{([\d.]+)y\}\{([\d.]+)\}/);
    const conditionalPDF = y => Number(ratio[1]) * y / Number(ratio[2]);
    expect(Number(ratio[1])).toBeCloseTo(coefficient * 0.3, 12);
    expect(Number(ratio[2])).toBe(marginal);
    expect(integrate(conditionalPDF, 0, 0.7)).toBeCloseTo(1, 12);
    const probability = integrate(conditionalPDF, 0.5, 0.7);
    expect(probability).toBeCloseTo(24 / 49, 12);

    const finalCalculation = formula(container, '\\[= ');
    const answer = finalCalculation.match(/\\frac\{(\d+)\}\{(\d+)\} \\approx ([\d.]+)/);
    expect(Number(answer[1]) / Number(answer[2])).toBeCloseTo(probability, 12);
    expect(Math.abs(Number(answer[3]) - probability)).toBeLessThan(0.0005);
    expect(screen.getByText(/Conditioning on this continuous value uses the conditional density/)).toBeInTheDocument();
    expect(formula(container, '\\(f_X(0.3) >')).toContain('> 0');
    expect(screen.getByText(/and zero otherwise/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Example 1' }));
    expect(screen.getByRole('button', { name: 'Show Solution' })).toBeInTheDocument();
    expect(screen.queryByText(/f_X\(0\.3\) =/)).not.toBeInTheDocument();
  });
});
