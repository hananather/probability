# Hydration Mismatch Fix - SamplingAnimation Component

## Date: 2025-08-26

## What was broken
The SamplingAnimation component in `/src/components/04-descriptive-statistics-sampling/4-0-DescriptiveStatisticsHub.jsx` was causing hydration mismatches between server-side rendering (SSR) and client-side rendering.

**Specific error**: Server rendered `cx="29.15874509685645"` but client expected `cx={29.158745096856453}` (floating point precision differences).

## Why it was broken
1. **Math.random() during render**: The component was using `Math.random()` both during render and in effects, producing different values on server vs client
2. **Dynamic position calculations**: Population point positions were calculated during render using Math.sin/cos, which could produce slightly different floating-point results
3. **Animations running during SSR**: Motion animations were attempting to run on both server and client, causing mismatches

## What pattern fixed it
Applied the **seeded random pattern** from `/src/components/landing/visualizations/Ch4Sampling.jsx`:

1. **Added seededRandom function**: Deterministic pseudo-random function using `Math.sin(seed) * 10000`
2. **Added isClient flag**: State flag to detect client-side rendering and prevent animations during SSR
3. **Pre-calculated positions**: Used React.useMemo to calculate population points deterministically
4. **Guarded animations**: All motion animations now check `isClient` before animating

## Key changes
- Replaced `Math.random()` with `seededRandom(seed)` 
- Added `const [isClient, setIsClient] = useState(false)` 
- Protected all animations with `isClient ? {...animation} : {static values}`
- Pre-calculated population points in useMemo to ensure consistency

## Verification
- `npm run clean-build` ✅ - Build successful
- `npm run lint` ✅ - No ESLint warnings or errors

This pattern should be applied to any component using random values or animations to prevent hydration mismatches.