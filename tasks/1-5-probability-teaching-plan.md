# Teaching Plan: Section 1.5 - Probability of an Event

## Overview
This section builds the foundation of probability theory through three interconnected components:
1. **Probability of an Event** (current component - working well)
2. **Axioms of Probability** (new component - to build)
3. **General Addition Rule** (new component - to build)

## Design Philosophy
1. **Content clarity first** - Perfect the teaching flow before adding interaction
2. **Visual hierarchy** - Clear progression from concept to concept
3. **Consistent layout** - Each section follows similar structure for cognitive ease
4. **LaTeX-first** - All mathematical notation properly rendered
5. **Static before interactive** - Nail the content, then add interactivity

## Component Details

### Component 1: Probability of an Event (1-5-1-ProbabilityEvent.jsx)
**Status**: ✓ Complete and working well
- Teaches P(A) = |A|/|S| through dice visualization
- Shows convergence to theoretical probability
- Good balance of interaction and learning

### Component 2: Axioms of Probability (1-5-2-AxiomsOfProbability.jsx)
**Status**: To build

#### Content Structure:
```
The Axioms of Probability
These four rules govern ALL probability calculations

┌─────────────────────────────────────────────────┐
│ Axiom 1: Probability Bounds                     │
│         0 ≤ P(A) ≤ 1                           │
│                                                 │
│ Visual: Progress bar showing valid range        │
│ Example: P(rain) = 0.3 ✓                       │
│         P(rain) = 1.5 ✗ (impossible!)          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Axiom 2: Certainty                              │
│         P(S) = 1                                │
│                                                 │
│ Visual: Complete circle = 1                     │
│ "Something must happen"                         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Axiom 3: Impossibility                          │
│         P(∅) = 0                                │
│                                                 │
│ Visual: Empty set representation                │
│ "Nothing from nothing"                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Axiom 4: Addition for Mutually Exclusive       │
│    If A ∩ B = ∅, then:                         │
│    P(A ∪ B) = P(A) + P(B)                      │
│                                                 │
│ Visual: Two non-overlapping circles             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Key Consequence: Complement Rule                │
│    P(A^c) = 1 - P(A)                           │
│                                                 │
│ Proof: Since A ∪ A^c = S and A ∩ A^c = ∅      │
│        P(S) = P(A) + P(A^c) = 1                │
└─────────────────────────────────────────────────┘
```

#### Visual Elements:
- Progress bar for Axiom 1 (showing 0 to 1 range)
- Circle/pie chart for Axiom 2 (complete = 1)
- Empty set symbol for Axiom 3
- Non-overlapping Venn diagram for Axiom 4
- Partition visualization for complement rule

### Component 3: General Addition Rule (1-5-3-GeneralAdditionRule.jsx)
**Status**: To build

#### Content Structure:
```
The General Addition Rule
What if events CAN overlap?

┌─────────────────────────────────────────────────┐
│ The Formula:                                    │
│    P(A ∪ B) = P(A) + P(B) - P(A ∩ B)          │
│                                                 │
│ Why subtract P(A ∩ B)?                         │
│ → We counted it twice!                         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Visual Proof:                                   │
│                                                 │
│  [Static Venn diagram with labeled regions]     │
│   - Only A: P(A) - P(A∩B)                      │
│   - A and B: P(A∩B)                            │
│   - Only B: P(B) - P(A∩B)                      │
│                                                 │
│  Total = P(A) + P(B) - P(A∩B) ✓               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Special Cases:                                  │
│                                                 │
│ 1. Mutually Exclusive (A ∩ B = ∅):            │
│    P(A ∪ B) = P(A) + P(B)                     │
│                                                 │
│ 2. A ⊆ B:                                      │
│    P(A ∪ B) = P(B)                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Example: Electronic Component                   │
│                                                 │
│ P(A fails) = 0.2                               │
│ P(B fails) = 0.3                               │
│ P(both fail) = 0.15                            │
│                                                 │
│ P(at least one fails) = ?                      │
│ = 0.2 + 0.3 - 0.15 = 0.35                    │
└─────────────────────────────────────────────────┘

Extension to 3 Events:
P(A ∪ B ∪ C) = P(A) + P(B) + P(C)
              - P(A ∩ B) - P(A ∩ C) - P(B ∩ C)
              + P(A ∩ B ∩ C)
```

#### Visual Elements:
- Overlapping Venn diagram with clear region labels
- Color-coded regions showing the counting process
- Special case diagrams (mutually exclusive, subset)
- 3-event Venn diagram for extension

## Implementation Strategy

### Phase 1: Static Components (Priority)
1. Create clean layout with consistent spacing
2. Implement LaTeX rendering for all formulas
3. Design simple, clear SVG visualizations
4. Use consistent color scheme from design system
5. Ensure responsive layout

### Phase 2: Visual Polish
1. Add subtle animations (fade-ins on scroll)
2. Highlight formulas on hover
3. Connect related concepts visually
4. Add progress indicators between sections

### Phase 3: Interactive Elements (Only if needed)
1. Axiom 1: Slider to test probability bounds
2. Addition Rule: Click regions to see calculations
3. Examples: Step-through solutions

## Design Patterns

### Consistent Component Structure:
```jsx
<VisualizationContainer title="Component Title">
  <div className="concept-intro">
    {/* Brief introduction */}
  </div>
  
  <div className="axiom-grid">
    {axioms.map(axiom => (
      <VisualizationSection key={axiom.id}>
        <h3>{axiom.title}</h3>
        <div className="latex-formula">
          {/* LaTeX formula */}
        </div>
        <div className="visual">
          {/* SVG visualization */}
        </div>
        <div className="example">
          {/* Concrete example */}
        </div>
      </VisualizationSection>
    ))}
  </div>
  
  <div className="key-insights">
    {/* Important consequences */}
  </div>
</VisualizationContainer>
```

### Color Coding:
- Axiom 1: Blue gradient (0 to 1)
- Axiom 2: Green (certainty/complete)
- Axiom 3: Gray (empty/nothing)
- Axiom 4: Purple/Orange (two distinct events)
- Formulas: White on dark background
- Examples: Subtle background tint

### Typography:
- Axiom titles: 18px, font-weight 600
- LaTeX formulas: 16px (handled by MathJax)
- Body text: 14px
- Examples: 14px with monospace for numbers

## Key Teaching Points

### Axioms Component:
1. These rules are **fundamental** - all probability follows them
2. Show **why** each axiom must be true
3. Connect to intuition (can't have more than 100% chance)
4. Build to complement rule as natural consequence

### Addition Rule Component:
1. Start with intuition - why we need to subtract overlap
2. Visual proof is key - show the double counting
3. Special cases help understanding
4. Work through examples step-by-step

## Success Metrics
- Students understand why axioms are necessary
- Can apply complement rule confidently
- Understand when to use general vs special addition rule
- Can work through multi-event problems

## Next Steps
1. Build static Axioms component
2. Build static Addition Rule component
3. Test LaTeX rendering and responsive layout
4. Add to navigation/course structure
5. Create practice problems if time allows