# LaTeX Rendering Guide

## Core Principle
Always use `dangerouslySetInnerHTML` for LaTeX content. This is the standard, reliable approach.

```jsx
<span dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\mu\\)` }} />
```

## The Standard Pattern (From Working Components)
Based on our gold standard components, use this simple and reliable pattern:

```jsx
import React, { useEffect, useRef } from "react";

const YourComponent = () => {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    return () => clearTimeout(timeoutId);
  }, [/* dependencies */]);
  
  return (
    <div ref={contentRef}>
      <span dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\mu\\)` }} />
    </div>
  );
};
```

## Key Patterns

### 1. Nested Content Toggle
Prevents parent LaTeX from disappearing when toggling child content.

```jsx
const NestedContentToggle = () => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Parent wrapped in React.memo to prevent re-render
  const ParentContent = React.memo(() => {
    const parentRef = useRef(null);
    
    useEffect(() => {
      const processMathJax = () => {
        if (window.MathJax?.typesetPromise && parentRef.current) {
          window.MathJax.typesetPromise([parentRef.current]).catch(console.error);
        }
      };
      processMathJax();
      const timeoutId = setTimeout(processMathJax, 100);
      return () => clearTimeout(timeoutId);
    }, []);
    
    return (
      <span ref={parentRef}>
        Distribution: <span dangerouslySetInnerHTML={{ __html: `\\(N(\\mu, \\sigma^2)\\)` }} />
      </span>
    );
  });
  
  return (
    <div>
      <ParentContent />
      <button onClick={() => setShowDetails(!showDetails)}>Toggle Details</button>
      {showDetails && <DetailsContent />}
    </div>
  );
};
```

### 2. Buttons with LaTeX
```jsx
<button>
  Show <span dangerouslySetInnerHTML={{ __html: `\\((x-\\mu)^2 \\cdot f(x)\\)` }} />
  for <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}[X]\\)` }} />
</button>
```

### 3. WorkedExample Pattern
```jsx
const YourWorkedExample = React.memo(function YourWorkedExample({ props }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [/* dependencies */]);
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0'
    }}>
      <p>
        Step with inline math <span dangerouslySetInnerHTML={{ __html: `\\(E[X^2]\\)` }} />:
      </p>
      <div dangerouslySetInnerHTML={{ __html: `\\[\\text{Var}(X) = E[X^2] - (E[X])^2\\]` }} />
    </div>
  );
});
```

## Common Mistakes to Avoid

```jsx
// ❌ WRONG - Won't render
<span>\(E[X] = \mu\)</span>
<button>Show E[X] = μ</button>
<p>Step with inline math \(E[X^2]\):</p>

// ✅ CORRECT
<span dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\mu\\)` }} />
<button>Show <span dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\mu\\)` }} /></button>
<p>Step with inline math <span dangerouslySetInnerHTML={{ __html: `\\(E[X^2]\\)` }} />:</p>
```

### LaTeX Re-rendering Issues
**Problem**: LaTeX "unrenders" when component state changes (e.g., during simulations)
**Solution**: Wrap LaTeX-containing sections in React.memo to prevent re-renders
```jsx
const FormulaSection = React.memo(function FormulaSection({ params }) {
  const ref = useRef(null);
  useEffect(() => {
    // MathJax processing logic
  }, [params]);
  return <div ref={ref}>...</div>;
});
```

## Quick Implementation Checklist

- [ ] Use dangerouslySetInnerHTML for ALL LaTeX
- [ ] Add processMathJax() + setTimeout(..., 100) pattern
- [ ] Use React.memo for components that shouldn't re-render
- [ ] Apply ref to container element
- [ ] Include proper imports (React, useEffect, useRef, useState)

## LaTeX in Custom Components
UI components may not handle LaTeX props correctly. Use direct elements with dangerouslySetInnerHTML instead.

## CRITICAL: Hub Components Requirements

### ⚠️ Required CSS Classes for MathJax
**ALWAYS use `font-mono` class** - MathJax depends on monospace font context:

```jsx
// ✅ CORRECT - Required pattern for all hubs
<div className="text-2xl font-mono text-cyan-400">
  <span dangerouslySetInnerHTML={{ __html: `\\(${latex}\\)` }} />
</div>

// ❌ WRONG - Missing font-mono breaks MathJax
<div className="text-2xl text-cyan-400">
  <span dangerouslySetInnerHTML={{ __html: `\\(${latex}\\)` }} />
</div>
```

### ⚠️ Avoid Flexbox Containers
**Never wrap LaTeX in flex containers** - Disrupts MathJax DOM processing:

```jsx
// ❌ WRONG - Flex containers break MathJax
<div className="flex items-center">
  <span dangerouslySetInnerHTML={{ __html: `\\(${latex}\\)` }} />
</div>

// ✅ CORRECT - Direct container structure
<div className="text-2xl font-mono text-cyan-400">
  <span dangerouslySetInnerHTML={{ __html: `\\(${latex}\\)` }} />
</div>
```

### ⚠️ Use Proper MathJax Hook
**Always use `useMathJax` hook** - Don't manually process:

```jsx
// ✅ CORRECT - Use the hook
import { useMathJax } from "../../hooks/useMathJax";

const YourComponent = () => {
  const contentRef = useMathJax([dependencies]);
  return <div ref={contentRef}>...</div>;
};

// ❌ WRONG - Manual processing is unreliable
useEffect(() => {
  window.MathJax?.typesetPromise([ref.current]);
}, []);
```

### Hub Component Checklist
- [ ] `font-mono` class present
- [ ] No flex containers around LaTeX
- [ ] Using `useMathJax` hook
- [ ] `dangerouslySetInnerHTML` for all LaTeX
- [ ] Proper ref attachment