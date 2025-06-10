# Comprehensive Testing Strategy for EmpiricalRule Component

## Overview
This document outlines a comprehensive testing strategy for the `EmpiricalRule` component located at `/src/components/03-continuous-random-variables/EmpiricalRule.jsx`. The component is an interactive visualization demonstrating the 68-95-99.7 rule for normal distributions.

## Component Analysis

### Key Features
1. **Interactive Normal Distribution Visualization** - D3-based SVG rendering
2. **Real-time Sample Generation** - Generates samples from normal distribution
3. **Dynamic Parameter Control** - Adjustable mean (μ) and standard deviation (σ)
4. **Sample Statistics Tracking** - Counts samples within 1σ, 2σ, and 3σ
5. **Histogram Overlay** - Optional histogram view of sample data
6. **Responsive Design** - Adapts to container width
7. **LaTeX Rendering** - Mathematical notation using MathJax

### State Management
- `mu` (mean): 50-150 range
- `sigma` (standard deviation): 5-30 range
- `samples`: Array of generated samples (max 1000)
- `isGenerating`: Boolean for sample generation status
- `showHistogram`: Toggle for histogram display
- `selectedRule`: Which σ range to highlight (1, 2, or 3)
- `counts`: Object tracking samples within each σ range

## Testing Categories

### 1. Component Rendering Tests

```javascript
describe('EmpiricalRule Component Rendering', () => {
  it('should render without crashing', () => {
    // Test basic component mounting
  });
  
  it('should display all UI elements', () => {
    // Verify presence of:
    // - SVG visualization
    // - Control buttons (Generate/Pause, Reset, Histogram toggle)
    // - Parameter sliders
    // - Statistics display
    // - Rule explanation cards
  });
  
  it('should render with default values', () => {
    // Check initial state:
    // - mu = 100
    // - sigma = 15
    // - samples = []
    // - isGenerating = false
    // - showHistogram = false
    // - selectedRule = 1
  });
  
  it('should handle missing window/document gracefully', () => {
    // Test SSR compatibility
  });
});
```

### 2. State Management Tests

```javascript
describe('State Management', () => {
  it('should update mean when slider changes', () => {
    // Test mu slider (50-150)
  });
  
  it('should update standard deviation when slider changes', () => {
    // Test sigma slider (5-30)
  });
  
  it('should toggle sample generation', () => {
    // Test play/pause functionality
  });
  
  it('should clear samples on reset', () => {
    // Test reset button
  });
  
  it('should toggle histogram view', () => {
    // Test histogram button
  });
  
  it('should update selected rule on button click', () => {
    // Test ±1σ, ±2σ, ±3σ buttons
  });
  
  it('should limit samples array to 1000 items', () => {
    // Test array slicing logic
  });
});
```

### 3. D3 Visualization Tests

```javascript
describe('D3 Visualization', () => {
  it('should create SVG elements correctly', () => {
    // Test SVG structure:
    // - Scales creation
    // - Axis rendering
    // - Normal curve path
    // - Region areas and boundaries
    // - Labels and text
  });
  
  it('should update visualization when parameters change', () => {
    // Test re-rendering on:
    // - mu change
    // - sigma change
    // - samples update
    // - selectedRule change
  });
  
  it('should render histogram bars when enabled', () => {
    // Test histogram rendering
    // - Bin calculation
    // - Bar dimensions
    // - Gradient application
  });
  
  it('should render sample points when histogram is hidden', () => {
    // Test sample point rendering
    // - Only last 100 samples
    // - Correct color coding by σ range
  });
  
  it('should handle edge cases in scales', () => {
    // Test extreme values:
    // - Very small sigma (5)
    // - Very large sigma (30)
    // - Extreme means
  });
});
```

### 4. Memory Leak Prevention Tests

```javascript
describe('Memory Management', () => {
  it('should clean up interval on unmount', () => {
    // Test interval cleanup in useEffect
  });
  
  it('should remove event listeners on unmount', () => {
    // Test resize event listener cleanup
  });
  
  it('should clear D3 selections before re-rendering', () => {
    // Test svg.selectAll("*").remove()
  });
  
  it('should not accumulate DOM elements on re-renders', () => {
    // Monitor DOM element count during updates
  });
  
  it('should handle rapid parameter changes without memory leaks', () => {
    // Stress test with rapid slider movements
  });
});
```

### 5. Edge Cases and Error Handling

```javascript
describe('Edge Cases', () => {
  it('should handle division by zero when sigma is 0', () => {
    // Although slider min is 5, test defensive coding
  });
  
  it('should handle empty samples array', () => {
    // Test percentage calculations with no data
  });
  
  it('should handle very large sample counts', () => {
    // Test performance with 1000 samples
  });
  
  it('should handle rapid play/pause toggling', () => {
    // Test interval management
  });
  
  it('should handle container resize gracefully', () => {
    // Test responsive behavior
  });
  
  it('should handle invalid numeric inputs', () => {
    // Test NaN/undefined protection
  });
});
```

### 6. Performance Tests

