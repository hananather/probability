# Component Routing and Integration Plan

## File Locations and Routes

### Chapter 1 Components
```
/src/components/01-introduction-to-probabilities/
├── 1-12-DataLiteracyBasics.jsx
└── 1-13-ProbabilityInMedia.jsx

/src/app/chapter1/
├── data-literacy/
│   └── page.js
└── probability-media/
    └── page.js
```

### Chapter 2 Components
```
/src/components/02-discrete-random-variables/
├── 2-8-RiskAndDecisionMaking.jsx
└── 2-9-SimulationMethods.jsx

/src/app/chapter2/
├── risk-decision/
│   └── page.js
└── simulation-methods/
    └── page.js
```

### Chapter 3 Components
```
/src/components/03-continuous-random-variables/
├── 3-8-MisleadingGraphs.jsx
└── 3-9-ChartSelectionGuide.jsx

/src/app/chapter3/
├── misleading-graphs/
│   └── page.js
└── chart-selection/
    └── page.js
```

### Chapter 4 Components
```
/src/components/04-descriptive-statistics-sampling/
├── 4-6-SurveyDesignBasics.jsx
├── 4-7-OutlierDetection.jsx
└── 4-8-CategoricalDataAnalysis.jsx

/src/app/chapter4/
├── survey-design/
│   └── page.js
├── outlier-detection/
│   └── page.js
└── categorical-analysis/
    └── page.js
```

### Chapter 5 Components
```
/src/components/05-estimation/
├── 5-9-StatisticalVsPractical.jsx
└── 5-10-MarginOfErrorExplained.jsx

/src/app/chapter5/
├── statistical-practical/
│   └── page.js
└── margin-error/
    └── page.js
```

### Chapter 6 Components
```
/src/components/06-hypothesis-testing/
├── 6-10-ABTestingBasics.jsx
├── 6-11-CommonStatisticalMistakes.jsx
└── 6-12-StudyDesignCritique.jsx

/src/app/chapter6/
├── ab-testing/
│   └── page.js
├── statistical-mistakes/
│   └── page.js
└── study-critique/
    └── page.js
```

### Chapter 7 Components
```
/src/components/07-linear-regression/
├── 7-7-TimeSeriesBasics.jsx
├── 7-8-StatisticalStorytelling.jsx
└── 7-9-SpreadsheetStatistics.jsx

/src/app/chapter7/
├── time-series/
│   └── page.js
├── statistical-storytelling/
│   └── page.js
└── spreadsheet-stats/
    └── page.js
```

---

## Hub Integration

### Update Chapter Hub Files

#### Chapter 1 Hub Update
```javascript
// /src/components/01-introduction-to-probabilities/1-0-IntroductionToProbabilitiesHub.jsx

// Add to topics array:
{
  id: 'data-literacy',
  number: '1.12',
  title: 'Data Literacy Basics',
  description: 'Understanding different types of data',
  route: '/chapter1/data-literacy',
  isBonus: true,
  icon: Database
},
{
  id: 'probability-media',
  number: '1.13',
  title: 'Probability in Media',
  description: 'Understanding polls and forecasts',
  route: '/chapter1/probability-media',
  isBonus: true,
  icon: Newspaper
}
```

#### Similar updates for Chapters 2-7
Each hub file needs new topic entries with `isBonus: true` flag

---

## Navigation Updates

### Add to AppSidebar
```javascript
// /src/components/shared/AppSidebar.jsx

const bonusComponents = {
  chapter1: [
    { href: '/chapter1/data-literacy', label: 'Data Literacy', isNew: true },
    { href: '/chapter1/probability-media', label: 'Media Probability', isNew: true }
  ],
  chapter2: [
    { href: '/chapter2/risk-decision', label: 'Risk & Decisions', isNew: true },
    { href: '/chapter2/simulation-methods', label: 'Simulations', isNew: true }
  ],
  // ... etc for all chapters
};
```

---

## Page Template

### Standard Page Structure
```javascript
// Example: /src/app/chapter1/data-literacy/page.js

"use client";
import DataLiteracyBasics from '@/components/01-introduction-to-probabilities/1-12-DataLiteracyBasics';

export default function DataLiteracyPage() {
  return <DataLiteracyBasics />;
}
```

---

## Styling Considerations

### Bonus Component Badge
```css
/* Add to component headers */
.bonus-badge {
  @apply inline-flex items-center px-2 py-1 
         text-xs font-medium rounded-full
         bg-amber-500/20 text-amber-400
         border border-amber-500/30;
}
```

### Arts Focus Indicator
```javascript
// In component introduction
<div className="flex items-center gap-2 mb-4">
  <span className="bonus-badge">Arts Focus</span>
  <span className="text-xs text-neutral-400">
    Designed for creative fields
  </span>
</div>
```

---

## Testing Routes

### Development Testing Commands
```bash
# Test each new route
npm run dev

# Visit each route:
http://localhost:3000/chapter1/data-literacy
http://localhost:3000/chapter1/probability-media
# ... etc

# Build test
npm run build
```

### Route Verification Checklist
- [ ] Component loads without errors
- [ ] Back to Hub navigation works
- [ ] Sidebar shows new items
- [ ] Hub page displays bonus topics
- [ ] Mobile navigation includes items
- [ ] URL structure is consistent

---

## Metadata and SEO

### Page Metadata Template
```javascript
// In each page.js file
export const metadata = {
  title: 'Data Literacy Basics | Probability for Arts',
  description: 'Learn to identify and work with different data types in creative fields',
  keywords: 'data types, nominal, ordinal, interval, ratio, arts statistics'
};
```

---

## Progressive Enhancement

### Feature Flags (Optional)
```javascript
// /src/config/features.js
export const features = {
  artsComponents: {
    enabled: process.env.NEXT_PUBLIC_ARTS_COMPONENTS === 'true',
    chapters: {
      1: ['data-literacy', 'probability-media'],
      2: ['risk-decision', 'simulation-methods'],
      // ...
    }
  }
};
```

### Conditional Rendering
```javascript
// In hub components
{features.artsComponents.enabled && 
  topics.filter(t => t.isBonus).map(topic => (
    <TopicCard key={topic.id} {...topic} />
  ))
}
```

---

## Analytics Tracking

### Component Analytics
```javascript
// In each component
useEffect(() => {
  // Track page view
  analytics.track('Arts Component Viewed', {
    chapter: 1,
    component: 'data-literacy',
    timestamp: new Date()
  });
}, []);

// Track interactions
const handleInteraction = (action) => {
  analytics.track('Arts Component Interaction', {
    chapter: 1,
    component: 'data-literacy',
    action: action
  });
};
```

---

## Documentation

### Component Documentation Template
```markdown
# Component Name

## Purpose
Brief description of what this component teaches

## Target Audience
Arts and humanities students with limited math background

## Learning Objectives
- Objective 1
- Objective 2
- Objective 3

## Prerequisites
- Chapter topics that should be completed first

## Key Concepts
- Concept 1: Description
- Concept 2: Description

## Interactive Elements
- Element 1: What it does
- Element 2: What it does

## Real-World Applications
- Application 1
- Application 2
```

---

## Launch Plan

### Phased Rollout
1. **Alpha**: Deploy 2-3 components for testing
2. **Beta**: Release full Chapter 1 & 2 components
3. **Production**: All components live

### User Feedback Collection
- In-component feedback widget
- Post-completion survey
- Usage analytics dashboard
- A/B testing different approaches