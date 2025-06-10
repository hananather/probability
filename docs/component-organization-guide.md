# Component Organization Guide

## Overview
All components in this project follow a consistent naming convention to maximize human readability and make it easy to find components when navigating between the website and codebase.

## Naming Convention
Components are named following the pattern:
```
[Chapter]-[Section]-[Number]-[ComponentName].jsx
```

### Examples:
- `1-2-1-CountingTechniques.jsx` = Chapter 1, Section 2, Component 1
- `3-3-4-ZTableLookup.jsx` = Chapter 3, Section 3, Component 4

## Directory Structure

```
src/components/
├── shared/                    # General utility and shared components
│   ├── AppSidebar.jsx
│   ├── ChapterError.jsx
│   ├── ChapterLoading.jsx
│   ├── CLTSimulation.jsx
│   ├── CoinFlipSimulation.jsx
│   ├── ConceptSection.jsx
│   ├── ContentWrapper.jsx
│   ├── ErrorBoundary.jsx
│   ├── MathJaxProvider.jsx
│   ├── OptimizedImage.jsx
│   └── PriorPlot.jsx
│
├── ui/                        # UI primitive components
│   ├── D3DragWrapper.jsx
│   ├── ProgressTracker.jsx
│   ├── RangeSlider.jsx
│   ├── VisualizationContainer.jsx
│   ├── WorkedExampleContainer.jsx
│   ├── button.jsx
│   ├── card.jsx
│   ├── sheet.jsx
│   ├── sidebar.jsx
│   └── typography.jsx
│
├── 01-introduction-to-probabilities/
│   ├── 1-1-1-SampleSpacesEvents.jsx
│   ├── 1-2-1-CountingTechniques.jsx
│   ├── 1-3-1-OrderedSamples.jsx
│   ├── 1-4-1-UnorderedSamples.jsx
│   ├── 1-4-2-InteractiveLottery.jsx
│   ├── 1-5-1-ProbabilityEvent.jsx
│   ├── 1-6-1-ConditionalProbability.jsx
│   └── 1-6-2-ConditionalProbabilityEnhanced.jsx
│
├── 02-discrete-random-variables/
│   ├── 2-1-1-SpatialRandomVariable.jsx
│   ├── 2-2-1-ExpectationVariance.jsx
│   ├── 2-2-2-ExpectationVarianceWorkedExample.jsx
│   ├── 2-3-1-LinearTransformations.jsx
│   └── 2-3-2-FunctionTransformations.jsx
│
├── 03-continuous-random-variables/
│   ├── 3-0-1-BridgeToContinuous.jsx (+ Client)
│   ├── 3-1-1-ContinuousDistributionsPDF.jsx (+ Client)
│   ├── 3-1-2-IntegralWorkedExample.jsx
│   ├── 3-2-1-ContinuousExpectationVariance.jsx (+ Client)
│   ├── 3-3-1-NormalZScoreExplorer.jsx (+ Client)
│   ├── 3-3-2-NormalZScoreWorkedExample.jsx
│   ├── 3-3-3-EmpiricalRule.jsx (+ Client)
│   ├── 3-3-4-ZTableLookup.jsx (+ Client)
│   ├── 3-3-5-ZScorePracticeProblems.jsx (+ Client)
│   ├── 3-3-6-ProcessCapability.jsx (+ Client)
│   ├── 3-4-1-ExponentialDistribution.jsx (+ Client)
│   ├── 3-4-2-ExponentialDistributionWorkedExample.jsx
│   ├── 3-5-1-GammaDistribution.jsx (+ Client)
│   ├── 3-5-2-GammaDistributionWorkedExample.jsx
│   ├── 3-7-1-NormalApproxBinomial.jsx (+ Client)
│   └── 3-7-2-NormalApproxBinomialWorkedExample.jsx
│
├── 04-descriptive-statistics-sampling/
│   ├── 4-1-1-MeanMedianMode.jsx
│   ├── 4-2-1-HistogramShapeExplorer.jsx
│   ├── 4-3-1-DescriptiveStatsExplorer.jsx
│   ├── 4-4-1-TDistributionExplorer.jsx
│   ├── 4-5-1-FDistributionExplorer.jsx
│   └── 4-5-2-FDistributionWorkedExample.jsx
│
├── 5-1-1-BayesianInference.jsx         # Chapter 5 components
├── 5-2-1-PointEstimation.jsx
├── 5-3-1-ConfidenceInterval.jsx
├── 5-4-1-Bootstrapping.jsx
│
├── 6-1-1-HypothesisTestingGame.jsx     # Chapter 6 components
├── 6-1-2-HypothesisTestingEvidence.jsx
├── 6-1-3-TypeErrorVisualizer.jsx
└── 6-1-4-PValueMeaning.jsx
```

## Quick Reference

### Finding Components
1. **From Website**: Look at the section number (e.g., "3.3 Normal Distribution")
2. **In Codebase**: Navigate to `3-3-1-NormalZScoreExplorer.jsx`

### Component Types
- **Main Components**: Follow `[Chapter]-[Section]-[Number]-Name` pattern
- **Client Components**: Same pattern with "Client" suffix for SSR wrappers
- **Worked Examples**: Include "WorkedExample" in the name
- **Shared Components**: Located in `shared/` folder for cross-chapter use
- **UI Components**: Located in `ui/` folder for primitive UI elements

### Special Notes
- Chapter 3 components include "Client" versions for server-side rendering
- Some chapters have test/experimental versions in archive folders
- Chapters 5 and 6 components are at the root level (not in subdirectories)

## Benefits
1. **Easy Navigation**: Clear mapping from course structure to file structure
2. **Quick Identification**: Know exactly which section a component belongs to
3. **Organized Hierarchy**: Components grouped by chapter and section
4. **Consistent Pattern**: Same naming convention across all chapters