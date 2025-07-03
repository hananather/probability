# Plan: 5.0 - Estimation Hub

## Component Development Mandate

**CRITICAL: LaTeX Rendering Best Practices**
- **ALWAYS** use `dangerouslySetInnerHTML` for ALL LaTeX content
- Follow the pattern in `/docs/latex-guide.md` exactly
- Use the processMathJax() + setTimeout(..., 100) pattern
- Wrap LaTeX sections in React.memo to prevent re-rendering issues
- See reference: `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`

**Core Development Principles:**
1. **Mathematical Rigor + Navigation**: Hub focuses on overview and navigation to sections
2. **Reuse Existing Components**: Use ChapterHub component from shared
3. **Visual Cohesion**: Follow Chapter 7 hub style exactly
4. **Simplicity**: Clean, straightforward hub without complex animations

## Hub Component Structure

**IMPORTANT**: Use the existing `ChapterHub` component from `/src/components/shared/ChapterHub.jsx`
**Reference**: `/src/components/07-linear-regression/7-0-LinearRegressionHub.jsx`

### 1. Key Concepts Card
Following Chapter 7 pattern exactly:
```jsx
const concepts = [
  { term: "Point Estimate", definition: "Best guess from data", latex: "\\bar{X}" },
  { term: "Confidence Interval", definition: "Range of plausible values", latex: "\\bar{X} \\pm ME" },
  { term: "Standard Error", definition: "Precision of estimate", latex: "\\frac{\\sigma}{\\sqrt{n}}" },
  { term: "Sample Size", definition: "How many observations?", latex: "n = \\left(\\frac{z\\sigma}{E}\\right)^2" }
];
```

### 2. Chapter Introduction Card
Brief, focused explanation:
"How certain are we about our estimates? Estimation bridges the gap between sample data and population truth. From confidence intervals to sample size calculations, master the art of quantifying uncertainty in your conclusions."

### 3. Section Configuration
Following Chapter 7's CHAPTER_7_SECTIONS pattern:

```javascript
const CHAPTER_5_SECTIONS = [
  {
    id: 'statistical-inference',
    title: '5.1 Statistical Inference',
    subtitle: 'From samples to populations',
    description: 'Draw conclusions about populations based on sample data. Master the foundations of statistical estimation and Bayesian thinking.',
    icon: Brain, // from lucide-react
    difficulty: 'Beginner',
    estimatedTime: '25 min',
    prerequisites: [],
    learningGoals: [
      'Distinguish parameters from statistics',
      'Understand sampling distributions',
      'Apply Bayesian inference to real problems',
      'Calculate point estimates effectively'
    ],
    route: '/chapter5/statistical-inference',
    color: '#10b981', // Emerald
    question: "How do we infer population truths from sample data?",
    preview: "Interactive sampling and Bayesian updates"
  },
  {
    id: 'confidence-intervals-known',
    title: '5.2 Confidence Intervals (σ Known)',
    subtitle: 'Quantifying certainty with known variance',
    description: 'When population standard deviation is known, construct confidence intervals using the normal distribution. Master the 68-95-99.7 rule.',
    icon: Target,
    difficulty: 'Beginner',
    estimatedTime: '30 min',
    prerequisites: ['statistical-inference'],
    learningGoals: [
      'Construct confidence intervals with known σ',
      'Apply the 68-95-99.7 rule',
      'Interpret confidence levels correctly',
      'Visualize interval coverage'
    ],
    route: '/chapter5/confidence-intervals-known',
    color: '#10b981',
    question: "How confident are we in our estimates?",
    preview: "Interactive CI builder and simulations"
  },
  {
    id: 'sample-size',
    title: '5.3 Sample Size Determination',
    subtitle: 'How many observations do we need?',
    description: 'Calculate optimal sample sizes balancing precision, confidence, and cost. Explore the relationships through stunning 3D visualizations.',
    icon: Calculator,
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Calculate required sample sizes',
      'Understand precision-cost tradeoffs',
      'Visualize n-E-α relationships',
      'Apply to real-world scenarios'
    ],
    route: '/chapter5/sample-size',
    color: '#3b82f6', // Blue
    question: "How many samples ensure reliable results?",
    preview: "3D visualization laboratory"
  },
  {
    id: 'confidence-intervals-unknown',
    title: '5.4 Confidence Intervals (σ Unknown)',
    subtitle: 'Real-world estimation with t-distribution',
    description: 'When population standard deviation is unknown, use the t-distribution. Compare with z-intervals and explore bootstrapping methods.',
    icon: Activity,
    difficulty: 'Intermediate',
    estimatedTime: '35 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Apply t-distribution for small samples',
      'Compare t-intervals vs z-intervals',
      'Understand degrees of freedom',
      'Master bootstrap techniques'
    ],
    route: '/chapter5/confidence-intervals-unknown',
    color: '#3b82f6',
    question: "What happens when σ is unknown?",
    preview: "t-distribution explorer and bootstrap demo"
  },
  {
    id: 'proportions',
    title: '5.5 Proportion Confidence Intervals',
    subtitle: 'From polls to quality control',
    description: 'Apply confidence intervals to proportions in election polling, A/B testing, and quality control. Compare different methods and their accuracy.',
    icon: PieChart,
    difficulty: 'Advanced',
    estimatedTime: '25 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Construct proportion confidence intervals',
      'Compare Wald vs Wilson methods',
      'Apply to polling and testing',
      'Understand sample size requirements'
    ],
    route: '/chapter5/proportions',
    color: '#8b5cf6', // Purple
    question: "How accurate are polls and surveys?",
    preview: "Election polling and A/B testing scenarios"
  }
];
```

