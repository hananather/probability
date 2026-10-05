import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChapterCard from '@/components/landing/components/ChapterCard';
import { RangeSlider, SliderPresets } from '@/components/ui/RangeSlider';

const progress = vi.hoisted(() => ({
  chapterProgress: { lastVisited: null }, isCompleted: false, isInProgress: false,
  isNotStarted: true, progressPercentage: 0, loading: false, start: vi.fn(),
}));
vi.mock('@/hooks/useProgress', () => ({ useChapterProgress: () => progress }));
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));
vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
const chapter = { title: 'Probability Foundations', description: 'Explore outcomes and events', sections: 11, duration: '2 hours' };
const Visualization = ({ isActive }) => <span data-testid="visualization" data-active={String(isActive)} />;

describe('chapter navigation', () => {
  it('makes the visible chapter CTA one native link, even if progress cannot be saved', async () => {
    progress.start.mockRejectedValueOnce(new Error('Storage unavailable'));
    const { container } = render(<ChapterCard chapter={chapter} index={0} visualization={Visualization} />);
    const link = screen.getByRole('link', { name: 'Begin Learning: Chapter 1, Probability Foundations' });
    expect(link).toHaveAttribute('href', '/chapter1');
    expect(screen.getByText('Begin Learning')).toBeInTheDocument();
    expect(container.querySelectorAll('a')).toHaveLength(1);
    expect(container.querySelector('a button')).toBeNull();
    link.addEventListener('click', event => event.preventDefault());
    fireEvent.click(link);
    expect(progress.start).toHaveBeenCalledOnce();
    await Promise.resolve();
    expect(link).toHaveAttribute('href', '/chapter1');
  });

  it('leaves locked chapters unavailable and decorations static for reduced motion', () => {
    render(<ChapterCard chapter={chapter} index={0} visualization={Visualization} isLocked />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Unlock Required')).toBeInTheDocument();
    expect(screen.getByTestId('visualization')).toHaveAttribute('data-active', 'false');
  });
});

describe('shared range labels', () => {
  it('associates each label with its own slider and exposes the displayed units', () => {
    const change = vi.fn();
    render(<><RangeSlider label="Probability" value={0.25} onChange={change} {...SliderPresets.probability} /><RangeSlider label="Samples" value={12} onChange={change} {...SliderPresets.samples} /></>);
    const probability = screen.getByRole('slider', { name: 'Probability:' });
    expect(probability).toHaveAttribute('aria-valuetext', '25%');
    expect(screen.getByLabelText('Samples:').id).not.toBe(probability.id);
    fireEvent.change(probability, { target: { value: '0.6' } });
    expect(change).toHaveBeenCalledWith(0.6);
  });
});

describe('homepage FAQ disclosure', () => {
  it('only exposes answers after their named disclosure is expanded', async () => {
    const { default: FAQSection } = await import('@/components/landing/sections/FAQSection');
    render(<FAQSection />);
    const first = screen.getByRole('button', { name: "What if I'm struggling with the math prerequisites?" });
    const second = screen.getByRole('button', { name: 'How long does each chapter take to complete?' });
    const answer = document.getElementById(first.getAttribute('aria-controls'));
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(answer).not.toBeVisible();
    fireEvent.click(first);
    expect(answer).toBeVisible();
    fireEvent.click(second);
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(answer).not.toBeVisible();
    expect(second).toHaveAttribute('aria-expanded', 'true');
  });
});
