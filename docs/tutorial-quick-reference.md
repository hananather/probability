# Tutorial System Quick Reference

## 🚀 Quick Start

### 1. Add Tutorial Content
```jsx
// In src/tutorials/chapterX.jsx
export const tutorial_X_Y_Z = [
  {
    title: "Step Title",
    content: (
      <div className="space-y-3">
        <p className="text-base">Main concept with <em className="text-cyan-400">emphasis</em></p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center">Formula Here</p>
        </div>
        <p className="text-sm text-green-400">🎯 Action: What to do</p>
      </div>
    )
  },
  // 3-5 more steps...
];
```

### 2. Update Component (2 lines only!)
```jsx
import { tutorial_X_Y_Z } from '@/tutorials/chapterX';

<VisualizationContainer 
  tutorialSteps={tutorial_X_Y_Z}
  tutorialKey="component-name-X-Y-Z"
>
```

## 🎨 Visual Cheat Sheet

### Colors
- `text-cyan-400` - Main concepts
- `text-blue-400` - Important terms  
- `text-purple-400` - Mathematical elements
- `text-green-400` - Success/Actions
- `text-yellow-400` - Tips/Warnings
- `text-orange-400` - Challenges
- `text-neutral-400` - Secondary text

### Containers
```jsx
// Formula box
<div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">

// Info box
<div className="bg-neutral-800 p-3 rounded">

// Comparison grid
<div className="grid grid-cols-2 gap-3">
```

### Icons
🎯 Goal | 💡 Insight | 📊 Data | 🎲 Random | ✓ Success | 🔄 Process

## ⚠️ Common Fixes

### Missing VisualizationContainer Error
```jsx
import { VisualizationContainer } from '../ui/VisualizationContainer';
```

### Client Components
Update the base component file, not the "Client" wrapper!

### Build Check
```bash
npm run build && npm run lint
```

## 📋 Tutorial Template

```jsx
export const tutorial_X_Y_Z = [
  {
    title: "Understanding [Concept]",
    content: (
      <div className="space-y-3">
        <p className="text-base">[Hook question or statement]</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">[Formula]</p>
          <p className="text-sm text-neutral-400 text-center">[Explanation]</p>
        </div>
        <p className="text-xs text-neutral-500">[Why it matters]</p>
      </div>
    )
  },
  {
    title: "Interactive Exploration",
    content: (
      <div className="space-y-3">
        <p>[What they'll do]</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <div>[Feature 1]</div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">•</span>
            <div>[Feature 2]</div>
          </div>
        </div>
        <p className="text-sm text-green-400">🎯 Try: [Specific action]</p>
      </div>
    )
  },
  // 2-4 more steps focusing on concepts, not UI
];
```

## ✅ Quality Checklist
- [ ] Teaches concept, not just UI
- [ ] Uses color system consistently  
- [ ] 4-6 focused steps
- [ ] Includes visual formulas
- [ ] Has clear actions
- [ ] Imports are correct
- [ ] Build passes