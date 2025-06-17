# Tutorial Migration Guide

## Quick Start: Adding Tutorials to Components

### Step 1: Add Tutorial Content to chapter file

Open the appropriate chapter file (e.g., `chapter1.js`) and add your tutorial:

```js
// In src/tutorials/chapter1.js
export const tutorial_1_1_1 = [
  {
    title: "Sample Spaces and Events",
    content: (
      <div className="space-y-2">
        <p>A sample space Ω contains all possible outcomes of an experiment.</p>
        <p className="text-neutral-400 text-sm">
          Events are subsets of the sample space. Explore set operations on events.
        </p>
      </div>
    )
  },
  {
    target: '.sample-space-area',  // Optional: highlight specific elements
    title: "Interactive Exploration",
    content: (
      <div className="space-y-2">
        <p>Click outcomes to add them to events.</p>
        <p className="text-sm text-neutral-400">
          Observe how event operations affect the selected outcomes.
        </p>
      </div>
    ),
    position: 'bottom'  // Optional: position relative to target
  }
];
```

### Step 2: Import and Use in Component

In your component file, add these two lines:

```jsx
// At the top with other imports
import { Tutorial } from '../ui/Tutorial';
import { tutorial_1_1_1 } from '@/tutorials/chapter1';

// In your component
export default function SampleSpacesEvents() {
  const [showTutorial, setShowTutorial] = useState(false);
  
  return (
    <VisualizationContainer title="Sample Spaces and Events">
      <Tutorial
        steps={tutorial_1_1_1}
        onComplete={() => setShowTutorial(false)}
        onSkip={() => setShowTutorial(false)}
        showOnMount={true}
        persistKey="sample-spaces-1-1-1"
        mode="modal"
      />
      {/* Rest of your component */}
    </VisualizationContainer>
  );
}
```

## Content Guidelines (Academic Tone)

### DO:
- Use precise mathematical notation: P(A|B), Ω, ∩, ∪
- State concepts directly: "This demonstrates..."
- Use academic vocabulary: "Observe", "Demonstrate", "Explore"
- Keep explanations concise and factual

### DON'T:
- Use marketing language: "Master this concept!"
- Add unnecessary emojis
- Make promises: "You'll become an expert"
- Use exclamation points excessively

## Tutorial Properties

- `steps`: Array of tutorial steps (required)
- `persistKey`: Unique key to remember completion (recommended)
- `showOnMount`: Show tutorial when component loads (default: true)
- `mode`: "modal" or "tooltip" (default: "modal")
- `onComplete`: Callback when tutorial is completed
- `onSkip`: Callback when tutorial is skipped

## Naming Convention

Use section numbers for consistency:
- `tutorial_1_1_1` for Section 1.1.1
- `tutorial_3_4_2` for Section 3.4.2

This makes it easy to find tutorials for any component.