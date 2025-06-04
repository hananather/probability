# Probability Visualizations Lab

**Gold Standard**: `/src/components/CLTSimulation.jsx` - All components must follow this pattern.

## Commands
```bash
npm run dev              # Start development
npm run build && npm run lint  # Run before committing
```

## Project Context
Educational statistics platform with interactive visualizations for engineering students. Focus: progressive learning through milestones.

## Component Requirements
1. 4-stage educational insights (CLTSimulation.jsx:708-743)
2. Progress tracking with visual bar (CLTSimulation.jsx:719-735)
3. Clear statistical labels (avoid "n=10, 5 samples")
4. Three-step animation pattern (CLTSimulation.jsx:430-460)
5. Timing formula: `n <= 5 ? 500 : (n <= 10 ? 350 : 250)`

## Project Structure
```
prob-lab/
├── src/
│   ├── components/
│   │   ├── 01-introduction-to-probabilities/
│   │   ├── 02-discrete-random-variables/
│   │   ├── 03-continuous-random-variables/
│   │   │   ├── ContinuousDistributionsPDF.jsx
│   │   │   └── IntegralWorkedExample.jsx
│   │   ├── 04-descriptive-statistics-sampling/
│   │   ├── 05-estimation/
│   │   ├── 06-hypothesis-testing/
│   │   ├── 07-linear-regression-correlation/
│   │   ├── AppSidebar.jsx                    # Main navigation sidebar
│   │   ├── BayesSimulation.jsx               # Bayesian inference
│   │   ├── Bootstrapping.jsx                 # Bootstrap sampling
│   │   ├── CLTSimulation.jsx                 # Central Limit Theorem (gold standard)
│   │   ├── CoinFlipSimulation.jsx            # Basic probability sim
│   │   ├── ConceptSection.jsx                # Concept wrapper component
│   │   ├── ConfidenceInterval.jsx            # Confidence intervals visualization
│   │   ├── ContentWrapper.jsx                # Content layout wrapper
│   │   ├── DistributionSimulation.jsx        # Distribution visualizations
│   │   ├── MathJaxDebug.jsx                  # Math rendering debug
│   │   ├── MathJaxProvider.jsx               # Math rendering provider
│   │   ├── PointEstimation.jsx               # Point estimation viz
│   │   ├── PriorPlot.jsx                     # Prior distribution plotting
│   │   ├── WorkedExample.jsx                 # Worked example component
│   │   ├── WorkedExampleV2Test.jsx           # WE v2 test component
│   │   └── ui/                               # Reusable UI components
│   │       ├── RangeSlider.jsx
│   │       ├── VisualizationContainer.jsx
│   │       ├── WorkedExampleContainer.jsx
│   │       ├── WorkedExampleContainerFinal.jsx
│   │       ├── WorkedExampleContainerSimple.jsx
│   │       ├── WorkedExampleContainerV2.jsx
│   │       ├── WorkedExampleContainerV3.jsx
│   │       ├── button.jsx
│   │       ├── sheet.jsx
│   │       ├── sidebar.jsx
│   │       └── typography.jsx
│   ├── lib/
│   │   ├── design-system.js          # Colors, typography, utilities
│   │   └── utils.js                  # General utilities
│   ├── hooks/
│   │   ├── useD3.js                  # D3 React hook
│   │   └── useMathJaxQueue.js       # MathJax queue hook
│   ├── utils/
│   │   └── stats.js                  # Statistical functions
│   └── content/
│       └── probability.mdx           # Main content file
├── course-materials/                 # Course-related materials
├── public/
│   └── uo.png                       # University of Ottawa logo
└── [config files]                   # Various config files
```

## Key Design Patterns

### 1. Progressive Learning with Milestones
Every visualization should include:
- Clear goals (e.g., "Collect 30 samples to see CLT in action!")
- Progress tracking with visual indicators
- Different insights at different stages (0, 1-4, 5-29, 30+ samples)
- Celebratory messages when milestones are reached

Example from CLT:
```jsx
<div className="mt-2 p-2 bg-purple-900/20 border border-purple-600/30 rounded">
  <div className="text-xs text-purple-300">
    🎯 Goal: Collect {30 - counts.length} more samples to reach n=30 
    <span className="text-purple-400 font-semibold"> — a statistical milestone!</span>
  </div>
  {/* Progress bar */}
</div>
```

### 2. Clear Statistical Communication
- Avoid ambiguous labels (e.g., "n=10, 5 samples" is confusing)
- Use precise terminology: "Mean of Means", "Std Dev of Means"
- Always provide context for numbers
- Include explanatory subtext for complex concepts

