# Component Specification: BayesianReasoning

## Overview
Interactive visualization for understanding Bayes' Theorem from Chapter 1.7, including prior/posterior updates and classic examples.

## Educational Objectives
From MAT 2377 course materials:
1. Understand the components of Bayes' Theorem
2. Visualize how evidence updates beliefs  
3. Apply Bayes' Theorem to real scenarios
4. Recognize base rate fallacy
5. Solve classic probability puzzles (Monty Hall)

## Core Features

### 1. Main Visualization Area
**Three visualization modes:**

#### A. Flow Diagram Mode
- Prior → Likelihood → Posterior flow
- Animated probability mass movement
- Color-coded probability regions

#### B. Tree Diagram Mode  
- Branching probability tree
- Path highlighting for calculations
- Show all conditional probabilities

#### C. Area/Grid Mode
- 10x10 or 100x100 grid of cases
- Color cells based on true/false positives/negatives
- Visual representation of base rates

### 2. Scenario Selector
Pre-loaded examples:
1. **Medical Testing** (from course p.53-54)
   - Disease prevalence: 0.1%
   - Test sensitivity: 99%
   - Test specificity: 95%

2. **Manufacturing Quality** (from course p.51-52)
   - Three models: Sentra, Maxima, Pathfinder
   - Different defect rates
   - Market shares

3. **Monty Hall Problem** (from course p.55-57)
   - Three doors
   - Interactive door selection
   - Show win rates for switch/stay strategies

4. **Custom Scenario**
   - User defines prior and likelihoods

### 3. Interactive Controls

#### Input Parameters
- **Prior P(H)**: 0-1 slider
- **Likelihood P(E|H)**: 0-1 slider  
- **Likelihood P(E|¬H)**: 0-1 slider

#### Calculation Display
- Show step-by-step calculation
- Highlight which values are being used
- Final posterior probability

### 4. Educational Insights (4 stages)

**Stage 1: Understanding Components**
"Bayes' Theorem has three parts: Prior (initial belief), Likelihood (how well evidence fits), and Posterior (updated belief)."

**Stage 2: Seeing the Update**
"Watch how the posterior probability changes as you adjust the likelihood. Strong evidence (high P(E|H), low P(E|¬H)) leads to bigger updates."

**Stage 3: Base Rate Importance**
"Even with a very accurate test, if the condition is rare (low prior), most positive results are false positives. This is the base rate fallacy."

**Stage 4: Real Applications**
"Bayes' Theorem is used in medical diagnosis, spam filtering, machine learning, and legal reasoning. It's how we rationally update beliefs."

## Visual Design

### Layout for Medical Testing Mode
```
+------------------------------------------+
|        Disease Testing Visualization      |
|                                          |
|    [Grid of 1000 people]                 |
|    ■ = Has disease + tests positive (TP) |
|    □ = Has disease + tests negative (FN) |
|    ▣ = No disease + tests positive (FP)  |
|    ▢ = No disease + tests negative (TN)  |
|                                          |
+------------------------------------------+
| Prior P(Disease) = 0.001  ----o----      |
| P(+|Disease) = 0.99       ----o----      |
| P(+|No Disease) = 0.05    ----o----      |
+------------------------------------------+
| Calculation:                             |
| P(Disease|+) = P(+|D)×P(D) / P(+)       |
|              = 0.99×0.001 / 0.0509       |
|              = 0.0194 (1.94%)            |
+------------------------------------------+
```

### Layout for Monty Hall Mode
```
+------------------------------------------+
|          Monty Hall Simulation           |
|                                          |
|     [Door 1]    [Door 2]    [Door 3]    |
|        ?           ?           ?         |
|                                          |
|  Your choice: Door 1                     |
|  Host opens: Door 3 (Goat)               |
|                                          |
|  [Stay with Door 1]  [Switch to Door 2]  |
|                                          |
+------------------------------------------+
| Statistics (1000 simulations):           |
| Win rate if stay: 33.3%                  |
| Win rate if switch: 66.7%                |
|                                          |
| [Run 100 Games] [Reset Statistics]       |
+------------------------------------------+
```

## Mathematical Formulas to Display

