# Chapter 5 Migration Quick Reference

## Component Mapping At-a-Glance

### Hub Component
**New**: `5-0-EstimationHub.jsx`  
**Pattern**: Copy from `7-0-LinearRegressionHub.jsx`  
**Key**: Use ChapterHub component, add Key Concepts card

### Section 1: Statistical Inference
**New**: `5-1-StatisticalInference.jsx`  
**Consolidates**: 
- 5-1-1-BayesianInference.jsx
- 5-1-2-StatisticalInferenceOverview.jsx
- 5-1-3-InteractiveInferenceJourney.jsx
- 5-1-4-PointEstimation.jsx

### Section 2: CI Known Variance  
**New**: `5-2-ConfidenceIntervalKnownVariance.jsx`  
**Consolidates**:
- 5-2-1-ConfidenceIntervalBuilder.jsx
- 5-2-2-ConfidenceIntervalMasterclass.jsx
- 5-2-3-CriticalValuesExplorer.jsx
- 5-2-4-ConfidenceIntervalSimulation.jsx

### Section 3: Sample Size
**New**: `5-3-SampleSizeCalculation.jsx`  
**Consolidates**:
- 5-3-1-SampleSizeCalculator.jsx
- 5-3-2-SampleSizeLaboratory.jsx (preserve 3D viz!)

### Section 4: CI Unknown Variance
**New**: `5-4-ConfidenceIntervalUnknownVariance.jsx`  
**Consolidates**:
- 5-4-1-TConfidenceIntervals.jsx
- 5-4-2-TDistributionShowcase.jsx
- 5-4-3-Bootstrapping.jsx

### Section 5: Proportions
**New**: `5-5-ProportionConfidenceInterval.jsx`  
**Consolidates**:
- 5-5-1-ProportionConfidenceIntervals.jsx
- 5-5-2-ProportionEstimationStudio.jsx

## File Locations

```
Current (to archive):
/src/components/05-estimation/
/src/app/chapter5/

Development (build here):
/src/components/05-estimation-new/
/src/app/chapter5-new/

Reference (study these):
/src/components/07-linear-regression/
/src/app/chapter7/
```

## Essential Commands

```bash
# 1. Create archive first
cp -r /src/components/05-estimation /src/components/05-estimation-archive

# 2. Start new development
mkdir /src/components/05-estimation-new

# 3. Test your work
npm run dev
# Navigate to localhost:3000/chapter5-new

# 4. When ready to deploy
mv /src/components/05-estimation /src/components/05-estimation-legacy
mv /src/components/05-estimation-new /src/components/05-estimation
```

## Route Structure

```
/chapter5/
├── page.js                           → Hub
├── statistical-inference/page.js     → Section 5.1
├── confidence-intervals-known/page.js → Section 5.2
├── sample-size/page.js               → Section 5.3
├── confidence-intervals-unknown/page.js → Section 5.4
└── proportions/page.js               → Section 5.5
```

## Must-Have Imports

```jsx
// Every section component needs:
import BackToHub from '@/components/ui/BackToHub';
import { VisualizationContainer, VisualizationSection, GraphContainer, ControlGroup } from '@/components/ui/VisualizationContainer';
import { createColorScheme } from '@/lib/design-system';

// Hub needs:
import ChapterHub from '@/components/shared/ChapterHub';
import { useRouter } from 'next/navigation';
```

## LaTeX Pattern (USE EVERYWHERE)

```jsx
const SomeComponent = React.memo(function SomeComponent() {
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
  }, []);

  return <div ref={contentRef}>...</div>;
});
```

## Testing Checklist for Each Component

- [ ] Renders without errors
- [ ] Navigation works (hub ↔ section)
- [ ] All interactive features from original
- [ ] LaTeX formulas display
- [ ] Mobile responsive
- [ ] Matches Chapter 7 style

## If You Get Stuck

1. Check Chapter 7 implementation
2. Review original archived components
3. Read the detailed task file (5-X-*.md)
4. Verify LaTeX is following the pattern
5. Check console for errors

Remember: **Archive First, Test in Parallel, Deploy When Ready!**