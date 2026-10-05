import { vi } from 'vitest';

export function installMotionEnvironment({ reduced = false, visible = true } = {}) {
  const listeners = new Set();
  const media = {
    matches: reduced,
    addEventListener: vi.fn((_, listener) => listeners.add(listener)),
    removeEventListener: vi.fn((_, listener) => listeners.delete(listener))
  };
  vi.stubGlobal('matchMedia', vi.fn(() => media));
  let visibility = visible ? 'visible' : 'hidden';
  const visibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState');
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });

  let nextFrame = 0;
  const frames = new Map();
  const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    const id = ++nextFrame;
    frames.set(id, callback);
    return id;
  });
  const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => frames.delete(id));

  return {
    media, listeners, frames, requestFrame, cancelFrame,
    setReduced(value) {
      media.matches = value;
      listeners.forEach(listener => listener({ matches: value }));
    },
    setVisible(value) {
      visibility = value ? 'visible' : 'hidden';
      document.dispatchEvent(new Event('visibilitychange'));
    },
    flushFrames(timestamp) {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback(timestamp));
    },
    restore() {
      if (visibilityDescriptor) Object.defineProperty(document, 'visibilityState', visibilityDescriptor);
      else delete document.visibilityState;
      vi.unstubAllGlobals();
    }
  };
}

export function installObserverMock(name = 'IntersectionObserver') {
  const observers = [];
  vi.stubGlobal(name, class {
    constructor(callback) {
      this.callback = callback;
      this.observe = vi.fn();
      this.disconnect = vi.fn();
      observers.push(this);
    }
  });
  return observers;
}