### Bayes' Theorem
```latex
P(H|E) = \frac{P(E|H) \cdot P(H)}{P(E)}
```

### Expanded Form
```latex
P(H|E) = \frac{P(E|H) \cdot P(H)}{P(E|H) \cdot P(H) + P(E|\neg H) \cdot P(\neg H)}
```

### In Words
```
Posterior = (Likelihood × Prior) / Evidence
```

### For Medical Testing
```latex
P(\text{Disease}|\text{Positive}) = \frac{P(\text{Positive}|\text{Disease}) \times P(\text{Disease})}{P(\text{Positive})}
```

## Example Problems from Course

### Example 1: Disease Testing (p.53-54)
```
- Disease prevalence: 0.1% (1 in 1000)
- Test sensitivity: 99% (correctly identifies disease)
- Test specificity: 95% (correctly identifies healthy)
- Question: If test is positive, what's probability of disease?
- Answer: Only 1.94%!
```

### Example 2: Manufacturing Defects (p.51-52)
```
- Sentra: 50% of sales, 12% defect rate
- Maxima: 30% of sales, 15% defect rate  
- Pathfinder: 20% of sales, 25% defect rate
- Given: Car has defect
- Find: Probability it's each model
```

### Example 3: Monty Hall (p.55-57)
Interactive simulation showing:
- Initial choice (1/3 probability)
- Host reveals goat (additional information)
- Switch gives 2/3 probability of winning

## Interactive Features

### Medical Testing Scenario
1. **Population Visualizer**
   - Grid of 1000 dots representing people
   - Animate testing process
   - Show true/false positives/negatives
   
2. **Individual Test**
   - Click "Test Random Person"
   - Show their true status and test result
   - Update running statistics

### Monty Hall Scenario
1. **Single Game Mode**
   - Click to choose door
   - Animate host opening door
   - Choose to switch or stay
   - Reveal result

2. **Simulation Mode**
   - Run 100 or 1000 games automatically
   - Show win rates for each strategy
   - Convergence visualization

### Custom Scenario Builder
- Define hypotheses (H₁, H₂, ..., Hₙ)
- Set prior probabilities
- Define evidence types
- Input likelihood matrix

## Tutorial Content

### Step 1: Introduction to Bayes
"Bayes' Theorem helps us update our beliefs when we get new evidence. Start with the medical testing example to see how it works."

### Step 2: Understanding Base Rates
"Notice that even with a 99% accurate test, most positive results are false! This is because the disease is so rare (0.1%). The prior probability matters!"

### Step 3: The Monty Hall Problem
"This famous puzzle shows how Bayes' Theorem explains counterintuitive results. After the host reveals a goat, switching doors doubles your chances!"

### Step 4: Building Intuition
"Try adjusting the parameters. When does a positive test strongly indicate disease? (Hint: when the disease is more common or the test is more specific)"

## Technical Implementation Notes

### Animation System
- Use D3 transitions for probability flow
- Stagger animations for visual clarity
- Allow speed control
- Pause/play functionality

### State Management
```javascript
const [scenario, setScenario] = useState('medical');
const [prior, setPrior] = useState(0.001);
const [sensitivity, setSensitivity] = useState(0.99);
const [specificity, setSpecificity] = useState(0.95);
const [visualization, setVisualization] = useState('grid');
const [montyHallStats, setMontyHallStats] = useState({
  gamesPlayed: 0,
  stayWins: 0,
  switchWins: 0
});
```

### Performance Considerations
- Limit grid visualization to 10,000 elements
- Use canvas for large populations
- Memoize Bayesian calculations
- Debounce slider updates

## Key Insights to Emphasize

1. **Rare events**: Even accurate tests give many false positives for rare conditions
2. **Evidence strength**: P(E|H) / P(E|¬H) ratio determines update magnitude
3. **Prior importance**: Can't ignore base rates
4. **Symmetry**: Can swap roles of prior and posterior in sequential updates

## Success Criteria
1. Students correctly interpret posterior probabilities
2. Students recognize base rate fallacy in examples
3. Students can solve Monty Hall problem
4. Students apply Bayes to new scenarios
5. Visualizations clearly show probability updates
6. Interactive elements respond instantly