import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/Header';
import { ContentWrapper } from '@/components/shared/ContentWrapper';
import { FooterWrapper } from '@/components/shared/FooterWrapper';

vi.mock('next/navigation', () => ({ usePathname: () => '/chapter1' }));
vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
vi.mock('@/services/progressService', () => ({
  default: { getOverallProgress: async () => ({ completedChapters: 1, totalChapters: 7 }) }
}));

function mockDesktopQuery(initial) {
  const listeners = new Set();
  const query = {
    matches: initial,
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener)
  };
  vi.stubGlobal('matchMedia', () => query);
  return desktop => act(() => {
    query.matches = desktop;
    listeners.forEach(listener => listener(query));
  });
}

function NavigationFixture({ withHeader = false }) {
  return (
    <SidebarProvider>
      {withHeader ? <Header /> : <SidebarTrigger />}
      <Sidebar>
        <SidebarContent>
          <a href="/chapter1" onClick={event => event.preventDefault()}>First chapter</a>
          <a href="/chapter2" onClick={event => event.preventDefault()}>Second chapter</a>
        </SidebarContent>
      </Sidebar>
      <ContentWrapper><button>Check answer</button></ContentWrapper>
      <FooterWrapper><footer>Footer</footer></FooterWrapper>
    </SidebarProvider>
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('responsive course navigation', () => {
  it('keeps closed desktop navigation inert and restores it from the menu', () => {
    mockDesktopQuery(true);
    localStorage.setItem('sidebarOpen', 'false');
    render(<NavigationFixture />);
    const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
    const sidebar = document.getElementById(trigger.getAttribute('aria-controls'));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(sidebar).toHaveAttribute('inert');
    expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('link', { name: 'First chapter' })).not.toBeInTheDocument();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(sidebar).not.toHaveAttribute('inert');
    expect(screen.getByRole('link', { name: 'First chapter' })).toBeInTheDocument();
  });

  it('contains mobile keyboard focus, dismisses with Escape, and returns focus', async () => {
    mockDesktopQuery(false);
    render(<NavigationFixture />);
    const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
    expect(screen.queryByRole('link', { name: 'First chapter' })).not.toBeInTheDocument();
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Course navigation' });
    expect(dialog).toHaveAttribute('id', trigger.getAttribute('aria-controls'));
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const close = screen.getByRole('button', { name: 'Close sidebar' });
    const lastLink = screen.getByRole('link', { name: 'Second chapter' });
    lastLink.focus();
    fireEvent.keyDown(lastLink, { key: 'Tab' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(lastLink).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Check answer' })).not.toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeInTheDocument();
  });

  it('closes the mobile overlay after following a course link and preserves scroll position', async () => {
    mockDesktopQuery(false);
    render(<NavigationFixture />);
    const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
    fireEvent.click(trigger);
    const first = screen.getByRole('link', { name: 'First chapter' });
    first.parentElement.scrollTop = 120;
    fireEvent.click(first);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(trigger);
    expect(screen.getByRole('link', { name: 'First chapter' }).parentElement.scrollTop).toBe(120);
  });

  it('preserves the desktop preference while switching screen sizes and using the mobile menu', async () => {
    const resize = mockDesktopQuery(true);
    render(<NavigationFixture />);
    let trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(trigger);
    expect(localStorage.getItem('sidebarOpen')).toBe('false');
    resize(false);
    trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(localStorage.getItem('sidebarOpen')).toBe('false');
    resize(true);
    trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('keeps desktop navigation working when browser storage is blocked', () => {
    mockDesktopQuery(true);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    render(<NavigationFixture />);
    const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('places the menu in the header flow and keeps logo and resources accessible', async () => {
    mockDesktopQuery(false);
    render(<NavigationFixture withHeader />);
    const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
    expect(trigger.closest('header')).toBeInTheDocument();
    expect(trigger).not.toHaveClass('fixed');
    expect(screen.getByRole('link', { name: 'Probability Lab' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Resources' })).toHaveAttribute('href', '/resources');
    await waitFor(() => expect(screen.getByText('1/7')).toBeInTheDocument());
  });
});
