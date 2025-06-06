# Troubleshooting Guide

## Common Pitfalls

### State Updates During D3 Transitions
**Problem**: Updating React state during D3 transitions causes janky animations
**Solution**: Complete D3 animations before updating state, or use D3's own data binding

### MathJax Rendering Issues
**Problem**: LaTeX doesn't render or disappears
**Solution**: ALWAYS use dangerouslySetInnerHTML with the 100ms timeout pattern
See `/docs/latex-guide.md` for detailed implementation

### Memory Leaks
**Problem**: Components accumulate memory over time
**Solution**: Always clean up:
- D3 selections: `selection.remove()`
- Timers: `clearTimeout()`, `clearInterval()`
- Event listeners: Remove in cleanup functions

### LaTeX in Custom Components
**Problem**: UI components don't handle LaTeX props correctly
**Solution**: Use direct HTML elements with dangerouslySetInnerHTML instead of passing LaTeX to custom components

### Extreme Probabilities in Visualizations
**Problem**: Small samples show 0% or 100% probabilities, creating jarring visuals
**Solution**: Use Laplace smoothing for small samples (n < 5)
```javascript
if (n < 5) {
  const smoothingFactor = 0.5;
  probability = (successes + smoothingFactor) / (n + 2 * smoothingFactor);
} else {
  probability = successes / n;
}
```

## D3 Specific Issues

### D3 Drag Gotcha
**Problem**: Transforms break drag functionality
```javascript
// ❌ BROKEN - transforms break drag
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
```

**Solution**: Bake margins into scale instead
```javascript
// ✅ FIXED - bake margins into scale
const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);
```

## Performance Issues

### Large Dataset Rendering
**Problem**: Visualizations slow down with many data points
**Solution**: 
- Use D3's data joins efficiently
- Consider virtualization for very large datasets
- Debounce user interactions

### Component Re-renders
**Problem**: Unnecessary re-renders impact performance
**Solution**:
- Use React.memo for static sections
- Implement proper dependency arrays in useEffect
- Separate concerns between D3 and React state