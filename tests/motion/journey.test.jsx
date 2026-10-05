import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import JourneyPath from '@/components/landing/components/JourneyPath';
import FloatingSymbols from '@/components/landing/components/FloatingSymbols';
import { installMotionEnvironment } from './environment';

vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));

describe('landing journey motion', () => {
  let environment;
  beforeEach(() => { environment = installMotionEnvironment(); });
  afterEach(() => { environment.restore(); });

  it('preserves chapter colors and updates every milestone across scroll rerenders', () => {
    const { container, rerender } = render(<JourneyPath currentSection={-1} scrollProgress={0} />);
    const milestones = [...container.querySelectorAll('.milestone-circle')];
    expect(milestones).toHaveLength(7);
    expect(milestones.every(circle => circle.getAttribute('fill') === '#18181b')).toBe(true);
    const colors = milestones.map(circle => circle.getAttribute('stroke'));

    rerender(<JourneyPath currentSection={3} scrollProgress={0.5} />);
    const updated = [...container.querySelectorAll('.milestone-circle')];
    expect(updated.slice(0, 4).map(circle => circle.getAttribute('fill'))).toEqual(colors.slice(0, 4));
    expect(updated[4]).toHaveAttribute('fill', '#18181b');
    expect(updated[3]).toHaveAttribute('r', '9');
    const path = container.querySelector('.progress-path');
    expect(path).toHaveAttribute('pathLength', '1');
    expect(Number(path.getAttribute('stroke-dashoffset'))).toBeCloseTo(0.5);

    rerender(<JourneyPath currentSection={6} scrollProgress={1} />);
    expect([...container.querySelectorAll('.milestone-circle')].map(circle => circle.getAttribute('fill'))).toEqual(colors);
    rerender(<JourneyPath currentSection={-1} scrollProgress={0} />);
    expect(path).toHaveAttribute('stroke-dashoffset', '1');
    expect(path).toHaveAttribute('opacity', '0');
    expect(environment.requestFrame).not.toHaveBeenCalled();
  });

  it('keeps the pulse node stable during scrolling and stops decoration when hidden or reduced', () => {
    const { container, rerender } = render(<JourneyPath currentSection={2} scrollProgress={0.4} />);
    const pulse = container.querySelector('.probability-journey-pulse');
    expect(pulse).not.toBeNull();
    rerender(<JourneyPath currentSection={2} scrollProgress={0.45} />);
    expect(container.querySelector('.probability-journey-pulse')).toBe(pulse);
    act(() => environment.setVisible(false));
    expect(container.querySelector('.probability-journey-pulse')).toBeNull();
    act(() => environment.setVisible(true));
    expect(container.querySelector('.probability-journey-pulse')).not.toBeNull();
    act(() => environment.setReduced(true));
    expect(container.querySelector('.probability-journey-pulse')).toBeNull();
  });

  it('offers focusable chapter links and the same tooltip on focus as hover', () => {
    const { container } = render(<JourneyPath currentSection={1} scrollProgress={0.2} />);
    const link = screen.getByRole('link', { name: 'Chapter 4: Statistics' });
    expect(link).toHaveAttribute('href', '/chapter4');
    fireEvent.focus(link);
    expect(screen.getByText('Chapter 4')).toBeInTheDocument();
    expect(link.querySelector('.milestone-circle')).toHaveAttribute('r', '10');
    fireEvent.blur(link);
    expect(screen.queryByText('Chapter 4')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-current="location"]')).toHaveAttribute('href', '/chapter2');
  });

  it('pauses floating decoration in hidden tabs and removes animation for reduced motion', () => {
    const { container } = render(<FloatingSymbols />);
    const symbol = container.querySelector('.absolute');
    expect(symbol.style.animationPlayState).toBe('running');
    expect(symbol.style.animationName).toBe('probability-symbol-float');
    act(() => environment.setVisible(false));
    expect(symbol.style.animationPlayState).toBe('paused');
    expect(symbol.style.willChange).toBe('auto');
    act(() => environment.setReduced(true));
    expect(symbol.style.animationName).toBe('none');
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
