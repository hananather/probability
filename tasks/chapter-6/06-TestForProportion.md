
# Plan: 6.6 - Test for a Proportion

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

**Guiding Philosophy:** This component will show how the logic of hypothesis testing extends to categorical data (yes/no, success/failure). It will build on the z-test framework but adapt it for proportions.

---

### 1. Core Question

*   "100 adult American Catholics were asked: 'Do you favor allowing women to be priests?' 60 answered 'Yes'. Is this strong evidence that more than half favor this change?"

---

### 2. Interactive Exploration

*   **Part A: The Binomial Foundation**
    *   **Setup:** 
        - Let X = number who favor (X = 60)
        - X ~ B(100, p) where p = true proportion
        - H₀: p = 0.5 vs H₁: p > 0.5
    
    *   **Exact Binomial vs Normal Approximation:**
        - Show histogram of B(100, 0.5)
        - Overlay normal curve N(50, 25)
        - Highlight X = 60 on both
        - Display: "Exact: P(X ≥ 60) = 0.0284"

*   **Part B: The Continuity Correction**
    *   **Visual Demonstration:**
        - Zoom on bars 59, 60, 61
        - Animate: "Discrete X = 60 → Continuous interval [59.5, 60.5]"
        - Show why P(X ≥ 60) ≈ P(Z ≥ 59.5)
    
    *   **Calculation Comparison:**
        | Method | Calculation | p-value |
        |--------|------------|---------|
        | Without correction | P(Z ≥ 60-50)/5 = P(Z ≥ 2.0) | 0.0228 |
        | With correction | P(Z ≥ 59.5-50)/5 = P(Z ≥ 1.9) | 0.0287 |
        | Exact binomial | P(X ≥ 60 \| p = 0.5) | 0.0284 |

*   **Part C: Large Counts Condition Checker**
    *   **Interactive Validator:**
        - Input: n, p₀
        - Check: np₀ ≥ 10 and n(1-p₀) ≥ 10
        - Visual indicator:
          - Green: "✓ Conditions met"
          - Yellow: "⚠ Borderline (5-10)"
          - Red: "✗ Use exact binomial test"
    
    *   **Examples Grid:**
        | n | p₀ | np₀ | n(1-p₀) | Status |
        |---|----|----|---------|--------|
        | 100 | 0.5 | 50 | 50 | ✓ Good |
        | 20 | 0.5 | 10 | 10 | ✓ Minimum |
        | 30 | 0.1 | 3 | 27 | ✗ Fail |

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Key Discoveries:**
    1. "Continuity correction improves accuracy: 0.0287 vs 0.0284"
    2. "Without large counts, normal approximation fails badly"
    3. "Same proportion (60%) can be significant or not depending on n"

*   **Sample Size Explorer:**
    - Fix p̂ = 0.6, vary n
    - n = 25: X = 15, p-value = 0.212 (not significant)
    - n = 100: X = 60, p-value = 0.029 (significant)
    - n = 400: X = 240, p-value < 0.001 (highly significant)
    - "More data → Stronger conclusions"

---

### 4. Connect to Rigor

*   **Complete Framework for Proportion Tests:**
    ```
    1. Check conditions:
       - Random sample
       - np₀ ≥ 10 and n(1-p₀) ≥ 10
    
    2. State hypotheses:
       H₀: p = p₀
    
    3. Calculate test statistic:
       z = (p̂ - p₀) / √(p₀(1-p₀)/n)
    
    4. Apply continuity correction (if using normal):
       - For H₁: p > p₀, use (X - 0.5)
       - For H₁: p < p₀, use (X + 0.5)
       - For H₁: p ≠ p₀, use (|X - np₀| - 0.5)
    
    5. Find p-value and decide
    ```

*   **Standard Error Insight:**
    - SE(p̂) = √(p(1-p)/n)
    - Under H₀, use p₀: SE = √(p₀(1-p₀)/n)
    - "Maximum SE when p = 0.5"
    - Interactive plot: SE vs p for different n

*   **Connection to Confidence Intervals:**
    - Test at α ⟺ p₀ outside (1-α)% CI
    - But CI uses p̂ for SE, test uses p₀
    - "Slight difference in formulas!"

---

**Reference Implementation:** This will be a new component, but it will be a variation of the calculator built for the `TestForMeanKnownVariance` (Plan 6.4), adapted for proportions.
