# Claude.md

This file provides guidance to Claude code when working with code in this repository. 

## Instructions
1. Ultrathink and think hard before making any changes. 
2. Launch multiple Claude Code Agents to gather context and plan out the changes before making any changes.

Always leverage existing knowledge when planning out and designing a new component or refactoring an existing component.

## IMPORTANT: Use Reusable UI Components

**NEVER create inline progress bars, buttons, or other UI elements. We have reusable components for these:**

### Progress Bar Component
Use `/src/components/ui/ProgressBar.jsx` for ALL progress indicators:

```jsx
import { ProgressBar, ProgressNavigation } from '@/components/ui/ProgressBar';

// Basic progress bar
<ProgressBar 
  current={stage}
  total={4}
  label="Learning Progress"
  variant="emerald" // Options: "emerald", "purple", "teal", "blue", "orange", "pink"
/>

// Navigation buttons that match the progress bar
<ProgressNavigation
  current={stage}
  total={4}
  onPrevious={() => setStage(Math.max(1, stage - 1))}
  onNext={() => setStage(Math.min(4, stage + 1))}
  variant="emerald" // Matches progress bar color
/>
```

### Button Component
Use `/src/components/ui/button.jsx` for ALL buttons:

```jsx
import { Button } from '@/components/ui/button';

<Button variant="primary" size="sm" onClick={handleClick}>
  Submit
</Button>

// Variants: "primary" (teal), "success" (green), "danger" (red), "warning" (orange), "info" (blue), "neutral" (gray)
// Sizes: "xs", "sm", "default", "lg"
```

**Rule: If you need a progress bar or button, ALWAYS use these components. Do not create new ones inline.**

## UI Design Philosophy

**Core Principle**: Let content shape the interface. Design decisions should emerge from understanding what you're teaching, not from applying rigid templates.

## The Design Thinking Process

When creating or refactoring a component, follow this structured approach:

### 1. Understand Your Content First
Ask yourself:
- What concept are we teaching? What's the learning objective?
- What's the primary visualization or interaction?
- What supporting elements are essential vs. nice-to-have?
- How much space does the content naturally require?

### 2. Let Content Shape Layout
Based on your content analysis:
- **Wide content** (distributions, timelines, intervals) → Maximize horizontal space
- **Tall content** (decision trees, step-by-step processes) → Vertical flow
- **Dense data** (multiple related charts) → Grid layout
- **Single focus** (one main visualization) → Hero layout with minimal controls

### 3. Apply the 80-90% Space Utilization Principle
Your visualization should command attention:
- The actual content (not just container) should fill 80-90% of allocated space
- Minimize empty borders and gray areas
- If your viz looks small, either enlarge it or reduce container size
- Think of it as "information density" - maximize signal, minimize chrome

## Visual Design System

### Typography Hierarchy
Create clarity through consistent type treatment:
```
Headers:     text-base to text-lg (16-18px), font-semibold
Labels:      text-sm (14px), regular weight  
Data/Numbers: font-mono ALWAYS - no exceptions
Captions:    text-xs (12px), text-gray-500
```
**Rule**: Maximum 3 distinct font sizes per component

### Spacing Rhythm
Create breathing room without waste:
```
Section padding:    p-3 or p-4
Between controls:   space-y-3
Major sections:     gap-4 or gap-6
Inline elements:    gap-2
```

### Color Strategy
- **Primary data**: Use bright, saturated theme colors
- **Interactive elements**: Clear hover/active states
- **Status indicators**: Semantic (green=success, red=error)
- **Background hierarchy**: Base dark → section slightly lighter

## Design Patterns Based on Learning Goals

### Pattern 1: Exploration-First
When the visualization teaches through interaction:
```
┌─────────────────────────────────┐
│   Main Visualization (80-90%)    │
├─────────────────────────────────┤
│   Minimal Controls (grouped)     │
└─────────────────────────────────┘
```
**Examples**: CLTSimulation, ConfidenceInterval

### Pattern 2: Progressive Understanding
When building concepts step-by-step:
```
┌─────────────────────────────────┐
│   Current State/Visualization    │
│   Progressive Insights           │
│   (appear at milestones)         │
└─────────────────────────────────┘
```
**Examples**: ExpectationVariance with milestone revelations

### Pattern 3: Guided Process
When teaching a method or calculation:
```
Step 1: Setup → Step 2: Process → Step 3: Interpret
(Each step gets adequate space for its content)
```
**Examples**: IntegralWorkedExample

### Pattern 4: Comparison View
When contrasting approaches or outcomes:
```
┌────────────┬────────────┐
│   View A   │   View B   │
├────────────┴────────────┤
│    Shared Controls      │
└─────────────────────────┘
```

