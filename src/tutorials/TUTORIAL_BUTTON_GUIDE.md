# Standardized Tutorial Button Implementation Guide

## Overview
We've created a standardized tutorial button system that ensures consistency across all components. The tutorial button:
- Has a unique violet color (tutorial variant)
- Appears in a consistent location (title bar)
- Uses the same icon and styling everywhere
- Can be easily added to any component

## Implementation Options

### Option 1: Enhanced VisualizationContainer (Recommended)
The simplest approach - just pass tutorial props to VisualizationContainer:

```jsx
import { tutorial_1_1_1 } from '@/tutorials/chapter1';

export default function MyComponent() {
  return (
    <VisualizationContainer 
      title="Sample Spaces and Events"
      tutorialSteps={tutorial_1_1_1}
      tutorialKey="sample-spaces-1-1-1"
    >
      {/* Your component content */}
    </VisualizationContainer>
  );
}
```

Benefits:
- Tutorial button automatically appears in title bar
- Handles all state management
- Consistent positioning across all components
- Just 2 extra props to add

### Option 2: Manual Implementation
If you need more control or have a custom layout:

```jsx
import { useState } from 'react';
import { Tutorial } from '../ui/Tutorial';
import { TutorialButton } from '../ui/TutorialButton';
import { tutorial_1_1_1 } from '@/tutorials/chapter1';

export default function MyComponent() {
  const [showTutorial, setShowTutorial] = useState(false);
  
  const handleTutorialRestart = () => {
    localStorage.removeItem('tutorial-my-component-completed');
    setShowTutorial(true);
  };
  
  return (
    <div className="relative">
      <Tutorial
        steps={tutorial_1_1_1}
        onComplete={() => setShowTutorial(false)}
        onSkip={() => setShowTutorial(false)}
        showOnMount={true}
        persistKey="my-component"
      />
      
      <TutorialButton 
        onClick={handleTutorialRestart}
        position="top-right" // or "top-left", "inline"
      />
      
      {/* Your component content */}
    </div>
  );
}
```

## Tutorial Button Positions

1. **inline** (default in VisualizationContainer): Part of the title bar
2. **top-right**: Floating in top right corner
3. **top-left**: Floating in top left corner

## Visual Design
- Color: Violet (stands out from other UI elements)
- Icon: Light bulb (universal symbol for tips/help)
- Size: Small (doesn't dominate the interface)
- Shadow: Subtle elevation to indicate interactivity

## Migration Steps
1. Import your tutorial content from the tutorials folder
2. Either:
   - Use VisualizationContainerEnhanced with tutorial props (easiest)
   - Add TutorialButton manually to your existing layout
3. Test that the button appears and restarts the tutorial

## Example Button Appearance
The tutorial button will appear as:
- Violet background with white text
- Light bulb icon + "Tutorial" text
- Subtle shadow that increases on hover
- Consistent size and styling across all components