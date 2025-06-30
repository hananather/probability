
# Plan: 6.5 - Test for a Mean (Unknown Variance)

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

**Guiding Philosophy:** This component introduces the t-test, a more realistic and common scenario. The key is to explain *why* we need the t-distribution when the population variance is unknown and how it differs from the normal distribution.

---

### 1. Core Question

*   "We observe reaction times from a normal population with unknown mean μ and variance. Can we test H₀: μ = 16.6 when we don't know σ?"

---

### 2. Interactive Exploration

*   **Part A: Why We Need the t-Distribution**
    *   **The Problem Setup:**
        - Sample data (n = 16):
          ```
          18.0, 17.4, 15.5, 16.8, 19.0, 17.8, 17.4, 15.8,
          17.9, 16.3, 16.9, 18.6, 17.7, 16.4, 18.2, 18.7
          ```
        - Calculate: x̄ = 17.4, s = 1.078
        - Test: H₀: μ = 16.6 vs H₁: μ > 16.6
    
    *   **Side-by-Side Comparison:**
        | If σ known (Z-test) | σ unknown (t-test) |
        |---------------------|-------------------|
        | Z = (X̄ - μ₀)/(σ/√n) | T = (X̄ - μ₀)/(S/√n) |
        | Z ~ N(0,1) | T ~ t(n-1) |
        | Use σ (parameter) | Use S (statistic) |
        
    *   **Key Insight Animation:**
        - Show how using S instead of σ adds variability
        - Animate: "S varies from sample to sample, creating extra uncertainty"

*   **Part B: Understanding Degrees of Freedom**
    *   **Visual Demonstration:**
        - Show n data points with constraint Σ(xᵢ - x̄) = 0
        - Animate: "Once we know n-1 deviations and x̄, the last one is determined"
        - Connection to S² = Σ(xᵢ - x̄)²/(n-1)
    
    *   **Interactive df Explorer:**
        - Slider for df: 1 to 30
        - Show t-distribution morphing
        - Display key insight: "df = n - 1 because we estimate μ with x̄"

*   **Part C: The t-Distribution Family**
    *   **Overlaid Distributions:**
        - Normal N(0,1) in grey (reference)
        - t(1) in red (very fat tails)
        - t(5) in orange (moderately fat)
        - t(15) in blue (close to normal)
        - t(30) in green (nearly normal)
    
    *   **Interactive Features:**
        - Hover to see probability values
        - Toggle to show/hide distributions
        - Zoom on tails to see differences

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Critical Values Comparison:**
    | α = 0.05 | One-tailed | Two-tailed |
    |----------|------------|------------|
    | Normal   | z = 1.645  | z = 1.960  |
    | t(15)    | t = 1.753  | t = 2.131  |
    | t(5)     | t = 2.015  | t = 2.571  |
    
*   **Test Calculation Walkthrough:**
    - t₀ = (17.4 - 16.6)/(1.078/√16) = 2.968
    - df = 16 - 1 = 15
    - From t-table: 2.947 < t₀ < 3.286
    - Therefore: 0.0025 < p-value < 0.005
    - Decision: Reject H₀ at α = 0.05

*   **Key Realizations:**
    1. "t-critical values > z-critical values (more conservative)"
    2. "As n increases, t-distribution → normal distribution"
    3. "Small samples require stronger evidence to reject H₀"

---

### 4. Connect to Rigor

*   **Complete t-Test Framework:**
    ```
    1. Check assumptions: Data approximately normal
    2. State hypotheses: H₀: μ = μ₀
    3. Calculate: t = (x̄ - μ₀)/(s/√n)
    4. Find df = n - 1
    5. Look up critical value or p-value
    6. Make decision based on α
    ```

*   **When t ≈ z (Rule of Thumb):**
    - n ≥ 30: t-distribution very close to normal
    - n ≥ 50: Practically identical
    - "But always use t when σ unknown for accuracy"

*   **T-Table Excerpt (Essential Values):**
    | df | t₀.₀₅ | t₀.₀₂₅ | t₀.₀₁ | t₀.₀₀₅ |
    |----|-------|---------|-------|---------|
    | 5  | 2.015 | 2.571   | 3.365 | 4.032   |
    | 10 | 1.812 | 2.228   | 2.764 | 3.169   |
    | 15 | 1.753 | 2.131   | 2.602 | 2.947   |
    | 20 | 1.725 | 2.086   | 2.528 | 2.845   |
    | 30 | 1.697 | 2.042   | 2.457 | 2.750   |
    | ∞  | 1.645 | 1.960   | 2.326 | 2.576   |

*   **Practical Note:** "Most real-world scenarios have unknown σ, making the t-test the workhorse of statistical inference"

---

**Reference Implementation:** `/src/components/04-descriptive-statistics-sampling/4-4-1-TDistributionExplorer.jsx` (This existing component can be enhanced and repurposed to fit this plan).
