import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StatisticalInference from '@/components/05-estimation/5-1-StatisticalInference';

vi.mock('@/components/reference-sheets/Chapter5ReferenceSheet', () => ({ Chapter5ReferenceSheet: () => null }));

describe('statistical inference learning modes', () => {
  it('activates exploration and preserves learner state across mode changes', () => {
    render(<StatisticalInference />);
    expect(screen.queryByText('Example: Baseball Player Heights')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Exploration Interactive demonstrations' }));
    expect(screen.getByText('Central Limit Theorem Demonstration')).toBeVisible();
    expect(screen.getByText('Example: Baseball Player Heights')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Flip: Heads' }));
    fireEvent.click(screen.getByRole('button', { name: 'Medical Research' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show Calculation Steps' }));
    expect(screen.getByText('Evidence: 1 heads, 0 tails')).toBeVisible();
    expect(screen.getByText('Drug Efficacy')).toBeVisible();
    expect(screen.queryByText(/1\. Calculate mean:/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Practice Apply your knowledge' }));
    expect(screen.queryByText('Evidence: 1 heads, 0 tails')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Exploration Interactive demonstrations' }));
    expect(screen.getByText('Evidence: 1 heads, 0 tails')).toBeVisible();
    expect(screen.getByText('Drug Efficacy')).toBeVisible();
    expect(screen.queryByText(/1\. Calculate mean:/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Foundations Core concepts and theory' }));
    fireEvent.click(screen.getByRole('button', { name: 'Exploration Interactive demonstrations' }));
    expect(screen.getByText('Evidence: 1 heads, 0 tails')).toBeVisible();
  });
});
