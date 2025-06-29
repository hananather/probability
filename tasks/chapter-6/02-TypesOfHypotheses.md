
# Plan: 6.2 - Types of Hypotheses

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

**Guiding Philosophy:** This component will clarify the crucial difference between one-tailed and two-tailed tests. The focus is on showing how the research question dictates the type of test, which in turn affects the p-value.

---

### 1. Core Question

*   "Does our research question suspect a change in a *specific direction*, or just *any change* at all? And how does that affect our evidence?"

---

### 2. Interactive Exploration

*   **Concept:** A unified visualization of a normal distribution.
    *   **Setup:** A normal distribution is displayed. A slider allows the user to set the "Observed Test Statistic" (z-score).
    *   **Interaction:** The user can toggle between three modes:
        1.  **Right-Tailed (H₁: μ > μ₀):** Shades the area to the right of the test statistic.
        2.  **Left-Tailed (H₁: μ < μ₀):** Shades the area to the left of the test statistic.
        3.  **Two-Tailed (H₁: μ ≠ μ₀):** Shades the area in *both* tails, equidistant from the mean.
    *   **Display:** A large, clear display shows the calculated p-value for each mode.

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   The user sets the observed z-score to 1.8.
    *   In **Right-Tailed** mode, they see a p-value of ~0.036.
    *   They switch to **Two-Tailed** mode and see the p-value instantly double to ~0.072.
*   The insight is immediate: **A two-tailed test is more conservative.** For the exact same data, it is "harder" to get a significant result because we are splitting our alpha between two possibilities.

---

### 4. Connect to Rigor

*   **Formalization:** Connect the visual to the formal language.
    *   **Right-Tailed Test:** Used when the research question is about an *increase* (e.g., "Does this fertilizer *increase* crop yield?").
    *   **Left-Tailed Test:** Used when the research question is about a *decrease* (e.g., "Does this drug *reduce* blood pressure?").
    *   **Two-Tailed Test:** Used when the research question is about *any difference* (e.g., "Does this new packaging *change* the product's weight?").
    *   Explain that the choice must be made *before* seeing the data to maintain scientific integrity.

---

**Reference Implementation:** `/src/components/shared/CLTSimulation.jsx` (for the interactive distribution visualization)
