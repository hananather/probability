# LaTeX Issues Todo List

## Completed Tasks ✅

### Chapter 1: Introduction to Probabilities - 71 ISSUES FIXED (2025-08-02)
- [x] `Tab2WorkedExamplesTab.jsx` (probability dictionary) - 7 issues
- [x] `Tab1FoundationsTab.jsx` (Bayes theorem) - 3 issues
- [x] `Tab2WorkedExamplesTab.jsx` (Bayes theorem) - 18 issues
- [x] `Tab3QuickReferenceTab.jsx` (sample spaces) - 2 issues
- [x] `Tab2WorkedExamplesTab.jsx` (sample spaces) - 20 issues
- [x] `Tab2WorkedExamplesTab.jsx` (pebble world) - 18 issues
- [x] `Tab3QuickReferenceTab.jsx` (pebble world) - 3 issues

### Chapter 3: Continuous Random Variables - Already Fixed
- [x] `3-6-2-JointDistributionWorkedExample.jsx` - Already using template literals
- [x] `3-1-1-ContinuousDistributionsPDF.jsx` - Already using template literals
- [x] `3-0-1-BridgeToContinuous.jsx` - Already using template literals

### Chapter 4: Descriptive Statistics & Sampling - 3 ISSUES FIXED (2025-08-02)
- [x] `4-5-1-FDistributionIntuitiveIntro.jsx` - Already using template literals
- [x] `4-1-4-MathematicalFoundations.jsx` - Already using template literals
- [x] `4-4-1-TDistributionExplorer.jsx` - 3 issues fixed (lines 46, 61, 69)

### Chapter 5: Estimation/Confidence Intervals - Already Fixed
- [x] `5-1-StatisticalInference.jsx` - Already using template literals

### Learn Components - 10 ISSUES FIXED (2025-08-02)
- [x] `GoldStandardShowcase.jsx` - 6 issues fixed
- [x] `ComponentUsageTest.jsx` - 4 issues fixed

## All Tasks Complete! 🎉

Total LaTeX issues fixed today: 84 issues
- Chapter 1: 71 issues
- Chapter 4: 3 issues  
- Learn Components: 10 issues

All formula props now use the correct template literal syntax:
```jsx
formula={`\\LaTeX content`}
```

## Fix Pattern
Change from regular quotes to template literals:
```jsx
// ❌ Wrong
formula="\\rho_{\\text{XY}}"

// ✅ Correct  
formula={`\\rho_{\\text{XY}}`}
```