# Tutorial Guide

## Quick Implementation (2 lines)

```jsx
// 1. Import tutorial content
import { tutorial_X_Y_Z } from '@/tutorials/chapterX';

// 2. Add to VisualizationContainer
<VisualizationContainer 
  tutorialSteps={tutorial_X_Y_Z}
  tutorialKey="component-name-X-Y-Z"
>
```

## Tutorial Content Template

```jsx
// In src/tutorials/chapterX.jsx
export const tutorial_X_Y_Z = [
  {
    title: "Understanding [Concept]",
    content: (
      <div className="space-y-3">
        <p className="text-base">Hook question or key concept</p>
        
        {/* Formula box */}
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center">Formula</p>
          <p className="text-sm text-neutral-400 text-center">Explanation</p>
        </div>
        
        <p className="text-sm text-green-400">🎯 Try: Specific action</p>
      </div>
    )
  },
  // 3-5 more focused steps
];
```

## Visual System

### Colors
- `text-cyan-400` - Main concepts
- `text-blue-400` - Important terms  
- `text-purple-400` - Math elements
- `text-green-400` - Success/Actions
- `text-yellow-400` - Tips/Warnings
- `text-neutral-400` - Secondary text

### Icons
🎯 Goal | 💡 Insight | 📊 Data | 🎲 Random | ✓ Success | 🔄 Process

### Containers
```jsx
// Formula
<div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">

// Info box  
<div className="bg-neutral-800 p-3 rounded">

// Comparison
<div className="grid grid-cols-2 gap-3">
```

## Rules
1. **Teach concepts, not UI** - Focus on math/statistics
2. **4-6 steps max** - Keep it digestible
3. **Visual formulas** - Use color-coded boxes
4. **Clear actions** - Tell users what to try
5. **Build understanding** - Progress from simple to complex

## Common Issues
- Missing import: `import { VisualizationContainer } from '../ui/VisualizationContainer';`
- Wrong file: Edit base component, not "Client" wrapper
- Build check: `npm run build && npm run lint`

## Example: Probability Tutorial
```jsx
export const tutorial_1_5_1 = [
  {
    title: "What is Probability?",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          How likely is it to roll a <span className="text-cyan-400">6</span> on a die?
        </p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center">P(E) = |E| / |S|</p>
          <p className="text-sm text-neutral-400 text-center">
            Favorable outcomes / Total outcomes
          </p>
        </div>
        <p className="text-sm text-green-400">🎯 Click outcomes to see probability change</p>
      </div>
    )
  }
];
```