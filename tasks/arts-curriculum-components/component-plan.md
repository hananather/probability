# Arts Curriculum Components Plan

## Component Structure Template
Each component follows the pattern from `7-1-CorrelationCoefficient.jsx`:
- Introduction section with real-world context
- Mathematical framework (simplified for arts students)
- Interactive visualization
- Practical examples
- Key takeaways

---

## CHAPTER 1: Introduction to Probabilities
### 1-12-DataLiteracyBasics.jsx
**Topic**: Data Types & Measurement Scales
- **Introduction**: "What kind of data are you collecting?"
- **Sections**:
  - Nominal (categories): Art movements, color names
  - Ordinal (ranked): Skill levels, satisfaction ratings  
  - Interval (equal spacing): Temperature, years
  - Ratio (true zero): Heights, counts, durations
- **Interactive**: Drag-and-drop data classification game
- **Real Examples**: Gallery visitor surveys, artwork dimensions

### 1-13-ProbabilityInMedia.jsx
**Topic**: Understanding Polls, Forecasts, Odds
- **Introduction**: "How to read election polls and weather forecasts"
- **Sections**:
  - Margin of error visualization
  - Confidence levels explained
  - Odds vs probability conversion
- **Interactive**: Poll simulator with sample size effects
- **Real Examples**: Election forecasts, weather predictions, betting odds

---

## CHAPTER 2: Discrete Random Variables
### 2-8-RiskAndDecisionMaking.jsx
**Topic**: Expected Value in Real Decisions
- **Introduction**: "Should you buy insurance? Take the gig?"
- **Sections**:
  - Expected value calculation
  - Risk vs reward visualization
  - Decision trees
- **Interactive**: Insurance calculator, freelance project evaluator
- **Real Examples**: Art commission pricing, exhibition insurance

### 2-9-SimulationMethods.jsx
**Topic**: Using Randomness to Solve Problems
- **Introduction**: "When math is hard, simulate!"
- **Sections**:
  - Monte Carlo basics
  - Random number generation
  - Convergence visualization
- **Interactive**: Birthday paradox simulator, queue simulation
- **Real Examples**: Museum visitor flow, workshop capacity planning

---

## CHAPTER 3: Continuous Random Variables
### 3-8-MisleadingGraphs.jsx
**Topic**: How to Spot and Avoid Deceptive Visualizations
- **Introduction**: "Lies, damned lies, and statistics"
- **Sections**:
  - Truncated y-axis effects
  - Cherry-picked time ranges
  - Inappropriate chart types
  - Area/volume distortions
- **Interactive**: Graph manipulation tool showing impact
- **Real Examples**: Media graphics, marketing charts

### 3-9-ChartSelectionGuide.jsx
**Topic**: When to Use Bar/Line/Scatter/Pie
- **Introduction**: "The right chart for the right data"
- **Sections**:
  - Categorical comparisons (bar)
  - Time series (line)
  - Correlations (scatter)
  - Part-of-whole (pie/treemap)
- **Interactive**: Data-to-chart matching exercise
- **Real Examples**: Exhibition attendance, budget breakdowns

---

## CHAPTER 4: Descriptive Statistics & Sampling
### 4-6-SurveyDesignBasics.jsx
**Topic**: How to Collect Unbiased Data
- **Introduction**: "Getting reliable answers from your audience"
- **Sections**:
  - Question wording effects
  - Sampling methods (random, stratified, cluster)
  - Response bias types
  - Sample size determination
- **Interactive**: Bias simulator showing different sampling methods
- **Real Examples**: Audience research, user feedback forms

### 4-7-OutlierDetection.jsx
**Topic**: Finding and Handling Unusual Data Points
- **Introduction**: "When data doesn't fit the pattern"
- **Sections**:
  - IQR method visualization
  - Z-score identification
  - When to keep vs remove
  - Impact on statistics
- **Interactive**: Outlier impact on mean/median calculator
- **Real Examples**: Artwork pricing, performance metrics

### 4-8-CategoricalDataAnalysis.jsx
**Topic**: Two-way Tables and Chi-square Basics
- **Introduction**: "Is there a relationship between categories?"
- **Sections**:
  - Contingency tables
  - Expected vs observed frequencies
  - Chi-square test intuition
  - Association vs causation
- **Interactive**: Two-way table builder with test results
- **Real Examples**: Genre preferences by age, medium by region

---

