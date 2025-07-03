# Chapter 3 Migration Prompt - Continuous Distributions

## Objective
Migrate Chapter 3 from the legacy architecture to the standardized hub-based model established in Chapters 6 and 7. This migration should enhance the learning experience while preserving all existing interactive components.

## Pre-Migration Checklist

Before starting, ensure you have:
- [ ] Access to Chapter 7 as the reference implementation
- [ ] Course materials for Chapter 3
- [ ] List of all existing Chapter 3 components
- [ ] Understanding of the shared ChapterHub component

## Systematic Migration Process

### Step 1: Reference Analysis (20 minutes)

**Analyze Chapter 7's Implementation**
1. Study `/src/components/07-linear-regression/7-0-LinearRegressionHub.jsx`
2. Note these key patterns:
   - How sections are configured
   - Navigation implementation
   - Color scheme usage
   - Component structure
   - Route organization

**Key Elements to Replicate:**
- Header with motion animation
- Introduction card with gradient
- Section configuration array
- Navigation with useRouter
- Progress tracking integration

### Step 2: Content Analysis (25 minutes)

**Study Course Materials**
1. Read `/course-materials/content/chapter-03-continuous-distributions.md`
2. Create a section outline:
   ```
   3.1: [Section Title]
   3.2: [Section Title]
   etc.
   ```

**For Each Section, Note:**
- Mathematical concepts
- Key formulas (for LaTeX rendering)
- Learning objectives
- Difficulty level assessment
- Prerequisites from previous sections

### Step 3: Component Inventory (20 minutes)

**Catalog Existing Components**
1. List all files in `/src/components/03-continuous-distributions/`
2. Open `/src/app/chapter3/page.js` to see current usage
3. Create a status table:

| Component File | Used In Section | Status | Notes |
|---------------|-----------------|---------|--------|
| 3-1-1-ComponentName.jsx | Section 3.1 | Active | Needs BackToHub |
| ... | ... | ... | ... |

**Identify:**
- Components that map directly to course sections
- Components that need to be combined
- Missing components for course sections
- Components that need updates

### Step 4: Migration Planning (30 minutes)

**Create Task Files Structure:**
```
/tasks/chapter-3/
  00-Hub.md
  01-[FirstSection].md
  02-[SecondSection].md
  ...
  00-ExecutionPlan.md
  component-mapping.md
```

**Hub Configuration Template:**
```javascript
const CHAPTER_3_SECTIONS = [
  {
    id: 'section-id',
    title: '3.X: Full Title',
    subtitle: 'Engaging subtitle',
    description: 'Clear description of what students will learn...',
    icon: IconComponent, // Choose appropriate icon
    difficulty: 'Beginner|Intermediate|Advanced',
    estimatedTime: 'XX min',
    prerequisites: [], // List prerequisite section IDs
    learningGoals: [
      'Students will be able to...',
      'Students will understand...',
      'Students will calculate...',
      'Students will apply...'
    ],
    route: '/chapter3/section-route',
    color: '#hexcolor', // Match difficulty
    question: "Thought-provoking question?",
    preview: "Interactive element description"
  },
  // ... more sections
];
```

### Step 5: Component Mapping Strategy (20 minutes)

**For Each Course Section:**
1. Identify primary component(s)
2. List supporting components (examples, exercises)
3. Determine integration approach:
   - Single component → Single route
   - Multiple related → Combine in one route
   - Missing → Note for creation

**Document Format:**
```markdown
## Section 3.X: [Title]

### Course Content
- Topics covered: ...
- Key concepts: ...

### Existing Components
- Primary: [filename]
- Supporting: [filenames]

### Migration Plan
- Route: /chapter3/[route-name]
- Updates needed: [BackToHub, styling, etc.]
- New components needed: [if any]
```

### Step 6: Technical Implementation Guide (25 minutes)

**Create Execution Plan with:**

1. **Directory Structure**
   ```
   /src/app/chapter3/
     page.js                    # Hub page
     uniform-distribution/      # Section directories
       page.jsx
     normal-distribution/
       page.jsx
     exponential-distribution/
       page.jsx
     [continue for all sections]
   ```

2. **Page Template for Each Section**
   ```jsx
   import Component from '@/components/03-continuous-distributions/[ComponentFile]';
   import BackToHub from '@/components/shared/BackToHub';

   export default function SectionPage() {
     return (
       <>
         <BackToHub 
           chapterNumber={3} 
           chapterTitle="Continuous Distributions"
           chapterLink="/chapter3"
         />
         <Component />
       </>
     );
   }
   ```

3. **Migration Sequence**
   - Phase 1: Create hub component
   - Phase 2: Create first section (proof of concept)
   - Phase 3: Test navigation flow
   - Phase 4: Migrate remaining sections
   - Phase 5: Update sidebar configuration
   - Phase 6: Remove old implementation

### Step 7: Quality Assurance Checklist

**For Each Section:**
- [ ] Component renders without errors
- [ ] Navigation to/from hub works
- [ ] Mathematical formulas render (LaTeX)
- [ ] Interactive elements function
- [ ] Mobile responsive
- [ ] Loading states handled
- [ ] Error boundaries in place

**Overall Chapter:**
- [ ] All sections accessible
- [ ] Progress tracking works
- [ ] Consistent styling
- [ ] Performance acceptable
- [ ] No console warnings

## Common Pitfalls to Avoid

1. **Component Import Issues**
   - File names may not match export names
   - Some components may have numbered prefixes
   - Check actual exports before importing

2. **Route Naming**
   - Use kebab-case for URLs
   - Match route names to section IDs
   - Ensure consistency across configuration

3. **State Management**
   - Remove section state from main page
   - Let routing handle navigation
   - Preserve any component-specific state

4. **Styling Conflicts**
   - Check for hardcoded colors
   - Ensure dark theme compatibility
   - Test responsive breakpoints

## Expected Timeline

- Analysis & Planning: 2 hours
- Hub Implementation: 30 minutes
- Per Section Migration: 15-20 minutes
- Testing & Refinement: 1 hour
- Total: ~4-5 hours for full chapter

## Success Metrics

1. **Functional**: All components work as before
2. **Navigational**: Smooth hub ↔ section flow
3. **Visual**: Consistent with Chapters 6 & 7
4. **Educational**: Clear learning path
5. **Technical**: Clean code, no errors

---

**Remember**: The goal is not to rebuild, but to reorganize. Preserve existing work while improving the structure and navigation.