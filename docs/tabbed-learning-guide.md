# Tabification Prompt - Transform Components to Learning Modules

## 🎯 MASTER PROMPT FOR TABIFYING COMPONENTS

```
Transform the following into a tabbed learning module:

INPUTS:
1. Existing component: [PASTE COMPONENT CODE]
2. Course content: [PASTE RELEVANT COURSE MATERIAL/TEXTBOOK CONTENT]
3. Component path: [CURRENT PATH OF COMPONENT]

REQUIREMENTS:
Create a standardized tabbed module that:
- Wraps content in TabbedLearningPage
- Creates 3 new educational tabs
- ALWAYS includes the existing component as a 4th tab (unchanged)
- Each educational tab uses SectionBasedContent with 4 sections (3-5 min each)
- Implements arrow key navigation and progress tracking

IMPORTANT: The existing component is ALWAYS preserved as-is and becomes one of the tabs!

TAB STRUCTURE:

TAB 1 - FOUNDATIONS (Green #10b981):
□ Section 1: "Can You Solve This?" - Real exam problem for motivation
□ Section 2: "Building Intuition" - Plain language before math
□ Section 3: "Formal Definition" - Mathematical rigor with LaTeX
□ Section 4: "Why This Matters" - ML/AI applications, tech careers

TAB 2 - WORKED EXAMPLES (Blue #3b82f6):
□ Section 1: "Basic Example" - Simple case with steps
□ Section 2: "Exam-Level Example" - Complex problem fully solved
□ Section 3: "Variations" - Different types they'll encounter
□ Section 4: "Practice Time" - Interactive practice

TAB 3 - QUICK REFERENCE (Violet #7c3aed):
□ Section 1: "Formula Sheet" - All formulas with when to use
□ Section 2: "Decision Guide" - If X then Y flowchart
□ Section 3: "Common Mistakes" - What to avoid
□ Section 4: "Speed Practice" - 5 timed problems

TAB 4 - ORIGINAL COMPONENT (Keep original color):
□ ALWAYS include the existing component that's being "tabified"
□ Import it WITHOUT any modifications
□ Just wrap it to work within tab structure
□ Title: Use the original component's name
□ This preserves all existing functionality users are familiar with

CONTENT RULES:
✗ NO fake statistics ("appears in 75% of exams")
✗ NO gamification or childish tone
✓ Real applications (ML, AI, data science careers)
✓ Connect to advanced topics and industry
✓ Professional, respectful tone
✓ LaTeX using dangerouslySetInnerHTML pattern

FILE STRUCTURE RULES:
If original component is: /components/XX-chapter/Y-Y-Y-ComponentName.jsx
Then create:

1. NEW FOLDER: /components/XX-chapter/Y-Y-Y-component-name/
   - Keep the section numbering (Y-Y-Y) from original component
   - Slugify only the component name part
   - Contains:
     - Tab1FoundationsTab.jsx
     - Tab2WorkedExamplesTab.jsx  
     - Tab3QuickReferenceTab.jsx
     - index.jsx (exports all tabs)

2. NEW PAGE: /app/chapter[X]/component-name/page.jsx
   - Use only the slugified name part (no section numbers)
   - This keeps URLs clean and readable

3. ORIGINAL COMPONENT: Keep in original location
   - DO NOT move or rename
   - Import from original path in Tab 4

Example:
Original: /components/01-introduction/1-1-1-SampleSpacesEvents.jsx
Creates folder: /components/01-introduction/1-1-1-sample-spaces-events/
  - Tab1FoundationsTab.jsx
  - Tab2WorkedExamplesTab.jsx
  - Tab3QuickReferenceTab.jsx
  - index.jsx
Creates page: /app/chapter1/sample-spaces-events/page.jsx
Imports original from: /components/01-introduction/1-1-1-SampleSpacesEvents.jsx
```

## 📋 Implementation Checklist

```jsx
// Main page structure at /app/chapter[X]/[component-slug]/page.jsx
import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap, [OriginalIcon] } from 'lucide-react';

// Import new tabs from new folder (with tab numbers for clarity)
const FoundationsTab = dynamic(() => 
  import('@/components/XX-chapter/Y-Y-Y-component-name/Tab1FoundationsTab'), { ssr: false }
);
const WorkedExamplesTab = dynamic(() => 
  import('@/components/XX-chapter/Y-Y-Y-component-name/Tab2WorkedExamplesTab'), { ssr: false }
);
const QuickReferenceTab = dynamic(() => 
  import('@/components/XX-chapter/Y-Y-Y-component-name/Tab3QuickReferenceTab'), { ssr: false }
);

// Import original component from its ORIGINAL location (unchanged)
const [OriginalComponent] = dynamic(() => 
  import('@/components/XX-chapter/Y-Y-Y-ComponentName'), { ssr: false }
);

export default function [Topic]Page() {
  const TABS = [
    { id: 'foundations', label: 'Foundations', icon: BookOpen, 
      component: FoundationsTab, color: '#10b981' },
    { id: 'worked-examples', label: 'Worked Examples', icon: Target,
      component: WorkedExamplesTab, color: '#3b82f6' },
    { id: 'quick-reference', label: 'Quick Reference', icon: Zap,
      component: QuickReferenceTab, color: '#7c3aed' },
    { id: 'original', label: '[Original Display Name]', icon: [Icon],
      component: [OriginalComponent], color: '[original color]' }
  ];
  
  return (
    <TabbedLearningPage
      title="[Topic Title from Component]"
      subtitle="[Professional description]"
      chapter={[X]}
      tabs={TABS}
      storageKey="chapter[X]-[component-slug]-progress"
      colorScheme="purple"
    />
  );
}
```

## 🎯 Key Principles

1. **ALWAYS Preserve Original Component**: The existing component becomes Tab 4 - never modify it!
2. **Add Educational Value**: Create 3 new educational tabs that teach the concepts
3. **Professional Tone**: Treat students as adults learning for careers
4. **Real Motivations**: Connect to ML/AI/tech industry applications
5. **Exam Focus**: Use real exam problems without fake statistics

## ✅ Quality Checks

- [ ] Original component works unchanged in its tab
- [ ] All LaTeX renders correctly
- [ ] Arrow keys navigate between sections
- [ ] Progress saves to localStorage
- [ ] No fake statistics or gamification
- [ ] Connects to real-world applications
- [ ] Build passes: `npm run build && npm run lint`