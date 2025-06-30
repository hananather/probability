# Plan: 7.2 - Simple Linear Regression (Improved)

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
    *   **Pedagogy & Interaction:** `/src/components/03-random-variables-expectation/` (for optimization concepts)
    *   **Visual Design:** Error visualization patterns from hypothesis testing
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

**Component Type:** Guided Discovery Experience

**Guiding Philosophy:** This component reveals how least squares finds the optimal line through animated demonstrations of different line fits and their errors.

---

### 1. Core Question

*   "What makes one line through our data 'better' than another?"

---

### 2. Interactive Exploration

*   **Part A: The Line Selection Challenge**
    
    *   **Animated Line Comparison:**
        ```
        Comparing Different Lines:
        
        Line A: ŷ = 80 + 10x     Line B: ŷ = 74.28 + 14.95x     Line C: ŷ = 70 + 20x
        ┌─────────────┐          ┌─────────────┐               ┌─────────────┐
        │    • |      │          │    •        │               │    • /      │
        │  • | •      │          │  •   •      │               │  • / •      │
        │• | •   •    │          │•   •   •    │               │•/•     •    │
        └─────────────┘          └─────────────┘               └─────────────┘
        SSE = 142.7              SSE = 21.24                   SSE = 98.3
        Too flat!                Just right!                   Too steep!
        ```
    
    *   **Animation Controls:**
        - Button: "Compare Lines" 
        - Shows each line for 2s
        - Highlights residuals
        - Displays SSE prominently

    *   **Key Discovery:** "The best line minimizes the sum of squared vertical distances"

*   **Part B: Why Squared Errors?**
    
    *   **Progressive Explanation:**
        ```
        Step 1: Show Individual Errors
        Point 1: error = 2.3
        Point 2: error = -1.7
        Point 3: error = 0.9
        ...
        Sum = 0 (errors cancel!)
        
        Step 2: Try Absolute Values
        |2.3| + |-1.7| + |0.9| = 4.9
        ✗ Not differentiable at 0
        
        Step 3: Use Squares
        2.3² + (-1.7)² + 0.9² = 8.95
        ✓ Always positive
        ✓ Differentiable everywhere
        ✓ Emphasizes large errors
        ```
    
    *   **Visual Comparison:**
        - Animate squaring process
        - Show area representation
        - Highlight mathematical advantages

*   **Part C: Finding the Minimum**
    
    *   **Optimization Visualization:**
        ```
        SSE as a Function of Slope:
        
        SSE
         ↑
        200│     ╱╲
        150│   ╱    ╲
        100│ ╱        ╲___
         50│╱              ╲___
          0└────────────────────→
            10   12   14.95  18  b₁
                       ↑
                    Minimum!
        ```
    
    *   **Animated Discovery:**
        - Start with b₁ = 10
        - Smoothly increase to 20
        - Show SSE changing
        - Pause at minimum (14.95)
        - "This is where calculus helps!"

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Key Insight 1: The Centroid Property**
    
    *   **Visual Demonstration:**
        ```
        Every regression line passes through (x̄, ȳ)
        
        ┌─────────────────────┐
        │         •           │
        │       •   •         │  Try any slope...
        │     •  ⊕  •         │  The line always goes
        │   •   •   •         │  through the center!
        │ •   •               │  
        └─────────────────────┘
              (x̄, ȳ)
        ```
    
    *   **Interactive Demo:**
        - Rotate line around centroid
        - SSE changes, but always passes through (x̄, ȳ)

*   **Key Insight 2: Residuals Sum to Zero**
    
    *   **Residual Balance:**
        ```
        Positive residuals: +███████ = +12.7
        Negative residuals: -███████ = -12.7
        Total:                      = 0.0
        
        "The errors balance out!"
        ```

