import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NormalZScoreExplorer from '@/components/03-continuous-random-variables/3-3-normal-distribution/3-3-1-NormalZScoreExplorer';

vi.mock('@/hooks/useMathJax', () => ({ useMathJax: first => {
  const ref = React.useRef(null);
  return Array.isArray(first) ? ref : first;
} }));
vi.mock('@/components/ui/VisualizationContainer', () => ({
  VisualizationContainer: ({ children, title, description, footer }) => <div><h2>{title}</h2>{description}{children}{footer}</div>,
  VisualizationSection: ({ children }) => <section>{children}</section>,
  GraphContainer: ({ children }) => <div>{children}</div>,
  ControlGroup: ({ children }) => <div>{children}</div>,
}));

describe('Z-score explanations and parameter controls', () => {
  it('starts the explanation from a labelled parameter change without requiring a graph drag', () => {
    render(<NormalZScoreExplorer />);
    expect(screen.getByText(/Welcome! Let's see/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', { name: /Mean/ }), { target: { value: '101' } });
    expect(screen.getByText(/top curve changes shape and position/)).toBeInTheDocument();
    expect(screen.queryByText(/Welcome! Let's see/)).not.toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /Standard Deviation/ })).toHaveAccessibleName(/Standard Deviation/);
    expect(screen.getByRole('slider', { name: /x-value/ })).toHaveAccessibleName(/x-value/);
  });

  it('matches the positive and negative prediction examples in the actual calculator', () => {
    render(<NormalZScoreExplorer />);
    expect(screen.getByText('0.8413')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', { name: /Standard Deviation/ }), { target: { value: '30' } });
    expect(screen.getByText('0.6915')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', { name: /x-value/ }), { target: { value: '85' } });
    expect(screen.getByText('0.3085')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', { name: /Standard Deviation/ }), { target: { value: '15' } });
    expect(screen.getByText('0.1587')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', { name: /x-value/ }), { target: { value: '100' } });
    expect(screen.getByText('0.5000')).toBeInTheDocument();
    expect(screen.getByText(/It increases toward zero because its magnitude shrinks/)).toBeInTheDocument();
    expect(screen.getByText('Reveal the reasoning').closest('details')).toBeInTheDocument();
    expect(screen.getByText('Reveal the negative-score explanation').closest('details')).toBeInTheDocument();
  });

  it('reveals the engineering application without labelling interaction counts as mastery and resets the lesson', () => {
    render(<NormalZScoreExplorer />);
    const input = screen.getByRole('slider', { name: /x-value/ });
    for (let value = 116; value < 132; value++) fireEvent.change(input, { target: { value: String(value) } });
    expect(screen.getByText(/Engineering Application: Imagine testing steel rods/)).toBeInTheDocument();
    expect(screen.queryByText(/Standardization Mastered/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset All' }));
    expect(screen.getByText(/Welcome! Let's see/)).toBeInTheDocument();
    expect(screen.getByText('0.8413')).toBeInTheDocument();
    expect(screen.queryByText(/Engineering Application: Imagine testing steel rods/)).not.toBeInTheDocument();
  });
});
