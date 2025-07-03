# Chapter 5 Migration Execution Plan

## Overview
Migrate Chapter 5 from the legacy single-page architecture to the standardized hub-based model used in Chapters 6 and 7. This migration will preserve all existing functionality while improving navigation, consistency, and maintainability.

## Current State Analysis

### Legacy Structure
- **Single-page app** at `/src/app/chapter5/page.js`
- **Dynamic component loading** with URL params (`?section=section-name`)
- **Nested folder structure** with hub components (`index.jsx`) in each section
- **Tab-based navigation** within a single page
- **5 main sections** with multiple sub-components each

### Target Structure (Chapter 7 Pattern)
- **Hub-based architecture** with central hub component
- **Separate routes** for each section (`/chapter5/section-name`)
- **Flat component structure** in `/src/components/05-estimation/`
- **Card-based navigation** using Next.js router
- **Consistent component naming** (`5-X-SectionName.jsx`)

## Migration Phases

### Phase 0: Archiving Strategy (45 minutes) 🆕
- [ ] Create archive directory: `/src/components/05-estimation-archive/`
- [ ] Copy entire current `/src/components/05-estimation/` directory to archive
- [ ] Create archive of current routes: `/src/app/chapter5-archive/`
- [ ] Document archive structure in `ARCHIVE-README.md`
- [ ] Commit archive with message: "Archive: Chapter 5 pre-migration backup"
- [ ] Tag commit for easy recovery: `chapter5-pre-migration-v1`

### Phase 1: Preparation (30 minutes)
- [ ] Review all existing Chapter 5 components and functionality
- [ ] Verify archive is complete and accessible
- [ ] Create `/tasks/chapter-5/` directory structure
- [ ] Document all components to be consolidated
- [ ] Create parallel development structure: `/src/components/05-estimation-new/`

### Phase 2: Hub Component Creation (45 minutes)
- [ ] Create `5-0-EstimationHub.jsx` following Chapter 7 pattern
- [ ] Configure CHAPTER_5_SECTIONS array with all metadata
- [ ] Add Key Concepts card with LaTeX formulas
- [ ] Implement router navigation
- [ ] Add introduction and overview content
- [ ] Set up progress tracking with localStorage

### Phase 3: Component Migration (4 hours)

#### 3.1 Statistical Inference (45 minutes)
- [ ] Create `5-1-StatisticalInference.jsx`
- [ ] Consolidate 4 existing components:
  - 5-1-1-BayesianInference.jsx
  - 5-1-2-StatisticalInferenceOverview.jsx
  - 5-1-3-InteractiveInferenceJourney.jsx
  - 5-1-4-PointEstimation.jsx
- [ ] Add BackToHub navigation
- [ ] Preserve all interactive elements
- [ ] Test MathJax rendering

#### 3.2 CI Known Variance (45 minutes)
- [ ] Create `5-2-ConfidenceIntervalKnownVariance.jsx`
- [ ] Consolidate 4 existing components:
  - 5-2-1-ConfidenceIntervalBuilder.jsx
  - 5-2-2-ConfidenceIntervalMasterclass.jsx
  - 5-2-3-CriticalValuesExplorer.jsx
  - 5-2-4-ConfidenceIntervalSimulation.jsx
- [ ] Maintain all visualizations
- [ ] Add navigation elements

#### 3.3 Sample Size (30 minutes)
- [ ] Create `5-3-SampleSizeCalculation.jsx`
- [ ] Consolidate 2 existing components:
  - 5-3-1-SampleSizeCalculator.jsx
  - 5-3-2-SampleSizeLaboratory.jsx
- [ ] Preserve 3D visualizations
- [ ] Add consistent styling

#### 3.4 CI Unknown Variance (45 minutes)
- [ ] Create `5-4-ConfidenceIntervalUnknownVariance.jsx`
- [ ] Consolidate 3 existing components:
  - 5-4-1-TConfidenceIntervals.jsx
  - 5-4-2-TDistributionShowcase.jsx
  - 5-4-3-Bootstrapping.jsx
- [ ] Maintain t-distribution visualizations
- [ ] Add proper navigation

#### 3.5 Proportions (45 minutes)
- [ ] Create `5-5-ProportionConfidenceInterval.jsx`
- [ ] Consolidate 2 existing components:
  - 5-5-1-ProportionConfidenceIntervals.jsx
  - 5-5-2-ProportionEstimationStudio.jsx
- [ ] Keep real-world scenarios
- [ ] Add final navigation elements

### Phase 4: Parallel Development & Testing (2 hours) 🆕
- [ ] Build new components in `/src/components/05-estimation-new/`
- [ ] Create test routes at `/src/app/chapter5-new/` for isolated testing
- [ ] Test each new component individually:
  - [ ] 5-0-EstimationHub functionality
  - [ ] Each section component (5-1 through 5-5)
  - [ ] Navigation flow between components
  - [ ] All interactive features preserved
- [ ] Compare side-by-side with archived version
- [ ] Get user feedback on new implementation
- [ ] Document any missing features or regressions

### Phase 5: Route Setup (30 minutes)
- [ ] Once validated, create production route structure in `/src/app/chapter5/`
- [ ] Update main `page.js` to render hub
- [ ] Create subdirectories for each section:
  - `/statistical-inference/page.js`
  - `/confidence-intervals-known/page.js`
  - `/sample-size/page.js`
  - `/confidence-intervals-unknown/page.js`
  - `/proportions/page.js`
