# Component Building Blocks Hierarchy

## 🏗️ The "Lego Pieces" for Building Standardized Components

### Level 1: Foundation (Root Container)
```
📦 VisualizationContainer
  ├── title: string
  ├── tutorialSteps?: TutorialStep[]
  ├── tutorialKey?: string
  └── className?: string
```

### Level 2: Layout Components
```
📐 Layout Options:
  ├── 📊 VisualizationSection (for logical sections)
  │     ├── divider?: boolean
  │     └── className?: string
  │
  ├── 🖼️ GraphContainer (for visualizations)
  │     ├── height: string
  │     └── className?: string
  │
  └── 🎛️ ControlPanel (for controls)
        └── className?: string
```

### Level 3: Control Components
```
🎮 Interactive Controls:
  ├── 🔘 Button
  │     ├── variant: primary|secondary|danger|warning|info|neutral|tutorial
  │     ├── size: xs|sm|default|lg
  │     └── onClick: function
  │
  ├── 📊 ProgressBar
  │     ├── current: number
  │     ├── total: number
  │     ├── label: string
  │     └── variant: emerald|purple|teal|blue|orange|pink
  │
  ├── ⏮️⏭️ ProgressNavigation
  │     ├── current: number
  │     ├── total: number
  │     ├── onPrevious: function
  │     ├── onNext: function
  │     └── variant: (matches ProgressBar)
  │
  ├── 🎚️ RangeSlider
  │     ├── value: number
  │     ├── onChange: function
  │     ├── min/max/step: number
  │     ├── showValue?: boolean
  │     └── presets?: array
  │
  └── 📈 StatsDisplay
        └── stats: { label: string, value: string|number }[]
```

### Level 4: Content Components
```
📝 Content Display:
  ├── 📖 WorkedExample
  │     └── children: React.Node
  │
  ├── 📑 ExampleSection
  │     ├── title: string
  │     └── children: React.Node
  │
  ├── 🧮 Formula
  │     └── children: LaTeX string
  │
  ├── 💡 InsightBox
  │     ├── title?: string
  │     └── children: React.Node
  │
  ├── 🔢 CalculationSteps
  │     └── steps: array
  │
  └── 🌍 RealWorldExample
        ├── title: string
        └── children: React.Node
```

### Level 5: Utility Systems
```
🛠️ Utility Helpers:
  ├── 🎨 Color System
  │     ├── createColorScheme(theme)
  │     └── Returns: { chart, ui, text } colors
  │
  ├── 📝 Typography
  │     ├── h1, h2, h3, h4 (headers)
  │     ├── label (form labels)
  │     ├── value (data values)
  │     ├── valueAlt (alternate values)
  │     └── description (explanatory text)
  │
  ├── 🔢 Formatting
  │     ├── formatNumber(value, decimals)
  │     ├── formatPercent(value)
  │     └── formatDelta(value)
  │
  ├── 🎯 D3 Utilities
  │     ├── d3 (from @/utils/d3-utils)
  │     ├── useD3() hook
  │     ├── useD3Drag() hook
  │     └── useD3Cleanup() hook
  │
  └── 🎓 Tutorial System
        ├── Tutorial component
        ├── TutorialButton component
        └── useTutorial() hook
```

## 🏗️ Example: Building a Standardized Component

```jsx
// Step 1: Import your Lego pieces
import { 
  VisualizationContainer,    // Level 1: Foundation
  VisualizationSection,       // Level 2: Layout
  GraphContainer,
  ControlGroup,              // Level 3: Controls wrapper
  StatsDisplay              // Level 3: Stats display
} from '../ui/VisualizationContainer';

import { Button } from '../ui/button';              // Level 3: Control
import { RangeSlider } from '../ui/RangeSlider';    // Level 3: Control
import { ProgressBar } from '../ui/ProgressBar';    // Level 3: Control

import { 
  colors,                    // Level 5: Utilities
  typography,
  formatNumber,
  createColorScheme 
} from '../../lib/design-system';

// Step 2: Create your color scheme
const colorScheme = createColorScheme('probability');

// Step 3: Build your component
export default function MyStandardizedComponent() {
  return (
    <VisualizationContainer title="My Component" tutorialSteps={tutorialSteps}>
      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Controls Section */}
        <VisualizationSection className="lg:w-1/3">
          <ControlGroup label="Parameters">
            <RangeSlider
              value={value}
              onChange={setValue}
              min={0}
              max={100}
            />
            <Button 
              variant="primary"
              size="sm"
              onClick={handleRun}
            >
              Run Simulation
            </Button>
          </ControlGroup>
          
          <StatsDisplay stats={[
            { label: "Mean", value: formatNumber(mean, 3) },
            { label: "Variance", value: formatNumber(variance, 3) }
          ]} />
        </VisualizationSection>
        
        {/* Visualization Section */}
        <GraphContainer height="500px" className="lg:w-2/3">
          <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
        </GraphContainer>
        
      </div>
    </VisualizationContainer>
  );
}
```

## 🎯 Key Rules When Building

1. **Always start with `VisualizationContainer`** as your root
2. **Use the pre-built control components** - never create inline buttons or sliders
3. **Apply color schemes** from `createColorScheme()` - don't hard-code colors
4. **Use `formatNumber()` for all numeric displays** - ensures consistency
5. **Apply typography classes** from the design system
6. **Follow responsive patterns**: `flex-col lg:flex-row` for mobile-first design
7. **Wrap LaTeX in `React.memo`** components for performance
8. **Use `GraphContainer`** for all SVG visualizations
9. **Group related controls** with `ControlGroup`
10. **Display statistics** with `StatsDisplay` component

## 📊 Non-Standardized → Standardized Checklist

When refactoring a component to be standardized:

- [ ] Replace custom container with `VisualizationContainer`
- [ ] Replace inline buttons with `Button` component
- [ ] Replace custom sliders with `RangeSlider`
- [ ] Replace custom progress indicators with `ProgressBar`
- [ ] Use `createColorScheme()` instead of hard-coded colors
- [ ] Apply `font-mono` to all numbers via design system
- [ ] Use `formatNumber()` for numeric displays
- [ ] Apply responsive classes from design system
- [ ] Group controls with `ControlGroup`
- [ ] Display stats with `StatsDisplay`
- [ ] Add tutorial integration via `tutorialSteps` prop
- [ ] Ensure 80-90% space utilization for visualizations