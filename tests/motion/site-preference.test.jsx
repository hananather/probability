import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionPreferenceProvider, MOTION_STORAGE_KEY } from '@/components/shared/MotionPreferenceProvider';
import { MotionPreferenceControl } from '@/components/shared/MotionPreferenceControl';
import HeroSection from '@/components/landing/components/HeroSection';
import FloatingSymbols from '@/components/landing/components/FloatingSymbols';
import JourneyPath from '@/components/landing/components/JourneyPath';
import { Header } from '@/components/layout/Header';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { installMotionEnvironment } from './environment';

vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
vi.mock('next/navigation', () => ({ usePathname: () => '/chapter1' }));
vi.mock('@/components/ui/sidebar', () => ({ SidebarTrigger: () => <button type="button">Menu</button> }));
vi.mock('@/hooks/useProgress', () => ({ useProgress: () => ({ overallStats: { completedChapters: 0, totalChapters: 7 }, loading: false }) }));

function Probe() {
  return <span data-testid="effective-motion">{String(useReducedMotion())}</span>;
}

function PreferenceFixture() {
  return <MotionPreferenceProvider><MotionPreferenceControl /><Probe /></MotionPreferenceProvider>;
}

function crossTabPreference(raw, key = MOTION_STORAGE_KEY) {
  if (raw === null) window.localStorage.removeItem(key);
  else window.localStorage.setItem(key, raw);
  window.dispatchEvent(new StorageEvent('storage', { key, newValue: raw, storageArea: window.localStorage }));
}

