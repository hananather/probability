# LaTeX MathJax Error Fix Guide

## Problem Identification

### Issue 1: "Math input error" in LaTeX Rendering
**Symptoms:**
- Yellow box showing "Math input error" instead of properly rendered LaTeX
- Usually occurs with set notation containing curly braces like `{HH, TH}`

**Root Cause:**
- Incorrect escaping of curly braces in LaTeX within JavaScript strings
- MathJax expects `\\{` and `\\}` for literal braces in sets

### Issue 2: React Hooks Order Error
**Symptoms:**
```
React has detected a change in the order of Hooks called by SectionBasedContent.
```

**Root Cause:**
- Using hooks (like `useMathJax`) inside section content functions that are conditionally rendered
- This violates React's Rules of Hooks

## Solution Patterns

### Pattern 1: Fix Hooks in Section-Based Content

**Before (Incorrect):**
```jsx
const SECTIONS = [
  {
    id: 'example',
    title: 'Example Section',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([]); // ❌ Hook inside conditional function
      return <div ref={contentRef}>...</div>;
    }
  }
];
```

**After (Correct):**
```jsx
// Extract each section into its own component
const ExampleSection = () => {
  const contentRef = useRef(null);
  useSafeMathJax(contentRef); // ✅ Hook at component top level
  
  return (
    <div ref={contentRef}>
      {/* Section content here */}
    </div>
  );
};

const SECTIONS = [
  {
    id: 'example',
    title: 'Example Section',
    content: ExampleSection // Pass component reference, not function
  }
];
```

### Pattern 2: Fix LaTeX Set Notation

**Before (Incorrect):**
```jsx
// Single backslashes get lost in JavaScript strings
<span dangerouslySetInnerHTML={{ __html: `\\({HH, TH}\\)` }} />
```

**After (Correct):**
```jsx
// Double backslashes for proper escaping
<span dangerouslySetInnerHTML={{ __html: `\\(\\{HH, TH\\}\\)` }} />
```

### Pattern 3: Complex LaTeX Formulas

For complex formulas, especially in display mode:

```jsx
// Use double backslashes throughout
<div className="text-center my-4">
  <span dangerouslySetInnerHTML={{ 
    __html: `\\[A\\cup B = \\{HH, HT\\}\\cup\\{HH, TH\\} = \\{HH, HT, TH\\}\\]` 
  }} />
</div>
```

## Step-by-Step Fix Process

1. **Identify Components with Issues**
   - Look for "Math input error" in UI
   - Check console for React hooks errors
   - Search for `useMathJax([])` pattern in section content

2. **Extract Section Content to Components**
   ```jsx
   // Create separate component for each section
   const YourSectionName = () => {
     const contentRef = useRef(null);
     useSafeMathJax(contentRef);
     
     return (
       <div ref={contentRef}>
         {/* Your section content */}
       </div>
     );
   };
   ```

3. **Update Section Definitions**
   ```jsx
   const SECTIONS = [
     {
       id: 'your-section',
       title: 'Your Section Title',
       content: YourSectionName // Component reference, not function
     }
   ];
   ```

4. **Fix LaTeX Syntax**
   - Replace `\{` with `\\{` and `\}` with `\\}`
   - Ensure proper escaping in all LaTeX strings
   - Use `dangerouslySetInnerHTML` for all LaTeX content

5. **Import Required Dependencies**
   ```jsx
   import { useRef } from 'react';
   import { useSafeMathJax } from '@/utils/mathJaxFix';
   ```

## Common LaTeX Patterns

### Set Notation
```jsx
// Inline
<span dangerouslySetInnerHTML={{ __html: `\\(\\{a, b, c\\}\\)` }} />

// Display
<span dangerouslySetInnerHTML={{ __html: `\\[S = \\{HH, HT, TH, TT\\}\\]` }} />
```

### Union and Intersection
```jsx
// Union
<span dangerouslySetInnerHTML={{ __html: `\\(A \\cup B\\)` }} />

// Intersection  
<span dangerouslySetInnerHTML={{ __html: `\\(A \\cap B\\)` }} />

// With sets
<span dangerouslySetInnerHTML={{ __html: `\\[A \\cup B = \\{1, 2\\} \\cup \\{2, 3\\} = \\{1, 2, 3\\}\\]` }} />
```

### Conditional Probability
```jsx
<span dangerouslySetInnerHTML={{ __html: `\\(P(A|B)\\)` }} />
<span dangerouslySetInnerHTML={{ __html: `\\[P(A|B) = \\frac{P(A \\cap B)}{P(B)}\\]` }} />
```

## Testing Checklist

- [ ] No "Math input error" messages appear
- [ ] All LaTeX formulas render correctly
- [ ] No React hooks errors in console
- [ ] Component re-renders don't break LaTeX
- [ ] Set notation displays with proper braces

## Files That Need Fixing

Based on the search, these files use the problematic pattern:
1. `/01-foundations/Tab1FoundationsTab.jsx`
2. `/01-foundations/Tab2WorkedExamplesTab.jsx`
3. `/02-probability-dictionary/Tab1FoundationsTab.jsx`
4. `/02-probability-dictionary/Tab3QuickReferenceTab.jsx`
5. `/06-unordered-samples/Tab2WorkedExamplesTab.jsx`
6. `/08-conditional-probability/Tab3QuickReferenceTab.jsx`
7. `/09-bayes-theorem-visualizer/Tab1FoundationsTab.jsx`
8. `/09-bayes-theorem-visualizer/Tab2WorkedExamplesTab.jsx`

Apply the patterns above to fix each file systematically.