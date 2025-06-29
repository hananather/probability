
# Plan: 6.7 - Paired Two-Sample Test

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

**Guiding Philosophy:** This component will introduce the idea of comparing two related samples. The key insight is to show that by analyzing the *differences* between pairs, we cleverly reduce a two-sample problem into a simple one-sample t-test, which the user has already learned.

---

### 1. Core Question

*   "A group of 10 students takes a statistics pre-test, then a 4-week training course, and finally a post-test. Did the training course significantly improve their scores? How do we analyze this 'before and after' scenario?" (A perfect, general educational example).

---

### 2. Interactive Exploration

*   **Concept:** A data transformation visualizer.
    *   **Setup:** The user sees a table with two columns: "Before Scores" and "After Scores" for 10 students.
    *   **Interaction:** The user clicks a button labeled "Analyze the Differences." The two columns animate and merge into a single new column: "Difference (After - Before)."
    *   **Visualization:** A plot of the individual differences is shown. The component then treats this single column of differences as a new dataset.
    *   **Calculation:** The component automatically calculates the mean and standard deviation of these differences and then runs a one-sample t-test on them, testing if the mean difference is greater than 0.

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   The user's "aha!" moment is seeing a seemingly complex two-sample problem visually transform into a simple one-sample problem they already know how to solve. They realize the power of the paired design is in controlling for individual variability (e.g., some students are just naturally better at stats) and focusing only on the *change*.

---

### 4. Connect to Rigor

*   **Formalization:** Explain the logic of the paired t-test.
    *   **Hypotheses:** State the hypotheses in terms of the mean difference (μ_d).
        *   H₀: μ_d = 0 (There is no change)
        *   H₁: μ_d > 0 (The course improved scores)
    *   **Formula:** Show the t-statistic formula, making it clear it's the same one-sample t-test formula, but applied to the difference data.
        *   `t = (d̄ - 0) / (s_d / √n)`
    *   **Explanation:** Emphasize that this method is only appropriate when the data points in the two samples are naturally paired (e.g., same person before/after, two measurements on the same specimen).

---

**Reference Implementation:** This will be a new component with a focus on the animation of transforming two columns into one. The calculation part will reuse the logic from the `TestForMeanUnknownVariance` component (Plan 6.5).
