# Plan: 7.3 - Hypothesis Testing for Linear Regression (Improved)

### **Component Development Mandate**

**Guiding Philosophy: Rigorous, Beautiful, and Insightful Guided Discovery.**
Our goal is to create a learning experience that is as aesthetically beautiful and intellectually satisfying as it is mathematically rigorous. We are building the world's best interactive textbook, inspired by the clarity and elegance of platforms like `brilliant.org`. The priority is **optimal teaching**, not gamification.

**Core Mandates:**
1.  **Pedagogy First, Interaction Second:** The primary goal is to teach. Interactions must be purposeful, low-bug, and directly serve to build intuition. Prefer curated animations and controlled interactions over complex, bug-prone drag-and-drop interfaces.
2.  **Aesthetic Excellence & Brand Consistency:**
    *   **Internal Consistency is Key:** The new components for this chapter must feel like a natural extension of the existing ones. Use the color schemes, animation styles, and layout patterns already established in the codebase.
    *   **Typography & Layout:** Follow the established design system. Use `font-mono` for numbers, maintain clear visual hierarchies, and ensure layouts are clean, uncluttered, and content-driven.
3.  **Mathematical & Technical Rigor:**
    *   **Content:** All content must be derived from the official course materials for the relevant chapter, but examples must be generalized to be accessible to a broad university audience (science, social science, engineering, etc.).
    *   **LaTeX:** All mathematical notation must strictly adhere to the best practices outlined in `/docs/latex-guide.md`.
4.  **Reference Gold Standards:**
    *   **Pedagogy & Interaction:** `/src/components/06-hypothesis-testing/` (reuse successful patterns)
    *   **Visual Design:** Sampling distribution visualizations
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

**Component Type:** Guided Discovery Experience

**Guiding Philosophy:** This component focuses on the most important test in regression - whether the relationship is statistically significant (H₀: β₁ = 0).

---

### 1. Core Question

*   "Is the relationship we see between X and Y real, or could it have happened by pure chance?"

---

### 2. Interactive Exploration

*   **Part A: Real vs Random Relationships**
    
    *   **Side-by-Side Comparison:**
        ```
        Real Data (Fuel Quality)          Random Data (Shuffled Y)
        ┌─────────────────────┐          ┌─────────────────────┐
        │      •   •          │          │    •     •          │
        │    •   •   •        │          │  •   • •     •      │
        │  •   •   •          │          │    •   •   •        │
        │•   •                │          │• •   •              │
        └─────────────────────┘          └─────────────────────┘
        b₁ = 14.95                       b₁ = 1.23
        Clear pattern!                   No pattern!
        ```
    
    *   **Animation Sequence:**
        1. Show real data with fitted line
        2. Button: "Shuffle Y Values"
        3. Animate points moving to random Y positions
        4. Refit line to shuffled data
        5. Compare slopes

    *   **Key Question:** "If there's truly NO relationship, what slopes might we see?"

*   **Part B: The Null Hypothesis World**
    
    *   **Simulation Under H₀: β₁ = 0**
        ```
        If NO relationship exists, what slopes could appear by chance?
        
        Simulation Progress: ████████░░ 80%
        
        Distribution of b₁ under H₀:
        ┌─────────────────────────────┐
        │      ╱╲                     │
        │    ╱    ╲                   │
        │  ╱        ╲                 │
        │╱            ╲___            │
        └─────────────────────────────┘
        -4    -2    0    2    4
                    ↑
                 E[b₁] = 0
        
        Our observed b₁ = 14.95 is WAY out here →
        ```
    
    *   **Pre-computed Simulation:**
        - 1000 random shuffles (pre-calculated)
        - Smooth histogram animation
        - Overlay t-distribution
        - Mark observed value

*   **Part C: The Test Statistic**
    
    *   **Building the t-statistic:**
        ```
        Question: How many standard errors is b₁ from 0?
        
        t = (b₁ - 0) / SE(b₁)
          = 14.95 / 1.317
          = 11.35
        
        Visual Scale:
        0 ──────────────────────────●── b₁ = 14.95
        └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
         1 2 3 4 5 6 7 8 9 10 11
              (standard errors)
        
        "That's 11.35 standard errors from zero!"
        ```

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Key Insight 1: The Significance Test**
    
    *   **Visual P-value:**
        ```
        t-distribution with df = 18
        
        │      ╱╲
        │    ╱    ╲
        │  ╱        ╲
        │╱            ╲_____
        └────────────────────────
        -3    0    3        11.35
                            ↑
                        Our t-value
        
        P(|T| > 11.35) < 0.000000001
        
        "The chance of seeing this by accident 
         is less than 1 in a billion!"
        ```

