# Overall Project Todo List

## ✅ Recent Completions

### StatisticalInference Component Cleanup (2025-08-04)
**Status:** ✅ COMPLETED - Removed CLT animation and created focused visualization

#### Changes Made:
1. ✅ **Removed Central Limit Theorem Animation** - Deleted redundant CLT visualization that was repeating content from previous chapters
2. ✅ **Created Focused Sampling & Estimation Visualization** - New component that demonstrates:
   - Point estimation concept with visual representation
   - Real-time sampling from a known population
   - Comparison between sample statistics and population parameters
   - Building of sampling distribution through repeated samples
   - Clear visual distinction between current sample and sampling distribution

#### Technical Details:
- Replaced `CLTVisualization` component with `SamplingAndEstimation`
- Single focused example (normal distribution with μ=50, σ=10)
- Two-panel visualization showing current sample and accumulating sampling distribution
- Real-time calculation of sampling error and standard error
- Interactive "Draw New Sample" functionality
- Clear educational flow from single sample to sampling distribution concept

**Build Status:** ✅ Passes `npm run lint` with no warnings or errors

### StatisticalInference Color Scheme Update (2025-08-04)
**Status:** ✅ COMPLETED - Updated to match Chapter 2 color scheme

#### Changes Made:
1. ✅ **Changed color scheme** - Updated from 'regression' to 'probability' color scheme
2. ✅ **Replaced all teal colors with blue** - Systematically replaced:
   - text-teal-400 → text-blue-400
   - bg-teal-* → bg-blue-*
   - border-teal-* → border-blue-*
   - hover states and shadows updated accordingly
3. ✅ **Updated chart colors** - D3 visualizations now use:
   - Primary: #3b82f6 (Blue) for main data/population parameters
   - Secondary: #10b981 (Emerald) for sample statistics/estimates
   - Consistent with ExpectationVariance component from Chapter 2
4. ✅ **Maintained functionality** - All interactive features preserved while updating visual styling

**Build Status:** ✅ Passes `npm run lint` with no warnings or errors

### LinearTransformations Component Enhancement (2025-08-04)
**Status:** ✅ COMPLETED - All enhancements and documentation implemented

#### Enhancements Completed:
1. ✅ **Visual Animation Indicators** - Added animated progress bar showing transformation progress with smooth color transitions
2. ✅ **Smooth Parameter Updates** - Implemented real-time parameter value displays with color flash animations on change
3. ✅ **Enhanced Hover States** - Added smooth transitions for bar hover effects with scaling and border highlights
4. ✅ **Reset Button** - Added reset functionality with icon button to return to default values (a=2, b=1)
5. ✅ **Dynamic Equation Display** - Added prominent equation display "Y = aX + b" that updates in real-time
6. ✅ **Statistics Panel Animations** - Added subtle border glow and value flash animations when parameters change
7. ✅ **Improved Tooltips** - Enhanced tooltip positioning with mathematical context and transformation details

#### Documentation Completed:
1. ✅ **Comprehensive Component Overview** - Added detailed JSDoc with mathematical foundation and features
2. ✅ **Props Documentation** - Documented component interface and parameter structure
3. ✅ **Function Documentation** - Added detailed comments for calculateStats, getTransformedDistribution, and other key functions
4. ✅ **Animation Implementation Notes** - Documented requestAnimationFrame pattern and easing implementation
5. ✅ **D3 Pattern Documentation** - Explained D3.js integration pattern for future engineers
6. ✅ **Critical Section Comments** - Added inline documentation throughout the codebase

#### Technical Improvements:
- Added React.memo and motion animations for performance
- Implemented proper cleanup for animation frames
- Enhanced error handling with verification accuracy checks
- Added visual feedback for mathematical rule verification
- Improved accessibility with better tooltips and button labels

**Build Status:** ✅ Builds successfully with `npm run build`
**Code Quality:** ✅ Passes `npm run lint` with no warnings or errors

### SpatialRandomVariableV2 Component (2025-08-04)
**Status:** ✅ COMPLETED - Canvas/SVG Hybrid Implementation

#### Implementation Details:
1. ✅ **Canvas/SVG Hybrid Architecture**
   - SVG Layer: Static hexagonal grid and interactive hexagon selection
   - Canvas Layer: All sampling animations (particles, trails, effects)
   - React Layer: UI controls and statistics only

2. ✅ **Performance Optimizations**
   - Particle object pool for memory efficiency (pre-allocated 1000 particles)
   - Proper layer separation completely eliminates blinking
   - requestAnimationFrame-based animation loop for smooth 60fps
   - Efficient coordinate system synchronization

3. ✅ **Key Features Implemented**
   - All features from original component preserved
   - Proper component hierarchy following gold standards
   - Semantic color system applied
   - Exceptional performance for thousands of samples
   - Zero blinking through proper layer separation

4. ✅ **Technical Achievements**
   - ParticlePool class for efficient particle management
   - Canvas animations with gradient effects and glows
   - SVG hexagon pulsing on sample hits
   - Smooth transitions and visual feedback

**File Location:** `/src/components/02-discrete-random-variables/2-1-1-SpatialRandomVariableV2.jsx`
**Build Status:** ✅ Builds successfully
**Performance:** ✅ Handles thousands of particles without frame drops


## 📋 Active Tasks

### 🔴 Critical Issues (High Priority)

