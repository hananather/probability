# Plan: 7.5 - Analysis of Variance (Improved)

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
    *   **Pedagogy & Interaction:** Component decomposition patterns
    *   **Visual Design:** Variance visualization from earlier chapters
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

**Component Type:** Guided Discovery Experience

**Guiding Philosophy:** This component reveals variation decomposition through clear, progressive visualizations rather than cluttered simultaneous arrows.

---

### 1. Core Question

*   "Where does all the variation in Y come from, and how much does our regression model explain?"

---

### 2. Interactive Exploration

*   **Part A: The Variation Story**
    
    *   **Progressive Decomposition:**
        ```
        Step 1: Total Variation
        ┌─────────────────────────┐
        │         •               │   Each point varies
        │       •   •             │   from the mean ȳ
        │     •   ȳ   •           │   
        │   •   ────────          │   Total: How spread
        │ •   •                   │   out is Y?
        └─────────────────────────┘
        
        Step 2: Add Regression Line
        ┌─────────────────────────┐
        │         • ╱             │   Now we have
        │       • ╱ •             │   predictions ŷᵢ
        │     • ╱ȳ   •            │   
        │   • ╱──────             │   
        │ • ╱•                    │
        └─────────────────────────┘
        
        Step 3: Show Decomposition
        Total = Explained + Unexplained
        (yᵢ-ȳ) = (ŷᵢ-ȳ) + (yᵢ-ŷᵢ)
        ```
    
    *   **Animation Controls:**
        - Button: "Next Step" 
        - Progressive reveal (3 steps)
        - Clean transitions between views

*   **Part B: Visual Decomposition for One Point**
    
    *   **Focused Single-Point Analysis:**
        ```
        Select a point to explore:
        
        Point i: (xᵢ = 1.29, yᵢ = 93.7)
        
        ┌─────────────────────────────────┐
        │                                 │
        │              • yᵢ = 93.7        │
        │              |                  │
        │              | } (yᵢ - ŷᵢ)      │
        │              |   = 0.44         │
        │              ● ŷᵢ = 93.26       │
        │              |                  │
        │              | } (ŷᵢ - ȳ)       │
        │              |   = 1.10         │
        │   ───────────○─────────── ȳ=92.16
        │              |                  │
        │              | } (yᵢ - ȳ)       │
        │                 = 1.54          │
        └─────────────────────────────────┘
        
        Total = Regression + Error
        1.54  =    1.10    + 0.44
        ```
    
    *   **Interactive Elements:**
        - Click points to see decomposition
        - Smooth highlighting
        - Clear value display

*   **Part C: Building the Sum of Squares**
    
    *   **Accumulation Visualization:**
        ```
        Building SST, SSR, and SSE:
        
        Point  │ (yᵢ-ȳ)² │ (ŷᵢ-ȳ)² │ (yᵢ-ŷᵢ)²
        ───────┼─────────┼─────────┼──────────
        1      │  4.41   │  3.92   │  0.49
        2      │  7.29   │  6.86   │  0.43
        ...    │  ...    │  ...    │  ...
        20     │  1.96   │  1.44   │  0.52
        ───────┼─────────┼─────────┼──────────
        Total: │ 173.38  │ 152.14  │  21.24
               │  (SST)  │  (SSR)  │  (SSE)
        
        Percentage Breakdown:
        ████████████████████ 87.7% Explained
        ████ 12.3% Unexplained
        ```
    
    *   **Animation:**
        - Rows appear progressively
        - Running totals update
        - Final percentages reveal

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Key Insight 1: The Fundamental Identity**
    
    *   **Visual Proof:**
        ```
        For EVERY data point:
        Total² = Explained² + Error²
        
        Why? Regression and errors are perpendicular!
        
        ┌─────────────┐
        │      /|     │  Like a right triangle:
        │     / |     │  
        │    /  |90°  │  Hypotenuse² = Base² + Height²
        │   /   |     │  
        │  /    |     │  (Pythagorean theorem in statistics!)
        └─────────────┘
        ```