- [ ] Implement simple page components that import sections

### Phase 6: Testing & Validation (1 hour)
- [ ] Test navigation from hub to each section
- [ ] Verify back navigation works
- [ ] Check all interactive components function
- [ ] Validate MathJax rendering throughout
- [ ] Test responsive design on mobile
- [ ] Verify progress tracking saves correctly
- [ ] Check for console errors
- [ ] Test with different browsers
- [ ] A/B test with original version if needed

### Phase 7: Migration & Cleanup (1 hour) 🆕
- [ ] Once fully validated, rename directories:
  - [ ] Move `/src/components/05-estimation/` to `/src/components/05-estimation-legacy/`
  - [ ] Move `/src/components/05-estimation-new/` to `/src/components/05-estimation/`
- [ ] Update all import paths
- [ ] Run full test suite again
- [ ] Keep archive for at least 2 weeks post-migration
- [ ] Document migration completion date
- [ ] Commit with message: "Complete: Chapter 5 hub migration"

## Component Mapping

### Section 1: Statistical Inference
**New Component**: `5-1-StatisticalInference.jsx`
**Consolidates**:
- BayesianInference → Bayesian calculator section
- StatisticalInferenceOverview → Introduction and overview
- InteractiveInferenceJourney → CLT visualization
- PointEstimation → Monte Carlo demo

### Section 2: Confidence Intervals (Known σ)
**New Component**: `5-2-ConfidenceIntervalKnownVariance.jsx`
**Consolidates**:
- ConfidenceIntervalBuilder → Main CI builder
- ConfidenceIntervalMasterclass → Comprehensive examples
- CriticalValuesExplorer → Z-table explorer
- ConfidenceIntervalSimulation → Coverage simulation

### Section 3: Sample Size
**New Component**: `5-3-SampleSizeCalculation.jsx`
**Consolidates**:
- SampleSizeCalculator → Calculator tool
- SampleSizeLaboratory → 3D visualization lab

### Section 4: Confidence Intervals (Unknown σ)
**New Component**: `5-4-ConfidenceIntervalUnknownVariance.jsx`
**Consolidates**:
- TConfidenceIntervals → t-distribution CI
- TDistributionShowcase → t-distribution explorer
- Bootstrapping → Bootstrap methods

### Section 5: Proportions
**New Component**: `5-5-ProportionConfidenceInterval.jsx`
**Consolidates**:
- ProportionConfidenceIntervals → Proportion CI calculator
- ProportionEstimationStudio → Comprehensive scenarios

## Success Criteria

### Functionality
- [ ] All existing interactive components work
- [ ] Navigation flows smoothly
- [ ] Progress tracking functions
- [ ] No features lost in migration

### Code Quality
- [ ] Consistent file naming
- [ ] Proper component structure
- [ ] Clean imports and exports
- [ ] No duplicate code

### User Experience
- [ ] Intuitive navigation
- [ ] Fast page loads
- [ ] Mobile responsive
- [ ] Clear learning path

### Technical
- [ ] No console errors
- [ ] MathJax renders properly
- [ ] Routes work correctly
- [ ] Build succeeds

## Archiving & Recovery Strategy 🆕

### Archive Structure
```
/src/components/
├── 05-estimation/              # Current production (will be replaced)
├── 05-estimation-archive/      # Complete backup of original
├── 05-estimation-new/          # New development (parallel)
└── 05-estimation-legacy/       # Post-migration backup

/src/app/
├── chapter5/                   # Current production routes
├── chapter5-archive/           # Backup of original routes
└── chapter5-new/              # Test routes for new implementation
```

### Rollback Plan
If issues arise post-migration:
1. **Quick Rollback** (< 5 minutes):
   ```bash
   # Rename directories back
   mv /src/components/05-estimation /src/components/05-estimation-failed
   mv /src/components/05-estimation-legacy /src/components/05-estimation
   ```

2. **Git Rollback** (if needed):
   ```bash
   # Find the pre-migration tag
   git checkout chapter5-pre-migration-v1
   ```

3. **Partial Rollback**:
   - Can rollback individual sections if needed
   - Mix old and new components during transition

### Archive Retention Policy
- **Pre-migration archive**: Keep indefinitely (tagged in git)
- **Legacy folder**: Keep for 1 month post-migration
- **Failed attempts**: Document and keep for 2 weeks
- **Test routes**: Remove after successful migration

## Risk Mitigation

1. **Data Loss**: Complete archive before any changes
2. **Complex Consolidation**: Test each section individually
3. **Routing Issues**: Follow Chapter 7 pattern exactly
4. **MathJax Problems**: Use proven LaTeX patterns
5. **Progress Tracking**: Test localStorage thoroughly
6. **Feature Regression**: Side-by-side testing with archive
7. **Emergency Rollback**: Clear rollback procedures documented

## Timeline

- **Total Estimated Time**: 10 hours (including new archiving/testing phases)
- **Recommended Approach**: Complete over 3 days
- **Day 1**: Archiving + Hub + first 2 sections (4 hours)
- **Day 2**: Remaining sections + parallel testing (4 hours)
- **Day 3**: Final validation + migration (2 hours)

## Post-Migration Tasks

1. Update any references to Chapter 5 in other components
2. Update navigation menu if needed
3. Document the new structure
4. Notify team of changes
5. Monitor for user feedback