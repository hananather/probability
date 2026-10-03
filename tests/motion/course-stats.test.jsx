import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CourseStats from '@/components/landing/components/CourseStats';
import { installMotionEnvironment } from './environment';

vi.mock('@/hooks/useProgress', () => ({ useProgress: () => ({ overallStats: { completedChapters: 0, totalProgress: 0 } }) }));

function totals() {
  return [...screen.getByRole('region', { name: 'Course statistics' }).querySelectorAll('dd')].map(element => element.textContent.trim());
}

describe('verified curriculum totals', () => {
  let environment;
  beforeEach(() => { environment = installMotionEnvironment(); });
  afterEach(() => { environment.restore(); });

  it('keeps informational totals stable while visibility and motion preferences change', () => {
    render(<CourseStats />);
    expect(totals()).toEqual(['7', '71', '131', '7']);
    act(() => environment.setVisible(false));
    act(() => environment.setReduced(true));
    expect(totals()).toEqual(['7', '71', '131', '7']);
    act(() => environment.setVisible(true));
    act(() => environment.setReduced(false));
    expect(totals()).toEqual(['7', '71', '131', '7']);
    expect(environment.frames.size).toBe(0);
    expect(screen.getByText('Learning Modules')).toBeVisible();
    expect(screen.getByText('Chapter Quiz Questions')).toBeVisible();
  });

  it('does not announce decorative count-up ticks', () => {
    environment.setReduced(true);
    const { container } = render(<CourseStats />);
    expect(totals()).toEqual(['7', '71', '131', '7']);
    expect(container.querySelectorAll('[aria-live]')).toHaveLength(0);
  });

  it('renders the same totals before client hydration', () => {
    const markup = renderToString(<CourseStats />);
    expect(markup).toContain('131');
    expect(markup).toContain('Learning Modules');
    expect(markup).not.toContain('147');
    expect(markup).not.toContain('Hours of Content');
  });
});
