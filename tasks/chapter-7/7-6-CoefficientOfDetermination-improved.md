# Plan: 7.6 - Coefficient of Determination (Improved)

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
    *   **Pedagogy & Interaction:** `/src/components/01-introduction-to-probabilities/` (percentage visualizations)
    *   **Visual Design:** Proportion and percentage displays
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

**Component Type:** Guided Discovery Experience

**Guiding Philosophy:** This component leads with Anscombe's Quartet to immediately demonstrate R²'s limitations before diving into its proper interpretation.

---

### 1. Core Question

*   "If R² = 0.67 for four different datasets, does that mean they're all equally good models?"

---

### 2. Interactive Exploration

*   **Part A: Anscombe's Quartet - The Hook**
    
    *   **Four Identical Statistics, Four Different Stories:**
        ```
        All four datasets have EXACTLY:
        • R² = 0.67
        • ŷ = 3.0 + 0.5x
        • Same means, variances, correlation
        
        Dataset 1: Linear          Dataset 2: Quadratic
        ┌──────────────┐          ┌──────────────┐
        │    •    •    │          │      •••     │
        │  •    •      │          │    •     •   │
        │•    •        │          │  •         • │
        └──────────────┘          └──────────────┘
        Good model ✓              Wrong model ✗
        
        Dataset 3: Outlier         Dataset 4: Leverage
        ┌──────────────┐          ┌──────────────┐
        │    •••••     │          │ ••••••••••  •│
        │              │          │              │
        │           •  │          │              │
        └──────────────┘          └──────────────┘
        Outlier influence ✗       One point drives all ✗
        ```
    
    *   **Interactive Controls:**
        - Button: "Cycle Through Datasets"
        - Smooth morphing between datasets
        - Highlight: Same R², different patterns!

    *   **The Lesson:** "R² alone can be misleading!"

*   **Part B: Understanding R² Visually**
    
    *   **Stacked Bar Visualization:**
        ```
        Total Variation in Y (100%)
        ┌─────────────────────────────────────┐
        │████████████████████████████░░░░░░░░│
        │         87.7%              12.3%    │
        │    Explained by X       Unexplained │
        │        (R²)              (1-R²)     │
        └─────────────────────────────────────┘
        
        R² = 0.877 for fuel quality data
        ```
    
    *   **Interactive Demo:**
        - Slider: "Adjust model quality"
        - Watch bar proportions change
        - Show interpretation text

*   **Part C: Three Ways to Calculate R²**
    
    *   **Formula Equivalence:**
        ```
        Method 1: Proportion Explained
        R² = SSR/SST = 152.14/173.38 = 0.877 ✓
        
        Method 2: Proportion Unexplained  
        R² = 1 - SSE/SST = 1 - 21.24/173.38 = 0.877 ✓
        
        Method 3: Correlation Squared
        R² = r² = (0.937)² = 0.877 ✓
        
        All give the same answer!
        ```
    
    *   **Calculator Tool:**
        - Input any two of: SST, SSR, SSE, r
        - Calculate R² three ways
        - Verify equivalence

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Key Insight 1: Context Matters**
    
    *   **Field-Specific Expectations:**
        ```
        What's a "Good" R²?
        
        Physics Lab:
        ░░░░░░░░░░░░░░░░░░░█ R² = 0.95
        "Needs improvement - check equipment"
        
        Engineering:
        ░░░░░░░░░░░░░░░░████ R² = 0.80
        "Acceptable for this application"
        
        Social Sciences:
        ░░░░░██████████████ R² = 0.30
        "Excellent! Publish this!"
        
        Context is everything!
        ```

*   **Key Insight 2: What R² Doesn't Tell You**
    
    *   **R² is Blind To:**
        ```
        1. Non-linearity
           High R² but wrong model shape
        
        2. Outlier Influence  
           One point can inflate R²
        
        3. Extrapolation Risk
           R² says nothing outside data range
        
        4. Causation
           R² ≠ X causes Y
        ```
    
    *   **Visual Examples:** Show each limitation

