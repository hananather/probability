import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MathematicalAnalysis from '@/components/01-introduction-to-probabilities/01-foundations/Tab4InteractiveTab-StepByStep';

const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
let scroll;

beforeEach(() => {
  scroll = vi.fn();
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scroll });
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }));
  window.MathJax = { typesetPromise: vi.fn().mockResolvedValue(undefined), typesetClear: vi.fn() };
});

afterEach(() => {
  delete window.MathJax;
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScroll);
  else delete Element.prototype.scrollIntoView;
});

const configurations = [
  { name: 'uniform colors', scenario: /Equal Selection Weights:/, bag: /Bag A: Simple Colors:/, steps: 5 },
  { name: 'uniform cards', scenario: /Equal Selection Weights:/, bag: /Bag B: Card Suits:/, steps: 5 },
  { name: 'selection weights', scenario: /Weighted Selection:/, steps: 6 },
  { name: 'multiple draws', scenario: /Multiple Picks:/, steps: 7 },
];

function chooseConfiguration(configuration) {
  fireEvent.click(screen.getByRole('button', { name: configuration.scenario }));
  if (configuration.bag) fireEvent.click(screen.getByRole('button', { name: configuration.bag }));
}

function stepHeading(step) {
  return screen.getByRole('heading', { name: new RegExp(`^Step ${step}:`) });
}

function advanceTo(step) {
  for (let index = 1; index < step; index++) fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
}

describe('guided calculation reading position', () => {
  for (const reduced of [false, true]) {
    it.each(configurations)('focuses every revealed heading, retains prior steps, and exposes completion for $name with reduced motion=' + reduced, configuration => {
      vi.stubGlobal('matchMedia', () => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }));
      const complete = vi.fn();
      render(<MathematicalAnalysis onComplete={complete} />);
      expect(scroll).not.toHaveBeenCalled();
      chooseConfiguration(configuration);
      expect(scroll).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Start Step-by-Step Calculation' }));

      for (let step = 1; step <= configuration.steps; step++) {
        if (step > 1) fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
        const heading = stepHeading(step);
        expect(heading).toHaveFocus();
        expect(heading).toHaveAttribute('tabindex', '-1');
        expect(heading).toHaveClass('scroll-mt-24');
        expect(scroll).toHaveBeenLastCalledWith({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
        expect(scroll.mock.instances.at(-1)).toBe(heading);
        for (let earlier = 1; earlier < step; earlier++) expect(stepHeading(earlier)).toBeInTheDocument();
        const action = screen.getByRole('button', { name: step === configuration.steps ? 'Mark as Complete' : 'Next Step' });
        expect(heading.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(complete).not.toHaveBeenCalled();
      }

      expect(screen.queryByRole('button', { name: 'Next Step' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Previous Step' }));
      expect(stepHeading(configuration.steps - 1)).toHaveFocus();
      expect(screen.queryByRole('button', { name: 'Mark as Complete' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
      expect(stepHeading(configuration.steps)).toHaveFocus();
      fireEvent.click(screen.getByRole('button', { name: 'Mark as Complete' }));
      expect(complete).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Start Step-by-Step Calculation' })).toHaveFocus();
    });
  }

  it('uses the same reading-position transition for focused navigation keys and avoids unrelated rerender focus', () => {
    const complete = vi.fn();
    const view = render(<><button>Outside lesson</button><MathematicalAnalysis onComplete={complete} /></>);
    const outside = screen.getByRole('button', { name: 'Outside lesson' });
    outside.focus();
    view.rerender(<><button>Outside lesson</button><MathematicalAnalysis onComplete={() => complete()} /></>);
    expect(outside).toHaveFocus();
    expect(scroll).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Start Step-by-Step Calculation' }));
    const navigation = screen.getByRole('group', { name: 'Experiment navigation' });
    navigation.focus();
    fireEvent.keyDown(navigation, { key: 'ArrowRight' });
    expect(stepHeading(2)).toHaveFocus();
    const scrollCount = scroll.mock.calls.length;
    const reset = screen.getByRole('button', { name: 'Reset Calculation' });
    reset.focus();
    view.rerender(<><button>Outside lesson</button><MathematicalAnalysis onComplete={complete} /></>);
    expect(reset).toHaveFocus();
    expect(scroll).toHaveBeenCalledTimes(scrollCount);
    fireEvent.click(reset);
    expect(screen.getByRole('button', { name: 'Start Step-by-Step Calculation' })).toHaveFocus();
    expect(scroll).toHaveBeenCalledTimes(scrollCount);
    fireEvent.click(screen.getByRole('button', { name: /Weighted Selection:/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Step-by-Step Calculation' }));
    expect(stepHeading(1)).toHaveFocus();
    expect(stepHeading(1)).toHaveTextContent('Define the Weighted Sample Space');
    expect(complete).not.toHaveBeenCalled();
  });

  it('offers an explicit finish action without a completion callback', () => {
    render(<MathematicalAnalysis />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Step-by-Step Calculation' }));
    advanceTo(5);
    expect(stepHeading(5)).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Finish Calculation' }));
    expect(screen.getByRole('button', { name: 'Start Step-by-Step Calculation' })).toHaveFocus();
    expect(screen.queryByRole('heading', { name: /^Step 5:/ })).not.toBeInTheDocument();
  });
});

describe('guided comparison row labels', () => {
  it('associates the weighted and uniform numbers with their named groups', () => {
    render(<MathematicalAnalysis />);
    fireEvent.click(screen.getByRole('button', { name: /Weighted Selection:/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Step-by-Step Calculation' }));
    advanceTo(5);
    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'Aspect' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Uniform Selection' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Weighted Selection' })).toBeInTheDocument();
    const first = within(table).getByRole('row', { name: /P\(Weight-1 group\)/ });
    expect(first).toHaveTextContent('\\frac{4}{6} \\approx 0.667');
    expect(first).toHaveTextContent('\\frac{4}{10} = 0.4');
    const second = within(table).getByRole('row', { name: /P\(Weight-3 group\)/ });
    expect(second).toHaveTextContent('\\frac{2}{6} \\approx 0.333');
    expect(second).toHaveTextContent('\\frac{6}{10} = 0.6');
    expect(within(table).getByRole('row', { name: /Most likely/ })).toBeInTheDocument();
  });

  it('associates both replacement models with their events and unchanged probabilities', () => {
    render(<MathematicalAnalysis />);
    fireEvent.click(screen.getByRole('button', { name: /Multiple Picks:/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start Step-by-Step Calculation' }));
    advanceTo(6);
    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'Aspect' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'With Replacement' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Without Replacement' })).toBeInTheDocument();
    const twoRed = within(table).getByRole('row', { name: /P\(Two Reds\)/ });
    expect(twoRed).toHaveTextContent('0.6 \\times 0.6 = 0.36');
    expect(twoRed).toHaveTextContent('0.6 \\times 0.5 = 0.30');
    const anyRed = within(table).getByRole('row', { name: /P\(At least one Red\)/ });
    expect(anyRed).toHaveTextContent('1 - 0.4^2 = 0.84');
    expect(anyRed).toHaveTextContent('1 - 0.1 = 0.90');
    expect(within(table).getByRole('row', { name: /Independence/ })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /Calculation/ })).toBeInTheDocument();
  });
});
