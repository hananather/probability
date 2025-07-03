# Chapter 1 Meta-Prompt: Introduction to Probabilities

## Purpose
This prompt guides the systematic evaluation and planning for transforming Chapter 1 components into comprehensive learning modules that combine existing interactive elements with rigorous mathematical content.

## Core Instruction
For EACH component in Chapter 1, you will create a detailed transformation plan by:
1. Deeply analyzing the current component
2. Cross-referencing with gold standard patterns (chapters 6.3, 6.9, and 7)
3. Integrating relevant course material
4. Reflecting on multiple approaches before deciding

## Components to Transform

1. `1-1-SampleSpacesEvents.jsx`
2. `1-2-ClassicalProbability.jsx`
3. `1-3-OrderedSamples.jsx`
4. `1-4-UnorderedSamples.jsx`
5. `1-5-1-ConditionalProbability.jsx`
6. `1-5-2-IndependentEvents.jsx`
7. `1-6-MontyHallHub.jsx` (and all sub-files)
8. `1-7-BayesTheoremIntro.jsx`
9. `1-8-BayesTheoremExploration.jsx`
10. `1-9-CountingTechniques.jsx`

## Step-by-Step Process for Each Component

### Step 1: Deep Component Analysis
```
1. Read the current component file completely
2. Identify:
   - Core interactive elements and animations
   - Current educational approach
   - Technical implementation details
   - Component size and complexity
   - Any existing mathematical content
3. Extract reusable elements:
   - Animation functions
   - Visualization components
   - Interactive controls
   - Color schemes and styling
```

### Step 2: Cross-Reference Gold Standards
```
Review these specific patterns from gold standard components:
- Component architecture (React.memo, useEffect for MathJax)
- Content organization (Motivating question → Core concept → Interactive → Framework → Example)
- Visual patterns (cards, gradients, spacing)
- Mathematical presentation (formula cards, worked examples)
- Progressive disclosure (expandable sections, not toggles)
```

### Step 3: Map Course Material
```
From /course-materials/content/chapter-01-introduction-to-probabilities.md:
1. Identify relevant mathematical concepts for this component
2. Extract:
   - Key formulas and theorems
   - Real-world applications
   - Theoretical foundations
   - Common misconceptions
3. Note connections to other topics
```

### Step 4: Multi-Perspective Reflection
```
For each major design decision, consider 5-7 approaches:
1. How to present the mathematical foundation
2. How to integrate existing interactions
3. How to structure the learning progression
4. How to handle complex formulas
5. How to incorporate real-world examples
6. How to maintain visual consistency
7. How to ensure mobile responsiveness

Then distill to 1-2 best approaches with justification.
```

### Step 5: Generate Transformation Plan

Structure your plan as follows:

```markdown
# [Component Name] Transformation Plan

## Component Analysis
- Current functionality: [Brief description]
- Reusable elements: [List key animations/interactions to preserve]
- Complexity level: [Simple/Medium/Complex]
- Special considerations: [Any unique aspects]

## Mathematical Content to Add
From course material section X.X:
- Formula 1: [LaTeX formula and explanation]
- Formula 2: [LaTeX formula and explanation]
- Real-world example: [Description]
- Key concepts: [List]

## Implementation Structure

### File Location
`/src/components/chapters/Chapter1Enhanced/1-X-ComponentName.jsx`

### Component Architecture
[Follow gold standard pattern with React.memo, MathJax refs, etc.]

### Content Flow
1. Motivating Question
   - [Specific question that hooks the learner]
   
2. Core Mathematical Foundation
   - [Primary formula/theorem presentation]
   
3. Interactive Exploration
   - [How to wrap/integrate existing visualization]
   
4. Mathematical Framework
   - [Grid of concept cards to add]
   
5. Worked Example
   - [Step-by-step calculation relevant to topic]

### Visual Design
- Color scheme: Chapter 1 (indigo/blue/purple)
- Card patterns: [Specific card types needed]
- Animations: [Which animations to reuse/create]

### Code Structure
[Specific organization pattern for this component]

## Testing Checklist
- [ ] Original interactions preserved
- [ ] LaTeX renders correctly
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Accessibility maintained
```

## Special Instructions

### For Monty Hall (Multi-file component)
1. Create transformation plans for EACH file
2. Design shared context for formulas
3. Maintain navigation flow between files
4. Ensure visual consistency across all sub-components

### For Dense Components (>1000 lines)
1. Prioritize code organization
2. Extract reusable utilities
3. Use section markers for clarity
4. Consider performance implications

### Progressive Disclosure Pattern
```jsx
// Not this (toggle pattern):
{showAdvanced && <AdvancedContent />}

// But this (always visible with expansion):
<details className="bg-neutral-900/50 rounded-lg p-4">
  <summary>Deep Dive: Mathematical Proof</summary>
  <div className="mt-4">{/* Advanced content */}</div>
</details>
```

## Key Principles to Maintain

1. **Mathematical Rigor First**: Every visualization serves to teach a mathematical concept
2. **Preserve Functionality**: Never break existing interactions
3. **Gold Standard Patterns**: Follow chapters 6-7 visual and architectural patterns exactly
4. **Safe Implementation**: Create new files in Enhanced folder, never modify originals
5. **Course Alignment**: Every component must align with its course material section

## Reflection Requirements

For EVERY design decision, ask:
1. Does this enhance mathematical understanding?
2. Is this the simplest solution that achieves our goal?
3. Does this follow gold standard patterns?
4. Will this work on mobile devices?
5. Is the code maintainable and performant?

## Output Format

For each component, produce a markdown file named:
`/tasks/chapter-1/plans/1-X-ComponentName-plan.md`

Each plan should be self-contained and ready for implementation.

## Remember
You are creating PLANS, not implementing code. Focus on thorough analysis, thoughtful design, and clear documentation of the transformation approach.