# Safe Chapter 1 Refactor Plan

## Strategy: Parallel Implementation

### Phase 1: Create New Structure (No Risk)
```
/src/components/01-introduction-to-probabilities-new/
  ├── 1-0-IntroductionToProbabilitiesHub.jsx
  ├── 1-1-SampleSpacesEvents.jsx
  ├── 1-2-CountingTechniques.jsx
  ├── 1-3-OrderedSamples.jsx
  ├── 1-4-UnorderedSamples.jsx
  ├── 1-5-ProbabilityEvent.jsx
  ├── 1-6-ConditionalProbability.jsx
  ├── 1-7-BayesTheorem.jsx
  └── 1-8-ProbabilisticFallacies.jsx
```

### Phase 2: Test Route (Isolated)
Create `/src/app/chapter1-new/` directory:
- Copy existing page structure
- Update to use new components
- Test at `/chapter1-new` URL

### Phase 3: Incremental Migration
1. Build one component at a time
2. Test each component individually
3. Can always access old version at `/chapter1`
4. New version lives at `/chapter1-new`

### Phase 4: Switch Over (When Ready)
1. Rename folders:
   - `01-introduction-to-probabilities` → `01-introduction-to-probabilities-old`
   - `01-introduction-to-probabilities-new` → `01-introduction-to-probabilities`
   - `chapter1` → `chapter1-old`
   - `chapter1-new` → `chapter1`
2. Update sidebar configuration
3. Keep old version for 1-2 weeks as backup

## Benefits
- Zero risk to existing functionality
- Can compare old vs new side-by-side
- Easy rollback (just rename folders back)
- Can share progress without breaking production
- Test thoroughly before switching

## Minimal Work Approach
1. Start with just the hub component
2. Create one section page (e.g., Sample Spaces)
3. Get navigation working
4. If successful, continue with other sections
5. If not, learned early with minimal effort

## Testing Checklist
- [ ] Hub renders at `/chapter1-new`
- [ ] Navigation to sections works
- [ ] Back to hub works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Compare with Chapter 7 behavior