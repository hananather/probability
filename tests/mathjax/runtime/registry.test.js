import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { JsdomAdaptor } from 'mathjax-full/js/adaptors/jsdomAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { SafeHandler } from 'mathjax-full/js/ui/safe/SafeHandler.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMathJaxConfig } from '@/lib/mathjax/config';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { deferred, tick } from './fixtures';

let runtime;
let engine;
let renderEngine;
let owners;
const source = value => `\\(${value}\\)`;
const registered = () => Array.from(engine.math).map(item => item.math);
function owner(value) {
  const node = document.createElement('span');
  node.textContent = source(value); document.body.appendChild(node); owners.push(node);
  return node;
}

beforeEach(() => {
  owners = [];
  const config = createMathJaxConfig();
  SafeHandler(RegisterHTMLHandler(new JsdomAdaptor(window)));
  engine = mathjax.document(document, {
    InputJax: new TeX({ ...config.tex, packages: AllPackages }), OutputJax: new CHTML(),
    safeOptions: config.options.safeOptions,
  });
  renderEngine = elements => { engine.options.elements = elements; engine.reset(); engine.render(); };
  window.MathJax = {
    version: mathjax.version, startup: { promise: Promise.resolve(), document: engine },
    typesetPromise: vi.fn(async elements => renderEngine(elements)),
    typesetClear: vi.fn(elements => engine.clearMathItemsWithin(elements)),
  };
  runtime = createMathJaxRuntime();
});
afterEach(() => {
  runtime.dispose(); owners.forEach(node => node.remove()); delete window.MathJax;
});

describe('the real MathJax registry follows scoped output ownership', () => {
  it('clears output detached by an authored HTML replacement before the next scoped render', async () => {
    const node = owner('x'); await runtime.enqueue(node).promise;
    const oldOutput = node.querySelector('mjx-container');
    node.textContent = source('y');
    expect(oldOutput.isConnected).toBe(false);
    await runtime.enqueue(node, { update() {} }).promise;
    expect(registered()).toEqual(['y']);
    expect(window.MathJax.typesetClear).toHaveBeenCalledWith([node, oldOutput]);
    await runtime.retire(node);
    expect(registered()).toEqual([]);
  });

  it('captures output inserted and then detached before a held renderer completes', async () => {
    const rendered = deferred(); const held = deferred();
    window.MathJax.typesetPromise.mockImplementationOnce(async elements => {
      renderEngine(elements); rendered.resolve(); await held.promise;
    });
    const node = owner('x'); const first = runtime.enqueue(node);
    await rendered.promise;
    const oldOutput = node.querySelector('mjx-container');
    node.textContent = source('y');
    held.resolve(); await first.promise;
    await runtime.enqueue(node, { update() {} }).promise;
    expect(registered()).toEqual(['y']);
    expect(window.MathJax.typesetClear).toHaveBeenCalledWith([node, oldOutput]);
  });

  it('clears held output after cancellation and retirement without overlapping the active renderer', async () => {
    const rendered = deferred(); const held = deferred();
    window.MathJax.typesetPromise.mockImplementationOnce(async elements => {
      renderEngine(elements); rendered.resolve(); await held.promise;
    });
    const node = owner('x'); const request = runtime.enqueue(node);
    await rendered.promise;
    const output = node.querySelector('mjx-container'); node.remove();
    request.cancel(); const retired = runtime.retire(node);
    await tick();
    expect(window.MathJax.typesetClear).not.toHaveBeenCalled();
    expect(registered()).toEqual(['x']);
    held.resolve(); await retired;
    expect(registered()).toEqual([]);
    expect(window.MathJax.typesetClear.mock.calls.some(([roots]) => roots.includes(output))).toBe(true);
  });

  it('retires detached output for one owner while preserving another owner and its registry entry', async () => {
    const first = owner('x'); const second = owner('z');
    await runtime.enqueue(first).promise; await runtime.enqueue(second).promise;
    const siblingOutput = second.querySelector('mjx-container');
    first.replaceChildren(); await runtime.retire(first);
    expect(registered()).toEqual(['z']);
    expect(second.querySelector('mjx-container')).toBe(siblingOutput);
    await runtime.retire(second); expect(registered()).toEqual([]);
  });

  it('retires partial failed output and clears its failure without deleting healthy sibling math', async () => {
    window.MathJax.typesetPromise.mockImplementationOnce(async elements => {
      renderEngine(elements); throw new Error('partial render failure');
    });
    const first = owner('x'); const second = owner('z');
    await expect(runtime.enqueue(first).promise).rejects.toThrow('partial render failure');
    await runtime.enqueue(second).promise;
    expect(runtime.getSnapshot().error).not.toBeNull();
    first.replaceChildren(); await runtime.retire(first);
    expect(registered()).toEqual(['z']);
    expect(runtime.getSnapshot().error).toBeNull();
  });
});