*   **Key Insight 2: ANOVA Table Construction**
    
    *   **Interactive Table Builder:**
        ```
        Click to fill in the ANOVA table:
        
        Source     │ SS     │ df  │ MS     │ F
        ───────────┼────────┼─────┼────────┼────────
        Regression │ 152.14 │ [1] │ [?]    │ [?]
        Error      │ 21.24  │ [?] │ [?]    │ 
        ───────────┼────────┼─────┼────────┼
        Total      │ 173.38 │ [19]│        │
        
        Hints:
        • Regression df = number of predictors
        • Error df = n - 2
        • MS = SS/df
        • F = MSR/MSE
        ```

*   **Key Insight 3: F = t²**
    
    *   **Connection Demo:**
        ```
        From Section 7.3:
        t-statistic for slope = 11.35
        t² = (11.35)² = 128.9
        
        From ANOVA:
        F = MSR/MSE = 152.14/1.18 = 128.9
        
        Exactly the same! 
        Two views of one test!
        ```

---

### 4. Connect to Rigor

*   **The Variation Decomposition:**
    ```
    Fundamental Identity:
    Σ(yᵢ - ȳ)² = Σ(ŷᵢ - ȳ)² + Σ(yᵢ - ŷᵢ)²
       SST     =    SSR     +    SSE
    
    where:
    • SST = Total Sum of Squares
    • SSR = Regression Sum of Squares  
    • SSE = Error Sum of Squares
    ```

*   **Degrees of Freedom:**
    ```
    Total df = n - 1 = 19
    └─ Lost 1 for estimating ȳ
    
    Regression df = 1
    └─ One slope parameter
    
    Error df = n - 2 = 18
    └─ Lost 2 for estimating b₀ and b₁
    
    Check: 1 + 18 = 19 ✓
    ```

*   **ANOVA Table for Fuel Data:**
    ```
    Source      | SS     | df | MS     | F     | p-value
    ────────────┼────────┼────┼────────┼───────┼─────────
    Regression  | 152.14 | 1  | 152.14 | 128.9 | 1.23e-09
    Error       | 21.24  | 18 | 1.18   |       |
    ────────────┼────────┼────┼────────┼───────┼
    Total       | 173.38 | 19 |        |       |
    
    Calculations:
    MSR = 152.14/1 = 152.14
    MSE = 21.24/18 = 1.18
    F = 152.14/1.18 = 128.9
    ```

*   **Mean Square Interpretations:**
    ```
    MSR = 152.14
    "Average variation explained per regression df"
    
    MSE = 1.18 = σ̂²
    "Average unexplained variation per error df"
    "Also our estimate of σ²!"
    ```

*   **Computing Sum of Squares:**
    ```
    Method 1 (Definition):
    SST = Σ(yᵢ - ȳ)² = 173.38
    SSE = Σ(yᵢ - ŷᵢ)² = 21.24
    SSR = SST - SSE = 152.14
    
    Method 2 (Shortcut):
    SSR = b₁ × Sxy = 14.95 × 10.18 = 152.14
    SSE = Syy - b₁ × Sxy = 173.38 - 152.14 = 21.24
    ```

*   **Connection to R²:**
    ```
    R² = SSR/SST = 152.14/173.38 = 0.877
    
    "87.7% of variation in Y is explained by X"
    
    Preview: Next section explores R² in depth!
    ```

---

### 5. Implementation Notes

**Visual Design Strategy:**
- Avoid simultaneous arrows (too cluttered)
- Use progressive reveal instead
- One concept at a time
- Clear color coding throughout

**Color Scheme:**
- Total variation: Purple (#8b5cf6)
- Explained (SSR): Blue (#3b82f6)
- Unexplained (SSE): Red (#ef4444)
- Mean line: Gray (#6b7280)
- Selected point: Orange (#f59e0b)

**Animation Choreography:**
1. Total variation reveal: 2s
2. Add regression line: 1.5s
3. Show decomposition: 2s
4. Point selection: 0.3s transition
5. Table building: Progressive fill

**Performance Optimization:**
- Pre-calculate all decompositions
- Use CSS transforms for animations
- Debounce point selection (100ms)
- Maximum 20 points displayed

**User Flow:**
1. See total variation concept
2. Add regression to split variation
3. Explore individual points
4. Build sum of squares
5. Complete ANOVA table
6. Connect to previous concepts

---

**Reference Implementation:** This component uses progressive reveal patterns similar to binomial distribution exploration, with clean variance visualizations inspired by descriptive statistics components.