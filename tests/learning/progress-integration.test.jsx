import React, { useContext, useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BookOpen } from 'lucide-react';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import ChapterHub from '@/components/shared/ChapterHub';
import LearningProgressPage from '@/components/progress/LearningProgressPage';
import { Header } from '@/components/layout/Header';
import { LearningActivityContext } from '@/hooks/useLearningActivity';
import progressService from '@/services/progressService';
import { ACTIVITY_BY_ID, CURRICULUM } from '@/lib/curriculum/manifest';
import { createProgressStore } from '@/lib/progress/store';
import { environment, memoryPersistence, storageWith } from '../progress/store/helpers';

vi.mock('next/navigation', () => ({ usePathname: () => '/chapter1/01-foundations' }));
vi.mock('@/components/ui/sidebar', () => ({ SidebarTrigger: () => <button>Open menu</button> }));

const stores = [];
afterEach(() => { cleanup(); stores.splice(0).forEach(store => store.dispose()); });
function setup({ persistence = memoryPersistence(), legacyStorage = storageWith() } = {}) {
  const store = createProgressStore(environment(persistence, { legacyStorage }));
  stores.push(store);
  vi.spyOn(progressService, 'getStore').mockReturnValue(store);
  return { store, persistence, legacyStorage };
}
const lessonId = 'chapter-1:foundations';
const chapter = CURRICULUM.chapters.find(item => item.id === 'chapter-1');
const tabIds = ['foundations', 'worked-examples', 'quick-reference', 'interactive'];
function StudyTab({ onComplete }) {
  const context = useContext(LearningActivityContext);
  const [answer, setAnswer] = useState('');
  return <>
    <p data-testid="activity-context">{context.containerId}</p>
    <input aria-label="Lesson notes" value={answer} onChange={event => setAnswer(event.target.value)} />
    <button onClick={onComplete}>Mark this tab as studied</button>
  </>;
}
const makeTabs = (component = StudyTab) => tabIds.map(id => ({ id, label: id, icon: BookOpen, color: '#14b8a6', component }));
const tabPage = (component = StudyTab) => <TabbedLearningPage title="Foundation lesson" chapter={1} tabs={makeTabs(component)} storageKey="chapter1-foundations-progress" />;
const section = lesson => ({ id: lesson.legacyId, title: lesson.title, subtitle: 'Probability', description: 'Study this module', icon: BookOpen, color: '#14b8a6', difficulty: 'Beginner', estimatedTime: '5 min', learningGoals: ['Events'], prerequisites: [] });
const hub = (props = {}) => <ChapterHub chapterNumber={1} chapterTitle="Probability" storageKey="chapter1Progress" sections={chapter.lessons.filter(lesson => lesson.required).map(section)} {...props} />;
const ready = () => waitFor(() => expect(screen.getByRole('tab', { name: 'foundations' })).toBeEnabled());
const studied = id => screen.getByRole('tab', { name: `${id} Completed` });

