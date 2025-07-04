/**
 * TEMPLATE: Tabbed Learning Module
 * 
 * This template shows how to create a new tabbed learning module using the
 * TabbedLearningPage and SectionBasedContent components.
 * 
 * Steps to use:
 * 1. Copy this template
 * 2. Replace placeholder values with your content
 * 3. Create individual tab components following the SectionBasedContent pattern
 * 4. Place in appropriate chapter folder
 */

"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { 
  BookOpen,    // For introduction/overview
  Target,      // For interactive/practice
  Calculator,  // For mathematical content
  BarChart3,   // For statistical content
  Brain,       // For conceptual content
  Zap          // For quick review/summary
} from 'lucide-react';

// Dynamic imports for tab components
const IntroductionTab = dynamic(() => 
  import('./tabs/IntroductionTab'),
  { ssr: false }
);

const InteractiveTab = dynamic(() => 
  import('./tabs/InteractiveTab'),
  { ssr: false }
);

const MathematicalTab = dynamic(() => 
  import('./tabs/MathematicalTab'),
  { ssr: false }
);

const PracticeTab = dynamic(() => 
  import('./tabs/PracticeTab'),
  { ssr: false }
);

// Tab configuration
const TABS = [
  {
    id: 'introduction',
    label: 'Introduction',
    icon: BookOpen,
    description: 'Getting started with [TOPIC]',
    component: IntroductionTab,
    color: '#10b981' // Green
  },
  {
    id: 'interactive',
    label: 'Interactive Journey',
    icon: Target,
    description: 'Hands-on exploration of [CONCEPTS]',
    component: InteractiveTab,
    color: '#3b82f6' // Blue
  },
  {
    id: 'mathematical',
    label: 'Mathematical Depth',
    icon: Calculator,
    description: 'Deep dive into the mathematics',
    component: MathematicalTab,
    color: '#6366f1' // Indigo
  },
  {
    id: 'practice',
    label: 'Practice & Apply',
    icon: Zap,
    description: 'Test your understanding',
    component: PracticeTab,
    color: '#7c3aed' // Violet
  }
];

export default function YourTopicPage() {
  return (
    <TabbedLearningPage
      title="[YOUR TOPIC TITLE]"
      subtitle="[YOUR TOPIC DESCRIPTION]"
      chapter={1} // Replace with your chapter number
      tabs={TABS}
      storageKey="your-topic-progress" // Unique key for localStorage
      colorScheme="purple" // Options: purple, blue, green, etc.
    />
  );
}

// ========================================
// Example Tab Component (IntroductionTab.jsx)
// ========================================

/*
"use client";

import React from 'react';
import SectionBasedContent, { 
  SectionContent, 
  MathFormula, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, Formula, InsightBox } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';

// Define sections for this tab
const SECTIONS = [
  {
    id: 'overview',
    title: 'What is [TOPIC]?',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Understanding [TOPIC]">
          <ExampleSection title="Definition">
            <p className="mb-4 text-neutral-300">
              [Your definition here]
            </p>
            <MathFormula>
              <span dangerouslySetInnerHTML={{ 
                __html: '\\(P(A|B) = \\frac{P(B|A)P(A)}{P(B)}\\)' 
              }} />
            </MathFormula>
          </ExampleSection>
          
          <ExampleSection title="Key Concepts">
            <ul className="list-disc list-inside space-y-2">
              <li>Concept 1</li>
              <li>Concept 2</li>
              <li>Concept 3</li>
            </ul>
          </ExampleSection>
        </WorkedExample>
        
        <InsightBox variant="info">
          💡 Key insight about this topic
        </InsightBox>
      </SectionContent>
    )
  },
  {
    id: 'examples',
    title: 'Real-World Examples',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <InteractiveElement title="Interactive Demo">
          <div className="p-4">
            <p>Your interactive content here</p>
            <Button className="mt-4">
              Try It
            </Button>
          </div>
        </InteractiveElement>
      </SectionContent>
    )
  },
  // Add more sections as needed
];

export default function IntroductionTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Introduction to [TOPIC]"
      description="Master the fundamentals through interactive exploration"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1} // Your chapter number
      progressVariant="green"
    />
  );
}
*/