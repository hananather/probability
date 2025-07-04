# Comprehensive Fix Guide for Bayes Theorem Visualizer Tabs

## Issues to Fix in All Tabs

### 1. Import Corrections
```jsx
// ❌ Wrong
import WorkedExample from '@/components/ui/WorkedExample';

// ✅ Correct
import { WorkedExample, ExampleSection, CalculationSteps, InsightBox } from '@/components/ui/WorkedExample';
import { VisualizationSection, GraphContainer, ControlGroup } from '@/components/ui/VisualizationContainer';
import { colors, createColorScheme } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
```

### 2. Color Scheme Setup
```jsx
// Add at top of each component
const colorScheme = createColorScheme('probability');
```

### 3. Animation Variants
```jsx
// Add these reusable variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};
```

### 4. Typography Rules
- Headers: `text-base` (not text-lg or text-xl)
- Content: `text-sm`
- Labels/metadata: `text-xs`
- Remove text-2xl, replace with text-xl for formulas only

### 5. Component Structure
```jsx
// Use GraphContainer for main sections
<GraphContainer title="Section Title">
  {/* content */}
</GraphContainer>

// Use VisualizationSection for subsections
<VisualizationSection className="bg-neutral-800/30">
  {/* subsection content */}
</VisualizationSection>
```

### 6. LaTeX Pattern
```jsx
// Correct pattern from latex-guide.md
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
  const timeoutId = setTimeout(processMathJax, 100);
  return () => clearTimeout(timeoutId);
}, [dependencies]); // Add proper dependencies
```

### 7. Color Usage
```jsx
// ❌ Wrong
<div className="text-purple-400">
<div className="bg-green-400">

// ✅ Correct
<div style={{ color: colorScheme.primary }}>
<div style={{ backgroundColor: colorScheme.accent }}>
```

### 8. Button Hover Effects
```jsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
```

## Files to Update
1. Tab1FoundationsTab.jsx
2. Tab2WorkedExamplesTab.jsx
3. Tab3QuickReferenceTab.jsx
4. page.jsx (main page)

## Validation Commands
```bash
# After fixes, run:
npm run build && npm run lint

# Check for:
- No import errors
- No type errors
- Successful build
```