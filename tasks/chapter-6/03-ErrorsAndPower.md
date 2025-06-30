
# Plan: 6.3 - Errors & Power

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

**Guiding Philosophy:** This is one of the most critical and often misunderstood topics. This component must visually and interactively demonstrate the inherent trade-off between Type I and Type II errors, and how sample size and effect size influence the power of a test.

---

### 1. Core Question

*   "A cement manufacturer's new process claims mean strength μ = 5000 kg/cm². We test batches to verify this claim. What errors can we make, and how do we balance them?"

---

### 2. Interactive Exploration

*   **Part A: The Cement Testing Scenario**
    *   **Context:** 
        - H₀: μ = 5000 (process meets specifications)
        - H₁: μ < 5000 (process produces weaker cement)
        - Population σ = 120, sample size n = 49
        - Critical region: X̄ < 4970
    
    *   **Interactive Visualization:**
        - Two overlapping normal distributions:
          - Blue: Sampling distribution under H₀ (μ = 5000, σ/√n = 120/7)
          - Red: Sampling distribution under H₁ (adjustable μ₁)
        - Vertical line at X̄ = 4970 (critical value)
        - Shaded regions showing α and β
    
    *   **Key Calculations:**
        - α = P(X̄ < 4970 | μ = 5000) = 0.0401
        - β changes as user adjusts true mean μ₁

*   **Part B: Exploring the Error Trade-off**
    *   **Three Interactive Sliders:**
        1. **Critical Value:** Move between 4960 and 4990
           - Shows how α and β change inversely
        2. **True Mean (μ₁):** Range from 4950 to 5000
           - When μ₁ = 4990: β ≈ 0.879
           - When μ₁ = 4950: β ≈ 0.121
        3. **Sample Size (n):** Range from 25 to 100
           - Shows distributions getting narrower
           - Both α and β improve simultaneously

*   **Part C: Power Curves**
    *   **Dynamic Power Curve:** Shows Power = 1 - β as function of μ₁
    *   **Multiple Curves:** Compare power for different sample sizes
    *   **Key Insight:** Steeper curves = better test discrimination

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Decision Matrix Visualization:**
    | Reality | Reject H₀ | Fail to Reject H₀ |
    |---------|-----------|-------------------|
    | H₀ True | Type I Error (α) | ✓ Correct |
    | H₀ False | ✓ Correct (Power) | Type II Error (β) |

*   **Key Realizations:**
    1. "We control α directly by choosing the critical value"
    2. "β depends on the unknown true parameter value"
    3. "Increasing sample size is the 'free lunch' - improves both errors"
    4. "Conventional values: α = 0.05, β = 0.2, Power = 0.8"

*   **Practical Implications:**
    - Type I Error: Rejecting good cement batches (economic loss)
    - Type II Error: Accepting weak cement (safety risk)
    - "Which error is worse depends on consequences!"

---

### 4. Connect to Rigor

*   **Formal Definitions:**
    - α = P(reject H₀ | H₀ is true) = P(Type I Error)
    - β = P(fail to reject H₀ | H₀ is false) = P(Type II Error)
    - Power = P(reject H₀ | H₀ is false) = 1 - β

*   **Factors Affecting Power:**
    1. **Significance Level (α):** Higher α → Higher Power
    2. **Effect Size (|μ₁ - μ₀|/σ):** Larger effect → Higher Power
    3. **Sample Size (n):** Larger n → Higher Power
    4. **Population Variance (σ²):** Smaller σ² → Higher Power

*   **Operating Characteristic Curves:**
    - OC Curve: Plot of β vs. true parameter value
    - Power Curve: Plot of (1-β) vs. true parameter value
    - "Ideal test has steep power curve centered at μ₀"

*   **Sample Size Determination:**
    - Formula: n ≈ ((z_α + z_β)σ / (μ₀ - μ₁))²
    - "Choose n to achieve desired α and β"

---

**Reference Implementation:** This will be a new, highly interactive component, but it will draw inspiration from the dual-visualization style of components like the `DistributionComparison.jsx`.
