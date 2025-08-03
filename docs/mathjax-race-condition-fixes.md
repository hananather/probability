# MathJax Race Condition Fixes Guide

## Overview

This guide explains the fixes implemented to resolve MathJax rendering race conditions throughout Chapter 1 components.

## Key Changes

### 1. Enhanced Hooks with Retry Logic

Two enhanced hooks now provide robust MathJax rendering:

#### `useMathJax` (Updated)
- Now includes automatic retry logic with exponential backoff
- Retries up to 5 times by default
- Handles MathJax library not being loaded yet

```jsx
import { useMathJax } from '@/hooks/useMathJax';

const MyComponent = () => {
  const contentRef = useMathJax([dependency1, dependency2]);
  
  return (
    <div ref={contentRef}>
      <span dangerouslySetInnerHTML={{ __html: `\\[E = mc^2\\]` }} />
    </div>
  );
};
```

#### `useMathJaxWithState` (New)
- Provides loading state and error handling
- Perfect for components that need to show loading indicators
- Returns `{ ref, isLoading, error }`

```jsx
import { useMathJaxWithState } from '@/hooks/useMathJax';

const MyComponent = () => {
  const { ref, isLoading, error } = useMathJaxWithState([dependency]);
  
  if (error) {
    return <div>Failed to render math</div>;
  }
  
  return (
    <div className="relative">
      {isLoading && <LoadingSpinner />}
      <div ref={ref} className={isLoading ? 'opacity-0' : 'opacity-100'}>
        <span dangerouslySetInnerHTML={{ __html: `\\[E = mc^2\\]` }} />
      </div>
    </div>
  );
};
```

### 2. Migration Pattern

For components currently using manual MathJax processing:

**Before:**
```jsx
const contentRef = useRef(null);

useEffect(() => {
  const processMathJax = () => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
      if (window.MathJax.typesetClear) {
        window.MathJax.typesetClear([contentRef.current]);
      }
      window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
    }
  };
  
  processMathJax();
  const timeoutId = setTimeout(processMathJax, 100);
  return () => clearTimeout(timeoutId);
}, [dependencies]);
```

**After:**
```jsx
const contentRef = useMathJax([dependencies]);
```

### 3. Loading States

Use the new `MathJaxSkeleton` component for consistent loading UI:

```jsx
import { MathJaxSkeleton } from '@/utils/mathJaxFix';

// In your component
{isLoading && <MathJaxSkeleton className="w-full" />}
```

### 4. Best Practices

1. **Always use the hooks** - Don't manually call `window.MathJax.typesetPromise`
2. **Include all dependencies** - Pass all values that affect LaTeX content to the hook
3. **Consider loading states** - Use `useMathJaxWithState` when you need loading indicators
4. **Handle errors gracefully** - Provide fallback UI for failed renders

### 5. Component Checklist

When updating a component:

- [ ] Replace manual MathJax processing with `useMathJax` hook
- [ ] Add loading states if the component has dynamic content
- [ ] Include all relevant dependencies in the hook
- [ ] Test with slow network to ensure retry logic works
- [ ] Verify no race conditions when switching between states quickly

## Example Implementation

See `/src/components/01-introduction-to-probabilities/shared/MathJaxExample.jsx` for complete examples of:
- Basic usage with loading states
- Error handling
- Dynamic content updates
- Multiple formulas in one component

## Components Updated

- [x] `/08-conditional-probability/ConditionalProbability.jsx` - Now uses `useMathJax` hook
- [x] `/06-unordered-samples/Tab2WorkedExamplesTab.jsx` - Updated to use hook
- [ ] Other components still need migration...

## Testing

To test the fixes:

1. **Network throttling**: Use Chrome DevTools to simulate slow 3G
2. **Rapid navigation**: Switch between tabs/sections quickly
3. **Dynamic updates**: Change values that trigger LaTeX re-renders
4. **Initial load**: Hard refresh pages with LaTeX content

## Troubleshooting

If LaTeX still doesn't render:

1. Check browser console for errors
2. Verify dependencies array includes all changing values
3. Ensure `dangerouslySetInnerHTML` is used (not plain text)
4. Check that LaTeX delimiters are properly escaped (`\\[` not `\[`)