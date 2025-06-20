# Component Specification: DiscreteDistributions

## Overview
Unified component showcasing all four major discrete distributions from Chapter 2.3-2.6: Binomial, Geometric, Negative Binomial, and Poisson.

## Educational Objectives
From MAT 2377 course materials:
1. Understand when to use each discrete distribution
2. Visualize probability mass functions (PMF)
3. Calculate probabilities for specific outcomes
4. Understand relationships between distributions
5. Apply distributions to real-world scenarios

## Core Features

### 1. Distribution Selector
- **Tabbed interface** or dropdown to switch between:
  - Binomial B(n, p)
  - Geometric Geo(p)
  - Negative Binomial NegBin(r, p)
  - Poisson P(λ)

### 2. Interactive Visualization
- **Main plot area**: 800x600px
- **Bar chart** showing PMF
- **Hover details**: Show P(X = x) for each bar
- **Cumulative overlay**: Optional CDF line
- **Smooth transitions** between distributions

### 3. Parameter Controls
Distribution-specific sliders:

**Binomial B(n, p)**:
- n: 1-100 (number of trials)
- p: 0-1 (success probability)

**Geometric Geo(p)**:
- p: 0.01-0.99 (success probability)

**Negative Binomial NegBin(r, p)**:
- r: 1-20 (number of successes)
- p: 0.01-0.99 (success probability)

**Poisson P(λ)**:
- λ: 0.1-20 (rate parameter)

### 4. Real-time Statistics
Display for current distribution:
- Expected value E[X]
- Variance Var[X]
- Standard deviation SD[X]
- Mode (most likely value)
- Selected probability P(X = k)

### 5. Educational Insights (4 stages)

**Stage 1: Distribution Recognition**
"The [distribution name] models [scenario description]. Adjust the parameters to see how the shape changes."

**Stage 2: Parameter Effects**
"Notice how changing [parameter] affects [specific aspect]. This makes sense because [explanation]."

**Stage 3: Calculating Probabilities**
"Click on any bar to calculate P(X = k). You can also find P(X ≤ k) or P(X ≥ k) using the range selector."

**Stage 4: Relationships**
"Did you know? When n is large and p is small, Binomial(n,p) ≈ Poisson(np). Try n=100, p=0.03!"

## Visual Design

### Layout
```
+------------------------------------------+
|    [Binomial] [Geometric] [Neg Bin] [Poisson]   |
+------------------------------------------+
|                                          |
|          Probability Mass Function        |
|                [Bar Chart]               |
|                                          |
+------------------+----------------------+
| Parameters       | Statistics           |
| n = [50] ----o   | E[X] = 25           |
| p = [0.5] ---o   | Var[X] = 12.5       |
|                  | SD[X] = 3.54         |
+------------------+----------------------+
| Probability Calculator                   |
| P(X = [10]) = 0.0398                    |
| P(X ≤ [10]) = 0.0547                    |
+------------------------------------------+
| Educational Insights                     |
+------------------------------------------+
```

### Color Coding
- Binomial: Blue bars
- Geometric: Green bars
- Negative Binomial: Orange bars
- Poisson: Purple bars
- Highlighted bar: Darker shade
- Expected value line: Red vertical line

## Mathematical Formulas to Display

### Binomial Distribution
```latex
P(X = x) = \binom{n}{x} p^x (1-p)^{n-x}, \quad x = 0, 1, ..., n
```
```latex
E[X] = np, \quad Var[X] = np(1-p)
```

### Geometric Distribution  
```latex
P(X = x) = (1-p)^{x-1} p, \quad x = 1, 2, ...
```
```latex
E[X] = \frac{1}{p}, \quad Var[X] = \frac{1-p}{p^2}
```

### Negative Binomial Distribution
```latex
P(X = x) = \binom{x-1}{r-1} (1-p)^{x-r} p^r, \quad x = r, r+1, ...
```
```latex
E[X] = \frac{r}{p}, \quad Var[X] = \frac{r(1-p)}{p^2}
```

### Poisson Distribution
```latex
P(X = x) = \frac{\lambda^x e^{-\lambda}}{x!}, \quad x = 0, 1, ...
```
```latex
E[X] = \lambda, \quad Var[X] = \lambda
```

## Example Scenarios from Course

### Binomial Examples
1. **Quality Control**: 12 samples, 10% defect rate (p=0.1)
2. **Multiple Choice**: 20 questions, guessing (p=0.25)

### Geometric Examples
1. **First Success**: Rolling a die until getting a 6 (p=1/6)
2. **Quality Testing**: Testing until first defect

### Negative Binomial Examples
1. **Multiple Successes**: Roll die until 3 sixes appear
2. **Sales Targets**: Calls until 5 sales

### Poisson Examples
1. **Call Center**: 6 calls/minute average
2. **Hospital Births**: 2.74 births/night average
3. **Manufacturing Defects**: 3 defects/hour

## Interactive Features

### Probability Calculator
- Click bar to calculate P(X = x)
- Drag to select range for P(a ≤ X ≤ b)
- Toggle between inclusive/exclusive bounds
- Show calculation steps

### Animation Features
- "Generate Sample" button to animate random draws
- Show convergence to expected value
- Speed control for animation

### Comparison Mode
- Split screen to compare two distributions
- Overlay mode for direct comparison
- Highlight similarities/differences

## Tutorial Content

### Step 1: Choose Your Distribution
"Each distribution models different scenarios. Binomial counts successes in n trials, Geometric finds first success, Negative Binomial finds rth success, and Poisson models rare events."

### Step 2: Adjust Parameters
"Use the sliders to change parameters. Notice how the shape and spread of the distribution changes. The red line shows the expected value."

### Step 3: Calculate Probabilities
"Click any bar to find the probability of that exact value. Drag across bars to find the probability of a range."

### Step 4: Real Applications
"Try these scenarios: Binomial(20, 0.7) for a basketball player making shots, or Poisson(3) for customers arriving per hour."

## Technical Implementation Notes

### Performance Optimization
- Memoize probability calculations
- Limit display to meaningful range (e.g., where P(X=x) > 0.0001)
- Use D3 transitions for smooth updates
- Lazy load distribution calculations

### State Management
```javascript
const [distribution, setDistribution] = useState('binomial');
const [parameters, setParameters] = useState({
  n: 20,
  p: 0.5,
  r: 3,
  lambda: 5
});
const [selectedX, setSelectedX] = useState(null);
const [rangeSelection, setRangeSelection] = useState(null);
```

### Accessibility Features
- Keyboard navigation through bars
- Sonification option for distribution shape
- High contrast mode
- Table view alternative

## Relationships to Highlight

1. **Binomial → Poisson**: When n large, p small, np moderate
2. **Negative Binomial generalization**: Includes Geometric (r=1)
3. **Sum relationships**: Sum of Geometric = Negative Binomial
4. **Expected value patterns**: Notice E[X] = 1/p for Geometric

## Success Criteria
1. Students can identify appropriate distribution for scenarios
2. Students understand parameter effects on shape
3. Students can calculate probabilities correctly
4. Students recognize relationships between distributions
5. Smooth performance with instant updates
6. Clear visual distinction between distributions