# Plan: 7.3 - Hypothesis Testing for Linear Regression

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
    *   **Pedagogy & Interaction:** `/src/components/06-hypothesis-testing/` (leverage Chapter 6 patterns)
    *   **Visual Design:** `/src/components/shared/CLTSimulation.jsx`
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

**Component Type:** Guided Discovery Experience

**Guiding Philosophy:** This component extends hypothesis testing to regression context. Users will discover that testing β₁ = 0 determines if the relationship is statistically significant.

---

### 1. Core Question

*   "Is the relationship between X and Y real, or could it have occurred by random chance?"

---

### 2. Interactive Exploration

*   **Part A: The Significance Question**
    *   **Visual Setup:**
        - Scatter plot with regression line
        - Toggle between:
          1. Real data (strong relationship)
          2. Scrambled Y values (no relationship)
        - Show how scrambling destroys pattern but can still produce non-zero slopes
    
    *   **Key Question:** "If there's truly NO relationship (β₁ = 0), what slopes might we see by chance?"

*   **Part B: Three Tests, One Goal**
    *   **Test Selection Panel:**
        ```
        Choose what to test:
        ┌─────────────────┬─────────────────┬─────────────────┐
        │   Intercept     │     Slope       │   Significance  │
        │  H₀: β₀ = β₀₀   │  H₀: β₁ = β₁₀   │  H₀: β₁ = 0     │
        │  (rarely used)  │  (general test) │  (most common)  │
        └─────────────────┴─────────────────┴─────────────────┘
        ```
    
    *   **Focus:** Significance test (H₀: β₁ = 0)

*   **Part C: The Test Statistic**
    *   **Formula Builder:**
        ```
        Under H₀: β₁ = 0
        
        Test statistic: T = (b₁ - 0) / SE(b₁)
                          = b₁ / √(σ̂²/Sxx)
        
        Distribution: T ~ t(n-2)
        ```
    
    *   **Interactive Calculator:**
        - Input: b₁, σ̂², Sxx, n
        - Output: t-statistic, df, critical values, p-value
        - Visual: t-distribution with observed value marked

*   **Part D: Sampling Distribution Visualization**
    *   **Simulation Under H₀:**
        1. Generate data with NO relationship
        2. Fit regression line
        3. Record slope b₁
        4. Repeat 1000 times
        5. Show histogram → t-distribution overlay
    
    *   **Key Insight:** "Even when β₁ = 0, we get non-zero b₁ by chance!"

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Key Insight 1: Connection to Correlation Test**
    *   **Equivalence Demo:**
        - Test H₀: β₁ = 0 
        - Test H₀: ρ = 0
        - Show these give identical t-statistics!
    *   **Formula:** t = ρ√[(n-2)/(1-ρ²)] = b₁/SE(b₁)

*   **Key Insight 2: Why df = n-2?**
    *   **Visual Explanation:**
        - Start with n data points
        - Estimate b₀ → lose 1 df
        - Estimate b₁ → lose 1 df
        - Remainder: n-2 for error estimation
    *   **Analogy:** "Like using sample mean in Chapter 6, but now we estimate TWO parameters"

*   **Key Insight 3: F-test = t-test²**
    *   **Demonstration:**
        - Calculate t-statistic for slope
        - Square it: t²
        - Calculate F-statistic from ANOVA
        - Show F = t² exactly!
    *   **Message:** "Two ways to test the same thing"

---

### 4. Connect to Rigor

*   **Test for Slope (Most Common):**
    ```
    H₀: β₁ = 0 (no linear relationship)
    H₁: β₁ ≠ 0 (linear relationship exists)
    
    Test Statistic: T = b₁/SE(b₁) ~ t(n-2)
    where SE(b₁) = √(σ̂²/Sxx)
    
    Decision Rule:
    - Reject H₀ if |T| > t_{α/2}(n-2)
    - Or if p-value < α
    ```

*   **Test for Intercept (Less Common):**
    ```
    H₀: β₀ = β₀₀
    H₁: β₀ ≠ β₀₀
    
    Test Statistic: T = (b₀ - β₀₀)/SE(b₀) ~ t(n-2)
    where SE(b₀) = √(σ̂² × Σxi²/(n×Sxx))
    ```

*   **Fuel Data Example:**
    ```
    Test H₀: β₁ = 0 vs H₁: β₁ ≠ 0 at α = 0.01
    
    Given: b₁ = 14.95, σ̂² = 1.18, Sxx = 0.68, n = 20
    
    SE(b₁) = √(1.18/0.68) = 1.317
    T = 14.95/1.317 = 11.35
    
    Critical value: t₀.₀₀₅(18) = 2.88
    Since |11.35| > 2.88, reject H₀
    
    Conclusion: Significant linear relationship exists
    ```

*   **R Output Interpretation:**
    ```
    Coefficients:
                Estimate Std. Error t value Pr(>|t|)    
    (Intercept)  74.283    1.593    46.62  < 2e-16 ***
    x            14.947    1.317    11.35  1.23e-09 ***
    
    Signif. codes: 0 '***' 0.001 '**' 0.01 '*' 0.05
    ```

*   **One-Sided Tests:**
    - H₁: β₁ > 0 (positive relationship)
    - H₁: β₁ < 0 (negative relationship)
    - Use t_α(n-2) instead of t_{α/2}(n-2)

*   **Connection to Confidence Intervals:**
    - "If 95% CI for β₁ excludes 0, then significant at α = 0.05"
    - Preview next section on interval estimation

---

**Reference Implementation:** This component will integrate hypothesis testing patterns from Chapter 6 with regression-specific visualizations.