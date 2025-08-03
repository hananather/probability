# LaTeX Subscript Fix Guide

## The Problem
LaTeX subscripts with multiple letters cause MathJax to interpret them as JavaScript variables instead of text.

**Error:** `"Can't find variable: XY"`

## Root Cause
```latex
❌ \\rho_{XY} = \\rho_{YX}     // MathJax looks for JS variable "XY"
❌ S_{xx}, S_{yy}, S_{xy}      // Same issue with multi-letter subscripts
```

## The Fix
Wrap multi-letter subscripts in `\\text{}`:

```latex
✅ \\rho_{\\text{XY}} = \\rho_{\\text{YX}}
✅ S_{\\text{xx}}, S_{\\text{yy}}, S_{\\text{xy}}
```

## Step-by-Step Fix Process

### 1. Identify Problematic Subscripts
Search for patterns like: `_{[A-Z][A-Z]}` or `_{[a-z][a-z]}`

### 2. Apply the Fix
```diff
- formula="\\rho_{XY} = \\rho_{YX}"
+ formula="\\rho_{\\text{XY}} = \\rho_{\\text{YX}}"
```

### 3. Test Build
```bash
npm run build
```
Should complete without "Can't find variable" errors.

## When to Use \\text{}

**Use \\text{} for:**
- Multi-letter subscripts: `x_{\\text{avg}}`
- Variable names: `\\rho_{\\text{XY}}`
- Text in math: `S_{\\text{xx}}`

**Don't need \\text{} for:**
- Single letters: `x_i`, `y_j`
- Numbers: `x_1`, `y_2`
- Greek letters: `\\alpha_\\beta`

## Key Insight
Both manual and hook LaTeX processing patterns work correctly. The issue was never the rendering approach - it was invalid LaTeX syntax.

## Files We Fixed
- `/src/components/learn/GoldStandardShowcase.jsx`
- `/src/components/learn/LaTeXEmpiricalTest.jsx`
- `/src/components/learn/LaTeXDiagnostic.jsx`

## Prevention
Always wrap multi-letter subscripts in `\\text{}` when writing LaTeX formulas in React components.