## Component Versioning Pattern
  When creating multiple versions for comparison:
  1. Use folder suffixes: component-v1/, component-v2/, component-old/,
  component-new/
  2. Import: Use Next.js Link (import Link from 'next/link'), NOT react-router-dom
  3. Routing: Add temporary routes to chapter page with clear labels [V1], [V2], etc.
  4. Mark as TEMPORARY - these URLs will be removed after selection


  ## Component Standards
  - Fill 80-90% space, show content on load
  - Educational focus: no gamification/achievements
  - Dense explanations, minimal marketing language
  - Fast feedback loops (<10 interactions)
  - Copy proven animation patterns
  - Verify Next.js imports & hooks

1. Deep Analysis Phase
Before writing any code, thoroughly analyze the problem:

Break down the objective into core components
Identify potential edge cases and constraints
Consider multiple architectural approaches

2. Multi-Perspective Evaluation
When tackling complex problems:

Approach the issue from different angles (user experience, performance, maintainability, scalability)
Consider trade-offs between different solutions
Think about both immediate needs and future extensibility

3. Simplicity First Principle

Start with the simplest solution that could possibly work
Add complexity only when proven necessary
Prefer clarity over cleverness in implementation

4. Continuous Simplification Check
At each decision point, ask:

"Is this the simplest way to achieve our goal?"
"What can we remove while maintaining functionality?"
"Are we solving problems we don't actually have?"

5. Avoid Premature Optimization

Don't over-engineer for hypothetical future requirements
Build for current needs with reasonable flexibility
Refactor when requirements actually change, not before

6. Implementation Only After Understanding

Ensure you have a complete mental model of the solution
Validate your approach against the requirements
Have evaluated and compared multiple implementation strategies
Can clearly articulate why your chosen approach is optimal

## Project
Educational statistics platform with interactive visualizations.

## Core Principles
1. **Educational First**: Every feature teaches
2. **Simplicity**: Reduce code, be concise
3. **Mathematical Rigor**: Use LaTeX (see `/docs/latex-guide.md`)

## Use Existing Components
- **Progress bars**: `/src/components/ui/ProgressBar.jsx`
- **Buttons**: `/src/components/ui/button.jsx`
- Never create inline UI elements

## Design Principles

1. **Content-first**: Let content shape layout
2. **80-90% rule**: Visualizations fill their space
3. **Layout by content type**:
   - Wide content → Horizontal layout
   - Tall content → Vertical flow
   - Dense data → Grid
   - Single focus → Hero with minimal controls

## Visual System

**Typography**: Headers (text-lg), Labels (text-sm), Numbers (font-mono), Max 3 sizes

**Spacing**: Sections (p-3/p-4), Between controls (space-y-3), Major gaps (gap-4/gap-6)

**Colors**: Bright for data, semantic for status, clear hover states

## Layout Patterns

1. **Exploration**: Large viz (80-90%) + minimal controls
2. **Progressive**: Viz + insights revealed at milestones  
3. **Guided**: Step 1 → Step 2 → Step 3
4. **Comparison**: Side-by-side views + shared controls

## Good Examples
See Chapter 1 and 2 components

## Checklist
- Content shape drives layout
- 80-90% space usage
- Numbers in font-mono
- Progressive disclosure
- Hover states

## Commands
```bash
npm run dev                    # Start
npm run build && npm run lint  # Before commit
```

## Resources
See `/docs/` folder for all best practices and guides. Claude will select relevant docs based on your task.
