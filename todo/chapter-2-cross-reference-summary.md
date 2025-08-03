
## Recommendations for overall-project-todo.md Updates

### Add New Section: "Mathematical Accuracy"
```markdown
#### Mathematical Accuracy Issues
- [ ] Fix biased variance calculation in SpatialRandomVariable.jsx
- [ ] Add division by zero protection in distribution calculations
- [ ] Prevent factorial overflow with large parameter values
- [ ] Validate probability arrays sum to 1 before calculations
  - **Impact:** Students learn incorrect formulas, calculations fail
  - **User Experience:** Educational content is wrong
```

### Expand Memory Leaks Section
```markdown
#### Memory Leaks (Updated)
- [ ] Fix D3 gradient accumulation in PoissonTimeline.jsx
  - **Impact:** DOM elements grow unbounded, browser crashes
  - **User Experience:** Page becomes unusable after ~100 events
```

### Add Animation Architecture Section
```markdown
#### Animation State Management
- [ ] Replace setInterval with requestAnimationFrame (5+ components)
- [ ] Add animation cancellation mechanisms
- [ ] Simplify complex animation state objects
  - **Impact:** Animations can't be stopped, queue indefinitely
  - **User Experience:** UI becomes unresponsive during animations
```

### Update Console Statements Issue
```markdown
- [ ] Remove console.error statements (Chapter 2: 4 instances)
- [ ] Remove console.log statements (Chapter 2: 8 instances)
```