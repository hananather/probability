import React, { act, StrictMode } from 'next/dist/compiled/react';
import { createRoot } from 'next/dist/compiled/react-dom/client';
import { fireEvent, getByRole } from '@testing-library/dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import CorrelationCoefficient from '@/components/07-linear-regression/7-1-CorrelationCoefficient';

vi.mock('react', () => import('next/dist/compiled/react'));
vi.mock('react/jsx-runtime', () => import('next/dist/compiled/react/jsx-runtime'));
vi.mock('react/jsx-dev-runtime', () => import('next/dist/compiled/react/jsx-dev-runtime'));
vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => {} }));
vi.mock('@/components/ui/BackToHub', () => ({ default: () => null }));
vi.mock('@/components/reference-sheets/Chapter7ReferenceSheet', () => ({
  Chapter7ReferenceSheet: () => <aside aria-label="Chapter 7 reference sheet" />,
}));
vi.mock('framer-motion', async () => {
  const React = await import('next/dist/compiled/react');
  const components = new Map();
  const motion = new Proxy({}, { get(_target, tag) {
    if (!components.has(tag)) components.set(tag, React.forwardRef(function Motion({ children, initial, animate, exit, transition, whileHover, whileTap, layout, ...props }, ref) {
      void initial; void animate; void exit; void transition; void whileHover; void whileTap; void layout;
      return React.createElement(tag, { ...props, ref }, children);
    }));
    return components.get(tag);
  } });
  return { motion, AnimatePresence: ({ children }) => children };
});

let root, container, width, observers;
let originalBounds, originalActEnvironment, originalWidth;

class ChartResizeObserver {
  constructor(callback) { this.callback = callback; this.active = true; this.disconnect = vi.fn(() => { this.active = false; }); observers.push(this); }
  observe(element) { this.element = element; }
}

async function mount({ strict = false } = {}) {
  container = document.createElement('div'); document.body.appendChild(container);
  root = createRoot(container);
  const lesson = React.createElement(CorrelationCoefficient);
  await act(async () => root.render(strict ? <StrictMode>{lesson}</StrictMode> : lesson));
}

async function resize(nextWidth) {
  width = nextWidth;
  await act(async () => {
    for (const observer of observers.filter(item => item.active)) observer.callback([{ target: observer.element, contentRect: { width } }]);
  });
}

function main() { return container.querySelector('.main-visualization')?.ownerSVGElement || container.querySelector('svg[aria-label$="correlation scatterplot"]'); }
function gallery() { return container.querySelector('.main-group')?.ownerSVGElement || container.querySelector('svg[aria-label$="scatterplot"]:not([aria-label$="correlation scatterplot"])'); }
function data(svg) { return [...svg.querySelectorAll('.dot')].map(point => ({ x: point.__data__.x, y: point.__data__.y })); }
function correlation(svg) { return [...svg.querySelectorAll('text')].find(text => text.textContent.startsWith('r = '))?.textContent; }

function expectGeometry(svg, expectedWidth, left, right, top, bottom, height) {
  expect(svg.getAttribute('viewBox')).toBe(`0 0 ${expectedWidth} ${height}`);
  const points = [...svg.querySelectorAll('.dot')]; expect(points).toHaveLength(20);
  for (const point of points) {
    const x = Number(point.getAttribute('cx')); const y = Number(point.getAttribute('cy'));
    expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
    expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(expectedWidth - left - right);
    expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(height - top - bottom);
  }
}

beforeAll(() => {
  originalActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT; globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  originalBounds = SVGElement.prototype.getBoundingClientRect;
  originalWidth = Object.getOwnPropertyDescriptor(SVGElement.prototype, 'clientWidth');
  // Layout is supplied at the SVG boundary; axes, scales, data joins and controls are real D3.
  SVGElement.prototype.getBoundingClientRect = () => ({ width, height: 500 });
  Object.defineProperty(SVGElement.prototype, 'clientWidth', { configurable: true, get: () => width });
});
beforeEach(() => { width = 800; observers = []; vi.stubGlobal('ResizeObserver', ChartResizeObserver); });
afterEach(async () => { if (root) await act(async () => root.unmount()); root = null; container?.remove(); vi.unstubAllGlobals(); });
afterAll(() => {
  SVGElement.prototype.getBoundingClientRect = originalBounds;
  if (originalWidth) Object.defineProperty(SVGElement.prototype, 'clientWidth', originalWidth);
  else delete SVGElement.prototype.clientWidth;
  if (originalActEnvironment === undefined) delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  else globalThis.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
});

