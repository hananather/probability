
# Plan: 6.7 - Paired Two-Sample Test

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

**Guiding Philosophy:** This component will introduce the idea of comparing two related samples. The key insight is to show that by analyzing the *differences* between pairs, we cleverly reduce a two-sample problem into a simple one-sample t-test, which the user has already learned.

---

### 1. Core Question

*   "10 engineers' knowledge of statistical concepts was measured before and after a quality control course. Did the course improve their understanding?"

---

### 2. Interactive Exploration

*   **Part A: The Paired Data**
    *   **Data Display:**
        | Engineer | Before (X₁ᵢ) | After (X₂ᵢ) | Difference (Dᵢ) |
        |----------|--------------|-------------|-----------------|
        | 1 | 43 | 51 | -8 |
        | 2 | 82 | 84 | -2 |
        | 3 | 77 | 74 | 3 |
        | 4 | 39 | 48 | -9 |
        | 5 | 51 | 53 | -2 |
        | 6 | 66 | 61 | 5 |
        | 7 | 55 | 59 | -4 |
        | 8 | 61 | 75 | -14 |
        | 9 | 79 | 82 | -3 |
        | 10 | 43 | 48 | -5 |
    
    *   **Key Formula:** Dᵢ = X₁ᵢ - X₂ᵢ (Before - After)
    *   **Note:** "Negative differences indicate improvement!"

*   **Part B: Why Pairing Matters**
    *   **Scatter Plot Visualization:**
        - Plot Before vs After scores
        - Draw connecting lines for each engineer
        - Show correlation r ≈ 0.85
        - Insight: "Engineers who started high stayed high"
    
    *   **Variance Comparison:**
        - Var(X₁) = 224.9, Var(X₂) = 159.4
        - Var(D) = 31.21 (much smaller!)
        - Animation: "Pairing removes individual variation"

*   **Part C: The Transformation Animation**
    *   **Visual Steps:**
        1. Show full paired data table
        2. Animate: Extract difference column
        3. Transform: "Two-sample → One-sample problem"
        4. Apply one-sample t-test to differences
    
    *   **Test Setup:**
        - H₀: μD = 0 (no improvement)
        - H₁: μD < 0 (improvement)
        - Test statistic: T = D̄/(SD/√n)

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Calculations:**
    - D̄ = -3.9 (average improvement)
    - SD² = 31.21, SD = 5.59
    - t₀ = -3.9/(5.59/√10) = -2.21
    - df = 10 - 1 = 9
    - Critical value: t₀.₀₅(9) = 1.833
    - p-value ≈ 0.027

*   **Power of Pairing Demonstration:**
    | Method | Test Statistic | p-value | Decision (α=0.05) |
    |--------|---------------|---------|-------------------|
    | Paired t-test | -2.21 | 0.027 | Reject H₀ ✓ |
    | Unpaired t-test | -1.31 | 0.107 | Fail to reject |
    
    "Same data, different analysis, different conclusions!"

*   **When to Use Paired Design:**
    - Before/after measurements
    - Matched pairs (twins, split plots)
    - Repeated measures on same subject
    - "Key: Natural pairing exists"

---

### 4. Connect to Rigor

*   **Complete Paired t-Test Framework:**
    ```
    1. Verify pairing is appropriate
    2. Calculate differences: Dᵢ = X₁ᵢ - X₂ᵢ
    3. State hypotheses about μD
    4. Calculate: D̄ = ΣDᵢ/n, SD² = Σ(Dᵢ-D̄)²/(n-1)
    5. Test statistic: T = D̄/(SD/√n) ~ t(n-1)
    6. Compare to critical value or find p-value
    ```

*   **Assumptions:**
    - Differences Dᵢ are approximately normal
    - Pairs are independent of each other
    - Same measurement scale for both groups

*   **Efficiency Gain:**
    - Paired design variance: Var(D) = Var(X₁) + Var(X₂) - 2Cov(X₁,X₂)
    - When correlation is high, Var(D) << Var(X₁) + Var(X₂)
    - "Higher correlation → More powerful test"

*   **Common Mistakes:**
    - Using paired test on independent samples
    - Ignoring natural pairing in data
    - "Always check: Is there a logical pairing?"

---

**Reference Implementation:** This will be a new component with a focus on the animation of transforming two columns into one. The calculation part will reuse the logic from the `TestForMeanUnknownVariance` component (Plan 6.5).
