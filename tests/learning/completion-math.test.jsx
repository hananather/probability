import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { renderer, tick } from '../mathjax/runtime/fixtures';

const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({ ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime }));

vi.mock('next/navigation', () => ({ usePathname: () => '/test-completion-math' }));
vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));

function FormulaContent({ isCompleted }) {
  return (
    <div data-completed={isCompleted}>
      <span dangerouslySetInnerHTML={{ __html: '\\[P(A)=1/2\\]' }} />
      <details><summary>Show reasoning</summary>Two of four equally likely outcomes.</details>
    </div>
  );
}
const sections = [{ id: 'probability', title: 'Probability', content: FormulaContent }];

beforeEach(() => {
  vi.useFakeTimers();
  // MathJax replaces TeX DOM with rendered output. A React update can replace
  // that output with the original source even when the formula is unchanged.
  window.MathJax = {
    ...renderer(),
    typesetPromise: vi.fn(nodes => {
      for (const node of nodes) for (const span of node.querySelectorAll('span')) {
        if (span.textContent.startsWith('\\[')) span.innerHTML = '<mjx-container>Rendered probability</mjx-container>';
      }
      return Promise.resolve();
    }),
  };
  shared.runtime = createMathJaxRuntime();
});
afterEach(async () => { cleanup(); shared.runtime.dispose(); await tick(); delete window.MathJax; vi.useRealTimers(); });

describe('completion preserves rendered mathematics', () => {
  it('retypesets after the completion prop changes without losing native disclosure behavior', async () => {
    const completed = vi.fn();
    const { container } = render(<SectionBasedContent title="Calculation" sections={sections} onComplete={completed} showBackToHub={false} />);
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(container.querySelectorAll('mjx-container')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Complete Section' }));
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(completed).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: '✓ Completed' })).toBeInTheDocument();
    expect(container.querySelectorAll('mjx-container')).toHaveLength(1);
    expect(screen.queryByText('\\[P(A)=1/2\\]')).not.toBeInTheDocument();
    expect(screen.getByText('Show reasoning').closest('details')).toBeInTheDocument();
  });

  it('keeps unchanged formula DOM through an unrelated parent callback update', async () => {
    const { container, rerender } = render(<SectionBasedContent title="Calculation" sections={sections} onComplete={() => {}} showBackToHub={false} />);
    await act(async () => { await vi.runAllTimersAsync(); });
    const rendered = container.querySelector('mjx-container');
    expect(rendered).toBeInTheDocument();
    rerender(<SectionBasedContent title="Calculation" sections={sections} onComplete={() => {}} showBackToHub={false} />);
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(container.querySelector('mjx-container')).toBe(rendered);
  });
});