describe('correlation chart responsiveness and retained controls', () => {
  it('remeasures both diagrams on desktop-to-mobile-to-desktop resize without changing their data', async () => {
    await mount();
    const originalMain = data(main()), originalGallery = data(gallery());
    const originalR = correlation(main());
    expectGeometry(main(), 800, 60, 40, 40, 60, 500);
    expectGeometry(gallery(), 800, 40, 20, 20, 40, 300);
    const desktopTicks = main().querySelector('g.main-visualization > g').querySelectorAll('.tick').length;
    await resize(256);
    expectGeometry(main(), 256, 60, 40, 40, 60, 500);
    expectGeometry(gallery(), 256, 40, 20, 20, 40, 300);
    expect(main().querySelector('g.main-visualization > g').querySelectorAll('.tick').length).toBeLessThan(desktopTicks);
    expect(data(main())).toEqual(originalMain); expect(data(gallery())).toEqual(originalGallery);
    expect(correlation(main())).toBe(originalR);
    await resize(1100);
    expectGeometry(main(), 1100, 60, 40, 40, 60, 500);
    expectGeometry(gallery(), 1100, 40, 20, 20, 40, 300);
    expect(data(main())).toEqual(originalMain); expect(data(gallery())).toEqual(originalGallery);
  });

  it('keeps narrow-width scenario, deviation, gallery and insight controls connected to the current diagram', async () => {
    await mount(); await resize(256);
    await act(async () => fireEvent.click(getByRole(container, 'checkbox', { name: 'Show deviations from means' })));
    expect(main().querySelectorAll('.deviation-rect')).toHaveLength(20);
    await act(async () => fireEvent.click(getByRole(container, 'button', { name: 'Strong Negative', exact: true })));
    expect(correlation(main())).toMatch(/^r = -/); expectGeometry(main(), 256, 60, 40, 40, 60, 500);
    expect(main().querySelectorAll('.deviation-rect')).toHaveLength(20);
    await act(async () => fireEvent.click(getByRole(container, 'button', { name: 'Non-linear (r ≈ 0.0)' })));
    expectGeometry(gallery(), 256, 40, 20, 20, 40, 300);
    expect(container.textContent).toContain('Strong pattern but not linear (parabola)');
    expect(gallery().querySelector('line[stroke="#a855f7"]')).toBeNull();
    await act(async () => fireEvent.click(getByRole(container, 'button', { name: 'Scale Invariant' })));
    expect(getByRole(container, 'button', { name: 'Scale Invariant' })).toHaveAttribute('aria-pressed', 'true');
    expect(container.textContent).toContain('One negative scale factor reverses the sign');
    await resize(800); expect(correlation(main())).toMatch(/^r = -/);
  });

  it('handles zero-width mounting, repeated measurements and StrictMode observer cleanup', async () => {
    width = 0; await mount({ strict: true });
    expect(main().querySelector('.main-visualization')).toBeNull();
    expect(observers.filter(observer => observer.active)).toHaveLength(2);
    await resize(256); expectGeometry(main(), 256, 60, 40, 40, 60, 500);
    const group = main().querySelector('.main-visualization');
    await resize(256); expect(main().querySelector('.main-visualization')).toBe(group);
    await act(async () => root.unmount()); root = null;
    expect(observers.filter(observer => observer.active)).toHaveLength(0);
    expect(observers.every(observer => observer.disconnect.mock.calls.length === 1)).toBe(true);
  });

  it('retains a working window-resize fallback and removes its two listeners', async () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const add = vi.spyOn(window, 'addEventListener'), remove = vi.spyOn(window, 'removeEventListener');
    await mount(); width = 256;
    await act(async () => window.dispatchEvent(new Event('resize')));
    expectGeometry(main(), 256, 60, 40, 40, 60, 500);
    expectGeometry(gallery(), 256, 40, 20, 20, 40, 300);
    const callbacks = add.mock.calls.filter(([name]) => name === 'resize').map(([, callback]) => callback);
    expect(callbacks).toHaveLength(2);
    await act(async () => root.unmount()); root = null;
    for (const callback of callbacks) expect(remove).toHaveBeenCalledWith('resize', callback);
  });

  it('keeps complete long equations in labeled keyboard-focusable containers after reveal', async () => {
    await mount(); await resize(256);
    const definition = getByRole(container, 'region', { name: 'Correlation definition formula' });
    definition.focus(); expect(document.activeElement).toBe(definition);
    expect(definition.textContent).toContain('\\sum_{i=1}^{n}');
    await act(async () => fireEvent.click(getByRole(container, 'button', { name: 'Show Worked Example: Fuel Quality Analysis' })));
    const crossProduct = getByRole(container, 'region', { name: 'Computational cross product' });
    crossProduct.focus(); expect(document.activeElement).toBe(crossProduct);
    expect(crossProduct.textContent).toContain('\\frac{(\\sum x_i)(\\sum y_i)}{n}');
    expect(crossProduct.textContent).toContain('2214.66');
  });

  it('leaves the reference sheet with its existing route owner', async () => {
    await mount();
    expect(container.querySelectorAll('aside[aria-label="Chapter 7 reference sheet"]')).toHaveLength(0);
    const route = readFileSync('src/app/chapter7/correlation-coefficient/page.js', 'utf8');
    expect(route.match(/<Chapter7ReferenceSheet\b/g)).toHaveLength(1);
  });
});
