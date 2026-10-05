import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MontyHallJourney from '@/components/01-introduction-to-probabilities/11-monty-hall-masterclass';
import progressService from '@/services/progressService';
import { createProgressStore } from '@/lib/progress/store';
import { isActivityCompleted } from '@/lib/progress/selectors';
import { environment, memoryPersistence } from '../progress/store/helpers';

vi.mock('next/navigation', () => ({ usePathname: () => '/chapter1/11-monty-hall-masterclass' }));
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));
vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));
vi.mock('@/tutorials/chapter1', () => ({ tutorial_1_7_1: null }));
vi.mock('@/components/reference-sheets/Chapter1ReferenceSheet', () => ({ Chapter1ReferenceSheet: () => null }));
vi.mock('@/components/01-introduction-to-probabilities/11-monty-hall-masterclass/MontyHallIntro', () => ({ default: () => <h3>Introduction widget</h3> }));
vi.mock('@/components/01-introduction-to-probabilities/11-monty-hall-masterclass/MontyHallBayesProof', () => ({ default: () => <h3>Proof widget</h3> }));
vi.mock('@/components/01-introduction-to-probabilities/11-monty-hall-masterclass/MontyHallSimulation', () => ({ default: () => <h3>Simulation widget</h3> }));
let store;
afterEach(() => { cleanup(); store?.dispose(); });

describe('actual Monty Hall game integration', () => {
  it('records study only after three real choose/reveal/final-decision games and advances once', async () => {
    store = createProgressStore(environment(memoryPersistence()));
    vi.spyOn(progressService, 'getStore').mockReturnValue(store);
    vi.spyOn(Math, 'random').mockReturnValue(0.2);
    render(<MontyHallJourney />);
    await screen.findByRole('heading', { name: 'Introduction widget' });
    fireEvent.click(screen.getByRole('button', { name: 'Next Stage →' }));
    const playId = 'chapter-1:monty-hall-masterclass:play';
    for (let count = 0; count < 3; count++) {
      fireEvent.click(await screen.findByRole('button', { name: /^Door 1, click to select$/ }));
      const switchChoice = await screen.findByRole('button', { name: /Switch to Door/ });
      fireEvent.click(switchChoice);
      if (count < 2) {
        expect(isActivityCompleted(store.getSnapshot().data, playId)).toBe(false);
        fireEvent.click(screen.getByRole('button', { name: 'Start a new game' }));
      }
    }
    await screen.findByRole('heading', { name: 'Proof widget' });
    await waitFor(() => expect(store.getSnapshot().pendingLocalWrites).toBe(0));
    expect(isActivityCompleted(store.getSnapshot().data, playId)).toBe(true);
    expect(isActivityCompleted(store.getSnapshot().data, 'chapter-1:monty-hall-masterclass:intro')).toBe(false);
    expect(store.getSnapshot().data.activities[playId].evidence).toHaveLength(1);
  });
});
