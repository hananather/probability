import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LearningProgressPage from '@/components/progress/LearningProgressPage';
import { createEmptyProgress } from '@/lib/progress/schema';

const state = vi.hoisted(() => ({ value: null }));
vi.mock('@/hooks/useProgress', () => ({ useProgress: () => state.value }));
vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));

beforeEach(() => {
  state.value = {
    learningData: createEmptyProgress(), loading: false, persistenceStatus: 'persisted',
    exportProgress: vi.fn().mockResolvedValue(true), importProgress: vi.fn().mockResolvedValue(true), retryLocalPersistence: vi.fn().mockResolvedValue(false),
  };
});

describe('learner progress and recovery feedback', () => {
  it('separates historical chapter flags and quiz scores from studied modules', () => {
    state.value.learningData.chaptersLegacy['chapter-1'] = { status: 'completed', progress: 100 };
    state.value.learningData.legacyBestScores['chapter-1'] = { percentage: 75, sourceKey: 'quiz_best_scores' };
    render(<LearningProgressPage />);
    expect(screen.getByText('0 / 66')).toBeInTheDocument();
    expect(screen.getByText('0 / 7')).toBeInTheDocument();
    expect(screen.getByText('1 / 7')).toBeInTheDocument();
    expect(screen.getByText('Best recorded quiz score: 75%')).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(7);
    expect(screen.queryByRole('heading', { name: /Chapter 8/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open chapter 1' })).toHaveAttribute('href', '/chapter1');
    expect(screen.getAllByRole('link', { name: 'Practice quiz' })[0]).toHaveAttribute('href', '/chapter/1/quiz');
  });

  it('does not present empty server state as saved learner data while loading', () => {
    state.value.loading = true;
    state.value.persistenceStatus = 'loading';
    render(<LearningProgressPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading your saved progress');
    expect(screen.getByRole('button', { name: 'Export backup' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Import backup' })).toBeDisabled();
    expect(screen.queryByRole('heading', { name: 'Study and practice' })).not.toBeInTheDocument();
  });

  it('offers export and retry after persistence failure without claiming a cloud save', async () => {
    state.value.persistenceStatus = 'session-only';
    state.value.learningData.activities['chapter-1:foundations'] = { activityId: 'chapter-1:foundations', generation: 0, evidence: [{ kind: 'study-completed', sourceKey: 'test', completedAt: null }] };
    render(<LearningProgressPage />);
    expect(screen.getByText('1 / 66')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('only kept for this visit');
    fireEvent.click(screen.getByRole('button', { name: 'Try saving again' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Saving is still unavailable'));
    expect(screen.queryByText('Saved in this browser')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Export backup' }));
    await waitFor(() => expect(screen.getByText('Your progress backup is ready to download.')).toBeInTheDocument());
    expect(state.value.exportProgress).toHaveBeenCalledOnce();
    expect(screen.getByText(/Account sign-in and automatic cross-device saves are not available yet/)).toBeInTheDocument();
  });

  it('explains a failed import and retains visible existing study records', async () => {
    state.value.importProgress.mockResolvedValue(false);
    render(<LearningProgressPage />);
    const file = { name: 'invalid.json', size: 20, text: () => Promise.resolve('invalid') };
    fireEvent.change(screen.getByLabelText('Choose a progress backup'), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('We could not finish importing this backup'));
    expect(state.value.importProgress).toHaveBeenCalledWith(file);
    expect(screen.getByText('0 / 66')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Choose a progress backup'), { target: { files: [{ ...file, size: 11 * 1024 * 1024 }] } });
    expect(screen.getByRole('alert')).toHaveTextContent('smaller than 10 MB');
    expect(state.value.importProgress).toHaveBeenCalledOnce();
  });
});
