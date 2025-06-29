# Plan: 6.0 - Hypothesis Testing Hub

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


These are the following sections we want.

*   **6.1 Hypothesis Testing Fundamentals:** What are null and alternative hypotheses?
*   **6.2 Types of Hypotheses:** One-tailed vs. Two-tailed tests.
*   **6.3 Errors & Power:** The trade-off between Type I and Type II errors.
*   **6.4 Test for a Mean (Known Variance):** How do we test a claim about an average when we know the population's variability?
*   **6.5 Test for a Mean (Unknown Variance):** What happens when we don't know the population's variability? (Introducing the t-test).
*   **6.6 Test for a Proportion:** How do we test a claim about a percentage or a rate?
*   **6.7 Paired Two-Sample Test:** How do we compare two related groups (e.g., before and after a treatment)?
*   **6.8 Unpaired Two-Sample Test:** How do we compare two independent groups?
*   **6.9 Difference of Two Proportions:** How do we compare two percentages?

---

**Reference Implementation:** `/src/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-0-CentralTendencyHub.jsx`