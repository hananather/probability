import React, { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BookOpen } from 'lucide-react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';

const route = vi.hoisted(() => ({ pathname: '/chapter1/01-foundations' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

const sections = [
  { id: 'outcomes', title: 'Outcomes', content: () => <p>Outcome explanation</p> },
  { id: 'events', title: 'Events', content: () => <p>Event explanation</p> },
  { id: 'operations', title: 'Set Operations', content: () => <p>Set operations explanation</p> }
];
const foundationKey = 'probability:resume:section:/chapter1/01-foundations:foundations';
const referenceKey = 'probability:resume:section:/chapter1/01-foundations:quick-reference';
const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
let scroll;

beforeEach(() => {
  route.pathname = '/chapter1/01-foundations';
  scroll = vi.fn();
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scroll });
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScroll);
  else delete Element.prototype.scrollIntoView;
});

function LessonTabs({ onComplete }) {
  const tabs = [
    { id: 'foundations', label: 'Foundations', icon: BookOpen, color: '#14b8a6',
      component: ({ onComplete: completeTab }) => <SectionBasedContent title="Foundations" chapter={1} sections={sections} onComplete={() => { onComplete(); completeTab(); }} /> },
    { id: 'quick-reference', label: 'Quick Reference', icon: BookOpen, color: '#a78bfa',
      component: () => <SectionBasedContent title="Quick Reference" chapter={1} sections={sections.slice(0, 2)} /> }
  ];
  return <TabbedLearningPage title="Probability" chapter={1} tabs={tabs} storageKey="test-tab-completion" />;
}

describe('device-local section position', () => {
  it('resumes each tab independently across tab switches and reload without completing it', () => {
    localStorage.setItem(foundationKey, JSON.stringify({ index: 2, sectionId: 'operations' }));
    localStorage.setItem(referenceKey, JSON.stringify({ index: 1, sectionId: 'events' }));
    const complete = vi.fn();
    let view = render(<StrictMode><LessonTabs onComplete={complete} /></StrictMode>);
    expect(screen.getByRole('heading', { name: 'Section 3: Set Operations' })).toBeInTheDocument();
    expect(screen.getByText('0/2 (0%)')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(foundationKey))).toEqual({ index: 2, sectionId: 'operations' });
    expect(complete).not.toHaveBeenCalled();
    expect(scroll).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('tab', { name: 'Quick Reference' }));
    expect(screen.getByRole('heading', { name: 'Section 2: Events' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Foundations' }));
    expect(screen.getByRole('heading', { name: 'Section 3: Set Operations' })).toBeInTheDocument();
    view.unmount();
    view = render(<LessonTabs onComplete={complete} />);
    expect(screen.getByRole('heading', { name: 'Section 3: Set Operations' })).toBeInTheDocument();
    expect(screen.getByText('0/2 (0%)')).toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('test-tab-completion'))).toEqual([]);
    view.unmount();
  });

  it('persists explicit navigation and restores the same section by ID after reordering', () => {
    let view = render(<SectionBasedContent title="Foundations" sections={sections} />);
    fireEvent.click(screen.getByRole('button', { name: /Events.*Next/ }));
    expect(JSON.parse(localStorage.getItem(foundationKey))).toEqual({ index: 1, sectionId: 'events' });
    view.unmount();
    view = render(<SectionBasedContent title="Foundations" sections={[sections[1], sections[0], sections[2]]} />);
    expect(screen.getByRole('heading', { name: 'Section 1: Events' })).toBeInTheDocument();
    view.unmount();
  });

  it('hydrates a new path or explicit key before writing its position', () => {
    const dictionaryKey = 'probability:resume:section:/chapter1/02-probability-dictionary:foundations';
    localStorage.setItem(foundationKey, JSON.stringify({ index: 1, sectionId: 'events' }));
    localStorage.setItem(dictionaryKey, JSON.stringify({ index: 2, sectionId: 'operations' }));
    localStorage.setItem('independent-lesson-resume', JSON.stringify({ index: 1, sectionId: 'events' }));
    const view = render(<SectionBasedContent title="Foundations" sections={sections} />);
    expect(screen.getByRole('heading', { name: 'Section 2: Events' })).toBeInTheDocument();
    route.pathname = '/chapter1/02-probability-dictionary';
    view.rerender(<SectionBasedContent title="Foundations" sections={sections} />);
    expect(screen.getByRole('heading', { name: 'Section 3: Set Operations' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(dictionaryKey))).toEqual({ index: 2, sectionId: 'operations' });
    expect(JSON.parse(localStorage.getItem(foundationKey))).toEqual({ index: 1, sectionId: 'events' });
    view.rerender(<SectionBasedContent title="Foundations" sections={sections} storageKey="independent-lesson-resume" />);
    expect(screen.getByRole('heading', { name: 'Section 2: Events' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('independent-lesson-resume'))).toEqual({ index: 1, sectionId: 'events' });
    expect(JSON.parse(localStorage.getItem(dictionaryKey))).toEqual({ index: 2, sectionId: 'operations' });
  });

  it.each(['-1', '3', '1.5', '{broken', 'null', '{}', '"2"'])('opens a valid first section with invalid saved position %s', saved => {
    localStorage.setItem(foundationKey, saved);
    const complete = vi.fn();
    render(<SectionBasedContent title="Foundations" sections={sections} onComplete={complete} />);
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
  });

  it('remains navigable when device storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    render(<SectionBasedContent title="Foundations" sections={sections} />);
    fireEvent.click(screen.getByRole('button', { name: /Events.*Next/ }));
    expect(screen.getByRole('heading', { name: 'Section 2: Events' })).toHaveFocus();
  });

  it.each([false, true])('focuses and scrolls to the new heading with reduced motion=%s', reduced => {
    vi.stubGlobal('matchMedia', () => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }));
    render(<SectionBasedContent title="Foundations" sections={sections} />);
    expect(scroll).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Events.*Next/ }));
    expect(screen.getByRole('heading', { name: 'Section 2: Events' })).toHaveFocus();
    expect(scroll).toHaveBeenLastCalledWith({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    fireEvent.click(screen.getByRole('button', { name: /Outcomes.*Previous/ }));
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toHaveFocus();
  });
});
