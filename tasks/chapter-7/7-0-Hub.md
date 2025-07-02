# Plan: 7.0 - Linear Regression and Correlation Hub

## Component Development Mandate

**CRITICAL: LaTeX Rendering Best Practices**
- **ALWAYS** use `dangerouslySetInnerHTML` for ALL LaTeX content
- Follow the pattern in `/docs/latex-guide.md` exactly
- Use the processMathJax() + setTimeout(..., 100) pattern
- Wrap LaTeX sections in React.memo to prevent re-rendering issues
- See reference: `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`

**Core Development Principles:**
1. **Mathematical Rigor + Interactivity**: Components should teach mathematical concepts through meaningful interactions
2. **Reuse Existing Components**: Use established UI components and patterns from the codebase
3. **Visual Cohesion**: Follow Chapter 6 hub style exactly
4. **Simplicity**: Focus on core concepts, avoid complex animations that don't serve learning

## Hub Component Structure

**IMPORTANT**: Use the existing `ChapterHub` component from `/src/components/shared/ChapterHub.jsx`
**Reference**: `/src/components/06-hypothesis-testing/6-0-HypothesisTestingHub.jsx` (but WITHOUT the coin flip animation)

### 1. NO Opening Animation
Unlike Chapter 6, we will NOT include an interactive opening animation. The hub should be clean and straightforward, focusing on navigation to the chapter sections. The ChapterHub component already provides all the functionality we need.

### 2. Key Concepts Card
Following Chapter 6 pattern exactly:
```jsx
const concepts = [
  { term: "Correlation", definition: "Strength of linear relationship", latex: "\\rho" },
  { term: "Regression Line", definition: "Best prediction equation", latex: "\\hat{y} = b_0 + b_1x" },
  { term: "R-squared", definition: "Variation explained by model", latex: "R^2" },
  { term: "Standard Error", definition: "Typical prediction error", latex: "s_e" },
];
```

### 3. Chapter Introduction Card
Brief, focused explanation:
"Linear regression reveals relationships between variables, enabling prediction and understanding. From fuel quality to stock prices, master the tools to model real-world relationships."

### 4. Section Configuration
Following Chapter 6's CHAPTER_6_SECTIONS pattern:

```javascript
const CHAPTER_7_SECTIONS = [
  {
    id: 'correlation-coefficient',
    title: '7.1 Correlation Coefficient',
    subtitle: 'Measuring relationship strength',
    description: 'How strong is the linear relationship between two variables? Learn to calculate and interpret correlation.',
    icon: TrendingUp,
    difficulty: 'Beginner',
    estimatedTime: '20 min',
    prerequisites: [],
    learningGoals: [
      'Calculate Pearson correlation coefficient',
      'Interpret correlation values (-1 to +1)',
      'Understand correlation vs causation',
      'Apply to real datasets'
    ],
    route: '/chapter7/correlation-coefficient',
    color: '#10b981',
    question: "How do we measure the strength of a linear relationship?",
    preview: "Interactive correlation explorer"
  },
  // ... (continue for all sections)
];
```

### 5. Visual System
Use Chapter 6's color scheme approach:
```javascript
const chapterColors = createColorScheme('regression');
```

### 6. Implementation Requirements

**Component Structure:**
```jsx
// Follow the exact pattern from Chapter 6:
import HypothesisTestingHub from "@/components/06-hypothesis-testing/6-0-HypothesisTestingHub";

export default function Chapter7() {
  return (
    <div className="min-h-screen bg-[#0F0F10]">
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        <LinearRegressionHub />
      </div>
    </div>
  );
}
```

**Hub Component Structure:**
```jsx
// LinearRegressionHub should follow this pattern:
export default function LinearRegressionHub() {
  const router = useRouter();
  
  const handleSectionClick = (section) => {
    if (section?.route) {
      router.push(section.route);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Chapter 7: Linear Regression and Correlation</h1>
          <p>Learn to model relationships and make predictions</p>
        </motion.div>

        {/* Key Concepts Card */}
        <KeyConceptsCard />

        {/* Introduction Card */}
        <Card>...</Card>

        {/* Chapter Hub with Sections */}
        <ChapterHub
          chapterNumber={7}
          chapterTitle="Linear Regression and Correlation"
          chapterSubtitle="Master prediction and relationship analysis"
          sections={CHAPTER_7_SECTIONS}
          storageKey="linearRegressionProgress"
          progressVariant="blue"
          onSectionClick={handleSectionClick}
          hideHeader={true}
        />
      </div>
    </div>
  );
}
```

**Key Features Already Provided by ChapterHub:**
- Progress tracking with localStorage
- Section cards with all metadata
- Responsive grid layout
- Dev mode for testing
- Accessibility features

## Section Plans Structure

Each section (7.1 through 7.6) should follow this consistent structure:
1. Reference components: `6-3-1-ErrorsAndPower.jsx` and `6-9-1-DifferenceOfTwoProportions.jsx`
2. Include WorkedExample pattern with proper LaTeX handling
3. Use existing UI components from the codebase
4. Focus on mathematical concepts with supporting interactivity
5. Include step-by-step calculations
6. Provide visual representations of key concepts

## Technical Implementation Notes

1. **LaTeX Handling**: Every component MUST implement the standard MathJax pattern
2. **State Management**: Use React hooks consistently
3. **Animations**: Use framer-motion sparingly for educational emphasis
4. **D3 Integration**: Use existing d3-utils for visualizations
5. **Responsive Design**: Ensure mobile compatibility

**File Locations**: 
- Hub Component: `/src/components/07-linear-regression/7-0-LinearRegressionHub.jsx`
- Page File: `/src/app/chapter7/page.js` (following Chapter 6 pattern)

**Note**: The page.js file should be minimal, just importing and rendering the LinearRegressionHub component, exactly like Chapter 6 does.