### 4. Visual System
Use consistent color scheme:
```javascript
const chapterColors = createColorScheme('estimation');
// This will use green/emerald theme appropriate for estimation
```

### 5. Implementation Requirements

**Component Structure:**
```jsx
// Main hub component
export default function EstimationHub() {
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Chapter 5: Point and Interval Estimation
          </h1>
          <p className="text-xl text-gray-400">
            Master the art of statistical estimation and uncertainty quantification
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <KeyConceptsCard />

        {/* Introduction Text */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">What is Estimation?</h2>
          <p className="text-gray-300">
            Estimation is the cornerstone of statistical inference. Every day, we make decisions 
            based on incomplete information – from medical diagnoses to election predictions. 
            This chapter teaches you how to quantify uncertainty, construct confidence intervals, 
            and determine optimal sample sizes for reliable conclusions.
          </p>
        </Card>

        {/* Chapter Hub with Sections */}
        <ChapterHub
          chapterNumber={5}
          chapterTitle="Point and Interval Estimation"
          chapterSubtitle="From samples to population truths"
          sections={CHAPTER_5_SECTIONS}
          storageKey="estimationProgress"
          progressVariant="green"
          onSectionClick={handleSectionClick}
          hideHeader={true}
        />
      </div>
    </div>
  );
}
```

**Key Concepts Card Component:**
```jsx
const KeyConceptsCard = React.memo(() => {
  const contentRef = useRef(null);
  const concepts = [
    { term: "Point Estimate", definition: "Best single guess from data", latex: "\\bar{X}" },
    { term: "Confidence Interval", definition: "Range of plausible values", latex: "\\bar{X} \\pm ME" },
    { term: "Standard Error", definition: "Precision of estimate", latex: "\\frac{\\sigma}{\\sqrt{n}}" },
    { term: "Sample Size", definition: "Observations needed", latex: "n = \\left(\\frac{z\\sigma}{E}\\right)^2" }
  ];

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

  return (
    <Card ref={contentRef} className="mb-8 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Key Concepts You'll Master</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-white">{concept.term}</h4>
                <p className="text-sm text-gray-400 mt-1">{concept.definition}</p>
              </div>
              <div className="text-2xl font-mono text-emerald-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(${concept.latex}\\)` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});
```

### 6. Page Structure

**Main page.js file** (`/src/app/chapter5/page.js`):
```jsx
import EstimationHub from "@/components/05-estimation/5-0-EstimationHub";

export default function Chapter5() {
  return (
    <div className="min-h-screen bg-[#0F0F10]">
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        <EstimationHub />
      </div>
    </div>
  );
}
```

### 7. Required Icons
Import from lucide-react:
- Brain (Statistical Inference)
- Target (CI Known Variance)
- Calculator (Sample Size)
- Activity (CI Unknown Variance)
- PieChart (Proportions)

### 8. Progress Tracking
- Storage key: "estimationProgress"
- Progress variant: "green" (matches estimation theme)
- Tracks completion of each section
- Persists across sessions

### 9. Navigation Flow
1. User lands on hub
2. Sees overview and all sections
3. Clicks section card
4. Routes to `/chapter5/[section-name]`
5. Each section has BackToHub navigation

### 10. Technical Notes

**Performance Considerations:**
- Use React.memo for Key Concepts card
- Lazy load section components
- Pre-process LaTeX on mount

**Accessibility:**
- Proper heading hierarchy
- ARIA labels for navigation
- Keyboard navigation support

**Mobile Responsiveness:**
- Single column on mobile
- Touch-friendly card interactions
- Readable text sizes

**File Location:** `/src/components/05-estimation/5-0-EstimationHub.jsx`