## CHAPTER 5: Estimation
### 5-9-StatisticalVsPractical.jsx
**Topic**: Effect Size and Real-World Significance
- **Introduction**: "Statistically significant ≠ Important"
- **Sections**:
  - P-values vs effect sizes
  - Cohen's d visualization
  - Practical importance
  - Context matters
- **Interactive**: Effect size calculator with interpretation
- **Real Examples**: A/B testing results, intervention effects

### 5-10-MarginOfErrorExplained.jsx
**Topic**: What Polls and Surveys Really Tell Us
- **Introduction**: "Plus or minus 3 percentage points"
- **Sections**:
  - Confidence interval visualization
  - Sample size effects
  - Population size myths
  - Overlapping margins
- **Interactive**: Poll comparison tool
- **Real Examples**: Gallery visitor surveys, market research

---

## CHAPTER 6: Hypothesis Testing
### 6-10-ABTestingBasics.jsx
**Topic**: Basic Experimental Design for Creatives
- **Introduction**: "Which design performs better?"
- **Sections**:
  - Control vs treatment
  - Randomization importance
  - Statistical power
  - Multiple testing issues
- **Interactive**: A/B test simulator with results
- **Real Examples**: Website layouts, email campaigns, exhibition designs

### 6-11-CommonStatisticalMistakes.jsx
**Topic**: Simpson's Paradox, Regression to Mean
- **Introduction**: "When statistics deceive"
- **Sections**:
  - Simpson's paradox examples
  - Regression to the mean
  - Survivorship bias
  - Base rate fallacy
- **Interactive**: Paradox explorer with reversal demonstrations
- **Real Examples**: Admission rates, performance reviews

### 6-12-StudyDesignCritique.jsx
**Topic**: Identifying Bias and Confounding
- **Introduction**: "Why that study might be wrong"
- **Sections**:
  - Selection bias
  - Confounding variables
  - Placebo effects
  - Blinding importance
- **Interactive**: Study evaluation checklist
- **Real Examples**: Art therapy studies, audience research

---

## CHAPTER 7: Linear Regression
### 7-7-TimeSeriesBasics.jsx
**Topic**: Trend, Seasonality, and Forecasting
- **Introduction**: "Patterns over time"
- **Sections**:
  - Trend identification
  - Seasonal patterns
  - Moving averages
  - Simple forecasting
- **Interactive**: Decomposition tool for time series
- **Real Examples**: Museum attendance, social media engagement

### 7-8-StatisticalStorytelling.jsx
**Topic**: Presenting Findings Clearly
- **Introduction**: "Turn numbers into narratives"
- **Sections**:
  - Executive summary structure
  - Visual hierarchy
  - Key message focus
  - Avoiding jargon
- **Interactive**: Report builder with templates
- **Real Examples**: Grant proposals, impact reports

### 7-9-SpreadsheetStatistics.jsx
**Topic**: Excel/Google Sheets Statistical Functions
- **Introduction**: "Statistics without special software"
- **Sections**:
  - Descriptive statistics functions
  - Data analysis toolpak
  - Pivot tables for summaries
  - Basic charts and formatting
- **Interactive**: Function reference with examples
- **Real Examples**: Budget analysis, survey data processing

---

## Implementation Notes

### Component Structure
```jsx
// Each component follows this pattern:
const Component = () => {
  return (
    <VisualizationContainer>
      <BackToHub chapter={chapterNumber} />
      
      <Introduction />
      
      <MathematicalFramework simplified={true} />
      
      <InteractiveVisualization />
      
      <PracticalExamples />
      
      <KeyTakeaways />
      
      <ReferenceSheet />
    </VisualizationContainer>
  );
};
```

### Design Principles
1. **Accessibility First**: Plain language explanations before formulas
2. **Visual Learning**: Interactive demos over equations
3. **Real Context**: Arts/creative examples, not manufacturing
4. **Progressive Disclosure**: Start simple, add complexity
5. **Practical Focus**: "How to use this" over "How it works"

### Color Coding by Chapter
- Chapter 1: Purple (probability basics)
- Chapter 2: Blue (discrete distributions)  
- Chapter 3: Teal (continuous distributions)
- Chapter 4: Green (descriptive stats)
- Chapter 5: Orange (estimation)
- Chapter 6: Red (hypothesis testing)
- Chapter 7: Indigo (regression)

### Gold Standard Components to Reuse
- `VisualizationContainer` for layout
- `GraphContainer` for D3 visualizations
- `ControlGroup` for interactive controls
- `SimpleFormulaCard` for equation display
- `ComparisonTable` for concept comparisons
- `WorkedExample` for step-by-step solutions