### 3. Animation Timing
```javascript
// Dynamic timing based on sample size
const baseTime = n <= 5 ? 500 : (n <= 10 ? 350 : 250);
const dt = baseTime / Math.pow(1.04, draws);

// Ensure minimum transition times
.duration(Math.max(dt, 100))
```

### 4. React + D3 Integration
- Use local variables during animations to avoid re-renders
- Update React state only after animations complete
- Separate effects for different concerns (layout vs data updates)

### 5. Component Structure
Every major visualization should have:
1. **Left Panel (1/3 width)**:
   - Description section
   - Interactive controls
   - Real-time statistics
   - Educational insights (CRITICAL!)
   
2. **Right Panel (2/3 width)**:
   - Main visualization (700px height)
   - Smooth D3 animations
   - Clear axis labels

## Color Schemes
Use `createColorScheme()` from the design system:
- `'probability'`: Blue/Emerald/Amber
- `'hypothesis'`: Teal/Amber/Orange  
- `'estimation'`: Violet/Cyan/Amber
- `'inference'`: Teal/Orange/Yellow

## Typography & Spacing
- Use `cn()` utility for combining classes
- Apply `typography.description` for explanatory text
- Standard spacing: `space-y-3` between sections
- Consistent padding: `p-3` for sections

## 🧪 Testing & Development Workflow
### Manual Testing Checklist
1. **Engagement Test**: Would a student want to reach the milestone?
2. **Clarity Test**: Can someone understand without external help?
3. **Smoothness Test**: Are all animations fluid and responsive?
4. **Progress Test**: Is the learning journey clear?

### Development Workflow
```bash
# Before starting work
git pull origin main
npm install

# During development
npm run dev
# Make changes, test in browser

# Before committing (ALWAYS!)
npm run build  # Ensure no build errors
npm run lint   # Fix any linting issues

# After fixing issues
git add .
git commit -m "feat: descriptive commit message"
```

### Common Testing Scenarios
- Test with different sample sizes (n=1, 5, 10, 30, 100)
- Test rapid clicking/interaction
- Test browser resize during animations
- Test with slow network (Chrome DevTools throttling)

## Current Components Status
- ✅ **CLTSimulation**: Gold standard - progressive learning, clear stats, smooth animations
- ✅ **ConfidenceInterval**: Good real-time feedback, coverage tracking
- ✅ **Bootstrapping**: Functional but could use insights section
- ✅ **BayesSimulation**: Complex multi-view pattern

## 🚀 Bash Commands
```bash
# Development
npm run dev    # Start development server on http://localhost:3000
npm run build  # Build for production (run before deployment)
npm run start  # Start production server
npm run lint   # Check code quality with ESLint

# Common workflows
npm install    # Install dependencies after cloning/pulling
npm ci         # Clean install (use in CI/CD)

# Testing & Verification (run these after code changes!)
npm run build && npm run lint  # Always run before committing
```

## 🛠 Developer Environment Setup
1. **Prerequisites**:
   - Node.js 18+ (check with `node --version`)
   - npm 8+ (check with `npm --version`)

2. **Initial Setup**:
   ```bash
   git clone <repo-url>
   cd prob-lab
   npm install
   npm run dev
   ```

3. **VS Code Extensions** (recommended):
   - ESLint
   - Tailwind CSS IntelliSense
   - MDX

4. **Browser Requirements**:
   - Modern browser with ES6+ support
   - Chrome DevTools recommended for D3 debugging

## When Adding New Components
1. Copy the structure from `CLTSimulation.jsx`
2. Implement progressive insights with milestones
3. Use appropriate color scheme
4. Ensure smooth animations with proper timing
5. Add clear statistical labels
6. Include reset functionality
7. Test with various parameter values
8. **For WorkedExample components**: MUST use the MathJax timeout pattern (see WorkedExample Component Pattern section)

## 🛡️ Safe Component Development
When enhancing existing components:
```bash
# ALWAYS copy first, modify second
cp src/components/OldComponent.jsx src/components/02-section/NewComponent.jsx
# Fix imports: ../WorkedExample, ../ui/*, ../../lib/*
```

## Key Files to Reference
- `/src/components/CLTSimulation.jsx` - Best overall example
- `/src/lib/design-system.js` - Colors and utilities
- `/src/components/ui/VisualizationContainer.jsx` - Layout components
- `probability-viz-meta-prompt_3.md` - Detailed implementation guide

## 🔧 Utility Functions & Core Files
### Essential Utilities
- `/src/lib/design-system.js`:
  - `createColorScheme()` - Get themed colors
  - `cn()` - Combine Tailwind classes
  - `typography` - Consistent text styles
  
- `/src/utils/stats.js`:
  - Statistical calculations (mean, variance, etc.)
  - Distribution functions
  - Random number generators

- `/src/hooks/useD3.js`:
  - React-D3 integration hook
  - Handles cleanup automatically

