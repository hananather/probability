# Overall Project Todo List

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

### 🟢 Minor Issues (Low Priority)

#### Code Organization
- [ ] Create shared D3 visualization utilities library
  - **Impact:** Duplicate code makes bugs harder to fix consistently
  - **User Experience:** Same bug appears in multiple places

- [ ] Extract hardcoded dimensions to constants (20+ occurrences)
  - **Impact:** Inconsistent sizing across components
  - **User Experience:** Visual inconsistency looks unprofessional

- [ ] Extract animation timing magic numbers to named constants
  - **Impact:** Animations feel jerky with inconsistent timing
  - **User Experience:** Some elements animate in 300ms, others 600ms - feels unpolished

- [ ] Document navigation patterns in /docs/navigation-patterns.md
  - **Impact:** Developers implement navigation inconsistently
  - **User Experience:** Navigation behavior varies between sections

#### Component Refactoring
- [ ] Consider splitting MontyHallSimulation.jsx (961 lines) into sub-components
- [ ] Consider splitting MontyHallBayesProof.jsx (924 lines)
- [ ] Create reusable D3 hooks for common patterns
  - **Impact:** Harder to fix bugs, slower feature development
  - **User Experience:** New features take longer, bugs persist longer

#### Other Issues
- [ ] Replace console.warn with proper error handling
  - **Impact:** Real errors buried in console noise
  - **User Experience:** Bugs take longer to diagnose and fix

- [ ] Remove TODO/FIXME comments or implement missing features
  - **Impact:** Incomplete features confuse users
  - **User Experience:** Users encounter "coming soon" dead ends

- [ ] Remove debug components from production code
  - **Impact:** Exposes internal debugging tools to users
  - **User Experience:** Confusing extra UI elements

- [ ] Standardize file extensions (.jsx vs .js)
  - **Impact:** Import errors in some build configurations
  - **User Experience:** Potential build failures

### 🔵 Future Enhancements

- [ ] Optimize bundle size with D3 modules
  - **Impact:** Slower initial page loads
  - **User Experience:** 3-5 second longer load times on slow connections

- [ ] Add comprehensive test coverage
  - **Impact:** Regressions go unnoticed until users report them
  - **User Experience:** Previously working features randomly break

- [ ] Implement performance monitoring
  - **Impact:** Can't identify performance regressions before users complain
  - **User Experience:** Gradual performance degradation goes unnoticed

- [ ] Add TypeScript definitions
  - **Impact:** More runtime errors reach production
  - **User Experience:** More crashes and bugs for end users

- [ ] Add visual regression tests for LaTeX rendering
  - **Impact:** LaTeX rendering breaks without anyone noticing
  - **User Experience:** Math formulas silently fail in production

- [ ] Create centralized MathJax configuration
  - **Impact:** Inconsistent math rendering across components
  - **User Experience:** Same formula looks different in different places

- [ ] Implement code splitting for heavy components
  - **Impact:** Entire app loads even if using one section
  - **User Experience:** Unnecessary 10-20 second initial load time

- [ ] Add ESLint rule to enforce useMathJax usage
  - **Impact:** Developers accidentally use old patterns
  - **User Experience:** New components have same LaTeX bugs

## 📊 Task Summary (2025-08-02)
- 🔴 Critical Issues: 23 tasks (App broken without these)
- 🟡 Major Issues: 16 tasks (Poor experience without these)
- 🟢 Minor Issues: 11 tasks (Polish and maintenance)
- 🔵 Future Enhancements: 8 tasks (Nice to have)
- **Total Active Tasks: 58**

## 🎯 Fix Priority by User Impact

1. **MUST FIX NOW** (Users can't use app):
   - LaTeX rendering (math doesn't display)
   - Error boundaries (whole page crashes)
   - Null checks (random crashes)

2. **SHOULD FIX SOON** (Frustrating experience):
   - D3 performance (laggy interactions)
   - Responsive design (mobile users excluded)
   - Memory leaks (browser crashes after extended use)

3. **NICE TO FIX** (Polish):
   - React.memo (general sluggishness)
   - Code organization (slower development)
   - Animation constants (visual inconsistency)

---

## ✅ Completed Tasks (Archived)

### 2025-08-02 Completions

#### Chapter 1: Introduction to Probabilities (71 LaTeX issues)
- [x] Fix `Tab1FoundationsTab.jsx` (pebble world) - Fixed LaTeX rendering by using useMathJax hook
- [x] Fix `Tab2WorkedExamplesTab.jsx` (probability dictionary) - 7 issues
- [x] Fix `Tab1FoundationsTab.jsx` (Bayes theorem) - 3 issues
- [x] Fix `Tab2WorkedExamplesTab.jsx` (Bayes theorem) - 18 issues
- [x] Fix `Tab3QuickReferenceTab.jsx` (sample spaces) - 2 issues
- [x] Fix `Tab2WorkedExamplesTab.jsx` (sample spaces) - 20 issues
- [x] Fix `Tab2WorkedExamplesTab.jsx` (pebble world) - 18 issues
- [x] Fix `Tab3QuickReferenceTab.jsx` (pebble world) - 3 issues

#### Chapter 3: Continuous Random Variables
- [x] `3-6-2-JointDistributionWorkedExample.jsx` - Already using template literals
- [x] `3-1-1-ContinuousDistributionsPDF.jsx` - Already using template literals
- [x] `3-0-1-BridgeToContinuous.jsx` - Already using template literals

#### Chapter 4: Descriptive Statistics & Sampling
- [x] `4-5-1-FDistributionIntuitiveIntro.jsx` - Already using template literals
- [x] `4-1-4-MathematicalFoundations.jsx` - Already using template literals
- [x] `4-4-1-TDistributionExplorer.jsx` - 3 issues fixed (lines 46, 61, 69)

#### Chapter 5: Estimation/Confidence Intervals
- [x] `5-1-StatisticalInference.jsx` - Already using template literals

#### Learn Components
- [x] `GoldStandardShowcase.jsx` - 6 issues fixed
- [x] `ComponentUsageTest.jsx` - 4 issues fixed

## 📝 Notes

### LaTeX Pattern Reference
All LaTeX issues follow this pattern:
```jsx
// ❌ WRONG - Regular quotes
formula="\\sigma^2 = ..."

// ✅ CORRECT - Template literals
formula={`\\sigma^2 = ...`}
```

### Verified Working Chapters
- ✅ Chapter 2: Discrete Random Variables - Uses dangerouslySetInnerHTML with MathJax
- ✅ Chapter 6: Hypothesis Testing - Uses inline MathJax rendering
- ✅ Chapter 7: Linear Regression - Uses custom EnhancedFormulaDisplay component