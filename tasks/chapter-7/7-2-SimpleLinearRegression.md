# Plan: 7.2 - Simple Linear Regression

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
    *   **Visual Design:** `/src/components/02-discrete-random-variables/2-1-1-SpatialRandomVariable.jsx`
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

**Component Type:** Guided Discovery Experience

**Guiding Philosophy:** This component reveals how the least squares method finds the optimal regression line. Users will discover why we minimize squared errors rather than absolute errors.

---

### 1. Core Question

*   "What's the 'best' line through our data points, and how do we find it?"

---

### 2. Interactive Exploration

*   **Part A: The Line-Finding Challenge**
    *   **Interactive Plot Setup:**
        - Scatter plot with fuel data (20 points)
        - Draggable line with handles for:
          - Intercept (b₀): vertical position
          - Slope (b₁): rotation angle
        - Real-time display:
          - Current equation: ŷ = b₀ + b₁x
          - Sum of Squared Errors (SSE)
          - Visual residuals (vertical lines)
    
    *   **Challenge:** "Can you find the line that minimizes SSE?"
    *   **Feedback:** Color gradient from red (high SSE) to green (low SSE)

*   **Part B: Why Squared Errors?**
    *   **Comparison Panel:**
        | Method | Formula | Visual | Properties |
        |--------|---------|--------|------------|
        | Squared | Σ(y - ŷ)² | Parabola | Differentiable, emphasizes outliers |
        | Absolute | Σ|y - ŷ| | V-shape | Not differentiable at 0 |
        | Count | Σ(I[error > ε]) | Step | Not continuous |
    
    *   **Interactive Demo:**
        - Toggle between error methods
        - Show how squared errors lead to unique solution
        - Demonstrate sensitivity to outliers

*   **Part C: The Least Squares Solution**
    *   **Animated Derivation:**
        1. Start with SSE = Σ(yi - b₀ - b₁xi)²
        2. Show partial derivatives:
           - ∂SSE/∂b₀ = -2Σ(yi - b₀ - b₁xi)
           - ∂SSE/∂b₁ = -2Σ(yi - b₀ - b₁xi)xi
        3. Set to zero and solve
        4. Arrive at formulas:
           - b₁ = Sxy/Sxx
           - b₀ = ȳ - b₁x̄
    
    *   **Visual Proof:** 3D surface of SSE(b₀, b₁) with minimum point

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Key Insight 1: The Line Goes Through (x̄, ȳ)**
    *   **Visual Demo:**
        - Mark centroid (x̄, ȳ) with special symbol
        - Show any least squares line passes through it
        - Rotate line around centroid - SSE changes
    *   **Why:** "The residuals sum to zero: Σei = 0"

*   **Key Insight 2: Residual Patterns**
    *   **Good Fit Checklist:**
        - Random scatter around 0
        - No curves or patterns
        - Constant variance
    *   **Interactive Residual Plot:**
        - Plot residuals vs x
        - Highlight patterns in poor fits
        - Show examples: linear OK, quadratic bad

*   **Key Insight 3: Regression ≠ Causation**
    *   **Direction Matters:**
        - Regress Y on X: ŷ = b₀ + b₁x
        - Regress X on Y: x̂ = c₀ + c₁y
        - Show these give different lines!
    *   **Message:** "Regression assumes X causes Y"

---

### 4. Connect to Rigor

*   **The Regression Model:**
    ```
    Model: Y = β₀ + β₁X + ε
    
    Assumptions:
    1. E[ε] = 0 (errors average to zero)
    2. Var[ε] = σ² (constant variance)
    3. ε ~ N(0, σ²) (normal errors)
    4. ε independent (no autocorrelation)
    ```

*   **Least Squares Estimators:**
    ```
    b₁ = Sxy/Sxx = Σ(xi - x̄)(yi - ȳ)/Σ(xi - x̄)²
    b₀ = ȳ - b₁x̄
    
    where:
    Sxy = Σxiyi - nx̄ȳ (numerator)
    Sxx = Σxi² - nx̄² (denominator)
    ```

*   **Properties of Estimators:**
    - **Unbiased:** E[b₀] = β₀, E[b₁] = β₁
    - **Linear:** b₀, b₁ are linear combinations of yi
    - **BLUE:** Best Linear Unbiased Estimators

*   **Variance Estimation:**
    ```
    σ̂² = MSE = SSE/(n-2) = (Syy - b₁Sxy)/(n-2)
    
    Why n-2? Lost 2 degrees of freedom estimating b₀, b₁
    ```

*   **Fuel Data Example:**
    ```
    Given: n = 20, x̄ = 1.20, ȳ = 92.16
           Sxx = 0.68, Sxy = 10.18, Syy = 173.38
    
    Calculate:
    b₁ = 10.18/0.68 = 14.95
    b₀ = 92.16 - 14.95(1.20) = 74.28
    
    Regression line: ŷ = 74.28 + 14.95x
    
    σ̂² = (173.38 - 14.95×10.18)/18 = 1.18
    ```

*   **Connection Forward:**
    - "Next: Is this relationship statistically significant?"
    - "How confident are we in these estimates?"
    - "Can we make predictions?"

---

**Reference Implementation:** This component will combine interactive line fitting similar to curve-fitting tools with the mathematical rigor of statistical demonstrations.