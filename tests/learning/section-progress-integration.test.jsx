import React, { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BookOpen } from 'lucide-react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import progressService from '@/services/progressService';
import { createProgressStore } from '@/lib/progress/store';
import { environment, memoryPersistence, storageWith } from '../progress/store/helpers';
import { SECTION_RAW, withArchivedSection } from '../progress/store/section-fixtures';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { renderer, tick } from '../mathjax/runtime/fixtures';

const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({ ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime }));

vi.mock('next/navigation', () => ({ usePathname: () => '/chapter1/01-foundations' }));

const lessonId = 'chapter-1:foundations';
const foundationId = `${lessonId}:foundations`;
const referenceId = `${lessonId}:quick-reference`;
const legacyKey = 'probability:resume:section:/chapter1/01-foundations:foundations';
const sections = [
  { id: 'physical-intuition', title: 'Outcomes', content: () => <p>Outcome explanation</p> },
  { id: 'counting-principle', title: 'Events', content: () => <p>Event explanation</p> },
  { id: 'set-operations', title: 'Set Operations', content: () => <p>Set operations explanation</p> },
  { id: 'complete-example', title: 'Complete Example', content: () => <p>Probability explanation</p> },
];
const referenceSections = [
  { id: 'formula-sheet', title: 'Formula Sheet', content: () => <p>Reference formulas</p> },
  { id: 'decision-guide', title: 'Decision Guide', content: () => <p>Reference decisions</p> },
];
const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
const stores = [];

beforeEach(() => {
  window.MathJax = renderer();
  shared.runtime = createMathJaxRuntime();
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
});
afterEach(async () => {
  cleanup();
  shared.runtime.dispose();
  await tick();
  stores.splice(0).forEach(store => store.dispose());
  if (originalScroll) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScroll);
  else delete Element.prototype.scrollIntoView;
  delete window.MathJax;
});

function setup({ persistence = memoryPersistence(), legacyStorage = storageWith() } = {}) {
  const store = createProgressStore(environment(persistence, { legacyStorage }));
  stores.push(store);
  vi.spyOn(progressService, 'getStore').mockReturnValue(store);
  return { store, persistence, legacyStorage };
}
function Lesson({ sectionList = sections, complete = () => {} }) {
  const tabs = [
    { id: 'foundations', label: 'Foundations', icon: BookOpen, color: '#14b8a6', component: ({ onComplete }) =>
      <SectionBasedContent title="Foundations" sections={sectionList} onComplete={() => { complete(); onComplete(); }} showBackToHub={false} /> },
    { id: 'quick-reference', label: 'Quick Reference', icon: BookOpen, color: '#a78bfa', component: ({ onComplete }) =>
      <SectionBasedContent title="Quick Reference" sections={referenceSections} onComplete={onComplete} showBackToHub={false} /> },
  ];
  return <TabbedLearningPage title="Probability" chapter={1} tabs={tabs} storageKey="chapter1-foundations-progress" />;
}
const ready = () => waitFor(() => expect(screen.getByRole('tab', { name: 'Foundations' })).toBeEnabled());
const flushed = store => waitFor(() => expect(store.getSnapshot().pendingLocalWrites).toBe(0));
const locator = (store, id = foundationId) => store.getSnapshot().data.resumeByDevice[store.getSnapshot().data.deviceId]?.[id];
const sectionLocator = (positionId, legacyIndex) => ({ activityId: null, kind: 'section', positionId, legacyIndex });

