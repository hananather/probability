import { describe, expect, it } from 'vitest';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { SafeHandler } from 'mathjax-full/js/ui/safe/SafeHandler.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { Safe } from 'mathjax-full/js/ui/safe/safe.js';
import { createMathJaxConfig, MATHJAX_CONFIG_SCRIPT, MATHJAX_VERSION } from '@/lib/mathjax/config';
import { hardenMathJaxSafeUrls } from '@/lib/mathjax/safety';

const adaptor = liteAdaptor();
SafeHandler(RegisterHTMLHandler(adaptor));
function renderTeX(tex) {
  const config = createMathJaxConfig();
  const document = mathjax.document('', {
    InputJax: new TeX({ ...config.tex, packages: AllPackages }),
    OutputJax: new CHTML(),
    safeOptions: config.options.safeOptions,
  });
  hardenMathJaxSafeUrls({ startup: { document } }, 'https://probability.example/chapter1/lesson');
  const html = adaptor.outerHTML(document.convert(tex, { display: false }));
  const container = window.document.createElement('div');
  container.innerHTML = html;
  return { container, safe: document.safe };
}

describe('real pinned MathJax safety filters', () => {
  it('pins matching production/dev runtimes and preserves the actual delimiters without an early readiness event', () => {
    expect(mathjax.version).toBe(MATHJAX_VERSION);
    const targetWindow = {};
    new Function('window', MATHJAX_CONFIG_SCRIPT)(targetWindow);
    expect(targetWindow.MathJax).toEqual(createMathJaxConfig());
    expect(targetWindow.MathJax.tex.inlineMath).toEqual([['\\(', '\\)']]);
    expect(targetWindow.MathJax.tex.displayMath).toEqual([['\\[', '\\]']]);
    expect(targetWindow.MathJax.startup).toEqual({ typeset: false });
    expect(targetWindow.MathJax.loader.load).toEqual(['ui/safe']);
  });

  it.each([
    'javascript:alert(1)', ' JAVASCRIPT:alert(1)', 'java\nscript:alert(1)', 'java\tscript:alert(1)',
    '\u0000javascript:alert(1)', 'data:text/html,hello', 'file:///tmp/private', 'vbscript:alert(1)',
  ])('removes unsafe rendered hrefs, including browser-normalized controls (%j)', url => {
    const { container } = renderTeX(`\\href{${url}}{x}`);
    expect(container.querySelector('mjx-container')).not.toBeNull();
    expect(container.querySelector('a[href]')).toBeNull();
    expect(container.querySelector('mjx-merror')).toBeNull();
  });

  it.each(['https://example.com/reference', 'http://example.com/reference', '/chapter2', '#conditional'])('retains ordinary supported links with a safe canonical browser protocol (%s)', url => {
    const { container } = renderTeX(`\\href{${url}}{x}`);
    const anchor = container.querySelector('a[href]');
    expect(anchor).not.toBeNull();
    expect(['http:', 'https:']).toContain(anchor.protocol);
    expect(anchor.href).toBe(new URL(url, 'https://probability.example/chapter1/lesson').href);
  });

  it('uses official safe styling defaults, removes positioning, and bounds large lengths', () => {
    const { container, safe } = renderTeX(String.raw`\style{position:fixed;z-index:99999;color:red;font-size:100em;margin-left:100em;padding-right:-100em}{x}`);
    expect(safe.options.safeStyles).toEqual(Safe.OPTIONS.safeStyles);
    expect(safe.options.lengthMax).toBe(Safe.OPTIONS.lengthMax);
    expect(safe.options.styleLengths.fontSize).toEqual([0.707, 1.44]);
    const styles = [...container.querySelectorAll('[style]')].map(node => node.getAttribute('style')).join(';');
    expect(styles).toContain('color: red');
    expect(styles).toContain('margin-left: 3em');
    expect(styles).toContain('padding-right: -3em');
    expect(styles).not.toMatch(/position|z-index|100em/);
  });

  it('filters unrelated imported CSS classes and IDs without deleting the formula', () => {
    const { container } = renderTeX(String.raw`\class{overlay mjx-formula}{\cssId{application-header}{x}}`);
    expect(container.querySelector('.overlay')).toBeNull();
    expect(container.querySelector('#application-header')).toBeNull();
    expect(container.querySelector('.mjx-formula')).not.toBeNull();
    expect(container.querySelector('mjx-merror')).toBeNull();
  });

  it.each([
    String.raw`P(A\mid B)=\frac{P(A\cap B)}{P(B)}`,
    String.raw`\int_0^{1-x}24xy\,dy=12x(1-x)^2`,
    String.raw`\sum_{k=0}^{n}\binom{n}{k}p^k(1-p)^{n-k}=1`,
    String.raw`\begin{cases}24xy&x,y\geq0,\ x+y\leq1\\0&\text{otherwise}\end{cases}`,
  ])('continues rendering substantive current course TeX (%s)', tex => {
    const { container } = renderTeX(tex);
    expect(container.querySelector('mjx-container')).not.toBeNull();
    expect(container.querySelector('mjx-merror')).toBeNull();
  });
});
