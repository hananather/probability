# Chapter 2 Migration Prompt - Discrete Distributions

## Objective
Migrate Chapter 2 from the legacy single-page architecture to the standardized hub-based model used in Chapters 6 and 7. This migration should preserve all existing functionality while improving navigation, consistency, and maintainability.

## Step-by-Step Migration Process

### Phase 1: Analysis and Understanding (30 minutes)

1. **Study the Gold Standard**
   - Examine `/src/components/07-linear-regression/7-0-LinearRegressionHub.jsx`
   - Understand how it uses the shared `ChapterHub` component
   - Note the section configuration structure
   - Study the navigation pattern with `useRouter`

2. **Analyze Course Content**
   - Read `/course-materials/content/chapter-02-discrete-distributions.md`
   - List all sections and subsections
   - Note mathematical concepts and formulas
   - Identify learning objectives for each section

3. **Inventory Existing Components**
   - List all components in `/src/components/02-discrete-distributions/`
   - Check current implementation at `/src/app/chapter2/page.js`
   - Note which components are used and how they're organized
   - Identify any missing components for course sections

### Phase 2: Component Mapping (20 minutes)

Create a mapping document that matches:
- Course sections → Existing components
- Identify gaps where components don't exist
- Group related components (e.g., main component + worked examples)
- Note any components that need minor updates (e.g., adding BackToHub)

Example format:
```
Section 2.1: Random Variables
- Components: 2-1-1-SpatialRandomVariable.jsx
- Status: Exists, needs BackToHub
- Route: /chapter2/random-variables
```

### Phase 3: Task File Creation (45 minutes)

For each section, create a task file in `/tasks/chapter-2/`:

1. **Hub Task** (`00-Hub.md`):
   - Section configuration with all metadata
   - Key concepts to display
   - Introduction text
   - Color scheme selection

2. **Section Tasks** (`01-RandomVariables.md`, etc.):
   - Learning objectives
   - Required components
   - Interactive elements description
   - Implementation notes

Use this template:
```markdown
# [Section Number]: [Section Title]

## Overview
[Brief description of what this section covers]

## Components
- Main: [component file name]
- Supporting: [any additional components]

## Learning Objectives
1. [Specific objective 1]
2. [Specific objective 2]
3. [Specific objective 3]

## Interactive Elements
- [Description of visualizations]
- [User interactions]

## Technical Requirements
- [Any special requirements]
- [Dependencies]
```

### Phase 4: Implementation Plan (15 minutes)

Create `00-ExecutionPlan.md` with:

1. **Directory Structure**
   ```
   /src/app/chapter2/
     page.js (hub)
     random-variables/page.jsx
     expectation-variance/page.jsx
     [etc...]
   ```

2. **Migration Steps**
   - Create hub component
   - Create route pages
   - Update sidebar configuration
   - Test each section
   - Remove old implementation

3. **Validation Checklist**
   - [ ] All sections accessible
   - [ ] Navigation works both ways
   - [ ] No console errors
   - [ ] Mobile responsive
   - [ ] Progress tracking works

### Phase 5: Section Configuration

Each section should include:
```javascript
{
  id: 'unique-id',
  title: 'Section X.X: Title',
  subtitle: 'Catchy tagline',
  description: 'What students will learn...',
  icon: IconName, // from lucide-react or phosphor-react
  difficulty: 'Beginner|Intermediate|Advanced',
  estimatedTime: 'XX min',
  prerequisites: ['previous-section-id'],
  learningGoals: [
    'Specific goal 1',
    'Specific goal 2',
    'Specific goal 3',
    'Specific goal 4'
  ],
  route: '/chapter2/section-route',
  color: '#hexcode',
  question: "Engaging question?",
  preview: "What they'll see"
}
```

## Key Principles

1. **Preserve Existing Work**: Don't rebuild components, just reorganize
2. **Incremental Migration**: Test each section before moving to the next
3. **Consistency**: Follow Chapter 7's patterns exactly
4. **Documentation**: Document all decisions and mappings
5. **User Experience**: Ensure smooth navigation and clear learning paths

## Expected Deliverables

1. Complete set of task files in `/tasks/chapter-2/`
2. Component mapping document
3. Execution plan with timeline
4. List of any components that need creation or updates

## Success Criteria

- Chapter 2 hub matches the quality and functionality of Chapter 7
- All existing components are successfully integrated
- Navigation is intuitive and consistent
- Course content is fully represented
- No functionality is lost in migration

---

**Note**: This same process can be applied to any chapter. The key is systematic analysis, careful mapping, and incremental implementation.