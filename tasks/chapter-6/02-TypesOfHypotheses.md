# Plan: 6.2 - Types of Hypotheses

### **Component Development Mandate**

**Guiding Philosophy: Direct Mathematical Teaching with Interactive Reinforcement**

**Core Principles:**
1. **Teach First, Interact to Reinforce:** Lead with clear mathematical definitions and concepts. Interactions should clarify and reinforce, not distract.
2. **Reuse Proven Patterns:** Leverage successful components from chapters 1-3 for consistency and efficiency.
3. **Mathematical Rigor:** Present formal definitions alongside visual understanding.
4. **No Unnecessary Narrative:** Focus on the mathematics, not stories.

---

**Component Type:** Mathematical Concept Explorer (Pattern: Normal Z-Score Explorer)

---

### 1. Direct Mathematical Introduction

**Opening Statement:** 
"Hypothesis tests come in three types based on your research question. The type determines where we look for evidence against H₀."

**Immediate Definitions:**
```
One-Tailed (Right): H₀: μ = μ₀  vs  H₁: μ > μ₀
One-Tailed (Left):  H₀: μ = μ₀  vs  H₁: μ < μ₀  
Two-Tailed:         H₀: μ = μ₀  vs  H₁: μ ≠ μ₀
```

---

### 2. Interactive Visualization (Pattern: Distribution Comparison + Z-Score Explorer)

**Layout:** 80% visualization, 20% controls

**Main View:** Three synchronized normal distributions showing:
1. **Null Distribution** (always centered at μ₀)
2. **Critical Regions** (shaded rejection zones)
3. **Test Statistic** (draggable marker like Z-Score Explorer)

**Key Features:**
- **Hypothesis Type Selector:** Radio buttons for One-Tailed (Right/Left) and Two-Tailed
- **Significance Level Slider:** α = 0.01, 0.05, 0.10 (updates critical values in real-time)
- **Test Statistic Slider:** Move to see p-value calculations
- **Mathematical Display Panel:** Shows:
  - Current hypotheses (H₀ and H₁)
  - Critical value(s)
  - Test statistic value
  - p-value calculation formula
  - Decision rule

**Visual Updates (Pattern: Conditional Probability perspectives):**
- Switching hypothesis types animates the critical region changes
- Color coding: Blue (fail to reject), Red (reject region)
- Show exact areas under curve

---

### 3. Mathematical Concepts Tab (Pattern: Conditional Probability tabs)

**Tab 1: Visual Explorer** (described above)

**Tab 2: Mathematical Framework**
- **Formal Definitions:**
  - Simple vs Composite Hypotheses
  - Critical Values Table (interactive - hover to highlight on distribution)
  - p-Value Formulas with step-by-step calculations
  
**Tab 3: Decision Rules**
- **Interactive Decision Tree:**
  - Input: Test statistic
  - Shows path through: Hypothesis type → Critical value comparison → Decision
  - Highlights which inequality is being checked

---

### 4. Comparison Mode (Pattern: Distribution Comparison)

**Side-by-Side View:** 
- Same test statistic (e.g., z = 1.8) applied to all three test types
- Shows different p-values and decisions
- **Key Learning:** "Same data, different conclusions based on research question"

**Interactive Table:**
| Test Type | Critical Value(s) | p-value | Decision |
|-----------|------------------|---------|----------|
| Right-Tailed | z > 1.645 | 0.036 | Reject H₀ |
| Left-Tailed | z < -1.645 | 0.964 | Fail to Reject |
| Two-Tailed | |z| > 1.96 | 0.072 | Fail to Reject |

---

### 5. Practice Problems (Pattern: Binomial Distribution's trial runs)

**Quick Scenarios:** (Not stories, just contexts)
1. "Test if mean > 100" → Identify test type → Set up hypotheses
2. "Test if proportion differs from 0.5" → Identify test type → Find critical values
3. "Test if treatment reduces values" → Identify test type → Calculate p-value

**Immediate Feedback:** 
- Shows correct hypothesis formulation
- Highlights critical region on distribution
- No points or gamification

---

### 6. Key Learning Outcomes

**Progressive Insights (Pattern: Z-Score Explorer's staged learning):**
1. **Stage 1:** Understand hypothesis structure (H₀ always has =)
2. **Stage 2:** Connect research question to test type
3. **Stage 3:** See how test type affects critical regions
4. **Stage 4:** Calculate p-values for each type

**Mathematical Discoveries Panel (Pattern: Conditional Probability's discovery tracking):**
- "Discovered: Two-tailed tests split α between tails"
- "Discovered: One-tailed tests have more power in the specified direction"
- "Discovered: Test type must be chosen before data collection"

---

### Implementation Notes

**Reusable Components:**
1. Distribution visualization from `NormalZScoreExplorer`
2. Tab structure from `ConditionalProbability`
3. Comparison layout from `DistributionComparison`
4. Interactive sliders from `BinomialDistribution`
5. Mathematical formatting from existing hypothesis testing components

**Technical Requirements:**
- Use D3 for distributions (following existing patterns)
- Smooth transitions between hypothesis types
- Real-time p-value calculations
- LaTeX rendering for all mathematical notation
- Responsive design maintaining 80-90% space usage

**Avoid:**
- Long narrative introductions
- "Story-based" scenarios that obscure the mathematics
- Gamification elements
- Excessive animations that don't teach

**Focus:**
- Clear mathematical definitions upfront
- Visual understanding through interaction
- Quick feedback loops (understand concept in <10 interactions)
- Practical application without unnecessary context