# Render mathematics in a lesson

Use the existing MathJax provider and shared hook or section wrapper. They wait for renderer readiness, serialize work, retire removed content and expose failures through the shared retry flow. MathJax recommends sequencing asynchronous typesetting and clearing removed math; the application owns those operations in [its runtime](../src/lib/mathjax/runtime.js). See the [MathJax 3.2 typesetting documentation](https://docs.mathjax.org/en/v3.2/web/typeset.html).

## Render a section

[MathJaxSection](../src/components/ui/MathJaxSection.jsx) handles its children through the shared hook. Give formulas their inline or display delimiters and render strings as React text:

```jsx
import MathJaxSection from '@/components/ui/MathJaxSection';

export default function ExpectationFormula() {
  return (
    <MathJaxSection>
      <p>{String.raw`\(\mathbb{E}[X] = \mu\)`}</p>
      <p>{String.raw`\[\operatorname{Var}(X) = \mathbb{E}[X^2] - (\mathbb{E}[X])^2\]`}</p>
    </MathJaxSection>
  );
}
```

`String.raw` keeps TeX backslashes. An ordinary JavaScript string expression such as `{'\\(\\mu\\)'}` also works; both single-quoted and double-quoted JavaScript strings require escaped backslashes. JSX quoted attributes are a different syntax. Choose one string convention consistently and check the resulting formula.

## Update a formula

[useMathJax](../src/hooks/useMathJax.js) accepts either a dependency array and returns its own ref, or an existing object ref followed by a dependency array. Include values that change the rendered mathematical content:

```jsx
'use client';

import { useMathJax } from '@/hooks/useMathJax';

export default function ExpectedValue({ mean }) {
  const contentRef = useMathJax([mean]);

  return (
    <div ref={contentRef}>
      {Number.isFinite(mean)
        ? <span>{String.raw`\(\mathbb{E}[X] = ${mean}\)`}</span>
        : <p>Enter a finite mean.</p>}
    </div>
  );
}
```

The existing-ref form is `useMathJax(contentRef, [mean])`, with `contentRef` created by `useRef(null)`. Choose either the hook or the section wrapper to own a region. For independently changing nested content, define child components at module scope and give each region its own stable owner.

A formula-bearing button needs an accessible name that describes its action, such as “Show the variance derivation.” Keep calculation state in React and rendering work in the shared runtime. Adding a per-component timer or calling `window.MathJax.typesetPromise` directly creates a separate rendering lane.

## Keep text and TeX within their boundaries

Render imported questions, explanations and other external strings as React text. The provider requires the configured Safe extension and restricts TeX URLs, classes, IDs and styling; those checks supplement text escaping. See the [MathJax Safe options](https://docs.mathjax.org/en/v3.2/options/safe.html) and [runtime safety controls](../tests/mathjax/runtime/safety.test.js).

Existing static authored formulas may use `dangerouslySetInnerHTML`. For a component that requires those legacy props, `useLatexString(latex, inline)` escapes the text before adding delimiters. Use it only inside a region owned by the shared renderer. Preserve the safety configuration when changing the loader or renderer.

Math notation and JavaScript have separate jobs. `\rho_{XY}` gives two mathematical indices; `\rho_{\text{sample}}` gives a descriptive text subscript. Choose the notation for its meaning. Choose layout classes for spacing, contrast and wrapping.

## Make long equations usable

Provide a named scrolling region for a long equation, with keyboard focus and a visible focus indicator. Keep a readable explanation beside the formula. For example:

```jsx
import MathJaxSection from '@/components/ui/MathJaxSection';

export default function SampleSizeFormula() {
  return (
    <div
      role="region"
      aria-label="Sample-size planning equation"
      tabIndex={0}
      className="min-w-0 max-w-full overflow-x-auto rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400"
    >
      <MathJaxSection className="w-max min-w-full">
        {String.raw`\[n = \left(\frac{z_{\alpha/2}\sigma}{E}\right)^2\]`}
      </MathJaxSection>
    </div>
  );
}
```

At phone widths, shorten labels or stack a derivation where that keeps the meaning clear. Use scrolling when the complete equation needs more space, and keep the page itself within the viewport.

## Verify the rendered lesson

Run `npm run test -- tests/mathjax` for the shared renderer controls and `npm run check` before submitting code changes. Exercise the changed page with its actual controls: update numbers, toggle details, switch tabs, leave and return, and use the shared retry after a rendering failure. Check fractions, roots, subscripts, raw delimiters, visible errors and keyboard access at desktop and phone widths. A successful build alone does not establish mathematical or rendering correctness.

[Tabbed module guide](tabbed-learning-guide.md) · [Contributing](../CONTRIBUTING.md)