describe('shared canonical lesson progress', () => {
  it('updates the hub, real Header, and real dashboard from the same child completion facts', async () => {
    const { store, legacyStorage } = setup();
    await store.hydrate();
    for (const lesson of chapter.lessons.filter(item => item.required && item.id !== lessonId)) await store.completeActivity(lesson.id);
    render(<><Header />{tabPage()}{hub()}<LearningProgressPage /></>);
    await ready();
    expect(screen.getByRole('link', { name: 'View your learning progress' })).toHaveTextContent('0/7');
    expect(screen.getByText('11 / 66')).toBeInTheDocument();
    for (const id of tabIds) {
      fireEvent.click(screen.getByRole('tab', { name: id }));
      expect(screen.getByTestId('activity-context')).toHaveTextContent(`${lessonId}:${id}`);
      fireEvent.click(screen.getByRole('button', { name: 'Mark this tab as studied' }));
      await waitFor(() => expect(studied(id)).toBeInTheDocument());
    }
    await waitFor(() => expect(screen.getByRole('link', { name: 'View your learning progress' })).toHaveTextContent('1/7'));
    expect(screen.getByRole('button', { name: `${ACTIVITY_BY_ID[lessonId].title}: Studied` })).toBeInTheDocument();
    expect(screen.getByText('12 / 66')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: `${chapter.title} study progress` })).toHaveAttribute('value', '12');
    expect(legacyStorage.getItem('chapter1Progress')).toBeNull();
    expect(legacyStorage.getItem('chapter1-foundations-progress')).toBeNull();
  });

  it('preserves independent tab completions and the active-tab resume through a new store instance', async () => {
    const { store, persistence, legacyStorage } = setup();
    const view = render(tabPage()); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Mark this tab as studied' }));
    await waitFor(() => expect(studied('foundations')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('tab', { name: 'worked-examples' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark this tab as studied' }));
    await waitFor(() => expect(studied('worked-examples')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('tab', { name: 'quick-reference' }));
    await waitFor(() => expect(store.getSnapshot().pendingLocalWrites).toBe(0));
    view.unmount(); store.dispose();
    setup({ persistence, legacyStorage });
    render(tabPage());
    await waitFor(() => expect(screen.getByRole('tab', { name: 'quick-reference' })).toHaveAttribute('aria-selected', 'true'));
    expect(studied('foundations')).toBeInTheDocument(); expect(studied('worked-examples')).toBeInTheDocument();
    expect(screen.getByText('2/4 (50%)')).toBeInTheDocument();
  });

  it('merges concurrent callbacks from two mounted lesson readers without replacing sibling study facts', async () => {
    const callbacks = [];
    function DeferredTab({ onComplete }) {
      return <button onClick={() => callbacks.push(onComplete)}>Complete this work later</button>;
    }
    const { store } = setup();
    render(<><div data-testid="first-reader">{tabPage(DeferredTab)}</div><div data-testid="second-reader">{tabPage(DeferredTab)}</div></>);
    const first = within(screen.getByTestId('first-reader'));
    const second = within(screen.getByTestId('second-reader'));
    await waitFor(() => expect(first.getByRole('tab', { name: 'foundations' })).toBeEnabled());
    fireEvent.click(first.getByRole('button', { name: 'Complete this work later' }));
    fireEvent.click(second.getByRole('tab', { name: 'worked-examples' }));
    fireEvent.click(second.getByRole('button', { name: 'Complete this work later' }));
    await act(async () => { callbacks.forEach(complete => complete()); });
    await waitFor(() => expect(store.getSnapshot().pendingLocalWrites).toBe(0));
    expect(store.getSnapshot().data.activities[`${lessonId}:foundations`]).toBeDefined();
    expect(store.getSnapshot().data.activities[`${lessonId}:worked-examples`]).toBeDefined();
    expect(first.getByText('2/4 (50%)')).toBeInTheDocument();
    expect(second.getByText('2/4 (50%)')).toBeInTheDocument();
  });

  it('does not resurrect retained legacy arrays or active tabs after a canonical reset and reload', async () => {
    const raw = JSON.stringify(tabIds);
    const { store, persistence, legacyStorage } = setup({ legacyStorage: storageWith({
      'chapter1-foundations-progress': raw,
      'chapter1-foundations-progress:active-tab': 'interactive',
    }) });
    const view = render(tabPage());
    await waitFor(() => expect(studied('interactive')).toHaveAttribute('aria-selected', 'true'));
    await act(async () => { expect(await store.resetActivity(lessonId, { context: store.captureWriteContext(lessonId) })).toMatchObject({ applied: true }); });
    expect(screen.getByRole('tab', { name: 'foundations' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('0/4 (0%)')).toBeInTheDocument();
    expect(legacyStorage.getItem('chapter1-foundations-progress')).toBe(raw);
    expect(legacyStorage.getItem('chapter1-foundations-progress:active-tab')).toBe('interactive');
    view.unmount(); store.dispose(); setup({ persistence, legacyStorage }); render(tabPage()); await ready();
    expect(screen.getByRole('tab', { name: 'foundations' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('0/4 (0%)')).toBeInTheDocument();
  });

  it('remounts a reset widget and rejects its delayed old completion callback', async () => {
    const callbacks = [];
    function DeferredTab({ onComplete }) {
      const [answer, setAnswer] = useState('');
      return <><input aria-label="Draft answer" value={answer} onChange={event => setAnswer(event.target.value)} /><button onClick={() => callbacks.push(onComplete)}>Check later</button></>;
    }
    const { store } = setup(); render(tabPage(DeferredTab)); await ready();
    fireEvent.change(screen.getByLabelText('Draft answer'), { target: { value: 'old work' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check later' }));
    await act(async () => { await store.resetActivity(lessonId, { context: store.captureWriteContext(lessonId) }); });
    expect(screen.getByLabelText('Draft answer')).toHaveValue('');
    await act(async () => { callbacks[0](); });
    expect(screen.getByText('0/4 (0%)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Check later' }));
    await act(async () => { callbacks[1](); });
    await waitFor(() => expect(studied('foundations')).toBeInTheDocument());
  });

  it('keeps failed saves visible as session study facts and saves them on retry', async () => {
    const { store, persistence } = setup(); render(<>{tabPage()}<LearningProgressPage /></>); await ready();
    persistence.failures.write = true;
    fireEvent.click(screen.getByRole('button', { name: 'Mark this tab as studied' }));
    await waitFor(() => expect(studied('foundations')).toBeInTheDocument());
    await waitFor(() => expect(store.getSnapshot().persistenceStatus).toBe('session-only'));
    expect(screen.getAllByRole('status').some(element => element.textContent.includes('only kept for this visit'))).toBe(true);
    expect(screen.getByRole('button', { name: 'Export backup' })).toBeEnabled();
    fireEvent.click(screen.getByRole('tab', { name: 'worked-examples' }));
    expect(screen.getByTestId('activity-context')).toHaveTextContent(`${lessonId}:worked-examples`);
    expect(store.getSnapshot().data.activities[`${lessonId}:foundations`]).toBeDefined();
    persistence.failures.write = false;
    await act(async () => { await store.retryPersistence(); });
    expect(screen.getByText('Saved in this browser')).toBeInTheDocument();
    expect(screen.queryByText(/Your recent changes are only kept/)).not.toBeInTheDocument();
  });

  it('navigates hub cards without completing them and stores developer preference separately', async () => {
    const { store, legacyStorage } = setup(); const open = vi.fn(); render(hub({ onSectionClick: open }));
    await act(async () => { await store.hydrate(); });
    const card = screen.getByRole('button', { name: ACTIVITY_BY_ID[lessonId].title });
    fireEvent.click(card); expect(open).toHaveBeenCalledOnce();
    expect(store.getSnapshot().data.activities).toEqual({});
    fireEvent.keyDown(document.body, { key: 'D', ctrlKey: true, shiftKey: true });
    await waitFor(() => expect(store.getSnapshot().data.preferences.device.chapter1Progress_devMode).toBe(true));
    expect(store.getSnapshot().data.activities).toEqual({});
    expect(legacyStorage.getItem('chapter1Progress_devMode')).toBeNull();
  });

  it('reads bonus prerequisites from primary facts while keeping bonus counts separate', async () => {
    const { store } = setup(); await store.hydrate();
    await store.completeActivity('chapter-6:hypothesis-fundamentals');
    const bonus = ACTIVITY_BY_ID['chapter-6:hypothesis-evidence'];
    render(<ChapterHub chapterNumber={6} chapterTitle="Hypothesis testing" storageKey="hypothesisTestingBonusProgress" sections={[{ ...section(bonus), prerequisites: ['hypothesis-fundamentals'] }]} />);
    expect(screen.queryByText('Complete prerequisites first')).not.toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: bonus.title })).toBeInTheDocument();
  });

  it('keeps an unregistered lesson usable and explicitly session-only without reading or rewriting its legacy data', () => {
    setup(); localStorage.setItem('unregistered', '["foundations"]');
    render(<TabbedLearningPage title="Unknown lesson" chapter={1} tabs={makeTabs()} storageKey="unregistered" />);
    expect(screen.getByRole('status')).toHaveTextContent('only in this session');
    fireEvent.click(screen.getByRole('button', { name: 'Mark this tab as studied' }));
    expect(screen.getByText('1/4 (25%)')).toBeInTheDocument();
    expect(localStorage.getItem('unregistered')).toBe('["foundations"]');
    expect(localStorage.getItem('unregistered:active-tab')).toBeNull();
  });
});