describe('site motion preference', () => {
  let environment;
  beforeEach(() => { environment = installMotionEnvironment(); });
  afterEach(() => { environment.restore(); });

  it('stops the homepage decorations, disables animated scrolling and resumes when the device permits', () => {
    const { container } = render(
      <MotionPreferenceProvider>
        <HeroSection /><FloatingSymbols /><JourneyPath currentSection={2} scrollProgress={0.4} />
        <section id="chapters" />
      </MotionPreferenceProvider>
    );
    const button = screen.getByRole('button', { name: 'Reduce motion' });
    const symbol = container.querySelector('[aria-hidden="true"].fixed .absolute');
    const title = screen.getByRole('heading', { name: 'Probability Lab' }).querySelector('span');
    const scroll = vi.fn();
    container.querySelector('#chapters').scrollIntoView = scroll;

    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(symbol.style.animationName).toBe('probability-symbol-float');
    expect(container.querySelector('.probability-journey-pulse')).not.toBeNull();
    expect(title).toHaveClass('animate-gradient');
    button.focus();
    fireEvent.click(button);
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(symbol.style.animationName).toBe('none');
    expect(container.querySelector('.probability-journey-pulse')).toBeNull();
    expect(title).not.toHaveClass('animate-gradient');
    expect(document.documentElement).toHaveAttribute('data-reduced-motion', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Start Learning' }));
    expect(scroll).toHaveBeenLastCalledWith({ behavior: 'auto', block: 'start' });
    expect(window.localStorage.getItem(MOTION_STORAGE_KEY)).toBe('true');

    fireEvent.click(button);
    expect(symbol.style.animationName).toBe('probability-symbol-float');
    expect(container.querySelector('.probability-journey-pulse')).not.toBeNull();
    expect(title).toHaveClass('animate-gradient');
    expect(document.documentElement).toHaveAttribute('data-reduced-motion', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Start Learning' }));
    expect(scroll).toHaveBeenLastCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('keeps the device preference authoritative when the site choice is turned off', () => {
    render(<PreferenceFixture />);
    const button = screen.getByRole('button', { name: 'Reduce motion' });
    fireEvent.click(button);
    act(() => environment.setReduced(true));
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('true');
    expect(document.documentElement).toHaveAttribute('data-reduced-motion', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Your device requests reduced motion');
    act(() => environment.setReduced(false));
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('false');
  });

  it('describes the safe fallback honestly when the device preference API is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    render(<PreferenceFixture />);
    const button = screen.getByRole('button', { name: 'Reduce motion' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('true');
    expect(screen.getByRole('status')).toHaveTextContent('device preference is unavailable');
    expect(screen.getByRole('status')).not.toHaveTextContent('Your device requests');
  });

  it('restores the saved site preference on remount and shares changes between tab events', () => {
    const first = render(<PreferenceFixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Reduce motion' }));
    first.unmount();
    render(<PreferenceFixture />);
    expect(screen.getByRole('button', { name: 'Reduce motion' })).toHaveAttribute('aria-pressed', 'true');
    act(() => crossTabPreference('false'));
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('false');
    act(() => crossTabPreference('true'));
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('true');
    act(() => crossTabPreference(null));
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('false');
    act(() => crossTabPreference('true'));
    act(() => {
      window.localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key: null, storageArea: window.localStorage }));
    });
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('false');
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: MOTION_STORAGE_KEY, newValue: 'true', storageArea: window.sessionStorage })));
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('false');
    act(() => crossTabPreference('true', 'unrelated-setting'));
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('false');
    expect(window.localStorage.getItem('unrelated-setting')).toBe('true');
  });

  it('keeps a blocked write usable in memory and explains that it applies to this session', () => {
    render(<PreferenceFixture />);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    const button = screen.getByRole('button', { name: 'Reduce motion' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('true');
    expect(screen.getByRole('status')).toHaveTextContent('until you reload');
    fireEvent.click(button);
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('false');
  });

  it('retains the session choice if reads become unavailable during a storage notification', () => {
    render(<PreferenceFixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Reduce motion' }));
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Read denied'); });
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: null })));
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('true');
    expect(screen.getByRole('status')).toHaveTextContent('Browser storage is unavailable');
  });

  it('starts safely if reading storage is blocked and does not promise persistence for a silent failed write', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Read denied'); });
    render(<PreferenceFixture />);
    expect(screen.getByRole('status')).toHaveTextContent('until you reload');
    getItem.mockRestore();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    fireEvent.click(screen.getByRole('button', { name: 'Reduce motion' }));
    expect(screen.getByTestId('effective-motion')).toHaveTextContent('true');
    expect(screen.getByRole('status')).toHaveTextContent('until you reload');
  });

  it('pauses the title gradient while hidden and preserves reduction when the page returns', () => {
    render(<MotionPreferenceProvider><HeroSection /></MotionPreferenceProvider>);
    const title = screen.getByRole('heading', { name: 'Probability Lab' }).querySelector('span');
    act(() => environment.setVisible(false));
    expect(title.style.animationPlayState).toBe('paused');
    fireEvent.click(screen.getByRole('button', { name: 'Reduce motion' }));
    act(() => environment.setVisible(true));
    expect(title).not.toHaveClass('animate-gradient');
    fireEvent.click(screen.getByRole('button', { name: 'Reduce motion' }));
    expect(title).toHaveClass('animate-gradient');
    expect(title.style.animationPlayState).toBe('running');
  });

  it('shares one device listener and one storage listener, then restores the CSS flag on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const previous = document.documentElement.getAttribute('data-reduced-motion');
    const { unmount } = render(<MotionPreferenceProvider><Probe /><Probe /><MotionPreferenceControl /></MotionPreferenceProvider>);
    expect(environment.listeners.size).toBe(1);
    expect(add.mock.calls.filter(([type]) => type === 'storage')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Reduce motion' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reduce motion' }));
    expect(environment.listeners.size).toBe(1);
    unmount();
    expect(environment.listeners.size).toBe(0);
    expect(remove.mock.calls.filter(([type]) => type === 'storage')).toHaveLength(1);
    expect(document.documentElement.getAttribute('data-reduced-motion')).toBe(previous);
  });

  it('renders static decoration before the saved browser choice is read during hydration', () => {
    const markup = renderToString(<MotionPreferenceProvider><HeroSection /><FloatingSymbols /><JourneyPath currentSection={2} scrollProgress={0.4} /><Probe /></MotionPreferenceProvider>);
    expect(markup).not.toContain('animate-gradient');
    expect(markup).not.toContain('class="probability-journey-pulse"');
    expect(markup).toContain('animation-name:none');
    expect(markup).toContain('data-testid="effective-motion">true');
  });

  it('makes the control available in the non-homepage header', async () => {
    await act(async () => { render(<MotionPreferenceProvider><Header /></MotionPreferenceProvider>); });
    const button = screen.getByRole('button', { name: 'Reduce motion' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveClass('focus-visible:ring-2');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveAttribute('data-reduced-motion', 'true');
    expect(screen.getByRole('link', { name: 'Resources' })).toHaveAttribute('href', '/resources');
  });
});
