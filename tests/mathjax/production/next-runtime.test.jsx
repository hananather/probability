import React, { act } from 'next/dist/compiled/react';
import { createRoot } from 'next/dist/compiled/react-dom/client';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { JsdomAdaptor } from 'mathjax-full/js/adaptors/jsdomAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { SafeHandler } from 'mathjax-full/js/ui/safe/SafeHandler.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import NormalZScoreWorkedExample from '@/components/03-continuous-random-variables/3-3-normal-distribution/3-3-2-NormalZScoreWorkedExample';
import { createMathJaxConfig } from '@/lib/mathjax/config';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';

// Next's App Router uses its bundled React. Its HTML updates differ from the
// separately installed React DOM and can replace already typeset mathematics.
vi.mock('react', () => import('next/dist/compiled/react'));
vi.mock('react/jsx-runtime', () => import('next/dist/compiled/react/jsx-runtime'));
vi.mock('react/jsx-dev-runtime', () => import('next/dist/compiled/react/jsx-dev-runtime'));
const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({
  ...(await importOriginal()),
  getMathJaxRuntime: () => shared.runtime,
}));

let root;
let container;
let originalActEnvironment;

beforeAll(() => {
  originalActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = null;
  container?.remove();
  shared.runtime?.dispose();
  shared.runtime = null;
  delete window.MathJax;
});

afterAll(() => {
  if (originalActEnvironment === undefined) delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  else globalThis.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
});

async function settle() {
  await act(async () => {
    for (let index = 0; index < 80; index += 1) await Promise.resolve();
  });
}

it('retains the actual worked-example formulas after successful rendering and updated inputs', async () => {
  const config = createMathJaxConfig();
  SafeHandler(RegisterHTMLHandler(new JsdomAdaptor(window)));
  const documentEngine = mathjax.document(document, {
    InputJax: new TeX({ ...config.tex, packages: AllPackages }),
    OutputJax: new CHTML(),
    safeOptions: config.options.safeOptions,
  });
  const sourcePasses = [];
  window.MathJax = {
    version: mathjax.version,
    startup: { promise: Promise.resolve(), document: documentEngine },
    typesetClear: vi.fn(elements => documentEngine.clearMathItemsWithin(elements)),
    typesetPromise: vi.fn(async elements => {
      sourcePasses.push(elements[0].textContent);
      documentEngine.options.elements = elements;
      documentEngine.reset();
      documentEngine.render();
    }),
  };
  shared.runtime = createMathJaxRuntime();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => root.render(React.createElement(NormalZScoreWorkedExample)));
  await settle();

  expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(1);
  expect(sourcePasses[0]).toContain('\\mu=100, \\sigma=15');
  expect(container.querySelectorAll('mjx-container')).toHaveLength(9);
  expect(container.textContent).not.toMatch(/\\[([]/);
  expect(shared.runtime.getSnapshot()).toMatchObject({ status: 'ready', error: null, stalled: false });

  const firstRenderedFormula = container.querySelector('mjx-container');
  await settle();
  expect(container.querySelector('mjx-container')).toBe(firstRenderedFormula);
  expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(1);

  await act(async () => root.render(React.createElement(NormalZScoreWorkedExample, {
    mu: 80,
    sigma: 10,
    xValue: 75,
    zScore: -0.5,
    probability: 0.3085,
  })));
  await settle();

  expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
  expect(sourcePasses[1]).toContain('\\mu=80, \\sigma=10');
  expect(sourcePasses[1]).toContain('75.0 - 80');
  expect(sourcePasses[1]).toContain('-0.5000');
  expect(sourcePasses[1]).toContain('0.3085');
  expect(container.querySelectorAll('mjx-container')).toHaveLength(9);
  expect(container.textContent).not.toMatch(/\\[([]/);
  expect(container.textContent).toContain('below');
  expect(container.textContent).toContain('30.9%');

  const updatedRenderedFormula = container.querySelector('mjx-container');
  expect(updatedRenderedFormula).not.toBe(firstRenderedFormula);
  await settle();
  expect(container.querySelector('mjx-container')).toBe(updatedRenderedFormula);
  expect(container.querySelectorAll('mjx-container')).toHaveLength(9);
  expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
  expect(shared.runtime.getSnapshot()).toMatchObject({ status: 'ready', error: null, stalled: false });
});
