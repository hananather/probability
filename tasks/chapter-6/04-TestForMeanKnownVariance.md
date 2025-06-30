
# Plan: 6.4 - Test for a Mean (Known Variance)

### **Component Development Mandate**

**Guiding Philosophy: Rigorous, Beautiful, and Insightful Guided Discovery.**
Our goal is to create a learning experience that is as aesthetically beautiful and intellectually satisfying as it is mathematically rigorous. We are building the world's best interactive textbook, inspired by the clarity and elegance of platforms like `brilliant.org`. The priority is **optimal teaching**, not gamification.

**Core Mandates:**
1.  **Pedagogy First, Interaction Second:** The primary goal is to teach. Interactions must be purposeful, low-bug, and directly serve to build intuition. Prefer curated animations and controlled interactions over complex, bug-prone drag-and-drop interfaces.
2.  **Aesthetic Excellence & Brand Consistency:**
    *   **Internal Consistency is Key:** The new components for this chapter must feel like a natural extension of the existing ones. Use the color schemes, animation styles, and layout patterns already present in `/src/components/06-hypothesis-testing/` as the primary source of truth for UI/UX design.
    *   **Typography & Layout:** Follow the established design system. Use `font-mono` for numbers, maintain clear visual hierarchies, and ensure layouts are clean, uncluttered, and content-driven.
3.  **Mathematical & Technical Rigor:**
    *   **Content:** All content must be derived from the official course materials for the relevant chapter, but examples must be generalized to be accessible to a broad university audience (science, social science, engineering, etc.).
    *   **LaTeX:** All mathematical notation must strictly adhere to the best practices outlined in `/docs/latex-guide.md`.
4.  **Reference Gold Standards:**
    *   **Pedagogy & Interaction:** `/src/components/01-introduction-to-probabilities/1-7-monty-hall/`
    *   **Hub Design:** `/src/components/04-descriptive-statistics-sampling/4-1-central-tendency/`
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

**Component Type:** Guided Discovery Experience

**Guiding Philosophy:** This component serves as the first practical application of the principles learned so far. It introduces the z-test and provides a clear, step-by-step process for conducting a hypothesis test.

---

### 1. Core Question

*   "Components are manufactured to have strength μ = 40 units with known σ = 1.2 units. After modifying the process, we test if mean strength has increased."

---

### 2. Interactive Exploration

*   **Part A: The Complete Testing Procedure**
    *   **Step-by-Step Calculator:**
        1. **State Hypotheses:** 
           - H₀: μ = 40 (no improvement)
           - H₁: μ > 40 (process improved)
           - Toggle to explore all three alternatives
        
        2. **Input Data:**
           - Population parameters: μ₀ = 40, σ = 1.2
           - Sample data: n = 12 components
           - Sample measurements display:
             ```
             42.5, 39.8, 40.3, 43.1, 39.6, 41.0
             39.9, 42.1, 40.7, 41.6, 42.1, 40.8
             ```
           - Calculated x̄ = 41.125
        
        3. **Choose Significance Level:**
           - Slider for α: [0.01, 0.05, 0.10]
           - Show critical values: z₀.₀₅ = 1.645, z₀.₀₁ = 2.327
        
        4. **Calculate Test Statistic:**
           - Show formula: Z = (X̄ - μ₀)/(σ/√n)
           - Calculation: z₀ = (41.125 - 40)/(1.2/√12) = 3.25

*   **Part B: Dual Approach Visualization**
    *   **Critical Value Method:**
        - Normal curve with vertical line at z = 1.645 (for α = 0.05)
        - Test statistic z₀ = 3.25 shown
        - Rejection region shaded
        - Decision: "z₀ = 3.25 > 1.645, Reject H₀"
    
    *   **p-Value Method:**
        - Same normal curve
        - Area beyond z₀ = 3.25 shaded
        - p-value = P(Z ≥ 3.25) = 0.0006
        - Decision: "p-value = 0.0006 < 0.05, Reject H₀"

*   **Part C: Connection to Confidence Intervals**
    *   **Interactive Toggle:** "Show Confidence Interval Approach"
    *   **95% CI for μ:** x̄ ± z₀.₀₂₅(σ/√n) = 41.125 ± 1.96(0.346) = [40.45, 41.80]
    *   **Key Insight:** "μ₀ = 40 is not in the 95% CI, so we reject H₀ at α = 0.05"
    *   **Equivalence:** "Reject H₀ ⟺ μ₀ not in (1-α)% CI"

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Interactive Exploration Panel:**
    - Sliders for: sample mean, sample size, significance level
    - Real-time updates showing:
      - How z-statistic changes
      - How p-value changes
      - Whether we reject or fail to reject
    
*   **Key Discoveries:**
    1. "Larger sample size → More precise test (narrower CI)"
    2. "Further from H₀ → Stronger evidence (smaller p-value)"
    3. "Lower α → Need stronger evidence to reject"
    4. "All three methods (critical value, p-value, CI) give same decision!"

---

### 4. Connect to Rigor

*   **Complete Testing Framework:**
    ```
    Step 1: H₀: μ = μ₀ vs H₁: μ > μ₀ (or < or ≠)
    Step 2: Choose α (typically 0.05)
    Step 3: Calculate z₀ = (x̄ - μ₀)/(σ/√n)
    Step 4: Find critical value z_α or p-value
    Step 5: Make decision
    Step 6: State conclusion in context
    ```

*   **Decision Rules Summary Table:**
    | Alternative | Critical Region | p-Value |
    |-------------|----------------|---------|
    | H₁: μ > μ₀  | z₀ > z_α       | P(Z > z₀) |
    | H₁: μ < μ₀  | z₀ < -z_α      | P(Z < z₀) |
    | H₁: μ ≠ μ₀  | |z₀| > z_{α/2} | 2P(Z > |z₀|) |

*   **When to Use Z-Test:**
    - Population is normal OR n ≥ 30 (CLT)
    - σ is known (rare in practice)
    - "If σ unknown, use t-test (next section)"

---

**Reference Implementation:** This will be a new component, but it will use the visualization style of `CLTSimulation.jsx` and the clear, step-by-step layout of a well-designed calculator.
