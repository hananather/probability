
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

*   "A politician's approval rating was 52% last month. After a recent policy announcement, a new poll of 1000 people shows a 49% approval rating. Is this a real drop in support, or is it just random sampling noise?" (A classic, general social-science example).

---

### 2. Interactive Exploration

*   **Concept:** An interactive calculator focused on proportions.
    *   **Setup:** The component is framed around the polling scenario. It has inputs for:
        1.  **Hypothesized Proportion (p₀):** e.g., 0.52
        2.  **Number of Successes (x):** e.g., 490
        3.  **Sample Size (n):** e.g., 1000
    *   **Calculation:** The tool calculates the sample proportion (p̂ = x/n), the z-statistic, and the p-value.
    *   **Visualization:** A normal distribution is shown, representing the sampling distribution of the proportion. The calculated z-statistic and p-value are highlighted.

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   The user enters the data and gets a z-statistic of approximately -1.90 and a p-value of ~0.057 (for a two-tailed test).
*   The interface concludes: "The p-value is slightly above 0.05. We fail to reject the null hypothesis. We don't have strong enough evidence to conclude the politician's support has definitively changed."
*   The user can then change the sample size to 2000 (with 980 successes) and see the p-value drop significantly, demonstrating how more data provides more conclusive evidence.

---

### 4. Connect to Rigor

*   **Formalization:** Display the formula for the one-proportion z-test.
    *   `z = (p̂ - p₀) / √((p₀ * (1 - p₀)) / n)`
*   **Explanation:** Explain the components, especially the standard error term, which is derived from the properties of the binomial distribution.
*   **Assumptions (Conditions):** Clearly state the conditions required for the test to be valid:
    1.  **Random Sample:** The data must be from a random sample.
    2.  **Large Counts:** The sample must be large enough such that `n*p₀` and `n*(1-p₀)` are both at least 10. The interface should check this and show a warning if the condition is not met.

---

**Reference Implementation:** This will be a new component, but it will be a variation of the calculator built for the `TestForMeanKnownVariance` (Plan 6.4), adapted for proportions.
