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


