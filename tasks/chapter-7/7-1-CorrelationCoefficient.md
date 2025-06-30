# Plan: 7.1 - Coefficient of Correlation

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
    *   **Visual Design:** `/src/components/shared/CLTSimulation.jsx`
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

**Component Type:** Guided Discovery Experience

**Guiding Philosophy:** This component introduces correlation as a measure of linear association strength. Users will discover that correlation captures linear relationships but can miss non-linear patterns.

---

### 1. Core Question

*   "How can we measure the strength of a linear relationship between two variables?"

---

### 2. Interactive Exploration

*   **Part A: Building Intuition with Scatter Plots**
    *   **Interactive Scatter Plot:**
        - Start with fuel data (n = 20 points)
        - Display real-time correlation coefficient ρ
        - Allow user to drag individual points
        - Color-code points: blue for typical, red when dragged
        - Show how moving points affects ρ
    
    *   **Key Observations Panel:**
        - "Current ρ = 0.937"
        - "Strength: Very Strong Positive"
        - Visual indicator: |————●———| (-1 to +1 scale)

*   **Part B: The Correlation Spectrum**
    *   **Gallery of Relationships:**
        | Dataset | Scatter Plot | ρ value | Interpretation |
        |---------|-------------|---------|----------------|
        | Perfect Positive | Points on line ↗ | +1.00 | Exact linear |
        | Strong Positive | Tight cloud ↗ | +0.85 | Clear trend |
        | Moderate | Loose cloud ↗ | +0.50 | Some association |
        | None | Random scatter | 0.00 | No linear pattern |
        | Strong Negative | Tight cloud ↘ | -0.85 | Inverse trend |
        | Perfect Negative | Points on line ↘ | -1.00 | Exact inverse |
    
    *   **Interactive Feature:** Click any plot to load it into main explorer

*   **Part C: Understanding the Formula**
    *   **Visual Decomposition:**
        ```
        ρ = Σ(x - x̄)(y - ȳ) / √[Σ(x - x̄)² × Σ(y - ȳ)²]
        ```
    
    *   **Step-by-Step Calculation:**
        1. Show deviations from means: (x - x̄), (y - ȳ)
        2. Highlight products: positive (blue) vs negative (red)
        3. Animate summation process
        4. Show standardization by standard deviations
    
    *   **Interactive Calculator:**
        - Input your own data (up to 10 points)
        - See calculation unfold step-by-step
        - Compare manual vs formula result

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Key Insight 1: Correlation ≠ Causation**
    *   **Example Gallery:**
        - Ice cream sales vs drownings (ρ = 0.82)
        - Number of firefighters vs damage (ρ = 0.91)
        - Shoe size vs reading ability in children (ρ = 0.78)
    *   **Hidden Variable Reveal:** Temperature, fire size, age
    
*   **Key Insight 2: Non-linear Relationships**
    *   **Interactive Demo:**
        - Perfect parabola: y = x², ρ ≈ 0
        - Perfect circle: x² + y² = 1, ρ = 0
        - Exponential: y = eˣ, ρ = 0.65 (misleading!)
    *   **Message:** "ρ only measures LINEAR association"

*   **Key Insight 3: Sensitivity to Outliers**
    *   **Outlier Explorer:**
        - Dataset with ρ = 0.3
        - Add one outlier → ρ jumps to 0.8
        - Remove outlier → back to 0.3
    *   **Lesson:** "Single points can dramatically affect ρ"

---

### 4. Connect to Rigor

*   **Formal Definition:**
    ```
    Sample Correlation Coefficient:
    ρXY = Sxy / √(Sxx × Syy)
    
    where:
    Sxy = Σ(xi - x̄)(yi - ȳ) = Σxiyi - nx̄ȳ
    Sxx = Σ(xi - x̄)² = Σxi² - nx̄²
    Syy = Σ(yi - ȳ)² = Σyi² - nȳ²
    ```

*   **Properties of ρ:**
    1. **Range:** -1 ≤ ρ ≤ 1 always
    2. **Symmetry:** ρXY = ρYX
    3. **Scale Invariant:** Linear transformations don't change ρ
    4. **Unit Free:** No units, pure number
    
*   **Interpretation Guidelines:**
    | |ρ| Range | Strength |
    |----------|----------|
    | 0.8 - 1.0 | Very strong |
    | 0.6 - 0.8 | Strong |
    | 0.4 - 0.6 | Moderate |
    | 0.2 - 0.4 | Weak |
    | 0.0 - 0.2 | Very weak |

*   **Connection to Regression:**
    - Preview: "ρ² will become R² (coefficient of determination)"
    - Slope formula uses ρ: b₁ = ρ × (sy/sx)

*   **Computational Example:**
    ```
    Fuel Data:
    Sxy = 10.18, Sxx = 0.68, Syy = 173.38
    ρ = 10.18 / √(0.68 × 173.38) = 0.937
    ```

---

**Reference Implementation:** This component will combine interactive scatter plots similar to regression visualizations with the calculation transparency of statistical components.