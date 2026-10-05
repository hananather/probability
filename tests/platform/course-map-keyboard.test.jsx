import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ConceptFlowchart from '@/components/shared/ConceptFlowchart';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
vi.mock('@/hooks/useMathJax', async () => {
  const React = await import('react');
  return { useMathJax: () => React.useRef(null) };
});

const chapterButton = title => screen.getByRole('button', { name: title });

describe('course map keyboard scope', () => {
  it('keeps native button and input keys outside the map available', () => {
    render(<><button>Start Learning</button><input aria-label="Search" /><ConceptFlowchart /></>);
    const start = screen.getByRole('button', { name: 'Start Learning' });
    expect(fireEvent.keyDown(start, { key: 'Enter' })).toBe(true);
    expect(fireEvent.keyDown(start, { key: ' ' })).toBe(true);
    expect(fireEvent.keyDown(screen.getByLabelText('Search'), { key: 'ArrowRight' })).toBe(true);
    expect(chapterButton('Chapter 1: Probability Foundations. Contains 5 concepts')).toHaveAttribute('aria-pressed', 'false');
  });

  it('navigates and clears concepts when the map itself has keyboard focus', () => {
    render(<ConceptFlowchart />);
    const map = screen.getByRole('group', { name: 'Course concept flowchart' });
    expect(map).toHaveAttribute('tabindex', '0');
    expect(fireEvent.keyDown(map, { key: 'ArrowRight' })).toBe(false);
    expect(chapterButton('Chapter 2: Discrete Random Variables. Contains 5 concepts')).toHaveAttribute('aria-pressed', 'true');
    expect(fireEvent.keyDown(map, { key: 'Escape' })).toBe(false);
    expect(chapterButton('Chapter 2: Discrete Random Variables. Contains 5 concepts')).toHaveAttribute('aria-pressed', 'false');
  });
});