```javascript
describe('Performance', () => {
  it('should render within acceptable time (<100ms)', () => {
    // Measure initial render time
  });
  
  it('should update visualization smoothly (<16ms per frame)', () => {
    // Test animation performance
  });
  
  it('should handle 50 samples/second without lag', () => {
    // Test sample generation rate
  });
  
  it('should not cause excessive re-renders', () => {
    // Monitor React render cycles
  });
  
  it('should efficiently update counts calculation', () => {
    // Test O(n) performance of filter operations
  });
});
```

### 7. Accessibility Tests

```javascript
describe('Accessibility', () => {
  it('should have proper ARIA labels', () => {
    // Test slider accessibility
    // Test button labels
  });
  
  it('should be keyboard navigable', () => {
    // Test tab order
    // Test slider keyboard controls
  });
  
  it('should have sufficient color contrast', () => {
    // Test text/background contrast
    // Test visualization contrast
  });
  
  it('should provide text alternatives for visual data', () => {
    // Test statistics text display
  });
});
```

### 8. Mathematical Accuracy Tests

```javascript
describe('Mathematical Accuracy', () => {
  it('should generate samples from correct normal distribution', () => {
    // Verify jStat.normal.sample usage
    // Statistical tests on generated samples
  });
  
  it('should calculate percentages correctly', () => {
    // Test count calculations:
    // - within1SD filter accuracy
    // - within2SD filter accuracy  
    // - within3SD filter accuracy
  });
  
  it('should render normal PDF curve accurately', () => {
    // Test normalPDF calculation
    // Verify curve shape and peak
  });
  
  it('should display correct theoretical percentages', () => {
    // Verify 68%, 95%, 99.7% labels
  });
  
  it('should calculate histogram bins correctly', () => {
    // Test d3.histogram implementation
  });
});
```

## Identified Bugs and Edge Cases

### 1. **Potential Division by Zero**
```javascript
// Line 136: yScale domain calculation
.domain([0, 0.4 / sigma])
// If sigma = 0, this would cause Infinity
```
**Fix**: Add validation to ensure sigma > 0

### 2. **Memory Leak Risk**
```javascript
// Line 65: Interval creation without validation
intervalRef.current = setInterval(generateSample, 50);
```
**Issue**: If `toggleGeneration` is called multiple times rapidly, could create multiple intervals
**Fix**: Clear existing interval before creating new one

### 3. **Performance Issue with Large Samples**
```javascript
// Lines 105-107: O(n) operations repeated 3 times
const within1SD = samples.filter(x => Math.abs(x - mu) <= sigma).length;
const within2SD = samples.filter(x => Math.abs(x - mu) <= 2 * sigma).length;
const within3SD = samples.filter(x => Math.abs(x - mu) <= 3 * sigma).length;
```
**Fix**: Single pass calculation to reduce from O(3n) to O(n)

### 4. **Floating Point Precision**
```javascript
// Line 381: Percentage calculation
actual1SD: (counts.within1SD / counts.total * 100).toFixed(1)
```
**Issue**: toFixed can cause rounding errors
**Fix**: Use proper rounding function

### 5. **Race Condition in Resize Handler**
```javascript
// Lines 88-101: Resize handler
useEffect(() => {
  const handleResize = () => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      // ...
    }
  };
```
**Issue**: Container might be null during rapid resizes
**Fix**: Add debouncing

### 6. **Missing Validation for Sample Generation**
```javascript
// Line 52: Sample generation
const newSample = jStat.normal.sample(mu, sigma);
```
**Issue**: No validation of generated sample (could be NaN/Infinity)
**Fix**: Add sample validation

### 7. **Accessibility Issues**
- Range inputs lack proper labels
- No keyboard shortcuts for play/pause
- Color-only information (convergence checkmarks)

### 8. **LaTeX Rendering Race Condition**
The component uses `useMathJax` but doesn't wait for MathJax to be ready before rendering

## Testing Implementation Tools

### Recommended Testing Stack
1. **Jest** - Unit testing framework
2. **React Testing Library** - Component testing
3. **D3 Selection Mocking** - For D3 visualization tests
4. **Performance Testing** - React DevTools Profiler API
5. **Accessibility Testing** - jest-axe

### Sample Test Setup
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import EmpiricalRule from './EmpiricalRule';

// Mock D3 and window.MathJax
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({ remove: jest.fn() })),
    append: jest.fn(() => ({})),
    // ... other methods
  })),
  // ... other d3 exports
}));

global.MathJax = {
  typesetPromise: jest.fn(() => Promise.resolve()),
  typesetClear: jest.fn(),
};
```

## Test Coverage Goals
- **Line Coverage**: >90%
- **Branch Coverage**: >85%
- **Function Coverage**: >95%
- **Critical Path Coverage**: 100%

## Continuous Testing Strategy
1. Run tests on every commit
2. Performance benchmarks in CI
3. Visual regression testing for D3 output
4. Accessibility audit automation
5. Memory leak detection in development

This comprehensive testing strategy ensures the EmpiricalRule component is robust, performant, and accessible while maintaining mathematical accuracy.