# Code Quality & Performance Improvements

## High-Priority Tasks (Based on Deep Analysis)

### 1. D3 Import Optimization (Critical - 40-60% bundle reduction)

#### Current Status: Planning Phase
- [ ] Replace all `import * as d3 from 'd3'` with specific imports
- [ ] Create `src/utils/d3-imports.js` with commonly used exports
- [ ] Update all 31+ components to use optimized imports
- [ ] Same for jStat imports

#### Incremental Migration Plan (SAFE APPROACH)

**Phase 1: Analysis & Preparation** ✅ DO THIS FIRST
1. [ ] Check D3 version in package.json (syntax varies by version)
2. [ ] Run grep to find ALL d3 methods used: `grep -r "d3\." src/components/ | grep -o "d3\.[a-zA-Z]*" | sort | uniq`
3. [ ] Create comprehensive list of imports needed
4. [ ] Identify any dynamic property access patterns that would break

**Phase 2: Create Safety Net**
1. [ ] Create `src/utils/d3-imports.js` with:
   ```javascript
   // Temporary fallback - remove after migration
   import * as d3Full from 'd3';
   export const d3 = d3Full;
   
   // Start adding specific imports
   export { select, scaleLinear, axisBottom } from 'd3';
   ```
2. [ ] Test with ONE simple component first
3. [ ] Verify build still works

**Phase 3: Incremental Component Migration**
1. [ ] Start with simplest component (e.g., PriorPlot)
2. [ ] Test ALL interactions in that component
3. [ ] Move to next component only after verification
4. [ ] Keep checklist of migrated components

**Phase 4: Cleanup**
1. [ ] Remove d3Full fallback
2. [ ] Verify final bundle size reduction
3. [ ] Run full test suite

#### Pros & Cons

**Pros:**
- 🚀 40-60% bundle size reduction
- ⚡ Faster initial page loads
- 🎯 Better tree-shaking
- 📦 Cleaner imports

**Cons:**
- ⚠️ Risk of runtime errors if we miss imports
- 🔍 Requires careful testing of each component
- ⏱️ Time-consuming (31+ components)
- 🔗 Method chaining might need refactoring

#### Potential Issues & Solutions

| Issue | Risk Level | Solution |
|-------|------------|----------|
| Missing imports cause runtime crashes | HIGH | Use fallback during migration |
| Dynamic property access breaks | MEDIUM | Refactor to static imports |
| Hidden/rare methods missed | MEDIUM | Comprehensive grep analysis |
| Different D3 versions | LOW | Check package.json first |

#### Decision: GO with Incremental Migration ✅
Start with Phase 1 analysis to understand scope fully before any code changes.

### 2. Create Constants File (Quick Win - 1 hour) 🎯 DO THIS SECOND

#### Why This First?
- Immediate impact
- Zero risk
- Makes other refactoring easier
- Currently hardcoded in 32 files!

#### Implementation Plan
1. [ ] Create `src/constants/visualization.js`:
   ```javascript
   export const DEFAULT_MARGINS = { top: 20, right: 30, bottom: 50, left: 60 };
   export const COMPACT_MARGINS = { top: 10, right: 10, bottom: 30, left: 40 };
   export const ANIMATION_DURATION = 200;
   export const TRANSITION_DURATION = 300;
   export const DEFAULT_HEIGHT = 400;
   export const DEFAULT_WIDTH = 600;
   ```

2. [ ] Create `src/constants/colors.js`:
   ```javascript
   export const CHART_COLORS = {
     primary: '#14b8a6',
     secondary: '#8b5cf6',
     danger: '#ef4444',
     warning: '#f59e0b',
     success: '#10b981'
   };
   ```

3. [ ] Update components to import constants
4. [ ] Verify no visual changes

#### Pros & Cons
**Pros:**
- ✅ Zero risk - just moving values
- ✅ Instant win for maintainability
- ✅ Makes future changes easier
- ✅ Can do in 1 hour

