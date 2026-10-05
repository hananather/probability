import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LandingAcademic from '@/components/landing/LandingAcademic';
import { installMotionEnvironment, installObserverMock } from './environment';

vi.mock('@/components/layout/Footer', () => ({ Footer: () => null }));
vi.mock('next/dynamic', () => ({
  default: () => function DynamicStub({ currentSection, scrollProgress, onSectionRef }) {
    const sectionRef = React.useRef(null);
    React.useEffect(() => {
      if (!onSectionRef) return;
      onSectionRef(2, sectionRef.current);
      return () => onSectionRef(2, null);
    }, [onSectionRef]);

    if (onSectionRef) return <section ref={sectionRef} data-section="2" />;
    if (currentSection !== undefined) {
      return <output data-testid="journey-state" data-section={currentSection} data-progress={scrollProgress} />;
    }
    return null;
  }
}));

describe('landing scroll updates', () => {
  let environment;
  let observers;
  let scrollTop;
  beforeEach(() => {
    environment = installMotionEnvironment();
    observers = installObserverMock('ResizeObserver');
    scrollTop = 0;
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollTop);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1000);
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(2000);
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top: 100, height: 800 });
  });
  afterEach(() => { environment.restore(); });

  it('coalesces events into one frame and keeps chapter IDs when sections load out of order', () => {
    const addListener = vi.spyOn(window, 'addEventListener');
    render(<LandingAcademic />);
    expect(addListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    expect(environment.frames.size).toBe(1);
    act(() => environment.flushFrames(0));
    expect(screen.getByTestId('journey-state')).toHaveAttribute('data-section', '-1');

    scrollTop = 500;
    for (let i = 0; i < 30; i++) fireEvent.scroll(window);
    expect(environment.frames.size).toBe(1);
    expect(environment.requestFrame).toHaveBeenCalledTimes(2);
    act(() => environment.flushFrames(16));
    expect(screen.getByTestId('journey-state')).toHaveAttribute('data-section', '2');
    expect(screen.getByTestId('journey-state')).toHaveAttribute('data-progress', '0.5');
    expect(environment.frames.size).toBe(0);
  });

  it('cancels pending work while hidden and removes listeners and observers on unmount', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<LandingAcademic />);
    expect(environment.frames.size).toBe(1);
    act(() => environment.setVisible(false));
    expect(environment.frames.size).toBe(0);
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
    fireEvent.scroll(window);
    expect(environment.frames.size).toBe(0);
    act(() => environment.setVisible(true));
    expect(environment.frames.size).toBe(1);
    unmount();
    expect(environment.frames.size).toBe(0);
    expect(observers[1].disconnect).toHaveBeenCalledTimes(1);
    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
