
# Plan: 6.9 - Difference of Two Proportions

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

**Guiding Philosophy:** This component extends the logic of comparing two groups to categorical data. It combines the ideas from the one-proportion test and the unpaired two-sample test.

---

### 1. Core Question

*   "Scientists study moth populations to understand natural selection. Among light-colored moths, 18 of 137 were recaptured. Among dark-colored moths, 131 of 493 were recaptured. Is there a significant difference in recapture rates?"

---

### 2. Interactive Exploration

*   **Part A: The Moth Recapture Data**
    *   **Data Setup:**
        | Population | Released (n) | Recaptured (y) | Proportion (p̂) |
        |------------|-------------|----------------|----------------|
        | Light moths | n₁ = 137 | y₁ = 18 | p̂₁ = 0.131 |
        | Dark moths | n₂ = 493 | y₂ = 131 | p̂₂ = 0.266 |
        
    *   **Visual Display:**
        - Bar chart showing proportions
        - Difference: p̂₁ - p̂₂ = -0.135
        - "Dark moths 2x more likely to be recaptured!"

*   **Part B: The Pooled Proportion Concept**
    *   **Why Pool Under H₀?**
        - H₀ claims p₁ = p₂ = p (common proportion)
        - Best estimate: pool all data
        - Formula: p̂ = (y₁ + y₂)/(n₁ + n₂)
    
    *   **Calculation Visualization:**
        ```
        p̂ = (18 + 131)/(137 + 493) = 149/630 = 0.2365
        ```
        - Animation: Merge two groups into one
        - "Under H₀, we treat all moths as one population"

*   **Part C: Standard Error Explorer**
    *   **SE Formula Breakdown:**
        - SE = √[p̂(1-p̂)(1/n₁ + 1/n₂)]
        - SE = √[0.2365 × 0.7635 × (1/137 + 1/493)]
        - SE = √[0.1806 × 0.00932] = 0.041
    
    *   **Interactive SE Visualizer:**
        - Slider for p̂: Show SE vs p
        - Maximum at p = 0.5
        - Effect of sample sizes
        - "Larger n → Smaller SE → More power"

*   **Part D: Large Counts Validator**
    *   **Check Both Groups:**
        | Group | np̂ | n(1-p̂) | Status |
        |-------|-----|---------|--------|
        | Light | 137×0.2365 = 32 | 105 | ✓ |
        | Dark | 493×0.2365 = 117 | 376 | ✓ |
        
    *   **Visual Indicator:** Green checkmarks
    *   **Note:** "Use pooled p̂ for checking!"

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Test Calculation:**
    - z = (p̂₁ - p̂₂)/SE = -0.135/0.041 = -3.29
    - p-value = 2 × P(Z < -3.29) ≈ 0.001
    - "Extremely strong evidence of difference!"

*   **Sample Size Impact Demonstration:**
    | Scenario | n₁, n₂ | Same p̂₁, p̂₂ | z-stat | p-value | Significant? |
    |----------|---------|--------------|---------|---------|--------------|
    | Original | 137, 493 | 0.131, 0.266 | -3.29 | 0.001 | Yes! |
    | Halved | 69, 247 | 0.131, 0.266 | -2.33 | 0.020 | Yes |
    | Quartered | 34, 123 | 0.131, 0.266 | -1.64 | 0.101 | No |
    
    "Same observed difference, different conclusions!"

*   **Confidence Interval Connection:**
    - 95% CI for p₁ - p₂: (-0.215, -0.055)
    - "CI excludes 0 ⟺ Reject H₀"
    - Note: CI uses unpooled SE

---

### 4. Connect to Rigor

*   **Complete Two-Proportion Test Framework:**
    ```
    1. State hypotheses:
       H₀: p₁ = p₂ (or p₁ - p₂ = 0)
    
    2. Check conditions:
       - Random samples
       - n₁p̂ ≥ 10, n₁(1-p̂) ≥ 10
       - n₂p̂ ≥ 10, n₂(1-p̂) ≥ 10
    
    3. Calculate pooled proportion:
       p̂ = (x₁ + x₂)/(n₁ + n₂)
    
    4. Calculate test statistic:
       z = (p̂₁ - p̂₂)/√[p̂(1-p̂)(1/n₁ + 1/n₂)]
    
    5. Find p-value and decide
    ```

*   **Important Distinctions:**
    | Purpose | SE Formula |
    |---------|------------|
    | Hypothesis Test | Use pooled p̂ |
    | Confidence Interval | Use separate p̂₁, p̂₂ |
    | Why? | H₀ assumes p₁ = p₂ |

*   **Connection to Chi-Square:**
    - z² = χ² for 2×2 table
    - "Two ways to test same hypothesis"
    - Preview of Chapter 7

*   **Practical Applications:**
    - A/B testing in tech
    - Clinical trials (treatment vs placebo)
    - Survey comparisons
    - Quality control (defect rates)

---

**Reference Implementation:** This will be a new component, structured as a calculator similar to Plan 6.6, but with inputs for two groups.
