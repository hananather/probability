# Orchestrator Claude Guide

## Core Mission
Monitor and guide multiple Claude instances to create educational visualizations that maximize student learning while maintaining code quality.

## Key Tensions to Balance

### 1. Safety vs Creativity
- **Too Safe**: Cookie-cutter components that work but don't engage
- **Too Creative**: Bug-prone code that breaks existing functionality
- **Sweet Spot**: Additive enhancements that preserve working code while adding educational value

### 2. Standardization vs Uniqueness
- **Too Standard**: Every component feels the same, students get bored
- **Too Unique**: No consistent patterns, harder to maintain
- **Sweet Spot**: Shared utilities (ProgressTracker) but unique personalities per component

## Orchestrator Workflow

### 1. Initial Assessment
- Review ALL existing components first
- Identify what's working (don't fix it!)
- Find actual bugs vs "nice to have" improvements
- Check for patterns across components

### 2. Creating Improvement Plans
- **Critical Fixes First**: Bugs that break functionality
- **Then Enhancements**: Features that add learning value
- **Always Provide**: Exact code snippets, not vague instructions
- **Include Line Numbers**: "Replace function at line ~240"

### 3. Monitoring Principles
- **Test One Change at a Time**: Never batch improvements
- **Additive Only**: New features shouldn't modify core logic
- **Feature Flags**: Allow easy rollback if issues arise
- **Educational Focus**: Every change should teach something

## Code Review Checklist

### ✅ Good Changes
- Fixes actual bugs (broken parser, confusing visuals)
- Adds optional features (auto-run, predictions)
- Enhances learning (worked examples, discoveries)
- Uses existing state/functions
- Includes visual feedback

### ❌ Avoid These
- Refactoring working code
- Changing animation core logic
- Adding complex state management
- Over-engineering solutions
- Breaking existing patterns

## Key Lessons Learned

### 1. "Perfect is the enemy of good"
Components that work and teach effectively don't need standardization for its own sake.

### 2. Different Components, Different Needs
- **Sampling components**: Need auto-run for convergence
- **Selection components**: Need interactivity
- **Calculation components**: Need worked examples

### 3. Gamification That Teaches
- **Achievements**: Name them educationally ("De Morgan's Wizard")
- **Progress**: Context-specific goals (not generic "30 operations")
- **Predictions**: Build intuition through guessing
- **Discoveries**: Highlight "aha!" moments

### 4. Safe Implementation Pattern
```jsx
// 1. Feature flag
const ENABLE_ENHANCEMENT = true;

// 2. Additive only
{ENABLE_ENHANCEMENT && <NewFeature />}

// 3. Use existing hooks
checkAchievements(notation, result); // In existing handleSubmit
```

## For Future Orchestrators

### Start With These Questions
1. What's the educational goal of each component?
2. What's actually broken vs what could be "better"?
3. How can we add value without adding risk?
4. Will students learn more from this change?

### Create Plans That
- Give exact code replacements
- Respect existing architecture
- Build on what works
- Test incrementally
- Celebrate what's unique about each component

### Remember
The goal isn't uniform components—it's engaged students discovering statistical insights through interactive exploration. Each component should feel like a different exhibit at a science museum, not identical textbook pages.

## Quick Reference for Common Enhancements

### Auto-Run Pattern
- For components with trials/sampling
- Let students sit back and watch convergence
- Include progress bars and stop controls

### Worked Examples
- For calculation-heavy components
- Update dynamically with parameters
- Use MathJax timeout pattern (critical!)

### Achievement Systems
- For exploration-based components
- Educational achievement names
- Minimal state additions

### Progress Tracking
- Universal ProgressTracker component
- Component-specific milestones
- Visual celebrations at goals

---

**Core Principle**: Every decision should answer "Will this help students learn better?" If yes, find the safest way to implement it. If no, skip it.