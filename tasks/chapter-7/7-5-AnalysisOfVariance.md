# Plan: 7.5 - Analysis of Variance

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
    *   **Pedagogy & Interaction:** `/src/components/01-introduction-to-probabilities/1-7-monty-hall/`
    *   **Visual Design:** Component composition and decomposition visualizations
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

**Component Type:** Guided Discovery Experience

**Guiding Philosophy:** This component reveals how total variation in Y is partitioned into explained (regression) and unexplained (error) components. Users will discover the deep connection between ANOVA and regression.

---

### 1. Core Question

*   "How can we decompose the total variation in Y to understand what portion our regression model explains?"

---

### 2. Interactive Exploration

*   **Part A: The Variation Decomposition**
    *   **Visual Setup:**
        ```
        Three Perspectives on Each Point:
        
        1. Total Deviation: (yi - ȳ)
           "How far is yi from the mean?"
        
        2. Explained by Model: (ŷi - ȳ)
           "How far did regression move us from ȳ?"
        
        3. Unexplained Error: (yi - ŷi)
           "How far are we from the regression line?"
        ```
    
    *   **Interactive Point Explorer:**
        - Click any data point
        - Show three arrows:
          - Total (purple): point to mean line
          - Regression (blue): predicted to mean
          - Error (red): point to regression line
        - Display: (yi - ȳ) = (ŷi - ȳ) + (yi - ŷi)

*   **Part B: Sum of Squares Visualization**
    *   **Stacked Bar Chart:**
        ```
        SST (Total) = 173.38
        ├── SSR (Regression) = 152.14 [87.7%]
        └── SSE (Error) = 21.24 [12.3%]
        ```
    
    *   **Interactive Features:**
        - Hover to see individual contributions
        - Toggle between actual vs squared deviations
        - Animate the accumulation process

*   **Part C: The ANOVA Table Builder**
    *   **Step-by-Step Construction:**
        | Source | SS | df | MS | F | p-value |
        |--------|----|----|----|----|---------|
        | Regression | SSR = 152.14 | 1 | MSR = 152.14 | ? | ? |
        | Error | SSE = 21.24 | 18 | MSE = 1.18 | - | - |
        | Total | SST = 173.38 | 19 | - | - | - |
    
    *   **Calculate F-statistic:**
        - F = MSR/MSE = 152.14/1.18 = 128.9
        - Show F-distribution(1, 18)
        - Mark observed F value
        - Shade p-value area

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Key Insight 1: The Pythagorean Theorem of Statistics**
    *   **Geometric Visualization:**
        - Show vectors in n-dimensional space
        - SST² = SSR² + SSE² (when centered)
        - "Regression and error are orthogonal!"
    
*   **Key Insight 2: F = t²**
    *   **Demonstration:**
        - From Section 7.3: t = 11.35 for slope test
        - Calculate: t² = (11.35)² = 128.9
        - From ANOVA: F = 128.9
        - "Same test, different perspective!"
    
*   **Key Insight 3: Degrees of Freedom**
    *   **Visual Breakdown:**
        ```
        Start with n = 20 observations
        
        Total df = n - 1 = 19
        └── Why -1? Constraint: Σ(yi - ȳ) = 0
        
        Regression df = 1 (one slope parameter)
        Error df = n - 2 = 18 (lost intercept & slope)
        
        Check: 1 + 18 = 19 ✓
        ```

---

### 4. Connect to Rigor

*   **The Fundamental Identity:**
    ```
    Σ(yi - ȳ)² = Σ(ŷi - ȳ)² + Σ(yi - ŷi)²
       SST     =    SSR     +    SSE
       
    Total    = Explained + Unexplained
    Variation  by Model    Error
    ```

*   **ANOVA Table Structure:**
    ```
    Source      | Sum of Squares | df    | Mean Square | F-statistic
    ------------|----------------|-------|-------------|------------
    Regression  | SSR            | 1     | MSR = SSR/1 | F = MSR/MSE
    Error       | SSE            | n-2   | MSE = SSE/(n-2) |
    Total       | SST            | n-1   |             |
    ```

*   **F-Test for Regression Significance:**
    ```
    H₀: β₁ = 0 (no linear relationship)
    H₁: β₁ ≠ 0 (linear relationship exists)
    
    Test Statistic: F = MSR/MSE ~ F(1, n-2)
    
    Decision Rule: Reject H₀ if F > F_α(1, n-2)
    ```

*   **Fuel Data ANOVA:**
    ```
    Given: Syy = 173.38, b₁ = 14.95, Sxy = 10.18
    
    SSR = b₁ × Sxy = 14.95 × 10.18 = 152.14
    SSE = Syy - SSR = 173.38 - 152.14 = 21.24
    
    ANOVA Table:
    Source      | SS     | df | MS     | F      | p-value
    ------------|--------|----|---------|---------|---------
    Regression  | 152.14 | 1  | 152.14 | 128.9  | 1.23e-09
    Error       | 21.24  | 18 | 1.18   |        |
    Total       | 173.38 | 19 |        |        |
    
    Critical value: F₀.₀₅(1,18) = 4.41
    Since 128.9 > 4.41, reject H₀
    ```

*   **Connection to R²:**
    ```
    R² = SSR/SST = 152.14/173.38 = 0.877
    
    "Our model explains 87.7% of the variation in Y"
    ```

*   **Mean Squares Interpretation:**
    - MSR: Average variation explained per regression df
    - MSE: Average unexplained variation per error df
    - MSE = σ̂² (estimate of error variance)

---

**Reference Implementation:** This component will use variation decomposition similar to variance components with interactive table building.