*   **Key Insight 3: R² Always Increases**
    
    *   **Adding Variables Demo:**
        ```
        Simple Model: Y ~ X
        R² = 0.877
        
        Add Random Noise Variable: Y ~ X + Noise
        R² = 0.878 (increased!)
        
        Add More Noise: Y ~ X + Noise1 + Noise2
        R² = 0.879 (increased again!)
        
        "More complex ≠ Better model"
        (That's why we need adjusted R² for multiple regression)
        ```

---

### 4. Connect to Rigor

*   **Formal Definition:**
    ```
    R² = Coefficient of Determination
    
    Definition: Proportion of variance in Y 
                explained by the regression model
    
    R² = SSR/SST = 1 - SSE/SST
    
    Range: 0 ≤ R² ≤ 1
    • R² = 0: No linear relationship
    • R² = 1: Perfect linear fit
    ```

*   **Properties:**
    ```
    1. For simple linear regression:
       R² = r² (correlation squared)
    
    2. Interpretation:
       "R² × 100% of the variation in Y 
        is explained by the linear relationship with X"
    
    3. Limitation:
       R² always increases when adding predictors
       (even useless ones!)
    ```

*   **Fuel Data Summary:**
    ```
    Our Complete Regression Analysis:
    
    • Correlation: r = 0.937
    • Regression: ŷ = 74.28 + 14.95x
    • Significance: p < 0.001
    • 95% CI for β₁: [12.18, 17.72]
    • ANOVA: F = 128.9
    • R² = 0.877
    
    Interpretation:
    "87.7% of the variation in fuel purity 
     is explained by hydrocarbon level"
    ```

*   **Best Practices for Using R²:**
    ```
    Always Check:
    ✓ Scatter plot - Is relationship linear?
    ✓ Residual plot - Random pattern?
    ✓ Normal Q-Q plot - Residuals normal?
    ✓ Influence measures - Any outliers?
    
    Never:
    ✗ Rely on R² alone
    ✗ Compare R² across different Y variables
    ✗ Use R² for non-linear relationships
    ✗ Assume high R² means good predictions
    ```

*   **The Complete Picture:**
    ```
    Good Regression Model =
        ✓ Significant relationship (p < α)
        ✓ Reasonable R² for the field
        ✓ Random residual pattern
        ✓ No influential outliers
        ✓ Makes sense scientifically
        ✓ Validated on new data
    ```

*   **Chapter Summary:**
    ```
    Your Regression Toolkit:
    1. Correlation (r) - Measure strength
    2. Regression (b₀, b₁) - Find best line  
    3. Testing (t, F) - Check significance
    4. Intervals (CI, PI) - Quantify uncertainty
    5. ANOVA - Decompose variation
    6. R² - Assess model quality
    
    You now have all the tools for 
    simple linear regression analysis!
    ```

---

### 5. Implementation Notes

**Opening Impact:**
- Lead with Anscombe's Quartet animation
- 4s total: 1s per dataset
- Emphasize same R², different patterns
- Hook user immediately

**Visual Design:**
- Stacked bars over pie charts (more accurate)
- Consistent color scheme:
  - Explained: Blue (#3b82f6)
  - Unexplained: Gray (#e5e7eb)
  - Warning: Orange (#f59e0b)
  - Error: Red (#ef4444)

**Animation Details:**
- Smooth morphing between datasets
- Bar transitions with easing
- Total animation time < 5s
- No jarring movements

**Interactive Elements:**
1. **Dataset Cycler:** Anscombe's Quartet
2. **R² Slider:** 0 to 1 with interpretations
3. **Variable Adder:** Show R² inflation
4. **Field Selector:** Context-specific interpretations

**Progressive Disclosure:**
1. Hook with Anscombe → R² isn't everything
2. Explain what R² measures → Proportion concept
3. Show calculation methods → Mathematical understanding
4. Demonstrate limitations → Critical thinking
5. Provide best practices → Practical application

---

**Reference Implementation:** This component combines the visual impact of probability demonstrations with the mathematical clarity of ANOVA decomposition, creating a memorable learning experience about R²'s proper use and limitations.