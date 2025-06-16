# Progressive Content System

## Overview

The Progressive Content System is a component framework for creating interactive lessons with section-based navigation, quiz gates, and progress persistence. It provides a clean, distraction-free learning experience with automatic progress saving.

## Components

### ProgressiveContent
Main wrapper component that handles section management, progress tracking, and navigation.

**Features:**
- Section-based content progression
- Progress persistence with localStorage
- Sticky progress bar
- Smooth scroll to new sections
- Quiz completion tracking

### SectionBreak
Delimiter component that marks the end of a content section.

### QuizBreak
Interactive quiz component that gates progression until answered correctly.

**Features:**
- Multiple choice questions with LaTeX support
- Single or multiple question support
- Visual feedback for correct/incorrect answers
- Progress indicators for multi-question quizzes
- Unlimited retry attempts

## Creating a Lesson

### Basic Structure

```jsx
// src/content/lessons/probability-basics.mdx
import { ProgressiveContent, SectionBreak, QuizBreak } from '@/components/mdx/ProgressiveContent';
import InteractiveComponent from '@/components/visualizations/YourComponent';

<ProgressiveContent>

# Lesson Title
Introduction text...

<SectionBreak />

## First Concept
Explanation of the concept...

<QuizBreak 
  question="What is the probability of rolling a 6?"
  options={[
    "\\(\\frac{1}{6}\\)",
    "\\(\\frac{1}{3}\\)",
    "\\(\\frac{1}{2}\\)",
    "\\(\\frac{2}{3}\\)"
  ]}
  correct={0}
/>

## Interactive Visualization
<InteractiveComponent />

<SectionBreak />

## Summary
Key takeaways...

</ProgressiveContent>
```

### Multi-Question Quiz

```jsx
<QuizBreak 
  questions={[
    {
      question: "First question with \\(LaTeX\\)",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      explanation: "Optional explanation"
    },
    {
      question: "Second question",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctIndex: 2
    }
  ]}
/>
```

## Page Setup

Create a Next.js page to render your MDX content:

```jsx
// src/app/lessons/[chapter]/[section]/page.js
"use client";
import dynamic from 'next/dynamic';
import { MathJaxProvider } from '@/components/shared/MathJaxProvider';

const MDXContent = dynamic(() => import('@/content/lessons/probability-basics.mdx'), {
  ssr: false
});

export default function LessonPage() {
  return (
    <MathJaxProvider>
      <div className="space-y-8">
        <MDXContent />
      </div>
    </MathJaxProvider>
  );
}
```

## Technical Details

### Progress Persistence
- Progress is saved to localStorage with a unique key per lesson
- Automatically restores position when returning to a lesson
- Stores current section index and quiz completion states

### Component Architecture
- ProgressiveContent uses React Children API to parse content
- Sections are determined by SectionBreak and QuizBreak components
- Quiz states are managed internally with completion callbacks
- LaTeX rendering handled by MathJax with proper lifecycle management

### Layout Integration
- Content width set to `max-w-7xl` for consistency with existing components
- Responsive design with proper padding
- Fixed header with progress indicator
- Smooth scrolling between sections

## Configuration

### Custom Progress Key
```jsx
<ProgressiveContent progressKey="chapter-1-section-2">
  {/* Content */}
</ProgressiveContent>
```

### Analytics Integration
```jsx
<ProgressiveContent 
  onAnalytics={(event, data) => analytics.track(event, data)}
  metadata={{ chapter: 1, section: 2 }}
>
  {/* Content */}
</ProgressiveContent>
```

## Best Practices

1. Keep sections focused on single concepts
2. Place quizzes after teaching the relevant concept
3. Use interactive visualizations to reinforce learning
4. Provide clear section titles for navigation context
5. Test LaTeX rendering in quiz questions
6. Keep quiz questions concise and clear

## Example Lesson Structure

1. **Introduction** - Hook and learning objectives
2. **Concept Explanation** - Core teaching content
3. **Quiz Gate** - Test understanding
4. **Interactive Practice** - Hands-on component
5. **Summary** - Key takeaways

This structure can be repeated for multiple concepts within a single lesson.