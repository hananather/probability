# UI Component Structure Analysis

## 1. UI Component Directory Structure

### Main UI Directory
- **Location**: `/src/components/ui/`
- **Components**:
  - `VisualizationContainer.jsx`
  - `button.jsx`
  - `ProgressBar.jsx`
  - `card.jsx`
  - `sheet.jsx`
  - `sidebar.jsx`
  - `typography.jsx`
  - `WorkedExampleContainer.jsx`
  - `RangeSlider.jsx`
  - `TutorialButton.jsx`
  - `Tutorial.jsx`
  - `WorkedExample.jsx`
  - `D3DragWrapper.jsx`
  - `ProgressTracker.jsx`

### Design System
- **Location**: `/src/lib/design-system.js`
- Used for colors, typography, spacing, and utility functions

## 2. Import Pattern Analysis

### Working Pattern (Chapters 1, 2, 3)
Components at depth: `src/components/01-introduction-to-probabilities/*.jsx`
- **VisualizationContainer**: `from '../ui/VisualizationContainer'`
- **Button**: `from '../ui/button'`
- **Design System**: `from '../../lib/design-system'` or `from '@/lib/design-system'`

### Broken Pattern (Chapter 4 - Root Level)
Components at depth: `src/components/04-descriptive-statistics-sampling/*.jsx`
- **VisualizationContainer**: `from '../ui/VisualizationContainer'` ❌ (should be `../../ui/VisualizationContainer`)
- **Button**: `from '../ui/button'` ❌ (should be `../../ui/button`)
- **ProgressBar**: `from '../ui/ProgressBar'` ❌ (should be `../../ui/ProgressBar`)
- **Design System**: `from '@/lib/design-system'` ✅ (correct - using absolute path)

### Working Pattern (Chapter 4 - Subdirectories)
Components at depth: `src/components/04-descriptive-statistics-sampling/4-2-histograms/*.jsx`
- **VisualizationContainer**: `from '../../ui/VisualizationContainer'` ✅
- **Button**: `from '../../ui/button'` ✅
- **Design System**: `from '../../../lib/design-system'` ✅

## 3. Affected Files

### Files with Incorrect Import Paths (16 files in Chapter 4 root):
1. `4-1-0-CentralTendencyFoundations.jsx`
2. `4-1-0-CentralTendencyIntuitiveIntro.jsx`
3. `4-1-0-CentralTendencyMasterclass.jsx`
4. `4-1-1-CentralTendencyJourney.jsx`
5. `4-1-1-ComprehensiveStats.jsx`
6. `4-1-1-DataExplorerIntro.jsx`
7. `4-1-1-MeanMedianMode.jsx`
8. `4-1-2-CentralTendencyDeepDive.jsx`
9. `4-1-2-DescriptiveStatisticsFoundations.jsx`
10. `4-1-3-DescriptiveStatsExplorer.jsx`
11. `4-2-1-HistogramShapeExplorer-OLD.jsx`
12. `4-3-1-SamplingDistributions.jsx`
13. `4-3-1-SamplingDistributions-Improved.jsx`
14. `4-6-1-BoxplotQuartilesJourney.jsx`
15. `4-6-2-BoxplotRealWorldExplorer.jsx`
16. `4-1-0-CentralTendencyFoundations-fixed.jsx`

### Files with Correct Import Paths:
- All files in `4-2-histograms/` subdirectory (using `../../ui/...`)
- The `4-1-central-tendency/index.jsx` file (using `../../ui/...`)

## 4. Root Cause

The issue is a **path depth mismatch**. Chapter 4 components at the root level are one directory deeper than Chapter 1-3 components:

- Chapter 1-3: `src/components/[chapter]/[component].jsx` → `../ui/` works
- Chapter 4 (root): `src/components/04-descriptive-statistics-sampling/[component].jsx` → needs `../../ui/`
- Chapter 4 (subdirs): `src/components/04-descriptive-statistics-sampling/[subdir]/[component].jsx` → correctly uses `../../ui/`

## 5. Recommended Fix

Update all import statements in the 16 affected Chapter 4 root-level files:

```jsx
// Change from:
import { VisualizationContainer } from '../ui/VisualizationContainer';
import { Button } from '../ui/button';
import { ProgressBar } from '../ui/ProgressBar';

// To:
import { VisualizationContainer } from '../../ui/VisualizationContainer';
import { Button } from '../../ui/button';
import { ProgressBar } from '../../ui/ProgressBar';
```

## 6. No Duplicate Components Found

- Only one `button.jsx` exists at `/src/components/ui/button.jsx`
- Only one `VisualizationContainer.jsx` exists at `/src/components/ui/VisualizationContainer.jsx`
- No duplicate UI components detected

## 7. Standard Import Patterns

### For components at `src/components/[chapter]/`:
```jsx
import { VisualizationContainer } from '../ui/VisualizationContainer';
import { Button } from '../ui/button';
import { colors, typography } from '@/lib/design-system';
```

### For components at `src/components/[chapter]/[subdir]/`:
```jsx
import { VisualizationContainer } from '../../ui/VisualizationContainer';
import { Button } from '../../ui/button';
import { colors, typography } from '@/lib/design-system';
```