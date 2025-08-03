# Bugs and Issues Todo List

## 🚨 Critical Issues (High Priority)

### Missing Error Boundaries for D3 Components
- [ ] Add MathErrorBoundary wrapper to VennDiagramSection.jsx
- [ ] Add MathErrorBoundary wrapper to MontyHallSimulation.jsx
- [ ] Add MathErrorBoundary wrapper to CountingTechniques/index.jsx
- [ ] Add MathErrorBoundary wrapper to all other D3 visualization components (19+ files)

### Potential Race Conditions
- [ ] Fix potential race conditions in MathJax rendering
- [ ] Add proper loading states for MathJax content
- [ ] Implement retry logic for failed MathJax renders

## ⚠️ Major Issues (Medium Priority)

### SVG Dimension Error Handling
- [ ] Fix SVG dimension error in probability-event/index.jsx (line 173)
- [ ] Replace console.warn with proper error UI component
- [ ] Add validation for SVG dimensions before rendering

### Null Reference Patterns
- [ ] Add null checks for data array access in components
- [ ] Implement proper validation before accessing array indices
- [ ] Add optional chaining where appropriate

### Animation Cleanup Issues
- [ ] Add cleanup functions for animation timeouts in MontyHallSimulation.jsx
- [ ] Review all components with useRef for animation cleanup
- [ ] Ensure all setTimeout/setInterval calls are properly cleaned up

## 📋 Minor Issues (Low Priority)

### Console Warning Cleanup
- [ ] Replace console.warn in errorHandling.js with proper logging
- [ ] Replace console.warn in mathJaxFix.js with error boundaries
- [ ] Replace console.warn in useD3Cleanup.js with user notifications

### Code Quality Improvements
- [ ] Remove or properly handle TODO/FIXME comments
- [ ] Remove debug components from production code
- [ ] Standardize error message formatting

## 🎯 Implementation Patterns

### Error Boundary Pattern
```jsx
import MathErrorBoundary from '@/components/ui/error-handling/MathErrorBoundary';

<MathErrorBoundary 
  fallbackMessage="Unable to render visualization. Please refresh the page."
  showRetry={true}
>
  <YourD3Component />
</MathErrorBoundary>
```

### Null Check Pattern
```jsx
// Before
const maxTrials = Math.max(100, data[data.length - 1]?.trial || 100);

// After
const maxTrials = data && data.length > 0 
  ? Math.max(100, data[data.length - 1]?.trial || 100)
  : 100;
```

### Animation Cleanup Pattern
```jsx
useEffect(() => {
  const timeoutId = setTimeout(() => {
    // animation logic
  }, 1000);
  
  return () => clearTimeout(timeoutId);
}, [dependencies]);
```

## 📊 Bug Summary Stats
- Critical Issues: 6 tasks
- Major Issues: 8 tasks
- Minor Issues: 6 tasks
- **Total Tasks: 20**

## 🔍 Areas for Further Investigation
1. Performance impact of multiple MathJax renders
2. Memory leaks from D3 selections not being properly cleaned
3. Race conditions between component unmounting and async operations
4. Browser-specific SVG rendering issues