*   **Key Insight 2: Connection to Correlation Test**
    
    *   **The Equivalence:**
        ```
        Testing H₀: β₁ = 0 is EXACTLY the same as
        Testing H₀: ρ = 0
        
        For our data:
        • t-test for slope: t = 11.35
        • t-test for correlation: t = 11.35
        
        Same test, different perspective!
        ```

*   **Key Insight 3: Why df = n - 2?**
    
    *   **Degrees of Freedom Visual:**
        ```
        Start with n = 20 data points
        
        Estimate b₀ → lose 1 df → 19 left
        Estimate b₁ → lose 1 df → 18 left
        
        df = n - 2 = 18 for error estimation
        
        "We 'spent' 2 degrees of freedom 
         to estimate the line"
        ```

---

### 4. Connect to Rigor

*   **The Significance Test Framework:**
    ```
    H₀: β₁ = 0 (no linear relationship)
    H₁: β₁ ≠ 0 (linear relationship exists)
    
    Test Statistic:
    T = b₁/SE(b₁) ~ t(n-2)
    
    where SE(b₁) = √(MSE/Sxx)
          MSE = SSE/(n-2)
    ```

*   **Fuel Data Test Calculation:**
    ```
    Step 1: Calculate MSE
    SSE = Syy - b₁×Sxy = 173.38 - 14.95×10.18 = 21.24
    MSE = 21.24/18 = 1.18
    
    Step 2: Calculate SE(b₁)
    SE(b₁) = √(1.18/0.68) = √1.735 = 1.317
    
    Step 3: Calculate t-statistic
    t = 14.95/1.317 = 11.35
    
    Step 4: Find critical value
    t₀.₀₀₅(18) = 2.88 (for α = 0.01)
    
    Step 5: Decision
    |11.35| > 2.88 → Reject H₀
    
    Conclusion: Highly significant relationship!
    ```

*   **Confidence Interval Connection:**
    ```
    95% CI for β₁:
    b₁ ± t₀.₀₂₅(18) × SE(b₁)
    = 14.95 ± 2.10 × 1.317
    = 14.95 ± 2.77
    = [12.18, 17.72]
    
    Note: CI excludes 0 ↔ Test rejects H₀
    ```

*   **F-test Equivalence:**
    ```
    From ANOVA (preview of Section 7.5):
    F = MSR/MSE = 128.9
    
    Note: F = t² = (11.35)² = 128.9
    
    "Same test, squared!"
    ```

*   **Practical Interpretation:**
    ```
    For fuel quality data:
    • p-value = 1.23 × 10⁻⁹
    • "The probability of observing a slope this 
      extreme if there were truly no relationship 
      is essentially zero"
    • Strong evidence of a real relationship
    ```

*   **Other Tests (Brief Mention):**
    ```
    Less Common Tests:
    1. Test for intercept: H₀: β₀ = β₀₀
    2. Test for specific slope: H₀: β₁ = β₁₀
    3. One-sided tests: H₁: β₁ > 0
    
    All use the same t-distribution framework!
    ```

---

### 5. Implementation Notes

**Animation Sequence:**
- Shuffle animation: 1.5s smooth transition
- Simulation build: 3s progressive reveal
- t-distribution draw: 2s with emphasis on tails
- Total experience: ~8s of key animations

**Visual Hierarchy:**
1. **Primary Focus:** Significance test (H₀: β₁ = 0)
2. **Secondary:** Visual p-value representation
3. **Tertiary:** Connection to correlation test
4. **Optional:** Other test types

**Performance Optimization:**
- Pre-compute 1000 simulations
- Store as compressed array
- Animate histogram with RAF
- Lazy load distribution curves

**Color Scheme:**
- Real data: Blue (#2563eb)
- Null hypothesis: Gray (#6b7280)
- Test statistic: Orange (#f59e0b)
- Rejection region: Red (#ef4444)
- Non-rejection: Green (#10b981)

**Progressive Disclosure:**
1. Show real vs random → Establish need for test
2. Build null distribution → Understand chance
3. Calculate t-statistic → Quantify evidence
4. Make decision → Apply to practice

---

**Reference Implementation:** This component heavily leverages Chapter 6 hypothesis testing patterns, adapting them for the regression context with cleaner focus on the primary test.