*   **Key Insight 3: The Least Squares Formulas**
    
    *   **Formula Derivation Flow:**
        ```
        1. Minimize: SSE = Σ(yi - b₀ - b₁xi)²
                          ↓
        2. Take derivatives and set to 0
                          ↓
        3. Solve the system:
           b₁ = Sxy/Sxx
           b₀ = ȳ - b₁x̄
                          ↓
        4. For our data:
           b₁ = 10.18/0.68 = 14.95
           b₀ = 92.16 - 14.95(1.20) = 74.28
        ```

---

### 4. Connect to Rigor

*   **The Linear Model:**
    ```
    Model: Y = β₀ + β₁X + ε
    
    where:
    • β₀ = true intercept (unknown)
    • β₁ = true slope (unknown)
    • ε = random error
    • E[ε] = 0, Var[ε] = σ²
    ```

*   **Least Squares Estimators:**
    ```
    Minimize: Q = Σ(yi - b₀ - b₁xi)²
    
    Solution:
    b₁ = Sxy/Sxx = Σ(xi - x̄)(yi - ȳ)/Σ(xi - x̄)²
    b₀ = ȳ - b₁x̄
    
    Computational formulas:
    Sxy = Σxiyi - nx̄ȳ
    Sxx = Σxi² - nx̄²
    ```

*   **Properties of the Estimators:**
    
    *   **Unbiased:** 
        - E[b₀] = β₀
        - E[b₁] = β₁
    
    *   **Minimum Variance:**
        - Among all linear unbiased estimators
        - Gauss-Markov Theorem
    
    *   **Linear in Y:**
        - b₁ = Σ[(xi - x̄)/Sxx]yi

*   **Fuel Data Application:**
    ```
    Step-by-Step Calculation:
    
    1. Given summaries:
       n = 20, Σxi = 24.0, Σyi = 1843.2
       Σxi² = 29.66, Σxiyi = 2216.58, Σyi² = 173275.18
    
    2. Calculate means:
       x̄ = 24.0/20 = 1.20
       ȳ = 1843.2/20 = 92.16
    
    3. Calculate Sxx, Sxy:
       Sxx = 29.66 - 20(1.20)² = 0.68
       Sxy = 2216.58 - 20(1.20)(92.16) = 10.18
    
    4. Find coefficients:
       b₁ = 10.18/0.68 = 14.95
       b₀ = 92.16 - 14.95(1.20) = 74.28
    
    5. Regression equation:
       ŷ = 74.28 + 14.95x
    ```

*   **Interpreting the Coefficients:**
    ```
    b₀ = 74.28: Predicted purity when hydrocarbon = 0%
                (Extrapolation - use with caution!)
    
    b₁ = 14.95: For each 1% increase in hydrocarbon,
                purity increases by 14.95 units on average
    ```

*   **Residual Analysis Preview:**
    ```
    Residual = Observed - Predicted = yi - ŷi
    
    Good model checklist:
    ✓ Residuals scatter randomly around 0
    ✓ No patterns in residual plot
    ✓ Roughly constant variance
    ✓ Approximately normal distribution
    ```

---

### 5. Implementation Notes

**Animation Choreography:**
- Line comparison: 6s total (2s per line)
- SSE minimization: 4s smooth animation
- Centroid rotation: 3s full rotation
- Use `requestAnimationFrame` for smoothness

**Visual Design:**
- Data points: Blue (#2563eb)
- Current line: Black (#000000)
- Residuals: Red (#ef4444) 
- Optimal line: Green (#10b981)
- SSE display: Large, `font-mono`

**Performance:**
- Pre-calculate all line positions
- Cache SSE calculations
- Limit to 20 data points
- Use CSS transforms for line rotation

**User Flow:**
1. See multiple lines compared → Understand SSE concept
2. Learn why squared errors → Accept the method
3. Watch optimization → Discover minimum
4. See formulas emerge → Connect to calculation
5. Apply to fuel data → Concrete understanding

---

**Reference Implementation:** This component uses controlled animations similar to expectation components, with optimization visualization inspired by distribution parameter exploration.