# CLAUDE.md

Ultrathink.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Interactive probability and statistics learning platform built with Next.js 15, React 19, D3.js, and MathJax. Uses modern App Router architecture with feature-based component organization.

## Primary Directive: Bug Fixing Only
We are fixing bugs only. No new features.

## Bug Resolution Workflow

### 1. When you receive a bug
1. Find the exact component from the screenshot/description
2. Launch parallel agents to investigate:
   - One to analyze the broken component
   - One to find similar working components
   - One to check relevant docs and patterns

### 2. Analyze from multiple angles
For each bug, identify 5-7 potential causes (use parallel tasks/agents). Then narrow to 2 most likely causes based on evidence.
- Find similar working component (`/src/components/learn/GoldStandardShowcase.jsx`)
- Copy its pattern exactly
- Check relevant `/docs/` guides
- Don't create new solutions

### 3. Verify the fix
```bash
npm run build && npm run lint  # Always run before considering complete
```

Check:
- Bug is actually fixed
- No new errors introduced
- All buttons/interactions work
- No console errors

### 4. Document what you learned
After fixing, update `/Users/hananather/Desktop/Javascript/prob-lab/todo/` with:
- What was actually broken
- Why it was broken
- What pattern fixed it

## Commands
```bash
npm run dev                    # Start development server (localhost:3000)
npm run build                  # Build for production
npm run lint                   # Check code quality with ESLint
npm run build && npm run lint  # Pre-commit verification (always use)
npm run clean-build            # Clean build (removes .next directory)
```

## Architecture & Key Patterns

### Component Architecture
- **Gold Standard**: `/src/components/learn/GoldStandardShowcase.jsx` - Reference for all UI patterns
- **Tabbed Learning**: 4-tab structure (Foundations, Worked Examples, Quick Reference, Interactive)
- **Reusable Components**: `/src/components/ui/patterns/` for common patterns
- **Chapter Organization**: `/src/components/01-07-*/` organized by course chapters

### Critical Technical Patterns

#### LaTeX Rendering (see `/docs/latex-guide.md`)
- Always use `dangerouslySetInnerHTML` for LaTeX content
- Use `useMathJax` hook with retry logic
- Template literals for LaTeX props: `` `\(...\)` `` not regular quotes
- Multi-letter subscripts: `_{\\text{XY}}` not `_{XY}`
- Never manual MathJax processing

#### D3.js Dragging (see `/docs/dragging-best-practices.md`)
- Always use delta-based movement, never absolute positioning
- No debouncing during drag operations
- Use refs for drag state
- Reusable: `D3DragWrapper`, `DraggableHandle`, `DraggableBars`

#### State Management
- Never localStorage in useState initializer (hydration issues)
- Use useEffect for client-side only operations
- React.memo for components containing LaTeX

### Common Bug Patterns & Fixes

1. **LaTeX not rendering**: Use `useMathJax` hook, check for race conditions
2. **Dragging jumps**: Switch from absolute to delta-based positioning
3. **Hydration errors**: Move localStorage to useEffect
4. **Console warnings**: Check for missing keys, improper nesting
5. **Build failures**: Fix TypeScript errors, missing imports
6. **SVG/Chart spacing overlaps**: Elements below charts often overlap due to insufficient margins. Fix by using large explicit margins (e.g., `style={{ marginTop: '200px' }}`) instead of Tailwind classes like `mt-6`. This is especially common with D3.js SVGs where the height might not be properly accounted for in the layout flow.


## Key Dependencies
- **Framework**: Next.js 15, React 19
- **Math**: MathJax 3, KaTeX, jstat
- **Visualization**: D3.js ecosystem
- **Styling**: Tailwind CSS 4, Framer Motion
- **UI**: Radix UI, Lucide React

## Development Guidelines
- Professional tone, real applications, no gamification
- Semantic color coding for mathematical concepts
- Error boundaries for robustness
- Performance: Dynamic imports, lazy loading
- Accessibility: Proper ARIA labels, keyboard navigation

## If unsure about anything, ask
Don't guess about:
- Which component to modify
- What the bug actually is
- Whether a fix might break something else

## Resources
- `/docs/latex-guide.md` - LaTeX rendering patterns
- `/docs/dragging-best-practices.md` - D3 dragging implementation
- `/docs/mathJax-racecondition-fixes.md` - MathJax timing issues
- `/docs/tabbed-learning-migration.md` - Tabbed component patterns
- `/src/components/learn/GoldStandardShowcase.jsx` - UI reference implementation


Ultrathink.