## Gold Standard Components
Study these exemplars:
- `/src/components/CLTSimulation.jsx` - Maximizes viz space, progressive milestones
- `/src/components/02-discrete-random-variables/ExpectationVariance.jsx` - Clear hierarchy, educational progression
- `/src/components/ConfidenceInterval.jsx` - Wide visualization, responsive design
- `/src/components/03-continuous-random-variables/IntegralWorkedExample.jsx` - Step-by-step clarity

## Pre-Implementation Checklist
Before coding, ensure you can answer:
- [ ] What's the natural shape/orientation of my content?
- [ ] Which layout pattern best supports the learning goal?
- [ ] How can I achieve 80-90% space utilization?
- [ ] Where will progressive insights appear?
- [ ] What's the visual hierarchy (what should users see first/second/third)?

## Red Flags to Avoid
- Tiny visualizations swimming in gray space
- Forcing horizontal content into vertical layouts (or vice versa)
- More than 3 font sizes creating visual chaos
- Numbers not in monospace font
- Controls dominating over educational content
- Missing hover states and transitions
- Cramming instead of using progressive disclosure


## Project Context
Educational statistics platform with interactive visualizations for engineering students. Focus on maximizing learning of statistics and probability concepts through interactive diagrams.

## Key Design Patterns

### Progressive Learning with Milestones
Build understanding through guided interaction:
- Set clear goals ("Collect 30 samples to see CLT in action!")
- Track progress with visual indicators
- Reveal different insights at different stages
- Celebrate when milestones are reached
- Examples: ExpectationVariance, CLTSimulation

### Responsive Design Patterns
Always provide great experiences across devices:
```jsx
// Mobile-first responsive classes
"flex flex-col lg:flex-row"     // Stack on mobile, side-by-side on desktop
"grid md:grid-cols-2"            // Single column mobile, 2 columns tablet+
"w-full lg:w-2/3"               // Full width mobile, 2/3 on desktop
```

### Interactive Feedback
Every action should have immediate visual response:
- Hover states on all interactive elements
- Smooth transitions (transition-all duration-200)
- Loading states during calculations
- Clear indication of current values/selections

### Educational Progression
Structure components to support learning:
1. **Start Simple**: Show basic concept first
2. **Add Complexity**: Introduce parameters/variations
3. **Provide Insights**: Reveal patterns through interaction
4. **Connect Theory**: Link to mathematical concepts
5. **Real-World Context**: Engineering applications

### Color Schemes
Use `createColorScheme()` from design system:
- `'probability'`: Blue/Emerald/Amber
- `'hypothesis'`: Teal/Amber/Orange
- `'estimation'`: Violet/Cyan/Amber
- `'inference'`: Teal/Orange/Yellow

## Core Principles
1. **Educational First**: Every feature should teach something
2. **Mathematical Rigor**: Use LaTeX for expressions (see `/docs/latex-guide.md`)
3. **Progressive Disclosure**: Start simple, reveal complexity
4. **Immediate Feedback**: Show results of every action
5. **Engineering Context**: Connect to real-world applications

## Development Workflow

### Commands
```bash
npm run dev              # Start development
npm run build && npm run lint  # Run before committing (ALWAYS!)
```

### Key Files to Reference
- `/src/components/CLTSimulation.jsx` - Maximizes viz space, progressive milestones
- `/src/components/02-discrete-random-variables/ExpectationVariance.jsx` - Clear hierarchy
- `/src/components/ConfidenceInterval.jsx` - Wide visualization, responsive design
- `/src/components/03-continuous-random-variables/IntegralWorkedExample.jsx` - Step-by-step clarity
- `/src/lib/design-system.js` - Colors and utilities

### Documentation
When working on specific topics, load additional context:
- `/docs/latex-guide.md` - LaTeX rendering patterns and troubleshooting
- `/docs/troubleshooting.md` - Common pitfalls and solutions
- `/docs/course-structure.md` - Course table of contents
- `/course-materials/` - Detailed course materials

## Refactoring Checklist

When refactoring a visualization:

1. **Assess Current State**
   - [ ] What percentage of container does the viz use? (Target: 80-90%)
   - [ ] Is the content naturally horizontal or vertical?
   - [ ] Count distinct font sizes (Target: ≤3)
   - [ ] Identify wasted gray space

2. **Plan Layout**
   - [ ] Choose appropriate pattern based on learning goal
   - [ ] Consider aspect ratio of main content
   - [ ] Plan for LaTeX stability (React.memo where needed)

3. **Execute Systematically**
   - [ ] Apply typography system consistently
   - [ ] Ensure numbers use font-mono
   - [ ] Add progressive insights based on interaction
   - [ ] Include proper hover states and transitions

4. **Validate**
   - [ ] npm run build && npm run lint
   - [ ] Check LaTeX renders during state changes
   - [ ] Verify viz fills its container properly