### Key Patterns
```javascript
// Color scheme usage
const colors = createColorScheme('probability');

// Typography usage
<p className={typography.description}>...</p>

// D3 hook usage
const svgRef = useD3((svg) => {
  // D3 code here
}, [dependencies]);
```

### 📐 WorkedExample Component Pattern
**CRITICAL**: All WorkedExample components MUST follow the IntegralWorkedExample.jsx pattern:

```javascript
"use client";
import React, { useEffect, useRef } from "react";

const YourWorkedExample = React.memo(function YourWorkedExample({ props }) {
  const contentRef = useRef(null);
  
  // Calculate values here
  
  useEffect(() => {
    // REQUIRED: MathJax timeout pattern to handle race conditions
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error:', err);
        });
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    return () => clearTimeout(timeoutId);
  }, [dependencies]);
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      // ... rest of IntegralWorkedExample styles
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Title Here
      </h4>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>1. Step with inline math \(E[X^2]\):</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[LaTeX block equation here\\]` }} />
      </div>
    </div>
  );
});

export { YourWorkedExample };
```

**LaTeX in WorkedExample:**
- Use `\(inline math\)` for inline expressions in text (e.g., `\(E[X^2]\)`, `\(f(x)\)`)
- Use `\\[block equation\\]` for display equations
- ALWAYS use LaTeX for mathematical expressions, never plain text

## 🎓 Target Audience: Engineering Students
- **Background**: Calculus, Linear Algebra, Basic Programming
- **Learning Style**: Hands-on, practical, "why does this matter?"
- **Key Need**: See formulas AND applications together
- **Success Metric**: Can they apply this in their engineering courses?

## 📚 Additional Resources
- **ENGINEERING_CONTEXT.md**: Specific examples for engineering applications
- **CONCEPT_PROGRESSION.md**: Learning pathway and dependencies
- **MATHEMATICAL_RIGOR.md**: LaTeX formulas and calculation patterns
- **OPTIMAL_CLAUDE_PROMPTS.md**: Exact prompts for common tasks

## 📝 Repository Etiquette & Guidelines
### Commit Messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`
- Be descriptive: `feat: add normal distribution to CLT visualization`
- Reference issues when applicable: `fix: resolve animation lag (#123)`

### Code Review Checklist
- [ ] Follows CLTSimulation.jsx patterns
- [ ] Includes 4-stage educational insights
- [ ] Has smooth animations with proper timing
- [ ] Uses design system colors/typography
- [ ] Tested with various parameters
- [ ] No console errors or warnings

### Branch Strategy
- `main` - stable, production-ready code
- Feature branches: `feature/component-name`
- Hotfix branches: `hotfix/issue-description`

## ⚠️ Known Issues & Warnings
### Performance Considerations
- D3 animations can lag with >1000 data points
- Use `requestAnimationFrame` for smooth transitions
- Batch React state updates to prevent re-renders

### Common Pitfalls
- **Don't update state during D3 transitions** - causes janky animations
- **Avoid `useEffect` dependencies on frequently changing values** - use refs
- **MathJax rendering** - Use `\(inline\)` for inline math, `\\[display\\]` for block equations
- **MathJax + React Initial Render Fix** - ALWAYS use timeout pattern:
  ```javascript
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // Retry after 100ms
    return () => clearTimeout(timeoutId);
  }, [dependencies]);
  ```
- **Memory leaks** - always clean up D3 selections and timers

### Browser Quirks
- Safari: May need `-webkit` prefixes for some CSS
- Firefox: D3 transitions sometimes need explicit durations
- Mobile: Touch events need special handling for drag interactions

## 🎯 Core Principles Recap
1. **Educational First**: Every feature should teach something
2. **Progressive Disclosure**: Start simple, reveal complexity
3. **Immediate Feedback**: Show results of every action
4. **Engineering Context**: Connect to real-world applications
5. **Celebration of Learning**: Acknowledge milestones

## 🚨 D3 Drag Gotcha
**Problem**: D3 drag breaks when elements are inside a transformed `g` group.
```javascript
// ❌ BROKEN
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
bars.call(d3.drag().on("drag", (event) => {
  y.invert(event.y); // event.y is in screen coords, scale expects transformed coords!
}));

// ✅ FIXED
const y = d3.scaleLinear().range([height - margin.bottom, margin.top]); // Bake margins into scale
svg.selectAll("rect").call(d3.drag()...); // Elements directly on SVG
```
**Rule**: For D3 drag, avoid transforms. Position elements directly using scales with margins.

## Remember
The goal is to create visualizations that are **more engaging than any textbook**, where engineering students discover statistical insights through guided exploration, see real-world applications, and feel achievement as they master concepts they'll use in their careers.