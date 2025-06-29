
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

*   "In a trial, we can make two kinds of mistakes: convicting an innocent person (Type I Error) or letting a guilty person go free (Type II Error). How do we manage these risks, and how can we increase our chances of correctly identifying guilt (Power)?" (This is a strong, universal analogy).

---

### 2. Interactive Exploration

*   **Concept:** An interactive visualization of two overlapping distributions.
    *   **Setup:** Two normal distributions are shown side-by-side.
        *   The **left distribution (blue)** is labeled "Null Hypothesis (H₀ is True)".
        *   The **right distribution (red)** is labeled "Alternative Hypothesis (H₁ is True)".
    *   **Interaction:** The user can control three sliders:
        1.  **Significance Level (α):** This moves a vertical "decision line." The area under the blue curve to the right of this line is shaded and labeled "α (Type I Error Rate)".
        2.  **Effect Size:** This changes the distance between the means of the two distributions.
        3.  **Sample Size:** This makes both distributions narrower.
    *   **Display:** The area under the red curve to the left of the decision line is shaded and labeled "β (Type II Error Rate)". The area to the right is labeled "Power (1 - β)".

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   The user will discover the core relationships through play:
    *   **α vs. β Trade-off:** Moving the decision line to the left (making α smaller) automatically increases β.
    *   **Effect of Sample Size:** Increasing the sample size makes both distributions narrower, which *reduces β* without changing α. The user sees that a larger sample size makes it easier to distinguish between the two hypotheses.
    *   **Effect of Effect Size:** Increasing the effect size (moving the distributions apart) also dramatically reduces β.

---

### 4. Connect to Rigor

*   **Formalization:** Define the terms clearly, linking them to the visualization.
    *   **Type I Error (α):** The probability of rejecting H₀ when it is actually true (a "false positive").
    *   **Type II Error (β):** The probability of failing to reject H₀ when it is actually false (a "false negative").
    *   **Power (1 - β):** The probability of correctly rejecting H₀ when it is false. This is the goal of most experiments.
    *   **Conclusion:** Reinforce that the only ways to increase the power of a test are to increase the sample size, increase the effect size, or (if willing) increase the Type I error rate.

---

**Reference Implementation:** This will be a new, highly interactive component, but it will draw inspiration from the dual-visualization style of components like the `DistributionComparison.jsx`.
