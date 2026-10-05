import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import VisualExperiments from '@/components/01-introduction-to-probabilities/01-foundations/Tab4InteractiveTab-StaticVisual';

vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));

it('provides valid single-backslash math delimiters in the concept cards', () => {
  render(<VisualExperiments />);
  fireEvent.click(screen.getByRole('button', { name: 'Key Concepts' }));
  const concepts = screen.getByRole('heading', { name: 'Key Probability Concepts' }).parentElement;
  const formulas = [...concepts.querySelectorAll('span')].map(element => element.textContent).filter(text => text.includes('\\'));
  expect(formulas).toHaveLength(5);
  expect(formulas).toContain('\\[S = \\{\\text{all possible pebbles}\\}\\]');
  expect(formulas).toContain('\\[P(A^c) = 1 - P(A)\\]');
  for (const text of formulas) expect(text).not.toContain('\\\\');
});
