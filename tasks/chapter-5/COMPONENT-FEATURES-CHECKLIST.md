# Chapter 5 Component Features Checklist

## Purpose
Track all features from original components to ensure nothing is lost during migration.

## Section 5.1: Statistical Inference

### From 5-1-1-BayesianInference.jsx
- [ ] Medical testing calculator
- [ ] Prior/posterior visualization
- [ ] Interactive probability sliders
- [ ] Tree diagram
- [ ] Confusion matrix display

### From 5-1-2-StatisticalInferenceOverview.jsx
- [ ] Population vs sample visualization
- [ ] Parameter vs statistic comparison
- [ ] Animated sampling process
- [ ] Distribution builder

### From 5-1-3-InteractiveInferenceJourney.jsx
- [ ] CLT animation
- [ ] Sample size slider
- [ ] Distribution shape morphing
- [ ] Real-time mean/SD updates

### From 5-1-4-PointEstimation.jsx
- [ ] Monte Carlo π estimation
- [ ] Dart throwing visualization
- [ ] Convergence graph
- [ ] Error tracking

## Section 5.2: CI Known Variance

### From 5-2-1-ConfidenceIntervalBuilder.jsx
- [ ] Parameter input controls
- [ ] Real-time CI calculation
- [ ] Visual interval on number line
- [ ] Margin of error display

### From 5-2-2-ConfidenceIntervalMasterclass.jsx
- [ ] Multiple example scenarios
- [ ] Step-by-step calculations
- [ ] Comparison of different confidence levels
- [ ] Interpretation guides

### From 5-2-3-CriticalValuesExplorer.jsx
- [ ] Interactive normal curve
- [ ] Shaded rejection regions
- [ ] Z-table lookup
- [ ] Critical value finder

### From 5-2-4-ConfidenceIntervalSimulation.jsx
- [ ] Multiple sample generation
- [ ] CI coverage visualization
- [ ] Animation controls
- [ ] Coverage percentage tracker

## Section 5.3: Sample Size

### From 5-3-1-SampleSizeCalculator.jsx
- [ ] Input controls (E, α, σ)
- [ ] Real-time n calculation
- [ ] Cost analysis
- [ ] Visual representation

### From 5-3-2-SampleSizeLaboratory.jsx
- [ ] 3D surface plot (CRITICAL - MUST PRESERVE!)
- [ ] Interactive rotation
- [ ] Click to explore points
- [ ] Color gradients
- [ ] Axis labels

## Section 5.4: CI Unknown Variance

### From 5-4-1-TConfidenceIntervals.jsx
- [ ] Data input methods
- [ ] Sample statistics calculation
- [ ] t-critical value lookup
- [ ] CI calculation with steps

### From 5-4-2-TDistributionShowcase.jsx
- [ ] t vs normal comparison
- [ ] DF slider
- [ ] Critical values display
- [ ] Tail probability visualization

### From 5-4-3-Bootstrapping.jsx
- [ ] Resampling animation
- [ ] Bootstrap distribution builder
- [ ] Percentile method
- [ ] Comparison with parametric

## Section 5.5: Proportions

### From 5-5-1-ProportionConfidenceIntervals.jsx
- [ ] Election polling scenario
- [ ] CI calculation (multiple methods)
- [ ] Margin of error display
- [ ] Visual on proportion scale

### From 5-5-2-ProportionEstimationStudio.jsx
- [ ] A/B testing calculator
- [ ] Quality control dashboard
- [ ] Method comparison (Wald vs Wilson)
- [ ] Real-world scenarios

## Global Features to Preserve

### Interactions
- [ ] All sliders work smoothly
- [ ] Animations are performant
- [ ] Hover effects functional
- [ ] Click interactions responsive

### Visualizations
- [ ] D3 charts render properly
- [ ] Colors follow design system
- [ ] Responsive sizing
- [ ] Smooth transitions

### Educational
- [ ] Step-by-step explanations
- [ ] Formula displays
- [ ] Tooltips and help text
- [ ] Example scenarios

### Technical
- [ ] LaTeX rendering
- [ ] State management
- [ ] Error handling
- [ ] Loading states

## Validation Process

For each component consolidation:

1. **Feature Inventory**: Check all features above
2. **Visual Comparison**: Run old and new side-by-side
3. **Interaction Test**: Try all controls
4. **Edge Cases**: Test min/max values
5. **Performance**: Check for lag or jank
6. **Accessibility**: Keyboard navigation works

## Red Flags

If any of these occur, STOP and investigate:
- Missing visualizations
- Broken interactions
- LaTeX not rendering
- Console errors
- Performance degradation
- Features that "seem different"

## Sign-off Checklist

Before marking a section complete:
- [ ] All features from checklist implemented
- [ ] Tested against archived version
- [ ] No regressions identified
- [ ] Performance acceptable
- [ ] Code follows Chapter 7 patterns
- [ ] BackToHub navigation works
- [ ] Mobile responsive