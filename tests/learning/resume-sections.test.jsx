import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SectionBasedContent from '@/components/ui/SectionBasedContent';

const route = vi.hoisted(() => ({ pathname: '/chapter1/01-foundations' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

const sections = [
  { id: 'outcomes', title: 'Outcomes', content: () => <p>Outcome explanation</p> },
  { id: 'events', title: 'Events', content: () => <p>Event explanation</p> },
  { id: 'operations', title: 'Set Operations', content: () => <p>Set operations explanation</p> },
];
const foundationKey = 'probability:resume:section:/chapter1/01-foundations:foundations';
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

describe('unregistered section navigation', () => {
  it('is explicitly session-only and preserves legacy data without treating navigation as completion', () => {
    const raw = JSON.stringify({ index: 2, sectionId: 'operations' });
    localStorage.setItem(foundationKey, raw);
    const complete = vi.fn();
    render(<SectionBasedContent title="Foundations" sections={sections} onComplete={complete} />);
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('only while this lesson is open');
    fireEvent.click(screen.getByRole('button', { name: /Events.*Next/ }));
    fireEvent.click(screen.getByRole('button', { name: /Set Operations.*Next/ }));
    expect(screen.getByRole('button', { name: 'Complete Section' })).toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
    expect(localStorage.getItem(foundationKey)).toBe(raw);
    fireEvent.click(screen.getByRole('button', { name: 'Complete Section' }));
    fireEvent.click(screen.getByRole('button', { name: '✓ Completed' }));
    expect(complete).toHaveBeenCalledOnce();
  });

  it('keeps the same selected section by ID when the section list is reordered during this visit', () => {
    const view = render(<SectionBasedContent title="Foundations" sections={sections} />);
    fireEvent.click(screen.getByRole('button', { name: /Events.*Next/ }));
    view.rerender(<SectionBasedContent title="Foundations" sections={[sections[1], sections[0], sections[2]]} />);
    expect(screen.getByRole('heading', { name: 'Section 1: Events' })).toBeInTheDocument();
    expect(localStorage.getItem(foundationKey)).toBeNull();
  });

  it('starts a new session position for a different route or explicit renderer identity', () => {
    const view = render(<SectionBasedContent title="Foundations" sections={sections} />);
    fireEvent.click(screen.getByRole('button', { name: /Events.*Next/ }));
    route.pathname = '/chapter1/02-probability-dictionary';
    view.rerender(<SectionBasedContent title="Foundations" sections={sections} />);
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Events.*Next/ }));
    view.rerender(<SectionBasedContent title="Foundations" sections={sections} storageKey="independent-lesson" />);
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    expect(localStorage.getItem('independent-lesson')).toBeNull();
  });

  it.each(['-1', '3', '1.5', '{broken', 'null', '{}', '"2"'])('opens a readable first section without attributing unknown legacy position %s', saved => {
    localStorage.setItem(foundationKey, saved);
    const complete = vi.fn();
    render(<SectionBasedContent title="Foundations" sections={sections} onComplete={complete} />);
    expect(screen.getByRole('heading', { name: 'Section 1: Outcomes' })).toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
    expect(localStorage.getItem(foundationKey)).toBe(saved);
  });

  it('remains navigable when device storage is blocked', () => {
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    render(<SectionBasedContent title="Foundations" sections={sections} />);
    fireEvent.click(screen.getByRole('button', { name: /Events.*Next/ }));
    expect(screen.getByRole('heading', { name: 'Section 2: Events' })).toHaveFocus();
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
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
