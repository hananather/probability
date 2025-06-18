# D3 Migration Strategy: From Full Imports to Modular Imports

## Executive Summary

This document outlines a comprehensive strategy for migrating from full d3 imports to modular imports in the prob-lab codebase. The migration is mostly complete, with components already using the `@/utils/d3-utils` module, but some refinements and validations are needed.

## Current State Analysis

### ✅ What's Already Done
1. **D3 Utils Module**: A comprehensive `d3-utils.js` file exists at `/src/utils/d3-utils.js`
2. **Modular Dependencies**: Package.json already includes 17 individual d3 modules
3. **Component Migration**: 54 components are already using `import * as d3 from "@/utils/d3-utils"`

### ⚠️ Issues Found
1. **D3-hexbin Usage**: Some components import `d3-hexbin` directly, which isn't in d3-utils
2. **Potential Missing Exports**: Need to verify all used functions are exported from d3-utils

## D3 Module Mapping

### Installed D3 Modules (from package.json)
```json
"d3-array": "^3.2.4",           // Statistical functions, data manipulation
"d3-axis": "^3.0.0",            // Axes for charts
"d3-color": "^3.1.0",           // Color manipulation
"d3-delaunay": "^6.0.4",        // Voronoi diagrams (unused?)
"d3-drag": "^3.0.0",            // Drag interactions
"d3-ease": "^3.0.1",            // Easing functions for transitions
"d3-format": "^3.1.0",          // Number formatting
"d3-hexbin": "^0.2.2",          // Hexagonal binning
"d3-hierarchy": "^3.1.2",       // Tree/hierarchy layouts
"d3-interpolate": "^3.0.1",     // Interpolation functions
"d3-random": "^3.0.1",          // Random number generation
"d3-scale": "^4.0.2",           // Scales (linear, band, etc.)
"d3-scale-chromatic": "^3.1.0", // Color schemes
"d3-selection": "^3.0.0",       // DOM selection and manipulation
"d3-shape": "^3.2.0",           // Shapes (line, area, arc, etc.)
"d3-time-format": "^4.1.0",     // Time formatting
"d3-timer": "^3.0.1",           // Timer functions
"d3-transition": "^3.0.1"       // Transitions
```

### Function to Module Mapping
```javascript
// Most commonly used functions and their modules:
d3.select, d3.selectAll     → d3-selection
d3.scaleLinear, d3.scaleBand → d3-scale
d3.axisLeft, d3.axisBottom  → d3-axis
d3.line, d3.area, d3.arc    → d3-shape
d3.drag                     → d3-drag
d3.format                   → d3-format
d3.mean, d3.max, d3.extent  → d3-array
d3.easeCubic, d3.easeQuad   → d3-ease
d3.interpolateRgb           → d3-interpolate
d3.hierarchy, d3.tree       → d3-hierarchy
```

## Migration Plan

### Phase 1: Validation and Preparation (Low Risk)

#### Step 1.1: Run Migration Test Script
```bash
# Make the script executable
chmod +x scripts/test-d3-migration.js

# Run the validation
node scripts/test-d3-migration.js
```

#### Step 1.2: Add Missing Exports to d3-utils
If the test script identifies missing functions, add them to `/src/utils/d3-utils.js`:

```javascript
// Example: Adding d3-hexbin support
import { hexbin } from 'd3-hexbin';

// Add to exports
export {
  // ... existing exports
  hexbin
};

// Add to default object
const d3 = {
  // ... existing properties
  hexbin
};
```

#### Step 1.3: Create a Backup Branch
```bash
git checkout -b d3-migration-backup
git push origin d3-migration-backup
git checkout main
```

### Phase 2: Component Migration (Medium Risk)

#### Step 2.1: Migrate Direct Module Imports
For components using direct imports like `d3-hexbin`:

```javascript
// Before:
import { hexbin as d3Hexbin } from 'd3-hexbin';

// After:
import * as d3 from "@/utils/d3-utils";
// Use d3.hexbin instead of d3Hexbin
```

#### Step 2.2: Optimize Import Strategy
For components that only use a few d3 functions, consider named imports:

```javascript
// Instead of:
import * as d3 from "@/utils/d3-utils";

// Use (for better tree-shaking):
import { select, scaleLinear, axisBottom } from "@/utils/d3-utils";
```

#### Step 2.3: Progressive Migration Order
1. Start with leaf components (no dependencies)
2. Move to shared components
3. Finally migrate page-level components

Suggested order:
```
1. /src/components/ui/D3DragWrapper.jsx
2. /src/components/shared/*.jsx
3. /src/components/0X-*/*.jsx (by chapter)
```

### Phase 3: Testing Strategy (Critical)

#### Step 3.1: Unit Testing Approach
Create a test file for critical d3 functionality:

```javascript
// tests/d3-utils.test.js
import * as d3 from '@/utils/d3-utils';

describe('D3 Utils', () => {
  test('scale functions work correctly', () => {
    const scale = d3.scaleLinear().domain([0, 10]).range([0, 100]);
    expect(scale(5)).toBe(50);
  });
  
  test('array functions work correctly', () => {
    expect(d3.mean([1, 2, 3, 4, 5])).toBe(3);
    expect(d3.max([1, 5, 3, 9, 2])).toBe(9);
  });
});
```

#### Step 3.2: Visual Regression Testing
1. Take screenshots of all visualizations before migration
2. After migration, compare screenshots
3. Use a tool like Percy or Chromatic for automated visual testing

#### Step 3.3: Bundle Size Validation
```bash
# Before migration
npm run build
# Note the bundle size

# After migration
npm run build
# Compare bundle sizes - should see 60-70% reduction in d3-related code
```

### Phase 4: Optimization and Cleanup

#### Step 4.1: Remove Unused D3 Modules
Check for unused modules in package.json:
```bash
# Check if d3-delaunay is used
grep -r "delaunay" src/

# If not used, remove it
npm uninstall d3-delaunay
```

#### Step 4.2: Create Import Guidelines
Add to CLAUDE.md:
```markdown
## D3 Import Guidelines
- Always import d3 functions from '@/utils/d3-utils'
- For components using <5 d3 functions, use named imports
- For components using many d3 functions, use namespace import
- Never import directly from 'd3' or individual 'd3-*' packages
```

#### Step 4.3: Setup ESLint Rule
Add a custom ESLint rule to prevent direct d3 imports:
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      patterns: ['d3', 'd3-*']
    }]
  }
};
```

## Rollback Strategy

If issues arise during migration:

1. **Immediate Rollback**:
   ```bash
   git revert HEAD
   npm run build && npm run dev
   ```

2. **Partial Rollback**:
   - Keep d3-utils.js but revert individual component changes
   - Components can use either import style during transition

3. **Full Rollback**:
   ```bash
   git checkout d3-migration-backup
   git checkout -b main-rollback
   git push origin main-rollback --force
   ```

## Success Metrics

1. **Bundle Size**: 60-70% reduction in d3-related code
2. **Performance**: No regression in Time to Interactive (TTI)
3. **Functionality**: All visualizations work identically
4. **Build Time**: Faster builds due to better tree-shaking
5. **Developer Experience**: Clearer imports, better IntelliSense

## Timeline Estimate

- **Phase 1**: 1-2 hours (validation and preparation)
- **Phase 2**: 4-6 hours (component migration)
- **Phase 3**: 2-3 hours (testing)
- **Phase 4**: 1-2 hours (optimization)

**Total**: 8-13 hours of focused work

## Potential Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing d3 function | Build failure | Test script catches before migration |
| Runtime errors | Broken visualizations | Comprehensive testing plan |
| Performance regression | Slower app | Measure before/after metrics |
| Tree-shaking issues | Larger bundle | Use named imports where possible |

## Next Steps

1. Run the test script to validate current state
2. Fix any issues identified
3. Create migration PR with clear commits
4. Test thoroughly on staging environment
5. Deploy with monitoring enabled

## Conclusion

The migration is largely complete with the existing d3-utils.js file. The main work involves:
- Validating all functions are properly exported
- Migrating the few remaining direct imports
- Optimizing import strategies for better tree-shaking
- Setting up proper testing and validation

This migration will result in significant bundle size improvements and better maintainability.