describe('canonical section progress', () => {
  it('automatically resumes a newly observed exact legacy source without adding completion', async () => {
    const { store } = setup({ legacyStorage: storageWith({ [legacyKey]: SECTION_RAW }) });
    render(<Lesson />); await ready();
    expect(screen.getByRole('heading', { name: 'Section 3: Set Operations' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Restore saved position' })).not.toBeInTheDocument();
    expect(screen.getByText('0/2 (0%)')).toBeInTheDocument();
    expect(store.getSnapshot().data.activities).toEqual({});
  });

  it('restores a pre-upgrade archive only through the explicit native action, once, with focus and no attainment', async () => {
    const persistence = memoryPersistence(); const seeded = createProgressStore(environment(persistence)); await seeded.hydrate();
    const owner = seeded.getSnapshot().data.ownerScope;
    await persistence.update(owner, record => withArchivedSection(record)); seeded.dispose();
    const { store, legacyStorage } = setup({ persistence, legacyStorage: storageWith({ [legacyKey]: SECTION_RAW }) });
    const complete = vi.fn(); const view = render(<Lesson complete={complete} />); await ready();
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restore saved position' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Section 3: Set Operations' })).toHaveFocus());
    expect(screen.queryByRole('button', { name: 'Restore saved position' })).not.toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled(); expect(store.getSnapshot().data.activities).toEqual({});
    await flushed(store);
    await act(async () => { await store.clearResume(foundationId, { context: store.captureWriteContext(foundationId) }); });
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Restore saved position' })).not.toBeInTheDocument();
    view.unmount(); store.dispose(); setup({ persistence, legacyStorage }); render(<Lesson complete={complete} />); await ready();
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Restore saved position' })).not.toBeInTheDocument();
    expect(legacyStorage.getItem(legacyKey)).toBe(SECTION_RAW);
  });

  it('restores independent child positions across tab switches and new store instances without completing study', async () => {
    const { store, persistence, legacyStorage } = setup();
    await store.hydrate();
    await store.setResume(foundationId, sectionLocator('set-operations', 2));
    await store.setResume(referenceId, sectionLocator('decision-guide', 1));
    const complete = vi.fn();
    const subscription = vi.spyOn(store, 'subscribe');
    const view = render(<StrictMode><Lesson complete={complete} /></StrictMode>);
    await ready();
    expect(screen.getByRole('heading', { name: 'Section 3: Set Operations' })).toBeInTheDocument();
    expect(screen.getByText('0/2 (0%)')).toBeInTheDocument();
    // StrictMode mounts the one enclosing reader twice; sections add no subscription.
    expect(subscription).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('tab', { name: 'Quick Reference' }));
    expect(screen.getByRole('heading', { name: 'Section 2: Decision Guide' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Foundations' }));
    expect(screen.getByRole('heading', { name: 'Section 3: Set Operations' })).toBeInTheDocument();
    await flushed(store);
    view.unmount();
    store.dispose();
    setup({ persistence, legacyStorage });
    render(<Lesson complete={complete} />);
    await ready();
    expect(screen.getByRole('heading', { name: 'Section 3: Set Operations' })).toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
    expect(store.getSnapshot().data.activities).toEqual({});
    expect(legacyStorage.getItem(legacyKey)).toBeNull();
  });

  it('saves an explicit move only as the current child locator and restores its stable ID after reordering', async () => {
    const { store, persistence, legacyStorage } = setup();
    const complete = vi.fn();
    const view = render(<Lesson complete={complete} />);
    await ready();
    fireEvent.click(screen.getByRole('button', { name: /Events.*Next/ }));
    await flushed(store);
    expect(locator(store)).toEqual({ containerId: foundationId, ...sectionLocator('counting-principle', 1) });
    expect(locator(store, lessonId)).toBeUndefined();
    expect(store.getSnapshot().data.activities).toEqual({});
    view.unmount(); store.dispose();
    setup({ persistence, legacyStorage });
    render(<Lesson sectionList={[sections[1], sections[0], sections[2], sections[3]]} complete={complete} />);
    await ready();
    expect(screen.getByRole('heading', { name: 'Section 1: Events' })).toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
  });

  it('records the existing final explicit callback once and retains Completed after reload', async () => {
    const { store, persistence, legacyStorage } = setup();
    const complete = vi.fn();
    const view = render(<Lesson complete={complete} />); await ready();
    for (const title of ['Events', 'Set Operations', 'Complete Example']) fireEvent.click(screen.getByRole('button', { name: new RegExp(`${title}.*Next`) }));
    expect(complete).not.toHaveBeenCalled();
    expect(store.getSnapshot().data.activities).toEqual({});
    fireEvent.click(screen.getByRole('button', { name: 'Complete Section' }));
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Foundations Completed' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: '✓ Completed' }));
    expect(complete).toHaveBeenCalledOnce();
    await flushed(store); view.unmount(); store.dispose(); setup({ persistence, legacyStorage }); render(<Lesson complete={complete} />);
    await waitFor(() => expect(screen.getByRole('button', { name: '✓ Completed' })).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Section 4: Complete Example' })).toBeInTheDocument();
    expect(complete).toHaveBeenCalledOnce();
  });

  it('does not resurrect an archived legacy section after clearResume and a new store instance', async () => {
    const raw = JSON.stringify({ index: 2, sectionId: 'set-operations' });
    const { store, persistence, legacyStorage } = setup({ legacyStorage: storageWith({ [legacyKey]: raw }) });
    await store.hydrate();
    expect(store.getSnapshot().data.migration.sources[legacyKey].raw).toBe(raw);
    await store.setResume(foundationId, sectionLocator('set-operations', 2));
    const view = render(<Lesson />); await ready();
    expect(screen.getByRole('heading', { name: 'Section 3: Set Operations' })).toBeInTheDocument();
    await act(async () => { await store.clearResume(foundationId, { context: store.captureWriteContext(foundationId) }); });
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    view.unmount(); store.dispose(); setup({ persistence, legacyStorage }); render(<Lesson />); await ready();
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    expect(legacyStorage.getItem(legacyKey)).toBe(raw);
  });

  it.each(['global', 'chapter', 'ancestor', 'child'])('clears local position and completion on a %s reset without falling back to retained legacy data', async scope => {
    const raw = JSON.stringify({ index: 3, sectionId: 'complete-example' });
    const { store, persistence, legacyStorage } = setup({ legacyStorage: storageWith({ [legacyKey]: raw }) });
    await store.hydrate(); await store.setResume(foundationId, sectionLocator('complete-example', 3));
    const view = render(<Lesson />); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Complete Section' }));
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Foundations Completed' })).toBeInTheDocument());
    await act(async () => {
      if (scope === 'global') await store.resetAll();
      else if (scope === 'chapter') await store.resetChapter('chapter-1');
      else await store.resetActivity(scope === 'ancestor' ? lessonId : foundationId, { context: store.captureWriteContext(scope === 'ancestor' ? lessonId : foundationId) });
    });
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    expect(screen.getByText('0/2 (0%)')).toBeInTheDocument();
    view.unmount(); store.dispose(); setup({ persistence, legacyStorage }); render(<Lesson />); await ready();
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    expect(screen.getByText('0/2 (0%)')).toBeInTheDocument();
    expect(legacyStorage.getItem(legacyKey)).toBe(raw);
  });

  it('keeps blocked saves usable and honest, then persists the same position and completion on retry', async () => {
    const { store, persistence, legacyStorage } = setup();
    const view = render(<Lesson />); await ready(); persistence.failures.write = true;
    for (const title of ['Events', 'Set Operations', 'Complete Example']) fireEvent.click(screen.getByRole('button', { name: new RegExp(`${title}.*Next`) }));
    fireEvent.click(screen.getByRole('button', { name: 'Complete Section' }));
    await waitFor(() => expect(store.getSnapshot().persistenceStatus).toBe('session-only'));
    expect(screen.getByRole('heading', { name: 'Section 4: Complete Example' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '✓ Completed' })).toBeInTheDocument();
    expect(screen.getByText('Your section position is only kept for this visit.')).toBeInTheDocument();
    expect(legacyStorage.getItem(legacyKey)).toBeNull();
    persistence.failures.write = false;
    await act(async () => { await store.retryPersistence(); });
    expect(screen.getByText('Your section position is saved in this browser.')).toBeInTheDocument();
    view.unmount(); store.dispose(); setup({ persistence, legacyStorage }); render(<Lesson />);
    await waitFor(() => expect(screen.getByRole('button', { name: '✓ Completed' })).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Section 4: Complete Example' })).toBeInTheDocument();
  });

  it('waits for hydration before mounting a writable section and preserves the restored locator', async () => {
    const persistence = memoryPersistence();
    const seeded = createProgressStore(environment(persistence)); await seeded.hydrate();
    await seeded.setResume(foundationId, sectionLocator('set-operations', 2)); seeded.dispose();
    const originalRead = persistence.read;
    let release;
    const barrier = new Promise(resolve => { release = resolve; });
    vi.spyOn(persistence, 'read').mockImplementation(async scope => { await barrier; return originalRead(scope); });
    const { store } = setup({ persistence });
    const resumeWrite = vi.spyOn(store, 'setResume');
    render(<Lesson />);
    expect(screen.getByRole('tab', { name: 'Foundations' })).toBeDisabled();
    expect(screen.queryByRole('heading', { name: /Section \d:/ })).not.toBeInTheDocument();
    expect(resumeWrite).not.toHaveBeenCalled();
    await act(async () => { release(); }); await ready();
    expect(screen.getByRole('heading', { name: 'Section 3: Set Operations' })).toBeInTheDocument();
    expect(resumeWrite).not.toHaveBeenCalled();
    expect(locator(store).positionId).toBe('set-operations');
  });

  it('keeps rendered mathematics through canonical completion and unrelated progress notifications', async () => {
    window.MathJax = { ...renderer(), typesetPromise: vi.fn(nodes => {
      for (const node of nodes) for (const span of node.querySelectorAll('span')) if (span.textContent.startsWith('\\[')) span.innerHTML = '<mjx-container>Rendered probability</mjx-container>';
      return Promise.resolve();
    }) };
    function Formula({ isCompleted }) {
      return <div data-completed={isCompleted}><span dangerouslySetInnerHTML={{ __html: '\\[P(A)=1/2\\]' }} /><details><summary>Show reasoning</summary>Two equally likely outcomes.</details></div>;
    }
    const { store } = setup();
    const { container } = render(<Lesson sectionList={[{ id: 'probability', title: 'Probability', content: Formula }]} />); await ready();
    await waitFor(() => expect(container.querySelectorAll('mjx-container')).toHaveLength(1));
    fireEvent.click(screen.getByRole('button', { name: 'Complete Section' }));
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Foundations Completed' })).toBeInTheDocument());
    await waitFor(() => expect(container.querySelectorAll('mjx-container')).toHaveLength(1));
    expect(screen.queryByText('\\[P(A)=1/2\\]')).not.toBeInTheDocument();
    const rendered = container.querySelector('mjx-container');
    await act(async () => { await store.completeActivity('chapter-2:binomial-distribution'); });
    expect(container.querySelector('mjx-container')).toBe(rendered);
    expect(screen.getByText('Show reasoning').closest('details')).toBeInTheDocument();
  });
});
