# Plan: 6.1 - Hypothesis Testing Fundamentals

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

**Guiding Philosophy:** This component will introduce the fundamental concepts of the null and alternative hypotheses, and the p-value, as covered in Section 6.1 of the course notes. It will use a simple, intuitive example to build a strong mental model before introducing formal notation.

---

### 1. Core Question

*   "A pharmaceutical company claims their new drug has no effect on reaction time. We suspect it actually slows reaction time. How can we use data to challenge their claim?"

---

### 2. Interactive Exploration

*   **Concept:** A simple simulation.
    *   **Setup:** A graph shows a normal distribution centered at 0, representing "No Effect" (the null hypothesis, H₀). The user is told the average reaction time change for the placebo group is 0ms.
    *   **Interaction:** A slider labeled "Observed Mean Reaction Time" allows the user to move a vertical line on the graph. As they move the line away from 0, the area under the curve to the right of the line is shaded, and a large display shows the corresponding p-value.
    *   **Data Story:** The user is told their sample of patients who took the drug had an average reaction time of +12ms. They slide the line to +12.

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   The user will see that at +12ms, the shaded area (the p-value) is very small (e.g., 0.03). The interface will state: "If the drug truly had no effect, the chance of seeing an average slowdown of +12ms or more is only 3%. Is that rare enough to be suspicious?"

---

### 4. Connect to Rigor

*   **Formalization:** Now, introduce the formal terms from Section 6.1.
    *   **Null Hypothesis (H₀):** The company's claim. The drug has no effect (μ = 0).
    *   **Alternative Hypothesis (H₁ or Hₐ):** Our suspicion. The drug slows reaction time (μ > 0).
    *   **p-value:** The probability of observing our data (or more extreme data) if the null hypothesis is true.
    *   **Significance Level (α):** Introduce the concept of a pre-determined cutoff (e.g., α = 0.05) for making a decision. Since our p-value (0.03) is less than α, we "reject the null hypothesis."

---

**Reference Implementation:** `/src/components/01-introduction-to-probabilities/1-7-monty-hall/`