# Chapter 5 Migration: Start Here Guide

## Quick Context for New Claude Instance

You're about to migrate Chapter 5 from a legacy single-page architecture to a modern hub-based model. This guide provides all essential context.

## Project Overview
- **Project**: Interactive statistics learning platform (prob-lab)
- **Framework**: Next.js 13+ with React
- **Current State**: Chapter 5 uses old architecture with dynamic loading
- **Goal**: Match the structure of Chapters 6 & 7 (hub-based navigation)

## Essential Files to Review First

### 1. Reference Implementation (Study This!)
```bash
# This is your gold standard - Chapter 7's implementation
/src/components/07-linear-regression/7-0-LinearRegressionHub.jsx
/src/components/07-linear-regression/7-1-CorrelationCoefficient.jsx
/src/app/chapter7/page.js
/src/app/chapter7/correlation-coefficient/page.js
```

### 2. Current Chapter 5 Implementation
```bash
# Current implementation to migrate from
/src/app/chapter5/page.js  # Single-page app with tabs
/src/components/05-estimation/  # All current components
```

### 3. Shared Components to Use
```bash
/src/components/shared/ChapterHub.jsx  # MUST use this for consistency
/src/components/ui/BackToHub.jsx      # Navigation component
/src/components/ui/VisualizationContainer.jsx
```

### 4. Critical Documentation
```bash
/docs/latex-guide.md  # LaTeX rendering patterns (MUST follow)
/tasks/chapter-5/00-ExecutionPlan.md  # Detailed migration plan
/tasks/chapter-5/5-0-Hub.md through 5-5-*.md  # Component specifications
```

## Pre-Migration Checklist

Before starting ANY work:

1. **Read the Execution Plan**
   ```bash
   cat /tasks/chapter-5/00-ExecutionPlan.md
   ```

2. **Understand Current Structure**
   ```bash
   # Review how Chapter 5 currently works
   cat /src/app/chapter5/page.js
   ls -la /src/components/05-estimation/
   ```

3. **Study Chapter 7 Pattern**
   ```bash
   # This is your template
   cat /src/components/07-linear-regression/7-0-LinearRegressionHub.jsx
   ```

4. **Check LaTeX Guidelines**
   ```bash
   cat /docs/latex-guide.md
   ```

## Migration Execution Steps

### Step 1: Create Archive (CRITICAL - Do This First!)
```bash
# Create archive directories
mkdir -p /src/components/05-estimation-archive
mkdir -p /src/app/chapter5-archive

# Copy current implementation
cp -r /src/components/05-estimation/* /src/components/05-estimation-archive/
cp -r /src/app/chapter5/* /src/app/chapter5-archive/

# Create archive documentation
echo "# Archive created on $(date)" > /src/components/05-estimation-archive/ARCHIVE-README.md

# Commit the archive
git add .
git commit -m "Archive: Chapter 5 pre-migration backup"
git tag chapter5-pre-migration-v1
```

### Step 2: Create Development Structure
```bash
# Create parallel development directories
mkdir -p /src/components/05-estimation-new
mkdir -p /src/app/chapter5-new
```

### Step 3: Start Building Components

Follow this order:
1. **Hub Component First** (`/tasks/chapter-5/5-0-Hub.md`)
2. **Section Components** in order (5-1 through 5-5)
3. **Routes Last**

### Step 4: Testing Protocol

For EACH component:
1. Build in `-new` directory
2. Create test route in `chapter5-new`
3. Compare with archived version
4. Verify all features work
5. Check MathJax rendering

## Key Patterns to Follow

### 1. Component Naming
```
5-0-EstimationHub.jsx
5-1-StatisticalInference.jsx
5-2-ConfidenceIntervalKnownVariance.jsx
```

### 2. Route Structure
```
/chapter5/
  page.js (hub)
  /statistical-inference/
    page.js
  /confidence-intervals-known/
    page.js
```

### 3. LaTeX Rendering (CRITICAL)
```jsx
const contentRef = useRef(null);

useEffect(() => {
  const processMathJax = () => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
      if (window.MathJax.typesetClear) {
        window.MathJax.typesetClear([contentRef.current]);
      }
      window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
    }
  };
  
  processMathJax();
  const timeoutId = setTimeout(processMathJax, 100); // CRITICAL
  return () => clearTimeout(timeoutId);
}, []);
```

### 4. BackToHub Navigation
```jsx
import BackToHub from '../ui/BackToHub';

// At top of component
<BackToHub chapter={5} />

// At bottom
<BackToHub chapter={5} bottom />
```

## Common Pitfalls to Avoid

1. **DON'T modify production files directly** - Always work in `-new` directories
2. **DON'T skip archiving** - You'll regret it if something goes wrong
3. **DON'T forget LaTeX timeout** - The 100ms delay is critical
4. **DON'T create new navigation patterns** - Use ChapterHub component
5. **DON'T lose interactive features** - Test everything from archived version

## Validation Checklist

Before considering migration complete:
- [ ] All 5 sections accessible from hub
- [ ] Back navigation works from each section
- [ ] All interactive visualizations preserved
- [ ] MathJax renders on all pages
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Progress tracking works
- [ ] Compared with archived version

## Emergency Rollback

If something goes wrong:
```bash
# Quick rollback
mv /src/components/05-estimation /src/components/05-estimation-failed
mv /src/components/05-estimation-legacy /src/components/05-estimation

# Or use git
git checkout chapter5-pre-migration-v1
```

## Questions to Ask Before Starting

1. Have I created the archive?
2. Do I understand the Chapter 7 pattern?
3. Have I read all task files?
4. Do I know which components to consolidate?
5. Am I working in the `-new` directories?

## Ready to Start?

1. Begin with Phase 0 in the execution plan
2. Follow the phases sequentially
3. Test continuously
4. Keep the archive as reference
5. Document any deviations

Good luck with the migration! The detailed plans in the task files will guide you through each component.