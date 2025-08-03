# Navigation Patterns Guide

This guide documents the two primary navigation patterns used throughout the project and provides best practices for implementing consistent navigation across chapters.

## Overview

The project uses two distinct navigation patterns:

1. **Page-Level Navigation** - For standalone pages that need independent navigation
2. **Component-Level Navigation** - For tabbed content where navigation is managed by a parent component

## Navigation Pattern 1: Page-Level Navigation

### When to Use
- Standalone pages that exist outside of tabbed interfaces
- Components that need their own dedicated route
- Content that requires independent navigation controls

### Implementation

Use the `BackToHub` component directly in the page template:

```jsx
// Example: /src/app/chapter6/hypothesis-fundamentals/page.jsx
'use client';

import React from 'react';
import HypothesisTestingFundamentals from '@/components/06-hypothesis-testing/6-1-1-HypothesisTestingFundamentals';

export default function HypothesisFundamentalsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Hypothesis Testing Fundamentals</h1>
          <div className="mt-4">
            <a href="/chapter6" className="text-gray-400 hover:text-gray-300 underline">
              Back to Chapter 6 Hub
            </a>
          </div>
        </div>
        
        <div className="space-y-12">
          <HypothesisTestingFundamentals />
        </div>
      </div>
    </div>
  );
}
```

### Key Characteristics
- Navigation link is manually implemented in the page component
- Uses standard anchor tag with hover states
- Placed in the page header section
- Follows the format: "Back to Chapter X Hub"

## Navigation Pattern 2: Component-Level Navigation

### When to Use
- Tabbed learning pages using `TabbedLearningPage` component
- Multi-section content using `SectionBasedContent` component
- Content where navigation is managed by a parent wrapper component

### Implementation

#### With TabbedLearningPage

The `TabbedLearningPage` component automatically handles BackToHub navigation:

```jsx
// Example: /src/app/chapter1/01-pebble-world/page.jsx
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';

export default function PebbleWorldPage() {
  const TABS = [
    { 
      id: 'foundations', 
      label: 'Foundations', 
      icon: BookOpen, 
      component: FoundationsTab, 
      color: '#10b981' 
    },
    // ... more tabs
  ];
  
  return (
    <TabbedLearningPage
      title="Pebble World Foundation"
      subtitle="Build intuitive understanding of probability through physical models"
      chapter={1}  // BackToHub automatically uses this
      tabs={TABS}
      storageKey="chapter1-pebble-world-progress"
      colorScheme="teal"
    />
  );
}
```

#### With SectionBasedContent

Tab components should set `showBackToHub={false}` when used within tabbed interfaces:

```jsx
// Example: Tab component within TabbedLearningPage
export default function Tab1FoundationsTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Foundations"
      description="Core concepts and intuitive understanding"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      showBackToHub={false}  // Important: disable when in tabbed context
      progressVariant="teal"
    />
  );
}
```

### Key Characteristics
- Navigation is handled automatically by parent components
- Child components disable their own BackToHub buttons
- Consistent styling and behavior across all tabbed interfaces
- Uses the `BackToHub` component with proper chapter numbering

## BackToHub Component Reference

### Component Location
`/src/components/ui/BackToHub.jsx`

### Props
- `chapter` (number): Chapter number for the hub link (default: 6)
- `bottom` (boolean): If true, adds margin at bottom for placement at end of content (default: false)

### Usage Examples

```jsx
// Basic usage
<BackToHub chapter={1} />

// At bottom of content
<BackToHub chapter={3} bottom={true} />
```

### Component Implementation
```jsx
export default function BackToHub({ chapter = 6, bottom = false }) {
  return (
    <div className={`flex justify-start ${bottom ? 'mt-8 mb-4' : 'mb-6'}`}>
      <Link href={`/chapter${chapter}`}>
        <Button variant="secondary" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Chapter {chapter} Hub
        </Button>
      </Link>
    </div>
  );
}
```

## Chapter Hub Structure

### Hub Pages
Each chapter has a hub page that serves as the main entry point:

- `/src/app/chapter1/page.js` → Chapter 1 Hub
- `/src/app/chapter6/page.js` → Chapter 6 Hub
- etc.

### Hub Components
Hub pages typically import a dedicated hub component:

```jsx
// Example: /src/app/chapter1/page.js
import IntroductionToProbabilitiesHub from '@/components/01-introduction-to-probabilities/1-0-IntroductionToProbabilitiesHub';

export default function Chapter1Page() {
  return <IntroductionToProbabilitiesHub />;
}
```

## Best Practices

### 1. Choose the Right Pattern
- **Use Page-Level Navigation** for standalone pages that need independent routing
- **Use Component-Level Navigation** for content that fits within tabbed or sectioned interfaces

### 2. Consistent Chapter Numbering
- Always pass the correct chapter number to navigation components
- Ensure chapter numbers match the actual URL structure (`/chapter1`, `/chapter2`, etc.)

### 3. Disable Redundant Navigation
- When using `SectionBasedContent` within `TabbedLearningPage`, always set `showBackToHub={false}`
- Avoid multiple navigation elements on the same page

### 4. Navigation Placement
- Place navigation at the top of content for primary navigation
- Use `bottom={true}` for secondary navigation at the end of content

### 5. Styling Consistency
- Use the provided `BackToHub` component for consistent styling
- Maintain hover states and visual feedback
- Follow the established color scheme and typography patterns

## Examples from Existing Chapters

### Page-Level Navigation Examples
- `/src/app/chapter6/hypothesis-fundamentals/page.jsx`
- `/src/app/chapter1/04-counting-techniques/page.js`
- `/src/app/chapter1/07-probability-event/page.js`

### Component-Level Navigation Examples
- `/src/app/chapter1/01-pebble-world/page.jsx` (TabbedLearningPage)
- `/src/app/chapter1/02-probability-dictionary/page.jsx` (TabbedLearningPage)
- `/src/components/01-introduction-to-probabilities/01-pebble-world/Tab1FoundationsTab.jsx` (SectionBasedContent with showBackToHub={false})

## Common Mistakes to Avoid

1. **Double Navigation**: Don't add BackToHub to both parent and child components
2. **Wrong Chapter Numbers**: Ensure chapter prop matches the actual chapter
3. **Inconsistent Styling**: Always use the BackToHub component instead of custom implementations
4. **Missing Navigation**: Standalone pages should always have navigation back to their chapter hub
5. **Navigation in Wrong Context**: Don't add page-level navigation to components that will be used in tabbed interfaces

## Migration Guidelines

When updating existing content:

1. **Identify the Pattern**: Determine if the content should use page-level or component-level navigation
2. **Check Chapter Numbers**: Verify that chapter numbers are correct and consistent
3. **Remove Custom Navigation**: Replace any custom navigation implementations with the standard BackToHub component
4. **Test Navigation Flow**: Ensure users can navigate seamlessly between content and chapter hubs
5. **Verify Styling**: Confirm that navigation elements match the established design system

This navigation system ensures a consistent user experience across all chapters while maintaining flexibility for different content types and structures.