import React, { Suspense } from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FoundationsPage from '@/app/chapter1/01-foundations/page';
import FoundationsTab from '@/components/01-introduction-to-probabilities/01-foundations/Tab1FoundationsTab';
import WorkedExamples from '@/components/01-introduction-to-probabilities/01-foundations/Tab2WorkedExamplesTab';
import QuickReference from '@/components/01-introduction-to-probabilities/01-foundations/Tab3QuickReferenceTab';
import VisualExperiments from '@/components/01-introduction-to-probabilities/01-foundations/Tab4InteractiveTab-StaticVisual';
import VennDiagram from '@/components/01-introduction-to-probabilities/01-foundations/Tab4InteractiveTab-VennDiagram';
import MathematicalAnalysis from '@/components/01-introduction-to-probabilities/01-foundations/Tab4InteractiveTab-StepByStep';
import progressService from '@/services/progressService';
import { createProgressStore } from '@/lib/progress/store';
import { LearningActivityContext, useLearningActivity } from '@/hooks/useLearningActivity';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { renderer } from '../mathjax/runtime/fixtures';
import { environment, memoryPersistence } from '../progress/store/helpers';

const sharedMath = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({ ...(await importOriginal()), getMathJaxRuntime: () => sharedMath.runtime }));

vi.mock('next/navigation', () => ({ usePathname: () => '/chapter1/01-foundations' }));
vi.mock('next/dynamic', async () => {
  const { lazy } = await import('react');
  return { default: loader => lazy(loader) };
});
vi.mock('@/components/reference-sheets/Chapter1ReferenceSheet', () => ({ Chapter1ReferenceSheet: () => null }));

const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
let typeset;
const sectionStores = [];

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }));
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
  typeset = vi.fn().mockResolvedValue(undefined);
  window.MathJax = { ...renderer(), typesetPromise: typeset };
  sharedMath.runtime = createMathJaxRuntime();
});

afterEach(() => {
  sharedMath.runtime.dispose();
  sectionStores.splice(0).forEach(store => store.dispose());
  delete window.MathJax;
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScroll);
  else delete Element.prototype.scrollIntoView;
});

async function renderResumedSection(Component, child, index, positionId, props = {}) {
  const containerId = `chapter-1:foundations:${child}`;
  const store = createProgressStore(environment(memoryPersistence()));
  sectionStores.push(store);
  await store.hydrate();
  await store.setResume(containerId, { activityId: null, kind: 'section', positionId, legacyIndex: index });
  vi.spyOn(progressService, 'getStore').mockReturnValue(store);
  function Activity() {
    const learning = useLearningActivity(containerId);
    return <LearningActivityContext.Provider value={learning}><Component {...props} /></LearningActivityContext.Provider>;
  }
  const view = render(<Activity />);
  await screen.findByRole('heading', { name: /^Section 4:/ });
  return view;
}

