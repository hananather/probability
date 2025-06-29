
# Plan: 6.9 - Difference of Two Proportions

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

**Guiding Philosophy:** This component extends the logic of comparing two groups to categorical data. It combines the ideas from the one-proportion test and the unpaired two-sample test.

---

### 1. Core Question

*   "A new ad campaign is launched in a specific city. We want to know if it was effective. We poll 500 people in the campaign city and find 120 are aware of our product. In a control city of similar size, we poll 500 people and find only 90 are aware. Is this a statistically significant difference?" (A strong, general marketing/social-science example).

---

### 2. Interactive Exploration

*   **Concept:** An interactive calculator for comparing two proportions.
    *   **Setup:** The user can input the data for two groups:
        *   Group 1 (Campaign City): x₁, n₁
        *   Group 2 (Control City): x₂, n₂
    *   **Calculation:** The component calculates the two sample proportions (p̂₁ and p̂₂), the pooled proportion, the z-statistic, and the p-value.
    *   **Visualization:** A normal distribution is shown, representing the sampling distribution of the difference in proportions. The z-statistic and p-value are highlighted.

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   The user enters the data and sees a significant p-value, concluding the ad campaign was effective.
*   They can then explore the effect of sample size. If they reduce the sample sizes to 100 in each city (with 24 and 18 successes, respectively), the difference in proportions is the same, but the p-value becomes non-significant. This powerfully demonstrates that the same observed effect can be statistically meaningless without a large enough sample.

---

### 4. Connect to Rigor

*   **Formalization:** Present the formula for the two-proportion z-test.
    *   **Hypotheses:** H₀: p₁ = p₂ (or p₁ - p₂ = 0), H₁: p₁ > p₂.
    *   **Test Statistic:** `z = (p̂₁ - p̂₂) / SE`
    *   **Standard Error (SE):** Explain the standard error formula, which uses a *pooled proportion* (p̂_pool) because the null hypothesis assumes the two proportions are equal.
        *   `SE = √((p̂_pool * (1 - p̂_pool)) * (1/n₁ + 1/n₂))`
    *   **Conditions:** Reiterate the Large Counts condition, which must now apply to both samples.

---

**Reference Implementation:** This will be a new component, structured as a calculator similar to Plan 6.6, but with inputs for two groups.
