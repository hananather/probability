import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { QuickReferenceCard } from '@/components/ui/patterns/QuickReferenceCard';

it('names floating reference controls and restores focus after Escape or close', () => {
  render(<QuickReferenceCard title="Probability reference" sections={[{ title: 'Events', description: 'Event notes' }]} />);
  const toggle = screen.getByRole('button', { name: 'Toggle Probability reference' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(toggle);
  const panel = screen.getByRole('region', { name: 'Probability reference' });
  expect(toggle.getAttribute('aria-controls')).toBe(panel.id);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const close = screen.getByRole('button', { name: 'Close Probability reference' });
  close.focus();
  fireEvent.keyDown(close, { key: 'Escape' });
  expect(screen.queryByRole('region', { name: 'Probability reference' })).not.toBeInTheDocument();
  expect(toggle).toHaveFocus();
  fireEvent.click(toggle);
  fireEvent.click(screen.getByRole('button', { name: 'Close Probability reference' }));
  expect(toggle).toHaveFocus();
});
