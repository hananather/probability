
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

*   **"A researcher wants to know if students who use a new digital textbook have higher final exam scores than students who use a traditional print textbook. They compare the scores of two random groups of students. How do we compare these two independent groups?"** (A universal educational-research example).

---

### 2. Interactive Exploration

*   **Concept:** An interactive calculator and visualizer for comparing two independent groups.
    *   **Setup:** The user can input the summary statistics for two groups:
        *   Group 1 (Digital Textbook): x̄₁, s₁, n₁
        *   Group 2 (Print Textbook): x̄₂, s₂, n₂
    *   **Visualization:** Two separate distributions are shown, representing the two samples. The difference in their means is highlighted.
    *   **Calculation:** The component calculates the t-statistic and p-value for the difference between the two means.
    *   **Toggle:** A crucial toggle allows the user to switch between "Assume Equal Variances" and "Do Not Assume Equal Variances" (Welch's t-test). This will subtly change the degrees of freedom and the final p-value.

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   The user sees that the core logic is similar to a one-sample t-test, but the formula for the standard error is different because it has to account for the variability from *both* samples.
*   Playing with the "Assume Equal Variances" toggle will show them that the results are often very similar, building intuition that Welch's t-test (the default in most software) is generally a safe and robust choice.

---

### 4. Connect to Rigor

*   **Formalization:** Present the formulas for the two-sample t-test.
    *   **Hypotheses:** H₀: μ₁ = μ₂ (or μ₁ - μ₂ = 0), H₁: μ₁ > μ₂.
    *   **Test Statistic:** `t = (x̄₁ - x̄₂) / SE`
    *   **Standard Error (SE):** Show the two different formulas for the standard error:
        1.  **Pooled SE (assuming equal variances):** `√((s_p² / n₁) + (s_p² / n₂))` where `s_p²` is the pooled variance.
        2.  **Unpooled SE (Welch's t-test):** `√((s₁² / n₁) + (s₂² / n₂))`
    *   **Degrees of Freedom:** Explain that the degrees of freedom calculation is straightforward for the pooled test (n₁ + n₂ - 2) but more complex for Welch's test (and is thus usually left to software).

---

**Reference Implementation:** This will be a new component, structured as a calculator similar to Plan 6.5, but with inputs for two groups instead of one.
