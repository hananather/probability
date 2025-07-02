# Plan: Chapter 4 Hub - Descriptive Statistics and Sampling Distributions

## Component Development Mandate

**CRITICAL: This hub will serve as the central navigation point for ALL Chapter 4 components**
- Must incorporate navigation to EVERY existing component (33 total)
- Follow the standardized hub pattern from Chapters 6 & 7
- Create a cohesive learning journey through descriptive statistics

**Reference Hubs:**
- `/src/components/06-hypothesis-testing/6-0-HypothesisTestingHub.jsx`
- `/src/components/07-linear-regression/7-0-LinearRegressionHub.jsx`

## Structure

### 1. Opening Interactive Experience
- Transform a raw dataset into various statistical representations
- Show mean, median, histograms, distributions morphing
- Use existing animations from landing page as reference

### 2. Key Concepts Card
Display fundamental formulas with LaTeX:
- Sample Mean: $\bar{x} = \frac{1}{n}\sum_{i=1}^{n}x_i$
- Sample Variance: $s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2$
- Central Limit Theorem: $\frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \sim N(0,1)$

### 3. Chapter Navigation Structure

**6 Main Sections:**

#### Section 1: Data Descriptions & Central Tendency
- Route: `/chapter4/data-descriptions`
- Difficulty: Beginner
- Time: 45 minutes
- Components to incorporate:
  - 4-1-0-CentralTendencyHub.jsx (as sub-navigation)
  - 4-1-1-CentralTendencyIntro.jsx
  - 4-1-2-DescriptiveStatsJourney.jsx
  - 4-1-3-DescriptiveStatisticsFoundations.jsx
  - 4-1-4-MathematicalFoundations.jsx
  - Archive: 4-1-0-CentralTendencyMasterclass.jsx
  - Archive: 4-1-1-ComprehensiveStats.jsx
  - Archive: 4-1-1-DataExplorerIntro.jsx
  - Archive: 4-1-1-DescriptiveStatsJourney.jsx
  - Archive: 4-1-3-DescriptiveStatsExplorer.jsx

#### Section 2: Visual Summaries & Histograms
- Route: `/chapter4/visual-summaries`
- Difficulty: Beginner
- Time: 30 minutes
- Components to incorporate:
  - 4-2-0-HistogramHub.jsx (as sub-navigation)
  - 4-2-1-HistogramIntuitiveIntro.jsx
  - 4-2-1-HistogramShapeExplorer.jsx
  - 4-2-2-HistogramInteractiveJourney.jsx
  - 4-2-3-HistogramShapeAnalysis.jsx

#### Section 3: Sampling Distributions & CLT
- Route: `/chapter4/sampling-distributions`
- Difficulty: Intermediate
- Time: 60 minutes
- Components to incorporate:
  - 4-3-0-SamplingDistributionsHub.jsx (as sub-navigation)
  - 4-3-0-SamplingDistributionsInteractive.jsx
  - 4-3-2-CLTProperties-merged.jsx
  - 4-3-2-SamplingDistributionsProperties-impl.jsx
  - 4-3-2-SamplingDistributionsTheory.jsx
  - 4-3-3-CLTGateway.jsx
  - 4-3-4-SamplingDistributionsVisual.jsx

#### Section 4: t-Distribution
- Route: `/chapter4/t-distribution`
- Difficulty: Intermediate
- Time: 25 minutes
- Components to incorporate:
  - 4-4-1-TDistributionExplorer.jsx

#### Section 5: F-Distribution
- Route: `/chapter4/f-distribution`
- Difficulty: Advanced
- Time: 45 minutes
- Components to incorporate:
  - 4-5-1-FDistributionIntuitiveIntro.jsx
  - 4-5-1-FDistributionExplorer.jsx
  - 4-5-2-FDistributionInteractiveJourney.jsx
  - 4-5-2-FDistributionWorkedExample.jsx
  - 4-5-3-FDistributionMasterclass.jsx
  - 4-5-3-FDistributionMastery.jsx
  - 4-5-4-FDistributionJourney.jsx

#### Section 6: Boxplots & Quartiles
- Route: `/chapter4/boxplots-quartiles`
- Difficulty: Beginner
- Time: 30 minutes
- Components to incorporate:
  - 4-6-1-BoxplotQuartilesExplorer.jsx
  - 4-6-1-BoxplotQuartilesJourney.jsx
  - 4-6-2-BoxplotRealWorldExplorer.jsx

### 4. Implementation Notes

**Color Scheme:**
```javascript
const chapterColors = createColorScheme('statistics');
// Use purple/indigo theme for statistics
```

**Prerequisites Tracking:**
- Track completion of each section
- Recommend path: 1 → 2 → 6 → 3 → 4 → 5

**Learning Goals Display:**
- Master descriptive statistics
- Understand sampling distributions
- Apply Central Limit Theorem
- Compare different distributions
- Visualize data effectively

**File Location:** `/src/components/04-descriptive-statistics-sampling/4-0-DescriptiveStatisticsHub.jsx`

## Total Component Count Verification
- Section 1: 10 components ✓
- Section 2: 5 components ✓
- Section 3: 7 components ✓
- Section 4: 1 component ✓
- Section 5: 7 components ✓
- Section 6: 3 components ✓
- **Total: 33 components** ✓

ALL existing components are accounted for and will be incorporated.