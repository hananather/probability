
# Plan: 6.8 - Unpaired Two-Sample Test

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

**Guiding Philosophy:** This component addresses how to compare two independent groups. It will build on the t-test but introduce the concepts of the standard error of the difference between two means and the idea of pooled variance.

---

### 1. Core Question

*   "How do we compare means from two independent groups? The answer depends on what we know about their variances."

---

### 2. Interactive Exploration

*   **Part A: Decision Tree Navigator**
    *   **Interactive Flowchart:**
        ```
        Are population variances σ₁² and σ₂² known?
        ├─ Yes → Case 1: Z-test
        └─ No → Are variances assumed equal?
                ├─ Yes → Case 2: Pooled t-test
                └─ No → Case 3: Welch's t-test
        ```
    *   **Click to explore each path with real examples**

*   **Part B: Case 1 - Known Variances (Z-test)**
    *   **Example:** Alberta vs Ontario Income
        - n₁ = 100 Albertans: X̄₁ = $33,000
        - n₂ = 80 Ontarians: X̄₂ = $32,000
        - Known: σ₁ = $5,000, σ₂ = $2,000
    
    *   **Test Calculation:**
        - H₀: μ₁ = μ₂ vs H₁: μ₁ > μ₂
        - z = (X̄₁ - X̄₂)/√(σ₁²/n₁ + σ₂²/n₂)
        - z = 1000/√(250000 + 50000) = 1.82
        - p-value = 0.035

*   **Part C: Case 2 - Unknown Equal Variances (Pooled t-test)**
    *   **Example:** New vs Old Fertilizer
        | Sample | n | X̄ | S² |
        |--------|---|---|-----|
        | Control | 8 | 43.14 | 71.65 |
        | New | 8 | 47.79 | 52.66 |
    
    *   **Pooled Variance Calculation:**
        - S²p = [(n₁-1)S₁² + (n₂-1)S₂²]/(n₁+n₂-2)
        - S²p = [7(71.65) + 7(52.66)]/14 = 62.155
        - Visual: "Weighted average of variances"
    
    *   **Test Statistic:**
        - t = (X̄₁ - X̄₂)/√(S²p(1/n₁ + 1/n₂))
        - t = -4.65/√(62.155 × 0.25) = -1.18
        - df = n₁ + n₂ - 2 = 14

*   **Part D: Case 3 - Unknown Unequal Variances (Welch's t-test)**
    *   **When to Use:**
        - Variance ratio > 3:1
        - Different sample sizes
        - Default in most software
    
    *   **Modified Formula:**
        - SE = √(S₁²/n₁ + S₂²/n₂)
        - df = complex formula (Welch-Satterthwaite)
        - "More conservative, fewer df"

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Sample Size Effects Demonstration:**
    | Case | Small Sample (n=8) | Large Sample (n=100) |
    |------|-------------------|---------------------|
    | Test stat | t = -1.18 | z = -4.17 |
    | Critical | t₀.₀₅(14) = 1.761 | z₀.₀₅ = 1.645 |
    | p-value | 0.129 | 0.00003 |
    | Decision | Fail to reject | Reject H₀ |
    
    "Same effect size, different conclusions!"

*   **Variance Assumption Checker:**
    - Visual comparison of S₁² vs S₂²
    - Ratio calculator: S₁²/S₂²
    - Rule of thumb: "If ratio < 3, pooling is OK"
    - Show how results differ between methods

*   **Standard Error Comparison:**
    - Visualize how SE changes with:
      - Sample sizes (n₁, n₂)
      - Variances (S₁², S₂²)
      - Pooling assumption

---

### 4. Connect to Rigor

*   **Complete Two-Sample Test Framework:**
    ```
    Case 1 (σ known): Z = (X̄₁-X̄₂)/√(σ₁²/n₁ + σ₂²/n₂)
    
    Case 2 (σ unknown, equal):
    - Pool: S²p = [(n₁-1)S₁² + (n₂-1)S₂²]/(n₁+n₂-2)
    - Test: T = (X̄₁-X̄₂)/√(S²p(1/n₁ + 1/n₂))
    - df = n₁ + n₂ - 2
    
    Case 3 (σ unknown, unequal):
    - Test: T = (X̄₁-X̄₂)/√(S₁²/n₁ + S₂²/n₂)
    - df = [(S₁²/n₁ + S₂²/n₂)²]/[...]
    ```

*   **Decision Rules Summary:**
    | Alternative | Critical Region | p-Value |
    |-------------|----------------|---------|
    | μ₁ > μ₂ | t > tα(df) | P(T > t₀) |
    | μ₁ < μ₂ | t < -tα(df) | P(T < t₀) |
    | μ₁ ≠ μ₂ | |t| > tα/2(df) | 2P(T > |t₀|) |

*   **Practical Guidelines:**
    1. "When in doubt, use Welch's test"
    2. "Check variance assumption visually"
    3. "Large samples → Methods converge"
    4. "Report which method you used!"

---

**Reference Implementation:** This will be a new component, structured as a calculator similar to Plan 6.5, but with inputs for two groups instead of one.
