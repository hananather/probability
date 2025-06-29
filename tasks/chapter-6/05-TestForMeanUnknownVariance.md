
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

*   "We want to test if the average student debt at a university is greater than $30,000. We can only survey a small sample of 20 students, and we have no idea what the overall population's financial variability is. How do we proceed when σ is unknown?" (This is a perfect, general social-science example).

---

### 2. Interactive Exploration

*   **Concept:** A comparative visualization and calculator.
    *   **Setup:** The component shows two distributions overlaid: a standard normal distribution (in grey) and a t-distribution (in blue). A slider for "Degrees of Freedom (n-1)" is present.
    *   **Interaction 1 (The Distribution):** As the user moves the degrees of freedom slider from 2 up to 30, they see the t-distribution's tails get thinner and its shape converge to the normal distribution. This builds the intuition that the t-distribution accounts for the extra uncertainty of not knowing σ, especially with small samples.
    *   **Interaction 2 (The Calculator):** Similar to the z-test component, the user can input their sample data (x̄, s, n) and the hypothesized mean (μ₀) to calculate a t-statistic and a p-value.

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   The user sees that for the same data, a t-test will produce a larger p-value than a z-test, especially for small `n`. They realize the t-test is more conservative because it has "fatter tails" to account for the uncertainty in `s` as an estimate of `σ`.
*   The visual convergence of the t-distribution to the normal distribution as `n` increases makes it clear why the z-test is a reasonable approximation for large samples.

---

### 4. Connect to Rigor

*   **Formalization:** Display the formula for the one-sample t-test statistic.
    *   `t = (x̄ - μ₀) / (s / √n)`
*   **Explanation:** Explicitly state the difference: we use the *sample* standard deviation (`s`) as an estimate for the *population* standard deviation (`σ`).
*   **Degrees of Freedom:** Explain that the shape of the t-distribution depends on the sample size through the degrees of freedom (df = n - 1).
*   **Assumptions:** State the key assumption for the t-test: the underlying population is approximately normally distributed.

---

**Reference Implementation:** `/src/components/04-descriptive-statistics-sampling/4-4-1-TDistributionExplorer.jsx` (This existing component can be enhanced and repurposed to fit this plan).