**Cons:**
- ❌ None really!

### 3. Extract Common D3 Patterns (High - 50% code reduction)

#### Current Status: Planning Phase

#### Implementation Plan
1. [ ] Identify patterns repeated across components:
   - SVG setup with margins
   - Responsive container
   - Scale creation
   - Axis rendering
   - Tooltip handling

2. [ ] Create reusable hooks:
   ```javascript
   // src/hooks/useD3Container.js
   export function useD3Container(ref, margins = DEFAULT_MARGINS) {
     // Returns width, height, svg selection
   }
   
   // src/hooks/useD3Scales.js
   export function useD3Scales(data, width, height, type) {
     // Returns configured scales
   }
   ```

3. [ ] Start with ONE component as proof of concept
4. [ ] Measure code reduction
5. [ ] Roll out to other components

#### Pros & Cons
**Pros:**
- 📉 50% less code to maintain
- 🔄 Consistent patterns everywhere
- 🐛 Fix bugs in one place
- 📚 Self-documenting

**Cons:**
- ⚠️ Risk of over-abstraction
- 🎨 Might limit customization
- 🧠 Learning curve for new patterns

### 4. Add React.memo to Expensive Components (Medium Priority)

#### Quick Analysis
- Currently only 21/52 components use memo
- Focus on components with:
  - D3 visualizations
  - Complex calculations
  - Frequent re-renders

#### Implementation Plan
1. [ ] Add React.memo to all D3 components
2. [ ] Use useMemo for:
   - Scale calculations
   - Data transformations
   - Statistical calculations
3. [ ] Use useCallback for event handlers
4. [ ] Measure performance improvement

#### Components Priority List
1. [ ] CLTSimulation (complex, many calculations)
2. [ ] ConfidenceInterval (expensive statistics)
3. [ ] All distribution visualizations
4. [ ] Interactive components with sliders

### 5. Add Loading States (Medium - Better UX)
- [ ] Add skeleton screens for D3 visualizations
- [ ] Show progress during data processing
- [ ] Currently only 2 components have loading states

### 6. Improve Accessibility (High Impact)
- [ ] Add ARIA labels to all interactive elements
- [ ] Add keyboard navigation to sliders and buttons
- [ ] Add screen reader descriptions for visualizations
- [ ] Currently only 4 files have ARIA attributes

### 7. Add Save/Share Functionality (Medium)
- [ ] Use localStorage to save simulation states
- [ ] Add "Share Results" button with URL parameters
- [ ] Let students continue where they left off

### 8. Mobile Responsiveness (Medium)
- [ ] Make D3 visualizations truly responsive
- [ ] Optimize touch interactions
- [ ] Test on various screen sizes

## 🎯 Implementation Priority & Timeline

### Week 1: Foundation & Quick Wins
1. **Day 1**: Constants file (1 hour) ✅ ZERO RISK
2. **Day 2-3**: D3 import analysis (Phase 1 only)
3. **Day 4-5**: Create D3 safety net & test with 1 component

### Week 2: Core Optimizations  
4. **Day 6-8**: Continue D3 migration (5-10 components)
5. **Day 9-10**: Extract first D3 pattern hook

### Week 3: Performance & Polish
6. **Day 11-12**: Add React.memo to top 10 components
7. **Day 13-14**: Loading states for heavy components
8. **Day 15**: Measure improvements & celebrate! 🎉

## 📊 Success Metrics
- [ ] Bundle size reduction: Target 40%
- [ ] First contentful paint: Target < 1.5s
- [ ] Code duplication: Target 50% reduction
- [ ] Zero new bugs introduced

## 🚦 Go/No-Go Checkpoints
1. After constants file: Verify no visual changes
2. After first D3 component: Full functionality test
3. After each phase: Run build & check for errors

## 💡 Current Decision
**Start with #2 (Constants File) TODAY** - It's risk-free and makes everything else easier!

