
# Plan: 6.4 - Test for a Mean (Known Variance)

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

**Guiding Philosophy:** This component serves as the first practical application of the principles learned so far. It introduces the z-test and provides a clear, step-by-step process for conducting a hypothesis test.

---

### 1. Core Question

*   **"A coffee shop claims its bags of coffee weigh 340g on average. We know from the supplier that the standard deviation of the filling process is 5g. We take a sample of 30 bags and find their mean weight is 342g. Is this enough evidence to say the shop is giving customers more coffee than advertised?"** (This is a general quality control/consumer science example).

---

### 2. Interactive Exploration

*   **Concept:** An interactive calculator and visualizer.
    *   **Setup:** The component is laid out as a clear, 4-step process.
        1.  **State Hypotheses:** H₀: μ = 340, H₁: μ > 340.
        2.  **Input Parameters:** The user can input the hypothesized mean (μ₀), the population standard deviation (σ), the sample mean (x̄), and the sample size (n).
        3.  **Calculate:** A "Calculate" button computes the z-statistic and the p-value.
        4.  **Visualize:** The result is displayed on a normal distribution curve, showing the z-statistic and the shaded p-value area.

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   The user inputs the data from the core question and sees a z-statistic of ~2.19 and a p-value of ~0.014.
*   The interface clearly states: "The p-value (0.014) is less than our chosen α (0.05). We reject the null hypothesis."
*   **The key insight:** The user can then play with the sliders. They can see how increasing the sample size or the sample mean would make the evidence even stronger (smaller p-value), while decreasing them would weaken the evidence.

---

### 4. Connect to Rigor

*   **Formalization:** Display the formula for the z-test statistic clearly.
    *   `z = (x̄ - μ₀) / (σ / √n)`
*   **Explanation:** Explain each part of the formula.
    *   `(x̄ - μ₀)`: The difference between what we observed and what was claimed.
    *   `(σ / √n)`: The standard error - a measure of the expected variability of the sample mean.
*   **Conclusion:** Summarize the full hypothesis testing procedure for a z-test.

---

**Reference Implementation:** This will be a new component, but it will use the visualization style of `CLTSimulation.jsx` and the clear, step-by-step layout of a well-designed calculator.
