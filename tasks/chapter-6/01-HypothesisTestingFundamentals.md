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

*   "Person A claims they have a fair coin, but Person B is suspicious that it's biased against heads. How can we use data to evaluate this claim scientifically?"

---

### 2. Interactive Exploration

*   **Part A: Building Intuition with Small Samples**
    *   **Setup:** Interactive coin flipper with binomial distribution B(10, 0.5) shown below
    *   **Interaction:** User clicks to flip coin 10 times, observes X = number of heads
    *   **Display:** Shows probability P(X = k) for each outcome, with observed value highlighted
    *   **Key Insight:** "With X = 4 heads, P(X = 4) = 0.205. This outcome is still quite likely for a fair coin!"

*   **Part B: The Power of Larger Samples**
    *   **Setup:** Same coin, but now flip 100 times with distribution B(100, 0.5)
    *   **Interaction:** User runs simulation, observes 40 heads out of 100 flips
    *   **Visualization:** Normal approximation overlay showing how unlikely this is
    *   **Key Insight:** "With 40/100 heads, this falls in the tail of the distribution. Much more suspicious!"

*   **Part C: Understanding the p-value**
    *   **Interactive Element:** Slider to explore different observed values
    *   **Visualization:** As slider moves, show:
        - The observed value as a vertical line
        - Shaded area to the left (for H₁: p < 0.5)
        - Dynamic p-value display
    *   **Key Teaching:** "The p-value is the area in the tail - the probability of seeing evidence this extreme or more extreme, assuming H₀ is true"

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Critical Realization:** Show side-by-side comparison:
    - 4/10 heads: p-value = P(X ≤ 4) = 0.377 → "Not suspicious"
    - 40/100 heads: p-value = P(X ≤ 40) = 0.028 → "Very suspicious!"
*   **Key Message:** "Same proportion (40%), but vastly different evidence strength. Sample size matters!"
*   **The Asymmetry:** "Important: Not rejecting H₀ doesn't mean we accept it. We could also fail to reject p = 0.3 or p = 0.4 with this data!"

---

### 4. Connect to Rigor

*   **Formalization:** Introduce the formal framework:
    *   **Null Hypothesis (H₀):** The claim - coin is fair (p = 0.5)
    *   **Alternative Hypothesis (H₁):** The suspicion - coin favors tails (p < 0.5)
    *   **Test Statistic:** X = number of heads in n flips
    *   **p-value:** P(X ≤ x_observed | H₀ is true)
    
*   **Decision Framework:**
    *   If p-value ≤ α (typically 0.05): "Reject H₀ - evidence is too unlikely under the claim"
    *   If p-value > α: "Fail to reject H₀ - not enough evidence against the claim"
    
*   **Critical Concepts:**
    *   "Smaller p-value ⟺ stronger evidence against H₀"
    *   "We never 'prove' H₀ true, we only fail to find evidence against it"
    *   "The significance level α is chosen before seeing the data"

---

**Reference Implementation:** `/src/components/01-introduction-to-probabilities/1-7-monty-hall/`