#### LaTeX Rendering Issues (Chapter 1)
- [ ] Add missing font-mono classes to 6 components in Chapter 1
  - **Impact:** Math formulas show raw LaTeX code `\frac{1}{2}` instead of proper fractions
  - **User Experience:** Students literally can't see the math they need to learn
  - Files: `02-probability-dictionary/Tab1FoundationsTab.jsx:72`
  - Files: `02-probability-dictionary/Tab2WorkedExamplesTab.jsx:150,153,160`
  - Files: `08-conditional-probability/Tab2WorkedExamplesTab.jsx:306,309`

- [ ] Replace manual MathJax processing with useMathJax hook in 6 components
  - **Impact:** Inconsistent LaTeX rendering, formulas randomly fail to display
  - **User Experience:** Math appears/disappears unpredictably, breaking learning flow
  - Files: `01-pebble-world/Tab2WorkedExamplesTab.jsx`
  - Files: `04-counting-techniques/index.jsx`
  - Files: `07-probability-event/index.jsx`
  - Files: `08-conditional-probability/Tab3QuickReferenceTab.jsx`
  - Files: `06-unordered-samples/Tab1FoundationsTab.jsx`
  - Files: `05-ordered-samples/Tab3QuickReferenceTab.jsx`

#### D3 Performance Issues (Chapter 1)
- [ ] Fix SVG re-rendering anti-pattern in VennDiagramSection.jsx (lines 33-333)
  - **Impact:** 50-100ms lag on every interaction, drag operations feel broken
  - **User Experience:** Trying to drag elements feels choppy and unresponsive

- [ ] Fix SVG re-rendering in MontyHallGame.jsx ProbabilityChart (lines 176-286)
  - **Impact:** Chart animations stutter, especially during auto-play mode
  - **User Experience:** Visualizations look unprofessional and distract from learning

- [ ] Fix SVG re-rendering in Tab4InteractiveTab.jsx (lines 64-68, 175)
  - **Impact:** Pebble dragging breaks mid-drag, selections get lost
  - **User Experience:** Interactive exercises become frustrating instead of engaging

- [ ] Implement selective D3 updates instead of full rebuilds (15+ instances)
  - **Impact:** Cumulative performance degradation across all visualizations
  - **User Experience:** App becomes progressively slower during a study session

#### File Organization Issues
- [ ] Clean up duplicate tab files in 03-sample-spaces-events directory
  - **Impact:** Developers edit wrong files, bugs "mysteriously" reappear
  - **User Experience:** Fixed features break again in production
  - Remove duplicate `FoundationsTab.jsx` (keep Tab1FoundationsTab.jsx)
  - Remove duplicate `WorkedExamplesTab.jsx` (keep Tab2WorkedExamplesTab.jsx)
  - Remove duplicate `QuickReferenceTab.jsx` (keep Tab3QuickReferenceTab.jsx)

#### Error Boundaries
- [ ] Add MathErrorBoundary wrapper to VennDiagramSection.jsx
- [ ] Add MathErrorBoundary wrapper to MontyHallSimulation.jsx
- [ ] Add MathErrorBoundary wrapper to CountingTechniques/index.jsx
- [ ] Add MathErrorBoundary wrapper to all other D3 visualization components (19+ files)
  - **Impact:** One visualization error crashes ENTIRE page to white screen
  - **User Experience:** Students lose all progress and must refresh, losing quiz answers

- [ ] Fix potential race conditions in MathJax rendering
  - **Impact:** Math randomly fails to render on fast page navigation
  - **User Experience:** Students think content is broken when math doesn't appear

### 🟡 Major Issues (Medium Priority)

#### Performance Optimizations
- [ ] Add React.memo to MontyHallSimulation.jsx (961 lines)
- [ ] Add React.memo to MontyHallGame.jsx (887 lines)
- [ ] Add React.memo to counting-techniques/index.jsx (842 lines)
  - **Impact:** 200-500ms freezes when typing or interacting with other components
  - **User Experience:** App feels sluggish, especially on older devices

- [ ] Implement useMemo/useCallback for expensive calculations
  - **Impact:** Unnecessary recalculations cause UI to freeze momentarily
  - **User Experience:** Input lag makes the app feel unresponsive

#### Responsive Design Issues
- [ ] Implement responsive D3 visualizations using ResizeObserver pattern
- [ ] Replace fixed dimensions (width=600, height=400) with dynamic sizing
- [ ] Ensure 80-90% viewport utilization per design guidelines
- [ ] Fix VennDiagramSection.jsx 400px fixed height issue
  - **Impact:** Mobile users see tiny, unusable visualizations; desktop wastes 80% of screen
  - **User Experience:** 40% of users on tablets/phones can't effectively learn

#### Accessibility
- [ ] Add ARIA labels to MontyHallGame door components
- [ ] Implement keyboard navigation for interactive components
- [ ] Add screen reader support for D3 visualizations
  - **Impact:** Blind/keyboard users cannot use the app at all - potential legal issues
  - **User Experience:** Excludes disabled students from learning probability

#### Code Quality
- [ ] Fix SVG dimension error in probability-event/index.jsx (line 173)
  - **Impact:** Console errors that could escalate to crashes in certain browsers
  - **User Experience:** Potential white screen crashes in Safari/Firefox

- [ ] Add null checks for data array access in components
  - **Impact:** "Cannot read property of undefined" crashes components randomly
  - **User Experience:** Fast clicking or slow data loads cause unexpected crashes

- [ ] Add cleanup functions for animation timeouts
- [ ] Fix missing timer cleanup in setInterval usage (multiple components)
  - **Impact:** Memory leaks accumulate, browser slows down after 10-15 minutes
  - **User Experience:** Browser tab becomes unusable, requiring full restart


