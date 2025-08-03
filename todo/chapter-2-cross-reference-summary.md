# Chapter 2 Bug Cross-Reference Summary

## Bugs Already in overall-project-todo.md

### LaTeX Rendering Issues ✓
- **Overall Todo:** Identified 71 LaTeX issues in Chapter 1, pattern of not using useMathJax
- **Chapter 2:** Found 7 components with same dangerouslySetInnerHTML pattern
- **Status:** Confirms systemic issue across entire codebase

### D3 Performance Issues ✓
- **Overall Todo:** SVG re-rendering anti-pattern noted in Chapter 1 components
- **Chapter 2:** Found same pattern in 5+ components (complete recreation on updates)
- **Status:** Validates this is a widespread architectural problem

### Missing Error Boundaries ✓
- **Overall Todo:** Listed need for MathErrorBoundary in all D3 components
- **Chapter 2:** Confirmed - zero components have error boundaries
- **Status:** Consistent with project-wide gap

### Fixed Dimensions/Responsive Issues ✓
- **Overall Todo:** "Fixed dimensions (width=600, height=400)" noted
- **Chapter 2:** Found 6+ components with hardcoded dimensions
- **Status:** Same issue pattern continues

### Memory Leaks ✓
- **Overall Todo:** "Missing timer cleanup in setInterval usage"
- **Chapter 2:** Found specific instances plus new D3 gradient leak pattern
- **Status:** Both previously known and new leak types

## New Issues Unique to Chapter 2

### 1. Mathematical Accuracy Problems 🆕
- Biased variance estimator in SpatialRandomVariable
- Division by zero in GeometricDistribution
- Factorial overflow in NegativeBinomialDistribution
- No probability validation in ExpectationVariance
- **Action:** Add to overall todo under new "Mathematical Accuracy" section

### 2. D3 Gradient Memory Leak 🆕
- Specific to PoissonTimeline component
- Gradients accumulate without cleanup
- Different from general D3 cleanup issues
- **Action:** Add as specific sub-issue under memory leaks

### 3. Complex Animation State Management 🆕
- NegativeBinomialDistribution has complex nested state
- Animation cancellation missing in multiple components
- setInterval used instead of requestAnimationFrame
- **Action:** Create new "Animation Architecture" section

### 4. Parameter Validation Gaps 🆕
- No bounds checking for mathematical inputs
- Missing validation for probability arrays
- Edge cases not handled (infinity, NaN)
- **Action:** Add under error handling section

### 5. Console Statements in Production 🆕
- console.error used for MathJax failures
- Different from console.warn mentioned in overall todo
- **Action:** Expand existing console statement issue

## Recommendations for overall-project-todo.md Updates

### Add New Section: "Mathematical Accuracy"
```markdown
#### Mathematical Accuracy Issues
- [ ] Fix biased variance calculation in SpatialRandomVariable.jsx
- [ ] Add division by zero protection in distribution calculations
- [ ] Prevent factorial overflow with large parameter values
- [ ] Validate probability arrays sum to 1 before calculations
  - **Impact:** Students learn incorrect formulas, calculations fail
  - **User Experience:** Educational content is wrong
```

### Expand Memory Leaks Section
```markdown
#### Memory Leaks (Updated)
- [ ] Fix D3 gradient accumulation in PoissonTimeline.jsx
  - **Impact:** DOM elements grow unbounded, browser crashes
  - **User Experience:** Page becomes unusable after ~100 events
```

### Add Animation Architecture Section
```markdown
#### Animation State Management
- [ ] Replace setInterval with requestAnimationFrame (5+ components)
- [ ] Add animation cancellation mechanisms
- [ ] Simplify complex animation state objects
  - **Impact:** Animations can't be stopped, queue indefinitely
  - **User Experience:** UI becomes unresponsive during animations
```

### Update Console Statements Issue
```markdown
- [ ] Remove console.error statements (Chapter 2: 4 instances)
- [ ] Remove console.log statements (Chapter 2: 8 instances)
```

## Summary

Chapter 2 analysis confirms and extends known issues:
- **Confirmed:** 5 major issue categories already identified
- **New:** 5 issue categories unique to Chapter 2
- **Total Chapter 2 Issues:** 145 (23 critical, 51 major, 71 minor)

The analysis reveals that Chapter 2 has more severe mathematical and state management issues compared to Chapter 1's focus on UI/visualization problems. This suggests different development approaches or timelines between chapters.