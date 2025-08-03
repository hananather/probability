# Probabilistic Fallacies Black Border Fix

## Bug Description
User reported a black border/background appearing at the bottom of the probabilistic fallacies page that looked out of place.

## What Was Actually Broken
The component had an unnecessary outer div wrapper with `min-h-screen bg-gray-950` classes that:
1. Forced the container to be at least full viewport height (`min-h-screen`)
2. Applied a very dark gray background (`bg-gray-950`) that appeared almost black
3. Created excess black space at the bottom when content didn't fill the viewport

## Root Cause
The component was using redundant container styling instead of relying on the existing `VisualizationContainer` wrapper that already provides proper container structure according to the design system.

## Fix Applied
Removed the outer div with `min-h-screen bg-gray-950 text-white` classes, letting the `VisualizationContainer` handle all container styling. This follows the pattern used by working components like `GoldStandardShowcase`.

## Pattern That Fixed It
Using the design system's container patterns:
- `VisualizationContainer` provides `bg-neutral-800 rounded-lg shadow-xl p-5`
- No need for `min-h-screen` - let content determine height naturally
- Follow the established color palette (neutral-800/900) instead of gray-950

## Key Learnings
1. Always check if a component is already wrapped in a standard container before adding custom styling
2. Avoid forcing viewport height with `min-h-screen` unless absolutely necessary
3. Use the design system's color palette consistently - `gray-950` is too dark for containers
4. Working components in the codebase provide the best patterns to follow