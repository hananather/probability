# D3 Migration Example: SpatialRandomVariable

This document shows a concrete example of migrating a component from direct d3 module imports to using d3-utils.

## Before Migration

```javascript
// src/components/02-discrete-random-variables/2-1-1-SpatialRandomVariable.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "@/utils/d3-utils";
import { hexbin as d3Hexbin } from 'd3-hexbin';  // Direct import
```

## After Migration

```javascript
// src/components/02-discrete-random-variables/2-1-1-SpatialRandomVariable.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "@/utils/d3-utils";  // Now includes hexbin
```

## Code Changes Required

### 1. Update Import Statement
Remove the direct import line:
```diff
- import { hexbin as d3Hexbin } from 'd3-hexbin';
```

### 2. Update Function Usage
Replace all instances of `d3Hexbin` with `d3.hexbin`:

```javascript
// Before:
const hexbinGen = d3Hexbin()
  .radius(8)
  .extent([[0, 0], [width, height]]);

// After:
const hexbinGen = d3.hexbin()
  .radius(8)
  .extent([[0, 0], [width, height]]);
```

### 3. Search and Replace Pattern
Use your editor's search and replace:
- Find: `d3Hexbin`
- Replace: `d3.hexbin`

## Testing the Migration

1. **Visual Test**: 
   - Open the component in the browser
   - Verify hexagonal binning still works
   - Check for console errors

2. **Build Test**:
   ```bash
   npm run build
   ```

3. **Lint Test**:
   ```bash
   npm run lint
   ```

## Common Patterns to Watch For

### Pattern 1: Aliased Imports
```javascript
// Before:
import { scaleLinear as d3ScaleLinear } from 'd3-scale';

// After:
// Just use d3.scaleLinear from d3-utils
```

### Pattern 2: Multiple Direct Imports
```javascript
// Before:
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';

// After:
import { select, scaleLinear, line } from '@/utils/d3-utils';
// Or:
import * as d3 from '@/utils/d3-utils';
```

### Pattern 3: Rarely Used Functions
If you encounter a d3 function not in d3-utils:
1. Add the import to d3-utils.js
2. Add to both the named exports and default object
3. Test thoroughly

## Benefits After Migration

1. **Consistency**: All components use the same import pattern
2. **Bundle Size**: Better tree-shaking with centralized imports
3. **Maintainability**: Single source of truth for d3 functions
4. **Type Safety**: Easier to add TypeScript definitions later
5. **Performance**: Reduced duplicate code in bundles