# Plan: 7.6 - Coefficient of Determination

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
    *   **Visual Design:** Percentage and proportion visualizations
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

**Component Type:** Guided Discovery Experience

**Guiding Philosophy:** This component reveals R² as a measure of model quality while exposing its limitations. Users will discover that high R² doesn't guarantee a good model.

---

### 1. Core Question

*   "What percentage of Y's variation does our regression model explain, and what does this really tell us about model quality?"

---

### 2. Interactive Exploration

*   **Part A: R² as a Visual Proportion**
    *   **Pie Chart Visualization:**
        ```
        Total Variation in Y (100%)
        ┌─────────────────────────┐
        │ ████████████████ 87.7% │ ← Explained by Model (R²)
        │ ███ 12.3%              │ ← Unexplained (1-R²)
        └─────────────────────────┘
        ```
    
    *   **Interactive Features:**
        - Adjust data points
        - Watch R² change in real-time
        - See pie chart update dynamically

*   **Part B: The R² Formula Explorer**
    *   **Three Equivalent Formulas:**
        ```
        1. R² = SSR/SST = Explained/Total
        
        2. R² = 1 - SSE/SST = 1 - Unexplained/Total
        
        3. R² = ρ² (correlation squared)
           [For simple linear regression only!]
        ```
    
    *   **Calculator:**
        - Input: SSR, SSE, SST
        - Or input: ρ
        - Show all three calculations match

*   **Part C: Anscombe's Quartet - When R² Lies**
    *   **Four Datasets, Same R² = 0.67:**
        ```
        Dataset 1: Perfect linear relationship
        Dataset 2: Perfect quadratic, wrong model
        Dataset 3: Perfect linear with one outlier
        Dataset 4: Vertical line with one leverage point
        ```
    
    *   **Interactive Feature:**
        - Toggle between datasets
        - Same regression line equation
        - Same R² value
        - Vastly different patterns!
    
    *   **Residual Plots:** Show how residuals reveal the truth

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Key Insight 1: R² Range and Interpretation**
    *   **Scale Visualization:**
        ```
        R² = 0.0  ████ No linear relationship
        R² = 0.3  ████████ Weak relationship  
        R² = 0.5  ████████████ Moderate
        R² = 0.7  ████████████████ Strong
        R² = 0.9  ████████████████████ Very strong
        R² = 1.0  ████████████████████████ Perfect
        ```
    
    *   **Context Matters:**
        - Physics: R² < 0.95 might be poor
        - Social Sciences: R² > 0.30 might be excellent
        - "Good R² depends on your field!"

*   **Key Insight 2: What R² Doesn't Tell You**
    *   **R² is Blind To:**
        - Non-linearity (quadratic patterns)
        - Outliers' influence
        - Heteroscedasticity
        - Model appropriateness
    
    *   **Visual Demo:** High R² with terrible residual pattern

*   **Key Insight 3: R² Always Increases**
    *   **Adding Variables Demo:**
        - Start with simple model
        - Add useless variable (random noise)
        - R² goes up!
        - "More complex ≠ better"
    
    *   **Preview:** "That's why we need adjusted R² for multiple regression"

---

### 4. Connect to Rigor

*   **Definition and Properties:**
    ```
    R² = 1 - SSE/SST = SSR/SST
    
    Properties:
    1. 0 ≤ R² ≤ 1 always
    2. R² = 0: No linear relationship
    3. R² = 1: Perfect linear fit
    4. R² = ρ² for simple linear regression
    ```

*   **Interpretation Guidelines:**
    ```
    "R² is the proportion of variance in Y 
     explained by the linear relationship with X"
    
    Example: R² = 0.877 means:
    - 87.7% of variation in Y is explained by X
    - 12.3% remains unexplained
    ```

*   **Fuel Data Summary:**
    ```
    Correlation: ρ = 0.937
    R² = (0.937)² = 0.877
    
    Verification via ANOVA:
    R² = SSR/SST = 152.14/173.38 = 0.877 ✓
    ```

*   **Limitations of R²:**
    1. **Non-linearity:** Can miss curved relationships
    2. **Outliers:** One point can inflate R²
    3. **Scale Dependent:** Not comparable across different Y variables
    4. **Sample Size:** Small n can give misleading R²

*   **Best Practices:**
    ```
    Always examine:
    1. Scatter plot - Is relationship linear?
    2. Residual plot - Random pattern?
    3. Influence diagnostics - Outliers?
    4. Context - What's typical R² in this field?
    
    Never rely on R² alone!
    ```

*   **The Complete Regression Toolkit:**
    ```
    Good Model = High R² 
               + Random Residuals 
               + Significant F-test
               + Reasonable Predictions
               + Subject Matter Sense
    ```

*   **Connection to Course Flow:**
    - Chapter 7.1: Measured correlation (ρ)
    - Chapter 7.2: Found best line (b₀, b₁)
    - Chapter 7.3: Tested significance (t, F tests)
    - Chapter 7.4: Built intervals (CI, PI)
    - Chapter 7.5: Decomposed variation (ANOVA)
    - Chapter 7.6: Summarized quality (R²)
    
    "You now have the complete toolkit for simple linear regression!"

---

**Reference Implementation:** This component will combine proportion visualizations with cautionary examples showing R²'s limitations.