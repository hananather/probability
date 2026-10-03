import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Chapter1ReferenceSheet, { BasicProbabilityFormulas, ConditionalProbabilityReference } from '@/components/reference-sheets/Chapter1ReferenceSheet';

function section(name) {
  return screen.getByRole('heading', { name, level: 4 }).parentElement;
}

describe('Chapter 1 reference formula assumptions', () => {
  it('keeps all nine sections in order and qualifies the global count ratio', () => {
    render(<Chapter1ReferenceSheet />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Chapter 1: Probability Fundamentals - Complete Reference' }));
    const headings = screen.getAllByRole('heading', { level: 4 });
    expect(headings.map(heading => heading.textContent.match(/^\d+/)[0])).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
    expect(section('1. Fundamental Probability Concepts')).toHaveTextContent('finite sample space with equally likely outcomes');
  });

  it('shows the counting assumptions alongside the full and compact counting formulas', () => {
    render(<BasicProbabilityFormulas mode="embedded" />);
    const counting = section('3. Counting Techniques');
    expect(counting).toHaveTextContent('n ways for every first-task choice');
    expect(counting).toHaveTextContent('r of n distinct items without replacement, with integers 0 ≤ r ≤ n');
    expect(counting).toHaveTextContent('n ≥ 1 distinct items, treating rotations as the same arrangement and reflections as distinct');
    const compact = section('8. Complete Formula Reference');
    expect(compact).toHaveTextContent('Distinct items, without replacement; integers 0 ≤ r ≤ n');
    expect(compact).toHaveTextContent('n ≥ 1, rotations identified, reflections distinct');
    expect(section('1. Fundamental Probability Concepts')).toHaveTextContent('finite sample space with equally likely outcomes');
  });

  it('retains unconditional independence while conditioning only on positive-probability events', () => {
    render(<ConditionalProbabilityReference mode="embedded" />);
    const independence = section('5. Independence');
    expect(independence).toHaveTextContent('P(A \\cap B) = P(A) \\times P(B)');
    expect(independence).toHaveTextContent('Equivalently, if P(B) > 0:');
    expect(independence).toHaveTextContent('Equivalently, if P(A) > 0:');
    const conditional = section('4. Conditional Probability');
    expect(conditional).toHaveTextContent('The two conditional terms require P(B) > 0 and P(A) > 0, respectively');
    expect(conditional).toHaveTextContent('Requires P(A ∩ B) > 0, which also gives P(A) > 0');
    expect(conditional).toHaveTextContent('Requires P(B ∩ C) > 0');
    expect(within(conditional).getByText('Requires P(B) > 0.')).toBeInTheDocument();
  });

  it('states partition and evidence conditions for total probability and Bayes formulas', () => {
    render(<ConditionalProbabilityReference mode="embedded" />);
    const total = section('6. Law of Total Probability');
    expect(total).toHaveTextContent('partition B₁, B₂, ..., Bₙ of sample space, with P(Bᵢ) > 0');
    expect(total).toHaveTextContent('disjoint and cover S');
    expect(total).toHaveTextContent('Omit zero-probability parts when using this conditional form');
    expect(total).toHaveTextContent('Requires 0 < P(B) < 1');
    const bayes = section("7. Bayes' Theorem");
    expect(bayes).toHaveTextContent('Requires P(A) > 0 and P(B) > 0 for the displayed conditional probabilities');
    expect(bayes).toHaveTextContent('Requires 0 < P(A) < 1 and positive evidence P(B)');
  });

  it('keeps the compact conditionals self-contained and qualifies replacement independence', () => {
    const { unmount } = render(<BasicProbabilityFormulas mode="embedded" />);
    const compact = section('8. Complete Formula Reference');
    expect(compact).toHaveTextContent('P(A|B) = P(A ∩ B)/P(B), P(B) > 0');
    expect(compact).toHaveTextContent('Independence: P(A|B) = P(A), when P(B) > 0');
    expect(compact).toHaveTextContent('Law of Total: disjoint exhaustive partition, P(Bᵢ) > 0');
    expect(compact).toHaveTextContent('Bayes form: P(A) > 0 and P(B) > 0');
    unmount();
    render(<ConditionalProbabilityReference mode="embedded" />);
    const strategy = section('9. Problem Solving Approach');
    expect(strategy).toHaveTextContent('"without replacement" → update the available items after each draw');
    expect(strategy).toHaveTextContent('"with replacement" → independent when each draw is a fresh independent uniform selection');
  });
});
