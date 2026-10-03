import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { tutorial_1_5_1 } from '@/tutorials/chapter1';

it('renders all die outcomes and event sets in the actual tutorial step', () => {
  render(tutorial_1_5_1.find(step => step.title === 'Die Example: Events').content);
  expect(screen.getByText('A fair die has sample space S = {1, 2, 3, 4, 5, 6}')).toBeInTheDocument();
  for (const text of ['A = {2, 4, 6}', 'B = {2, 3, 5}', 'C = {5, 6}', 'D = {3, 6}']) expect(screen.getByText(text)).toBeInTheDocument();
});
