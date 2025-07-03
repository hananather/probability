# Chapter 5 Archive - Pre-Migration Backup

**Archive Date**: 2025-07-03
**Purpose**: Complete backup of Chapter 5 implementation before migration to hub-based architecture

## Archive Structure

```
05-estimation-archive/
├── 5-0-1-GeneralConfidenceInterval.jsx
├── 5-1-statistical-inference/
│   ├── index.jsx
│   ├── 5-1-1-BayesianInference.jsx
│   ├── 5-1-2-StatisticalInferenceOverview.jsx
│   ├── 5-1-3-InteractiveInferenceJourney.jsx
│   └── 5-1-4-PointEstimation.jsx
├── 5-2-ci-known-variance/
│   ├── index.jsx
│   ├── 5-2-1-ConfidenceIntervalBuilder.jsx
│   ├── 5-2-2-ConfidenceIntervalMasterclass.jsx
│   ├── 5-2-3-CriticalValuesExplorer.jsx
│   └── 5-2-4-ConfidenceIntervalSimulation.jsx
├── 5-3-sample-size/
│   ├── index.jsx
│   ├── 5-3-1-SampleSizeCalculator.jsx
│   └── 5-3-2-SampleSizeLaboratory.jsx
├── 5-4-ci-unknown-variance/
│   ├── index.jsx
│   ├── 5-4-1-TConfidenceIntervals.jsx
│   ├── 5-4-2-TDistributionShowcase.jsx
│   └── 5-4-3-Bootstrapping.jsx
├── 5-5-proportions/
│   ├── index.jsx
│   ├── 5-5-1-ProportionConfidenceIntervals.jsx
│   └── 5-5-2-ProportionEstimationStudio.jsx
└── shared/
    └── [shared components]
```

## Legacy Architecture Notes

- **Single-page app** with dynamic component loading via URL params
- **Tab-based navigation** within sections
- **Nested folder structure** with hub components (index.jsx) in each section
- **URL pattern**: `/chapter5?section=section-name`

## Recovery Instructions

To restore this version:
```bash
# Remove current implementation
rm -rf src/components/05-estimation
rm -rf src/app/chapter5

# Restore from archive
cp -r src/components/05-estimation-archive src/components/05-estimation
cp -r src/app/chapter5-archive src/app/chapter5
```

## Git Tag
This archive is tagged as: `chapter5-pre-migration-v1`