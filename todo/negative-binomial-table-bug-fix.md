# Negative Binomial Distribution Table Bug Fix

## Bug Report
All simulation runs were showing exactly 7 trials, which is statistically impossible for a random process with p=0.17.

## Root Cause
The animation logic had a critical order-of-operations bug:
- The completion check (`prev.successes >= r`) happened BEFORE the trial was fully processed
- This caused the wrong trial count to be recorded

## Solution
Fixed the `animate` function in `/src/components/02-discrete-random-variables/2-5-1-NegativeBinomialDistribution.jsx`:
1. Generate random outcome and calculate new values first
2. Check for completion AFTER updating all state values  
3. Record simulation with correct `newTrial` count

## Key Learning
State management in animation loops requires careful attention to:
- Order of operations (check conditions after state updates)
- Avoiding closure issues with stale values
- Ensuring random number generation happens fresh each iteration

## File Changed
- `/src/components/02-discrete-random-variables/2-5-1-NegativeBinomialDistribution.jsx` (lines 352-391)