describe('foundation sampling models', () => {
  it('retains uniform probabilities and separates inspection from recorded draws', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.55);
    render(<VisualExperiments />);
    expect(screen.getByText('3/6 ≈ 0.500')).toBeVisible();
    expect(screen.getByText('2/6 ≈ 0.333')).toBeVisible();
    expect(screen.getByText('1/6 ≈ 0.167')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Inspect Green pebble 6' }));
    expect(screen.getByRole('button', { name: 'Inspect Green pebble 6' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Selected: Green pebble. Random draws: 0.');
    expect(screen.queryByRole('heading', { name: 'Your Experimental Results' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pick Random Pebble' }));
    expect(screen.getByRole('status')).toHaveTextContent('Selected: Blue pebble. Random draws: 1.');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('status')).toHaveTextContent('No pebble selected. Random draws: 0.');
    expect(screen.queryByRole('heading', { name: 'Your Experimental Results' })).not.toBeInTheDocument();
  });

  it('retains weighted cumulative selection and color weights rather than uniform counting', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.55).mockReturnValueOnce(0.75).mockReturnValueOnce(0.95);
    render(<VisualExperiments />);
    fireEvent.click(screen.getByRole('button', { name: 'Weighted Selection' }));
    expect(screen.getByRole('button', { name: 'Weighted Selection' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('4/7 ≈ 0.571')).toBeVisible();
    expect(screen.getByText('2/7 ≈ 0.286')).toBeVisible();
    expect(screen.getByText('1/7 ≈ 0.143')).toBeVisible();
    expect(screen.getByText('Selection weight 4 of 7 (57.1%)')).toBeVisible();
    const draw = screen.getByRole('button', { name: 'Pick Weighted Random' });
    for (const [color, weight, count] of [['Red', 2, 1], ['Blue', 1, 2], ['Green', 0.5, 3]]) {
      fireEvent.click(draw);
      expect(screen.getByRole('status')).toHaveTextContent(`Selected: ${color} pebble, selection weight ${weight}. Random draws: ${count}.`);
    }
    const results = screen.getByRole('heading', { name: 'Your Experimental Results' }).parentElement;
    expect(within(results).getAllByText('1/3')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Equal Selection Weights' }));
    fireEvent.click(screen.getByRole('button', { name: 'Weighted Selection' }));
    expect(screen.getByRole('status')).toHaveTextContent('Random draws: 0.');
  });

  it.each(['Pick Random Pebble', 'Pick Weighted Random'])('requests math typesetting after %s and reset', async drawLabel => {
    render(<VisualExperiments />);
    if (drawLabel === 'Pick Weighted Random') fireEvent.click(screen.getByRole('button', { name: 'Weighted Selection' }));
    const formula = screen.getByText(text => text.startsWith('\\[P('));
    const formulaRoot = formula.closest('div.space-y-6');
    await waitFor(() => expect(typeset).toHaveBeenCalledWith([formulaRoot]));
    typeset.mockClear();
    fireEvent.click(screen.getByRole('button', { name: drawLabel }));
    await waitFor(() => expect(typeset).toHaveBeenCalledWith([formulaRoot]));
    typeset.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(typeset).toHaveBeenCalledWith([formulaRoot]));
  });
});

describe('foundation event geometry and calculations', () => {
  it('draws disjoint red and blue circles and preserves each operation result', () => {
    render(<VennDiagram />);
    const svg = screen.getByRole('img', { name: /Disjoint red and blue events/ });
    const circles = [...svg.querySelectorAll('g.venn-circles circle')];
    expect(circles).toHaveLength(2);
    const [first, second] = circles.map(circle => ({
      x: Number(circle.getAttribute('cx')), y: Number(circle.getAttribute('cy')), r: Number(circle.getAttribute('r')),
    }));
    expect(Math.hypot(second.x - first.x, second.y - first.y)).toBeGreaterThan(first.r + second.r);
    expect(screen.getByText(/P\(R ∩ B\) = 0/)).toBeVisible();
    for (const [label, formula, result] of [
      ['P(R)', '\\frac{3}{6}', 'Only red pebbles'],
      ['P(B)', '\\frac{2}{6}', 'Only blue pebbles'],
      ['P(R ∪ B)', '\\frac{5}{6}', 'Red OR blue pebbles'],
      ["P((R ∪ B)')", '\\frac{1}{6}', 'Green pebbles (neither red nor blue)'],
      ['P(∅)', 'P(\\emptyset) = 0', 'Impossible event'],
      ['P(S)', 'P(S) = \\frac{|S|}{|S|} = 1', 'All possible outcomes'],
    ]) {
      const button = screen.getByRole('button', { name: name => name.startsWith(`${label}:`) });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');
      const selected = screen.getByRole('heading', { name: `Selected: ${label}` }).parentElement;
      expect(selected).toHaveTextContent(result);
      expect(selected).toHaveTextContent(formula);
    }
    const values = screen.getByRole('button', { name: 'Show probability values in the diagram' });
    expect(values).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(values);
    expect(values).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps all mathematical scenarios, bag choices, and weighted group calculations usable', () => {
    render(<MathematicalAnalysis />);
    const equal = screen.getByRole('button', { name: /Equal Selection Weights:/ });
    expect(equal).toHaveAttribute('aria-pressed', 'true');
    const cardBag = screen.getByRole('button', { name: /Bag B: Card Suits:/ });
    fireEvent.click(cardBag);
    expect(cardBag).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Weighted Selection:/ }));
    expect(screen.getByRole('button', { name: /Weighted Selection:/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Start Step-by-Step Calculation' }));
    for (let step = 0; step < 5; step++) fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(screen.getByText(/40% chance of drawing from the weight-1 group/)).toBeVisible();
    expect(screen.getByText(/60% chance of drawing from the weight-3 group/)).toBeVisible();
    expect(screen.getByText(/0.4 \+ 0.6 = 1.0/)).toBeVisible();
    expect(screen.getByText(/physical mass alone does not determine the probability/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /Multiple Picks:/ }));
    expect(screen.getByRole('button', { name: /Multiple Picks:/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Start Step-by-Step Calculation' })).toBeVisible();
  });
});

describe('prediction before explanation', () => {
  it('hides all six quick practice solutions until individually revealed and keeps completion explicit', async () => {
    const complete = vi.fn();
    const { container } = await renderResumedSection(QuickReference, 'quick-reference', 3, 'practice-problems', { onComplete: complete });
    const disclosures = [...container.querySelectorAll('details')];
    expect(disclosures).toHaveLength(6);
    for (const details of disclosures) {
      expect(details).not.toHaveAttribute('open');
      expect(details.querySelector('p')).not.toBeVisible();
      fireEvent.click(details.querySelector('summary'));
      expect(details).toHaveAttribute('open');
      await waitFor(() => expect(details.querySelector('p')).toBeVisible());
    }
    expect(screen.getByText(/P\(red\) = 12\/20 = 0.6/)).toBeVisible();
    expect(screen.getByText(/P\(even\) = 3\/6 = 0.5/)).toBeVisible();
    expect(screen.getByText(/26\/52 = 0.5/)).toBeVisible();
    expect(screen.getByText(/P\(correct result\) = 0.85/)).toBeVisible();
    expect(screen.getByText(/P\(mobile\) = 0.6/)).toBeVisible();
    expect(screen.getByText(/P\(not agree\) = 1 − 0.7 = 0.3/)).toBeVisible();
    expect(complete).not.toHaveBeenCalled();
  });

  it('retains the fourth worked section identity and reveals exact die and weighted transfer reasoning', async () => {
    const complete = vi.fn();
    const { container } = await renderResumedSection(WorkedExamples, 'worked-examples', 3, 'why-cards-matter', { onComplete: complete });
    expect(screen.getByRole('heading', { name: 'Section 4: Try a New Sample Space' })).toBeVisible();
    const die = screen.getByText(/A ∩ B = \{4, 6\}, so P\(A ∩ B\) = 2\/6 = 1\/3/);
    const weighted = screen.getByText(/P\(red\) = 2\/4 = 1\/2/);
    expect(die).not.toBeVisible();
    expect(weighted).not.toBeVisible();
    fireEvent.click(screen.getByText('Reveal die solution'));
    await waitFor(() => expect(die).toBeVisible());
    expect(screen.getByText(/A ∪ B = \{2, 4, 5, 6\}, so P\(A ∪ B\) = 4\/6 = 2\/3/)).toBeVisible();
    expect(weighted).not.toBeVisible();
    fireEvent.click(screen.getByText('Reveal weighted solution'));
    expect(weighted).toBeVisible();
    expect(screen.getByText(/Counting would give 1\/3 if all three pebbles were equally likely/)).toBeVisible();
    expect(container.querySelectorAll('details[open]')).toHaveLength(2);
    expect(complete).not.toHaveBeenCalled();
  });

  it('states fair independent coin assumptions before assigning four equal outcome probabilities', async () => {
    await renderResumedSection(FoundationsTab, 'foundations', 3, 'complete-example');
    await waitFor(() => expect(screen.getByText(/two independent flips of a fair coin/)).toBeVisible());
    expect(screen.getByText(/H means heads and T means tails/)).toBeVisible();
    expect(screen.getByText(/S = \\{HH, HT, TH, TT\\}/)).toBeVisible();
  });
});

describe('foundation route integration', () => {
  let store;
  beforeEach(() => {
    store = createProgressStore(environment(memoryPersistence()));
    vi.spyOn(progressService, 'getStore').mockReturnValue(store);
  });
  afterEach(() => { cleanup(); store.dispose(); });
  const hydrated = () => waitFor(() => expect(screen.getByRole('tab', { name: 'Foundations' })).toBeEnabled());

  it('loads all four real tabs and complementary explorers without marking them complete', async () => {
    render(<Suspense fallback={<p>Loading foundation test</p>}><FoundationsPage /></Suspense>);
    await hydrated();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Section 1: Physical Intuition' })).toBeVisible());
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    fireEvent.click(screen.getByRole('tab', { name: 'Worked Examples' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Section 1: Card Deck: A Complete Example' })).toBeVisible());
    await waitFor(() => expect(screen.getByText(/bars in \|A\| mean the number/)).toBeVisible());
    fireEvent.click(screen.getByRole('tab', { name: 'Quick Reference' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Section 1: Essential Formulas' })).toBeVisible());
    fireEvent.click(screen.getByRole('tab', { name: 'Interactive Explorer' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Interactive Pebble World' })).toBeVisible());
    expect(screen.getByRole('button', { name: /Visual Experiments:/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Changing views starts a new experiment or calculation/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /Set Operations:/ }));
    await waitFor(() => expect(screen.getByRole('img', { name: /Disjoint red and blue events/ })).toBeVisible());
    expect(screen.getByRole('button', { name: /Set Operations:/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Mathematical Analysis:/ }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Interactive Step-by-Step Calculations' })).toBeVisible());
    expect(screen.getByRole('button', { name: /Mathematical Analysis:/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('0/4 (0%)')).toBeVisible();
    await waitFor(() => expect(store.getSnapshot().pendingLocalWrites).toBe(0));
    expect(store.getSnapshot().data.activities).toEqual({});
    expect(store.getSnapshot().data.resumeByDevice[store.getSnapshot().data.deviceId]['chapter-1:foundations']).toMatchObject({ activityId: 'chapter-1:foundations:interactive', kind: 'tab' });
    expect(localStorage.getItem('chapter1-foundations-progress')).toBeNull();
    expect(localStorage.getItem('chapter1-foundations-progress:active-tab')).toBeNull();
  });

  it('keeps explorer navigation separate from keyboard tab navigation', async () => {
    await store.hydrate();
    await store.setResume('chapter-1:foundations', { activityId: 'chapter-1:foundations:interactive', kind: 'tab' }, { context: store.captureWriteContext('chapter-1:foundations') });
    render(<Suspense fallback={<p>Loading foundation test</p>}><FoundationsPage /></Suspense>);
    await hydrated();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Interactive Pebble World' })).toBeVisible());
    fireEvent.click(screen.getByRole('button', { name: 'Key Concepts' }));
    const interactive = screen.getByRole('tab', { name: 'Interactive Explorer' });
    interactive.focus();
    fireEvent.keyDown(interactive, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Foundations' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Foundations' })).toHaveFocus();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Section 1: Physical Intuition' })).toBeVisible());
    await waitFor(() => expect(store.getSnapshot().pendingLocalWrites).toBe(0));
    expect(store.getSnapshot().data.activities).toEqual({});
    expect(store.getSnapshot().data.resumeByDevice[store.getSnapshot().data.deviceId]['chapter-1:foundations']).toMatchObject({ activityId: 'chapter-1:foundations:foundations', kind: 'tab' });
    expect(localStorage.getItem('chapter1-foundations-progress')).toBeNull();
    expect(localStorage.getItem('chapter1-foundations-progress:active-tab')).toBeNull();
    expect(screen.getByText('0/4 (0%)')).toBeVisible();
  });
});
